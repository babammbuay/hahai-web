import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaTrash, FaEye, FaBan, FaBell, FaUser, FaCaretDown } from 'react-icons/fa';
import axios from 'axios';

function MemberDetail() {
  const [adminUsername, setAdminUsername] = useState('');
  const [lastLoginTime, setLastLoginTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const { id } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [footerVisible, setFooterVisible] = useState(false);
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
    console.log(user);
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    console.log("Received user ID:", id);
    if (location.state?.user) {
      setUser(location.state.user);
      setLoading(false);
    } else if (id) {
      fetchUserData(id);
    } else {
      setLoading(false);
      alert("ข้อมูลผู้ใช้ไม่ครบถ้วน");
    }
  }, [location.state, id]);

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

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.data) {
        setUser(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("ไม่สามารถดึงข้อมูลผู้ใช้");
      setLoading(false);
    }
  };

  if (!user) {
    return <p>ข้อมูลผู้ใช้ไม่พบ</p>;
  }

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

  const formatLastLogin = (lastLoginTimestamp) => {
    const lastLogin = new Date(lastLoginTimestamp);

    // Check if the timestamp is valid
    if (isNaN(lastLogin.getTime())) {
      return "ไม่พบข้อมูล";  // If invalid, return a default message
    }

    // Format the date
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = lastLogin.getDate();
    const month = thaiMonths[lastLogin.getMonth()];
    const year = lastLogin.getFullYear() + 543;
    const formattedDate = `${day} ${month} ${year}`;

    const hours = lastLogin.getHours();
    const minutes = lastLogin.getMinutes();
    const seconds = lastLogin.getSeconds();
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

    return `${formattedDate} เวลา ${formattedTime}`;
  };

  const handleSuspend = async () => {
    if (!user || !user._id) {
      alert("ไม่พบข้อมูลผู้ใช้ หรือข้อมูลไม่ครบถ้วน");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/users/suspend/${user._id}`,
        { reason: "การละเมิดกฎ" },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.status === 200) {
        alert("ผู้ใช้งานถูกระงับเรียบร้อย");
        setUser(prevUser => ({
          ...prevUser,
          accountStatus: 'suspended',
          suspendedHistory: [...prevUser.suspendedHistory, {
            suspendedAt: new Date(),
            reason: 'การละเมิดกฎ'
          }]
        })); // อัปเดตสถานะของบัญชีเป็น "suspended"
      } else {
        alert(response.data.message || "เกิดข้อผิดพลาดในการระงับผู้ใช้");
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("เกิดข้อผิดพลาดในการระงับผู้ใช้");
    }
  };

  const handleUnsuspend = async () => {
    if (!user || !user._id) {
      alert("ไม่พบข้อมูลผู้ใช้ หรือข้อมูลไม่ครบถ้วน");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/users/unsuspend/${user._id}`,
        {}, // ส่งข้อมูลที่จำเป็น (ถ้ามี)
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.status === 200) {
        alert("ผู้ใช้งานถูกปลดล็อคเรียบร้อย");
        setUser(prevUser => ({
          ...prevUser,
          accountStatus: 'active',
        }));
      } else {
        alert(response.data.message || "เกิดข้อผิดพลาดในการปลดล็อคผู้ใช้");
      }
    } catch (error) {
      console.error("Error unsuspending user:", error);
      alert("เกิดข้อผิดพลาดในการปลดล็อคผู้ใช้");
    }
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
                <Link to="/member">จัดการสมาชิก</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                รายละเอียดผู้ใช้งาน
              </li>
            </ol>
          </nav>
        </div>

        <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
          <h1>รายละเอียดผู้ใช้งาน</h1>
          {user ? (
            <div className="user-details-container">
              <div className="user-details">
                <div className="user-profile">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="โปรไฟล์"
                      className="profile-image"
                    />
                  ) : (
                    <FaUserCircle size={280} style={{ width: '100%', height: '100%', borderRadius: '15px', border: '2px solid #ddd', color: '#888', backgroundColor: '#f4f4f4' }} />
                  )}
                </div>

                <div className="user-info">
                  <p>ชื่อผู้ใช้: {user.username}</p>
                  <p>อีเมล: {user.email}</p>
                  <p>ชื่อ: {user.firstname}</p>
                  <p>นามสกุล: {user.lastname}</p>
                  <p>วันที่ลงทะเบียน: {formatThaiDate(user.createdAt)}</p>
                  <p>วันที่เข้าสู่ระบบล่าสุด: {user && user.lastLogin ? formatLastLogin(user.lastLogin) : "ไม่พบข้อมูล"}</p>
                  <p>จำนวนกระทู้ที่สร้าง: {user.postCount || 0} กระทู้</p>
                  <p>จำนวนครั้งที่บัญชีถูกระงับ: {user.suspendedHistory ? user.suspendedHistory.length : 0} ครั้ง</p>

                  {/* <div className="suspended-history">
                    {user.suspendedHistory && user.suspendedHistory.length > 0 ? (
                      <ul>
                        {user.suspendedHistory.map((suspension, index) => (
                          <li key={index}>
                            <p>วันที่ระงับ: {formatThaiDate(suspension.suspendedAt)}</p>
                            <p>เหตุผล: {suspension.reason || "ไม่ระบุ"}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: "#111", fontSize: 14 }}>ไม่มีประวัติการระงับบัญชี</p>
                    )}
                  </div> */}

                  <div className="suspended-history">
                    {user.suspendedHistory && user.suspendedHistory.length > 0 ? (
                      <ul>
                        {user.suspendedHistory.reduce((latest, suspension) => {
                          // หาวันที่ระงับล่าสุด
                          if (!latest || new Date(suspension.suspendedAt) > new Date(latest.suspendedAt)) {
                            return suspension;
                          }
                          return latest;
                        }, null) ? (
                          <li key={user.suspendedHistory[0].suspendedAt}>
                            <p>วันที่ระงับ: {formatThaiDate(user.suspendedHistory[0].suspendedAt)}</p>
                            <p>เหตุผล: {user.suspendedHistory[0].reason || "ไม่ระบุ"}</p>
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      <p style={{ color: "#111", fontSize: 14 }}>ไม่มีประวัติการระงับบัญชี</p>
                    )}
                  </div>
                </div>

                <div className="user-status">
                  <p className={`account-status ${user.accountStatus === "suspended" ? "suspended" : ""}`}>
                    <span className="icon">
                      <i className={user.accountStatus === "active" ? "fas fa-check-circle" : "fas fa-times-circle"}></i>
                    </span>
                    <span className="text">
                      {user.accountStatus === "active" ? "บัญชีใช้งานได้" : "บัญชีถูกระงับ"}
                    </span>
                  </p>

                  <p className={user.isOnline ? "online-status" : "offline-status"}>
                    <span className="icon">
                      <i className={user.isOnline ? "fas fa-circle" : "fas fa-circle-notch"}></i>
                    </span>
                    <span className="text">
                      {user.isOnline ? "ออนไลน์" : "ออฟไลน์"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="action-buttons-container">
                <button
                  className="action-button"
                  onClick={handleSuspend}
                  disabled={user.accountStatus === "suspended"}
                >
                  ระงับการใช้งาน
                </button>

                <button
                  className="unlock-button"
                  onClick={handleUnsuspend}
                  disabled={user.accountStatus === "active"}
                >
                  ปลดล็อคการระงับ
                </button>
              </div>

            </div>

          ) : (
            <p>ข้อมูลผู้ใช้ไม่พบ</p>
          )}
        </div>
      </div>

      <div className={`footer-content ${footerVisible ? 'visible' : ''}`}>
        <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
      </div>
    </div>
  );
}

export default MemberDetail;
