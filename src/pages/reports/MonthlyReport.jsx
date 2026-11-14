import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { exportToExcel } from '../../utils/exportToExcel';
import { exportToPDF } from '../../utils/exportToPDF';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MonthlyReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reports/monthly');
        if (res.data?.success) setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch monthly report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getExportDataAndFooter = () => {
    const exportData = data.map(d => ({
      'Month': d.month_label,
      'Total Transactions': Number(d.total_transactions),
      'Total Revenue (Birr)': Number(d.total_revenue),
      'VAT Collected (Birr)': Number(d.total_vat_collected)
    }));

    const footerData = {
      preparedBy: `${user?.full_name || 'System User'} (${user?.role_name || 'Staff'})`,
      approvedBy: '________________________'
    };

    return { exportData, footerData };
  };

  const handleExportExcel = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToExcel(exportData, `Monthly_Sales_Report_${new Date().toISOString().split('T')[0]}`, footerData);
  };

  const handleExportPDF = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToPDF(exportData, `Monthly_Sales_Report_${new Date().toISOString().split('T')[0]}`, 'Monthly Sales Report', footerData);
  };

  const totalRevenue = data.reduce((s, m) => s + Number(m.total_revenue), 0);
  const totalSales = data.reduce((s, m) => s + Number(m.total_transactions), 0);
  const avgMonthly = data.length > 0 ? totalRevenue / data.length : 0;

  const chartData = data.map(d => ({
    ...d,
    revenue: Number(d.total_revenue)
  })).reverse(); // Reverse for chronological order

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Monthly Revenue Summary</h1>
          <p className="text-sm text-textMuted mt-1">Aggregated revenue and sales statistics</p>
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
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-secondary' },
          { label: 'Total Sales', value: `${totalSales} transactions`, color: 'text-primary' },
          { label: 'Avg Monthly Revenue', value: formatCurrency(avgMonthly), color: 'text-warning' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-sm text-textMuted mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-base font-semibold text-textMain mb-6">Monthly Revenue</h3>
        <div className="h-64">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-textMuted">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D3A" />
                <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ backgroundColor: '#151720', borderColor: '#2A2D3A', color: '#F3F4F6' }} formatter={v => formatCurrency(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Month</th>
                <th className="px-6 py-4 font-medium text-center">Transactions</th>
                <th className="px-6 py-4 font-medium text-right">Total Revenue</th>
                <th className="px-6 py-4 font-medium text-right">VAT Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-textMuted">Loading report...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-textMuted">No data available.</td></tr>
              ) : data.map((row, i) => (
                <tr key={i} className="hover:bg-surfaceHighlight/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-textMain">{row.month_label}</td>
                  <td className="px-6 py-4 text-center text-textMuted">{row.total_transactions}</td>
                  <td className="px-6 py-4 text-right text-secondary font-semibold">{formatCurrency(row.total_revenue)}</td>
                  <td className="px-6 py-4 text-right text-textMuted">{formatCurrency(row.total_vat_collected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
