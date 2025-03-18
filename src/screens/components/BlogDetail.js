import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BlogDetail() {
  const [topSubtypes, setTopSubtypes] = useState([]); // เก็บข้อมูล object_subtype
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  const itemsPerPage = 5; // จำนวนแถวต่อหน้า

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

  // คำนวณข้อมูลสำหรับหน้า Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = topSubtypes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(topSubtypes.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="blog-detail">
      <h3>สิ่งของที่ถูกแจ้งพบบ่อย</h3>
      <ul>
        {currentItems.map((item, index) => (
          <li key={index}>
            {item.type}: {item.count} ครั้ง
          </li>
        ))}
      </ul>

      {/* ปุ่มเปลี่ยนหน้า */}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          ก่อนหน้า
        </button>
        <span>
          หน้า {currentPage} จาก {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          ถัดไป
        </button>
      </div>
    </div>
  );
}

export default BlogDetail;
