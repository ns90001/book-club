import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchUsers = async () => {
        if (searchTerm.trim() === '') {
          const snapshot = await firebase.firestore().collection('users').get();
          const users = snapshot.docs.map(doc => doc.data());
          setSearchResults(users);
          return;
        }
  
        setLoading(true);
        try {
          const snapshot = await firebase.firestore().collection('users').get();
          const users = snapshot.docs.map(doc => doc.data());
  
          // Filter users based on fuzzy match
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
      }, 300); // debounce time in milliseconds
  
      return () => clearTimeout(debounceTimeout);
    }, [searchTerm]);
  
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
  
    return (
      <div className="UsersPage">
        <h1>Search Users</h1>
        <input
          type="text"
          placeholder="Enter email address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? <p>Searching...</p> : (
          <ul>
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                <li key={index}>
                    <Link to={`/user/${user.userId}`}>{user.email}</Link>
                </li>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </ul>
        )}
      </div>
    );
  }
  
  export default UsersPage;