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
import { FileText, Building2, User, Wrench, ArrowLeft } from 'lucide-react';
import SignatureInput from '../SignatureInput';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CD10Form = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    certificate_type: 'CD10',
    landlord_customer_name: '',
    landlord_customer_address: '',
    landlord_customer_phone: '',
    landlord_customer_email: '',
    inspection_address: '',
    
    // Installation details
    installation_date: new Date().toISOString().split('T')[0],
    work_type: 'New Installation',
    appliance_make_model: '',
    appliance_serial_number: '',
    output_rating: '',
    fuel_type: 'Kerosene',
    
    // Tank details
    tank_type: '',
    tank_capacity: '',
    tank_material: '',
    base_support_type: '',
    pipework_material: '',
    
    // System checks
    fire_valve_fitted: false,
    tank_pressure_tested: false,
    pressure_test_result: '',
    building_control_notified: false,
    
    // Commissioning results
    co_ppm: '',
    co2_percent: '',
    smoke_number: '',
    flue_gas_temp: '',
    net_efficiency: '',
    gross_efficiency: '',
    
    // Compliance
    complies_with_standards: false,
    notes: '',
    
    // Dates and engineer
    inspection_date: new Date().toISOString().split('T')[0],
    engineer_name: '',
    oftec_number: '',
    engineer_signature: null,
    customer_signature: null
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
      toast.success('CD10 Certificate created successfully!');
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
                CD10 Oil Firing Installation Completion Report
              </h1>
              <p className="text-slate-600">OFTEC Installation Certificate</p>
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
                <Label>Installation Address *</Label>
                <Textarea
                  value={formData.inspection_address}
                  onChange={(e) => handleChange('inspection_address', e.target.value)}
                  required
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Installation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Installation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Installation Date *</Label>
                <Input
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) => handleChange('installation_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Work Type *</Label>
                <Select
                  value={formData.work_type}
                  onValueChange={(value) => handleChange('work_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Installation">New Installation</SelectItem>
                    <SelectItem value="Replacement">Replacement</SelectItem>
                    <SelectItem value="Modification">Modification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Appliance Make & Model *</Label>
                <Input
                  value={formData.appliance_make_model}
                  onChange={(e) => handleChange('appliance_make_model', e.target.value)}
                  placeholder="e.g., Grant Vortex Eco External"
                  required
                />
              </div>
              <div>
                <Label>Serial Number *</Label>
                <Input
                  value={formData.appliance_serial_number}
                  onChange={(e) => handleChange('appliance_serial_number', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Output Rating (kW) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.output_rating}
                  onChange={(e) => handleChange('output_rating', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Fuel Type *</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => handleChange('fuel_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kerosene">Kerosene (28 sec)</SelectItem>
                    <SelectItem value="Gas Oil">Gas Oil (35 sec)</SelectItem>
                    <SelectItem value="HVO">HVO Biofuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tank & System Details */}
          <Card>
            <CardHeader>
              <CardTitle>Oil Tank & System Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tank Type *</Label>
                <Select
                  value={formData.tank_type}
                  onValueChange={(value) => handleChange('tank_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tank type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Skin">Single Skin</SelectItem>
                    <SelectItem value="Bunded">Bunded</SelectItem>
                    <SelectItem value="Integrally Bunded">Integrally Bunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tank Capacity (litres) *</Label>
                <Input
                  type="number"
                  value={formData.tank_capacity}
                  onChange={(e) => handleChange('tank_capacity', e.target.value)}
                  placeholder="e.g., 1200"
                  required
                />
              </div>
              <div>
                <Label>Tank Material *</Label>
                <Select
                  value={formData.tank_material}
                  onValueChange={(value) => handleChange('tank_material', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Steel">Steel</SelectItem>
                    <SelectItem value="Plastic">Plastic/Polyethylene</SelectItem>
                    <SelectItem value="GRP">GRP (Glass Reinforced Plastic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base/Support Type *</Label>
                <Input
                  value={formData.base_support_type}
                  onChange={(e) => handleChange('base_support_type', e.target.value)}
                  placeholder="e.g., Concrete base, Steel frame"
                  required
                />
              </div>
              <div>
                <Label>Pipework Material *</Label>
                <Select
                  value={formData.pipework_material}
                  onValueChange={(value) => handleChange('pipework_material', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copper">Copper</SelectItem>
                    <SelectItem value="Steel">Steel</SelectItem>
                    <SelectItem value="Plastic Barrier">Plastic Barrier Pipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* System Checks */}
          <Card>
            <CardHeader>
              <CardTitle>System Checks & Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fire_valve_fitted"
                  checked={formData.fire_valve_fitted}
                  onCheckedChange={(checked) => handleChange('fire_valve_fitted', checked)}
                />
                <Label htmlFor="fire_valve_fitted" className="font-normal cursor-pointer">
                  Fire valve fitted and tested
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tank_pressure_tested"
                  checked={formData.tank_pressure_tested}
                  onCheckedChange={(checked) => handleChange('tank_pressure_tested', checked)}
                />
                <Label htmlFor="tank_pressure_tested" className="font-normal cursor-pointer">
                  Tank pressure tested (new installations)
                </Label>
              </div>
              {formData.tank_pressure_tested && (
                <div className="ml-6">
                  <Label>Pressure Test Result (bar) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.pressure_test_result}
                    onChange={(e) => handleChange('pressure_test_result', e.target.value)}
                    placeholder="e.g., 9.5"
                    required
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="building_control_notified"
                  checked={formData.building_control_notified}
                  onCheckedChange={(checked) => handleChange('building_control_notified', checked)}
                />
                <Label htmlFor="building_control_notified" className="font-normal cursor-pointer">
                  Building Control notified (if required)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Commissioning Results */}
          <Card>
            <CardHeader>
              <CardTitle>Commissioning Test Results</CardTitle>
              <CardDescription>Combustion analysis as per manufacturer's instructions</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>CO (ppm) *</Label>
                <Input
                  type="number"
                  value={formData.co_ppm}
                  onChange={(e) => handleChange('co_ppm', e.target.value)}
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
                  required
                />
              </div>
              <div>
                <Label>Smoke Number *</Label>
                <Input
                  value={formData.smoke_number}
                  onChange={(e) => handleChange('smoke_number', e.target.value)}
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

          {/* Compliance & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  id="complies_with_standards"
                  checked={formData.complies_with_standards}
                  onCheckedChange={(checked) => handleChange('complies_with_standards', checked)}
                />
                <Label htmlFor="complies_with_standards" className="font-medium cursor-pointer">
                  I confirm this installation complies with OFTEC standards and Building Regulations *
                </Label>
              </div>
              <div>
                <Label>Additional Comments / Recommendations</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Engineer & Customer Signatures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Engineer & Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Commissioning Date *</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => handleChange('inspection_date', e.target.value)}
                    required
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

              <div>
                <Label>Customer Signature (Optional)</Label>
                <SignatureInput
                  value={formData.customer_signature}
                  onChange={(signature) => handleChange('customer_signature', signature)}
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
              disabled={loading || !formData.complies_with_standards}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create CD10 Certificate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CD10Form;
