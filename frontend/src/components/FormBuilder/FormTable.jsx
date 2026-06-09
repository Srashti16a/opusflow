import React from "react";

function FormTable({
  columns = [],
  data = [],
  loading = false,
  sortBy,
  sortOrder,
  onSort,
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  emptyMessage = "No records found."
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleHeaderClick = (col) => {
    if (col.sortable && onSort) {
      const order = sortBy === col.key && sortOrder === "asc" ? "desc" : "asc";
      onSort(col.key, order);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none"
                  }}
                  onClick={() => handleHeaderClick(col)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                    {col.sortable && sortBy !== col.key && (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        ⇅
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                  Retrieving details...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div style={{
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          marginTop: "1.5rem", gap: "0.5rem"
        }}>
          <button
            className="btn-secondary"
            style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn-secondary"
            style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default FormTable;
