import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { FileText, Building2, User, Gauge, Droplets, Flame, Shield, ArrowLeft } from 'lucide-react';
import SignatureInput from '../SignatureInput';
import CustomerSelector from '../CustomerSelector';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BenchmarkForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    certificate_type: 'BENCHMARK',
    landlord_customer_name: '',
    landlord_customer_address: '',
    landlord_customer_phone: '',
    landlord_customer_email: '',
    inspection_address: '',
    
    // Boiler details
    boiler_make: '',
    boiler_model: '',
    boiler_serial_number: '',
    boiler_type: 'Combi',
    
    // Gas & Combustion Checks
    gas_rate: '',
    gas_inlet_pressure_max: '',
    burner_gas_pressure: '',
    burner_pressure_na: false,
    co_max_rate: '',
    co_min_rate: '',
    co2_max_rate: '',
    co2_min_rate: '',
    co_co2_ratio_max: '',
    co_co2_ratio_min: '',
    flue_integrity_checked: false,
    gas_tightness_tested: false,
    spillage_test_passed: false,
    
    // Water System Checks
    cold_water_inlet_temp: '',
    hot_water_outlets_tested: false,
    heating_controls_tested: false,
    hot_water_controls_tested: false,
    interlock_tested: false,
    
    // Condensate
    condensate_installed_correctly: false,
    condensate_termination: '',
    condensate_disposal_method: '',
    
    // Installation Compliance
    complies_with_manufacturer_instructions: false,
    clearances_met: false,
    gas_supply_purged: false,
    
    // Customer Handover
    operation_demonstrated: false,
    literature_provided: false,
    benchmark_explained: false,
    
    // Building Regulations
    building_control_notified: false,
    notification_method: '',
    compliance_certificate_issued: false,
    
    // Additional
    notes: '',
    
    // Dates and signatures
    inspection_date: new Date().toISOString().split('T')[0],
    engineer_name: '',
    gas_safe_number: '',
    engineer_signature: null,
    customer_signature: null
  });

  useEffect(() => {
    fetchSettings();
    if (isEditMode) {
      fetchCertificate();
    }
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`${API}/certificates/${id}`);
      setFormData(response.data);
      toast.success('Certificate loaded');
    } catch (error) {
      toast.error('Failed to load certificate');
      navigate('/certificates');
    }
  };

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
        inspection_address: customer.address // Default to customer address
      }));
      toast.success('Customer details loaded!');
    } else {
      // Clear customer fields when manual entry selected
      setFormData(prev => ({
        ...prev,
        landlord_customer_name: '',
        landlord_customer_address: '',
        landlord_customer_phone: '',
        landlord_customer_email: '',
        inspection_address: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await axios.put(`${API}/certificates/${id}`, formData);
        toast.success('Benchmark Certificate updated successfully!');
      } else {
        await axios.post(`${API}/certificates`, formData);
        toast.success('Benchmark Certificate created successfully!');
      }
      navigate('/certificates');
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} certificate`);
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
                Benchmark Commissioning Certificate
              </h1>
              <p className="text-slate-600">Gas Boiler Commissioning Checklist</p>
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
            <CardContent className="space-y-4">
              <CustomerSelector onCustomerSelect={handleCustomerSelect} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            </CardContent>
          </Card>

          {/* Boiler Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Boiler Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Boiler Make *</Label>
                <Input
                  value={formData.boiler_make}
                  onChange={(e) => handleChange('boiler_make', e.target.value)}
                  placeholder="e.g., Worcester Bosch"
                  required
                />
              </div>
              <div>
                <Label>Boiler Model *</Label>
                <Input
                  value={formData.boiler_model}
                  onChange={(e) => handleChange('boiler_model', e.target.value)}
                  placeholder="e.g., Greenstar 8000"
                  required
                />
              </div>
              <div>
                <Label>Serial Number *</Label>
                <Input
                  value={formData.boiler_serial_number}
                  onChange={(e) => handleChange('boiler_serial_number', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Boiler Type *</Label>
                <Select
                  value={formData.boiler_type}
                  onValueChange={(value) => handleChange('boiler_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Combi">Combi</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Regular/Heat Only">Regular/Heat Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Gas & Combustion Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Gas & Combustion Checks
              </CardTitle>
              <CardDescription>All readings must be within manufacturer's specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Gas Rate (m³/hr) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.gas_rate}
                    onChange={(e) => handleChange('gas_rate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Gas Inlet Pressure (mbar) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.gas_inlet_pressure_max}
                    onChange={(e) => handleChange('gas_inlet_pressure_max', e.target.value)}
                    placeholder="At max rate"
                    required
                  />
                </div>
                <div>
                  <Label>Burner Pressure (mbar)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.burner_gas_pressure}
                      onChange={(e) => handleChange('burner_gas_pressure', e.target.value)}
                      disabled={formData.burner_pressure_na}
                      required={!formData.burner_pressure_na}
                    />
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                      <Checkbox
                        id="burner_pressure_na"
                        checked={formData.burner_pressure_na}
                        onCheckedChange={(checked) => {
                          handleChange('burner_pressure_na', checked);
                          if (checked) handleChange('burner_gas_pressure', '');
                        }}
                      />
                      <Label htmlFor="burner_pressure_na" className="text-xs cursor-pointer">N/A</Label>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Check N/A if not applicable for this boiler</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Combustion Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>CO Max (ppm) *</Label>
                    <Input
                      type="number"
                      value={formData.co_max_rate}
                      onChange={(e) => handleChange('co_max_rate', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>CO Min (ppm) *</Label>
                    <Input
                      type="number"
                      value={formData.co_min_rate}
                      onChange={(e) => handleChange('co_min_rate', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>CO₂ Max (%) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.co2_max_rate}
                      onChange={(e) => handleChange('co2_max_rate', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>CO₂ Min (%) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.co2_min_rate}
                      onChange={(e) => handleChange('co2_min_rate', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-3">CO/CO₂ Ratio</h4>
                  <p className="text-sm text-slate-600 mb-3">Enter the ratio values (must be ≤ 0.004 for safe operation)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>CO/CO₂ Ratio at Max Rate *</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.co_co2_ratio_max}
                        onChange={(e) => handleChange('co_co2_ratio_max', e.target.value)}
                        placeholder="e.g., 0.0025"
                        required
                      />
                    </div>
                    <div>
                      <Label>CO/CO₂ Ratio at Min Rate *</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.co_co2_ratio_min}
                        onChange={(e) => handleChange('co_co2_ratio_min', e.target.value)}
                        placeholder="e.g., 0.0020"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold mb-3">Safety Tests</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flue_integrity_checked"
                    checked={formData.flue_integrity_checked}
                    onCheckedChange={(checked) => handleChange('flue_integrity_checked', checked)}
                  />
                  <Label htmlFor="flue_integrity_checked" className="font-normal cursor-pointer">
                    Flue integrity check completed and passed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gas_tightness_tested"
                    checked={formData.gas_tightness_tested}
                    onCheckedChange={(checked) => handleChange('gas_tightness_tested', checked)}
                  />
                  <Label htmlFor="gas_tightness_tested" className="font-normal cursor-pointer">
                    Gas tightness test completed and passed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="spillage_test_passed"
                    checked={formData.spillage_test_passed}
                    onCheckedChange={(checked) => handleChange('spillage_test_passed', checked)}
                  />
                  <Label htmlFor="spillage_test_passed" className="font-normal cursor-pointer">
                    Spillage test (if applicable) passed
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water System Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Water System & Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cold Water Inlet Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.cold_water_inlet_temp}
                  onChange={(e) => handleChange('cold_water_inlet_temp', e.target.value)}
                  placeholder="Typically 10-15°C"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hot_water_outlets_tested"
                    checked={formData.hot_water_outlets_tested}
                    onCheckedChange={(checked) => handleChange('hot_water_outlets_tested', checked)}
                  />
                  <Label htmlFor="hot_water_outlets_tested" className="font-normal cursor-pointer">
                    Hot water tested at all outlets and temperatures recorded
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="heating_controls_tested"
                    checked={formData.heating_controls_tested}
                    onCheckedChange={(checked) => handleChange('heating_controls_tested', checked)}
                  />
                  <Label htmlFor="heating_controls_tested" className="font-normal cursor-pointer">
                    Time and temperature controls for heating tested
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hot_water_controls_tested"
                    checked={formData.hot_water_controls_tested}
                    onCheckedChange={(checked) => handleChange('hot_water_controls_tested', checked)}
                  />
                  <Label htmlFor="hot_water_controls_tested" className="font-normal cursor-pointer">
                    Time and temperature controls for hot water tested
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="interlock_tested"
                    checked={formData.interlock_tested}
                    onCheckedChange={(checked) => handleChange('interlock_tested', checked)}
                  />
                  <Label htmlFor="interlock_tested" className="font-normal cursor-pointer">
                    Central heating and hot water interlock tested
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Condensate Disposal */}
          <Card>
            <CardHeader>
              <CardTitle>Condensate Disposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="condensate_installed_correctly"
                  checked={formData.condensate_installed_correctly}
                  onCheckedChange={(checked) => handleChange('condensate_installed_correctly', checked)}
                />
                <Label htmlFor="condensate_installed_correctly" className="font-normal cursor-pointer">
                  Condensate drain installed per manufacturer's instructions
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Point of Termination</Label>
                  <Select
                    value={formData.condensate_termination}
                    onValueChange={(value) => handleChange('condensate_termination', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select termination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal Drain">Internal Drain</SelectItem>
                      <SelectItem value="External Drain">External Drain</SelectItem>
                      <SelectItem value="Soakaway">Soakaway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Disposal Method</Label>
                  <Select
                    value={formData.condensate_disposal_method}
                    onValueChange={(value) => handleChange('condensate_disposal_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gravity">Gravity</SelectItem>
                      <SelectItem value="Pumped">Pumped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Installation Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="complies_with_manufacturer_instructions"
                  checked={formData.complies_with_manufacturer_instructions}
                  onCheckedChange={(checked) => handleChange('complies_with_manufacturer_instructions', checked)}
                />
                <Label htmlFor="complies_with_manufacturer_instructions" className="font-normal cursor-pointer">
                  Installation complies with manufacturer's instructions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clearances_met"
                  checked={formData.clearances_met}
                  onCheckedChange={(checked) => handleChange('clearances_met', checked)}
                />
                <Label htmlFor="clearances_met" className="font-normal cursor-pointer">
                  All clearances met per manufacturer's requirements
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gas_supply_purged"
                  checked={formData.gas_supply_purged}
                  onCheckedChange={(checked) => handleChange('gas_supply_purged', checked)}
                />
                <Label htmlFor="gas_supply_purged" className="font-normal cursor-pointer">
                  Gas supply purged prior to connection
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Customer Handover */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Demonstration & Handover</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="operation_demonstrated"
                  checked={formData.operation_demonstrated}
                  onCheckedChange={(checked) => handleChange('operation_demonstrated', checked)}
                />
                <Label htmlFor="operation_demonstrated" className="font-normal cursor-pointer">
                  Boiler operation and controls demonstrated to customer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="literature_provided"
                  checked={formData.literature_provided}
                  onCheckedChange={(checked) => handleChange('literature_provided', checked)}
                />
                <Label htmlFor="literature_provided" className="font-normal cursor-pointer">
                  Manufacturer's literature provided to customer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="benchmark_explained"
                  checked={formData.benchmark_explained}
                  onCheckedChange={(checked) => handleChange('benchmark_explained', checked)}
                />
                <Label htmlFor="benchmark_explained" className="font-normal cursor-pointer">
                  Benchmark checklist and service record explained
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Building Regulations */}
          <Card>
            <CardHeader>
              <CardTitle>Building Regulations Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="building_control_notified"
                  checked={formData.building_control_notified}
                  onCheckedChange={(checked) => handleChange('building_control_notified', checked)}
                />
                <Label htmlFor="building_control_notified" className="font-normal cursor-pointer">
                  Building Control notified (or via Competent Person Scheme)
                </Label>
              </div>

              {formData.building_control_notified && (
                <div>
                  <Label>Notification Method</Label>
                  <Select
                    value={formData.notification_method}
                    onValueChange={(value) => handleChange('notification_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gas Safe Register">Gas Safe Register</SelectItem>
                      <SelectItem value="Manufacturer's Website">Manufacturer's Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compliance_certificate_issued"
                  checked={formData.compliance_certificate_issued}
                  onCheckedChange={(checked) => handleChange('compliance_certificate_issued', checked)}
                />
                <Label htmlFor="compliance_certificate_issued" className="font-normal cursor-pointer">
                  Building Regulations Compliance Certificate issued
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional comments or observations..."
                rows={3}
              />
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
                  <Label>Gas Safe Registration Number *</Label>
                  <Input
                    value={formData.gas_safe_number}
                    onChange={(e) => handleChange('gas_safe_number', e.target.value)}
                    placeholder="e.g., 123456"
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
                <Label>Customer Signature (Acknowledging Receipt) *</Label>
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
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Benchmark Certificate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BenchmarkForm;
