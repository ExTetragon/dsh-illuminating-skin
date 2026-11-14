# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.5.0] - 2026-11-14

皮肤可以脱离 dsh-claude-style 独立使用。装了 claude-style 时行为与 0.4.18 一致。

### 新增

- **独立模式**：运行时检测当前环境，在 body 上写入 `data-is-mode="standalone|cs|bot"`，全部样式按它切换；启用 / 停用 claude-style、进出 ds-bot 界面都会实时切换，无需重装。
- **标题进入顶栏**（独立模式、Windows）：会话标题放到原生菜单右侧，视图标签居中常驻，工具区与右栏按钮靠在窗口按钮左侧。只测量菜单右缘、窗口按钮宽度与标签条宽度三个值，其余定位由 CSS 完成；找不到的部件保持宿主原位。标签外框保持可拖动，只有标签胶囊与「···」不可拖动，标题栏仍可拖动窗口、双击最大化。
- 外观菜单新增「标题进入顶栏」开关（仅独立模式 + Windows 显示，默认开启）。
- 独立模式下沿用宿主自带的上下文占用环与消息导航，改用发光色。

### 修复

- 插件页、自动化任务等没有会话头的页面不显示外观按钮。现在退回挂在 body 上、固定在标题栏右侧。
- 挂在 body 上的外观按钮点不动：按钮被插在外框之前，Chromium 按文档顺序合并 `-webkit-app-region`，外框的拖动条盖住了按钮。改为追加到 body 末尾。

### 变更

- 旧的「无 claude-style」玻璃叠层（mode 1）只保留给 ds-bot 界面；独立模式改用与 claude-style 模式共用的卡片规则。
- README 与 package.json：dsh-claude-style 由「必须」改为「可选」，补充两种使用方式的区别。

### 已知限制

- 独立模式下输入框保持宿主样式，重绘推迟到 0.5.1。
- 独立模式下没有 claude-style 提供的「聊天 / 代码」切换按钮。

## [0.4.18] - 2026-11-14

ds-bot 界面恢复标题栏拖动与双击最大化。

### 修复

- **bot 界面下标题栏无法拖动、双击不能最大化**：宿主页面上唯一的窗口拖动区域，就是外框 `_frame::before` 顶部那条标题栏高度的伪元素（`-webkit-app-region:drag`）。0.4.12 为了去掉 bot 模式下多出的外框玻璃，把这个伪元素整个 `display:none`，拖动区域随之消失。现在只清掉它的背景与模糊，并把它恢复成顶部 40px 的透明拖动条。

## [0.4.17] - 2026-11-14

视图标签条（对话 / 阅读 / 轨迹…）常驻显示。

### 变更

- claude-style 把标签条移进标题栏后默认透明，只在鼠标位于主栏卡片或标签条本身时淡入；鼠标移到侧栏或标题栏空白（拖动区域，收不到悬停）就淡出。现在去掉淡入淡出，标签条一直显示。是否渲染仍由宿主决定：会话已开始、且注册了不止一个视图时才出现。

## [0.4.16] - 2026-11-14

轨迹 / 上下文页顶部不再被渐变条遮挡；聊天 / 代码切换按钮与视图标签外观统一；浅色提示框文字可读。

### 修复

- **轨迹、上下文页顶部渐变条遮住内容**：claude-style 在会话头下方画了一条渐变（`conversation-header::after`，彩色卡片下高 56px），用来柔化滚到头部下面的对话。轨迹页的筛选栏、上下文页的「刷新 / 打开 Web UI」按钮紧贴在头部下面，被这条渐变盖住。现在只有对话和阅读两个视图保留渐变，其余视图隐藏。
- **聊天 / 代码切换按钮与视图标签不一致**：claude-style 的界面切换按钮（装了 ds-bot 才出现）选中项用实心 bg-base，而旁边的视图标签用半透明 overlay 胶囊，两者透明度不同。浅色主题下改用同一套底槽与选中填充；深色主题两者本来一致。
- **浅色主题下提示框文字是白色**：宿主提示框把文字色写死为白色（默认底色是深色），而本皮肤把浅色主题的提示框底改成了近白色，文字因此看不清。浅色主题下改用主文字色。

