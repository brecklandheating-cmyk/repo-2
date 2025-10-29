import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Upload, Save } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = ({ user }) => {
  const [settings, setSettings] = useState({
    company_name: 'Breckland Heating Limited',
    address: '',
    phone: '',
    email: '',
    registration_number: '',
    vat_number: '',
    bank_name: '',
    account_number: '',
    sort_code: '',
    logo: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/settings/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSettings({ ...settings, logo: response.data.logo });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Access Denied</p>
              <p className="text-slate-400 text-sm mt-2">Only admins can access settings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Settings
        </h1>
        <p className="text-slate-600">Manage your company information and branding</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk' }}>Company Logo</CardTitle>
            <CardDescription>Upload your company logo for invoices and estimates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.logo && (
              <div className="flex justify-center">
                <img
                  src={settings.logo}
                  alt="Company Logo"
                  className="max-w-xs max-h-32 object-contain border rounded-lg p-4 bg-white"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <Input
                id="logo-upload"
                data-testid="logo-upload-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo-upload').click()}
                data-testid="upload-logo-button"
                className="w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-sm text-slate-500">Max size: 5MB (JPG, PNG, GIF)</p>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk' }}>Company Information</CardTitle>
            <CardDescription>Basic company details for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  data-testid="company-name-input"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  placeholder="Breckland Heating Limited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  data-testid="company-phone-input"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="01234 567890"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  data-testid="company-address-input"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="123 Main Street, Norwich, NR1 1AA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="company-email-input"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="info@brecklandheating.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">Company Registration Number</Label>
                <Input
                  id="registration_number"
                  data-testid="registration-number-input"
                  value={settings.registration_number}
                  onChange={(e) => setSettings({ ...settings, registration_number: e.target.value })}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input
                  id="vat_number"
                  data-testid="vat-number-input"
                  value={settings.vat_number}
                  onChange={(e) => setSettings({ ...settings, vat_number: e.target.value })}
                  placeholder="GB123456789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk' }}>Banking Information</CardTitle>
            <CardDescription>Bank details for invoice payment instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  data-testid="bank-name-input"
                  value={settings.bank_name}
                  onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                  placeholder="Barclays Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  data-testid="account-number-input"
                  value={settings.account_number}
                  onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_code">Sort Code</Label>
                <Input
                  id="sort_code"
                  data-testid="sort-code-input"
                  value={settings.sort_code}
                  onChange={(e) => setSettings({ ...settings, sort_code: e.target.value })}
                  placeholder="12-34-56"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            data-testid="save-settings-button"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;