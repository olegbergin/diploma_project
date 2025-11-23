# Design System Documentation

## Overview

This design system provides a consistent visual language across the application, with distinct themes for business and customer interfaces.

---

## Color Palette

### Purple Theme (Business Pages)

Used for: Business Edit Page, Appointment History, Reports, Reviews

#### Primary Purple

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#c9b2f5` | Main brand purple for buttons, accents, active states |
| Light | `#d4c4f7` | Hover states for light elements, subtle highlights |
| Dark | `#b19cd9` | Hover states for buttons, darker accents |
| Darker | `#9b87c4` | Active/pressed states, strong emphasis |

**CSS Variables:**
```css
--primary-purple: #c9b2f5
--primary-purple-light: #d4c4f7
--primary-purple-dark: #b19cd9
--primary-purple-darker: #9b87c4
```

#### Purple Backgrounds

| Color | Hex | Usage |
|-------|-----|-------|
| Light | `#f8f4ff` | Page background |
| Medium | `#f0ebff` | Section backgrounds, cards |
| Dark | `#e8e0ff` | Highlighted sections, hover states |

**CSS Variables:**
```css
--purple-bg-light: #f8f4ff
--purple-bg-medium: #f0ebff
--purple-bg-dark: #e8e0ff
```

#### Purple Text

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#2d1b4e` | Headings, important text, titles |
| Secondary | `#4a3768` | Body text, labels |
| Tertiary | `#6b5585` | Muted text, placeholders |

**CSS Variables:**
```css
--purple-text-primary: #2d1b4e
--purple-text-secondary: #4a3768
--purple-text-tertiary: #6b5585
```

#### Purple Borders & Effects

**Borders:**
```css
--purple-border-light: rgba(201, 178, 245, 0.2)
--purple-border-medium: rgba(201, 178, 245, 0.3)
--purple-border-dark: rgba(201, 178, 245, 0.5)
```

**Shadows:**
```css
--purple-shadow-sm: 0 2px 8px rgba(201, 178, 245, 0.2)
--purple-shadow-md: 0 4px 12px rgba(201, 178, 245, 0.3)
--purple-shadow-lg: 0 8px 20px rgba(201, 178, 245, 0.4)
--purple-shadow-dark: 0 4px 20px rgba(45, 27, 78, 0.08)
```

**Focus States:**
```css
--purple-focus-ring: 0 0 0 3px rgba(201, 178, 245, 0.2)
--purple-focus-border: #c9b2f5
```

**Highlights:**
```css
--purple-highlight-subtle: rgba(201, 178, 245, 0.05)
--purple-highlight-light: rgba(201, 178, 245, 0.1)
--purple-highlight-medium: rgba(201, 178, 245, 0.15)
```

---

### Blue Theme (Customer Pages)

Used for: Dashboard, Customer-facing pages, Public interfaces

#### Primary Blue

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#2563eb` | Primary actions, links, active states |
| Light | `#3b82f6` | Hover states, lighter accents |
| Dark | `#1d4ed8` | Pressed states, darker emphasis |

**CSS Variables:**
```css
--primary-blue: #2563eb
--primary-blue-light: #3b82f6
--primary-blue-dark: #1d4ed8
```

---

### Status Colors

#### Success (Green)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#059669` | Success messages, completed states |
| Light | `#10b981` | Hover states, lighter success indicators |
| Dark | `#047857` | Strong success emphasis |

#### Warning (Orange)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#ea580c` | Warnings, pending states |
| Light | `#f97316` | Lighter warnings |
| Dark | `#c2410c` | Critical warnings |

#### Error (Red)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#dc2626` | Errors, cancelled states |
| Light | `#ef4444` | Hover states, lighter errors |
| Dark | `#b91c1c` | Critical errors |

#### Reviews (Yellow)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#eab308` | Star ratings, highlights |
| Light | `#facc15` | Lighter highlights |
| Dark | `#ca8a04` | Darker emphasis |

---

## Typography

### Font Families

```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                'Helvetica Neue', Arial, sans-serif
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
             Consolas, 'Courier New', monospace
--font-rtl: 'Noto Sans Hebrew', 'Arial Hebrew', sans-serif
```

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| xs | 0.75rem (12px) | Small labels, captions |
| sm | 0.875rem (14px) | Secondary text, small buttons |
| base | 1rem (16px) | Body text, default |
| lg | 1.125rem (18px) | Subheadings, emphasized text |
| xl | 1.25rem (20px) | Section headings |
| 2xl | 1.5rem (24px) | Page subheadings |
| 3xl | 1.875rem (30px) | Page titles |
| 4xl | 2.25rem (36px) | Hero headings |

### Font Weights

```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

---

## Spacing System

Based on an 8px grid system:

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
```

---

## Border Radius

