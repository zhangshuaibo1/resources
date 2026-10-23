# 九喵 / 9mew Resources

九喵品牌、猫咪头像与动画资源库。

## 九喵 · 追鼠与追蝶网页动画 v1

[打开本版 Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-chase-motion-v1.0.0) · [查看源码与素材](https://github.com/zhangshuaibo1/resources/tree/9mew-chase-motion-v1.0.0/packages/9mew_chase_motion_kit_v1)

**27 秒完整追逐路线**：右下追鼠 → 左下发现蝴蝶 → 沿左侧跃到上方 → 追到右上 → 沿右侧回到右下，落地休息。奶喵、老鼠与蝴蝶使用真实姿态帧，网页播放器以连续位置插值完成路线移动。

本版含 **7 个原始序列、56 个原始姿态，以及复用落地尾段的 `rest` 状态**；镜像方向不增加原始动作数。提供 **24 份单独动作导出**、深浅整场 MP4/GIF/WebP、离线 HTML、透明精灵图与可嵌入网页的播放器。

| 下载 | 用途 |
|---|---|
| [完整素材与源码包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_motion_kit_v1.zip) | 原画、分帧、动画、源码、提示词和说明；解压后打开 `OPEN_ME.html` |
| [网页接入包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_web_v1.zip) | 播放器与运行所需资源 |
| [单文件离线预览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_preview_v1.html) | 下载后直接用浏览器打开 |
| [场景提示词 v1](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_scene_prompt_v1.txt) | 可供 Codex 和其他 Agent 继续创作、接入与交付 |

整场预览：**[浅色 MP4](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_light_v1.mp4)** · **[深色 MP4](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_dark_v1.mp4)** · [浅色 GIF](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_light_v1.gif) · [深色 GIF](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_dark_v1.gif) · [浅色 WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_light_v1.webp) · [深色 WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_dark_v1.webp)。

[静态总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_overview_v1.png) · [附件 SHA-256 校验清单](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_v1_SHA256SUMS.txt)

当前为 2D 关键帧动画候选与纯前端演示，未部署官网；不承诺骨骼动画或每秒 60 张新原画。既有完整业务提示词 v5 保持不变。本地技术检查已完成，公开下载验收以发布后的实际核验记录为准。

## 九喵 2D 宠物动作包 v5

[完整发布与下载](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-pet-actions-v5.0.0) · [本版源码与素材](https://github.com/zhangshuaibo1/resources/tree/9mew-pet-actions-v5.0.0/packages/9mew_pet_actions_kit_v5)

本版含 **20 个独立设计动作 + 2 个镜像方向，共 22 个可播放动作、66 个动画文件**，覆盖行走、奔跑、跳跃、扑跃、日常陪伴与六类情绪；同时提供浅色/深色 GIF、透明 WebP、离线预览、官网播放器、完整任务提示词 v5 与 `9mew-visual-forge` Skill 0.3.0。

- [下载完整包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_actions_kit_v5.zip)：解压后先读 `START_HERE.txt`，打开 `OPEN_ME.html`。
- [下载动画包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_motion_downloads_v5.zip)：适合直接取用动画与离线预览。
- [完整提示词 v5](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_task_prompt_v5.txt) · [独立离线预览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_actions_preview_v5.html) · [SHA-256 校验](https://github.com/zhangshuaibo1/resources/releases/download/9mew-pet-actions-v5.0.0/9mew_pet_actions_v5_SHA256SUMS.txt)。

当前交付为轻量关键帧动画与视觉原型，仍待用户最终视觉验收；大幅度动作可能有帧间切换感。3D 升级延期。演示不代表真实后端问答、成长或支付系统已接入，Skill 文件也不代表已在 Agent 环境安装。

后续九喵素材、代码、提示词与 Skill 更新以本仓库及版本化 Releases 为交付入口；每次发布提供源文件、下载附件、校验值与实际远端链接。

## 九喵宇宙 · 九条命的故事

### 《九喵：第九次，回家》

**它有九条命，却一直在寻找同一条温暖的尾巴。**

以“猫的九条命”为核心，讲述同一个灵魂在九颗星球上的九段完整人生。奶喵与团团经历相遇、错过、遗忘、回头与重新认出彼此。前八世各结束一次，共八次重生；第九世的结尾仍是两只成年猫继续共同生活。

**[下载完整故事包 · 163.00 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/9mew_nine_lives_story_complete.zip)** · [打开本版 Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-nine-lives-story-v1.0.0)

完整包共 **53 个文件**，包含 **13 张原始 PNG 故事原画、完整中文图文故事书、120 秒动态分镜、深浅底故事总览、设定与后续制作脚本、生成记录和重建工具**。故事书嵌入全部插画，单独下载 HTML 即可离线阅读。

| 内容 | 规格 | 下载 |
| --- | --- | --- |
| 离线图文故事书 | 中文九章、人物、设定、深浅阅读主题 | [story.html](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/story.html) |
| 无声动态分镜 · MP4 | 1600 × 900，120 秒，20 fps | [下载 MP4](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/nine-lives-animatic-1600.mp4) |
| 无声动态分镜 · WebP | 960 × 540，120 秒，单次播放 | [下载 WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/nine-lives-animatic-960.webp) |
| 九世故事总览 | 2004 × 1164 PNG | [深色底](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/nine-lives-overview-dark.png) · [浅色底](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/nine-lives-overview-light.png) |

**本版媒体为动态分镜（animatic）**：使用电影关键原画、镜头推进、交叉溶解、八次生命转场与开场重现。尚未制作连续的猫咪步态、眨眼、敲爪等完整角色表演；画面内无文字，文件无音轨。正式约三分钟角色动画的镜头与动作建议已写入包内制作脚本。深浅切换作用于故事书界面与总览底色，原画保留剧情需要的夜色和晨光。

![九世故事总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/nine-lives-overview-dark.png)

请选择附件 **`9mew_nine_lives_story_complete.zip`**。包采用标准 ZIP / DEFLATE，无加密、无分卷；已通过本地 CRC、完整解压与逐文件 SHA-256 核验。[下载附件校验清单](https://github.com/zhangshuaibo1/resources/releases/download/9mew-nine-lives-story-v1.0.0/9mew_nine_lives_story_SHA256SUMS.txt)。

## 早期群猫宇宙视觉 · 历史素材

九只猫生活在六颗各有地貌的小星球上，樱花色星路连接彼此。深靛蓝星夜与浅紫晨光两套主题，提供近景拉远的电影镜头，以及始终展示整个宇宙的全景循环。画面内无文字、数字、标志或水印；无音频。

**[下载完整素材包 · 114.77 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/9mew_universe_motion_complete.zip)** · [全部附件与预览](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-universe-v1.0.0)

| 版本 | 深色星夜 | 浅色晨光 |
| --- | --- | --- |
| 电影镜头 MP4 · 1600 × 900 | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark-cinematic.mp4) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-light-cinematic.mp4) |
| 全景循环 MP4 · 1600 × 900 | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark-loop.mp4) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-light-loop.mp4) |
| 无损动画 WebP · 1600 × 900 | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark-1600.webp) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-light-1600.webp) |
| 无损动画 WebP · 960 × 540 | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark-960.webp) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-light-960.webp) |
| GIF · 640 × 360 | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark.gif) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-light.gif) |
| 静态海报 PNG | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark.png) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-light.png) |

