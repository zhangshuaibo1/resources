#!/usr/bin/env python3
"""Extend the bundled preview font for actual UI/catalog copy, using a licensed font source."""
import argparse
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--font', required=True, help='Licensed Noto Sans SC source TTF; keep NOTO-OFL.txt.')
args = parser.parse_args()
root = Path(__file__).resolve().parent
output = root / 'vendor' / '9mew-review-sc.woff'
characters = set()
if output.exists():
    old = TTFont(output)
    characters.update(old.getBestCmap())
    old.close()
for pattern in ('*.tsx', '*.ts', '*.js', '*.json', '*.html', '*.css', '*.txt'):
    for path in root.glob(pattern):
        characters.update(map(ord, path.read_text(encoding='utf-8')))
for path in (root.parent / 'assets_manifest.json', root.parent / 'pet-actions' / 'catalog.json'):
    if path.is_file():
        characters.update(map(ord, path.read_text(encoding='utf-8')))
characters.update(map(ord, '眨眼招手挥爪摇尾倾听好奇张望行走小跑跳跃开心快乐兴奋庆祝生气愤怒委屈难过伤心惊讶害羞睡觉打盹理毛舔爪伸懒腰吃东西喝水微笑拥抱左右喜怒哀乐心情撒欢'))
font = TTFont(args.font)
available = set(font.getBestCmap())
options = subset.Options()
options.flavor = 'woff'
options.layout_features = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=sorted(characters & available))
subsetter.subset(font)
font.flavor = 'woff'
font.save(output)
print(f'Bundled {len(characters & available)} characters; {output.stat().st_size} bytes.')
