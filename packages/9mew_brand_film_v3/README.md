# 九喵 / 9mew ·《星环里的家》v3

奶喵与两位伙伴在樱粉云岸上相伴，接住并放飞一颗暖金星光。猫咪保持自然姿态，品牌由独立的樱花粉猫耳 9 与圆润的真实字体 `mew` 识别。

**独立发布版本：`9mew-brand-film-v3.0.0`**

[本版 GitHub Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-brand-film-v3.0.0) · [美术与来源说明](docs/ART_DIRECTION.md) · [本场景完整提示词](BRAND_FILM_PROMPT.txt) · [网页接入 API](web/README.md)

本版采用用户最新允许的自然猫咪场景，不再要求猫咪组成 MEW 字形。主品牌仍为「九喵 / 9mew」，默认助手仍为奶喵。《星环里的家》是场景概念名称；此前全产品业务提示词 **v5** 与旧视觉 Skill 均保持不变。

## 选择适合的位置

| 素材 | 内容 | 用途 |
|---|---|---|
| **16 秒宣传片** | 奶喵在星园接星、捧爪、微笑与放飞，最后回到相伴画面 | 官网首页品牌区域、产品介绍、宣传展示 |
| **6 秒简洁标识** | 独立猫耳 9 + mew + 九喵／域名，搭配轻星光轨道 | 页面品牌展示、较安静的循环区域 |
| **宣传片静态封面** | 完整品牌区与三猫星园 | 首屏默认、加载前、减少动态效果和播放失败回退 |
| **标识静态封面** | 仅简洁品牌组合与环境 | 6 秒标识的默认封面与回退画面 |
| **透明简洁字标** | 猫耳 9 + 真实字体 mew，可选附带九喵 | 导航、品牌标题、横向宣传设计 |
| **猫耳 9 图标** | 原片猫耳 9 的独立透明尺寸派生 | 小尺寸导航、应用入口与品牌识别 |
| **正方形品牌图** | 字标与完整星园概念原画 | 社交图、文章或品牌资料封面 |

6 秒标识是 **`motion-poster`：静态字标主体加环境图形动效**。它不含猫咪星园或新的猫咪表演，不能计为第二条角色动作。完整场景适合较宽的展示区域；小尺寸位置优先用简洁字标或猫耳 9。

## 成品路径与规格

媒体按以下路径导出。实际成功文件、大小、SHA-256、编码帧数与检查状态以交付清单和对应验证报告为准；目录、脚本或本表存在本身不等于该项已验证通过。

| 类型 | 深色版本 | 浅色版本 | 导出规格 |
|---|---|---|---|
| 主宣传片 MP4 | [brand-film-dark.mp4](exports/brand-film-dark.mp4) | [brand-film-light.mp4](exports/brand-film-light.mp4) | 1920 × 720，30 fps，16 秒 |
| 主宣传片 WebM | [brand-film-dark.webm](exports/brand-film-dark.webm) | [brand-film-light.webm](exports/brand-film-light.webm) | 1920 × 720，30 fps，16 秒 |
| 主宣传片动画 WebP | [brand-film-dark.webp](exports/brand-film-dark.webp) | [brand-film-light.webp](exports/brand-film-light.webp) | 1280 × 480，15 fps 时间采样，约 16 秒 |
| 简洁标识 MP4 | [brand-ident-dark.mp4](exports/brand-ident-dark.mp4) | [brand-ident-light.mp4](exports/brand-ident-light.mp4) | 1920 × 720，30 fps，6 秒 |
| 简洁标识 WebM | [brand-ident-dark.webm](exports/brand-ident-dark.webm) | [brand-ident-light.webm](exports/brand-ident-light.webm) | 1920 × 720，30 fps，6 秒 |
| 简洁标识动画 WebP | [brand-ident-dark.webp](exports/brand-ident-dark.webp) | [brand-ident-light.webp](exports/brand-ident-light.webp) | 1280 × 480，15 fps 时间采样，约 6 秒 |
| 主片封面 | [PNG](posters/brand-film-dark.png) · [WebP](posters/brand-film-dark.webp) | [PNG](posters/brand-film-light.png) · [WebP](posters/brand-film-light.webp) | 1920 × 720，静态 |
| 标识封面 | [PNG](posters/brand-ident-dark.png) · [WebP](posters/brand-ident-dark.webp) | [PNG](posters/brand-ident-light.png) · [WebP](posters/brand-ident-light.webp) | 1920 × 720，静态 |
| 正方形品牌图 | [brand-square-dark.png](posters/brand-square-dark.png) | [brand-square-light.png](posters/brand-square-light.png) | 1080 × 1080，静态概念原画 |
| 透明简洁字标 | [PNG](logos/wordmark-dark.png) · [WebP](logos/wordmark-dark.webp) | [PNG](logos/wordmark-light.png) · [WebP](logos/wordmark-light.webp) | 1800 × 600，猫耳 9 + mew |
| 透明中英组合 | [PNG](logos/brand-lockup-dark.png) · [WebP](logos/brand-lockup-dark.webp) | [PNG](logos/brand-lockup-light.png) · [WebP](logos/brand-lockup-light.webp) | 1800 × 720，猫耳 9 + mew + 九喵 |

