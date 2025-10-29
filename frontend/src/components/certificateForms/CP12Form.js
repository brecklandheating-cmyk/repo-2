import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ShieldCheck, Building2, User, Plus, Trash2, ArrowLeft } from 'lucide-react';
import SignatureInput from '../SignatureInput';
import CustomerSelector from '../CustomerSelector';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CP12Form = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    certificate_type: 'CP12',
    landlord_customer_name: '',
    landlord_customer_address: '',
    landlord_customer_phone: '',
    landlord_customer_email: '',
    inspection_address: '',
    let_by_tightness_test: true,
    equipotential_bonding: true,
    ecv_accessible: true,
    pipework_visual_inspection: true,
    co_alarm_working: true,
    smoke_alarm_working: true,
    appliances: [],
    inspection_date: new Date().toISOString().split('T')[0],
    next_inspection_due: '',
    engineer_name: '',
    gas_safe_number: '',
    responsible_person_signature: null,
    engineer_signature: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (customer) => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        landlord_customer_name: customer.name,
        landlord_customer_address: customer.address,
        landlord_customer_phone: customer.phone,
        landlord_customer_email: customer.email || '',
        inspection_address: customer.address
      }));
      toast.success('Customer details loaded!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.appliances.length === 0) {
      toast.error('Please add at least one appliance');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/certificates`, formData);
      toast.success('CP12 Certificate created successfully!');
      navigate('/certificates');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/certificates')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                CP12 Gas Safety Certificate
              </h1>
              <p className="text-slate-600">Landlord Gas Safety Record</p>
            </div>
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Company Logo" className="h-16" />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomerSelector onCustomerSelect={handleCustomerSelect} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Landlord/Customer Name *</Label>
                  <Input
                    value={formData.landlord_customer_name}
                    onChange={(e) => handleChange('landlord_customer_name', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address *</Label>
                  <Textarea
                    value={formData.landlord_customer_address}
                    onChange={(e) => handleChange('landlord_customer_address', e.target.value)}
                    required
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={formData.landlord_customer_phone}
                    onChange={(e) => handleChange('landlord_customer_phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.landlord_customer_email}
                    onChange={(e) => handleChange('landlord_customer_email', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Inspection Address *</Label>
                  <Textarea
                    value={formData.inspection_address}
                    onChange={(e) => handleChange('inspection_address', e.target.value)}
                    required
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                General Installation Checks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="let_by_tightness_test"
                  checked={formData.let_by_tightness_test}
                  onCheckedChange={(checked) => handleChange('let_by_tightness_test', checked)}
                />
                <Label htmlFor="let_by_tightness_test" className="font-normal cursor-pointer">
                  LET BY tightness test satisfactory
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="equipotential_bonding"
                  checked={formData.equipotential_bonding}
                  onCheckedChange={(checked) => handleChange('equipotential_bonding', checked)}
                />
                <Label htmlFor="equipotential_bonding" className="font-normal cursor-pointer">
                  Equipotential bonding satisfactory
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ecv_accessible"
                  checked={formData.ecv_accessible}
                  onCheckedChange={(checked) => handleChange('ecv_accessible', checked)}
                />
                <Label htmlFor="ecv_accessible" className="font-normal cursor-pointer">
                  ECV accessible and operable
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pipework_visual_inspection"
                  checked={formData.pipework_visual_inspection}
                  onCheckedChange={(checked) => handleChange('pipework_visual_inspection', checked)}
                />
                <Label htmlFor="pipework_visual_inspection" className="font-normal cursor-pointer">
                  Pipework visual inspection satisfactory
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="co_alarm_working"
                  checked={formData.co_alarm_working}
                  onCheckedChange={(checked) => handleChange('co_alarm_working', checked)}
                />
                <Label htmlFor="co_alarm_working" className="font-normal cursor-pointer">
                  CO alarm installed and working
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smoke_alarm_working"
                  checked={formData.smoke_alarm_working}
                  onCheckedChange={(checked) => handleChange('smoke_alarm_working', checked)}
                />
                <Label htmlFor="smoke_alarm_working" className="font-normal cursor-pointer">
                  Smoke alarm installed and working
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appliances</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Use the main Certificates page dialog to add appliances (coming soon to this form)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Engineer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Inspection Date *</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => handleChange('inspection_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Next Inspection Due *</Label>
                  <Input
                    type="date"
                    value={formData.next_inspection_due}
                    onChange={(e) => handleChange('next_inspection_due', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Engineer Name *</Label>
                  <Input
                    value={formData.engineer_name}
                    onChange={(e) => handleChange('engineer_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Gas Safe Number *</Label>
                  <Input
                    value={formData.gas_safe_number}
                    onChange={(e) => handleChange('gas_safe_number', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Engineer Signature *</Label>
                <SignatureInput
                  value={formData.engineer_signature}
                  onChange={(signature) => handleChange('engineer_signature', signature)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/certificates')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create CP12 Certificate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CP12Form;
