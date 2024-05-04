import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';


const StarRating = ({ rating }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        // Render a filled black star
        stars.push(<StarIcon key={i} style={{ color: 'black' }} />);
      } else {
        // Render a outlined black star filled with white
        stars.push(<StarBorderIcon key={i} style={{ color: 'black', opacity: '0.3' }} />);
      }
    }
    return stars;
  };
  
  return (
    <div>
      {renderStars()}
    </div>
  );
};

function ReviewsPage() {
  const { userId } = useParams();
  const [userReviews, setUserReviews] = useState([]);
  const [userEmail, setUserEmail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(null);

  const handleReviewClick = (index) => {
    setSelectedReviewIndex((prevIndex) => (prevIndex === index ? null : index));
    console.log(selectedReviewIndex)
  };

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

  // delete button code;
  // <div className="delete-button">
  //   <IconButton
  //     onClick={() => handleDeleteReview(index, review.id)}
  //   >
  //     <MoreHorzIcon />
  //   </IconButton>
  // </div>


  const getPagesRead = () => {
    let count = 0;
    userReviews.map((review, index) => {
      let pages = review.numPages;
      if (pages === undefined || pages < 1) {pages = 250}
      count = count + pages;
    });
    return count;
  };

  return (
    <div className="ReviewsPage">
      <div className="user-info-container">
        <AccountBalanceIcon style={{ marginRight: "10px", marginTop: "0px" }} />
        <p>{userEmail}'s Library</p>
      </div>
      <div className="reviewTitles"> 
        <p className="bigText">{userReviews.length} {userReviews.length == 1 ? 'book' : 'books'} read</p>
        <p className="bigText">{getPagesRead().toLocaleString()} pages read</p>
      </div>
      {userReviews.length === 0 ? (
        <p>No reviews submitted yet.</p>
      ) : (
        <div className="reviewGrid">
          {userReviews.map((review, index) => (
            <div key={index} className={`grid-item reviewTile ${selectedReviewIndex === index ? 'selected' : ''}`} onClick={() => handleReviewClick(index)}>
              <div className="delete-button">
                <IconButton
                   onClick={() => handleDeleteReview(index, review.id)}
                 >
                  <MoreHorizIcon />
                </IconButton>
              </div>
              <img src={review.bookCover} alt={review.bookTitle} style={{width: '128px', height: '192px'}}/>
              <p>{review.bookTitle}</p>
              <StarRating rating={review.rating} />
              {selectedReviewIndex === index && (
                <div className="reviewComments">
                  <p>Comments:</p>
                  <p>"{review.comment}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsPage;
