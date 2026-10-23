# 九喵 / 9mew · 官网品牌短片 v2

樱花粉猫耳 9、细腻的猫姿 mew、奶喵与星光互动，共同组成这一版官网宣传与标识素材。主片保留原片的品牌轮廓，重新绘制四猫艺术字，并为宣传段落增加橘猫小跑与布偶拍星光动作；深浅两主题使用一致的角色与编排。

**发布版本：`9mew-brand-film-v2.0.0`**

[打开本版 GitHub Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-brand-film-v2.0.0) · [美术与来源说明](docs/ART_DIRECTION.md) · [本次完整提示词](BRAND_FILM_PROMPT.txt) · [网页 API 说明](web/README.md)

本包提供本地素材与可复用播放器，不代表已经部署到生产官网。文件规格、字节数、哈希和验证状态以最终交付清单及对应报告为准；下列报告入口不把未执行的检查自动视为通过。

## 先选适合的位置

| 素材 | 内容 | 建议用途 |
|---|---|---|
| **16 秒主宣传片** | 奶喵、橘猫、布偶与星光互动，最后保持完整品牌画面 | 官网首页品牌区域、产品介绍、宣传展示 |
| **6 秒轻动态标识** | 静态艺术锁定组合搭配克制的星光与图形光效 | 需要安静品牌氛围的页面区域 |
| **静态宽幅封面** | 与影片一致的深浅品牌定格 | 首屏默认、加载前、减少动态效果和播放失败回退 |
| **透明艺术锁定组合** | 猫耳 9、四猫艺术字和真实文字层，背景透明 | 官网专用品牌版面与较宽的宣传设计 |
| **正方形品牌图** | 完整品牌构图的方形展示版本 | 社交图、内容封面和品牌素材展示 |
| **猫耳 9 图标** | 原片猫耳数字 9 的栅格图标 | 导航、应用入口与小尺寸品牌识别 |

6 秒标识循环是 **`motion-poster`，即静态主体加图形动效**，不是另一组猫咪动作。小尺寸位置优先使用猫耳 9；完整猫姿艺术字需要足够宽度来保留毛发细节与负空间。

## 成品文件

| 类型 | 深色文件 | 浅色文件 | 规格 |
|---|---|---|---|
| 主宣传片 MP4 | [brand-film-dark.mp4](exports/brand-film-dark.mp4) | [brand-film-light.mp4](exports/brand-film-light.mp4) | 1920 × 720，30 fps，16 秒 |
| 主宣传片 WebM | [brand-film-dark.webm](exports/brand-film-dark.webm) | [brand-film-light.webm](exports/brand-film-light.webm) | 1920 × 720，30 fps，16 秒 |
| 主宣传片动画 WebP | [brand-film-dark.webp](exports/brand-film-dark.webp) | [brand-film-light.webp](exports/brand-film-light.webp) | 1280 × 480，15 fps 时间采样，约 16 秒 |
| 轻动态标识 MP4 | [brand-ident-dark.mp4](exports/brand-ident-dark.mp4) | [brand-ident-light.mp4](exports/brand-ident-light.mp4) | 1920 × 720，30 fps，6 秒 |
| 轻动态标识 WebM | [brand-ident-dark.webm](exports/brand-ident-dark.webm) | [brand-ident-light.webm](exports/brand-ident-light.webm) | 1920 × 720，30 fps，6 秒 |
| 轻动态标识动画 WebP | [brand-ident-dark.webp](exports/brand-ident-dark.webp) | [brand-ident-light.webp](exports/brand-ident-light.webp) | 1280 × 480，15 fps 时间采样，约 6 秒 |
| 宽幅封面 | [PNG](posters/brand-film-dark.png) · [WebP](posters/brand-film-dark.webp) | [PNG](posters/brand-film-light.png) · [WebP](posters/brand-film-light.webp) | 1920 × 720，静态 |
| 正方形品牌图 | [brand-square-dark.png](posters/brand-square-dark.png) | [brand-square-light.png](posters/brand-square-light.png) | 1080 × 1080，静态 |
| 透明艺术锁定组合 | [PNG](logos/brand-lockup-dark.png) · [WebP](logos/brand-lockup-dark.webp) | [PNG](logos/brand-lockup-light.png) · [WebP](logos/brand-lockup-light.webp) | 2400 × 900，真实 alpha |

