"use client"
import { useEffect, useState } from 'react';
import {
  InfoBlock,
  DisciplineBlock,
  DisciplineHeader,
  DisciplineTopicsBlock,
  DisciplineSpecialtiesBlock
} from './AdminComponents';
import { Modal } from '@/components/ui/Modal';
import { getCookie } from '@/services/cookie-servies';
import { USER_PROFLE } from '@/constants/cookies';
import { apiService } from '@/services/axiosService';

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

export default function StudentDisciplinePage({ id }: { id: string }) {
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [eduPrograms, setEduPrograms] = useState<any[]>([]);

  // Enrollment states
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const data = await apiService.get<DisciplineDetails>(`DisciplineTabStudent/GetDisciplineWithDetails/${id}`);
        setDiscipline(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentCount = async () => {
      try {
        const data = await apiService.get<any>(`DisciplineTabAdmin/GetStudentsBySelectiveDiscipline?DisciplineId=${id}&page=1&pageSize=1`);
        setStudentCount(data.totalItems || 0);
      } catch (err) {
        console.error('Failed to fetch student count', err);
      }
    };

    const fetchFilters = async () => {
      try {
        const [specData, eduData] = await Promise.all([
          apiService.get<any>('Filter/specialities'),
          apiService.get<any>('Filter/educational-programs')
        ]);
        setSpecialties(Array.isArray(specData) ? specData : []);
        setEduPrograms(Array.isArray(eduData) ? eduData : Array.isArray(eduData?.items) ? eduData.items : []);
      } catch (err) {
        console.error('Failed to fetch filters', err);
      }
    };

    fetchDiscipline();
    fetchStudentCount();
    fetchFilters();
  }, [id]);

  const handleEnroll = async (semester?: number) => {
    const profileStr = getCookie(USER_PROFLE);
    if (!profileStr) return;
    
    try {
      const profile = JSON.parse(profileStr);

      // If both semesters available and none selected yet
      if (discipline?.isEven === 0 && semester === undefined) {
        setIsSemesterModalOpen(true);
        return;
      }

      // semester: 1 - paired (spring), 0 - unpaired (fall)
      // discipline.isEven: 1 - unpaired, 2 - paired, 0 - both
      const finalSemester = semester !== undefined ? semester : (discipline?.isEven === 2 ? 1 : 0);

      setIsEnrolling(true);
      
      await apiService.post('DisciplineTabStudent/SelectiveDisciplineBind', {
        studentId: profile.id.toString(),
        disciplineId: discipline?.idAddDisciplines.toString(),
        semestr: finalSemester,
        loans: 5
      });
      
      // Refresh student count or show success
      const countData = await apiService.get<any>(`DisciplineTabAdmin/GetStudentsBySelectiveDiscipline?DisciplineId=${id}&page=1&pageSize=1`);
      setStudentCount(countData.totalItems || 0);
      alert('Ви успішно записались на дисципліну!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message;
      setEnrollError(msg);
      setIsErrorModalOpen(true);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleRecalculate = async () => {
    const profileStr = getCookie(USER_PROFLE);
    if (!profileStr) return;

    try {
      const profile = JSON.parse(profileStr);
      await apiService.get(`DisciplineTabStudent/RecalculateCache/${profile.id}`);
      setIsErrorModalOpen(false);
      alert('Дані перераховано. Спробуйте записатись знову.');
    } catch (err: any) {
      alert('Помилка при перерахунку: ' + (err?.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" /></div>;
  if (error || !discipline) return <div className="p-8 text-center text-red-500">{error || 'Дисципліну не знайдено'}</div>;

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-12 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        <DisciplineHeader
          code={discipline.codeAddDisciplines}
          name={discipline.nameAddDisciplines}
          details={[
            { label: "Рівень", value: discipline.degreeLevelName },
            { label: "Курс", value: `${discipline.minCourse} курс` },
            { label: "Мова", value: discipline.language },
            { label: "Семестр", value: discipline.isEven === 1 ? 'Непарний (осінь)' : discipline.isEven === 2 ? 'Парний (весна)' : 'Обидва' }
          ]}
          actions={
            <div className="flex items-center gap-2 w-full sm:min-w-[250px] xl:justify-end">
              <button
                onClick={() => handleEnroll()}
                disabled={isEnrolling}
                className="flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-[#1e50f0] shadow-xl shadow-blue-900/10 transition-all hover:bg-blue-50 active:scale-[0.98] px-6 disabled:opacity-50"
                title="Записатися"
                aria-label="Записатися"
              >
                {isEnrolling ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
                <span className="font-bold text-[15px] whitespace-nowrap">Записатись</span>
              </button>
              <button
                className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95 shrink-0"
                title="Додати в обране"
                aria-label="Додати в обране"
              >
                <svg className="w-5 h-5 text-white group-hover:fill-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          }
          progress={{ current: studentCount, total: discipline.maxCountPeople || 500 }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DisciplineBlock title="Основна інформація">
            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              <InfoBlock label="Кафедра" value={discipline.departmentName} />
              <InfoBlock label="Викладач" value={discipline.teacher} />
              <InfoBlock label="Мова викладання" value={discipline.language} />
              <InfoBlock label="Тип контролю" value={discipline.typeOfControll} />
              <InfoBlock label="Передумови" value={discipline.prerequisites} />
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100/60">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 min-w-[220px]">
                  <span className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Рекомендовані знання</span>
                  <div className="text-[11px] font-bold text-[#1e50f0] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Рекомендовано</div>
                </div>
                <span className="text-[16px] font-bold text-gray-900 leading-snug flex-1">{discipline.recomend || 'Не вказано'}</span>
              </div>
            </div>
          </DisciplineBlock>

          <DisciplineBlock title="Опис дисципліни">
            <div className="space-y-10">
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Чому важливо</h4>
                <p className="text-[16px] font-bold text-gray-900 leading-relaxed">{discipline.whyInterestingDetermination}</p>
              </div>
            </div>
          </DisciplineBlock>
        </div>

        <DisciplineBlock title="Перелік тем з дисципліни">
          <DisciplineTopicsBlock topics={discipline.determination} />
        </DisciplineBlock>

        <DisciplineBlock title="Спеціальності">
          <DisciplineSpecialtiesBlock 
            specialtyIds={discipline.recomendationSpeciality || []} 
            eduProgramIds={discipline.recomendationEducationalProgram || []}
            specialtiesList={specialties}
            eduProgramsList={eduPrograms}
          />
        </DisciplineBlock>

        <div className="space-y-8">
          <DisciplineBlock title="Що можна навчитися (результати навчання)">
            <p className="text-[17px] font-medium text-gray-600 leading-[1.7]">
              {discipline.resultEducation}
            </p>
          </DisciplineBlock>

          <DisciplineBlock title="Як можна набути знань та інтелекту (компетенції)">
            <p className="text-[17px] font-medium text-gray-600 leading-[1.7]">
              {discipline.usingIrl}
            </p>
          </DisciplineBlock>

          <DisciplineBlock title="Додаткова інформація">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              <InfoBlock label="Інформаційне забезпечення" value={discipline.additionaLiterature || "НМК дисципліни"} />
              <InfoBlock label="Види навчальної діяльності" value={discipline.typesOfTraining || "Лекції, семінарські заняття"} />
              <InfoBlock label="Максимальна кількість студентів" value={`${discipline.maxCountPeople || 100} осіб`} />
              <InfoBlock label="Мінімальна кількість студентів" value={discipline.minCountPeople ? `${discipline.minCountPeople} осіб` : "Не встановлено"} />
            </div>
          </DisciplineBlock>
        </div>

        {/* Semester Selection Modal */}
        <Modal isOpen={isSemesterModalOpen} onClose={() => setIsSemesterModalOpen(false)}>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Оберіть семестр</h3>
            <p className="text-gray-600 text-lg">Ця дисципліна доступна в обох семестрах. Будь ласка, оберіть бажаний для запису.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => { setIsSemesterModalOpen(false); handleEnroll(0); }}
                className="py-5 px-6 rounded-2xl border-2 border-blue-50 hover:border-[#1e50f0] hover:bg-blue-50 transition-all group"
              >
                <div className="text-[#1e50f0] font-bold text-xl mb-1">Осінній</div>
                <div className="text-blue-400 text-sm font-medium">Непарний семестр (0)</div>
              </button>
              <button 
                onClick={() => { setIsSemesterModalOpen(false); handleEnroll(1); }}
                className="py-5 px-6 rounded-2xl border-2 border-blue-50 hover:border-[#1e50f0] hover:bg-blue-50 transition-all group"
              >
                <div className="text-[#1e50f0] font-bold text-xl mb-1">Весняний</div>
                <div className="text-blue-400 text-sm font-medium">Парний семестр (1)</div>
              </button>
            </div>
            <button 
              onClick={() => setIsSemesterModalOpen(false)}
              className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-all pt-4"
            >
              Скасувати
            </button>
          </div>
        </Modal>

        {/* Error Modal */}
        <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Помилка реєстрації</h3>
            <p className="text-gray-600 text-lg leading-relaxed px-4">{enrollError}</p>
            
            {enrollError?.includes('You have already selected all disciplines of the') && (
              <div className="space-y-4 px-2">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[15px] text-[#1e50f0] font-bold leading-relaxed">
                    Якщо ви вважаєте що сталась помилка, то спробуйте перерахувати дані та записатись знову
                  </p>
                </div>
                <button 
                  onClick={handleRecalculate}
                  className="w-full py-4 bg-[#1e50f0] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Перерахувати
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsErrorModalOpen(false)}
              className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
            >
              Закрити
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
