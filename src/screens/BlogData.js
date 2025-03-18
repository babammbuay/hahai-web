import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaTrash, FaEye, FaBan, FaBell, FaUser, FaCaretDown } from 'react-icons/fa';
import { FaFileImage } from "react-icons/fa6";
import axios from 'axios';

function BlogData() {
    const [adminUsername, setAdminUsername] = useState('');
    const [lastLoginTime, setLastLoginTime] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [currentDate, setCurrentDate] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState(3);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [footerVisible, setFooterVisible] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    

    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);

    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
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

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/blogs/${blogId}`);
                if (response.status === 200) {
                    setBlog(response.data);
                    setLoading(false);
                } else {
                    setErrorMessage('ไม่พบกระทู้ที่ต้องการ');
                    setLoading(false);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setErrorMessage('ไม่พบกระทู้ที่ต้องการ');
                } else {
                    setErrorMessage('ไม่สามารถโหลดข้อมูลกระทู้ได้');
                }
                setLoading(false);
            }
        };


        fetchBlog();
    }, [blogId]);




    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNotifications = () => {
        console.log('Notifications clicked');
    };

    const handleLogout = () => {
        console.log('Logout clicked');
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const handleProfile = () => {
        console.log('Profile clicked');
        navigate('/admin');
    };



    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="member-detail">
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
                                <Link to={`/locationdetail/${encodeURIComponent(blog?.locationname || 'ไม่ระบุ')}`}>
                                    {blog?.locationname || 'ไม่ระบุ'}
                                </Link>
                            </li>

                            <li className="breadcrumb-item active" aria-current="page">
                                รายละเอียดกระทู้
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
                    <h1>รายละเอียดกระทู้</h1>
                    {blog ? (
                        <div className="blog-details-container">
                            <div className="blog-details">
                                <div className="blog-img">
                                    {blog.obj_picture ? (
                                        <img
                                            src={blog.obj_picture}
                                            alt="สิ่งของ"
                                            className="object_image"
                                        />
                                    ) : (
                                        <FaFileImage size={280} style={{ width: '100%', height: '100%', borderRadius: '15px', border: '2px solid #ddd', color: '#888', backgroundColor: '#f4f4f4' }} />
                                    )}
                                </div>

                                <div className="blogs-info">
                                    <p>เจ้าของกระทู้: {blog.user?.username || 'ไม่ระบุ'}</p>
                                    <p>วันที่พบ: {blog.date || 'ไม่ระบุ'}</p>
                                    <p>ชนิดสิ่งของ:  {blog.object_subtype || 'ไม่ระบุ'}</p>
                                    <p>สี: {blog.color || 'ไม่ระบุ'}</p>
                                    <p>ตำแหน่งที่พบ: {blog.locationname || 'ไม่ระบุ'}, {blog.location || 'ไม่ระบุ'}</p>
                                    <p>หมายเหตุ: {blog.note || 'ไม่ระบุ'}</p>


                                </div>


                            </div>

                        </div>

                    ) : (
                        <p>ไม่พบกระทู้</p>
                    )}
                </div>
            </div>

            <div className={`footer-content ${footerVisible ? 'visible' : ''}`}>
                <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
            </div>
        </div>
    );
}

export default BlogData;
