import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import logo from './book-club-logo-notext.png'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

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
        <div className="searchDiv">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchField"
            style={{'width': '700px'}}
          />
        </div>
        {loading ? <p>Searching...</p> : (
          <ul>
            {searchResults.length > 0 ? (
              searchResults.map((user, index) => (
                  <div key={index} className="userTile">
                      <p className="userName">{user.name}</p>
                      <p className='email'>{user.email}</p>
                      <button className="userButton">
                        <Link to={`/user/${user.userId}`}>
                          <div style={{display:'flex'}}>
                            <AccountBalanceIcon style={{ marginLeft: "10px", marginRight: "10px", marginTop: "10px", color:'white'}} />
                            <p className="userBtnText">View Library</p>
                          </div>
                        </Link>
                      </button>
                      <button className="userButton">
                        <Link to={`/user/${user.userId}`}>
                          <div className="button2">
                            <img className="btnLogo" src={logo} ></img>
                            <p className="userBtnText2">Add to Book Club</p>
                          </div>
                        </Link>
                      </button>
                  </div>
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