## [0.4.15] - 2026-11-14

全面检查后清理冗余叠层、修正两处监听问题。

### 修复

- **主栏卡片描边画了三层**：会话根节点、中栏 `::before`、中栏 `::after`（彩色卡片）各有一圈 0.5px 内描边，叠成一条更粗更深的边。现在只保留 `::after` 这一层，并对彩色卡片开 / 关两种情况都生效。
- **外观菜单的主题监听不清理**：`themeObserver` 只在 `beforeunload` 断开，每次热重载都残留一个。改为在 effect 的清理函数里断开。
- **输入框守卫监听过宽**：原先监听 body 下所有属性变化，空闲 4 秒触发 24 次回调、303 条记录。改为只监听 `class` / `style` / `hidden` / `aria-selected` 和 claude-style 的两个输入框标记，同样场景降到 5 次、12 条。
- **右栏选择器过宽**：`[data-sidebar-right-panel] [class*="pane"]` 会把 better-sidebar 的 pane 标签、diff / html 面板等一并去掉边框和背景。收窄为只匹配外框容器（`*_pane`、`paneCard`、`panelBody`、`paneContent`、`tabBody`）。
- **浅色主题下「彩色卡片」开关打开时仍显示灰色**：浅色专用的灰底规则优先级更高，盖住了开启态的主题色。

### 清理

- mode 1 的外框 `::before` 不再先写一次侧栏玻璃再被覆盖。
- 删除彩色卡片下两条不生效的 `prefers-reduced-transparency` 规则（目标元素本身没有 `backdrop-filter`）。

## [0.4.14] - 2026-11-14

插件页卡片左上角恢复圆角。

### 修复

- 插件管理页的吸顶头 `[data-plugin-bar]::before` 是一块从卡片左上角开始的直角不透明底（用来遮住滚动的列表），盖住了中栏 `::before` 卡片的 16px 圆角，所以左上角是尖的；右上角因为滚动条让出了宽度，看起来仍是圆的。页面根节点本身就是滚动容器，不能加 `overflow:clip`，因此改为给这块底板自己加上 `16px 16px 0 0` 的圆角。

## [0.4.13] - 2026-11-14

彩色卡片开启时，主栏里的吸顶条不再是白色。

### 修复

- **阅读视图折叠条白底**：dsh-better-display 的折叠摘要行（`turnProcessSticky` / `closedProcessSummary` / `liveFoldContainer` 及其 `box-shadow` 补边）用 `--dsw-alias-bg-base` 铺不透明底，好让正文从下面滚过时被遮住。彩色卡片下卡片色是 `--is-card-fill`，而 bg-base 仍是宿主原值（浅色主题为纯白），于是折叠条成了白色横条。
- **插件页顶部白底**：插件管理页吸顶头 `.V7pFBG_pageBar[data-natural]::before` 同样用 bg-base 铺底，问题相同。
- 两处一并处理：彩色卡片开启时，在中栏内把 `--dsw-alias-bg-base` 指向 `--is-card-fill`。`--is-card-fill` 不读取 bg-base，不会循环引用。

## [0.4.12] - 2026-11-14

DS-Bot 界面改为与默认界面一致的「一整块玻璃 + 一张卡片」渲染。

### 修复

