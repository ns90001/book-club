import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { Link } from 'react-router-dom';

const BookClubsPage = () => {
  const [bookClubs, setBookClubs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current user from Firebase Authentication
    const fetchCurrentUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setCurrentUser({ ...userData, userId: user.uid });
          }
        } catch (error) {
          console.error('Error fetching current user data:', error);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchBookClubs = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const snapshot = await firebase.firestore().collection('clubs')
          .where('users', 'array-contains', currentUser)
          .get();

        const clubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookClubs(clubs);
      } catch (error) {
        console.error('Error fetching book clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookClubs();
  }, [currentUser]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="BookClubsPage">
      <h1>Your Book Clubs</h1>
      <button>
        <Link to="/newclub">Create New Book Club</Link>
      </button>
      {bookClubs.length > 0 ? (
        <ul>
          {bookClubs.map((club) => (
            <li key={club.id} style={{ marginBottom: '10px' }}>
              <p>{club.clubName}</p>
              <button>
                <Link to={`/bookclub/${club.id}`}>View Book Club</Link>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You are not part of any book clubs.</p>
      )}
    </div>
  );
};

export default BookClubsPage;
