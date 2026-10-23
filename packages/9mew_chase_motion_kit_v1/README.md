# 九喵 · 追鼠与追蝶网页动画 v1

奶喵从屏幕右下角出发，追着小老鼠跑到左下角；发现蝴蝶后抬头、蓄力，沿左侧向上跃起，再追随蝴蝶掠过屏幕上方到右上角，最后沿右侧回到右下角，轻轻落地休息。

本包沿用选定的奶喵 2D 形象：奶油白绒毛、灰棕色大眼睛、樱花粉围巾与金色四角星扣。升空段采用九喵宇宙的幻想追逐方式，身体保持自然朝向，前爪伸探、尾巴跟随。素材包含真实的姿态变化，网页播放器负责平滑移动位置；位置插值不等于新增绘制帧。

## 先看效果

完整解压后，直接用浏览器打开根目录 `OPEN_ME.html`，可以离线查看完整路线、切换深浅背景、暂停和重播。独立预览文件 `9mew_chase_preview_v1.html` 也可下载后直接打开。

`exports/route-light.mp4`、`exports/route-dark.mp4` 以及对应的 GIF 用于快速预览或展示。真正嵌入网页时使用 `web/chase-scene.js` 和透明精灵图，角色可以适应当前窗口大小，页面内容可以正常点击。

- [本版 GitHub Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-chase-motion-v1.0.0)
- [完整素材与源码包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_motion_kit_v1.zip)
- [网页接入包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_web_v1.zip)
- [独立离线预览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_preview_v1.html)
- [本场景完整提示词](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_scene_prompt_v1.txt)
- [发布附件 SHA-256](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_v1_SHA256SUMS.txt)

## 动作与路线

默认完整路线为 27 秒，播放一次后停留在右下角。`speed` 会改变实际播放时长。

| 时间 | 场景行为 |
|---|---|
| 0–1.1 秒 | 奶喵在右下角准备，小老鼠出现 |
| 1.1–6.2 秒 | 老鼠在前，奶喵向左奔跑，到达左下角 |
| 6.2–7.4 秒 | 老鼠离开，奶喵发现蝴蝶并抬头观察 |
| 7.4–12.6 秒 | 猫咪蓄力跃起，跟着蝴蝶沿左侧向上 |
| 12.6–18.2 秒 | 蝴蝶在前方振翅，奶喵从左上追到右上 |
| 18.2–23.2 秒 | 沿右侧弧线下降，回到右下角 |
| 23.2–27 秒 | 收爪落地、坐好并休息 |

| 动作 ID | 角色与用途 | 来源 |
|---|---|---|
| `chase-run` | 奶喵奔跑追鼠 | 新绘制 8 帧 |
| `chase-look-up` | 停步、抬头看蝴蝶 | 新绘制 8 帧 |
| `chase-leap` | 蓄力、蹬地、跃起 | 新绘制 8 帧 |
| `chase-float` | 伸爪追蝶、空中跟随 | 新绘制 8 帧 |
| `chase-land` | 收爪、缓冲落地、坐好 | 新绘制 8 帧 |
| `mouse-run` | 小老鼠轻快奔跑 | 新绘制 8 帧 |
| `butterfly-flutter` | 蝴蝶开合翅膀 | 新绘制 8 帧 |
| `rest` | 落地后的停留姿态 | 复用落地序列，不新增原画 |

合计 **7 个新原始序列、56 个原始姿态，以及 1 个派生休息状态**。向左运动通过镜像复用向右图像，不计为新的独立动作。8 个可用状态分别提供透明动画 WebP、浅色 GIF、深色 GIF，共 24 份单独动画导出；深浅主题复用相同角色原画。

## 网页接入

把 `web/`、`catalog.json`、`sprites/`、`refs/` 和 `fonts/` 按原目录关系放在可访问的同源静态资源目录中；使用网页接入 ZIP 可以保留所需结构。ES Module 示例：

```html
<button id="pause-chase" type="button">暂停猫咪</button>
<button id="replay-chase" type="button">再玩一次</button>

<script type="module">
  import { create9mewChase } from './web/chase-scene.js';

  const scene = create9mewChase({
    catalogUrl: './catalog.json',
    catSize: 160,
    margin: 32,
    autoplay: true,
    repeat: 1,
    speed: 1,
  });

  await scene.ready;
  document.querySelector('#pause-chase').addEventListener('click', () => scene.pause());
  document.querySelector('#replay-chase').addEventListener('click', () => scene.replay());

  // 在单页应用的组件卸载阶段调用 scene.destroy()，释放事件与动画资源。
</script>
```

