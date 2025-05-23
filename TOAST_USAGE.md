# Toast Notification System

We've replaced all `alert()` calls with a modern, beautiful toast notification system. Here's how to use it:

## Setup

The `ToastProvider` is already set up in `App.tsx`, so you can use toasts anywhere in your application.

## Basic Usage

Import the `useToast` hook:

```tsx
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Operation completed successfully.');
  };

  const handleError = () => {
    toast.error('Error!', 'Something went wrong.');
  };

  const handleWarning = () => {
    toast.warning('Warning!', 'Please check your input.');
  };

  const handleInfo = () => {
    toast.info('Info', 'Here is some useful information.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

## Toast Types

- **Success**: `toast.success(title, description?, options?)`
- **Error**: `toast.error(title, description?, options?)`
- **Warning**: `toast.warning(title, description?, options?)`
- **Info**: `toast.info(title, description?, options?)`
- **Default**: `toast.default(title, description?, options?)`

## Advanced Options

```tsx
toast.success('User Created', 'The user has been successfully added.', {
  duration: 3000, // Auto-dismiss after 3 seconds (default: 5000)
  action: <button>Undo</button>, // Custom action button
  onDismiss: () => console.log('Toast dismissed'), // Callback when dismissed
});
```

## Manual Dismissal

```tsx
const { toast, dismiss, dismissAll } = useToast();

// Dismiss a specific toast
const toastId = toast.success('Success!');
dismiss(toastId);

// Dismiss all toasts
dismissAll();
```

## Features

- **Beautiful Animations**: Smooth slide-in/out animations
- **Auto-dismiss**: Configurable auto-dismiss timer
- **Manual Dismiss**: Click the X button to dismiss
- **Stacking**: Multiple toasts stack nicely
- **Dark Mode Support**: Automatically adapts to your theme
- **Accessible**: Screen reader friendly
- **Customizable**: Add custom actions and callbacks

## Migration from alert()

All instances of `alert()` have been replaced:

### Before:
```tsx
alert('User created successfully');
alert('Failed to delete user');
```

### After:
```tsx
toast.success('User created successfully', 'The user has been added to the system.');
toast.error('Failed to delete user', 'Please try again later.');
```

## Positioning

Toasts appear in the top-right corner by default. They are positioned using `fixed` positioning with `top-4 right-4` and have a high z-index (`z-50`) to appear above other content.

## Styling

The toast system uses your existing design tokens and follows the same styling patterns as your other UI components:

- Uses `bg-background`, `text-foreground`, etc. for theming
- Supports dark mode automatically
- Uses the same border radius and shadows as other components
- Icons change color based on toast type

That's it! Your app now has a modern, user-friendly notification system instead of intrusive browser alerts. 