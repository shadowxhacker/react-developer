import React, { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { doc, onSnapshot, updateDoc, collection, addDoc, deleteDoc, getDoc, where, query, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

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
            setImage(URL.createObjectURL(file)); // Preview the selected image
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
        const uploadTask = uploadBytes(storageRef, imageFile);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                (error) => {
                    console.error("Error uploading image: ", error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error("Error getting image URL: ", error);
                        reject(error);
                    }
                }
            );
        });
    };

    const handleSaveChanges = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            let imageURL = image; // Use the current image URL as default

            if (imageFile) {
                imageURL = await uploadImage();
            }

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                userName,
                bio,
                profileImage: imageURL || currentUser.photoURL // Use existing image if upload fails
            });

            // Update local state to reflect changes
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
                mediaURL = await uploadImage(); // Changed from uploadMedia to uploadImage
            }

            const newPost = {
                title,
                description,
                media: mediaURL || '',
                mediaType,
                fullName: currentUser.displayName || 'Anonymous',
                userProfilePic: currentUser.photoURL || '',
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

    const handleFollowUser = async (userId) => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                following: arrayUnion(userId)
            });
        } catch (error) {
            console.error("Error following user: ", error.message);
            toast.error('Error following user.');
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
                                <textarea
                                    placeholder="Bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-800 text-white"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mb-4"
                                />
                                {imageFile && <img src={image} alt="Preview" className="w-32 h-32 object-cover mb-4" />}
                                <button
                                    onClick={handleSaveChanges}
                                    className="w-full p-2 bg-blue-500 text-white rounded mb-4"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="w-full p-2 bg-red-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="w-full p-2 bg-blue-500 text-white rounded mb-6"
                            >
                                Edit Profile
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-center text-red-500">Please log in to manage your profile.</p>
                )}
            </div>

            {currentUser && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold mb-4">Create a Post</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-800 text-white"
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-800 text-white"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setMedia(e.target.files[0]);
                            setMediaType(e.target.files[0] ? e.target.files[0].type : "");
                        }}
                        className="mb-4"
                    />
                    {media && <img src={URL.createObjectURL(media)} alt="Media Preview" className="w-32 h-32 object-cover mb-4" />}
                    <button
                        onClick={submit}
                        className="w-full p-2 bg-blue-500 text-white rounded"
                    >
                        Create Post
                    </button>
                </div>
            )}

            {posts.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
                    {posts.map((post) => (
                        <div key={post.id} className="mb-4 p-4 border border-gray-700 rounded bg-gray-800">
                            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                            <p className="mb-2">{post.description}</p>
                            {post.media && <img src={post.media} alt="Post Media" className="w-full h-auto mb-2" />}
                            <div className="flex justify-between items-center mt-2">
                                <button
                                    onClick={() => handleLikePost(post.id, currentUser.uid)}
                                    className="p-2 bg-green-500 text-white rounded"
                                >
                                    {post.likes.includes(currentUser.uid) ? 'Unlike' : 'Like'}
                                </button>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="p-2 bg-red-500 text-white rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Profile;
