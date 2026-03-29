import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./CreatePost.css"

function CreatePost() {

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        try {
            setLoading(true)

            let imageUrls = []

            if (files.length > 0) {
                imageUrls = await uploadImages()
            }

            await axios.post(
                "https://blog-backend-1nh2.onrender.com/posts",
                {
                    title,
                    content,
                    images: imageUrls
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            alert(" Đăng bài thành công!")
            navigate("/")

        } catch (err) {
            console.error(err)
            alert(" Đăng bài thất bại")
        } finally {
            setLoading(false)
        }
    }

    const handleFiles = (e) => {
        const selected = Array.from(e.target.files)

        setFiles(selected)

        const previewUrls = selected.map(file => URL.createObjectURL(file))
        setPreviews(previewUrls)
    }
    const uploadImages = async () => {
        const urls = []

        for (let file of files) {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", "blog_upload")

            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/dxcnvpqjd/image/upload",
                formData
            )

            urls.push(res.data.secure_url)
        }

        return urls
    }
    const removeImage = (index) => {
        const newFiles = [...files]
        const newPreviews = [...previews]

        newFiles.splice(index, 1)
        newPreviews.splice(index, 1)

        setFiles(newFiles)
        setPreviews(newPreviews)
    }

    return (

        <div style={{ padding: "20px" }}>

            <h1>Create Post</h1>

            <form onSubmit={handleSubmit}>

                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <br /><br />

                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />


                <br /><br />

                <input type="file" multiple onChange={handleFiles} />
                {previews.length > 0 && (
                    <div className="preview-list">
                        {previews.map((img, i) => (
                            <div key={i} className="preview-item">
                                <img src={img} alt="preview" />
                                <button onClick={() => removeImage(i)}>✖</button>
                            </div>
                        ))}
                    </div>
                )}
                

                <button disabled={loading}>
                    {loading ? "Đang đăng..." : "Create"}
                </button>
            </form>
           

        </div>

    )

}

export default CreatePost