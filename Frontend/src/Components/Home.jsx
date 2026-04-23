import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <h1>
      Welcome to the Home Page! {user.username || "User"}
      </h1>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}