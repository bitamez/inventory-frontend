import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, PackageSearch, Download, Calendar, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const GOLD    = '#F59E0B';
const GREEN   = '#10B981';
const SURFACE = '#151720';
const BORDER  = '#2A2D3A';
const MUTED   = '#9CA3AF';
const TEXT    = '#F3F4F6';

const ReportCard = ({ title, icon: Icon, description, onClick, badge }) => (
  <div
    onClick={onClick}
    className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full hover:shadow-lg"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-textMuted group-hover:text-primary group-hover:border-primary/30 transition-all">
        <Icon className="w-6 h-6" />
      </div>
      {badge && (
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-lg font-semibold text-textMain mb-2">{title}</h3>
    <p className="text-sm text-textMuted mb-6 flex-1">{description}</p>
    <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1 transition-colors">
      View Report →
    </span>
  </div>
);

const ReportsPage = () => {
  const navigate = useNavigate();
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [year, setYear]                 = useState(new Date().getFullYear());

  const fetchData = async (selectedYear) => {
    setLoading(true);
    try {
      const [yearlyRes, topRes] = await Promise.all([
        api.get(`/reports/yearly?year=${selectedYear}`),
        api.get('/reports/top-products?limit=6'),
      ]);
      if (yearlyRes.data?.success) setMonthlySales(yearlyRes.data.data || []);
      if (topRes.data?.success)   setTopProducts(topRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(year); }, [year]);

  const totalRevenue = monthlySales.reduce((s, d) => s + Number(d.revenue), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Analytics &amp; Reports</h1>
          <p className="text-sm text-textMuted mt-1">Monitor system performance and download statistical reports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface border border-border rounded-lg p-1 text-sm">
            {[new Date().getFullYear() - 1, new Date().getFullYear()].map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  year === y ? 'bg-primary text-black' : 'text-textMuted hover:text-textMain'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(year)}
            className="p-2 rounded-lg bg-surface border border-border text-textMuted hover:text-primary hover:border-primary/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: `Total Revenue (${year})`, value: loading ? '...' : formatCurrency(totalRevenue), color: 'text-primary' },
          { label: 'Active Months', value: loading ? '...' : `${monthlySales.length} months`, color: 'text-secondary' },
          { label: 'Top Product', value: loading || !topProducts[0] ? '...' : topProducts[0].product_name, color: 'text-warning' },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-sm text-textMuted mb-1">{s.label}</p>
            <p className={`text-xl font-bold truncate ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Daily Sales Report"
          description="Detailed breakdown of all completed sales transactions grouped by day (last 30 days)."
          icon={Calendar}
          badge="Live"
          onClick={() => navigate('/reports/daily')}
        />
        <ReportCard
          title="Monthly Revenue Summary"
          description="Aggregated total sales, discounts, and VAT collected on a monthly basis."
          icon={TrendingUp}
          onClick={() => navigate('/reports/monthly')}
        />
        <ReportCard
          title="Current Stock Status"
          description="Real-time snapshot of current inventory levels, highlighting low-stock and out-of-stock items."
          icon={PackageSearch}
          badge="Real-time"
          onClick={() => navigate('/reports/stock')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-textMain">
              Revenue Growth <span className="text-sm font-normal text-textMuted">({year})</span>
            </h3>
            {loading && <RefreshCw className="w-4 h-4 text-textMuted animate-spin" />}
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">Loading chart...</div>
            ) : monthlySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">No revenue data for {year}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BORDER} />
                  <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: SURFACE, borderColor: BORDER, color: TEXT }}
                    formatter={val => [formatCurrency(Number(val)), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-textMain">Top Performing Products</h3>
            {loading && <RefreshCw className="w-4 h-4 text-textMuted animate-spin" />}
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">Loading chart...</div>
            ) : topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">No completed sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts.map(p => ({ name: p.product_name, value: Number(p.total_revenue) }))}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={BORDER} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: TEXT, fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: SURFACE, borderColor: BORDER, color: TEXT }}
                    formatter={val => [formatCurrency(Number(val)), 'Revenue']}
                    cursor={{ fill: '#1E212B' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? GOLD : GREEN} fillOpacity={1 - i * 0.1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
