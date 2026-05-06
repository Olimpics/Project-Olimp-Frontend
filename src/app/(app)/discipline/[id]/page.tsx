'use client'
import { USER_PROFLE } from '@/constants/cookies'
import { apiService } from '@/services/axiosService'
import { getCookie } from '@/services/cookie-servies'
import { useEffect, useState, use } from 'react'
import clsx from 'clsx'

interface DisciplineDetails {
    idAddDisciplines: number
    nameAddDisciplines: string
    codeAddDisciplines: string
    facultyAbbreviation: string
    facultyId: number
    minCountPeople: number | null
    maxCountPeople: number | null
    minCourse: number | null
    maxCourse: number | null
    isEven: number
    degreeLevelName: string
    degreeLevelId: number
    departmentId: number
    departmentName: string
    teacher: string
    recomend: string
    prerequisites: string
    language: string
    determination: string
    whyInterestingDetermination: string
    resultEducation: string
    usingIrl: string
    additionaLiterature: string
    typesOfTraining: string
    typeOfControll: string
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
    const { id } = use(params)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [discipline, setDiscipline] = useState<DisciplineDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<any>(null)
    const [faculty, setFaculty] = useState<Faculty[] | null>(null)
    const [departament, setDepartment] = useState<any | null>(null)
    const [degrees, setDegrees] = useState<Degree[] | null>(null)

    const isAdmin = userProfile?.roleId === 2

