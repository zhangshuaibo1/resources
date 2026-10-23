# 九喵 2D 宠物动作包 · v5

本包把选定的奶油白奶喵用于真实二维姿态与表情动画，并提供官网播放器、透明帧、源图表和独立动图。完整开发提示词在根目录 [9mew_task_prompt_v5.txt](9mew_task_prompt_v5.txt)，可直接双击根目录 [OPEN_ME.html](OPEN_ME.html) 查看全部 22 个动作；页面内嵌素材，可离线使用。工程接入从 [START_HERE.txt](START_HERE.txt) 开始。

## 立即预览

在包根目录运行：

```bash
python3 integration/serve.py
```

打开 `http://127.0.0.1:8989/integration/actions-demo.html` 选择实际动作，或打开 `/integration/website-pet-demo.html` 查看官网宠物面板。独立动画位于 `pet-actions/animations/`。

## 素材与接入

| 入口 | 内容 |
|---|---|
| [实际动作状态](docs/asset-status-v5.md) | 当前动作、独立源动作与镜像数量、原语义规划映射 |
| [动作制作与接入](docs/action-production-guide.md) | 生图源姿态、切图/编码、播放器参数和外貌进化兼容 |
| [动作目录](pet-actions/catalog.json) | 可播放帧序列、时长、循环/单次、来源和导出文件 |
| [素材注册表](assets_manifest.json) | 稳定资产 ID、版本、实际文件和候选状态 |
| [播放器说明](integration/ACTIONS_README.txt) | React 接口、构建和当前组件行为 |
| [Skill 接入](SKILL_INTEGRATION.txt) | Codex 与其他 Agent 复用九喵星绘 |

透明 WebP 和帧适合产品运行；GIF 有浅/深背景版本，便于兼容预览。八个关键姿态、重复的步态周期、不同格式和镜像方向分别计数，不把重复帧或标签当作新的独立画稿。实际完成数量以动作目录和状态表为准。

## 核验

```bash
python3 specs/assemble_manifest.py
python3 specs/validate_delivery.py
```

验收入口会读取本轮 `pet-actions/encoding-validation.json` 与 `integration/actions-runtime-validation.json`，核对对应目录和文件哈希，并运行动作帧检查器。旧 `motion-2d/` 和 `planar-validation.json` 保留为装饰样板的历史证据，不能证明新动作通过。

原画、源姿态、动作时间轴、编码导出、浏览器表现和生产批准是不同证据。当前新动作与外貌版本 **0.4.0** 均为候选；本地预览没有连接真实问答、语音、成长或资金业务。静态回退保障页面可用，缺失动作仍需继续制作。

## 品牌与后续

保留九喵 / 9mew、奶喵、喵灵、樱花粉，以及修仙、神话、幻想和宇宙星域方向。模型四档仍为喵学徒、喵大师、喵真人、喵仙帝。3D 在可靠能力就绪后另作升级；当前交付与接入以 2D 为准。
