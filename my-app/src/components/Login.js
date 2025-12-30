import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const [formdata, setformdata] = useState({
    email: "",
    password: "",
  });
  //  let history = useHistory();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;

    setformdata((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError(""); // clear previous errors
  //   console.log("Submitting form data:", formdata);

  //   try {
  //     const response = await fetch("http://localhost:8080/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // "auth-token": token,
  //       },
  //       body: JSON.stringify(formdata),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       if(data.token){
  //         localStorage.setItem("auth-token", data.token);
  //         console.log("Token saved to localStorage");
  //       }
  //       // console.log("Login successful:", data);
  //       navigate("/videocall");
  //     } else {
  //       console.error("Login failed:", data);
  //       setError(data.message || "Login failed. Please try again.");
  //     }
  //   } catch (err) {
  //     console.error("Error:", err);
  //     setError("Something went wrong. Try again later.");
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  console.log("Submitting form data:", formdata);

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formdata),
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (response.ok) {
      // if (data.token) {
      //   localStorage.setItem("auth-token", data.token);
      //   console.log("Token saved:", data.token);
      // }
      if (data.authtoken) {
  localStorage.setItem("auth-token", data.authtoken);
  if(data.user){
    localStorage.setItem("user-name", data.user.name);
    localStorage.setItem("user-email", data.user.email);
  }
  console.log("Token saved to localStorage");
}

      console.log("Redirecting to /videocall...");
      navigate("/videocall");
    } else {
      console.error("Login failed:", data);
      setError(data.message || "Login failed. Please try again.");
    }
  } catch (err) {
    console.error("Error:", err);
    setError("Something went wrong. Try again later.");
  }
};

  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="card my-4 " style={{ width: "35rem" }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
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
                  value={formdata.email}
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
                  value={formdata.password}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
