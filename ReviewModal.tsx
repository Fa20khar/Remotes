
import React, { useState } from 'react';
import { PurchaseRecord, Review } from '../types';

interface ReviewModalProps {
  purchase: PurchaseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'date' | 'userName'>) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ purchase, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen || !purchase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productId: purchase.productId,
      rating,
      comment,
    });
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Share Your Experience</h2>
        <p className="text-slate-500 text-sm mb-6">How was the quality of the answers for <b>{purchase.productTitle}</b>?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Your Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-transform active:scale-90 ${rating >= star ? 'text-amber-500' : 'text-slate-200'}`}
                >
                  <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <span className="mt-2 text-sm font-bold text-slate-700">
              {rating === 5 && "Excellent! Exactly what I needed"}
              {rating === 4 && "Great quality"}
              {rating === 3 && "Good, but could be better"}
              {rating === 2 && "Not what I expected"}
              {rating === 1 && "Very disappointing"}
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Comment (Optional)</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              rows={4}
              placeholder="What did you like or dislike?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Post Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
