import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const BookClubForm = () => {
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

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
            setSelectedUsers([{ ...userData, userId: user.uid }]); // Auto-select current user
          }
        } catch (error) {
          console.error('Error fetching current user data:', error);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.trim() === '') {
        const snapshot = await firebase.firestore().collection('users').get();
        const users = snapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }));
        setSearchResults(users);
        return;
      }

      setLoading(true);
      try {
        const snapshot = await firebase.firestore().collection('users').get();
        const users = snapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }));

        const filteredUsers = users.filter(user => {
          const regex = new RegExp(escapeRegExp(searchTerm), 'i');
          return regex.test(user.email);
        });

        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Error searching for users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleUserSelect = (user) => {
    if (user.userId === currentUser.userId) return;
    if (selectedUsers.some(selected => selected.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter(selected => selected.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    if (userId === currentUser.userId) return;
    setSelectedUsers(selectedUsers.filter(user => user.userId !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clubName || !frequency || selectedUsers.length === 0) {
      setError('Please fill out all required fields and select at least one user.');
      return;
    }

    try {
      const randomIndex = Math.floor(Math.random() * selectedUsers.length);
      const randomUser = selectedUsers[randomIndex];
      setActiveUser(randomUser);

      const frequencyInWeeks = parseInt(frequency, 10);
      const dueDate = firebase.firestore.Timestamp.fromDate(new Date(Date.now() + frequencyInWeeks * 7 * 24 * 60 * 60 * 1000));

      const clubDoc = await firebase.firestore().collection('clubs').add({
        clubName,
        description,
        frequency: frequencyInWeeks,
        users: selectedUsers,
        activeUser: randomUser, // Store the active user
        dueDate, // Store the due date
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setShowPopup(true); // Show the popup after creating the club
    } catch (error) {
      console.error('Error creating book club:', error);
      alert('Error creating book club. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="newBookForm">
        <div>
          <label>Club Name:</label>
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Frequency:</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} required>
            <option value="">Select frequency</option>
            <option value="1">1 week</option>
            <option value="2">2 weeks</option>
            <option value="3">3 weeks</option>
            <option value="4">4 weeks</option>
          </select>
        </div>
        <div>
          <label>Add Users:</label>
          <input
            type="text"
            placeholder="Search for users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchField"
          />
        </div>
        {loading ? <p>Searching...</p> : (
          <ul>
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                <li
                  key={index}
                  onClick={() => handleUserSelect(user)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedUsers.some(selected => selected.userId === user.userId) ? (user.userId === currentUser?.userId ? 'lightgreen' : 'lightblue') : 'white',
                  }}
                >
                  {user.name} ({user.email})
                </li>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </ul>
        )}
        <div>
          <label>Selected Users:</label>
          <ul>
            {selectedUsers.map((user, index) => (
              <li key={index}>
                {user.name} ({user.email}) {user.userId !== currentUser?.userId && <button type="button" onClick={() => handleRemoveUser(user.userId)}>Remove</button>}
              </li>
            ))}
          </ul>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create Book Club</button>
      </form>

      {showPopup && (
        <div className="popup">
          <h2>Welcome to {clubName}!</h2>
          <p>{activeUser.name} has been chosen to pick the first book!</p>
          <p>The next book selection is due on {new Date(Date.now() + frequency * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
          <button onClick={() => {
            setShowPopup(false)
            setClubName('');
            setDescription('');
            setFrequency('');
            setSelectedUsers([currentUser]);
            setError('');
          }}>Close</button>
        </div>
      )}
    </div>
  );
};

export default BookClubForm;
