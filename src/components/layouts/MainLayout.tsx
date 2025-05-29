import React, { FC } from 'react'

interface MainLayoutProps {
    children: React.ReactNode
}

export const MainLayout: FC<MainLayoutProps> = ({
    children,
}: MainLayoutProps) => {
    return <div className='bg-gray-100'>

      {children}

    </div>
}
