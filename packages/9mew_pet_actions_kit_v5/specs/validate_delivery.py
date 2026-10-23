#!/usr/bin/env python3
"""Validate v5 action files and bind separately executed encoding/browser evidence.

Runs the local catalog/frame checker. It does not run a browser, grant visual or
production approval, or replace the original identity. Missing evidence is pending.
"""
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone
import argparse
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL_SHA = '2e20839bcda5c5208de4a30654e6e09dcb541076e35c9ef00421c09857319b6a'
TIERS = ['喵学徒', '喵大师', '喵真人', '喵仙帝']
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--prompt-copy', type=Path)
args = parser.parse_args()
checks, errors, pending, files_checked = {}, [], [], {}
report = {'schemaVersion': 2, 'revision': 'v5', 'checkedAt': datetime.now(timezone.utc).isoformat(),
          'status': '2D_ACTION_DELIVERY_CHECKS_PENDING', 'scope': 'Current package integrity, actual catalog frame decoding, and hash binding of separately executed v5 encoding/runtime evidence.',
          '3DNotRequired': True, 'threeDStatus': 'deferred_optional_future_upgrade', 'productionApproval': False,
          'checks': checks, 'counts': {}, 'errors': errors, 'pendingEvidence': pending}


class PendingEvidence(Exception):
    pass


