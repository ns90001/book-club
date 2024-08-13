import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Navbar from './Navbar';
import ReviewsPage from './ReviewsPage.js';
import ExplorePage from "./ExplorePage.js"
import BookReviewPage from "./BookReviewPage.js"
import SignUpPage from "./SignUpPage.js"
import LoginPage from "./LoginPage.js"
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
import UsersPage from './UsersPage';
import ClubForm from './BookClubForm.js';
import BookClubsPage from './BookClubsPage';
import BookClubPage from './BookClubPage';

const firebaseConfig = {
  apiKey: "AIzaSyAgfRASy7swwXQmDm2PiPIInUHi0TCdK-E",
  authDomain: "book-app-d28de.firebaseapp.com",
  projectId: "book-app-d28de",
  storageBucket: "book-app-d28de.appspot.com",
  messagingSenderId: "632379932519",
  appId: "1:632379932519:web:9d9d93ab0a31620ddb79c2",
  measurementId: "G-9XM7F353V9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

firebase.initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState(null); // State to store user information

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser({ email: user.email });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage setUser={setUser} />} />
          <Route path="/review/:bookId" element={<BookReviewPage />} />
          <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/user/:userId" element={<ReviewsPage />} />
          <Route path="/newclub" element={<ClubForm />} />
          <Route path="/clubs" element={<BookClubsPage />} />
          <Route path="/bookclub/:clubId" element={<BookClubPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;