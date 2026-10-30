# dsh-illuminating-skin

**IntelliJ IDEA 深色界面风格的 DeepSeek Harness 毛玻璃皮肤。** 主栏是一条四周留缝的浮起卡片，左栏整列与窗口标题带连成一块玻璃，所有浮层统一磨砂。以样式注入为主（不调用宿主 API），仅内置一个标题栏发光颜色切换按钮，用原生 DOM 挂进会话头右侧的工具区。

`DSH 0.2.1-rc.5` ｜ `dsh-claude-style >= 0.19.0` ｜ `GPL-3.0`

---

## ⚠️ 前置要求：必须先安装 dsh-claude-style

本插件是**叠加在 [dsh-claude-style](https://www.npmjs.com/package/dsh-claude-style) 布局之上**的视觉层，不是独立皮肤。请先安装 `dsh-claude-style`，并把它设置里的「配色」改为**跟随宿主**（`palette: host`）。

**为什么依赖它**：本插件的会话列卡片、右栏卡片、窗口标题带整合、「智能体团队 / PTC 模式」两个 chips 的定位，全部挂在 claude-style 给宿主元素打上的 `data-dsh-claude-part~="..."` 标记与它重排后的几何上。没有 claude-style，这些标记不存在，规则整体不命中。

**未安装时会怎样**：左栏玻璃、`body::before` 光晕、标题带蓝光，以及设置 / 搜索 / 菜单 / tooltip / toast 这些浮层仍然生效；但主栏与右栏的卡片、两栏对齐、标题带与会话头的衔接、chips 位置都会退化回宿主默认，观感明显不完整。

---

## 安装

### 方式一：从 npm（发布后）

```bash
dsh plugin --profile desktop add dsh-illuminating-skin
```

### 方式二：直接从 GitHub

```bash
dsh plugin --profile desktop add github:<owner>/dsh-illuminating-skin
```

### 方式三：本地目录（开发时）

```bash
dsh plugin --profile desktop add link:/absolute/path/to/dsh-illuminating-skin
```

> **Windows 桌面端注意**：desktop profile 只能用它自带的 carrier CLI 管理插件，路径类似
> `%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd`。
> 从 npm 全局安装的 `dsh` 会拒绝 desktop profile（"managed exclusively by the Electron application"）。

### 方式四：手动

1. 把本仓库放到 `$DSH_HOME/plugins/dsh-illuminating-skin`。
2. 在 profile 的 `package.json` 里加 `dependencies`：
   `"dsh-illuminating-skin": "link:<绝对路径>"`。
3. 在同一文件的 `dsh.profile.bundles` 数组里追加 `"dsh-illuminating-skin"`。
4. 在 profile 目录跑 `pnpm install`。

### 生效方式

安装或改动 `lib/client.js` 后**必须重启 DeepSeek Harness 桌面端**——client bundle 在 web boot 阶段装配，刷新页面不生效。

> ⚠️ 任何 bundle 条目激活失败都会**中止 web boot**，并把 desktop profile 自动打回核心-only（`dsh.profile.bundles` 只剩 base 与 web-app，旧配置留在 `cordis.patch.yml.bak-*`）。所以建议一次只装一个主题插件，装完立刻重启验证。

---

## 效果

| 区域 | 处理 |
| --- | --- |
| 画布 | 断开宿主的不透明链（`html` / `body` / `#root` / 窗口框架全部透明），`body::before` 自绘中性冷灰光晕衬底 |
| 侧栏 | 整列（品牌区、导航、工作区树、底部用户区）统一为一块玻璃：内部嵌套面板的背景全部清空，消除上深下浅的色阶断层 |
| 窗口标题带 | IDEA 式蓝色径向渐变从标题带中央透出，两端收敛回基色；会话标题、原生菜单压在其上不被染色。标题带就是 `body::before` 的顶部切片（高度取宿主变量 `--dsh-windows-titlebar-height`，代码里不写死数字），与左栏同一平面，因此标题带下缘不可能出现接缝 |
| 顶部发光 | 标题带的光色由单一变量 `--is-glow-rgb` 驱动：标题带中央光晕、卡片缝隙、设置/对话框面板顶光同源联动。会话头右侧有一个色点按钮，提供六套预设与自定义取色，选择写入 `localStorage`，重启后保持 |
| 玻璃卡片（可选） | 打开开关后，主栏与右栏换成由「主题色 + 底色」混合出的**平铺色**（`--is-card-fill`）：不采样背景、不做模糊；缝隙、圆角与 `.5px` 内描边不变 |
| 主栏卡片 | 会话列是一条距上 4px、右 8px、下 8px、左 4px 的圆角卡片，缝隙直接露出画布玻璃；右栏打开时右边缝隙收到 4px 与左栏对称 |
| 右栏卡片 | 面板本身即卡片（圆角 + 内侧 .5px 白线），内部 dockkit 拖拽格、better-sidebar 的面板壳全部清零边框与底色；顶部标签行不随内容滚动被压住，滚动区顶部 16px 渐隐 |
| 路由页 | 插件、插件市场、自动化任务、上下文洞察、记忆系统五页与主栏卡片同参（圆角 16px、内描边 .5px、留缝 4/8/8/4）。五页是两套实现：宿主插件页 / 自动化任务 / 上下文洞察 / 记忆系统是「裁剪壳 + 内部滚动区」，插件市场（dshmarket）是「容器即卡片 + 内部 `body` 滚动」，两者分别处理以保证滚动条落在卡片内 |
| 浮层 | 设置面板、Ctrl+K 搜索窗口、各类菜单、hover 卡、插件市场源下拉、字体提示 popover、dockkit 浮窗、轨迹轮次预览卡、tooltip、toast 统一为 `blur + 色阶 + 内描边` 的磨砂材质 |
| 消息气泡 | 发送瞬间的「飞行副本」全程隐藏（claude-style 会先用一个左偏、半透明、无时间戳的副本从输入框位置飞向右侧），按下发送后直接出现最终居右气泡；入场动画换成 220ms 的 `scale(.94)` + 淡入，不再从 `scale(0)` 放大、不再露出消息区深底 |
| 字体 | 覆盖 `data-dsh-claude-typeface="claude"` 下的 5 个字体栈（`--dsw-font-family` / `--dsh-claude-font-serif` / `-prose` / `-code` / `-brand`），把 dsh-claude-style 指向但包内并不存在的 Anthropic 字体名剔除，消除控制台 3 条 `AnthropicSansWebText.ttf` / `AnthropicMonoWeb.ttf` / `AnthropicSerifWebText.ttf` 404 |

## 顶部发光切换器

会话头右侧（claude-style 给工具区打的 `header-utilities` 标记里，与「…」并排）有一个圆形色点按钮。点开是一块玻璃下拉面板：六套预设 + 一行自定义取色。

| 预设 | 色值 |
| --- | --- |
| 黛蓝（默认） | `#4864C1` |
| 天青 | `#3894BE` |
| 竹青 | `#3E9E78` |
| 紫檀 | `#7E5CC4` |
| 赭石 | `#C47C3E` |
| 胭脂 | `#C2566E` |

选中的颜色写在 `document.documentElement` 的 `--is-glow-rgb` 上（形如 `72, 100, 193`），并持久化到 `localStorage['dsh-illuminating-skin:glow']`。样式表里所有发光处都用 `rgba(var(--is-glow-rgb, 72, 100, 193), α)` 取色，所以换色不需要改任何规则：

- `body::before` 的标题带中央光晕与卡片缝隙
- 设置面板、通用对话框的顶部高光

自定义取色用原生 `<input type="color">`，拖动时实时生效，松手即记住。

关闭面板：点面板外部（capture 阶段 `pointerdown`）、按 `Esc`、或再点一次按钮。

> 找不到宿主锚点时按钮不会挂载，插件其余部分照常工作。

### 玻璃卡片开关

同一面板底部还有一行「玻璃卡片」开关。开启后，主栏与右栏从「透出背景的磨砂玻璃」换成一块**平铺的混合色**——不再采样页面背景，也不做模糊：

```css
/* 深色 */
--is-card-fill: color-mix(in srgb, rgb(var(--is-glow-rgb)) var(--is-card-tint, 8%), rgb(20, 23, 30));
/* 浅色 */
--is-card-fill: color-mix(in srgb, rgb(var(--is-glow-rgb)) var(--is-card-tint, 8%), rgb(240, 242, 246));
```

两个可调参数：

| 参数 | 默认 | 作用 |
| --- | --- | --- |
| `--is-card-tint` | `8%` | 主题色占比。调高更偏色，也更亮 |
| 混合基色 | 深色 `rgb(20,23,30)` / 浅色 `rgb(240,242,246)` | 明度基准。调低更暗 |

按默认黛蓝 `72,100,193` 与 8% 混合，深色实际渲染约 `rgb(24,29,43)`。换主题色时卡片会跟着换调。

同一个颜色变量引用在五处，从头到尾一个值，避免出现台阶：

| 位置 | 说明 |
| --- | --- |
| 主栏底衬 `_centerCol::before` | 与插件页、自动化任务等路由页共用同一元素，所以两种页面天然一致 |
| 右栏面板 | 用 `background-color` + `background-clip:padding-box`（**不能用 `background` 简写**，会把 clip 重置成 `border-box`，底色涂进左侧那 4px 留缝） |
| 会话标题行 | 上下两条渐变的起点 |
| 输入框所在容器 | 挡住下方滚动的正文 |
| `--dsh-claude-fade-stops` | 从同一颜色起手，经 `color-mix(…, transparent)` 落到透明 |

**为什么不透光**：原先主栏是 `rgba(23,26,33,.88)` + `backdrop-filter`，透出来的是本插件画在最底层的 `body::before` 光晕（四层 radial + 顶端主题色光）。那层光晕本身有纵向衰减，主栏从上到下会缓慢暗 3~5 阶，与上下两条不透明的标题行 / 输入框条撞色；`backdrop-filter` 还会让整块主栏每次滚动都重算一次。改成平铺色后梯度与开销一并消失。

卡片内层容器（工具结果卡、文件行、「已编辑 N 个文件」卡）从 `--is-card-fill` 派生：混 6% / 9% / 12% 白，对应 `layer-1/2/3`，保持宿主原本 +14/+21/+28 的抬升节奏。半透明不可行——底已经是不透明平色，62% 的层会落在底色附近几阶之内，读起来等于没有卡片。

状态存在 `localStorage['dsh-illuminating-skin:card-glass']`，默认关闭。

## 配色

以 IntelliJ IDEA 深色主题为基准（`#191A1C` 内容面 / `#26282C` 外框），玻璃取外框色上调一档并去蓝紫化：

| 用途 | 深色 | 浅色 |
| --- | --- | --- |
| 玻璃基色 | `rgba(41,43,47,.94)` | `rgba(232,234,239,.94)` |
| 卡片底色 | `var(--dsw-alias-bg-base)` `#151517` | 同 token 自动落到浅色 |
| 浮层 | `rgba(28,31,38,.72)` | `rgba(248,249,251,.78)` |
| 菜单 / 搜索面板 | `rgba(28,31,38,.58)` | `rgba(247,248,250,.97)` |
| 标题带蓝光 | `rgba(72,100,193,.44)` | `rgba(120,150,228,.32)` |

## 与 dsh-claude-style 的关系

本插件**不占用** `html[data-dsh-skin]`，所以皮肤中心不会触发「交接让路」；同时所有规则都带 `html:not([data-dsh-skin])` 守卫，皮肤中心启用任何 scoped 皮肤时本插件自动退让，不会出现两套画布叠加。

claude-style 激活时（`body[data-dsh-claude-style]`）本插件接管它的画布变量（`--dsh-claude-canvas` / `--dsh-claude-sidebar-canvas` / `--dsw-specific-sidebar-fill`），**不碰** position / backdrop-filter，因此它的「会话标题进入窗口标题栏」布局原样保留；会话列卡片则是在它重排后的会话列根（带 `data-phase`、子树含 `[data-slot="conversation.content"]` 的那一层）上再叠一层盒子。

## 选择器策略

宿主每次升级都会重建 CSS module 哈希，所以新写规则请按下面的优先级挑锚点：

| 锚点 | 例 | 稳定性 |
| --- | --- | --- |
| 宿主 `data-slot` | `[data-slot="conversation.header"] > *` / `[data-slot="root"] > [class*="_frame"]` | 最稳（宿主公开的插槽标识） |
| 宿主语义属性 | `[data-conversation-content]` / `[data-phase]` / `[data-sidebar-right-open]` / `[data-sidebar-right-panel]` / `[data-pane="conversation"]` / `[data-shortcut-modal="settings"]` / `data-dockkit-*` | 很稳 |
| claude-style 标记 | `[data-dsh-claude-part~="center-column"]`（另有 160 个值：sidebar-column / layout-frame / conversation-header / header-actions / composer-seat / …） | 稳（claude-style 承诺的契约） |
| 类名后缀 | `[class*="_centerCol"]` / `[class*="_sidebarCol"]` | 中（后缀名通常不随哈希变） |
| 完整哈希类名 | `[class*="an3WzG_root"]` | 差（每次宿主升级都要重查） |

**注意**：`[data-slot="..."]` 包装元素是 `display:contents`（不生成盒子），**不能**在上面画 `background` / `::before`，只能作为 `:has()` / 后代选择器的匹配目标。

### rc.2 → rc.3 哈希对照（维护参考）

| 组件 | rc.2 | rc.3 |
| --- | --- | --- |
| 窗口 frame | `BynINW_frame` | `mP3x-q_frame` |
| 侧栏列 | `BynINW_sidebarCol` | `mP3x-q_sidebarCol` |
| 中栏列 | `BynINW_centerCol` | `mP3x-q_centerCol` |
| 会话列根 | `Dc7zOa_root` | `an3WzG_root` |
| 会话主体 | `Dc7zOa_body` | `an3WzG_body` |
| 会话头 | `Dc7zOa_header` | `an3WzG_header` |
| 右栏面板 | `OUqwTW_panel` | `acoR2W_panel` |
| 设置遮罩 | `wCInkW_mask` | `AnXs9G_mask` |
| 自动化任务页 | `S0jZwq_page` | `olCj9W_page` |
| 插件市场页 | `fO69Vq_page` | `V7pFBG_page` |
| 轨迹面板 | `v1kfCW_panel` | `F07MqG_panel` |
| 字体提示浮层 | `_VovcG_panel` | `eze_pW_panel` |
| tooltip 气泡 | `_bubble_12mhf` | `_bubble_44yfq` |

**rc.3 → rc.5 复查（2026-10-30）**：宿主与第三方包的 CSS module 哈希**一个都没变**（rc.5 仍是 `mP3x-q_*` / `an3WzG_*` / `acoR2W_*` / `AnXs9G_*` / `olCj9W_*` / `V7pFBG_*` / `F07MqG_*` / `eze_pW_*`），`data-slot` / `data-dsh-claude-part` / `data-dockkit-*` 等锚点也全部存在，主结构无需改动。只有两个浮层的类名在 rc.3 时就已经换掉、此前一直没对上：

| 浮层 | 0.3.0 里写的（失效） | 0.3.1 |
| --- | --- | --- |
| 插件市场「源」下拉 | `fO69Vq_registry` | `V7pFBG_registry` |
| 轨迹轮次预览卡 | `xpvNua_preview` | `SNx2jG_preview` |

第三方包的哈希**不随宿主升级变**（`IIa07q_shell` = dsh-mnemon、`nUhMVa_panelHost` = dshmarket、`bdiHEa_paneBody` / `nArs4W_paneCard` = dsh-better-sidebar），可以放心用。

## 六个必须记住的坑

1. **`backdrop-filter` 会创建 containing block**：给侧栏列加模糊后，宿主 `[data-windows-titlebar]` 下 `position: fixed; left: 12px` 的收起按钮会被重锚定、跑到视口外。所以玻璃一律画在 `::before` 伪元素上，列本身保持 transparent。
2. **`box-shadow` 不接受渐变**：claude-style 用 `box-shadow: 0 -52px 0 0 <canvas>` 把两列背景刷进标题带，因此那两个变量必须是纯色。当前实现直接把这层阴影去掉，把标题带交还给 `body::before`。
3. **按类名后缀匹配 header 会连带命中 6 个子类**（`headerActions` / `headerUtilities` / `headerCorner` / `headerLeading` / `headerSessionless` / `headerBlank`），给 header 上玻璃必须逐个 `:not()` 排除，否则标题栏里的按钮会被各涂一层。0.3.0 改用 `[data-slot="conversation.header"] > *` 从根上避开了这个问题。同理，哈希类名用 `class~=` 精确匹配，别用 `class*=`。
4. **留缝不能用 margin 或 padding**：列上的 margin 会压缩它内部含会话头的子元素、把 chips 裁掉；右栏改用 `border-*-color: transparent` + `background-clip: padding-box` 才能在不移动内容盒的前提下留出玻璃缝。路由页根带 `width:100%` 时必须补 `width:auto`，否则 margin 会把盒子推出窗口右缘、滚动条跑到卡片外。
5. **`[data-dsh-claude-send-flight]{visibility:hidden}` 是 claude-style 的原意**，不是 bug：它藏住的正是那个飞行副本。曾经反过来改成 `visible` 试图「别露底」，结果副本反而更显眼。要消掉中间态就继续隐藏副本（本插件隐藏 `[data-dsh-claude-send-ghost]` 与 `.dsh-claude-enter-bubble/-card`），并保留 `visibility/opacity` 而**不要**用 `display:none`——后者会掐断动画链，真气泡接管时可能不出现。
6. **CSS module 哈希类名会随宿主升级整体变掉**（rc.3 → rc.5 这次恰好没变，但不能指望下次也不变，每次升级都要复查）。DSH 从 0.2.1-rc.2 → rc.3 时三十多个类名全部重建，按哈希写死的选择器一次性全失效——表现就是「主栏圆角卡片忽然没了」。现在主结构一律改用属性锚点，哈希只留给浮层兜底。

## 已知限制

- **强依赖 dsh-claude-style**：见文首前置要求。独立运行会退化。
- **浮层仍有哈希兜底**：设置遮罩、通用对话框、hovercard、tooltip / toast、轨迹面板、dockkit 浮窗、字体提示、路由页（自动化任务 / 插件市场）仍按哈希匹配。宿主升级后若个别浮层失去磨砂，属于已知情况，需要对照上一节的对照表重新定位——主结构不受影响。0.3.1 已把「插件市场源下拉」与「轨迹预览卡」对齐到 rc.5 的名字。
- **运行时只有切换器**：唯一的 JS 是顶部发光按钮的挂载与重挂（`MutationObserver` 只检查 `isConnected`，不轮询、不做布局测量）。因此不能自适应宿主新出现的自定义面板，新面板需要单独加规则。
- **浅色主题未实测**：配对了一套浅色取值，但只在深色下验证过。
- **玻璃卡片是平涂色**：卡片不采样背景，侧栏玻璃的侧光不会渗进主栏，卡片左右两段观感一致；代价是没有「透出壁纸」的层次，只剩主题色调。要改明度调混合基色，要改色相调 `--is-card-tint`。

## 文件

```
dsh-illuminating-skin/
├── lib/
│   ├── index.js        # host half，空实现（无路由、无工具、无服务），保证不会拖慢 profile 启动
│   └── client.js       # browser half，向 document.head 追加一个 <style>；两种模式（claude-style 激活 / 普通 DSH）；末尾是顶部发光切换器的挂载逻辑
├── cordis.patch.yml    # 把 host half 注册进 profile 的 bundle 层
├── package.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## 开发

```bash
npm run check    # node --check lib/client.js && node --check lib/index.js
```

全部样式都在 `lib/client.js` 里由字符串数组拼成一份 CSS，运行时逻辑（发光切换器）也在同一文件末尾，改完重启桌面端即可看到效果。没有构建步骤、没有依赖、没有 TS。

## 许可证

[GPL-3.0](./LICENSE)
