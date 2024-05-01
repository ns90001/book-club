import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useParams, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

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
  
  
    const fetchBook = async (key) => {
      let data = null;
      try {
        const response = await fetch(`https://openlibrary.org/works/${key}.json`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        data = await response.json();
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      }
      let authorKey = data.authors[0].author.key
      try {
        const response = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setAuthor(data.name);
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
        bookTitle: book.title,
        bookCover: `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`,
        rating: rating,
        comment: comment,
        userId: user.uid
      };
  
      try {
        // Save the review to Firestore
        await firebase.firestore().collection('ratings').add(newReview);
        console.log('Review added to Firestore successfully');
        // Reset the form state
        const userId = user.uid;
        navigate("/users/:userId");
        setRating(0);
        setComment('');
      } catch (error) {
        console.error('Error adding review to Firestore:', error);
      }
    };
  
    if (!book) {
      return <div>Loading...</div>;
    }
  
    console.log(book)
    console.log(author)
  
    return (
      <div className="BookReviewPage">
        <h1>Book Review</h1>
        <div>
          <img src={`https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`} alt={book.title} />
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

export default BookReviewPage