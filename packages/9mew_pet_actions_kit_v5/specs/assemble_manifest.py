#!/usr/bin/env python3
"""Assemble v5 from actual files/catalog; never invent planned action media."""
from pathlib import Path
from collections import Counter
import copy
import csv
import hashlib
import json
import mimetypes
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ACTION_ROOT = ROOT / 'pet-actions'
CATALOG = ACTION_ROOT / 'catalog.json'
FILE_CACHE = {}


def read(relative):
    return json.loads((ROOT / relative).read_text(encoding='utf-8'))


def save(relative, value):
    (ROOT / relative).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def local_file(base, value):
    if not isinstance(value, str) or not value or '\\' in value or '://' in value or Path(value).is_absolute():
        raise ValueError(f'Expected a local relative path: {value}')
    path = (base / value).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        raise ValueError(f'Missing or escaped file: {value}')
    return path


def media(path):
    path = path.resolve()
    if path not in FILE_CACHE:
        raw = path.read_bytes()
        record = {'src': path.relative_to(ROOT).as_posix(), 'mime': mimetypes.guess_type(path.name)[0] or 'application/octet-stream', 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}
        if path.suffix.lower() in {'.png', '.webp', '.gif', '.jpg', '.jpeg'}:
            with Image.open(path) as image:
                record.update(width=image.width, height=image.height)
                count = getattr(image, 'n_frames', 1)
                if count > 1:
                    record.update(frameCount=count, loop=image.info.get('loop') == 0)
                    record['frameCountEvidence'] = 'container metadata; complete decode is recorded separately'
                rgba = image.convert('RGBA')
                record['hasTransparency'] = rgba.getchannel('A').getextrema()[0] < 255
        FILE_CACHE[path] = record
    return copy.deepcopy(FILE_CACHE[path])


def exported_paths(asset):
    found = set()
    def visit(value):
        if isinstance(value, dict):
            if isinstance(value.get('src'), str): found.add(value['src'])
            for item in value.values(): visit(item)
        elif isinstance(value, list):
            for item in value: visit(item)
    for key in ('variants', 'sourceFile', 'runtimeCatalog'): visit(asset.get(key))
    return sorted(found)


