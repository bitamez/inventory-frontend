import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Download, FileText } from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportToExcel';
import { exportToPDF } from '../../utils/exportToPDF';
import { useAuth } from '../../context/AuthContext';

const statusStyle = (status) => {
  switch (status) {
    case 'completed': return 'text-secondary border-secondary/20 bg-secondary/10';
    case 'pending_approval': return 'text-warning border-warning/20 bg-warning/10';
    case 'rejected': return 'text-danger border-danger/20 bg-danger/10';
    default: return 'text-textMuted border-border bg-background';
  }
};

const statusLabel = (status) => {
  if (status === 'pending_approval') return 'Pending Approval';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const SalesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get('/sales');
        if (res.data?.success) setSales(res.data.data || []);
      } catch (err) {
        console.error('Failed to load sales:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filtered = sales.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = String(s.invoice_number || '').toLowerCase().includes(searchLower) ||
      String(s.customer_name || '').toLowerCase().includes(searchLower);
    const matchStatus = filterStatus === 'all' ? true : s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getExportDataAndFooter = () => {
    const exportData = filtered.map(s => ({
      'Invoice #': s.invoice_number,
      'Customer': s.customer_name,
      'Date': new Date(s.created_at).toLocaleDateString(),
      'Total Amount (Birr)': Number(s.total_amount),
      'Status': statusLabel(s.status)
    }));

    const footerData = {
      preparedBy: `${user?.full_name || 'System User'} (${user?.role_name || 'Staff'})`,
      approvedBy: '________________________'
    };

    return { exportData, footerData };
  };

  const handleExportExcel = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToExcel(exportData, `Sales_Transactions_${new Date().toISOString().split('T')[0]}`, footerData);
  };

  const handleExportPDF = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToPDF(exportData, `Sales_Transactions_${new Date().toISOString().split('T')[0]}`, 'Sales Transactions Report', footerData);
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-textMain">Sales Transactions</h1>
          <p className="text-sm text-textMuted mt-1">Manage and track your sales invoices</p>
        </div>
        <button onClick={() => navigate('/sales/new')} className="w-full sm:w-auto bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by invoice or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-background border border-border rounded-lg text-sm text-textMain focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={handleExportExcel} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm text-textMain hover:bg-surfaceHighlight transition-colors">
            <Download className="w-4 h-4" /><span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Excel</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/90 text-white border border-secondary rounded-lg text-sm transition-colors">
            <FileText className="w-4 h-4" /><span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted">Loading sales...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted">
                  {sales.length === 0 ? 'No sales yet. Click "New Sale" to record your first transaction.' : 'No records match your search.'}
                </td></tr>
              ) : filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{sale.invoice_number}</td>
                  <td className="px-6 py-4 text-textMain">{sale.customer_name}</td>
                  <td className="px-6 py-4 text-textMuted">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-textMain font-medium text-right">{Number(sale.total_amount).toLocaleString()} Birr</td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("px-2.5 py-1 text-xs font-medium rounded-full border", statusStyle(sale.status))}>
                      {statusLabel(sale.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/sales/invoice/${sale.id}`)} className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="View Invoice">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border mt-auto flex items-center justify-between text-sm text-textMuted bg-background/50">
          <p>Showing {filtered.length} of {sales.length} records</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
