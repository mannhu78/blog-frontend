import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

function EditPost() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const API = "https://blog-backend-1nh2.onrender.com/api"

    // 🔄 load dữ liệu
    useEffect(() => {
        axios.get(`${API}/posts/${id}`)
            .then(res => {
                setTitle(res.data.title)
                setContent(res.data.content)
            })
            .catch(err => console.error(err))
    }, [id])

    //  update
    const handleUpdate = async (e) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem("token")

            await axios.put(
                `${API}/posts/${id}`,
                { title, content },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            navigate("/") // quay về home

        } catch (err) {
            console.error(err)
            alert("Update thất bại")
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Edit Post</h1>

            <form onSubmit={handleUpdate}>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                />

                <br /><br />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content"
                />

                <br /><br />

                <button>Update</button>

            </form>
        </div>
    )
}

export default EditPost