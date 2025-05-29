"use client"

import { Header } from '../components/header/Header'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    if (localStorage.getItem("studentProfile") == null) {
      router.push('/login')
    } else {
      router.push('/cabinet')
    }
  }, [])
  
  return (
    <Header />
  );
}