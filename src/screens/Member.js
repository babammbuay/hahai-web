import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaSearch, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaTrash, FaEye, FaBan, FaBell, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../hahai.css';
import '../menu.css';

function Member() {
  const [adminUsername, setAdminUsername] = useState('');
  const [lastLoginTime, setLastLoginTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [buttonColor, setButtonColor] = useState('#006AFF');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
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

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      setErrorMessage('ไม่พบผู้ใช้ โปรดเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setTotalUsers(response.data.totalUsers || 0);  // Set the total users count
      } else {
        setErrorMessage('ไม่มีข้อมูลผู้ใช้');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      if (error.response?.data?.message === 'Token ไม่ถูกต้องหรือหมดอายุ') {
        localStorage.removeItem('authToken');
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


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

  const filteredUsers = useMemo(() => {
    return users
      .map((user, index) => ({
        ...user,
        realIndex: index + 1,
      }))
      .filter(user => {
        const formattedDate = formatThaiDate(user.createdAt);  // Format the creation date to Thai format

        return (
          // ค้นหาจากชื่อผู้ใช้, ชื่อ-นามสกุล
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // ค้นหาจากสถานะการใช้งาน
          (user.isOnline && (searchTerm.toLowerCase().includes('ออนไลน์') && user.isOnline) ||
            (searchTerm.toLowerCase().includes('ออฟไลน์') && !user.isOnline)) ||
          // ค้นหาจากสถานะบัญชี
          (user.accountStatus &&
            (searchTerm.toLowerCase().includes('บัญชีใช้งานได้') && user.accountStatus === 'active') ||
            (searchTerm.toLowerCase().includes('บัญชีถูกระงับ') && user.accountStatus === 'suspended')) ||
          // ค้นหาจากวันที่ (ค้นหาจากวันที่ในรูปแบบ 24 กันยายน 2567)
          formattedDate.includes(searchTerm)  // Compare formatted date with search term
        );
      });
  }, [users, searchTerm]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleViewDetails = (id) => {
    console.log(`Viewing details for user ID: ${id}`);
    const user = users.find(u => u._id === id); // หา user จาก users
    if (user) {
      navigate('/memberdetail', { state: { user } }); // ส่ง user ไปยังหน้า memberdetail
    } else {
      alert("ไม่พบผู้ใช้ที่มี ID นี้");
    }
  };

  const handleSuspendAccount = async (userId) => {
    const userToSuspend = users.find(user => user._id === userId); // Find the user by ID

    if (!userToSuspend) {
      alert("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/users/suspend/${userId}`,
        { reason: "การละเมิดกฎ" }, // You can customize the reason here
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.status === 200) {
        alert("ผู้ใช้งานถูกระงับเรียบร้อย");

        // Update the user status locally after suspending the account
        setUsers(prevUsers => prevUsers.map(user =>
          user._id === userId
            ? { ...user, accountStatus: 'suspended', suspendedHistory: [...user.suspendedHistory, { suspendedAt: new Date(), reason: 'การละเมิดกฎ' }] }
            : user
        ));
      } else {
        alert(response.data.message || "เกิดข้อผิดพลาดในการระงับผู้ใช้");
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("เกิดข้อผิดพลาดในการระงับผู้ใช้");
    }
  };

  const handleDeleteAccount = async (id) => {
    console.log(`Deleting account for user ID: ${id}`);

    if (!id) {
      alert("Invalid user ID");
      return;
    }

    const confirmDelete = window.confirm("คุณต้องการลบบัญชีผู้ใช้งานนี้หรือไม่?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error("Token not found. Please log in again.");
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const response = await axios.delete(`http://localhost:5000/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert("บัญชีผู้ใช้งานถูกลบเรียบร้อยแล้ว");
      } else {
        alert("เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้งาน");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้งาน");
    }
  };

  return (
    <div className="member">
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
              <li className="breadcrumb-item active" aria-current="page">
                จัดการสมาชิก
              </li>
            </ol>
          </nav>
          <div className="count">
            <p>จำนวนสมาชิกทั้งหมด: {totalUsers} คน</p>
          </div>
        </div>

        <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
          <h1>จัดการสมาชิก</h1>

          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="ค้นหาสมาชิก"
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-control"
              />
              <FaSearch size={20} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>#</th>
                  <th>ชื่อผู้ใช้</th>
                  <th>อีเมล</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>วันที่ลงทะเบียน</th>
                  <th>สถานะการใช้งาน</th>
                  <th>สถานะบัญชี</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  currentItems.map((user) => (
                    <tr key={user._id}>
                      <td>{user.realIndex}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.firstname} {user.lastname}</td>
                      <td>{formatThaiDate(user.createdAt)}</td>
                      <td>
                        {user.isOnline ? (
                          <span className="badge badge-success">ออนไลน์</span>
                        ) : (
                          <span className="badge badge-secondary">ออฟไลน์</span>
                        )}
                      </td>
                      <td>
                        {user.accountStatus === 'active' ? (
                          <span className="badge badge-primary">บัญชีใช้งานได้</span>
                        ) : (
                          <span className="badge badge-danger">บัญชีถูกระงับ</span>
                        )}
                      </td>
                      <td>
                        <div className="button-container">
                          <button
                            className="btn btn-primary btn-icon"
                            onClick={() => handleViewDetails(user._id)}
                          >
                            <FaEye className="icon" />
                          </button>
                          <button
                            className="btn btn-warning btn-icon"
                            onClick={() => handleSuspendAccount(user._id)}
                          >
                            <FaBan className="icon" />
                          </button>

                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => handleDeleteAccount(user._id)}
                          >
                            <FaTrash className="icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {/* Left Arrow */}
            {currentPage > 1 && (
              <button className="arrow" onClick={() => setCurrentPage(currentPage - 1)}>
                <FaChevronLeft size={15} />
              </button>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <button
                key={pageNumber}
                className={`btn ${pageNumber === currentPage ? 'active' : ''}`}
                onClick={() => paginate(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            {currentPage < totalPages && (
              <button className="arrow" onClick={() => setCurrentPage(currentPage + 1)}>
                <FaChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={`footer-content ${footerVisible ? 'visible' : ''}`}>
        <p>&copy; 2025 Hahai Admin Panel. Designed to enhance system management and control.</p>
      </div>
    </div >
  );
}

export default Member;
