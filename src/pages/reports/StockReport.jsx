import React, { useState, useEffect } from 'react';
import { Download, Search, AlertTriangle, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { exportToExcel } from '../../utils/exportToExcel';
import { exportToPDF } from '../../utils/exportToPDF';
import clsx from 'clsx';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StockReport = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reports/stock');
        if (res.data?.success) setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stock report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getExportDataAndFooter = () => {
    const exportData = filtered.map(d => ({
      'Product Name': d.product_name,
      'SKU': d.sku,
      'Category': d.category_name || 'N/A',
      'Stock Quantity': Number(d.stock_quantity),
      'Minimum Stock': Number(d.minimum_stock),
      'Unit Price (Birr)': Number(d.selling_price),
      'Stock Value (Birr)': Number(d.stock_value),
      'Status': d.stock_status.replace('_', ' ').toUpperCase()
    }));

    const footerData = {
      preparedBy: `${user?.full_name || 'System User'} (${user?.role_name || 'Staff'})`,
      approvedBy: '________________________'
    };

    return { exportData, footerData };
  };

  const handleExportExcel = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToExcel(exportData, `Stock_Report_${new Date().toISOString().split('T')[0]}`, footerData);
  };

  const handleExportPDF = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToPDF(exportData, `Stock_Report_${new Date().toISOString().split('T')[0]}`, 'Stock Level Report', footerData);
  };

  const filtered = data.filter(p => {
    const searchLower = search.toLowerCase();
    const matchSearch = String(p.product_name || '').toLowerCase().includes(searchLower) ||
      String(p.sku || '').toLowerCase().includes(searchLower);
    const matchFilter = filter === 'all'
      ? true
      : (filter === 'low' ? p.stock_quantity <= p.minimum_stock : p.stock_quantity > p.minimum_stock);
    return matchSearch && matchFilter;
  });

  const totalValue = data.reduce((s, p) => s + Number(p.stock_value), 0);
  const lowStockCount = data.filter(p => p.stock_quantity <= p.minimum_stock).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Stock Level Report</h1>
          <p className="text-sm text-textMuted mt-1">Current inventory status and valuation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /><span>Export Excel</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center space-x-2 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" /><span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: data.length, color: 'text-primary' },
          { label: 'Low Stock Items', value: `${lowStockCount} items`, color: 'text-warning' },
          { label: 'Total Stock Value', value: formatCurrency(totalValue), color: 'text-secondary' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-sm text-textMuted mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input type="text" placeholder="Search by product or SKU..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div className="flex bg-background rounded-lg border border-border overflow-hidden text-sm">
          {[['all', 'All'], ['low', '⚠ Low Stock'], ['ok', '✓ OK']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} className={clsx('px-4 py-2 font-medium transition-colors', filter === val ? 'bg-surfaceHighlight text-textMain' : 'text-textMuted hover:text-textMain')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product / SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Current Stock</th>
                <th className="px-6 py-4 font-medium text-center">Min. Level</th>
                <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                <th className="px-6 py-4 font-medium text-right">Stock Value</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-textMuted">Loading report...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-textMuted">No products match your criteria.</td></tr>
              ) : filtered.map((p, i) => {
                const isLow = p.stock_quantity <= p.minimum_stock;
                return (
                  <tr key={i} className="hover:bg-surfaceHighlight/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-textMain">{p.product_name}</p>
                      <p className="text-xs text-textMuted">{p.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-textMuted">{p.category_name || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx('font-bold text-base', isLow ? 'text-danger' : 'text-secondary')}>{p.stock_quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-textMuted">{p.minimum_stock}</td>
                    <td className="px-6 py-4 text-right text-textMuted">{formatCurrency(p.selling_price)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-textMain">{formatCurrency(p.stock_value)}</td>
                    <td className="px-6 py-4 text-center">
                      {isLow ? (
                        <span className="flex items-center justify-center space-x-1 text-warning text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /><span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="text-secondary text-xs font-medium">In Stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockReport;
