import clsx from 'clsx';
import React from 'react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  classSize = 'max-w-lg' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  children: React.ReactNode, 
  classSize?: string 
}) => {
  if (!isOpen) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={clsx("bg-white rounded-[32px] shadow-2xl w-full overflow-hidden", classSize)}
      >
        {children}
      </div>
    </div>
  )
}