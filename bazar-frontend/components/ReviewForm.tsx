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
    isShopOwner?: boolean;
}

export default function ReviewForm({ shopId, onReviewSubmitted, isShopOwner = false }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);

    // If user is shop owner, show a message instead of the form
    if (isShopOwner) {
        return (
            <Card className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl sticky top-24">
                <h3 className="text-2xl font-bold text-[#2D2318] mb-6">Write a Review</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-500 text-base">
                        You cannot review your own shop.
                    </p>
                </div>
            </Card>
        );
    }

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
        <Card className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl sticky top-24">
            <h3 className="text-2xl font-bold text-[#2D2318] mb-6">Write a Review</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2318] mb-3">Your Rating</label>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-all transform hover:scale-110 duration-150"
                            >
                                <Star
                                    className={`h-10 w-10 ${
                                        star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    } transition-all`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-[#C99A6E] mt-2 font-medium">★ {rating} out of 5 stars</p>
                    )}
                </div>

                {/* Review Text */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2318] mb-2">Your Review</label>
                    <Textarea
                        placeholder="Share your experience with this shop... (minimum 10 characters)"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="min-h-[120px] bg-gray-50 border border-gray-200 text-[#2D2318] placeholder:text-gray-400 focus:border-[#8B6F47] focus:bg-white resize-none rounded-xl transition"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        {reviewText.length}/500 characters
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading || rating === 0 || reviewText.length < 10}
                    className="w-full bg-[#8B6F47] hover:bg-[#7D5A3F] text-white rounded-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base"
                >
                    <Send className="h-4 w-4" />
                    {loading ? "Submitting..." : "Submit Review"}
                </Button>
            </form>
        </Card>
    );
}
