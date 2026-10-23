# 九喵《星环里的家》 · 网页接入 v3

本版以猫咪在星域中的自然互动为主视觉，不要求猫咪拼成字母。品牌文字和樱花粉标识独立排版。

原生播放器没有框架或运行时依赖。把本目录与包内 `exports/`、`posters/` 放在同源静态资源目录中，保持相对目录结构。演示页面另需 `fonts/9mew-ui.woff`；组件本身使用宿主字体。

## 本地预览

在完整包根目录运行 `python3 -m http.server 8000`，浏览器打开 `http://127.0.0.1:8000/web/`。分文件 ES Module 演示需要 HTTP 服务，不能直接双击 HTML 替代部署。

页面提供星夜/晨光主题、静态封面、播放、暂停、重播、进度拖动和全屏。初始只读取静态封面与字体；MP4 在请求播放时才加载。动画 WebP 适合独立下载，演示不把它们作为页面初始资源。

## 最小接入

```html
<link rel="stylesheet" href="/assets/9mew-brand-v3/web/brand-film.css">
<div id="brand-film"></div>
<script type="module">
  import { createBrandFilm } from '/assets/9mew-brand-v3/web/brand-film.js';
  const film = createBrandFilm(document.querySelector('#brand-film'), {
    theme: 'dark',
    assetBase: '/assets/9mew-brand-v3/',
    autoplay: false,
    loop: false,
  });
  // 在 SPA 组件卸载阶段调用 film.destroy()。
</script>
```

`assetBase` 相对值以 `brand-film.js` 地址为基准，绝对路径以当前网站为基准。默认 `../` 对应本包根目录。

## 真实素材路径

| 主题 | MP4 | 封面 |
|---|---|---|
| `dark` | `exports/brand-film-dark.mp4` | `posters/brand-film-dark.webp` |
| `light` | `exports/brand-film-light.mp4` | `posters/brand-film-light.webp` |

默认使用 MP4，且不猜测 WebM 是否存在。如自托管了完整 WebM 文件，可显式传入媒体映射：

```js
const film = createBrandFilm(container, {
  media: {
    dark: {mp4: '/media/dark.mp4', poster: '/media/dark.webp'},
    light: {mp4: '/media/light.mp4', poster: '/media/light.webp'},
  },
});
```

每个主题可额外提供 `webm` 字段；浏览器支持 WebM 时优先使用该显式地址。该路径的可用性由接入方确认。若视频加载失败，保留静态封面。

## 6 秒简洁标识循环

主宣传片与简洁标识是不同画面。6 秒标识使用独立的猫耳 9＋mew 字标与轻星光，不含猫咪场景；请为它指定对应的独立封面，使静态首屏与实际影片一致。

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

先按上例导入 `createBrandFilm`、样式并准备容器。使用标识循环时，不要把 `brand-film-*.webp` 宣传片封面混用为其首屏。若另行部署 WebM，可以在两个主题映射中分别添加真实的 `exports/brand-ident-dark.webm` 与 `exports/brand-ident-light.webm` 地址。

## 控制与行为

| API / 选项 | 行为 |
|---|---|
| `play()` / `pause()` | 显式开始或续播 / 手动暂停 |
| `replay()` | 从零秒重新播放 |
| `showPoster()` | 停止自动续播，显示本主题静态封面 |
| `setTheme('dark'/'light')` | 切换主题；保留时间点和播放意图；暂停状态只加载新封面 |
| `seek(seconds)` | 设置时间点；未加载视频时先记住，播放时应用 |
| `inspect()` | 读取实际播放、暂停、主题、可见性、时间与错误状态 |
| `destroy()` | 释放视频、移除组件并清理监听及可见性观察器 |
| `autoplay: false` | 默认静态，用户点击后才加载影片 |
| `loop: false` | 默认播放一次后保留末帧；显式 `true` 才循环 |
| `controls: false` | 隐藏底部控件；须由宿主提供可访问的播放/暂停控制 |

初始视频为 `muted`、`playsinline`、`preload="none"`。即使接入方设置了 `autoplay: true`，系统的减少动态效果偏好仍会抑制自动播放。主动点击播放可开始当前动画；系统偏好切换为减少动态效果时，会停回静态封面。

离屏和隐藏标签页暂停影片；仅在此前仍有播放意图时才恢复。**用户手动暂停后，不会因滚动回可见区或切回标签页而自动续播。** 更换主题也遵守这一原则。

画面按 8:3 完整显示，使用 `object-fit: contain`。手机上保留全部猫咪与标识，不进行居中裁切。组件不会在页面外创建悬浮层；全屏只由按钮触发。

`onStateChange(state)` 与容器上的 `9mew:filmstate` 自定义事件提供状态通知，不代表后端模型、宠物成长或其他业务事件。该组件不发起遥测和第三方网络请求。

## 文件与检查

- `brand-film.js` / `brand-film.css`：可复用组件。
- `brand-film.d.ts`：TypeScript 接口。
- `index.html` / `demo.js` / `demo.css`：独立演示。
- `package.json`：只声明 ES Module，无不存在的构建脚本。

已使用本版实际深浅 MP4 与封面，在 Chromium 中完成 15 组检查，记录见 [browser-validation.json](browser-validation.json)。检查包括主片首次视频请求时机、实际解码帧、播放／暂停／重播／结束、主题、滚动离屏、减少动态效果、手机完整构图、全屏、销毁与加载失败后的封面回退和重试。独立 6 秒标识也验证了正确封面、无提前视频请求、初始进度上限、真实播放与片尾循环，并实际切换浅色媒体。桌面深浅与手机截图在 `qa/`。
手机检查使用视口模拟，并非实体 iPhone / Android 设备测试。隐藏标签页逻辑使用明确标注的模拟 `visibilitychange` 事件；离屏逻辑使用真实浏览器滚动。技术通过不代表用户已批准艺术效果，也不代表已部署官网。

若要重新执行，准备 Node.js、Playwright 及已安装的 Chromium，然后在完整包根目录运行 `node web/check-browser.mjs`。脚本自行启动并关闭只监听本机的临时 HTTP 服务，读取真实素材，更新检查报告。可通过 `PET_BROWSER_EXECUTABLE` 指定现有 Chromium 可执行文件；运行环境的共享依赖也可通过 `CODEX_PRIMARY_RUNTIME_NODE_MODULES` 提供。本组件的正常网页播放不需要这些测试工具。