独立猫耳 9 图标：[64 px](logos/cat9-64.png) · [192 px](logos/cat9-192.png) · [512 px](logos/cat9-512.png) · [1024 px](logos/cat9-1024.png)。

`dark` 字标用于深色背景，`light` 字标用于浅色背景。两种视频都带主题背景、无音轨；它们不等于透明视频。透明图片位于 `logos/` 和相应源图目录。猫耳 9 沿用已有 PNG 轮廓，本包不把栅格派生描述为新制作的 SVG 母版或 3D 模型。

## 动画中实际发生了什么

奶喵是唯一独立表演的角色。其动作依次包含注意星光、倾头、探爪、双爪捧合、闭眼微笑、打开双爪与放飞，星光单独合成并按实际爪位安排路径。前景云岸提供足部承托，星光完成移动后，画面回到安静的相伴构图。

**角色动作计数：1 条新动作、8 个关键姿态、0 条旧角色动作复用。** 动作 ID 为 `naimiao-star-greeting`。最终选用源图、裁框、锚点和时序分别记录在 `source/cats/generation.json`、准备报告和 `runtime-assets.json`，不以文件数量推算姿态数量。

动作原画最终采用四张横排双姿态图：`hires-01.png`、`hires-23.png`、`hires-45.png`、`hires-67.png`，每张实际为 **1774 × 887 RGBA**。它们依次提供姿态 0–1、2–3、4–5、6–7，用于改善大画面中的毛发、眼睛与爪部细节，不计为四条新动作。四张原画的 SHA-256 见 [美术与来源说明](docs/ART_DIRECTION.md) 及 `source/cats/generation.json`；初版小格源表和未选候选保留为制作过程参考。

冻结后的输出为 **8 张 1024 × 1024 分帧**，以及 **4096 × 2048、4 列 × 2 行图集**。各帧采用等比尺度归一与座位／地面配准，锚点为 `(0.5, 0.875)`，没有非等比拉伸或姿态之间的双影混合。具体裁框、来源与边距见 `reports/action-preparation.json`。

`runtime-assets.json` 为这条独立动作记录的帧时长依次是 `260 / 240 / 280 / 320 / 300 / 260 / 320 / 420 ms`，合计 **2400 ms**，默认不循环。**16 秒是宣传片的完整编排时长**，包含动作姿态的保持、独立星光轨迹和安静的品牌展示段；它不是另一条 16 秒的新绘制动作。需要直接复用角色动画时读取运行目录的 2400 ms 时序，需要复现宣传片时运行影片渲染工具。

橘猫与蓝灰猫绘制在舞台中，是静态伙伴。它们的视线帮助形成相伴关系，但本版没有为它们制作独立眨眼、跑动、伸爪或转头帧。主题、镜像、不同输出格式、重复播放、星光轨迹和场景移动都不计新增角色动作。

30 fps 成品包含关键姿态保持与图形运动，不代表每秒新绘制 30 张猫咪原画。动画 WebP 可能合并相同画面，实际页数与每页时长应读取媒体报告。方形品牌图使用完整静态概念原画，不作为影片每一帧的截图。

## 深浅主题与文字

