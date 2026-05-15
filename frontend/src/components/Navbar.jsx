import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        WORK<span>LOG</span>
      </div>
      <div className="navbar-right">
        <div className="nav-user">
          <strong>{user?.displayName || user?.username}</strong>
        </div>
        <span className={`nav-badge ${user?.role}`}>{user?.role}</span>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