独立猫耳 9 PNG 图标：[64 px](logos/cat9-64.png) · [192 px](logos/cat9-192.png) · [512 px](logos/cat9-512.png) · [1024 px](logos/cat9-1024.png)。

主片和轻动态标识均为无音轨、带主题背景的成品。它们不等于透明视频；透明输出在 `logos/` 中。动画 WebP 的编码器可能合并相同画面，因此实际编码页数与逐页时长应读取媒体报告，不能由标称采样率推断原画数量。

这里的猫耳 9 来自原片实际使用的 PNG，保持原轮廓并按尺寸导出。**本包未把栅格图标描述成 SVG 或官方矢量母版。**

## 主片节奏与动作来源

| 区间 | 内容 |
|---|---|
| 0–0.8 秒 | 品牌画面出现，建立猫耳 9 与猫姿 mew 的识别 |
| 0.8–1.5 秒 | 星光引出互动 |
| 1.5–7 秒 | 奶喵、橘猫与布偶错开节奏小跑、观察、跃起或拍星光 |
| 7–8 秒 | 动作收束，回到品牌主体 |
| 8–16 秒 | 保持清晰品牌定格，保留克制的环境光效 |

本版使用 **6 条角色动作序列、48 个帧位**，来源分别为：

| 来源 | 序列 | 数量 |
|---|---|---|
| 本版新建 | `ginger-trot`、`ragdoll-star-paw` | 2 条动作，16 个新原始姿态 |
| 复用既有追逐包 | `chase-run`、`chase-look-up`、`chase-leap`、`chase-land` | 4 条动作，32 个已交付帧位 |

奶喵的复用来源为 `9mew-chase-motion-v1.0.0`。镜像、深浅主题、不同编码格式和重复播放均不增加新原始动作数。四猫 mew 是本版重新绘制的**静态艺术字**，没有把它计成动画序列。

原画由生图能力生成；代码完成机械裁切、配准、实际姿态换帧、路径插值、真实文字与图形光效的合成和编码。30 fps 成品包含关键姿态的保持与位置变化，不代表每秒生成了 30 张新角色原画，也不代表生图工具直接输出了视频。

## 本地预览

完整解压后，在包根目录运行：

```sh
python3 -m http.server 8000
```

浏览器打开 `http://127.0.0.1:8000/web/`。预览页支持深浅主题、静态封面、播放、暂停、重播、进度拖动与全屏。

分文件 ES Module 演示需要 HTTP 服务，不能直接双击 `web/index.html` 代替。MP4、WebM、PNG 和 WebP 文件可直接用支持相应格式的播放器或浏览器打开。

## 接入官网：静态优先

把 `web/`、`exports/`、`posters/` 放在同源静态目录并保持相对结构，例如 `/assets/9mew-brand-v2/`。演示页面另需 `fonts/`，组件本身使用宿主字体。

```html
<link rel="stylesheet" href="/assets/9mew-brand-v2/web/brand-film.css">
<div id="brand-film"></div>

<script type="module">
  import { createBrandFilm } from
    '/assets/9mew-brand-v2/web/brand-film.js';

  const film = createBrandFilm(document.querySelector('#brand-film'), {
    theme: 'dark',
    assetBase: '/assets/9mew-brand-v2/',
    autoplay: false,
    loop: false,
  });

  // 可连接你的页面控件：
  // film.play();        开始或续播
  // film.pause();       手动暂停
  // film.replay();      从头重播
  // film.showPoster();  返回静态封面
  // film.setTheme('light');
  // 在 SPA 组件卸载阶段调用 film.destroy()。
</script>
```

默认先读取静态封面，用户开始播放后才加载视频。默认主片播放一次并保留末帧。系统减少动态效果偏好会抑制自动播放；显式点击播放可以开始本次动画。

如果你的站点有自己的主题开关，应调用 `setTheme()` 与站点主题同步。画面保持 8:3 比例并使用 `object-fit: contain`；手机端完整保留猫咪、猫耳 9 与域名，不居中裁切。用户手动暂停后，滚动回可见区域或切回标签页不会擅自恢复播放。

### 切换为 6 秒轻动态标识

使用同一个组件，显式传入短循环的媒体映射。下面仍以静态封面作为初始状态，点击播放后循环；如果产品确实需要自动播放，可显式改为 `autoplay: true`，系统减少动态效果偏好仍会生效。

