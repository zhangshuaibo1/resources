九喵 2D 宠物动作与品牌素材接入｜v5

当前入口
在素材包根目录运行 python3 integration/serve.py，再打开：
  http://127.0.0.1:8989/integration/actions-demo.html       动作收藏与播放
  http://127.0.0.1:8989/integration/website-pet-demo.html   官网悬浮宠物
  http://127.0.0.1:8989/integration/review.html             全部素材画廊
  http://127.0.0.1:8989/integration/planar-pet-demo.html    历史氛围微动效示例

包内已带构建产物，预览无需安装依赖，也不使用外部 CDN。需通过 HTTP(S) 读取模块和
动作清单，不建议直接双击 HTML。serve.py 只绑定 127.0.0.1，不上传或部署任何内容。

本次重点
PetActionPlayer 播放 pet-actions/catalog.json 中的真实角色姿势帧，按帧时长切换。
WebsitePet 的 0.4.0 角色外观改用该播放器，保留拖拽、收起、无障碍与手机输入避让。
actions-demo 按实际目录显示日常、移动与心情动作，可切换主题、动作、重播和暂停。
原画保留为身份参考与运行时静态替代；没有帧的规划动作不展示播放入口。
较早的 PlanarPetArt 是完整原画与星光的 CSS 微动效，不作为本次角色动作数量。
本包仅使用 2D。后续可靠 3D 能力升级须另行验收角色外观和动作。

复用方式
详细动作 API、目录格式与事件绑定规则见 ACTIONS_README.txt。
WebsitePet 外观版本、统一账号/审批/对话适配规则见 WEBSITE_PET_README.txt。
AssetRenderer 和 review.js 读取 assets_manifest.json；planned、retired 项无播放入口。
素材 URL 必须来自 app 自有可信目录，不能直接使用用户或模型提供的任意 URL。

行为边界
演示页面没有真实问答、成长、支付或发布服务。状态动画只表示视觉播放事实。
生产事件由真实业务后端确认；动画结束不得直接增加星尘、羁绊、余额、权限或奖励。
角色动作默认可暂停；设备/应用减少动态时静止；离屏/标签页隐藏时停止推进。
动作移动限制在展示区内，不自动拖动宠物 UI 或抢占其他表单焦点。

构建
在 integration/ 中执行 npm ci、npm run check、npm run build:pet-demo。
构建生成 website-pet-demo、planar-pet-demo 与 actions-demo 三个本地 bundle。
运行依赖仅 React/ReactDOM；构建依赖见锁定后的 package-lock.json。
可用 subset-preview-font.py --font <已授权 Noto Sans SC TTF> 为新文案补全本地字体；
保留 vendor/NOTO-OFL.txt。源码已有中文 fallback 字体栈，不依赖用户联网加载字体。

验证
actions-runtime-validation.json 记录 v5 运行检查与实际素材哈希。
planar-validation.json 为 v4 历史记录，不作为本版逐帧动作通过证明。
浏览器本地检查不代表生产发布、真实模型接入或移动硬件性能验收。