- **根因**：bot 模式下 dsh-claude-style 会撤掉 `body[data-dsh-claude-style]`，皮肤落入 mode 1，外框 / 中栏 / header / 内容区四层玻璃叠在光晕上。bot 分支现在用 `BOTX`（`:not(#is-bot)` 提权）整体撤销这层叠加，并按 mode 2 重建单张主栏卡片。
- **左栏、标题栏、窗口按钮色差**：`--bt-leftcol-fill` 与 body 上的 `--dsw-specific-sidebar-fill` 改为透明。宿主把后者测出来设成原生窗口按钮底色（`setTitleBarOverlay`），透明后按钮区与标题带连成一片；中栏内部仍还原为 bg-base。
- **主栏多张宽度不同的卡片**：去掉 `[data-conversation-content]` 的 8px 卡片、header 玻璃带与输入框座位的填充，只保留中栏 `::before` 一张卡（彩色卡片开时用 `--is-card-fill`）和 ds-bot 自己的输入卡。
- **外观按钮落在标题栏下方**：0.4.11 把按钮挂进 ds-bot header，而 header 带 `backdrop-filter`，`position:fixed` 以它为包含块，按钮落到 y≈46。bot 模式下改挂 `body`，固定在标题栏内、窗口按钮左侧。

## [0.4.11] - 2026-11-14

适配 ds-bot（团队外壳）模式：bot 模式下皮肤不再被它的浅色调色板和不透明条带盖掉。所有规则都以 `body:has(.bt-leftcol)` 为前提，退出 bot 模式即恢复原样。

### 新增

- **ds-bot 配色**：ds-bot 通过 `ctx.theme.overrideTokens()` 把宿主 `--dsw-*` 表面 token 改成自己的浅色值（窗口按钮因此变白），在 body 上按深 / 浅主题分别重申本皮肤的取值，并重配 ds-bot 自己的 `--bt-*` 调色板，让玻璃面板上的文字保持可读。
- 去掉 ds-bot 画在居中标题胶囊背后的 60px 不透明渐变条；给被 ds-bot 改写的输入框补回 `--is-card-fill`，「彩色卡片」开关在 bot 模式下重新生效。
- **切换器挂载**：bot 模式下宿主工具栏被挤成零宽，切换器改挂到 ds-bot 的 header 上并固定在右上角；`MutationObserver` 在进入 / 退出 bot 模式时重新选择挂载点。

### 修复

- 无 claude-style 时（例如 ds-bot）浅色主题下会话头仍是深色玻璃带，补上 `GLASS_LIGHT` 分支。

## [0.4.10] - 2026-11-14

修复 0.4.9 引入的回归：主栏圆角卡片整体消失。

### 修复

- 0.2.2-rc.1 把会话主体 slot 从 `conversation.content` 改成了 `main` / `main.conversation`，0.4.9 删掉哈希并列分支后，`[data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"])` 整条判空，会话列的圆角/留缝/内描边/裁剪一起失效。
- 判定改用常驻的 `:has(> [data-slot="conversation.header"])`（5 处），header slot 在无会话时也存在，并能排除另一个带 `[data-phase]` 的输入框。
- README 的锚点清单与「坑」列表同步：新增第 7 条说明 slot 名会随宿主重构改名。
## [0.4.9] - 2026-11-14

把最后一批宿主侧硬编码 CSS module 哈希全部换成宿主语义属性锚点，DSH 升级不再需要逐个重查浮层类名。

### 变更

- 浮层锚点：设置遮罩改用 `div:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"]`（删掉冗余的哈希分支）；通用对话框遮罩/面板改用 `div[role="presentation"] > [aria-hidden="true"]` 与 `div[role="presentation"] > [role="dialog"][aria-modal="true"]:not([data-shortcut-modal])`；复制/链接悬浮卡用 `[style*="--dsh-hover-preview-fade"]`；Tooltip 用 `[role="tooltip"][data-side]`；Toast 用 `[style*="--dsh-toast-hold"]`。
- 面板锚点：插件市场「源」下拉 → `[data-install-registry]`；字体缺失提示 → `[role="dialog"]:not([aria-modal="true"])`；dockkit 浮窗 → `[data-dockkit-float]`；轨迹轮次预览卡 → `[role="tooltip"]:not([data-side])`；发送队列 dock → `[data-queue-dock]`；自动化任务页 → `[data-testid="task-manager-page"]`；插件管理/市场页 → `[data-plugin-panel]`；「已编辑 N 个文件」卡 → `[data-changed-files]`；思考块 → `[data-variant="think"]`。
- 会话列根删掉 `[class*="an3WzG_root"]` 并列分支，统一走 `[data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"])`。
- README 新增「属性锚点清单」；「六个坑」第 6 条与「已知限制」同步改写。

