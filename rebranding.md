# Rebranding Project – Jira Ticket Breakdown

Below are actionable Jira tickets for the Vite/Vue application rebranding project, grouped by epic. Each ticket includes a title, description, acceptance criteria, and priority.

---

## Epic 1: Apply "Parchment Foundry" Branding

### Ticket: Implement Parchment Foundry Color Palette in Tailwind

**Description:**  
Update the Tailwind CSS configuration to use the official "Parchment Foundry" color palette. The palette includes: parchment beige, dark charcoal, deep crimson red, muted teal, burnt orange, warm brown, and soft cream. Ensure these colors are available as semantic variables (e.g., primary, accent) and replace any legacy color references.  
**Implementation Details:**

- **Exact HEX values & semantic mapping (Daggerheart-aligned):**

  | Token                   | HEX     | Notes                                         |
  | ----------------------- | ------- | --------------------------------------------- |
  | bg (Primary Background) | #2C2B28 | Warm charcoal — matches much of the book’s UI |
  | surface                 | #3F3B36 | Slightly lighter surface panels               |
  | text                    | #F8F2E9 | Warm off-white for text                       |
  | accentFear              | #7B1E1E | Deep crimson — Fear                           |
  | accentHope              | #3A6F6B | Muted teal — Hope                             |
  | highlight               | #B25E34 | Burnt orange for callouts                     |
  | border                  | #5E4634 | Warm brown for frames                         |

- **Tailwind config snippet:**
  ```js
  // tailwind.config.js
  module.exports = {
    theme: {
      extend: {
        colors: {
          pf: {
            bg: '#2C2B28',
            surface: '#3F3B36',
            text: '#F8F2E9',
            accentFear: '#7B1E1E',
            accentHope: '#3A6F6B',
            highlight: '#B25E34',
            border: '#5E4634'
          }
        }
      }
    },
    darkMode: 'class'
  };
  ```
- **CSS variables example:**
  ```css
  :root {
    --color-bg: #2c2b28;
    --color-surface: #3f3b36;
    --color-text: #f8f2e9;
    --color-accent-fear: #7b1e1e;
    --color-accent-hope: #3a6f6b;
    --color-highlight: #b25e34;
    --color-border: #5e4634;
  }
  .dark {
    --color-bg: #1b1a18; /* deeper charcoal for dark mode */
    --color-surface: #2c2b28;
    --color-text: #f8f2e9;
    --color-accent-fear: #a23a3b;
    --color-accent-hope: #4a807b;
    --color-highlight: #c67040;
    --color-border: #4a3a2c;
  }
  ```
- **Mapping Guidance:**
  - Backgrounds: use `bg` for app shells, `surface` for cards/panels
  - Text: use `text`
  - Borders/Dividers: use `border`
  - Interactive states:
    - Primary actions: `accentHope` (hover: 6–8% lighten; focus ring: `accentHope`)
    - Destructive actions: `accentFear`
    - Emphasis/Badges: `highlight`

**Acceptance Criteria:**

- Tailwind config includes all Parchment Foundry brand colors with clear variable names and HEX codes
- CSS variables are defined for palette and used where appropriate
- Old color references in the codebase are updated to use the new palette
- Visual QA confirms palette is applied consistently throughout the app  
  **Priority:** High

### Ticket: Apply Parchment Foundry Typography Globally

**Description:**  
Set the global font family, weights, and sizes to match the Parchment Foundry brand guidelines. Ensure typography is consistent across all pages and components, reflecting the brand’s tone and legibility standards.
**Implementation Details:**

- **Font Families:**
  - Headings: `"Merriweather", serif`
  - Body/UI: `"Inter", "Helvetica Neue", Arial, sans-serif`
  - Both fonts are open-source and available via Google Fonts or CDN.
- **@import / @font-face examples:**
  - Google Fonts (CSS):
    ```css
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Merriweather:wght@700&display=swap');
    ```
  - Or self-host with @font-face if needed.
