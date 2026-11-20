# Product UI Design Archive

五大产品 UI 概念设计资产库。所有页面按**单功能、单图片**归档，不使用拼图裁切替代独立页面设计。

## 产品目录
- [红安 HONGAN](./hongan/README.md) — AI 风险审核 SaaS
- [暖遇 NUANYU](./nuanyu/README.md) — 兴趣社交、多人组局与生活笔记
- [鱼乐圈 AnglerCircle](./anglercircle/README.md) — 钓点地图、鱼获与钓友社区
- [封疆](./fengjiang/README.md) — 圈地 APP
- [知更鸟 ROBIN](./robin/README.md) — 企业产业情报与法律合规知识平台

## 设计交付规范
1. 每张图片只呈现一个完整功能页面。
2. 每个页面独立 PNG/JPG 文件，不把多页拼成一张图。
3. 页面按编号、模块和端类型命名。
4. 每个产品维护独立视觉规范，不能互相套用品牌色。
5. 图片生成后应立即归档，并更新对应页面清单。
6. 概念图必须标注“视觉概念稿”，不冒充可运行页面或最终交互稿。
7. 同时保存页面说明、分辨率、端类型、版本和生成状态。

## 文件命名
`{产品缩写}_{模块序号}_{页面序号}_{页面名称}_{端}_{版本}.png`

例如：`HA_02_001_tenant-management_desktop_v1.png`

## 状态
- `planned`：已规划，未生成
- `generated_local`：已生成在工作文件区，尚未提交 GitHub
- `committed`：已提交 GitHub
- `refined`：已逐页精修并验收

## 当前批次
红安租户管理页已生成单页概念图，当前仍在本地工作文件区。此仓库连接的文件写入接口可提交文本文件；二进制图片上传需通过支持 Git 二进制 Blob/Release 附件的上传通道完成。未完成图片提交前，不标记为 committed。
