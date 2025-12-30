// import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';

import VideoCall from './components/VideoCall';



function App() {
  return (
    <>
     <BrowserRouter>
     <div className="container">
     <Navbar/>
     <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/videocall" element={<VideoCall />} />
         {/* <Route path="/videocall/:roomId" element={<AcceptCall />} /> */}
      </Routes>
      </div>
     </BrowserRouter>
    
    </>
  );
}

export default App;
