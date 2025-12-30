import React from 'react'
import {Link,  useNavigate} from 'react-router-dom';


export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () =>{
    localStorage.removeItem('auth-token');
    navigate("/login");
  }
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
  <div className="container-fluid">
    <Link className="navbar-brand" to="/">Navbar</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link " aria-current="page" to="/videocall">Call</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/">Link</Link>
        </li>
        <li className="nav-item dropdown">
          <Link className="nav-link dropdown-toggle" to="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown
          </Link>
          <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><Link className="dropdown-item" to="/">Action</Link></li>
            <li><Link className="dropdown-item" to="/">Another action</Link></li>
            <li><hr className="dropdown-divider"/></li>
            <li><Link className="dropdown-item" to="/">Something else here</Link></li>
          </ul>
        </li>
        
      </ul>
      {!localStorage.getItem('auth-token')?<form className="d-flex">
        <Link className="btn btn-primary mx-2" to="/signup"  role="submit">Signup</Link>
        <Link className="btn btn-primary" to='/login'  role="submit">Login</Link>
      </form>: <button onClick={handleLogout} className='btn btn-primary'>Logout</button>}
    </div>
  </div>
</nav>
    </div>
  )
}
