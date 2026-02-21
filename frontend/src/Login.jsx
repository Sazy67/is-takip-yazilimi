import { useState } from 'react'
import axios from 'axios'
import logo from '../rigel-logo.png'
import './Login.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('/api/login', { username, password }, {
        withCredentials: true
      })
      
      if (response.data.success) {
        onLogin(response.data.user)
      }
    } catch (error) {
      setError('Kullanıcı adı veya şifre hatalı')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <img src={logo} alt="Rigel Logo" />
        </div>
        <h1>İş Takip Yazılımı</h1>
        <h2>Giriş Yap</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Giriş Yap</button>
        </form>
        
        <div className="login-info">
          <p><strong>www.aksekiyapi.com</strong></p>
          <p><strong>www.rigelaluminyum.com</strong></p>
         
        
        </div>
      </div>
      <footer className="login-footer">
        © 2025 Kamsis@Software. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}

export default Login
