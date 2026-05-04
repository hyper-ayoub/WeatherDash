import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../axios_service/axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
export default function Signup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup/", {
        username: form.username,
        email: form.email,
        password: form.password1,
      });
      console.log(res.data);
      toast.success("Signup successful");
      // go to login page after success
      navigate("/signin");
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Signup failed, try again");
    }
  };
  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background-image: url('https://images.unsplash.com/photo-1589724189661-1f593f4606d6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-color: #f5f5f5;
          background-size: cover;
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
          background-image: url('https://images.unsplash.com/photo-1630260667842-830a17d12ec9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
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

        input[type="text"]:focus,
        input[type="email"]:focus,
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
      `}</style>

      <div className="container">
        <div className="form-container">
          <h1>Registration Form</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password1"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="password2"
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" required id="terms" />
              <label htmlFor="terms">I accept Terms</label>
            </div>

            <button type="submit">Register Now</button>

            <div className="bottom-text">
              <p>Already have an account? <a href="/signin">Login</a></p>
            </div>
          </form>
        </div>

        <div className="image-container"></div>
      </div>
    </>
  );
}