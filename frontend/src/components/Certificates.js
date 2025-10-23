import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, FileCheck, Eye, Trash2, Search, Edit, ShieldCheck } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Certificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  
  const [formData, setFormData] = useState({
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
    responsible_person_signature: '',
    engineer_signature: ''
  });

  const [currentAppliance, setCurrentAppliance] = useState({
    appliance_type: '',
    make_model: '',
    installation_area: '',
    to_be_inspected: true,
    flue_type: 'Open',
    operating_pressure: '',
    safety_devices_ok: true,
    ventilation_satisfactory: true,
    flue_condition_satisfactory: true,
    flue_operation_ok: true,
    co_reading: '',
    co2_reading: '',
    fan_pressure_reading: '',
    defects: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [searchTerm, certificates]);

  const fetchData = async () => {
    try {
      const [certsRes, settingsRes] = await Promise.all([
        axios.get(`${API}/certificates`),
        axios.get(`${API}/settings`)
      ]);
      setCertificates(certsRes.data);
      setFilteredCertificates(certsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    if (!searchTerm) {
      setFilteredCertificates(certificates);
      return;
    }
    const filtered = certificates.filter(
      (cert) =>
        cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.landlord_customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.inspection_address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCertificates(filtered);
  };

  const addAppliance = () => {
    if (!currentAppliance.appliance_type || !currentAppliance.make_model) {
      toast.error('Please fill in appliance type and make/model');
      return;
    }

    setFormData({ ...formData, appliances: [...formData.appliances, currentAppliance] });
    setCurrentAppliance({
      appliance_type: '',
      make_model: '',
      installation_area: '',
      to_be_inspected: true,
      flue_type: 'Open',
      operating_pressure: '',
      safety_devices_ok: true,
      ventilation_satisfactory: true,
      flue_condition_satisfactory: true,
      flue_operation_ok: true,
      co_reading: '',
      co2_reading: '',
      fan_pressure_reading: '',
      defects: ''
    });
  };

  const removeAppliance = (index) => {
    const newAppliances = formData.appliances.filter((_, i) => i !== index);
    setFormData({ ...formData, appliances: newAppliances });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.appliances.length === 0) {
      toast.error('Please add at least one appliance');
      return;
    }

    try {
      const data = {
        ...formData,
        inspection_date: new Date(formData.inspection_date).toISOString(),
        next_inspection_due: new Date(formData.next_inspection_due).toISOString()
      };

      if (editingCertificate) {
        await axios.put(`${API}/certificates/${editingCertificate.id}`, data);
        toast.success('Certificate updated successfully');
      } else {
        await axios.post(`${API}/certificates`, data);
        toast.success('Certificate created successfully');
      }
      
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save certificate');
    }
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      landlord_customer_name: certificate.landlord_customer_name,
      landlord_customer_address: certificate.landlord_customer_address,
      landlord_customer_phone: certificate.landlord_customer_phone,
      landlord_customer_email: certificate.landlord_customer_email || '',
      inspection_address: certificate.inspection_address,
      let_by_tightness_test: certificate.let_by_tightness_test,
      equipotential_bonding: certificate.equipotential_bonding,
      ecv_accessible: certificate.ecv_accessible,
      pipework_visual_inspection: certificate.pipework_visual_inspection,
      co_alarm_working: certificate.co_alarm_working,
      smoke_alarm_working: certificate.smoke_alarm_working,
      appliances: certificate.appliances,
      inspection_date: new Date(certificate.inspection_date).toISOString().split('T')[0],
      next_inspection_due: new Date(certificate.next_inspection_due).toISOString().split('T')[0],
      engineer_name: certificate.engineer_name,
      gas_safe_number: certificate.gas_safe_number,
      responsible_person_signature: certificate.responsible_person_signature || '',
      engineer_signature: certificate.engineer_signature || ''
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await axios.delete(`${API}/certificates/${id}`);
      toast.success('Certificate deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete certificate');
    }
  };

  const resetForm = () => {
    setFormData({
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
      responsible_person_signature: '',
      engineer_signature: ''
    });
    setCurrentAppliance({
      appliance_type: '',
      make_model: '',
      installation_area: '',
      to_be_inspected: true,
      flue_type: 'Open',
      operating_pressure: '',
      safety_devices_ok: true,
      ventilation_satisfactory: true,
      flue_condition_satisfactory: true,
      flue_operation_ok: true,
      co_reading: '',
      co2_reading: '',
      fan_pressure_reading: '',
      defects: ''
    });
    setEditingCertificate(null);
  };

  const viewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="certificates-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Certificates
          </h1>
          <p className="text-slate-600">Create and manage gas & oil safety certificates</p>
        </div>
        <Button
          onClick={() => navigate('/certificates/new')}
          data-testid="create-certificate-button"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Certificate
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by certificate number, customer, or property address..."
              data-testid="search-certificates-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk' }}>
            All Certificates ({filteredCertificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No certificates found</p>
              <p className="text-slate-400 text-sm mt-2">Create your first gas safety certificate</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Certificate #</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Inspection Date</th>
                    <th>Next Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id}>
                      <td className="font-semibold text-green-600">{cert.certificate_number}</td>
                      <td>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {cert.certificate_type}
                        </span>
                      </td>
                      <td>{cert.landlord_customer_name}</td>
                      <td className="max-w-xs truncate">{cert.inspection_address}</td>
                      <td>{new Date(cert.inspection_date).toLocaleDateString()}</td>
                      <td>{cert.next_inspection_due ? new Date(cert.next_inspection_due).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewCertificate(cert)}
                            data-testid={`view-certificate-${cert.id}`}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cert)}
                            data-testid={`edit-certificate-${cert.id}`}
                            className="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(cert.id)}
                            data-testid={`delete-certificate-${cert.id}`}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Certificate Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCertificate ? 'Edit' : 'Create'} Gas Safety Certificate</DialogTitle>
            <DialogDescription>
              Complete all inspection points and appliance checks
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Landlord/Customer Details */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Landlord/Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="landlord_name">Name *</Label>
                  <Input
                    id="landlord_name"
                    data-testid="landlord-name-input"
                    value={formData.landlord_customer_name}
                    onChange={(e) => setFormData({ ...formData, landlord_customer_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landlord_address">Address *</Label>
                  <Input
                    id="landlord_address"
                    data-testid="landlord-address-input"
                    value={formData.landlord_customer_address}
                    onChange={(e) => setFormData({ ...formData, landlord_customer_address: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="landlord_phone">Phone *</Label>
                    <Input
                      id="landlord_phone"
                      data-testid="landlord-phone-input"
                      value={formData.landlord_customer_phone}
                      onChange={(e) => setFormData({ ...formData, landlord_customer_phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landlord_email">Email</Label>
                    <Input
                      id="landlord_email"
                      type="email"
                      data-testid="landlord-email-input"
                      value={formData.landlord_customer_email}
                      onChange={(e) => setFormData({ ...formData, landlord_customer_email: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Address */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Work/Inspection Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="inspection_address">Property Address *</Label>
                  <Input
                    id="inspection_address"
                    data-testid="inspection-address-input"
                    value={formData.inspection_address}
                    onChange={(e) => setFormData({ ...formData, inspection_address: e.target.value })}
                    required
                    placeholder="Full address of property being inspected"
                  />
                </div>
              </CardContent>
            </Card>

            {/* General Installation Checks */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">General Installation Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="tightness_test"
                    data-testid="tightness-test-checkbox"
                    checked={formData.let_by_tightness_test}
                    onCheckedChange={(checked) => setFormData({ ...formData, let_by_tightness_test: checked })}
                  />
                  <Label htmlFor="tightness_test" className="cursor-pointer">Let by and tightness test ok?</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="bonding"
                    checked={formData.equipotential_bonding}
                    onCheckedChange={(checked) => setFormData({ ...formData, equipotential_bonding: checked })}
                  />
                  <Label htmlFor="bonding" className="cursor-pointer">Main equipotential bonding ok?</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="ecv"
                    checked={formData.ecv_accessible}
                    onCheckedChange={(checked) => setFormData({ ...formData, ecv_accessible: checked })}
                  />
                  <Label htmlFor="ecv" className="cursor-pointer">ECV accessible?</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="pipework"
                    checked={formData.pipework_visual_inspection}
                    onCheckedChange={(checked) => setFormData({ ...formData, pipework_visual_inspection: checked })}
                  />
                  <Label htmlFor="pipework" className="cursor-pointer">Satisfactory visual inspection of gas installation pipework?</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="co_alarm"
                    checked={formData.co_alarm_working}
                    onCheckedChange={(checked) => setFormData({ ...formData, co_alarm_working: checked })}
                  />
                  <Label htmlFor="co_alarm" className="cursor-pointer">CO alarm fitted and working?</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="smoke_alarm"
                    checked={formData.smoke_alarm_working}
                    onCheckedChange={(checked) => setFormData({ ...formData, smoke_alarm_working: checked })}
                  />
                  <Label htmlFor="smoke_alarm" className="cursor-pointer">Smoke alarm fitted and working?</Label>
                </div>
              </CardContent>
            </Card>

            {/* Appliances */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Appliances Inspected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Appliance Form */}
                <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                  <h4 className="font-semibold text-sm">Add New Appliance</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      data-testid="appliance-type-input"
                      placeholder="Type (e.g., Boiler, Cooker)"
                      value={currentAppliance.appliance_type}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, appliance_type: e.target.value })}
                    />
                    <Input
                      placeholder="Make and Model"
                      value={currentAppliance.make_model}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, make_model: e.target.value })}
                    />
                    <Input
                      placeholder="Room/Location"
                      value={currentAppliance.installation_area}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, installation_area: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="to_inspect"
                        checked={currentAppliance.to_be_inspected}
                        onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, to_be_inspected: checked })}
                      />
                      <Label htmlFor="to_inspect" className="text-sm cursor-pointer">To be inspected</Label>
                    </div>
                    <Select value={currentAppliance.flue_type} onValueChange={(value) => setCurrentAppliance({ ...currentAppliance, flue_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Flue Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Balanced">Balanced</SelectItem>
                        <SelectItem value="Fan assisted">Fan assisted</SelectItem>
                        <SelectItem value="Unflued">Unflued</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Operating Pressure (mb/kWh)"
                      value={currentAppliance.operating_pressure}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, operating_pressure: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="safety_ok"
                        checked={currentAppliance.safety_devices_ok}
                        onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, safety_devices_ok: checked })}
                      />
                      <Label htmlFor="safety_ok" className="text-xs cursor-pointer">Safety devices OK</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vent_ok"
                        checked={currentAppliance.ventilation_satisfactory}
                        onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, ventilation_satisfactory: checked })}
                      />
                      <Label htmlFor="vent_ok" className="text-xs cursor-pointer">Ventilation OK</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="flue_cond_ok"
                        checked={currentAppliance.flue_condition_satisfactory}
                        onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, flue_condition_satisfactory: checked })}
                      />
                      <Label htmlFor="flue_cond_ok" className="text-xs cursor-pointer">Flue condition OK</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="flue_op_ok"
                        checked={currentAppliance.flue_operation_ok}
                        onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, flue_operation_ok: checked })}
                      />
                      <Label htmlFor="flue_op_ok" className="text-xs cursor-pointer">Flue operation OK</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="CO Reading (XX.XXXX)"
                      value={currentAppliance.co_reading}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, co_reading: e.target.value })}
                    />
                    <Input
                      placeholder="CO2 Reading (XX.XXXX)"
                      value={currentAppliance.co2_reading}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, co2_reading: e.target.value })}
                    />
                    <Input
                      placeholder="Fan Pressure (-XXX.X mb)"
                      value={currentAppliance.fan_pressure_reading}
                      onChange={(e) => setCurrentAppliance({ ...currentAppliance, fan_pressure_reading: e.target.value })}
                    />
                  </div>

                  <Input
                    placeholder="Defects (if any)"
                    value={currentAppliance.defects}
                    onChange={(e) => setCurrentAppliance({ ...currentAppliance, defects: e.target.value })}
                  />

                  <Button type="button" onClick={addAppliance} data-testid="add-appliance-button" className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Appliance
                  </Button>
                </div>

                {/* Appliances List */}
                {formData.appliances.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Added Appliances ({formData.appliances.length})</h4>
                    {formData.appliances.map((app, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-base">{app.appliance_type} - {app.make_model}</h5>
                            <p className="text-sm text-slate-600">Location: {app.installation_area || 'N/A'} | Flue: {app.flue_type}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeAppliance(index)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <p>✓ Safety Devices: {app.safety_devices_ok ? 'Yes' : 'No'}</p>
                          <p>✓ Ventilation: {app.ventilation_satisfactory ? 'Yes' : 'No'}</p>
                          <p>✓ Flue Condition: {app.flue_condition_satisfactory ? 'Yes' : 'No'}</p>
                          <p>✓ Flue Operation: {app.flue_operation_ok ? 'Yes' : 'No'}</p>
                          {app.co_reading && <p>CO: {app.co_reading}</p>}
                          {app.co2_reading && <p>CO2: {app.co2_reading}</p>}
                          {app.fan_pressure_reading && <p>Fan Pressure: {app.fan_pressure_reading}</p>}
                        </div>
                        {app.defects && <p className="text-sm text-red-600 mt-2">Defects: {app.defects}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom Section */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Certificate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inspection_date">Inspection Date *</Label>
                    <Input
                      id="inspection_date"
                      data-testid="inspection-date-input"
                      type="date"
                      value={formData.inspection_date}
                      onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_due">Next Inspection Due By *</Label>
                    <Input
                      id="next_due"
                      data-testid="next-due-input"
                      type="date"
                      value={formData.next_inspection_due}
                      onChange={(e) => setFormData({ ...formData, next_inspection_due: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineer_name">Engineer Name *</Label>
                    <Input
                      id="engineer_name"
                      data-testid="engineer-name-input"
                      value={formData.engineer_name}
                      onChange={(e) => setFormData({ ...formData, engineer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gas_safe">Gas Safe Number *</Label>
                    <Input
                      id="gas_safe"
                      data-testid="gas-safe-input"
                      value={formData.gas_safe_number}
                      onChange={(e) => setFormData({ ...formData, gas_safe_number: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_sig">Responsible Person's Signature</Label>
                    <Input
                      id="responsible_sig"
                      data-testid="responsible-signature-input"
                      value={formData.responsible_person_signature}
                      onChange={(e) => setFormData({ ...formData, responsible_person_signature: e.target.value })}
                      placeholder="Type name for signature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engineer_sig">Engineer's Signature</Label>
                    <Input
                      id="engineer_sig"
                      data-testid="engineer-signature-input"
                      value={formData.engineer_signature}
                      onChange={(e) => setFormData({ ...formData, engineer_signature: e.target.value })}
                      placeholder="Type name for signature"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" data-testid="save-certificate-button" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingCertificate ? 'Update' : 'Create'} Certificate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Certificate Dialog - Detailed Print Format */}
      {selectedCertificate && settings && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCertificate.certificate_type === 'CP12' && 'Gas Safety Certificate'}
                {selectedCertificate.certificate_type === 'BENCHMARK' && 'Benchmark Commissioning Certificate'}
                {selectedCertificate.certificate_type === 'CD11' && 'CD11 Oil Boiler Service Certificate'}
                {selectedCertificate.certificate_type === 'CD10' && 'CD10 Oil Installation Certificate'}
                {selectedCertificate.certificate_type === 'TI133D' && 'TI/133D Tank Risk Assessment'}
                {' - '}{selectedCertificate.certificate_number}
              </DialogTitle>
              <DialogDescription>
                Official {selectedCertificate.certificate_type} inspection record
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 print:space-y-4">
              {/* Company Header */}
              <div className="border-b-2 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {settings.logo && (
                      <img src={settings.logo} alt={settings.company_name} className="h-16 w-auto object-contain" />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk' }}>
                        {settings.company_name}
                      </h2>
                      <div className="mt-2 text-sm text-slate-600 space-y-1">
                        {settings.address && <p>{settings.address}</p>}
                        <div className="flex gap-4">
                          {settings.phone && <p>Tel: {settings.phone}</p>}
                          {settings.email && <p>Email: {settings.email}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">Certificate #: {selectedCertificate.certificate_number}</p>
                    <p className="text-sm text-slate-600">Issue Date: {new Date(selectedCertificate.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Landlord/Customer Details */}
              <div className="border-2 rounded-lg p-4 bg-slate-50">
                <h3 className="font-bold text-lg mb-2">Landlord/Customer Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {selectedCertificate.landlord_customer_name}</p>
                  <p><span className="font-semibold">Phone:</span> {selectedCertificate.landlord_customer_phone}</p>
                  <p className="col-span-2"><span className="font-semibold">Address:</span> {selectedCertificate.landlord_customer_address}</p>
                  {selectedCertificate.landlord_customer_email && (
                    <p className="col-span-2"><span className="font-semibold">Email:</span> {selectedCertificate.landlord_customer_email}</p>
                  )}
                </div>
              </div>

              {/* Inspection Address */}
              <div className="border-2 rounded-lg p-4 bg-slate-50">
                <h3 className="font-bold text-lg mb-2">Work/Inspection Address</h3>
                <p className="text-sm">{selectedCertificate.inspection_address}</p>
              </div>

              {/* General Installation Checks - CP12 Only */}
              {selectedCertificate.certificate_type === 'CP12' && (
              <div className="border-2 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">General Installation Checks</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={selectedCertificate.let_by_tightness_test ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {selectedCertificate.let_by_tightness_test ? '✓' : '✗'}
                    </span>
                    <span>Let by and tightness test ok</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedCertificate.equipotential_bonding ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {selectedCertificate.equipotential_bonding ? '✓' : '✗'}
                    </span>
                    <span>Main equipotential bonding ok</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedCertificate.ecv_accessible ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {selectedCertificate.ecv_accessible ? '✓' : '✗'}
                    </span>
                    <span>ECV accessible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedCertificate.pipework_visual_inspection ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {selectedCertificate.pipework_visual_inspection ? '✓' : '✗'}
                    </span>
                    <span>Satisfactory visual inspection of pipework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedCertificate.co_alarm_working ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {selectedCertificate.co_alarm_working ? '✓' : '✗'}
                    </span>
                    <span>CO alarm fitted and working</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={selectedCertificate.smoke_alarm_working ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {selectedCertificate.smoke_alarm_working ? '✓' : '✗'}
                    </span>
                    <span>Smoke alarm fitted and working</span>
                  </div>
                </div>
              </div>
              )}

              {/* Appliances - Only for CP12 certificates */}
              {selectedCertificate.appliances && selectedCertificate.appliances.length > 0 && (
                <div className="border-2 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3">Appliances Inspected</h3>
                  <div className="space-y-4">
                    {selectedCertificate.appliances.map((app, index) => (
                    <div key={index} className="border-2 rounded-lg p-4 bg-slate-50">
                      <div className="mb-3">
                        <h4 className="font-bold text-base">{app.appliance_type} - {app.make_model}</h4>
                        <p className="text-sm text-slate-600">Location: {app.installation_area} | Flue Type: {app.flue_type}</p>
                        {app.operating_pressure && <p className="text-sm text-slate-600">Operating Pressure: {app.operating_pressure}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <span className={app.safety_devices_ok ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {app.safety_devices_ok ? '✓' : '✗'}
                          </span>
                          <span>Correct operation of safety devices</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={app.ventilation_satisfactory ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {app.ventilation_satisfactory ? '✓' : '✗'}
                          </span>
                          <span>Satisfactory ventilation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={app.flue_condition_satisfactory ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {app.flue_condition_satisfactory ? '✓' : '✗'}
                          </span>
                          <span>Visual condition of flue satisfactory</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={app.flue_operation_ok ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {app.flue_operation_ok ? '✓' : '✗'}
                          </span>
                          <span>Flue operation checks ok</span>
                        </div>
                      </div>

                      {(app.co_reading || app.co2_reading || app.fan_pressure_reading) && (
                        <div className="bg-white p-3 rounded border">
                          <p className="font-semibold text-sm mb-2">Combustion Analyser Readings:</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {app.co_reading && <p><span className="font-medium">CO:</span> {app.co_reading}</p>}
                            {app.co2_reading && <p><span className="font-medium">CO2:</span> {app.co2_reading}</p>}
                            {app.fan_pressure_reading && <p><span className="font-medium">Fan Pressure:</span> {app.fan_pressure_reading} mb</p>}
                          </div>
                        </div>
                      )}

                      {app.defects && (
                        <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded">
                          <p className="font-semibold text-sm text-red-700">Defects:</p>
                          <p className="text-sm text-red-600">{app.defects}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Certificate Details for non-CP12 certificates */}
              {selectedCertificate.certificate_type !== 'CP12' && (
                <div className="border-2 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3">Certificate Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedCertificate.boiler_make && (
                      <div>
                        <p className="font-semibold">Boiler Make:</p>
                        <p>{selectedCertificate.boiler_make}</p>
                      </div>
                    )}
                    {selectedCertificate.boiler_model && (
                      <div>
                        <p className="font-semibold">Boiler Model:</p>
                        <p>{selectedCertificate.boiler_model}</p>
                      </div>
                    )}
                    {selectedCertificate.boiler_serial_number && (
                      <div>
                        <p className="font-semibold">Serial Number:</p>
                        <p>{selectedCertificate.boiler_serial_number}</p>
                      </div>
                    )}
                    {selectedCertificate.boiler_type && (
                      <div>
                        <p className="font-semibold">Boiler Type:</p>
                        <p>{selectedCertificate.boiler_type}</p>
                      </div>
                    )}
                    {selectedCertificate.appliance_make_model && (
                      <div>
                        <p className="font-semibold">Appliance:</p>
                        <p>{selectedCertificate.appliance_make_model}</p>
                      </div>
                    )}
                    {selectedCertificate.tank_type && (
                      <div>
                        <p className="font-semibold">Tank Type:</p>
                        <p>{selectedCertificate.tank_type}</p>
                      </div>
                    )}
                    {selectedCertificate.tank_capacity && (
                      <div>
                        <p className="font-semibold">Tank Capacity:</p>
                        <p>{selectedCertificate.tank_capacity} litres</p>
                      </div>
                    )}
                    {selectedCertificate.notes && (
                      <div className="col-span-2">
                        <p className="font-semibold">Notes:</p>
                        <p className="whitespace-pre-wrap">{selectedCertificate.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Section */}
              <div className="border-2 rounded-lg p-4 bg-slate-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Inspection Date:</p>
                    <p>{new Date(selectedCertificate.inspection_date).toLocaleDateString()}</p>
                  </div>
                  {selectedCertificate.next_inspection_due && (
                    <div>
                      <p className="font-semibold">Next Inspection Due By:</p>
                      <p>{new Date(selectedCertificate.next_inspection_due).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Engineer Name:</p>
                    <p>{selectedCertificate.engineer_name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedCertificate.gas_safe_number ? 'Gas Safe' : 'OFTEC'} Registration:</p>
                    <p>{selectedCertificate.gas_safe_number || selectedCertificate.oftec_number}</p>
                  </div>
                  {selectedCertificate.responsible_person_signature && (
                    <div>
                      <p className="font-semibold">Responsible Person's Signature:</p>
                      <p className="italic">{selectedCertificate.responsible_person_signature}</p>
                    </div>
                  )}
                  {selectedCertificate.engineer_signature && (
                    <div>
                      <p className="font-semibold">Engineer's Signature:</p>
                      <p className="italic">{selectedCertificate.engineer_signature}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-500 border-t pt-4">
                <p>This certificate confirms that the gas appliances and installations at the above property have been inspected in accordance with current gas safety regulations.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Certificates;