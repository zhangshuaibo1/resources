九喵宠物动作接入｜v5

入口
  python3 integration/serve.py
  http://127.0.0.1:8989/integration/actions-demo.html
  http://127.0.0.1:8989/integration/website-pet-demo.html

动作页以 pet-actions/catalog.json 为唯一可播放动作目录。只显示实际存在的条目。
完整原画是角色身份参考与加载失败/减少动态时的替代画面。动作由角色姿势帧播放。
PlanarPetArt / planar-pet-demo 仍保留为旧版氛围微动效示例，不计入本版宠物动作。

文件复制
把 PetActionPlayer.tsx、pet-action-types.ts、pet-action-player.css 与 pet-actions/
目录复制到现有 React 项目。保留 frames/ 的相对目录和原画。已有构建 bundle 可离线本地预览，
不依赖 CDN；页面必须经 HTTP(S) 打开，直接双击 HTML 不支持模块与资源清单加载。

URL 规则（务必保持一致）
catalogUrl 指向 app 自有、同源的受控 JSON 目录，不接收用户输入或模型直接返回的 URL。
catalog.basePath 相对 catalogUrl，通常为 './'。
action.frames[].src 相对 catalog.basePath，例如 frames/blink/000.webp。
catalog.poster 相对 catalogUrl，例如 ../illustrations/mewling_master.desktop.webp。
播放器解析后检查同源、包目录范围、图片扩展名、时长、数量、尺寸、锚点与动作 ID 唯一性。
expectedAppearanceVersion 可绑定已批准外观引用；版本不一致只显示静态替代。
该客户端检查不能代替服务器的素材准入、权限、哈希校验与内容安全策略。

最小接入
  <PetActionPlayer
    catalogUrl="/assets/9mew/pet-actions/catalog.json"
    fallbackSrc="/assets/9mew/illustrations/mewling_master.desktop.webp"
    expectedAppearanceVersion="0.4.0"
    alt="奶喵，一只戴樱花粉丝巾的奶油白猫"
    actionId={actionId}
    playKey={playKey}
    paused={paused}
    reducedMotion={reducedMotion}
  />

动作请求
actionId 为清单中已存在的 ID。更新 actionId 即切换动作；想重播同一动作时递增 playKey。
playback=once 播完后回到 returnTo 或温和待机；loop 按目录时长循环。
onActionChange(id) 报告正在显示的动作，onActionComplete(id) 报告一次性动作结束。
回调仅代表视觉播放事实，不是后端任务完成、成长、领取奖励或情感识别的证据。
同一动作先预加载自身帧；逐帧切换不做交叉淡化，避免两张猫叠影。
用帧 durationMs 表达停顿、蓄力、落地和眼睑节奏。渲染器不会自动生成缺失动作。

推荐事件映射
  首次进入/安静待机 -> blink（目录可给张眼帧较长停留）
  用户打开宠物面板 -> wave（仅有此动作时）
  用户明确点击动作按钮 -> 对应动作；jump/walk/run 不自动占用页面
  任务完成的真实服务端事件 -> 可请求 happy/celebrate 等已交付动作
  用户开启陪伴休息 -> sleep；不推断用户情绪
  AI 正在接收获准输入 -> listen；视觉状态不能先于真实业务状态
生产事件名由 Go 业务域定义；客户端动画不能触发奖励、扣费、升级、批准或权限改变。

移动与镜像
motion.kind=travel 仅在组件内部给角色增加有限水平位移；四肢变化仍来自真实动作帧。
allowTravel=false 关闭位置位移而保留步态。compact 状态始终不平移位置。
mirror=true 是同一帧序列的方向派生，不能统计为一套独立绘制的动作。
每张帧应由素材流水线预先对齐到统一画布/锚点；播放器不猜测脚底或重新缩放每一帧。

暂停与无障碍
paused 冻结当前帧和时间。系统或应用减少动态时显示静态原画，并禁用演示页动作触发。
页面隐藏或元素离屏时停止 requestAnimationFrame，恢复时从暂停位置继续，不追赶隐藏时间。
WebsitePet 保留鼠标/触控拖动、方向键微调、Home 复位、Escape 收起与焦点返回。
移动端聚焦外部表单时宠物让位；动作切换不抢焦点。
静态替代仅用于运行时降级，不代表该动作已交付；损坏帧不得伪报为成功播放。

外观批准
WebsitePet 的 0.4.0 为 character-frames 本地 prototype 外观。
外观引用与动作清单的 appearanceVersion 必须一致；0.2.0 保持 revoked。
allowPrototype 默认 false。生产使用前由真实外观注册表批准不可变版本，并记录素材哈希。
当前例子没有连接 AI 问答、成长、支付或发布服务；问答输入与发送保持关闭。

验证范围
TypeScript 检查与构建可使用 npm ci、npm run check、npm run build:pet-demo。
actions-runtime-validation.json 记录本版实际运行检查。
planar-validation.json 是 v4 的历史检查，不能证明 v5 逐帧动作已经验证。
动作质量、角色一致性、连贯性与脚底对齐需结合实际导出的动画逐项视觉验收。
