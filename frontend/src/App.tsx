import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  LogIn,
  LogOut,
  Zap,
  Package,
  Star,
  Menu,
  X,
  Settings,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id?: string;
  createdAt?: string;
  status?: string;
  shippingAddress?: string;
}

interface AuthFormData {
  name: string;
  email: string;
  password: string;
  mode: 'login' | 'register';
}

interface CheckoutFormData {
  shippingAddress: string;
  phone: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 2,
    minutes: 30,
    seconds: 45,
  });
  const [authForm, setAuthForm] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
    mode: 'login',
  });
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>({
    shippingAddress: '',
    phone: '',
  });

  useEffect(() => {
    const savedUrl = localStorage.getItem('flashfast_base_url');
    const savedToken = localStorage.getItem('flashfast_token');
    const savedCart = localStorage.getItem('flashfast_cart');

    if (savedUrl) setBaseUrl(savedUrl);
    if (savedToken) {
      setToken(savedToken);
      setUser({ name: 'User', email: 'user@example.com' });
    }
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('flashfast_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentPage === 'shop' && products.length === 0) fetchProducts();
    if (currentPage === 'orders') fetchOrders();
  }, [currentPage]);

  const makeRequest = async (
    endpoint: string,
    method: string = 'GET',
    body: Record<string, unknown> | null = null,
    useAuth: boolean = true
  ): Promise<Record<string, unknown> | null> => {
    if (!baseUrl) {
      alert('Please configure Base URL in settings');
      setShowSettings(true);
      return null;
    }
    setLoading(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (useAuth && token) headers['Authorization'] = `Bearer ${token}`;
      const options: RequestInit = { method, headers };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      const data: unknown = await res.json();
      if (!res.ok) {
        const maybeMessage =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as Record<string, unknown>)['message'])
            : 'Request failed';
        throw new Error(maybeMessage);
      }
      return data as Record<string, unknown>;
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(String(error));
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint =
      authForm.mode === 'login' ? '/auth/login' : '/auth/register';
    const body =
      authForm.mode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : {
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
            role: 'user',
          }; //@ts-expect-error fix this any
    const data: { user: { name: string; email: string }; token: string } =
      await makeRequest(endpoint, 'POST', body, false);
    if (data && data.token) {
      //check if token exist ant type is string

      setToken(typeof data?.token === 'string' ? data.token : '');
      localStorage.setItem(
        'flashfast_token',
        typeof data?.token === 'string' ? data.token : ''
      );
      setUser({
        name: data?.user?.name || authForm.name,
        email: data?.user?.email || authForm.email,
      });
      setCurrentPage('home');
      setAuthForm({ name: '', email: '', password: '', mode: 'login' });
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('flashfast_token');
    setCurrentPage('home');
  };

  const fetchProducts = async () => {
    const data = await makeRequest('/products', 'GET', null, true); //@ts-expect-error fix this any
    if (data) setProducts(Array.isArray(data) ? data : data.products || []);
  };

  const fetchOrders = async () => {
    const data = await makeRequest('/orders/my', 'GET', null, true); //@ts-expect-error fix this any
    if (data) setOrders(Array.isArray(data) ? data : data.orders || []);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to checkout');
      setCurrentPage('auth');
      return;
    }
    for (const item of cart) {
      await makeRequest(
        '/orders',
        'POST',
        {
          productId: item.id,
          quantity: item.quantity,
          shippingAddress: checkoutForm.shippingAddress,
        },
        true
      );
    }
    setCart([]);
    setCheckoutForm({ shippingAddress: '', phone: '' });
    alert('Order placed successfully!');
    setCurrentPage('orders');
    fetchOrders();
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-md sticky top-0 z-50'>
        <div className='bg-gradient-to-r from-red-600 to-orange-600 text-white py-2'>
          <div className='max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-sm'>
            <Zap size={16} className='animate-pulse' />
            <span className='font-semibold'>FLASH SALE ENDS IN:</span>
            <div className='flex gap-2 font-mono'>
              <span className='bg-white text-red-600 px-2 py-1 rounded'>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className='bg-white text-red-600 px-2 py-1 rounded'>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className='bg-white text-red-600 px-2 py-1 rounded'>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-8'>
              <button
                onClick={() => setCurrentPage('home')}
                className='flex items-center gap-2'
              >
                <Zap className='text-orange-600' size={32} />
                <span className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                  FlashFast
                </span>
              </button>
              <nav className='hidden md:flex gap-6'>
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`font-medium transition ${
                    currentPage === 'home'
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage('shop')}
                  className={`font-medium transition ${
                    currentPage === 'shop'
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  Shop
                </button>
                <button
                  onClick={() => setCurrentPage('flash-deals')}
                  className={`font-medium transition ${
                    currentPage === 'flash-deals'
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  Flash Deals
                </button>
              </nav>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setShowSettings(true)}
                className='p-2 hover:bg-gray-100 rounded-full'
              >
                <Settings size={20} className='text-gray-600' />
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className='hidden md:flex items-center gap-2 text-gray-600 hover:text-orange-600'
                  >
                    <Package size={20} />
                    <span>Orders</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className='hidden md:flex items-center gap-2 text-gray-600 hover:text-orange-600'
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentPage('auth')}
                  className='hidden md:flex items-center gap-2 text-gray-600 hover:text-orange-600'
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </button>
              )}
              <button
                onClick={() => setCurrentPage('cart')}
                className='relative p-2 hover:bg-gray-100 rounded-full'
              >
                <ShoppingCart size={24} className='text-gray-600' />
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center'>
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='md:hidden p-2'
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className='md:hidden border-t bg-white py-4 px-4 space-y-2'>
            <button
              onClick={() => {
                setCurrentPage('home');
                setMobileMenuOpen(false);
              }}
              className='block w-full text-left py-2 px-4 hover:bg-gray-100 rounded'
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentPage('shop');
                setMobileMenuOpen(false);
              }}
              className='block w-full text-left py-2 px-4 hover:bg-gray-100 rounded'
            >
              Shop
            </button>
            <button
              onClick={() => {
                setCurrentPage('flash-deals');
                setMobileMenuOpen(false);
              }}
              className='block w-full text-left py-2 px-4 hover:bg-gray-100 rounded'
            >
              Flash Deals
            </button>
            {user ? (
              <>
                <button
                  onClick={() => {
                    setCurrentPage('orders');
                    setMobileMenuOpen(false);
                  }}
                  className='block w-full text-left py-2 px-4 hover:bg-gray-100 rounded'
                >
                  Orders
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className='block w-full text-left py-2 px-4 hover:bg-gray-100 rounded'
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentPage('auth');
                  setMobileMenuOpen(false);
                }}
                className='block w-full text-left py-2 px-4 hover:bg-gray-100 rounded'
              >
                Login
              </button>
            )}
          </div>
        )}
      </header>

      {showSettings && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-2xl max-w-md w-full p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold'>API Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className='p-2 hover:bg-gray-100 rounded-full'
              >
                <X size={20} />
              </button>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Base URL
                </label>
                <input
                  type='text'
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder='http://localhost:3000'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                />
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('flashfast_base_url', baseUrl);
                  alert('Settings saved!');
                  setShowSettings(false);
                }}
                className='w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition'
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'home' && (
        <div className='bg-gray-50'>
          <div className='bg-gradient-to-r from-orange-600 to-red-600 text-white py-20'>
            <div className='max-w-7xl mx-auto px-4 text-center'>
              <h1 className='text-5xl md:text-6xl font-bold mb-6'>
                Lightning Fast Deals
              </h1>
              <p className='text-xl md:text-2xl mb-8'>
                Grab amazing products at unbeatable prices
              </p>
              <button
                onClick={() => setCurrentPage('flash-deals')}
                className='bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition'
              >
                Shop Flash Sales
              </button>
            </div>
          </div>
          <div className='max-w-7xl mx-auto px-4 py-16'>
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='bg-white p-8 rounded-xl shadow-md text-center'>
                <div className='bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Zap className='text-orange-600' size={32} />
                </div>
                <h3 className='text-xl font-bold mb-2'>Flash Sales</h3>
                <p className='text-gray-600'>
                  Limited time offers with up to 80% off
                </p>
              </div>
              <div className='bg-white p-8 rounded-xl shadow-md text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Package className='text-blue-600' size={32} />
                </div>
                <h3 className='text-xl font-bold mb-2'>Fast Shipping</h3>
                <p className='text-gray-600'>
                  Get your orders delivered in 24-48 hours
                </p>
              </div>
              <div className='bg-white p-8 rounded-xl shadow-md text-center'>
                <div className='bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Star className='text-green-600' size={32} />
                </div>
                <h3 className='text-xl font-bold mb-2'>Quality Products</h3>
                <p className='text-gray-600'>
                  100% authentic products guaranteed
                </p>
              </div>
            </div>
          </div>
          <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16'>
            <div className='max-w-7xl mx-auto px-4 text-center'>
              <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                Ready to Start Shopping?
              </h2>
              <p className='text-xl mb-8'>Join thousands of happy customers</p>
              <button
                onClick={() => setCurrentPage('shop')}
                className='bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition'
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      )}

      {(currentPage === 'shop' || currentPage === 'flash-deals') && (
        <div className='max-w-7xl mx-auto px-4 py-8'>
          {currentPage === 'flash-deals' && (
            <div className='bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-xl mb-8'>
              <h1 className='text-3xl font-bold mb-2'>⚡ Flash Deals</h1>
              <p className='text-lg'>Hurry! These deals won't last long</p>
            </div>
          )}
          {currentPage === 'shop' && (
            <h1 className='text-3xl font-bold mb-8'>All Products</h1>
          )}
          {loading ? (
            <div className='text-center py-20'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
            </div>
          ) : products.length === 0 ? (
            <div className='text-center py-20'>
              <Package size={64} className='mx-auto text-gray-400 mb-4' />
              <p className='text-gray-600'>No products available</p>
            </div>
          ) : (
            <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {products.map((product) => {
                const isFlashDeal = currentPage === 'flash-deals';
                const discount = Math.floor(Math.random() * 50 + 30);
                const displayPrice = isFlashDeal
                  ? product.price * 0.7
                  : product.price;
                return (
                  <div
                    key={product.id}
                    className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition relative'
                  >
                    {isFlashDeal && (
                      <div className='absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10'>
                        -{discount}%
                      </div>
                    )}
                    <div className='h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center'>
                      <Package size={64} className='text-orange-600' />
                    </div>
                    <div className='p-4'>
                      <h3 className='font-bold text-lg mb-2'>{product.name}</h3>
                      <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                        {product.description}
                      </p>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          <span className='text-2xl font-bold text-orange-600'>
                            ${displayPrice.toFixed(2)}
                          </span>
                          {isFlashDeal && (
                            <span className='text-gray-400 line-through text-sm'>
                              ${product.price}
                            </span>
                          )}
                        </div>
                        {!isFlashDeal && (
                          <span className='text-sm text-gray-500'>
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          addToCart({ ...product, price: displayPrice })
                        }
                        className={`w-full py-2 rounded-lg transition font-bold ${
                          isFlashDeal
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {isFlashDeal ? 'Grab Deal Now!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {currentPage === 'cart' && (
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <h1 className='text-3xl font-bold mb-8'>Shopping Cart</h1>
          {cart.length === 0 ? (
            <div className='text-center py-20'>
              <ShoppingCart size={64} className='mx-auto text-gray-400 mb-4' />
              <p className='text-gray-600 mb-4'>Your cart is empty</p>
              <button
                onClick={() => setCurrentPage('shop')}
                className='bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700'
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='md:col-span-2 space-y-4'>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className='bg-white p-6 rounded-xl shadow-md flex gap-4'
                  >
                    <div className='w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Package size={40} className='text-orange-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-bold text-lg mb-2'>{item.name}</h3>
                      <p className='text-orange-600 font-bold mb-2'>
                        ${item.price.toFixed(2)}
                      </p>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className='w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300'
                        >
                          -
                        </button>
                        <span className='font-medium'>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className='w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300'
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-bold text-xl mb-2'>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className='text-red-600 hover:text-red-700 text-sm'
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className='bg-white p-6 rounded-xl shadow-md h-fit'>
                <h2 className='text-2xl font-bold mb-4'>Order Summary</h2>
                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between'>
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Shipping</span>
                    <span className='text-green-600'>FREE</span>
                  </div>
                  <div className='border-t pt-2 flex justify-between font-bold text-xl'>
                    <span>Total</span>
                    <span className='text-orange-600'>
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('checkout')}
                  className='w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-bold'
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentPage === 'checkout' && (
        <div className='max-w-3xl mx-auto px-4 py-8'>
          <h1 className='text-3xl font-bold mb-8'>Checkout</h1>
          <form onSubmit={handleCheckout} className='space-y-6'>
            <div className='bg-white p-6 rounded-xl shadow-md'>
              <h2 className='text-xl font-bold mb-4'>Shipping Information</h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Full Address
                  </label>
                  <textarea
                    value={checkoutForm.shippingAddress}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        shippingAddress: e.target.value,
                      })
                    }
                    required
                    rows={3}
                    placeholder='Street, City, State, ZIP Code'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    value={checkoutForm.phone}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        phone: e.target.value,
                      })
                    }
                    required
                    placeholder='+1 (555) 000-0000'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-md'>
              <h2 className='text-xl font-bold mb-4'>Order Summary</h2>
              <div className='space-y-2'>
                {cart.map((item) => (
                  <div key={item.id} className='flex justify-between'>
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className='border-t pt-2 flex justify-between font-bold text-xl'>
                  <span>Total</span>
                  <span className='text-orange-600'>
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition font-bold text-lg disabled:bg-gray-400'
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      )}

      {currentPage === 'orders' && (
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <h1 className='text-3xl font-bold mb-8'>My Orders</h1>
          {loading ? (
            <div className='text-center py-20'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
            </div>
          ) : orders.length === 0 ? (
            <div className='text-center py-20'>
              <Package size={64} className='mx-auto text-gray-400 mb-4' />
              <p className='text-gray-600 mb-4'>No orders yet</p>
              <button
                onClick={() => setCurrentPage('shop')}
                className='bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700'
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {orders.map((order, index) => (
                <div key={index} className='bg-white p-6 rounded-xl shadow-md'>
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <p className='text-sm text-gray-600'>
                        Order #{order.id || index + 1}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {order.createdAt || 'Recent'}
                      </p>
                    </div>
                    <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'>
                      {order.status || 'Completed'}
                    </span>
                  </div>
                  <div className='border-t pt-4'>
                    <p className='font-medium'>Shipping Address:</p>
                    <p className='text-gray-600'>
                      {order.shippingAddress || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentPage === 'auth' && (
        <div className='max-w-md mx-auto px-4 py-16'>
          <div className='bg-white p-8 rounded-xl shadow-lg'>
            <h1 className='text-3xl font-bold mb-6 text-center'>
              {authForm.mode === 'login' ? 'Login' : 'Register'}
            </h1>
            <form onSubmit={handleAuth} className='space-y-4'>
              {authForm.mode === 'register' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Name
                  </label>
                  <input
                    type='text'
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                    required
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500'
                  />
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                  required
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Password
                </label>
                <input
                  type='password'
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  required
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500'
                />
              </div>
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-bold disabled:bg-gray-400'
              >
                {loading
                  ? 'Processing...'
                  : authForm.mode === 'login'
                  ? 'Login'
                  : 'Register'}
              </button>
            </form>
            <div className='mt-4 text-center'>
              <button
                onClick={() =>
                  setAuthForm({
                    ...authForm,
                    mode: authForm.mode === 'login' ? 'register' : 'login',
                  })
                }
                className='text-orange-600 hover:text-orange-700'
              >
                {authForm.mode === 'login'
                  ? 'Need an account? Register'
                  : 'Have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
