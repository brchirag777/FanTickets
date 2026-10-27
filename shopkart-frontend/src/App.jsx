import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login'; 
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails'; 
import SellTicket from './pages/SellTicket';
import WishList from './pages/WishList';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Register from './pages/Register'; 
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <NavBar />
          <main className="min-h-screen pb-10 bg-zinc-950 text-zinc-100">
            <Routes>
              <Route path="/" element={<Tickets />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<TicketDetails />} />
              <Route path="/sell" element={<SellTicket />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<WishList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}



export default App;
