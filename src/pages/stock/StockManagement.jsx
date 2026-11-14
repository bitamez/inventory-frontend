import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowDownCircle, ArrowUpCircle, RefreshCw, X, Save, Download } from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportToExcel';

const typeStyle = (type) => {
  if (type === 'stock_in') return 'text-secondary border-secondary/20 bg-secondary/10';
  if (type === 'stock_out') return 'text-primary border-primary/20 bg-primary/10';
  return 'text-warning border-warning/20 bg-warning/10';
};

const typeIcon = (type) => {
  if (type === 'stock_in') return <ArrowDownCircle className="w-3 h-3" />;
  if (type === 'stock_out') return <ArrowUpCircle className="w-3 h-3" />;
  return <RefreshCw className="w-3 h-3" />;
};

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [form, setForm] = useState({
    product_id: '',
    transaction_type: 'stock_in',
    quantity_change: '',
    reference_note: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stock');
      if (res.data?.success) setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch stock transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (res.data?.success) setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleModalChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setModalError('');
  };

  const handleRecordStock = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity_change) {
      return setModalError('Product and Quantity are required.');
    }
    if (Number(form.quantity_change) <= 0) {
      return setModalError('Quantity must be greater than zero.');
    }

    setModalLoading(true);
    setModalError('');
    try {
      await api.post('/stock', {
        product_id: form.product_id,
        transaction_type: form.transaction_type,
        quantity_change: Number(form.quantity_change),
        reference_note: form.reference_note
      });
      setIsModalOpen(false);
      setForm({ product_id: '', transaction_type: 'stock_in', quantity_change: '', reference_note: '' });
      fetchTransactions();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to record stock transaction.');
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = String(tx.product_name || '').toLowerCase().includes(searchLower) ||
      String(tx.sku || '').toLowerCase().includes(searchLower);
    const matchType = typeFilter === 'all' || tx.transaction_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleExport = () => {
    const exportData = filtered.map(tx => ({
      'Product Name': tx.product_name,
      'SKU': tx.sku,
      'Transaction Type': tx.transaction_type.replace('_', ' ').toUpperCase(),
      'Quantity Change': tx.transaction_type === 'stock_out' ? `-${tx.quantity}` : `+${tx.quantity}`,
      'Date & Time': new Date(tx.created_at).toLocaleString(),
      'Performed By': tx.performed_by_name || '—',
      'Reference Note': tx.notes || '—'
    }));
    exportToExcel(exportData, `Stock_Transactions_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-textMain">Stock Transactions</h1>
          <p className="text-sm text-textMuted mt-1">Track inbound and outbound inventory movements</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Record Stock</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by product or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'stock_in', 'stock_out', 'adjustment'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={clsx(
                "flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize",
                typeFilter === type
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-border text-textMuted hover:bg-surfaceHighlight"
              )}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </button>
          ))}
          <button onClick={handleExport} className="flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-textMain hover:bg-surfaceHighlight transition-colors">
            <Download className="w-3.5 h-3.5" /><span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product & SKU</th>
                <th className="px-6 py-4 font-medium text-center">Type</th>
                <th className="px-6 py-4 font-medium text-center">Quantity</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Performed By</th>
                <th className="px-6 py-4 font-medium">Reference Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted">Loading transactions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted">
                  {transactions.length === 0 ? 'No stock transactions yet.' : 'No transactions match your search.'}
                </td></tr>
              ) : filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-textMain">{tx.product_name}</p>
                    <p className="text-xs text-textMuted mt-0.5">{tx.sku}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("px-2.5 py-1 text-xs font-medium rounded border inline-flex items-center gap-1", typeStyle(tx.transaction_type))}>
                      {typeIcon(tx.transaction_type)}
                      <span className="capitalize">{tx.transaction_type?.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-semibold",
                      tx.transaction_type === 'stock_in' ? "text-secondary" :
                        tx.transaction_type === 'stock_out' ? "text-primary" : "text-warning"
                    )}>
                      {tx.transaction_type === 'stock_in' ? '+' : tx.transaction_type === 'stock_out' ? '-' : ''}{tx.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-textMuted">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-textMain">{tx.performed_by_name || '—'}</td>
                  <td className="px-6 py-4 text-textMuted">{tx.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border mt-auto flex items-center justify-between text-sm text-textMuted bg-background/50">
          <p>Showing {filtered.length} of {transactions.length} records</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Record Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-textMain">Record Stock Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-textMain transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordStock} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 text-sm bg-danger/10 border border-danger/20 text-danger rounded-lg">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Product</label>
                <select name="product_id" value={form.product_id} onChange={handleModalChange} required
                  className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm text-textMain focus:outline-none focus:border-primary">
                  <option value="" disabled>Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product_name} ({p.sku}) - {p.stock_quantity} in stock</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">Transaction Type</label>
                  <select name="transaction_type" value={form.transaction_type} onChange={handleModalChange}
                    className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm text-textMain focus:outline-none focus:border-primary">
                    <option value="stock_in">Stock In (+)</option>
                    <option value="stock_out">Stock Out (-)</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">Quantity</label>
                  <input type="number" name="quantity_change" value={form.quantity_change} onChange={handleModalChange} required min="0.01" step="any"
                    className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm text-textMain focus:outline-none focus:border-primary"
                    placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Reference Note (Optional)</label>
                <input type="text" name="reference_note" value={form.reference_note} onChange={handleModalChange}
                  className="w-full bg-background border border-border rounded-xl py-2 px-3 text-sm text-textMain focus:outline-none focus:border-primary"
                  placeholder="e.g. Restock from supplier" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-textMuted hover:bg-surfaceHighlight border border-border rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={modalLoading} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryHover disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors">
                  {modalLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
