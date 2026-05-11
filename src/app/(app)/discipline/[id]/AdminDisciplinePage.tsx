"use client"
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  CircularProgress,
  Pagination,
  SelectionColumn,
  DisciplineBlock,
  InfoBlock,
  ModalField
} from './AdminComponents';
import { getCookie } from '@/services/cookie-servies';
import { USER_PROFLE } from '@/constants/cookies';

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
  recomendationSpeciality: number[];
  recomendationEducationalProgram: number[];
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

interface AvailableStudent {
  studentId: number;
  studentName: string;
}

interface StudentResponse {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  items: Student[];
}

export default function AdminDisciplinePage({ id }: { id: string }) {
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'students'>('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  // Student List State
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [facultyFilter, setFacultyFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);

  // Modal Data
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [eduPrograms, setEduPrograms] = useState<any[]>([]);
  const [modalDataLoading, setModalDataLoading] = useState(false);

  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [selectedEduPrograms, setSelectedEduPrograms] = useState<number[]>([]);
  const [specSearch, setSpecSearch] = useState('');
  const [eduSearch, setEduSearch] = useState('');

  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const fetchDiscipline = async () => {
    try {
      const raw = getCookie(USER_PROFLE);
      const token = raw ? JSON.parse(raw).token : null;
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabStudent/GetDisciplineWithDetails/${id}?t=${Date.now()}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch discipline');
      const data: DisciplineDetails = await response.json();
      setDiscipline(data);
      setSelectedSpecialties(data.recomendationSpeciality || []);
      setSelectedEduPrograms(data.recomendationEducationalProgram || []);
      setEditForm({
        nameAddDisciplines: data.nameAddDisciplines,
        codeAddDisciplines: data.codeAddDisciplines,
        facultyId: data.facultyId,
        minCountPeople: data.minCountPeople,
        maxCountPeople: data.maxCountPeople,
        minCourse: data.minCourse,
        maxCourse: data.maxCourse,
        isEven: data.isEven,
        degreeLevelId: data.degreeLevelId,
        details: {
          departmentId: data.departmentId,
          content: {
            teacher: data.teacher,
            recomend: data.recomend,
            prerequisites: data.prerequisites,
            language: data.language,
            provision: data.additionaLiterature,
            disciplineTopics: data.determination,
            whyInterestingDetermination: data.whyInterestingDetermination,
            resultEducation: data.resultEducation,
            usingIrl: data.usingIrl,
            typesOfTraining: data.typesOfTraining,
            typeOfControll: data.typeOfControll
          }
        },
        recomendationSpeciality: data.recomendationSpeciality || [],
        recomendationEducationalProgram: data.recomendationEducationalProgram || [],
        idAddDisciplines: data.idAddDisciplines
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = useCallback(async (page: number) => {
    setStudentsLoading(true);
    try {
      const raw = getCookie(USER_PROFLE);
      const token = raw ? JSON.parse(raw).token : null;
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabAdmin/GetStudentsByAddDiscipline?DisciplineId=${id}&page=${page}&pageSize=20`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data: StudentResponse = await response.json();
      setStudents(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  }, [id]);

  const fetchFilters = async () => {
    setModalDataLoading(true);
    try {
      const [facRes, specRes, eduRes, depRes, degRes] = await Promise.all([
        fetch('http://212.3.125.183:5154/api/Faculty'),
        fetch('http://212.3.125.183:5154/api/Filter/specialities'),
        fetch('http://212.3.125.183:5154/api/Filter/educational-programs'),
        fetch('http://212.3.125.183:5154/api/Department?page=1&pageSize=500&sortOrder=0'),
        fetch('http://212.3.125.183:5154/api/EducationalDegree')
      ]);
      const facData = await facRes.json();
      const specData = await specRes.json();
      const eduData = await eduRes.json();
      const depData = await depRes.json();
      const degData = await degRes.json();

      setFaculties(Array.isArray(facData) ? facData : []);
      setSpecialties(Array.isArray(specData) ? specData : []);
      setEduPrograms(Array.isArray(eduData) ? eduData : Array.isArray(eduData?.items) ? eduData.items : []);
      setDepartments(depData?.items || []);
      setDegrees(Array.isArray(degData) ? degData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setModalDataLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscipline();
    fetchFilters();
    fetchStudents(1);
  }, [id, fetchStudents]);

  useEffect(() => {
    if (activeTab === 'students') fetchStudents(currentPage);
  }, [activeTab, currentPage, fetchStudents]);

  const handleUpdate = async () => {
    try {
      const raw = getCookie(USER_PROFLE);
      const token = raw ? JSON.parse(raw).token : null;
      const payload = {
        ...editForm,
        recomendationSpeciality: selectedSpecialties,
        recomendationEducationalProgram: selectedEduPrograms
      };
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabStudent/UpdateDisciplineWithDetails/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchDiscipline();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableStudents = async () => {
    if (!discipline) return;

    let fId = discipline.facultyId;
    if (!fId && discipline.facultyAbbreviation && faculties.length > 0) {
      const found = faculties.find(f => f.abbreviation === discipline.facultyAbbreviation || f.nameFaculty === discipline.facultyAbbreviation);
      if (found) fId = found.idFaculty;
    }

    if (!fId) {
      console.error("Faculty ID not found for abbreviation:", discipline.facultyAbbreviation);
      setAvailableStudents([]);
      return;
    }

    setAvailableLoading(true);
    try {
      const raw = getCookie(USER_PROFLE);
      const token = raw ? JSON.parse(raw).token : null;
      const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabAdmin/GetStudentsIncompleteAfterChoicePeriod?facultyId=${fId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      setAvailableStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setAvailableLoading(false);
    }
  };

  const handleAddStudent = async (studentId: number) => {
    try {
      const raw = getCookie(USER_PROFLE);
      const token = raw ? JSON.parse(raw).token : null;
      const response = await fetch('http://212.3.125.183:5154/api/DisciplineTabStudent/AddDisciplineBind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          studentId,
          disciplineId: discipline?.idAddDisciplines,
          semestr: discipline?.isEven === 2 ? 1 : 0,
          loans: 0
        })
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        fetchStudents(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!facultyFilter) return students;
    return students.filter(s => s.faculty === facultyFilter);
  }, [students, facultyFilter]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (error || !discipline) return <div className="p-8 text-center text-red-500">{error || 'Курс не знайдено'}</div>;

  const updateForm = (path: string, val: any) => {
    setEditForm((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (path.includes('.')) {
        const parts = path.split('.');
        let current = next;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = val;
      } else {
        next[path] = val;
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans">
      <div className="max-w-[1280px] mx-auto px-4 pt-8 space-y-6">

        {/* Header Section */}
        <section className="bg-[#1e50f0] rounded-[32px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  {discipline.codeAddDisciplines}
                </span>
                <span className="bg-[#10b981] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Набір відкрито
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {discipline.nameAddDisciplines}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-blue-100">
                <div className="flex items-center gap-2">
                  Рівень: <span className="text-white font-bold">{discipline.degreeLevelName}</span>
                </div>
                <span className="opacity-30">|</span>
                <div className="flex items-center gap-2">
                  Курс: <span className="text-white font-bold">{discipline.minCourse} курс</span>
                </div>
                <span className="opacity-30">|</span>
                <div className="flex items-center gap-2">
                  Семестр: <span className="text-white font-bold">{discipline.isEven === 1 ? 'Непарний' : discipline.isEven === 2 ? 'Парний' : 'Обидва'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-between gap-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-3 bg-white text-[#1e50f0] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                  Редагувати
                </button>
              </div>

              <CircularProgress current={totalItems} total={discipline.maxCountPeople || 500} />

              <div className="flex bg-white/10 p-1 rounded-[14px] backdrop-blur-md">
                <button onClick={() => setActiveTab('details')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'details' ? 'bg-white text-[#1e50f0] shadow-sm' : 'text-white hover:bg-white/10'}`}>Деталі курсу</button>
                <button onClick={() => setActiveTab('students')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white text-[#1e50f0] shadow-sm' : 'text-white hover:bg-white/10'}`}>Список студентів</button>
              </div>
            </div>
          </div>
        </section>

        {activeTab === 'details' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DisciplineBlock title="Основна інформація">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <InfoBlock label="Факультет" value={discipline.facultyAbbreviation} />
                  <InfoBlock label="Кафедра" value={discipline.departmentName} />
                  <InfoBlock label="Викладач" value={discipline.teacher} />
                  <InfoBlock label="Мова викладання" value={discipline.language} />
                  <InfoBlock label="Тип контролю" value={discipline.typeOfControll} />
                  <InfoBlock label="Передумови" value={discipline.prerequisites} />
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-medium text-gray-400">Рекомендовані знання</span>
                      <button onClick={() => setIsRecommendedModalOpen(true)} className="text-[11px] font-bold text-[#1e50f0] bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-all whitespace-nowrap border border-blue-200">Доступність</button>
                    </div>
                    <span className="text-sm font-bold text-gray-900 leading-tight">{discipline.recomend || 'Не вказано'}</span>
                  </div>
                </div>
              </DisciplineBlock>

              <DisciplineBlock title="Опис дисципліни">
                <div className="space-y-6">
                  <div className="space-y-2"><h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Що вивчатиметься</h4><p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.determination}</p></div>
                  <div className="space-y-2"><h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Чому важливо</h4><p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.whyInterestingDetermination}</p></div>
                </div>
              </DisciplineBlock>
            </div>

            <div className="space-y-6">
              <DisciplineBlock title="Що можна навчитися (результати навчання)">
                <p className="text-[15px] font-medium text-gray-600 leading-relaxed">{discipline.resultEducation}</p>
              </DisciplineBlock>

              <DisciplineBlock title="Як можна набути знань та інтелекту (компетенції)">
                <p className="text-[15px] font-medium text-gray-600 leading-relaxed">{discipline.usingIrl}</p>
              </DisciplineBlock>

              <DisciplineBlock title="Додаткова інформація">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <InfoBlock label="Інформаційне забезпечення" value={discipline.additionaLiterature || "НМК дисципліни"} />
                  <InfoBlock label="Види навчальної діяльності" value={discipline.typesOfTraining || "Лекції, семінарські заняття"} />
                  <InfoBlock label="Максимальна кількість студентів" value={`${discipline.maxCountPeople || 100} осіб`} />
                  <InfoBlock label="Мінімальна кількість студентів" value={discipline.minCountPeople ? `${discipline.minCountPeople} осіб` : "Не встановлено"} />
                </div>
              </DisciplineBlock>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Зареєстровані студенти</h3>
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Фільтр:</span>
                  <select value={facultyFilter ?? ''} onChange={e => setFacultyFilter(e.target.value)}
                    className="text-xs font-bold text-[#1e50f0] outline-none border-none bg-transparent cursor-pointer">
                    <option value="">Всі факультети</option>
                    {Array.from(new Set(students.map(s => s.faculty))).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { setIsAddModalOpen(true); fetchAvailableStudents(); }}
                className="bg-[#1e50f0] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                Додати в список
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1e50f0] text-white">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">ПІБ студента</th>
                    <th className="px-6 py-4">Група</th>
                    <th className="px-6 py-4">Кафедра</th>
                    <th className="px-6 py-4">Рік</th>
                    <th className="px-6 py-4">Рівень освіти</th>
                    <th className="px-6 py-4">Факультет</th>
                    <th className="px-6 py-4 text-center">Відмова</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {studentsLoading ? <tr><td colSpan={7} className="p-12 text-center text-gray-400 animate-pulse font-medium">Завантаження даних...</td></tr> :
                    filteredStudents.length > 0 ? filteredStudents.map(s => (
                      <tr key={s.studentId} className="hover:bg-blue-50/30 transition-all group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{s.studentName}</div>
                        </td>
                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold">{s.groupCode}</span></td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{s.departmentName}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{s.year} курс</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{s.educationLevel}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{s.faculty}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => console.log('Reject student', s.studentId)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 font-bold text-[11px] transition-all active:scale-95">✕ Відмовити</button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={7} className="p-12 text-center text-gray-400 italic">Студентів не знайдено</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-50 bg-gray-50/30">
              <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}

      </div>

      {/* Edit Discipline Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} classSize="max-w-[800px]">
        <div className="relative">
          {/* Header */}
          <div className="bg-[#1e50f0] p-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold">Редагувати дисципліну</h2>
            <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto bg-white">
            <div className="space-y-6">
              <ModalField label="Назва дисципліни" value={editForm?.nameAddDisciplines} onChange={v => updateForm('nameAddDisciplines', v)} />

              <div className="grid grid-cols-2 gap-6">
                <ModalField label="Код" value={editForm?.codeAddDisciplines} onChange={v => updateForm('codeAddDisciplines', v)} />
                <ModalField label="Кредити" value="4 бали" onChange={() => { }} placeholder="4 бали" />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-[17px] font-bold text-gray-900 mb-6 uppercase tracking-wider">Основна інформація</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  <ModalField label="Факультет" value={editForm?.facultyId} type="select" options={faculties.map(f => ({ value: f.idFaculty, label: f.abbreviation || f.nameFaculty }))} onChange={v => updateForm('facultyId', Number(v))} />
                  <ModalField label="Кафедра" value={editForm?.details?.departmentId} type="select" options={departments.map(d => ({ value: d.idDepartment, label: d.nameDepartment }))} onChange={v => updateForm('details.departmentId', Number(v))} />
                  <ModalField label="Викладач" value={editForm?.details?.content?.teacher} onChange={v => updateForm('details.content.teacher', v)} />
                  <ModalField label="Мова викладання" value={editForm?.details?.content?.language} type="select"
                    options={[{ value: 'Українська', label: 'Українська' }, { value: 'Англійська', label: 'Англійська' }, { value: 'Німецька', label: 'Німецька' }]}
                    onChange={v => updateForm('details.content.language', v)} />
                  <ModalField label="Тип контролю" value={editForm?.details?.content?.typeOfControll} type="select"
                    options={[{ value: 'Залік', label: 'Залік' }, { value: 'Екзамен', label: 'Екзамен' }]}
                    onChange={v => updateForm('details.content.typeOfControll', v)} />
                  <ModalField label="Семестр" value={editForm?.isEven} type="number"
                    onChange={v => updateForm('isEven', Number(v))} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-[17px] font-bold text-gray-900 mb-6 uppercase tracking-wider">Опис дисципліни</h3>
                <div className="space-y-6">
                  <ModalField label="Визначення" type="textarea" value={editForm?.details?.content?.disciplineTopics} onChange={v => updateForm('details.content.disciplineTopics', v)} />
                  <ModalField label="Чому цікаво" type="textarea" value={editForm?.details?.content?.whyInterestingDetermination} onChange={v => updateForm('details.content.whyInterestingDetermination', v)} />
                  <ModalField label="Передумови" type="textarea" value={editForm?.details?.content?.prerequisites} onChange={v => updateForm('details.content.prerequisites', v)} />
                  <ModalField label="Результати навчання" type="textarea" value={editForm?.details?.content?.resultEducation} onChange={v => updateForm('details.content.resultEducation', v)} />
                  <ModalField label="Практичне застосування" type="textarea" value={editForm?.details?.content?.usingIrl} onChange={v => updateForm('details.content.usingIrl', v)} />
                  <ModalField label="Вимоги" type="textarea" value={`Мінімальна кількість студентів: ${editForm?.minCountPeople || 0}. Рекомендована попередня підготовка.`} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex gap-4 bg-white">
            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">Скасувати</button>
            <button onClick={handleUpdate} className="flex-1 py-3 bg-[#1e50f0] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Зберегти зміни</button>
          </div>
        </div>
      </Modal>

      {/* Recommended Modal */}
      <Modal isOpen={isRecommendedModalOpen} onClose={() => setIsRecommendedModalOpen(false)} classSize="max-w-4xl">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Доступність дисципліни</h2>
            <button onClick={() => setIsRecommendedModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SelectionColumn title="Галузі спеціальностей" options={specialties} selectedIds={selectedSpecialties}
              onToggle={id => setSelectedSpecialties(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              accessor="id" nameAccessor="name" searchTerm={specSearch} onSearchChange={setSpecSearch} isLoading={modalDataLoading} />
            <SelectionColumn title="Освітні програми" options={eduPrograms} selectedIds={selectedEduPrograms}
              onToggle={id => setSelectedEduPrograms(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              accessor="id" nameAccessor="name" searchTerm={eduSearch} onSearchChange={setEduSearch} isLoading={modalDataLoading} />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button onClick={() => setIsRecommendedModalOpen(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">Скасувати</button>
            <button onClick={handleUpdate} className="px-8 py-2.5 bg-[#1e50f0] text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all shadow-blue-200">Зберегти</button>
          </div>
        </div>
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} classSize="max-w-2xl">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Додати студента на курс</h2>
            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="relative">
            <input placeholder="Пошук студента за ПІБ або групою..." value={modalSearch} onChange={e => setModalSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-2xl divide-y bg-gray-50/30">
            {availableLoading ? <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></div> :
              availableStudents.filter(s => s.studentName.toLowerCase().includes(modalSearch.toLowerCase())).length > 0 ?
                availableStudents.filter(s => s.studentName.toLowerCase().includes(modalSearch.toLowerCase())).map(s => (
                  <div key={s.studentId} className="p-4 flex justify-between items-center hover:bg-white transition-all group">
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#1e50f0] transition-colors">{s.studentName}</div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">ID: {s.studentId}</div>
                    </div>
                    <button onClick={() => handleAddStudent(s.studentId)} className="bg-blue-50 text-[#1e50f0] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1e50f0] hover:text-white transition-all shadow-sm">Додати</button>
                  </div>
                )) : <div className="p-12 text-center text-gray-400 italic">Студентів не знайдено</div>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
