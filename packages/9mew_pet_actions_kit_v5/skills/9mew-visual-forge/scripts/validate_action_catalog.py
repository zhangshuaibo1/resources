#!/usr/bin/env python3
"""Check local action-catalog files and timing; never judge likeness or activate art."""
import argparse
import hashlib
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit

try:
    from PIL import Image
except ImportError:
    Image = None

SKILL = Path(__file__).resolve().parents[1]


def local_path(base, value, root, directory=False):
    if not isinstance(value, str) or not value or len(value) > 500:
        raise ValueError('path must be a nonempty local string')
    url = urlsplit(value)
    if url.scheme or url.netloc or url.query or url.fragment or '\\' in value or Path(value).is_absolute():
        raise ValueError('path must be relative without a URL scheme, query or fragment')
    path = (base / value).resolve()
    if not path.is_relative_to(root):
        raise ValueError('path escapes the declared delivery root')
    if not (path.is_dir() if directory else path.is_file()):
        raise ValueError(f'local path is missing: {value}')
    return path


def positive_int(value, label, maximum):
    if type(value) is not int or not 0 < value <= maximum:
        raise ValueError(f'{label} must be an integer in 1..{maximum}')
    return value


def inspect_frame(path):
    raw = path.read_bytes()
    if not raw:
        raise ValueError('empty frame file')
    facts = {'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    if Image is None:
        return {**facts, 'decode_status': 'not_executed_Pillow_unavailable'}
    with Image.open(path) as im:
        if getattr(im, 'n_frames', 1) != 1:
            raise ValueError('a sprite frame must be static, not an encoded animation')
        if im.width * im.height > 16_777_216:
            raise ValueError('frame exceeds validation pixel limit')
        im.load()
        rgba = im.convert('RGBA')
        if rgba.getchannel('A').getextrema()[1] == 0:
            raise ValueError('frame is fully transparent')
        return {**facts, 'width': im.width, 'height': im.height,
                'decoded_sha256': hashlib.sha256(rgba.tobytes()).hexdigest(),
                'has_transparency': rgba.getchannel('A').getextrema()[0] < 255,
                'decode_status': 'decoded'}


def validate(catalog_path, root):
    root = root.resolve()
    catalog_path = catalog_path.resolve()
    if not catalog_path.is_relative_to(root):
        raise ValueError('catalog must be inside the declared delivery root')
    data = json.loads(catalog_path.read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('schemaVersion') != '1.0':
        raise ValueError('expected catalog schemaVersion 1.0')
    for key in ('characterId', 'appearanceVersion', 'defaultAction'):
        if not isinstance(data.get(key), str) or not data[key]:
            raise ValueError(f'missing catalog {key}')
    base = local_path(catalog_path.parent, data.get('basePath', './'), root, directory=True)
    poster = local_path(catalog_path.parent, data.get('poster'), root)
    poster_facts = inspect_frame(poster)
    actions = data.get('actions')
    if not isinstance(actions, list) or not 1 <= len(actions) <= 256:
        raise ValueError('catalog must contain 1..256 actions')
    results = []
    ids = set()
    cache = {}
    for action in actions:
        row = {'id': action.get('id') if isinstance(action, dict) else None, 'errors': []}
        results.append(row)
        try:
            if not isinstance(action, dict):
                raise ValueError('action must be an object')
            aid = action.get('id')
            if not isinstance(aid, str) or not aid or aid in ids:
                raise ValueError('action ID must be nonempty and unique')
            ids.add(aid)
            for key in ('label', 'category', 'description'):
                if not isinstance(action.get(key), str) or not action[key]:
                    raise ValueError(f'action {key} must be a nonempty string')
            playback = action.get('playback')
            if playback not in ('loop', 'once') or type(action.get('loop')) is not bool or action['loop'] != (playback == 'loop'):
                raise ValueError('playback and boolean loop must agree')
            size = action.get('frameSize', {})
            width = positive_int(size.get('width'), 'frameSize.width', 8192)
            height = positive_int(size.get('height'), 'frameSize.height', 8192)
            anchor = action.get('anchor', {})
            if any(type(anchor.get(key)) not in (int, float) or not 0 <= anchor[key] <= 1 for key in ('x', 'y')):
                raise ValueError('anchor coordinates must be numbers in 0..1')
            frames = action.get('frames')
            if not isinstance(frames, list) or not 2 <= len(frames) <= 512:
                raise ValueError('an action requires 2..512 timed frame entries')
            total = 0
            unique = set()
            paths = set()
            frame_facts = []
            for frame in frames:
                if not isinstance(frame, dict):
                    raise ValueError('frame entry must be an object')
                path = local_path(base, frame.get('src'), root)
                total += positive_int(frame.get('durationMs'), 'durationMs', 60000)
                if path not in cache:
                    cache[path] = inspect_frame(path)
                facts = cache[path]
                if Image is not None and (facts['width'], facts['height']) != (width, height):
                    raise ValueError('declared frameSize differs from an actual frame')
                if Image is not None:
                    unique.add(facts['decoded_sha256'])
                paths.add(str(path))
                frame_facts.append({'src': frame['src'], 'durationMs': frame['durationMs'], **facts})
            if Image is not None and len(unique) < 2:
                raise ValueError('no actual decoded pixel variation in the action')
            if total > 300000:
                raise ValueError('action timeline exceeds the five-minute inspection limit')
            row.update({'category': action['category'], 'playback': playback,
                        'sourceActionId': action.get('sourceActionId'), 'mirror': bool(action.get('mirror', False)),
                        'timeline_entries': len(frames), 'distinct_frame_paths': len(paths),
                        'distinct_decoded_frames': len(unique) if Image is not None else None,
                        'duration_ms': total, 'frames': frame_facts})
        except (ValueError, TypeError, KeyError, AttributeError, OSError) as exc:
            row['errors'].append(str(exc))
    errors = []
    if data['defaultAction'] not in ids:
        errors.append('defaultAction is not in the actual action catalog')
    action_map = {a.get('id'): a for a in actions if isinstance(a, dict) and isinstance(a.get('id'), str)}
    for action, row in zip(actions, results):
        if not isinstance(action, dict):
            continue
        for key in ('returnTo', 'sourceActionId'):
            target = action.get(key)
            if target is not None and target not in ids:
                row['errors'].append(f'{key} references an unavailable action')
        if action.get('mirror') and not action.get('sourceActionId'):
            row['errors'].append('mirrored derivative must declare sourceActionId')
        seen = set()
        current = action
        while current.get('sourceActionId') in action_map:
            key = current['sourceActionId']
            if key in seen or key == action.get('id'):
                row['errors'].append('sourceActionId contains a derivation cycle')
                break
            seen.add(key)
            current = action_map[key]
    failed = bool(errors) or any(row['errors'] for row in results)
    return {'schemaVersion': '9mew.action-catalog-checks.v1',
            'status': 'FAILED' if failed else ('PARTIAL' if Image is None else 'TECHNICAL_CHECKS_PASSED'),
            'catalog_sha256': hashlib.sha256(catalog_path.read_bytes()).hexdigest(),
            'characterId': data['characterId'], 'appearanceVersion': data['appearanceVersion'],
            'action_entries': len(actions), 'declared_derivatives': sum(bool(a.get('sourceActionId')) for a in actions if isinstance(a, dict)),
            'poster': {'path': data['poster'], **poster_facts}, 'actions': results, 'errors': errors,
            'approval_verified': False, 'visual_semantics_verified': False, 'runtime_playback': 'not_executed_by_script',
            'scope': 'Local paths, static frame decode, actual dimensions/pixel variation, timing and catalog references. This does not prove likeness, gait, emotion, smoothness, browser behavior or production approval.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalog', required=True, type=Path)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    try:
        out = args.out.resolve()
        if out.is_relative_to(SKILL) or out == args.catalog.resolve():
            raise ValueError('write reports outside the skill without overwriting the catalog')
        report = validate(args.catalog, args.root)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps({'status': report['status'], 'actions': report['action_entries'], 'report': str(out), 'approval_verified': False}))
        return 2 if report['status'] == 'FAILED' else (3 if report['status'] == 'PARTIAL' else 0)
    except (ValueError, TypeError, KeyError, OSError, json.JSONDecodeError) as exc:
        print(f'Action catalog rejected: {exc}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
