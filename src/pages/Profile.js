import { useEffect, useState } from "react"
import axios from "axios"
import { getCroppedImg } from "../utils/cropImage"
import CropAvatar from "../components/CropAvatar"
import "./Profile.css"
import PostCard from "../components/PostCard"
import { useParams } from "react-router-dom"

function Profile() {

    const [user, setUser] = useState(null)
    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [avatar, setAvatar] = useState("")
    const [file, setFile] = useState(null)
    const [imageSrc, setImageSrc] = useState(null)
    const [croppedBlob, setCroppedBlob] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [posts, setPosts] = useState([])
    const token = localStorage.getItem("token")
    const { id } = useParams()
    const [currentUser, setCurrentUser] = useState(null)
    const isMe = currentUser?._id === user?._id
    
    
    const [status, setStatus] = useState("none")
    // none | requested | friend

    console.log("currentUser:", currentUser?._id)
    console.log("profileUser:", user?._id)
    // LOAD USER
    useEffect(() => {

        const url = id
            ? `https://blog-backend-1nh2.onrender.com/users/${id}`
            : "https://blog-backend-1nh2.onrender.com/users/me"

        axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setUser(res.data)
                setUsername(res.data.username)
                setBio(res.data.bio || "")
                setAvatar(res.data.avatar)
            })

    }, [id, token])

    useEffect(() => {
        axios.get("https://blog-backend-1nh2.onrender.com/users/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setCurrentUser(res.data))
    }, [token])

    useEffect(() => {
        if (!user || !currentUser) return

        const isFriend = currentUser.friends?.some(
            f => f._id.toString() === user._id
        )

        const isSent = currentUser.sentRequests?.some(
            id => id.toString() === user._id
        )

        const isReceived = currentUser.friendRequests?.some(
            id => id.toString() === user._id
        )

        if (isFriend) setStatus("friend")
        else if (isSent) setStatus("requested")
        else if (isReceived) setStatus("received")
        else setStatus("none")

    }, [user, currentUser])

    useEffect(() => {
        if (!user) return

        axios.get(`https://blog-backend-1nh2.onrender.com/posts/user/${user._id}`)
            .then(res => setPosts(res.data))
    }, [user])

    useEffect(() => {
        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc)
        }
    }, [imageSrc])

    useEffect(() => {
        if (!croppedBlob) return

        const url = URL.createObjectURL(croppedBlob)
        setPreview(url)

        return () => URL.revokeObjectURL(url)
    }, [croppedBlob])

    
    
    const handleFile = (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("Chỉ chọn file ảnh!")
            return
        }

        setImageSrc(URL.createObjectURL(file))
    }

    const handleCropDone = async (croppedAreaPixels) => {

        const blob = await getCroppedImg(imageSrc, croppedAreaPixels)

        setCroppedBlob(blob)
        setImageSrc(null) 
    }
    const uploadAvatar = async () => {

        const formData = new FormData()
        formData.append("file", croppedBlob)
        formData.append("upload_preset", "blog_upload")

        const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dxcnvpqjd/image/upload",
            formData
        )

        return res.data.secure_url
    }
    const handleAddFriend = async () => {
        try {
            await axios.post(
                `https://blog-backend-1nh2.onrender.com/users/add-friend/${user._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setStatus("requested")
        } catch (err) {
            console.error(err)
            alert("Lỗi kết bạn")
        }
    }
    
    // UPDATE
    const handleUpdate = async () => {

        if (!isMe) return alert("Không có quyền chỉnh sửa")

        try {
            setLoading(true) 
            let avatarUrl = avatar

            if (croppedBlob) {
                avatarUrl = await uploadAvatar() //  upload ảnh
            }

            const res = await axios.put(
                "https://blog-backend-1nh2.onrender.com/users/me",
                {
                    username,
                    bio,
                    avatar: avatarUrl
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setAvatar(res.data.avatar)
            localStorage.setItem("user", JSON.stringify(res.data))

            //  sync toàn app
            window.dispatchEvent(new Event("storage"))

            setCroppedBlob(null)

            alert("Cập nhật thành công!")

        } catch (err) {
            console.error(err)
            alert(" Update thất bại")
        } finally {
            setLoading(false) 
        }
    }
    const handleRemoveAvatar = async () => {
        try {
            const res = await axios.put(
                "https://blog-backend-1nh2.onrender.com/users/me",
                {
                    username,
                    bio,
                    avatar: "" 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setAvatar("")
            setCroppedBlob(null)

            // cập nhật localStorage
            localStorage.setItem("user", JSON.stringify(res.data))
            window.dispatchEvent(new Event("storage"))

            alert("🗑 Đã xoá avatar!")

        } catch (err) {
            console.error(err)
            alert(" Xoá thất bại")
        }
    }
    const handleRemoveFriend = async () => {
        try {
            await axios.post(
                `https://blog-backend-1nh2.onrender.com/users/remove-friend/${user._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setStatus("none")

            // reload currentUser
            const res = await axios.get("https://blog-backend-1nh2.onrender.com/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            })

            setCurrentUser(res.data)

        } catch (err) {
            console.error(err)
            alert("Lỗi huỷ kết bạn")
        }
    }
    const handleDeletePost = async (id) => {
        const token = localStorage.getItem("token")

        // xoá ngay UI
        const oldPosts = posts
        setPosts(prev => prev.filter(p => p._id !== id))

        try {
            await axios.delete(`https://blog-backend-1nh2.onrender.com/posts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } catch (err) {
            console.error(err)

            // rollback nếu lỗi
            setPosts(oldPosts)
            alert("Xoá thất bại")
        }
    }
    

    if (!user || !currentUser) return <h2>Loading...</h2>

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>

            <h1> Profile</h1>
            <div className="avatar-wrapper">

                <img
                    src={
                        preview ||
                        avatar ||
                        "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
                    }
                    className="avatar-img"
                    alt="avatar"
                />
               
                {/* Overlay camera */}
                {isMe && (
                    <>
                        <label className="avatar-overlay">
                            📷
                            <input
                                type="file"
                                hidden
                                onChange={handleFile}
                            />
                        </label>

                        {(avatar || preview) && (
                            <button
                                className="remove-avatar"
                                onClick={handleRemoveAvatar}
                            >
                                ✖
                            </button>
                        )}

                        <button
                            onClick={handleUpdate}
                            disabled={loading || (imageSrc && !croppedBlob)}
                        >
                            {loading ? "Đang cập nhật..." : "Update Profile"}
                        </button>
                    </>
                )}
        </div>
   
            {isMe && imageSrc && (
                <div className="modal">
                    <div className="modal-content">
                        <CropAvatar
                            image={imageSrc}
                            onCropDone={handleCropDone}
                            onClose={() => setImageSrc(null)}
                        />
                    </div>
                </div>
            )}
            <br /><br />
            {!isMe && (
                <>
                    {status === "none" && (
                        <button onClick={handleAddFriend}>Kết bạn</button>
                    )}

                    {status === "requested" && (
                        <button disabled>Đã gửi</button>
                    )}

                    {status === "friend" && (
                        <button onClick={handleRemoveFriend}>
                            Huỷ kết bạn
                        </button>
                    )}

                    {status === "received" && (
                        <button>
                            Chấp nhận
                        </button>
                    )}
                </>
            )}

            {isMe ? (
                <>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        style={{ width: "100%" }}
                    />

                    <br /><br />

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Bio"
                        style={{ width: "100%" }}
                    />
                </>
            ) : (
                <>
                    <h2>{username}</h2>
                    <p>{bio}</p>
                </>
            )}

            <br /><br />
            <h2>Bạn bè</h2>

            {user.friends?.length === 0 && <p>Chưa có bạn bè</p>}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {user.friends?.map(friend => (
                    <div
                        key={friend._id}
                        style={{
                            width: "80px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                        onClick={() => window.location.href = `/profile/${friend._id}`}
                    >
                        <img
                            src={
                                friend.avatar ||
                                "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
                                
                            }
                            alt="avatar"
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                objectFit: "cover"
                            }}
                        />
                        <p style={{ fontSize: "12px" }}>{friend.username}</p>
                    </div>
                ))}
            </div>

            <h2>
                {isMe ? "Bài viết của bạn" : "Bài viết của người dùng"}
            </h2>

            {posts.length === 0 && <p>Chưa có bài viết</p>}

            {posts.map(post => (
                <PostCard
                    key={post._id}
                    post={post}
                    user={user}
                    onDelete={handleDeletePost}
                />
            ))}
        </div>
    )
}

export default Profile