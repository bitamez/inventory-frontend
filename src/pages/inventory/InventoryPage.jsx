import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, AlertTriangle, TrendingDown, DollarSign,
  Search, Download, RefreshCw, Eye, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { exportToExcel } from '../../utils/exportToExcel';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-surface border border-border rounded-2xl p-6 flex items-start space-x-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-textMuted">{label}</p>
      <p className="text-2xl font-bold text-textMain mt-0.5">{value}</p>
      {sub && <p className="text-xs text-textMuted mt-1">{sub}</p>}
    </div>
  </div>
);

const InventoryPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out | ok
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, txRes] = await Promise.all([
        api.get('/products'),
        api.get('/stock'),
      ]);
      if (prodRes.data?.success) setProducts(prodRes.data.data || []);
      if (txRes.data?.success) setTransactions(txRes.data.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Derived stats
  const totalValue = products.reduce((s, p) => s + Number(p.stock_quantity) * Number(p.selling_price), 0);
  const lowStockItems = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock);
  const outOfStockItems = products.filter(p => p.stock_quantity === 0);
  const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

  // Recent transactions per product (last 3)
  const txByProduct = {};
  transactions.forEach(tx => {
    if (!txByProduct[tx.product_id]) txByProduct[tx.product_id] = [];
    if (txByProduct[tx.product_id].length < 3) txByProduct[tx.product_id].push(tx);
  });

  // Filter products
  const filtered = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = String(p.product_name || '').toLowerCase().includes(q) ||
      String(p.sku || '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || p.category_name === categoryFilter;
    const matchStatus =
      filter === 'all' ? true :
        filter === 'out' ? p.stock_quantity === 0 :
          filter === 'low' ? (p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock) :
            p.stock_quantity > p.minimum_stock;
    return matchSearch && matchCat && matchStatus;
  });

  const handleExport = () => {
    const data = filtered.map(p => ({
      'Product Name': p.product_name,
      'SKU': p.sku,
      'Category': p.category_name || '—',
      'Current Stock': Number(p.stock_quantity),
      'Min. Stock Level': Number(p.minimum_stock),
      'Unit Price (Birr)': Number(p.selling_price),
      'Stock Value (Birr)': Number(p.stock_quantity) * Number(p.selling_price),
      'Status': p.stock_quantity === 0 ? 'OUT OF STOCK' : p.stock_quantity <= p.minimum_stock ? 'LOW STOCK' : 'OK',
    }));
    exportToExcel(data, `Inventory_Report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Inventory Overview</h1>
          <p className="text-sm text-textMuted mt-1">Real-time stock levels and movement history</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchData} className="flex items-center space-x-2 px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-textMain hover:bg-surfaceHighlight transition-colors">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            <span>Refresh</span>
          </button>
          <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /><span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Products" value={loading ? '...' : products.length} sub={`${categories.length} categories`} color="bg-primary/10 text-primary" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={loading ? '...' : lowStockItems.length} sub="Below minimum level" color="bg-warning/10 text-warning" />
        <StatCard icon={TrendingDown} label="Out of Stock" value={loading ? '...' : outOfStockItems.length} sub="Needs immediate restock" color="bg-danger/10 text-danger" />
        <StatCard icon={DollarSign} label="Total Stock Value" value={loading ? '...' : formatCurrency(totalValue)} sub="Based on selling price" color="bg-secondary/10 text-secondary" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input type="text" placeholder="Search by product name or SKU..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-textMain focus:outline-none focus:border-primary transition-colors cursor-pointer">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {[['all', 'All'], ['ok', 'In Stock'], ['low', '⚠ Low'], ['out', '✕ Out']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={clsx('px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                filter === val ? 'bg-primary text-white border-primary' : 'bg-background border-border text-textMuted hover:bg-surfaceHighlight')}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product / SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Stock Level</th>
                <th className="px-6 py-4 font-medium text-center">Min. Level</th>
                <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                <th className="px-6 py-4 font-medium text-right">Stock Value</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Recent Movements</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="9" className="px-6 py-16 text-center text-textMuted">Loading inventory...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" className="px-6 py-16 text-center text-textMuted">No products match your filters.</td></tr>
              ) : filtered.map(p => {
                const isOut = p.stock_quantity === 0;
                const isLow = !isOut && p.stock_quantity <= p.minimum_stock;
                const stockValue = Number(p.stock_quantity) * Number(p.selling_price);
                const recentTx = txByProduct[p.id] || [];
                const pct = p.minimum_stock > 0 ? Math.min(100, Math.round((p.stock_quantity / (p.minimum_stock * 2)) * 100)) : 100;
                return (
                  <tr key={p.id} className={clsx('hover:bg-surfaceHighlight/30 transition-colors', isOut && 'bg-danger/5', isLow && 'bg-warning/5')}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-textMain">{p.product_name}</p>
                      <p className="text-xs text-textMuted mt-0.5">{p.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-textMuted">{p.category_name || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center space-y-1.5">
                        <span className={clsx('text-lg font-bold', isOut ? 'text-danger' : isLow ? 'text-warning' : 'text-secondary')}>
                          {p.stock_quantity}
                        </span>
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full transition-all', isOut ? 'bg-danger' : isLow ? 'bg-warning' : 'bg-secondary')}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-textMuted">{p.minimum_stock}</td>
                    <td className="px-6 py-4 text-right text-textMuted">{formatCurrency(p.selling_price)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-textMain">{formatCurrency(stockValue)}</td>
                    <td className="px-6 py-4 text-center">
                      {isOut ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-danger/10 text-danger border border-danger/20">Out of Stock</span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning border border-warning/20 flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary border border-secondary/20">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {recentTx.length === 0 ? (
                          <span className="text-xs text-textMuted italic">No movements</span>
                        ) : recentTx.map((tx, i) => (
                          <span key={i} className={clsx('inline-flex items-center gap-1 text-xs font-medium',
                            tx.transaction_type === 'stock_in' ? 'text-secondary' : 'text-primary')}>
                            {tx.transaction_type === 'stock_in'
                              ? <ArrowDownCircle className="w-3 h-3" />
                              : <ArrowUpCircle className="w-3 h-3" />}
                            {tx.transaction_type === 'stock_in' ? '+' : '-'}{tx.quantity}
                            <span className="text-textMuted font-normal">· {new Date(tx.created_at).toLocaleDateString()}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/products/${p.id}`)}
                        className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-textMuted bg-background/50">
          <p>Showing <span className="font-medium text-textMain">{filtered.length}</span> of <span className="font-medium text-textMain">{products.length}</span> products</p>
          <p>Total filtered value: <span className="font-semibold text-textMain">
            {formatCurrency(filtered.reduce((s, p) => s + Number(p.stock_quantity) * Number(p.selling_price), 0))}
          </span></p>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
