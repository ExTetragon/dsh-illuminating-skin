# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.4.1] - 2026-10-30

颜色菜单新增「玻璃卡片」开关。

### 新增

- **玻璃卡片开关**：发光面板底部一行开关。开启后主栏与右栏换成与设置面板同源的材质——`rgba(28,31,38,.72)` 半透明底 + `blur(24px) saturate(140%)` + 随发光色变化的顶部蓝光，保留原有 `.5px` 内描边，不加边框和外阴影。
  - 主栏玻璃画在 `_centerCol::before` 底衬上（与插件页、自动化任务等路由页同一元素），会话列根只设透明——`backdrop-filter` 不落到内容层，会话内 `position:fixed` 浮层（@ 提及、斜杠菜单、模型选择）仍以视口为包含块。
  - 右栏面板直接改背景，内部 dockkit pane 早已透明。
  - 状态存 `localStorage['dsh-illuminating-skin:card-glass']`，默认关闭。
  - `prefers-reduced-transparency: reduce` 下自动关闭模糊。

## [0.4.0] - 2026-10-30

标题栏发光颜色可切换：光色抽成单一变量，新增会话头右侧的色点按钮。

### 新增

- **顶部发光切换器**：挂进会话头工具区（claude-style 的 `data-dsh-claude-part~="header-utilities"`，与「…」并排）的一个圆形色点按钮，点开为玻璃下拉面板。
  - 六套预设：黛蓝（默认）/ 天青 / 竹青 / 紫檀 / 赭石 / 胭脂。
  - 自定义取色：原生 `<input type="color">`，拖动实时生效。
  - 键盘：`↓` / `Enter` / `Space` 打开，`Esc` 关闭，选项可 `Tab` 遍历。
  - 持久化：`localStorage['dsh-illuminating-skin:glow']`。
  - 关闭：点面板外部（capture 阶段 `pointerdown`）或再点一次按钮；不用 `blur`，因为它在选项 click 之前触发。
- **光色抽成变量**：13 处 `rgba(72,100,193,…)` 与 13 处 `rgba(120,150,228,…)` 统一改为 `rgba(var(--is-glow-rgb, 72, 100, 193), …)`，覆盖 `body::before` 的标题带光晕与卡片缝隙、设置面板与通用对话框的顶部高光。`--is-glow-rgb` 在 `:root` 有兜底值，未运行切换器时观感与 0.3.1 完全一致。
- **宿主重挂**：`MutationObserver` 监听 `document.body`，只在按钮 `isConnected === false` 时重新插入宿主——不轮询、不做布局测量。

### 兼容

- 仍是 `dsh-claude-style >= 0.19.0` 的叠加层。缺少 claude-style 标记时，按钮依次回退到 `[data-slot="conversation.header"]` 内的 `_headerUtilities` / `_headerActions`；两者都找不到则不挂载，插件其余部分照常工作。

## [0.3.1] - 2026-10-30

适配 DeepSeek Harness 0.2.1-rc.5，补齐两个一直没对上的浮层选择器。

### 适配复查

- **宿主哈希未变**：rc.5 的 CSS module 前缀与 rc.3 完全一致（`mP3x-q_*` / `an3WzG_*` / `acoR2W_*` / `AnXs9G_*` / `olCj9W_*` / `V7pFBG_*` / `F07MqG_*` / `eze_pW_*`），主结构无需改动。
- **稳定锚点仍在**：`data-slot` / `data-conversation-content` / `data-phase` / `data-dockkit-*` / `data-sidebar-right-panel` / `data-shortcut-modal` 全部存在；claude-style 0.19.5 的 160 个 `data-dsh-claude-part` 值也未变。
- **第三方包哈希未变**：`IIa07q_shell`（dsh-mnemon 0.5.36）、`nUhMVa_panelHost`（dshmarket 1.70.2）、`bdiHEa_paneBody` / `nArs4W_paneCard`（dsh-better-sidebar 0.28.2）。
- **实机像素复核**：主栏卡片圆角、四周缝隙与内描边、左栏玻璃、标题带蓝光均正常（缝隙 `(50,54,67)`、卡片 `(21,21,23)`、标题带峰值 `(55,68,107)`）。

### 修复

- 插件市场「源」下拉与轨迹轮次预览卡此前一直是纯实色板——选择器在 rc.3 就已失效，这次重新定位：
  - `fO69Vq_registry` → `V7pFBG_registry`（随插件市场页前缀一起变成 `V7pFBG_`）
  - `xpvNua_preview` → `SNx2jG_preview`（轨迹模块换了哈希前缀）

  两处连同 `prefers-reduced-transparency` 降级块一并更新。

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
