import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CertificateRegistry = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  useEffect(() => {
    // Filter certificates based on search term
    if (searchTerm) {
      const filtered = certificates.filter(cert => 
        cert.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.landlord_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.engineer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCertificates(filtered);
    } else {
      setFilteredCertificates(certificates);
    }
  }, [searchTerm, certificates]);
  
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/certificates`);
      setCertificates(response.data);
      setFilteredCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (certificateId, serialNumber) => {
    if (!window.confirm(`Are you sure you want to delete certificate ${serialNumber}?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API}/certificates/${certificateId}`);
      toast({
        title: 'Success',
        description: 'Certificate deleted successfully'
      });
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete certificate',
        variant: 'destructive'
      });
    }
  };
  
  const getStatusBadge = (cert) => {
    // Check if any appliance failed or is at risk
    const hasFailedAppliance = cert.appliances.some(app => 
      app.condition === 'Fail' || app.condition === 'At Risk'
    );
    
    if (hasFailedAppliance) {
      return <Badge variant="destructive" data-testid="status-badge-fail">Attention Required</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600" data-testid="status-badge-pass">Pass</Badge>;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">CP12 Certificate Registry</CardTitle>
              <p className="text-gray-500 mt-2">Manage all gas safety certificates</p>
            </div>
            <Button
              onClick={() => navigate('/certificates/new')}
              data-testid="create-new-certificate-btn"
              className="w-full md:w-auto"
            >
              + Create New Certificate
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by serial number, address, landlord, or engineer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-certificates-input"
              className="max-w-md"
            />
          </div>
          
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No certificates found matching your search.' : 'No certificates yet. Create your first one!'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate('/certificates/new')}
                  className="mt-4"
                  data-testid="create-first-certificate-btn"
                >
                  Create First Certificate
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Property Address</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Inspection Date</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id} data-testid={`certificate-row-${cert.serial_number}`}>
                      <TableCell className="font-semibold">{cert.serial_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{cert.property_address}</TableCell>
                      <TableCell>{cert.landlord_name}</TableCell>
                      <TableCell>{cert.engineer_name}</TableCell>
                      <TableCell>{formatDate(cert.inspection_date)}</TableCell>
                      <TableCell>{formatDate(cert.next_inspection_due)}</TableCell>
                      <TableCell>{getStatusBadge(cert)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/certificates/${cert.id}`)}
                            data-testid={`view-certificate-${cert.serial_number}-btn`}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/certificates/${cert.id}/edit`)}
                            data-testid={`edit-certificate-${cert.serial_number}-btn`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cert.id, cert.serial_number)}
                            data-testid={`delete-certificate-${cert.serial_number}-btn`}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateRegistry;