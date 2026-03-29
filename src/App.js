import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import PostDetail from "./pages/PostDetail"
import CreatePost from "./pages/CreatePost"
import EditPost from "./pages/EditPost"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"

function App() {

  return (
    <Router>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>

    </Router>
  )

}

export default App