每轮 16 秒。官网优先使用约 2.2 MB 的全景 MP4；需要图片形式时使用 960 WebP。完整包包含离线 `preview.html`、透明猫咪与星球分层、原始动作表、重建脚本、说明与校验清单。

![九喵宇宙 · 深色全景](https://github.com/zhangshuaibo1/resources/releases/download/9mew-universe-v1.0.0/universe-dark.png)

## 喵星域 · 无字宇宙猫群动画

六只猫生活在三座漂浮于星海的花园：橘白与英短玩小光点，布偶与三花依偎轻蹭，缅因蜷睡、奶喵仰望星空。星光沿轨迹流动，花瓣轻轻飘动。画面内没有文字、数字、品牌标志或水印。

**[下载完整素材包 · 65.23 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/9mew_starhaven_motion_complete.zip)** · [打开 Release 下载页](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-starhaven-v1.0.0)

提供深色星夜与浅色晨光两套主题，均为 **2:1 宽幅、12 秒循环**。WebP / MP4 为 20fps，GIF 为 10fps；MP4 无音轨。

| 格式 | 深色星夜 | 浅色晨光 |
| --- | --- | --- |
| 无损动画 WebP · 1600×800 | [下载 · 8.85 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-dark-1600.webp) | [下载 · 8.43 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-light-1600.webp) |
| 无损动画 WebP · 960×480 | [下载 · 4.08 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-dark-960.webp) | [下载 · 3.90 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-light-960.webp) |
| MP4 · 1600×800 | [下载 · 1.22 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-dark.mp4) | [下载 · 1.20 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-light.mp4) |
| GIF · 640×320 | [下载 · 7.38 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-dark.gif) | [下载 · 7.12 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-light.gif) |
| 静态 PNG · 1600×800 | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-dark.png) | [下载](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-light.png) |

