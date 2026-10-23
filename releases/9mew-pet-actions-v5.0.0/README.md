# 九喵 2D 宠物动作包 v5

本版延续已选定的奶喵 2D 形象，提供可播放动画、离线预览、官网接入源码、完整任务提示词与可移植 Skill。3D 升级继续延期，当前优先保证 2D 形象与动作质量。

## 内容

- **22 个可播放动作**：20 个独立设计动作，加左向行走、左向奔跑 2 个镜像方向。
- **66 个动画文件**：22 个透明背景 WebP、22 个浅色背景 GIF、22 个深色背景 GIF。
- 移动与跳跃：行走、奔跑、跳跃、扑跃；情绪：开心、生气、难过、惊讶、兴奋、撒娇；日常：眨眼、招手、摇尾、倾听、舔毛、睡眠、伸懒腰、踩奶、打哈欠、翻滚。
- 原始姿态图、分帧、动作目录、播放器、验证报告、完整任务提示词 v5，以及 `9mew-visual-forge` Skill 0.3.0。交付包版本与 Skill 语义版本分别维护。

## 下载

| 文件 | 用途 |
|---|---|
| [9mew_pet_actions_kit_v5.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_actions_kit_v5.zip) | 完整包，含 483 个文件、源码、素材、提示词和 Skill |
| [9mew_pet_motion_downloads_v5.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_motion_downloads_v5.zip) | 动画下载包，含离线预览与完整提示词 |
| [9mew_pet_actions_preview_v5.html](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_actions_preview_v5.html) | 下载后用浏览器打开，离线查看全部动作 |
| [9mew_task_prompt_v5.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_task_prompt_v5.txt) | 完整任务提示词 v5 |
| [9mew_movement_preview_v5.gif](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_movement_preview_v5.gif) | 移动动作预览 |
| [9mew_emotions_preview_v5.gif](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_emotions_preview_v5.gif) | 情绪动作预览 |
| [9mew_daily_preview_v5.gif](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_daily_preview_v5.gif) | 日常动作预览 |
| [9mew_pet_actions_v5_SHA256SUMS.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_actions_v5_SHA256SUMS.txt) | 发布附件 SHA-256 校验值 |

[查看本版完整源码与素材](https://github.com/zhangshuaibo1/resources/tree/9mew-pet-actions-v5.0.0/packages/9mew_pet_actions_kit_v5)。解压完整包后先阅读 `START_HERE.txt`，双击 `OPEN_ME.html` 查看动作。

## 验证与使用边界

两个 ZIP 已通过 CRC 校验；完整包的 482 项载荷哈希全部匹配，483 个文件与原始交付目录一致。动画已完成真实解码与几何检查；播放器已检查暂停、减少动态效果、不可见时停止计时、资源失效回退，以及浅色、深色与移动布局。

本版是**轻量关键帧动画和视觉原型**，尚未取得用户最终视觉验收。翻滚、伸展等幅度较大的动作可能有关键帧切换感；当前不承诺骨骼动画或 60 fps 连续补间。镜像方向复用原动作，不能计为新的独立动作设计。预览中的走跑主要展示原地步态，官网组件另提供有限距离移动。

演示展示形象与交互，不代表真实后端问答、宠物成长、支付或业务系统已完成接入。Skill 为可移植文件交付，不代表已经安装到使用者的 Agent 环境。包内标记为计划中的其他视觉资产仍为待实现项。

完整包 SHA-256：`2a8beb6f048bf5946741305d57b079e61d5371cc4c9d2beea48b8c60b2096b43`。

动画下载包 SHA-256：`abc510bcac9b05b7fc770596d2dfbc70305aca9ade31e2c93fa411af70e970c2`。
