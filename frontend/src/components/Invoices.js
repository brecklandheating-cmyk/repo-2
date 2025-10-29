import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, FileText, Eye, Trash2, Search, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [],
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    vat_rate: 20
  });
  const [currentItem, setCurrentItem] = useState({
    service_id: '',
    quantity: 1,
    price: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, invoices]);

  const fetchData = async () => {
    try {
      const [invoicesRes, customersRes, servicesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/invoices`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/services`),
        axios.get(`${API}/settings`)
      ]);
      setInvoices(invoicesRes.data);
      setFilteredInvoices(invoicesRes.data);
      setCustomers(customersRes.data);
      setServices(servicesRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    if (!searchTerm) {
      setFilteredInvoices(invoices);
      return;
    }
    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  };

  const addItem = () => {
    if (!currentItem.service_id) {
      toast.error('Please select a service');
      return;
    }
    const service = services.find((s) => s.id === currentItem.service_id);
    const price = currentItem.price || service.price;
    const total = currentItem.quantity * price;

    const item = {
      service_id: service.id,
      service_name: service.name,
      description: service.description,
      quantity: currentItem.quantity,
      price: price,
      total: total
    };

    setFormData({ ...formData, items: [...formData.items, item] });
    setCurrentItem({ service_id: '', quantity: 1, price: 0 });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      const data = {
        ...formData,
        issue_date: new Date(formData.issue_date).toISOString(),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        vat_rate: parseFloat(formData.vat_rate)
      };
      await axios.post(`${API}/invoices`, data);
      toast.success('Invoice created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/invoices/${id}/status?status=${status}`);
      toast.success(`Invoice marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await axios.delete(`${API}/invoices/${id}`);
      toast.success('Invoice deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      items: [],
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: '',
      vat_rate: 20
    });
    setCurrentItem({ service_id: '', quantity: 1, price: 0 });
  };

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="invoices-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Invoices
          </h1>
          <p className="text-slate-600">Create and manage customer invoices</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
          data-testid="create-invoice-button"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by invoice number or customer name..."
              data-testid="search-invoices-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk' }}>
            All Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No invoices found</p>
              <p className="text-slate-400 text-sm mt-2">Create your first invoice to get started</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Issue Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-semibold text-blue-600">{invoice.invoice_number}</td>
                      <td>{invoice.customer_name}</td>
                      <td>{new Date(invoice.issue_date).toLocaleDateString()}</td>
                      <td className="font-semibold">£{invoice.total.toFixed(2)}</td>
                      <td>
                        <span className={invoice.status === 'paid' ? 'status-paid' : 'status-unpaid'}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewInvoice(invoice)}
                            data-testid={`view-invoice-${invoice.id}`}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {invoice.status === 'unpaid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(invoice.id, 'paid')}
                              data-testid={`mark-paid-${invoice.id}`}
                              className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {invoice.status === 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(invoice.id, 'unpaid')}
                              data-testid={`mark-unpaid-${invoice.id}`}
                              className="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(invoice.id)}
                            data-testid={`delete-invoice-${invoice.id}`}
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

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Add invoice items and details to generate a new invoice for your customer
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <ErrorBoundary>
                  <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
                    <SelectTrigger data-testid="invoice-customer-select">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers && customers.length > 0 ? (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.customer_number})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-slate-500">No customers available</div>
                      )}
                    </SelectContent>
                  </Select>
                </ErrorBoundary>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                <Input
                  id="vat_rate"
                  data-testid="invoice-vat-rate-input"
                  type="number"
                  step="0.01"
                  value={formData.vat_rate}
                  onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input
                  id="issue_date"
                  data-testid="invoice-issue-date-input"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  data-testid="invoice-due-date-input"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            {/* Add Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Invoice Items</h3>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <ErrorBoundary>
                    <Select value={currentItem.service_id} onValueChange={(value) => {
                      const service = services.find(s => s.id === value);
                      setCurrentItem({ ...currentItem, service_id: value, price: service?.price || 0 });
                    }}>
                      <SelectTrigger data-testid="invoice-service-select">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services && services.length > 0 ? (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} (£{service.price.toFixed(2)})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-slate-500">No services available</div>
                        )}
                      </SelectContent>
                    </Select>
                  </ErrorBoundary>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    data-testid="invoice-item-quantity-input"
                    placeholder="Qty"
                    min="1"
                    step="0.01"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 1 })}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    data-testid="invoice-item-price-input"
                    placeholder="Price"
                    step="0.01"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-2">
                  <Button type="button" onClick={addItem} data-testid="add-invoice-item-button" className="w-full bg-blue-600 hover:bg-blue-700">
                    Add
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 bg-slate-50">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{item.service_name}</p>
                        <p className="text-sm text-slate-600">
                          Qty: {item.quantity} × £{item.price.toFixed(2)} = £{item.total.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeItem(index)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-3 border-t mt-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>£{formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VAT ({formData.vat_rate}%):</span>
                      <span>£{(formData.items.reduce((sum, item) => sum + item.total, 0) * (formData.vat_rate / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total:</span>
                      <span>£{(formData.items.reduce((sum, item) => sum + item.total, 0) * (1 + formData.vat_rate / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                data-testid="invoice-notes-input"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Additional notes or payment terms..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" data-testid="save-invoice-button" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Create Invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      {selectedInvoice && settings && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                View complete invoice information and line items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Company Header */}
              <div className="border-b pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {settings.logo && (
                      <img
                        src={settings.logo}
                        alt={settings.company_name}
                        className="h-16 w-auto object-contain"
                      />
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
                        <div className="flex gap-4">
                          {settings.registration_number && <p>Company Reg: {settings.registration_number}</p>}
                          {settings.vat_number && <p>VAT: {settings.vat_number}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Invoice Number</p>
                  <p className="font-semibold text-lg">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <span className={selectedInvoice.status === 'paid' ? 'status-paid' : 'status-unpaid'}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-medium">{selectedInvoice.customer_name}</p>
                  <p className="text-sm text-slate-500">{selectedInvoice.customer_address}</p>
                  <p className="text-sm text-slate-500">{selectedInvoice.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Issue Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.issue_date).toLocaleDateString()}</p>
                  {selectedInvoice.due_date && (
                    <>
                      <p className="text-sm text-slate-600 mt-2">Due Date</p>
                      <p className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.service_name}</p>
                        {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {item.quantity} × £{item.price.toFixed(2)}
                        </p>
                        <p className="font-semibold">£{item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>£{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>VAT ({selectedInvoice.vat_rate}%):</span>
                  <span>£{selectedInvoice.vat_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span>£{selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Notes</p>
                  <p className="text-slate-700">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Bank Details */}
              {(settings.bank_name || settings.account_number || settings.sort_code) && (
                <div className="border-t pt-4 bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    {settings.bank_name && (
                      <div>
                        <span className="font-medium">Bank:</span> {settings.bank_name}
                      </div>
                    )}
                    {settings.account_number && (
                      <div>
                        <span className="font-medium">Account:</span> {settings.account_number}
                      </div>
                    )}
                    {settings.sort_code && (
                      <div>
                        <span className="font-medium">Sort Code:</span> {settings.sort_code}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Invoices;