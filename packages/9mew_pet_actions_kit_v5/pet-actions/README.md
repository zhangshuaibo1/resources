# 奶喵 2D 动作 · v5

当前可播放 **22 项**：20 组独立源动作，另加向左行走、向左小跑两组镜像。

## 直接查看

双击包根目录 `OPEN_ME.html`：素材已内嵌，可离线选动作、切主题、暂停和下载透明 WebP。
离线页循环展示单个动作；行走、小跑展示原地步态。官网组件在真实姿态帧上另加有限的水平移动，单次完成后回待机。

`previews/` 提供移动、情绪和日常三组 GIF / WebP 总览，以及静态动作索引。

## 内容

| 目录 / 文件 | 用途 |
|---|---|
| `catalog.json` | 真实动作、时序、单次/循环、方向、锚点、来源和外观版本 |
| `animations/*.webp` | 22 个 512×512 透明动画，适合页面与产品 |
| `animations/*-light.gif` | 22 个 320×320 浅底 GIF |
| `animations/*-dark.gif` | 22 个 320×320 深底 GIF |
| `frames/` | 20 组 512×512 无损 WebP 关键姿态、透明 poster；供播放器使用 |
| `sheets/` | 20 张生成源图，每张 4×2 八姿态；保留原始像素 |
| `generation-*.json` | 实际生成提示、参考、输出与淘汰原因 |
| `encoding-validation.json` | 编码/解码、帧数、时长、边界和文件哈希事实 |
| `locomotion-visual-review.json` | 移动及日常十动作的逐帧视觉复核与限制 |

### 动作分类

- 移动：向右/左散步、向右/左小跑、跳跃、伏身小扑。
- 情绪：开心、小生气、委屈、惊讶、兴奋庆祝、亲昵蹭蹭。
- 日常：眨眼、招爪、摆尾、倾听、舔爪洗脸、睡觉、伸懒腰、踩奶、哈欠、翻身露肚皮。

每个独立源动作生成八姿态；160 个源姿态中当前实际使用 158 个不同帧。`nuzzle` 两帧因躯干反向而排除，时间轴通过合理复用六个有效姿态组成八个时间节点。镜像与重复时间节点不计为新增源动作。

采用轻量关键帧动画，头部、眼睑、耳朵、前爪、躯干、后腿或尾巴确有变化。大幅翻滚、伸展仍可看出分帧节奏；走跑是风格化宠物步态。素材是待产品美术批准的 prototype，文件解码和浏览器通过不自动变成生产批准。

## 重新构建

需要 Node.js 20 或更新版本；本次执行环境为 Node 24.19.0、sharp 0.35.5、@napi-rs/canvas 0.1.100。依赖写入本目录 `package.json`。

在本目录运行：

```bash
npm install
node build-actions.cjs
node build-previews.cjs
node build-offline-preview.cjs
```

`build-actions.cjs` 只进行连通域定位、自适应切格、等比缩放、锚点对齐、时序编排和编码；不绘制或补画猫咪。跳跃的身体姿态来自源图，轨迹位移在组合阶段加入。`build-previews.cjs` 排版已生成帧；`build-offline-preview.cjs` 将实际 WebP 和静态帧内嵌为离线选择页。

字体位于 `fonts/`，附 Noto OFL 许可。修改动作后重新运行包根的 `specs/validate_delivery.py` 和 `integration/check-actions-runtime.cjs`；旧报告只证明其绑定哈希对应的那一版。

## 官网接入

使用 `integration/PetActionPlayer.tsx`，传受控的 `catalogUrl`、`expectedAppearanceVersion="0.4.0"` 和动作 ID。实际事件触发视觉动作，不由动画代替真实任务、问答、成长、费用或权限结算。姿态文件由受控注册表按需加载；减少动态、隐藏、离屏、暂停及出错回退由播放器处理。

通常将眨眼和摆尾用于温和待机；招爪用于用户主动打开宠物；倾听用于实际进入聆听流程的视觉提示；开心或庆祝只映射已确认成功的事件；走跑、跳跃、翻身由明确互动触发。按用户偏好限制频率，避免强动作不断打断阅读。
