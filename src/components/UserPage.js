    import React, { useEffect, useState } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
    import { db, auth } from '../components/firebase';
    import { Helmet } from 'react-helmet';
    import DefaultProfilePic from '../Assets/Profile.jpg'; // Renamed import
    import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
    import { toast } from 'react-toastify';

    const UserPage = () => {
        const { userId } = useParams();
        const [user, setUser] = useState(null);
        const [posts, setPosts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [currentUserId, setCurrentUserId] = useState(null);
        const [isEditing, setIsEditing] = useState(false); // State for toggling edit mode
        const [profileData, setProfileData] = useState({
            fullName: '',
            bio: '',
            profilePic: ''
        });

        const navigate = useNavigate();

        useEffect(() => {
            // Check if user is authenticated
            const unsubscribeAuth = auth.onAuthStateChanged((user) => {
                if (user) {
                    setCurrentUserId(user.uid);
                    // Fetch user data only if user is authenticated
                    if (userId) {
                        fetchUser();
                        fetchPosts();
                    }
                } else {
                    setCurrentUserId(null);
                    setLoading(false);
                }
            });

            // Cleanup subscription on unmount
            return () => unsubscribeAuth();
        }, [userId]);

        const fetchUser = async () => {
            if (!userId) return;
            try {
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUser(userData);
                    setProfileData({
                        fullName: userData.fullName,
                        bio: userData.bio,
                        profilePic: userData.profilePic
                    });
                } else {
                    console.error("User not found");
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data: ", error.message);
                setUser(null);
            }
        };

        const fetchPosts = () => {
            if (!userId) return;

            const q = query(collection(db, 'posts'), where('userId', '==', userId));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const postsData = [];
                querySnapshot.forEach((doc) => {
                    postsData.push({ id: doc.id, ...doc.data() });
                });
                setPosts(postsData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching posts: ", error.message);
                setLoading(false);
            });

            return () => unsubscribe();
        };

        const likePost = async (postId, likes) => {
            if (!currentUserId) {
                toast.error('You must be logged in to like a post.');
                return;
            }

            try {
                const postRef = doc(db, 'posts', postId);
                if (likes.includes(currentUserId)) {
                    await updateDoc(postRef, {
                        likes: likes.filter(id => id !== currentUserId)
                    });
                } else {
                    await updateDoc(postRef, {
                        likes: [...likes, currentUserId]
                    });
                }
            } catch (error) {
                console.error("Error liking or unliking post: ", error.message);
                toast.error(`Error liking or unliking the post: ${error.message}`);
            }
        };

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setProfileData(prevState => ({ ...prevState, [name]: value }));
        };

        const handleProfileUpdate = async (e) => {
            e.preventDefault();
            try {
                const userRef = doc(db, 'users', currentUserId);
                await updateDoc(userRef, profileData);
                toast.success('Profile updated successfully!');
                setIsEditing(false); // Exit edit mode
                fetchUser(); // Refresh user data
            } catch (error) {
                console.error("Error updating profile: ", error.message);
                toast.error(`Error updating profile: ${error.message}`);
            }
        };

        if (loading) {
            return <div className='flex items-center justify-center h-screen'><p>Loading...</p></div>;
        }

        if (!user) {
            return <div className='flex items-center justify-center h-screen'><p>User profile not found.</p></div>;
        }

        return (
            <>
                <Helmet>
                    <title>{user ? `${user.fullName}'s Profile | MySite` : 'User Profile | MySite'}</title>
                    <meta name="description" content={user ? `${user.fullName}'s profile on MySite` : 'User profile on MySite'} />
                </Helmet>

                <div className='flex flex-col items-center mt-5'>
                    <img
                        src={profileData.profilePic || DefaultProfilePic} // Use the renamed import
                        alt={user.fullName}
                        className='w-32 h-32 rounded-full'
                    />
                    <h1 className='text-3xl font-bold mt-3'>{user.fullName}</h1>
                    <p className='mt-1 text-gray-600'>{user.bio || 'No bio available.'}</p>

                    {currentUserId === userId && (
                        <>
                            {isEditing ? (
                                <form onSubmit={handleProfileUpdate} className='mt-5'>
                                    <div className='mb-4'>
                                        <label className='block text-gray-700'>Full Name</label>
                                        <input
                                            type='text'
                                            name='fullName'
                                            value={profileData.fullName}
                                            onChange={handleInputChange}
                                            className='mt-1 p-2 border rounded'
                                            required
                                        />
                                    </div>
                                    <div className='mb-4'>
                                        <label className='block text-gray-700'>Bio</label>
                                        <textarea
                                            name='bio'
                                            value={profileData.bio}
                                            onChange={handleInputChange}
                                            className='mt-1 p-2 border rounded'
                                            rows='3'
                                        />
                                    </div>
                                    <div className='mb-4'>
                                        <label className='block text-gray-700'>Profile Picture URL</label>
                                        <input
                                            type='text'
                                            name='profilePic'
                                            value={profileData.profilePic}
                                            onChange={handleInputChange}
                                            className='mt-1 p-2 border rounded'
                                        />
                                    </div>
                                    <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded'>
                                        Save Changes
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setIsEditing(false)}
                                        className='ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded'
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className='mt-5 px-4 py-2 bg-blue-500 text-white rounded'
                                >
                                    Edit Profile
                                </button>
                            )}
                        </>
                    )}

                    {posts.length === 0 ? (
                        <p className='mt-5'>No posts available.</p>
                    ) : (
                        <div className='w-full max-w-lg mt-5'>
                            {posts.map(post => (
                                <div key={post.id} className='bg-slate-500 rounded-3xl p-5 mb-5'>
                                    <h2 className='text-xl font-bold mb-2'>{post.title}</h2>
                                    <p>{post.description}</p>
                                    {post.media && post.mediaType && (
                                        <div className='mt-3'>
                                            {post.mediaType === 'image' ? (
                                                <img src={post.media} alt='media' className='w-full h-auto rounded-xl' />
                                            ) : post.mediaType === 'video' ? (
                                                <video src={post.media} controls className='w-full h-auto rounded-xl' />
                                            ) : null}
                                        </div>
                                    )}
                                    <p className='mt-2 text-sm text-gray-500'>{post.timestamp?.toDate().toLocaleDateString()}</p>
                                    <div className='flex items-center space-x-3 mt-2'>
                                        <button onClick={() => likePost(post.id, post.likes)}>
                                            {post.likes.includes(currentUserId) ? (
                                                <MdFavorite size={24} className='text-red-500' />
                                            ) : (
                                                <MdFavoriteBorder size={24} />
                                            )}
                                        </button>
                                        <span>{post.likes.length} Likes</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    };

    export default UserPage;
