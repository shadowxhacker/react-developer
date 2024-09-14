import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; // Import from firebase.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
  const [tab, setTab] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null); // State to hold user data
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in when the component mounts
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchUserData(user.email); // Fetch user data when logged in
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userEmail) => {
    try {
      const docRef = doc(db, "users", userEmail); // Updated to use `db`
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (err) {
      toast.error('Failed to fetch user data');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Invalid email address');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Store user data in Firestore
      await setDoc(doc(db, "users", email), { fullName, username }); // Updated to use `db`
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      toast.success('Sign up successful!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Invalid email address');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null); // Clear user data on logout
      toast.success('Logout successful!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <div className="text-center py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-3xl font-bold">Welcome</h1>
            <p className="mt-2">Join our amazing community</p>
          </div>
          <div className="p-8">
            {isLoggedIn ? (
              <div className="flex flex-col items-center">
                {userData && (
                  <p className="text-center text-gray-600 mb-4">
                    Welcome back, {userData.fullName} ({userData.username})!
                  </p>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setTab('signup')}
                    className={`px-4 py-2 rounded-l-md focus:outline-none transition-colors duration-300 ${
                      tab === 'signup' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setTab('login')}
                    className={`px-4 py-2 rounded-r-md focus:outline-none transition-colors duration-300 ${
                      tab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                </div>
                {tab === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        placeholder="Full Name"
                      />
                      <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        placeholder="Username"
                      />
                      <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        placeholder="Email"
                      />
                      <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        placeholder="Password"
                      />
                      <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                    >
                      Sign Up
                    </button>
                  </form>
                )}
                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        placeholder="Email"
                      />
                      <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        placeholder="Password"
                      />
                      <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                    >
                      Login
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Signup;
