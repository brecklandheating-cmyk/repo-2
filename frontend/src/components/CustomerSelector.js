import { useState, useEffect } from 'react';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerSelector = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customerId) => {
    if (customerId === 'manual') {
      onCustomerSelect(null);
      return;
    }
    
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      onCustomerSelect(customer);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 mb-4">
      <Label className="flex items-center gap-2 mb-2 text-blue-900 font-semibold">
        <Users className="w-4 h-4" />
        Quick Select from Customer Database
      </Label>
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Select a customer to auto-fill details..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">
            <span className="text-slate-500 italic">Enter details manually</span>
          </SelectItem>
          {loading ? (
            <SelectItem value="loading" disabled>Loading customers...</SelectItem>
          ) : customers.length === 0 ? (
            <SelectItem value="empty" disabled>No customers found</SelectItem>
          ) : (
            customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-xs text-slate-500">{customer.email || customer.phone}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-blue-700 mt-2">
        Select a customer to automatically fill in their details, or enter manually below.
      </p>
    </div>
  );
};

export default CustomerSelector;
