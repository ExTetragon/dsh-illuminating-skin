# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.3.0] - 2026-10-30

首个公开发布版，适配 DeepSeek Harness 0.2.1-rc.3 / dsh-claude-style 0.19.5。

### 新增

- README 增加「安装」「已知限制」「许可证」章节，六条踩坑记录与选择器策略说明。
- 「选择器策略」五档稳定性表：宿主 `data-slot` > 宿主语义属性 > claude-style `data-dsh-claude-part` > 类名后缀 > 完整哈希。
- rc.2 → rc.3 哈希对照表，方便宿主再升级时快速重定位。

### 变更（破坏性）

主结构的选择器从 CSS module 哈希类名替换为稳定属性锚点：

| 用途 | 0.2.x | 0.3.0 |
| --- | --- | --- |
| 会话头 | `[class*="an3WzG_header"]` + 6 个 `:not()` 排除 | `[data-slot="conversation.header"] > *` |
| 窗口框架 | `[class*="mP3x-q_frame"]` | `[data-slot="root"] > [class*="_frame"]` |
| 会话主体 | `[class*="an3WzG_body"]` | `[data-conversation-content]` |
| 会话列根（claude-style 模式） | `[class*="an3WzG_root"]` | `[data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"])` |
| 会话列根（普通 DSH 模式） | `[class*="an3WzG_root"]` | `[data-phase]:has(> [data-slot="conversation.content"])` |

旧哈希类名仍作为并列选择器保留一轮，便于灰度；浮层部分继续用哈希兜底（失效只影响该浮层，不破坏主结构）。

### 修复

- **主栏圆角卡片在 DSH 0.2.1-rc.3 升级后整体失效**：宿主重建了全部 CSS module 哈希，三十多个硬编码类名一次性全部落空。这是 0.3.0 重构的直接原因。
- 消息气泡发送瞬间的深色一闪（隐藏 claude-style 的发送飞行副本 + 换成 `scale(.94)` 淡入）。
- 字体栈指向包内不存在的 Anthropic 字体导致的三条 404。

## [0.2.1] - 2026-10-20

### 新增

- 埋点：消息气泡入场动画改为 220ms `scale(.94)` + 淡入，不再从 `scale(0)` 放大。
- 字体：覆盖 `data-dsh-claude-typeface="claude"` 下的 5 个字体栈，消除 Anthropic 字体 404。

### 变更

- 删除了全部运行时轮询与 DOM 查询（`nudgeChips` / `alignRightPanes` / 探针），改为纯静态 CSS；右栏对齐改用 `[data-sidebar-right-panel]{top:4px;bottom:8px}`。
- 清理重复的浅色主题规则。

## [0.2.0] - 2026-10-20

### 变更

- 说明中明确前置要求：必须先安装 dsh-claude-style 并把「配色」设为跟随宿主。
- 描述中补充未安装时的退化行为（主栏卡片、标题带整合、chips 位置退化）。

## [0.1.0] - 2026-10-20

### 新增

- 首个版本：IntelliJ IDEA 深灰毛玻璃、侧栏整列与窗口标题带连成的 L 形一体玻璃、标题带中央蓝色径向光、主栏四周留缝卡片、设置 / 搜索 / 菜单 / tooltip / toast 统一磨砂。