深色主题使用深墨蓝紫，浅色主题使用暖奶油与淡粉。奶喵和伙伴使用相同原画，角色毛色不因主题变化而改变。主角保留奶油白毛、宽圆脸、灰棕色眼睛、樱花粉围巾和金色四角星扣。

`mew` 由 Nunito 真实字体排版，「九喵」和标语由 Noto Sans SC 排版；生图工具不负责生成文字。本版标语为「小小星域，自在相伴。」。字体来源与许可见 `fonts/`，最终布局见 `reports/layout.json`。

## 本地预览

完整解压后，在包根目录运行：

```sh
python3 -m http.server 8000
```

浏览器打开 `http://127.0.0.1:8000/web/`。演示页支持星夜／晨光主题、静态封面、播放、暂停、重播、进度拖动与全屏。

分文件 ES Module 页面需要 HTTP 服务，不能直接双击 `web/index.html` 代替部署。MP4、WebM、PNG 与 WebP 可以使用支持相应格式的播放器或浏览器直接打开。正常提供此静态网页不需要 Node、Playwright 或构建服务。

## 接入官网：先显示静态封面

把 `web/`、`exports/`、`posters/` 放在同源静态目录中并保留相对结构，例如 `/assets/9mew-brand-v3/`。独立演示另需 `fonts/9mew-ui.woff`；组件本身使用宿主字体。

```html
<link rel="stylesheet" href="/assets/9mew-brand-v3/web/brand-film.css">
<div id="brand-film"></div>

<script type="module">
  import { createBrandFilm } from
    '/assets/9mew-brand-v3/web/brand-film.js';

  const film = createBrandFilm(document.querySelector('#brand-film'), {
    theme: 'dark',
    assetBase: '/assets/9mew-brand-v3/',
    autoplay: false,
    loop: false,
  });

  // 可接入你的页面控件：
  // film.play();
  // film.pause();
  // film.replay();
  // film.showPoster();
  // film.setTheme('light');
  // 在 SPA 组件卸载时调用 film.destroy()。
</script>
```

默认显示静态封面，点击后才加载 MP4；默认播放一次并保留末帧。减少动态效果偏好会抑制自动播放，用户仍可明确选择播放。离屏或页面隐藏时暂停；手动暂停后，滚动回来或切回标签页不会自行恢复。

主片按 8:3 完整显示，使用 `object-fit: contain`。保持品牌文字、猫耳、尾巴和两侧伙伴完整，避免居中裁切。应用自己的主题开关时调用 `setTheme()`；组件卸载时调用 `destroy()` 清理监听、可见性观察器和视频状态。

### 使用 6 秒简洁标识

它与主片是不同构图，必须使用自己的 `brand-ident-*` 封面：

```js
const base = '/assets/9mew-brand-v3/';

const ident = createBrandFilm(document.querySelector('#brand-ident'), {
  theme: 'dark',
  autoplay: false,
  loop: true,
  duration: 6,
  media: {
    dark: {
      mp4: `${base}exports/brand-ident-dark.mp4`,
      poster: `${base}posters/brand-ident-dark.webp`,
    },
    light: {
      mp4: `${base}exports/brand-ident-light.mp4`,
      poster: `${base}posters/brand-ident-light.webp`,
    },
  },
});
```

先按前例导入组件、样式并准备容器。不要将含猫咪星园的 `brand-film-*` 封面混用于简洁标识。若已部署 WebM，可在各主题映射中增加真实的 `webm` 地址；未部署的格式不要留下假路径。

详细 API、路径解析、状态事件与类型声明见 [web/README.md](web/README.md)。组件不调用模型、成长或支付接口，也不发起遥测与第三方请求；动画播放状态不是后端业务事件。

## 源文件与用途

| 路径 | 内容 |
|---|---|
| `exports/` | 两个片长 × 深浅主题 × MP4／WebM／动画 WebP |
| `posters/` | 主片封面、独立标识封面与正方形品牌图 |
| `logos/` | 透明简洁字标、中英组合与猫耳 9 图标 |
| `source/scene/` | 完整概念原画、舞台编辑图、提示词和来源记录 |
| `source/cats/` | 奶喵动作源图、候选、修正提示词与最终选用记录 |
| `source/brand/` | 原有猫耳 9 栅格母图 |
| `frames/`、`sprites/` | 实际角色分帧与图集 |
| `runtime-assets.json` | 动作 ID、帧路径、锚点、时序和来源计数 |
| `refs/naimiao-master.png` | 奶喵身份权威参考 |
| `tools/` | 素材准备、渲染、媒体验证和打包工具 |
| `web/` | 原生播放器、类型声明、演示与浏览器检查 |
| `fonts/` | 本地字体、来源与许可 |
| `docs/ART_DIRECTION.md` | 美术决定、源图依据与观察范围 |
| `BRAND_FILM_PROMPT.txt` | 本场景 v3 的完整创作、接入与交付提示词 |

