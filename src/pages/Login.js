import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post(
                "https://blog-backend-1nh2.onrender.com/auth/login",
                { email, password }
            )

            // lưu token
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            alert("Login thành công!")

            navigate("/") // về home

        } catch (err) {
            alert("Sai email hoặc password")
        }
    }

    return (
        <div style={{ padding: "20px" }}>

            <h1>Login</h1>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button>Login</button>

            </form>

        </div>
    )
}

export default Login