"use client"
import { USER_PROFLE } from '@/constants/cookies';
import { getCookie } from '@/services/cookie-servies'
import { useEffect, useState, use } from 'react';
import StudentDisciplinePage from './StudentDisciplinePage';
import AdminDisciplinePage from './AdminDisciplinePage';

interface Params {
  params: {
    id: string;
  };
}

export default function DisciplinePage({ params }: Params) {
  const { id } = use(params);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userProfileString = getCookie(USER_PROFLE);
    if (userProfileString) {
      try {
        const parsed = JSON.parse(userProfileString);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const roleId = user?.roleId?.toString() ?? null;

  if (roleId === '2') {
    return <AdminDisciplinePage id={id} />;
  }

  return <StudentDisciplinePage id={id} />;
}
