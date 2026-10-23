官网奶喵｜2D 宠物动作 v5

渲染合同
characterId: 9mew.character.naimiao
appearanceId: 9mew.naimiao.website
appearanceVersion: 0.4.0
variantId: sakura-cream
renderer: character-frames
approval: prototype（本地设计演示）

0.2.0 保持 revoked；0.2.1 保留静态原画身份；0.3.0 保留历史 planar-poster。
0.4.0 用 PetActionPlayer 读取真实动作帧。appearanceVersion 必须与动作清单一致。
载入失败、系统减少动态或动作资源不可用时展示选定原画；该降级不证明动作已交付。
旧版 PlanarPetArt 仍可展示历史版本，不能冒充 v5 的肢体或表情动画。

复制组件
WebsitePet.tsx / website-pet-types.ts / website-pet.css
PetActionPlayer.tsx / pet-action-types.ts / pet-action-player.css
PlanarPetArt.tsx / planar-pet-art.css（仅兼容旧版外观）
pet-actions/ 和 illustrations/mewling_master.desktop.webp
动作 API、URL 解析、时长与事件映射详见 ACTIONS_README.txt。

批准与加载
baseUrl 为可信、同源、根相对的本素材包目录；动作目录固定为其 pet-actions/catalog.json。
动作文件来自 app 自有目录清单，运行时检查同源、路径范围、文件类型、数量与时长。
开发演示可显式 allowPrototype。生产默认 false，需服务端返回 approved 外观引用。
appearanceRegistry.readApproved 负责租户、宠物受众、版本授权与当前批准 revision。
组件不激活外观、不写用户档案、不调用管理员发布接口。
管理员回滚 helper 仍要求 approvalId、idempotencyKey、expectedRevision；revoked 版本不可恢复。
上线前把批准版本的 manifest hash 与帧哈希纳入注册表；客户端检查不能取代服务端授权。

动作交互
收起状态仅温和待机；打开面板可招手（需清单存在 wave）。
展开后选择清单已交付的动作，或点击“再来一次”重播。单次动作结束后回到温和待机。
移动/跳跃仅在宠物展示区播放，不自动在页面上追逐光标或遮挡正文。
按暂停可冻结当前姿势；系统或应用减少动态时显示静态原画。
离屏/标签页隐藏时停表，恢复后不补播被隐藏的时间。
保留指针拖动、方向键微调、Home 复位、Escape 收起并返回焦点。
手机聚焦外部表单时宠物让位，动作选择不自动滚动或抢焦点。
深浅主题共用透明角色，背景与光色由 CSS 适配，角色毛色与五官不随主题改变。

问答与成长
默认未连接，输入与发送禁用，不造回答，不调用模型，不产生费用。
真实适配器、登录/权限/受众/计量/限流就绪后，才显式开启 conversation.enabled。
仅在用户提交文字时调用 adapter.ask，支持取消等待与过期请求丢弃。
视觉开心、生气、委屈等是人工选择的动作，不代表真实情绪识别或人格改变。
动作播放回调不得直接结算真实成长、奖励、扣费、升级、批准或发布。

验证
actions-runtime-validation.json 记录本版实际浏览器检查。
planar-validation.json 是 v4 历史检查，保留以追溯，不用作 v5 通过证据。
本版没有生产部署、真实问答/成长后台或移动设备硬件性能验收。
