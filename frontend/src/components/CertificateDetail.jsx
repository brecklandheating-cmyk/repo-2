import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CertificateDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCertificate();
  }, [id]);
  
  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/certificates/${id}`);
      setCertificate(response.data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate',
        variant: 'destructive'
      });
      navigate('/certificates');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'Pass':
        return <Badge className="bg-green-600">Pass</Badge>;
      case 'Fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'At Risk':
        return <Badge variant="warning" className="bg-orange-500">At Risk</Badge>;
      default:
        return <Badge variant="secondary">{condition}</Badge>;
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }
  
  if (!certificate) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex gap-2 print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate('/certificates')}
          data-testid="back-to-registry-detail-btn"
        >
          ← Back to Registry
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/certificates/${id}/edit`)}
          data-testid="edit-certificate-detail-btn"
        >
          Edit Certificate
        </Button>
        <Button
          onClick={handlePrint}
          data-testid="print-certificate-btn"
        >
          Print Certificate
        </Button>
      </div>
      
      <Card className="print:shadow-none">
        <CardHeader className="bg-blue-600 text-white print:bg-blue-600">
          <div className="text-center">
            <CardTitle className="text-3xl mb-2">CP12 Gas Safety Certificate</CardTitle>
            <p className="text-lg">Landlord Gas Safety Record</p>
            <p className="text-sm mt-2">Serial Number: <span className="font-bold text-xl">{certificate.serial_number}</span></p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {/* Property Details */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-blue-900">Property Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Property Address</p>
                <p className="font-semibold" data-testid="detail-property-address">{certificate.property_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Landlord Name</p>
                <p className="font-semibold" data-testid="detail-landlord-name">{certificate.landlord_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Landlord Contact</p>
                <p className="font-semibold" data-testid="detail-landlord-contact">{certificate.landlord_contact}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Engineer Details */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-blue-900">Engineer Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Engineer Name</p>
                <p className="font-semibold" data-testid="detail-engineer-name">{certificate.engineer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gas Safe ID</p>
                <p className="font-semibold" data-testid="detail-gas-safe-id">{certificate.gas_safe_id}</p>
              </div>
            </div>
            {certificate.engineer_signature && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Engineer Signature</p>
                <div className="border border-gray-300 p-2 inline-block rounded">
                  <img
                    src={certificate.engineer_signature}
                    alt="Engineer Signature"
                    className="max-h-24"
                    data-testid="detail-engineer-signature"
                  />
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Inspection Dates */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-blue-900">Inspection Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Inspection Date</p>
                <p className="font-semibold" data-testid="detail-inspection-date">{formatDate(certificate.inspection_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Inspection Due</p>
                <p className="font-semibold" data-testid="detail-next-inspection-due">{formatDate(certificate.next_inspection_due)}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Appliances */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-blue-900">Gas Appliances Inspected</h3>
            <div className="space-y-4">
              {certificate.appliances.map((appliance, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold">{appliance.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{appliance.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Make/Model</p>
                      <p className="font-semibold">{appliance.make_model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Condition</p>
                      <div>{getConditionBadge(appliance.condition)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Safety Checks */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-blue-900">Safety Checks</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Gas Tightness Test</span>
                <span className="font-semibold" data-testid="detail-gas-tightness">{certificate.safety_checks.gas_tightness}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Flue Condition</span>
                <span className="font-semibold" data-testid="detail-flue-condition">{certificate.safety_checks.flue_condition}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Ventilation</span>
                <span className="font-semibold" data-testid="detail-ventilation">{certificate.safety_checks.ventilation}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Gas Pressure</span>
                <span className="font-semibold" data-testid="detail-gas-pressure">{certificate.safety_checks.gas_pressure}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Burner Operation</span>
                <span className="font-semibold" data-testid="detail-burner-operation">{certificate.safety_checks.burner_operation}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Safety Devices</span>
                <span className="font-semibold" data-testid="detail-safety-devices">{certificate.safety_checks.safety_devices}</span>
              </div>
            </div>
          </div>
          
          {certificate.defects_actions && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 text-blue-900">Defects/Actions Required</h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="whitespace-pre-wrap" data-testid="detail-defects-actions">{certificate.defects_actions}</p>
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Compliance Statement */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <h3 className="font-bold mb-2 text-blue-900">Compliance Statement</h3>
            <p className="text-sm">{certificate.compliance_statement}</p>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
            <p>This certificate complies with the Gas Safety (Installation and Use) Regulations 1998</p>
            <p className="mt-2">Certificate issued: {formatDate(certificate.created_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateDetail;