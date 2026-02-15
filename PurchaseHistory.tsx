
import React, { useState, useEffect } from 'react';
import { PurchaseRecord, Review } from '../types';
import ReviewModal from './ReviewModal';

interface PurchaseHistoryProps {
  purchases: PurchaseRecord[];
  reviews: Review[];
  onBackToMarket: () => void;
  onAddReview: (review: Omit<Review, 'id' | 'date' | 'userName'>) => void;
  reviewingProduct?: PurchaseRecord | null;
  onClearReviewing?: () => void;
  highlightOrderId?: string | null;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ 
  purchases, 
  reviews, 
  onBackToMarket, 
  onAddReview,
  reviewingProduct,
  onClearReviewing,
  highlightOrderId
}) => {
  const [selectedForReview, setSelectedForReview] = useState<PurchaseRecord | null>(null);

  useEffect(() => {
    if (reviewingProduct) {
      setSelectedForReview(reviewingProduct);
    }
  }, [reviewingProduct]);

  const handleDownload = (title: string) => {
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReviewForProduct = (productId: string) => {
    return reviews.find(r => r.productId === productId);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {highlightOrderId && (
        <div className="mb-12 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 animate-in zoom-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Purchase Confirmed!</h2>
            <p className="text-emerald-700 font-medium leading-relaxed">Your expert solutions have been added to your library. You can download them anytime below.</p>
          </div>
          <div className="md:ml-auto">
             <span className="inline-block bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">Order: {highlightOrderId}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Library</h1>
          <p className="text-slate-500 font-medium">Access your purchased answers and study materials any time.</p>
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

      {purchases.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your library is empty</h2>
          <p className="text-slate-500 mb-8">Purchase high-quality answers to see them here.</p>
          <button 
            onClick={onBackToMarket}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Start Browsing
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((record) => {
            const existingReview = getReviewForProduct(record.productId);
            const isHighlighted = highlightOrderId === record.orderId;
            
            return (
              <div 
                key={record.orderId} 
                className={`bg-white rounded-3xl border overflow-hidden hover:shadow-xl transition-all group ${
                  isHighlighted ? 'border-emerald-500 ring-2 ring-emerald-100' : 
                  !existingReview ? 'border-indigo-100' : 'border-slate-200'
                }`}
              >
                <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-32 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <img src={record.thumbnail} alt={record.productTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {isHighlighted ? (
                       <div className="absolute inset-0 bg-emerald-600/10 flex items-center justify-center">
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-tighter">Just Added</span>
                      </div>
                    ) : !existingReview && (
                      <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                        <span className="bg-white text-indigo-600 text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-tighter">Unreviewed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-xl text-slate-800">{record.productTitle}</h3>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{record.orderId}</span>
                    </div>
                    <div className="flex wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {record.purchaseDate}
                      </span>
                    </div>
                    {!existingReview && (
                       <p className="text-xs text-indigo-500 mt-2 font-bold animate-pulse">✨ How was it? Leave a review to help others!</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                    <button 
                      onClick={() => handleDownload(record.productTitle)}
                      className={`w-full px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isHighlighted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download PDF
                    </button>
                    
                    {!existingReview && (
                      <button 
                        onClick={() => setSelectedForReview(record)}
                        className="w-full bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Rate & Review
                      </button>
                    )}
                  </div>
                </div>

                {existingReview && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-3.5 h-3.5 fill-current ${existingReview.rating >= s ? 'text-amber-500' : 'text-slate-200'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Review</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed italic">
                        "{existingReview.comment || "Great product, highly recommended!"}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ReviewModal 
        isOpen={!!selectedForReview} 
        purchase={selectedForReview} 
        onClose={() => {
          setSelectedForReview(null);
          onClearReviewing?.();
        }}
        onSubmit={onAddReview}
      />
    </div>
  );
};

export default PurchaseHistory;
