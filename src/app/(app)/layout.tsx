import React from 'react'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Header } from '@/components/header/Header'

const AppLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>) => {
    return (
        <MainLayout>
            <Header />
            {children}
        </MainLayout>
    )
}
export default AppLayout
