奶喵灵相候选与实际生成记录

star-mist：星雾灵相；moonlight：月华灵相。
两张均由当前可用图像工具，以选定首图为真实参考编辑生成；保留PNG原图，
并用FFmpeg导出896px桌面/512px移动静态WebP，真实alpha已解码检查。
尺寸调整是网页交付编码，不改画面内容；桌面≤160KiB、移动≤80KiB预算保持不变。

两图仍是candidate，不是激活中的官网形象，也没有对应真实成长事件。
大光晕和月弧更适合概念展示；紧凑头像使用前需要再进行留白、效果强度和小尺寸评审。
这些二维灵相没有被伪称为新的三维皮肤或动画。

requests/：可重用的结构化请求。
*-job.json：Skill脚本生成的当时完整作业；换机器先重建本地参考路径。
*-delivery.json：实际工具提示、输入参数、参考hash、输出hash与候选记录。
*-validation.json：对真实PNG/WebP逐个完整解码、哈希、alpha和体积检查。
未暴露的provider/model/version/实际成本记为null，不能解释为费用为0。

独立御风试用见../specs/evidence/yufeng-visual-job.json；该试用仅准备作业，未生成图片。
