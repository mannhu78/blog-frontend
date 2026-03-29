import { useEffect, useState } from "react"
import axios from "axios"
import PostCard from "../components/PostCard"
import "./Home.css"

function Home() {

    const [posts, setPosts] = useState([])
    const user = JSON.parse(localStorage.getItem("user"))

    // 🗑 DELETE POST
    const deletePost = async (id) => {
        try {
            const token = localStorage.getItem("token")

            await axios.delete(
                `https://blog-backend-1nh2.onrender.com/posts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            // cập nhật UI không cần reload
            setPosts(posts.filter(p => p._id !== id))

        } catch (err) {
            console.error(err)
            alert("Xóa thất bại")
        }
    }

    //  LIKE POST
    const handleLike = async (id) => {
        try {
            const token = localStorage.getItem("token")

            const res = await axios.put(
                `https://blog-backend-1nh2.onrender.com/posts/like/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            //  update lại post đã like
            setPosts(posts.map(p =>
                p._id === id ? res.data : p
            ))

        } catch (err) {
            console.error(err)
            alert("Like thất bại")
        }
    }

    // LOAD POSTS
    useEffect(() => {
        axios.get("https://blog-backend-1nh2.onrender.com/posts")
            .then(res => {
                console.log("POSTS:", res.data) 
                setPosts(res.data)
            })
            .catch(err => console.error(err))
    }, [])

    return (
        <div style={{
            padding: "20px",
            maxWidth: "600px",
            margin: "0 auto"
        }}>

            <h1>Blog Feed</h1>

            {posts.length === 0 ? (
                <p>Chưa có bài viết nào</p>
            ) : (
                posts.map(post => (
                    <PostCard
                        key={post._id}
                        post={post}
                        user={user}
                        onDelete={deletePost}
                        onLike={handleLike}
                    />
                ))
            )}

        </div>
    )
}

export default Home