```js
const base = '/assets/9mew-brand-v2/';

const ident = createBrandFilm(document.querySelector('#brand-ident'), {
  theme: 'dark',
  autoplay: false,
  loop: true,
  media: {
    dark: {
      mp4: `${base}exports/brand-ident-dark.mp4`,
      webm: `${base}exports/brand-ident-dark.webm`,
      poster: `${base}posters/brand-film-dark.webp`,
    },
    light: {
      mp4: `${base}exports/brand-ident-light.mp4`,
      webm: `${base}exports/brand-ident-light.webm`,
      poster: `${base}posters/brand-film-light.webp`,
    },
  },
});
```

使用该代码前先按上例导入 `createBrandFilm`、样式并准备对应容器。默认映射只引用 MP4；在 `media` 中提供 `webm` 后，支持 WebM 的浏览器才会优先使用指定地址。没有部署某个格式时应移除该字段，不能留下假路径。

完整选项、`assetBase` 相对路径规则、事件、类型声明及回退行为见 [web/README.md](web/README.md)。组件不发起模型、成长、支付、遥测或第三方网络请求；页面内的动画状态不是后端业务事实。

## 源文件与提示词

| 路径 | 内容 |
|---|---|
| `exports/` | 两种片长 × 两个主题 × MP4／WebM／WebP |
| `posters/` | 宽幅封面与方形品牌图 |
| `logos/` | 透明艺术锁定组合、不同尺寸猫耳 9 |
| `source/brand/` | 原片猫耳 9、新四猫艺术字和生成记录 |
| `source/cats/` | 两条新动作源表、提示词与候选记录 |
| `source/reused/` | 奶喵旧动作源表和复用来源 |
| `frames/`、`sprites/` | 实际分帧与图集 |
| `runtime-assets.json` | 真实动作 ID、帧、锚点、时序和来源计数 |
| `refs/` | 奶喵身份原图、旧品牌参考与原片 |
| `tools/` | 素材准备、影片渲染和媒体验证工具 |
| `web/` | 网页组件、类型声明、演示与浏览器检查 |
| `fonts/` | 本地字体与 SIL Open Font License |
| `docs/ART_DIRECTION.md` | 美术决策、资产依据与静态审阅范围 |
| `BRAND_FILM_PROMPT.txt` | 本次品牌短片 v2 的完整创作、接入与交付提示词 |

**版本区别：** 本包及本场景提示词属于品牌短片 v2；此前完整业务提示词仍为 **v5**。本次没有把局部视觉需求改名成新的全产品业务基线。已完成的源文件、完整提示词、说明与下载附件继续上传至用户指定的 `zhangshuaibo1/resources`，新版本保留旧版本历史。

## 重建与检查

原生网页组件本身不需要 Node 依赖。重新制作图集、编码影片或运行自动检查时，需要：

- Node.js 20 或更新版本，以及本包 `package.json` 中固定版本的依赖。
- `ffmpeg` 与 `ffprobe`；FFmpeg 需支持 `libx264`、`libvpx-vp9`、`libwebp_anim`。
- 浏览器检查使用 Playwright 和 Chromium；在普通环境中先安装对应浏览器。

在包根目录运行：

```sh
npm install
npx playwright install chromium
npm run prepare:assets
npm run render
npm run check:media
npm run check:web
```

`check:media` 对应 `node tools/validate-media.mjs`。渲染需要一定时间和空间；它读取包内已生成原画，不会自行调用生图服务。修改原画、时间轴、文字或编码后，应重新执行相应验证、更新清单和校验值，并发布新版本。

主要证据入口：

- [reports/asset-preparation.json](reports/asset-preparation.json)：实际裁框、尺度、透明像素边距、新动作计数与复用哈希。
- [reports/frame-visual-review.json](reports/frame-visual-review.json)：原画和分帧的静态视觉审阅范围。
- [reports/layout.json](reports/layout.json)：实际标识裁框与布局。
- [reports/render-run.json](reports/render-run.json)：哪些文件完成渲染；“渲染完成”不等于“解码验证通过”。
- `tools/validate-media.mjs` 输出到 [reports/](reports/) 的媒体验证记录：以实际生成的报告及其状态为准。
- [web/browser-validation.json](web/browser-validation.json)：实际浏览器运行后生成的检查记录；缺少该文件时不能推断已通过。

技术检查、静态观察、连续播放观察和用户最终视觉批准分别记录。公开下载是否可用，以 Release 发布后的真实附件、SHA-256 校验和下载解压记录为准。官网生产部署不在本素材包的完成声明中。
