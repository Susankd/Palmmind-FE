import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { baseUrl, getAuthHeaders, socketUrl } from "@/config";

const socket = io(socketUrl);

interface Notification {
  id: string;
  message: string;
  status: "read" | "unread";
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch existing notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/notification`,
        getAuthHeaders()
      );
      const data = response.data && response.data.length > 0 ? response.data?.reverse() : [];
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Add new notification
  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.patch(
        `${baseUrl}/notification/${id}`,
        {
          status: "read",
        },
        getAuthHeaders()
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, status: "read" } : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.on("task-status-updated", (data) => {
      const newNotification: Notification = {
        id: data.notificationId,
        message: data.message,
        status: data.status,
      };
      addNotification(newNotification); // Add real-time notification
    });

    return () => {
      socket.off("task-status-updated");
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};
