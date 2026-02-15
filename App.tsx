
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, PurchaseRecord, Review } from './types';
import { MOCK_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import PaymentModal from './components/PaymentModal';
import PurchaseHistory from './components/PurchaseHistory';
import Wishlist from './components/Wishlist';
import OrderSuccess from './components/OrderSuccess';
import { getSmartProductRecommendations } from './services/geminiService';

const ITEMS_PER_PAGE = 6;

const App: React.FC = () => {
  const [view, setView] = useState<'market' | 'history' | 'wishlist' | 'order-success'>('market');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [pendingReviewRecord, setPendingReviewRecord] = useState<PurchaseRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastOrder, setLastOrder] = useState<PurchaseRecord | null>(null);
  const [lastProduct, setLastProduct] = useState<Product | null>(null);
  
  const productListRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedPurchases = localStorage.getItem('remoteanswer_purchases');
    if (savedPurchases) {
      try { setPurchases(JSON.parse(savedPurchases)); } catch (e) { console.error(e); }
    }

    const savedReviews = localStorage.getItem('remoteanswer_reviews');
    if (savedReviews) {
      try { setReviews(JSON.parse(savedReviews)); } catch (e) { console.error(e); }
    }

    const savedWishlist = localStorage.getItem('remoteanswer_wishlist');
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error(e); }
    }
  }, []);

  const handlePurchaseSuccess = (record: PurchaseRecord) => {
    setLastOrder(record);
    if (selectedProduct) {
      setLastProduct(selectedProduct);
    }
    
    setPurchases(prev => {
      const updated = [record, ...prev];
      localStorage.setItem('remoteanswer_purchases', JSON.stringify(updated));
      return updated;
    });

    setWishlist(prev => {
      const newWishlist = prev.filter(id => id !== record.productId);
      localStorage.setItem('remoteanswer_wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const handleOrderConfirmed = () => {
    setIsModalOpen(false);
    if (lastOrder && lastProduct) {
      setView('order-success');
    } else {
      setView('history');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddReview = (reviewData: Omit<Review, 'id' | 'date' | 'userName'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      userName: 'Verified Buyer',
    };
    setReviews(prev => {
      const updated = [newReview, ...prev];
      localStorage.setItem('remoteanswer_reviews', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId];
      localStorage.setItem('remoteanswer_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReviewNow = (record: PurchaseRecord) => {
    setIsModalOpen(false);
    setView('history');
    setPendingReviewRecord(record);
  };

  const wishlistItems = useMemo(() => 
    MOCK_PRODUCTS.filter(p => wishlist.includes(p.id)), 
  [wishlist]);

  const categories = ['All', 'STEM', 'Humanities', 'Business', 'Tech'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!searchQuery.trim()) {
      setAiRecommendedIds([]);
      return;
    }

    setIsAiLoading(true);
    const productDataString = MOCK_PRODUCTS.map(p => `ID:${p.id} Name:${p.title}`).join(', ');
    const results = await getSmartProductRecommendations(searchQuery, productDataString);
    setAiRecommendedIds(results.recommendedIds || []);
    setIsAiLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS;
    if (aiRecommendedIds.length > 0) {
      list = list.filter(p => aiRecommendedIds.includes(p.id));
    } else {
      if (selectedCategory !== 'All') {
        list = list.filter(p => p.category === selectedCategory);
      }
      if (searchQuery) {
        list = list.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }
    return list;
  }, [selectedCategory, searchQuery, aiRecommendedIds]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCheckout = (product: Product) => {
    setSelectedProduct(product);
    setLastOrder(null);
    setLastProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <Navbar 
        currentView={view === 'order-success' ? 'market' : view} 
        onViewChange={(v) => { 
          setView(v); 
          setCurrentPage(1); 
        }} 
        wishlistCount={wishlist.length}
      />

      {view === 'market' && (
        <>
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                Expert-Verified Solutions Marketplace
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 max-w-4xl leading-[1.1]">
                Get the Answers You Need, <span className="text-indigo-600">Instantly.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed">
                Premium study guides, homework solutions, and technical deep-dives created by world-class experts. Secure, fast, and digital.
              </p>

              <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                <div className="absolute inset-0 bg-indigo-600/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <div className="relative flex p-2 bg-white rounded-[2rem] shadow-2xl border border-slate-200 focus-within:border-indigo-400 transition-all">
                  <input 
                    type="text" 
                    placeholder="Search for subjects, problems, or guides..." 
                    className="flex-grow bg-transparent outline-none px-6 py-4 text-lg text-slate-800 font-medium placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={isAiLoading}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Search
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </header>

          <main ref={productListRef} className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setAiRecommendedIds([]);
                      setCurrentPage(1);
                    }}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onBuy={openCheckout}
                    reviews={reviews}
                    isInWishlist={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No results found</h3>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {view === 'history' && (
        <PurchaseHistory 
          purchases={purchases} 
          reviews={reviews}
          onBackToMarket={() => setView('market')} 
          onAddReview={handleAddReview}
          reviewingProduct={pendingReviewRecord}
          onClearReviewing={() => setPendingReviewRecord(null)}
        />
      )}

      {view === 'wishlist' && (
        <Wishlist 
          wishlistItems={wishlistItems} 
          reviews={reviews}
          onBuy={openCheckout}
          onToggleWishlist={handleToggleWishlist}
          onBackToMarket={() => setView('market')}
        />
      )}

      {view === 'order-success' && lastOrder && lastProduct ? (
        <OrderSuccess 
          order={lastOrder}
          product={lastProduct}
          onViewLibrary={() => setView('history')}
          onContinueShopping={() => setView('market')}
        />
      ) : view === 'order-success' && (
        <div className="flex-grow flex items-center justify-center p-20">
           <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-400 py-20 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setView('market')}>
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">R</div>
              <span className="text-white font-bold text-lg">RemoteAnswer</span>
            </div>
            <p className="text-sm">Premium digital answers delivered instantly to your device. High-quality expert solutions at your fingertips.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('market')} className="hover:text-white">Marketplace</button></li>
              <li><button onClick={() => setView('wishlist')} className="hover:text-white">Wishlist</button></li>
              <li><button onClick={() => setView('history')} className="hover:text-white">Library</button></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Nairobi Kenya, waiyaki way</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Phone: +254 729 772 746</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Head Office: +254 729 772 746</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-xs">
          <p>© {new Date().getFullYear()} RemoteAnswer. All rights reserved.</p>
        </div>
      </footer>

      <PaymentModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={handleOrderConfirmed}
        onPurchaseSuccess={handlePurchaseSuccess}
        onReviewNow={handleReviewNow}
      />

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/254729772746" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[99] flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group overflow-visible"
        aria-label="Contact us on WhatsApp"
      >
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Chat with an Expert
        </span>
        <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-ping -z-10"></span>
      </a>
    </div>
  );
};

export default App;
