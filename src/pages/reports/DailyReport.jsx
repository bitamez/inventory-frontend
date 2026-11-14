import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { exportToExcel } from '../../utils/exportToExcel';
import { exportToPDF } from '../../utils/exportToPDF';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DailyReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reports/daily');
        if (res.data?.success) setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch daily report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getExportDataAndFooter = () => {
    const exportData = data.map(d => ({
      'Sale Date': new Date(d.sale_date).toLocaleDateString(),
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
    exportToExcel(exportData, `Daily_Sales_Report_${new Date().toISOString().split('T')[0]}`, footerData);
  };

  const handleExportPDF = () => {
    const { exportData, footerData } = getExportDataAndFooter();
    exportToPDF(exportData, `Daily_Sales_Report_${new Date().toISOString().split('T')[0]}`, 'Daily Sales Report', footerData);
  };

  const totalRevenue = data.reduce((s, d) => s + Number(d.total_revenue), 0);
  const totalSales = data.reduce((s, d) => s + Number(d.total_transactions), 0);
  const totalVat = data.reduce((s, d) => s + Number(d.total_vat_collected), 0);

  // Format data for chart
  const chartData = data.map(d => ({
    ...d,
    sale_date_formatted: new Date(d.sale_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    revenue: Number(d.total_revenue)
  })).reverse(); // Reverse to show chronological order left to right

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Daily Sales Report</h1>
          <p className="text-sm text-textMuted mt-1">Transaction summary over recent days</p>
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
          { label: 'Total VAT Collected', value: formatCurrency(totalVat), color: 'text-warning' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-sm text-textMuted mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-base font-semibold text-textMain mb-6">Revenue Trend</h3>
        <div className="h-64">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-textMuted">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D3A" />
                <XAxis dataKey="sale_date_formatted" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ backgroundColor: '#151720', borderColor: '#2A2D3A', color: '#F3F4F6' }} formatter={(val) => formatCurrency(val)} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-center">Transactions</th>
                <th className="px-6 py-4 font-medium text-right">Revenue</th>
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
                  <td className="px-6 py-4 font-medium text-textMain">{new Date(row.sale_date).toLocaleDateString()}</td>
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

export default DailyReport;
