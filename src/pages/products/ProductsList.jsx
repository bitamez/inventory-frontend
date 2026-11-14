import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Download } from 'lucide-react';
import clsx from 'clsx';
import { productService } from '../../services/productService';
import { exportToExcel } from '../../utils/exportToExcel';
import { useAuth } from '../../context/AuthContext';

const ProductsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      if (Array.isArray(res)) setProducts(res);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await productService.delete(id);
        if (res.success) {
          setProducts(products.filter(p => p.id !== id));
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = String(p.product_name || '').toLowerCase().includes(searchLower) ||
      String(p.sku || '').toLowerCase().includes(searchLower);
    const matchStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'active'
        ? p.is_active === true
        : p.is_active === false;
    return matchSearch && matchStatus;
  });

  const handleExport = () => {
    const exportData = filteredProducts.map(p => ({
      'Product Name': p.product_name,
      'SKU': p.sku,
      'Category': p.category_name || '—',
      'Selling Price (Birr)': Number(p.selling_price),
      'Current Stock Level': Number(p.stock_quantity),
      'Minimum Stock': Number(p.minimum_stock),
      'Status': p.is_active ? 'Active' : 'Inactive'
    }));
    exportToExcel(exportData, `Current_Stock_Levels_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-textMain">Products</h1>
          <p className="text-sm text-textMuted mt-1">Manage your inventory and product catalog</p>
        </div>
        {user?.role_name !== 'Sales Officer' && (
          <button onClick={() => navigate('/products/add')} className="w-full sm:w-auto bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-background rounded-lg border border-border overflow-hidden flex-1 sm:flex-none">
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={clsx(
                  "flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium transition-colors capitalize",
                  filterStatus === status
                    ? "bg-surfaceHighlight text-textMain"
                    : "text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm text-textMain hover:bg-surfaceHighlight transition-colors">
            <Download className="w-4 h-4" /><span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name & SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Selling Price</th>
                <th className="px-6 py-4 font-medium text-center">Stock Level</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-textMuted">Loading products...</td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-textMain">{product.product_name}</p>
                      <p className="text-xs text-textMuted mt-0.5">{product.sku}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted">{product.category_name}</td>
                  <td className="px-6 py-4 text-textMain font-medium text-right">{Number(product.selling_price).toFixed(2)} Birr</td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      "font-medium",
                      product.stock_quantity <= product.minimum_stock ? "text-danger" : "text-textMain"
                    )}>
                      {product.stock_quantity}
                    </span>
                    <span className="text-textMuted text-xs ml-1">/ {product.minimum_stock}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={clsx(
                        "px-2.5 py-1 text-xs font-medium rounded border",
                        product.stock_quantity === 0 ? "text-danger border-danger/20 bg-danger/10" :
                          product.stock_quantity <= product.minimum_stock
                            ? "text-warning border-warning/20 bg-warning/10"
                            : "text-secondary border-secondary/20 bg-secondary/10"
                      )}>
                        {product.stock_quantity === 0 ? 'Out of Stock' : product.stock_quantity <= product.minimum_stock ? 'Low Stock' : 'In Stock'}
                      </span>
                      {!product.is_active && (
                        <span className="px-2.5 py-0.5 text-[10px] font-medium rounded border text-textMuted border-border bg-surfaceHighlight">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {user?.role_name !== 'Sales Officer' && (
                        <>
                          <button onClick={() => navigate(`/products/${product.id}/edit`)} className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-textMuted hover:text-danger hover:bg-danger/10 rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded transition-colors" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-textMuted">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border mt-auto flex items-center justify-between text-sm text-textMuted bg-background/50">
          <p>Showing 1 to {filteredProducts.length} of {products.length} entries</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
