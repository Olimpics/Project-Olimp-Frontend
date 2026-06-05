"use client"
import { useEffect, useState } from 'react';
import {
  InfoBlock,
  DisciplineBlock,
  DisciplineHeader,
  DisciplineTopicsBlock,
  DisciplineSpecialtiesBlock
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

    const fetchFilters = async () => {
      try {
        const [specRes, eduRes] = await Promise.all([
          fetch('http://212.3.125.183:5154/api/Filter/specialities'),
          fetch('http://212.3.125.183:5154/api/Filter/educational-programs')
        ]);
        const specData = await specRes.json();
        const eduData = await eduRes.json();
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
            { label: "Мова", value: discipline.language }
          ]}
          actions={
            <>
              <button
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#1e50f0] shadow-xl shadow-blue-900/10 transition-all hover:bg-blue-50 active:scale-[0.98]"
                title="Записатися"
                aria-label="Записатися"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
              <button
                className="group flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
                title="Додати в обране"
                aria-label="Додати в обране"
              >
                <svg className="w-6 h-6 text-white group-hover:fill-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </>
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


      </div>
    </div>
  );
}