def main():
    if not CATALOG.is_file():
        raise ValueError('Actual pet-actions/catalog.json is required; source sheets alone are not an action delivery.')
    catalog = read('pet-actions/catalog.json')
    if catalog.get('schemaVersion') != '1.0' or catalog.get('appearanceVersion') != '0.4.0' or not catalog.get('actions'):
        raise ValueError('Expected a nonempty current v5 action catalog, schema 1.0 / appearance 0.4.0.')
    manifest = read('specs/registry_base_2d.json')
    actions = catalog['actions']
    action_map = {action['id']: action for action in actions}
    if len(action_map) != len(actions): raise ValueError('Duplicate runtime action IDs')
    assets = manifest['assets']
    by_id = {asset['id']: asset for asset in assets}
    frame_base = (CATALOG.parent / catalog.get('basePath', './')).resolve()
    if not frame_base.is_relative_to(ROOT): raise ValueError('Action basePath escapes the package')
    original_poster = media(local_file(CATALOG.parent, catalog['poster']))
    catalog_record = media(CATALOG)
    canonical_actions = []
    for action in actions:
        action_id = action['id']
        asset_id = '9mew.motion.' + action_id
        source_id = action.get('sourceActionId')
        if source_id and source_id not in action_map: raise ValueError(f'{action_id}: missing source action')
        if action.get('mirror') and not source_id: raise ValueError(f'{action_id}: mirror requires sourceActionId')
        source = local_file(frame_base, action.get('sourceSheet', action_map.get(source_id, {}).get('sourceSheet')))
        frames = [{**media(local_file(frame_base, frame['src'])), 'durationMs': frame['durationMs']} for frame in action['frames']]
        if len(frames) < 2: raise ValueError(f'{action_id}: no actual animation timeline')
        active_frame_paths = {frame['src'] for frame in frames}
        source_frames = [{**media(path), 'activeInPlayback': path.relative_to(ROOT).as_posix() in active_frame_paths} for path in sorted((frame_base / 'frames' / action_id).glob('[0-9][0-9][0-9].webp'))] if not source_id else []
        exports = {name: media(local_file(frame_base, value)) for name, value in action.get('exports', {}).items()}
        if not all(name in exports for name in ('webp', 'gifLight', 'gifDark')):
            raise ValueError(f'{action_id}: required actual WebP/light-GIF/dark-GIF export missing')
        if not all(item.get('frameCount', 1) > 1 for item in exports.values()):
            raise ValueError(f'{action_id}: export is not multi-frame media')
        runtime_ms = sum(frame['durationMs'] for frame in action['frames'])
        source_cycles = action.get('sequenceCycles', 1)
        if type(source_cycles) is not int or source_cycles < 1: raise ValueError('sequenceCycles must be a positive integer')
        for item in exports.values(): item['declaredCycleDurationMs'] = runtime_ms / source_cycles
        existing = by_id.get(asset_id)
        poster_candidate = frame_base / 'frames' / action_id / 'poster.png'
        poster = media(poster_candidate) if poster_candidate.is_file() else copy.deepcopy(original_poster)
        variants = {'neutral': {'poster': poster, 'still': poster, 'motion': exports['webp']}}
        for theme, gif_name in (('light', 'gifLight'), ('dark', 'gifDark')):
            variants[theme] = {'poster': copy.deepcopy(poster), 'still': copy.deepcopy(poster), 'motion': copy.deepcopy(exports['webp']), 'compatibilityGIF': copy.deepcopy(exports[gif_name])}
        asset = {
            'id': asset_id, 'version': '0.4.0', 'title': {'zh': action['label'], 'en': action_id.replace('-', ' ').title()},
            'status': 'prototype', 'approvalState': 'candidate', 'kind': 'character-animation-2d', 'decorative': True,
            'alt': {'zh': action['description'], 'en': f'Naimiao performs the {action_id} action.'},
            'plannedSemanticAsset': bool(existing and existing.get('plannedSemanticAsset')),
            'phase': existing.get('phase', 'PET-Ia') if existing else 'PET-Ia',
            'placements': ['官网宠物动作演示', '经批准后用于产品宠物表现'],
            'characterId': catalog['characterId'], 'appearanceVersion': catalog['appearanceVersion'],
            'sourceIllustrationId': 'mewling_master', 'runtimeActionId': action_id, 'runtimeCatalog': copy.deepcopy(catalog_record),
            'sourceFile': media(source), 'editableSource': 'pet-actions/build-actions.cjs', 'variants': variants, 'exports': exports,
            'timeline': {'frames': frames, 'runtimeDurationMs': runtime_ms, 'sequenceCycles': source_cycles, 'playback': action['playback'], 'loop': action['loop'], 'returnTo': action.get('returnTo'), 'anchor': action['anchor'], 'frameSize': action['frameSize']},
            'sourceKind': 'mirror-derived' if source_id else 'independent-generated-sequence', 'sourceActionId': source_id, 'mirror': bool(action.get('mirror', False)),
            'sourceFrameInventory': source_frames, 'sourceFrameCount': len(source_frames),
            'playableDistinctFrameFiles': len(active_frame_paths),
            'selectedSourceFrameIndices': action.get('selectedSourceFrameIndices'),
            'excludedSourceFrames': action.get('excludedSourceFrames'),
            'productionState': 'actual_artifact_prototype; visual/runtime evidence and approval are separate',
            'sourceStrategy': 'Use the catalog source sheet, actual transparent frames and timed player; do not replace this action with whole-image motion.',
            'reviewLimit': 'Generated keyed 2D action candidate. Technical metadata does not certify likeness, gait, full-frame smoothness or production approval.',
            'themePolicy': 'Transparent WebP and frames shared across themes; GIF previews intentionally use separate light/dark backgrounds.',
            'activation': 'not_executed',
        }
        if existing: assets[assets.index(existing)] = asset
        else: assets.append(asset)
        by_id[asset_id] = asset
        canonical_actions.append(asset)
    aliases = []
    for asset_id, binding in manifest.get('semanticActionBindings', {}).items():
        canonical = by_id.get('9mew.motion.' + binding['actionId'])
        existing = by_id.get(asset_id)
        if not canonical or not existing: continue
        alias = {**copy.deepcopy(canonical), 'id': asset_id, 'title': existing['title'], 'alt': existing['alt'],
                 'plannedSemanticAsset': existing.get('plannedSemanticAsset', False), 'kind': 'action-alias',
                 'aliasOf': canonical['id'], 'sourceKind': 'semantic-reuse', 'sourceActionId': binding['actionId'],
                 'sourceStrategy': binding['meaning'], 'reviewLimit': binding['meaning'] + ' Not an additional independent source sequence.'}
        assets[assets.index(existing)] = alias
        by_id[asset_id] = alias
        aliases.append(alias)
    legacy = read('motion-2d/delivery.json')
    assets.append({
        'id': '9mew.motion-poster.naimiao-starlight', 'version': '0.3.0',
        'title': {'zh': '奶喵 · 星光陪伴（历史装饰样板）', 'en': 'Naimiao · Starlight (legacy decorative sample)'},
        'status': 'prototype', 'approvalState': 'candidate', 'kind': 'motion-poster', 'decorative': True,
        'alt': {'zh': '奶喵原画与缓缓闪烁的星光。', 'en': 'Original Naimiao art with changing starlight.'},
        'plannedSemanticAsset': False, 'placements': ['可选品牌装饰位'], 'characterId': catalog['characterId'],
        'sourceIllustrationId': 'mewling_master', 'variants': {theme: {'poster': legacy['variants'][theme]['poster'], 'still': legacy['variants'][theme]['poster'], 'motion': legacy['variants'][theme]['motion']} for theme in ('light', 'dark')},
        'editableSource': 'motion-2d/naimiao-starlight.html',
        'reviewLimit': 'Historical whole-image/layer composition. Excluded from current character-action counts and evidence.',
        'runtimePolicy': 'Supplemental decorative media only; current website pet uses the v5 action player with original static fallback.',
    })
    independent = [action for action in actions if not action.get('sourceActionId')]
    mirrors = [action for action in actions if action.get('sourceActionId') and action.get('mirror')]
    frame_paths = {frame['src'] for asset in canonical_actions for frame in asset['timeline']['frames']}
    source_frame_paths = {frame['src'] for asset in canonical_actions for frame in asset['sourceFrameInventory']}
    export_paths = {item['src'] for asset in canonical_actions for item in asset['exports'].values()}
    statuses = Counter(asset['status'] for asset in assets)
    manifest['actionCatalog'] = catalog_record
    manifest['actionGenerationRecords'] = [media(path) for path in sorted(ACTION_ROOT.glob('generation-*.json'))]
    manifest['summary'] = {
        'plannedSemanticCategories': sum(bool(asset.get('plannedSemanticAsset')) for asset in assets),
        'additionalRepresentations': sum(not bool(asset.get('plannedSemanticAsset')) for asset in assets),
        'registryEntries': len(assets), 'prototypeEntries': statuses['prototype'], 'plannedEntries': statuses['planned'],
        'pngMasterOutputs': len(list((ROOT / 'illustrations').glob('*.png'))) + len(list((ROOT / 'evolution').glob('*.png'))),
        'webpStillDerivatives': len(list((ROOT / 'illustrations').glob('*.webp'))) + len(list((ROOT / 'evolution').glob('*.webp'))),
        'functionalUIStates': sum(asset['kind'] == 'ui-state' for asset in assets),
        'planarMotionCompositions': 1, 'planarWebPVariants': 2, 'compatibilityGIFs': 1,
        'appearanceCandidates': 2, 'reusableSkills': 1, 'actual3DModels': 0, '3DStatus': 'deferred_out_of_scope',
        'playableCharacterActionEntries': len(actions), 'independentCharacterActionSequences': len(independent),
        'mirroredActionDerivatives': len(mirrors), 'semanticActionReuseBindings': len(aliases),
        'uniqueTransparentFrameFiles': len(frame_paths), 'characterAnimationExportFiles': len(export_paths),
        'sourcePoseFrameFiles': len(source_frame_paths), 'excludedSourceFrameFiles': len(source_frame_paths - frame_paths),
        'newCharacterLimbAnimations': len(independent),
        'newCharacterLimbAnimationsMeaning': 'Independent source sequences, including face/tail actions; excludes mirrors, aliases and decorative motion.',
    }
    save('assets_manifest.json', manifest)
    csv_path = ROOT / 'specs/assets_plan.csv'
    with csv_path.open(encoding='utf-8-sig', newline='') as stream:
        reader = csv.DictReader(stream)
        fields, rows = reader.fieldnames, list(reader)
    for row in rows:
        asset = by_id[row['asset_id']]
        row['status'] = asset['status']
        row['approval_state'] = asset.get('approvalState', 'not_reviewed')
        row['verified_delivery_paths'] = ' | '.join(exported_paths(asset))
        if row['asset_id'].startswith('9mew.motion.'): row['source_strategy'] = asset['sourceStrategy']
    with csv_path.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    lines = ['# v5 实际资产状态', '', '本表由当前动作 catalog 和实际文件生成，所有新素材仍为 prototype 候选；没有生产批准或真实后端接入声明。', '',
             f'实际可播放动作入口 **{len(actions)}** 个，其中独立源动作 **{len(independent)}** 个、镜像衍生 **{len(mirrors)}** 个；原有语义场景复用 **{len(aliases)}** 项。编码格式、主题、重复播放周期不增加独立动作数。', '',
             '| 动作 ID | 名称 | 分类 | 来源 | 官网时间轴 | 编码导出 |', '|---|---|---|---|---|---|']
    for action in actions:
        origin = '镜像自 ' + action['sourceActionId'] if action.get('sourceActionId') else '独立源动作'
        duration = sum(frame['durationMs'] for frame in action['frames'])
        lines.append(f"| `{action['id']}` | {action['label']} | {action['category']} | {origin} | {len(action['frames'])} 个时序项 / {duration} ms | WebP、浅色 GIF、深色 GIF |")
    lines += ['', '## 原规划的动作映射', '', '| 原资产 ID | 当前状态 | 说明 |', '|---|---|---|']
    for original in read('specs/registry_base_2d.json')['assets']:
        if not original['id'].startswith('9mew.motion.'): continue
        asset = by_id[original['id']]
        meaning = ('复用 `' + asset['runtimeActionId'] + '`；不计新源动作') if asset['kind'] == 'action-alias' else ('实际 `' + asset['runtimeActionId'] + '` 源动作') if asset['kind'] == 'character-animation-2d' else asset['note']
        lines.append(f"| `{asset['id']}` | {asset['status']} | {meaning} |")
    lines += ['', '## 计数与证据边界', '',
              f'- 实际保存源姿态帧 {len(source_frame_paths)} 张；当前播放目录使用其中 {len(frame_paths)} 张不同帧，排除 {len(source_frame_paths - frame_paths)} 张。重复时序项不增加这些数量。',
              '- `specs/assets_plan.csv` 保留原始 64 个语义规划行，更新其中已对应的实际文件/复用关系；新增动作范围在 catalog 与主 manifest 中登记。',
              '- 透明 WebP 与帧可跨主题复用；GIF 是有意合成浅色/深色背景的兼容预览。',
              '- 走跑等动作可在官网重复若干周期后结束，独立编码动图可循环单个周期；时间轴和编码周期分别记录。',
              '- `motion-2d/` 与 `integration/planar-validation.json` 是旧装饰样板/历史证据，不证明本轮宠物动作。',
              '- 本轮编码证据看 `pet-actions/encoding-validation.json`；当前播放器行为看 `integration/actions-runtime-validation.json`；包入口 `specs/validate_delivery.py` 绑定实际字节。',
              '- 文件/编码检查不能代替身份、美感、步态和姿态检查；新素材保持候选，不自动上线。',
              '- 未完成的思考、说话、工作、协作、进化等专用语义动作继续 planned，不能由相近动作的标签替换来冒充。', '']
    excluded = [action for action in actions if action.get('excludedSourceFrames') and not action.get('sourceActionId')]
    if excluded:
        lines += ['## 源姿态筛选记录', '', '| 动作 | 排除的源帧索引（从0开始） | 原因 |', '|---|---|---|']
        for action in excluded:
            fact = action['excludedSourceFrames']
            lines.append(f"| `{action['id']}` | {', '.join(str(value) for value in fact['indices'])} | {fact['reason']} |")
        lines += ['', '这些源帧保留为制作证据，标记为非播放帧，不加入官网时间轴或编码成品。', '']
    (ROOT / 'docs/asset-status-v5.md').write_text('\n'.join(lines), encoding='utf-8')
    print(json.dumps(manifest['summary'], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
