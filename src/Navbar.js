// Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import logo from './book-club-logo.png'
import SignOutIcon from "./signout-icon.png"
import { IconButton } from '@mui/material';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      navigate('/'); // Navigate to the login screen after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const user = firebase.auth().currentUser;

  const isActiveTab = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="Navbar">
      <div className="navLeft">
        {user &&
        <Link to="/explore">
          <img src={logo} className='logo'/> 
        </Link>
        }
        {!user && 
          <img src={logo} className='logo'/> 
        }
      {user &&
        <ul>
          <li className={`navItem ${isActiveTab('/explore')}`}>
            <Link to="/explore">Explore</Link>
          </li>
          <li className={`navItem ${isActiveTab(`/user/${user.uid}`)}`}>
            {user && <Link to={`/user/${user.uid}`}>My Library</Link>}
          </li>
          <li className={`navItem ${isActiveTab('/users')}`}>
            <Link to="/users">Friends</Link>
          </li>
          <li className={`navItem ${isActiveTab('/clubs')}`}>
            <Link to="/clubs">Book Clubs</Link>
          </li>
        </ul>}
      </div>
      <div className="navLeft">
        <ul>
          <li className="signOut">
            {user && (
              <button onClick={handleSignOut} className="sign-out-button"><img src={SignOutIcon} /></button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
