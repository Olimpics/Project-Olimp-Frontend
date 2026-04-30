'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'

const EducationalProgramDetailsPage = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Загальна інформація')

  // Mock data for the Educational Program
  const epData = {
    code: '121-IPZ-2024',
    name: 'Інженерія програмного забезпечення',
    department: 'Кафедра програмної інженерії',
    faculty: 'Факультет комп’ютерних наук та технологій',
    specialty: '121 Інженерія програмного забезпечення',
    specialization: 'Розробка та тестування ПЗ',
    accreditation: 'A (Зразкова)',
    level: 'Бакалавр',
    form: 'Денна',
    credits: 240,
    term: '3 роки, 10 міс.'
  }

  const tabs = [
    'Загальна інформація',
    'Список дисциплін',
    'Список студентів'
  ]

  const infoGridItems = [
    { label: 'Кафедра', value: epData.department },
    { label: 'Факультет', value: epData.faculty },
    { label: 'Спеціальність', value: epData.specialty },
    { label: 'Спеціалізація', value: epData.specialization },
    { label: 'Акредитація', value: epData.accreditation },
    { label: 'Рівень освіти', value: epData.level },
    { label: 'Форма навчання', value: epData.form },
    { label: 'Кількість кредитів ECTS', value: epData.credits },
    { label: 'Термін навчання', value: epData.term },
  ]

  // Mock data for Selective Disciplines Statistics
  const selectiveDisciplines = [
    { semester: 'Семестр 1', count: 3 },
    { semester: 'Семестр 2', count: 4 },
    { semester: 'Семестр 3', count: 2 },
    { semester: 'Семестр 4', count: 5 },
    { semester: 'Семестр 5', count: 3 },
    { semester: 'Семестр 6', count: 4 },
    { semester: 'Семестр 7', count: 3 },
  ]

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans flex flex-col">
      {/* Top Bar - Header area with Title and Tabs */}
      <div className="w-full bg-white border-b border-gray-200 px-6 pt-6 z-0">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {epData.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
              Код ОП: {epData.code}
            </p>
          </div>
          
          <div className="flex space-x-6 lg:space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-[#2563eb] border-[#2563eb]'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow p-6 md:p-8 max-w-[1440px] mx-auto w-full">
        <div className="space-y-8">
          
          {activeTab === 'Загальна інформація' && (
            <>
              {/* Main Information Card */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                  {infoGridItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">
                        {item.label}
                      </span>
                      <span className="text-base text-gray-800 font-medium leading-relaxed">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Middle Block - Selective Disciplines Statistics */}
              <section className="my-10">
                <h3 className="text-lg font-bold text-gray-800 mb-6 px-2 uppercase tracking-wide">
                  Вибіркові дисципліни
                </h3>
                
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {selectiveDisciplines.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 min-w-[200px] flex-grow md:flex-grow-0 basis-[calc(50%-1rem)] md:basis-[calc(33.33%-1rem)] lg:basis-auto transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-gray-800">
                          {item.semester}
                        </span>
                        <div className="text-sm text-gray-600">
                          <span className="text-[#2563eb] font-bold text-xl mr-1.5">
                            {item.count}
                          </span>
                          дисципліни
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab !== 'Загальна інформація' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              Контент вкладки "{activeTab}" буде доступний незабаром.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default EducationalProgramDetailsPage
