import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useState, useEffect } from "react"
import "./Navbar.css"

function Navbar() {

    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const token = localStorage.getItem("token")
    const API = "https://blog-backend-1nh2.onrender.com/api"
    
    

    // lấy user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"))
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const fetchNoti = async () => {
            const res = await axios.get("https://blog-backend-1nh2.onrender.com/users/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(res.data)
        }

        fetchNoti()
    }, [token])
    
    
    useEffect(() => {
        if (!token) return

        axios.get("https://blog-backend-1nh2.onrender.com/users/friend-requests", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setRequests(res.data))
            .catch(err => console.log(err.response?.data))
    }, [token])

    
    
    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }
    const accept = async (id) => {
        await axios.post(
            `https://blog-backend-1nh2.onrender.com/users/accept-friend/${id}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )

        setRequests(prev => prev.filter(u => u._id !== id))
    }

    const reject = async (id) => {
        await axios.post(`/users/reject-friend/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })

        setRequests(prev => prev.filter(u => u._id !== id))
    }
    

    return (
        <nav style={{ padding: "20px", background: "#222" }}>

            <Link to="/" style={{ color: "white", marginRight: "20px" }}>
                Home
            </Link>

            <Link to="/create" style={{ color: "white", marginRight: "20px" }}>
                Create Post
            </Link>
            <Link to="/profile" style={{ color: "white" }}>
                Profile
            </Link>
            <div className="nav-noti" onClick={() => setShowDropdown(!showDropdown)}>
                🔔 {requests.length > 0 && <span>{requests.length}</span>}
            </div>
            {showDropdown && (
                <div className="dropdown">
                    {requests.length === 0 && <p>Không có lời mời</p>}

                    {requests.map(user => (
                        <div key={user._id} className="request-item">
                            <img src={user.avatar} width={40}  alt="avtar"/>
                            <span>{user.username}</span>

                            <button onClick={() => accept(user._id)}>✔</button>
                            <button onClick={() => reject(user._id)}>✖</button>
                        </div>
                    ))}

                    {notifications.map(noti => (
                        <div key={noti._id}>
                            <b>{noti.sender?.username || "Someone"}</b>

                            {noti.type === "like" && " đã thích bài viết của bạn"}
                            {noti.type === "comment" && " đã bình luận bài viết của bạn"}
                        </div>
                    ))}
                </div>
            )}

            {/* 👇 nếu đã login */}
            {user ? (
                <>
                    <span style={{ color: "white", marginRight: "20px" }}>
                         {user.username}
                    </span>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login" style={{ color: "white", marginRight: "20px" }}>
                        Login
                    </Link>

                    <Link to="/register" style={{ color: "white" }}>
                        Register
                    </Link>
                </>
            )}

        </nav>
    )
}

export default Navbar