"use client"
import { USER_PROFLE } from '@/constants/cookies';
import { apiService } from '@/services/axiosService';
import { getCookie } from '@/services/cookie-servies'
import { useEffect, useState, use } from 'react';

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

interface Params {
  params: {
    id: string;
  };
}

export default function DisciplinePage({ params }: Params) {
  const { id } = use(params);
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [id]);

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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Записатися
                </button>
                <button className="p-2.5 border border-white/30 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
              
              <CircularProgress current={120} total={discipline.maxCountPeople || 500} />
            </div>
          </div>
        </section>

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

      </div>
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
