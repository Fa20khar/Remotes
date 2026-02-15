
import React, { useState, useEffect, useRef } from 'react';
import { Product, PaymentStatus, PurchaseRecord } from '../types';

interface PaymentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (record: PurchaseRecord) => void;
  onReviewNow: (record: PurchaseRecord) => void;
}

type PaymentMethodType = 'CARD' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'BANK_TRANSFER' | 'CRYPTO';

const PaymentModal: React.FC<PaymentModalProps> = ({ product, isOpen, onClose, onPurchaseSuccess, onReviewNow }) => {
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CARD');
  const [progress, setProgress] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [lastRecord, setLastRecord] = useState<PurchaseRecord | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setHasDownloaded(false);
      setStatus(PaymentStatus.IDLE);
      setProgress(0);
      setSelectedMethod('CARD');
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSimulatePayment = () => {
    if (status === PaymentStatus.PROCESSING) return;
    
    setStatus(PaymentStatus.PROCESSING);
    let currentProgress = 0;
    
    timerRef.current = window.setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus(PaymentStatus.SUCCESS);
        
        const record: PurchaseRecord = {
          productId: product.id,
          productTitle: product.title,
          thumbnail: product.thumbnail,
          purchaseDate: new Date().toLocaleDateString(),
          orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          price: product.price,
          fileSize: product.fileSize,
          paymentMethod: selectedMethod
        };
        setLastRecord(record);
        onPurchaseSuccess(record);
      }
    }, 100);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,JVBERi0xLjQKJ...'; 
      link.setAttribute('download', `${product.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setHasDownloaded(true);
    } catch (err) {
      console.error("Payment modal download error:", err);
    }
  };

  const getButtonLabel = () => {
    const amount = `$${product.price.toFixed(2)}`;
    switch(selectedMethod) {
      case 'PAYPAL': return `Pay ${amount} with PayPal`;
      case 'APPLE_PAY': return `Pay ${amount} with Apple Pay`;
      case 'GOOGLE_PAY': return `Pay ${amount} with Google Pay`;
      case 'BANK_TRANSFER': return `Pay ${amount} via Bank Transfer`;
      case 'CRYPTO': return `Pay ${amount} with Crypto`;
      default: return `Pay ${amount}`;
    }
  };

  const getMethodIcon = (method: PaymentMethodType) => {
    switch(method) {
      case 'CARD':
        return <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold uppercase italic">VISA</div>;
      case 'PAYPAL':
        return <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-black italic">PayPal</div>;
      case 'APPLE_PAY':
        return (
          <div className="w-10 h-6 bg-black rounded flex items-center justify-center text-white">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.73-3.05 1.71-.98-.02-1.3-.61-2.45-.61-1.16 0-1.52.59-2.45.62-1.01.03-2.14-.81-3.13-1.75-2.02-1.93-3.57-5.45-3.57-8.73 0-3.26 1.63-4.98 3.24-4.98 1.14 0 2.21.78 2.87.78.68 0 1.74-.78 3.12-.78 1.2 0 2.3.61 3.01 1.54-2.58 1.51-2.17 5.2 1.05 6.64-.67 1.68-1.55 3.39-2.44 4.31zm-2.44-16.14c.64-.78 1.08-1.85.96-2.92-.93.04-2.05.62-2.72 1.4-.6.69-1.12 1.78-1.01 2.82.96.07 2.07-.48 2.77-1.3z" /></svg>
          </div>
        );
      case 'GOOGLE_PAY':
        return (
          <div className="w-10 h-6 bg-white border border-slate-200 rounded flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
        );
      case 'BANK_TRANSFER':
        return (
          <div className="w-10 h-6 bg-emerald-600 rounded flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20m4-20v20m4-20v20M3 21h18M3 10l9-7 9 7v11H3V10z" /></svg>
          </div>
        );
      case 'CRYPTO':
        return (
          <div className="w-10 h-6 bg-amber-500 rounded flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={status === PaymentStatus.PROCESSING ? undefined : onClose}
        aria-hidden="true"
      />
      
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {status === PaymentStatus.IDLE && (
          <div className="p-8">
            <h2 id="modal-title" className="text-2xl font-extrabold text-slate-800 mb-2">Complete Purchase</h2>
            <p className="text-slate-500 text-sm mb-6">Choose your preferred payment method to access your expert solution.</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700 truncate mr-4">{product.title}</span>
                <span className="font-bold text-indigo-600 shrink-0">${product.price.toFixed(2)}</span>
              </div>
              <span className="text-xs text-slate-400">High-quality PDF • Instant Delivery</span>
            </div>

            <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-1">
              {(['CARD', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY', 'BANK_TRANSFER', 'CRYPTO'] as PaymentMethodType[]).map((method) => (
                <button 
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedMethod === method ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getMethodIcon(method)}
                    <span className="font-bold text-slate-700 text-sm capitalize">{method.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  {selectedMethod === method && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={handleSimulatePayment}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50"
            >
              {getButtonLabel()}
            </button>
          </div>
        )}

        {status === PaymentStatus.PROCESSING && (
          <div className="p-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-600 transition-all duration-300" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - progress / 100)} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700">
                {progress}%
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Authorizing Payment...</h3>
            <p className="text-slate-400 text-sm">Please do not close this window.</p>
          </div>
        )}

        {status === PaymentStatus.SUCCESS && (
          <div className="p-8 text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-1">Success!</h3>
            <p className="text-slate-500 text-sm mb-6">Payment processed via {selectedMethod.replace('_', ' ')}.</p>
            
            <div className="space-y-3">
              <button 
                onClick={handleDownload}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group ${
                  hasDownloaded ? 'bg-slate-100 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {hasDownloaded ? 'File Downloaded' : `Download PDF (${product.fileSize})`}
              </button>

              <button 
                onClick={onClose}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Continue to My Library
              </button>

              {hasDownloaded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-4 font-medium italic">Help others find quality solutions!</p>
                  <button 
                    onClick={() => lastRecord && onReviewNow(lastRecord)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Post a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
