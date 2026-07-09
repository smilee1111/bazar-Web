"use client";
import { useEffect, useState } from "react";
import NotificationsClient from "./NotificationsClient";

export default function NotificationsPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return <NotificationsClient />;
}
