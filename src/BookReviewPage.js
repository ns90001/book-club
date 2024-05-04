import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { v4 as uuidv4 } from 'uuid';

function BookReviewPage() {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const navigate = useNavigate();
  
    useEffect(() => {
      fetchBook(bookId);
    }, [bookId]);
  
  
    const fetchBook = async (id) => {
      let data = null;
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        data = await response.json();
        data = data.items[0]
        setBook(data.volumeInfo);
        setAuthor(data.volumeInfo.authors[0]); // Assuming only one author for simplicity
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };
  
    const handleRatingChange = (e) => {
      setRating(parseInt(e.target.value));
    };
  
    const handleCommentChange = (e) => {
      setComment(e.target.value);
    };
  
    const handleSubmit = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.error('User is not authenticated.');
        return;
      }
  
      const newReview = {
        id: uuidv4(),
        bookTitle: book.title,
        bookCover: `https://books.google.com/books/publisher/content/images/frontcover/${getIDFromURL(book.infoLink)}?fife=w400-h600&source=gbs_api`,
        rating: rating,
        comment: comment,
        userId: user.uid,
        numPages: book.pageCount
      };
  
      try {
        // Save the review to Firestore
        await firebase.firestore().collection('ratings').add(newReview);
        console.log('Review added to Firestore successfully');
        // Reset the form state
        const userId = user.uid;
        navigate(`/user/${userId}`);
        setRating(0);
        setComment('');
      } catch (error) {
        console.error('Error adding review to Firestore:', error);
      }
    };
  
    if (!book) {
      return <div>Loading...</div>;
    }

    function getIDFromURL(url) {
      // Regular expression to match the ID in the URL
      var idRegex = /id=([^&]+)/;
      
      // Match the ID in the URL using the regular expression
      var match = url.match(idRegex);
      
      // Check if there is a match and return the ID
      if (match && match[1]) {
          return match[1];
      } else {
          // If no match found, return null or handle it accordingly
          return null;
      }
  }

    const id = getIDFromURL(book.infoLink)
    const cover = `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w400-h600&source=gbs_api`
    console.log(cover)

    return (
      <div className="BookReviewPage">
        <h1>Book Review</h1>
        <div>
          <img src={cover} alt={book.title} style={{ width: '128px', height: '192px' }}/>
          <h2>{book.title}</h2>
          <p>Author: {author}</p>
        </div>
        <div>
          <h2>Rate this book</h2>
          <select value={rating} onChange={handleRatingChange}>
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value} Star(s)</option>
            ))}
          </select>
        </div>
        <div>
          <h2>Comments</h2>
          <textarea
            placeholder="Write your comments..."
            value={comment}
            onChange={handleCommentChange}
          ></textarea>
        </div>
        <button onClick={handleSubmit}>Submit Review</button>
      </div>
    );
  }

export default BookReviewPage;
