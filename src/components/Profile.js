import React, { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { doc, onSnapshot, updateDoc, collection, addDoc, deleteDoc, getDoc, where, query, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Profile = () => {
    const [userName, setUserName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState("");

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserName("");
                setBio("");
                setImage(null);
                setFollowersCount(0);
                setPosts([]);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (currentUser) {
            const fetchUserData = async () => {
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const unsubscribe = onSnapshot(userDocRef, (doc) => {
                        if (doc.exists()) {
                            const userData = doc.data();
                            setUserName(userData.userName || "");
                            setBio(userData.bio || "");
                            setImage(userData.profileImage || currentUser.photoURL || "");
                            setFollowersCount(userData.followers ? userData.followers.length : 0);
                        } else {
                            setUserName("");
                            setBio("");
                            setImage(currentUser.photoURL || "");
                            setFollowersCount(0);
                        }
                    });

                    return () => unsubscribe();
                } catch (error) {
                    console.error("Error fetching user data: ", error);
                    toast.error("Error fetching user data.");
                }
            };

            const fetchUserPosts = async () => {
                try {
                    const postsRef = collection(db, "posts");
                    const q = query(postsRef, where("userId", "==", currentUser.uid));
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const userPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setPosts(userPosts);
                    });
            
                    return () => unsubscribe();
                } catch (error) {
                    console.error("Error fetching user posts: ", error);
                    toast.error("Error fetching user posts.");
                }
            };

            fetchUserData();
            fetchUserPosts();
        }
    }, [currentUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImage(URL.createObjectURL(file));
        }
    };

    const handleProfileRedirect = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
        try {
            await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image: ", error);
            toast.error("Error uploading image.");
            return null;
        }
    };
    
    

    const handleSaveChanges = async () => {
        if (!currentUser) return;
    
        setLoading(true);
        try {
            let imageURL = image; // Use the current image URL as default
    
            if (imageFile) {
                imageURL = await uploadImage(); // Get the new image URL after upload
            }
    
            // Update user's profile in Firebase Auth
            await currentUser.updateProfile({
                photoURL: imageURL
            });
    
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                userName,
                bio,
                profileImage: imageURL || currentUser.photoURL
            });
    
            setImage(imageURL || currentUser.photoURL);
    
            toast.success("Profile updated successfully!");
            setEditMode(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast.error("Error updating profile.");
        } finally {
            setLoading(false);
        }
    };
    

    const submit = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to create a post.');
            return;
        }
    
        setLoading(true);
        try {
            let mediaURL = '';
            if (media) {
                mediaURL = await uploadImage(); // Upload media (image/video) for the post
            }
    
            const newPost = {
                title,
                description,
                media: mediaURL || '',
                mediaType,
                fullName: currentUser.displayName || 'Anonymous',
                userProfilePic: currentUser.photoURL || 'default-profile.jpg',  // Ensure user's profile picture is saved
                timestamp: new Date(),
                userId: currentUser.uid,
                likes: []
            };
    
            await addDoc(collection(db, 'posts'), newPost);
            toast.success('Post created successfully!');
            setTitle('');
            setDescription('');
            setMedia(null);
            setMediaType('');
        } catch (error) {
            console.error("Error creating post: ", error.message);
            toast.error('Error creating post.');
        } finally {
            setLoading(false);
        }
    };
    

    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, 'posts', postId));
            toast.success('Post deleted successfully!');
        } catch (error) {
            console.error("Error deleting post: ", error.message);
            toast.error('Error deleting post.');
        }
    };

    const handleLikePost = async (postId, userId) => {
        try {
            const postRef = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
                const postData = postSnap.data();
                const liked = postData.likes.includes(userId);
                if (liked) {
                    await updateDoc(postRef, { likes: arrayRemove(userId) });
                } else {
                    await updateDoc(postRef, { likes: arrayUnion(userId) });
                }
            }
        } catch (error) {
            console.error("Error liking post: ", error.message);
            toast.error('Error liking post.');
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-900 text-white shadow-lg rounded-lg max-w-lg">
            <h1 className="text-4xl font-extrabold mb-6 text-center text-pink-400 neon-text">Profile</h1>
            {loading && <p className="text-center text-gray-400 animate-pulse">Loading...</p>}
            <div className="flex flex-col items-center">
                <img
                    src={image || (currentUser ? currentUser.photoURL : '')}
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover border-4 border-purple-500 neon-border mb-4 transition-transform transform hover:scale-105"
                />
                <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-blue-300 neon-text">{userName || "Anonymous"}</p>
                    <p className="text-gray-400">{bio || "No bio available"}</p>
                    <p className="text-gray-400">Followers: {followersCount}</p>
                </div>
                {currentUser ? (
                    <>
                        {editMode ? (
                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="New Username"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-800 text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="New Bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-800 text-white"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-800 text-white"
                                />
                                <button
                                    onClick={handleSaveChanges}
                                    className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg neon-button transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="w-full mt-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg neon-button transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-center text-red-400">Please sign in to edit your profile.</p>
                )}
            </div>

            {/* Display user posts */}
            <div className="w-full mt-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-400 neon-text">Posts</h2>
                {posts.map(post => (
                    <div key={post.id} className="bg-gray-800 p-4 mb-4 rounded-lg shadow-lg">
                        <div className="flex items-center mb-4">
                        <img
                            src={post.userProfilePic || 'default-profile.jpg'}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 neon-border mr-4"
                            onClick={() => handleProfileRedirect(post.userId)}
                            style={{ cursor: 'pointer' }}
                        />
                            <div>
                                <p className="font-bold text-blue-300 neon-text" onClick={() => handleProfileRedirect(post.userId)} style={{ cursor: 'pointer' }}>
                                    {post.fullName || 'Anonymous'}
                                </p>
                                <p className="text-gray-400">{new Date(post.timestamp.seconds * 1000).toLocaleString()}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-purple-300">{post.title}</h3>
                        <p className="text-gray-400 mb-4">{post.description}</p>
                        {post.media && (
                            <img src={post.media} alt="Post media" className="w-full h-48 object-cover rounded-lg mb-4" />
                        )}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleLikePost(post.id, currentUser ? currentUser.uid : '')}
                                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg neon-button"
                            >
                                {post.likes.includes(currentUser ? currentUser.uid : '') ? 'Unlike' : 'Like'}
                            </button>
                            <button
                                onClick={() => handleDeletePost(post.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
