import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, setDoc, collection, query, onSnapshot, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CommentSection } from 'react-comments-section';
import 'react-comments-section/dist/index.css'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../components/firebase';
import { MdOutlineDelete, MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { Helmet } from 'react-helmet';
import { RotatingLines } from 'react-loader-spinner';

const Blog = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [posts, setPosts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [userProfilePic, setUserProfilePic] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyToCommentId, setReplyToCommentId] = useState(null)

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);


     const handleCommentSubmit = async (postId, commentData, parentCommentId = null) => {
        const postRef = doc(db, 'posts', postId);
        try {
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
                const post = postSnap.data();
                let updatedComments = [...(post.comments || [])];
                
                if (parentCommentId) {
                    updatedComments = updatedComments.map(comment => {
                        if (comment.id === parentCommentId) {
                            const updatedReplies = [...(comment.replies || []), commentData];
                            return { ...comment, replies: updatedReplies };
                        }
                        return comment;
                    });
                } else {
                    updatedComments.push(commentData);
                }
                await updateDoc(postRef, { comments: updatedComments });
                toast.success('Comment added successfully!');
            }
        } catch (error) {
            console.log('Error submitting comment: ', error);
            toast.error('Failed to add comment.');
        }
    };

    const renderComments = (comments) => {
        return comments.map(comment => (
            <div key={comment.id} className='comment'>
                <div>{comment.text}</div>
                <button onClick={() => openReplyForm(comment.id)}>Reply</button>
                {comment.replies && (
                    <div className='replies'>
                        {renderComments(comment.replies)}
                    </div>
                )}
            </div>
        ));
    };

    const openReplyForm = (commentId) => {
        setReplyToCommentId(commentId);
    };

    const handleReplySubmit = (postId, replyText) => {
        const replyData = {
            id: generateUniqueId(),
            text: replyText,
            timestamp: serverTimestamp(),
        };
        handleCommentSubmit(postId, replyData, replyToCommentId);
        setReplyToCommentId(null);
    };

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
                        setUsername(userData.displayName || 'Anonymous');
                        setUserProfilePic(userData.profilePic || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjH9CRhnReS_zO5GUYgkToo8ui3amVKgQOmkkHWZ4A1WMnXCCZfnSy_SBeO7XZhYiCRYchHunNo3Gz-aCEv_Fa2auSxLHf3pb4tHzjn2zRp8eNYqMPmDypcA_FlRKfD7CH2XGsVEOTkEHXhFLMuWxOh0BSeKF7hzT_tDPHyc8C0jYCB2zUSJ6UTUvfCBDKc/s320/6ad28c921dd31b98cc53cd0a064d6081.jpg');
                    } else {
                        setUsername('Anonymous');
                        setUserProfilePic('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjH9CRhnReS_zO5GUYgkToo8ui3amVKgQOmkkHWZ4A1WMnXCCZfnSy_SBeO7XZhYiCRYchHunNo3Gz-aCEv_Fa2auSxLHf3pb4tHzjn2zRp8eNYqMPmDypcA_FlRKfD7CH2XGsVEOTkEHXhFLMuWxOh0BSeKF7hzT_tDPHyc8C0jYCB2zUSJ6UTUvfCBDKc/s320/6ad28c921dd31b98cc53cd0a064d6081.jpg');
                    }
                } catch (error) {
                    console.error("Error fetching user data: ", error.message);
                    toast.error('Error fetching user data.');
                }
            } else {
                setIsLoggedIn(false);
                setCurrentUserId(null);
                setUsername('');
                setUserProfilePic('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjH9CRhnReS_zO5GUYgkToo8ui3amVKgQOmkkHWZ4A1WMnXCCZfnSy_SBeO7XZhYiCRYchHunNo3Gz-aCEv_Fa2auSxLHf3pb4tHzjn2zRp8eNYqMPmDypcA_FlRKfD7CH2XGsVEOTkEHXhFLMuWxOh0BSeKF7hzT_tDPHyc8C0jYCB2zUSJ6UTUvfCBDKc/s320/6ad28c921dd31b98cc53cd0a064d6081.jpg');
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
                    console.error("Error uploading media: ", error.message);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref)
                        .then(resolve)
                        .catch((error) => {
                            console.error("Error getting media URL: ", error.message);
                            reject(error);
                        });
                }
            );
        });
    };

    const submit = async () => {
        if (title && description) {
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
                    username,
                    userProfilePic: userProfilePic || 'https://via.placeholder.com/150',
                    timestamp: serverTimestamp(),
                    userId: currentUser.uid,
                    likes: [] // Initialize likes array
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
        } else {
            toast.error('Title and description are required');
        }
    };

    const deletePost = async (id) => {
        try {
            await deleteDoc(doc(db, 'posts', id));
            toast.success('Post deleted successfully!');
        } catch (error) {
            console.error("Error deleting document: ", error.message);
            toast.error(`Error deleting the post: ${error.message}`);
        }
    };

    const likePost = async (postId, likes) => {
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
                <div className='flex flex-col items-center justify-center w-full h-autorelative mt-5'>
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
                        <button onClick={submit} className='bg-blue-500 text-white p-3 rounded-2xl'>
                            {loading ? <RotatingLines strokeColor="white" strokeWidth="5" animationDuration="0.75" width="24" visible={true} /> : 'Submit'}
                        </button>
                    </div>
                </div>
            )}

            <div className='flex flex-col items-center mt-5'>
                {posts.map((post) => (
                    <div key={post.id} className='w-full max-w-lg bg-gray-200 p-5 mb-5 border-[1px] border-blue-300 rounded-3xl'>
                        <div className='flex items-center mb-2'>
                            <img src={post.userProfilePic} alt={post.username} className='w-12 h-12 rounded-full mr-2' />
                            <span className='font-semibold'>{post.username}</span>
                        </div>
                        <h2 className='text-xl font-bold'>{post.title}</h2>
                        <p className='mt-2'>{post.description}</p>
                        {post.media && (
                            post.mediaType === 'image' ? (
                                <img src={post.media} alt='Post media' className='mt-4 max-w-full rounded-xl' />
                            ) : (
                                <video src={post.media} controls className='mt-4 max-w-full rounded-xl' />
                            )
                        )}
                        <div className='flex items-center mt-4'>
                            {post.likes && post.likes.includes(currentUserId) ? (
                                <MdFavorite
                                    onClick={() => likePost(post.id, post.likes || [])}
                                    className='text-red-500 text-2xl cursor-pointer'
                                />
                            ) : (
                                <MdFavoriteBorder
                                    onClick={() => likePost(post.id, post.likes || [])}
                                    className='text-gray-500 text-2xl cursor-pointer'
                                />
                            )}
                            <span className='ml-2'>{(post.likes || []).length} Likes</span>
                            {post.userId === currentUserId && (
                                <MdOutlineDelete
                                    onClick={() => deletePost(post.id)}
                                    className='text-red-500 text-2xl cursor-pointer ml-auto'
                                />
                            )}
                        </div>
                        <div className='text-sm text-gray-500 mt-2'>{formatTimestamp(post.timestamp)}</div>
                        <div className='w-full'>
                            {isLoggedIn && (
                                <CommentSection
                                currentUser={{
                                    currentUserId,
                                    currentUserImg: userProfilePic,
                                    currentUserFullName: username,
                                    currentUserFullName: username
                                }}
                                logIn={{
                                    signupLink: '/signup',
                                }}
                                commentData={post.comments || []}
                                onSubmitAction={(commentData) => handleCommentSubmit(post.id, commentData)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ToastContainer />
        </>
    );
};

export default Blog;