- **Tailwind theme.fontFamily settings:**
  ```js
  // tailwind.config.js
  module.exports = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
          serif: ['Merriweather', 'serif']
        }
      }
    }
  };
  ```
- **Baseline Type Scale:**
  - h1: 2.25rem (36px) / 700 / tracking-tight / leading-tight
  - h2: 1.5rem (24px) / 700 / tracking-tight / leading-tight
  - h3: 1.25rem (20px) / 500 / tracking-normal / leading-snug
  - Body: 1rem (16px) / 400 / tracking-normal / leading-relaxed
  - Small: 0.875rem (14px) / 400 / tracking-wide / leading-normal
- **Tracking/Leading Guidance:**
  - Headings: `tracking-tight`, `leading-tight`
  - Body: `tracking-normal`, `leading-relaxed`
  - Use Tailwind's `tracking-` and `leading-` utilities for consistency.

**Acceptance Criteria:**

- Global font family matches Parchment Foundry’s specified fonts (Inter and Merriweather with appropriate fallbacks)
- Font weights and sizes are set for headings, body, and UI elements per the above scale
- All screens and components display the updated typography  
  **Priority:** High

### Ticket: Update Logo and Icon Assets to Parchment Foundry Versions

**Description:**  
Replace all existing logo and icon assets with the new "Parchment Foundry" versions. Ensure assets use the new brand colors (parchment beige, dark charcoal, etc.) and are provided in SVG and PNG formats for scalability.
**Implementation Details:**

- **Required Files:**
  - Logo SVG: `logo-parchment-foundry.svg`
  - Logo PNG: `logo-parchment-foundry-512.png`, `logo-parchment-foundry-192.png`
  - Icon SVG: `icon-parchment-foundry.svg`
  - Icon PNG: `icon-parchment-foundry-64.png`, `icon-parchment-foundry-32.png`, `icon-parchment-foundry-16.png`
- **Safe Areas:**
  - Ensure at least 10% padding around all sides for logo and icon assets.
  - No critical elements should touch asset edges.
- **Monochrome Rules:**
  - Provide a monochrome (single-color) version in dark charcoal (`#231F20`) and parchment beige (`#F7F3E8`).
  - Monochrome version required for print and low-color environments.
- **Color-on-Background Rules:**
  - Use parchment beige logo on dark backgrounds, and dark charcoal logo on light backgrounds.
  - Avoid using accent (deep crimson) as the main logo color except for special callouts.

**Acceptance Criteria:**

- All logo and icon files replaced with Parchment Foundry assets in SVG and PNG, at specified sizes
- Assets use the correct brand colors and are optimized for web
- Monochrome and color-on-background guidelines are followed
- No outdated logos or icons remain in the codebase  
  **Priority:** High

### Ticket: Update Favicons and App Icons to Parchment Foundry Branding

**Description:**  
Update all favicon and app icon files to reflect the new Parchment Foundry branding, including use of the new logo and color palette (e.g., parchment beige background, dark charcoal icon).
**Implementation Details:**

- **Required Sizes & Paths:**
  - `/public/favicon.ico` (32x32, 16x16)
  - `/public/favicon-32x32.png`, `/public/favicon-16x16.png`
  - `/public/apple-touch-icon.png` (180x180)
  - `/public/android-chrome-192x192.png`, `/public/android-chrome-512x512.png`
  - `/public/site.webmanifest`
- **HTML/Link/Meta tags to add:**
  ```html
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#F7F3E8" />
  ```

**Acceptance Criteria:**

- New favicon and app icon files are present and correctly sized for all platforms
- Correct HTML/link/meta tags are present and reference new icons
- Icons display as expected in browsers and devices
- No legacy icons remain  
  **Priority:** Medium

### Ticket: Add New Meta Images for Social Sharing with Parchment Foundry Visuals

**Description:**  
Create and add new meta images (Open Graph, Twitter cards, etc.) that showcase the Parchment Foundry branding. Images should feature the new logo, typography, and color palette for optimal social sharing impact.
**Implementation Details:**

