import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useParams } from 'react-router-dom';

function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const handleSubmit = () => {
      console.log("hey")
      if (searchQuery.trim() !== '') {
        fetchBooks(searchQuery);
      }
    };
  
    const fetchBooks = async (query) => {
      try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=20`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        console.log(data)
        setBooks(data.docs);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    useEffect(() => {
      const fetchInitBooks = async () => {
        try {
          const response = await fetch(
            'https://openlibrary.org/search.json?q=*&sort=want_to_read&limit=20'
          );
  
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
  
          const data = await response.json();
          console.log(data)
          setBooks(data.docs);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchInitBooks();
    }, []);
  
    return (
      <div className="ExplorePage">
        <div className="searchDiv">
          <input
            type="text"
            placeholder="What are we reading next?"
            value={searchQuery}
            onChange={handleSearchChange}
            className="searchField"
          />
          <button onClick={handleSubmit} className="submitButton">Search</button>
        </div>
        <div className="grid-container">
          {books.map((book) => (
            <Link to={`/review/${book.key.split('/').pop()}`} className="grid-item">
              <div key={book.key}>
                  {book.cover_i && (
                    <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt={book.title} />
                  )}
                <p className="bookTitle">{book.title}</p>
                <p>Author: {book.author_name[0]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

export default ExplorePage