"use client"
import { USER_PROFLE } from '@/constants/cookies';
import { apiService } from '@/services/axiosService';
import { getCookie } from '@/services/cookie-servies'
import { useEffect, useState, use, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';

interface DisciplineDetails {
  idAddDisciplines: number;
  nameAddDisciplines: string;
  codeAddDisciplines: string;
  facultyAbbreviation: string;
  facultyId: number;
  minCountPeople: number | null;
  maxCountPeople: number | null;
  minCourse: number | null;
  maxCourse: number | null;
  isEven: number;
  degreeLevelName: string;
  degreeLevelId: number;
  departmentId: number;
  departmentName: string;
  teacher: string;
  recomend: string;
  prerequisites: string;
  language: string;
  determination: string;
  whyInterestingDetermination: string;
  resultEducation: string;
  usingIrl: string;
  additionaLiterature: string;
  typesOfTraining: string;
  typeOfControll: string;
}

interface Student {
  studentId: number;
  studentName: string;
  groupId: number;
  groupCode: string;
  departmentName: string;
  year: number;
  educationLevel: string;
  isShort: number;
  faculty: string;
}

interface StudentResponse {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  items: Student[];
}

const CircularProgress = ({ current, total }: { current: number, total: number }) => {
  const percentage = Math.min((current / total) * 100, 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 min-w-[180px]">
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="white"
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
           <span className="text-[8px] font-bold text-white/50 leading-none">{current}</span>
           <div className="w-4 h-[1px] bg-white/30 my-0.5" />
           <span className="text-[8px] font-bold text-white/50 leading-none">{total}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-blue-100">Записано</span>
        <span className="text-sm font-bold text-white">{current} з {total}</span>
      </div>
    </div>
  );
};

const Pagination: React.FC<{
    totalPages: number
    currentPage: number
    onPageChange: (page: number) => void
}> = ({ totalPages, currentPage, onPageChange }) => {
    const getPages = () => {
        const pages: (number | string)[] = []
        if (totalPages <= 16)
            return Array.from({ length: totalPages }, (_, i) => i + 1)

        pages.push(1)
        if (currentPage > 4) pages.push('...')

        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)
        for (let i = start; i <= end; i++) pages.push(i)

        if (currentPage < totalPages - 3) pages.push('...')
        pages.push(totalPages)

        return pages
    }

    return (
        <nav className="flex justify-center mt-4 space-x-2">
            {getPages().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(Number(page))}
                        className={`px-4 py-2 rounded ${
                            currentPage === page
                                ? 'bg-[#1e50f0] text-white font-bold'
                                : 'bg-white text-[#1e50f0] border border-gray-300 hover:bg-blue-50'
                        }`}
                    >
                        {page}
                    </button>
                )
            )}
        </nav>
    )
}

