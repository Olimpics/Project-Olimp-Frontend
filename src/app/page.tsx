"use client"

import { Header } from '../components/header/Header'
import { useEffect, useContext } from 'react'
import { studentContext } from '@/app/context'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const studCtx = useContext(studentContext)

  useEffect(() => {
    if (studCtx === undefined) return

    if (studCtx.profile) {
      router.push('/cabinet')
    } else {
      router.push('/login')
    }
  }, [studCtx])

  return (
    <Header />
  )
}