![喵星域深色定格](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/starhaven-dark.png)

完整包共 **77 个文件**：10 份主要成品、3 组猫咪的 36 张已对齐透明 PNG 帧、花瓣与星光素材、原始环境和动作源图、生成记录、离线预览、中文说明与重新导出脚本。每对猫有 12 张实际姿态绘图，按固定落脚点配准后编排正反循环，20fps 为合成时间轴。

解压后保留目录结构，打开 `preview.html`，可切换主题、播放或暂停。预览页响应系统的减少动态效果偏好。网页横幅可使用较小的 MP4，静帧 PNG 可作加载与减少动态效果时的回退。

请选择附件 **`9mew_starhaven_motion_complete.zip`**；GitHub 自动生成的 `Source code` 下载项是仓库快照。完整 ZIP 使用标准 DEFLATE，无加密、无分卷，已从公开地址重新下载并通过 SHA-256、CRC 和实际解压核验。

[下载 SHA-256 校验文件](https://github.com/zhangshuaibo1/resources/releases/download/9mew-starhaven-v1.0.0/9mew_starhaven_SHA256SUMS.txt)

完整 ZIP 的 SHA-256：

```text
8ec9eb2561fe1031e55a706d78c8b1924792f89c95c416c386214509205bd98b
```

## 六场景道具与动画 · v3

[打开 v3 Release 下载页](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-scene-props-v3.0.0)

延续前一版单独猫咪的自然毛色、细腻毛发和明亮眼神，为六个官网场景加入与猫咪共同绘制的小道具。樱花粉、奶油白、鼠尾草绿和蓝灰色统一材质与笔触。

**[下载完整素材包 · 52.90 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/9mew_page_scene_props_v3_complete.zip)**

完整 ZIP 包含 **122 个文件、92 份成品图像**：6 套场景的主题与尺寸版本、6 件独立道具、总览、源图、离线预览和重导出脚本。动画均为 6 秒无限循环。

| 场景 | 猫咪与道具互动 | 透明动画 | 独立道具 |
| --- | --- | --- | --- |
| 产品 / 企业 | 布偶猫轻触笔记本键盘 | [WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/product-transparent.webp) | [PNG](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/product-prop.png) |
| 体验 | 奶喵轻点平板按钮 | [WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/experience-transparent.webp) | [PNG](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/experience-prop.png) |
| 知识指南 | 英短俯看指南，轻扶纸角 | [WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/knowledge-guide-transparent.webp) | [PNG](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/knowledge-guide-prop.png) |
| 隐私 | 缅因轻合收纳匣，收好信件 | [WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/privacy-transparent.webp) | [PNG](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/privacy-prop.png) |
| 条款 | 三花猫轻扶夹板纸页、眨眼 | [WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/terms-transparent.webp) | [PNG](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/terms-prop.png) |
| 认识九喵 | 橘猫陪伴三猫合影相框，歪头眨眼 | [WebP](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/about-transparent.webp) | [PNG](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/about-prop.png) |

### 浅色动态总览

![浅色场景](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/overview-light.gif)

### 深色动态总览

![深色场景](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/overview-dark.gif)

[浅色道具总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/props-overview-light.png) · [深色道具总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/props-overview-dark.png)

### 规格与使用

- 场景 WebP / 静态 PNG：720×450，浅色、深色、透明三版。
- 方形透明动画 / 静帧：400×400。
- 浅色 / 深色 GIF：480×300。
- 独立道具：400×400 透明 PNG / WebP、浅色 / 深色 PNG。独立道具文件为静态；互动动画包含猫与道具完整场景。
- 浅色底 `#FFF8F2`、深色底 `#17141F`、樱花粉 `#E990AA`。
- 解压后打开 `preview.html`，可离线切换主题和播放／暂停。初始遵循系统减少动态效果偏好，暂停会显示 PNG 静帧。

「认识」按「认识九喵 / 关于我们」设计；「产品 / 企业」共用一组。本版为新增带道具场景，前版纯猫咪动效继续保留。

请在 Assets 中选择 **`9mew_page_scene_props_v3_complete.zip`**。GitHub 自动生成的 `Source code` 下载项是仓库快照，完整素材为上述附件。

标准 ZIP / DEFLATE，无加密、无分卷。[下载 SHA-256 校验文件](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-props-v3.0.0/9mew_scene_props_v3_SHA256SUMS.txt)。

完整 ZIP 的 SHA-256：

```text
bd0b6a8f1cd823e30ac3c066717a0d7c1c5f1ce0bde5e083207f1d407243ea62
```

完整 ZIP 已从公开下载地址重新下载，并通过 SHA-256、CRC 与实际解压核验。

## 官网场景动效 · v2

第二版延续此前单独猫咪动画的细腻毛发、自然毛色和圆润眼神，画面以猫咪自身的小动作与互动为主。樱花粉保留在小面积配饰中，提供浅色、深色和透明版本。

**[下载新版完整素材包 · 48.57 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/9mew_brand_scene_motion_v2_complete.zip)** · [打开新版 Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-scene-motion-v2.0.0)

| 场景 | 新动作 | 动画 WebP 下载 |
| --- | --- | --- |
| 鼻尖默契 · 协作 | 橘白虎斑与布偶缓缓靠近、轻碰鼻尖 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/collaboration-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/collaboration-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/collaboration-transparent.webp) |
| 安静陪伴 · 条款 | 布偶猫轻转头、慢眨眼 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/terms-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/terms-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/terms-transparent.webp) |
| 安心蜷睡 · 隐私 | 暖棕长毛猫蜷卧、轻微起伏 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/privacy-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/privacy-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/privacy-transparent.webp) |
| 好奇倾听 · 知识 | 英短蓝猫轻歪头、眨眼 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/knowledge-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/knowledge-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/knowledge-transparent.webp) |
| 奶喵回应 · 助手 | 重点色奶喵轻抬前爪回应 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/assistant-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/assistant-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/assistant-transparent.webp) |
| 舒展迎接 · 欢迎 | 橘猫缓缓伸懒腰 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/welcome-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/welcome-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/welcome-transparent.webp) |

