import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaSearch, FaChevronRight, FaChevronLeft, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaBell, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../hahai.css';
import '../menu.css';

function Feedback() {
  const [adminUsername, setAdminUsername] = useState('');
  const [lastLoginTime, setLastLoginTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc = น้อยไปมาก
  const [sortColumn, setSortColumn] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  const handleNotifications = () => {
    console.log('Notifications clicked');
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

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('ไม่พบผู้ใช้โปรดเข้าสู่ระบบใหม่');
        return;
      }

      const response = await axios.get('http://localhost:5000/feedbacks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const { feedbacks, totalCount, token: newToken } = response.data;

        if (newToken) {
          localStorage.setItem('authToken', newToken);
        }

        setFeedbacks(feedbacks);
        setTotalCount(totalCount);
      } else {
        setErrorMessage('ไม่พบข้อมูลการแจ้งปัญหาการใช้งาน');
      }
      setLoading(false);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล', error);

      if (error.response && error.response.status === 401) {
        setErrorMessage("เซลชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        handleLogout();
      } else {
        setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูล โปรดลองอีกครั้ง');
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .map((feedback, index) => ({
        ...feedback,
        realIndex: index + 1,
      }))
      .filter(feedback =>
        feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [feedbacks, searchTerm]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredFeedbacks, currentPage, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteFeedback = async (id) => {
    console.log("Deleting feedback with ID:", id);

    if (!id) {
      alert("Invalid feedback ID");
      return;
    }

    const confirmDelete = window.confirm("คุณต้องการลบฟีดแบ็คนี้หรือไม่?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error("Token not found. Please log in again.");
        setErrorMessage("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        handleLogout();
        return;
      }

      const response = await axios.delete(`http://localhost:5000/feedbacks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSuccessMessage("ฟีดแบ็คถูกลบเรียบร้อยแล้ว");
        setFeedbacks((prevFeedbacks) =>
          prevFeedbacks.filter((feedback) => feedback._id !== id)
        );
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบฟีดแบ็ค:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการลบฟีดแบ็ค");
    }
  };

  const handleReply = (id) => {
    console.log(`Replying to feedback with ID: ${id}`);
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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

  const handleSort = (column) => {
    const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newSortOrder);

    const sortedFeedbacks = [...feedbacks].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newSortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return newSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFeedbacks(sortedFeedbacks);
  };

  return (
    <div className="feedback">
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
          {/* <div className="profile-icon" onClick={handleDropdownToggle}>
            <FaUserCircle size={30} />
          </div> */}
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

      {/* Main Content */}
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
            <p>จำนวนการแจ้งปัญหาทั้งหมด: {totalCount} การใช้งาน</p>
          </div>
        </div>

        <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
          <h1>จัดการแจ้งปัญหาการใช้งาน</h1>

          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="ค้นหา"
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
                  <th onClick={() => handleSort('realIndex')}>#</th>
                  <th onClick={() => handleSort('user.username')}>ผู้ใช้</th>
                  <th onClick={() => handleSort('feedback')}>รายละเอียด</th>
                  <th onClick={() => handleSort('createdAt')}>วันที่แจ้งปัญหา</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  currentItems.map((feedback) => (
                    <tr key={feedback._id}>
                      <td>{feedback.realIndex}</td>
                      <td>{feedback.user.username}</td>
                      <td>{feedback.feedback}</td>
                      <td>{formatThaiDate(feedback.createdAt)}</td>
                      <td>
                        <div className="button-container">
                          {/* <button
                            className="btn btn-success btn-icon"
                            onClick={() => handleReply(feedback._id)}
                          >
                            <FaReply className="icon" />
                          </button> */}
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => handleDeleteFeedback(feedback._id)}
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
            {currentPage > 1 && (
              <button className="arrow" onClick={() => setCurrentPage(currentPage - 1)}>
                <FaChevronLeft size={15} />
              </button>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
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
    </div>
  );
}

export default Feedback;