- **Asset Specs & File Names:**
  - Open Graph: `/public/og-parchment-foundry.png` (1200x630px, PNG, <300kb)
  - Twitter Card: `/public/twitter-parchment-foundry.png` (1200x600px, PNG, <300kb)
- **Example Meta Tags:**
  ```html
  <meta property="og:image" content="/og-parchment-foundry.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="/twitter-parchment-foundry.png" />
  ```

**Acceptance Criteria:**

- Meta images use Parchment Foundry visuals and colors (e.g., deep crimson, parchment beige)
- Metadata is updated to reference new images with correct file names and meta tags
- Social sharing previews display the correct branding  
  **Priority:** Medium

### Ticket: Insert Legal Attribution & Disclaimer

**Description:**  
Add the following legal attribution and disclaimer copy to all required locations:

> Daggerheart™ is a trademark of Darrington Press LLC. Parchment Foundry is an unaffiliated, fan-made tool. All references to Daggerheart are for compatibility only.

**Implementation Details:**

- Add the above copy to:
  - The app footer (visible on all pages)
  - The README file
  - All marketing/landing pages (e.g., About, Store, Legal)

**Acceptance Criteria:**

- Legal attribution and disclaimer text is present and visible in the app footer, README, and all marketing pages
- Copy matches exactly as provided  
  **Priority:** High

## Epic 2: New Brand Direction Implementation

### Ticket: Document New Brand Identity Guidelines

**Description:**  
Create a comprehensive document outlining the new brand identity, including visual direction, tone, and values.
**Acceptance Criteria:**

- Brand identity doc includes vision, values, and target audience
- Visual direction with sample imagery and colors
- Shared with design and dev teams  
  **Priority:** High

### Ticket: Define New Color Palette

**Description:**  
Not applicable—direct specifications provided in Epic 1: "Implement Parchment Foundry Color Palette in Tailwind".  
**Acceptance Criteria:**

- See Epic 1 for full palette, semantic mapping, HEX values, and usage guidance  
  **Priority:** Not Applicable

### Ticket: Select and Document New Typography

**Description:**  
Not applicable—direct specifications provided in Epic 1: "Apply Parchment Foundry Typography Globally".
**Acceptance Criteria:**

- See Epic 1 for font families, weights, type scale, and implementation details  
  **Priority:** Not Applicable

### Ticket: Design New Logo and Icon Set

**Description:**  
Deliver new logo and icon assets per branding guidelines.  
**Delivery Checklist:**

- `/public/brand/logo-parchment-foundry.svg`
- `/public/brand/logo-parchment-foundry-512.png`
- `/public/brand/logo-parchment-foundry-192.png`
- `/public/brand/icon-parchment-foundry.svg`
- `/public/brand/icon-parchment-foundry-64.png`
- `/public/brand/icon-parchment-foundry-32.png`
- `/public/brand/icon-parchment-foundry-16.png`
- Monochrome and color-on-background versions included  
  **Acceptance Criteria:**
- All listed files delivered and in `/public/brand/`
- Assets match brand color, safe area, and monochrome rules  
  **Priority:** High

---

## Epic 3: UI Styling Updates

### Ticket: Update Global Color Palette in Tailwind

**Description:**  
Update Tailwind CSS configuration to use the new brand colors throughout the application.
**Acceptance Criteria:**

- Tailwind config updated with new colors
- Old color references replaced in global styles
- No visual regressions in main flows  
  **Priority:** High

### Ticket: Apply New Typography Globally

**Description:**  
Update global CSS or Tailwind config to apply new font families and styles across the app.
**Acceptance Criteria:**

- Global font family set to new brand font
- Font sizes and weights updated for headings/body
- All pages/components reflect new typography  
  **Priority:** High

### Ticket: Restyle Core UI Components

**Description:**  
Update all existing UI components to use the new color palette, typography, and spacing rules.
**Acceptance Criteria:**

- All components audited for styling
- Components updated to match new brand guidelines
- Visual QA completed for consistency  
  **Priority:** High

