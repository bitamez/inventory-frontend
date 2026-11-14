import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PackageSearch, AlertCircle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, highlightClass, loading }) => (
  <div className="bg-surface p-6 rounded-2xl border border-border flex items-center justify-between hover:border-surfaceHighlight transition-colors">
    <div>
      <p className="text-textMuted text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-textMain">{loading ? '—' : value}</h3>
      <p className={clsx("text-xs mt-2", highlightClass)}>{subtext}</p>
    </div>
    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center", colorClass)}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const isManager = user?.role_name === 'Admin' || user?.role_name === 'Manager';

  const [sales, setSales] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, stockRes] = await Promise.all([
          api.get('/sales'),
          api.get('/reports/stock'),
        ]);
        if (salesRes.data?.success) setSales(salesRes.data.data || []);
        if (stockRes.data?.success) {
          const low = (stockRes.data.data || []).filter(p => p.stock_status !== 'in_stock');
          setLowStock(low);
        }
        if (isManager) {
          const appRes = await api.get('/approvals');
          if (appRes.data?.success) setApprovals(appRes.data.data || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isManager]);

  const todaySales = sales.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.created_at).toDateString() === today;
  });

  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const monthTotal = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const pendingCount = approvals.filter(a => a.approval_status === 'pending').length;
  const recentSales = sales.slice(0, 5);

  const salesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayTotal = sales
      .filter(s => new Date(s.created_at).toDateString() === d.toDateString())
      .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
    return { name: dayLabel, sales: dayTotal };
  });

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales (Today)"
          value={`${todayTotal.toLocaleString()} Birr`}
          subtext={`${todaySales.length} transaction(s) today`}
          icon={DollarSign}
          colorClass="bg-blue-500/10 text-blue-500"
          highlightClass="text-secondary"
          loading={loading}
        />
        <StatCard
          title="Total Sales (This Month)"
          value={`${monthTotal.toLocaleString()} Birr`}
          subtext={`${sales.length} total transaction(s)`}
          icon={TrendingUp}
          colorClass="bg-secondary/10 text-secondary"
          highlightClass="text-secondary"
          loading={loading}
        />
        <StatCard
          title="Low Stock Items"
          value={`${lowStock.length} Items`}
          subtext={lowStock.length > 0 ? "Need attention" : "Stock levels OK"}
          icon={PackageSearch}
          colorClass="bg-warning/10 text-warning"
          highlightClass={lowStock.length > 0 ? "text-warning" : "text-secondary"}
          loading={loading}
        />
        {isManager && (
          <StatCard
            title="Pending Approvals"
            value={`${pendingCount} Transactions`}
            subtext={pendingCount > 0 ? "Requires your action" : "All caught up"}
            icon={AlertCircle}
            colorClass="bg-primary/10 text-primary"
            highlightClass={pendingCount > 0 ? "text-danger" : "text-secondary"}
            loading={loading}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table */}
        <div className="bg-surface border border-border rounded-2xl lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-textMain">Recent Sales</h3>
            <Link to="/sales" className="text-xs text-textMuted hover:text-primary transition-colors">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-textMuted bg-surfaceHighlight/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-textMuted">Loading...</td></tr>
                ) : recentSales.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-textMuted">No sales yet.</td></tr>
                ) : recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                    <td className="px-6 py-4 text-textMain font-medium">{sale.invoice_number}</td>
                    <td className="px-6 py-4 text-textMain">{sale.customer_name}</td>
                    <td className="px-6 py-4 text-textMuted">{new Date(sale.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-textMain font-medium text-right">{Number(sale.total_amount).toLocaleString()} Birr</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "px-2.5 py-1 text-xs font-medium rounded-full border",
                        sale.status === 'completed' ? "text-secondary border-secondary/20 bg-secondary/10" :
                        sale.status === 'rejected' ? "text-danger border-danger/20 bg-danger/10" :
                        "text-warning border-warning/20 bg-warning/10"
                      )}>
                        {sale.status === 'pending_approval' ? 'Pending Approval' : sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-textMain">Low Stock Alert</h3>
            <Link to="/products" className="text-xs text-textMuted hover:text-primary transition-colors">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-textMuted bg-surfaceHighlight/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr><td colSpan="3" className="px-6 py-12 text-center text-textMuted">Loading...</td></tr>
                ) : lowStock.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-secondary">✓ All stock levels OK</td></tr>
                ) : lowStock.slice(0, 6).map((item, i) => (
                  <tr key={i} className="hover:bg-surfaceHighlight/30 transition-colors">
                    <td className="px-6 py-4 text-textMain">{item.product_name}</td>
                    <td className="px-6 py-4 text-textMuted">{item.sku}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-danger font-medium">{item.stock_quantity}</span>
                      <span className="text-textMuted text-xs"> / {item.minimum_stock}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-textMain mb-6">
          Sales Overview <span className="text-sm font-normal text-textMuted">(Last 7 Days)</span>
        </h3>
        <div className="h-64" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ae7107ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9d6709ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D3A" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(val) => `${(val/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#151720', borderColor: '#2A2D3A', color: '#F3F4F6' }}
                formatter={(val) => [`${Number(val).toLocaleString()} Birr`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
