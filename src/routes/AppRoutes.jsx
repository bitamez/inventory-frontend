import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

// Auth
import Login from '../pages/auth/Login';

// Pages
import Dashboard from '../pages/dashboard/Dashboard';
import ProductsList from '../pages/products/ProductsList';
import AddProduct from '../pages/products/AddProduct';
import EditProduct from '../pages/products/EditProduct';
import ProductDetails from '../pages/products/ProductDetails';
import SalesPage from '../pages/sales/SalesPage';
import NewSale from '../pages/sales/NewSale';
import Invoice from '../pages/sales/Invoice';
import StockManagement from '../pages/stock/StockManagement';
import InventoryPage from '../pages/inventory/InventoryPage';
import ApprovalPage from '../pages/approvals/ApprovalPage';
import ReportsPage from '../pages/reports/ReportsPage';
import DailyReport from '../pages/reports/DailyReport';
import MonthlyReport from '../pages/reports/MonthlyReport';
import StockReport from '../pages/reports/StockReport';
import UserManagement from '../pages/users/UserManagement';
import Roles from '../pages/roles/Roles';
import Settings from '../pages/settings/Settings';

const AppRoutes = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />

          {/* Products */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="products/:id/edit" element={<EditProduct />} />

          {/* Sales */}
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales/new" element={<NewSale />} />
          <Route path="sales/invoice/:id" element={<Invoice />} />

          {/* Stock */}
          <Route path="stock" element={<StockManagement />} />

          {/* Inventory */}
          <Route path="inventory" element={<InventoryPage />} />

          {/* Manager+ only */}
          <Route path="approvals" element={<ProtectedRoute allowedRoles={['Admin','Manager']}><ApprovalPage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute allowedRoles={['Admin','Manager']}><ReportsPage /></ProtectedRoute>} />
          <Route path="reports/daily" element={<ProtectedRoute allowedRoles={['Admin','Manager']}><DailyReport /></ProtectedRoute>} />
          <Route path="reports/monthly" element={<ProtectedRoute allowedRoles={['Admin','Manager']}><MonthlyReport /></ProtectedRoute>} />
          <Route path="reports/stock" element={<ProtectedRoute allowedRoles={['Admin','Manager']}><StockReport /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="roles" element={<ProtectedRoute allowedRoles={['Admin']}><Roles /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['Admin']}><Settings /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRoutes;
