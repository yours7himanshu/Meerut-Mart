import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Review = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/${productId}/reviews`);
      if (Array.isArray(response.data)) {
        setReviews(response.data);
      } else if (response.data?.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmit = async () => {
    if (!token && !localStorage.getItem("token")) {
      toast.error("Please login to leave a review.");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write your review.");
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveToken = token || localStorage.getItem("token");
      const effectiveUserName = userName.trim() || localStorage.getItem("name") || "Customer";

      const response = await axios.post(
        `${backendUrl}/api/product/${productId}/reviews`,
        {
          rating,
          reviewText: reviewText.trim(),
          userName: effectiveUserName,
          productId
        },
        {
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
          },
        }
      );

      toast.success(response.data?.message || "Review submitted successfully!");
      setRating(0);
      setReviewText("");
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTokenAndUserInfo = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    const storedUserName = localStorage.getItem("name");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  };

  useEffect(() => {
    fetchTokenAndUserInfo();
    fetchReviews();
  }, [productId]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Leave a Review</h2>

      {userName && (
        <p className="text-center text-gray-600 mb-4">Please give your review, {userName}!</p>
      )}

      {/* Rating System */}
      <div className="flex justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-8 h-8 cursor-pointer transition ${
              (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27l5.18 3.73-1.64-6.03L20.6 9.24l-6.18-.51L12 3 9.58 8.73 3.4 9.24l4.46 5.73L6.18 21z" />
          </svg>
        ))}
      </div>

      {/* Review Input */}
      <textarea
        className="w-full h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        placeholder="Write your review here..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-2.5 rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={rating === 0 || reviewText.trim() === "" || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Submitting Review...</span>
          </>
        ) : (
          'Submit Review'
        )}
      </button>

      {/* Display Submitted Reviews */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-center">User Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500">No reviews yet. Be the first to leave one!</p>
        ) : (
          reviews.map((review, idx) => (
            <div key={review._id || idx} className="mb-4 border p-4 rounded-md shadow-sm">
              <p className="text-sm text-gray-700 mb-1">
                <strong>{review.userName || 'Anonymous'}</strong> 
              </p>
              <div className="flex items-center mb-2">
                {[...Array(Number(review.rating) || 5)].map((_, index) => (
                  <svg
                    key={index}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27l5.18 3.73-1.64-6.03L20.6 9.24l-6.18-.51L12 3 9.58 8.73 3.4 9.24l4.46 5.73L6.18 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-800">{review.reviewText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Review;
