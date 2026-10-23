"""Create deterministic-size WebP delivery variants from original PNG masters.

Uses FFmpeg for encoding; Pillow only reads dimensions and alpha statistics.
No semantic image edits, repainting, or artificial upscaling are performed.
Run from any directory: python3 specs/prepare_web_images.py
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / 'illustrations'

def media_info(path):
    with Image.open(path) as image:
        result = {'src': path.relative_to(ROOT).as_posix(), 'width': image.width,
                  'height': image.height, 'mime': 'image/webp' if path.suffix == '.webp' else 'image/png'}
        if 'A' in image.getbands():
            hist = image.getchannel('A').histogram()
            result['transparentPixelFraction'] = round(hist[0] / (image.width * image.height), 4)
        else:
            result['transparentPixelFraction'] = 0.0
    raw = path.read_bytes()
    result.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
    return result

def prepare(source):
    is_hero = source.stem.startswith('hero_')
    profiles = [('desktop', 1536 if is_hero else 1024, 78, (240 if is_hero else 160) * 1024),
                ('mobile', 768 if is_hero else 512, 76, (120 if is_hero else 80) * 1024)]
    original = media_info(source)
    record = {'id': source.stem, 'source': original, 'derivatives': {}, 'review': 'proposed'}
    for profile, target, quality, limit in profiles:
        width = min(target, original['width'])
        dest = IMAGES / (source.stem + '.' + profile + '.webp')
        pending = dest.with_name(dest.stem + '.encoding.webp')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-threads', '1',
                        '-filter_threads', '1', '-i', str(source), '-vf', f'scale={width}:-1:flags=lanczos',
                        '-vcodec', 'libwebp', '-compression_level', '6', '-quality', str(quality),
                        '-lossless', '0', '-frames:v', '1', '-threads', '1', str(pending)], check=True)
        with Image.open(pending) as verification:
            verification.load()
        pending.replace(dest)
        info = media_info(dest)
        info.update(budgetBytes=limit, budgetStatus='passed' if info['bytes'] <= limit else 'performance_pending',
                    encoding={'encoder': 'FFmpeg libwebp', 'quality': quality, 'compressionLevel': 6},
                    composition='same full composition as PNG master; responsive scale, no semantic crop')
        record['derivatives'][profile] = info
    return record

if __name__ == '__main__':
    sources = sorted(IMAGES.glob('*.png'))
    with ThreadPoolExecutor(max_workers=2) as pool:
        records = list(pool.map(prepare, sources))
    report = {'schemaVersion': 1, 'scope': 'File dimensions, alpha, SHA-256 and encoded-byte budgets only; target-device performance and brand review pending.',
              'sourceCount': len(records), 'derivativeCount': sum(len(x['derivatives']) for x in records), 'images': records}
    (ROOT / 'specs' / 'image_delivery_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for item in records:
        print(item['id'], {k: (v['width'], v['height'], v['bytes'], v['budgetStatus']) for k, v in item['derivatives'].items()})
