# RAG-Y Theme System

A comprehensive, modern theme system with dark mode support built with React, TypeScript, and Tailwind CSS.

## 🎨 Features

- **Dark/Light/System Mode** - Automatic theme switching based on system preference
- **Persistent Theme Settings** - User preference saved to localStorage
- **CSS Custom Properties** - Dynamic theme switching without page reload
- **Comprehensive Component Library** - Pre-styled components for consistent UI
- **Smooth Animations** - Beautiful transitions and micro-interactions
- **Accessibility Focused** - WCAG compliant color contrasts and focus states
- **TypeScript Support** - Full type safety for theme properties

## 🚀 Quick Start

### Basic Usage

```tsx
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
      <div className="min-h-screen bg-background text-foreground">
        <ThemeToggle />
        {/* Your app content */}
      </div>
    </ThemeProvider>
  );
}
```

### Using Theme Hook

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme, actualTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {actualTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

## 🎭 Theme Toggle Variants

The `ThemeToggle` component comes with three variants:

### Default (Icon Grid)
```tsx
<ThemeToggle variant="default" />
```

### Button Style with Labels
```tsx
<ThemeToggle variant="button" showLabels />
```

### Minimal (Single Icon)
```tsx
<ThemeToggle variant="minimal" />
```

## 🎨 Color System

### Design Tokens

The theme system uses semantic color tokens that automatically adapt to light/dark modes:

#### Core Colors
- `background` - Main background color
- `foreground` - Primary text color
- `muted` - Muted background color
- `muted-foreground` - Muted text color
- `border` - Border color
- `input` - Input background color

#### Brand Colors
- `primary` - Primary brand color
- `secondary` - Secondary color
- `accent` - Accent color for highlights

#### Semantic Colors
- `destructive` - Error/danger color
- `success-*` - Success states (50-950)
- `warning-*` - Warning states (50-950)
- `error-*` - Error states (50-950)

### Usage in CSS

```css
.my-component {
  @apply bg-background text-foreground border-border;
}

/* Or with arbitrary values */
.custom-color {
  color: hsl(var(--primary));
  background: hsl(var(--muted));
}
```

## 🧩 Component Library

### Buttons

```tsx
// Variants
<button className="btn btn-primary btn-md">Primary</button>
<button className="btn btn-secondary btn-md">Secondary</button>
<button className="btn btn-outline btn-md">Outline</button>
<button className="btn btn-ghost btn-md">Ghost</button>
<button className="btn btn-destructive btn-md">Destructive</button>

// Sizes
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-md">Medium</button>
<button className="btn btn-primary btn-lg">Large</button>
```

### Form Elements

```tsx
// Input
<input className="input" placeholder="Enter text..." />

// Textarea
<textarea className="textarea" placeholder="Enter message..." />

// Select
<select className="select">
  <option>Choose option</option>
</select>

// Labels and Help Text
<label className="form-label">Email</label>
<p className="form-description">We'll never share your email.</p>
<p className="form-message">This field is required.</p>
```

### Cards

```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
    <p className="card-description">Card description</p>
  </div>
  <div className="card-content">
    {/* Card content */}
  </div>
  <div className="card-footer">
    {/* Card footer */}
  </div>
</div>
```

### Alerts

```tsx
<div className="alert alert-info">
  <Info className="h-5 w-5" />
  <div>
    <h4 className="font-medium">Information</h4>
    <p>This is an informational message.</p>
  </div>
</div>

<div className="alert alert-success">Success message</div>
<div className="alert alert-warning">Warning message</div>
<div className="alert alert-error">Error message</div>
```

### Badges

```tsx
<span className="badge badge-default">Default</span>
<span className="badge badge-secondary">Secondary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-destructive">Error</span>
<span className="badge badge-outline">Outline</span>
```

### Navigation

```tsx
<nav>
  <a className="nav-link">Home</a>
  <a className="nav-link nav-link-active">Dashboard</a>
  <a className="nav-link">Settings</a>
</nav>
```

## 🎪 Special Effects

### Gradient Text
```tsx
<h1 className="text-gradient">Beautiful Gradient Text</h1>
```

### Glass Morphism
```tsx
<div className="glass p-6">
  <p>Glass effect background</p>
</div>
```

## 🔧 Customization

### Adding Custom Colors

Update `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom-blue': {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### Creating Custom Components

```css
@layer components {
  .btn-custom {
    @apply btn bg-custom-blue-500 text-white hover:bg-custom-blue-600;
  }
}
```

### Extending Theme Variables

Add new CSS custom properties in `index.css`:

```css
:root {
  --custom-color: 220 14% 96%;
}

.dark {
  --custom-color: 220 14% 16%;
}
```

Then use in Tailwind config:

```js
colors: {
  'custom': 'hsl(var(--custom-color))',
}
```

## 📱 Responsive Design

All components are built with mobile-first responsive design:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

<button className="btn btn-primary w-full sm:w-auto">
  Responsive Button
</button>
```

## ♿ Accessibility

The theme system follows accessibility best practices:

- **Color Contrast** - All color combinations meet WCAG AA standards
- **Focus States** - Visible focus indicators for keyboard navigation
- **Screen Reader Support** - Semantic HTML and ARIA labels
- **Reduced Motion** - Respects user's motion preferences

```tsx
<button className="btn btn-primary">
  <span className="sr-only">Hidden text for screen readers</span>
  Accessible Button
</button>
```

## 🎬 Animations

Built-in animations for smooth user experience:

```tsx
<div className="animate-fade-in">Fade in animation</div>
<div className="animate-slide-down">Slide down animation</div>
<div className="animate-slide-up">Slide up animation</div>
```

## 🔍 Testing Themes

Visit `/showcase` to see all components in action with theme switching capabilities.

## 🐛 Troubleshooting

### Theme Not Persisting
- Check localStorage permissions
- Verify `storageKey` prop is set
- Ensure `ThemeProvider` wraps your app

### Colors Not Updating
- Verify CSS custom properties are defined
- Check Tailwind config includes custom colors
- Ensure dark mode class is applied to HTML element

### Components Not Styled
- Import the CSS file containing component classes
- Verify Tailwind is processing the CSS
- Check for conflicting CSS specificity

## 📚 API Reference

### ThemeProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Child components |
| `defaultTheme` | `'light' \| 'dark' \| 'system'` | `'system'` | Initial theme |
| `storageKey` | `string` | `'ui-theme'` | localStorage key |

### useTheme Hook

```tsx
const {
  theme,        // Current theme setting
  setTheme,     // Function to change theme
  actualTheme   // Resolved theme (light/dark)
} = useTheme();
```

### ThemeToggle Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'button' \| 'minimal'` | `'default'` | Toggle style |
| `showLabels` | `boolean` | `false` | Show text labels |

---

Built with ❤️ for modern web applications 