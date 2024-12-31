import React, { useState } from "react";
import { useNotificationContext } from "../context/NotificationContext";

const NotificationIcon: React.FC = () => {
  const { notifications, markAsRead } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const handleNotificationClick = async (id: string) => {
    try {
      await markAsRead(id); // Mark the notification as read
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        className="relative rounded-full bg-gray-800 p-2 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-white shadow-lg rounded-md p-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            <ul className="max-h-[400px] overflow-y-auto">
              {notifications
                .map((notification) => (
                  <li
                    key={notification.id}
                    className="mb-2 border-b pb-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <p className="text-gray-500">{notification.message}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
