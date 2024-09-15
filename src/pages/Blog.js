import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../components/firebase';
import { MdOutlineDelete, MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { Helmet } from 'react-helmet';
import { RotatingLines } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [posts, setPosts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [fullName, setFullName] = useState('');
    const [userProfilePic, setUserProfilePic] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                setCurrentUserId(user.uid);

                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setFullName(userData.fullName);
                        setUserProfilePic(userData.profilePic || '');
                    }
                } catch (error) {
                    console.error("Error fetching user data: ", error.message);
                    toast.error('Error fetching user data.');
                }
            } else {
                setIsLoggedIn(false);
                setCurrentUserId(null);
                setFullName('');
                setUserProfilePic('');
            }
        });

        const q = query(collection(db, 'posts'));
        const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
            setPosts(postsData);
        }, (error) => {
            console.error("Error fetching posts: ", error.message);
            toast.error('Error fetching posts.');
        });

        return () => {
            unsubscribeAuth();
            unsubscribePosts();
        };
    }, []);

    const formatTimestamp = useCallback((timestamp) => {
        if (!timestamp) return '';

        let date;
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return '';
        }

        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }, []);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type;
            if (fileType.startsWith('image/')) {
                setMediaType('image');
            } else if (fileType.startsWith('video/')) {
                setMediaType('video');
            } else {
                setMediaType('');
                setMedia(null);
                toast.error('Only image and video files are allowed.');
                return;
            }

            setMedia(file);
        }
    };

    const uploadMedia = async (file) => {
        const storageRef = ref(storage, `media/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    console.error("Error uploading media: ", error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref)
                        .then(resolve)
                        .catch((error) => {
                            console.error("Error getting media URL: ", error);
                            reject(error);
                        });
                }
            );
        });
    };

    const submit = async () => {
        if (!title || !description) {
            toast.error('Title and description are required.');
            return;
        }

        if (description.length > 5000) {
            toast.error('Description cannot exceed 5000 characters.');
            return;
        }

        setLoading(true);

        try {
            const currentUser = auth.currentUser;

            let mediaURL = null;
            if (media) {
                mediaURL = await uploadMedia(media);
            }

            const newPost = {
                title,
                description,
                media: mediaURL,
                mediaType,
                fullName,
                userProfilePic,
                timestamp: serverTimestamp(),
                userId: currentUser.uid,
                likes: []
            };

            const postRef = doc(collection(db, 'posts'));
            await setDoc(postRef, newPost);

            setTitle('');
            setDescription('');
            setMedia(null);
            setIsFormOpen(false);
            toast.success('Post created successfully!');
        } catch (error) {
            console.error("Error adding document: ", error.message);
            toast.error(`Error posting your content: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (id, mediaURL) => {
        try {
            await deleteDoc(doc(db, 'posts', id));
            if (mediaURL) {
                const mediaRef = ref(storage, mediaURL);
                await deleteObject(mediaRef);
            }
            toast.success('Post deleted successfully!');
        } catch (error) {
            console.error("Error deleting document: ", error.message);
            toast.error(`Error deleting the post: ${error.message}`);
        }
    };

    const likePost = async (postId, likes) => {
        if (!isLoggedIn) {
            toast.error('You must be logged in to like a post.');
            return;
        }
        try {
            const postRef = doc(db, 'posts', postId);
            if (likes.includes(currentUserId)) {
                // Unlike the post
                await updateDoc(postRef, {
                    likes: likes.filter(id => id !== currentUserId)
                });
            } else {
                // Like the post
                await updateDoc(postRef, {
                    likes: [...likes, currentUserId]
                });
            }
        } catch (error) {
            console.error("Error liking or unliking post: ", error.message);
            toast.error(`Error liking or unliking the post: ${error.message}`);
        }
    };

    const viewProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const createPostButton = useMemo(() => (
        <button
            className={`bg-blue-500 text-white p-3 rounded-lg ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setIsFormOpen(prev => !prev)}
            disabled={!isLoggedIn}
        >
            {isFormOpen ? 'Close Form' : 'Create New Post'}
        </button>
    ), [isLoggedIn, isFormOpen]);

    return (
        <>
            <Helmet>
                <title>Your Blog | MySite</title>
                <meta name="description" content="Discover a vibrant community where website developers, hackers, and IT enthusiasts unite!" />
            </Helmet>

            <div className='flex items-center justify-center mt-5'>
                {createPostButton}
            </div>

            {isFormOpen && (
                <div className='flex flex-col items-center justify-center w-full h-auto mt-5'>
                    <div className='w-full max-w-lg bg-slate-500 rounded-3xl p-5'>
                        <input
                            type='text'
                            placeholder='Add Title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='w-full px-5 py-2 mb-4 bg-slate-400 rounded-xl'
                        />
                        <textarea
                            placeholder='Add Description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='w-full px-5 py-2 mb-4 bg-slate-400 rounded-xl'
                        />
                        <div className='relative w-full mb-4'>
                            <input type="file" accept='image/*,video/*' onChange={handleMediaChange} className='text-transparent' />
                        </div>
                        <button
                            onClick={submit}
                            className='bg-blue-500 text-white px-5 py-2 rounded-xl'
                            disabled={loading}
                        >
                            {loading ? <RotatingLines width="20" color="white" /> : 'Submit'}
                        </button>
                    </div>
                </div>
            )}

            <div className='flex flex-col items-center mt-5'>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className='w-full max-w-lg bg-gray-800 text-white rounded-lg p-5 mb-5'>
                            <div className='flex items-center mb-3 cursor-pointer' onClick={() => viewProfile(post.userId)}>
                                <img
                                    src={post.userProfilePic || 'defaultProfilePicUrl'} // Default profile pic URL if not available
                                    alt={post.fullName}
                                    className='w-12 h-12 rounded-full mr-3'
                                />
                                <div>
                                    <div className='text-lg font-bold'>{post.fullName}</div>
                                    <div className='text-sm text-gray-400'>{formatTimestamp(post.timestamp)}</div>
                                </div>
                            </div>
                            <h2 className='text-xl font-bold mb-2'>{post.title}</h2>
                            <p className='text-md mb-2'>{post.description}</p>
                            {post.media && (
                                post.mediaType === 'image' ? (
                                    <img src={post.media} alt='Post media' className='w-full rounded-xl mb-2' />
                                ) : (
                                    <video controls className='w-full rounded-xl mb-2'>
                                        <source src={post.media} type={`video/${post.media.split('.').pop()}`} />
                                        Your browser does not support the video tag.
                                    </video>
                                )
                            )}
                            <div className='flex items-center'>
                                <button onClick={() => likePost(post.id, post.likes)}>
                                    {post.likes.includes(currentUserId) ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
                                </button>
                                <div className='ml-2'>{post.likes.length}</div>
                                {isLoggedIn && currentUserId === post.userId && (
                                    <button
                                        className='ml-auto bg-red-500 text-white px-3 py-1 rounded-lg'
                                        onClick={() => deletePost(post.id, post.media)}
                                    >
                                        <MdOutlineDelete size={24} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts available.</p>
                )}
            </div>

            <ToastContainer />
        </>
    );
};

export default Blog;
