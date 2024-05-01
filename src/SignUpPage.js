import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'
import logo from "./book-club-logo.png"

const SignUpPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    // Check if email has 'brown.edu' extension
    if (!email.endsWith('@brown.edu')) {
      setError('Please sign up with a Brown University email address');
      return;
    }

    try {
        const credential = await firebase.auth().createUserWithEmailAndPassword(email, password);

        const user = credential.user;

        // Add user to Firestore with additional data
        await firebase.firestore().collection('users').doc(user.uid).set({
            email: email,
            userId: user.uid,
            name: name
        });

        // On success, set the user state
        setUser({ email });
        // Reset form fields and error message
        navigate('/explore');
        setEmail('');
        setPassword('');
        setName('');
        setError('');
    } catch(error) {
        setError(error.message);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginContainer">
        <img src={logo} className="loginLogo"></img>
        <form onSubmit={handleSignUp} className="loginForm">
            <input
            className="loginField"
            type="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
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
            <button type="submit" className="loginButton">Sign Up</button>
        </form>
        {error && <p>{error}</p>}
        <Link to="/"><p className="whiteText" >Already have an account? Log in here.</p></Link>
        </div>
    </div>
  );
};

export default SignUpPage;
