# 九喵 · 星光嬉戏品牌影片与标识 v2

从原版 `playful-dark.mp4` 重新设计的官网品牌素材：保留樱花粉猫耳数字 9，以细腻的四猫 mew 艺术字、奶喵追星光、橘猫小跑和布偶抬爪组成新的宣传画面。

深色为午夜蓝紫星域，浅色为暖奶油与淡粉环境。两主题保持相同猫咪原画与编排。

![深色品牌定格](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_dark_v2.png)

## 直接下载

| 内容 | 下载 |
|---|---|
| 完整素材、原画、动作帧、渲染工具、网页组件和完整提示词 | [9mew_brand_film_v2.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_v2.zip) |
| 官网接入包，可通过本地 HTTP 服务直接预览 | [9mew_brand_film_web_v2.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_web_v2.zip) |
| 16 秒主片 MP4 | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_dark_v2.mp4) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_light_v2.mp4) |
| 6 秒轻动态标识 MP4 | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_ident_dark_v2.mp4) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_ident_light_v2.mp4) |
| 16 秒主片动画 WebP | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_dark_v2.webp) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_light_v2.webp) |
| 6 秒轻动态标识 WebP | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_ident_dark_v2.webp) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_ident_light_v2.webp) |
| 本场景完整创作与接入提示词 v2 | [9mew_brand_film_prompt_v2.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_prompt_v2.txt) |
| 发布附件 SHA-256 | [9mew_brand_film_v2_SHA256SUMS.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v2.0.0/9mew_brand_film_v2_SHA256SUMS.txt) |

## 本版内容

- 两种时长 × 深浅主题 × MP4 / WebM / 动画 WebP，共 12 个成品媒体文件。视频 1920 × 720、30 fps、无音轨；动画 WebP 为 1280 × 480、15 fps 时间采样。
- 1920 × 720 静态封面、1080 × 1080 方形品牌图、2400 × 900 透明完整标识，以及 64 / 192 / 512 / 1024 px 猫耳 9 图标。
- 2 条新动作、16 个新姿态：橘猫小跑、布偶拍星光。奶喵使用既有追逐包的 4 条动作、32 个帧位，并保留复用来源与哈希。
- 新四猫 mew 是静态艺术字。6 秒版本以静态标识和星光动效组成，明确标注为 `motion-poster`。
- 原生网页播放器支持主题、播放 / 暂停 / 重播、进度、全屏、减少动态效果、隐藏或离屏暂停、失败回退。初始显示静态封面，点击后才加载 MP4。
- 原画、参考、动作源表、完整提示词、制作脚本、字体许可与验证报告全部保留。

## 接入

解压完整包或官网接入包，在包根目录运行：

```sh
python3 -m http.server 8000
```

打开 `http://127.0.0.1:8000/web/`。正式接入使用包内 `web/README.md` 中的 `createBrandFilm` 示例；保持 8:3 完整画幅，手机端不裁掉猫咪和标识。无需 Node 即可正常提供静态页面；重建与自动检查的依赖另见完整包说明。

## 文件与验证

可维护源文件：[packages/9mew_brand_film_v2](https://github.com/zhangshuaibo1/resources/tree/9mew-brand-film-v2.0.0/packages/9mew_brand_film_v2)

实际媒体验证、网页检查和构图观察分开记录在包内 `reports/` 与 `web/browser-validation.json`。每个 ZIP 含内部 `CHECKSUMS.sha256`；公开链接的下载、摘要与实际解压结果将在本仓库对应 Release 目录的 `public-verification.json` 中登记。

本版交付可使用的视觉素材与组件，未进行官网生产部署。艺术效果仍待用户审阅。猫耳 9 为原片实际 PNG 的沿用与尺寸派生，本包不包含新制作的 SVG 母版或 3D 模型。此前全产品业务提示词 v5 保持不变；本场景独立版本为品牌影片 v2。历史包、标签与附件继续保留。
