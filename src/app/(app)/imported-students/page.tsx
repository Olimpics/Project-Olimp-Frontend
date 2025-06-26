// app/imported-students/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from '@/components/ui/DataTable'

type Student = {
  studentID: number
  nameStudent: string
  statusId: string
  educationStart: { year: number, month: number, day: number }
  educationEnd: { year: number, month: number, day: number }
  course: string
  facultyId: string
  educationalDegreeId: string
  studyFormId: string
  groupId: string
}

export default function ImportedStudentsPage() {


  const [students, setStudents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('navigationState');

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setStudents(parsedData);

        // Очищаем storage после использования (опционально)
        sessionStorage.removeItem('navigationState');
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, []);

  const columns = [
    { header: 'ID', accessor: 'studentID' },
    { header: 'ПІБ', accessor: 'nameStudent' },
    { header: 'Статус', accessor: 'statusId' },
    { header: 'Факультет', accessor: 'facultyId' },
    { header: 'Курс', accessor: 'course' },
    { header: 'Група', accessor: 'groupId' }
  ]

  return (
    <div className="p-4">
      <div className=" flex gap-10 justify-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Підтвердити
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => {router.back()}}
        >
          Назад
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Імпортовані студенти</h1>
      <DataTable
        columns={columns}
        data={students}
        isActionEnabled={false}
      />
    </div>
  )
}