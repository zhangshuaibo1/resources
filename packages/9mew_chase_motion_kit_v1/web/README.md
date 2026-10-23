# 九喵追逐动画 · 网页接入

`chase-scene.js` 是无框架依赖的 Canvas 2D 播放器。读取本包真实动作图集，将逐帧角色动作与平滑屏幕路线组合。鼠标和触屏事件会穿过动画浮层。

## 最小接入

把整个包放到网站静态资源目录，例如 `/assets/9mew-chase-v1/`，保留相对目录结构。

```html
<script type="module">
  import { create9mewChase } from '/assets/9mew-chase-v1/web/chase-scene.js';

  const scene = create9mewChase({
    catalogUrl: '/assets/9mew-chase-v1/catalog.json',
    catSize: 160,
    margin: 32,
    autoplay: true,
    repeat: 1,
  });

  // 应用页面卸载时调用 scene.destroy()。
</script>
```

默认不自动播放。示例中的 `autoplay: true` 播放一次，27 秒后回到右下角。用户启用了系统“减少动态效果”时，自动播放会被抑制并展示原始静态形象；明确点击播放并调用 `scene.play()` 才开始动作。无限循环必须显式设置 `repeat: Infinity`。

可把按钮绑定到 `play()`、`pause()`、`replay()`、`stop()`。`ready` 是返回布尔值的 Promise；资源失败时为 `false`，并通过 `onError` 回调说明失败。`destroy()` 取消动画帧、监听器、观察器和未完成资源请求，并移除浮层。

## 局部容器、尺寸与速度

省略 `container` 时使用固定定位的整个视口。传入已有的 `HTMLElement` 时，容器应具有 `position: relative` 和明确宽高；画面被绘制在该容器内。

```js
const scene = create9mewChase({
  container: document.querySelector('.pet-scene'),
  catalogUrl: '/assets/9mew-chase-v1/catalog.json',
  autoplay: false,
  speed: 1,
  catSize: 160,
  margin: 32,
  onError: error => console.warn(error.code),
});

await scene.ready;
scene.play();
scene.setSpeed(1.5); // 0.5 至 2
scene.setCatSize(180); // 请求值为 64 至 240 CSS px；窄屏会自动收小
```

角色保持 32 CSS px 的默认安全边距。`catSize` 为透明帧画布的展示边长，实际毛发范围小于画布。画布最大设备像素比为 2；移动端会按容器宽高自动缩小。路线使用归一化坐标，调整窗口尺寸不需要刷新。页面隐藏、局部容器离屏时停止计时，恢复可见后从当前进度继续。

## 路线与实际动作

| 时间 | 情节 | 猫咪状态 |
|---|---|---|
| 0–1.1 秒 | 右下角发现老鼠 | 等待 |
| 1.1–6.2 秒 | 右下追鼠到左下 | 真正的奔跑逐帧动作 |
| 6.2–7.4 秒 | 老鼠离开，抬头看蝴蝶 | 抬头、准备起跳 |
| 7.4–12.6 秒 | 从左下向上追逐 | 起跳、幻想腾跃 |
| 12.6–18.2 秒 | 掠过上方到右上 | 伸爪、摆尾、追蝶 |
| 18.2–23.2 秒 | 沿右侧轻轻下降 | 空中追逐 |
| 23.2–24.4 秒 | 回到右下 | 落地 |
| 24.4–27 秒 | 稍作休息 | 陪伴待机 |

猫咪空中追逐属于九喵幻想设定，画面中不会把整只猫旋转成沿墙行走。身体动作来自原始关键帧；路径位置由时间曲线计算。没有通过淡入淡出叠猫来补帧。

## 预览与单文件版

- `index.html`：完整交互演示；提供浅色/深色、暂停、重播、速度、大小与全视口切换。
- `node web/build-offline.mjs --out OPEN_ME.html`：在包根目录运行，把真实图集、CSS、代码全部嵌入一个 HTML。这个文件可双击离线打开，不会请求外部资源。
- 普通分文件版需通过本地 HTTP 服务打开，例如在包根目录运行 `python3 -m http.server 9077`，访问 `http://127.0.0.1:9077/web/`。
- `ChasePet.tsx`：可选 React 适配组件，项目自行提供 React；不会增加第二套动画运行时。组件卸载会清理实例。

React 适配器已使用既有依赖完成严格 TypeScript 检查，以及真实 Chromium 中的 StrictMode 挂载、暂停、卸载和再次挂载检查。版本与证据见 `react-validation.json`。可用已有 `node_modules` 重跑 `check-react.mjs`，不需要把测试用 React bundle 打进素材包。

## 图集契约

`catalog.json` 的 `actions` 是动作对象，每项含 `sprite`、`columns`、`rows`、`frameWidth`、`frameHeight`、`frameCount`、`durationsMs`、`anchor` 和 `loop`。路径相对于目录文件。`poster` 是资源失效与减少动态效果时使用的原始静态图。

需要八个运行状态：`chase-run`、`chase-look-up`、`chase-leap`、`chase-float`、`chase-land`、`rest`、`mouse-run`、`butterfly-flutter`。运行状态数量不等于独立新绘动作数量，具体来源和派生关系见包内制作清单。

播放器会核对图集像素尺寸与目录契约。所有图片加载并解码后才播放，播放过程中不再请求每一帧。单个动作图集失败会停用追逐并显示原始静态形象；不会用未完成动作假装成功。

## 导出同一条时间线

```js
import { sampleChase } from './web/chase-scene.js';
const sample = sampleChase(12000, 1440, 900, { catalog, catSize: 160, margin: 32 });
```

返回 `cat`、`mouse`、`butterfly` 的锚点像素位置、帧索引、动作、镜像和透明度，及场景阶段。`x/y` 是锚点位置；绘制左上角为 `x - width × anchorX`、`y - height × anchorY`。镜像图像时需同时镜像锚点，默认横向锚点为 0.5。时间输入为场景毫秒，录制工具应先自行应用倍速。预览视频与网页可以共用此采样器。

## 验证范围

本组件提供本地 UI、资源加载、动作播放与路线编排。没有发起模型调用、宠物成长事件、支付、数据上报或生产发布。实际检查结果见 `runtime-validation.json`；技术验证不代替最终视觉验收。
