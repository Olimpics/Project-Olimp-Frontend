"use client"
import { use, useEffect, useState } from 'react';
import { getCookie } from '@/services/cookie-servies';
import { USER_PROFLE } from '@/constants/cookies';
import AdminDisciplinePage from './AdminDisciplinePage';
import StudentDisciplinePage from './StudentDisciplinePage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            </div>
        );
    }

    const userProfileString = getCookie(USER_PROFLE);
    let isAdmin = false;

    if (userProfileString) {
        try {
            const user = JSON.parse(userProfileString);
            isAdmin = !!(user.isAdmin || user.IsAdmin);
        } catch (e) {
            console.error('Failed to parse user profile', e);
        }
    }

    if (isAdmin) {
        return <AdminDisciplinePage id={id} />;
    }
    return <StudentDisciplinePage id={id} />;
    }