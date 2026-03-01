"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    handleGetNotifications,
    handleGetUnreadCount,
    handleMarkNotificationAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
} from "@/lib/actions/notification-action";
import type { Notification } from "@/lib/types/notification";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Fetch unread count
    const fetchUnreadCount = async () => {
        const result = await handleGetUnreadCount();
        if (result.success) {
            setUnreadCount(result.unreadCount || 0);
        }
    };

    // Fetch notifications when dropdown opens
    const fetchNotifications = async () => {
        setIsLoading(true);
        const result = await handleGetNotifications(1, 10); // Get first 10
        if (result.success && result.data) {
            setNotifications(result.data);
            if (result.unreadCount !== undefined) {
                setUnreadCount(result.unreadCount);
            }
        }
        setIsLoading(false);
    };

    // Mark single notification as read
    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await handleMarkNotificationAsRead(id);
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    // Mark all as read
    const markAllRead = async () => {
        const result = await handleMarkAllAsRead();
        if (result.success) {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    // Delete notification
    const deleteNotif = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await handleDeleteNotification(id);
        if (result.success) {
            const deletedNotif = notifications.find((n) => n._id === id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        }
    };

    // Navigate to related entity
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            await handleMarkNotificationAsRead(notification._id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Navigate based on type
        if (notification.relatedEntityType === 'shop' && notification.relatedEntityId) {
            router.push(`/shops/${notification.relatedEntityId}`);
        }
        
        setIsOpen(false);
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // Get icon based on notification type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "review_like":
                return "👍";
            case "review_dislike":
                return "👎";
            case "shop_reviewed":
                return "⭐";
            case "new_shop":
                return "🏪";
            case "seller_application":
                return "📋";
            case "general":
            default:
                return "🔔";
        }
    };

    // Fetch unread count on mount and set up polling
    useEffect(() => {
        fetchUnreadCount();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-11 w-11 rounded-full bg-white hover:bg-white/90 text-gray-700 shadow-md"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-white">
                <DropdownMenuLabel className="flex items-center justify-between py-3 px-4">
                    <span className="text-lg font-semibold text-gray-900">Notifications</span>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllRead}
                            className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isLoading ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification._id}
                            className={`flex-col items-start p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                                !notification.isRead ? "bg-blue-50/50" : "bg-white"
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex items-start justify-between w-full gap-3">
                                <div className="flex gap-3 flex-1">
                                    <span className="text-xl mt-0.5 flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {!notification.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={(e) => markAsRead(notification._id, e)}
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={(e) => deleteNotif(notification._id, e)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
                
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem
                            className="justify-center text-center cursor-pointer py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                            onClick={() => {
                                router.push("/user/notifications");
                                setIsOpen(false);
                            }}
                        >
                            View all notifications →
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
