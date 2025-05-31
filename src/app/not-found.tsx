'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='flex flex-col justify-center w-full h-220'>
        <div className='mx-auto my-auto bg-white w-1/2 h-1/2 shadow-lg rounded-xl'>
            <div className='mx-auto my-auto w-1/2 h-6/7 flex flex-col items-center justify-between'>
                <h1 className='font-medium mt-10 text-7xl'>Отакої!</h1>
                <div className='flex flex-col items-center'>
                    <p className='text-2xl mb-5'>Вибачте, але ми не змогли знайти сторінку.</p>
                    <button onClick={() => router.push('/')} className='font-medium text-3xl bg-blue-600 rounded-xl text-white p-2 cursor-pointer'>Повернутися назад</button>
                </div>
            </div>
        </div>
    </div>
  );
}