完整包包含 **86 个文件**：720×450 场景 WebP、400×400 透明方形版、480×300 深浅 GIF、静态 PNG、6 张原始动作图、离线预览、对齐记录、重导出脚本和中文说明。每个动作采用 12 幅原画组成 6 秒逐帧循环；源图按落脚位置配准，并保持共同缩放。

![新版浅色猫咪动效](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/overview-light.gif)

![新版深色猫咪动效](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/overview-dark.gif)

[浅色动态总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/overview-light.webp) · [深色动态总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/overview-dark.webp) · [SHA-256 校验文件](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v2.0.0/9mew_scene_v2_SHA256SUMS.txt)

完整解压后打开 `preview.html`，可离线切换深浅主题、播放／暂停。暂停使用 PNG 静帧，初始遵循系统的减少动态效果偏好。

请选择附件 **`9mew_brand_scene_motion_v2_complete.zip`**。GitHub 自动生成的 `Source code` 下载项是仓库源码快照，完整素材在上述附件中。

<details>
<summary>第一版场景动效 · 历史下载</summary>

## 第一版场景动效

六个猫咪场景，每个提供浅色、深色和透明主题，以及原尺寸与网页轻量两档。8 秒无限循环，按 20 FPS 时间轴渲染。

**[下载完整场景素材包 · 204.61 MB](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/9mew_brand_scene_motion_kit_complete.zip)** · [打开 Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-scene-motion-v1.0.0)