    useEffect(() => {
        const raw = getCookie(USER_PROFLE)
        if (raw) {
            setUserProfile(JSON.parse(raw))
        }

        const fetchDisciplineAndFaculty = async () => {
            try {
                const response = await fetch(
                    `https://localhost:7011/api/DisciplineTabStudent/GetDisciplineWithDetails/${id}`
                )
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data: DisciplineDetails = await response.json()
                const fac_res = await apiService.get<Faculty[]>('Faculty')
                const dep_res = await apiService.get<Department[]>(
                    'Department?page=1&pageSize=500&sortOrder=0'
                )
                const deg_res =
                    await apiService.get<Degree[]>('EducationalDegree')

                setDegrees(deg_res)
                setDiscipline(data)
                setDepartment(dep_res)
                setFaculty(fac_res)

                setEditData({
                    nameAddDisciplines: data.nameAddDisciplines,
                    codeAddDisciplines: data.codeAddDisciplines,
                    faculty: data.facultyAbbreviation,
                    facultyId: data.facultyId,
                    minCountPeople: data.minCountPeople,
                    maxCountPeople: data.maxCountPeople,
                    minCourse: data.minCourse,
                    maxCourse: data.maxCourse,
                    isEven: data.isEven.toString(),
                    degreeLevelName: data.degreeLevelName,
                    degreeLevelId: data.degreeLevelId,
                    details: {
                        departmentId: data.departmentId,
                        departamentName: data.departmentName,
                        teacher: data.teacher,
                        recomend: data.recomend,
                        prerequisites: data.prerequisites,
                        language: data.language,
                        determination: data.determination,
                        whyInterestingDetermination:
                            data.whyInterestingDetermination,
                        resultEducation: data.resultEducation,
                        usingIrl: data.usingIrl,
                        additionaLiterature: data.additionaLiterature,
                        typesOfTraining: data.typesOfTraining,
                        typeOfControll: data.typeOfControll,
                    },
                    idAddDisciplines: data.idAddDisciplines,
                })
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchDisciplineAndFaculty()
    }, [id])

    const handleEditToggle = () => {
        setIsEditing(!isEditing)
    }

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target

        if (name === 'facultyId') {
            const selectedId = Number(value)
            const selectedFaculty = faculty?.find(
                (f) => f.idFaculty === selectedId
            )
            if (selectedFaculty) {
                setEditData((prev: any) => ({
                    ...prev,
                    facultyId: selectedFaculty.idFaculty,
                    faculty: selectedFaculty.abbreviation,
                }))
            }
            return
        }

        if (name === 'details.departmentId') {
            const selectedId = Number(value)
            const selectedDepartment = departament?.items.find(
                (d: any) => d.idDepartment === selectedId
            )
            if (selectedDepartment) {
                setEditData((prev: any) => ({
                    ...prev,
                    details: {
                        ...prev.details,
                        departmentId: selectedDepartment.idDepartment,
                        departamentName: selectedDepartment.nameDepartment,
                    },
                }))
            }
            return
        }

        if (name === 'degreeLevelId') {
            const selectedId = Number(value)
            const selectedDegree = degrees?.find(
                (d) => d.idEducationalDegree === selectedId
            )
            if (selectedDegree) {
                setEditData((prev: any) => ({
                    ...prev,
                    degreeLevelId: selectedDegree.idEducationalDegree,
                    degreeLevelName: selectedDegree.nameEducationalDegreec,
                }))
            }
            return
        }

        if (name in editData) {
            setEditData((prev: any) => ({
                ...prev,
                [name]: value,
            }))
            return
        }

        if (name.startsWith('details.')) {
            const detailField = name.split('.')[1]
            setEditData((prev: any) => ({
                ...prev,
                details: {
                    ...prev.details,
                    [detailField]: value,
                },
            }))
        }
    }

    const handleNumberInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target
        const numValue = value === '' ? null : Number(value)

        if (name in editData) {
            setEditData((prev: any) => ({
                ...prev,
                [name]: numValue,
            }))
        } else if (name.startsWith('details.')) {
            const detailField = name.split('.')[1]
            setEditData((prev: any) => ({
                ...prev,
                details: {
                    ...prev.details,
                    [detailField]: numValue,
                },
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch(
                `https://localhost:7011/api/DisciplineTabStudent/UpdateDisciplineWithDetails/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editData),
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const updatedDiscipline = await response.json()
            setDiscipline(updatedDiscipline)
            setIsEditing(false)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'An unknown error occurred'
            )
        } finally {
            setLoading(false)
        }
    }

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )

    if (error)
        return (
            <div
                className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-2xl mx-auto mt-12 shadow-sm flex items-center gap-4"
                role="alert"
            >
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <div>
                    <strong className="font-bold block">
                        Помилка завантаження
                    </strong>
                    <span className="text-sm opacity-90">{error}</span>
                </div>
            </div>
        )

    if (!discipline || !editData)
        return (
            <div
                className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-xl max-w-2xl mx-auto mt-12 shadow-sm"
                role="alert"
            >
                <strong className="font-bold">Попередження!</strong>
                <span className="block text-sm">
                    Дисципліну з ID {id} не знайдено.
                </span>
            </div>
        )

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Course Header Card */}
                <Card className="mb-8 shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 sm:px-8 py-8">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">
                                        {discipline.codeAddDisciplines}
                                    </Badge>
                                    <Badge className="bg-green-500/90 text-white border-0 hover:bg-green-500">
                                        Набір відкрито
                                    </Badge>
                                    {isAdmin && (
                                        <Badge className="bg-amber-500/90 text-white border-0">
                                            Режим адміна
                                        </Badge>
                                    )}
                                </div>

                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="nameAddDisciplines"
                                        value={editData.nameAddDisciplines}
                                        onChange={handleInputChange}
                                        className="text-2xl sm:text-3xl font-bold bg-white/10 text-white border border-white/30 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
                                    />
                                ) : (
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                                        {discipline.nameAddDisciplines}
                                    </h1>
                                )}

                                <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-blue-50">
                                        <span className="text-xs opacity-80 uppercase tracking-wider">
                                            Рівень:
                                        </span>
                                        {isEditing ? (
                                            <select
                                                name="degreeLevelId"
                                                value={
                                                    editData.degreeLevelId ?? ''
                                                }
                                                onChange={handleInputChange}
                                                className="bg-white/10 text-white border border-white/30 rounded px-2 py-0.5 text-sm focus:outline-none"
                                            >
                                                <option
                                                    value=""
                                                    className="text-gray-900"
                                                >
                                                    Оберіть рівень
                                                </option>
                                                {degrees?.map((degree) => (
                                                    <option
                                                        key={
                                                            degree.idEducationalDegree
                                                        }
                                                        value={
                                                            degree.idEducationalDegree
                                                        }
                                                        className="text-gray-900"
                                                    >
                                                        {
                                                            degree.nameEducationalDegreec
                                                        }
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {discipline.degreeLevelName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
                                    <div className="flex items-center gap-2 text-blue-50">
                                        <span className="text-xs opacity-80 uppercase tracking-wider">
                                            Курс:
                                        </span>
                                        {isEditing ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    name="minCourse"
                                                    value={
                                                        editData.minCourse ?? ''
                                                    }
                                                    onChange={
                                                        handleNumberInputChange
                                                    }
                                                    className="bg-white/10 text-white border border-white/30 rounded px-1 w-12 text-sm text-center"
                                                />
                                                <span>-</span>
                                                <input
                                                    type="number"
                                                    name="maxCourse"
                                                    value={
                                                        editData.maxCourse ?? ''
                                                    }
                                                    onChange={
                                                        handleNumberInputChange
                                                    }
                                                    className="bg-white/10 text-white border border-white/30 rounded px-1 w-12 text-sm text-center"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {discipline.minCourse}-
                                                {discipline.maxCourse} курс
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
                                    <div className="flex items-center gap-2 text-blue-50">
                                        <span className="text-xs opacity-80 uppercase tracking-wider">
                                            Мова:
                                        </span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="details.language"
                                                value={
                                                    editData.details.language
                                                }
                                                onChange={handleInputChange}
                                                className="bg-white/10 text-white border border-white/30 rounded px-2 py-0.5 text-sm w-32 focus:outline-none"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {discipline.language}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
                                    <div className="flex items-center gap-2 text-blue-50">
                                        <span className="text-xs opacity-80 uppercase tracking-wider font-bold">
                                            Семестр
                                        </span>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="isEven"
                                                value={editData.isEven}
                                                onChange={handleInputChange}
                                                className="bg-white/10 text-white border border-white/30 rounded px-2 py-0.5 text-sm w-16 focus:outline-none"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {discipline.isEven}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                                <div className="flex gap-2 w-full md:w-auto">
                                    {isAdmin && (
                                        <Button
                                            variant={
                                                isEditing
                                                    ? 'success'
                                                    : 'outline'
                                            }
                                            onClick={
                                                isEditing
                                                    ? handleSubmit
                                                    : handleEditToggle
                                            }
                                            className="flex-1 md:flex-none shadow-lg"
                                        >
                                            {isEditing ? (
                                                <SaveIcon />
                                            ) : (
                                                <EditIcon />
                                            )}
                                            {isEditing
                                                ? 'Зберегти'
                                                : 'Редагувати'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        className="flex-1 md:flex-none shadow-lg"
                                    >
                                        <UserPlusIcon />
                                        Записатися
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hidden sm:flex"
                                    >
                                        <StarIcon />
                                    </Button>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 w-full md:w-auto">
                                    <div className="flex items-center justify-between md:justify-start gap-4">
                                        <CompactEnrollmentWidget
                                            enrolled={0} // Placeholder as API doesn't provide current enrollment
                                            capacity={
                                                discipline.maxCountPeople || 0
                                            }
                                        />
                                        <div className="text-white">
                                            <div className="text-[10px] opacity-80 uppercase tracking-widest">
                                                Місць
                                            </div>
                                            <div className="text-lg font-bold">
                                                0 з{' '}
                                                {discipline.maxCountPeople ||
                                                    '∞'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* Top Row: Main Info and Description */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Main Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Основна інформація</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                    <InfoRow
                                        label="Факультет"
                                        editing={isEditing}
                                    >
                                        {isEditing ? (
                                            <select
                                                name="facultyId"
                                                value={editData.facultyId ?? ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                                            >
                                                <option value="">
                                                    Оберіть факультет
                                                </option>
                                                {faculty?.map((f) => (
                                                    <option
                                                        key={f.idFaculty}
                                                        value={f.idFaculty}
                                                    >
                                                        {f.nameFaculty}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            discipline.facultyAbbreviation
                                        )}
                                    </InfoRow>
                                    <InfoRow
                                        label="Кафедра"
                                        editing={isEditing}
                                    >
                                        {isEditing ? (
                                            <select
                                                name="details.departmentId"
                                                value={
                                                    editData.details
                                                        .departmentId ?? ''
                                                }
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                                            >
                                                <option value="">
                                                    Оберіть кафедру
                                                </option>
                                                {departament?.items?.map(
                                                    (d: any) => (
                                                        <option
                                                            key={d.idDepartment}
                                                            value={
                                                                d.idDepartment
                                                            }
                                                        >
                                                            {d.nameDepartment}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        ) : (
                                            discipline.departmentName
                                        )}
                                    </InfoRow>
                                    <InfoRow
                                        label="Викладач"
                                        editing={isEditing}
                                    >
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="details.teacher"
                                                value={editData.details.teacher}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        ) : (
                                            discipline.teacher
                                        )}
                                    </InfoRow>
                                    <InfoRow
                                        label="Мова викладання"
                                        editing={isEditing}
                                    >
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="details.language"
                                                value={
                                                    editData.details.language
                                                }
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        ) : (
                                            discipline.language
                                        )}
                                    </InfoRow>
                                    <InfoRow
                                        label="Тип контролю"
                                        editing={isEditing}
                                    >
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="details.typeOfControll"
                                                value={
                                                    editData.details
                                                        .typeOfControll
                                                }
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        ) : (
                                            discipline.typeOfControll
                                        )}
                                    </InfoRow>
                                    <InfoRow
                                        label="Передумови"
                                        editing={isEditing}
                                    >
                                        {isEditing ? (
                                            <textarea
                                                name="details.prerequisites"
                                                value={
                                                    editData.details
                                                        .prerequisites
                                                }
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 h-10 focus:bg-white transition-all"
                                            />
                                        ) : (
                                            discipline.prerequisites
                                        )}
                                    </InfoRow>
                                    <div className="col-span-2">
                                        <InfoRow
                                            label="Рекомендовані знання"
                                            editing={isEditing}
                                        >
                                            {isEditing ? (
                                                <textarea
                                                    name="details.recomend"
                                                    value={
                                                        editData.details
                                                            .recomend
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 h-20"
                                                />
                                            ) : (
                                                discipline.recomend
                                            )}
                                        </InfoRow>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Опис дисципліни</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                                        Що вивчатиметься
                                    </h4>
                                    {isEditing ? (
                                        <textarea
                                            name="details.determination"
                                            value={
                                                editData.details.determination
                                            }
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 h-32 focus:bg-white transition-all"
                                        />
                                    ) : (
                                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                                            {discipline.determination ||
                                                'Опис відсутній.'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                                        Чому це важливо
                                    </h4>
                                    {isEditing ? (
                                        <textarea
                                            name="details.whyInterestingDetermination"
                                            value={
                                                editData.details
                                                    .whyInterestingDetermination
                                            }
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 h-32 focus:bg-white transition-all"
                                        />
                                    ) : (
                                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                                            {discipline.whyInterestingDetermination ||
                                                'Інформація про важливість відсутня.'}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Rows: Full Width Cards */}
                    <div className="space-y-8">
                        {/* Learning Outcomes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Що можна навчитися (результати навчання)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <textarea
                                        name="details.resultEducation"
                                        value={editData.details.resultEducation}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 h-40 focus:bg-white transition-all"
                                    />
                                ) : (
                                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                        {discipline.resultEducation ||
                                            'Результати навчання не описані.'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Practical Application / Competencies */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Як можна набути знань та інтелекту
                                    (компетенції)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <textarea
                                        name="details.usingIrl"
                                        value={editData.details.usingIrl}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 h-40 focus:bg-white transition-all"
                                    />
                                ) : (
                                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                        {discipline.usingIrl ||
                                            'Інформація про компетенції відсутня.'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Додаткова інформація</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-5">
                                        <InfoRow
                                            label="Інформаційне забезпечення"
                                            editing={isEditing}
                                        >
                                            {isEditing ? (
                                                <textarea
                                                    name="details.additionaLiterature"
                                                    value={
                                                        editData.details
                                                            .additionaLiterature
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 h-20"
                                                />
                                            ) : (
                                                discipline.additionaLiterature
                                            )}
                                        </InfoRow>
                                        <InfoRow
                                            label="Види навчальної діяльності"
                                            editing={isEditing}
                                        >
                                            {isEditing ? (
                                                <textarea
                                                    name="details.typesOfTraining"
                                                    value={
                                                        editData.details
                                                            .typesOfTraining
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 h-20"
                                                />
                                            ) : (
                                                discipline.typesOfTraining
                                            )}
                                        </InfoRow>
                                    </div>
                                    <div className="space-y-5">
                                        <InfoRow
                                            label="Максимальна кількість студентів"
                                            editing={isEditing}
                                        >
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    name="maxCountPeople"
                                                    value={
                                                        editData.maxCountPeople ??
                                                        ''
                                                    }
                                                    onChange={
                                                        handleNumberInputChange
                                                    }
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white"
                                                />
                                            ) : (
                                                discipline.maxCountPeople ||
                                                'Не обмежено'
                                            )}
                                        </InfoRow>
                                        <InfoRow
                                            label="Мінімальна кількість студентів"
                                            editing={isEditing}
                                        >
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    name="minCountPeople"
                                                    value={
                                                        editData.minCountPeople ??
                                                        ''
                                                    }
                                                    onChange={
                                                        handleNumberInputChange
                                                    }
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white"
                                                />
                                            ) : (
                                                discipline.minCountPeople ||
                                                'Не встановлено'
                                            )}
                                        </InfoRow>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 text-center">
                <p className="text-xs text-gray-400">
                    ID дисципліни: {discipline.idAddDisciplines} • Останнє
                    оновлення: {new Date().toLocaleDateString()}
                </p>
            </footer>
        </div>
    )
}

function InfoRow({
    label,
    children,
    editing,
}: {
    label: string
    children: React.ReactNode
    editing?: boolean
}) {
    return (
        <div>
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div
                className={clsx(
                    'font-medium text-gray-900 leading-tight',
                    !editing && 'text-sm'
                )}
            >
                {children || <span className="text-gray-300">Не вказано</span>}
            </div>
        </div>
    )
}