不传 `container` 时，动画覆盖整个视口，画布使用 `pointer-events: none`，不会拦截正文和按钮。希望仅在某个版面播放时，可传入已定位的 HTMLElement：`container: document.querySelector('#pet-stage')`，并为该容器设置明确的宽高和 `position: relative`。

未设置 `autoplay` 时，播放器保持静止，调用 `scene.play()` 才开始。`autoplay: true` 仍遵循系统的“减少动态效果”偏好；用户主动点击播放或重播可显式开始本次动画。默认只播放一次；需要有限多次时设置 `repeat: 2` 等整数，持续循环必须显式设置 `repeat: Infinity`。

| API | 用途 |
|---|---|
| `scene.ready` | 等待目录与图片加载 |
| `play()` / `pause()` | 播放、续播 / 暂停 |
| `replay()` / `stop()` | 从头重播 / 停止并回到起点 |
| `setSpeed(0.5 … 2)` | 调整播放速度 |
| `setCatSize(64 … 240)` | 调整期望角色尺寸，实际尺寸随可用空间收缩 |
| `seek(timeMs)` | 跳转到路线中的某个时间点 |
| `inspect()` | 读取当前阶段、时间及播放状态 |
| `destroy()` | 移除画布，清理监听与动画循环 |

播放器会在页面隐藏或受限容器离屏时暂停调度；缺失或无效资源使用原始奶喵静态图回退。路线和角色保持安全边距，窗口大小改变后重新计算布局。实际浏览器验证结果见交付中的报告。

若要运行可编辑演示，可在本包根目录执行 `python3 -m http.server 8000`，然后访问 `http://127.0.0.1:8000/web/`。`web/index.html` 使用模块与目录请求，需要 HTTP 服务；直接双击预览请使用根目录的 `OPEN_ME.html`。

## 文件结构

- `source/cat/`、`source/companions/`：原始 PNG 动作图；标注 `candidate` 的被替代候选保留作溯源，活动目录不引用它们。
- `frames/`：透明 WebP 分帧，猫咪 512 × 512，老鼠和蝴蝶 256 × 256。
- `sprites/`：对齐后的 WebP 精灵图集，网页播放器按目录中的帧尺寸、锚点与时长读取。
- `animations/`：24 份可单独取用的透明 WebP / 浅色 GIF / 深色 GIF。
- `posters/`、`refs/`：状态预览与未经替换的奶喵参考、静态回退图。
- `web/`：无框架依赖的播放器、演示与相关接入文件。
- `fonts/`：离线中文字形子集及 SIL Open Font License；网页不请求外部字体。
- `tools/`：机械裁切、对齐与编码工具；新角色原画仍由生图工具创作。
- `catalog.json`：动作、帧、锚点、时长及素材路径的实际契约。
- `generation-*.json`：真实提示词、参考文件哈希、选用与替代记录；未暴露的模型或成本信息保持未知。
- `reports/`：编码、几何及视觉检查记录；运行时验证记录随 `web/` 交付。
- `CHASE_SCENE_PROMPT.txt`：本场景可交给 Codex 或其他 Agent 继续创作、实现和交付的完整提示词。

## 状态与版本

这是 **2D 关键帧动画候选**，视觉效果仍需结合实际网页尺寸验收。图像有真实肢体及翅膀变化，较大的姿态转换仍可能显示关键帧切换感；当前不承诺骨骼动画或 60 fps 全新原画。3D 延期，本次不提供 3D 模型。

本场景独立版本为 `9mew-chase-motion-v1.0.0`；此前完整业务提示词仍为 v5，本次未改写该业务基线。本包专用提示词为 `CHASE_SCENE_PROMPT.txt`，其发布附件名为 `9mew_chase_scene_prompt_v1.txt`。技术检查、视觉候选和用户最终批准分别记录；只能把已实际执行的检查标为通过。

后续九喵交付继续同步至 `zhangshuaibo1/resources`，保存可维护源文件、完整提示词、下载附件、说明与校验值，并返回已核验的 GitHub 链接。上传授权不包含生产部署或真实付费调用。

## 重新导出

网页运行时不需要安装 Node 依赖。重新裁切、编码或生成预览时，使用 Node.js 20 或更新版本安装本包 package.json 中固定版本的依赖，并准备 ffmpeg / ffprobe。

```sh
npm install
npm run build:assets
npm run build:previews
npm run build:offline
python3 tools/package-kit.py --out ../downloads
```

重新生成文件后应更新并重新执行相应验证，再创建新版本；原画创作使用 `generation-*.json` 与 `CHASE_SCENE_PROMPT.txt` 中的实际提示词。
