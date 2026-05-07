"use client"
import { useEffect, useState } from 'react';
import { 
  CircularProgress, 
  InfoBlock, 
  DisciplineBlock 
} from './AdminComponents';

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

export default function StudentDisciplinePage({ id }: { id: string }) {
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {  
    const fetchDiscipline = async () => {
      try {
        const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabStudent/GetDisciplineWithDetails/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: DisciplineDetails = await response.json();
        setDiscipline(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentCount = async () => {
      try {
        const response = await fetch(`http://212.3.125.183:5154/api/DisciplineTabAdmin/GetStudentsByAddDiscipline?DisciplineId=${id}&page=1&pageSize=1`);
        const data = await response.json();
        setStudentCount(data.totalItems || 0);
      } catch (err) {
        console.error('Failed to fetch student count', err);
      }
    };

    fetchDiscipline();
    fetchStudentCount();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" /></div>;
  if (error || !discipline) return <div className="p-8 text-center text-red-500">{error || 'Дисципліну не знайдено'}</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
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
                <p>Рівень: <span className="text-white font-bold">{discipline.degreeLevelName}</span></p>
                <span className="opacity-30">|</span>
                <p>Курс: <span className="text-white font-bold">{discipline.minCourse} курс</span></p>
                <span className="opacity-30">|</span>
                <p>Мова: <span className="text-white font-bold">{discipline.language}</span></p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-between gap-6">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#1e50f0] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Записатися
                </button>
                <button className="p-3 border border-white/30 rounded-xl hover:bg-white/10 transition-all active:scale-95 group">
                  <svg className="w-6 h-6 text-white group-hover:fill-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
              
              <CircularProgress current={studentCount} total={discipline.maxCountPeople || 500} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DisciplineBlock title="Основна інформація">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <InfoBlock label="Кафедра" value={discipline.departmentName} />
              <InfoBlock label="Викладач" value={discipline.teacher} />
              <InfoBlock label="Мова викладання" value={discipline.language} />
              <InfoBlock label="Тип контролю" value={discipline.typeOfControll} />
              <InfoBlock label="Передумови" value={discipline.prerequisites} />
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <span className="text-[13px] font-medium text-gray-400">Рекомендовані знання</span>
                  <div className="text-[11px] font-bold text-[#1e50f0] bg-blue-50 px-2.5 py-1 rounded-lg">Рекомендовано</div>
                </div>
                <span className="text-sm font-bold text-gray-900 leading-tight flex-1">{discipline.recomend || 'Не вказано'}</span>
              </div>
            </div>
          </DisciplineBlock>

          <DisciplineBlock title="Опис дисципліни">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Що вивчатиметься</h4>
                <p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.determination}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Чому важливо</h4>
                <p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.whyInterestingDetermination}</p>
              </div>
            </div>
          </DisciplineBlock>
        </div>

        <div className="space-y-6">
          <DisciplineBlock title="Що можна навчитися (результати навчання)">
            <p className="text-[15px] font-medium text-gray-600 leading-relaxed">
              {discipline.resultEducation}
            </p>
          </DisciplineBlock>

          <DisciplineBlock title="Як можна набути знань та інтелекту (компетенції)">
            <p className="text-[15px] font-medium text-gray-600 leading-relaxed">
              {discipline.usingIrl}
            </p>
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
    </div>
  );
}
