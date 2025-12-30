
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Form } from "react-router-dom";


const AcceptCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [callData, setCallData] = useState(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const token = localStorage.getItem("auth-token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setError("Unable to access camera/microphone");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Accept call handler
  const handleAcceptCall = async () => {
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/acceptcall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ roomId }),
      });

      const data = await res.json();
      if (res.ok) {
        setCallData(data);
        setMessage("Joined call successfully!");
        setJoined(true);
        startCamera();
      } else {
        setError(data.error || "Failed to join call");
      }
    } catch (err) {
      console.error(err);
      setError("Error joining call");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm text-center">
        <h3 className="mb-3">Join Video Call</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {!joined ? (
          <>
            <p>You are invited to join Room: <strong>{roomId}</strong></p>
            <button className="btn btn-success" onClick={handleAcceptCall}>
              Accept Call
            </button>
          </>
        ) : (
          <>
            <h5>In Call: {callData?.roomId}</h5>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", maxWidth: "500px", borderRadius: "8px" }}
            ></video>

            <div className="mt-3">
              <button
                className="btn btn-danger"
                onClick={() => {
                  stopCamera();
                  navigate("/videocall"); // go back after ending
                }}
              >
                Leave Call
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptCall;
