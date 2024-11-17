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
import ErrorPage from './pages/Error/ErrorPage';
import ImportProducts from './components/import/ImportProducts';
import ImportHistory from './components/import/ImportHistory';
import ProfilePage from "./pages/profile/ProfilePage";


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route path="/" index element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="products">
                    <Route index element={<Product />} />
                    <Route path="create" element={<CreateProduct />} />
                    <Route path="edit/:id" element={<UpdateProduct />} />
                    <Route path=":id" element={<ProductDetails />} />
                  </Route>
                  <Route path="reports" element={<Reports />} />
                  <Route path="sales">
                    <Route index element={<Sales />} />
                    <Route path="create" element={<CreateSale />} />
                  </Route>
                  
                </Route>
                <Route path="*" element={<ErrorPage />} />
                <Route path="/import" element={<ImportProducts />} />
                <Route path="/import/history" element={<ImportHistory />} />
              </Route>
            </Routes>
            <Footer />
            </main>
          </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
