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
    // Render mode, written onto body[data-is-mode] by mountModeDetector():
    //   cs          claude-style is active: re-tint only, it owns the layout
    //   bot         ds-bot's team shell is on screen (.bt-leftcol)
    //   standalone  neither: this plugin owns the surfaces
    // Every mode selector below weighs (0,1,1), exactly like the
    // body[data-dsh-claude-style] / body:has(.bt-leftcol) selectors they
    // replaced, so the cascade order did not move in the migration.
    const MODE = (mode) => 'body[data-is-mode="' + mode + '"]'
    const CS = MODE('cs')
    const WITH_CS = G + ' ' + CS
    // Legacy plain-DSH glass ("mode 1"). Since 0.5 it only ever applies under
    // the ds-bot shell, whose BOTX rules below take most of it back again;
    // standalone mode is built from the shared LAYOUT rules instead. Kept at
    // (0,1,1) like the other mode selectors so bot rendering did not move.
    const WITHOUT_CS = G + ' body:is([data-is-mode="bot"])'
    // Card layout that only reads host anchors, shared by claude-style and
    // standalone mode. Same (0,1,1) weight as CS, so swapping a WITH_CS rule to
    // LAYOUT keeps its place in the cascade.
    const LAYOUT_BODY = 'body:is([data-is-mode="cs"],[data-is-mode="standalone"])'
    const LAYOUT = G + ' ' + LAYOUT_BODY
    const SA = G + ' ' + MODE('standalone')

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
    const CS_HS = 'html[data-windows-titlebar]:not([data-dsh-skin]) ' + CS
    const CS_FRAME = '[data-dsh-claude-part~="layout-frame"]'
    const CS_FRAME3 = CS_FRAME + CS_FRAME + CS_FRAME

    /* Every place the top light appears reads its colour from this one
       variable, so the switcher can re-tint the title band, the card gutter
       and the modal tops at once without touching a single rgba(). The
       fallback is the original 黛蓝 glow. */
    /* ds-bot (team shell) owns a whole different surface set: a fixed, opaque
       .bt-leftcol at z-index:25 sits over this plugin's glow plane, a 60px
       gradient strip is painted behind its header pill, and it re-points the
       host's --dsw-* surface tokens at its own light palette through
       ctx.theme.overrideTokens() (those land as inline body properties with no
       !important, so a body-scoped re-declaration wins). Every rule below is
       conditional on .bt-leftcol being on screen, so leaving bot mode restores
       the stock skin untouched. */
    const BOT = G + ' ' + MODE('bot')
    const BOTX = BOT + ':not(#is-bot)'

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
      G + ' div:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"]{',
      'background:rgba(4,6,10,.08)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) div:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"]{',
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
         with ._mask_14mp3_18:after (mask token) while ._dialog_14mp3_33 uses
         --dsw-alias-bg-layer-2 and no blur. Thinning the scrim is what lets the
         fill show anything at all, exactly as for settings. */
      G + ' div[role="presentation"] > [aria-hidden="true"]:after{background:rgba(4,6,10,.08)!important}',
      G + ' body:not([data-ds-dark-theme]) div[role="presentation"] > [aria-hidden="true"]:after{background:rgba(20,26,38,.04)!important}',
      G + ' div[role="presentation"] > [role="dialog"][aria-modal="true"]:not([data-shortcut-modal]){',
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
      G + ' body:not([data-ds-dark-theme]) div[role="presentation"] > [role="dialog"][aria-modal="true"]:not([data-shortcut-modal]){',
      'background-color:rgba(248,249,251,.66)!important;',
      'background-image:' +
        'radial-gradient(120% 55% at 50% 0%,rgba(var(--is-glow-rgb, 72, 100, 193),.10),rgba(var(--is-glow-rgb, 72, 100, 193),0) 72%)!important;',
      'border-color:rgba(0,0,0,.08)!important;',
      'box-shadow:0 24px 72px rgba(0,0,0,.18),' +
        'inset 0 1px 0 rgba(255,255,255,.8)!important;',
      '}',

      /* ---------- floating cards: the copy/link hover card ---------- */
      /* --dsw-hovercard-bg is declared on the card element itself
         (._card_bgejw_9{--dsw-hovercard-bg:#2C2C2E}), so a body-level token
         override cannot reach it; the declaration has to be matched there. */
      G + ' [style*="--dsh-hover-preview-fade"]{',
      '--dsw-hovercard-bg:rgba(28,31,38,.72)!important;',
      'backdrop-filter:blur(24px) saturate(140%)!important;',
      '-webkit-backdrop-filter:blur(24px) saturate(140%)!important;',
      'border:1px solid rgba(255,255,255,.08)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [style*="--dsh-hover-preview-fade"]{',
      '--dsw-hovercard-bg:rgba(248,249,251,.82)!important;',
      'border-color:rgba(0,0,0,.07)!important;',
      '}',

      /* Tooltip and toast are the last two floating surfaces that were still
         flat: both read --dsw-alias-tooltip-bg / --dsw-alias-toast-bg, which
         resolve to a solid neutral (bluish-750/800/850) and carry no blur of
         their own. The tokens are re-pointed above (applies to every consumer
         in one shot) and the blur is added on the two bubbles themselves. */
      G + ' [role="tooltip"][data-side],',
      G + ' [style*="--dsh-toast-hold"]{',
      'backdrop-filter:blur(20px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(20px) saturate(150%)!important;',
      'border:.5px solid rgba(255,255,255,.08)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [role="tooltip"][data-side],',
      G + ' body:not([data-ds-dark-theme]) [style*="--dsh-toast-hold"]{',
      'border-color:rgba(0,0,0,.07)!important;',
      '}',
      /* The host bubble hard-codes its ink to --dsw-static-neutral-bluish-00
         (white) because the stock tooltip is dark in both themes. This skin
         turns the light-theme bubble near-white, so the ink must follow. */
      G + ' body:not([data-ds-dark-theme]) [role="tooltip"][data-side]{',
      'color:var(--dsw-alias-label-primary)!important;',
      '}',

      /* claude-style's chat / code surface switch (ds-bot installs only) paints
         its selected option with solid bg-base, while the view tabs next to it
         use the translucent overlay token for their sliding pill. Give the
         switch the same track and selected fill so the two read as one family.
         The dark theme already matches (#ffffff24 on both). */
      G + ' body[data-dsh-claude-surface] .dsh-claude-surface-switch{',
      'background:var(--dsh-claude-hover-bg, rgba(0, 0, 0, .06))!important;',
      '}',
      G + ' body[data-dsh-claude-surface][data-ds-dark-theme] .dsh-claude-surface-switch{',
      'background:#ffffff14!important;',
      '}',
      G + ' body[data-dsh-claude-surface]:not([data-ds-dark-theme]) .dsh-claude-surface-option[aria-checked="true"]{',
      'background:var(--dsw-alias-bg-overlay)!important;',
      'box-shadow:0 1px 2px #1414131a!important;',
      '}',

      /* ---------- remaining static popovers ---------- */
      /* Two floating surfaces are still painted with a flat
         --dsw-alias-bg-layer-2 fill and carry no blur at all: the
         plugin-market registry picker (插件市场 → 添加插件 → 源) and the
         typeface warning popover. Neither routes through the menu tokens,
         so both stayed solid slabs beside the glass menus.
         class~= is deliberate: [class*=] would also catch the panel's own
         *_panelHeader child and paint a rim straight through it. */
      G + ' [data-install-registry],',
      G + ' [role="dialog"]:not([aria-modal="true"]){',
      'background-color:rgba(28,31,38,.72)!important;',
      'backdrop-filter:blur(32px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(32px) saturate(150%)!important;',
      'border:1px solid rgba(255,255,255,.09)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [data-install-registry],',
      G + ' body:not([data-ds-dark-theme]) [role="dialog"]:not([aria-modal="true"]){',
      'background-color:rgba(248,249,251,.78)!important;',
      'border-color:rgba(0,0,0,.08)!important;',
      '}',

      /* ---------- dockkit float window & turn-preview card ---------- */
      /* The draggable dockkit panel (tasks window) and the transcript turn-
         preview card are the last two floating surfaces still filled with a
         flat layer color. Both are already bordered by their own elevation
         shadow, so only the fill and the blur change here. */
      G + ' [data-dockkit-float],',
      G + ' [role="tooltip"]:not([data-side]){',
      'background-color:rgba(28,31,38,.72)!important;',
      'backdrop-filter:blur(32px) saturate(150%)!important;',
      '-webkit-backdrop-filter:blur(32px) saturate(150%)!important;',
      '}',
      G + ' body:not([data-ds-dark-theme]) [data-dockkit-float],',
      G + ' body:not([data-ds-dark-theme]) [role="tooltip"]:not([data-side]){',
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
      G + ' [data-queue-dock] > div:first-child::before{' +
        'background:var(--dsw-specific-bubble)!important;' +
        'backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      G + ' [data-queue-dock] > div:first-child::after{border:0!important}',
      G + ' [data-queue-dock] span{' +
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
      LAYOUT + ' [class*="_centerCol"]{--dsw-specific-sidebar-fill:var(--dsw-static-neutral-bluish-900)!important}',
      LAYOUT + ':not([data-ds-dark-theme]) [class*="_centerCol"]{--dsw-specific-sidebar-fill:var(--dsw-static-neutral-bluish-50)!important}',
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
      LAYOUT + ' [class*="_centerCol"]{' +
        'position:relative!important;' +
        'background:transparent!important;' +
        'overflow:visible!important}',
      LAYOUT + ' [class*="_centerCol"]::before{' +
        'content:"";' +
        'position:absolute!important;' +
        'inset:4px 8px 8px 4px!important;' +
        'z-index:-1!important;' +
        'pointer-events:none!important;' +
        'border-radius:16px!important;' +
        'background:var(--dsw-alias-bg-base)!important}',
      /* The lane between the two columns is shared 4+4 while the right panel is
         open (the panel contributes its own 4px through border-left), so the
         underlay mirrors the conversation root's narrowed right margin. */
      LAYOUT + ':has([data-sidebar-right-open]) [class*="_centerCol"]::before{' +
        'right:4px!important}',
      /* The card's one hairline. It lives on its own top layer because any layer
         that paints an opaque fill above the underlay (the header band, the
         composer seat) cut a line drawn underneath. The underlay and the
         conversation root used to carry a copy each, which stacked three
         0.5px rings into one heavier edge. */
      LAYOUT + ' [class*="_centerCol"]::after{' +
        'content:"";' +
        'position:absolute!important;' +
        'inset:4px 8px 8px 4px!important;' +
        'z-index:9!important;' +
        'pointer-events:none!important;' +
        'border-radius:16px!important;' +
        'box-shadow:inset 0 0 0 .5px rgba(255,255,255,.10)!important}',
      LAYOUT + ':has([data-sidebar-right-open]) [class*="_centerCol"]::after{' +
        'right:4px!important}',
      LAYOUT + ':not([data-ds-dark-theme]) [class*="_centerCol"]::after{' +
        'box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)!important}',
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [class*="_centerCol"]::after{' +
        'box-shadow:inset 0 0 0 .5px rgba(255,255,255,.16)!important}',
      CARD_GLASS + ' ' + LAYOUT_BODY + ':not([data-ds-dark-theme]) [class*="_centerCol"]::after{' +
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
      LAYOUT + ' [data-testid="task-manager-page"],' +
        LAYOUT + ' .lc-ov-page,' +
        LAYOUT + ' [class~="IIa07q_shell"]{' +
        'box-sizing:border-box!important;' +
        'background:transparent!important;' +
        'border-radius:16px!important;' +
        'margin:4px 8px 8px 4px!important;' +
        'width:auto!important;' +
        'height:calc(100% - 12px)!important;' +
        'overflow:clip!important}',
      LAYOUT + ':has([data-sidebar-right-open]) [data-testid="task-manager-page"],' +
        LAYOUT + ':has([data-sidebar-right-open]) .lc-ov-page,' +
        LAYOUT + ':has([data-sidebar-right-open]) [class~="IIa07q_shell"]{' +
        'margin-right:4px!important}',
      /* The plugin manager / plugin market pages are a different shape: their
         root (.V7pFBG_page) IS the scroller (`overflow:auto`, height:100%), not
         a clipped shell with an inner scroll pane. It therefore takes the same
         gutter but must NOT get overflow:clip -- that would kill scrolling. The
         scrollbar then lands on the page root's own right edge, which is the
         card's right edge, instead of running along the window frame outside
         the card. The rounded corners still show because the root is
         transparent and the underlay beneath it is already rounded. */
      LAYOUT + ' [data-plugin-panel]{' +
        'box-sizing:border-box!important;' +
        'margin:4px 8px 8px 4px!important;' +
        'width:auto!important;' +
        'height:calc(100% - 12px)!important;' +
        'border-radius:16px!important}',
      LAYOUT + ':has([data-sidebar-right-open]) [data-plugin-panel]{' +
        'margin-right:4px!important}',
      /* The page's sticky header paints an opaque bg-base slab on
         pageBar::before (it hides the list scrolling under it). The slab is
         square and starts at the card's own top-left, so it covers the
         underlay's rounded corner. The page root cannot clip (overflow would
         kill its scroller), so round the slab's own top corners instead. */
      LAYOUT + ' [data-plugin-panel] [data-plugin-bar]::before{' +
        'border-radius:16px 16px 0 0!important}',
      /* The plugin MARKET page is dshmarket (@prefix nUhMVa_), a different
         implementation from the host's plugin manager above. Its scroll pane is
         .nUhMVa_body (overflow-y:auto) nested in .nUhMVa_panelHost, which is the
         div dshmarket registers into the host's `main` slot. That host had no
         gutter at all, so the whole page ran edge to edge and its scrollbar was
         drawn along the window frame -- outside the card. The card box goes on
         panelHost, and its 28px top padding is dropped so the page lines up with
         the other route cards (which start at the same 4px offset). */
      LAYOUT + ' [class*="nUhMVa_panelHost"]{' +
        'box-sizing:border-box!important;' +
        'margin:4px 8px 8px 4px!important;' +
        'width:auto!important;' +
        'height:calc(100% - 12px)!important;' +
        'padding-top:0!important;' +
        'border-radius:16px!important;' +
        'overflow:clip!important}',
      LAYOUT + ':has([data-sidebar-right-open]) [class*="nUhMVa_panelHost"]{' +
        'margin-right:4px!important}',

      WITH_CS + ' [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.header"]){' +
        'background:var(--dsw-alias-bg-base)!important;height:calc(100% - 12px)!important;margin:4px 8px 8px 4px!important;border-radius:16px!important;overflow:clip!important}',
      /* The lane between the two columns is shared 4+4 only while the right panel
         is actually open (it contributes its own 4px through border-left). When
         collapsed that half is gone, so the conversation card takes the whole
         lane back instead of leaving a 4px sliver at the window edge. */
      WITH_CS + ':has([data-sidebar-right-open]) [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.header"]){margin-right:4px!important}',
      /* Everything that used to paint its own opaque panel -- the right sidebar
         column/panes and the dockkit floating windows -- joins the same glass,
         so left / centre / right stop reading as three different surfaces. */
      LAYOUT + ' [data-dockkit-column],' + LAYOUT + ' [data-dockkit-pane],' +
        LAYOUT + ' [data-dockkit-float]{background:transparent!important}',
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
      LAYOUT + ' [data-sidebar-right-panel][data-sidebar-right-open]{border-radius:16px!important;background:var(--dsw-alias-bg-base)!important;background-clip:padding-box!important;overflow:clip!important;box-sizing:border-box!important;border-left:4px solid transparent!important;border-right:8px solid transparent!important;padding-top:0px!important;box-shadow:inset 0 0 0 .5px rgba(255,255,255,.10)!important}',
      LAYOUT + ':not([data-ds-dark-theme]) [data-sidebar-right-panel][data-sidebar-right-open]{box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)!important}',
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
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [class*="_centerCol"]::before{' +
        'background:var(--is-card-fill)!important}',
      CARD_GLASS + ' ' + CS + ' [data-dsh-claude-part~="center-column"] [data-phase]:has(> [data-slot="conversation.header"]){' +
        'background:transparent!important}',
      /* No `background` shorthand here: it would reset background-clip back to
         border-box and paint the card colour into the panel's 4px transparent
         left border, i.e. one step wider than the card outline it belongs to. */
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-sidebar-right-panel][data-sidebar-right-open]{' +
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
      CARD_GLASS + ' ' + CS + '{' +
        '--dsh-claude-fade-stops:var(--is-card-fill) 0%,' +
        'color-mix(in srgb,var(--is-card-fill) 86%,transparent) 30%,' +
        'color-mix(in srgb,var(--is-card-fill) 45%,transparent) 66%,' +
        'transparent 100%!important}',
      CARD_GLASS + ' ' + CS + '{' +
        '--dsh-transcript-fade-h:56px;' +
        '--dsh-composer-fade-h:64px}',
      /* The fade under the header exists to soften the transcript scrolling up
         behind it. The trajectory and context views have no such transcript:
         their first row is a toolbar (filters, search, refresh / Web UI) sitting
         right under the header, and the 56px fade painted over it. Only the
         chat and reading views (the first two tabs) keep the fade. */
      WITH_CS + ':has([data-conversation-tabs] [role="tab"]:nth-child(n+3)[aria-selected="true"]) ' +
        '[data-dsh-claude-part~="conversation-header"]::after{display:none!important}',
      /* claude-style keeps the view tabs at opacity 0 and only fades them in
         while the pointer is over the centre column or the strip itself, so
         they vanish over the sidebars and over the title bar's drag area (which
         takes no hover). Keep them on screen; whether the strip renders at all
         is still the host's call (a started session with more than one view). */
      WITH_CS + ' [data-dsh-view-tabs],' +
        WITH_CS + ' [data-conversation-tabs],' +
        WITH_CS + ' [data-dsh-titlebar-tabs] [data-dsh-view-tabs]{opacity:1!important;transition:none!important}',
      /* The header has no fill of its own, so the page glow leaked through
         and the 28px :after fade started from mid-air. Give the band the same
         solid fill as the composer and let the (now longer) :after gradient
         carry it down into the glass. */
      CARD_GLASS + ' ' + CS + ' [data-dsh-claude-part~="conversation-header"]{' +
        'background:var(--is-card-fill)!important}',
      CARD_GLASS + ' ' + CS + ' [data-dsh-claude-part~="composer-seat"],' +
        CARD_GLASS + ' ' + CS + ' [data-composer-seat]{' +
        'background:var(--is-card-fill)!important;' +
        'border-radius:16px!important}',
      /* The running-status row ("深度求索中 N秒") is promoted to a sticky bar by
         claude-style's chat-follow mode and painted with --dsh-claude-canvas.
         Outside glass mode the plugin re-points that variable to bg-base so
         the bar does not float as a lighter slab; on the glass card the same
         value becomes a solid dark band around a translucent page. Match the
         card fill instead. */
      CARD_GLASS + ' ' + CS + ' [data-chat-running]{' +
        '--dsh-claude-canvas:transparent!important}',
      /* ReasoningRow keeps its disclosure header sticky inside an expanded
         thinking block and paints it with an opaque bg-base (.VJlF5q_root
         [data-expanded] [data-open] [data-disclosure-header]), which is the
         dark band that only shows while the block is open. Drop the fill. */
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-variant="think"][data-expanded] [data-open] [data-disclosure-header]{' +
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
      LAYOUT + ' .md-table-wide{' +
        'width:100%!important;max-width:100%!important;margin-left:0!important;padding-left:0!important}',
      /* The "edited N files" card (host WorkspaceChanges, .HOHHba_card) is
         painted with an opaque layer-1 fill and a neutral-850 header band, so
         it reads as a dark slab dropped on the glass. Re-point both to the
         same translucent family; the tiles inside keep their own colour-mix. */
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-changed-files]{' +
        'background:color-mix(in srgb, var(--is-card-fill) 92%, rgb(255,255,255))!important;' +
        'border-color:rgba(255,255,255,.10)!important}',
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-changed-files] > button{' +
        'background:transparent!important}',
      CARD_GLASS + ' body:not([data-ds-dark-theme]) [data-changed-files]{' +
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
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [class*="_centerCol"]{' +
        '--dsw-alias-bg-layer-1:color-mix(in srgb, var(--is-card-fill) 94%, rgb(255,255,255))!important;' +
        '--dsw-alias-bg-layer-2:color-mix(in srgb, var(--is-card-fill) 91%, rgb(255,255,255))!important;' +
        '--dsw-alias-bg-layer-3:color-mix(in srgb, var(--is-card-fill) 88%, rgb(255,255,255))!important}',
      CARD_GLASS + ' body:not([data-ds-dark-theme]) [class*="_centerCol"]{' +
        '--dsw-alias-bg-layer-1:rgba(250,251,252,.66)!important;' +
        '--dsw-alias-bg-layer-2:rgba(244,246,249,.66)!important;' +
        '--dsw-alias-bg-layer-3:rgba(238,241,245,.66)!important}',
      /* Sticky bars inside the card stay opaque so content scrolling under them
         is hidden, and they all paint bg-base: the reader view's fold rows
         (dsh-better-display turnProcessSticky / closedProcessSummary /
         liveFoldContainer and their box-shadow skirts) and the plugin page's
         pageBar::before. On the coloured card bg-base is no longer the card
         colour (pure white in the light theme), so each bar read as a white
         slab. Point bg-base at the card fill inside the column; --is-card-fill
         does not read bg-base, so there is no cycle. */
      CARD_GLASS + ' body [class*="_centerCol"]{--dsw-alias-bg-base:var(--is-card-fill)!important}',
      /* The tab strip keeps its opaque bg-base fill so the scrolled body can
         disappear behind it (see the rule further down). On the glass card that
         fill is the one remaining solid band in the right column -- clear it
         too, and lengthen the body's top mask so content still fades out before
         it reaches the tabs instead of showing through them. */
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-sidebar-right-panel] [data-dockkit-strip],' +
        CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-sidebar-right-panel] [class*="tabHost"]{' +
        'background:transparent!important}',
      CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-sidebar-right-panel] [class*="paneBody"],' +
        CARD_GLASS + ' ' + LAYOUT_BODY + ' [data-sidebar-right-panel] [class*="paneContent"]{' +
        '-webkit-mask-image:linear-gradient(#0000 0,#000 32px,#000 100%)!important;' +
        'mask-image:linear-gradient(#0000 0,#000 32px,#000 100%)!important}',

      /* Inner panes must not paint a second card on top of it. */
      LAYOUT + ' [data-sidebar-right-panel] [data-dockkit-pane],' +
        LAYOUT + ' [data-sidebar-right-panel] [data-dockkit-host],' +
        LAYOUT + ' [data-sidebar-right-panel] [data-dockkit-column]{background:transparent!important;border-radius:0!important}',
      /* Nudge the scrolled body down and fade its top edge. `paneBody` is
         better-sidebar's own overflow-y:auto container (.bdiHEa_paneBody);
         `paneContent` is the non-scrolling wrapper some panes use instead.
         The mask is the same fade the host uses elsewhere (.WW4l1q_fadeTop /
         ._9lTDKa_fade), and it is painted on the scroll box itself, so it stays
         pinned while the content scrolls underneath it. */
      LAYOUT + ' [data-sidebar-right-panel] [class*="paneBody"],' +
        LAYOUT + ' [data-sidebar-right-panel] [class*="paneContent"]{' +
        'padding-top:10px!important;' +
        '-webkit-mask-image:linear-gradient(#0000 0,#000 16px,#000 100%)!important;' +
        'mask-image:linear-gradient(#0000 0,#000 16px,#000 100%)!important}',
      /* Keep the tab strip / its buttons above the scrolled body: without a
         stacking context of their own the pane content paints over them as soon
         as it scrolls up. */
      LAYOUT + ' [data-sidebar-right-panel] [data-dockkit-strip],' +
        LAYOUT + ' [data-sidebar-right-panel] [class*="tabHost"]{' +
        'position:relative!important;z-index:50!important;' +
        'background:var(--dsw-alias-bg-base)!important}',
      /* Panel offsets, now static: the right pane is pinned to the same gutter as
         the conversation card (4px top, 8px bottom) with no runtime measuring.
         If a host build shifts the frame's padding box the two cards drift apart
         again and these two numbers are the only thing to re-tune. */
      LAYOUT + ' [data-sidebar-right-panel]{top:4px!important;bottom:8px!important}',
      LAYOUT + ' [data-sidebar-right-panel] [data-dockkit-column="0"][data-dockkit-pane]{border-radius:0!important}',
      /* better-sidebar draws its own 24px-radius hairline cards inside the pane;
         on top of the panel card those read as a second frame nested in the
         first. Flatten them so its content sits directly on the panel surface.
         Only the framing containers: a bare [class*="pane"] also flattened the
         pane tabs, the diff / html panes and every `panel*` box. */
      LAYOUT + ' [data-sidebar-right-panel] [class*="_pane "],' +
        LAYOUT + ' [data-sidebar-right-panel] [class$="_pane"],' +
        LAYOUT + ' [data-sidebar-right-panel] [class*="paneCard"],' +
        LAYOUT + ' [data-sidebar-right-panel] [class*="panelBody"],' +
        LAYOUT + ' [data-sidebar-right-panel] [class*="paneContent"],' +
        LAYOUT + ' [data-sidebar-right-panel] [class*="tabBody"]{' +
        'border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}',
      /* The tab host keeps its own frame stripped, but NOT its fill: it is the
         opaque band the scrolled body must disappear behind. */
      LAYOUT + ' [data-sidebar-right-panel] [class*="tabHost"]{' +
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
      /* 宿主 0.2.2 把 headerActions 挂进了 titleCluster（实测 41–77，overflow:clip
         + 横向 mask 渐隐）。claude-style 的 row-lift 与上面的 top:22px 合力把
         action 行推到 67–95，于是 77 以下那 18px 被剪掉，按钮只剩上半缘。
         只放开 overflow:visible 不够：元素一旦带 mask-image，Chrome 的 mask-clip
         默认就是 border-box，溢出部分同样被 mask 的绘制区域裁掉——视觉上看不见，
         命中测试也摸不到（elementFromPoint 会穿透到 header 本身）。所以这里连
         mask 一并清掉；它原本只为长标题右侧渐隐服务，而标题（crumbs）早已 fixed
         进系统标题栏，不在溢出的那段里。 */
      WITH_CS + ' [data-dsh-claude-part~="title-cluster"]{overflow:visible!important;mask-image:none!important;-webkit-mask-image:none!important}',
      LAYOUT + ' [data-conversation-content]{position:relative;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;overflow:visible!important}',

      /* claude-style's chat-follow mode promotes the running status row
         ("深度求索中 N秒") to a sticky bar painted with --dsh-claude-canvas
         (lib/client.js: [data-dsh-claude-chat-follow] ... [data-chat-running]
         {position:sticky;bottom:...;background:var(--dsh-claude-canvas,
         var(--dsw-alias-bg-base,#FCFCFB))}). With our glass tint that bar turned
         into a bright translucent slab floating over the transcript. Re-point the
         variable on the row itself: claude-style reads it through var(), so the
         override wins regardless of its !important specificity. */
      WITH_CS + ' [data-chat-running]{--dsh-claude-canvas:var(--dsw-alias-bg-base)!important}',
      /* ---------- standalone: the parts claude-style used to provide ----------
         The shared LAYOUT rules above draw the cards from host anchors. These
         fill in what claude-style's markers and re-tinted canvas variables
         supplied in cs mode, using host anchors only. Runtime pieces (title and
         view tabs moved into the title band) live in mountHeaderBand(). */

      /* Transparent chain down to body::before: the host paints the frame,
         the sidebar column and the centre column with bg-base / sidebar-fill. */
      SA + ' [data-slot="root"] > [class*="_frame"],' +
        SA + ' [class*="_sidebarCol"],' +
        SA + ' [data-slot="sidebar"]{background:transparent!important;border-right:0!important;box-shadow:none!important}',
      /* The host's sidebar fill also paints the title band (frame::before) and
         the native caption buttons (setTitleBarOverlay reads it on body), so it
         goes transparent on body and back to bg-base inside the centre column
         for the host surfaces there that still read it. */
      SA + '{--dsw-specific-sidebar-fill:transparent!important}',
      SA + ' [class*="_centerCol"]{--dsw-specific-sidebar-fill:var(--dsw-alias-bg-base)!important}',
      /* frame::before is the window drag strip: keep it, drop only its paint. */
      SA + ' [data-slot="root"] > [class*="_frame"]::before{background:none!important}',
      /* The host rounds the centre column's top-left corner and paints it;
         the card underlay does both now. */
      SA + ' [class*="_centerCol"]{border-radius:0!important}',
      /* Conversation root = the card body (cs: center-column part marker). */
      SA + ' [data-phase]:has(> [data-slot="conversation.header"]){' +
        'background:var(--dsw-alias-bg-base)!important;box-sizing:border-box!important;' +
        'height:calc(100% - 12px)!important;margin:4px 8px 8px 4px!important;' +
        'border-radius:16px!important;overflow:clip!important}',
      SA + ':has([data-sidebar-right-open]) [data-phase]:has(> [data-slot="conversation.header"]){margin-right:4px!important}',
      CARD_GLASS + SA.slice(G.length + 1) + ' [data-phase]:has(> [data-slot="conversation.header"]){background:transparent!important}',
      /* The header keeps its layout but loses its hairline and fill; in the
         coloured-card mode it takes the card colour so the transcript scrolling
         under it is still hidden (cs: conversation-header rule). */
      SA + ' [data-slot="conversation.header"] > *{background:transparent!important;border-bottom:0!important;box-shadow:none!important}',
      CARD_GLASS + SA.slice(G.length + 1) + ' [data-slot="conversation.header"] > *{background:var(--is-card-fill)!important}',
      /* card-glass seat fill: see C6 (--is-seat-fill) */
      /* Wide tables: same clamp as cs mode (cs anchors on table-scroll). */
      SA + ' [class*="_tableScroll"]{width:100%!important;max-width:100%!important;box-sizing:border-box!important}',

      /* ---------- standalone: header band (see mountHeaderBand) ----------
         The runtime tags the pieces and sets --is-band-left / --is-band-right;
         everything else is here. position:fixed takes the pieces out of the
         header's flow, so the header collapses to its chips row. */
      SA + ' [data-is-band]{position:fixed!important;z-index:30!important;margin:0!important;' +
        '-webkit-app-region:no-drag;top:calc(var(--dsh-windows-titlebar-height, 40px) / 2)!important;' +
        'transform:translateY(-50%)!important}',
      SA + ' [data-is-band="title"]{left:var(--is-band-left)!important;' +
        'max-width:calc(50vw - var(--is-band-left) - var(--is-band-tabs-half, 220px))!important;' +
        'overflow:hidden!important;white-space:nowrap!important}',
      SA + ' [data-is-band="title"] [class*="_crumb"]{overflow:hidden;text-overflow:ellipsis}',
      /* Left behind in the card: the title cluster with only the chips. It
         loses the right-edge fade it used for long titles. */
      SA + ' [data-slot="conversation.header"] [class*="_titleCluster"]:has(> [data-is-band="title"]){' +
        'mask-image:none!important;-webkit-mask-image:none!important;margin-left:-4px!important}',
      SA + ' [data-is-band="corner"]{right:var(--is-band-corner)!important;left:auto!important}',
      SA + ' [data-is-band="utilities"]{right:var(--is-band-right)!important;left:auto!important}',
      /* A fixed box, not width:auto: the host recomputes how many tabs fit as
         floor((row width - 48) / 120) from this element's own width, so a
         content-sized strip shrinks to one tab and pushes the rest into the
         overflow menu. The box is centred and the pill is centred inside it. */
      SA + ' [data-is-band="tabs"]{left:50%!important;transform:translate(-50%,-50%)!important;' +
        'width:min(720px,calc(100vw - 2 * max(var(--is-band-left, 160px),var(--is-band-clear-right, 240px))))!important;' +
        'height:28px!important;align-items:center!important;justify-content:center!important;' +
        'padding:0!important;gap:6px!important;flex-wrap:nowrap!important;pointer-events:none!important}',
      /* Its width keeps clear of --is-band-clear-right, the left edge of the
         right-hand controls (corner button + utilities): when it only cleared
         --is-band-corner (the corner's RIGHT offset) the drag box overlapped
         the 28px corner button (right sidebar toggle) and swallowed its clicks
         at the OS level even though DOM hit-testing still found the button.
         The box is wide and mostly empty, and Windows builds the window drag
         region from -webkit-app-region (pointer-events do not count), so the
         box itself must stay a drag surface; only the pill and the overflow
         button opt out. A no-drag box here cut the middle out of the band. */
      SA + ' [data-is-band="tabs"]{-webkit-app-region:drag!important}',
      SA + ' [data-is-band="tabs"] > *{pointer-events:auto;-webkit-app-region:no-drag}',
      /* The host tab carries an enlarged hit area (margin:-10px -10px 0,
         min-height:35px, 10px padding); in the pill that collapses the gaps
         and lifts the strip, so reset it to a plain segment. */
      SA + ' [data-is-band="tabs"] [role="tab"]{height:22px!important;min-height:0!important;margin:0!important;' +
        'display:inline-flex!important;align-items:center!important;top:0!important}',
      SA + ' [data-is-band="tabs"] [class*="_viewsMore"]{margin-top:0!important}',
      /* The strip itself: a segmented pill, always visible (no hover fade). */
      SA + ' [data-is-band="tabs"] [data-conversation-tabs]{gap:2px!important;padding:2px!important;' +
        'border-radius:7px!important;background:rgba(0,0,0,.06)!important;flex-wrap:nowrap!important;min-height:0!important}',
      SA + '[data-ds-dark-theme] [data-is-band="tabs"] [data-conversation-tabs]{background:#ffffff14!important}',
      SA + ' [data-is-band="tabs"] [role="tab"]{padding:2px 10px!important;border-radius:5px!important;' +
        'font-size:12px!important;line-height:18px!important;color:var(--dsw-alias-label-tertiary)!important}',
      SA + ' [data-is-band="tabs"] [role="tab"]:hover{color:var(--dsw-alias-label-primary)!important}',
      SA + ' [data-is-band="tabs"] [role="tab"][aria-selected="true"]{background:var(--dsw-alias-bg-overlay)!important;' +
        'color:var(--dsw-alias-label-primary)!important;box-shadow:0 1px 2px #1414131a!important}',
      SA + '[data-ds-dark-theme] [data-is-band="tabs"] [role="tab"][aria-selected="true"]{background:#ffffff24!important;box-shadow:none!important}',
      SA + ' [data-is-band="tabs"] [role="tab"]::after{display:none!important}',
      /* With title and tabs gone the header only holds the chips row
         (智能体团队 / PTC 模式); give it an even band. */
      SA + ' [data-slot="conversation.header"] > *:has([data-is-band]){min-height:0!important;padding:14px 28px 6px 20px!important}',

      /* ---------- standalone: compact sidebar (S1) ----------
         claude-style's compact layout, sizes only: shorter rows, smaller
         radii, one step down in type, tight gaps between sections. The host
         sidebar has no data-* anchors, so class suffixes scoped to
         [data-slot="sidebar"]; a renamed class just falls back to the host
         size. Plugin-drawn footer buttons (ds-bot, Remote, billing) keep their
         own look; only the foot area's spacing tightens. */
      /* New session reads as the first panel row: no fill or frame, the same
         box as _panelRow (3px transparent inline border + 9px padding, so the
         glyph sits in the same 16px column), same hover. */
      SA + ' [data-slot="sidebar"] button[class*="_newSession"]{height:30px!important;margin:6px 0 2px!important;' +
        'padding:0 9px!important;border:0!important;border-inline:3px solid transparent!important;border-radius:8px!important;' +
        'background:transparent!important;box-shadow:none!important;font-size:13px!important;line-height:18px!important}',
      SA + ' [data-slot="sidebar"] button[class*="_newSession"]:hover{background:var(--dsw-alias-interactive-bg-hover)!important}',
      SA + ' [data-slot="sidebar"] button[class*="_newSession"] [class*="_newSessionContent"]{justify-content:flex-start!important;gap:6px!important}',
      SA + ' [data-slot="sidebar"] button[class*="_newSession"] [class*="_newSessionContent"] > svg{width:14px!important;height:14px!important;margin:0 1px}',
      SA + ' [data-slot="sidebar"] nav[class*="_panelList"]{gap:2px!important;margin-bottom:8px!important}',
      SA + ' [data-slot="sidebar"] button[class*="_panelRow"]{min-height:30px!important;height:30px;padding-top:0!important;padding-bottom:0!important;' +
        'border-radius:8px!important;font-size:13px!important;line-height:18px!important}',
      SA + ' [data-slot="sidebar"] button[class*="_panelRow"] [class*="_panelGlyph"] svg{width:14px!important;height:14px!important;margin:0 1px}',
      SA + ' [data-slot="sidebar"] [class*="_sectionHeader"]{height:30px!important;margin-top:0!important;margin-bottom:4px!important;border-radius:8px!important}',
      SA + ' [data-slot="sidebar"] [class*="_sectionHeader"] > [class*="_sectionLabel"]{font-size:12px!important;line-height:16px!important;font-weight:500;' +
        'color:var(--dsw-alias-label-tertiary)!important}',
      SA + ' [data-slot="sidebar"] :is([class*="_projectRow"],[class*="_sessionRow"]){height:28px!important;min-height:28px!important;border-radius:6px!important}',
      SA + ' [data-slot="sidebar"] [class*="_groupSection"] > * + *{margin-top:1px!important}',
      SA + ' [data-slot="sidebar"] [class*="_groupSection"] + [class*="_groupSection"]{margin-top:6px!important}',
      SA + ' [data-slot="sidebar"] :is([class*="_projectRow"],[class*="_sessionRow"]) [class*="_title"]{font-size:13px!important;line-height:18px!important}',
      SA + ' [data-slot="sidebar"] [class*="_sessionRow"] [class*="_time"]{font-size:11px!important}',
      SA + ' [data-slot="sidebar"] button[class*="_sessionOverflowButton"]{height:24px!important;font-size:12px}',
      SA + ' [data-slot="sidebar"] [class*="_footArea"]{position:relative;padding-top:4px!important;padding-bottom:3px!important}',
      SA + ' [data-slot="sidebar"] [class*="_footArea"]::before{content:"";position:absolute;top:0;left:4px;right:4px;height:0;' +
        'border-top:1px solid var(--dsw-alias-border-l3);pointer-events:none}',
      SA + ' [data-slot="sidebar"] [class*="_footArea"] [data-slot="settings.launcher"] button[aria-haspopup="menu"]:not([data-collapsed="true"]){' +
        'height:34px!important;padding-top:4px!important;padding-bottom:4px!important;margin-top:4px;margin-bottom:2px;border-radius:8px!important}',

      /* ---------- standalone: context meter (C1) ----------
         The host already draws the ring + percentage (C3 moves it into the
         composer tool row)
         (ContextMeter, fed by the contextPressure projection). claude-style
         hid it for its own ring; standalone keeps the host one and only tints
         it: the filled arc takes the glow colour, the percentage reads as a
         value instead of a hint. No data-* anchor exists, so class suffixes
         scoped to the composer seat. */
      SA + ' [data-composer-seat] svg circle[class*="_track"]{stroke:color-mix(in srgb, rgb(var(--is-glow-rgb, 72, 100, 193)) 18%, var(--dsw-alias-border-l3))!important}',
      SA + ' [data-composer-seat] svg circle[class*="_fill"]{stroke:rgb(var(--is-glow-rgb, 72, 100, 193))!important}',
      SA + ' [data-composer-seat] button:has(> svg circle[class*="_fill"]){color:var(--dsw-alias-label-secondary)!important}',

      /* ---------- standalone: turn navigator (C2) ----------
         The host's own rail on the right of the transcript (TurnNavigator).
         Keep its behaviour, restyle the ticks: the current turn is a glow-
         coloured full-width bar, hovered turns lift to the secondary ink. */
      SA + ' [class*="_marks"] > [class*="_mark"]::before{width:16px!important;border-radius:1px!important}',
      SA + ' [class*="_marks"] > [class*="_markPreview"]::before{background:var(--dsw-alias-label-secondary)!important}',
      SA + ' [class*="_marks"] > [class*="_markActive"]::before{width:20px!important;' +
        'background:rgb(var(--is-glow-rgb, 72, 100, 193))!important;' +
        'box-shadow:0 0 6px rgba(var(--is-glow-rgb, 72, 100, 193),.55)!important}',

      /* ---------- standalone: composer (C3) ----------
         claude-style's inline composer, visual part only: a slim one-line
         input bar with the tool row underneath it. The host card stays the
         container (attachments, overlay, workspace trigger all live in it);
         it goes transparent and ::before paints the bar over everything above
         the tool row, so attachments and multi-line drafts grow inside the
         bar. The row is pinned to one line (--is-comp-row) so ::before and the
         send button can be offset from the card's bottom edge. The send
         button shrinks and sits in the bar's bottom-right corner. Hero
         composer (empty session page) keeps the host layout. */
      /* composer seat buffer (C6): the seat's opaque fill used to start flush
         with the bar's top edge, so text scrolled right up against it. Give
         the seat a 16px lead-in that fades from clear to the card fill. The
         host measures the seat into --dsh-composer-height, so the jump-to-
         bottom button rises with it. */
      SA + ' [data-composer-seat]:has(> * :not([class*="_hero"]) > [data-composer-card]),' +
        BOTX + ' [data-composer-seat]{--is-seat-fill:var(--dsw-alias-bg-base);' +
        'background:linear-gradient(180deg,color-mix(in srgb,var(--is-seat-fill) 0%,transparent) 0,var(--is-seat-fill) 16px)!important;' +
        'padding-top:16px!important;border-radius:0 0 16px 16px!important}',
      CARD_GLASS + SA.slice(G.length + 1) + ' [data-composer-seat],' +
        CARD_GLASS + MODE('bot') + ':not(#is-bot) [data-composer-seat]{--is-seat-fill:var(--is-card-fill)}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]{' +
        '--is-comp-row:32px;--is-comp-gap:6px;' +
        'background:transparent!important;box-shadow:none!important;' +
        'padding:0!important;gap:var(--is-comp-gap)!important;isolation:isolate}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]::before{content:"";position:absolute;' +
        'inset:0 0 calc(var(--is-comp-row) + var(--is-comp-gap)) 0;z-index:-1;pointer-events:none;box-sizing:border-box;' +
        'border-radius:14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-input-major);' +
        'box-shadow:var(--is-comp-emboss);transition:border-color .15s,box-shadow .15s}',
      /* Emboss, as on the ds-bot composer: a soft drop shadow plus a 1px
         highlight along the inner top edge, so the bar reads raised. */
      SA + '{--is-comp-emboss:0 8px 28px -6px rgba(0,0,0,.08),0 2px 6px -1px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.82)}',
      SA + '[data-ds-dark-theme]{--is-comp-emboss:0 12px 32px -6px rgba(0,0,0,.42),0 2px 8px -1px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.12)}',
      /* dark: the host's neutral grey reads muddy on the glow-tinted card;
         lift the bar one step above the card fill in the same hue. */
      SA + '[data-ds-dark-theme] [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]::before{' +
        'background:color-mix(in srgb, rgb(var(--is-glow-rgb, 72, 100, 193)) 10%, rgb(32,35,43));' +
        'border-color:rgba(255,255,255,.11)}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]:focus-within::before{' +
        'border-color:rgba(var(--is-glow-rgb, 72, 100, 193),.55);' +
        'box-shadow:0 0 0 3px rgba(var(--is-glow-rgb, 72, 100, 193),.14),var(--is-comp-emboss)}',
      /* workspace-trigger card: the host's dashed outline wraps the bar only */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]::after{' +
        'inset:0 0 calc(var(--is-comp-row) + var(--is-comp-gap)) 0!important;border-radius:14px!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [data-input-scroll]{' +
        'margin:0!important;padding:7px 72px 7px 14px;box-sizing:border-box;min-height:38px}',
      /* attachment rail (host: padding 2px 10px 0, margin-bottom -6px) relied
         on the card's 8px top padding that the bar drops. _rail matches the
         rail and its inner track, so the 5px lands twice: 10px visible. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [data-slot="conversation.input.attachments"] [class*="_rail"]{' +
        'padding:5px 5px 0!important;margin-bottom:-2px!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [data-composer-input]{min-height:24px!important;padding:0!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [data-composer-placeholder]{inset:0 0 auto 0!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"]{' +
        'flex-wrap:nowrap!important;height:var(--is-comp-row);min-height:0;padding:0 var(--is-comp-meter-w) 0 4px!important;box-sizing:border-box;overflow:visible}',
      /* Context meter joins the tool row, right of the model picker and flush
         with the bar's right edge, as in claude-style; the stats pills (turns,
         tok/s, cache hits) go, and with them the whole line under the card.
         The meter lives in the dock, a sibling after the card, so CSS anchor
         positioning pins it to the card's bottom-right corner; the row keeps
         --is-comp-meter-w free on its right for it. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]{anchor-name:--is-comp-card;--is-comp-meter-w:68px}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-dock]{' +
        'position:absolute;position-anchor:--is-comp-card;right:anchor(right);bottom:anchor(bottom);' +
        'height:var(--is-comp-row, 32px);min-height:0!important;padding:0!important;align-items:center;z-index:3}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-dock] [data-composer-stat]{display:none!important}',
      /* One line no matter how narrow (right sidebar open): the host would
         wrap, but the bar geometry needs a fixed row. Nothing is squeezed
         (squeezing fooled the host's model-compact measurement and produced
         vertical labels); items keep their own width. When the row is narrow
         the right-slot extras (cost chip, prompt enhancer) drop out, so the
         leading tools and the model picker fit, and the host still folds the
         model to its icon if even that is too wide. The row is already an
         inline-size container in the host. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"] :is([class*="_tools"],[class*="_modes"],[class*="_trailing"],[class*="_standardControls"]) > *{flex-shrink:0}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"] [data-slot] > *{flex-shrink:0;white-space:nowrap}',
      '@container (width <= 600px){' + SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"] [data-slot="conversation.input.right"]{display:none!important}}',
      /* The host's model-compact check (sum of group widths vs. the row's
         content box) can land a pixel short when the row is pinned to one
         line, leaving the model button hanging past the card. Clip the
         trailing group to what is left so it can never push out of the bar. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"] > [class*="_trailing"]{flex:0 1 auto!important;min-width:0!important;overflow:hidden}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"] > [class*="_trailing"] > [class*="_standardControls"]{min-width:0;flex:0 1 auto}',
      /* send / stop: out of the row, into the bar's bottom-right corner */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]{' +
        'position:absolute;right:7px;bottom:calc(var(--is-comp-row) + var(--is-comp-gap) + 6px);' +
        'width:24px;height:24px;padding:0;transform:none;background:rgb(var(--is-glow-rgb, 72, 100, 193))}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"] svg{width:14px;height:14px}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]:hover:not(:disabled){' +
        'background:color-mix(in srgb, rgb(var(--is-glow-rgb, 72, 100, 193)) 85%, #fff)}',
      /* ---------- standalone: composer controls (C4) ----------
         ds-bot's two-state send: with an empty draft the send button shows a
         wave glyph at full accent, with a draft the arrow; each state pops in
         (scale + turn). The two states use two identically-keyed animation
         names so flipping disabled restarts the pop. The dictation button
         (.is-mic, appended by mountComposerMic) never depends on the draft:
         it always sits left of the send button. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]{animation:is-icon-swap .42s cubic-bezier(.34,1.56,.64,1)}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]:disabled:not([data-sending]){opacity:1!important;animation-name:is-icon-swap-b}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]:disabled:not([data-sending]) svg{display:none}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]:disabled:not([data-sending])::after{content:"";width:14px;height:14px;background:currentColor;' +
        '-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Crect x=%272%27 y=%277.5%27 width=%272%27 height=%275%27 rx=%271%27/%3E%3Crect x=%275.5%27 y=%274.5%27 width=%272%27 height=%2711%27 rx=%271%27/%3E%3Crect x=%279%27 y=%272.5%27 width=%272%27 height=%2715%27 rx=%271%27/%3E%3Crect x=%2712.5%27 y=%275.5%27 width=%272%27 height=%279%27 rx=%271%27/%3E%3Crect x=%2716%27 y=%278%27 width=%272%27 height=%274%27 rx=%271%27/%3E%3C/svg%3E") center / 14px 14px no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Crect x=%272%27 y=%277.5%27 width=%272%27 height=%275%27 rx=%271%27/%3E%3Crect x=%275.5%27 y=%274.5%27 width=%272%27 height=%2711%27 rx=%271%27/%3E%3Crect x=%279%27 y=%272.5%27 width=%272%27 height=%2715%27 rx=%271%27/%3E%3Crect x=%2712.5%27 y=%275.5%27 width=%272%27 height=%279%27 rx=%271%27/%3E%3Crect x=%2716%27 y=%278%27 width=%272%27 height=%274%27 rx=%271%27/%3E%3C/svg%3E") center / 14px 14px no-repeat}',
      '@keyframes is-icon-swap-b{from{opacity:0;transform:scale(.5) rotate(-30deg)}}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [class*="_trailing"] > button[class*="_primary"]:active:not(:disabled){scale:.9}',
      '@keyframes is-icon-swap{from{opacity:0;transform:scale(.5) rotate(-30deg)}}',
      '.is-mic{display:none}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card]:has(:is([class*="_triggerAnchor"],[data-voice-activity])) > .is-mic{display:inline-grid;place-items:center;position:absolute;z-index:2;' +
        'right:37px;bottom:calc(var(--is-comp-row) + var(--is-comp-gap) + 6px);width:24px;height:24px;padding:0;border:0;' +
        'border-radius:50%;cursor:pointer;color:var(--dsw-alias-label-secondary);' +
        'background:color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);' +
        'box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2);' +
        'transition:right .22s cubic-bezier(.22,1,.36,1),background-color .15s,color .15s,scale .12s}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > .is-mic:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);color:var(--dsw-alias-label-primary)}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > .is-mic:active{scale:.9}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > .is-mic svg{width:14px;height:14px;display:block}',
      /* voice proxy (C7): the bar button exists only while the host voice
         plugin renders into the card; its own trigger is hidden, and while it
         records its capture row takes the whole trailing group. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] [data-slot="conversation.input.activity"] [class*="_triggerAnchor"]{display:none!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"] > [class*="_trailingActive"]{flex:1 1 auto!important}',
      /* voice capture row (C7b): while the host records, its row replaces the
         tools; drop the right gutter kept for the context meter (and the
         meter itself) so the stop button lines up with the bar's right edge. */
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > [class*="_row"]:has(> [class*="_trailingActive"]){padding-right:4px!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]):has(> [data-composer-card] > [class*="_row"] > [class*="_trailingActive"]) > [data-composer-dock]{display:none!important}',
      /* round frame for the bar microphone (and the host capture row buttons) */
      ':is(' + SA + ',' + BOTX + ') [data-composer-seat] [data-composer-card] > .is-mic{border-radius:50%!important;corner-shape:round}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > .is-mic:disabled{opacity:.4;cursor:default}',
      BOTX + ' [data-composer-seat] [data-composer-card]:has(:is([class*="_triggerAnchor"],[data-voice-activity])) > .is-mic{display:inline-grid;place-items:center;position:absolute;z-index:2;' +
        'right:37px;bottom:calc(var(--is-comp-row) + var(--is-comp-gap) + 6px);width:24px;height:24px;padding:0;border:0;border-radius:50%;cursor:pointer;' +
        'color:var(--bt-ink-2);background:color-mix(in srgb,var(--bt-ink) 5%,transparent);box-shadow:inset 0 0 0 .5px var(--bt-line)}',
      BOTX + ' [data-composer-seat] [data-composer-card] > .is-mic:hover{background:color-mix(in srgb,var(--bt-ink) 10%,transparent);color:var(--bt-ink)}',
      BOTX + ' [data-composer-seat] [data-composer-card] > .is-mic:active{scale:.9}',
      /* ds-bot's own Web Speech mic only renders when the host voice plugin is off; the rule is: no plugin, no microphone. */
      BOTX + ' [data-composer-seat] [data-composer-card] .bt-mic{display:none!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] > .is-mic svg{width:14px;height:14px;display:block}',
      BOTX + ' [data-composer-seat] [data-composer-card] > .is-mic[aria-pressed="true"]{background:#ff3e51;color:#fff;box-shadow:none;animation:is-mic-pulse 1.4s ease-in-out infinite}',
      BOTX + ' [data-composer-seat] [data-composer-card] [data-slot="conversation.input.activity"] [class*="_triggerAnchor"]{display:none!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] [class*="_trailingActive"]{flex:1 1 auto!important}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > .is-mic[aria-pressed="true"]{background:#ff3e51;color:#fff;box-shadow:none;animation:is-mic-pulse 1.4s ease-in-out infinite}',
      '@keyframes is-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,62,81,.35)}50%{box-shadow:0 0 0 5px rgba(255,62,81,0)}}',
      SA + ' [data-composer-seat] :not([class*="_hero"]) > [data-composer-card] > .is-mic-note{position:absolute;right:8px;bottom:calc(var(--is-comp-row) + var(--is-comp-gap) + 40px);' +
        'padding:5px 10px;border-radius:8px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);' +
        'font-size:12px;line-height:16px;white-space:nowrap;pointer-events:none;z-index:4}',
      '@media (prefers-reduced-motion:reduce){.is-mic,.is-mic svg,[data-composer-card] button[class*="_primary"]{animation:none!important;transition:none!important}}',

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
      'backdrop-filter:blur(32px) saturate(106%);',
      '-webkit-backdrop-filter:blur(32px) saturate(106%);',
      '}',

      /* plain-DSH mode: the frame (unlike the sidebar) also carries the
         title-band blue bleed */
      SIDEBAR + '::before{background:' + GLASS + '}',
      FRAME + '::before{background:' + TITLEBAR_GLOW + ',' + GLASS + '}',
      WITHOUT_CS + ':not([data-ds-dark-theme]) [data-slot="root"] > [class*="_frame"]::before{background:' + TITLEBAR_GLOW_LIGHT + ',' + GLASS_LIGHT + '}',

      SIDEBAR + '{position:relative;background:transparent!important;border-right:0!important;box-shadow:none!important}',
      G + ' [data-slot="sidebar"]{background:transparent!important}',
      SIDEBAR + ' *{background:transparent!important;box-shadow:none!important}',

      WITHOUT_CS + ' [class*="_centerCol"],',
      WITHOUT_CS + ' [data-phase]:has(> [data-slot="conversation.header"])',
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
      /* GLASS above is a fixed dark fill. Without this light-theme twin the
         conversation header keeps a dark band under a light theme -- which is
         exactly what DS-Bot showed, since it has no claude-style markers and
         therefore falls through to this mode-1 branch. */
      WITHOUT_CS + ':not([data-ds-dark-theme]) [data-slot="conversation.header"] > *',
      '{background:' + GLASS_LIGHT + '!important}',
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
      G + ' div[role="presentation"] > [role="dialog"][aria-modal="true"]:not([data-shortcut-modal]),',
      G + ' [data-install-registry],',
      G + ' [role="dialog"]:not([aria-modal="true"]),',
      G + ' [data-dockkit-float],',
      G + ' [role="tooltip"]:not([data-side]),',
      G + ' [style*="--dsh-hover-preview-fade"],',
      G + ' [role="tooltip"][data-side],',
      G + ' [style*="--dsh-toast-hold"],',
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
      'body:not([data-is-mode="standalone"]) .is-glow__band,html:not([data-windows-titlebar]) .is-glow__band{display:none}',
      '.is-glow__toggle-label{flex:1 1 auto;font-size:12px;color:var(--dsw-alias-label-secondary,#9aa0aa)}',
      '.is-glow__switch{position:relative;width:30px;height:17px;padding:0;border:0;border-radius:9px;flex:none;' +
        'cursor:pointer;background:rgba(255,255,255,.18);transition:background .15s ease}',
      'body:not([data-ds-dark-theme]) .is-glow__switch{background:rgba(0,0,0,.18)}',
      '.is-glow__switch[aria-checked="true"],' +
        'body:not([data-ds-dark-theme]) .is-glow__switch[aria-checked="true"]{background:rgb(var(--is-glow-rgb, 72, 100, 193))}',
      '.is-glow__knob{position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;' +
        'background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .15s ease}',
      '.is-glow__switch[aria-checked="true"] .is-glow__knob{transform:translateX(13px)}',
      /* Theme cycle: a pill that shows the current host preference
         (light / dark / system) and steps through the three on click. */
      '.is-glow__theme-value{border:0;border-radius:999px;padding:3px 10px;flex:none;cursor:pointer;' +
        'font:inherit;font-size:11.5px;line-height:16px;' +
        'color:var(--dsw-alias-label-primary,#e5e7eb);background:rgba(255,255,255,.08)}',
      '.is-glow__theme-value:hover{background:rgba(255,255,255,.16)}',
      'body:not([data-ds-dark-theme]) .is-glow__theme-value{background:rgba(0,0,0,.06)}',
      'body:not([data-ds-dark-theme]) .is-glow__theme-value:hover{background:rgba(0,0,0,.12)}',
      '@media (prefers-reduced-transparency:reduce){',
      '.is-glow__menu{backdrop-filter:none;-webkit-backdrop-filter:none}',
      '}',

      /* bili (billion-context) renders an 'upstream unavailable' banner into
         the shell overlay layer: a div[role="status"] carrying inline orange
         styling rgba(217,63,11,...). It sits at the top-left and overlaps the
         page beneath it, so hide it. Two variants cover both the authored
         'rgba(217,63,11,...)' text and its CSSOM-serialised form with spaces. */
      '[data-shell-overlay] [role="status"][style*="217,63,11"],' +
      '[data-shell-overlay] [role="status"][style*="217, 63, 11"],' +
      '[data-shell-overlay] [role="status"][style*="217 63 11"]{display:none!important}',

      /* ---------- ds-bot (team shell) ----------
         Two jobs, both scoped to the bot surface. (a) Re-state the host's surface
         tokens in this skin's dark glass values, because ds-bot overrides them
         with its own light palette through inline body properties -- that is what
         turns the window controls white. (b) Re-colour ds-bot's own --bt-* palette
         so its glass panels keep legible text: the stock values are a light theme
         (#fcfcfc surface, #141414 ink) and would read as white slabs on top of
         the gradient. --bt-* are plain custom properties, so the values mix with
         every color-mix() / var() ds-bot already writes. */
      BOT + '[data-ds-dark-theme]{' +
        '--dsw-alias-bg-base:#151517!important;' +
        '--dsw-specific-sidebar-fill:#151517!important;' +
        '--dsw-specific-input-major:#1a1c22!important;' +
        '--dsw-alias-label-primary:#e7e9ee!important;' +
        '--dsw-alias-label-secondary:rgba(231,233,238,.72)!important;' +
        '--dsw-alias-label-tertiary:rgba(231,233,238,.55)!important;' +
        '--bt-main:rgba(20,22,28,.45);' +
        '--bt-sidebar:rgba(16,18,23,.55);' +
        '--bt-leftcol-fill:rgba(16,18,23,.55);' +
        '--bt-card:rgba(30,33,40,.72);' +
        '--bt-bubble:rgba(255,255,255,.09);' +
        '--bt-ink:#e7e9ee;' +
        '--bt-ink-2:rgba(231,233,238,.66);' +
        '--bt-ink-3:rgba(231,233,238,.42);' +
        '--bt-user:rgba(91,123,255,.22);' +
        '--bt-user-ink:#e7e9ee;' +
        '--bt-line:rgba(255,255,255,.10);' +
        '--bt-line-2:rgba(255,255,255,.18);' +
        '--bt-line-weak:rgba(255,255,255,.12);' +
        '--bt-hover:rgba(255,255,255,.07);' +
        '--bt-active:rgba(255,255,255,.13);' +
        '--bt-tag-bg:rgba(255,255,255,.09);' +
        '--bt-tag-ink:rgba(231,233,238,.72);' +
        '--bt-knob:#e7e9ee;' +
        '--bt-glass-border:rgba(255,255,255,.18);' +
        '--bt-glass-rim:rgba(255,255,255,.10);' +
        '--bt-glass-shadow:0 8px 28px -6px rgba(0,0,0,.45),' +
          '0 2px 6px -1px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.06)}',
      /* Same block for the light theme. ds-bot ships its own light palette on
         plain body{}, but this declaration outranks it (element+has+attr beats
         a bare body), so leaving the dark values un-gated painted a light UI
         with a dark main column and a dark sidebar fill. */
      BOT + ':not([data-ds-dark-theme]){' +
        '--dsw-alias-bg-base:#f7f8fa!important;' +
        '--dsw-specific-sidebar-fill:#f7f8fa!important;' +
        '--dsw-specific-input-major:#ffffff!important;' +
        '--dsw-alias-label-primary:#141414!important;' +
        '--dsw-alias-label-secondary:rgba(20,20,20,.66)!important;' +
        '--dsw-alias-label-tertiary:rgba(20,20,20,.45)!important;' +
        '--bt-main:rgba(252,252,252,.58);' +
        '--bt-sidebar:rgba(247,247,247,.58);' +
        '--bt-leftcol-fill:rgba(247,247,247,.48);' +
        '--bt-card:rgba(255,255,255,.74);' +
        '--bt-bubble:rgba(20,20,20,.06);' +
        '--bt-ink:#141414;' +
        '--bt-ink-2:rgba(20,20,20,.66);' +
        '--bt-ink-3:rgba(20,20,20,.42);' +
        '--bt-user:rgba(91,123,255,.18);' +
        '--bt-user-ink:#141414;' +
        '--bt-line:rgba(20,20,20,.10);' +
        '--bt-line-2:rgba(20,20,20,.18);' +
        '--bt-line-weak:rgba(20,20,20,.12);' +
        '--bt-hover:rgba(20,20,20,.06);' +
        '--bt-active:rgba(20,20,20,.12);' +
        '--bt-tag-bg:rgba(20,20,20,.06);' +
        '--bt-tag-ink:rgba(20,20,20,.72);' +
        '--bt-knob:#ffffff;' +
        '--bt-glass-border:rgba(255,255,255,.72);' +
        '--bt-glass-rim:rgba(20,20,20,.09);' +
        '--bt-glass-shadow:0 8px 28px -6px rgba(0,0,0,.10),' +
          '0 2px 6px -1px rgba(0,0,0,.05),inset 0 1px 0 rgba(255,255,255,.82)}',

      /* The strip ds-bot paints behind its centred header pill: an opaque
         --bt-main gradient, 60px tall and wider than the card, which on the
         glass reads as a grey band. Remove it; the pill keeps its own fill. */
      BOT + ' [class*="_header"]:has(.bt-head)::before,' +
      BOT + ' header:has(.bt-head)::before{display:none!important}',

      /* claude-style strips its body marker while ds-bot is up, so the bot
         surface falls into mode 1, whose frame / column / header / content
         glass stack four fills over body::before. Undo that stack and rebuild
         the stock (mode 2) look: one glow plane, one card. BOTX carries an id
         in :not() so it out-specifies every mode-1 rule, theme-gated ones
         included, without a second copy per theme. */
      /* The frame's ::before is ALSO the host's window drag strip
         ([data-windows-titlebar] ._frame:before{height:titlebar-height;
         -webkit-app-region:drag}) -- the only drag region on the page, so
         hiding it killed window dragging and double-click maximise. Strip
         only mode 1's glass from it and put it back to the 40px strip. */
      BOTX + ' [data-slot="root"] > [class*="_frame"]::before{' +
        'background:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;' +
        'inset:0 0 auto!important;height:var(--dsh-windows-titlebar-height, 0px)!important;' +
        'z-index:auto!important}',
      BOTX + ' [data-slot="conversation.header"] > *{background:transparent!important;' +
        'backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      BOTX + ' [data-conversation-content]{margin:0!important;border:0!important;' +
        'border-radius:0!important;box-shadow:none!important;background:transparent!important}',
      BOTX + ' [data-phase]:has(> [data-slot="conversation.header"]){' +
        'box-sizing:border-box!important;margin:4px 8px 8px 4px!important;' +
        'height:calc(100% - 12px)!important;border-radius:16px!important;overflow:clip!important}',
      BOTX + ' [class*="_centerCol"]::before{' +
        'inset:4px 8px 8px 4px!important;z-index:-1!important;border-radius:16px!important;' +
        'background:var(--dsw-alias-bg-base)!important;' +
        'backdrop-filter:none!important;-webkit-backdrop-filter:none!important;' +
        'box-shadow:inset 0 0 0 .5px rgba(255,255,255,.10)!important}',
      BOTX + ':not([data-ds-dark-theme]) [class*="_centerCol"]::before{' +
        'box-shadow:inset 0 0 0 .5px rgba(0,0,0,.08)!important}',
      CARD_GLASS + MODE('bot') + ':not(#is-bot) [class*="_centerCol"]::before{' +
        'background:var(--is-card-fill)!important}',
      /* The seat paints the card's own fill (as in standalone), so the
         transcript does not scroll visibly under the composer; the bottom
         corners follow the card's 16px radius. */
      /* Jump-to-bottom: ds-bot restyles it as a centred 36px glass disc with
         its own arrow; put back the host button the normal view uses (34px
         floating pill at the right edge of the transcript column). */
      BOTX + ' [class*="_toBottomSlot"]{justify-content:flex-end!important;' +
        'padding-right:max(calc(var(--dsh-composer-side-clearance, 0px) + 16px), calc((100% - var(--dsh-chat-content-width, 100%)) / 2))!important}',
      BOTX + ' [data-conversation-scroll] [class*="_toBottomSlot"]{bottom:calc(var(--dsh-composer-height,152px) + 16px)!important}',
      BOTX + ' [class*="_toBottomSlot"] > button{width:34px!important;height:34px!important;margin-top:-34px!important;' +
        'background:var(--dsw-alias-button-floating-fill)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;' +
        'color:var(--dsw-alias-label-primary)!important;box-shadow:var(--dsw-elevation-panel)!important}',
      BOTX + ' [class*="_toBottomSlot"] > button:hover{background:var(--dsw-alias-button-floating-hover)!important}',
      BOTX + ' [class*="_toBottomSlot"] > button svg{display:block!important}',
      BOTX + ' [class*="_toBottomSlot"] > button::before{display:none!important}',
      /* ---------- ds-bot: composer bar (C5) ----------
         Same shape as the standalone composer: ds-bot lays the card out as one
         wrapped row (tools | input | trailing, the row itself display:contents).
         Re-order it so the input takes a full-width first line and the tools
         wrap underneath; the card goes transparent and ::before paints the
         embossed glass bar (ds-bot's own --bt-glass-* tokens) over the input
         line only. ds-bot's dictation (.bt-mic) and its two-state send
         (.bt-voice wave when empty / host send arrow with a draft, popping in
         with bt-icon-swap) move into the bar's bottom-right corner. ds-bot
         has no model picker or context meter here, so nothing else moves. */
      BOTX + ' [data-composer-seat] [data-composer-card]{--is-comp-row:32px;--is-comp-gap:6px;position:relative!important;background:transparent!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:0!important;row-gap:var(--is-comp-gap)!important;column-gap:0!important;min-height:0!important;isolation:isolate}',
      BOTX + ' [data-composer-seat] [data-composer-card]::before{content:"";position:absolute;inset:0 0 calc(var(--is-comp-row) + var(--is-comp-gap)) 0;z-index:-1;pointer-events:none;box-sizing:border-box;border-radius:14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-input-major);box-shadow:var(--is-comp-emboss);transition:border-color .15s,box-shadow .15s}',
      BOT + '{--is-comp-emboss:0 8px 28px -6px rgba(0,0,0,.08),0 2px 6px -1px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.82)}',
      BOT + '[data-ds-dark-theme]{--is-comp-emboss:0 12px 32px -6px rgba(0,0,0,.42),0 2px 8px -1px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.12)}',
      BOTX + '[data-ds-dark-theme] [data-composer-seat] [data-composer-card]::before{background:color-mix(in srgb, rgb(var(--is-glow-rgb, 72, 100, 193)) 10%, rgb(32,35,43));border-color:rgba(255,255,255,.11)}',
      BOTX + ' [data-composer-seat] [data-composer-card]:focus-within::before{border-color:rgba(var(--is-glow-rgb, 72, 100, 193),.55);box-shadow:0 0 0 3px rgba(var(--is-glow-rgb, 72, 100, 193),.14),var(--is-comp-emboss)}',
      BOTX + ' [data-composer-seat] [data-composer-card]::after{inset:0 0 calc(var(--is-comp-row) + var(--is-comp-gap)) 0!important;border-radius:14px!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] > [data-slot="conversation.input.attachments"] > [class*="_rail"]{order:0!important;flex:0 0 100%!important;padding:10px 10px 0!important;margin:0!important;box-sizing:border-box}',
      BOTX + ' [data-composer-seat] [data-composer-card] > [data-input-scroll]{order:1!important;flex:0 0 100%!important;box-sizing:border-box;padding:7px 72px 7px 14px!important;margin:0!important;min-height:38px}',
      BOTX + ' [data-composer-seat] [data-composer-card]:has(> [data-slot="conversation.input.attachments"] > [class*="_rail"]) > [data-input-scroll]{margin:0!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] [class*="_tools"]{order:2!important;align-self:center!important;height:var(--is-comp-row);padding-left:4px;gap:8px!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] [class*="_trailing"]{order:3!important;align-self:center!important;margin-left:auto!important;height:var(--is-comp-row);padding-right:4px}',
      /* corner buttons */
      BOTX + ' [data-composer-seat] [data-composer-card] :is(.bt-mic,.bt-voice,button[class*="_primary"]){position:absolute!important;z-index:2;bottom:calc(var(--is-comp-row) + var(--is-comp-gap) + 6px)!important;width:24px!important;height:24px!important;min-width:0!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] :is(.bt-voice,button[class*="_primary"]){right:7px!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] .bt-mic{right:37px!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] :is(.bt-mic,.bt-voice,button[class*="_primary"]) svg{width:14px!important;height:14px!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] :is(.bt-voice,button[class*="_primary"]){background:rgb(var(--is-glow-rgb, 72, 100, 193))!important;color:#fff!important}',
      BOTX + '[data-bt-room] [data-composer-seat] [data-composer-card] button[class*="_primary"]:disabled:not([data-sending]){' +
        'display:inline-grid!important;place-items:center;opacity:1!important;cursor:default;animation:is-icon-swap-b .42s cubic-bezier(.34,1.56,.64,1)}',
      BOTX + '[data-bt-room] [data-composer-seat] [data-composer-card] button[class*="_primary"]:disabled:not([data-sending]) svg{display:none!important}',
      BOTX + '[data-bt-room] [data-composer-seat] [data-composer-card] button[class*="_primary"]:disabled:not([data-sending])::after{' +
        'content:"";width:14px;height:14px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Crect x=%272%27 y=%277.5%27 width=%272%27 height=%275%27 rx=%271%27/%3E%3Crect x=%275.5%27 y=%274.5%27 width=%272%27 height=%2711%27 rx=%271%27/%3E%3Crect x=%279%27 y=%272.5%27 width=%272%27 height=%2715%27 rx=%271%27/%3E%3Crect x=%2712.5%27 y=%275.5%27 width=%272%27 height=%279%27 rx=%271%27/%3E%3Crect x=%2716%27 y=%278%27 width=%272%27 height=%274%27 rx=%271%27/%3E%3C/svg%3E") center / 14px 14px no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27%3E%3Crect x=%272%27 y=%277.5%27 width=%272%27 height=%275%27 rx=%271%27/%3E%3Crect x=%275.5%27 y=%274.5%27 width=%272%27 height=%2711%27 rx=%271%27/%3E%3Crect x=%279%27 y=%272.5%27 width=%272%27 height=%2715%27 rx=%271%27/%3E%3Crect x=%2712.5%27 y=%275.5%27 width=%272%27 height=%279%27 rx=%271%27/%3E%3Crect x=%2716%27 y=%278%27 width=%272%27 height=%274%27 rx=%271%27/%3E%3C/svg%3E") center / 14px 14px no-repeat}',
      BOTX + '[data-bt-room] [data-composer-seat] [data-composer-card] .bt-mic:not([aria-pressed=true]){' +
        'background:color-mix(in srgb,var(--bt-ink) 5%,transparent)!important;color:var(--bt-ink-2)!important;box-shadow:inset 0 0 0 .5px var(--bt-line)!important}',
      BOTX + ' [data-composer-seat] [data-composer-card] .bt-mic-note{bottom:calc(var(--is-comp-row) + var(--is-comp-gap) + 40px)!important}',


      /* The left column and the native caption buttons join the glow plane.
         Windows paints the caption buttons with whatever the host measures for
         --dsw-specific-sidebar-fill on body (setTitleBarOverlay), so making the
         token transparent there is what removes the grey caption block. The
         centre column gets a solid value back for the host surfaces inside it
         that also read this token. */
      BOTX + '{--dsw-specific-sidebar-fill:transparent!important;--bt-leftcol-fill:transparent}',
      BOTX + ' [class*="_centerCol"]{--dsw-specific-sidebar-fill:var(--dsw-alias-bg-base)!important}',

      /* ds-bot's header squeezes the host utility cluster to zero width, so the
         switcher is mounted on body in bot mode and pinned into the title bar,
         left of the caption buttons (titlebar-area-* when the window exposes
         them, ~150px otherwise). */
      G + ' body > .is-glow{position:fixed!important;z-index:31!important;margin:0!important;' +
        'top:calc((var(--dsh-windows-titlebar-height, 40px) - 26px) / 2)!important;' +
        'right:calc(100vw - env(titlebar-area-x, 0px) - env(titlebar-area-width, calc(100vw - 138px)) + 12px)!important}',
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
      /* ds-bot in bot mode owns the header row and squeezes the host utility
         cluster to zero width. Mount on body instead: a fixed child of the
         header would resolve against the header's backdrop-filter box rather
         than the viewport and land below the title bar. */
      if (document.querySelector('.bt-head') !== null) return document.body
      const marked = document.querySelector('[data-dsh-claude-part~="header-utilities"]')
      if (marked !== null) return marked
      const actions = document.querySelector('[data-dsh-claude-part~="header-actions"]')
      if (actions !== null) return actions
      const header = document.querySelector('[data-slot="conversation.header"]')
      const inHeader = header === null ? null : (
        header.querySelector('[class*="_headerUtilities"]') ||
        header.querySelector('[class*="_headerActions"]')
      )
      // Pages without a conversation header (plugins, automation, memory...)
      // had nowhere to mount, so the switcher vanished there. Park it on body;
      // CSS pins body > .is-glow into the title bar, as in bot mode.
      return inHeader ?? document.body
    }

    function mountGlowSwitcher(ctx) {
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

      /* Layout row (standalone only; claude-style and ds-bot own their own
         header): whether title, view tabs and header controls move into the
         window title band. Hidden by CSS in the other modes. */
      const bandRow = document.createElement('div')
      bandRow.className = 'is-glow__toggle is-glow__band'
      const bandLabel = document.createElement('span')
      bandLabel.className = 'is-glow__toggle-label'
      bandLabel.textContent = '标题进入顶栏'
      const bandSwitch = document.createElement('button')
      bandSwitch.type = 'button'
      bandSwitch.className = 'is-glow__switch'
      bandSwitch.setAttribute('role', 'switch')
      bandSwitch.setAttribute('aria-label', '把会话标题、视图标签与工具按钮放进窗口标题栏')
      const bandKnob = document.createElement('span')
      bandKnob.className = 'is-glow__knob'
      bandSwitch.appendChild(bandKnob)
      bandRow.append(bandLabel, bandSwitch)
      menu.appendChild(bandRow)

      function applyBand(on, persist) {
        if (on) document.documentElement.removeAttribute(BAND_OFF_ATTR)
        else document.documentElement.setAttribute(BAND_OFF_ATTR, '')
        bandSwitch.setAttribute('aria-checked', on ? 'true' : 'false')
        if (persist) {
          try { window.localStorage.setItem(BAND_OFF_KEY, on ? 'on' : 'off') } catch (error) { /* session only */ }
        }
      }
      bandSwitch.addEventListener('click', () =>
        applyBand(document.documentElement.hasAttribute(BAND_OFF_ATTR), true))
      let bandStored = null
      try { bandStored = window.localStorage.getItem(BAND_OFF_KEY) } catch (error) { /* default on */ }
      applyBand(bandStored !== 'off', false)

      /* Theme row: the last item in the menu. Three-state cycle (light ->
         dark -> system) that writes through ctx.theme.setTheme(), so the
         native titlebar, menus and the claude-style palette follow along
         instead of only the page repainting. A system preference resolves
         against the appearance actually on screen, so the first click from
         "system" always flips what the user sees. */
      const themeRow = document.createElement('div')
      themeRow.className = 'is-glow__toggle is-glow__theme'
      const themeLabel = document.createElement('span')
      themeLabel.className = 'is-glow__toggle-label'
      themeLabel.textContent = '主题'
      const themeButton = document.createElement('button')
      themeButton.type = 'button'
      themeButton.className = 'is-glow__theme-value'
      themeButton.setAttribute('aria-label', '切换外观主题（浅色 / 深色 / 跟随系统）')
      themeRow.append(themeLabel, themeButton)
      menu.appendChild(themeRow)

      const THEME_LABELS = { light: '浅色', dark: '深色', system: '跟随系统' }
      const THEME_CYCLE = ['light', 'dark', 'system']

      function themeService() {
        return ctx !== undefined && ctx.theme !== undefined ? ctx.theme : null
      }

      function readPreference() {
        const service = themeService()
        if (service === null) return null
        try {
          const snapshot = service.getTheme()
          if (snapshot === null || snapshot === undefined) return null
          const value = snapshot.preference ?? (snapshot.active && snapshot.active.id)
          return typeof value === 'string' ? value : null
        } catch (error) {
          return null
        }
      }

      function actualScheme() {
        return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'
      }

      function nextPreference(current) {
        if (current === 'system') return actualScheme() === 'dark' ? 'light' : 'dark'
        const index = THEME_CYCLE.indexOf(current)
        if (index < 0) return 'dark'
        return THEME_CYCLE[(index + 1) % THEME_CYCLE.length]
      }

      function syncTheme() {
        const current = readPreference()
        themeButton.textContent = THEME_LABELS[current] || '跟随系统'
        themeButton.setAttribute('data-theme', current || 'system')
      }

      themeButton.addEventListener('click', () => {
        const service = themeService()
        if (service === null) return
        const current = readPreference() || 'system'
        try {
          service.setTheme(nextPreference(current))
        } catch (error) {
          return
        }
        syncTheme()
        themeButton.focus()
      })

      syncTheme()
      /* The host repaints the document from its own snapshot, so watch the
         two attributes it writes rather than polling: a preference changed
         from the settings panel must re-label this pill too. */
      const themeObserver = new MutationObserver(syncTheme)
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ds-theme-source'] })

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

      let parkedInBot = false
      function place() {
        const host = findGlowHost()
        if (host === null) return
        parkedInBot = document.querySelector('.bt-head') !== null
        // On body the switcher must come AFTER the frame: Chromium folds
        // -webkit-app-region boxes in document order, so a no-drag box placed
        // before the frame drag strip is swallowed by it and never sees a click.
        if (root.parentNode !== host) {
          if (host === document.body) host.append(root)
          else host.prepend(root)
        }
      }
      // Parked on body outside bot mode means "no header yet": move into the
      // header as soon as one appears. Only runs while parked there.
      function parkedOnBodyFallback() {
        return root.parentNode === document.body && !parkedInBot
      }
      place()

      const observer = new MutationObserver(() => {
        if (!root.isConnected) { place(); return }
        /* Switching bot mode in either direction leaves the current holder
           connected (the bot header outlives .bt-head; the host utility cluster
           survives ds-bot squeezing it to zero width), so re-resolve on a mode
           flip. One class lookup per mutation batch. */
        if ((document.querySelector('.bt-head') !== null) !== parkedInBot) { place(); return }
        if (parkedOnBodyFallback() && findGlowHost() !== document.body) place()
      })
      observer.observe(document.body, { childList: true, subtree: true })

      return () => {
        observer.disconnect()
        themeObserver.disconnect()
        document.removeEventListener('pointerdown', onPointerDown, true)
        if (root.parentNode !== null) root.parentNode.removeChild(root)
        document.documentElement.style.removeProperty('--is-glow-rgb')
        document.documentElement.removeAttribute('data-dsh-card-glass')
        document.documentElement.removeAttribute(BAND_OFF_ATTR)
      }
    }

    // Mode detector -------------------------------------------------------------
    //
    // Writes body[data-is-mode] = cs | bot | standalone, the one switch every
    // mode-gated rule reads. Precedence: a ds-bot shell on screen wins (claude-
    // style already strips its own marker in that case), then claude-style,
    // then standalone. The stylesheet is injected before this runs, so on the
    // very first frame no mode rule matches yet; the detector runs
    // synchronously right after, before the first paint.
    function detectMode() {
      if (document.querySelector('.bt-leftcol') !== null) return 'bot'
      if (document.body.hasAttribute('data-dsh-claude-style')) return 'cs'
      return 'standalone'
    }

    function mountModeDetector() {
      const ATTR = 'data-is-mode'
      let queued = 0
      function write() {
        queued = 0
        const mode = detectMode()
        if (document.body.getAttribute(ATTR) !== mode) document.body.setAttribute(ATTR, mode)
      }
      function schedule() {
        if (queued === 0) queued = window.requestAnimationFrame(write)
      }
      write()
      // claude-style toggles its marker on body; ds-bot mounts .bt-leftcol as a
      // direct child of body. Neither needs a subtree attribute watch.
      const observer = new MutationObserver(schedule)
      observer.observe(document.body, {
        childList: true,
        attributes: true,
        attributeFilter: ['data-dsh-claude-style'],
      })
      return () => {
        observer.disconnect()
        if (queued !== 0) window.cancelAnimationFrame(queued)
        document.body.removeAttribute(ATTR)
      }
    }

    // Header band (standalone, Windows) ----------------------------------------
    //
    // Moves the session title, the header utilities and the view-tab strip
    // into the 40px Windows title band, the job claude-style's headerBand /
    // viewTabs features did in cs mode. Ported in spirit, not in code (its
    // implementation is MIT, but runs on its own scheduler and markers):
    // positioning is CSS; the runtime only tags the three pieces and measures
    // the two edges CSS cannot know -- where the native menu ends and where the
    // caption buttons begin. A piece that cannot be found keeps its host place.
    const BAND_ATTR = 'data-is-band'
    const BAND_OFF_ATTR = 'data-is-band-off'
    const BAND_OFF_KEY = 'dsh-illuminating-skin:layout:header-band'

    function captionWidth() {
      const overlay = navigator.windowControlsOverlay
      if (overlay !== undefined && overlay.visible === true && typeof overlay.getTitlebarAreaRect === 'function') {
        const rect = overlay.getTitlebarAreaRect()
        if (rect.width > 0) return Math.max(0, Math.round(window.innerWidth - rect.right))
      }
      return 138
    }

    function mountHeaderBand() {
      const root = document.documentElement
      let tagged = []
      let queued = 0

      function tag(el, value) {
        if (el === null) return
        if (el.getAttribute(BAND_ATTR) !== value) el.setAttribute(BAND_ATTR, value)
        tagged.push(el)
      }

      function clearEdges() {
        root.style.removeProperty('--is-band-left')
        root.style.removeProperty('--is-band-right')
        root.style.removeProperty('--is-band-corner')
        root.style.removeProperty('--is-band-tabs-half')
        root.style.removeProperty('--is-band-clear-right')
      }

      function sync() {
        queued = 0
        const active =
          document.body.getAttribute('data-is-mode') === 'standalone' &&
          root.hasAttribute('data-windows-titlebar') &&
          !root.hasAttribute('data-fullscreen') &&
          !root.hasAttribute(BAND_OFF_ATTR)
        const header = active ? document.querySelector('[data-slot="conversation.header"] > *') : null
        const previous = tagged
        tagged = []
        if (header !== null) {
          // Only the crumbs: the title cluster also holds headerActions (the
          // team / mode chips), which stay in the card as its first row.
          tag(header.querySelector('[class*="_crumbs"]'), 'title')
          const utilities = header.querySelector('[class*="_headerUtilities"]:not(:empty)')
          const corner = header.querySelector('[data-conversation-header-corner]:not(:empty)')
          tag(utilities, 'utilities')
          tag(corner, 'corner')
          // The corner sits left of the utilities; its offset depends on their
          // width, which is the one extra measurement this needs.
          const utilWidth = utilities === null ? 0 : Math.round(utilities.getBoundingClientRect().width) + 8
          const cornerRight = captionWidth() + 12 + utilWidth + 'px'
          if (root.style.getPropertyValue('--is-band-corner') !== cornerRight) root.style.setProperty('--is-band-corner', cornerRight)
          const cornerWidth = corner === null ? 0 : Math.round(corner.getBoundingClientRect().width) + 8
          const clearRight = captionWidth() + 12 + utilWidth + cornerWidth + 'px'
          if (root.style.getPropertyValue('--is-band-clear-right') !== clearRight) root.style.setProperty('--is-band-clear-right', clearRight)
          const tabs = header.querySelector('[class*="_tabs"]:has([data-conversation-tabs])')
          tag(tabs, 'tabs')
          // The title may run up to the visible pill, not up to a guessed
          // constant: the pill shrinks as the host folds tabs into the overflow
          // menu on narrow windows.
          const pill = tabs === null ? null : tabs.querySelector('[data-conversation-tabs]')
          const more = tabs === null ? null : tabs.querySelector('[class*="_viewsMore"]')
          let half = 0
          if (pill !== null) {
            const a = pill.getBoundingClientRect()
            const b = more === null ? a : more.getBoundingClientRect()
            half = Math.round((Math.max(a.right, b.right) - a.left) / 2) + 12
          }
          const halfPx = half + 'px'
          if (root.style.getPropertyValue('--is-band-tabs-half') !== halfPx) root.style.setProperty('--is-band-tabs-half', halfPx)
          // Title starts where the main column's header content starts (as in
          // claude-style), never closer than 16px to the native menu.
          const menu = document.querySelector('[data-windows-menu]')
          const menuRight = menu === null ? 48 : Math.round(menu.getBoundingClientRect().right)
          const center = document.querySelector('[class*="_centerCol"]')
          const contentLeft = center === null ? 0 : Math.round(center.getBoundingClientRect().left) + 20
          const left = Math.max(Math.max(48, menuRight) + 16, contentLeft) + 'px'
          const right = captionWidth() + 12 + 'px'
          if (root.style.getPropertyValue('--is-band-left') !== left) root.style.setProperty('--is-band-left', left)
          if (root.style.getPropertyValue('--is-band-right') !== right) root.style.setProperty('--is-band-right', right)
        }
        for (const el of previous) if (!tagged.includes(el)) el.removeAttribute(BAND_ATTR)
        if (tagged.length === 0) clearEdges()
      }

      function schedule() {
        if (queued === 0) queued = window.requestAnimationFrame(() => { watchCenter(); sync() })
      }

      sync()
      // Session switches rebuild the header subtree; mode and fullscreen flip
      // attributes on body / html. Nothing here measures per frame.
      const observer = new MutationObserver(schedule)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-is-mode'] })
      observer.observe(root, { attributes: true, attributeFilter: ['data-windows-titlebar', 'data-fullscreen', BAND_OFF_ATTR] })
      window.addEventListener('resize', schedule)
      // Collapsing / dragging the left sidebar moves the main column without a
      // window resize; the title follows the column's left edge.
      let watchedCenter = null
      const centerObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
      const watchCenter = () => {
        const center = document.querySelector('[class*="_centerCol"]')
        if (center === watchedCenter || centerObserver === null) return
        if (watchedCenter !== null) centerObserver.unobserve(watchedCenter)
        watchedCenter = center
        if (center !== null) centerObserver.observe(center)
      }
      watchCenter()
      const overlay = navigator.windowControlsOverlay
      const canListen = overlay !== undefined && typeof overlay.addEventListener === 'function'
      if (canListen) overlay.addEventListener('geometrychange', schedule)

      return () => {
        observer.disconnect()
        if (centerObserver !== null) centerObserver.disconnect()
        window.removeEventListener('resize', schedule)
        if (canListen) overlay.removeEventListener('geometrychange', schedule)
        if (queued !== 0) window.cancelAnimationFrame(queued)
        for (const el of tagged) el.removeAttribute(BAND_ATTR)
        tagged = []
        clearEdges()
      }
    }

    // Composer voice proxy (C7) ----------------------------------------------
    //
    // The bar's round microphone button is a stand-in for the host's built-in
    // voice input (dsh-experimental-client-ui-voice-input, conversation.input.
    // activity slot), whose own trigger is hidden by CSS. It only exists while
    // that plugin renders into the card, and a click is forwarded to the host:
    // start (or its setup dialog when the engine is not ready), stop while
    // recording. Recording, waveform, transcription and errors are the host's
    // own row, so behaviour is identical to the stock button.
    const MIC_SVG =
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<rect x="7" y="2.5" width="6" height="10" rx="3" fill="currentColor" stroke="none"/><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5"/></svg>'
    const VOICE_SLOT = '[data-slot="conversation.input.activity"]'

    function mountComposerMic() {
      let queued = 0
      const buttons = new Set()

      function forward(button) {
        const card = button.closest('[data-composer-card]')
        if (card === null) return
        const activity = card.querySelector(VOICE_SLOT + ' [data-voice-activity]')
        if (activity !== null) {
          // recording: the last round button is "stop"; other phases have
          // their own cancel / retry controls in the host row
          if (activity.getAttribute('data-voice-activity') === 'recording') {
            const all = activity.querySelectorAll('button')
            if (all.length > 0) all[all.length - 1].click()
          }
          return
        }
        const trigger = card.querySelector(VOICE_SLOT + ' [class*="_triggerAnchor"] button')
        if (trigger !== null && !trigger.disabled) trigger.click()
      }

      function make() {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'is-mic'
        b.setAttribute('data-dsh-plugin', 'illuminating-skin')
        b.innerHTML = MIC_SVG
        b.addEventListener('mousedown', (event) => event.preventDefault())
        b.addEventListener('click', () => forward(b))
        buttons.add(b)
        return b
      }

      function sync() {
        queued = 0
        const mode = document.body.getAttribute('data-is-mode')
        const on = mode === 'standalone' || mode === 'bot'
        for (const b of [...buttons]) {
          if (!on || !b.isConnected) { b.remove(); buttons.delete(b) }
        }
        if (!on) return
        for (const card of document.querySelectorAll('[data-composer-seat] [data-composer-card]')) {
          let b = card.querySelector(':scope > .is-mic')
          if (b === null) { b = make(); card.appendChild(b) }
          const recording = card.querySelector(VOICE_SLOT + ' [data-voice-activity="recording"]') !== null
          const trigger = card.querySelector(VOICE_SLOT + ' [class*="_triggerAnchor"] button')
          const label = recording ? '停止录音' : trigger !== null ? (trigger.getAttribute('aria-label') || '语音输入') : '语音输入'
          if (b.getAttribute('aria-pressed') !== String(recording)) b.setAttribute('aria-pressed', String(recording))
          if (b.title !== label) { b.title = label; b.setAttribute('aria-label', label) }
          b.disabled = !recording && trigger !== null && trigger.disabled
        }
      }

      function schedule() {
        if (queued === 0) queued = window.requestAnimationFrame(sync)
      }

      sync()
      const observer = new MutationObserver(schedule)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-is-mode', 'data-voice-activity', 'disabled'] })
      return () => {
        observer.disconnect()
        if (queued !== 0) window.cancelAnimationFrame(queued)
        for (const b of buttons) b.remove()
        buttons.clear()
      }
    }

    // Composer seat guard -------------------------------------------------------
    //
    // [data-composer-seat] is the HOST's own wrapper around the composer. A
    // third-party plugin can compute it to display:none, and a hidden seat reads
    // to the user as "the input box disappeared". The current trigger is
    // dsh-claude-style 0.19.6, which asks only the FIRST [role="tab"] in
    // [data-conversation-tabs] whether it is selected; since the host pins the
    // chat tab first, every non-chat view (reading view included) answers "no"
    // and the plugin marks the whole phase as composer-hidden.
    //
    // This guard deliberately names none of that plugin's attributes. It watches
    // the host seat, samples the display value the HOST gives it while visible,
    // and re-asserts that sampled value only when something else computes it to
    // none. A host that swaps flex for grid keeps working (the sample follows the
    // host), and a future claude-style that renames its attribute simply stops
    // tripping the guard. The console warning is intentional: a silent rescue
    // would hide the incompatibility instead of reporting it.
    function mountComposerGuard() {
      const SEAT = '[data-composer-seat]'
      const SAMPLE = 'data-is-seat-display'
      const FORCED = 'data-is-seat-forced'
      let queued = false

      // The guard must only rescue the seat on the chat tab. Every other view
      // (reading, trajectory, stats, context) is meant to render without a
      // composer, and the host pins the chat tab first in [data-conversation-tabs],
      // so "the first tab is the selected one" is the host's own definition of
      // "the user is looking at the conversation".
      function onChatTab() {
        const list = document.querySelector('[data-conversation-tabs]')
        if (list === null) return true
        const tabs = list.querySelectorAll('[role="tab"]')
        if (tabs.length === 0) return true
        const active = list.querySelector('[role="tab"][aria-selected="true"]')
        // No selected tab in the strip means the active view lives in the
        // "more" menu, so the conversation is not on screen either.
        if (active === null) return false
        return active === tabs[0]
      }

      function sample(seat) {
        if (seat.hasAttribute(SAMPLE)) return
        const display = window.getComputedStyle(seat).display
        if (display !== 'none') seat.setAttribute(SAMPLE, display)
      }

      function fallbackOf(seat) {
        return seat.getAttribute(SAMPLE) ?? 'flex'
      }

      function release(seat) {
        if (!seat.hasAttribute(FORCED)) return
        seat.style.removeProperty('display')
        seat.removeAttribute(FORCED)
      }

      function check() {
        queued = false
        const seat = document.querySelector(SEAT)
        if (seat === null) return

        // Off the chat tab the composer is deliberately absent; hand the seat
        // back to whatever hides it instead of forcing it on screen.
        if (!onChatTab()) {
          release(seat)
          return
        }

        // Keep our own override in place once it is in effect. Removing it just to
        // re-measure hands the element back to the hiding rule for one frame, and
        // the next pass re-applies it: that release/force loop is exactly the
        // flicker this guard is supposed to prevent.
        if (seat.hasAttribute(FORCED)) {
          const kept =
            seat.style.getPropertyValue('display') === fallbackOf(seat) &&
            seat.style.getPropertyPriority('display') === 'important'
          if (kept) return
        }

        sample(seat)
        if (window.getComputedStyle(seat).display !== 'none') {
          // Rendered without our help: drop the override and adopt whatever the
          // host computed as the natural display value for this seat.
          if (!seat.hasAttribute(SAMPLE)) seat.setAttribute(SAMPLE, 'flex')
          seat.removeAttribute(FORCED)
          return
        }

        const fallback = fallbackOf(seat)
        if (!seat.hasAttribute(FORCED)) {
          seat.setAttribute(FORCED, '')
          console.warn(
            '[dsh-illuminating-skin] the composer seat is computed to display:none by another plugin; ' +
              'keep-alive display:' + fallback + '. Compatibility guard, not a skin effect.',
          )
        }
        seat.style.setProperty('display', fallback, 'important')
      }

      function schedule() {
        if (queued) return
        queued = true
        window.setTimeout(check, 100)
      }

      const observer = new MutationObserver(schedule)
      /* Only the attributes that can hide the seat or move the active view:
         class / style (any hiding rule or inline write), aria-selected (tab
         switch) and the claude-style composer markers. A bare attributes:true
         fired on every streaming token's attribute churn. */
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'class',
          'style',
          'hidden',
          'aria-selected',
          'data-dsh-claude-composer-hidden',
          'data-dsh-claude-composer-active',
        ],
      })
      schedule()

      return () => {
        observer.disconnect()
        const seat = document.querySelector(SEAT)
        if (seat !== null) {
          release(seat)
          seat.removeAttribute(SAMPLE)
        }
      }
    }

    // Route surfaces are painted by CSS on the column underlay; the only
    // runtime left is the glow switcher, which needs a host node that CSS
    // cannot create on its own.
    return {
      /* The glow switcher writes the host theme preference through
         ctx.theme; cordis refuses any service access that the plugin has
         not declared, so theme has to be listed here (not only in the
         package manifest, which this loader path does not read). */
      inject: ['theme'],
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

        ctx.effect(() => mountModeDetector(), 'illuminating-skin: mode detector')
        ctx.effect(() => mountHeaderBand(), 'illuminating-skin: header band')

        ctx.effect(() => mountGlowSwitcher(ctx), 'illuminating-skin: glow switcher')
        ctx.effect(() => mountComposerMic(), 'illuminating-skin: composer dictation')

        // See mountComposerGuard: keeps the host input box on screen even when a
        // third-party plugin decides this view is "inspect only" (the reading
        // view case), without touching that plugin's files.
        ctx.effect(() => mountComposerGuard(), 'illuminating-skin: composer guard')

      },
    }
  },
})