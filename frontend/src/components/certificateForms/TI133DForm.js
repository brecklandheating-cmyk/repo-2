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
import { FileText, Building2, User, AlertTriangle, Droplets, Flame, ArrowLeft } from 'lucide-react';
import SignatureInput from '../SignatureInput';
import CustomerSelector from '../CustomerSelector';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TI133DForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    certificate_type: 'TI133D',
    landlord_customer_name: '',
    landlord_customer_address: '',
    landlord_customer_phone: '',
    landlord_customer_email: '',
    inspection_address: '',
    
    // Tank details
    tank_construction: '',
    tank_type: '',
    tank_capacity: '',
    tank_material: '',
    tank_age: '',
    tank_location: '',
    
    // Risk Assessment - Yes/No Questions
    tank_condition_good: false,
    tank_positioned_correctly: false,
    adequate_ventilation: false,
    fire_valve_present: false,
    distance_to_building: '',
    distance_adequate: false,
    secondary_containment_adequate: false,
    away_from_ignition_sources: false,
    away_from_drains: false,
    pipework_secure: false,
    no_visible_leaks: false,
    vent_pipe_correct: false,
    fill_line_correct: false,
    
    // Risk Levels
    spillage_risk_level: 'Low',
    fire_risk_level: 'Low',
    environmental_hazards: '',
    
    // Remedial Actions
    actions_required: '',
    urgent_attention_needed: false,
    notes: '',
    
    // Assessment details
    inspection_date: new Date().toISOString().split('T')[0],
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
    } else {
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
      // Clean up empty date fields before sending
      const cleanedData = { ...formData };
      if (cleanedData.next_inspection_due === '') {
        cleanedData.next_inspection_due = null;
      }
      
      await axios.post(`${API}/certificates`, cleanedData);
      toast.success('TI/133D Risk Assessment created successfully!');
      navigate('/certificates');
    } catch (error) {
      console.error('Certificate error:', error.response?.data);
      
      let errorMessage = 'Failed to create assessment';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => `${err.loc?.join(' > ')}: ${err.msg}`).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = 'Validation error. Please check all required fields.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallRisk = () => {
    const failedChecks = [
      !formData.tank_condition_good,
      !formData.tank_positioned_correctly,
      !formData.fire_valve_present,
      !formData.distance_adequate,
      !formData.secondary_containment_adequate,
      !formData.away_from_ignition_sources,
      !formData.away_from_drains,
      !formData.pipework_secure,
      !formData.no_visible_leaks
    ].filter(Boolean).length;

    if (failedChecks >= 5) return { level: 'High', color: 'red' };
    if (failedChecks >= 3) return { level: 'Medium', color: 'orange' };
    return { level: 'Low', color: 'green' };
  };

  const riskStatus = calculateOverallRisk();

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
                TI/133D Oil Storage Tank Risk Assessment
              </h1>
              <p className="text-slate-600">Domestic Oil Storage - Spillage & Fire Risk Assessment</p>
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
                <Label>Tank Location Address *</Label>
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

          {/* Tank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Oil Tank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tank Construction *</Label>
                <Select
                  value={formData.tank_construction}
                  onValueChange={(value) => handleChange('tank_construction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select construction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Wall">Single Wall</SelectItem>
                    <SelectItem value="Bunded">Bunded (Double Wall)</SelectItem>
                    <SelectItem value="Integrally Bunded">Integrally Bunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tank Type *</Label>
                <Select
                  value={formData.tank_type}
                  onValueChange={(value) => handleChange('tank_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Above Ground">Above Ground</SelectItem>
                    <SelectItem value="Below Ground">Below Ground</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tank Capacity (litres) *</Label>
                <Input
                  type="number"
                  value={formData.tank_capacity}
                  onChange={(e) => handleChange('tank_capacity', e.target.value)}
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
                    <SelectItem value="GRP">GRP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Approximate Age (years)</Label>
                <Input
                  type="number"
                  value={formData.tank_age}
                  onChange={(e) => handleChange('tank_age', e.target.value)}
                />
              </div>
              <div>
                <Label>Tank Location Description *</Label>
                <Input
                  value={formData.tank_location}
                  onChange={(e) => handleChange('tank_location', e.target.value)}
                  placeholder="e.g., Rear garden, Side of property"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Assessment Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Safety Assessment Checklist
              </CardTitle>
              <CardDescription>Check all items that apply - unchecked items indicate potential risks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tank_condition_good"
                  checked={formData.tank_condition_good}
                  onCheckedChange={(checked) => handleChange('tank_condition_good', checked)}
                />
                <Label htmlFor="tank_condition_good" className="font-normal cursor-pointer">
                  Tank in good condition (no visible corrosion, damage, or leaks)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tank_positioned_correctly"
                  checked={formData.tank_positioned_correctly}
                  onCheckedChange={(checked) => handleChange('tank_positioned_correctly', checked)}
                />
                <Label htmlFor="tank_positioned_correctly" className="font-normal cursor-pointer">
                  Tank positioned on stable, level base
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adequate_ventilation"
                  checked={formData.adequate_ventilation}
                  onCheckedChange={(checked) => handleChange('adequate_ventilation', checked)}
                />
                <Label htmlFor="adequate_ventilation" className="font-normal cursor-pointer">
                  Adequate ventilation around tank
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fire_valve_present"
                  checked={formData.fire_valve_present}
                  onCheckedChange={(checked) => handleChange('fire_valve_present', checked)}
                />
                <Label htmlFor="fire_valve_present" className="font-normal cursor-pointer">
                  Fire valve fitted and operational
                </Label>
              </div>
              <div className="space-y-2 ml-6">
                <Label>Distance to Building (meters) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.distance_to_building}
                  onChange={(e) => handleChange('distance_to_building', e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="distance_adequate"
                  checked={formData.distance_adequate}
                  onCheckedChange={(checked) => handleChange('distance_adequate', checked)}
                />
                <Label htmlFor="distance_adequate" className="font-normal cursor-pointer">
                  Distance to building meets regulations (minimum 1.8m)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="secondary_containment_adequate"
                  checked={formData.secondary_containment_adequate}
                  onCheckedChange={(checked) => handleChange('secondary_containment_adequate', checked)}
                />
                <Label htmlFor="secondary_containment_adequate" className="font-normal cursor-pointer">
                  Secondary containment adequate (bund or catchpit)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="away_from_ignition_sources"
                  checked={formData.away_from_ignition_sources}
                  onCheckedChange={(checked) => handleChange('away_from_ignition_sources', checked)}
                />
                <Label htmlFor="away_from_ignition_sources" className="font-normal cursor-pointer">
                  Tank located away from ignition sources
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="away_from_drains"
                  checked={formData.away_from_drains}
                  onCheckedChange={(checked) => handleChange('away_from_drains', checked)}
                />
                <Label htmlFor="away_from_drains" className="font-normal cursor-pointer">
                  Tank away from drains and watercourses
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pipework_secure"
                  checked={formData.pipework_secure}
                  onCheckedChange={(checked) => handleChange('pipework_secure', checked)}
                />
                <Label htmlFor="pipework_secure" className="font-normal cursor-pointer">
                  All pipework secure and properly installed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="no_visible_leaks"
                  checked={formData.no_visible_leaks}
                  onCheckedChange={(checked) => handleChange('no_visible_leaks', checked)}
                />
                <Label htmlFor="no_visible_leaks" className="font-normal cursor-pointer">
                  No visible oil leaks or staining
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vent_pipe_correct"
                  checked={formData.vent_pipe_correct}
                  onCheckedChange={(checked) => handleChange('vent_pipe_correct', checked)}
                />
                <Label htmlFor="vent_pipe_correct" className="font-normal cursor-pointer">
                  Vent pipe correctly installed and open
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fill_line_correct"
                  checked={formData.fill_line_correct}
                  onCheckedChange={(checked) => handleChange('fill_line_correct', checked)}
                />
                <Label htmlFor="fill_line_correct" className="font-normal cursor-pointer">
                  Fill line correctly positioned with cap
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Summary */}
          <Card className={`border-2 border-${riskStatus.color}-500`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Risk Assessment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 bg-${riskStatus.color}-50 rounded-lg`}>
                <p className="font-semibold text-lg">
                  Overall Risk Level: <span className={`text-${riskStatus.color}-700`}>{riskStatus.level}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Spillage Risk Level *</Label>
                  <Select
                    value={formData.spillage_risk_level}
                    onValueChange={(value) => handleChange('spillage_risk_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fire Risk Level *</Label>
                  <Select
                    value={formData.fire_risk_level}
                    onValueChange={(value) => handleChange('fire_risk_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Environmental Hazards Identified</Label>
                <Textarea
                  value={formData.environmental_hazards}
                  onChange={(e) => handleChange('environmental_hazards', e.target.value)}
                  placeholder="e.g., Proximity to watercourse, drainage concerns..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Remedial Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Remedial Actions Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-amber-50 rounded-lg">
                <Checkbox
                  id="urgent_attention_needed"
                  checked={formData.urgent_attention_needed}
                  onCheckedChange={(checked) => handleChange('urgent_attention_needed', checked)}
                />
                <Label htmlFor="urgent_attention_needed" className="font-semibold cursor-pointer text-amber-900">
                  Urgent attention required - immediate action needed
                </Label>
              </div>
              
              <div>
                <Label>Actions Required / Recommendations *</Label>
                <Textarea
                  value={formData.actions_required}
                  onChange={(e) => handleChange('actions_required', e.target.value)}
                  placeholder="List any required corrective actions or recommendations..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional observations..."
                  rows={2}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Assessment Date *</Label>
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
              {loading ? 'Creating...' : 'Create TI/133D Assessment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TI133DForm;
