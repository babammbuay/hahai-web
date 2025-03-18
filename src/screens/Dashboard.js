import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaBell, FaCaretDown, FaUserSlash, FaBlog, FaDownload } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../hahai.css';
import '../menu.css';
import axios from 'axios';
import Mapfound from './components/Mapfound.js';

function Dashboard() {
  const [profileImage, setProfileImage] = useState(null);
  const [originalProfileImage, setOriginalProfileImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [adminUsername, setAdminUsername] = useState('');
  const [lastLoginTime, setLastLoginTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [suspendedUsers, setSuspendedUsers] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [topSubtypes, setTopSubtypes] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [locations, setLocations] = useState([]);
  const [timePeriod, setTimePeriod] = useState("ทั้งหมด");

  const [receivedCount, setReceivedCount] = useState(0);
  const [notReceivedCount, setNotReceivedCount] = useState(0);

  const navigate = useNavigate();

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleClick = () => {
    navigate('/dashboard');
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
      setProfileImage(response.data.profileImage);
      setOriginalProfileImage(response.data.profileImage);
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
    const updateDateTime = () => {
      const now = new Date();
      const optionsDate = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const optionsTime = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };

      const formattedDate = now.toLocaleDateString('th-TH', optionsDate);
      const formattedTime = now.toLocaleTimeString('th-TH', optionsTime);

      setCurrentDate({ formattedDate, formattedTime });
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        setOnlineUsers(response.data.users.filter(user => user.isOnline).length);
        setSuspendedUsers(response.data.suspendedUsers);
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTotalBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/blogs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        setTotalBlogs(response.data.totalBlogs);
      } catch (error) {
        console.error('Error fetching total blogs:', error);
      }
    };

    fetchTotalBlogs();
  }, []);

  useEffect(() => {
    const fetchTopSubtypes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/blogs/top-object-subtypes");
        setTopSubtypes(response.data);
      } catch (error) {
        console.error("Error fetching top subtypes:", error);
      }
    };

    fetchTopSubtypes();
  }, []);

  //แผนที่

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  useEffect(() => {
    console.log("Current time period:", timePeriod); // เช็คค่าของ timePeriod
    const fetchUrl = `http://localhost:5000/blogs/top-object-location?timePeriod=${timePeriod}`;

    fetch(fetchUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // เช็คข้อมูลที่ได้รับจาก API
        setLocations(data.topLocations);
      })
      .catch((error) => console.error("Error fetching locations:", error));
  }, [timePeriod]); // จะทำงานทุกครั้งที่ timePeriod เปลี่ยน



  useEffect(() => {
    const fetchReceivedItemCounts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/thread-counts'); // Call your API
        setReceivedCount(response.data.receivedCount); // Set the count for received items
        setNotReceivedCount(response.data.notReceivedCount); // Set the count for not received items
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchReceivedItemCounts(); // Fetch the data when the component mounts
  }, []);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/admin');
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
  };

  return (
    <div className="dashboard">
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="text-center mb-4">
          <img
            src="https://i.imgur.com/hcl6qVY.png"
            alt="เมนู"
            style={{ maxWidth: '80%', height: 'auto', paddingTop: 15, cursor: 'pointer' }}
            onClick={handleClick}
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
            <Link to="/feedback" className="menu-link">
              <FaComments size={20} />
              <h5>แจ้งปัญหาการใช้งาน</h5>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/category" className="menu-link">
              <FaTag size={20} />
              <h5>จัดการหมวดหมู่</h5>
            </Link>
          </li>
        </ul>
      </div>

      <div className="top-menu">
        <div className="hamburger-menu" onClick={toggleSidebar}>
          ☰
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', marginLeft: 'auto' }}>
          <div className="notification-icon" onClick={handleNotifications}>
            <FaBell size={25} />
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
          </div>
          <div className="profile-icon" onClick={handleDropdownToggle}>
            {isLoading ? (
              <p>กำลังโหลด...</p>
            ) : profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <FaUserCircle size={30} />
            )}
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

      <div className={`content-dashboard ${isSidebarCollapsed ? 'full-screen' : ''}`}>
        <div className="header-content">
          <h1>Dashboard</h1>
          <button className="create-report-btn">
            <FaDownload size={14} style={{ marginRight: '8px' }} />
            สร้างรายงาน
          </button>
        </div>
        <p className="date-time">
          {currentDate.formattedDate} เวลา {currentDate.formattedTime}
        </p>


        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="info-box total-users">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>ผู้ใช้ทั้งหมด</h4>
                    <p>{totalUsers}</p>
                  </div>
                  <FaUsers size={40} color="#d1d8e0" />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="info-box active-users">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>ผู้ใช้ที่กำลังใช้งาน</h4>
                    <p>{onlineUsers}</p>
                  </div>
                  <FaUsers size={40} color="#d1d8e0" />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="info-box suspended-users">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>ผู้ใช้ที่ถูกระงับ</h4>
                    <p>{suspendedUsers}</p>
                  </div>
                  <FaUserSlash size={40} color="#d1d8e0" />
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="info-box total-blogs">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>กระทู้ทั้งหมด</h4>
                    <p>{totalBlogs}</p>
                  </div>
                  <FaBlog size={40} color="#d1d8e0" />
                </div>
              </div>
            </div>

          </div>

          <div className="container-reported">
            <div className="top-reported-items">
              <div style={{ backgroundColor: "#f9fafc", padding: "5px", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px", color: "#4e73df" }}>
                  สิ่งของที่ถูกรายงานบ่อยที่สุด
                </h2>
                {topSubtypes.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {topSubtypes.map((subtype, index) => (
                      <li
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "13px 20px",
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f5f7fa",
                          borderRadius: "8px",
                          marginBottom: "10px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
                          <span style={{ fontWeight: "bold", fontSize: "14px", color: "#007bff" }}>
                            {index + 1}.
                          </span>
                          <span style={{ fontWeight: "600", color: "#2c3e50", fontSize: "14px" }}>{subtype.type}</span>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <span style={{ color: "#6c757d", fontSize: "14px" }}>
                            <strong>{subtype.count}</strong> กระทู้
                          </span>
                        </div>
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <span style={{ color: "#ff6b6b", fontWeight: "bold", fontSize: "14px" }}>
                            {subtype.percentage}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ textAlign: "center", color: "#6d7c8b", fontSize: "14px", marginTop: "20px" }}>
                    No reported items available.
                  </p>
                )}
              </div>
            </div>

            <div className="thread-category">
              <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px", color: "#4e73df" }}>การรับสิ่งของ</h2>
              <div className="counts-container">
                <div className="count-box">
                  <h3>สิ่งของถูกรับไปแล้ว</h3>
                  <p>{receivedCount} กระทู้</p>
                </div>
                <div className="count-box">
                  <h3>ยังไม่ได้รับสิ่งของ</h3>
                  <p>{notReceivedCount} กระทู้</p>
                </div>
                {/* <p>
                  สถานะการรับสิ่งของที่ยังไม่ได้รับทั้งหมดมี {notReceivedCount} กระทู้ที่รอการตอบรับ.
                  ขณะที่ {receivedCount} กระทู้ได้มีการรับสิ่งของแล้ว.
                </p> */}
              </div>
            </div>
          </div>

          <div className="location-section">
            <div className="location-header">
              <h2 className="location-heading">สถานที่ที่แจ้งพบสิ่งของบ่อย</h2>
              <div className="filter-container">
                <select
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                  style={{
                    padding: "5px",
                    fontSize: "14px",
                    border: "0px",
                    backgroundColor: "#78B0FF",
                    color: "white",
                  }}
                >
                  <option style={{ backgroundColor: "white", color: "black" }} value="ทั้งหมด">ทั้งหมด</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="วันนี้">วันนี้</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="เมื่อวาน">เมื่อวาน</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="1สัปดาห์">1 สัปดาห์ที่แล้ว</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="2สัปดาห์">2 สัปดาห์ที่แล้ว</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="เดือนนี้">เดือนนี้</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="เดือนที่แล้ว">เดือนที่แล้ว</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="ปีนี้">ปีนี้</option>
                  <option style={{ backgroundColor: "white", color: "black" }} value="ปีที่แล้ว">ปีที่แล้ว</option>
                </select>

              </div>
            </div>

            <p style={{ color: "gray", fontSize: 14, marginBottom: 30 }}>
              แสดง 5 อันดับสถานที่ที่พบสิ่งของบ่อยที่สุดในมหาวิทยาลัยขอนแก่น
            </p>


            <main className="map-container">
              {/* แผนที่ */}
              <Mapfound timePeriod={timePeriod} />
            </main>

            <div className="Mapcont" style={{ marginTop: "54px" }}>
              {locations.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {locations.map((loc, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "13px 20px",
                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f5f7fa",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
                        <span style={{ fontWeight: "bold", fontSize: "14px", color: "#007bff" }}>
                          {index + 1}.
                        </span>
                        <span style={{ fontWeight: "600", color: "#2c3e50", fontSize: "14px" }}>{loc.locationname}</span>
                      </div>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <span style={{ color: "#6c757d", fontSize: "14px" }}>
                          <strong>{loc.count}</strong> ครั้ง
                        </span>
                      </div>

                      <div style={{ flex: 1, textAlign: "right" }}>
                        <span style={{ color: "#ff6b6b", fontWeight: "bold", fontSize: "14px" }}>
                          {loc.percentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ textAlign: "center", color: "#6d7c8b", fontSize: "14px", marginTop: "20px" }}>
                  ไม่มีสถานที่ที่ถูกรายงานบ่อย
                </p>
              )}
            </div>
          </div>


        </div>
      </div>
      <div className={`footer-content ${footerVisible ? 'visible' : ''}`}>
        <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
      </div>
    </div>
  );
}

export default Dashboard;