// dsh-illuminating-skin — BROWSER half.
//
// IntelliJ IDEA (dark) in DSH form: one continuous L-shaped slab of glass
//
// Two cooperating modes (v11, 2026-10-20):
//
// 1) plain DSH (no claude-style): this plugin owns the surfaces. The glass
//    slab is painted on <[data-slot="root"] > [class*="_frame"]>::before /
//    <[class*="_sidebarCol"]>::before
//    and directly on the main-workspace header.
//
// 2) claude-style active (body[data-dsh-claude-style]): claude-style already
//    owns layout, positioning and the titlebar hand-off (view-tabs is
//    position:fixed into the title band, columns are shadow-extended upward).
//    We therefore ONLY re-tint its canvas variables — never position,
//    background or backdrop-filter on its elements — so its layout survives:
//        --dsh-claude-canvas          (layout frame + centre column)
//        --dsh-claude-sidebar-canvas  (sidebar column)
//
// Note: Skin Center removes html[data-dsh-skin] for *delegated* skins, so
// claude-style activation is detected by the body attribute instead.
//
// Both modes also add an IDEA-style blue radial in the 52px Windows title
// band (see TITLEBAR_GLOW): the band is flat glass otherwise, while
// IntelliJ bleeds an indigo glow out of its centre.
//
// Renders no UI of its own: it appends one <style> element.

