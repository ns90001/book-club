import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import logo from "./book-club-logo.png"

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        setUser({ email });
        // Reset form fields and error message
        navigate("/explore");
        setEmail('');
        setPassword('');
        setError('');
    } catch (error) {
        setError(error.message);
    }
    
  };

  return (
    <div className="loginPage">
      <div className="loginContainer">
        <img src={logo} className="loginLogo"></img>
        <form onSubmit={handleLogin} className="loginForm">
            <input
            className="loginField"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            className="loginField"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button type="submit" className="loginButton">Login</button>
        </form>
        {error && <p>{error}</p>}
        <Link to="/signup"><p className="whiteText">Don't have an account? Sign up here.</p></Link>
      </div>
    </div>
  );
};

export default LoginPage;