export default function AdminDisciplinePage({ id }: { id: string }) {
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'students'>('details');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedStudentForReject, setSelectedStudentForReject] = useState<Student | null>(null);
  const [notificationTemplates, setNotificationTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | 'custom'>('custom');
  const [refusalReason, setRefusalReason] = useState('');

  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {  
    const fetchDiscipline = async () => {
      try {
        const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabStudent/GetDisciplineWithDetails/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DisciplineDetails = await response.json();
        setDiscipline(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDiscipline();
    fetchNotificationTemplates();
  }, [id]);

  const fetchNotificationTemplates = async () => {
    try {
      const response = await fetch('http://212.3.125.183:5154/api/NotificationTemplate');
      if (response.ok) {
        const data = await response.json();
        setNotificationTemplates(data);
      }
    } catch (err) {
      console.error('Failed to fetch notification templates', err);
    }
  };

  const fetchStudents = useCallback(async (page: number) => {
    setStudentsLoading(true);
    try {
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabAdmin/GetStudentsByAddDiscipline?DisciplineId=${id}&page=${page}&pageSize=20`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: StudentResponse = await response.json();
      const formattedStudents = (data.items || []).map(s => ({
        ...s,
        id: s.studentId
      }));
      setStudents(formattedStudents);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setStudentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents(currentPage);
    }
  }, [activeTab, currentPage, fetchStudents]);

  const fetchAvailableStudents = async () => {
    if (!discipline) return;
    setModalLoading(true);
    try {
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabAdmin/GetStudentsIncompleteAfterChoicePeriod?facultyId=${discipline.facultyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableStudents(data || []);
    } catch (err) {
      console.error('Failed to fetch available students', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    fetchAvailableStudents();
  };

  const handleOpenRejectModal = (student: Student) => {
    setSelectedStudentForReject(student);
    setSelectedTemplateId('custom');
    setRefusalReason('');
    setIsRejectModalOpen(true);
  };

  const handleTemplateChange = (templateId: number | 'custom') => {
    setSelectedTemplateId(templateId);
    if (templateId === 'custom') {
      setRefusalReason('');
    } else {
      const template = notificationTemplates.find(t => t.idNotificationTemplates === templateId);
      if (template) {
        let msg = template.message || '';
        if (selectedStudentForReject) {
          msg = msg.replace('{username}', selectedStudentForReject.studentName);
        }
        setRefusalReason(msg);
      }
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedStudentForReject || !discipline) return;
    try {
      // Using the DeleteStudent endpoint found in the system for unbinding
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabAdmin/DeleteStudent/${selectedStudentForReject.studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchStudents(currentPage);
        setIsRejectModalOpen(false);
      } else {
        throw new Error('Failed to reject student');
      }
    } catch (err) {
      console.error('Error rejecting student', err);
      alert('Помилка при відмові студенту');
    }
  };

  const handleBindStudent = async (studentId: number) => {
    if (!discipline) return;
    try {
      const semester = discipline.isEven === 2 ? 1 : 0; // 0 for odd, 1 for even
      const response = await fetch('http://212.3.125.183:5154/api/DisciplineTabStudent/AddDisciplineBind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId,
          disciplineId: discipline.idAddDisciplines,
          semester: semester,
          loans: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to bind student');
      }

      // Refresh student list and close modal
      fetchStudents(currentPage);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error binding student', err);
      alert('Помилка при додаванні студента');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !discipline) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500">{error || 'Discipline not found'}</p>
      </div>
    </div>
  );

  const getSemesterText = (isEven: number) => {
    if (isEven === 1) return "Непарний";
    if (isEven === 2) return "Парний";
    return "Обидва";
  };

  const filteredModalStudents = availableStudents.filter(s => 
    s.studentName.toLowerCase().includes(modalSearch.toLowerCase()) ||
    s.groupCode.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header Section */}
        <section className="bg-[#1e50f0] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
            
            {/* Left Side */}
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <span className="bg-[#4a72f5] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                  {discipline.codeAddDisciplines}
                </span>
                <span className="bg-[#10b981] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                  Набір відкрито
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {discipline.nameAddDisciplines}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-blue-100">
                <p>Рівень: <span className="text-white font-bold">{discipline.degreeLevelName}</span></p>
                <span className="opacity-40">|</span>
                <p>Курс: <span className="text-white font-bold">{discipline.minCourse} курс</span></p>
                <span className="opacity-40">|</span>
                <p>Семестр: <span className="text-white font-bold">{getSemesterText(discipline.isEven)}</span></p>
                <span className="opacity-40">|</span>
                <p>Мова: <span className="text-white font-bold">{discipline.language}</span></p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-center md:items-end justify-between gap-6">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1e50f0] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-sm active:scale-95 text-sm">
                  Редагувати
                </button>
              </div>
              
              <CircularProgress current={totalItems} total={discipline.maxCountPeople || 500} />

              {/* Subtabs */}
              <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'details' ? 'bg-white text-[#1e50f0]' : 'text-white hover:bg-white/10'}`}
                >
                  Деталі курсу
                </button>
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white text-[#1e50f0]' : 'text-white hover:bg-white/10'}`}
                >
                  Список студентів
                </button>
              </div>
            </div>
          </div>
        </section>

        {activeTab === 'details' ? (
          <>
            {/* Two-Column Row (Middle Section) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
              {/* Block 1: Основна інформація */}
              <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-[32px] flex flex-col">
                <h3 className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mb-[24px]">Основна інформація</h3>
                <div className="grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
                  <InfoBlock label="Рекомендовані знання" value={discipline.recomend} />
                  <InfoBlock label="Кафедра" value={discipline.departmentName} />
                  <InfoBlock label="Викладач" value={discipline.teacher} />
                  <InfoBlock label="Мова викладання" value={discipline.language} />
                  <InfoBlock label="Тип контролю" value={discipline.typeOfControll} />
                  <InfoBlock label="Передумови" value={discipline.prerequisites} />
                </div>
              </div>

              {/* Block 2: Опис дисципліни */}
              <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-[32px] flex flex-col">
                <h3 className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mb-[24px]">Опис дисципліни</h3>
                <div className="space-y-[24px]">
                  <div className="space-y-[8px]">
                    <h4 className="text-[14px] font-medium text-gray-400">Що вивчатиметься</h4>
                    <p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.determination}</p>
                  </div>
                  <div className="space-y-[8px]">
                    <h4 className="text-[14px] font-medium text-gray-400">Чому важливо</h4>
                    <p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.whyInterestingDetermination}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width Blocks (Bottom Section) */}
            <div className="space-y-[24px]">
              {/* Результати навчання */}
              <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-[24px_32px]">
                <h3 className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mb-[16px]">Що можна навчитися (результати навчання)</h3>
                <p className="text-[15px] font-medium text-gray-600 leading-relaxed max-w-full">
                  {discipline.resultEducation}
                </p>
              </div>

              {/* Компетенції */}
              <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-[24px_32px]">
                <h3 className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mb-[16px]">Як можна набути знань та інтелекту (компетенції)</h3>
                <p className="text-[15px] font-medium text-gray-600 leading-relaxed max-w-full">
                  {discipline.usingIrl}
                </p>
              </div>

              {/* Додаткова інформація */}
              <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-[24px_32px]">
                <h3 className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mb-[24px]">Додаткова інформація</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[32px] gap-y-[24px]">
                  <InfoBlock label="Інформаційне забезпечення" value={discipline.additionaLiterature || "НМК дисципліни"} />
                  <InfoBlock label="Види навчальної діяльності" value={discipline.typesOfTraining || "Лекції, семінарські заняття"} />
                  <InfoBlock label="Максимальна кількість студентів" value={`${discipline.maxCountPeople || 100} осіб`} />
                  <InfoBlock label="Мінімальна количество студентів" value={discipline.minCountPeople ? `${discipline.minCountPeople} осіб` : "Не встановлено"} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
               <div className="flex items-center gap-4">
                  <h3 className="text-[18px] font-bold text-gray-900">Студенти на курсі</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {totalItems} осіб
                  </span>
               </div>
               <button 
                 onClick={handleOpenAddModal}
                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-sm active:scale-95 text-sm"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Додати студента
               </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead className="bg-[#1e50f0] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-16">№</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">ПІБ студента</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Група</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Факультет</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Кафедра</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Курс</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e50f0]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student, idx) => (
                      <tr key={student.studentId} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {(currentPage - 1) * 20 + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{student.studentName}</div>
                          <div className="text-xs text-gray-400 font-medium">{student.educationLevel}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                            {student.groupCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{student.faculty}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{student.departmentName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-bold">{student.year}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all active:scale-95"
                            onClick={() => handleOpenRejectModal(student)}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Відрахувати
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                        Студентів не знайдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <Pagination 
                totalPages={totalPages} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} classSize="max-w-3xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Додати студента на курс</h2>
            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Пошук студента за ПІБ або групою..." 
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/30">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Студент</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Група</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {modalLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e50f0]"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredModalStudents.length > 0 ? (
                  filteredModalStudents.map((student) => (
                    <tr key={student.studentId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-gray-900">{student.studentName}</div>
                        <div className="text-xs text-gray-500">{student.faculty}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-700">{student.groupCode}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleBindStudent(student.studentId)}
                          className="px-4 py-1.5 bg-[#1e50f0] text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                        >
                          Додати
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-500 italic">
                      Студентів не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Refusal Confirmation Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} classSize="max-w-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Підтвердження відмови</h2>
            <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Ви дійсно хочете відмовити студенту <span className="font-bold text-gray-900">{selectedStudentForReject?.studentName}</span>?
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Шаблон причини відмови</label>
              <select 
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
              >
                <option value="custom">Власна причина</option>
                {notificationTemplates.map(template => (
                  <option key={template.idNotificationTemplates} value={template.idNotificationTemplates}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Причина відмови</label>
              <textarea 
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Введіть причину відмови..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-32 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t">
            <button 
              onClick={() => setIsRejectModalOpen(false)}
              className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              Скасувати
            </button>
            <button 
              onClick={handleConfirmReject}
              className="px-8 py-2.5 bg-[#f87171] text-white rounded-xl font-bold hover:bg-red-500 transition-all active:scale-95 shadow-sm"
            >
              Підтвердити відмову
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-900 leading-tight">{value || 'Не вказано'}</span>
    </div>
  );
}
