import { useState, useEffect, useRef } from "react";
import api from "../services/api";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get("/notifications?unread=true");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    // Poll for notifications every 10 seconds for standard live update
    const interval = setInterval(fetchUnreadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell Icon & Badge */}
      <button
        type="button"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "1.25rem",
          position: "relative",
          display: "flex",
          alignItems: "center",
          color: "var(--text-secondary)",
          padding: "0.25rem"
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            background: "var(--danger)",
            color: "#ffffff",
            fontSize: "0.7rem",
            fontWeight: "700",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg-primary)"
          }}>
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="glass-card" style={{
          position: "absolute",
          top: "40px",
          right: "0",
          width: "320px",
          padding: "1rem",
          zIndex: 200,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
          maxHeight: "360px",
          overflowY: "auto",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>Unread Alerts</h4>
            {notifications.length > 0 && (
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--primary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {notifications.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem 0", fontSize: "0.9rem" }}>
                No unread notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Click to mark as read"
                >
                  <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "0.15rem" }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.25" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem", textAlign: "right" }}>
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
