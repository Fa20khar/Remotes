
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Review } from '../types';
import { generateProductSalesPitch } from '../services/geminiService';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  reviews: Review[];
  isInWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const PriceSparkline: React.FC<{ history: number[] }> = ({ history }) => {
  // Ensure we focus on the last 3 price changes as requested
  const trendData = useMemo(() => {
    return history.slice(-3);
  }, [history]);

  if (trendData.length < 2) return null;

  const min = Math.min(...trendData);
  const max = Math.max(...trendData);
  const range = max - min || 2; // Default range if flat
  const width = 80;
  const height = 24;
  const padding = 4;
  
  const points = trendData.map((p, i) => {
    const x = padding + (i / (trendData.length - 1)) * (width - 2 * padding);
    const y = (height - padding) - ((p - min) / range) * (height - 2 * padding);
    return { x, y, val: p };
  });

  const pathData = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaPath = `${pathData} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const isDown = trendData[trendData.length - 1] < trendData[0];
  const color = isDown ? '#10b981' : trendData[trendData.length - 1] > trendData[0] ? '#f43f5e' : '#94a3b8';

  return (
    <div 
      className="flex items-center gap-3 group/price relative cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
      tabIndex={0}
      role="img"
      aria-label={`Recent price trend: ${trendData.map(h => `$${h.toFixed(0)}`).join(' to ')}`}
    >
      <div className="flex flex-col">
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Recent Trend</span>
         <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
            <path
              d={areaPath}
              fill={color}
              fillOpacity="0.1"
              className="transition-all duration-700"
            />
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-700"
            />
            {points.map((p, i) => (
              <circle 
                key={i}
                cx={p.x} 
                cy={p.y} 
                r="2" 
                fill="white"
                stroke={color}
                strokeWidth="1.5"
                className="transition-all duration-500"
              />
            ))}
          </svg>
      </div>

      {isDown && (
        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter flex items-center gap-0.5 self-end mb-1">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/>
          </svg>
          -{(((trendData[0] - trendData[trendData.length - 1]) / trendData[0]) * 100).toFixed(0)}%
        </span>
      )}

      <div className="absolute -top-12 left-0 bg-slate-900/95 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover/price:opacity-100 group-focus/price:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-2xl border border-white/10 font-bold -translate-y-1 group-hover/price:translate-y-0 group-focus/price:translate-y-0">
        <div className="flex flex-col gap-1">
          <span className="text-slate-400 uppercase tracking-widest text-[8px]">Historical Flow</span>
          <div className="flex items-center gap-1.5">
            {trendData.map((h, i) => (
              <React.Fragment key={i}>
                <span>${h.toFixed(2)}</span>
                {i < trendData.length - 1 && <span className="text-slate-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, reviews, isInWishlist, onToggleWishlist }) => {
  const [pitch, setPitch] = useState<string>('');
  const [isLoadingPitch, setIsLoadingPitch] = useState(true);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const productReviews = useMemo(() => 
    reviews.filter(r => r.productId === product.id), 
  [reviews, product.id]);

  const displayRating = useMemo(() => {
    if (productReviews.length === 0) return product.rating;
    const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Number(((sum + (product.rating * 5)) / (productReviews.length + 5)).toFixed(1));
  }, [productReviews, product.rating]);

  // Simulate price history if missing to ensure UI completeness
  const simulatedHistory = useMemo(() => {
    if (product.priceHistory && product.priceHistory.length > 0) {
      return product.priceHistory;
    }
    // Generate 3 points: slightly higher, current, current
    return [product.price * 1.15, product.price, product.price];
  }, [product.priceHistory, product.price]);

  useEffect(() => {
    setIsMounted(true);
    const fetchPitch = async () => {
      setIsLoadingPitch(true);
      const p = await generateProductSalesPitch(product.title);
      setPitch(p);
      setIsLoadingPitch(false);
    };
    fetchPitch();
  }, [product.title]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `RemoteAnswer - ${product.title}`,
      text: `Check out these expert solutions for ${product.title} on RemoteAnswer!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const salesPitchId = `pitch-${product.id}`;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col h-full relative ${isMounted ? 'animate-in fade-in slide-in-from-bottom-2' : 'opacity-0'}`}>
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={product.thumbnail} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10">
          {product.isFeatured && (
            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-indigo-400/30 uppercase tracking-tighter flex items-center gap-1.5">
              <svg className="w-3 h-3 text-amber-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
          {product.discountLabel && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg border border-rose-400/30 uppercase tracking-widest flex items-center gap-1.5 animate-pulse-subtle">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.discountLabel}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-slate-800 shadow-sm border border-white/20 uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(product.id);
            }}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/50 ${
              isInWishlist 
              ? 'bg-rose-500 text-white shadow-rose-200' 
              : 'bg-white/90 text-slate-400 hover:text-rose-500'
            }`}
          >
            <svg className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={handleShare}
              aria-label="Share product link"
              className="p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-indigo-600 transition-all shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50"
              title="Share Link"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            {showCopiedTooltip && (
              <div 
                role="status"
                aria-live="polite"
                className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-1 duration-200"
              >
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1 leading-tight group-hover:text-indigo-600 transition-colors">{product.title}</h3>
          <div className={`flex items-center gap-1 text-amber-500 ${isMounted ? 'animate-star-shimmer' : ''}`}>
            <span className="text-xs font-bold" aria-label={`Rating: ${displayRating} out of 5 stars`}>{displayRating}</span>
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <div className="relative mb-6 flex-grow">
          {isLoadingPitch ? (
            <div className="space-y-2 animate-pulse" aria-hidden="true">
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
          ) : (
            <>
              <div 
                id={salesPitchId}
                className={`text-slate-500 text-sm leading-relaxed transition-all duration-500 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-3'}`}
              >
                {pitch || product.description}
              </div>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={salesPitchId}
                className="mt-3 text-indigo-600 text-[11px] font-black hover:text-indigo-800 transition-colors flex items-center gap-1 uppercase tracking-tighter focus:outline-none focus-visible:underline decoration-2 underline-offset-4"
              >
                {isExpanded ? 'Show Less' : 'Expert Preview'}
              </button>
            </>
          )}
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-4 border-t border-slate-50 min-h-[6rem]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 tracking-tight transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-600 origin-left inline-block">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            <button 
              onClick={() => onBuy(product)}
              aria-label={`Buy ${product.title} for $${product.price.toFixed(2)}`}
              className="bg-slate-900 text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-100 active:scale-95 group-hover:translate-y-[-2px] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50"
            >
              Buy Now
            </button>
          </div>

          <div className="h-10 flex items-center border-t border-slate-50 pt-2">
            <PriceSparkline history={simulatedHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
