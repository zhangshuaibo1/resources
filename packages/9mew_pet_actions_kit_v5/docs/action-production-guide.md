# 九喵 2D 宠物动作制作与接入 · v5

本版以选定的奶油白奶喵为身份母版，制作猫咪自身的姿态和表情变化。移动、跳跃、情绪与日常动作都按实际文件登记。原画和星光整体移动的旧样板仍可作装饰，不能当成挥爪、走路或眨眼。

## 从哪里开始

完整开发指令是压缩包根目录的 `9mew_task_prompt_v5.txt`。业务 0–20 节保留上一版，视觉 21–23 节已改为真实动作要求；3D 继续延期，模型四档仍为喵学徒、喵大师、喵真人、喵仙帝。

| 文件/目录 | 用途 |
|---|---|
| `illustrations/mewling_master.png` | 唯一角色身份母版，保留原始字节 |
| `pet-actions/catalog.json` | 实际可播放动作、帧顺序、时长、循环与来源 |
| `pet-actions/sheets/` | 生图返回的原始动作源图表 |
| `pet-actions/frames/` | 提取后的独立透明帧；具体路径服从 catalog |
| `integration/actions-demo.html` | 动作选择与主题预览 |
| `integration/website-pet-demo.html` | 官网宠物面板与动作组件整合演示 |
| `integration/ACTIONS_README.txt` | 真实播放器接口与构建说明 |
| `skills/9mew-visual-forge/` | Codex 与其他 Agent 可复用的星绘 Skill |

源图表、动画 WebP、GIF、独立帧和镜像方向是不同产物。最终交付数量与测试结果以实际 catalog、manifest 和本轮验证报告为准；本指南不把扩展动作目标写成已完成事实。

## 查看实际动作

在包根目录启动本地文件服务：

```bash
python3 integration/serve.py
```

打开 `http://localhost:8989/integration/actions-demo.html` 或官网面板演示。直接双击 HTML 可能受到浏览器对本地 JSON/模块的限制，使用本地服务加载。

需要重建 React 组件时，在 `integration/` 运行：

```bash
npm ci
npm run check
npm run build:pet-demo
```

查看时分别检查走路的四脚交替、跳跃的蓄力/收爪/落地、情绪的眼耳和姿态、理毛/伸展等日常行为。几张关键姿态构成的动画采用清晰的关键帧节奏；真实独立画稿数、时间轴和编码帧数要分别报告，不把复制帧解释成新增美术帧。

## 在官网使用

`PetActionPlayer` 负责播放，`WebsitePet` 负责面板与交互。播放器接收以下主要参数：

| 参数 | 含义 |
|---|---|
| `catalogUrl` | 默认 `../pet-actions/catalog.json`；按实际部署路径传入 |
| `catalog` | 可选，使用宿主应用已经读取的受控目录对象 |
| `expectedAppearanceVersion` | 可选，绑定当前外观版本；与目录不一致时静态降级 |
| `fallbackSrc` | 必填，原画静态 fallback 地址 |
| `actionId` / `playKey` | 选择动作；同动作重播时递增 `playKey` |
| `paused` / `reducedMotion` | 用户暂停与减少动画偏好 |
| `allowTravel` | 是否允许安全区域内的位移动画 |
| `onActionChange` / `onActionComplete` | 观察本地动作切换/结束，不能当作业务成功事件 |

示例路径以从网站根目录部署 `/brand-assets/` 为例，实际接口以随包源码为准：

```tsx
<PetActionPlayer
  catalogUrl="/brand-assets/pet-actions/catalog.json"
  fallbackSrc="/brand-assets/illustrations/mewling_master.desktop.webp"
  expectedAppearanceVersion="0.4.0"
  alt="奶喵，九喵的 AI 宠物"
  actionId={selectedActionId}
  playKey={replayCounter}
  paused={paused}
  reducedMotion={prefersReducedMotion}
  allowTravel={false}
/>
```

只向动作控件提供实际 catalog 中的条目。`once` 动作完成后回到 `returnTo` 或温和待机；`loop` 按其真实时间轴循环。默认低频眨眼/摆尾即可，走跑、跳跃和强烈表情由用户主动选择。不要让宠物自动穿过输入框、支付/同意控件或正文。

