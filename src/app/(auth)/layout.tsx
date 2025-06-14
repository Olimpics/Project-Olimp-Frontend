import React from 'react'
import { MainLayout } from '@/components/layouts/MainLayout'

const AppLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>) => {
    return (
<>
    {children}
    
</>    )
}
export default AppLayout
