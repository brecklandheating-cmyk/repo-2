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
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">
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
      
      <Card className="print:shadow-none print:border-2 print:border-gray-800">
        <CardHeader className="bg-blue-600 text-white print:bg-blue-600 print:py-3">
          <div className="text-center">
            <CardTitle className="text-2xl mb-1">CP12 Gas Safety Certificate</CardTitle>
            <p className="text-base">Landlord Gas Safety Record</p>
            <p className="text-sm mt-1">Serial Number: <span className="font-bold text-lg">{certificate.serial_number}</span></p>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 print:p-4">
          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 print:gap-4">
            {/* Left Column */}
            <div className="space-y-4 print:space-y-3">
              {/* Property Details */}
              <div className="border-b pb-3 print:pb-2">
                <h3 className="text-base font-bold mb-2 text-blue-900">Property Details</h3>
                <div className="space-y-2 print:space-y-1 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Property Address</p>
                    <p className="font-semibold" data-testid="detail-property-address">{certificate.property_address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-600">Landlord</p>
                      <p className="font-semibold" data-testid="detail-landlord-name">{certificate.landlord_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Contact</p>
                      <p className="font-semibold" data-testid="detail-landlord-contact">{certificate.landlord_contact}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Engineer Details */}
              <div className="border-b pb-3 print:pb-2">
                <h3 className="text-base font-bold mb-2 text-blue-900">Engineer Details</h3>
                <div className="space-y-2 print:space-y-1 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-600">Engineer</p>
                      <p className="font-semibold" data-testid="detail-engineer-name">{certificate.engineer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Gas Safe ID</p>
                      <p className="font-semibold" data-testid="detail-gas-safe-id">{certificate.gas_safe_id}</p>
                    </div>
                  </div>
                  {certificate.engineer_signature && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Signature</p>
                      <div className="border border-gray-300 p-1 inline-block rounded">
                        <img
                          src={certificate.engineer_signature}
                          alt="Engineer Signature"
                          className="max-h-12 print:max-h-10"
                          data-testid="detail-engineer-signature"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Inspection Dates */}
              <div className="border-b pb-3 print:pb-2">
                <h3 className="text-base font-bold mb-2 text-blue-900">Inspection Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Inspection Date</p>
                    <p className="font-semibold" data-testid="detail-inspection-date">{formatDate(certificate.inspection_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Next Due</p>
                    <p className="font-semibold" data-testid="detail-next-inspection-due">{formatDate(certificate.next_inspection_due)}</p>
                  </div>
                </div>
              </div>
              
              {/* Safety Checks */}
              <div>
                <h3 className="text-base font-bold mb-2 text-blue-900">Safety Checks</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                    <span>Gas Tightness Test</span>
                    <span className="font-semibold" data-testid="detail-gas-tightness">{certificate.safety_checks.gas_tightness}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                    <span>Flue Condition</span>
                    <span className="font-semibold" data-testid="detail-flue-condition">{certificate.safety_checks.flue_condition}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                    <span>Ventilation</span>
                    <span className="font-semibold" data-testid="detail-ventilation">{certificate.safety_checks.ventilation}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                    <span>Gas Pressure</span>
                    <span className="font-semibold" data-testid="detail-gas-pressure">{certificate.safety_checks.gas_pressure}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                    <span>Burner Operation</span>
                    <span className="font-semibold" data-testid="detail-burner-operation">{certificate.safety_checks.burner_operation}</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded">
                    <span>Safety Devices</span>
                    <span className="font-semibold" data-testid="detail-safety-devices">{certificate.safety_checks.safety_devices}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4 print:space-y-3">
              {/* Appliances */}
              <div>
                <h3 className="text-base font-bold mb-2 text-blue-900">Gas Appliances Inspected</h3>
                <div className="space-y-2 print:space-y-1.5">
                  {certificate.appliances.map((appliance, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold ml-1">{appliance.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold ml-1">{appliance.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Make/Model:</span>
                          <span className="font-semibold ml-1">{appliance.make_model}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <span className="ml-1">{getConditionBadge(appliance.condition)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Defects/Actions */}
              {certificate.defects_actions && (
                <div>
                  <h3 className="text-base font-bold mb-2 text-blue-900">Defects/Actions Required</h3>
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="whitespace-pre-wrap" data-testid="detail-defects-actions">{certificate.defects_actions}</p>
                  </div>
                </div>
              )}
              
              {/* Compliance Statement */}
              <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                <h3 className="text-sm font-bold mb-1 text-blue-900">Compliance Statement</h3>
                <p className="text-xs">{certificate.compliance_statement}</p>
              </div>
              
              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-2 border-t">
                <p>This certificate complies with the Gas Safety (Installation and Use) Regulations 1998</p>
                <p className="mt-1">Certificate issued: {formatDate(certificate.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateDetail;