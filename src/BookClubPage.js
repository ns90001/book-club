import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useParams } from 'react-router-dom';

const BookClubPage = () => {
  const { clubId } = useParams();
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchBookClub = async () => {
      try {
        const clubDoc = await firebase.firestore().collection('clubs').doc(clubId).get();
        if (clubDoc.exists) {
          setClubData(clubDoc.data());
        } else {
          console.error('No such book club!');
        }
      } catch (error) {
        console.error('Error fetching book club:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookClub();
  }, [clubId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setCurrentUser(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching current user data:', error);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (clubId) {
      const messagesRef = firebase.firestore().collection('clubs').doc(clubId).collection('messages').orderBy('timestamp');
      const unsubscribe = messagesRef.onSnapshot(snapshot => {
        const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [clubId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    try {
      await firebase.firestore().collection('clubs').doc(clubId).collection('messages').add({
        text: message,
        sender: currentUser.name,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!clubData) {
    return <p>No book club data available.</p>;
  }

  const { clubName, description, frequency, users, activeUser, dueDate } = clubData;

  return (
    <div className="bookClubPage">
      <h1>{clubName}</h1>
      <p>{description}</p>
      <p><strong>Frequency:</strong> Every {frequency} week{frequency > 1 ? 's' : ''}</p>
      <p><strong>Next Book Selection Due:</strong> {new Date(dueDate.seconds * 1000).toLocaleDateString()}</p>
      <h2>Active User</h2>
      {activeUser && (
        <div>
          <p><strong>{activeUser.name}</strong> is currently choosing the book.</p>
        </div>
      )}
      <h2>Members</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>

      <div className="chatBox">
        <div className="messageList">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender === currentUser.name ? 'sent' : 'received'}`}>
              <p><strong>{msg.sender}:</strong> {msg.text}</p>
              <p className="timestamp">{new Date(msg.timestamp?.toDate()).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="chatForm">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default BookClubPage;
