import "./PostCard.css"
import axios from "axios"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"



function PostCard({ post, user, onDelete = () => { } }) {

    console.log("POST:", post)
    const images =
        (Array.isArray(post.images) && post.images.length > 0)
            ? post.images
            : (post.image
                ? (Array.isArray(post.image) ? post.image : [post.image])
                : [])
    const maxVisible = 4
    const visibleImages = images.slice(0, maxVisible)
    const remaining = images.length - maxVisible

    const [likes, setLikes] = useState(post.likes || [])
    const [comments, setComments] = useState([])
    const [text, setText] = useState("")
    const defaultAvatar = "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
    const [replyText, setReplyText] = useState({})
    const [visibleCount, setVisibleCount] = useState(3)
    const rootComments = comments.filter(c => !c.parentId)
    const visibleComments = rootComments.slice(0, visibleCount)
    const [visibleReplies, setVisibleReplies] = useState({})
    const [selectedImage, setSelectedImage] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(null)
    const API = "https://blog-backend-1nh2.onrender.com/api"

    console.log("IMG:", post.images)

    useEffect(() => {
        console.log("POST:", post)
    }, [post])

    const isOwner =
        user &&
        post.author &&
        post.author._id.toString() === user._id
    
    useEffect(() => {
        const handleKey = (e) => {
            if (currentIndex === null) return

            if (e.key === "ArrowRight") {
                setCurrentIndex(prev => Math.min(prev + 1, images.length - 1))
            }
            if (e.key === "ArrowLeft") {
                setCurrentIndex(prev => Math.max(prev - 1, 0))
            }
            if (e.key === "Escape") {
                setCurrentIndex(null)
            }
        }

        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [currentIndex, images.length])
    
    // 👉 LOAD COMMENTS
    useEffect(() => {
        axios.get(`https://blog-backend-1nh2.onrender.com/comments/${post._id}`)
            .then(res => setComments(res.data))
    }, [post._id])

    // 👉 ADD COMMENT
    const handleComment = async () => {

        if (!text.trim()) return

        const token = localStorage.getItem("token")

        const res = await axios.post(
            "https://blog-backend-1nh2.onrender.com/comments",
            {
                content: text,
                postId: post._id
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        setComments([
            ...comments,
            res.data
            
        ])
        setText("")
    }

    const handleLike = async () => {

        const token = localStorage.getItem("token")

        const res = await axios.put(
            `https://blog-backend-1nh2.onrender.com/posts/like/${post._id}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        setLikes(res.data.likes)
    }
    const handleReply = async (parentId) => {

        const token = localStorage.getItem("token")

        const res = await axios.post(
            "https://blog-backend-1nh2.onrender.com/comments",
            {
                content: replyText[parentId],
                postId: post._id,
                parentId
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )

        setComments(prev => [...prev, res.data])

        setReplyText({ ...replyText, [parentId]: "" })
    }

    const handleLikeComment = async (id) => {

        const token = localStorage.getItem("token")

        const res = await axios.put(
            `https://blog-backend-1nh2.onrender.com/comments/like/${id}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )

        setComments(comments.map(c =>
            c._id === id ? res.data : c
        ))
    }
  
    return (
        <div className="post-card">

            {/* HEADER */}
            <div className="post-header">

                <Link to={`/profile/${post.author?._id}`} className="user-link">
                    <img
                        src={post.author?.avatar || defaultAvatar}
                        className="avatar" 
                        alt="avatar"
                    />
                </Link>

                <div>
                    <Link to={`/profile/${post.author?._id}`} className="user-link">
                        <div className="username">
                            {post.author?.username}
                        </div>
                    </Link>

                    <div className="time">
                        {new Date(post.createdAt).toLocaleString()}
                    </div>
                </div>

            </div>

            {/* CONTENT */}
            <h3>{post.title}</h3>

            <div className="post-content">
                {post.content}
            </div>
            {images.length > 0 && (
                <div className="post-images">

                    {visibleImages.map((img, i) => {

                        
                        if (i === maxVisible - 1 && remaining > 0) {
                            return (
                                <div
                                    key={i}
                                    className="image-wrapper"
                                    onClick={() => setCurrentIndex(i)}
                                >
                                    <img
                                        src={img}
                                        className="post-image"
                                        alt="post"
                                    />

                                    <div className="overlay">
                                        +{remaining}
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <img
                                key={i}
                                src={img}
                                className="post-image"
                                alt="post"
                                onClick={() => setSelectedImage(img)}
                            />
                        )
                    })}

                </div>
            )}
            
            {/* ACTIONS */}
            <div className="post-actions">

                <button className="btn like" onClick={handleLike}>
                    ❤️ {likes.length}
                </button>

                {isOwner && (
                    <>
                        <Link to={`/edit/${post._id}`}>
                            <button className="btn">✏️ Edit</button>
                        </Link>
                        <button className="btn" onClick={() => onDelete && onDelete(post._id)}>
                            🗑 Delete
                        </button>
                    </>
                )}

            </div>
            {/* 💬 COMMENTS */}
            <div style={{ marginTop: "15px" }}>

                {/* INPUT */}
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleComment}>Send</button>
                </div>

                {/* LIST */}
                {visibleComments.map(c => {

                    const replies = comments.filter(
                        r => r.parentId?.toString() === c._id.toString()
                    )

                    const visible = replies.slice(0, visibleReplies[c._id] || 2)

                    return (
                        <div key={c._id} className="comment-item">
                            <Link to={`/profile/${c.userId?._id}`} className="user-link">
                            <img
                                src={c.userId?.avatar || defaultAvatar}
                                    className="comment-avatar"
                                    alt="comment-avatar"
                            />
                            </Link>
                            <div>
                                <b>
                                    <Link to={`/profile/${c.userId?._id}`} className="user-link">
                                    {c.userId?.username}
                                    </Link>
                                </b>
                                <div>{c.content}</div>

                                {/* ❤️ LIKE */}
                                <button onClick={() => handleLikeComment(c._id)}>
                                    ❤️ {c.likes?.length || 0}
                                </button>

                                {/* REPLY */}
                                <div style={{ marginLeft: "20px" }}>

                                    {/* 👉 REPLY LIST */}
                                    {visible.map(r => (
                                        <div key={r._id} style={{ marginTop: "5px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <img
                                                    src={r.userId?.avatar || defaultAvatar}
                                                    className="comment-avatar"
                                                    alt="comment-avatar"
                                                />
                                                <div>
                                                    <b>{r.userId?.username}</b>
                                                    <div>{r.content}</div>
                                                </div>
                                            </div>

                                            <button onClick={() => handleLikeComment(r._id)}>
                                                ❤️ {r.likes?.length || 0}
                                            </button>
                                        </div>
                                    ))}

                                    {/*  LOAD MORE REPLY */}
                                    {replies.length > (visibleReplies[c._id] || 2) && (
                                        <button
                                            onClick={() =>
                                                setVisibleReplies(prev => ({
                                                    ...prev,
                                                    [c._id]: (prev[c._id] || 2) + 2
                                                }))
                                            }
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#1877f2",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Xem thêm reply...
                                        </button>
                                    )}

                                    {/* 👉 INPUT REPLY */}
                                    <input
                                        value={replyText[c._id] || ""}
                                        onChange={(e) =>
                                            setReplyText(prev => ({
                                                ...prev,
                                                [c._id]: e.target.value
                                            }))
                                        }
                                        placeholder="Reply..."
                                    />

                                    <button onClick={() => handleReply(c._id)}>
                                        Send
                                    </button>

                                </div>
                            </div>

                        </div>
                    )
                })}
            
                {visibleCount < rootComments.length && (
                    <button
                        onClick={() => setVisibleCount(prev => prev + 3)}
                        style={{
                            marginTop: "10px",
                            background: "none",
                            border: "none",
                            color: "#1877f2",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Xem thêm bình luận...
                    </button>
                )}

            </div>
            
            {selectedImage && (
                <div
                    className="image-modal"
                    onClick={() => setSelectedImage(null)}
                >
                    <span className="close-btn">×</span>

                    <img
                        src={selectedImage}
                        className="modal-image"
                        alt="modal-image"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            {currentIndex !== null && (
                <div className="slider-modal" onClick={() => setCurrentIndex(null)}>

                    {/* Nút đóng */}
                    <span className="close-btn">×</span>

                    {/* Nút trái */}
                    {currentIndex > 0 && (
                        <button
                            className="nav-btn left"
                            onClick={(e) => {
                                e.stopPropagation()
                                setCurrentIndex(prev => prev - 1)
                            }}
                        >
                            ❮
                        </button>
                    )}

                    {/* Ảnh */}
                    <img
                        src={images[currentIndex]}
                        className="slider-image"
                        alt="slider-image"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Nút phải */}
                    {currentIndex < images.length - 1 && (
                        <button
                            className="nav-btn right"
                            onClick={(e) => {
                                e.stopPropagation()
                                setCurrentIndex(prev => prev + 1)
                            }}
                        >
                            ❯
                        </button>
                    )}

                </div>
            )}
        </div>
    )
}

export default PostCard