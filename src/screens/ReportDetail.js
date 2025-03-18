import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTrash, FaChevronLeft, FaChevronRight, FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaEye, FaReply, FaBell, FaCaretDown } from 'react-icons/fa';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../hahai.css';
import '../menu.css';

function ReportDetail() {
    const [adminUsername, setAdminUsername] = useState('');
    const [lastLoginTime, setLastLoginTime] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [currentDate, setCurrentDate] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const location = useLocation();
    const { report } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(3);
    const [showDropdown, setShowDropdown] = useState(false);
    const [reports, setReports] = useState([]);
    const [footerVisible, setFooterVisible] = useState(false);

    const token = localStorage.getItem('authToken');

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        if (!report) {
            setLoading(false);
            setErrorMessage('ไม่พบข้อมูลรายงาน');
        } else {
            console.log("Blog Owner ID:", report.blogOwner?._id);
            setLoading(false);
        }
    }, [report]);


    const handleProfile = () => {
        navigate('/admin');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const handleNotifications = () => {
        // Handle notification click
    };

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        if (!report) {
            setLoading(false);
            setErrorMessage('ไม่พบข้อมูลรายงาน');
        } else {
            setLoading(false);
        }
    }, [report]);

    const formatThaiDate = (dateString) => {
        const date = new Date(dateString);
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543;
        return `${day} ${month} ${year}`;
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

    const handleDeleteReport = async (id) => {
        const confirmDelete = window.confirm("คุณต้องการลบรายงานนี้จริงหรือไม่?");

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:5000/reports/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Ensure `token` is defined and valid
                },
            });

            if (response.status === 200) {
                setReports(reports.filter((report) => report._id !== id));
                alert("รายงานถูกลบเรียบร้อยแล้ว");
                navigate('/reports');
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            alert("เกิดข้อผิดพลาดในการลบรายงาน");
        }
    };

    const handleNavigateToMemberDetail = (user) => {
        if (user && user._id) {
            console.log("Navigating to member detail with user:", user);  // Debugging output
            navigate(`/memberdetail/${user._id}`, { state: { user } });  // ส่งข้อมูลไปยังหน้า memberdetail
        } else {
            alert("ไม่พบข้อมูลผู้ใช้");
        }
    };

    useEffect(() => {
        if (!report) {
            setLoading(false);
            setErrorMessage('ไม่พบข้อมูลรายงาน');
        } else {
            console.log("Blog Owner ID:", report.blogOwner?._id);
            setLoading(false);
        }
    }, [report]);


    if (loading) {
        return <div>Loading...</div>;
    }

    if (errorMessage) {
        return <div>{errorMessage}</div>;
    }

    return (
        <div className="reportdetail">
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

            {/* Top Menu */}
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

            {/* Content */}
            <div className={`wrapper ${isSidebarCollapsed ? 'full-screen' : ''}`}>
                <div className="breadcrumb-container">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/dashboard">แดชบอร์ด</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/report">จัดการกระทู้ไม่พึงประสงค์</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                รายละเอียดกระทู้ไม่พึงประสงค์
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
                    <h1>รายละเอียดกระทู้ไม่พึงประสงค์</h1>
                    {report ? (
                        <>
                            <div className="report-details-container">
                                <div className="report-details">
                                    <h3>รายละเอียดการรายงาน</h3>
                                    <p>หมวดหมู่: {report.category?.title || 'ไม่มีหมวดหมู่'}</p>
                                    <p><strong>คำอธิบายหมวดหมู่:</strong> {report.category?.description || 'ไม่มีคำอธิบาย'}</p>
                                    <p><strong>ผู้รายงาน:</strong> {`${report.user?.firstname} ${report.user?.lastname}` || 'ไม่มีข้อมูลผู้รายงาน'}</p>
                                    <p><strong>วันที่รายงาน:</strong> {formatThaiDate(report.createdAt)}</p>
                                </div>

                            </div>

                            <div className="blog-info">
                                <div className="blog-image">
                                    <img src={report.blog?.obj_picture} alt="ไม่พบรูปภาพสิ่งของ" />
                                </div>
                                <div className="blog-details">
                                    <h3>รายละเอียดกระทู้</h3>
                                    <p><strong>ประเภทกระทู้:</strong> {report.blog?.object_subtype || 'ไม่มีข้อมูล'}</p>
                                    <p><strong>สี:</strong> {report.blog?.color || 'ไม่มีข้อมูล'}</p>
                                    <p><strong>สถานที่:</strong> {report.blog?.location || 'ไม่มีข้อมูล'}</p>
                                    <p><strong>หมายเหตุ:</strong> {report.blog?.note || 'ไม่มีข้อมูล'}</p>
                                    <p><strong>โทรศัพท์:</strong> {report.blog?.phone || 'ไม่มีข้อมูล'}</p>
                                    <p><strong>วันที่แจ้งพบสิ่งของ:</strong> {formatThaiDate(report.blog?.createdAt) || 'ไม่มีข้อมูล'}</p>
                                    <p><strong>เจ้าของกระทู้:</strong> {`${report.blogOwner?.firstname} ${report.blogOwner?.lastname}` || 'ไม่มีข้อมูล'}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>ไม่พบข้อมูลกระทู้ไม่พึงประสงค์ หรือข้อมูลผู้ใช้ไม่ครบถ้วน</p>
                    )}
                    <div className="action-buttons-container">
                        <button
                            className="delete-blog"
                            onClick={() => handleDeleteReport(report._id)}
                        >
                            ลบกระทู้
                        </button>

                        <button
                            className="unlock-button"
                            onClick={() => handleNavigateToMemberDetail(report.blogOwner)}
                        >
                            เจ้าของกระทู้
                        </button>

                    </div>
                </div>
            </div>

            <div className={`footer-content ${footerVisible ? 'visible' : ''}`}>
                <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
            </div>
        </div>
    );
}

export default ReportDetail;
