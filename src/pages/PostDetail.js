import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import "./PostDetail.css"

function PostDetail() {

    const { id } = useParams()

    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])   
    const [newComment, setNewComment] = useState("") 

    const handleComment = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        const res = await axios.post(
            "https://blog-backend-1nh2.onrender.com/comments",
            {
                content: newComment,
                postId: id
            },
            {
                headers: {
                    Authorization: token
                }
            }
        )

        setComments([...comments, res.data])
        setNewComment("")
    }

    useEffect(() => {

        axios.get(`https://blog-backend-1nh2.onrender.com/posts/${id}`)
            .then(res => setPost(res.data))

        axios.get(`https://blog-backend-1nh2.onrender.com/comments/${id}`)
            .then(res => setComments(res.data))

    }, [id])

    if (!post) return <h2>Loading...</h2>

    return (
        <div style={{ padding: "20px" }}>

            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <p>Author: {post.author}</p>

            <h3>Comments</h3>

            <form onSubmit={handleComment}>
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                />
                <button>Send</button>
            </form>

            {comments.map(c => (
                <div key={c._id} style={{ marginTop: "10px" }}>
                    <b>{c.userId?.username}</b>: {c.content}
                </div>
            ))}

        </div>
    )
}

export default PostDetail