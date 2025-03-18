import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaBell, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../hahai.css';
import '../menu.css';

function AddCategory() {
    const [adminUsername, setAdminUsername] = useState('');
    const [lastLoginTime, setLastLoginTime] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [currentDate, setCurrentDate] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(3);
    const [showDropdown, setShowDropdown] = useState(false);
    const [buttonColor, setButtonColor] = useState('#006AFF');
    const [newCategory, setNewCategory] = useState({ title: '', description: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [footerVisible, setFooterVisible] = useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleMouseEnter = () => { setButtonColor('#004c9d'); };
    const handleMouseLeave = () => { setButtonColor('#006AFF'); };

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };

    // Scroll event handler
    const handleScroll = () => {
        const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;
        if (bottom) {
            setFooterVisible(true); 
        } else {
            setFooterVisible(false);  
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        console.log('Logout clicked');
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const handleProfile = () => {
        console.log('Profile clicked');
        navigate('/admin');
    };

    const fetchAdminInfo = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            setErrorMessage('ไม่พบผู้ใช้ โปรดเข้าสู่ระบบใหม่');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/admin', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAdminUsername(response.data.username);
            setLastLoginTime(response.data.lastLoginTime);
            setIsLoggedIn(response.data.isLoggedIn);
            setCreatedAt(response.data.createdAt);
            setLoading(false);
        } catch (error) {
            setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminInfo();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.title || !newCategory.description) {
            setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            console.log("Token:", token);

            if (!token) {
                setErrorMessage('ไม่พบผู้ใช้โปรดเข้าสู่ระบบใหม่');
                navigate('/');
                return;
            }

            const response = await axios.post("http://localhost:5000/categories", newCategory, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Response:", response);

            if (response.status === 201) {
                setSuccessMessage("หมวดหมู่ถูกเพิ่มเรียบร้อยแล้ว");
                setNewCategory({ title: "", description: "" });
                setErrorMessage("");
                navigate("/category");
            }
        } catch (error) {
            console.error("Error adding category:", error);
            if (error.response && error.response.status === 401) {
                setErrorMessage("เซลชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
                navigate('/');
            } else {
                setErrorMessage("เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
            }
        }
    };

    const handleNotifications = () => {
        console.log('Notifications clicked');
    };

    return (
        <div className="category">
            <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="text-center mb-4">
                    <img
                        src="https://i.imgur.com/hcl6qVY.png"
                        alt="เมนู"
                        style={{ maxWidth: '80%', height: 'auto', paddingTop: 15 }}
                    />
                </div>

                <ul className="list-unstyled">
                    <li className="menu-item">
                        <Link to="/dashboard" className="menu-link">
                            <FaHome size={20} />
                            <h5>แดชบอร์ด</h5>
                        </Link>
                    </li>
                    <li className="menu-item">
                        <Link to="/member" className="menu-link">
                            <FaUsers size={20} />
                            <h5>จัดการสมาชิก</h5>
                        </Link>
                    </li>
                    <li className="menu-item">
                        <Link to="/report" className="menu-link">
                            <FaFlag size={20} />
                            <h5>จัดการกระทู้ไม่พึงประสงค์</h5>
                        </Link>
                    </li>
                    <li className="menu-item">
                        <Link to="/category" className="menu-link">
                            <FaTag size={20} />
                            <h5>จัดการหมวดหมู่</h5>
                        </Link>
                    </li>
                    <li className="menu-item">
                        <Link to="/feedback" className="menu-link">
                            <FaComments size={20} />
                            <h5>แจ้งปัญหาการใช้งาน</h5>
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="top-menu">
                <div className="hamburger-menu" onClick={toggleSidebar}>
                    ☰
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', marginLeft: 'auto' }}>
                    <div className="notification-icon" onClick={handleNotifications}>
                        <FaBell size={25} />
                        {notifications > 0 && <span className="notification-badge">{notifications}</span>}
                    </div>
                    <div className="profile-icon" onClick={handleDropdownToggle}>
                        <FaUserCircle size={30} />
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#006AFF' }}>
                            {adminUsername}
                            <FaCaretDown size={12} style={{ marginLeft: '5px', verticalAlign: 'middle' }} />
                        </span>
                    </div>
                    <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                        <div className="dropdown-item" onClick={handleProfile}>จัดการโปรไฟล์</div>
                        <div className="dropdown-item" onClick={handleLogout}>ออกจากระบบ</div>
                    </div>
                </div>
            </div>

            <div className={`wrapper ${isSidebarCollapsed ? 'full-screen' : ''}`}>
                <div className="breadcrumb-container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/dashboard">แดชบอร์ด</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/category">จัดการหมวดหมู่</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                เพิ่มข้อมูลหมวดหมู่
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
                    <h1>เพิ่มข้อมูลหมวดหมู่</h1>
                    <div className="form-container">
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                        <div className="form-group add-category-input">
                            <label>ชื่อหมวดหมู่</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newCategory.title}
                                onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group add-category-input">
                            <label>คำอธิบาย</label>
                            <textarea
                                className="form-control"
                                rows="5"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            />
                        </div>

                        <button
                            className="btn btn-add-category"
                            style={{ backgroundColor: buttonColor, color: 'white' }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleAddCategory}
                        >
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
            <div className="footer-content-fixed">
                <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
            </div>
        </div>
    );
}

export default AddCategory;
