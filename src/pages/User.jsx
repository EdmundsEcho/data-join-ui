import React from 'react'
import {Routes, Route, Link} from 'react-router-dom'

export const User = () => {
  return (
    <div className="Luci-box">
      <h2>User</h2>
      <nav className="Luci-stack">
        <Link to="/user/profile">Profile</Link>
        <Link to="/user/account">Account</Link>
      </nav>
    </div>
  )
}
