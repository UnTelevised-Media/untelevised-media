# UnTelevised Media — Design System

## Core Design Philosophy

**Sharp, urgent, authoritative.** The visual language evokes investigative journalism — no border radius on cards, bold uppercase type, red accents on clean white/dark surfaces. Zero ornamentation beyond purposeful effects.

---

## Typography

### Font Stack

| Font           | Variable                      | Use                                |
| -------------- | ----------------------------- | ---------------------------------- |
| **Geist Sans** | `--font-geist-sans`           | Local variable font, primary sans  |
| **Geist Mono** | `--font-geist-mono`           | Code blocks, technical content     |
| **Inter**      | System via `next/font/google` | Body fallback, applied to `<body>` |

### Type Scale Conventions

- Section labels: `text-sm font-black uppercase tracking-widest` (in `bg-untele` bars)
- Page headings: `text-3xl font-black uppercase tracking-widest`
- Article headings: `text-4xl font-bold` (mixed case)
- Sub-labels: `text-xs font-bold uppercase tracking-wide`
- Body: `text-sm` or `text-base`, `leading-relaxed`

---

## Color System

### Brand Token

```css
untele: #d70606; /* Primary red — use for ALL interactive/accent elements */
```

### Semantic Palette (Light / Dark)

| Role              | Light              | Dark                   |
| ----------------- | ------------------ | ---------------------- |
| Page background   | `bg-white`         | `bg-black`             |
| Section alternate | `bg-slate-50`      | `bg-slate-950`         |
| Elevated          | `bg-slate-100`     | `bg-slate-900`         |
| Card surface      | `bg-white`         | `bg-black`             |
| Border            | `border-slate-300` | `border-slate-700/800` |
| Text primary      | `text-slate-900`   | `text-slate-100`       |
| Text secondary    | `text-slate-700`   | `text-slate-300`       |
| Text muted        | `text-slate-600`   | `text-slate-400/500`   |

### Extended Palette (Available in Tailwind)

The Tailwind config registers 100+ custom colors with auto-generated 100–900 shades via `chroma-js`:

**Brand-generated shades:** `dark`, `light`, `accent1` (blue), `accent2` (green), `accent3` (teal), `accent4` (gold)

**Metals:** `copper`, `bronze`, `silver`, `golden`, `gold`, `platinum`, `onyx`, `obsidian`, `steelpolished`, `steelflat`, `steeldark`, `midnight`

**Gemstones:** `diamond`, `pearl`, `amethyst`, `emerald`, `azure`, `ruby`, `citrine`, `sapphire`, `topaz`

**Nature:** `forest`, `fire`, `sun`, `coffee`, `cedar`, `sand`, `caramel`, `ginger`, `hazel`

**Social media:** `x`, `facebook`, `instagram`, `linkedin`, `youtube`, `tiktok`, `twitch`, `github`, `threads`, `snapchat`, `discord`, `reddit`

---

## Component Patterns

### Section Header (Canonical Pattern)

Every major section uses this pattern:

```html
<div class="flex items-center space-x-4">
  <div class="bg-untele px-4 py-2">
    <h2 class="text-lg font-black uppercase tracking-widest text-white">SECTION TITLE</h2>
  </div>
  <div class="h-px flex-1 bg-slate-400 dark:bg-slate-700" />
</div>
```

### Card (News Article)

- Border: `border border-slate-300 dark:border-slate-700`
- Hover: `hover:border-untele`
- No border radius — sharp corners
- Transition: `transition-all`
- Image: `aspect-video overflow-hidden` with `group-hover:scale-105` transform

### CTA Buttons

**Primary (Filled):**

```html
class="bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white
hover:bg-red-600"
```

**Secondary (Outlined):**

```html
class="border-2 border-slate-900 dark:border-white bg-transparent px-8 py-4 text-sm font-black
uppercase tracking-widest hover:bg-slate-900 hover:text-white"
```

**Gradient (Donate/Support):**

```html
class="bg-gradient-to-r from-untele to-red-500 px-4 py-2 text-white hover:scale-105"
```

### Category Badge

```html
class="bg-untele px-2 py-1 text-xs font-black uppercase tracking-widest text-white"
```

### Support Box

```html
class="border-2 border-untele bg-gradient-to-b from-untele/20 to-slate-100 dark:to-black p-6"
```

---

## Custom Tailwind Plugins

| Plugin | Class Pattern | Effect |
| --- | --- | --- |
| Neon glow | `.neon-{color}` | box-shadow glow using 300/600 shades |
| Inner glow | `.inner-glow-{color}` or `.inner-glow-{color}-{opacity}` | Inset shadow glow |
| Text gradient | `.text-gradient-lime-violet`, `.text-gradient-red-yellow`, `.text-gradient-orange-purple` | Gradient clip-text |
| Text stroke | `.text-stroke-{width}`, `.text-stroke-{color}-{shade}` | -webkit-text-stroke |
| Frosted glass | `.frosted-glass`, `.frosted-glass-dark` | backdrop-filter blur |

---

## Custom Animations

| Name      | Class                              | Description                 |
| --------- | ---------------------------------- | --------------------------- |
| Flicker   | `animate-flicker`                  | Neon bulb flicker (3s loop) |
| Shimmer   | `animate-shimmer`                  | Loading skeleton sweep      |
| Spin slow | `animate-spin-slow`                | 6s rotation                 |
| Pulse     | `animate-pulse` (Tailwind default) | Used on LIVE indicators     |

---

## Layout System

- Max content width: `max-w-[1400px] mx-auto px-4`
- Article width: `max-w-4xl`
- Standard section padding: `py-8` to `py-16`
- Grid breakpoints: `xs:420px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `dxl:1300px`, `xxl:1750px`
- Custom spacing scale extends Tailwind with half-rem steps from 13–144

---

## Dark Mode

- Implemented via `next-themes` with `attribute='class'`
- Default: `system` preference
- Toggle: `ThemeToggle` component in Header
- CSS approach: `.dark:` variants on every element
- All sections have explicit dark alternatives
