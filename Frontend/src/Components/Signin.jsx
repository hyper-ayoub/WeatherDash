import React, { Fragment, useState } from "react";
import api from "../axios_service/axios";
import { useNavigate } from "react-router-dom";
export default function Signin() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = {
        password: form.password,
      };
  
      if (form.username.includes("@")) {
        loginData.email = form.username;
      } else {
        loginData.username = form.username;
      }
      const res = await api.post("/auth/signin/", loginData);
      console.log(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/home");
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <Fragment>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background-image: url("https://images.unsplash.com/photo-1720639128406-5197cb67169a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
          background-repeat: no-repeat;
          background-size: cover;
          background-color: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .container {
          display: flex;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          width: 900px;
          max-width: 95%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .form-container {
          padding: 40px;
          width: 50%;
        }

        .image-container {
          width: 50%;
          background-image: url('https://images.unsplash.com/photo-1534068731687-d70176c2e7d5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-size: cover;
        }

        h1 {
          font-size: 28px;
          margin-bottom: 40px;
          color: #333;
          text-align: center;
        }

        .input-group {
          margin-bottom: 30px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: #555;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"] {
          width: 100%;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 30px;
          font-size: 16px;
          outline: none;
        }

        input[type="email"]:focus,
        input[type="text"]:focus,
        input[type="password"]:focus {
          border-color: #000080;
          box-shadow: 0 0 5px rgba(0, 0, 128, 0.3);
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .checkbox-group input {
          margin-right: 10px;
        }

        button {
          background-color: #000080;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 30px;
          font-size: 16px;
          width: 100%;
          transition: background-color 0.3s;
          cursor: pointer;
        }

        button:hover {
          background-color: black;
        }

        .bottom-text {
          margin-top: 20px;
          text-align: center;
          color: #555;
        }

        .bottom-text a {
          color: #000080;
          text-decoration: none;
        }

        .bottom-text a:hover {
          text-decoration: underline;
        }

        
        @media (max-width: 768px) {
          .container {
              display: flex;
              flex-direction: column;
          }
          
          .form-container,
          .image-container {
              width: 100%;
          }
          
          .image-container {
              height: 200px;
          }
      }
        }
      `}</style>

      <div className="container">
        <div className="form-container">
          <h1>Login Form</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email or Username</label>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                name="remember"
                onChange={handleChange}
                id="remember"
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            <button type="submit">Login Now</button>

            <div className="bottom-text">
              <p>
                Don't have an account? <a href="/signup">Signup</a>
              </p>
              <a href="#">Forgot password?</a>
            </div>
          </form>
        </div>

        <div className="image-container"></div>
      </div>
    </Fragment>
  );
}