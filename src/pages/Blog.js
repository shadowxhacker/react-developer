import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../components/firebase'; // Import auth and db from firebase.js
import { MdOutlineDelete } from 'react-icons/md';
import { Helmet } from 'react-helmet';

function Blog() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [userProfilePic, setUserProfilePic] = useState('');

    useEffect(() => {
        // Listener for authentication state
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUsername(userData.displayName || 'Anonymous');
                    setUserProfilePic(userData.profilePic || 'https://via.placeholder.com/150'); // Default profile picture
                } else {
                    console.log("No such user document!");
                    setUsername('Anonymous');
                    setUserProfilePic('https://via.placeholder.com/150'); // Default profile picture
                }
            } else {
                setIsLoggedIn(false);
                setUsername('');
                setUserProfilePic('https://via.placeholder.com/150'); // Default profile picture
            }
        });

        // Real-time listener for posts
        const q = query(collection(db, 'posts'));
        const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
            setPosts(postsData);
        });

        // Clean up listeners on component unmount
        return () => {
            unsubscribeAuth();
            unsubscribePosts();
        };
    }, []);

    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleDescriptionChange = (e) => setDescription(e.target.value);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = async () => {
        if (title && description) {
            if (description.length > 5000) {
                toast.error('Description cannot exceed 5000 characters.');
                return;
            }

            try {
                const newPost = {
                    title,
                    description,
                    image: image || null,
                    username, // Save the username with the post
                    userProfilePic: userProfilePic || 'https://via.placeholder.com/150', // Save user profile picture
                    timestamp: serverTimestamp(), // Add timestamp
                };

                // Add the new post to Firestore
                const postRef = doc(collection(db, 'posts'));
                await setDoc(postRef, newPost);

                setTitle('');
                setDescription('');
                setImage(null);
                setIsFormOpen(false);
                toast.success('Post created successfully!');
            } catch (error) {
                console.error("Error adding document: ", error);
                toast.error('Error posting your content.');
            }
        } else {
            toast.error('Title and description are required');
        }
    };

    const deletePost = async (id) => {
        try {
            // Delete the post from Firestore
            await deleteDoc(doc(db, 'posts', id));
            toast.success('Post deleted successfully!');
        } catch (error) {
            console.error("Error deleting document: ", error);
            toast.error('Error deleting the post.');
        }
    };

    const handleCreatePostClick = () => {
        if (isLoggedIn) {
            setIsFormOpen(!isFormOpen); // Toggle form visibility
        } else {
            toast.error('Please sign up or login first!');
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        let date;
        // Check if the timestamp is a Firestore Timestamp object
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            // If it's already a Date object
            date = timestamp;
        } else {
            console.error('Timestamp is not a valid Firestore Timestamp or Date object:', timestamp);
            return '';
        }

        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    };

    return (
        <>
            <Helmet>
                <title>Your Blog | MySite</title>
                <meta name="description" content="Discover a vibrant community where website developers, hackers, and IT enthusiasts unite! At Dev Community, we are dedicated to providing the latest insights, resources, and discussions across the IT landscape. Whether you're a seasoned developer, a cybersecurity expert, or just passionate about technology, our platform is designed to foster collaboration and knowledge sharing." />
                <meta name="keywords" content="blog, website development, cybersecurity, IT community, technology, hacking, coding, web development" />
                <meta property="og:title" content="Your Blog | MySite" />
                <meta property="og:description" content="Read and create posts on our blog platform." />
                <meta property="og:image" content="URL_TO_DEFAULT_IMAGE" />
                <meta property="og:url" content="YOUR_SITE_URL" />
            </Helmet>

            <div className='flex items-center justify-center mt-0'>
                <button
                    className={`bg-blue-500 text-white p-3 rounded-lg ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleCreatePostClick}
                    disabled={!isLoggedIn}
                >
                    {isFormOpen ? 'Close Form' : 'Create New Post'}
                </button>
            </div>

            {isFormOpen && (
                <div className='flex flex-col items-center justify-center w-full h-auto bg-slate-400 relative mt-5'>
                    <div className='w-full max-w-lg bg-slate-500 rounded-3xl p-5'>
                        <input
                            type='text'
                            placeholder='Add Title'
                            value={title}
                            onChange={handleTitleChange}
                            className='w-full px-5 py-2 mb-4 bg-slate-400 rounded-xl border-none outline-none text-lg text-slate-100 font-semibold'
                        />
                        <textarea
                            placeholder='Add Description'
                            value={description}
                            onChange={handleDescriptionChange}
                            className='w-full px-5 py-2 mb-4 bg-slate-400 rounded-xl border-none outline-none text-lg text-slate-100 font-semibold resize-none'
                        />
                        <div className='relative w-full mb-4'>
                            <input
                                type="file"
                                accept='image/*'
                                onChange={handleImageChange}
                                className='text-transparent'
                            />
                            <button
                                className='bg-slate-700 p-3 rounded-3xl w-full text-slate-100 font-bold text-lg mt-2'
                                type='button'
                                onClick={submit}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='bg-gray-50 p-4 md:p-10 flex flex-col items-center justify-center'>
                {posts.map((post) => (
                    <div key={post.id} className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-800 p-4 rounded-xl border max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full relative mb-4'>
                        <div className='flex flex-col sm:flex-row justify-between'>
                            <div className='flex items-center'>
                                <img className='h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-full' src={post.userProfilePic || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjH9CRhnReS_zO5GUYgkToo8ui3amVKgQOmkkHWZ4A1WMnXCCZfnSy_SBeO7XZhYiCRYchHunNo3Gz-aCEv_Fa2auSxLHf3pb4tHzjn2zRp8eNYqMPmDypcA_FlRKfD7CH2XGsVEOTkEHXhFLMuWxOh0BSeKF7hzT_tDPHyc8C0jYCB2zUSJ6UTUvfCBDKc/s320/6ad28c921dd31b98cc53cd0a064d6081.jpg'} alt={post.username} />
                                <div className='ml-3'>
                                    <h2 className='text-lg font-bold text-slate-300'>{post.username}</h2>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>{formatTimestamp(post.timestamp?.toDate())}</p>
                                </div>
                            </div>
                            {isLoggedIn && (
                                <button
                                    className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1'
                                    onClick={() => deletePost(post.id)}
                                >
                                    <MdOutlineDelete size={20} />
                                </button>
                            )}
                        </div>
                        {post.image && (
                            <img src={post.image} alt={post.title} className='w-full h-auto object-cover rounded-lg my-4' />
                        )}
                        <h2 className='text-xl font-semibold text-slate-100 p-1'>{post.title}</h2>
                        <p className='text-md text-gray-800 dark:text-gray-200'>{post.description}</p>
                    </div>
                ))}
            </div>

            <ToastContainer />
        </>
    );
}

export default Blog;
