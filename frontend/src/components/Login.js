import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch company settings for logo and company name
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        // If settings fetch fails, continue with defaults
        console.log('Could not fetch settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          {settings?.logo ? (
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
              <img src={settings.logo} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-9 h-9 text-white" />
            </div>
          )}
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            {settings?.company_name || 'Breckland Heating'}
          </h1>
          <p className="text-slate-600">Gas & Oil Domestic Servicing</p>
        </div>

        <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/90 animate-fade-in">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center" data-testid="auth-title">
              {isRegister ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegister ? 'Set up your admin account' : 'Enter your credentials to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    data-testid="register-name-input"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={isRegister}
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </Label>
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                    Role
                  </Label>
                  <select
                    id="role"
                    data-testid="register-role-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              )}

              <Button
                type="submit"
                data-testid={isRegister ? "register-submit-button" : "login-submit-button"}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  'Please wait...'
                ) : isRegister ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                data-testid="toggle-auth-mode-button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2025 Breckland Heating Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;