import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import companyLogo from '../../assets/company-logo.jpg';
import { salesService } from '../../services/api';

const Invoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const data = await salesService.getById(id);
        setSale(data);
      } catch (err) {
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSale();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-textMuted">Loading invoice...</div>;
  if (error || !sale) return <div className="p-8 text-center text-danger">{error || 'Invoice not found'}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/sales')} className="p-2 transition-colors rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-textMain">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-textMain">Invoice</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => window.print()} className="flex items-center px-4 py-2 space-x-2 text-sm transition-colors border rounded-lg border-border hover:bg-surfaceHighlight text-textMuted hover:text-textMain">
            <Printer className="w-4 h-4" /><span>Print</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primaryHover">
            <Download className="w-4 h-4" /><span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden border bg-surface border-border rounded-2xl print:border-none print:shadow-none print:rounded-none">
        {/* Invoice Header */}
        <div className="flex items-start justify-between p-8 border-b border-border">
          <div className="flex items-center space-x-4">
            <img src={companyLogo} alt="Logo" className="object-contain w-14 h-14 rounded-xl" />
            <div>
              <h2 className="text-xl font-bold text-textMain">Inventory & Sales Co.</h2>
              <p className="text-sm text-textMuted">Addis Ababa, Ethiopia</p>
              <p className="text-sm text-textMuted">inventory@company.com</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-textMain">INVOICE</h3>
            <p className="mt-1 font-semibold text-primary">{sale.invoice_number}</p>
            <p className="mt-1 text-sm text-textMuted">{new Date(sale.created_at).toLocaleDateString()}</p>
            <span className="inline-block px-3 py-1 mt-2 text-xs font-semibold border rounded-full bg-secondary/10 text-secondary border-secondary/20">
              {sale.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Bill To */}
        <div className="p-8 border-b border-border">
          <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-textMuted">Bill To</p>
          <p className="text-base font-semibold text-textMain">{sale.customer_name}</p>
          <p className="mt-1 text-sm text-textMuted">Processed by: {sale.prepared_by_name}</p>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-surfaceHighlight/50 border-border">
              <tr>
                <th className="px-8 py-4 font-medium text-left text-textMuted">Product</th>
                <th className="px-6 py-4 font-medium text-center text-textMuted">Qty</th>
                <th className="px-6 py-4 font-medium text-right text-textMuted">Unit Price</th>
                <th className="px-8 py-4 font-medium text-right text-textMuted">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sale.items?.map((item, i) => (
                <tr key={i}>
                  <td className="px-8 py-4 font-medium text-textMain">{item.product_name}</td>
                  <td className="px-6 py-4 text-center text-textMuted">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-textMuted">{formatCurrency(item.unit_price)}</td>
                  <td className="px-8 py-4 font-semibold text-right text-textMain">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end p-8 border-t border-border">
          <div className="space-y-3 text-sm w-72">
            <div className="flex justify-between text-textMuted"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
            <div className="flex justify-between text-textMuted"><span>Discount ({sale.discount_percentage}%)</span><span className="text-danger">-{formatCurrency(sale.discount_amount)}</span></div>
            <div className="flex justify-between text-textMuted"><span>Taxable Amount</span><span>{formatCurrency(sale.subtotal - sale.discount_amount)}</span></div>
            <div className="flex justify-between text-text Muted"><span>VAT ({sale.vat_percentage}%)</span><span>+{formatCurrency(sale.vat_amount)}</span></div>
            <div className="flex justify-between pt-3 text-base font-bold border-t border-border text-textMain">
              <span>Total Amount</span><span>{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Signature Block */}
        <div className="grid grid-cols-2 gap-16 p-8 pt-16">
          <div className="text-center">
            <div className="w-full mb-2 border-b border-textMuted"></div>
            <p className="text-sm font-medium text-textMain">Prepared By</p>
            <p className="mt-1 text-xs text-textMuted">{sale.prepared_by_name || '________________________'}</p>
          </div>
          <div className="text-center">
            <div className="w-full mb-2 border-b border-textMuted"></div>
            <p className="text-sm font-medium text-textMain">Approved By</p>
            <p className="mt-1 text-xs text-textMuted">{sale.approved_by_name || '________________________'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
