
import React from 'react';
import { Product, Review } from '../types';
import ProductCard from './ProductCard';

interface WishlistProps {
  wishlistItems: Product[];
  reviews: Review[];
  onBuy: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onBackToMarket: () => void;
}

const Wishlist: React.FC<WishlistProps> = ({ wishlistItems, reviews, onBuy, onToggleWishlist, onBackToMarket }) => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-grow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Wishlist</h1>
          <p className="text-slate-500 font-medium">Products you've saved for later.</p>
        </div>
        <button 
          onClick={onBackToMarket}
          className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Marketplace
        </button>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-300">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-8">Save items here to purchase them later.</p>
          <button 
            onClick={onBackToMarket}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Explore Solutions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onBuy={onBuy}
              reviews={reviews}
              isInWishlist={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