完整包共 87 个文件：36 份动画 WebP、18 张静态 PNG，以及原始素材、离线预览、重导出脚本和接入说明。网页轻量版为 640 × 400；无损主版为 1024 × 640。透明版本保留 alpha，可放在自定义页面背景上。

| 场景 | 动作 | 网页轻量版下载 |
| --- | --- | --- |
| 猫咪协作 | 三只猫咪一起拼合任务拼图 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-collaboration-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-collaboration-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-collaboration-transparent.webp) |
| 一起读条款 | 眼镜英短与暹罗猫一起阅读文件 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-terms-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-terms-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-terms-transparent.webp) |
| 守护小秘密 | 收好信封，陪伴与守护 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-privacy-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-privacy-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-privacy-transparent.webp) |
| 知识慢慢积累 | 缅因猫与俄罗斯蓝猫递书归档 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-knowledge-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-knowledge-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-knowledge-transparent.webp) |
| 奶喵来帮忙 | 对话气泡、倾听和回应 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-assistant-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-assistant-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-assistant-transparent.webp) |
| 欢迎来到九喵 | 猫咪招手，礼盒里升起樱花粉猫耳 9 | [浅色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-welcome-light.webp) · [深色](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-welcome-dark.webp) · [透明](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/web-welcome-transparent.webp) |

![九喵六场景浅色总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/overview-light.png)

