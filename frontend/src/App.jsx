import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import NewJobPage from './pages/NewJob';
import SettingsPage from './pages/Settings';
import UploadsPage from './pages/Uploads';
import JobPage from './pages/Job';
import moment from 'moment';
import 'moment/locale/en-gb'
import styled from 'styled-components';
moment().locale('en-gb')

const NavLink = ({to, children}) => {
  return <li className="nav-item">
        <Link to={to} className='nav-link'>
          {children}
        </Link>
      </li>
}

const NavBrand = ({title}) => {
  const H4 = styled.h4`
    text-transform: uppercase;
    margin: 0;
    padding: 0;
    font-weight: 700;
    color: #ffffff8c;
  `
  return (
  <Link to="/" className="navbar-brand">
    <H4>{title}</H4>
  </Link>)
}

const NavBar = ({title, children}) => {
  const Nav = styled.nav`
    
  `
  return (
    <nav id="nav" className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <NavBrand title="Memtest" />
          <div id="c-nav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <NavLink to="/new-job">New Job</NavLink>
              <NavLink to="/uploads">Uploads</NavLink>
              <NavLink to="/settings">Settings</NavLink>
            </ul>
          </div>
        </div>
      </nav>
  )
}

function App() {
  return (
    <Router>
      <main className="App">
        <NavBar title="Memtest1" />
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
