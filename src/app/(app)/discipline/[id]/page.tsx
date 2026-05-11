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

    const userProfile = getCookie(USER_PROFLE);
    const user = userProfile ? JSON.parse(userProfile) : {};
    const isAdmin = user.roleId === 2;

    if (isAdmin) {
        return <AdminDisciplinePage id={id} />;
    }
    return <StudentDisciplinePage id={id} />;
}