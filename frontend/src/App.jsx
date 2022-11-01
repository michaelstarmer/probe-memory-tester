import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import NewJobPage from './pages/NewJob';
import SettingsPage from './pages/Settings';
import UploadsPage from './pages/Uploads';
import JobPage from './pages/Job';



function App() {
  return (
    <Router>
      <main className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand">
              <h4>MEMTEST</h4>
            </Link>
            <div id="c-nav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link to="/new-job" className='nav-link'>New Job</Link>
                </li>
                <li className="nav-item">
                  <Link to="/uploads" className="nav-link">Uploads</Link>
                </li>
                <li className="nav-item">
                  <Link to="/settings" className='nav-link'>Settings</Link>
                </li>

              </ul>
            </div>
          </div>
        </nav>
        <Suspense fallback="loading">
          <Routes>
            <Route exact path="/jobs/:id" element={<JobPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/uploads" element={<UploadsPage />} />
            <Route path="/new-job" element={<NewJobPage />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
    </Router>

  );
}



export default App;
