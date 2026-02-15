
import React, { useState } from 'react';
import { Product, PurchaseRecord } from '../types';

interface OrderSuccessProps {
  order: PurchaseRecord;
  product: Product;
  onViewLibrary: () => void;
  onContinueShopping: () => void;
}

const DetailedPriceChart: React.FC<{ history: number[]; currentPrice: number }> = ({ history, currentPrice }) => {
  const data = [...(history || []), currentPrice].filter(v => typeof v === 'number' && !isNaN(v));
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 300;
  const height = 80;
  const padding = 10;

  const points = data.map((p, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = (height - padding) - ((p - min) / range) * (height - 2 * padding);
    return { x, y, val: p };
  });

  // Create smooth Bezier path
  const pathData = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, "");

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const fillPath = `${pathData} L ${lastPoint.x},${height} L ${firstPoint.x},${height} Z`;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
      <div className="flex justify-between items-end mb-4">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Price Trend Insight</h4>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Best Price Found</span>
          <span className="text-lg font-black text-emerald-600">${min.toFixed(2)}</span>
        </div>
      </div>
      <div className="relative h-20">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#chartGradient)" />
          <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i} className="group/dot">
              <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" className="drop-shadow-sm transition-all group-hover/dot:r-5" />
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-4 text-[11px] text-slate-500 font-medium italic">
        * You purchased this at the current market optimized rate.
      </p>
    </div>
  );
};

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, product, onViewLibrary, onContinueShopping }) => {
  const [copiedReferral, setCopiedReferral] = useState(false);
  
  if (!order || !product) return null;

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,JVBERi0xLjQKJ...'; 
      link.setAttribute('download', `${product.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const referralCode = `RA-${order.orderId.split('-')[1] || 'SAVE20'}`;
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in zoom-in duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6 shadow-xl shadow-emerald-50">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Order Complete!</h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium">
          Thank you for your purchase. Your digital expert solution is ready for immediate use.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                  <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified Solution</span>
                    <span className="text-xs font-bold text-slate-400">Order ID: {order.orderId}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">{product.title}</h2>
                  <div className="flex gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 uppercase">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {product.pages} Pages
                    </span>
                    <span className="flex items-center gap-1.5 uppercase">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {product.fileSize} PDF
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleDownload}
                  className="flex-grow bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Your Copy
                </button>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">Secure link active for 30 days.</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="px-2 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-indigo-600 shadow-sm z-10">
                  +42 buyers
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shrink-0">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-grow text-center md:text-left">
               <h3 className="text-2xl font-black text-slate-800 mb-2">Refer a Friend, Get 20% Off!</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">
                 Share RemoteAnswer with your friends. When they make their first purchase, you'll receive a 20% discount code for your next solution.
               </p>
               <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                 <input 
                   readOnly 
                   value={referralLink} 
                   className="bg-transparent border-none outline-none text-xs text-slate-600 px-3 flex-grow font-mono"
                 />
                 <button 
                   onClick={copyReferral}
                   className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all flex items-center gap-2"
                 >
                   {copiedReferral ? (
                     <>
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       Copied!
                     </>
                   ) : (
                     <>
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                       Copy Link
                     </>
                   )}
                 </button>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DetailedPriceChart history={product.priceHistory || []} currentPrice={product.price} />
          
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-xl font-black mb-4">What's Next?</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">1</div>
                <p className="text-sm font-medium">Download your PDF to any device for offline study.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">2</div>
                <p className="text-sm font-medium">Access this file anytime from your secure Library.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">3</div>
                <p className="text-sm font-medium">Leave a review to earn credits for your next guide.</p>
              </li>
            </ul>
            <div className="space-y-3">
              <button 
                onClick={onViewLibrary}
                className="w-full bg-white text-indigo-600 py-4 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg"
              >
                Go to My Library
              </button>
              <button 
                onClick={onContinueShopping}
                className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-400 transition-all border border-indigo-400/50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
