import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import SignatureInput from './SignatureInput';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CertificateForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id: certificateId } = useParams();
  const [loading, setLoading] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    property_address: '',
    landlord_name: '',
    landlord_contact: '',
    engineer_name: '',
    gas_safe_id: '',
    engineer_signature: null,
    inspection_date: '',
    next_inspection_due: '',
    defects_actions: ''
  });
  
  const [appliances, setAppliances] = useState([
    { type: '', location: '', make_model: '', condition: 'Pass' }
  ]);
  
  const [safetyChecks, setSafetyChecks] = useState({
    gas_tightness: '',
    flue_condition: '',
    ventilation: '',
    gas_pressure: '',
    burner_operation: '',
    safety_devices: ''
  });
  
  // Fetch next serial number on mount (if not edit mode)
  useEffect(() => {
    if (!editMode) {
      fetchNextSerial();
    } else if (certificateId) {
      fetchCertificate();
    }
  }, [editMode, certificateId]);
  
  const fetchNextSerial = async () => {
    try {
      const response = await axios.get(`${API}/certificates/next-serial`);
      setSerialNumber(response.data.serial_number);
    } catch (error) {
      console.error('Error fetching serial number:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch next serial number',
        variant: 'destructive'
      });
    }
  };
  
  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/certificates/${certificateId}`);
      const cert = response.data;
      
      setSerialNumber(cert.serial_number);
      setFormData({
        property_address: cert.property_address,
        landlord_name: cert.landlord_name,
        landlord_contact: cert.landlord_contact,
        engineer_name: cert.engineer_name,
        gas_safe_id: cert.gas_safe_id,
        engineer_signature: cert.engineer_signature,
        inspection_date: cert.inspection_date,
        next_inspection_due: cert.next_inspection_due,
        defects_actions: cert.defects_actions || ''
      });
      setAppliances(cert.appliances);
      setSafetyChecks(cert.safety_checks);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSafetyCheckChange = (field, value) => {
    setSafetyChecks(prev => ({ ...prev, [field]: value }));
  };
  
  const handleApplianceChange = (index, field, value) => {
    const newAppliances = [...appliances];
    newAppliances[index][field] = value;
    setAppliances(newAppliances);
  };
  
  const addAppliance = () => {
    setAppliances([...appliances, { type: '', location: '', make_model: '', condition: 'Pass' }]);
  };
  
  const removeAppliance = (index) => {
    if (appliances.length > 1) {
      setAppliances(appliances.filter((_, i) => i !== index));
    }
  };
  
  const handleSignatureChange = (signatureData) => {
    setFormData(prev => ({ ...prev, engineer_signature: signatureData }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        appliances,
        safety_checks: safetyChecks
      };
      
      if (editMode) {
        await axios.put(`${API}/certificates/${certificateId}`, payload);
        toast({
          title: 'Success',
          description: 'Certificate updated successfully'
        });
      } else {
        await axios.post(`${API}/certificates`, payload);
        toast({
          title: 'Success',
          description: `Certificate ${serialNumber} created successfully`
        });
      }
      
      navigate('/certificates');
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to save certificate',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && editMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/certificates')}
          data-testid="back-to-registry-btn"
        >
          ← Back to Registry
        </Button>
      </div>
      
      <Card>
        {/* Company Header */}
        <div className="border-b-4 border-yellow-400 bg-white p-4">
          <div className="flex items-center gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <img 
                src="https://customer-assets.emergentagent.com/job_cp12-certificates/artifacts/cpbv5n2m_image.png" 
                alt="Breckland Heating Ltd Logo" 
                className="h-24 w-auto"
              />
            </div>
            
            {/* Company Details */}
            <div className="flex-1 text-sm">
              <h2 className="text-xl font-bold mb-2">Breckland Heating Ltd</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                <div>
                  <p>32 Paynes Lane, Feltwell</p>
                  <p>Norfolk. IP26 4BA</p>
                </div>
                <div>
                  <p><strong>Tel:</strong> 01842 879585</p>
                  <p><strong>Mobile:</strong> 07515 528786</p>
                </div>
                <div className="col-span-2">
                  <p><strong>Email:</strong> brecklandheating@gmail.com</p>
                  <p><strong>Web:</strong> brecklandheatinglimited.co.uk</p>
                  <p className="font-semibold text-blue-900 mt-1"><strong>Gas Safe Registration No:</strong> 221207</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <CardHeader>
          <CardTitle className="text-3xl">
            {editMode ? 'Edit' : 'Create'} CP12 Gas Safety Certificate
          </CardTitle>
          <CardDescription>
            {!editMode && serialNumber && (
              <span className="text-lg font-semibold text-blue-600">Serial Number: {serialNumber}</span>
            )}
            {editMode && serialNumber && (
              <span className="text-lg font-semibold text-blue-600">Serial Number: {serialNumber}</span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Property Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="property_address">Property Address *</Label>
                <Textarea
                  id="property_address"
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  data-testid="property-address-input"
                  placeholder="Enter full property address"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landlord_name">Landlord Name *</Label>
                  <Input
                    id="landlord_name"
                    name="landlord_name"
                    value={formData.landlord_name}
                    onChange={handleInputChange}
                    required
                    data-testid="landlord-name-input"
                    placeholder="Enter landlord name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="landlord_contact">Landlord Contact *</Label>
                  <Input
                    id="landlord_contact"
                    name="landlord_contact"
                    value={formData.landlord_contact}
                    onChange={handleInputChange}
                    required
                    data-testid="landlord-contact-input"
                    placeholder="Phone or email"
                  />
                </div>
              </div>
            </div>
            
            {/* Engineer Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Engineer Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engineer_name">Engineer Name *</Label>
                  <Input
                    id="engineer_name"
                    name="engineer_name"
                    value={formData.engineer_name}
                    onChange={handleInputChange}
                    required
                    data-testid="engineer-name-input"
                    placeholder="Enter engineer name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gas_safe_id">Gas Safe ID *</Label>
                  <Input
                    id="gas_safe_id"
                    name="gas_safe_id"
                    value={formData.gas_safe_id}
                    onChange={handleInputChange}
                    required
                    data-testid="gas-safe-id-input"
                    placeholder="Gas Safe registration number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Engineer Signature *</Label>
                <SignatureInput
                  value={formData.engineer_signature}
                  onChange={handleSignatureChange}
                />
              </div>
            </div>
            
            {/* Inspection Dates */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Inspection Dates</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspection_date">Inspection Date *</Label>
                  <Input
                    type="date"
                    id="inspection_date"
                    name="inspection_date"
                    value={formData.inspection_date}
                    onChange={handleInputChange}
                    required
                    data-testid="inspection-date-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="next_inspection_due">Next Inspection Due *</Label>
                  <Input
                    type="date"
                    id="next_inspection_due"
                    name="next_inspection_due"
                    value={formData.next_inspection_due}
                    onChange={handleInputChange}
                    required
                    data-testid="next-inspection-due-input"
                  />
                </div>
              </div>
            </div>
            
            {/* Appliances */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold">Gas Appliances</h3>
                <Button
                  type="button"
                  onClick={addAppliance}
                  variant="outline"
                  size="sm"
                  data-testid="add-appliance-btn"
                >
                  + Add Appliance
                </Button>
              </div>
              
              {appliances.map((appliance, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Appliance {index + 1}</h4>
                      {appliances.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAppliance(index)}
                          data-testid={`remove-appliance-${index}-btn`}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Input
                          value={appliance.type}
                          onChange={(e) => handleApplianceChange(index, 'type', e.target.value)}
                          required
                          placeholder="e.g., Boiler, Cooker, Heater"
                          data-testid={`appliance-${index}-type`}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Location *</Label>
                        <Input
                          value={appliance.location}
                          onChange={(e) => handleApplianceChange(index, 'location', e.target.value)}
                          required
                          placeholder="e.g., Kitchen, Living Room"
                          data-testid={`appliance-${index}-location`}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Make/Model *</Label>
                        <Input
                          value={appliance.make_model}
                          onChange={(e) => handleApplianceChange(index, 'make_model', e.target.value)}
                          required
                          placeholder="Manufacturer and model"
                          data-testid={`appliance-${index}-make-model`}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Condition *</Label>
                        <Select
                          value={appliance.condition}
                          onValueChange={(value) => handleApplianceChange(index, 'condition', value)}
                        >
                          <SelectTrigger data-testid={`appliance-${index}-condition`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pass">Pass</SelectItem>
                            <SelectItem value="Fail">Fail</SelectItem>
                            <SelectItem value="At Risk">At Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Safety Checks */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Safety Checks</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gas Tightness Test *</Label>
                  <Select
                    value={safetyChecks.gas_tightness}
                    onValueChange={(value) => handleSafetyCheckChange('gas_tightness', value)}
                  >
                    <SelectTrigger data-testid="gas-tightness-input">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pass">Pass</SelectItem>
                      <SelectItem value="Fail">Fail</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Flue Condition *</Label>
                  <Select
                    value={safetyChecks.flue_condition}
                    onValueChange={(value) => handleSafetyCheckChange('flue_condition', value)}
                  >
                    <SelectTrigger data-testid="flue-condition-input">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                      <SelectItem value="Unsatisfactory">Unsatisfactory</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Ventilation *</Label>
                  <Select
                    value={safetyChecks.ventilation}
                    onValueChange={(value) => handleSafetyCheckChange('ventilation', value)}
                  >
                    <SelectTrigger data-testid="ventilation-input">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adequate">Adequate</SelectItem>
                      <SelectItem value="Inadequate">Inadequate</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Gas Pressure *</Label>
                  <Select
                    value={safetyChecks.gas_pressure}
                    onValueChange={(value) => handleSafetyCheckChange('gas_pressure', value)}
                  >
                    <SelectTrigger data-testid="gas-pressure-input">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Correct">Correct</SelectItem>
                      <SelectItem value="Incorrect">Incorrect</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Burner Operation *</Label>
                  <Select
                    value={safetyChecks.burner_operation}
                    onValueChange={(value) => handleSafetyCheckChange('burner_operation', value)}
                  >
                    <SelectTrigger data-testid="burner-operation-input">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                      <SelectItem value="Unsatisfactory">Unsatisfactory</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Safety Devices *</Label>
                  <Select
                    value={safetyChecks.safety_devices}
                    onValueChange={(value) => handleSafetyCheckChange('safety_devices', value)}
                  >
                    <SelectTrigger data-testid="safety-devices-input">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operating Correctly">Operating Correctly</SelectItem>
                      <SelectItem value="Not Operating Correctly">Not Operating Correctly</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Defects/Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Defects/Actions Required</h3>
              
              <div className="space-y-2">
                <Label htmlFor="defects_actions">Details (Optional)</Label>
                <Textarea
                  id="defects_actions"
                  name="defects_actions"
                  value={formData.defects_actions}
                  onChange={handleInputChange}
                  rows={4}
                  data-testid="defects-actions-input"
                  placeholder="Describe any defects found or actions required"
                />
              </div>
            </div>
            
            {/* Compliance Statement */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Compliance Statement:</strong> This inspection complies with the Gas Safety (Installation and Use) Regulations 1998
              </p>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/certificates')}
                disabled={loading}
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                data-testid="submit-certificate-btn"
              >
                {loading ? 'Saving...' : (editMode ? 'Update Certificate' : 'Create Certificate')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateForm;