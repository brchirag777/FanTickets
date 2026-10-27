import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login'; 
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails'; 
import WishList from './pages/WishList';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Register from './pages/Register'; 


function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <NavBar />
        <main className="bg-gray-50 min-h-screen pb-10">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