暂停、后台和离屏时停止帧推进与位移。减少动画偏好默认显示原画；资源异常或外观版本不匹配时保留原画或文字入口，不能退回整图晃动并当作动作成功。拖动、收起、键盘和表单操作应继续可用。播放器中的“倾听/回应/庆祝”只是视觉动作；真实 ASR、TTS、问答、任务、投喂和成长需另接经过授权的业务服务。

## 给 Codex/其他 Agent 的制作流程

先读取 Skill 的 `SKILL.md`、`assets/identity.json`，实际查看 `assets/naimiao-master.png`，再按任务读取 `references/animation-workflow.md`。不要把星绘 Skill 当成一个已经训练或必然存在的视频模型。

```bash
python3 skills/9mew-visual-forge/scripts/build_visual_job.py \
  --request skills/9mew-visual-forge/assets/requests/website-jump.json \
  --out /tmp/9mew-jump-job.json
```

这个离线命令只构建请求、核验参考哈希，不调用供应商、不扣费、不激活外观。`website-2d.json` 是真实眨眼作业；`website-jump.json` 是跳跃作业；`website-motion-poster.json` 保留旧装饰动效配方，不能替代动作。

1. **规划单动作。** 写明起止姿态、镜头、地面、活动肢体和各阶段。八帧只是可用的试样规模，不是所有动作都固定八帧的质量保证。
2. **生成真实美术姿态。** 使用当前可用且获准的生图工具，参考唯一原图。可请求 4×2 等分透明源图表，完整保留猫耳、脚、尾和毛绒细节。只记录工具实际暴露的模型/版本/费用，不猜填。
3. **检查后机械加工。** 按真实格子切分、保持统一比例和锚点、制定逐帧时长。不能独立缩放每张猫，也不能把跳跃最高点强行对齐地面。程序不重新画脸、糊眼睛或把猫简化为几何块。
4. **播放与修正。** 检查头脸身份、爪数、尾部连接、脚底接触、首尾接缝、毛边闪烁及完整播放节奏。失败动作不进入可选目录；运行时使用原画，同时继续修正。
5. **登记与导出。** 保存源图、完整提示词、参考/输出哈希、帧、时间轴、来源/镜像关系、编码动图和实际检查结果。不同方向如果只是镜像，应标 `sourceActionId` 和 `mirror`；不要算两套独立原画。

## 动作目录与验证

目录 `schemaVersion` 为 `1.0`。`basePath` 和 `poster` 相对 catalog URL 解析；帧的 `src` 相对 `basePath` 解析。当前候选外观为 `0.4.0`，身份 `9mew.character.naimiao` 保持不变。动作包含 `id`、`label`、`category`、`description`、`frames[{src,durationMs}]`、`frameSize`、`anchor`、`playback`、一致的 `loop`，并可包含 `returnTo`、镜像与来源字段。

```bash
python3 skills/9mew-visual-forge/scripts/validate_action_catalog.py \
  --catalog pet-actions/catalog.json \
  --root . \
  --out /tmp/9mew-action-checks.json
```

这个检查器核对路径、真实静态帧、解码尺寸/透明度/像素变化、时间轴、默认动作、返回动作及衍生引用。编码 WebP/GIF 另用 `validate_visual_delivery.py` 检查并完整解码。两者都不能证明“像原图”“步态自然”“表情可爱”，这些需要实际视觉检查；浏览器暂停/离屏/减弱动画也需独立运行证据。

沿用预登记的性能目标，分别报告高质量源图、官网加载帧包、分享预览和实际设备数据。超预算时标记并优化尺寸、编码和加载，不在测完后降低标准。技术检查通过不自动授予品牌批准或生产发布许可。

## 外貌进化的兼容边界

新外貌使用新的 AppearanceRevision，绑定身份、母版哈希、父版本、允许变化、真实事件/主人选择与审核记录。动作素材也绑定对应外观版本。只做出新静态外貌时，不能声称旧动作已适配新的毛色/饰物；保持候选状态，完成需要的动作覆盖再由有权限的服务激活。

美术不能更改成长值、余额、权限、模型档位或真实事件。新动画仍是候选，公开上线走实际审批；日常可逆制作和本地验证沿既有授权推进。3D 继续作为未来可靠能力就绪后的独立专项。