### Ticket: Migrate Legacy Classes to Semantic Tokens

**Description:**  
Refactor existing class names and hardcoded color/font references to use new semantic tokens (as defined in Tailwind config and CSS variables). Automate with codemods/regex where possible.
**Implementation Details:**

- Codemod plan:
  - Identify usages of old color classes (e.g., `bg-gray-900`, `text-black`)
  - Replace with semantic equivalents (e.g., `bg-parchment-bg`, `text-parchment-text`)
- Regex examples:
  - Find: `bg-gray-\d+` → Replace: `bg-parchment-bg`
  - Find: `text-(black|gray-\d+)` → Replace: `text-parchment-text`
- Manual QA for edge cases.
  **Acceptance Criteria:**
- Legacy classes replaced with semantic tokens
- Automated codemod/regex scripts included in repo (if feasible)
- No old classnames remain in main code paths  
  **Priority:** High

### Ticket: Theme Dark Mode Parity

**Description:**  
Ensure all color tokens have dark mode equivalents and that dark mode is visually consistent with brand.
**Implementation Details:**

- Define dark mode palette:
  - `primary-bg` (Dark Charcoal): `#231F20`
  - `primary-text` (Parchment Beige): `#F7F3E8`
  - `surface`: `#3A5854`
  - `accent`: `#E97A3A`
  - `secondary`: `#A12D2F`
- Add Tailwind dark mode config and CSS variables for dark mode.
- Map every semantic token to its dark mode counterpart.
  **Acceptance Criteria:**
- All semantic tokens have dark mode values
- Visual QA confirms parity between light and dark modes  
  **Priority:** High

### Ticket: Test Responsiveness and Accessibility under New Styles

**Description:**  
Verify all components and pages work responsively and meet accessibility standards after style updates.
**Acceptance Criteria:**

- Responsive layouts verified on major breakpoints
- Accessibility audits (color contrast, keyboard navigation) pass
- Issues documented and resolved  
  **Priority:** Medium

---

## Epic 4: Asset Replacement

### Ticket: Replace Image Assets with Updated Versions

**Description:**  
Replace all images (illustrations, backgrounds, logos) in the codebase with new branded assets.
**Acceptance Criteria:**

- All images replaced with new versions
- Images optimized for web (size, format)
- No broken image links  
  **Priority:** High

### Ticket: Replace In-App Illustrations with Brand-Compliant Backgrounds

**Description:**  
Replace all in-app illustration and decorative background images with assets that meet Parchment Foundry brand guidelines.
**Implementation Details:**

- Use files:
  - `/public/brand/bg-scroll-illustration.png`
  - `/public/brand/bg-parchment-texture.jpg`
- Guidance:
  - Use `bg-scroll-illustration.png` for hero/landing sections
  - Use `bg-parchment-texture.jpg` for general backgrounds
  - Ensure overlays do not obscure text legibility
  - Remove or archive all legacy illustrations
    **Acceptance Criteria:**
- All in-app backgrounds use new brand-compliant files
- No legacy illustrations remain  
  **Priority:** High

### Ticket: Update Favicons and App Icons

**Description:**  
Update favicons and app icons for all platforms to reflect the new brand.
**Acceptance Criteria:**

- New favicon and app icon files added to project
- Icons display correctly in browsers and on devices
- Old icons removed  
  **Priority:** Medium

### Ticket: Replace Meta Images for Social Sharing and SEO

**Description:**  
Update meta images (Open Graph, Twitter cards, etc.) with new branding for improved social sharing and SEO.
**Acceptance Criteria:**

- New meta images added to project
- Metadata updated in HTML and config files
- Images verified via social sharing previews  
  **Priority:** Medium

---

## Epic 5: Codebase Changes

### Ticket: Update Global CSS and Tailwind Config

**Description:**  
Update global CSS files and Tailwind configuration to implement new styles and variables.
**Acceptance Criteria:**

- All global style files updated
- Tailwind config reflects new palette and typography
- Build passes with no style errors  
  **Priority:** High

