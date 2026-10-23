# 九喵 · 追鼠与追蝶网页动画 v1

奶喵从屏幕右下角出发，追着小老鼠跑到左下角；发现蝴蝶后停步抬头、蓄力跃起，沿左侧向上追到左上方，再掠过屏幕上方到右上角，最后沿右侧回到右下角，轻轻落地休息。

本版保持奶油白绒毛、樱花粉围巾和金色四角星扣的 2D 奶喵形象，配合暖灰褐小老鼠与淡紫粉蓝蝴蝶。默认完整路线 **27 秒**，使用真实姿态帧表现肢体与翅膀变化，以连续位置插值实现网页中的平滑移动。

## 完整下载与网页接入

| 附件 | 内容 |
|---|---|
| [9mew_chase_motion_kit_v1.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_motion_kit_v1.zip) | 完整原画、分帧、精灵图、动画、源码、生成记录、提示词与说明 |
| [9mew_chase_web_v1.zip](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_web_v1.zip) | 网页接入包，保留播放器与所需资源的目录关系 |
| [9mew_chase_preview_v1.html](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_preview_v1.html) | 单文件离线预览，下载后用浏览器打开 |
| [9mew_chase_scene_prompt_v1.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_scene_prompt_v1.txt) | 本场景完整创作、实现与交付提示词 |
| [9mew_chase_overview_v1.png](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_overview_v1.png) | 静态总览 |
| [9mew_chase_v1_SHA256SUMS.txt](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_v1_SHA256SUMS.txt) | 发布附件 SHA-256 校验清单 |

[查看本版完整源码与素材](https://github.com/zhangshuaibo1/resources/tree/9mew-chase-motion-v1.0.0/packages/9mew_chase_motion_kit_v1)。完整解压后，先读 `README.md`，直接打开 `OPEN_ME.html` 查看路线。

## 整场动画单独下载

| 格式 | 浅色背景 | 深色背景 |
|---|---|---|
| MP4 | [9mew_chase_light_v1.mp4](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_light_v1.mp4) | [9mew_chase_dark_v1.mp4](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_dark_v1.mp4) |
| GIF | [9mew_chase_light_v1.gif](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_light_v1.gif) | [9mew_chase_dark_v1.gif](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_dark_v1.gif) |
| WebP | [9mew_chase_light_v1.webp](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_light_v1.webp) | [9mew_chase_dark_v1.webp](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_dark_v1.webp) |

本次共有 **12 个发布附件**。整场视频和动画用于预览或展示；网页接入使用透明精灵与播放器，使角色随视口或指定容器调整路线。

## 动作素材与播放器

- **7 个新原始动作序列、56 个原始姿态**：猫咪奔跑、抬头、起跳、空中追蝶、落地；老鼠小跑；蝴蝶振翅。
- `rest` 复用落地尾段作为休息状态，镜像向左也复用原图，两者均不增加原始动作数。
- **24 份单独动作导出**：8 个可用状态，各有透明动画 WebP、浅色 GIF、深色 GIF。深浅背景共用相同角色原画。
- 保留原始 PNG、透明 WebP 分帧、精灵图集、静态回退、动作目录及机械组装工具。猫咪分帧为 512 × 512，配角分帧为 256 × 256。
- 无框架依赖的网页播放器提供播放、暂停、重播、停止、速度/尺寸调整、时间点跳转与销毁。默认有限播放一次；支持全视口或指定容器，动画层不拦截页面点击。
- 自动播放遵循系统的减少动态效果偏好；页面隐藏或受限容器离屏时暂停调度，资源失效时使用原始奶喵静态图回退。

![九喵追鼠与追蝶动画总览](https://github.com/zhangshuaibo1/resources/releases/download/9mew-chase-motion-v1.0.0/9mew_chase_overview_v1.png)

## 验证与当前边界

本地技术检查已完成，具体检查项目和结果随源码中的报告交付。发布后的公开下载状态以实际远端核验记录为准；本说明不把本地检查当作公开下载验收。

本版为 **2D 关键帧动画候选**，较大的姿态转换可能显示帧间切换感。平滑的路线位置插值不代表骨骼动画或每秒 60 张新绘制原画，视觉效果仍需结合实际网页尺寸验收。3D 继续延期。

这是纯前端素材与交互演示，**尚未部署到官网**，不代表后端问答、成长或其他业务功能已接入。此前完整业务提示词 v5 未修改，本次仅新增独立的追逐场景提示词 v1。

请下载上面的具名完整 ZIP 或网页接入 ZIP。完整包保留生成与使用说明，后续修订继续通过版本化源码和 Releases 交付。
