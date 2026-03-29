import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Register() {

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    

    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()

        try {
            await axios.post(
                "http://localhost:5000/auth/register",
                { username, email, password }
            )

            alert("Đăng ký thành công!")

            navigate("/login")

        } catch (err) {
            alert("Email đã tồn tại")
        }
    }
    

    return (
        <div style={{ padding: "20px" }}>

            <h1>Register</h1>

            <form onSubmit={handleRegister}>

                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br /><br />

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

                <button>Register</button>

            </form>

        </div>
    )
}

export default Register