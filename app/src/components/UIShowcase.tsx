import { useState } from 'react';
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Bell, 
  Heart,
  Star,
  Settings,
  User,
  Mail,
  Lock,
  Search
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const UIShowcase = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedTab, setSelectedTab] = useState('buttons');

  const tabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'forms', label: 'Forms' },
    { id: 'cards', label: 'Cards' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'badges', label: 'Badges' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gradient">UI Showcase</h1>
              <p className="text-muted-foreground mt-2">Explore the themed components</p>
            </div>
            <ThemeToggle variant="button" showLabels />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-muted rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`nav-link ${selectedTab === tab.id ? 'nav-link-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {selectedTab === 'buttons' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Button Variants</h3>
                  <p className="card-description">Different button styles and sizes</p>
                </div>
                <div className="card-content space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Variants</h4>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary btn-md">Primary</button>
                      <button className="btn btn-secondary btn-md">Secondary</button>
                      <button className="btn btn-outline btn-md">Outline</button>
                      <button className="btn btn-ghost btn-md">Ghost</button>
                      <button className="btn btn-destructive btn-md">Destructive</button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sizes</h4>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-primary btn-sm">Small</button>
                      <button className="btn btn-primary btn-md">Medium</button>
                      <button className="btn btn-primary btn-lg">Large</button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">With Icons</h4>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary btn-md flex items-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>Success</span>
                      </button>
                      <button className="btn btn-secondary btn-md flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button className="btn btn-outline btn-md flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Like</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'forms' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Form Elements</h3>
                  <p className="card-description">Input fields, textareas, and form controls</p>
                </div>
                <div className="card-content space-y-4">
                  <div>
                    <label className="form-label">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="input pl-10"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    </div>
                    <p className="form-description">We'll never share your email.</p>
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input type="password" placeholder="Enter password" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Search</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input type="search" placeholder="Search..." className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Message</label>
                    <textarea 
                      placeholder="Type your message here..." 
                      className="textarea"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="form-label">Select Option</label>
                    <select className="select">
                      <option>Choose an option</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'cards' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Simple Card</h3>
                    <p className="card-description">Basic card with header and content</p>
                  </div>
                  <div className="card-content">
                    <p className="text-muted-foreground">This is a simple card with some content.</p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary btn-sm">Action</button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-content">
                    <div className="flex items-center p-6">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold">Profile</h3>
                        <p className="text-sm text-muted-foreground">Manage your account</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card glass">
                  <div className="card-header">
                    <h3 className="card-title">Glass Effect</h3>
                    <p className="card-description">Card with glass morphism effect</p>
                  </div>
                  <div className="card-content">
                    <p className="text-muted-foreground">This card has a glass effect.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Alert Variants</h3>
                  <p className="card-description">Different alert types for various use cases</p>
                </div>
                <div className="card-content space-y-4">
                  <div className="alert alert-info">
                    <div className="flex">
                      <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h4 className="font-medium">Information</h4>
                        <p className="text-sm">This is an informational alert message.</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-success">
                    <div className="flex">
                      <Check className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h4 className="font-medium">Success</h4>
                        <p className="text-sm">Your action completed successfully!</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h4 className="font-medium">Warning</h4>
                        <p className="text-sm">Please review this important information.</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-error">
                    <div className="flex">
                      <X className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h4 className="font-medium">Error</h4>
                        <p className="text-sm">Something went wrong. Please try again.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'badges' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Badge Variants</h3>
                  <p className="card-description">Labels and status indicators</p>
                </div>
                <div className="card-content space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Default Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-default">Default</span>
                      <span className="badge badge-secondary">Secondary</span>
                      <span className="badge badge-destructive">Destructive</span>
                      <span className="badge badge-outline">Outline</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-success">Success</span>
                      <span className="badge badge-warning">Warning</span>
                      <span className="badge badge-destructive">Error</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">With Icons</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-default flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        Notifications
                      </span>
                      <span className="badge badge-success flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </span>
                      <span className="badge badge-secondary flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Admin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 