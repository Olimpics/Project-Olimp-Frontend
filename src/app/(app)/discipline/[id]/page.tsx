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

interface Faculty {
    idFaculty: number
    nameFaculty: string
    abbreviation: string
}

interface Department {
    idDepartment: number
    facultyId: number
    nameDepartment: string
    abbreviation: string
    facultyName: string
}

interface Degree {
    idEducationalDegree: number
    nameEducationalDegreec: string
}

interface Params {
    params: {
        id: string
    }
}

// UI Components
const Badge = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => (
    <span
        className={clsx(
            'px-2.5 py-0.5 rounded-full text-xs font-medium',
            className
        )}
    >
        {children}
    </span>
)

const Button = ({
    children,
    className,
    variant = 'primary',
    onClick,
    type = 'button',
    ...props
}: any) => {
    const baseStyles =
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50'
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary:
            'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100',
        outline:
            'border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm',
        success: 'bg-green-600 text-white hover:bg-green-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'hover:bg-gray-100 text-gray-600',
    }
    return (
        <button
            type={type}
            className={clsx(
                baseStyles,
                variants[variant as keyof typeof variants],
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

const Card = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => (
    <div
        className={clsx(
            'bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden',
            className
        )}
    >
        {children}
    </div>
)

const CardHeader = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => (
    <div className={clsx('px-6 py-4 border-b border-gray-100', className)}>
        {children}
    </div>
)

const CardTitle = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
        {children}
    </h3>
)

const CardContent = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => <div className={clsx('px-6 py-4', className)}>{children}</div>

const CompactEnrollmentWidget = ({
    enrolled,
    capacity,
}: {
    enrolled: number
    capacity: number
}) => {
    const percentage =
        capacity > 0 ? Math.min(100, (enrolled / capacity) * 100) : 0
    return (
        <div className="relative flex items-center justify-center w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/20"
                />
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * percentage) / 100}
                    className="text-white"
                />
            </svg>
            <div className="absolute text-[10px] font-bold text-white">
                {Math.round(percentage)}%
            </div>
        </div>
    )
}

// Icons
const UserPlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" x2="19" y1="8" y2="14" />
        <line x1="16" x2="22" y1="11" y2="11" />
    </svg>
)

const StarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const SaveIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)

