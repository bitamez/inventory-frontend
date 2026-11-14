import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { validateProductForm } from '../../utils/validation';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [form, setForm] = useState({
    sku: '', product_name: '', category_id: '', cost_price: '', selling_price: '',
    stock_quantity: '', minimum_stock: '', unit_of_measure: 'pcs', description: '', is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await getCategories();
        if (catRes.success) setCategories(catRes.data);

        const product = await productService.getById(id);
        if (product) {
          setForm({
            sku: product.sku || '',
            product_name: product.product_name || '',
            category_id: product.category_id || '',
            cost_price: product.cost_price ?? '',
            selling_price: product.selling_price ?? '',
            stock_quantity: product.stock_quantity ?? '',
            minimum_stock: product.minimum_stock ?? '',
            unit_of_measure: product.unit_of_measure || 'pcs',
            description: product.description || '',
            is_active: product.is_active ?? true,
          });
        }
      } catch (err) {
        setApiError('Failed to load data. Please refresh.');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProductForm(form);
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    setLoading(true);
    setApiError('');
    try {
      await productService.update(id, form);
      alert('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-textMuted">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/products')} className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors text-textMuted hover:text-textMain">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-textMain">Edit Product</h1>
          <p className="text-sm text-textMuted mt-1">Update product details below</p>
        </div>
      </div>

      {apiError && (
        <div className="flex items-start space-x-3 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><p>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { name: 'sku', label: 'SKU / Product Code', type: 'text' },
            { name: 'product_name', label: 'Product Name', type: 'text' },
            { name: 'cost_price', label: 'Cost Price (Birr)', type: 'number' },
            { name: 'selling_price', label: 'Selling Price (Birr)', type: 'number' },
            { name: 'stock_quantity', label: 'Stock Quantity', type: 'number' },
            { name: 'minimum_stock', label: 'Minimum Stock Level', type: 'number' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-textMain mb-2">{label}</label>
              <input name={name} type={type} value={form[name]} onChange={handleChange}
                step={type === 'number' ? 'any' : undefined}
                className={`w-full bg-background border rounded-xl py-2.5 px-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors ${errors[name] ? 'border-danger' : 'border-border'}`} />
              {errors[name] && <p className="text-danger text-xs mt-1">{errors[name]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}
              className={`w-full bg-background border rounded-xl py-2.5 px-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors ${errors.category_id ? 'border-danger' : 'border-border'}`}>
              <option value="" disabled>Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-danger text-xs mt-1">{errors.category_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Unit of Measure</label>
            <select name="unit_of_measure" value={form.unit_of_measure} onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors">
              {['pcs', 'kg', 'g', 'L', 'mL', 'bag', 'box', 'roll', 'sheet', 'meter'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-3 mt-6">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-textMain">
              Product is Active
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-textMain mb-2">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange}
            className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors resize-none" />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={() => navigate('/products')} className="px-5 py-2.5 text-sm font-medium text-textMuted border border-border hover:bg-surfaceHighlight rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary hover:bg-primaryHover disabled:opacity-60 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 transition-colors">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