## [0.4.8] - 2026-11-14

外观菜单最下方新增主题切换，可在浅色 / 深色 / 跟随系统之间循环。

### 新增

- **主题切换**：面板底部一行「主题」，pill 显示当前偏好，点击按 跟随系统 → 浅色 → 深色 → 跟随系统 循环；从「跟随系统」进入时按当前实际外观取反并固化。走宿主 `ctx.theme.setTheme()`，原生标题栏与 claude-style 配色一起跟随。
- `lib/client.js` 的 factory 返回值补上 `inject: ["theme"]`（cordis 要求先声明才能访问服务，否则整个切换器挂载失败）。

## [0.4.7] - 2026-11-14

适配 DSH 0.2.2-rc.1：五个浮层的 CSS module 哈希改名已逐个对齐，输入框守卫补上只在对话标签页生效与防抖动逻辑。

### 变更

- 浮层哈希更新：`_card_38jqx`→`_card_bgejw`、`_toast_l6cvn`→`_toast_hr9yd`、`_dialog_o6lrb`→`_dialog_14mp3`、`_mask_o6lrb`→`_mask_14mp3`、`_float_6nhg2`→`_float_3oazc`。
- 输入框守卫新增 `onChatTab()` 判定与「已生效就不再 release/force」的防抖动，避免非对话视图强制显示输入框、以及每轮采样造成的闪烁。

## [0.4.6] - 2026-11-07

适配 DSH 0.2.2 的会话头结构，并补上输入框被第三方插件隐藏时的兜底。

### 新增

- **输入框守卫（composer seat guard）**：监视宿主自己的 `[data-composer-seat]`，记住宿主在可见状态下给它的 `display`，一旦被别的插件算成 `none`，就用内联 `!important` 还原并打一条 `console.warn`。起因是 dsh-claude-style 0.19.6 只用「`[data-conversation-tabs]` 里第一个 `[role="tab"]` 是否 `aria-selected`」判断当前是不是对话视图，而宿主 0.2.2 把「对话」固定在第一，于是任何非对话视图（例如阅读视图）都会被判成仅检视、整块隐藏输入框。守卫不点名对方的任何属性：宿主换了 display 值它跟着走，对方改了属性名它就自动不再触发。

### 修复

- **会话头按钮只剩上半缘**：宿主 0.2.2 把 `headerActions` 挂进了 `titleCluster`，而本皮肤早先为了让 team / PTC chips 避开卡片上缘给它加过 `top:22px`，按钮被推到 `titleCluster` 的裁剪窗口之外。只加 `overflow:visible` 不够——元素带 `mask-image` 时 Chrome 的 `mask-clip` 默认是 `border-box`，溢出内容同样会被 mask 的绘制区域裁掉（视觉不可见、`elementFromPoint` 会穿透到 `header`）。改为同时清掉该节点的 `overflow` 与 `mask-image`；标题横条早已由 claude-style 固定到系统标题栏，去掉这个横向淡出没有视觉损失。
- **bili 上游不可用横幅**：`[data-shell-overlay]` 里带 `rgba(217,63,11,…)` 内联橙色的 `[role="status"]` 会盖住页面，已隐藏（覆盖有空格与无空格两种序列化形式）。

## [0.4.5] - 2026-10-30

颜色菜单里的开关名称改为「彩色卡片」。

### 变更

- 开关文案由「玻璃卡片」改为「彩色卡片」，与卡片当前的材质一致——它是「主题色 + 底色」混合出的平铺色，既不采样背景也不做模糊，叫玻璃会误导。
- 同步更新 aria-label（「主栏与右栏使用彩色卡片」）与 README 中的三处命名。

## [0.4.4] - 2026-10-30

玻璃卡片改用「主题色 + 底色」混合出的平铺色，不再透出背景。

### 变更

