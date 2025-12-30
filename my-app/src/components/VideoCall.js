import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const VideoCall = () => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [joinRoomId, setJoinRoomId] = useState("");

  //  "auth-token": localStorage.getItem("auth-token");

  const token = localStorage.getItem("auth-token");
  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect user to login if no token
    }
  }, [navigate, token]);

  // 🔹 Get access to user's camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // set to false if you only want video
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera/mic. Please allow permissions.");
    }
  };

  //  Stop the video stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startTimer = (startTimeValue) => {
    if (intervalRef.current) clearInterval(intervalRef.current); // clear previous
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = now - startTimeValue;
      setElapsedTime(formatDuration(diff));
    }, 1000);
  };

  const formatDuration = (durationMs) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // Stop timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Create a new call
  const handleCreateCall = async () => {
    setMessage("");
    setError("");

    const now = new Date();
    setStartTime(now);
    setElapsedTime("00:00:00");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/createcall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      });

      const data = await res.json();
      if (res.ok) {
        setRoomData(data);
        // startCamera();
        setStartTime(new Date(data.startedAt));
        setMessage(`Call created with Room ID: ${data.roomId}`);
        if (data.startedAt) {
          setStartTime(new Date(data.startedAt));
          // const serverStart = new Date(Date.startedAt);
          setStartTime(setStartTime);
        }
        startCamera(); // Start camera after successful call creation
        startTimer(now);
      } else {
        setError(data.error || "Failed to create call");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating call");
    }
  };

  // 🔹 End the call
  const handleEndCall = async () => {
    if (!roomData?.roomId) {
      setError("No room to end");
      return;
    }

    setMessage("");
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/${roomData.roomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("auth-token"),
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        stopCamera(); // Stop camera on call end
        stopCamera();
        setRoomData(null);
        setStartTime(null);
      } else {
        setError(data.error || "Failed to end call");
      }
    } catch (err) {
      console.error(err);
      setError("Error ending call");
    }
  };

  // cleanup

  useEffect(() => {
    return () => {
      stopCamera();
      stopTimer();
    };
  }, []);

  const handleAcceptCall = async () => {
    if (!joinRoomId.trim()) {
      setError("Please enter a Room ID to join");
      return;
    }

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/acceptcall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ roomId: joinRoomId }),
      });

      const data = await res.json();

      if (res.ok) {
        setRoomData(data);
        setMessage(`Joined call successfully: Room ${data.roomId}`);
        startCamera(); // show video feed
        setStartTime(new Date());
        startTimer(new Date());
      } else {
        setError(data.error || "Failed to join call");
      }
    } catch (err) {
      console.error(err);
      setError("Error joining call");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h3 className="mb-4 text-center">Video Call Control Panel</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="d-flex justify-content-center gap-3 mb-4">
          <button className="btn btn-success" onClick={handleCreateCall}>
            Create Call
          </button>
          <div className="text-center mt-3">
            <h5>Join Existing Call</h5>
            <div className="d-flex justify-content-center gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                style={{ maxWidth: "200px" }}
              />
              <button className="btn btn-primary" onClick={handleAcceptCall}>
                Accept Call
              </button>
            </div>
          </div>

          <button
            className="btn btn-danger"
            onClick={handleEndCall}
            disabled={!roomData}
          >
            End Call
          </button>
        </div>

        {roomData?.joinLink && (
          <div className="text-center mt-3">
            <p>
              <strong>Share Link:</strong>{" "}
              <a
                href={roomData.joinLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {roomData.joinLink}
              </a>
            </p>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(roomData.joinLink);
                alert("Link copied to clipboard!");
              }}
            >
              Copy Link
            </button>
          </div>
        )}

        {/* 🔴 Live video feed */}
        <div className="text-center mb-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", maxWidth: "500px", borderRadius: "8px" }}
          ></video>
        </div>

        {/* 🔹 Show call details */}
        {roomData && (
          <div className="text-center">
            <p>
              <strong>Room ID:</strong> {roomData.roomId}
            </p>
            <p>
              <strong>Created By:</strong>{" "}
              {roomData.createdBy || "Unknown User"}
            </p>
            <p>
              <strong>Call Duration:</strong> {elapsedTime}
            </p>
            {startTime && (
              <p>
                <strong>Started At:</strong> {startTime.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
