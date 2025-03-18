import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      });
  
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.token);
        console.log('Token:', response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'เข้าสู่ระบบล้มเหลว');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-login-page">
      <div className="login-image-container">
        <h1>Hahai Admin Panel</h1>
        <p className="lead">
          บริหารจัดการกระทู้และเนื้อหาของผู้ใช้งานในแอปพลิเคชันอย่างครบวงจร พร้อมระบบตรวจสอบข้อมูลที่ช่วยเสริมสร้างความน่าเชื่อถือและประสิทธิภาพในการดูแลระบบ สร้างประสบการณ์การใช้งานที่ดีที่สุดสำหรับผู้ใช้งานผ่านการจัดการที่มีมาตรฐานและเป็นระเบียบ
        </p>
        <p>เข้าสู่ระบบเพื่อเข้าถึงฟีเจอร์การจัดการแอปพลิเคชันอย่างเต็มรูปแบบ</p>
      </div>

      <div className="login-form-container">
        <div className="login-form">
          <h3 className="admin-welcome-text text-primary text-center">ยินดีต้อนรับ</h3>
          <h1 className="admin-login-header text-center">เข้าสู่ระบบ</h1>
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="input-login">
              <input
                type="text"
                className="form-control"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-login">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                <i className={`fa ${showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}`}></i>
              </button>
            </div>
            {errorMessage && <div className="text-danger">{errorMessage}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>

      <div className="footer">
        {/* <p>&copy; 2025 Hahai Admin. All rights reserved. | <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms-of-service">Terms of Service</a></p> */}
        {/* <p>&copy; 2025 Hahai Panel. Designed for efficient management and monitoring. | <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms-of-service">Terms of Service</a></p> */}
        <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
        {/* <p>All rights reserved.</p> */}
      </div>
    </div>
  );
}

export default Login;