def read(relative):
    return json.loads((ROOT / relative).read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def require(condition, description):
    if not condition: raise AssertionError(description)


def safe_file(relative):
    require(isinstance(relative, str) and relative and not re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', relative), 'Expected a local relative file path')
    path = Path(relative)
    require(not path.is_absolute() and '..' not in path.parts and '\\' not in relative, f'Unsafe path: {relative}')
    target = (ROOT / path).resolve()
    require(target.is_relative_to(ROOT) and target.is_file(), f'Missing or escaped file: {relative}')
    return target


def verify_file(record, prefix=''):
    name = record.get('src', record.get('path'))
    require(isinstance(name, str), 'File record has no path')
    relative = prefix + name
    target = safe_file(relative)
    if relative not in files_checked:
        files_checked[relative] = {'path': relative, 'bytes': target.stat().st_size, 'sha256': sha(target)}
    actual = files_checked[relative]
    require(actual['bytes'] > 0, f'Empty file: {relative}')
    if 'bytes' in record: require(record['bytes'] == actual['bytes'], f'Byte mismatch: {relative}')
    if 'sha256' in record: require(record['sha256'] == actual['sha256'], f'Hash mismatch: {relative}')
    return actual


def visit(value):
    if isinstance(value, dict):
        if 'src' in value: verify_file(value)
        for item in value.values(): visit(item)
    elif isinstance(value, list):
        for item in value: visit(item)


def phase(name, fn):
    try:
        fn()
        checks[name] = True
    except PendingEvidence as exc:
        checks[name] = None
        pending.append({'check': name, 'reason': str(exc)})
    except Exception as exc:
        checks[name] = False
        errors.append({'check': name, 'error': str(exc)})


def package_scope():
    def included(path): return not any(part in {'.git', 'node_modules', '__pycache__'} for part in path.relative_to(ROOT).parts)
    geometry = [p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and included(p) and (p.suffix.lower() in {'.glb', '.gltf', '.blend', '.blend1'} or p.name.startswith('model-viewer'))]
    require(not geometry, f'Current package contains old geometry/runtime: {geometry}')
    require(not (ROOT / '3d').exists() and not (ROOT / 'website-pet').exists(), 'Old 3D directories remain')
    package, lock = read('integration/package.json'), read('integration/package-lock.json')
    require('three' not in package.get('dependencies', {}) and '@types/three' not in package.get('dependencies', {}), 'Three dependency remains')
    require(not any(k == 'node_modules/three' or k.startswith('node_modules/@types/three') for k in lock['packages']), 'Three lockfile entry remains')
    forbidden = re.compile(r'model-viewer|GLTFLoader|mountModel|["\'](?:[^"\']*/)?[^"\']*\.glb["\']|["\']three["\']|WebGLRenderingContext')
    for path in (ROOT / 'integration').rglob('*'):
        if path.is_file() and included(path) and path.suffix in {'.ts', '.tsx', '.js', '.mjs', '.html'}:
            require(not forbidden.search(path.read_text(encoding='utf-8')), f'Legacy rendering code remains: {path.name}')
    policy = read('specs/visual_policy.json')
    require(policy['policyVersion'] == '2d-quality-first.2' and policy['websiteAppearanceVersion'] == '0.4.0', 'Wrong current visual policy')
    require(policy['currentMedium'] == '2d' and policy['future3D']['state'] == 'deferred', 'Current visual policy is not 2D')
    require(policy['future3D']['blocksCurrentDelivery'] is False and policy['future3D']['automaticRetry'] is False, '3D incorrectly blocks/restarts work')
    require(policy['staticFallbackCompletesRequestedActions'] is False, 'Static fallback incorrectly completes required actions')
    require(sha(ROOT / 'illustrations/mewling_master.png') == ORIGINAL_SHA, 'Selected original changed')
    report['currentGeometryFileCount'] = 0


def registry():
    manifest, catalog = read('assets_manifest.json'), read('pet-actions/catalog.json')
    assets, actions = manifest['assets'], catalog['actions']
    require(len({asset['id'] for asset in assets}) == len(assets), 'Duplicate asset IDs')
    require(manifest['assetVersion'] == '0.4.0', 'Wrong current manifest version')
    for asset in assets:
        require(asset['kind'] != 'model3d', 'Current registry has a model entry')
        require(all('model' not in variant for variant in asset.get('variants', {}).values()), 'Registry has a model variant')
        if asset['status'] == 'planned': require(not asset.get('variants'), f'Planned asset has media: {asset["id"]}')
        for key in ('sourceFile', 'editableSource'):
            if asset.get(key):
                if isinstance(asset[key], dict): visit(asset[key])
                else: safe_file(asset[key])
    visit(manifest)
    for relative in manifest['entryPoints'].values(): safe_file(relative)
    canonical = [asset for asset in assets if asset['kind'] == 'character-animation-2d']
    aliases = [asset for asset in assets if asset['kind'] == 'action-alias']
    require({asset['runtimeActionId'] for asset in canonical} == {action['id'] for action in actions}, 'Manifest/catalog action set differs')
    for asset in canonical + aliases:
        require(asset['status'] == 'prototype' and asset['approvalState'] == 'candidate' and asset['appearanceVersion'] == '0.4.0', 'A new action was promoted without approval')
    by_id = {asset['id']: asset for asset in assets}
    for asset in aliases:
        require(asset['aliasOf'] in by_id and by_id[asset['aliasOf']]['kind'] == 'character-animation-2d', 'Invalid semantic alias')
    counts = Counter(asset['status'] for asset in assets)
    semantic = sum(bool(asset.get('plannedSemanticAsset')) for asset in assets)
    independent = sum(not action.get('sourceActionId') for action in actions)
    mirrors = sum(bool(action.get('sourceActionId') and action.get('mirror')) for action in actions)
    summary = manifest['summary']
    require(semantic == summary['plannedSemanticCategories'] == 64, 'Original semantic plan count changed')
    require(len(assets) == summary['registryEntries'], 'Registry count mismatch')
    require(counts['prototype'] == summary['prototypeEntries'] and counts['planned'] == summary['plannedEntries'], 'Status count mismatch')
    require(summary['playableCharacterActionEntries'] == len(actions) and summary['independentCharacterActionSequences'] == independent, 'Character action count mismatch')
    require(summary['mirroredActionDerivatives'] == mirrors and summary['semanticActionReuseBindings'] == len(aliases), 'Derivative/reuse count mismatch')
    require(summary['actual3DModels'] == 0 and summary['newCharacterLimbAnimations'] == independent, 'Unsupported source count')
    require(manifest['selectedReference']['sha256'] == ORIGINAL_SHA, 'Registry identity mismatch')
    report['manifestSha256'] = sha(ROOT / 'assets_manifest.json')
    report['counts'] = summary


def action_files():
    checker = ROOT / 'skills/9mew-visual-forge/scripts/validate_action_catalog.py'
    output = ROOT / 'docs/asset-status-action-checks.json'
    run = subprocess.run([sys.executable, str(checker), '--catalog', str(ROOT / 'pet-actions/catalog.json'), '--root', str(ROOT), '--out', str(output)], capture_output=True, text=True)
    require(run.returncode == 0, 'Action catalog checks failed: ' + (run.stderr or run.stdout).strip())
    evidence = json.loads(output.read_text(encoding='utf-8'))
    require(evidence['status'] == 'TECHNICAL_CHECKS_PASSED', 'Action catalog frame checks incomplete')
    require(evidence['catalog_sha256'] == sha(ROOT / 'pet-actions/catalog.json'), 'Action checks target a different catalog')
    require(evidence['approval_verified'] is False and evidence['visual_semantics_verified'] is False, 'File checker claims approval')
    report['actionFileEvidence'] = {'src': 'docs/asset-status-action-checks.json', 'sha256': sha(output), 'status': evidence['status'], 'executedInThisValidator': True, 'scope': evidence['scope']}


def runtime():
    appearance = read('integration/website-pet-appearance-catalog.json')
    current = next(item for item in appearance['appearances'] if item['appearanceVersion'] == '0.4.0')
    revoked = next(item for item in appearance['appearances'] if item['appearanceVersion'] == '0.2.0')
    require(revoked['approval'] == 'revoked' and not revoked['variants'], 'Rejected appearance could be selected')
    require(current['approval'] == 'prototype' and current['variants']['sakura-cream']['renderer'] == 'character-frames', 'Current action appearance mismatch')
    for relative in appearance['allowedPublicPaths']: safe_file(relative)
    path = ROOT / 'integration/actions-runtime-validation.json'
    if not path.is_file(): raise PendingEvidence('Current v5 browser evidence has not been produced. Old planar evidence cannot satisfy this gate.')
    evidence, catalog = read('integration/actions-runtime-validation.json'), read('pet-actions/catalog.json')
    require(evidence['revision'] == 'v5' and evidence['status'] == 'ACTIONS_RUNTIME_CHECKS_PASSED', 'Current action browser run did not pass')
    require(evidence['catalogSHA256'] == sha(ROOT / 'pet-actions/catalog.json'), 'Runtime evidence is stale for the current catalog')
    require(evidence.get('checks') and all(item.get('result') == 'PASS' for item in evidence['checks']), 'Runtime check failures remain')
    observed = next(item for item in evidence['checks'] if item['name'] == 'actual distinct frame changes for every action')
    require({item['id'] for item in observed['actions']} == {item['id'] for item in catalog['actions']}, 'Not every actual action was observed in the browser')
    require(evidence.get('sources'), 'Browser report lacks source hashes')
    for name, digest in evidence['sources'].items(): verify_file({'src': name, 'sha256': digest}, 'integration/')
    report['runtimeEvidence'] = {'src': 'integration/actions-runtime-validation.json', 'sha256': sha(path), 'status': evidence['status'], 'reusedExecutedCurrentBrowserEvidence': True, 'limits': evidence.get('limits', [])}


def encoded_actions():
    path = ROOT / 'pet-actions/encoding-validation.json'
    if not path.is_file(): raise PendingEvidence('Actual v5 encoding evidence is missing.')
    data, catalog = read('pet-actions/encoding-validation.json'), read('pet-actions/catalog.json')
    require(data['status'] == 'ENCODING_AND_GEOMETRY_PASSED', 'Current encoding/geometry check did not pass')
    require(data['catalogSha256'] == sha(ROOT / 'pet-actions/catalog.json'), 'Encoding evidence is stale for the current catalog')
    require(data['artApproval'] is False, 'Encoding report must not grant visual approval')
    actual = {action['id']: action for action in catalog['actions']}
    require({action['id'] for action in data['actions']} == set(actual), 'Encoding evidence does not cover every catalog action')
    independent = sum(not action.get('sourceActionId') for action in actual.values())
    mirrors = sum(bool(action.get('sourceActionId') and action.get('mirror')) for action in actual.values())
    require(data['sourceActionCount'] == independent and data['derivedActionCount'] == mirrors, 'Encoding source/derivative count mismatch')
    sprite_checks = read('docs/asset-status-action-checks.json')
    decoded_frames = {frame['src']: frame for action in sprite_checks['actions'] for frame in action.get('frames', [])}
    decode_pending = []
    encoding_count = 0
    for action in data['actions']:
        aid = action['id']
        contract = actual[aid]
        if not contract.get('sourceActionId'):
            require(action['source'] == contract['sourceSheet'], f'{aid}: wrong source sheet')
            verify_file({'src': action['source'], 'sha256': action['sourceSha256']}, 'pet-actions/')
            require(action['sourceFrameCount'] == len(action['frames']) and action['distinctSourcePoses'] >= 2, f'{aid}: missing distinct source poses')
            excluded = set(contract.get('excludedSourceFrames', {}).get('indices', []))
            selected = contract.get('selectedSourceFrameIndices')
            if selected is not None:
                require(selected == action.get('selectedSourceFrameIndices'), f'{aid}: selected source-frame mapping differs')
                require(not excluded.intersection(selected), f'{aid}: an explicitly excluded pose entered playback')
            for frame in action['frames']:
                facts = decoded_frames.get(frame['file'])
                if facts is None:
                    require(frame['index'] in excluded, f'{aid}: an unlisted source frame is absent from playback without an exclusion record')
                    require(frame.get('fileSha256'), f'{aid}: excluded source frame requires its file hash')
                    verify_file({'src': frame['file'], 'sha256': frame['fileSha256']}, 'pet-actions/')
                    continue
                if frame.get('fileSha256'):
                    require(facts['sha256'] == frame['fileSha256'], f'{aid}: source frame bytes changed after encoding')
                else:
                    require(facts.get('decoded_sha256') == frame['pixelSha256'], f'{aid}: decoded frame differs from recorded source pixels; record exported fileSha256 if the codec normalizes transparent pixels')
        else:
            require(action.get('mirror') is True and action['sourceActionId'] == contract['sourceActionId'], f'{aid}: mirror provenance mismatch')
        for name in ('webp', 'gifLight', 'gifDark'):
            item = action['encodings'][name]
            require(item['path'] == contract['exports'][name], f'{aid}: export path mismatch')
            verify_file(item, 'pet-actions/')
            require(item['pages'] >= 2 and item['width'] > 0 and item['height'] > 0 and item['durationMs'] > 0, f'{aid}: not an actual multi-frame encoding')
            expected_cycle_ms = sum(frame['durationMs'] for frame in contract['frames']) / contract.get('sequenceCycles', 1)
            require(abs(item['durationMs'] - expected_cycle_ms) <= 20, f'{aid}: encoded cycle duration differs from declared timeline')
            if item.get('decodeStatus') != 'all_frames_decoded' or 'uniqueDecodedFrames' not in item:
                decode_pending.append(aid + ':' + name)
            else:
                require(2 <= item['uniqueDecodedFrames'] <= item['pages'], f'{aid}: encoded frames lack actual pixel variation')
            encoding_count += 1
    report['encodingEvidence'] = {'src': 'pet-actions/encoding-validation.json', 'sha256': sha(path), 'status': data['status'], 'encodedFilesBound': encoding_count, 'reusedExecutedCurrentEncodingEvidence': True, 'notValidated': data.get('notValidated', [])}
    if decode_pending: raise PendingEvidence('Complete frame-decode evidence pending for: ' + ', '.join(decode_pending))


def legacy_motion():
    data = read('motion-2d/delivery.json')
    require(data['mediaKind'] == 'motion-poster' and data['assetId'] == '9mew.motion-poster.naimiao-starlight', 'Legacy sample misclassified')
    visit(data)
    asset = next(item for item in read('assets_manifest.json')['assets'] if item['id'] == data['assetId'])
    require(asset['kind'] == 'motion-poster', 'Decorative sample counted as character action')
    report['historicalEvidence'] = {'planarEncoding': {'src': 'motion-2d/delivery.json', 'sha256': sha(ROOT / 'motion-2d/delivery.json')}, 'planarBrowser': 'integration/planar-validation.json', 'usedToPassCurrentCharacterActions': False, 'qualification': 'Historical decorative composition only; previous browser source hashes are not proof for modified v5 runtime.'}


def prompt_and_skill():
    path = ROOT / '9mew_task_prompt_v5.txt'
    text = path.read_text(encoding='utf-8')
    require(text.startswith('9mew-universe 迭代任务提示词｜完整修订 v5'), 'Wrong canonical prompt header')
    require(all(tier in text for tier in TIERS), 'Model tier names missing')
    notes = read('prompt/REVISION_NOTES.json')
    require(notes['currentPromptSha256'] == sha(path) and notes['revision'] == 'v5', 'Prompt revision hash mismatch')
    require(notes['websiteAppearance']['appearanceVersion'] == '0.4.0', 'Prompt appearance version mismatch')
    require(notes['threeDPolicy']['status'] == 'deferred' and notes['threeDPolicy']['currentDeliveryRequirement'] is False, 'Prompt requires current 3D')
    if args.prompt_copy:
        require(args.prompt_copy.is_absolute() and args.prompt_copy.is_file(), 'External prompt copy must be an existing absolute path')
        require(args.prompt_copy.read_bytes() == path.read_bytes(), 'Canonical prompt and external copy differ')
    report['prompt'] = {'src': '9mew_task_prompt_v5.txt', 'sha256': sha(path), 'revision': 'v5', 'externalCopyCompared': bool(args.prompt_copy)}
    identity = read('skills/9mew-visual-forge/assets/identity.json')
    policy = identity['visual_policy']
    require(policy['version'] == '2d-quality-first.2' and policy['fallback_is_scope_completion'] is False, 'Skill does not require actual actions')
    require(policy['three_d_in_current_completion_definition'] is False, 'Skill requires current 3D')
    require(identity['model_tier_display_names'] == TIERS, 'Skill tier names changed')
    require(sha(ROOT / 'skills/9mew-visual-forge/assets/naimiao-master.png') == ORIGINAL_SHA, 'Skill identity changed')
    require([tier['nameZh'] for tier in read('specs/brand_decisions.json')['modelTiers']] == TIERS, 'Brand tier names changed')


for name, function in [('current_2d_scope_and_reference', package_scope), ('registry_and_referenced_files', registry), ('actual_action_catalog_frames', action_files), ('current_runtime_and_bound_browser_evidence', runtime), ('current_encoded_action_evidence', encoded_actions), ('legacy_decorative_sample_classification', legacy_motion), ('prompt_skill_and_future_upgrade_policy', prompt_and_skill)]:
    phase(name, function)
report['referencedFileCount'] = len(files_checked)
report['referencedFiles'] = sorted(files_checked.values(), key=lambda item: item['path'])
report['notExecuted'] = ['new browser run inside this validator', 'production deployment', 'real AI conversation, speech or growth backend', 'production appearance activation', 'complete original semantic plan or all-breed asset delivery', 'target-device hardware performance acceptance']
report['limitations'] = ['Current browser/encoding evidence is reused only when catalog and recorded file hashes match.', 'Technical integrity and decoded pixel changes do not prove feline anatomy, identity, beauty or action semantics.', 'These are keyed 2D sequences; file fps or repeated timeline entries do not imply equally many independently drawn frames.', 'Static fallback preserves page usability and does not complete a missing requested action.', '3D remains an optional future upgrade outside this delivery.']
report['passed'] = not errors and not pending
report['status'] = '2D_ACTION_DELIVERY_CHECKS_FAILED' if errors else ('2D_ACTION_DELIVERY_EVIDENCE_PENDING' if pending else '2D_ACTION_DELIVERY_CHECKS_PASSED')
(ROOT / 'delivery_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({key: report[key] for key in ('status', 'passed', '3DNotRequired', 'checks', 'errors', 'pendingEvidence', 'referencedFileCount')}, ensure_ascii=False, indent=2))
sys.exit(1 if errors else (2 if pending else 0))
