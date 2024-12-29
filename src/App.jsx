import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Product from "./pages/products/Product";
import CreateProduct from "./pages/products/CreateProduct";
import Reports from "./pages/reports/Reports";
import Sales from "./pages/sales/Sales";
import CreateSale from "./pages/sales/CreateSale";
import ProductDetails from "./pages/products/ProductDetails";
import UpdateProduct from "./pages/products/UpdateProduct";
import { ThemeProvider } from "./context/ThemeContext";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/Header/ProtectedRoute";
import HomePage from "./pages/home/HomePage";
import Footer from "./components/layout/Footer/Footer";
import ErrorPage from "./pages/Error/ErrorPage";
import ImportProducts from "./components/import/ImportProducts";
import ImportHistory from "./components/import/ImportHistory";
import ProfilePage from "./pages/profile/ProfilePage";
import UpdateSale from "./pages/sales/UpdateSale";
import Vendors from "./pages/vendors/Vendors";
import VendorForm from "./pages/vendors/VendorForm";
import VendorDetails from "./pages/vendors/VendorDetails";
import EditVendor from './pages/vendors/EditVendor';
// import AuthLayout from "./components/styles/AuthLayout";

function App() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <ThemeProvider>
          <Routes>
          <Route element={<ProtectedRoute />}>
          
          <Route path="/products" element={<Product />} />
                {/* Product Routes */}
                <Route path="/products/:id" element={<ProductDetails />} />
                {/* Sales Routes */}
                <Route path="/sales" element={<Sales />} />

                {/* Vendors Routes */}
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/create" element={<VendorForm />} />
                <Route path="/vendors/:id" element={<VendorDetails />} />
                <Route path="/vendors/edit/:id" element={<EditVendor />} />

          </Route>
          


            {/* Wrap routes that need the layout in a Layout route */}
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" index element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>

                {/* Product Routes */}
                <Route path="/products/create" element={<CreateProduct />} />
                <Route path="/products/edit/:id" element={<UpdateProduct />} />

                {/* Sales Routes */}
                <Route path="/sales/create" element={<CreateSale />} />
                <Route path="/sales/:id/edit" element={<UpdateSale />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                <Route path="/reports" element={<Reports />} />
                
                
              </Route>

              {/* Import Routes */}
              <Route path="/import" element={<ImportProducts />} />
              <Route path="/import/history" element={<ImportHistory />} />

              {/* Error Route */}
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
