import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, ClipboardList, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalInvoices: 0,
    totalEstimates: 0,
    unpaidInvoices: 0,
    totalRevenue: 0,
    pendingEstimates: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, invoicesRes, estimatesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/customers`),
        axios.get(`${API}/invoices`),
        axios.get(`${API}/estimates`),
        axios.get(`${API}/settings`)
      ]);

      const customers = customersRes.data;
      const invoices = invoicesRes.data;
      const estimates = estimatesRes.data;

      const unpaid = invoices.filter(inv => inv.status === 'unpaid').length;
      const totalRev = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
      const pending = estimates.filter(est => est.status === 'pending').length;

      setStats({
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
        totalEstimates: estimates.length,
        unpaidInvoices: unpaid,
        totalRevenue: totalRev,
        pendingEstimates: pending
      });

      setRecentInvoices(invoices.slice(0, 5));
      setSettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      testId: 'total-customers-stat'
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
      testId: 'total-invoices-stat'
    },
    {
      title: 'Unpaid Invoices',
      value: stats.unpaidInvoices,
      icon: AlertCircle,
      color: 'from-amber-500 to-amber-600',
      testId: 'unpaid-invoices-stat'
    },
    {
      title: 'Total Revenue',
      value: `£${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      testId: 'total-revenue-stat'
    },
    {
      title: 'Total Estimates',
      value: stats.totalEstimates,
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      testId: 'total-estimates-stat'
    },
    {
      title: 'Pending Estimates',
      value: stats.pendingEstimates,
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600',
      testId: 'pending-estimates-stat'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard">
      {/* Company Header Card */}
      {settings && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {settings.logo && (
                <img
                  src={settings.logo}
                  alt={settings.company_name}
                  className="h-20 w-auto object-contain"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                  {settings.company_name}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                  {settings.address && <p className="flex items-center gap-2">📍 {settings.address}</p>}
                  {settings.phone && <p className="flex items-center gap-2">📞 {settings.phone}</p>}
                  {settings.email && <p className="flex items-center gap-2">✉️ {settings.email}</p>}
                  {settings.vat_number && <p className="flex items-center gap-2">VAT: {settings.vat_number}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Dashboard
        </h1>
        <p className="text-slate-600">Welcome to Breckland Heating invoicing system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-lg card-hover overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900" data-testid={stat.testId}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk' }}>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No invoices yet</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-semibold text-blue-600">{invoice.invoice_number}</td>
                      <td>{invoice.customer_name}</td>
                      <td className="font-semibold">£{invoice.total.toFixed(2)}</td>
                      <td>
                        <span className={invoice.status === 'paid' ? 'status-paid' : 'status-unpaid'}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>{new Date(invoice.issue_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;