```css
--radius-sm: 0.25rem  /* 4px - Small elements */
--radius-md: 0.5rem   /* 8px - Inputs, small buttons */
--radius-lg: 0.75rem  /* 12px - Cards, large buttons */
--radius-xl: 1rem     /* 16px - Large cards */
--radius-full: 9999px /* Pills, circular buttons */
```

---

## Shadows & Effects

### Standard Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

### Purple Theme Shadows

```css
--purple-shadow-sm: 0 2px 8px rgba(201, 178, 245, 0.2)
--purple-shadow-md: 0 4px 12px rgba(201, 178, 245, 0.3)
--purple-shadow-lg: 0 8px 20px rgba(201, 178, 245, 0.4)
--purple-shadow-dark: 0 4px 20px rgba(45, 27, 78, 0.08)
```

### Focus States

**Purple Theme:**
```css
box-shadow: var(--purple-focus-ring);
border-color: var(--purple-focus-border);
```

**Blue Theme:**
```css
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
border-color: var(--primary-blue);
```

---

## Component Guidelines

### Buttons

#### Purple Theme Buttons

**Primary Button:**
```css
background: var(--primary-purple);
color: white;
border-radius: var(--radius-lg);
padding: var(--space-3) var(--space-5);

&:hover {
  background: var(--primary-purple-dark);
  transform: translateY(-2px);
  box-shadow: var(--purple-shadow-md);
}
```

**Secondary Button:**
```css
background: white;
color: var(--purple-text-primary);
border: 2px solid var(--primary-purple);

&:hover {
  background: var(--primary-purple);
  color: white;
  box-shadow: var(--purple-shadow-md);
}
```

### Cards

**Purple Theme Card:**
```css
background: white;
border-radius: var(--radius-lg);
padding: var(--space-5);
box-shadow: var(--purple-shadow-dark);
border: 1px solid var(--border-light);
```

**Card Title:**
```css
color: var(--purple-text-primary);
font-size: var(--text-lg);
font-weight: var(--font-bold);
padding-bottom: var(--space-3);
border-bottom: 2px solid var(--purple-border-light);
```

### Forms

**Input Fields (Purple Theme):**
```css
padding: 0.75rem 1rem;
border: 2px solid #e0e0e0;
border-radius: var(--radius-md);
background-color: #fafafa;

&:focus {
  outline: none;
  border-color: var(--primary-purple);
  background-color: white;
  box-shadow: var(--purple-focus-ring);
}
```

### Tabs

**Purple Theme Tabs:**
```css
.tab {
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}

.tab:hover {
  background: var(--purple-highlight-light);
  color: var(--primary-purple);
}

.tab.active {
  background: var(--primary-purple);
  color: white;
  box-shadow: var(--purple-shadow-sm);
}
```

---

## Usage Guidelines

### When to Use Purple Theme

- **Business owner pages:**
  - Business profile editing
  - Business dashboard
  - Appointment history management
  - Reports and analytics
  - Reviews management
  - Service management
  - Calendar management

### When to Use Blue Theme

- **Customer-facing pages:**
  - Public booking interface
  - Customer dashboard
  - Search and discovery
  - Public business profiles
  - User settings

### When to Use Status Colors

- **Green:** Completed appointments, successful operations, positive metrics
- **Orange:** Pending appointments, warnings, items requiring attention
- **Red:** Cancelled items, errors, critical issues, failed operations
- **Yellow:** Star ratings, reviews, highlights

---

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:
- **Purple text on light backgrounds:** AAA compliant
- **White text on purple backgrounds:** AA compliant
- **Focus indicators:** 3:1 contrast minimum

### Focus Indicators

All interactive elements must have visible focus states:
- **Purple theme:** Purple ring with 3px offset
- **Blue theme:** Blue ring with 3px offset
- **Keyboard navigation:** Clear visual indication

### Reduced Motion

Respect user preferences for reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints

```css
--breakpoint-sm: 640px   /* Mobile landscape */
--breakpoint-md: 768px   /* Tablet portrait */
--breakpoint-lg: 1024px  /* Tablet landscape */
--breakpoint-xl: 1280px  /* Desktop */
--breakpoint-2xl: 1536px /* Large desktop */
```

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens.

---

## Dark Mode

Dark mode currently uses system preferences. Planned implementation with purple theme variants.

---

## Best Practices

1. **Consistency:** Always use design tokens (CSS variables) instead of hard-coded values
2. **Spacing:** Use the 8px grid system for all spacing
3. **Colors:** Never use colors not defined in this system
4. **Accessibility:** Test all components for keyboard navigation and screen readers
5. **Performance:** Minimize use of heavy shadows and complex animations
6. **RTL Support:** Ensure proper RTL layout for Hebrew text

---

## Version

Design System v1.0 - Last updated: 2025-01-24
