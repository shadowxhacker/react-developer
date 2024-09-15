import React, { useState, useEffect, createContext, useContext } from 'react';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, db, storage } from './firebase';

// Create UserContext
const UserContext = createContext();

// Custom hook to use UserContext
export function useUser() {
  return useContext(UserContext);
}

function Profile() {
  const [userData, setUserData] = useState(null);
  const [file, setFile] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState(''); // Add bio state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setProfileImage(docSnap.data().profileImage || ''); // Set initial profile image URL
            setBio(docSnap.data().bio || ''); // Set initial bio
          } else {
            toast.error('No user data found');
          }
        } catch (err) {
          toast.error('Failed to fetch user data');
        }
      } else {
        navigate('/'); // Redirect to home if no user is logged in
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('No user logged in');
      return;
    }

    try {
      const storageRef = ref(storage, `profileImages/${user.uid}/${file.name}`);
      const uploadTask = uploadBytes(storageRef, file);

      uploadTask.then(async (snapshot) => {
        try {
          const downloadURL = await getDownloadURL(snapshot.ref);
          await updateDoc(doc(db, "users", user.uid), {
            profileImage: downloadURL,
            bio: bio || '' // Ensure bio is not undefined
          });
          setProfileImage(downloadURL);
          toast.success('Profile image updated');
        } catch (error) {
          console.error('Failed to get download URL', error);
          toast.error('Failed to get download URL');
        }
      }).catch((error) => {
        console.error('Upload failed', error);
        toast.error('Upload failed');
      });
    } catch (err) {
      console.error('Failed to upload image', err);
      toast.error('Failed to upload image');
    }
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('No user logged in');
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        bio: bio || '' // Ensure bio is not undefined
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error('Failed to update profile');
    }
  };

  return (
    <UserContext.Provider value={{ profileImage }}>
      <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
            <div className="text-center py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <h1 className="text-3xl font-bold">User Profile</h1>
            </div>
            <div className="p-8">
              {userData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={profileImage || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto mb-4"
                    />
                  </div>
                  <p className="text-gray-600">Full Name: {userData.fullName}</p>
                  <p className="text-gray-600">Username: {userData.username}</p>
                  <p className="text-gray-600">Email: {userData.email}</p>
                  <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={handleBioChange}
                    className="w-full p-2 mb-2 border border-gray-300 rounded"
                  />
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  <button
                    onClick={handleUpload}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Upload Profile Image
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save Profile
                  </button>
                </div>
              ) : (
                <p className="text-gray-600">Loading user data...</p>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </UserContext.Provider>
  );
}

export default Profile;
