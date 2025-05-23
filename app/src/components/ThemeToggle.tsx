import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'button' | 'minimal';
  showLabels?: boolean;
}

export function ThemeToggle({ variant = 'default', showLabels = false }: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
        className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {actualTheme === 'light' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === 'light'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sun className="h-4 w-4" />
          {showLabels && <span>Light</span>}
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === 'system'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Monitor className="h-4 w-4" />
          {showLabels && <span>System</span>}
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Moon className="h-4 w-4" />
          {showLabels && <span>Dark</span>}
        </button>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative">
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
            theme === 'light'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
          title="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
            theme === 'system'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
          title="System mode"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
          title="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 