import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Rating } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { IconButton } from '@mui/material';

const theme = createTheme({
  components: {
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: 'black',
          fontSize: '3rem',
        },
        iconEmpty: {
          color: 'black',
          fontSize: '3rem',
        },
      },
    },
  },
});


function BookReviewPage() {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const navigate = useNavigate();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentDateTime(new Date());
      }, 60000);

      return () => clearInterval(interval);
    }, []);
    
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
      setRating(parseFloat(e.target.value));
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
        <Link to="/explore" style={{ textDecoration: 'none' }} className="back-link">
          <IconButton>
            <ArrowBackIcon style={{color:'black', margin:'10px'}}/>
            <p style={{fontSize:'0.75em'}}>Back</p>
          </IconButton>
        </Link>
        <div className="reviewDiv">
            <div className="reviewTitle" style={{display:'flex', marginBottom:'25px'}}> 
              <div style={{display:"flex", alignItems:'center'}}>
                <p style={{marginRight:'30px', marginLeft:'-40px', fontSize:'1.5em'}}><b>Review:</b> <i>{book.title}</i></p>
                <p style={{fontSize:'1.2em'}}>Author: {author}</p>
              </div>
            </div>
          <div style={{display:'flex'}}>
          <img src={cover} alt={book.title} className="bookReviewPicture"/>
          <div style={{display: 'inline'}}>
            <p className="dateString">{currentDateTime.toLocaleDateString()} {currentDateTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
            <div className="stars">
              <ThemeProvider theme={theme}>
                <Rating
                  name="customized-half-rating"
                  value={rating}
                  precision={0.5}
                  onChange={handleRatingChange}
                  size="extr"
                  max={5}
                />
              </ThemeProvider>
            </div>
          <div className="comments-submit">
            <textarea
              placeholder="Write your comments..."
              value={comment}
              onChange={handleCommentChange}
            ></textarea>
            <button style={{marginBottom:'25px'}} className="userButton" onClick={handleSubmit}>
            <div style={{display:'flex'}}>
              <SendIcon style={{ marginLeft: "10px", marginRight: "10px", marginTop: "10px", color:'white'}} />
              <p className="userBtnText">Submit Review</p>
            </div>
          </button>
          </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

export default BookReviewPage;
