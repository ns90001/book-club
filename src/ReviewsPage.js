import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';

function ReviewsPage() {
  const { userId } = useParams();
  const [userReviews, setUserReviews] = useState([]);
  const [userEmail, setUserEmail] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserEmail(userData.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserReviews = async () => {
      setLoading(true);
      try {
        const snapshot = await firebase.firestore().collection('ratings').where('userId', '==', userId).get();
        const reviews = snapshot.docs.map(doc => doc.data());
        setUserReviews(reviews);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchUserReviews();
  }, [userId]);

  const handleDeleteReview = async (index, reviewId) => {
    try {
      // Delete the review from Firestore
      await firebase.firestore().collection('ratings').doc(reviewId).delete();
      console.log('Review deleted successfully');
      // Update the local state to reflect the changes
      setUserReviews(prevReviews => prevReviews.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="MyReviewsPage">
      <h1>{userEmail}'s Reviews</h1>
      {userReviews.length === 0 ? (
        <p>No reviews submitted yet.</p>
      ) : (
        <ul>
          {userReviews.map((review, index) => (
            <li key={index}>
              <img src={review.bookCover} alt={review.bookTitle} />
              <h2>{review.bookTitle}</h2>
              <p>Rating: {review.rating}</p>
              <p>Comment: {review.comment}</p>
              <button onClick={() => handleDeleteReview(index, review.id)}>Delete Review</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReviewsPage;
