import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Sample product data with enhanced details
const sampleProducts = [
  {
    id: 1,
    name: "Professional Makeup Kit",
    category: "Make up kits",
    price: "₹2,500",
    originalPrice: "₹3,500",
    image: "https://images.pexels.com/photos/1115128/pexels-photo-1115128.jpeg",
    description: "Complete professional makeup kit with brushes and palette",
    detailedDescription: "This comprehensive makeup kit includes everything you need for professional-quality makeup application. Features high-quality brushes, eyeshadow palettes, lipsticks, and foundation in various shades.",
    features: ["Professional brushes", "Multi-shade palette", "Long-lasting formula", "Cruelty-free"],
    options: {
      colors: ["Natural", "Bold", "Classic"],
      sizes: ["Standard", "Mini"]
    },
    rating: 4.8,
    reviewCount: 156
  },
  {
    id: 2,
    name: "Elegant Red Saree",
    category: "Sarees",
    price: "₹4,200",
    originalPrice: "₹5,500",
    image: "https://images.pexels.com/photos/1999895/pexels-photo-1999895.jpeg",
    description: "Beautiful traditional red saree with golden border",
    detailedDescription: "Exquisite handwoven saree made from premium silk fabric. Features intricate golden embroidery and traditional patterns that showcase timeless elegance.",
    features: ["Handwoven silk", "Golden embroidery", "Traditional design", "Blouse included"],
    options: {
      colors: ["Red", "Blue", "Green", "Pink"],
      sizes: ["Free Size"]
    },
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: 3,
    name: "Cotton T-Shirt Collection",
    category: "T-shirts",
    price: "₹799",
    originalPrice: "₹1,200",
    image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
    description: "Comfortable cotton t-shirts in various colors",
    detailedDescription: "Premium 100% cotton t-shirts designed for comfort and style. Pre-shrunk fabric ensures perfect fit wash after wash. Available in multiple colors and sizes.",
    features: ["100% cotton", "Pre-shrunk", "Breathable fabric", "Machine washable"],
    options: {
      colors: ["White", "Black", "Blue", "Gray", "Red"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    rating: 4.6,
    reviewCount: 234
  },
  {
    id: 4,
    name: "Premium Denim Jeans",
    category: "Jeans",
    price: "₹1,899",
    originalPrice: "₹2,800",
    image: "https://images.pexels.com/photos/603022/pexels-photo-603022.jpeg",
    description: "High-quality denim jeans with perfect fit",
    detailedDescription: "Crafted from premium denim fabric with stretch for comfort. Features classic 5-pocket styling, reinforced stitching, and modern fit that flatters all body types.",
    features: ["Stretch denim", "Classic 5-pocket", "Reinforced stitching", "Modern fit"],
    options: {
      colors: ["Blue", "Black", "Gray"],
      sizes: ["28", "30", "32", "34", "36", "38"]
    },
    rating: 4.7,
    reviewCount: 178
  },
  {
    id: 5,
    name: "Ladies Fashion Top",
    category: "Ladies fashion",
    price: "₹1,299",
    originalPrice: "₹2,000",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68",
    description: "Trendy fashion top for modern women",
    detailedDescription: "Contemporary design meets comfort in this stylish fashion top. Made from breathable fabric with elegant cut and modern silhouette. Perfect for both casual and semi-formal occasions.",
    features: ["Contemporary design", "Breathable fabric", "Elegant cut", "Versatile styling"],
    options: {
      colors: ["Pink", "White", "Black", "Blue"],
      sizes: ["S", "M", "L", "XL"]
    },
    rating: 4.5,
    reviewCount: 123
  },
  {
    id: 6,
    name: "Traditional Recipe Book",
    category: "Recipes",
    price: "₹599",
    originalPrice: "₹800",
    image: "https://images.unsplash.com/photo-1542010589005-d1eacc3918f2",
    description: "Collection of traditional and modern recipes",
    detailedDescription: "Comprehensive cookbook featuring over 200 traditional and modern recipes. Includes step-by-step instructions, nutritional information, and beautiful food photography.",
    features: ["200+ recipes", "Step-by-step instructions", "Nutritional info", "Food photography"],
    options: {
      colors: ["Standard"],
      sizes: ["Standard"]
    },
    rating: 4.8,
    reviewCount: 67
  },
  {
    id: 7,
    name: "Bridal Makeup Package",
    category: "Bridal make up",
    price: "₹15,000",
    originalPrice: "₹20,000",
    image: "https://images.pexels.com/photos/1446161/pexels-photo-1446161.jpeg",
    description: "Complete bridal makeup service with premium products",
    detailedDescription: "Exclusive bridal makeup package including pre-wedding consultation, trial session, wedding day makeup, touch-up kit, and professional photography-ready finish.",
    features: ["Pre-wedding consultation", "Trial session", "Wedding day service", "Touch-up kit"],
    options: {
      colors: ["Traditional", "Modern", "Vintage"],
      sizes: ["Full Service"]
    },
    rating: 4.9,
    reviewCount: 45
  },
  {
    id: 8,
    name: "Electronics Bundle",
    category: "Electronics",
    price: "₹8,999",
    originalPrice: "₹12,000",
    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
    description: "Premium electronics accessories bundle",
    detailedDescription: "Complete electronics package including wireless earbuds, power bank, charging cables, phone stand, and protective cases. All accessories are compatible with major brands.",
    features: ["Wireless earbuds", "Power bank", "Multiple cables", "Phone accessories"],
    options: {
      colors: ["Black", "White", "Silver"],
      sizes: ["Standard"]
    },
    rating: 4.6,
    reviewCount: 201
  }
];

// Sample reviews data
const sampleReviews = [
  {
    id: 1,
    customerName: "Priya Sharma",
    rating: 5,
    comment: "Absolutely love the makeup kit! Quality is fantastic and arrived quickly.",
    productId: 1,
    date: "2025-01-15",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b02f?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    customerName: "Arjun Kumar",
    rating: 5,
    comment: "The saree is beautiful and exactly as described. My wife loved it!",
    productId: 2,
    date: "2025-01-14",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    customerName: "Sneha Patel",
    rating: 4,
    comment: "Great quality t-shirts, very comfortable. Will order more colors!",
    productId: 3,
    date: "2025-01-13",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    customerName: "Raj Mehta",
    rating: 5,
    comment: "Perfect fit jeans! Best purchase I've made in a while.",
    productId: 4,
    date: "2025-01-12",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    customerName: "Anita Singh",
    rating: 4,
    comment: "Lovely fashion top, fits perfectly. Good material quality.",
    productId: 5,
    date: "2025-01-11",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    customerName: "Vikram Reddy",
    rating: 5,
    comment: "Amazing recipe book! My family is enjoying all the new dishes.",
    productId: 6,
    date: "2025-01-10",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

const categories = ["All", "Make up kits", "Sarees", "T-shirts", "Jeans", "Ladies fashion", "Recipes", "Bridal make up", "Electronics"];

// Session storage utilities
const SessionStorage = {
  getCustomerInfo: () => {
    const saved = sessionStorage.getItem('customerInfo');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      address: ''
    };
  },
  setCustomerInfo: (info) => {
    sessionStorage.setItem('customerInfo', JSON.stringify(info));
  }
};

// Notification Bar Component
const NotificationBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 relative">
      <div className="text-center font-medium text-sm">
        🎉 MEGA SALE: Get up to 50% OFF on all products! Use code SHOP50 | Free shipping on orders above ₹1000 
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating, size = "sm" }) => {
  const stars = [];
  const sizeClass = size === "lg" ? "text-lg" : "text-sm";
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        className={`${sizeClass} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    );
  }
  
  return <div className="flex">{stars}</div>;
};

// Reviews Section Component
const ReviewsSection = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
          <p className="text-gray-600">Real reviews from real customers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleReviews.map(review => (
            <div key={review.id} className="bg-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <img 
                  src={review.avatar} 
                  alt={review.customerName}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                  <div className="flex items-center">
                    <StarRating rating={review.rating} />
                    <span className="ml-2 text-sm text-gray-600">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic">"{review.comment}"</p>
              <div className="mt-4 text-sm text-gray-500">
                Product: {sampleProducts.find(p => p.id === review.productId)?.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Korean character component with dynamic positioning
const KoreanHelper = ({ showHelper, hoveredElement }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (showHelper && hoveredElement) {
      const rect = hoveredElement.getBoundingClientRect();
      setPosition({
        x: rect.right - 60,
        y: rect.top + 40
      });
    }
  }, [showHelper, hoveredElement]);

  if (!showHelper || !hoveredElement) return null;
  
  return (
    <div 
      className="fixed z-50 animate-bounce pointer-events-none"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        <div className="bg-pink-100 rounded-full p-3 shadow-lg border-2 border-pink-300">
          <div className="text-3xl">🥰</div>
        </div>
        <div className="absolute -top-14 -left-12 bg-white px-3 py-2 rounded-lg shadow-md border text-sm font-medium text-gray-700 whitespace-nowrap">
          Click to order! 💫
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Order Modal Component
const OrderModal = ({ isOpen, onClose, product, onPlaceOrder }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    selectedColor: '',
    selectedSize: '',
    quantity: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Load saved customer info on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedInfo = SessionStorage.getCustomerInfo();
      setCustomerInfo(prev => ({
        // Keep saved user details
        name: savedInfo.name || '',
        email: savedInfo.email || '',
        phone: savedInfo.phone || '',
        address: savedInfo.address || '',
        // Reset order-specific details for new product
        selectedColor: product?.options.colors[0] || '',
        selectedSize: product?.options.sizes[0] || '',
        quantity: 1,
        notes: ''
      }));
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (product && isOpen) {
      setCustomerInfo(prev => ({
        ...prev, // Keep user details (name, email, phone, address)
        selectedColor: product.options.colors[0] || '',
        selectedSize: product.options.sizes[0] || '',
        quantity: 1, // Always reset for new product
        notes: '' // Always reset for new product
      }));
    }
  }, [product, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill all required fields');
      return;
    }
    
    // Save customer info to session (but not order details)
    SessionStorage.setCustomerInfo({
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address
    });
    
    setLoading(true);
    try {
      // Add bot protection fields
      const orderData = {
        ...customerInfo,
        honeypot: '', // Empty honeypot field
        timestamp: new Date().toISOString(), // Form load timestamp
        captcha_answer: null // Could add math captcha later
      };
      
      await onPlaceOrder(orderData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Order Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>
          
          <div className="mb-4">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-xl instagram-shadow"/>
            <h3 className="font-semibold mt-3">{product.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-bold text-green-600">{product.price}</p>
              <div className="flex items-center">
                <StarRating rating={product.rating} />
                <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address *</label>
              <textarea
                name="address"
                autoComplete="street-address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <select
                  value={customerInfo.selectedColor}
                  onChange={(e) => setCustomerInfo({...customerInfo, selectedColor: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {product.options.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <select
                  value={customerInfo.selectedSize}
                  onChange={(e) => setCustomerInfo({...customerInfo, selectedSize: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {product.options.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={customerInfo.quantity}
                onChange={(e) => setCustomerInfo({...customerInfo, quantity: parseInt(e.target.value)})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Special Notes (Optional)</label>
              <textarea
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 h-16 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requests..."
                disabled={loading}
              />
            </div>

            {/* Hidden honeypot field for bot detection */}
            <input
              type="text"
              name="honeypot"
              style={{ display: 'none' }}
              tabIndex="-1"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Order...
                </div>
              ) : (
                'Place Order via Google Sheets'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Instagram-inspired Product Card Component
const ProductCard = ({ product, onOrderClick, onProductClick, onMouseEnter, onMouseLeave }) => {
  return (
    <div 
      className="bg-white rounded-2xl instagram-shadow overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
      onMouseEnter={(e) => onMouseEnter(product.id, e.currentTarget)}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative" onClick={() => onProductClick(product.id)}>
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          SALE
        </div>
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <div className="flex items-center">
            <StarRating rating={product.rating} size="sm" />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 
          className="font-bold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" 
          onClick={() => onProductClick(product.id)}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">{product.price}</span>
              <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <StarRating rating={product.rating} />
              <span className="ml-1">({product.reviewCount})</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 mb-3">
            <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">
              {product.options.colors.length} colors
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {product.options.sizes.length} sizes
            </span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOrderClick(product);
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <span>📧</span>
          Order Now
        </button>
      </div>
    </div>
  );
};

// Product Detail Page Component
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const foundProduct = sampleProducts.find(p => p.id === parseInt(id));
    setProduct(foundProduct);
  }, [id]);

  const handlePlaceOrder = async (customerInfo) => {
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        product_price: product.price,
        selected_color: customerInfo.selectedColor,
        selected_size: customerInfo.selectedSize,
        quantity: customerInfo.quantity,
        notes: customerInfo.notes
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      if (response.data.status === 'success') {
        alert('🎉 Order placed successfully! You will receive a confirmation email shortly.');
        setIsOrderModalOpen(false);
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again or contact support.');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationBar />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Shop
          </button>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl instagram-shadow">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.description}</p>
              <div className="flex items-center mt-3">
                <StarRating rating={product.rating} size="lg" />
                <span className="ml-2 text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-600">{product.price}</span>
              <span className="text-xl text-gray-500 line-through">{product.originalPrice}</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                SALE
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Product Details</h3>
              <p className="text-gray-700 leading-relaxed">{product.detailedDescription}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Available Colors:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.options.colors.map(color => (
                    <span key={color} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Available Sizes:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.options.sizes.map(size => (
                    <span key={size} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedProduct(product);
                setIsOrderModalOpen(true);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <span>📧</span>
              Order Now via Google Sheets
            </button>
          </div>
        </div>
      </main>

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={selectedProduct}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

// Main Shopping Page Component
const ShoppingPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [showHelper, setShowHelper] = useState(false);

  // Filter products based on category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(sampleProducts);
    } else {
      setFilteredProducts(sampleProducts.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory]);

  // Handle order placement
  const handlePlaceOrder = async (customerInfo) => {
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_category: selectedProduct.category,
        product_price: selectedProduct.price,
        selected_color: customerInfo.selectedColor,
        selected_size: customerInfo.selectedSize,
        quantity: customerInfo.quantity,
        notes: customerInfo.notes
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      if (response.data.status === 'success') {
        alert('🎉 Order placed successfully! You will receive a confirmation email shortly.');
        setIsOrderModalOpen(false);
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again or contact support.');
    }
  };

  const handleProductHover = (productId, element) => {
    setHoveredProductId(productId);
    setHoveredElement(element);
    setShowHelper(true);
  };

  const handleProductLeave = () => {
    setHoveredProductId(null);
    setHoveredElement(null);
    setShowHelper(false);
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Bar */}
      <NotificationBar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            🛍️ ShopEasy - Your One-Stop Shop
          </h1>
          <p className="text-center text-gray-600 mt-2">Quality products at amazing prices!</p>
        </div>
      </header>

      {/* Category Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOrderClick={handleOrderClick}
              onProductClick={handleProductClick}
              onMouseEnter={handleProductHover}
              onMouseLeave={handleProductLeave}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </main>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Korean Helper Character */}
      <KoreanHelper 
        showHelper={showHelper}
        hoveredElement={hoveredElement}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={selectedProduct}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 ShopEasy. All rights reserved.</p>
          <p className="mt-2 text-gray-400">Orders processed via Google Sheets for your convenience!</p>
        </div>
      </footer>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ShoppingPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
