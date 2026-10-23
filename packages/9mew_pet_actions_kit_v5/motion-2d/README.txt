奶喵 · 星光陪伴｜2D 原画图层动画

使用选定原画，保持猫咪的脸、毛发、姿态和配色。仅对完整图层做约2.2px上下位移、
约0.26度轻摆，并让外围星光缓缓明暗变化。没有眨眼、挥爪或其他新增肢体动作。
媒体类型为 motion-poster；它不是逐帧角色动画，也没有3D模型。

交付
naimiao-starlight-light.webp / -dark.webp：640×640、24fps、144帧、约6秒循环。
naimiao-starlight-preview.gif：兼容预览，480×480、16fps；优先使用WebP或源码组件。
*-poster.png：与主题对应的静态回退。
naimiao-starlight.html：可编辑Canvas 2D源码及有暂停/主题切换的本地预览。
官网正式接入参考 integration/PlanarPetArt.tsx，直接复用原画的CSS动效更轻量。
不要给所有页面自动加载编码动图；首屏、长文、表单、减少动态场景使用静态或轻量组件。

本地预览
从完整包根目录运行 python3 integration/serve.py，然后访问
http://127.0.0.1:8989/motion-2d/naimiao-starlight.html
浏览器禁用脚本时保留原画。系统减少动态时默认静止，用户可用按钮选择播放。

重新导出（需已有 Playwright/Chromium 与 FFmpeg；不会自动安装或联网调用）
1. node motion-2d/export-frames.cjs http://127.0.0.1:8989 /tmp/9mew-frames
   如需指定已有浏览器，设置 NINE_MEW_BROWSER_EXECUTABLE；不要将凭据写进参数。
2. ffmpeg -framerate 24 -i /tmp/9mew-frames/light/%04d.png -c:v libwebp_anim -quality 96 -compression_level 6 -loop 0 -an naimiao-starlight-light.webp
   深色同理，将light替换为dark。
原画文件是输入资产；不要通过修图、缩放拉伸五官或程序化重画猫咪来制造肢体动作。

动画观感与编码验证记录见 delivery.json；形象来源是 illustrations/mewling_master.png。
帧数与编码输出是实际测量，未来的2D眨眼/挥爪仍需单独制作及验收。
