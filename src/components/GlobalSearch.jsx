import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], sales: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults({ products: [], sales: [] });
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, salesRes] = await Promise.all([
          api.get('/products'),
          api.get('/sales'),
        ]);

        const q = query.toLowerCase();

        const matchedProducts = (prodRes.data?.data || []).filter(p =>
          String(p.product_name || '').toLowerCase().includes(q) ||
          String(p.sku || '').toLowerCase().includes(q) ||
          String(p.category_name || '').toLowerCase().includes(q)
        ).slice(0, 5);

        const matchedSales = (salesRes.data?.data || []).filter(s =>
          String(s.invoice_number || '').toLowerCase().includes(q) ||
          String(s.customer_name || '').toLowerCase().includes(q)
        ).slice(0, 5);

        setResults({ products: matchedProducts, sales: matchedSales });
        setOpen(true);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleSelect = (path) => {
    setQuery('');
    setOpen(false);
    navigate(path);
  };

  const hasResults = results.products.length > 0 || results.sales.length > 0;

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder="Search products, invoices..."
        className="bg-background border border-border rounded-full py-2 pl-10 pr-8 text-sm text-textMain focus:outline-none focus:border-primary transition-colors w-44 sm:w-56 lg:w-72"
      />
      {query && (
        <button onClick={() => { setQuery(''); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain">
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute top-full mt-2 left-0 w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-textMuted text-sm">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-textMuted text-sm">No results for "{query}"</div>
          ) : (
            <>
              {results.products.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-textMuted uppercase tracking-wider">Products</p>
                  {results.products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(`/products/${p.id}`)}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-surfaceHighlight transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-textMain truncate">{p.product_name}</p>
                        <p className="text-xs text-textMuted">{p.sku} · Stock: {p.stock_quantity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.products.length > 0 && results.sales.length > 0 && (
                <div className="border-t border-border" />
              )}

              {results.sales.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-textMuted uppercase tracking-wider">Sales</p>
                  {results.sales.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(`/sales/invoice/${s.id}`)}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-surfaceHighlight transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-textMain truncate">{s.invoice_number}</p>
                        <p className="text-xs text-textMuted">{s.customer_name} · {Number(s.total_amount).toLocaleString()} Birr</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-border px-4 py-2.5 bg-background/50">
                <p className="text-xs text-textMuted text-center">
                  {results.products.length + results.sales.length} result(s) found
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
