import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = (props) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
//    let history = useHistory();
   const [error, setError] = useState("");
const navigate = useNavigate();
  const handleChange = (e) =>{
const { name, value } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
     setError(""); // clear previous errors
    console.log("Submitting form data:", formData);

     try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //  "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify(formData),
      });
   

      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful:", data);
          if (data.token) {
        localStorage.setItem("auth-token", data.token);
      }
navigate("/videocall"); 
       
      } else {
        console.error("Signup failed:", data);
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Try again later.");
    }
  };
  return (
    <>
    <div className="d-flex justify-content-center">
      <div class="card my-4" style={{ width: "35rem" }}>
        <div class="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Enter Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="Suraj Vishwakarma"
                onChange={handleChange}
                 value={formData.name}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="suraj123@gmail.com"
                onChange={handleChange}
                 value={formData.email}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Enter Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="suraj123"
                onChange={handleChange}
                 value={formData.password}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Signup
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default Signup;
