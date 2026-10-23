#!/usr/bin/env python3
"""Package the finished v3 source kit and a self-contained static website subset.

No network requests or publishing. Every ZIP member is read back and compared
with its input, and CHECKSUMS.sha256 is included for independent verification.
"""
from __future__ import annotations

import datetime
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent
VERSION = '3.0.0'
TAG = '9mew-brand-film-v3.0.0'
WEB_NAME = '9mew_brand_film_web_v3'
OMIT = {'node_modules', '.git', '__pycache__', '.DS_Store'}


def sha(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def files(root):
    return sorted(p for p in root.rglob('*') if p.is_file()
                  and not any(part in OMIT for part in p.relative_to(root).parts))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def inventory(root, exclude=()):
    return [{'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
             'sha256': sha(p)} for p in files(root)
            if p.relative_to(root).as_posix() not in exclude]


def checksums(root):
    items = inventory(root, {'CHECKSUMS.sha256'})
    (root / 'CHECKSUMS.sha256').write_text(''.join(
        f"{x['sha256']}  {x['path']}\n" for x in items))
    return items


def archive(root, name):
    target = OUT / (name + '.zip')
    members = files(root)
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED,
                         compresslevel=6, allowZip64=True) as z:
        for p in members:
            if p.is_symlink():
                raise RuntimeError('Symlinks are not allowed in this package')
            rel = p.relative_to(root).as_posix()
            entry = zipfile.ZipInfo(name + '/' + rel, (2026, 10, 23, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            z.writestr(entry, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED,
                       compresslevel=6)
    with zipfile.ZipFile(target) as z:
        if z.testzip() is not None:
            raise RuntimeError('ZIP CRC failed')
        for entry in z.infolist():
            rel = PurePosixPath(entry.filename)
            if rel.is_absolute() or '..' in rel.parts or '\\' in entry.filename:
                raise RuntimeError('Unsafe ZIP member')
            original = root.joinpath(*rel.parts[1:])
            if hashlib.sha256(z.read(entry)).hexdigest() != sha(original):
                raise RuntimeError('ZIP member hash mismatch: ' + entry.filename)
    return {'name': target.name, 'bytes': target.stat().st_size,
            'sha256': sha(target), 'fileCount': len(members),
            'crc': 'PASSED', 'everyMemberHash': 'PASSED'}


WEB_README = '''# 九喵官网影片接入包 v3

这是可独立运行的官网素材包。包含 16 秒宣传片、6 秒轻动态标识的深浅主题
MP4 / WebM / 动画 WebP、静态封面、透明标识、猫耳 9 图标、字体和原生网页组件。
6 秒版本为猫耳 9＋真实字体 mew 的独立动态标识，没有猫咪星园或猫姿艺术字。
16 秒主片中，奶喵表演一条八姿态接星／放星动作，两侧伙伴为静态场景原画。

在解压后的本目录运行：

```sh
python3 -m http.server 8000
```

浏览器打开 http://127.0.0.1:8000/web/ 。ES Module 示例需要 HTTP 服务。
默认显示静态封面，点击后才加载 MP4；支持深浅主题、暂停／重播、进度拖动、
全屏、减少动态效果、隐藏页面与离屏暂停。接入说明详见 web/README.md。

官网采用 8:3 完整展示，避免裁掉猫耳、尾巴或品牌文字。小尺寸导航请使用
logos/cat9-192.png 等独立图标；透明字标适合导航与品牌区域，完整星园海报适合首页横幅。

这不是完整原画制作包：生成源图、动作帧、重渲染工具、完整创作提示词和
美术说明在 9mew_brand_film_v3.zip 中。

完整版本与更新入口：
https://github.com/zhangshuaibo1/resources/releases/tag/9mew-brand-film-v3.0.0

本包中的文件摘要见 CHECKSUMS.sha256；实际视频解码记录见
reports/media-validation.json，网页检查记录见 web/browser-validation.json。
未进行官网生产部署，也不代表接入了 AI、宠物成长或任何后端服务。
'''


def main():
    media_report = ROOT / 'reports/media-validation.json'
    browser_report = ROOT / 'web/browser-validation.json'
    static_report = ROOT / 'reports/static-asset-validation.json'
    for p in (media_report, browser_report, static_report, ROOT / 'README.md',
              ROOT / 'BRAND_FILM_PROMPT.txt'):
        if not p.is_file():
            raise RuntimeError('Missing finished deliverable: ' + str(p))
    media = json.loads(media_report.read_text())
    browser = json.loads(browser_report.read_text())
    static = json.loads(static_report.read_text())
    if media.get('status') != 'ALL_12_MEDIA_EXPORTS_VALIDATED' or not media.get('allPassed'):
        raise RuntimeError('All actual media exports must pass decode validation before packaging')
    if browser.get('status') != 'BRAND_FILM_BROWSER_CHECKS_PASSED':
        raise RuntimeError('Actual browser validation must pass before packaging')
    if static.get('status') != 'ALL_22_STATIC_EXPORTS_VALIDATED':
        raise RuntimeError('Static exports must be decoded and checked before packaging')
    for asset in media['assets'] + browser['assets'] + static['assets']:
        target = ROOT / asset['path']
        if target.stat().st_size != asset['bytes'] or sha(target) != asset['sha256']:
            raise RuntimeError('Validated asset changed: ' + asset['path'])
    for item in browser['webFiles']:
        if sha(ROOT / item['path']) != item['sha256']:
            raise RuntimeError('Validated web source changed: ' + item['path'])
    write_json(ROOT / 'manifest.json', {
        'schemaVersion': 1, 'package': ROOT.name, 'version': VERSION, 'tag': TAG,
        'createdAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'artApproval': 'awaiting-user-review', 'productionDeployment': 'NOT_PERFORMED',
        'film': {'durationSeconds': 16, 'videoWidth': 1920, 'videoHeight': 720,
                 'videoFps': 30, 'themes': ['dark', 'light']},
        'ident': {'durationSeconds': 6, 'motionType': 'motion-poster',
                  'characterMotion': False, 'composition': 'cat9 + real mew and 九喵 typography; orbit and star motion only'},
        'sourceCounts': {'newSequences': 1, 'newPoses': 8,
                         'staticCompanionCats': 2, 'reusedSequences': 0, 'reusedPoses': 0},
        'mediaEvidence': {'path': 'reports/media-validation.json',
                          'sha256': sha(media_report), 'status': media.get('status')},
        'browserEvidence': {'path': 'web/browser-validation.json',
                            'sha256': sha(browser_report), 'status': browser.get('status')},
        'staticEvidence': {'path': 'reports/static-asset-validation.json',
                           'sha256': sha(static_report), 'status': static.get('status')},
        'files': inventory(ROOT, {'manifest.json', 'CHECKSUMS.sha256'}),
        'inventoryScope': 'All package files except manifest.json and CHECKSUMS.sha256; CHECKSUMS includes this manifest.'
    })
    checksums(ROOT)
    full_result = archive(ROOT, ROOT.name)
    with tempfile.TemporaryDirectory(prefix='9mew-brand-web-') as tmp:
        web_root = Path(tmp) / WEB_NAME
        web_root.mkdir()
        for directory in ('exports', 'posters', 'logos'):
            shutil.copytree(ROOT / directory, web_root / directory)
        shutil.copytree(ROOT / 'fonts', web_root / 'fonts')
        shutil.copytree(ROOT / 'web', web_root / 'web',
                        ignore=shutil.ignore_patterns('node_modules'))
        (web_root / 'reports').mkdir()
        shutil.copyfile(media_report, web_root / 'reports/media-validation.json')
        shutil.copyfile(static_report, web_root / 'reports/static-asset-validation.json')
        (web_root / 'README.md').write_text(WEB_README)
        write_json(web_root / 'package.json', {
            'name': '9mew-brand-film-web-v3', 'version': VERSION,
            'private': True, 'type': 'module',
            'scripts': {'check:web': 'node web/check-browser.mjs'},
            'devDependencies': {'playwright': '1.62.1'},
            'engines': {'node': '>=20'}
        })
        write_json(web_root / 'manifest.json', {
            'schemaVersion': 1, 'package': WEB_NAME, 'version': VERSION, 'tag': TAG,
            'sourcePackage': ROOT.name,
            'files': inventory(web_root, {'manifest.json', 'CHECKSUMS.sha256'})
        })
        checksums(web_root)
        web_result = archive(web_root, WEB_NAME)
    standalone = []
    for kind in ('film', 'ident'):
        for theme in ('dark', 'light'):
            for extension in ('mp4', 'webp'):
                name = f'9mew_brand_{kind}_{theme}_v3.{extension}'
                shutil.copyfile(ROOT / 'exports' / f'brand-{kind}-{theme}.{extension}',
                                OUT / name)
                standalone.append(name)
    for theme in ('dark', 'light'):
        name = f'9mew_brand_film_{theme}_v3.png'
        shutil.copyfile(ROOT / 'posters' / f'brand-film-{theme}.png', OUT / name)
        standalone.append(name)
    prompt_name = '9mew_brand_film_prompt_v3.txt'
    shutil.copyfile(ROOT / 'BRAND_FILM_PROMPT.txt', OUT / prompt_name)
    standalone.append(prompt_name)
    release_names = [full_result['name'], web_result['name'], *standalone]
    (OUT / '9mew_brand_film_v3_SHA256SUMS.txt').write_text(''.join(
        f'{sha(OUT / name)}  {name}\n' for name in release_names))
    report = {'status': 'LOCAL_ZIP_CRC_AND_MEMBER_HASHES_PASSED',
              'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'full': full_result, 'web': web_result,
              'releaseFilesWithoutChecksum': release_names,
              'publicDownloads': 'NOT_EXECUTED_BY_THIS_SCRIPT'}
    write_json(OUT / '9mew_brand_film_packaging_report_v3.json', report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
