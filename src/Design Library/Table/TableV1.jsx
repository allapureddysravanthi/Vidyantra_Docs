import React, { useState } from "react";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { RxDotsHorizontal } from "react-icons/rx";
import { useTheme } from "../../contexts/ThemeContext";

const TableV1 = ({ columns = [], data = [], showCheckbox = true, noDataMessage = "No records found" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // default
  const { isDark } = useTheme();

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  
  const totalRows = safeData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

const start = (currentPage - 1) * rowsPerPage;
const paginatedData = safeData.slice(start, start + rowsPerPage);

  const startCount = (currentPage - 1) * rowsPerPage + 1;
  const endCount = Math.min(startCount + rowsPerPage - 1, totalRows);

  const [selectedRows, setSelectedRows] = useState([]);
  const allCurrentPageIds = paginatedData.map(
    (_, idx) => (currentPage - 1) * rowsPerPage + idx
  );

  const isAllSelected = allCurrentPageIds.every((id) =>
    selectedRows.includes(id)
  );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows((prev) =>
        prev.filter((id) => !allCurrentPageIds.includes(id))
      );
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...allCurrentPageIds])]);
    }
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 3;
    const half = Math.floor(maxPageNumbers / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      endPage = Math.min(totalPages, maxPageNumbers);
    }

    if (currentPage + half >= totalPages) {
      startPage = Math.max(3, totalPages - maxPageNumbers + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          style={pageButtonStyle(false, isDark)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <RxDotsHorizontal
            key="start-ellipsis"
            style={{ color: isDark ? "#6B7280" : "#A0AEC0", fontSize: "18px" }}
          />
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          style={pageButtonStyle(isActive, isDark)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <RxDotsHorizontal
            key="end-ellipsis"
            style={{ color: isDark ? "#6B7280" : "#A0AEC0", fontSize: "18px" }}
          />
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          style={pageButtonStyle(false, isDark)}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  // Theme-aware styles
  const themeStyles = {
    container: {
      width: "100%",
      fontSize: "14px",
      color: isDark ? "#E5E7EB" : "#1F2937"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF"
    },
    headerRow: {
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: isDark ? "#D1D5DB" : "#4B5563",
      border: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      backgroundColor: isDark ? "#111827" : "#F9FAFB"
    },
    headerCell: {
      padding: "8px",
      textAlign: "left",
      fontWeight: 700,
      fontSize: "14px",
      color: isDark ? "#D1D5DB" : "#4B5563"
    },
    checkboxCell: {
      padding: "8px",
      textAlign: "center"
    },
    bodyRow: {
      borderRight: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      cursor: "pointer",
      color: isDark ? "#D1D5DB" : "#4B5563",
      backgroundColor: "transparent"
    },
    bodyRowSelected: {
      borderRight: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      cursor: "pointer",
      color: isDark ? "#D1D5DB" : "#4B5563",
      backgroundColor: isDark ? "#1E40AF" : "#e8f0fe"
    },
    bodyRowHover: {
      backgroundColor: isDark ? "#374151" : "#f9fafb"
    },
    bodyRowSelectedHover: {
      backgroundColor: isDark ? "#1E40AF" : "#e8f0fe"
    },
    bodyCell: {
      borderTop: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      borderBottom: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      padding: "8px",
      fontWeight: 500,
      fontSize: "14px",
      color: isDark ? "#D1D5DB" : "#4B5563"
    },
    bodyCellHighlighted: {
      borderTop: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      borderBottom: `1px solid ${isDark ? "#374151" : "#F3F4F6"}`,
      padding: "8px",
      fontWeight: 500,
      fontSize: "14px",
      color: isDark ? "#60A5FA" : "#0056b3",
      textDecoration: "underline"
    },
    noDataCell: {
      textAlign: "center",
      padding: "20px",
      color: isDark ? "#9CA3AF" : "#6B7280",
      fontSize: "14px"
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "50px",
      padding: "0 8px"
    },
    footerInfo: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: isDark ? "#D1D5DB" : "#4B5563",
      fontSize: "12px"
    },
    select: {
      padding: "2px 6px",
      fontSize: "12px",
      border: `1px solid ${isDark ? "#4B5563" : "#ccc"}`,
      borderRadius: "4px",
      backgroundColor: isDark ? "#374151" : "#fff",
      color: isDark ? "#D1D5DB" : "#1F2937",
      cursor: "pointer"
    },
    paginationContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  };

  return (
    <div style={themeStyles.container}>
      <table style={themeStyles.table}>
        <thead>
          <tr style={themeStyles.headerRow}>
            {/* <th
              style={{
                border: "1px solid #F3F4F6",
                padding: "8px",
                textAlign: "center",
              }}
            >
              S.No
            </th> */}
            {showCheckbox && (
              <th style={themeStyles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
            )}

            {columns.map((col, idx) => (
              <th key={idx} style={themeStyles.headerCell}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {col.header}
                  {col.icon && (
                    <span style={{ marginRight: "20px" }}>{col.icon}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

       <tbody>
  {paginatedData.length === 0 ? (
    <tr>
    <td
  colSpan={columns.length + (showCheckbox ? 1 : 0)}
  style={themeStyles.noDataCell}
>
  {noDataMessage}
</td>

    </tr>
  ) : (
    paginatedData.map((row, rIdx) => {
      const globalIdx = (currentPage - 1) * rowsPerPage + rIdx;
      const isSelected = selectedRows.includes(globalIdx);

      return (
        <tr
          key={rIdx}
          style={isSelected ? themeStyles.bodyRowSelected : themeStyles.bodyRow}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = isSelected
              ? themeStyles.bodyRowSelectedHover.backgroundColor
              : themeStyles.bodyRowHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = isSelected
              ? themeStyles.bodyRowSelected.backgroundColor
              : themeStyles.bodyRow.backgroundColor)
          }
        >
          {showCheckbox && (
            <td style={themeStyles.bodyCell}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleRow(globalIdx)}
                style={{ cursor: "pointer" }}
              />
            </td>
          )}
          {columns.map((col, cIdx) => {
            const value = row[col.accessor];
            return (
              <td
                key={cIdx}
                style={
                  col.highlightOnSelect && isSelected
                    ? themeStyles.bodyCellHighlighted
                    : themeStyles.bodyCell
                }
              >
                {col.cellRenderer
                  ? col.cellRenderer(value, row)
                  : value}
              </td>
            );
          })}
        </tr>
      );
    })
  )}
</tbody>

      </table>

      {/* Footer */}
      <div style={themeStyles.footer}>
        <div style={themeStyles.footerInfo}>
          <span>
            {startCount}-{endCount} of {totalRows}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              style={themeStyles.select}
            >
              {[5, 10, 25, 50].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <label htmlFor="rows-per-page">Per Page</label>
          </div>
        </div>

        <div style={themeStyles.paginationContainer}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={navButtonStyle(currentPage === 1, isDark)}
          >
            <GrFormPrevious style={{ fontSize: "18px" }} /> Previous
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {renderPageNumbers()}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalRows === 0}
            style={navButtonStyle(
              currentPage === totalPages || totalRows === 0,
              isDark
            )}
          >
            Next <GrFormNext style={{ fontSize: "18px" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Button styles - now theme-aware
const pageButtonStyle = (isActive, isDark) => ({
  height: "24px",
  width: "24px",
  borderRadius: "50%",
  border: `1px solid ${isDark ? "#4B5563" : "#ccc"}`,
  fontSize: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: isActive ? "#0056B3" : "transparent",
  color: isActive ? "#fff" : (isDark ? "#D1D5DB" : "#000"),
  cursor: "pointer",
});

const navButtonStyle = (disabled, isDark) => ({
  padding: "6px 10px",
  border: "none",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: disabled ? "#A0AEC0" : (isDark ? "#D1D5DB" : "#4B5563"),
  backgroundColor: "transparent",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default TableV1;
