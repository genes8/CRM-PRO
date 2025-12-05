import { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save
} from 'lucide-react';
import { Card, CardHeader, Button, Input, Select } from '~/components/ui';
import { useAuth } from '~/context/AuthContext';
import { Avatar } from '~/components/ui';
import { cn } from '~/lib/utils';

export function meta() {
  return [{ title: "Settings | CRM Pro" }];
}

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'appearance', name: 'Appearance', icon: Palette },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader 
                title="Profile Information" 
                description="Update your personal information"
              />
              
              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
                <Avatar 
                  src={user?.picture} 
                  name={user?.name || 'User'} 
                  size="xl" 
                />
                <div>
                  <h3 className="font-medium text-slate-900">{user?.name}</h3>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Profile picture synced from Google
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    defaultValue={user?.name}
                    disabled
                    helperText="Synced from Google account"
                  />
                  <Input
                    label="Email"
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    helperText="Synced from Google account"
                  />
                </div>
                <Input
                  label="Company"
                  placeholder="Your company name"
                />
                <Input
                  label="Job Title"
                  placeholder="Your job title"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    placeholder="+1 (555) 000-0000"
                  />
                  <Select
                    label="Timezone"
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Chicago', label: 'Central Time' },
                      { value: 'America/Denver', label: 'Mountain Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      { value: 'Europe/London', label: 'London' },
                      { value: 'Europe/Paris', label: 'Paris' },
                    ]}
                    defaultValue="UTC"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader 
                title="Notification Preferences" 
                description="Choose how you want to be notified"
              />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-900">Email Notifications</h4>
                    <p className="text-sm text-slate-500">Receive email updates about your activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-900">Task Reminders</h4>
                    <p className="text-sm text-slate-500">Get reminded about upcoming tasks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-900">Deal Updates</h4>
                    <p className="text-sm text-slate-500">Notifications when deals change status</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="font-medium text-slate-900">Weekly Summary</h4>
                    <p className="text-sm text-slate-500">Receive a weekly summary of your activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader 
                title="Security Settings" 
                description="Manage your account security"
              />
              
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Secure Authentication</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your account is protected with Google OAuth and HTTP-only cookies for maximum security.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-4 border-b border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-1">Connected Account</h4>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Google Account</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-4">
                  <h4 className="font-medium text-slate-900 mb-1">Session Information</h4>
                  <p className="text-sm text-slate-500 mb-3">
                    Your session is secured with HTTP-only cookies that cannot be accessed by JavaScript.
                  </p>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p><span className="font-medium">Session Duration:</span> 7 days</p>
                    <p><span className="font-medium">Cookie Type:</span> HTTP-Only, Secure</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader 
                title="Appearance" 
                description="Customize how CRM Pro looks"
              />
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Theme</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-blue-500 rounded-xl bg-white">
                      <div className="h-8 bg-white border border-slate-200 rounded mb-2"></div>
                      <p className="text-sm font-medium text-slate-900">Light</p>
                    </button>
                    <button className="p-4 border-2 border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
                      <div className="h-8 bg-slate-800 rounded mb-2"></div>
                      <p className="text-sm font-medium text-slate-900">Dark</p>
                    </button>
                    <button className="p-4 border-2 border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
                      <div className="h-8 bg-gradient-to-r from-white to-slate-800 rounded mb-2"></div>
                      <p className="text-sm font-medium text-slate-900">System</p>
                    </button>
                  </div>
                </div>

                <div className="py-4 border-t border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-3">Accent Color</h4>
                  <div className="flex gap-3">
                    {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-pink-500'].map((color, index) => (
                      <button
                        key={color}
                        className={cn(
                          'h-8 w-8 rounded-full transition-transform hover:scale-110',
                          color,
                          index === 0 && 'ring-2 ring-offset-2 ring-blue-500'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="py-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Compact Mode</h4>
                      <p className="text-sm text-slate-500">Reduce spacing for more content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
