"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Trash2, Bell, BellOff } from "lucide-react";
import {
    handleGetNotifications,
    handleMarkNotificationAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
} from "@/lib/actions/notification-action";
import type { Notification } from "@/lib/types/notification";
import { useRouter } from "next/navigation";

export default function NotificationsClient() {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
    const [readNotifications, setReadNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    // Fetch all notifications
    const fetchNotifications = async () => {
        setIsLoading(true);
        const result = await handleGetNotifications(1, 100); // Get more for the full page
        if (result.success && result.data) {
            setAllNotifications(result.data);
            setUnreadNotifications(result.data.filter((n) => !n.isRead));
            setReadNotifications(result.data.filter((n) => n.isRead));
            setUnreadCount(result.unreadCount || 0);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Mark single notification as read
    const markAsRead = async (id: string) => {
        const result = await handleMarkNotificationAsRead(id);
        if (result.success) {
            // Update local state
            const updateNotification = (n: Notification) =>
                n._id === id ? { ...n, isRead: true } : n;
            
            setAllNotifications((prev) => prev.map(updateNotification));
            setUnreadNotifications((prev) => prev.filter((n) => n._id !== id));
            
            const movedNotif = allNotifications.find((n) => n._id === id);
            if (movedNotif) {
                setReadNotifications((prev) => [{ ...movedNotif, isRead: true }, ...prev]);
            }
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    // Mark all as read
    const markAllRead = async () => {
        const result = await handleMarkAllAsRead();
        if (result.success) {
            const updatedAll = allNotifications.map((n) => ({ ...n, isRead: true }));
            setAllNotifications(updatedAll);
            setReadNotifications(updatedAll);
            setUnreadNotifications([]);
            setUnreadCount(0);
        }
    };

    // Delete notification
    const deleteNotif = async (id: string) => {
        const result = await handleDeleteNotification(id);
        if (result.success) {
            const deletedNotif = allNotifications.find((n) => n._id === id);
            setAllNotifications((prev) => prev.filter((n) => n._id !== id));
            setUnreadNotifications((prev) => prev.filter((n) => n._id !== id));
            setReadNotifications((prev) => prev.filter((n) => n._id !== id));
            
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        }
    };

    // Delete all notifications
    const deleteAll = async () => {
        if (!confirm("Are you sure you want to delete all notifications?")) return;
        
        const result = await handleDeleteAllNotifications();
        if (result.success) {
            setAllNotifications([]);
            setUnreadNotifications([]);
            setReadNotifications([]);
            setUnreadCount(0);
        }
    };

    // Navigate to related entity
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        // Navigate based on type
        if (notification.relatedEntityType === "shop" && notification.relatedEntityId) {
            router.push(`/shops/${notification.relatedEntityId}`);
        }
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
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
        return date.toLocaleDateString();
    };

    // Get icon based on notification type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "review_like":
                return "ðŸ‘";
            case "review_dislike":
                return "ðŸ‘Ž";
            case "shop_reviewed":
                return "â­";
            case "new_shop":
                return "ðŸª";
            case "seller_application":
                return "ðŸ“‹";
            case "general":
            default:
                return "ðŸ””";
        }
    };

    // Render notification item
    const renderNotification = (notification: Notification) => (
        <Card
            key={notification._id}
            className={`mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden ${
                !notification.isRead 
                    ? "border-l-4 border-l-blue-500 bg-blue-50/30 shadow-md" 
                    : "border-l-4 border-l-transparent hover:border-l-gray-300 bg-white"
            }`}
            onClick={() => handleNotificationClick(notification)}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                        <span className="text-2xl mt-1 flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-base text-gray-900">{notification.title}</h3>
                                {!notification.isRead && (
                                    <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">
                                        New
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <span>ðŸ•</span>
                                {formatTime(notification.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        {!notification.isRead && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                }}
                                title="Mark as read"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNotif(notification._id);
                            }}
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-gray-900">Notifications</CardTitle>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-600 mt-0.5">{unreadCount} unread</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={markAllRead}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark all read
                                </Button>
                            )}
                            {allNotifications.length > 0 && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={deleteAll}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete all
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
                            <TabsTrigger 
                                value="all"
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                            >
                                All ({allNotifications.length})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="unread"
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                            >
                                Unread ({unreadNotifications.length})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="read"
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                            >
                                Read ({readNotifications.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            {isLoading ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="animate-pulse">Loading notifications...</div>
                                </div>
                            ) : allNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <BellOff className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">No notifications yet</p>
                                    <p className="text-gray-400 text-sm mt-2">When you get notifications, they'll show up here</p>
                                </div>
                            ) : (
                                <div>{allNotifications.map(renderNotification)}</div>
                            )}
                        </TabsContent>

                        <TabsContent value="unread">
                            {unreadNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">No unread notifications</p>
                                    <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
                                </div>
                            ) : (
                                <div>{unreadNotifications.map(renderNotification)}</div>
                            )}
                        </TabsContent>

                        <TabsContent value="read">
                            {readNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <BellOff className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">No read notifications</p>
                                    <p className="text-gray-400 text-sm mt-2">Read notifications will appear here</p>
                                </div>
                            ) : (
                                <div>{readNotifications.map(renderNotification)}</div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
