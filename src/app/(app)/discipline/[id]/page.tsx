"use client"
import { useEffect, useState } from 'react';

interface DisciplineDetails {
  idAddDisciplines: number;
  nameAddDisciplines: string;
  codeAddDisciplines: string;
  faculty: string;
  minCountPeople: number | null;
  maxCountPeople: number | null;
  minCourse: number | null;
  maxCourse: number | null;
  addSemestr: number;
  degreeLevelName: string;
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

interface Params {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: Params) {
  const { id } = params;
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const response = await fetch(`http://185.237.207.78:5000/api/DisciplineTab/GetDisciplineWithDetails/${id}`);
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
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto mt-10" role="alert">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  if (!discipline) return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-md mx-auto mt-10" role="alert">
      <strong className="font-bold">Warning!</strong>
      <span className="block sm:inline"> No discipline found with ID {id}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-3xl font-bold">{discipline.nameAddDisciplines}</h1>
            <div className="flex flex-wrap items-center mt-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                {discipline.codeAddDisciplines}
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                {discipline.degreeLevelName}
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                {discipline.typesOfTraining}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Основна інформація</h2>
                <InfoItem label="Факультет" value={discipline.faculty} />
                <InfoItem label="Кафедра" value={discipline.departmentName} />
                <InfoItem label="Викладач" value={discipline.teacher} />
                <InfoItem label="Мова" value={discipline.language} />
                <InfoItem label="Тип контролю" value={discipline.typeOfControll} />
                <InfoItem label="Семестр" value={discipline.addSemestr.toString()} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Вимоги</h2>
                <InfoItem label="Мін. студентів" value={discipline.minCountPeople?.toString() || 'Не вказано'} />
                <InfoItem label="Макс. студентів" value={discipline.maxCountPeople?.toString() || 'Не вказано'} />
                <InfoItem label="Мін. курс" value={discipline.minCourse?.toString() || 'Не вказано'} />
                <InfoItem label="Макс. курс" value={discipline.maxCourse?.toString() || 'Не вказано'} />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Опис дисципліни</h2>
                <InfoItem label="Визначення" value={discipline.determination} />
                <InfoItem label="Чому цікаво" value={discipline.whyInterestingDetermination} />
                <InfoItem label="Передумови" value={discipline.prerequisites} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Результати навчання</h2>
                <p className="text-gray-700">{discipline.resultEducation}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Практичне застосування</h2>
                <p className="text-gray-700">{discipline.usingIrl}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Додаткова інформація</h2>
                <InfoItem label="Рекомендації" value={discipline.recomend} />
                <InfoItem label="Література" value={discipline.additionaLiterature} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 text-right">
            <span className="text-sm text-gray-600">ID дисципліни: {discipline.idAddDisciplines}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-800">{value || 'Не вказано'}</p>
    </div>
  );
}