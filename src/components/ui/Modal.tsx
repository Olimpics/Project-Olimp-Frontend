import React from 'react';

export const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div onClick={(e)=>{
        e.stopPropagation()
      }} className="bg-white rounded-lg p-6 w-full max-w-md">
        {children}
        <div className="mt-4 flex justify-end space-x-2">

        </div>
      </div>
    </div>
  )
}
