import React from "react";
import { Link } from 'react-router-dom';

export function Navbar() {
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <Link to="/" className="navbar-brand">
                <h4>MEMTEST</h4>
            </Link>
            <div id="c-nav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <Link to="/new-job" className='nav-link'>New Job</Link>
                    </li>
                    <li class="nav-item">
                        <a href="/uploads" class="nav-link">Uploads</a>
                    </li>
                    <li class="nav-item">
                        <a href="/settings" class="nav-link">Settings</a>
                    </li>

                </ul>
            </div>
        </div>
    </nav>
}

export default Navbar;