import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Edit, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import clsx from 'clsx';

// Mock data — will be replaced with useFetch hook when API is live
const mockProduct = {
  id: 1, sku: 'CEM-50KG', product_name: 'Cement 50kg Bag', category: 'Building Materials',
  unit_price: 650, stock_quantity: 150, minimum_stock: 50, unit_of_measure: 'bag',
  description: 'Portland cement standard 50kg bag for construction use.',
  created_at: 'Jan 12, 2025',
};

const mockHistory = [
  { type: 'stock_in', quantity: 100, date: 'May 20, 2025', notes: 'Purchase order PO-001' },
  { type: 'stock_out', quantity: 30, date: 'May 22, 2025', notes: 'Sold via INV-2025-0003' },
  { type: 'stock_in', quantity: 80, date: 'May 25, 2025', notes: 'Purchase order PO-002' },
  { type: 'stock_out', quantity: 50, date: 'May 26, 2025', notes: 'Sold via INV-2025-0007' },
];

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const p = mockProduct;
  const isLow = p.stock_quantity <= p.minimum_stock;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors text-textMuted hover:text-textMain">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-textMain">Product Details</h1>
        </div>
        <button onClick={() => navigate(`/products/${id}/edit`)} className="flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium transition-colors">
          <Edit className="w-4 h-4" /><span>Edit Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info Card */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-xl bg-surfaceHighlight border border-border flex items-center justify-center shrink-0">
              <Package className="w-8 h-8 text-textMuted" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain">{p.product_name}</h2>
              <p className="text-sm text-textMuted mt-1">SKU: <span className="text-primary font-medium">{p.sku}</span></p>
              <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded border border-border text-textMuted">{p.category}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
            {[
              { label: 'Unit Price', value: formatCurrency(p.unit_price), color: 'text-secondary' },
              { label: 'Unit of Measure', value: p.unit_of_measure, color: 'text-textMain' },
              { label: 'Added On', value: p.created_at, color: 'text-textMain' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-textMuted mb-1">{item.label}</p>
                <p className={`font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {p.description && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-textMuted mb-1">Description</p>
              <p className="text-sm text-textMain">{p.description}</p>
            </div>
          )}
        </div>

        {/* Stock Summary Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-textMain">Stock Summary</h3>
          <div className="text-center py-4">
            <p className={clsx('text-5xl font-black', isLow ? 'text-danger' : 'text-secondary')}>{p.stock_quantity}</p>
            <p className="text-textMuted text-sm mt-1">{p.unit_of_measure} in stock</p>
            {isLow && (
              <div className="mt-3 flex items-center justify-center space-x-1.5 text-warning text-xs">
                <AlertTriangle className="w-3.5 h-3.5" /><span>Below minimum level</span>
              </div>
            )}
          </div>
          <div className="border-t border-border pt-4 space-y-3 text-sm">
            <div className="flex justify-between text-textMuted"><span>Minimum Level</span><span className="text-textMain font-medium">{p.minimum_stock} {p.unit_of_measure}</span></div>
            <div className="flex justify-between text-textMuted"><span>Stock Value</span><span className="text-secondary font-semibold">{formatCurrency(p.stock_quantity * p.unit_price)}</span></div>
          </div>
        </div>
      </div>

      {/* Stock History */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-base font-semibold text-textMain">Stock Movement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-center">Quantity</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {mockHistory.map((h, i) => (
                <tr key={i} className="hover:bg-surfaceHighlight/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {h.type === 'stock_in'
                        ? <TrendingUp className="w-4 h-4 text-secondary" />
                        : <TrendingDown className="w-4 h-4 text-danger" />}
                      <span className={clsx('text-xs font-semibold px-2 py-1 rounded border',
                        h.type === 'stock_in' ? 'text-secondary bg-secondary/10 border-secondary/20' : 'text-danger bg-danger/10 border-danger/20')}>
                        {h.type === 'stock_in' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-textMain">{h.quantity}</td>
                  <td className="px-6 py-4 text-textMuted">{h.date}</td>
                  <td className="px-6 py-4 text-textMuted">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