[浅色动态总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/overview-light.webp) · [深色动态总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/overview-dark.webp) · [附件 SHA-256 校验文件](https://github.com/zhangshuaibo1/resources/releases/download/9mew-scene-motion-v1.0.0/SHA256SUMS.txt)

完整解压后打开 `preview.html`，可切换主题、尺寸和动画／静态模式，默认尊重系统的减少动态效果设置。

</details>

## 宽幅品牌动画

六只猫咪嬉戏后聚成樱花粉「猫耳 9 + 猫咪 mew」品牌画面。提供深浅主题，384 帧、24 fps、约 16 秒无限循环。

| 文件 | 大小 | 用途 |
| --- | ---: | --- |
| [完整动画素材包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_brand_banner_complete.zip) | 95.90 MB | 42 个文件：深浅动画、海报、MP4、透明源图、离线预览、重导出脚本与说明 |
| [浅色无损 WebP · 1600×600](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_light_1600x600.webp) | 38.0 MB | 原尺寸与完整细节 |
| [深色无损 WebP · 1600×600](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_dark_1600x600.webp) | 37.7 MB | 原尺寸与完整细节 |
| [浅色轻量 WebP · 960×360](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_light_960x360.webp) | 4.17 MB | 网页较小区域 |
| [深色轻量 WebP · 960×360](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_dark_960x360.webp) | 3.92 MB | 网页较小区域 |

[打开宽幅品牌动画 Release](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-brand-banner-v1.0.0) · [附件 SHA-256 校验文件](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/SHA256SUMS.txt)

完整解压后打开 `preview.html`，可切换深浅主题、原尺寸/轻量版和动画/静态海报。完整 ZIP 使用标准 DEFLATE，无加密、无分卷。

完整 ZIP 的 SHA-256：

```text
640deda62699a11bdda012f3585843d6c2339b530e316b0d230b75c828816c8f
```

![宽幅品牌动画浅色定格](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_light_1600x600.png)

![宽幅品牌动画深色定格](https://github.com/zhangshuaibo1/resources/releases/download/9mew-brand-banner-v1.0.0/9mew_playful_dark_1600x600.png)

## 猫咪头像与动画库

头像与动画库当前版本 **v1.0.0 · 2026-10-20**，包含 **134 套形象、938 个成品图像文件**。

### 下载

| 文件 | 大小 | 内容 |
| --- | ---: | --- |
| [完整创作包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-cats-v1.0.0/9mew_cat_avatar_library_complete.zip) | 475.74 MB | 全部成品、134 张原始透明动作序列图、导出脚本、可筛选图鉴与分类资料 |
| [产品素材包](https://github.com/zhangshuaibo1/resources/releases/download/9mew-cats-v1.0.0/9mew_cat_avatar_library_product.zip) | 228.21 MB | 全部成品、可筛选图鉴、中英文目录和使用说明 |
| [SHA-256 校验文件](https://github.com/zhangshuaibo1/resources/releases/download/9mew-cats-v1.0.0/SHA256SUMS.txt) | 小文件 | 两个 ZIP 和两个动态预览的校验值 |

[打开 Release 下载页面](https://github.com/zhangshuaibo1/resources/releases/tag/9mew-cats-v1.0.0)

**请下载名称为 `9mew_cat_avatar_library_complete.zip` 或 `9mew_cat_avatar_library_product.zip` 的附件。** GitHub 自动生成的 `Source code (zip)` 只包含仓库说明，不是猫咪素材包。

### 动态预览

### 浅色主题

![九喵猫咪浅色动态预览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-cats-v1.0.0/9mew_cats_motion_light.gif)

### 深色主题

![九喵猫咪深色动态预览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-cats-v1.0.0/9mew_cats_motion_dark.gif)

### 内容与规格

| 类型 | 尺寸 | 数量 |
| --- | --- | ---: |
| 透明 PNG | 320 × 320 | 134 |
| 静态 WebP：透明、浅色、深色 | 160 × 160 | 402 |
| 透明动态 WebP | 256 × 256 | 134 |
| GIF：浅色、深色 | 256 × 256 | 268 |
| **合计** | | **938** |

每个形象选配一种动作，提供三种动态格式或主题版本，均为 4 秒循环。全库共 12 类动作：眨眼、招手、歪头、单眼眨眼、动耳朵、舔爪、点头、打哈欠、摆尾、小爪贴胸、满足呼噜、伸爪。

134 个条目包括 78 个猫种条目、42 个长短毛等变种、4 个少见或发展中的类型、10 个常见家猫花色。条目数不等于独立品种数，每个条目采用一种代表性外观。来源与分类映射见下载包内的 `coverage_sources.md` 和 `catalog_research.json`。

### 使用

1. 下载 ZIP 并完整解压，保留文件夹结构。
2. 打开 `preview.html`，按中英文名称、类型或动作筛选；支持深浅主题、圆形预览和动画开关。
3. 产品接入使用 `catalog.json`，数据库保存稳定 `id`，例如 `ragdoll`。
4. 聊天列表默认使用静态 WebP，个人资料页或用户主动开启动画时使用透明动态 WebP。

完整创作包保留原始动作图和导出配置；重新导出需要 Node.js 20.9.0 或更新版本，具体步骤见包内 `README.md`。

### 校验下载

将 `SHA256SUMS.txt` 与下载文件放在同一目录。macOS 可运行：

```sh
shasum -a 256 9mew_cat_avatar_library_complete.zip
```

完整创作包的 SHA-256：

```text
0fff9484ef8ccb668948dcdbe474f6fcb795d358ead1ed9e52323cf7c8d269c3
```
