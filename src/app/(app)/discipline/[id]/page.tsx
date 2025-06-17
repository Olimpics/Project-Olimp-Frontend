"use client"
import { useEffect, useState, use } from 'react';

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
  const { id } = use(params);
  const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const response = await fetch(`http://185.237.207.78:5000/api/DisciplineTab/GetDisciplineWithDetails/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DisciplineDetails = await response.json();
        setDiscipline(data);
        // Initialize edit data with the fetched discipline
        setEditData({
          nameAddDisciplines: data.nameAddDisciplines,
          codeAddDisciplines: data.codeAddDisciplines,
          faculty: data.faculty,
          minCountPeople: data.minCountPeople,
          maxCountPeople: data.maxCountPeople,
          minCourse: data.minCourse,
          maxCourse: data.maxCourse,
          addSemestr: data.addSemestr.toString(),
          degreeLevel: data.degreeLevelName,
          details: {
            departmentName: data.departmentName,
            teacher: data.teacher,
            recomend: data.recomend,
            prerequisites: data.prerequisites,
            language: data.language,
            determination: data.determination,
            whyInterestingDetermination: data.whyInterestingDetermination,
            resultEducation: data.resultEducation,
            usingIrl: data.usingIrl,
            additionaLiterature: data.additionaLiterature,
            typesOfTraining: data.typesOfTraining,
            typeOfControll: data.typeOfControll
          },
          idAddDisciplines: data.idAddDisciplines
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscipline();
  }, [id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Check if the field is in the main object or in details
    if (name in editData) {
      setEditData({
        ...editData,
        [name]: value
      });
    } else if (name.startsWith('details.')) {
      const detailField = name.split('.')[1];
      setEditData({
        ...editData,
        details: {
          ...editData.details,
          [detailField]: value
        }
      });
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? null : Number(value);

    if (name in editData) {
      setEditData({
        ...editData,
        [name]: numValue
      });
    } else if (name.startsWith('details.')) {
      const detailField = name.split('.')[1];
      setEditData({
        ...editData,
        details: {
          ...editData.details,
          [detailField]: numValue
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://185.237.207.78:5000/api/DisciplineTab/UpdateDisciplineWithDetails/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      setDiscipline(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  if (!discipline || !editData) return (
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
            <div className="flex justify-between items-start">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="nameAddDisciplines"
                    value={editData.nameAddDisciplines}
                    onChange={handleInputChange}
                    className="text-3xl font-bold bg-blue-700 border border-blue-500 rounded p-1 w-full"
                  />
                ) : (
                  <h1 className="text-3xl font-bold">{discipline.nameAddDisciplines}</h1>
                )}
                <div className="flex flex-wrap items-center mt-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="codeAddDisciplines"
                      value={editData.codeAddDisciplines}
                      onChange={handleInputChange}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2"
                    />
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                      {discipline.codeAddDisciplines}
                    </span>
                  )}
                  {isEditing ? (
                    <select
                      name="degreeLevel"
                      value={editData.degreeLevel}
                      onChange={handleInputChange}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2"
                    >
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                      {discipline.degreeLevelName}
                    </span>
                  )}
                  {isEditing ? (
                    <input
                      type="text"
                      name="details.typesOfTraining"
                      value={editData.details.typesOfTraining}
                      onChange={handleInputChange}
                      className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2"
                    />
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                      {discipline.typesOfTraining}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={isEditing ? handleSubmit : handleEditToggle}
                className={`px-4 py-2 rounded-md ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isEditing ? 'Зберегти' : 'Редагувати'}
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Основна інформація</h2>
                  <EditInfoItem
                    label="Факультет"
                    name="faculty"
                    value={editData.faculty}
                    onChange={handleInputChange}
                  />
                  <EditInfoItem
                    label="Кафедра"
                    name="details.departmentName"
                    value={editData.details.departmentName}
                    onChange={handleInputChange}
                  />
                  <EditInfoItem
                    label="Викладач"
                    name="details.teacher"
                    value={editData.details.teacher}
                    onChange={handleInputChange}
                  />
                  <EditInfoItem
                    label="Мова"
                    name="details.language"
                    value={editData.details.language}
                    onChange={handleInputChange}
                  />
                  <EditInfoItem
                    label="Тип контролю"
                    name="details.typeOfControll"
                    value={editData.details.typeOfControll}
                    onChange={handleInputChange}
                  />
                  <EditInfoItem
                    label="Семестр"
                    name="addSemestr"
                    value={editData.addSemestr}
                    onChange={handleInputChange}
                    type="number"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Вимоги</h2>
                  <EditInfoItem
                    label="Мін. студентів"
                    name="minCountPeople"
                    value={editData.minCountPeople?.toString() || ''}
                    onChange={handleNumberInputChange}
                    type="number"
                  />
                  <EditInfoItem
                    label="Макс. студентів"
                    name="maxCountPeople"
                    value={editData.maxCountPeople?.toString() || ''}
                    onChange={handleNumberInputChange}
                    type="number"
                  />
                  <EditInfoItem
                    label="Мін. курс"
                    name="minCourse"
                    value={editData.minCourse?.toString() || ''}
                    onChange={handleNumberInputChange}
                    type="number"
                  />
                  <EditInfoItem
                    label="Макс. курс"
                    name="maxCourse"
                    value={editData.maxCourse?.toString() || ''}
                    onChange={handleNumberInputChange}
                    type="number"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Опис дисципліни</h2>
                  <EditTextAreaItem
                    label="Визначення"
                    name="details.determination"
                    value={editData.details.determination}
                    onChange={handleInputChange}
                  />
                  <EditTextAreaItem
                    label="Чому цікаво"
                    name="details.whyInterestingDetermination"
                    value={editData.details.whyInterestingDetermination}
                    onChange={handleInputChange}
                  />
                  <EditTextAreaItem
                    label="Передумови"
                    name="details.prerequisites"
                    value={editData.details.prerequisites}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Результати навчання</h2>
                  <EditTextAreaItem
                    name="details.resultEducation"
                    value={editData.details.resultEducation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Практичне застосування</h2>
                  <EditTextAreaItem
                    name="details.usingIrl"
                    value={editData.details.usingIrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Додаткова інформація</h2>
                  <EditTextAreaItem
                    label="Рекомендації"
                    name="details.recomend"
                    value={editData.details.recomend}
                    onChange={handleInputChange}
                  />
                  <EditTextAreaItem
                    label="Література"
                    name="details.additionaLiterature"
                    value={editData.details.additionaLiterature}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </form>
          ) : (
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
          )}

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">ID дисципліни: {discipline.idAddDisciplines}</span>
            {!isEditing && (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Редагувати
              </button>
            )}
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

function EditInfoItem({
                        label,
                        name,
                        value,
                        onChange,
                        type = "text"
                      }: {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="mb-3">
      {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
  );
}

function EditTextAreaItem({
                            label,
                            name,
                            value,
                            onChange
                          }: {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="mb-3">
      {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md h-24"
      />
    </div>
  );
}