import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaTrash, FaChevronLeft, FaChevronRight, FaHome, FaUsers, FaFlag, FaComments, FaTag, FaUserCircle, FaEye, FaReply, FaBell, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../hahai.css';
import '../menu.css';

function Report() {
  const [adminUsername, setAdminUsername] = useState('');
  const [lastLoginTime, setLastLoginTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(3);
  const [totalReports, setTotalReports] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;
  const [footerVisible, setFooterVisible] = useState(false);

  const token = localStorage.getItem('authToken');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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

  const filteredReports = reports.filter((report) => {
    console.log(report);
    const search = searchTerm.toLowerCase();
    return (
      report.category?.title?.toLowerCase().includes(search) ||
      report.user?.firstname?.toLowerCase().includes(search) ||
      report.user?.lastname?.toLowerCase().includes(search) ||
      report.blog?.object_subtype?.toLowerCase().includes(search) ||
      report.blogOwner?.firstname?.toLowerCase().includes(search) ||
      report.blogOwner?.lastname?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleProfile = () => {
    console.log('Profile clicked');
    navigate('/admin');
  };


  const handleLogout = () => {
    console.log('Logout clicked');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  useEffect(() => {
    if (!token) {
      console.error('ไม่พบผู้ใช้โปรดเข้าสู่ระบบใหม่');
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

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response:', response.data); // Debugging line to check API response

      if (response.data && response.data.reports) {
        setReports(response.data.reports);
        setTotalReports(response.data.totalReports);
        console.log('Total Reports:', response.data.totalReports);
      } else {
        console.error('No reports data received');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDeleteReport = async (id) => {
    const confirmDelete = window.confirm("คุณต้องการลบรายงานนี้จริงหรือไม่?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setReports(reports.filter((report) => report._id !== id));
        // alert("รายงานถูกลบเรียบร้อยแล้ว");
        // setSuccessMessage('รายงานถูกลบเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert("เกิดข้อผิดพลาดในการลบรายงาน");
      // setErrorMessage('เกิดข้อผิดพลาดในการลบรายงาน');
    }
  };

  const handleReplyToUser = async (reportId) => {
    try {
      const response = await axios.post(`http://localhost:5000/reports/${reportId}/reply`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          replyMessage: 'ข้อความตอบกลับผู้ใช้ของคุณ',
        },
      });

      if (response.status === 200) {
        console.log('ตอบกลับผู้ใช้สำเร็จ');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับ:', error);
    }
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

  const handleViewReportDetails = (reportId) => {
    console.log(`Viewing details for report ID: ${reportId}`);
    const report = reports.find(r => r._id === reportId);
    if (report) {
      navigate('/reportdetail', { state: { report } });
    } else {
      alert("ไม่พบรายงานที่มี ID นี้");
    }
  };

  return (
    <div className="report">
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

      {/* Main Content */}
      <div className={`wrapper ${isSidebarCollapsed ? 'full-screen' : ''}`}>
        <div className="breadcrumb-container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/dashboard">แดชบอร์ด</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                จัดการกระทู้ไม่พึงประสงค์
              </li>
            </ol>
          </nav>
          <div className="count">
            <p>จำนวนกระทู้ไม่พึงประสงค์ทั้งหมด: {totalReports} กระทู้</p>
          </div>
        </div>

        <div className={`content ${isSidebarCollapsed ? 'full-screen' : ''}`}>
          <h1>จัดการกระทู้ไม่พึงประสงค์</h1>

          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="ค้นหากระทู้ไม่พึงประสงค์"
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
                  <th>หมวดหมู่</th>
                  <th>ผู้รายงาน</th>
                  <th>กระทู้</th>
                  <th>เจ้าของกระทู้</th>
                  <th>วันที่รายงาน</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  currentReports.map((report, index) => (
                    <tr key={report._id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{report.category?.title || 'ไม่มีหมวดหมู่'}</td>
                      <td>{`${report.user?.firstname || ''} ${report.user?.lastname || ''}` || 'ไม่มีชื่อผู้รายงาน'}</td>
                      <td>{report.blog?.object_subtype || 'ไม่มีข้อมูลกระทู้'}</td>
                      <td>{`${report.blogOwner?.firstname || ''} ${report.blogOwner?.lastname || ''}` || 'ไม่มีข้อมูลเจ้าของกระทู้'}</td>
                      <td>{formatThaiDate(report.createdAt)}</td>
                      <td>
                        <div className="button-container">
                          <button
                            className="btn btn-primary btn-icon"
                            onClick={() => handleViewReportDetails(report._id)}
                          >
                            <FaEye className="icon" />
                          </button>
                          <button
                            className="btn btn-success btn-icon"
                            onClick={() => handleReplyToUser(report._id)}
                          >
                            <FaReply className="icon" />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => handleDeleteReport(report._id)}
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
              <button className="arrow" onClick={handlePrevPage}>
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
              <button className="arrow" onClick={handleNextPage}>
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

export default Report;
