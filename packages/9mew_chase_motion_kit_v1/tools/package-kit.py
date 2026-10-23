#!/usr/bin/env python3
"""Make complete and website-only ZIPs; verify every written archive member.

Run from any directory. Output defaults to the package's parent, or --out DIR.
No networking or credential access. Does not alter the character or web runtime.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NAME = '9mew_chase_motion_kit_v1'
WEBNAME = '9mew_chase_web_v1'
SKIP = {'node_modules', '.git', '__pycache__', '.DS_Store'}
SECRETS = re.compile(rb'github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}')


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def files(root):
    result = []
    for p in sorted(root.rglob('*')):
        if any(part in SKIP for part in p.relative_to(root).parts):
            continue
        if p.is_symlink():
            raise RuntimeError('Symlink not allowed: ' + p.name)
        if p.is_file():
            if p.stat().st_size >= 100_000_000:
                raise RuntimeError('Oversized source file needs release-only handling: ' + p.name)
            if SECRETS.search(p.read_bytes()):
                raise RuntimeError('Credential-shaped content in ' + p.name)
            result.append(p)
    return result


def write_checksums(root):
    entries = [p for p in files(root) if p != root / 'CHECKSUMS.sha256']
    (root / 'CHECKSUMS.sha256').write_text(''.join(sha(p) + '  ' + p.relative_to(root).as_posix() + '\n' for p in entries))


def zip_tree(root, destination):
    entries = files(root)
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        for p in entries:
            z.write(p, root.name + '/' + p.relative_to(root).as_posix())
    with zipfile.ZipFile(destination) as z:
        assert z.testzip() is None
        assert len(z.namelist()) == len(set(z.namelist())) == len(entries)
        for p in entries:
            name = root.name + '/' + p.relative_to(root).as_posix()
            assert hashlib.sha256(z.read(name)).hexdigest() == sha(p)
    return {'name': destination.name, 'bytes': destination.stat().st_size,
            'sha256': sha(destination), 'fileCount': len(entries), 'crc': 'PASSED', 'everyMemberHash': 'PASSED'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', type=Path, default=ROOT.parent)
    args = ap.parse_args()
    out = args.out.resolve(); out.mkdir(parents=True, exist_ok=True)
    catalog = json.loads((ROOT / 'catalog.json').read_text())
    reports = {name: json.loads((ROOT / name).read_text()) for name in (
        'reports/encoding-validation.json', 'reports/visual-review.json', 'reports/preview-validation.json',
        'web/runtime-validation.json', 'web/offline-validation.json')}
    assert reports['reports/encoding-validation.json']['status'] == 'ENCODING_AND_GEOMETRY_PASSED'
    assert reports['reports/preview-validation.json']['status'] == 'PREVIEW_ENCODING_PASSED'
    assert reports['web/runtime-validation.json']['status'] == 'RUNTIME_CHECKS_PASSED'
    assert reports['web/offline-validation.json']['status'] == 'OFFLINE_PREVIEW_PASSED'
    assert reports['web/runtime-validation.json']['catalogSHA256'] == sha(ROOT / 'catalog.json')
    assert reports['web/runtime-validation.json']['runtimeSHA256'] == sha(ROOT / 'web/chase-scene.js')
    assert reports['web/offline-validation.json']['htmlSHA256'] == sha(ROOT / 'OPEN_ME.html')
    assert reports['reports/preview-validation.json']['runtimeSha256'] == sha(ROOT / 'web/chase-scene.js')
    assert len(catalog['actions']) == 8 and catalog['sourceSequenceCount'] == 7
    for a in catalog['actions'].values():
        assert (ROOT / a['sprite']).is_file()
        for f in a['frames']:
            assert (ROOT / f).is_file()
    evidence = {'status': 'CHASE_KIT_DELIVERY_CHECKS_PASSED', 'version': '1.0.0',
                'characterId': catalog['characterId'], 'artApproval': 'awaiting-user-review',
                'newSourceSequences': 7, 'newSourcePoses': 56, 'reusedStates': ['rest'],
                'frameSlots': 64, 'individualAnimations': 24, 'routePreviewFiles': 6,
                'routeDurationMs': 27000,
                'reports': [{'path': p, 'status': r['status'], 'sha256': sha(ROOT / p)} for p, r in reports.items()]}
    react = ROOT / 'web/react-validation.json'
    if react.exists():
        rr = json.loads(react.read_text()); evidence['reports'].append({'path': 'web/react-validation.json', 'status': rr.get('status'), 'sha256': sha(react)})
    (ROOT / 'DELIVERY.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n')
    write_checksums(ROOT)
    full = zip_tree(ROOT, out / (NAME + '.zip'))
    webroot = out / WEBNAME
    if webroot.exists():
        # This is only this script's derived, reproducible website ZIP staging tree.
        assert webroot.name == WEBNAME and webroot.parent == out
        shutil.rmtree(webroot)
    webroot.mkdir()
    for name in ('sprites', 'fonts'):
        shutil.copytree(ROOT / name, webroot / name)
    (webroot / 'refs').mkdir(); shutil.copyfile(ROOT / 'refs/mewling_master.webp', webroot / 'refs/mewling_master.webp')
    (webroot / 'web').mkdir()
    for name in ('chase-scene.js', 'chase-scene.d.ts', 'ChasePet.tsx', 'demo.js', 'demo.css', 'index.html'):
        shutil.copyfile(ROOT / 'web' / name, webroot / 'web' / name)
    # The lightweight distribution advertises only its actual runtime files.
    # Rebuild scripts, source poses, exports and full QA evidence stay in the complete kit.
    release = 'https://github.com/zhangshuaibo1/resources/releases/tag/9mew-chase-motion-v1.0.0'
    download = 'https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/'
    complete = 'https://github.com/zhangshuaibo1/resources/blob/9mew-chase-motion-v1.0.0/packages/9mew_chase_motion_kit_v1/'
    (webroot / 'web/package.json').write_text(json.dumps({
        'name': '9mew-screen-chase-web', 'version': '1.0.0', 'private': True, 'type': 'module',
        'description': 'Runtime-only 9mew 2D chase distribution; no build or test scripts included.'
    }, ensure_ascii=False, indent=2) + '\n')
    web_catalog = json.loads((ROOT / 'catalog.json').read_text())
    for action in web_catalog['actions'].values():
        # A minimal install has all resources it advertises; source-only fields live in the complete kit.
        for key in ('frames', 'exports', 'source', 'poster'):
            action.pop(key, None)
    web_catalog['distribution'] = {'kind': 'web-runtime-subset', 'completeKitDocumentation': complete + 'README.md'}
    (webroot / 'catalog.json').write_text(json.dumps(web_catalog, ensure_ascii=False, indent=2) + '\n')
    (webroot / 'README.md').write_text(f'''# 九喵追逐动画 · 网页接入包 v1

本包是完整素材包的**网页运行子集**，用于把奶喵追鼠、追蝶再回到右下角的 27 秒动画放进网页。保留运行所需的 8 张透明图集、原始静态回退图、字体与授权说明，以及播放器、演示页面、可选 React 适配器和类型声明。

## 在本地查看

完整解压并保留目录结构，在本目录运行：

```sh
python3 -m http.server 9077
```

浏览器打开 `http://127.0.0.1:9077/web/`。页面提供深浅主题、暂停、重播、速度、大小及全视口切换。分文件演示需要 HTTP 服务，不适合直接双击 `web/index.html`。

## 放入你的网页

把本目录部署到同源静态资源路径，例如 `/assets/9mew-chase-v1/`，保留 `web/`、`sprites/`、`refs/`、`fonts/` 和 `catalog.json` 的相对位置：

```html
<script type="module">
  import {{ create9mewChase }} from '/assets/9mew-chase-v1/web/chase-scene.js';
  const scene = create9mewChase({{
    catalogUrl: '/assets/9mew-chase-v1/catalog.json',
    autoplay: true, repeat: 1, catSize: 160, margin: 32,
  }});
  // 页面或组件卸载时调用 scene.destroy()。
</script>
```

默认不自动播放；示例显式开启一次播放。系统“减少动态效果”偏好会抑制自动动作，用户调用 `play()` 可明确开始。浮层允许点击穿透。局部容器、控制 API、时间线和图集说明见 [web/README.md](web/README.md)。原生播放器无运行时依赖；可选 React 适配器使用你的应用已有的 React。

## 本包内容

| 路径 | 用途 |
|---|---|
| `web/index.html` | 通过 HTTP 打开的演示入口 |
| `web/chase-scene.js` | 播放器与 `sampleChase()` 路线采样器 |
| `web/demo.js`、`web/demo.css` | 演示交互及深浅主题 |
| `web/ChasePet.tsx`、`web/chase-scene.d.ts` | 可选 React 适配器与类型声明 |
| `catalog.json` | **运行子集目录**，含 8 个状态的图集、帧时长和锚点 |
| `sprites/`、`refs/`、`fonts/` | 真实图集、原图及字体素材 |
| `CHECKSUMS.sha256` | 本包实际文件的 SHA-256 |

运行目录有意省略完整版目录中的原始逐帧路径、单独动画导出路径及制作源图路径；这些省略不改变播放动作、帧时长或锚点。7 个新原始序列加 1 个派生休息状态的来源元数据仍保留。网页包不包含 `OPEN_ME.html`、构建工具、源图、MP4/GIF/WebP 单独导出或完整版验收报告，`web/package.json` 不声明这些工具的脚本。

## 离线预览、源图、重建与验证

- [下载可双击打开的独立离线预览]({download}9mew_chase_preview_v1.html)
- [下载完整素材与源码 ZIP]({download}9mew_chase_motion_kit_v1.zip)
- [固定版本完整说明]({complete}README.md)
- [固定版本网页 API、重建和测试说明]({complete}web/README.md)
- [固定版本完整验证报告目录](https://github.com/zhangshuaibo1/resources/tree/9mew-chase-motion-v1.0.0/packages/9mew_chase_motion_kit_v1/reports)
- [本场景完整制作提示词]({complete}CHASE_SCENE_PROMPT.txt)
- [本版 Release]({release})

素材为已实现的轻量关键帧动画，最终视觉验收仍由用户确认。演示不代表已接入真实 AI、宠物成长、支付或生产服务。
''')
    original_web_doc = (ROOT / 'web/README.md').read_text()
    assert '## 最小接入' in original_web_doc and '## 预览与单文件版' in original_web_doc
    assert '## 图集契约' in original_web_doc and '## 验证范围' in original_web_doc
    api_doc = original_web_doc.split('## 最小接入', 1)[1].split('## 预览与单文件版', 1)[0]
    contract_doc = original_web_doc.split('## 图集契约', 1)[1].split('## 验证范围', 1)[0]
    contract_doc = contract_doc.replace('具体来源和派生关系见包内制作清单。',
        '轻量目录保留来源类型；原始素材与制作清单见下方固定版本的完整版链接。')
    (webroot / 'web/README.md').write_text(f'''# 九喵追逐动画 · 轻量网页 API

本目录属于网页运行子集，只交付播放器、演示、可选 React 适配器和类型声明。`package.json` 仅声明 ES Module，不含未交付的构建或测试脚本。

## 最小接入{api_doc}
## 本包演示

在网页包根目录运行 `python3 -m http.server 9077`，打开 `http://127.0.0.1:9077/web/`。`index.html`、`demo.js`、`demo.css` 和所引用的图集、字体都已包含。需要自行托管同源静态资源并保留目录结构。

`ChasePet.tsx` 使用应用已有的 React，不要求为原生播放器安装 React。本包不含 `OPEN_ME.html`、离线构建脚本、检查脚本或验收报告。[独立离线 HTML 可在这里下载]({download}9mew_chase_preview_v1.html)。

## 图集契约{contract_doc}
## 运行子集与完整制作包

本包的 `catalog.json` 明确标记为 `web-runtime-subset`。相较完整目录，它移除了 `frames`、`exports`、`source` 与动作级 `poster` 等制作资源路径，保留真实图集、时序、锚点、方向、循环方式及原始静态回退图。运行状态和来源计数沿用完整版，不把缺省路径解释为额外素材。

重建源图、生成离线 HTML、运行完整浏览器与 React 检查，请使用固定版本的完整包：

- [完整 ZIP]({download}9mew_chase_motion_kit_v1.zip)
- [完整网页说明与重建步骤]({complete}web/README.md)
- [原生运行时验证]({complete}web/runtime-validation.json)
- [React 适配器验证]({complete}web/react-validation.json)
- [离线预览验证]({complete}web/offline-validation.json)

本组件只提供真实本地图集的动画播放和路线编排，不发起模型、成长、支付或遥测调用。技术检查不代替用户的最终视觉验收。
''')
    (webroot / 'START_HERE.txt').write_text('九喵网页接入包 v1\n\n本包只包含网页运行所需的图集、原图、字体、目录和源码。\n将整个目录部署为同源静态资源，接入 web/chase-scene.js；操作例见 README.md。\n本包的 web/index.html 需要 HTTP 服务。若需双击离线预览，下载单独的 9mew_chase_preview_v1.html。\n完整源图、动画导出与验证报告在完整素材 ZIP 中。\n')
    write_checksums(webroot)
    web = zip_tree(webroot, out / (WEBNAME + '.zip'))
    copies = {
        'OPEN_ME.html': '9mew_chase_preview_v1.html', 'CHASE_SCENE_PROMPT.txt': '9mew_chase_scene_prompt_v1.txt',
        'exports/route-light.mp4': '9mew_chase_light_v1.mp4', 'exports/route-dark.mp4': '9mew_chase_dark_v1.mp4',
        'exports/route-light.gif': '9mew_chase_light_v1.gif', 'exports/route-dark.gif': '9mew_chase_dark_v1.gif',
        'exports/route-light.webp': '9mew_chase_light_v1.webp', 'exports/route-dark.webp': '9mew_chase_dark_v1.webp',
        'exports/overview.png': '9mew_chase_overview_v1.png'}
    for src, dst in copies.items():
        shutil.copyfile(ROOT / src, out / dst)
    report = {'full': full, 'web': web, 'standaloneFiles': list(copies.values()), 'deliveryStatus': evidence['status']}
    (out / '9mew_chase_packaging_report_v1.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