### Ticket: Refactor Component-Specific Styles

**Description:**  
Update individual component styles to align with the new branding guidelines.
**Acceptance Criteria:**

- All components use updated color and font variables
- Inline/legacy styles refactored as needed
- Code reviewed for consistency  
  **Priority:** High

### Ticket: Adjust Theme Configuration and CSS Variables

**Description:**  
Update theme configuration and any CSS variables to match new brand direction.
**Acceptance Criteria:**

- Theme settings updated in config files
- CSS variables match new palette and typography
- No legacy variables remain  
  **Priority:** Medium

### Ticket: Add Brand Constants Module

**Description:**  
Add a TypeScript module that exports the palette and typography tokens for use throughout the codebase.  
**Implementation Details:**

- Example file: `src/brand/brand-tokens.ts`
- Example content:
  ```ts
  // src/brand/brand-tokens.ts
  export const palette = {
    bg: '#2C2B28',
    surface: '#3F3B36',
    text: '#F8F2E9',
    accentFear: '#7B1E1E',
    accentHope: '#3A6F6B',
    highlight: '#B25E34',
    border: '#5E4634'
  };
  export const typography = {
    fontSans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSerif: "'Merriweather', serif",
    scale: {
      h1: {
        size: '2.25rem',
        weight: 700,
        tracking: '-0.01em',
        leading: '2.5rem'
      },
      h2: { size: '1.5rem', weight: 700, tracking: '-0.01em', leading: '2rem' },
      body: { size: '1rem', weight: 400, tracking: '0', leading: '1.75rem' }
    }
  };
  ```
  **Acceptance Criteria:**
- Brand constants module exists and exports palette and typography tokens
- Used in at least one component as demonstration  
  **Priority:** High

---

## Epic 6: Documentation & Marketing Updates

### Ticket: Update README to Reflect Branding Changes

**Description:**  
Update the project README with new branding, including logo, color palette, and any relevant copy changes.
**Implementation Details:**

- Add new logo at the top
- Update color palette and typography sections
- Insert legal attribution & disclaimer as required
  **Acceptance Criteria:**

- README displays new logo and colors
- Outdated branding references removed
- Instructions updated as needed
- Legal attribution & disclaimer present  
  **Priority:** Medium

### Ticket: Refresh Landing Pages and Marketing Sites

**Description:**  
Update all landing pages and marketing websites with new visuals, copy, and branding.
**Implementation Details:**

- Use new logo, color palette, and typography
- Add following copy blocks:
  - **Tagline:**
    > "Fan-made Daggerheart character tools, beautifully reimagined."
  - **About Section:**
    > "Parchment Foundry is an independent, fan-created digital toolkit for Daggerheart™. We aim to provide a delightful, immersive character-building experience for tabletop RPG enthusiasts."
  - **Store/Legal Page:**
    > "Parchment Foundry is not affiliated with Darrington Press LLC or Critical Role. Daggerheart™ is a trademark of Darrington Press LLC. All references to Daggerheart are for compatibility only."
- Add legal attribution & disclaimer to footer and relevant pages.
  **Acceptance Criteria:**

- All public pages reflect new brand identity
- Images, colors, and typography updated
- Tagline, About, and Store/Legal copy blocks present
- Legal attribution & disclaimer present  
  **Priority:** High

### Ticket: Update Promotional Materials

**Description:**  
Update banners, social media graphics, presentations, and other promotional assets with new branding.
**Acceptance Criteria:**

- All promotional materials replaced or updated
- Assets optimized for web and print
- Shared with marketing team  
  **Priority:** Medium

### Ticket: Add Trademark Notice Section

**Description:**  
Explicitly include the legal trademark notice on all relevant documentation and marketing pages.  
**Copy:**

> Daggerheart™ is a trademark of Darrington Press LLC. Parchment Foundry is an unaffiliated, fan-made tool. All references to Daggerheart are for compatibility only.
> **Acceptance Criteria:**

- Trademark notice is present in project README, app footer, About, and Store/Legal pages  
  **Priority:** High
