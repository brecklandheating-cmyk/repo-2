import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { FileText, Building2, User, ClipboardCheck, Flame, ArrowLeft } from 'lucide-react';
import SignatureInput from '../SignatureInput';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CD11Form = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    certificate_type: 'CD11',
    landlord_customer_name: '',
    landlord_customer_address: '',
    landlord_customer_phone: '',
    landlord_customer_email: '',
    inspection_address: '',
    
    // Appliance details
    appliance_make_model: '',
    burner_type: '',
    flue_type: '',
    
    // Service checks
    burner_cleaned: false,
    nozzle_replaced: false,
    filter_checked: false,
    controls_tested: false,
    safety_devices_tested: false,
    flue_inspected: false,
    
    // Combustion test results
    co_ppm: '',
    co2_percent: '',
    smoke_number: '',
    flue_gas_temp: '',
    oil_flow_rate: '',
    pump_pressure: '',
    nozzle_size: '',
    nozzle_angle: '',
    net_efficiency: '',
    gross_efficiency: '',
    excess_air_percent: '',
    
    // Additional info
    oil_service_work: '',
    parts_replaced: '',
    notes: '',
    
    // Dates and engineer
    inspection_date: new Date().toISOString().split('T')[0],
    next_inspection_due: '',
    engineer_name: '',
    oftec_number: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/certificates`, formData);
      toast.success('CD11 Certificate created successfully!');
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
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/certificates')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                CD11 Oil Firing Servicing & Commissioning Report
              </h1>
              <p className="text-slate-600">OFTEC Service Certificate</p>
            </div>
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Company Logo" className="h-16" />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Customer & Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Customer Name *</Label>
                <Input
                  value={formData.landlord_customer_name}
                  onChange={(e) => handleChange('landlord_customer_name', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label>Customer Address *</Label>
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
                <Label>Work/Inspection Address *</Label>
                <Textarea
                  value={formData.inspection_address}
                  onChange={(e) => handleChange('inspection_address', e.target.value)}
                  required
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appliance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Appliance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Make & Model *</Label>
                <Input
                  value={formData.appliance_make_model}
                  onChange={(e) => handleChange('appliance_make_model', e.target.value)}
                  placeholder="e.g., Worcester Bosch Greenstar"
                  required
                />
              </div>
              <div>
                <Label>Burner Type *</Label>
                <Select
                  value={formData.burner_type}
                  onValueChange={(value) => handleChange('burner_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select burner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pressure Jet">Pressure Jet</SelectItem>
                    <SelectItem value="Vaporising">Vaporising</SelectItem>
                    <SelectItem value="Wallflame">Wallflame</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Flue Type *</Label>
                <Select
                  value={formData.flue_type}
                  onValueChange={(value) => handleChange('flue_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Room Sealed">Room Sealed</SelectItem>
                    <SelectItem value="Balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Service Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Service Checks Performed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="burner_cleaned"
                  checked={formData.burner_cleaned}
                  onCheckedChange={(checked) => handleChange('burner_cleaned', checked)}
                />
                <Label htmlFor="burner_cleaned" className="font-normal cursor-pointer">
                  Burner cleaned and adjusted
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nozzle_replaced"
                  checked={formData.nozzle_replaced}
                  onCheckedChange={(checked) => handleChange('nozzle_replaced', checked)}
                />
                <Label htmlFor="nozzle_replaced" className="font-normal cursor-pointer">
                  Nozzle replaced
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter_checked"
                  checked={formData.filter_checked}
                  onCheckedChange={(checked) => handleChange('filter_checked', checked)}
                />
                <Label htmlFor="filter_checked" className="font-normal cursor-pointer">
                  Filter checked/replaced
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="controls_tested"
                  checked={formData.controls_tested}
                  onCheckedChange={(checked) => handleChange('controls_tested', checked)}
                />
                <Label htmlFor="controls_tested" className="font-normal cursor-pointer">
                  Controls tested
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safety_devices_tested"
                  checked={formData.safety_devices_tested}
                  onCheckedChange={(checked) => handleChange('safety_devices_tested', checked)}
                />
                <Label htmlFor="safety_devices_tested" className="font-normal cursor-pointer">
                  Safety devices tested
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flue_inspected"
                  checked={formData.flue_inspected}
                  onCheckedChange={(checked) => handleChange('flue_inspected', checked)}
                />
                <Label htmlFor="flue_inspected" className="font-normal cursor-pointer">
                  Flue inspected and clean
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Combustion Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Combustion Test Results (BS 5410-1 Compliance)</CardTitle>
              <CardDescription>All readings must be within safe limits</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>CO (ppm) *</Label>
                <Input
                  type="number"
                  value={formData.co_ppm}
                  onChange={(e) => handleChange('co_ppm', e.target.value)}
                  placeholder="0-50"
                  required
                />
              </div>
              <div>
                <Label>CO₂ (%) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.co2_percent}
                  onChange={(e) => handleChange('co2_percent', e.target.value)}
                  placeholder="11-14"
                  required
                />
              </div>
              <div>
                <Label>Smoke Number *</Label>
                <Input
                  value={formData.smoke_number}
                  onChange={(e) => handleChange('smoke_number', e.target.value)}
                  placeholder="0-1"
                  required
                />
              </div>
              <div>
                <Label>Flue Gas Temp (°C) *</Label>
                <Input
                  type="number"
                  value={formData.flue_gas_temp}
                  onChange={(e) => handleChange('flue_gas_temp', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Oil Flow Rate</Label>
                <Input
                  value={formData.oil_flow_rate}
                  onChange={(e) => handleChange('oil_flow_rate', e.target.value)}
                  placeholder="kg/h or l/h"
                />
              </div>
              <div>
                <Label>Pump Pressure (bar)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.pump_pressure}
                  onChange={(e) => handleChange('pump_pressure', e.target.value)}
                />
              </div>
              <div>
                <Label>Nozzle Size</Label>
                <Input
                  value={formData.nozzle_size}
                  onChange={(e) => handleChange('nozzle_size', e.target.value)}
                  placeholder="e.g., 0.50 USG/h"
                />
              </div>
              <div>
                <Label>Nozzle Angle</Label>
                <Input
                  value={formData.nozzle_angle}
                  onChange={(e) => handleChange('nozzle_angle', e.target.value)}
                  placeholder="e.g., 60°"
                />
              </div>
              <div>
                <Label>Excess Air (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.excess_air_percent}
                  onChange={(e) => handleChange('excess_air_percent', e.target.value)}
                />
              </div>
              <div>
                <Label>Net Efficiency (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.net_efficiency}
                  onChange={(e) => handleChange('net_efficiency', e.target.value)}
                />
              </div>
              <div>
                <Label>Gross Efficiency (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.gross_efficiency}
                  onChange={(e) => handleChange('gross_efficiency', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Service Work Description</Label>
                <Textarea
                  value={formData.oil_service_work}
                  onChange={(e) => handleChange('oil_service_work', e.target.value)}
                  placeholder="Describe service work performed..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Parts Replaced</Label>
                <Textarea
                  value={formData.parts_replaced}
                  onChange={(e) => handleChange('parts_replaced', e.target.value)}
                  placeholder="List any parts replaced..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Remedial Work / Comments</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any defects or required actions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Engineer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Engineer Details & Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Next Service Due</Label>
                  <Input
                    type="date"
                    value={formData.next_inspection_due}
                    onChange={(e) => handleChange('next_inspection_due', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Engineer Name *</Label>
                  <Input
                    value={formData.engineer_name}
                    onChange={(e) => handleChange('engineer_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>OFTEC Registration Number *</Label>
                  <Input
                    value={formData.oftec_number}
                    onChange={(e) => handleChange('oftec_number', e.target.value)}
                    placeholder="e.g., C12345"
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

          {/* Submit Button */}
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
              {loading ? 'Creating...' : 'Create CD11 Certificate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CD11Form;
