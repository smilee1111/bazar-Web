"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { createShopReview } from "@/lib/api/shopReview";

interface ReviewFormProps {
    shopId: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewForm({ shopId, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (reviewText.trim().length < 10) {
            toast.error("Review must be at least 10 characters long");
            return;
        }

        setLoading(true);

        try {
            const reviewData = {
                starNum: rating,
                reviewName: reviewText,
            };

            const response = await createShopReview(shopId, reviewData);

            if (response.success) {
                toast.success("Review submitted successfully!");
                setRating(0);
                setReviewText("");
                onReviewSubmitted?.();
            } else {
                toast.error(response.message || "Failed to submit review");
            }
        } catch (error: any) {
            console.error("Error submitting review:", error);
            toast.error(error.message || "Error submitting review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-white/95 backdrop-blur-sm border border-[#efefef]">
            <h3 className="text-xl font-bold text-[#2c2416] mb-6">Write a Review</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-semibold text-[#2c2416] mb-3">Rating</label>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${
                                        star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-[#8f7e4f] mt-2">You rated: {rating} out of 5 stars</p>
                    )}
                </div>

                {/* Review Text */}
                <div>
                    <label className="block text-sm font-semibold text-[#2c2416] mb-2">Your Review</label>
                    <Textarea
                        placeholder="Share your experience with this shop... (minimum 10 characters)"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="min-h-[120px] border-[#d4c5a0] focus:border-[#8f7e4f] resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        {reviewText.length}/500 characters
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading || rating === 0 || reviewText.length < 10}
                    className="w-full bg-[#8f7e4f] text-white hover:bg-[#7a6b45] rounded-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    {loading ? "Submitting..." : "Submit Review"}
                </Button>
            </form>
        </Card>
    );
}
