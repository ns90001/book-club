import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useParams } from 'react-router-dom';

function capitalizeFirstLetter(sentence) {
  const words = sentence.split(" ");
  for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  return words.join(" ");
}

function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (searchQuery.trim() !== '') {
          fetchBooks(searchQuery);
        }
      }
    };
  
    const handleSubmit = () => {
      if (searchQuery.trim() !== '') {
        fetchBooks(searchQuery);
      }
    };
  
    const fetchBooks = async (query) => {
      try {
        console.log(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&orderBy=relevance`)
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&orderBy=relevance`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        console.log(data);
        const transformedBooks = data.items.map(transformGoogleBook);
        console.log(transformedBooks)
        setBooks(transformedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    const transformGoogleBook = (book) => {
      let cover = `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`;
      let isbn = book.id;
      if (book.volumeInfo.industryIdentifiers != undefined) {
        let isbnIdentifiers = book.volumeInfo.industryIdentifiers.filter(identifier => identifier.type === 'ISBN_10');
        isbn = isbnIdentifiers.length > 0 ? isbnIdentifiers[0].identifier : 'ISBN not available';
      }
      return {
        id: isbn,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
        cover: cover
      };
    };

    useEffect(() => {
      const fetchInitBooks = async () => {
        try {
          const response = await fetch(
            'https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=jBKInnoj01fZQMA9gQHNyvkQXT8QAMFH'
          );
  
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
  
          const data = await response.json();
          console.log(data);
          const transformedBooks = data.results.books.map(transformNYTBook);
          setBooks(transformedBooks);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchInitBooks();
    }, []);

    const transformNYTBook = (book) => {
      return {
        id: book.primary_isbn10,
        title: capitalizeFirstLetter(book.title.toLowerCase()),
        author: book.author,
        cover: book.book_image
      };
    };
  
    return (
      <div className="ExplorePage">
        <div className="searchDiv">
          <input
            type="text"
            placeholder="What are we reading next?"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="searchField"
          />
          <button onClick={handleSubmit} className="submitButton">Search</button>
        </div>
        <div className="grid-container">
          {books.map((book) => (
            <Link to={`/review/${book.id}`} className="grid-item" key={book.id}>
              <div>
                {book.cover && (
                  <img src={book.cover} alt={book.title} style={{ width: '128px', height: '192px' }}/>
                )}
                <p className="bookTitle">{book.title}</p>
                <p>Author: {book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
}

export default ExplorePage;
