import React, { useState, useEffect } from 'react';
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setDoc, getDoc, doc } from './firebase'; // Ensure doc is imported
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
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchUserData(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userUid) => {
    try {
      const docRef = doc(db, "users", userUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (err) {
      toast.error('Failed to fetch user data');
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePassword(password)) {
      toast.error('Invalid email or password format');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), { fullName, username, email });

      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      toast.success('Sign up successful!');
      navigate('/user-profile'); // Navigate to UserProfile page after signup
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        return;
      }

      setEmail('');
      setPassword('');
      toast.success('Login successful!');
      navigate('/user-profile'); // Navigate to UserProfile page after login
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      toast.success('Logout successful!');
      navigate('/'); // Navigate to home page after logout
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
          <div className="text-center py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-3xl font-bold">{isLoggedIn ? `Welcome ${userData?.fullName}` : 'Welcome'}</h1>
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
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <button onClick={() => setTab('signup')} className={`px-4 py-2 rounded-l-md focus:outline-none transition-colors duration-300 ${tab === 'signup' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    Sign Up
                  </button>
                  <button onClick={() => setTab('login')} className={`px-4 py-2 rounded-r-md focus:outline-none transition-colors duration-300 ${tab === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    Login
                  </button>
                </div>
                {tab === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full Name" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300">Sign Up</button>
                  </form>
                )}
                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300">Login</button>
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