export default function ProductPage({ params }: Params) {
    const { id } = use(params);
    const user = JSON.parse(getCookie(USER_PROFLE) || '{}');
    const isAdmin = user.roleId === 2;
    const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [faculty, setFaculty] = useState<Faculty[] | null>(null)
    const [departament, setDepartment] = useState<Department[] | null>(null)
    const [degrees, setDegrees] = useState<Degree[] | null>(null)

    useEffect(() => {
        const fetchDisciplineAndFaculty = async () => {
            try {
                const response = await fetch(`https://localhost:7011/api/DisciplineTabStudent/GetDisciplineWithDetails/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: DisciplineDetails = await response.json();
                const fac_res = await apiService.get<Faculty[]>('Faculty');
                const dep_res = await apiService.get<Department[]>('Department?page=1&pageSize=500&sortOrder=0')
                const deg_res = await apiService.get<Degree[]>('EducationalDegree')

                setDegrees(deg_res)
                setDiscipline(data);
                setDepartment(dep_res)
                setFaculty(fac_res);

                setEditData({
                    nameAddDisciplines: data.nameAddDisciplines,
                    codeAddDisciplines: data.codeAddDisciplines,
                    faculty: data.facultyAbbreviation,
                    facultyId: 0,
                    minCountPeople: data.minCountPeople,
                    maxCountPeople: data.maxCountPeople,
                    minCourse: data.minCourse,
                    maxCourse: data.maxCourse,
                    isEven: data.isEven.toString(),
                    degreeLevelName: data.degreeLevelName,
                    degreeLevelId: 0,
                    details: {
                        departmentId: 0,
                        departamentName: data.departmentName,
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

        fetchDisciplineAndFaculty();
    }, [id]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'facultyId') {
            const selectedId = Number(value);
            const selectedFaculty = faculty.find(f => f.idFaculty === selectedId);
            if (selectedFaculty) {
                setEditData(prev => ({
                    ...prev,
                    facultyId: selectedFaculty.idFaculty,
                    nameFaculty: selectedFaculty.nameFaculty,
                }));
            }
            return;
        }

        if (name === 'details.departmentId') {
            const selectedId = Number(value);
            const selectedDepartment = departament?.items.find(d => d.idDepartment === selectedId);
            if (selectedDepartment) {
                setEditData(prev => ({
                    ...prev,
                    details: {
                        ...prev.details,
                        departmentId: selectedDepartment.idDepartment,
                    }
                }));
            }
            return;
        }

        if (name === 'degreeLevelId') {
            const selectedId = Number(value);
            const selectedDegree = degrees.find(d => d.idEducationalDegree === selectedId);
            if (selectedDegree) {
                setEditData(prev => ({
                    ...prev,
                    degreeLevelId: selectedDegree.idEducationalDegree,
                    degreeLevelName: selectedDegree.nameEducationalDegreec,
                }));
            }
            return;
        }

        // Other top-level fields
        if (name in editData) {
            setEditData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }

        // Other nested `details.*` fields
        if (name.startsWith('details.')) {
            const detailField = name.split('.')[1];
            setEditData(prev => ({
                ...prev,
                details: {
                    ...prev.details,
                    [detailField]: value
                }
            }));
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
            const requiredFields = [
                { key: 'degreeLevelId', label: 'Рівень освіти' },
                { key: 'facultyId', label: 'Факультет' },
                //{ key: 'departmentId', label: 'Кафедра' },
            ];

            for (const field of requiredFields) {
                const value = (editData as any)[field.key];
                if (!value || value === 0) {
                    console.log(value)
                    throw new Error(`Поле '${field.label}' відсутнє!`);
                }
            }

            const response = await fetch(`https://localhost:7011/api/DisciplineTabStudent/UpdateDisciplineWithDetails/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
                                            name="degreeLevelId"
                                            value={editData.degreeLevelId ?? ''}
                                            onChange={handleInputChange}
                                            className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2"
                                        >
                                            <option value="">Оберіть рівень освіти</option>
                                            {degrees.map(degree => (
                                                <option key={degree.idEducationalDegree} value={degree.idEducationalDegree}>
                                                    {degree.nameEducationalDegreec}
                                                </option>
                                            ))}
                                        </select>

                                    ) : (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2 mb-2">
                                            {discipline.degreeLevelName}
                                        </span>
                                    )}
                                    {isEditing && isAdmin ? (
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
                            {isAdmin && (<button
                                onClick={isEditing && isAdmin ? handleSubmit : handleEditToggle}
                                className={`px-4 py-2 rounded-md ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                            >
                                {isEditing ? 'Зберегти' : 'Редагувати'}
                            </button>)}

                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Основна інформація</h2>
                                    <EditInfoItem
                                        label="Факультет"
                                        name="facultyId"
                                        value={editData.faculty.facultyId}
                                        onChange={handleInputChange}
                                        options={faculty}
                                        optionValue="idFaculty"
                                        optionLabel="nameFaculty"
                                    />

                                    <EditInfoItem
                                        label="Кафедра"
                                        name="details.departmentId"
                                        value={editData.details.departmentId}
                                        onChange={handleInputChange}
                                        options={departament?.items}
                                        optionValue="idDepartment"
                                        optionLabel="nameDepartment"
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
                                        name="isEven"
                                        value={editData.isEven}
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
                                    <InfoItem label="Факультет" value={discipline.facultyAbbreviation} />
                                    <InfoItem label="Кафедра" value={discipline.departmentName} />
                                    <InfoItem label="Викладач" value={discipline.teacher} />
                                    <InfoItem label="Мова" value={discipline.language} />
                                    <InfoItem label="Тип контролю" value={discipline.typeOfControll} />
                                    <InfoItem label="Семестр" value={discipline.isEven.toString()} />
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
                        {(!isEditing && isAdmin) && (
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

type EditInfoItemProps<T = any> = {
    label?: string;
    name: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    type?: string;
    options?: T[] | null;
    optionValue?: keyof T;
    optionLabel?: keyof T;
};

type EditTextAreaItemProps<T = any> = {
    label?: string;
    name: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    options?: T[] | null;
    optionValue?: keyof T;
    optionLabel?: keyof T;
};

export function EditInfoItem<T = any>({
    label,
    name,
    value,
    onChange,
    type = 'text',
    options,
    optionValue,
    optionLabel,
}: EditInfoItemProps<T>) {
    const isDropdown = options && options.length > 0 && optionValue && optionLabel;

    return (
        <div className="mb-3">
            {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
            {isDropdown ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded-md h-10"
                >
                    <option value="">Оберіть значення</option>
                    {options!.map((item, idx) => (
                        <option key={idx} value={String(item[optionValue])}>
                            {String(item[optionLabel])}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            )}
        </div>
    );
}

export function EditTextAreaItem<T = any>({
    label,
    name,
    value,
    onChange,
    options,
    optionValue,
    optionLabel,
}: EditTextAreaItemProps<T>) {
    const isDropdown = options && options.length > 0;

    return (
        <div className="mb-3">
            {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
            {isDropdown ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded-md h-10"
                >
                    <option value="">Оберіть значення</option>
                    {options!.map((item, idx) => {
                        const optionVal =
                            optionValue && typeof item === 'object'
                                ? String(item[optionValue])
                                : String(item);
                        const optionLbl =
                            optionLabel && typeof item === 'object'
                                ? String(item[optionLabel])
                                : String(item);
                        return (
                            <option key={idx} value={optionVal}>
                                {optionLbl}
                            </option>
                        );
                    })}
                </select>
            ) : (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                />
            )}
        </div>
    );
}