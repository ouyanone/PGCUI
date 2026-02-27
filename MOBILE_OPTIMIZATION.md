# Mobile Optimization Changes — feature/mobile-optimization

## Date: 2026-02-26
## Branch: feature/mobile-optimization

---

## Summary

This document records all changes made to optimize the PGC Angular UI for mobile phones.

---

## Files Modified

### 1. `src/app/app.module.ts`
- Added `LayoutModule` import from `@angular/cdk/layout`
- Required for `BreakpointObserver` to work across the app

---

### 2. `src/app/component/menubar/menubar.component.ts`
- Injected `BreakpointObserver` from `@angular/cdk/layout`
- Added `isMobile: boolean` property
- Subscribes to `Breakpoints.Handset` and `Breakpoints.TabletPortrait` to detect small screens

---

### 3. `src/app/component/menubar/menubar.component.html`
- Drawer mode: changed from hardcoded `mode="side"` to `[mode]="isMobile ? 'over' : 'side'"`
  - Desktop: drawer stays open on the side (pushes content)
  - Mobile: drawer overlays content and can be dismissed
- Drawer open state: `[opened]="!isMobile"` — closed by default on mobile
- Nav items: added `(click)="isMobile && drawer.close()"` so drawer auto-closes after navigation on mobile
- Added "Sign in" link inside the drawer for mobile (hidden from toolbar on mobile)
- Toolbar: wrapped desktop-only "Home" button with `*ngIf="!isMobile"`
- Reduced logo height from 60px to 50px for better mobile fit
- Added `.toolbar-title` class for text truncation on small screens
- Replaced `min-height: 1000px; margin-left: 1%` inline style on content div with `class="main-content"`
- Footer: replaced `margin-left: 48%` hardcoded style with `class="footer-text"` (centered via CSS)

---

### 4. `src/app/component/menubar/menubar.component.css`
- Added `.toolbar-title` — truncates long club name text on small screens
- Added `.main-content` — replaces inline style with `min-height: calc(100vh - 128px)` and `padding: 8px`
- Added `.footer-text` — centers footer text using `width: 100%; text-align: center`
- Added `@media (max-width: 767px)` to reduce toolbar title font size

---

### 5. `src/styles.css` (global)
- Added `* { box-sizing: border-box }` globally
- Added `img { max-width: 100%; height: auto }` to prevent image overflow
- Added `min-height: 44px` on buttons/links for touch-friendly tap targets
- Added `@media (max-width: 767px)` breakpoint with:
  - `h1` scaled to `1.4rem`, `h2` to `1.2rem`
  - `.mat-mdc-form-field` forced to `width: 100%`
  - `.mat-50` (half-width fields) forced to `width: 100%` on mobile

---

### 6. `src/app/component/home/home.component.css`
- Removed hardcoded `height: 1200px` → replaced with `min-height: 100vh`
- Removed `float: left` from `.card-class`
- Added `@media (max-width: 767px)` to give cards full width and tighter padding

---

### 7. `src/app/component/home/home.component.html`
- Replaced hardcoded `font-size: 36px` and `font-size: 26px` on headings with `clamp()` — fluid sizing that scales between mobile and desktop
- Updated card grid `minmax(200px, 1fr)` → `minmax(280px, 1fr)` so cards don't get too narrow

---

### 8. `src/app/component/player/player.component.html`
- Replaced `style="margin-left: 60%"` on action buttons bar with `class="player-actions"`
- AG-Grid: changed `height: 1400px; width: 90%` → `height: 70vh; width: 100%`

---

### 9. `src/app/component/player/player.component.css`
- Added `.player-actions` — flex row with `flex-wrap` and `gap`, right-aligned
- Added `@media (max-width: 767px)` to stretch action buttons full width and reduce header font size

---

### 10. `src/app/component/gameplan/gameplan.component.css`
- `.example-card`: removed hardcoded `width: 1400px` and `float: left` → uses `calc(100% - 2%)` with `max-width: 1400px`
- `.container`: removed hardcoded `width: 60%` → uses `width: 90%; max-width: 600px`
- `.dual-list`: added `flex-wrap: wrap` and `min-width: 200px` on listboxes
- Added `@media (max-width: 767px)`:
  - Dual-list stacks to `flex-direction: column`
  - Example card and container go full width

---

### 11. `src/app/component/gameinput/gameinput.component.css`
- Same changes as `gameplan.component.css` above
- `.example-card`: removed hardcoded `width: 1800px` and `float: left` → `calc(100% - 2%)` with `max-width: 1800px`
- `.container`, `.dual-list`, and mobile media queries updated identically

---

### 12. `src/app/component/edit-player/edit-player.component.css`
- `.example-card`: removed `width: 400px` and `float: left` → `calc(100% - 2%)` with `max-width: 400px`
- Added `@media (max-width: 767px)` to remove max-width constraint on very small screens

---

## Breakpoints Used

| Breakpoint | Usage |
|---|---|
| `767px` (max-width) | Mobile phones — all `@media` queries target this |
| Angular CDK `Breakpoints.Handset` + `Breakpoints.TabletPortrait` | Used by `BreakpointObserver` in menubar TS for drawer mode switching |

---

## What Was NOT Changed (Phase 2)

The following are identified for future optimization:
- Lazy loading of routes (currently all eagerly loaded)
- Statistics component AG-Grid (same pattern as player)
- Photos component responsive image layout
- Touch event handling for form fields
- Font loading optimization (Google Fonts preconnect)
