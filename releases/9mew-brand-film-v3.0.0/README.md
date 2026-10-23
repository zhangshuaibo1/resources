# 九喵 · 星环里的家品牌影片与标识 v3

**小小星域，自在相伴。**

按新的方向重新设计：品牌由樱花粉猫耳数字 9 和圆润、真实排版的 mew 字标表达；奶喵与伙伴自然地生活在星环花园中，不再以猫的身体组成 MEW。

16 秒主片围绕奶喵探爪、捧住星光、闭眼含笑、张爪放飞展开。星光游过花园和伙伴，绕向品牌标记，再回到星环。中央奶喵使用一条新创作的八姿态动作；橘猫与蓝灰猫是静态场景伙伴。深色为午夜蓝紫，浅色为暖奶油粉，两主题使用相同原画与动作编排。

![深色主宣传片定格](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_dark_v3.png)

## 直接下载

| 内容 | 下载 |
|---|---|
| 完整素材、高清动作原画、帧图、渲染源码、组件及完整创作提示词 | [9mew_brand_film_v3.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_v3.zip) |
| 官网接入包，可通过本地 HTTP 服务直接预览 | [9mew_brand_film_web_v3.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_web_v3.zip) |
| 16 秒主宣传片 MP4 | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_dark_v3.mp4) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_light_v3.mp4) |
| 6 秒独立动态标识 MP4 | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_ident_dark_v3.mp4) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_ident_light_v3.mp4) |
| 16 秒主宣传片动画 WebP | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_dark_v3.webp) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_light_v3.webp) |
| 6 秒独立动态标识 WebP | [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_ident_dark_v3.webp) · [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_ident_light_v3.webp) |
| 本场景完整创作与接入提示词 v3 | [9mew_brand_film_prompt_v3.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_prompt_v3.txt) |
| 发布附件 SHA-256 | [9mew_brand_film_v3_SHA256SUMS.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-film-v3.0.0/9mew_brand_film_v3_SHA256SUMS.txt) |

## 本版内容

- 两种时长 × 深浅主题 × MP4 / WebM / 动画 WebP，共 12 个成品媒体文件。视频为 1920 × 720、30 fps、无音轨；动画 WebP 为 1280 × 480、15 fps 时间采样。采样率不代表每秒新绘同样数量的猫咪姿态。
- 16 秒主片与 6 秒独立动态标识分别提供封面。6 秒版只有猫耳 9、真实字体 mew／九喵、域名与星光轨道，不包含星园或猫咪表演，标注为 motion-poster。
- 主片与标识的 1920 × 720 静态封面、1080 × 1080 方形品牌画面、1800 × 600 透明字标、1800 × 720 透明中英品牌组合，以及 64／192／512／1024 px 猫耳 9 图标。
- 新星园完整原画、双伙伴场景层、奶喵高清动作来源、八姿态帧和图集、稳定锚点及来源记录。保留未采用候选作为制作记录，不计入新增动作。
- 原生网页组件支持深浅主题、播放／暂停／重播、进度、全屏、减少动态效果、隐藏或离屏暂停及失败回退。默认静态封面，点击后才加载 MP4。
- 完整创作提示词、美术说明、可重新生成素材与视频的脚本、字体许可和实际检查记录。

## 接入

解压完整包或官网接入包，在包根目录运行：

```sh
python3 -m http.server 8000
```

打开 `http://127.0.0.1:8000/web/`。正式接入使用包内 `web/README.md` 的 `createBrandFilm` 示例；保持 8:3 完整画幅。6 秒标识有独立的媒体映射及独立封面示例。静态页面不需要 Node 服务；重新渲染和自动检查依赖另见完整包说明。

## 来源与验证

可维护源文件：[packages/9mew_brand_film_v3](https://github.com/zhangshuaibo1/resources/tree/9mew-brand-film-v3.0.0/packages/9mew_brand_film_v3)

媒体验证、网页检查与美术观察分开记录在包内 `reports/` 及 `web/browser-validation.json`。每个 ZIP 包含 `CHECKSUMS.sha256`；公开附件的真实下载、摘要及实际解压记录位于对应 Release 目录的 `public-verification.json`。

本次交付是官网视觉素材与播放器组件，未执行生产部署。最终艺术效果待用户审阅。猫耳 9 沿用原始樱花粉 PNG，本包不将位图冒充 SVG 母版。当前以 2D 插画与分层帧动画交付，没有 3D 模型。此前全产品业务提示词 v5 及既有 Skill 不改；当前品牌影片与独立创作提示词版本为 v3.0.0。历史包、标签和附件保留。