- **着色原理**：主栏与右栏从 `rgba(23,26,33,.88)` + `backdrop-filter: blur(24px)` 改为单一不透明填充 `--is-card-fill = color-mix(in srgb, rgb(var(--is-glow-rgb)) var(--is-card-tint, 8%), 混合基色)`。深色基色 `rgb(20,23,30)`、浅色 `rgb(240,242,246)`，按黛蓝算下来深色约 `rgb(24,29,43)`。原先透出的是本插件画在最底层的 `body::before` 光晕，纵向衰减会让主栏从上到下暗 3~5 阶，与上下两条不透明标题行撞色；平铺后梯度消失，且省掉每帧一次模糊重算。
- **五处统一引用**：主栏底衬 `_centerCol::before`、右栏面板、会话标题行、输入框容器、`--dsh-claude-fade-stops`。
- **两个可调项**：`--is-card-tint`（默认 8%，主题色占比）与混合基色（明度基准）。换主题色时卡片跟着换调。

### 修复

- **右栏左侧留缝被涂满**：玻璃填充原先写成 `background` 简写，会把 `background-clip` 重置回 `border-box`，卡片色涂进面板那 4px 透明左边框，渲染范围比 `.5px` 描边宽 4px。改用 `background-color` + 显式 `background-clip:padding-box`。
- **内层容器在平色底上消失**：宿主 `--dsw-alias-bg-layer-1/2/3` 与 `.HOHHba_card` 仍是 `.62` 半透明，叠在不透明平色上落在底色几阶之内，卡片读起来等于不存在。改为从 `--is-card-fill` 派生——`layer-1/2/3` 混 6% / 9% / 12% 白，变化卡混 8% 白，保持宿主 +14/+21/+28 的抬升节奏。
- **主栏背景加深**：混合基色 `rgb(25,29,38)` → `rgb(20,23,30)`，渲染值 `rgb(29,35,50)` → `rgb(24,29,43)`。
## [0.4.3] - 2026-10-30

按实测反馈修正玻璃卡片的材质与残留实色。

### 修复

- **透明度**：玻璃底 `.62` → `.84`（浅色 `.88`），与设置面板同档。
- **上下两条灰条**：claude-style 的转录区淡出遮罩（`--dsh-claude-fade-stops`）原本用 `--dsw-alias-bg-base` 作渐变终点，落在玻璃上就是两条实色横带。改为把该变量置为全透明，两个伪元素都不再绘制。
- **底部文字穿透**：输入框所在的 `[data-composer-seat]` 改为 `rgba(28,31,38,.55)`（浅色 `rgba(248,249,251,.55)`）——因为它叠在卡片玻璃内部，用低 alpha 就能挡住下方滚动的正文。
- **「深度求索中」状态条**：`[data-chat-running]` 的 `--dsh-claude-canvas` 直接置为 `transparent`。
- **表格右缘缺失**：「宽表钳宽」两条规则原本只在玻璃模式生效，现在对所有 claude-style 模式生效——卡片边距让列宽比宿主假定值窄 12px，`table-scroll` 的 0.5px 右边框会掉出裁剪区。
- **「已编辑 N 个文件」卡片**：宿主 `.HOHHba_card` 用实色 `--dsw-alias-bg-layer-1` + `neutral-850` 标题带，玻璃模式下改为 `rgba(30,33,39,.62)`，标题带透明。
- **其余宿主容器**：在主栏子树内重映射 `--dsw-alias-bg-layer-1/2/3` 为半透明玻璃色，工具结果卡、文件行等一次性跟随，侧栏/菜单/弹窗不受影响。

## [0.4.2] - 2026-10-30

玻璃模式下的 markdown 表面与右栏细节。

### 修复

- 代码块、代码块标题带、表头、行内代码的四个 token 改为按原深浅顺序排列的半透明玻璃色。
- 右栏 tab 条透明，滚动区顶部渐隐从 16px 加长到 32px，正文不会穿到标签行上。
- 「宽表钳宽」首次引入（当时仅玻璃模式生效）。
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
