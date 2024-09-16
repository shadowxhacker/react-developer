import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../components/firebase';
import { MdOutlineDelete, MdFavoriteBorder, MdFavorite, MdImage, MdVideoLibrary, MdClose } from 'react-icons/md';
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
    const [userProfilePic, setUserProfilePic] = useState('')
    const [loading, setLoading] = useState(false);
    const [followedUsers, setFollowedUsers] = useState(new Set())
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
                        setUserProfilePic(userData.profile_images || 'DefaultProfilePic')
                        setFollowedUsers(new Set(userData.following || []))
                    }
                } catch (error) {
                    console.error("Error fetching user data: ", error.message);
                    toast.error('Error fetching user data.');
                }
            } else {
                setIsLoggedIn(false);
                setCurrentUserId(null);
                setFullName('');
                setUserProfilePic('')
            }
        });
    
        const q = query(collection(db, 'posts'));
        const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
    
            // Sort posts based on timestamp so that the newest posts come first
            const sortedPosts = postsData.sort((a, b) => {
                const aTimestamp = a.timestamp ? a.timestamp.toDate().getTime() : 0;
                const bTimestamp = b.timestamp ? b.timestamp.toDate().getTime() : 0;
                return bTimestamp - aTimestamp; // Newest posts first
            });
    
            setPosts(sortedPosts);
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
    
            if (!currentUser) {
                toast.error('You must be logged in to create a post.');
                return;
            }
    
            let mediaURL = null;
            if (media) {
                mediaURL = await uploadMedia(media);
            }
    
            const newPost = {
                title,
                description,
                media: mediaURL || '',
                mediaType,
                fullName: fullName || 'Anonymous',
                userProfilePic: currentUser.photoURL || userProfilePic,
                timestamp: serverTimestamp(),
                userId: currentUser.uid,
                likes: [],
                comment: []
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


    const followUser = async (userId) => {
        if (!isLoggedIn) {
            toast.error('You must be logged in to follow users.');
            return;
        }
        try {
            const currentUserRef = doc(db, 'users', currentUserId);
            const userToFollowRef = doc(db, 'users', userId);
    
            // Add userId to the current user's following list
            await updateDoc(currentUserRef, {
                following: arrayUnion(userId)
            });
    
            // Add currentUserId to the followed user's followers list
            await updateDoc(userToFollowRef, {
                followers: arrayUnion(currentUserId)
            });
    
            setFollowedUsers(prev => new Set(prev).add(userId));
            toast.success('User followed successfully!');
        } catch (error) {
            console.error("Error following user: ", error.message);
            toast.error(`Error following the user: ${error.message}`);
        }
    };
    
    const unfollowUser = async (userId) => {
        if (!isLoggedIn) {
            toast.error('You must be logged in to unfollow users.');
            return;
        }
    
        try {
            const currentUserRef = doc(db, 'users', currentUserId);
            const userToUnfollowRef = doc(db, 'users', userId);
    
            // Remove userId from the current user's following list
            await updateDoc(currentUserRef, {
                following: arrayRemove(userId)
            });
    
            // Remove currentUserId from the unfollowed user's followers list
            await updateDoc(userToUnfollowRef, {
                followers: arrayRemove(currentUserId)
            });
    
            setFollowedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            toast.success('User unfollowed successfully!');
        } catch (error) {
            console.error("Error unfollowing user: ", error.message);
            toast.error(`Error unfollowing the user: ${error.message}`);
        }
    };
    

    const handleFollowButtonClick = (postUserId) => {
        if (followedUsers.has(postUserId)) {
            unfollowUser(postUserId);
        } else {
            followUser(postUserId);
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
        <div className='bg-[#101010] pt-2 min-h-screen flex flex-col justify-between'>
            <Helmet>
                <title>Your Blog | MySite</title>
                <meta name="description" content="Discover a vibrant community where website developers, hackers, and IT enthusiasts unite!" />
            </Helmet>

            <div className='flex items-center justify-center'>
                {createPostButton}
            </div>

            {isFormOpen && (
                <div className={`fixed inset-0 bg-[#101010] bg-opacity-50 z-50 flex items-center justify-center ${isFormOpen ? 'block' : 'hidden'}`}>
                    <div className='bg-[#171717] p-6 rounded-lg shadow-lg w-full max-w-lg'>
                        <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-xl text-gray-400 font-semibold mb-4">Create a New Post</h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <MdClose size={24} />
                            </button>
                    </div>
                        <input
                            type='text'
                            placeholder='Add Title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='p-2 w-full mb-4 bg-transparent text-gray-300 shadow-inner outline-none'
                        />
                        <textarea
                            placeholder='Add Description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='p-2 w-full resize-none mb-4 bg-transparent text-gray-300 shadow-inner outline-none'
                            rows="4"
                        />
                        <div className='relative mb-4'>
                            <label className='mr-4 cursor-pointer'>
                                <MdImage className='text-[24px] text-gray-400' />
                            <input type="file" accept='image/*' onChange={handleMediaChange} className="hidden" />
                            </label>
                            <label className='mr-4 cursor-pointer'>
                                <MdVideoLibrary className='text-[24px] text-gray-400' />
                            <input type="file" accept='video/*' onChange={handleMediaChange} className="hidden" />
                            </label>
                            <div className='w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center'>
                                {media ? (
                                    mediaType === 'image' ? (
                                        <img src={URL.createObjectURL(media)} alt="Selected" className='w-full h-full object-cover rounded-xl' />
                                    ) : mediaType === 'video' ? (
                                        <video controls className='w-full h-full object-cover rounded-xl'>
                                            <source src={URL.createObjectURL(media)} />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : null
                                ) : (
                                    <span>Select Media</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={submit}
                            className={`w-full bg-blue-500 text-white p-3 rounded-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? <RotatingLines strokeColor="white" strokeWidth="5" animationDuration="0.75" width="24" visible={true} /> : 'Post'}
                        </button>
                    </div>
                </div>
            )}

            <div className='w-full mt-5'>
                {posts.length === 0 && <p className='text-center text-gray-500'>No posts available.</p>}
                {posts.map((post) => (
                    <div key={post.id} className='w-full max-w-lg mx-auto bg-transparent border-b-[0.1px] border-[#8c8c8c] shadow-md p-5 mb-4'>
                        <div className='flex items-center mb-3'>
                            <img
                                src={post.userProfilePic}
                                alt='User Profile'
                                className='w-12 h-12 rounded-full object-cover mr-3 cursor-pointer'
                                onClick={() => viewProfile(post.userId)}
                            />
                            <div className='flex-1'>
                                <p className='font-semibold text-[#EAECEE]'>{post.fullName || 'Anonymous'}</p>
                                <p className='text-sm text-[#EAECEE]'>{formatTimestamp(post.timestamp)}</p>
                            </div>
                            {post.userId !== currentUserId && (
                                <button
                                onClick={() => handleFollowButtonClick(post.userId)}
                                className={`ml-4 py-2 px-4 rounded ${followedUsers.has(post.userId) ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}
                                >
                                    {followedUsers.has(post.userId) ? 'unfollow' : 'Follow'}
                                </button>
                            )}
                        </div>
                        <h2 className='text-xl font-semibold mb-2 text-[#EAECEE]'>{post.title}</h2>
                        <p className='mb-2 text-[#EAECEE]'>{post.description}</p>
                        {post.mediaType === 'image' &&
                        <img
                         src={post.media} 
                         alt='Post Media' 
                         className='w-full h-[500px] object-cover rounded-lg mb-2'
                         />}
                        {post.mediaType === 'video' &&
                            <video controls className='w-full h-[500px] object-cover rounded-lg mb-2'>
                                <source src={post.media} />
                                </video>
                            }
                        <div className='flex items-center justify-between'>
                            <button
                                onClick={() => likePost(post.id, post.likes)}
                                className='flex items-center text-[#EAECEE]'>
                                {post.likes.includes(currentUserId) ? <MdFavorite className='text-white' size={24} /> : <MdFavoriteBorder size={24} />}
                                <span className='ml-2'>{post.likes.length}</span>
                            </button>
                            {isLoggedIn && post.userId === currentUserId && (
                                <button onClick={() => deletePost(post.id, post.media)} className='text-red-500'>
                                    <MdOutlineDelete className='text-2xl' />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default Blog;
