# v5 实际资产状态

本表由当前动作 catalog 和实际文件生成，所有新素材仍为 prototype 候选；没有生产批准或真实后端接入声明。

实际可播放动作入口 **22** 个，其中独立源动作 **20** 个、镜像衍生 **2** 个；原有语义场景复用 **3** 项。编码格式、主题、重复播放周期不增加独立动作数。

| 动作 ID | 名称 | 分类 | 来源 | 官网时间轴 | 编码导出 |
|---|---|---|---|---|---|
| `blink` | 轻轻眨眼 | daily | 独立源动作 | 8 个时序项 / 3220 ms | WebP、浅色 GIF、深色 GIF |
| `wave` | 招爪问好 | daily | 独立源动作 | 8 个时序项 / 1780 ms | WebP、浅色 GIF、深色 GIF |
| `tail-swish` | 轻摆尾巴 | daily | 独立源动作 | 8 个时序项 / 1520 ms | WebP、浅色 GIF、深色 GIF |
| `listen` | 歪头倾听 | daily | 独立源动作 | 8 个时序项 / 2340 ms | WebP、浅色 GIF、深色 GIF |
| `walk-right` | 向右散步 | movement | 独立源动作 | 24 个时序项 / 2880 ms | WebP、浅色 GIF、深色 GIF |
| `run-right` | 向右小跑 | movement | 独立源动作 | 24 个时序项 / 1920 ms | WebP、浅色 GIF、深色 GIF |
| `jump` | 轻盈跳跃 | movement | 独立源动作 | 8 个时序项 / 1700 ms | WebP、浅色 GIF、深色 GIF |
| `happy` | 开心眯眼 | emotion | 独立源动作 | 8 个时序项 / 2040 ms | WebP、浅色 GIF、深色 GIF |
| `angry` | 小小生气 | emotion | 独立源动作 | 8 个时序项 / 2060 ms | WebP、浅色 GIF、深色 GIF |
| `sad` | 委屈求安慰 | emotion | 独立源动作 | 8 个时序项 / 2480 ms | WebP、浅色 GIF、深色 GIF |
| `surprised` | 好奇惊讶 | emotion | 独立源动作 | 8 个时序项 / 2200 ms | WebP、浅色 GIF、深色 GIF |
| `excited` | 兴奋庆祝 | emotion | 独立源动作 | 8 个时序项 / 1960 ms | WebP、浅色 GIF、深色 GIF |
| `nuzzle` | 亲昵蹭蹭 | emotion | 独立源动作 | 8 个时序项 / 2400 ms | WebP、浅色 GIF、深色 GIF |
| `groom` | 舔爪洗脸 | daily | 独立源动作 | 8 个时序项 / 2300 ms | WebP、浅色 GIF、深色 GIF |
| `sleep` | 安静睡觉 | daily | 独立源动作 | 8 个时序项 / 4000 ms | WebP、浅色 GIF、深色 GIF |
| `stretch` | 伸个懒腰 | daily | 独立源动作 | 8 个时序项 / 2500 ms | WebP、浅色 GIF、深色 GIF |
| `knead` | 左右踩奶 | daily | 独立源动作 | 8 个时序项 / 1440 ms | WebP、浅色 GIF、深色 GIF |
| `yawn` | 困困哈欠 | daily | 独立源动作 | 8 个时序项 / 2280 ms | WebP、浅色 GIF、深色 GIF |
| `roll` | 翻身露肚皮 | daily | 独立源动作 | 8 个时序项 / 2480 ms | WebP、浅色 GIF、深色 GIF |
| `pounce` | 伏身小扑 | movement | 独立源动作 | 8 个时序项 / 2040 ms | WebP、浅色 GIF、深色 GIF |
| `walk-left` | 向左散步 | movement | 镜像自 walk-right | 24 个时序项 / 2880 ms | WebP、浅色 GIF、深色 GIF |
| `run-left` | 向左小跑 | movement | 镜像自 run-right | 24 个时序项 / 1920 ms | WebP、浅色 GIF、深色 GIF |

## 原规划的动作映射

| 原资产 ID | 当前状态 | 说明 |
|---|---|---|
| `9mew.motion.idle` | planned | The original requirement is articulated breathing idle. Default blink/tail behavior can provide a runtime idle but is not completion of this separate breathing source action. |
| `9mew.motion.blink` | prototype | 实际 `blink` 源动作 |
| `9mew.motion.greet` | prototype | 复用 `wave`；不计新源动作 |
| `9mew.motion.think` | planned | Planning entry only until a matching actual catalog action or explicit semantic reuse binding is assembled. No current media is inferred from this base registry. |
| `9mew.motion.listen` | prototype | 实际 `listen` 源动作 |
| `9mew.motion.speak` | planned | Planning entry only until a matching actual catalog action or explicit semantic reuse binding is assembled. No current media is inferred from this base registry. |
| `9mew.motion.work` | planned | Planning entry only until a matching actual catalog action or explicit semantic reuse binding is assembled. No current media is inferred from this base registry. |
| `9mew.motion.cooperate` | planned | Planning entry only until a matching actual catalog action or explicit semantic reuse binding is assembled. No current media is inferred from this base registry. |
| `9mew.motion.celebrate` | prototype | 复用 `excited`；不计新源动作 |
| `9mew.motion.sleep` | prototype | 实际 `sleep` 源动作 |
| `9mew.motion.comfort` | prototype | 复用 `nuzzle`；不计新源动作 |
| `9mew.motion.evolve` | planned | Planning entry only until a matching actual catalog action or explicit semantic reuse binding is assembled. No current media is inferred from this base registry. |
| `9mew.motion.look` | planned | A dedicated look-around sequence remains planned. Listening may include head movement but is not silently counted as this independent source action. |

## 计数与证据边界

- 实际保存源姿态帧 160 张；当前播放目录使用其中 158 张不同帧，排除 2 张。重复时序项不增加这些数量。
- `specs/assets_plan.csv` 保留原始 64 个语义规划行，更新其中已对应的实际文件/复用关系；新增动作范围在 catalog 与主 manifest 中登记。
- 透明 WebP 与帧可跨主题复用；GIF 是有意合成浅色/深色背景的兼容预览。
- 走跑等动作可在官网重复若干周期后结束，独立编码动图可循环单个周期；时间轴和编码周期分别记录。
- `motion-2d/` 与 `integration/planar-validation.json` 是旧装饰样板/历史证据，不证明本轮宠物动作。
- 本轮编码证据看 `pet-actions/encoding-validation.json`；当前播放器行为看 `integration/actions-runtime-validation.json`；包入口 `specs/validate_delivery.py` 绑定实际字节。
- 文件/编码检查不能代替身份、美感、步态和姿态检查；新素材保持候选，不自动上线。
- 未完成的思考、说话、工作、协作、进化等专用语义动作继续 planned，不能由相近动作的标签替换来冒充。

## 源姿态筛选记录

| 动作 | 排除的源帧索引（从0开始） | 原因 |
|---|---|---|
| `nuzzle` | 5, 6 | Generated torso mirrored during head turn; omit these poses to preserve body orientation. |

这些源帧保留为制作证据，标记为非播放帧，不加入官网时间轴或编码成品。
