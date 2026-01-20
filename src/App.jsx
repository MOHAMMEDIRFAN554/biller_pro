import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import POS from './pages/POS';
import Billing from './pages/Billing';
import Warehouse from './pages/Warehouse';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import EditProduct from './pages/EditProduct';
import AddProduct from './pages/AddProduct';
import AddCustomer from './pages/AddCustomer';
import CustomerLedger from './pages/CustomerLedger';
import CustomerReceipt from './pages/CustomerReceipt';
import PrintBill from './pages/PrintBill';
import PrintReturn from './pages/PrintReturn';
import PrintReceipt from './pages/PrintReceipt';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Print Routes (Standalone) */}
        <Route path="/print/bill/:id" element={<PrintBill />} />
        <Route path="/print/return/:id" element={<PrintReturn />} />
        <Route path="/print/receipt/:id" element={<PrintReceipt />} />

        <Route path="" element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<AddProduct />} />
            <Route path="/inventory/edit/:id" element={<EditProduct />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/add" element={<AddCustomer />} />
            <Route path="/customers/ledger/:id" element={<CustomerLedger />} />
            <Route path="/customers/receipt/:id" element={<CustomerReceipt />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
