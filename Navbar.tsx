
import React from 'react';

interface NavbarProps {
  currentView: 'market' | 'history' | 'wishlist';
  onViewChange: (view: 'market' | 'history' | 'wishlist') => void;
  wishlistCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, wishlistCount }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => onViewChange('market')}
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
          R
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">RemoteAnswer</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <button 
          onClick={() => onViewChange('market')}
          className={`transition-colors ${currentView === 'market' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
        >
          Browse
        </button>
        <button 
          onClick={() => onViewChange('wishlist')}
          className={`transition-colors flex items-center gap-1.5 ${currentView === 'wishlist' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
        >
          Wishlist
          {wishlistCount > 0 && (
            <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{wishlistCount}</span>
          )}
        </button>
        <button 
          onClick={() => onViewChange('history')}
          className={`transition-colors ${currentView === 'history' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
        >
          My Library
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => onViewChange('wishlist')}
          className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors"
          title="Wishlist"
        >
          <svg className={`w-6 h-6 ${currentView === 'wishlist' ? 'fill-indigo-600 text-indigo-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
              {wishlistCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => onViewChange('history')}
          className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
          title="My Library"
        >
          <svg className={`w-6 h-6 ${currentView === 'history' ? 'fill-indigo-600 text-indigo-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