window.__ModuleLoader__.load({
  id: 'dsh-illuminating-skin',
  factory: () => {
    const STYLE_ID = 'dsh-illuminating-skin'

    // Only when Skin Center has *not* applied a scoped skin stylesheet.
    const G = 'html:not([data-dsh-skin])'
    const CS = 'body[data-dsh-claude-style]'
    const WITH_CS = G + ' ' + CS
    const WITHOUT_CS = G + ' body:not([data-dsh-claude-style])'

    // Sidebar / header / frame selector used in plain-DSH mode.
    const SIDEBAR = WITHOUT_CS + ' [class*="_sidebarCol"]'
    const HEADER = WITHOUT_CS + ' [data-slot="conversation.header"] > *'
    const FRAME = WITHOUT_CS + ' [data-slot="root"] > [class*="_frame"]'

    // IntelliJ IDEA "Dark" reference palette (sampled from the user's shot):
    //   content surfaces  #191A1C  (25,26,28)   editor / trees / tool windows
    //   chrome            #26282C  (38,40,44)   rails, toolbars, status bar
    //   selected row      #33353B  (51,53,59)
    // The glass stands in for the *chrome*, so it is keyed to #26282C — one
    // notch lighter so the blur still reads as translucent, and desaturated
    // to match IDEA's neutral grey instead of the previous blue-violet.
    // Solid colour only: this value also feeds claude-style's box-shadow.
    const GLASS_SOLID = 'rgba(41,43,47,.94)'
    const GLASS_SOLID_LIGHT = 'rgba(232,234,239,.94)'

    const GLASS =
      'radial-gradient(900px 620px at 12% 0%,rgba(104,116,138,.10),transparent 70%),' +
      'linear-gradient(180deg,rgba(96,104,120,.05) 0%,rgba(96,104,120,0) 40%,' +
      'rgba(96,104,120,0) 70%,rgba(96,104,120,.05) 100%),' +
      'rgba(41,43,47,.94)'
    const GLASS_LIGHT =
      'radial-gradient(900px 620px at 12% 0%,rgba(255,255,255,.45),transparent 70%),' +
      'linear-gradient(180deg,rgba(150,158,172,.10) 0%,rgba(150,158,172,0) 40%,' +
      'rgba(150,158,172,0) 70%,rgba(150,158,172,.10) 100%),' +
      'rgba(232,234,239,.94)'

    // The column glass sits UNDER the card, so it only ever shows as the 8px
    // gutter — a strip that read as "still dark" when it reused GLASS: that
    // recipe is tuned to blend into the sidebar's glowing backdrop, and over
    // the flat column it landed on its own ~(41,43,47) base. This variant is
    // lighter and carries the same centre blue bleed as the title band, so the
    // gutter reads as one continuous surface with the band above it.
    const FRAME_GLASS =
      'radial-gradient(ellipse 62% 380px at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.30),transparent 70%),' +
      'radial-gradient(900px 620px at 12% 0%,rgba(120,134,158,.12),transparent 70%),' +
      'linear-gradient(180deg,rgba(104,112,130,.06) 0%,rgba(104,112,130,0) 40%,' +
      'rgba(104,112,130,0) 70%,rgba(104,112,130,.06) 100%),' +
      'rgba(48,52,62,.95)'
    const FRAME_GLASS_LIGHT =
      'radial-gradient(ellipse 62% 380px at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.22),transparent 70%),' +
      'linear-gradient(180deg,rgba(150,158,172,.10) 0%,rgba(150,158,172,0) 40%,' +
      'rgba(150,158,172,0) 70%,rgba(150,158,172,.10) 100%),' +
      'rgba(224,228,236,.95)'

    // IDEA's title band carries a blue radial bleeding out from its centre;
    // DSH's 52px Windows band is flat glass. These add the bleed.
    //
    // Absolute lengths on purpose. With percentages the light was anchored to
    // the layout frame's own box, which measures far wider than the viewport
    // (its 50% landed at x≈1275 in a 1721px window), so the centre drifted
    // right and the sidebar only ever saw the rising left flank — a purely
    // horizontal ramp with no sense of a source. calc(50vw) pins the light
    // under the middle of the window, and an absolute vertical radius makes it
    // fall away downward, as if it were entering from the title bar.
    //
    // The vertical radius is deliberately short (560px): with it long the
    // light barely changed from the title band down to the footer, so the
    // sidebar read as a purely horizontal ramp. A short one makes the light
    // visibly die away downwards — brightest under the top edge, gone by
    // mid-column — which is what sells "light entering from above".
    const TITLEBAR_GLOW =
      'radial-gradient(ellipse 1050px 560px at calc(50vw) 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.44) 0%,' +
      'rgba(var(--is-glow-rgb, 72, 100, 193),.25) 42%,rgba(var(--is-glow-rgb, 72, 100, 193),.07) 72%,rgba(var(--is-glow-rgb, 72, 100, 193),0) 100%)'
    const TITLEBAR_GLOW_LIGHT =
      'radial-gradient(ellipse 1050px 560px at calc(50vw) 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.32) 0%,' +
      'rgba(var(--is-glow-rgb, 72, 100, 193),.18) 42%,rgba(var(--is-glow-rgb, 72, 100, 193),.05) 72%,rgba(var(--is-glow-rgb, 72, 100, 193),0) 100%)'

    // Floating surfaces (menus, popovers, the Ctrl-K palette).
    //
    // With palette=host claude-style forwards --dsh-claude-raised and
    // --dsh-claude-card straight to the host's --dsw-alias-bg-overlay, and
    // this build resolves that to --dsw-static-neutral-bluish-700 (#61666b).
    // Every floating surface therefore came out mid grey against the
    // #151517 workspace: the Ctrl-K palette measured exactly #61666b and the
    // sidebar hover search chip #3c3e47. Only the overlay tokens are
    // re-pointed below; the host's own body-level definitions keep their
    // layering, and claude-style reads them through var(), so its raised and
    // card surfaces follow without having to chase its class names.
    const OVERLAY_DARK = 'rgba(28,31,38,.58)'
    const OVERLAY_HEADER_DARK = 'rgba(30,32,37,.98)'
    const OVERLAY_LIGHT = 'rgba(248,249,251,.66)'
    const OVERLAY_HEADER_LIGHT = 'rgba(242,243,246,.98)'
const TOOLTIP_DARK = 'rgba(32,35,42,.82)'
const TOOLTIP_LIGHT = 'rgba(250,251,253,.94)'
const TOAST_DARK = 'rgba(30,33,40,.86)'
const TOAST_LIGHT = 'rgba(248,249,251,.92)'

    // Raised/card surfaces are NOT floating: claude-style paints cards, hover
    // rows and the search chip with them, and those sit inside the glass column
    // rather than over live content. They keep a near-solid fill so text stays
    // legible; only genuinely floating surfaces get the translucent one.
    const RAISED_DARK = 'rgba(26,28,32,.96)'
    const RAISED_LIGHT = 'rgba(247,248,250,.97)'

    // Optional glass-card mode (driven by the switcher's toggle). The card does
    // NOT sample the page any more: it paints one flat, opaque colour, which is
    // the live glow colour mixed into a dark (or light) base -- see
    // --is-card-fill. Backdrop sampling made the card fade as the glow plane
    // dimmed vertically, and every opaque band laid on top of it (header,
    // composer seat) then read as a seam against it. One flat fill removes both
    // problems at once and lets the title band keep its own glow.
    const CARD_GLASS = G + '[data-dsh-card-glass="on"] '

    // claude-style out-specifies us on the title band, so the frame and
    // column overrides below repeat their attribute selectors to win the
    // cascade instead of fighting over unrelated !important declarations.
    const CS_HS =
      'html[data-windows-titlebar]:not([data-dsh-skin]) body[data-dsh-claude-style]'
    const CS_FRAME = '[data-dsh-claude-part~="layout-frame"]'
    const CS_FRAME3 = CS_FRAME + CS_FRAME + CS_FRAME

    /* Every place the top light appears reads its colour from this one
       variable, so the switcher can re-tint the title band, the card gutter
       and the modal tops at once without touching a single rgba(). The
       fallback is the original 黛蓝 glow. */
    const CSS = [
      ':root{--is-glow-rgb:72, 100, 193}',

      /* The glass card's single fill. A flat mix of the live glow colour into a
         neutral base -- dark base for the dark theme, near-white for the light
         one -- so the card reads as a greyscale-tinted version of the accent
         instead of as a window onto the glow plane. --is-card-tint is how much
         of the accent survives the mix; raise it for a stronger cast. */
      ':root{--is-card-fill:color-mix(in srgb, rgb(var(--is-glow-rgb, 72, 100, 193)) var(--is-card-tint, 8%), rgb(20, 23, 30))}',
      'body:not([data-ds-dark-theme]){--is-card-fill:color-mix(in srgb, rgb(var(--is-glow-rgb, 72, 100, 193)) var(--is-card-tint, 8%), rgb(240, 242, 246))}',

      /* ---------- shared: glow canvas + transparent chain ---------- */
      G + ' body{background:transparent!important}',
      G + ' #root,' + G + ' [id="root"]{background:none!important}',

      /* ONE glass plane for the whole window. Every column is transparent; this
         pseudo-element is the only thing painting the frosted surface, so the
         sidebar, the centre gutter, the right-rail gutter and the 52px title
         band cannot drift apart -- there is nothing left to drift. The centred
         blue radial lives on the same layer, which is what makes the band read
         as light bleeding out of one continuous pane instead of a gradient that
         stops at a seam. */
      G + ' body::before{',
      'content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;',
      'background:',
      'radial-gradient(ellipse 1050px 560px at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.44) 0%,',
      'rgba(var(--is-glow-rgb, 72, 100, 193),.25) 42%,rgba(var(--is-glow-rgb, 72, 100, 193),.07) 72%,rgba(var(--is-glow-rgb, 72, 100, 193),0) 100%),',
      'radial-gradient(1100px 760px at 4% 10%,rgba(88,98,116,.28),transparent 62%),',
      'radial-gradient(900px 620px at 78% 6%,rgba(100,110,128,.14),transparent 66%),',
      'radial-gradient(1000px 780px at 84% 94%,rgba(64,72,86,.22),transparent 68%),',
      'rgba(41,43,47,.94);',
      '}',
      G + ' body:not([data-ds-dark-theme])::before{',
      'background:',
      'radial-gradient(ellipse 1050px 560px at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.32) 0%,',
      'rgba(var(--is-glow-rgb, 72, 100, 193),.18) 42%,rgba(var(--is-glow-rgb, 72, 100, 193),.05) 72%,rgba(var(--is-glow-rgb, 72, 100, 193),0) 100%),',
      'radial-gradient(1100px 760px at 4% 10%,rgba(206,212,224,.55),transparent 62%),',
      'radial-gradient(900px 620px at 78% 6%,rgba(216,220,230,.45),transparent 66%),',
      'radial-gradient(1000px 780px at 84% 94%,rgba(198,204,216,.45),transparent 68%),',
      'rgba(232,234,239,.94);',
      '}',

      /* ---------- floating surfaces: menus, popovers, palette ---------- */
      G + ' body[data-ds-dark-theme]{',
      '--dsw-alias-bg-overlay:' + OVERLAY_DARK + '!important;',
      '--dsw-menu-surface-fill:' + OVERLAY_DARK + '!important;',
      '--dsw-specific-menu:' + OVERLAY_DARK + '!important;',
      '--dsw-alias-menu-group-header-fill:' + OVERLAY_HEADER_DARK + '!important;',
      '--dsw-alias-tooltip-bg:' + TOOLTIP_DARK + '!important;',
      '--dsw-alias-toast-bg:' + TOAST_DARK + '!important;',
      '--dsw-menu-backdrop-filter:blur(40px) saturate(150%)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]){',
      '--dsw-alias-bg-overlay:' + OVERLAY_LIGHT + '!important;',
      '--dsw-menu-surface-fill:' + OVERLAY_LIGHT + '!important;',
      '--dsw-specific-menu:' + OVERLAY_LIGHT + '!important;',
      '--dsw-alias-menu-group-header-fill:' + OVERLAY_HEADER_LIGHT + '!important;',
      '--dsw-alias-tooltip-bg:' + TOOLTIP_LIGHT + '!important;',
      '--dsw-alias-toast-bg:' + TOAST_LIGHT + '!important;',
      '--dsw-menu-backdrop-filter:blur(40px) saturate(150%)!important;',
      '}',

      /* ---------- modal shells: the settings panel ----------------------- */
      /* A menu is painted with --dsw-specific-menu and blurred through
         --dsw-menu-backdrop-filter, which is why the Ctrl-K palette reads as
         dark glass. The settings panel is painted with --dsw-alias-bg-layer-2
         instead and got no blur at all, so it landed as a solid slab.
         Targeted by its own data-shortcut-modal marker, NOT by
         [role="dialog"][aria-modal="true"]: the search palette is a dialog
         too, and painting its outer shell stacked a second opaque layer on
         top of its own glass and killed its translucency.

         THE SCRIM IS THE REAL BLOCKER. Every other floating surface sits on
         live content, so a translucent fill has something to show through.
         Settings is the one modal that ships its own full-viewport scrim
         (.AnXs9G_mask: background:var(--dsw-alias-bg-mask-1) — 24% to 50%
         black). The panel's blur only ever sees that scrim, so at any alpha
         the result composites back to a flat near-black slab: lightening the
         fill alone could never make it read as glass. The scrim is
         therefore thinned for this overlay only, and the panel fill can then
         actually reveal the blurred workspace behind it.

         An inner blue wash and a 1px light rim are added on top because the
         workspace itself is dark: without them a 62% fill still reads flat,
         with them the surface catches the same indigo that the title band
         carries. */
      G + ' div:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"],',
      G + ' [class*="AnXs9G_mask"]{',
      'background:rgba(4,6,10,.08)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) div:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"],',
      G + ' body:not([data-ds-dark-theme]) [class*="AnXs9G_mask"]{',
      'background:rgba(20,26,38,.04)!important;',
      '}',
      G + ' [data-shortcut-modal="settings"]{',
      'background-color:rgba(28,31,38,.58)!important;',
      'background-image:' +
        'radial-gradient(120% 55% at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.13),rgba(var(--is-glow-rgb, 72, 100, 193),0) 72%),' +
        'linear-gradient(180deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,0) 30%)!important;',
      'backdrop-filter:blur(36px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(36px) saturate(150%)!important;',
      'border:1px solid rgba(255,255,255,.10)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.55),' +
        'inset 0 1px 0 rgba(255,255,255,.07)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [data-shortcut-modal="settings"]{',
      'background-color:rgba(248,249,251,.66)!important;',
      'background-image:' +
        'radial-gradient(120% 55% at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.10),rgba(var(--is-glow-rgb, 72, 100, 193),0) 72%)!important;',
      'border-color:rgba(0,0,0,.08)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.18),' +
        'inset 0 1px 0 rgba(255,255,255,.8)!important;',
      '}',

      /* ---------- modal shells: the generic confirm/prompt dialog ---------- */
      /* Same shape as settings but a different module: ._root_o6lrb_6 scrims
         with ._mask_o6lrb_18:after (mask token) while ._dialog_o6lrb_33 uses
         --dsw-alias-bg-layer-2 and no blur. Thinning the scrim is what lets the
         fill show anything at all, exactly as for settings. */
      G + ' [class*="_mask_o6lrb"]:after{background:rgba(4,6,10,.08)!important}',
      G + ' body:not([data-ds-dark-theme]) [class*="_mask_o6lrb"]:after{background:rgba(20,26,38,.04)!important}',
      G + ' [class*="_dialog_o6lrb"]{',
      'background-color:rgba(28,31,38,.58)!important;',
      'background-image:' +
        'radial-gradient(120% 55% at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.13),rgba(var(--is-glow-rgb, 72, 100, 193),0) 72%),' +
        'linear-gradient(180deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,0) 30%)!important;',
      'backdrop-filter:blur(36px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(36px) saturate(150%)!important;',
      'border:1px solid rgba(255,255,255,.10)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.55),' +
        'inset 0 1px 0 rgba(255,255,255,.07)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [class*="_dialog_o6lrb"]{',
      'background-color:rgba(248,249,251,.66)!important;',
      'background-image:' +
        'radial-gradient(120% 55% at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.10),rgba(var(--is-glow-rgb, 72, 100, 193),0) 72%)!important;',
      'border-color:rgba(0,0,0,.08)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.18),' +
        'inset 0 1px 0 rgba(255,255,255,.8)!important;',
      '}',

      /* ---------- floating cards: the copy/link hover card ---------- */
      /* --dsw-hovercard-bg is declared on the card element itself
         (._card_38jqx_9{--dsw-hovercard-bg:#2C2C2E}), so a body-level token
         override cannot reach it; the declaration has to be matched there. */
      G + ' [class*="_card_38jqx"]{',
      '--dsw-hovercard-bg:rgba(28,31,38,.72)!important;',
      'backdrop-filter:blur(24px) saturate(140%)!important;',
      '-webkit-backdrop-filter:blur(24px) saturate(140%)!important;',
      'border:1px solid rgba(255,255,255,.08)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [class*="_card_38jqx"]{',
      '--dsw-hovercard-bg:rgba(248,249,251,.82)!important;',
      'border-color:rgba(0,0,0,.07)!important;',
      '}',

      /* Tooltip and toast are the last two floating surfaces that were still
         flat: both read --dsw-alias-tooltip-bg / --dsw-alias-toast-bg, which
         resolve to a solid neutral (bluish-750/800/850) and carry no blur of
         their own. The tokens are re-pointed above (applies to every consumer
         in one shot) and the blur is added on the two bubbles themselves. */
      G + ' [class*="_bubble_44yfq"],',
      G + ' [class*="_toast_l6cvn"]{',
      'backdrop-filter:blur(20px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(20px) saturate(150%)!important;',
      'border:.5px solid rgba(255,255,255,.08)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [class*="_bubble_44yfq"],',
      G + ' body:not([data-ds-dark-theme]) [class*="_toast_l6cvn"]{',
      'border-color:rgba(0,0,0,.07)!important;',
      '}',

      /* ---------- remaining static popovers ---------- */
      /* Two floating surfaces are still painted with a flat
         --dsw-alias-bg-layer-2 fill and carry no blur at all: the
         plugin-market registry picker (插件市场 → 添加插件 → 源) and the
         typeface warning popover. Neither routes through the menu tokens,
         so both stayed solid slabs beside the glass menus.
         class~= is deliberate: [class*=] would also catch the panel's own
         *_panelHeader child and paint a rim straight through it. */
      G + ' [class~="V7pFBG_registry"],',
      G + ' [class~="eze_pW_panel"]{',
      'background-color:rgba(28,31,38,.72)!important;',
      'backdrop-filter:blur(32px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(32px) saturate(150%)!important;',
      'border:1px solid rgba(255,255,255,.09)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [class~="V7pFBG_registry"],',
      G + ' body:not([data-ds-dark-theme]) [class~="eze_pW_panel"]{',
      'background-color:rgba(248,249,251,.78)!important;',
      'border-color:rgba(0,0,0,.08)!important;',
      '}',

      /* ---------- dockkit float window & turn-preview card ---------- */
      /* The draggable dockkit panel (tasks window) and the transcript turn-
         preview card are the last two floating surfaces still filled with a
         flat layer color. Both are already bordered by their own elevation
         shadow, so only the fill and the blur change here. */
      G + ' [class*="_float_6nhg2"],',
      G + ' [class~="SNx2jG_preview"]{',
      'background-color:rgba(28,31,38,.72)!important;',
      'backdrop-filter:blur(32px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(32px) saturate(150%)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [class*="_float_6nhg2"],',
      G + ' body:not([data-ds-dark-theme]) [class~="SNx2jG_preview"]{',
      'background-color:rgba(248,249,251,.78)!important;',
      '}',
      /* ---------- send-queue dock ---------- */
      /* QueueDock (v1kfCW_) parks directly on top of the composer card and
         paints its surface through ::before with --dsw-specific-menu (.58
         overlay fill) plus a backdrop blur; ::after then draws a
         top-and-sides-only 0.5px frame. Against the #2c2c2e composer card
         that reads as a darker slab with a stray outline, and its 13px Inter
         preview made the text look like a different face from the bubble the
         same text turns into a moment later. Paint the dock as that bubble:
         bubble fill, no frame, bubble type. */
      G + ' [class*="F07MqG_panel"]::before{' +
        'background:var(--dsw-specific-bubble)!important;' +
        'backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      G + ' [class*="F07MqG_panel"]::after{border:0!important}',
      G + ' [class*="F07MqG_preview"],' +
        G + ' [class*="F07MqG_count"]{' +
        'font-family:var(--dsw-font-family)!important;' +
        'font-size:var(--dsh-content-font-size,14px)!important;' +
        'line-height:calc(22px + var(--dsh-content-font-delta,0px))!important}',
      /* ---------- mode 2: claude-style active — re-tint only ---------- */
      /* The host fills the sidebar column with --dsw-specific-sidebar-fill, and
         claude-style only re-points that variable in its own [palette=claude]
         module. With palette=host the column therefore stayed #1b1b1c while
         the title band (box-shadow via --dsh-claude-sidebar-canvas) was
         already glass — hence "only the title part is frosted". Re-point both. */
      WITH_CS + '{',
      '--dsh-claude-canvas:' + GLASS_SOLID + '!important;',
      '--dsh-claude-sidebar-canvas:' + GLASS_SOLID + '!important;',
      '--dsh-claude-raised:' + RAISED_DARK + '!important;',
      '--dsh-claude-card:' + RAISED_DARK + '!important;',
      '--dsw-specific-sidebar-fill:transparent!important;',
      '}',
      /* The hover search chip is painted through the raised surface; the brief
         is explicit that it should sit on the workspace's own dark instead. */
      WITH_CS + ' .dsh-claude-search-trigger{background:#151517!important;' +
        'background-image:none!important;border-color:rgba(255,255,255,.09)!important}',
      /* Send-flight preview. Before the real row lands, claude-style paints a
         travelling stand-in for the prompt: [data-dsh-claude-send-ghost] wraps
         .dsh-claude-enter-bubble / .dsh-claude-enter-card, and the freshly sent
         row itself is flagged [data-dsh-claude-send-flight]. The ghost is
         left-aligned and roughly half-opaque, so right after Enter the prompt
         appears as a dim, off-side copy that then jumps into place — the owner
         reports this as "the prompt's background flashes a darker colour, and
         it is not right-aligned yet" (2026-10-20, screenshot). Keep the row
         hidden while it is a flight reference, and never paint the ghost or
         the preview card at all; the real bubble is the only copy shown. */
      WITH_CS + ' [data-dsh-claude-send-flight]{' +
        'visibility:hidden!important;opacity:0!important;' +
        'animation:none!important}',
      WITH_CS + ' [data-dsh-claude-send-ghost]{' +
        'visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      WITH_CS + ' .dsh-claude-enter-bubble,' +
      WITH_CS + ' .dsh-claude-enter-card{' +
        'visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      WITH_CS + ' [data-dsh-claude-message-enter]{' +
        'animation:is-msg-enter .22s cubic-bezier(.2,.8,.3,1) both!important;' +
        'transform-origin:100% 100%!important}',
      WITH_CS + '[data-dsh-claude-motion="reduced"] [data-dsh-claude-message-enter]{' +
        'animation:none!important}',
      '@keyframes is-msg-enter{from{opacity:0;transform:scale(.94)}' +
        'to{opacity:1;transform:scale(1)}}',
      /* claude-style's typeface=claude points --dsw-font-family at three
         Anthropic faces it never ships: lib/client.js declares @font-face for
         AnthropicSansWebText.ttf / AnthropicMonoWeb.ttf /
         AnthropicSerifWebText.ttf, but lib/fonts only carries Inter, JetBrains
         Mono and Noto Serif. Every session pays three failed downloads and the
         console fills with 404s, then rendering falls through to
         "Claude Style Inter" / "Noto Sans SC" anyway. Dropping the dead first
         entries removes the requests without changing a single glyph. */
      WITH_CS + '[data-dsh-claude-typeface="claude"]{' +
        '--dsw-font-family:"Claude Style Inter","Noto Sans SC","Source Han Sans SC",' +
        '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",' +
        '"Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif!important;' +
        '--dsh-claude-font-serif:"Claude Style Noto Serif",Georgia,"Times New Roman",' +
        '"Noto Sans SC","Source Han Sans SC","PingFang SC","Hiragino Sans GB",' +
        '"Microsoft YaHei",sans-serif!important;' +
        '--dsh-claude-font-prose:"Claude Style Noto Serif",Georgia,"Times New Roman",' +
        '"Noto Sans SC","Source Han Sans SC","PingFang SC","Hiragino Sans GB",' +
        '"Microsoft YaHei",sans-serif!important;' +
        '--dsh-claude-font-code:"JetBrains Mono","Noto Sans SC","Source Han Sans SC",' +
        '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",ui-monospace,"SF Mono",' +
        '"Fira Code",Consolas,"Liberation Mono",Menlo,Courier,monospace!important;' +
        '--dsh-claude-font-brand:var(--dsh-claude-font-serif)!important}',
      /* claude-style draws the Ctrl-K palette itself and paints the dialog with
         --dsh-claude-raised, a near-solid fill — none of the overlay tokens
         reach it, which is why it stayed a slab while the menus turned to
         glass. Re-point the dialog surface only: the variable keeps its solid
         value because the same one paints hover cards and cards inside the
         sidebar, and those must not go see-through. */
      WITH_CS + ' .dsh-claude-search-dialog{',
      'background:rgba(28,31,38,.58)!important;',
      'backdrop-filter:blur(36px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(36px) saturate(150%)!important;',
      'border-color:rgba(255,255,255,.10)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.55),' +
        'inset 0 1px 0 rgba(255,255,255,.07)!important;',
      '}',
      WITH_CS + ':not([data-ds-dark-theme]) .dsh-claude-search-dialog{',
      'background:rgba(248,249,251,.66)!important;',
      'border-color:rgba(0,0,0,.08)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.18),' +
        'inset 0 1px 0 rgba(255,255,255,.8)!important;',
      '}',
      /* Transparent, NOT glass-tinted. The column then shows the layout
         frame's own background, which is a single continuous surface
         (frame colour + title-band glow). Painting the column a flat
         colour — what the previous revision did — left a hard seam at
         y = titlebar-height where the gradient stopped and the flat fill
         began: "the workspace tree did not follow the title area". */
      WITH_CS + ' :is([data-pane=sidebar],[data-dsh-claude-part~=sidebar-column],' +
        '[class*="_sidebarCol"],.dshDesktopSidebarSurface){background:transparent!important}',
      /* The host keeps a hairline on the sidebar column
         (.mP3x-q_sidebarCol{border-right:.5px solid --dsw-alias-border-l3}).
         Over the glass slab it reads as a stray white line running the full
         height of the column, so drop it in this mode too -- the early
         WITHOUT_CS rule never applied here. */
      WITH_CS + ' :is([data-pane=sidebar],[data-dsh-claude-part~=sidebar-column],' +
        '[class*="_sidebarCol"],.dshDesktopSidebarSurface){border-right:0!important}',
      /* Second hairline: claude-style rules the sidebar footer
         (body[data-dsh-claude-style] [data-dsh-claude-part~=foot-area])
         with border-top:1px solid var(--dsw-alias-border-l1), which draws a
         bright line between the workspace tree and the user panel. */
      WITH_CS + ' [data-dsh-claude-part~="foot-area"]{border-top:0!important}',
      /* Third hairline, the one that actually crossed the title band:
           html[data-windows-titlebar] body[data-dsh-claude-style]
             [data-dsh-claude-part~=layout-frame] > [data-side=sidebar]::before
           {content:"";position:absolute;left:3px;bottom:100%;
            height:var(--dsh-windows-titlebar-height);
            border-left:.5px solid var(--dsw-alias-border-l1)}
         Measured as a 1px bright rule at x=429 from y~12 down to y~68.
         Remove the pseudo-element itself, not just the border. */
      WITH_CS + ' [data-dsh-claude-part~="layout-frame"]>[data-side="sidebar"]::before{display:none!important}',
      WITH_CS + ':not([data-ds-dark-theme]){',
      '--dsh-claude-canvas:' + GLASS_SOLID_LIGHT + '!important;',
      '--dsh-claude-sidebar-canvas:' + GLASS_SOLID_LIGHT + '!important;',
      '--dsh-claude-raised:' + RAISED_LIGHT + '!important;',
      '--dsh-claude-card:' + RAISED_LIGHT + '!important;',
      '--dsw-specific-sidebar-fill:transparent!important;',
      '}',
      WITH_CS + ':not([data-ds-dark-theme]) .dsh-claude-search-trigger{background:#f4f5f7!important;' +
        'background-image:none!important;border-color:rgba(0,0,0,.08)!important}',
      /* (light-theme duplicate of the transparent sidebar rule above removed:
         the rule it duplicated carries no theme gate, so it already applies.) */

      /* --dsw-specific-sidebar-fill is a *host* token; the DSH stylesheet also
         paints the trace-view table headers with it (.haSm5q_table th) and the
         composer/notice surfaces. Re-point it back to its stock value inside the
         centre column so only the sidebar column and the title band stay glass. */
      WITH_CS + ' [class*="_centerCol"]{--dsw-specific-sidebar-fill:var(--dsw-static-neutral-bluish-900)!important}',
      WITH_CS + ':not([data-ds-dark-theme]) [class*="_centerCol"]{--dsw-specific-sidebar-fill:var(--dsw-static-neutral-bluish-50)!important}',
      /* Floating card: an 8px gutter on every side of the CONTENT BODY (not
         the column) so the glass frame shows through around it and reads as
         one surface with the title band — the way the right sidebar sits
         today. The gutter must sit on the body: the column also holds the
         session header, and shrinking the column squeezed that header until
         claude-style's second row (the team / PTC chips) was clipped in half.
         overflow:clip is what makes the radius bite — the transcript layers
         inside paint their own square fills over the body background.
         The chat module's root paints --dsw-alias-bg-base flat across the
         whole column, so the gutter first showed near-black instead of glass.
         Both root and column are made transparent so the gutter falls all the
         way through to the claude-style canvas, which this plugin has already
         tinted to the same glass as the sidebar and the title band. */
      /* The column itself carries the glass, painted on ::before so it can sit
         under everything else. Without it the gutter around the card fell
         through to the body::before glow (near-black), which is why the band
         above the card read as a black strip. */
      /* The card is lifted above its column, so the column must stop clipping it --
         otherwise the top edge is sliced flat and the 16px corners disappear. */
      /* The card is the conversation column ITSELF, not a box stacked on top of
         the header. Header, tabs, chips and transcript therefore render as one
         surface: there is no card edge that can clip the team / PTC chips, and
         no seam between the title band and the content left to patch. The 8px
         gutter is whatever the column glass above shows through. */
      /* Same glass recipe as the sidebar (GLASS): the aim is one continuous
         surface, so the conversation card must not be the one opaque slab that
         breaks the L of translucent panes. The right-hand pane and dockkit
         floats are pulled onto the same recipe below. */
      /* The card keeps the host's own content surface: the surrounding glass is
         the *backdrop*, the card body is meant to stay near-black like the
         product page's #151517 main column. Painting the card with GLASS made
         the transcript read as a pale grey slab. */
      /* Card surface = the right sidebar's own content-card colour
         (`--dsw-alias-bg-layer-1` = #232324), and the top gutter matches the
         right panel's: the whole conversation column -- header, tabs and the
         team / PTC chips included -- sits 8px lower, so its top edge lands on
         the same line as the right panel's card. */
      /* Card top: the reference is the title bar's own bottom edge, not the caption
         glyphs -- measured on this 1721px window, margin 8px puts the card top at
         y=82 and margin -19px at y=42, i.e. 1.48px of travel per px of margin.
         margin 0px leaves the top edge at y=70, which is 8px of glass below the
         52px band, and that is the setting the user settled on. The height hands
         the top margin back so the bottom gutter stays at 8px. The column must
         NOT clip: an overflow on it slices the lifted edge flat and the 16px
         corners read as square. */
      /* The column hosts several routes besides the conversation: plugins,
         plugin market, automation, context insights and memory each mount their
         own root here. Those third-party roots carry no stable class names, so
         a JS probe used to retrofit the card a frame after the route rendered,
         which reads as a flash and is never a default. Paint the card as an
         UNDERLAY on the column itself instead: it is on screen before any route
         mounts, survives every route switch, and each route root simply draws
         on top of it. z-index -1 keeps it behind the normal-flow page content
         while still sitting above the body glass the column is transparent to. */
      WITH_CS + ' [class*="_centerCol"]{' +
        'position:relative!important;' +
        'background:transparent!important;' +
        'overflow:visible!important}',
      WITH_CS + ' [class*="_centerCol"]::before{' +
        'content:"";' +
        'position:absolute!important;' +
        'inset:4px 8px 8px 4px!important;' +
        'z-index:-1!important;' +
        'pointer-events:none!important;' +
        'border-radius:16px!important;' +
        'background:var(--dsw-alias-bg-base)!important;' +
        'box-shadow:inset 0 0 0 .5px rgba(255,255,255,.10)!important}',
      WITH_CS + ':not([data-ds-dark-theme]) [class*="_centerCol"]::before{' +
        'box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)!important}',
      /* The lane between the two columns is shared 4+4 while the right panel is
         open (the panel contributes its own 4px through border-left), so the
         underlay mirrors the conversation root's narrowed right margin. */
      WITH_CS + ':has([data-sidebar-right-open]) [class*="_centerCol"]::before{' +
        'right:4px!important}',
      /* The card's hairline used to ride on the ::before underlay, so any layer
         that paints an opaque fill above it (the header band, the composer
         seat) cut the line off. Draw the same hairline on its own top layer. */
      CARD_GLASS + ' body[data-dsh-claude-style] [class*="_centerCol"]::after{' +
        'content:"";' +
        'position:absolute!important;' +
        'inset:4px 8px 8px 4px!important;' +
        'z-index:9!important;' +
        'pointer-events:none!important;' +
        'border-radius:16px!important;' +
        'box-shadow:inset 0 0 0 .5px rgba(255,255,255,.16)!important}',
      CARD_GLASS + ' body[data-dsh-claude-style]:has([data-sidebar-right-open]) [class*="_centerCol"]::after{' +
        'right:4px!important}',
      CARD_GLASS + ' body:not([data-ds-dark-theme]) [class*="_centerCol"]::after{' +
        'box-shadow:inset 0 0 0 .5px rgba(0,0,0,.10)!important}',
      /* The plugin screens do not all exist on the conversation route. The
         underlay above draws the card, but a route root that paints its own
         opaque surface crops the rounded corners away, so the card reads as a
         square page again. These roots keep their layout and simply give up the
         fill, then take the underlay's own gutter so their content stays inside
         the card. Class tokens are matched exactly: `olCj9W_page` has siblings
         `olCj9W_pageContent` / `pageHeading` / `pageScroll` that a substring
         match would also catch.

         width:auto is load-bearing. The host ships these roots with
         `width:100%`, so adding a right margin made the box 8px WIDER than
         the column instead of narrower: the card overflowed the window edge,
         left no gutter on the right, and pushed the route scroller out past
         the card. `width:auto` lets flex / block layout subtract the margins
         and pull the right edge back inside. */
      WITH_CS + ' [class~="olCj9W_page"],' +
        WITH_CS + ' .lc-ov-page,' +
        WITH_CS + ' [class~="IIa07q_shell"]{' +
        'box-sizing:border-box!important;' +
        'background:transparent!important;' +
        'border-radius:16px!important;' +
        'margin:4px 8px 8px 4px!important;' +
        'width:auto!important;' +
        'height:calc(100% - 12px)!important;' +
        'overflow:clip!important}',
      WITH_CS + ':has([data-sidebar-right-open]) [class~="olCj9W_page"],' +
        WITH_CS + ':has([data-sidebar-right-open]) .lc-ov-page,' +
        WITH_CS + ':has([data-sidebar-right-open]) [class~="IIa07q_shell"]{' +
        'margin-right:4px!important}',
      /* The plugin manager / plugin market pages are a different shape: their
         root (.V7pFBG_page) IS the scroller (`overflow:auto`, height:100%), not
         a clipped shell with an inner scroll pane. It therefore takes the same
         gutter but must NOT get overflow:clip -- that would kill scrolling. The
         scrollbar then lands on the page root's own right edge, which is the
         card's right edge, instead of running along the window frame outside
         the card. The rounded corners still show because the root is
         transparent and the underlay beneath it is already rounded. */
      WITH_CS + ' [class~="V7pFBG_page"]{' +
        'box-sizing:border-box!important;' +
        'margin:4px 8px 8px 4px!important;' +
        'width:auto!important;' +
        'height:calc(100% - 12px)!important;' +
        'border-radius:16px!important}',
      WITH_CS + ':has([data-sidebar-right-open]) [class~="V7pFBG_page"]{' +
        'margin-right:4px!important}',
      /* The plugin MARKET page is dshmarket (@prefix nUhMVa_), a different
         implementation from the host's plugin manager above. Its scroll pane is
         .nUhMVa_body (overflow-y:auto) nested in .nUhMVa_panelHost, which is the
         div dshmarket registers into the host's `main` slot. That host had no
         gutter at all, so the whole page ran edge to edge and its scrollbar was
         drawn along the window frame -- outside the card. The card box goes on
         panelHost, and its 28px top padding is dropped so the page lines up with
         the other route cards (which start at the same 4px offset). */
      WITH_CS + ' [class*="nUhMVa_panelHost"]{' +
        'box-sizing:border-box!important;' +
        'margin:4px 8px 8px 4px!important;' +
        'width:auto!important;' +
        'height:calc(100% - 12px)!important;' +
        'padding-top:0!important;' +
        'border-radius:16px!important;' +
        'overflow:clip!important}',
      WITH_CS + ':has([data-sidebar-right-open]) [class*="nUhMVa_panelHost"]{' +
        'margin-right:4px!important}',

      WITH_CS + ' [class*="an3WzG_root"],' +
        WITH_CS + ' [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"]){' +
        'background:var(--dsw-alias-bg-base)!important;height:calc(100% - 12px)!important;margin:4px 8px 8px 4px!important;border-radius:16px!important;overflow:clip!important;box-shadow:inset 0 0 0 .5px rgba(255,255,255,.10)!important}',
      WITH_CS + ':not([data-ds-dark-theme]) [class*="an3WzG_root"],' +
        WITH_CS + ':not([data-ds-dark-theme]) [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"]){' +
        'box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)!important}',
      /* The lane between the two columns is shared 4+4 only while the right panel
         is actually open (it contributes its own 4px through border-left). When
         collapsed that half is gone, so the conversation card takes the whole
         lane back instead of leaving a 4px sliver at the window edge. */
      WITH_CS + ':has([data-sidebar-right-open]) [class*="an3WzG_root"],' +
        WITH_CS + ':has([data-sidebar-right-open]) [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"]){margin-right:4px!important}',
      /* Everything that used to paint its own opaque panel -- the right sidebar
         column/panes and the dockkit floating windows -- joins the same glass,
         so left / centre / right stop reading as three different surfaces. */
      WITH_CS + ' [data-dockkit-column],' + WITH_CS + ' [data-dockkit-pane],' +
        WITH_CS + ' [class*="_float_6nhg2"]{background:transparent!important}',
      /* (light-theme duplicate of the dockkit transparency rule above removed:
         the original has no theme gate and therefore already covers light.) */
      /* The transcript sits in its own pane, and claude-style paints that pane
         with --dsh-claude-canvas, which under palette:host resolves to the
         host's near-black bg-base. That pane is what covered the card glass and
         kept the centre column reading as a black slab. */
      WITH_CS + ' [data-pane="conversation"],' +
        WITH_CS + ' [data-conversation-content] [data-pane],' +
        WITH_CS + ' [data-conversation-content]>[class*="_scroll"],' +
        WITH_CS + ' [data-conversation-content]>[class*="_root"]{background:transparent!important}',
      /* Host right-hand sidebar panel (dsh-client-ui-sidebar-right).
         The panel itself is now the CARD -- same recipe as the conversation
         column above: bg-base surface, 16px corners, hairline inset ring. That
         is the whole point: the right column stops being "a transparent panel
         with a card somewhere inside it" and becomes one card whose box the
         runtime aligner pins to the conversation card's two edges. */
      /* Right gutter WITHOUT moving the panel: 'right' shifted the whole panel
         left by 8px and ate the gap against the conversation card (and pushed
         the pane's content 8px past the card, so inner cards overhung). Instead
         keep the box where the host planted it and paint the surface inside an
         8px transparent right border -- background-clip keeps the fill out of
         that border, so the gutter shows the window glass while the panel's own
         box (and its left edge) never moves. */
      /* The card surface only exists while the panel is OPEN. Without this gate
         the painted panel kept floating over the conversation column after the
         sidebar was collapsed (the host only translates its inner host out of
         view, it does not remove the panel). */
      WITH_CS + ' [data-sidebar-right-panel][data-sidebar-right-open]{border-radius:16px!important;background:var(--dsw-alias-bg-base)!important;background-clip:padding-box!important;overflow:clip!important;box-sizing:border-box!important;border-left:4px solid transparent!important;border-right:8px solid transparent!important;padding-top:0px!important;box-shadow:inset 0 0 0 .5px rgba(255,255,255,.10)!important}',
      WITH_CS + ':not([data-ds-dark-theme]) [data-sidebar-right-panel][data-sidebar-right-open]{box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)!important}',
      /* ---------- optional glass card mode ---------- */
      /* When the switcher's toggle is on, html carries data-dsh-card-glass="on"
         and the two card surfaces swap the host's opaque bg-base for the same
         recipe as the settings panel: translucent fill + backdrop blur + the
         top glow that tracks --is-glow-rgb. The existing .5px inset ring stays;
         no border and no drop shadow are added, because the gutter around a
         card is only 4-8px wide and a shadow would smear into it.

         The conversation root is only made transparent: the glass itself is
         painted by the column's ::before underlay, i.e. the same element that
         already draws the card on every non-conversation route. That keeps the
         blur off the root, so position:fixed popovers inside the transcript
         (mentions, slash menu, model picker) keep the viewport as their
         containing block. */
      CARD_GLASS + ' body[data-dsh-claude-style] [class*="_centerCol"]::before{' +
        'background:var(--is-card-fill)!important}',
      CARD_GLASS + ' body[data-dsh-claude-style] [class*="an3WzG_root"],' +
        CARD_GLASS + ' body[data-dsh-claude-style] [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.content"]){' +
        'background:transparent!important}',
      /* No `background` shorthand here: it would reset background-clip back to
         border-box and paint the card colour into the panel's 4px transparent
         left border, i.e. one step wider than the card outline it belongs to. */
      CARD_GLASS + ' body[data-dsh-claude-style] [data-sidebar-right-panel][data-sidebar-right-open]{' +
        'background-color:var(--is-card-fill)!important;' +
        'background-clip:padding-box!important}',
      /* claude-style fades the transcript edges with two gradients built from
         --dsh-claude-fade-stops (28px under the header, 40px above the
         composer seat). Those stops are 100/82/40% of --dsw-alias-bg-base, i.e.
         #151517, so on an opaque canvas they read as a soft fade -- but on the
         glass card they land as two solid grey bars lying on top of the blur
         and the top glow. Blank the stops so both pseudo-elements paint
         nothing, and drop the composer seat's own opaque fill for the same
         reason (claude-style repaints it with bg-base in composer-active mode,
         and the host paints a bg-base gradient on it as well). */
      CARD_GLASS + ' body[data-dsh-claude-style]{' +
        '--dsh-claude-fade-stops:var(--is-card-fill) 0%,' +
        'color-mix(in srgb,var(--is-card-fill) 86%,transparent) 30%,' +
        'color-mix(in srgb,var(--is-card-fill) 45%,transparent) 66%,' +
        'transparent 100%!important}',
      CARD_GLASS + ' body[data-dsh-claude-style]{' +
        '--dsh-transcript-fade-h:56px;' +
        '--dsh-composer-fade-h:64px}',
      /* The header has no fill of its own, so the page glow leaked through
         and the 28px :after fade started from mid-air. Give the band the same
         solid fill as the composer and let the (now longer) :after gradient
         carry it down into the glass. */
      CARD_GLASS + ' body[data-dsh-claude-style] [data-dsh-claude-part~="conversation-header"]{' +
        'background:var(--is-card-fill)!important}',
      CARD_GLASS + ' body[data-dsh-claude-style] [data-dsh-claude-part~="composer-seat"],' +
        CARD_GLASS + ' body[data-dsh-claude-style] [data-composer-seat]{' +
        'background:var(--is-card-fill)!important;' +
        'border-radius:16px!important}',
      /* The running-status row ("深度求索中 N秒") is promoted to a sticky bar by
         claude-style's chat-follow mode and painted with --dsh-claude-canvas.
         Outside glass mode the plugin re-points that variable to bg-base so
         the bar does not float as a lighter slab; on the glass card the same
         value becomes a solid dark band around a translucent page. Match the
         card fill instead. */
      CARD_GLASS + ' body[data-dsh-claude-style] [data-chat-running]{' +
        '--dsh-claude-canvas:transparent!important}',
      /* ReasoningRow keeps its disclosure header sticky inside an expanded
         thinking block and paints it with an opaque bg-base (.VJlF5q_root
         [data-expanded] [data-open] [data-disclosure-header]), which is the
         dark band that only shows while the block is open. Drop the fill. */
      CARD_GLASS + ' body[data-dsh-claude-style] [class*="VJlF5q_root"][data-expanded] [data-open] [data-disclosure-header]{' +
        'background:transparent!important}',
      /* Markdown surfaces are opaque by design (code card, its banner, the
         table head, inline code). On the card those fills read as holes punched
         through the glass, so re-point the tokens to the same translucent
         family while keeping the original depth order: code body darkest, its
         banner one step lighter, table head lighter still. */
      CARD_GLASS + ' body[data-ds-dark-theme]{' +
        '--dsw-alias-markdown-code-block:rgba(18,20,24,.42)!important;' +
        '--dsw-alias-markdown-code-block-banner:rgba(30,33,38,.50)!important;' +
        '--dsh-claude-table-head:rgba(44,47,53,.50)!important;' +
        '--dsh-claude-inline-code-bg:rgba(255,255,255,.06)!important}',
      CARD_GLASS + ' body:not([data-ds-dark-theme]){' +
        '--dsw-alias-markdown-code-block:rgba(255,255,255,.55)!important;' +
        '--dsw-alias-markdown-code-block-banner:rgba(243,245,248,.60)!important;' +
        '--dsh-claude-table-head:rgba(232,235,240,.60)!important;' +
        '--dsh-claude-inline-code-bg:rgba(10,20,40,.05)!important}',
      /* The host's wide-table trick widens the table past its column by the
         spare gutter and pulls it back with a negative margin. The card's own
         margin makes the column 12px narrower than the host assumes, so the
         right edge -- including the table container's 0.5px border -- falls
         outside the card's overflow:clip and the rightmost line disappears.
         Clamp it to the column instead of chasing the gutter math. */
      WITH_CS + ' [data-dsh-claude-part~="table-scroll"]{' +
        'width:100%!important;max-width:100%!important;box-sizing:border-box!important}',
      WITH_CS + ' .md-table-wide{' +
        'width:100%!important;max-width:100%!important;margin-left:0!important;padding-left:0!important}',
      /* The "edited N files" card (host WorkspaceChanges, .HOHHba_card) is
         painted with an opaque layer-1 fill and a neutral-850 header band, so
         it reads as a dark slab dropped on the glass. Re-point both to the
         same translucent family; the tiles inside keep their own colour-mix. */
      CARD_GLASS + ' body[data-dsh-claude-style] [class~="HOHHba_card"]{' +
        'background:color-mix(in srgb, var(--is-card-fill) 92%, rgb(255,255,255))!important;' +
        'border-color:rgba(255,255,255,.10)!important}',
      CARD_GLASS + ' body[data-dsh-claude-style] [class~="HOHHba_header"]{' +
        'background:transparent!important}',
      CARD_GLASS + ' body:not([data-ds-dark-theme]) [class~="HOHHba_card"]{' +
        'background:rgba(250,251,252,.62)!important;' +
        'border-color:rgba(0,0,0,.08)!important}',
      /* Transcript content still uses the host's opaque surface tokens
         (tool cards, file rows, quote blocks...). Remap them inside the main
         column only, so every such box becomes translucent glass without
         touching the sidebar, menus or dialogs. */
      /* Derived from the card fill rather than translucent: the card base is
         now an opaque flat colour, so a 62%-alpha layer would land within a
         few steps of it and read as no card at all. 6/9/12% white keeps the
         host's own +14/+21/+28 lift rhythm. */
      CARD_GLASS + ' body[data-dsh-claude-style] [class*="_centerCol"]{' +
        '--dsw-alias-bg-layer-1:color-mix(in srgb, var(--is-card-fill) 94%, rgb(255,255,255))!important;' +
        '--dsw-alias-bg-layer-2:color-mix(in srgb, var(--is-card-fill) 91%, rgb(255,255,255))!important;' +
        '--dsw-alias-bg-layer-3:color-mix(in srgb, var(--is-card-fill) 88%, rgb(255,255,255))!important}',
      CARD_GLASS + ' body:not([data-ds-dark-theme]) [class*="_centerCol"]{' +
        '--dsw-alias-bg-layer-1:rgba(250,251,252,.66)!important;' +
        '--dsw-alias-bg-layer-2:rgba(244,246,249,.66)!important;' +
        '--dsw-alias-bg-layer-3:rgba(238,241,245,.66)!important}',
      /* The tab strip keeps its opaque bg-base fill so the scrolled body can
         disappear behind it (see the rule further down). On the glass card that
         fill is the one remaining solid band in the right column -- clear it
         too, and lengthen the body's top mask so content still fades out before
         it reaches the tabs instead of showing through them. */
      CARD_GLASS + ' body[data-dsh-claude-style] [data-sidebar-right-panel] [data-dockkit-strip],' +
        CARD_GLASS + ' body[data-dsh-claude-style] [data-sidebar-right-panel] [class*="tabHost"]{' +
        'background:transparent!important}',
      CARD_GLASS + ' body[data-dsh-claude-style] [data-sidebar-right-panel] [class*="paneBody"],' +
        CARD_GLASS + ' body[data-dsh-claude-style] [data-sidebar-right-panel] [class*="paneContent"]{' +
        '-webkit-mask-image:linear-gradient(#0000 0,#000 32px,#000 100%)!important;' +
        'mask-image:linear-gradient(#0000 0,#000 32px,#000 100%)!important}',
      '@media (prefers-reduced-transparency:reduce){',
      CARD_GLASS + ' body[data-dsh-claude-style] [class*="_centerCol"]::before,' +
        CARD_GLASS + ' body[data-dsh-claude-style] [data-sidebar-right-panel][data-sidebar-right-open]{' +
        'backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '}',

      /* Inner panes must not paint a second card on top of it. */
      WITH_CS + ' [data-sidebar-right-panel] [data-dockkit-pane],' +
        WITH_CS + ' [data-sidebar-right-panel] [data-dockkit-host],' +
        WITH_CS + ' [data-sidebar-right-panel] [data-dockkit-column]{background:transparent!important;border-radius:0!important}',
      /* Nudge the scrolled body down and fade its top edge. `paneBody` is
         better-sidebar's own overflow-y:auto container (.bdiHEa_paneBody);
         `paneContent` is the non-scrolling wrapper some panes use instead.
         The mask is the same fade the host uses elsewhere (.WW4l1q_fadeTop /
         ._9lTDKa_fade), and it is painted on the scroll box itself, so it stays
         pinned while the content scrolls underneath it. */
      WITH_CS + ' [data-sidebar-right-panel] [class*="paneBody"],' +
        WITH_CS + ' [data-sidebar-right-panel] [class*="paneContent"]{' +
        'padding-top:10px!important;' +
        '-webkit-mask-image:linear-gradient(#0000 0,#000 16px,#000 100%)!important;' +
        'mask-image:linear-gradient(#0000 0,#000 16px,#000 100%)!important}',
      /* Keep the tab strip / its buttons above the scrolled body: without a
         stacking context of their own the pane content paints over them as soon
         as it scrolls up. */
      WITH_CS + ' [data-sidebar-right-panel] [data-dockkit-strip],' +
        WITH_CS + ' [data-sidebar-right-panel] [class*="tabHost"]{' +
        'position:relative!important;z-index:50!important;' +
        'background:var(--dsw-alias-bg-base)!important}',
      /* Panel offsets, now static: the right pane is pinned to the same gutter as
         the conversation card (4px top, 8px bottom) with no runtime measuring.
         If a host build shifts the frame's padding box the two cards drift apart
         again and these two numbers are the only thing to re-tune. */
      WITH_CS + ' [data-sidebar-right-panel]{top:4px!important;bottom:8px!important}',
      WITH_CS + ' [data-sidebar-right-panel] [data-dockkit-column="0"][data-dockkit-pane]{border-radius:0!important}',
      /* better-sidebar draws its own 24px-radius hairline cards inside the pane;
         on top of the panel card those read as a second frame nested in the
         first. Flatten them so its content sits directly on the panel surface. */
      WITH_CS + ' [data-sidebar-right-panel] [class*="paneCard"],' +
        WITH_CS + ' [data-sidebar-right-panel] [class*="panelBody"],' +
        WITH_CS + ' [data-sidebar-right-panel] [class*="pane"],' +
        WITH_CS + ' [data-sidebar-right-panel] [class*="paneContent"],' +
        WITH_CS + ' [data-sidebar-right-panel] [class*="tabBody"]{' +
        'border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}',
      /* The tab host keeps its own frame stripped, but NOT its fill: it is the
         opaque band the scrolled body must disappear behind. */
      WITH_CS + ' [data-sidebar-right-panel] [class*="tabHost"]{' +
        'border:0!important;border-radius:0!important;box-shadow:none!important}',
      /* The team / PTC chips straddle the card's top edge, so at the seam the
         text reads as sliced in two. Push the header's content down until the
         chips sit clear of it. Targeting note: `[class~="an3WzG_header"]` did
         NOT match -- the hashed class is a single token (`an3WzG_header` plus a
         suffix or none, but not a standalone word), which is why the padding
         experiments had zero visible effect. claude-style tags this very node
         with `data-dsh-claude-part~="conversation-header"`, a stable attribute,
         so anchor on that. `[class*=]` is unusable here: it also matches
         headerActions / headerUtilities / headerCorner / headerLeading /
         headerSessionless / headerBlank. */
      WITH_CS + ' [data-dsh-claude-part~="conversation-header"]{background:transparent!important;border-bottom:0!important;box-shadow:none!important;box-sizing:border-box!important;padding-top:26px!important}',
      /* claude-style lifts the chat header's title row with
         top: var(--dsh-header-band-row-lift) so the session title lines up
         with the Windows band. An offset like that is measured from the
         static box, so padding on the header can never move THAT row --
         which is exactly why every padding-top attempt left the chips
         pixel-identical. The padding-top:26px above therefore does not
         position anything; it only reserves headroom so the lifted rows do
         not overrun the card. The chips themselves are moved by the
         header-actions rule that follows. */
      WITH_CS + ' [data-dsh-claude-part~="header-actions"]{position:relative!important;top:22px!important}',
      WITH_CS + ' [data-conversation-content]{position:relative;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;overflow:visible!important}',

      /* claude-style's chat-follow mode promotes the running status row
         ("深度求索中 N秒") to a sticky bar painted with --dsh-claude-canvas
         (lib/client.js: [data-dsh-claude-chat-follow] ... [data-chat-running]
         {position:sticky;bottom:...;background:var(--dsh-claude-canvas,
         var(--dsw-alias-bg-base,#FCFCFB))}). With our glass tint that bar turned
         into a bright translucent slab floating over the transcript. Re-point the
         variable on the row itself: claude-style reads it through var(), so the
         override wins regardless of its !important specificity. */
      WITH_CS + ' [data-chat-running]{--dsh-claude-canvas:var(--dsw-alias-bg-base)!important}',
      /* ---------- IDEA-style title-band glow ---------- */
      /* claude-style paints the 52px Windows band by box-shadow-extending
         the two columns upward, which cannot carry a gradient and would
         double-paint over the body glass. The shadows are therefore dropped
         and the frame itself is left fully transparent: the band is now just
         the top slice of body::before, which is one continuous plane from
         the title band down through both columns, so no seam can form at
         y = titlebar-height. The centred blue radial lives on that same
         plane and stays *under* the session title, the view tabs and the
         native menu bar. */
      CS_HS + ' ' + CS_FRAME3 + '{',
'background-image:none!important;',
/* Full height, not just the 52px band: the sidebar column is now
             transparent, so it inherits this very gradient. Clipping it to
             the band would re-create the seam one level down. */
 'background-size:100% 100%!important;',
'background-repeat:no-repeat!important;',
'background-position:top left!important;',
'background-color:transparent!important;',
'}',
      CS_HS + ':not([data-ds-dark-theme]) ' + CS_FRAME3 + '{',
'background-image:none!important;',
'background-color:transparent!important;',
'}',
      CS_HS + ' ' + CS_FRAME3 + '>[data-dsh-claude-part~="sidebar-column"],',
      CS_HS + ' ' + CS_FRAME3 + '>[data-dsh-claude-part~="center-column"]',
'{box-shadow:none!important}',

      /* Do NOT otherwise touch [data-windows-titlebar]: claude-style owns
         the title-band hand-off (column shadows are the only thing moved,
         and the frame background takes their place at the same colour). */

      /* ---------- mode 1: plain DSH — paint our own glass ---------- */
      FRAME + '{position:relative;background:transparent!important}',
      FRAME + '::before,' + SIDEBAR + '::before',
      '{',
      'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
      'background:' + GLASS + ';',
      'backdrop-filter:blur(32px) saturate(106%);',
      '-webkit-backdrop-filter:blur(32px) saturate(106%);',
      '}',

      /* plain-DSH mode: same blue bleed in the title band */
      FRAME + '::before{background:' + TITLEBAR_GLOW + ',' + GLASS + '}',
      WITHOUT_CS + ':not([data-ds-dark-theme]) [data-slot="root"] > [class*="_frame"]::before{background:' + TITLEBAR_GLOW_LIGHT + ',' + GLASS_LIGHT + '}',

      SIDEBAR + '{position:relative;background:transparent!important;border-right:0!important;box-shadow:none!important}',
      G + ' [data-slot="sidebar"]{background:transparent!important}',
      SIDEBAR + ' *{background:transparent!important;box-shadow:none!important}',

      WITHOUT_CS + ' [class*="_centerCol"],',
      WITHOUT_CS + ' [data-phase]:has(> [data-slot="conversation.content"])',
      '{background:transparent!important;border:0!important;box-shadow:none!important}',
      WITHOUT_CS + ' [class*="_centerCol"]{position:relative}',
      WITHOUT_CS + ' [class*="_centerCol"]::before',
      '{content:"";position:absolute;inset:0;background:' + GLASS + '!important;backdrop-filter:blur(32px) saturate(106%);-webkit-backdrop-filter:blur(32px) saturate(106%);z-index:0;pointer-events:none}',
      WITHOUT_CS + ':not([data-ds-dark-theme]) [class*="_centerCol"]::before',
      '{background:' + GLASS_LIGHT + '!important}',
      WITHOUT_CS + ' [data-conversation-content]',
      '{position:relative;z-index:1;margin:8px!important;border-radius:16px!important;overflow:clip!important;border:.5px solid rgba(255,255,255,.10)!important;background:var(--dsw-alias-bg-base)!important;box-shadow:0 12px 32px rgba(0,0,0,.30)!important}',
      WITHOUT_CS + ':not([data-ds-dark-theme]) [data-conversation-content]{border-color:rgba(0,0,0,.08)!important;box-shadow:0 12px 32px rgba(15,23,42,.10)!important}',

      HEADER + '{',
      'position:relative;z-index:2;',
      'background:' + GLASS + '!important;',
      'backdrop-filter:blur(32px) saturate(106%);',
      '-webkit-backdrop-filter:blur(32px) saturate(106%);',
      'border-bottom:0!important;box-shadow:none!important;border-radius:0!important;',
      '}',
      HEADER + '::after{display:none!important}',

      /* ---------- reduced transparency ---------- */
      '@media (prefers-reduced-transparency:reduce){',
      /* the light theme used to inherit this dark fallback too */
      G + ' body::before{background:#101a2c}',
      G + ' body:not([data-ds-dark-theme])::before{background:#e9ebef}',
      WITHOUT_CS + ' [data-slot="root"] > [class*="_frame"]::before,' + WITHOUT_CS + ' [class*="_sidebarCol"]::before,' + HEADER,
      '{backdrop-filter:none;-webkit-backdrop-filter:none}',
      /* claude-style-mode glass is painted on element backgrounds, so it
         needs the same escape hatch or 'reduce transparency' leaves it
         blurred. */
      G + ' [data-shortcut-modal="settings"],',
      G + ' [class*="_dialog_o6lrb"],',
      G + ' [class~="V7pFBG_registry"],',
      G + ' [class~="eze_pW_panel"],',
      G + ' [class*="_float_6nhg2"],',
      G + ' [class~="SNx2jG_preview"],',
      G + ' [class*="_card_38jqx"],',
      G + ' [class*="_bubble_44yfq"],',
      G + ' [class*="_toast_l6cvn"],',
      WITH_CS + ' .dsh-claude-search-dialog{',
      'backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '}',

      /* ---------- glow switcher: the title-bar colour control ---------- */
      /* Native DOM, mounted by the runtime below into the header utility
         cluster. Everything visual comes from the current --is-glow-rgb so
         the swatch and the actual glow can never disagree. */
      '.is-glow{position:relative;display:inline-flex;align-items:center;-webkit-app-region:no-drag}',
      '.is-glow__trigger{display:inline-flex;align-items:center;gap:3px;height:26px;padding:0 5px 0 6px;' +
        'border:.5px solid transparent;border-radius:8px;background:transparent;cursor:pointer;font:inherit;' +
        'color:var(--dsw-alias-label-secondary,#9aa0aa);transition:background .12s ease,border-color .12s ease}',
      '.is-glow__trigger:hover,.is-glow__trigger[aria-expanded="true"]{background:rgba(255,255,255,.07);' +
        'border-color:rgba(255,255,255,.12)}',
      'body:not([data-ds-dark-theme]) .is-glow__trigger:hover,' +
        'body:not([data-ds-dark-theme]) .is-glow__trigger[aria-expanded="true"]{background:rgba(0,0,0,.05);' +
        'border-color:rgba(0,0,0,.10)}',
      '.is-glow__swatch{width:13px;height:13px;border-radius:50%;flex:none;background:rgb(var(--is-glow-rgb, 72, 100, 193));' +
        'box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),0 0 8px rgba(var(--is-glow-rgb, 72, 100, 193),.55)}',
      '.is-glow__chev{opacity:.55;flex:none}',
      '.is-glow__menu{position:absolute;right:0;top:calc(100% + 8px);z-index:60;min-width:188px;padding:6px;' +
        'border-radius:12px;border:.5px solid rgba(255,255,255,.10);background:rgba(30,33,40,.94);' +
        'backdrop-filter:blur(24px) saturate(150%);-webkit-backdrop-filter:blur(24px) saturate(150%);' +
        'box-shadow:0 18px 44px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.06)}',
      'body:not([data-ds-dark-theme]) .is-glow__menu{background:rgba(249,250,252,.96);border-color:rgba(0,0,0,.09);' +
        'box-shadow:0 18px 44px rgba(15,23,42,.16),inset 0 1px 0 rgba(255,255,255,.9)}',
      '.is-glow__head{padding:4px 8px 6px;font-size:11px;letter-spacing:.04em;' +
        'color:var(--dsw-alias-label-tertiary,#7d838d)}',
      '.is-glow__opt{display:flex;align-items:center;gap:9px;width:100%;padding:6px 8px;border:0;border-radius:8px;' +
        'background:transparent;cursor:pointer;font:inherit;font-size:12.5px;text-align:left;' +
        'color:var(--dsw-alias-label-primary,#e6e8ea)}',
      '.is-glow__opt:hover{background:rgba(255,255,255,.08)}',
      'body:not([data-ds-dark-theme]) .is-glow__opt:hover{background:rgba(0,0,0,.06)}',
      '.is-glow__dot{width:12px;height:12px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.24)}',
      '.is-glow__name{flex:1 1 auto}',
      '.is-glow__check{width:12px;text-align:center;opacity:0;color:var(--dsw-alias-label-secondary,#9aa0aa)}',
      '.is-glow__opt[data-active="true"] .is-glow__check{opacity:1}',
      '.is-glow__custom{display:flex;align-items:center;gap:8px;margin-top:4px;padding:6px 8px 4px;' +
        'border-top:.5px solid rgba(255,255,255,.08)}',
      'body:not([data-ds-dark-theme]) .is-glow__custom{border-top-color:rgba(0,0,0,.08)}',
      '.is-glow__custom-label{flex:1 1 auto;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa0aa)}',
      '.is-glow__hex{font:11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;' +
        'color:var(--dsw-alias-label-tertiary,#7d838d)}',
      '.is-glow__color{width:22px;height:22px;padding:0;border:.5px solid rgba(255,255,255,.16);border-radius:6px;' +
        'background:transparent;cursor:pointer}',
      'body:not([data-ds-dark-theme]) .is-glow__color{border-color:rgba(0,0,0,.14)}',
      '.is-glow__color::-webkit-color-swatch-wrapper{padding:2px}',
      '.is-glow__color::-webkit-color-swatch{border:0;border-radius:4px}',
      '.is-glow__toggle{display:flex;align-items:center;gap:8px;margin-top:4px;padding:6px 8px 4px;' +
        'border-top:.5px solid rgba(255,255,255,.08)}',
      'body:not([data-ds-dark-theme]) .is-glow__toggle{border-top-color:rgba(0,0,0,.08)}',
      '.is-glow__toggle-label{flex:1 1 auto;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa0aa)}',
      '.is-glow__switch{position:relative;width:30px;height:17px;padding:0;border:0;border-radius:9px;flex:none;' +
        'cursor:pointer;background:rgba(255,255,255,.18);transition:background .15s ease}',
      'body:not([data-ds-dark-theme]) .is-glow__switch{background:rgba(0,0,0,.18)}',
      '.is-glow__switch[aria-checked="true"]{background:rgb(var(--is-glow-rgb, 72, 100, 193))}',
      '.is-glow__knob{position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;' +
        'background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .15s ease}',
      '.is-glow__switch[aria-checked="true"] .is-glow__knob{transform:translateX(13px)}',
      '@media (prefers-reduced-transparency:reduce){',
      '.is-glow__menu{backdrop-filter:none;-webkit-backdrop-filter:none}',
      '}',
    ].join('')

    /* ---------- glow switcher runtime ---------- */
    /* The glow is a single CSS variable, so switching it is one write to the
       document element. The control is native DOM rather than CSS because a
       click target cannot be expressed in a stylesheet; it is mounted into the
       header utility cluster and re-mounted whenever the host rebuilds that
       subtree (session switches, layout changes). No polling: the observer
       only ever checks a boolean. */
    const GLOW_KEY = 'dsh-illuminating-skin:glow'
    const GLOW_PRESETS = [
      { rgb: '72, 100, 193', name: '黛蓝' },
      { rgb: '56, 148, 190', name: '天青' },
      { rgb: '62, 158, 120', name: '竹青' },
      { rgb: '126, 92, 196', name: '紫檀' },
      { rgb: '196, 124, 62', name: '赭石' },
      { rgb: '196, 86, 110', name: '胭脂' },
    ]
    const GLOW_RGB_RE = /^\d{1,3},\s?\d{1,3},\s?\d{1,3}$/

    function normalizeGlow(rgb) {
      const parts = String(rgb).split(',')
      if (parts.length !== 3) return GLOW_PRESETS[0].rgb
      return parts
        .map((part) => Math.max(0, Math.min(255, parseInt(part, 10) || 0)))
        .join(', ')
    }

    function glowToHex(rgb) {
      const parts = normalizeGlow(rgb).split(', ')
      return '#' + parts.map((n) => Number(n).toString(16).padStart(2, '0')).join('')
    }

    function hexToGlow(hex) {
      const match = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim())
      if (match === null) return null
      const value = parseInt(match[1], 16)
      return [(value >> 16) & 255, (value >> 8) & 255, value & 255].join(', ')
    }

    function readGlow() {
      try {
        const saved = window.localStorage.getItem(GLOW_KEY)
        if (saved !== null && GLOW_RGB_RE.test(saved.trim())) return normalizeGlow(saved)
      } catch (error) {
        /* storage can be unavailable; fall through to the default */
      }
      return GLOW_PRESETS[0].rgb
    }

    function saveGlow(rgb) {
      try {
        window.localStorage.setItem(GLOW_KEY, rgb)
      } catch (error) {
        /* not fatal: the colour still applies for this session */
      }
    }

    /* Glass card mode is a separate flag from the glow colour: it changes how
       the two card surfaces are filled, not what colour the light is. */
    const CARD_GLASS_KEY = 'dsh-illuminating-skin:card-glass'

    function readCardGlass() {
      try {
        return window.localStorage.getItem(CARD_GLASS_KEY) === 'on'
      } catch (error) {
        return false
      }
    }

    function saveCardGlass(on) {
      try {
        window.localStorage.setItem(CARD_GLASS_KEY, on ? 'on' : 'off')
      } catch (error) {
        /* not fatal: the state still applies for this session */
      }
    }

    /* claude-style's header part marker first -- it survives host upgrades.
       The class fallback is for the plain-DSH layout and is scoped to the
       conversation header, because the sidebar has a header cluster of its
       own that a document-wide lookup would happily match first. */
    function findGlowHost() {
      const marked = document.querySelector('[data-dsh-claude-part~="header-utilities"]')
      if (marked !== null) return marked
      const actions = document.querySelector('[data-dsh-claude-part~="header-actions"]')
      if (actions !== null) return actions
      const header = document.querySelector('[data-slot="conversation.header"]')
      if (header === null) return null
      return (
        header.querySelector('[class*="_headerUtilities"]') ||
        header.querySelector('[class*="_headerActions"]')
      )
    }

    function mountGlowSwitcher() {
      const root = document.createElement('div')
      root.className = 'is-glow'
      root.setAttribute('data-dsh-plugin', 'illuminating-skin')
      root.setAttribute('data-dsh-glow-switcher', '')

      const trigger = document.createElement('button')
      trigger.type = 'button'
      trigger.className = 'is-glow__trigger'
      trigger.title = '顶部发光颜色'
      trigger.setAttribute('aria-haspopup', 'listbox')
      trigger.setAttribute('aria-expanded', 'false')
      trigger.innerHTML =
        '<span class="is-glow__swatch"></span>' +
        '<svg class="is-glow__chev" width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">' +
        '<path d="M2.5 3.75 5 6.25 7.5 3.75" fill="none" stroke="currentColor" stroke-width="1.5" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'

      const menu = document.createElement('div')
      menu.className = 'is-glow__menu'
      menu.setAttribute('role', 'listbox')
      menu.setAttribute('aria-label', '顶部发光颜色')
      menu.hidden = true

      const head = document.createElement('div')
      head.className = 'is-glow__head'
      head.textContent = '顶部发光'
      menu.appendChild(head)

      let open = false

      const options = GLOW_PRESETS.map((preset) => {
        const option = document.createElement('button')
        option.type = 'button'
        option.className = 'is-glow__opt'
        option.setAttribute('role', 'option')
        option.setAttribute('data-rgb', preset.rgb)

        const dot = document.createElement('span')
        dot.className = 'is-glow__dot'
        dot.style.background = 'rgb(' + preset.rgb + ')'

        const name = document.createElement('span')
        name.className = 'is-glow__name'
        name.textContent = preset.name

        const check = document.createElement('span')
        check.className = 'is-glow__check'
        check.textContent = '\u2713'

        option.append(dot, name, check)
        option.addEventListener('click', () => {
          applyGlow(preset.rgb, true)
          setOpenState(false)
          trigger.focus()
        })
        menu.appendChild(option)
        return option
      })

      const custom = document.createElement('div')
      custom.className = 'is-glow__custom'
      const customLabel = document.createElement('span')
      customLabel.className = 'is-glow__custom-label'
      customLabel.textContent = '自定义'
      const picker = document.createElement('input')
      picker.type = 'color'
      picker.className = 'is-glow__color'
      picker.setAttribute('aria-label', '自定义发光颜色')
      const hexText = document.createElement('span')
      hexText.className = 'is-glow__hex'
      picker.addEventListener('input', () => {
        const rgb = hexToGlow(picker.value)
        if (rgb !== null) applyGlow(rgb, true)
      })
      custom.append(customLabel, picker, hexText)
      menu.appendChild(custom)

      /* Glass card switch: it sits under the colour rows because it is a
         surface treatment, not a colour. Kept as a button with role=switch so
         Space/Enter work for free and the checked state is announced. */
      const toggle = document.createElement('div')
      toggle.className = 'is-glow__toggle'
      const toggleLabel = document.createElement('span')
      toggleLabel.className = 'is-glow__toggle-label'
      toggleLabel.textContent = '彩色卡片'
      const toggleSwitch = document.createElement('button')
      toggleSwitch.type = 'button'
      toggleSwitch.className = 'is-glow__switch'
      toggleSwitch.setAttribute('role', 'switch')
      toggleSwitch.setAttribute('aria-checked', 'false')
      toggleSwitch.setAttribute('aria-label', '主栏与右栏使用彩色卡片')
      const knob = document.createElement('span')
      knob.className = 'is-glow__knob'
      toggleSwitch.appendChild(knob)
      toggle.append(toggleLabel, toggleSwitch)
      menu.appendChild(toggle)

      let cardGlassOn = false

      function applyCardGlass(on, persist) {
        cardGlassOn = on
        if (on) document.documentElement.setAttribute('data-dsh-card-glass', 'on')
        else document.documentElement.removeAttribute('data-dsh-card-glass')
        toggleSwitch.setAttribute('aria-checked', on ? 'true' : 'false')
        if (persist) saveCardGlass(on)
      }

      toggleSwitch.addEventListener('click', () => applyCardGlass(!cardGlassOn, true))

      function syncGlow(rgb) {
        const current = normalizeGlow(rgb)
        for (const option of options) {
          option.setAttribute('data-active', option.getAttribute('data-rgb') === current ? 'true' : 'false')
        }
        const hex = glowToHex(current)
        picker.value = hex
        hexText.textContent = hex
      }

      function applyGlow(rgb, persist) {
        const next = normalizeGlow(rgb)
        document.documentElement.style.setProperty('--is-glow-rgb', next)
        if (persist) saveGlow(next)
        syncGlow(next)
      }

      function setOpenState(next) {
        open = next
        menu.hidden = !next
        trigger.setAttribute('aria-expanded', next ? 'true' : 'false')
        if (next) {
          const active = options.find((option) => option.getAttribute('data-active') === 'true')
          if (active !== undefined) active.focus()
        }
      }

      trigger.addEventListener('click', (event) => {
        event.stopPropagation()
        setOpenState(!open)
      })
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setOpenState(true)
        }
      })
      root.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpenState(false)
          trigger.focus()
        }
      })

      /* Capture phase: the menu must close before any click lands behind it,
         and 'blur' cannot be used because it fires before option clicks. */
      const onPointerDown = (event) => {
        if (open && !root.contains(event.target)) setOpenState(false)
      }
      document.addEventListener('pointerdown', onPointerDown, true)

      root.append(trigger, menu)
      applyGlow(readGlow(), false)
      applyCardGlass(readCardGlass(), false)

      function place() {
        const host = findGlowHost()
        if (host === null) return
        if (root.parentNode !== host) host.prepend(root)
      }
      place()

      const observer = new MutationObserver(() => {
        if (!root.isConnected) place()
      })
      observer.observe(document.body, { childList: true, subtree: true })

      return () => {
        observer.disconnect()
        document.removeEventListener('pointerdown', onPointerDown, true)
        if (root.parentNode !== null) root.parentNode.removeChild(root)
        document.documentElement.style.removeProperty('--is-glow-rgb')
        document.documentElement.removeAttribute('data-dsh-card-glass')
      }
    }

    // Route surfaces are painted by CSS on the column underlay; the only
    // runtime left is the glow switcher, which needs a host node that CSS
    // cannot create on its own.
    return {
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style')
          style.id = STYLE_ID
          style.setAttribute('data-dsh-plugin', 'illuminating-skin')
          style.textContent = CSS
          document.head.appendChild(style)
          return () => {
            if (style.parentNode !== null) style.parentNode.removeChild(style)
          }
        }, 'illuminating-skin: stylesheet')

        ctx.effect(() => mountGlowSwitcher(), 'illuminating-skin: glow switcher')
      },
    }
  },
})