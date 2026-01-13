import React, { useState } from 'react';
import { X, Star, Send, Loader2, MessageSquare } from 'lucide-react';
import { api } from '../utils/api';

const RatingModal = ({ job, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert('Please select a rating');

        setLoading(true);
        try {
            await api.post(`/jobs/${job.id}/rate`, { rating, comment });
            alert('Thank you for your feedback!');
            onSuccess();
        } catch (err) {
            console.error('Failed to submit rating', err);
            alert('Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="relative h-32 bg-indigo-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
                    </div>
                    <div className="relative text-center">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Rate the Work</h2>
                        <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mt-1">Job: {job.title}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">How was the performance?</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 transition-transform active:scale-90"
                                >
                                    <Star
                                        size={36}
                                        className={`${
                                            (hover || rating) >= star 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'text-gray-200'
                                        } transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="mt-4 text-sm font-black text-indigo-600 uppercase tracking-widest">
                                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Needs Improvement' : 'Disappointing'}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Feedback (Optional)</label>
                            <div className="relative">
                                <MessageSquare className="absolute top-3.5 left-4 text-gray-300" size={18} />
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about the work quality..."
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Rating</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;