原画由受支持的生图能力生成，代码负责机械裁切、配准、真实姿态换帧、文字排版、光效轨迹与编码。没有用整幅图片浮动冒充独立猫咪动作，也没有将多次生成尝试或未选候选计为更多表演。

## 重建环境与命令

制作与检查环境使用 Node.js 24、Python 3、FFmpeg／FFprobe。FFmpeg 需要支持 `libx264`、`libvpx-vp9` 和 `libwebp_anim`。Node 依赖固定为 `sharp 0.35.5`、`@napi-rs/canvas 0.1.100`，浏览器检查使用 `playwright 1.62.1` 及 Chromium；以包内 `package.json` 为安装依据。

```sh
npm install
npx playwright install chromium
npm run prepare:assets
npm run render
npm run check:media
npm run check:web
npm run package
```

以上五项均为包内 `package.json` 已配置的正式脚本：`prepare:assets` 从包内已选源图准备动作；`render` 输出主题媒体与静态素材；`check:media` 检查实际文件；`check:web` 对真实素材运行 Chromium 检查；`package` 生成 ZIP 与校验清单。上述流程读取已经生成的原画，不自行调用生图服务。若修改图片、时序、排版、字体或编码，应重新运行相关检查、更新清单并发布新版本。

浏览器检查支持通过 `PET_BROWSER_EXECUTABLE` 指定已经安装的 Chromium。共享运行环境依赖可由 `CODEX_PRIMARY_RUNTIME_NODE_MODULES` 提供；普通使用者可直接安装 `package.json` 中的依赖。

## 验证范围与版本状态

素材生成、编码完成、技术检查、静态审图、连续动作观察和用户艺术批准分别记录。v2 的检查结果不能充当 v3 通过证据。

| 证据入口 | 解释 |
|---|---|
| `source/scene/generation.json` | 场景与舞台真实来源、生成提示词、参考与哈希 |
| `source/cats/generation.json` | 动作源、候选修正和最终选用情况 |
| `reports/action-preparation.json` | 四张选用原画、8 张 1024² 分帧、图集、透明边距与配准的实际记录 |
| `reports/final-art-review.json` | 最终高清封面及 2.7／3.9／4.6／5.1／5.8 秒合成静帧的有限审阅，逐文件绑定 SHA-256 |
| `reports/layout.json` | 实际排版、主角与舞台的位置、源文件绑定 |
| `reports/render-run.json` | 实际完成哪些编码；渲染完成不等于解码通过 |
| `reports/media-validation.json` | 实际全文件解码、规格、时长、摘要和首末帧差异 |
| `web/browser-validation.json` | 实际浏览器执行后的交互、资源、主题和回退检查 |
| `CHECKSUMS.sha256` | 包内文件校验；发布附件另有总校验清单 |

已实际查看的最终六张高清合成静图中，主角细节与伙伴协调，脚底支撑明确，星光与抬爪、捧爪及放飞位置对应，未发现遮眼或明显裁断。该结论仅覆盖报告中记录的静图，不能代替完整影片的连续动作观察、媒体解码、浏览器检查或用户艺术批准。

以报告的实际状态与被检查文件哈希为准。缺少报告或报告尚未执行时，不推断该项已通过。手机检查若使用浏览器视口模拟，应与实体 iPhone／Android 检查区分；模拟隐藏标签页事件也与真实滚动离屏分开记载。

源文件与下载附件继续同步至用户指定的 `zhangshuaibo1/resources`，采用独立 v3 目录和 Release 保留旧版本。上传后的公开下载、摘要和实际解压记录在对应 Release 目录登记。**本包不代表已部署生产官网，也不代表接入了 AI 问答、宠物成长或真实消费功能。**
