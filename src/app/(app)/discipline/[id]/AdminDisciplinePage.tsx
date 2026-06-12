"use client"
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  CircularProgress,
  Pagination,
  SelectionColumn,
  DisciplineBlock,
  InfoBlock,
  ModalField,
  SearchableSelect,
  InteractiveTopicsInput,
  DisciplineTopicsBlock,
  DisciplineSpecialtiesBlock
} from './AdminComponents';
import { apiService } from '@/services/axiosService';

const BRANCH_NAMES: Record<string, string> = {
  "01": "Освіта/Педагогіка",
  "02": "Культура і мистецтво",
  "03": "Гуманітарні науки",
  "04": "Богослов'я",
  "05": "Соціальні та поведінкові науки",
  "06": "Журналістика",
  "07": "Управління та адміністрування",
  "08": "Право",
  "09": "Біологія",
  "10": "Природничі науки",
  "11": "Математика та статистика",
  "12": "Інформаційні технології",
  "13": "Механічна інженерія",
  "14": "Електрична інженерія",
  "15": "Автоматизація та приладобудування",
  "16": "Хімічна та біоінженерія",
  "17": "Електроніка та телекомунікації",
  "18": "Виробництво та технології",
  "19": "Архітектура та будівництво",
  "20": "Аграрні науки та продовольство",
  "21": "Ветеринарна медицина",
  "22": "Охорона здоров'я",
  "23": "Соціальна робота",
  "24": "Сфера обслуговування",
  "25": "Воєнні науки, нац. безпека",
  "26": "Цивільна безпека",
  "27": "Транспорт",
  "28": "Публічне управління та адміністрування",
  "29": "Міжнародні відносини"
};

interface DisciplineDetails {
  idSelectiveDisciplines: any;
  nameSelectiveDisciplines: string;
  codeSelectiveDisciplines: string;
  facultyAbbreviation: string;
  facultyId: string | number;
  minCountPeople: number | null;
  maxCountPeople: number | null;
  minCourse: number | null;
  maxCourse: number | null;
  isEven: number;
  degreeLevelName: string;
  degreeLevelId: string | number;
  departmentId: string | number;
  departmentName: string;
  teacher: string;
  recomend: string;
  prerequisites: string;
  language: string;
  determination: string;
  disciplineTopics: string | string[];
  whyInterestingDetermination: string;
  resultEducation: string;
  usingIrl: string;
  additionaLiterature: string;
  typesOfTraining: string;
  typeOfControll: string;
  recommended: string | null;
  recomendationSpeciality: any[];
  recomendationEducationalProgram: any[];
  catalogId?: string | number;
  approvalStatusId?: string | number;
  typeOfControlId?: string | number;
  nameDock?: string | null;
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
  idBindSelectiveDisciplines: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);

  // Modal Data
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [eduPrograms, setEduPrograms] = useState<any[]>([]);
  const [catalogYears, setCatalogYears] = useState<any[]>([]);
  const [controlTypes, setControlTypes] = useState<any[]>([]);
  const [approvalStatuses, setApprovalStatuses] = useState<any[]>([]);
  const [modalDataLoading, setModalDataLoading] = useState(false);

  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [selectedEduPrograms, setSelectedEduPrograms] = useState<number[]>([]);
  const [specSearch, setSpecSearch] = useState('');
  const [eduSearch, setEduSearch] = useState('');

  // Branches filter states
  const [branchSearch, setBranchSearch] = useState('');
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Dynamically extract Branches from Specialties list
  const branches = useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    specialties.forEach(spec => {
      if (spec.code && spec.code.length >= 2) {
        const code = spec.code.substring(0, 2);
        if (!map.has(code)) {
          map.set(code, {
            id: code,
            code: code,
            name: `${code} ${BRANCH_NAMES[code] || 'Галузь знань'}`
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [specialties]);

  // Compute selected branches based on selected specialties
  const selectedBranches = useMemo(() => {
    const selectedList: string[] = [];
    branches.forEach(branch => {
      const branchSpecs = specialties.filter(s => s.code && s.code.startsWith(branch.code));
      if (branchSpecs.length > 0 && branchSpecs.every(s => selectedSpecialties.includes(s.id))) {
        selectedList.push(branch.id);
      }
    });
    return selectedList;
  }, [branches, specialties, selectedSpecialties]);

  // Specialties with code prepended to name for cleaner display
  const specialtiesWithDisplayNames = useMemo(() => {
    return specialties.map(s => ({
      ...s,
      displayName: `${s.code} - ${s.name}`
    }));
  }, [specialties]);

  // Filter specialties list in the column by active branch
  const filteredSpecialtiesForColumn = useMemo(() => {
    if (!activeBranchId) return specialtiesWithDisplayNames;
    return specialtiesWithDisplayNames.filter(s => s.code && s.code.startsWith(activeBranchId));
  }, [specialtiesWithDisplayNames, activeBranchId]);

  const handleBranchToggle = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;

    const branchSpecs = specialties.filter(s => s.code && s.code.startsWith(branch.code));
    const branchSpecIds = branchSpecs.map(s => s.id);

    const isCurrentlySelected = selectedBranches.includes(branchId);
    if (isCurrentlySelected) {
      // Deselect all specialties in this branch
      setSelectedSpecialties(prev => prev.filter(id => !branchSpecIds.includes(id)));
    } else {
      // Select all specialties in this branch (avoiding duplicates)
      setSelectedSpecialties(prev => Array.from(new Set([...prev, ...branchSpecIds])));
    }
  };

  const handleActiveBranchChange = (branchId: string) => {
    setActiveBranchId(prev => prev === branchId ? null : branchId);
  };

  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Rejection Modal State
  const [studentToReject, setStudentToReject] = useState<Student | null>(null);
  const [rejectTemplate, setRejectTemplate] = useState('Власна причина');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Comparison Placeholder Modal State
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // New States for Approval/Rejection
  const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] = useState(false);
  const [isFinalRejectionModalOpen, setIsFinalRejectionModalOpen] = useState(false);
  const [disciplineRejectionReason, setDisciplineRejectionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleCompareClick = async () => {
    if (!discipline) return;

    if (discipline.nameDock) {
      try {
        const fileUrl = `http://localhost:5154/api/Import/selective-disciplines/file/${discipline.nameDock}`;
        window.open(fileUrl, '_blank');
      } catch (err) {
        console.error(err);
        alert('Помилка при відкритті документа');
      }
    } else {
      setIsApproveRejectModalOpen(true);
    }
  };

  const handleApproveDiscipline = async () => {
    if (!id || id === 'new') return;
    setIsActionLoading(true);
    try {
      const disciplineId = !isNaN(Number(id)) ? Number(id) : id;
      await apiService.put(`DisciplineTabAdmin/UpdateApprovalStatus/${disciplineId}`, {});
      setIsApproveRejectModalOpen(false);
      await fetchDiscipline();
    } catch (err: any) {
      console.error(err);
      alert('Помилка при підтвердженні');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFinalReject = async () => {
    setIsActionLoading(true);
    try {
      // Assuming a similar endpoint for rejection might exist or be needed
      // For now, we follow the UI flow requested
      console.log('Rejecting with reason:', disciplineRejectionReason);
      // In a real scenario, this would call an API like:
      // await apiService.put(`DisciplineTabAdmin/RejectDiscipline/${id}`, { reason: disciplineRejectionReason });
      
      setIsFinalRejectionModalOpen(false);
      setIsApproveRejectModalOpen(false);
      await fetchDiscipline();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchDiscipline = useCallback(async () => {
    if (id === 'new') {
      const emptyDiscipline: DisciplineDetails = {
        idSelectiveDisciplines: 0,
        nameSelectiveDisciplines: '',
        codeSelectiveDisciplines: '',
        facultyAbbreviation: '',
        facultyId: 0,
        minCountPeople: 0,
        maxCountPeople: 0,
        minCourse: 1,
        maxCourse: 4,
        isEven: 1,
        degreeLevelName: '',
        degreeLevelId: 0,
        departmentId: 0,
        departmentName: '',
        teacher: '',
        recomend: '',
        prerequisites: '',
        language: 'Українська',
        determination: '',
        whyInterestingDetermination: '',
        resultEducation: '',
        usingIrl: '',
        additionaLiterature: '',
        typesOfTraining: 'Лекції, семінарські заняття',
        typeOfControll: 'Диференційований залік',
        recommended: null,
        recomendationSpeciality: [],
        recomendationEducationalProgram: [],
        disciplineTopics: []
      };
      setDiscipline(emptyDiscipline);
      setEditForm({
        nameSelectiveDisciplines: '',
        codeSelectiveDisciplines: '',
        facultyId: '',
        minCountPeople: 0,
        maxCountPeople: 0,
        minCourse: 1,
        maxCourse: 4,
        isEven: 1,
        degreeLevelId: '',
        departmentId: '', // Moved to top level
        catalogId: '', // Should be filled from selection if possible
        approvalStatusId: '', // Default or selection
        typeOfControlId: '', // Default or selection
        details: {
          content: {
            nameSelectiveDisciplinesEng: '',
            teacher: '',
            recomend: '',
            prerequisites: '',
            language: 'Українська',
            provision: '',
            determination: '',
            whyInterestingDetermination: '',
            resultEducation: '',
            usingIrl: '',
            typesOfTraining: 'Лекції, семінарські заняття',
            typeOfControll: 'Диференційований залік'
          }
        },
        recomendationSpeciality: [],
        recomendationEducationalProgram: [],
        disciplineTopics: [],
        idSelectiveDisciplines: 0
      });
      setIsEditModalOpen(true);
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.get<DisciplineDetails>(`DisciplineTabStudent/GetDisciplineWithDetails/${id}?t=${Date.now()}`);
      setDiscipline(data);
      setSelectedSpecialties(data.recomendationSpeciality || []);
      setSelectedEduPrograms(data.recomendationEducationalProgram || []);
      setEditForm({
        nameSelectiveDisciplines: data.nameSelectiveDisciplines,
        codeSelectiveDisciplines: data.codeSelectiveDisciplines,
        facultyId: data.facultyId,
        minCountPeople: data.minCountPeople,
        maxCountPeople: data.maxCountPeople,
        minCourse: data.minCourse,
        maxCourse: data.maxCourse,
        isEven: data.isEven,
        degreeLevelId: data.degreeLevelId,
        departmentId: data.departmentId, // Moved to top level
        catalogId: data.catalogId,
        approvalStatusId: data.approvalStatusId,
        typeOfControlId: data.typeOfControlId,
        details: {
          content: {
            nameSelectiveDisciplinesEng: '', // Optional
            teacher: data.teacher,
            recomend: data.recomend,
            prerequisites: data.prerequisites,
            language: data.language,
            provision: data.additionaLiterature,
            determination: data.determination,
            whyInterestingDetermination: data.whyInterestingDetermination,
            resultEducation: data.resultEducation,
            usingIrl: data.usingIrl,
            typesOfTraining: data.typesOfTraining,
            typeOfControll: data.typeOfControll
          }
        },
        recomendationSpeciality: data.recomendationSpeciality || [],
        recomendationEducationalProgram: data.recomendationEducationalProgram || [],
        disciplineTopics: Array.isArray(data.disciplineTopics) 
          ? data.disciplineTopics 
          : (data.disciplineTopics ? (data.disciplineTopics as string).split('\n').filter(Boolean) : []),
        idSelectiveDisciplines: data.idSelectiveDisciplines
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchStudents = useCallback(async (page: number) => {
    if (id === 'new') return;
    setStudentsLoading(true);
    try {
      const data = await apiService.get<StudentResponse>(`DisciplineTabAdmin/GetStudentsBySelectiveDiscipline?DisciplineId=${id}&page=${page}&pageSize=20`);
      setStudents(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  }, [id]);

  const fetchFilters = useCallback(async () => {
    setModalDataLoading(true);
    try {
      const [facData, specData, eduData, depData, degData, catData, controlData, approvalData] = await Promise.all([
        apiService.get<any>('Faculty').catch(() => []),
        apiService.get<any>('Filter/specialities').catch(() => []),
        apiService.get<any>('Filter/educational-programs').catch(() => ({ items: [] })),
        apiService.get<any>('Department?page=1&pageSize=500&sortOrder=0').catch(() => ({ items: [] })),
        apiService.get<any>('EducationalDegree').catch(() => []),
        apiService.get<any>('Parameters/CatalogYearsSelective').catch(() => []),
        apiService.get<any>('Filter/TypeOfControl').catch(() => []),
        apiService.get<any>('Parameters/Approvals').catch(() => [])
      ]);

      const normalize = (data: any) => {
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
          return data.items || data.faculties || data.departments || data.degrees || [];
        }
        return [];
      };

      const normFacs = normalize(facData);
      const normSpecs = normalize(specData);
      const normEdu = normalize(eduData);
      const normDeps = normalize(depData);
      const normDegs = normalize(degData);
      const normCats = normalize(catData);
      const normControls = normalize(controlData);
      const normApprovals = normalize(approvalData);

      setFaculties(normFacs);
      setSpecialties(normSpecs);
      setEduPrograms(normEdu);
      setDepartments(normDeps);
      setDegrees(normDegs);
      setCatalogYears(normCats);
      setControlTypes(normControls);
      setApprovalStatuses(normApprovals);
      
      // If new, try to set some defaults
      if (id === 'new') {
        const defaultCatalogId = normCats.length > 0 ? normCats[0].idCatalogYear || normCats[0].id : '';
        
        // Find default Type of Control
        const defaultControl = normControls.find((c: any) => (c.type || c.nameTypeOfControl || c.name) === 'Диференційований залік');
        const defaultControlId = defaultControl ? (defaultControl.idTypeOfControl || defaultControl.id) : '';
        
        // Find default Approval Status (approvalLevel === 1)
        const defaultApproval = normApprovals.find((a: any) => a.approbalLevel === 1);
        const defaultApprovalId = defaultApproval ? (defaultApproval.idApproval || defaultApproval.id) : '';

        setEditForm((prev: any) => ({ 
          ...prev, 
          catalogId: defaultCatalogId,
          typeOfControlId: defaultControlId,
          approvalStatusId: defaultApprovalId
        }));
      }
    } catch (err) {
      console.error('Error in fetchFilters:', err);
    } finally {
      setModalDataLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDiscipline();
    fetchFilters();
    fetchStudents(1);
  }, [fetchDiscipline, fetchFilters, fetchStudents]);

  useEffect(() => {
    const checkCopy = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const copyFrom = searchParams.get('copyFrom');
      if (id === 'new' && copyFrom) {
        setLoading(true);
        try {
          const data = await apiService.get<DisciplineDetails>(`DisciplineTabStudent/GetDisciplineWithDetails/${copyFrom}?t=${Date.now()}`);
          
          // Append (1) or increment copy number
          let newName = data.nameSelectiveDisciplines;
          const match = newName.match(/\((\d+)\)$/);
          if (match) {
            const nextNum = parseInt(match[1]) + 1;
            newName = newName.replace(/\(\d+\)$/, `(${nextNum})`);
          } else {
            newName = `${newName} (1)`;
          }

          setDiscipline({
            ...data,
            nameSelectiveDisciplines: newName,
            idSelectiveDisciplines: 0 // Mark as new
          });

          setSelectedSpecialties(data.recomendationSpeciality || []);
          setSelectedEduPrograms(data.recomendationEducationalProgram || []);
          
          setEditForm({
            nameSelectiveDisciplines: newName,
            codeSelectiveDisciplines: data.codeSelectiveDisciplines,
            facultyId: data.facultyId,
            minCountPeople: data.minCountPeople,
            maxCountPeople: data.maxCountPeople,
            minCourse: data.minCourse,
            maxCourse: data.maxCourse,
            isEven: data.isEven,
            degreeLevelId: data.degreeLevelId,
            departmentId: data.departmentId,
            catalogId: data.catalogId,
            approvalStatusId: data.approvalStatusId,
            typeOfControlId: data.typeOfControlId,
            details: {
              content: {
                nameSelectiveDisciplinesEng: '',
                teacher: data.teacher,
                recomend: data.recomend,
                prerequisites: data.prerequisites,
                language: data.language,
                provision: data.additionaLiterature,
                determination: data.determination,
                whyInterestingDetermination: data.whyInterestingDetermination,
                resultEducation: data.resultEducation,
                usingIrl: data.usingIrl,
                typesOfTraining: data.typesOfTraining,
                typeOfControll: data.typeOfControll
              }
            },
            recomendationSpeciality: data.recomendationSpeciality || [],
            recomendationEducationalProgram: data.recomendationEducationalProgram || [],
            disciplineTopics: Array.isArray(data.disciplineTopics) 
              ? data.disciplineTopics 
              : (data.disciplineTopics ? (data.disciplineTopics as string).split('\n').filter(Boolean) : []),
            idSelectiveDisciplines: 0
          });
          setIsEditModalOpen(true);
        } catch (err: any) {
          console.error('Failed to copy discipline:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    checkCopy();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'students') fetchStudents(currentPage);
  }, [activeTab, currentPage, fetchStudents]);

  // Auto-fill missing IDs from names when filters are loaded
  useEffect(() => {
    if (id !== 'new' && discipline && !modalDataLoading && editForm) {
      setEditForm((prev: any) => {
        if (!prev) return prev;
        let updated = false;
        const next = { ...prev };

        // Fix Faculty
        if (!next.facultyId && discipline.facultyAbbreviation && faculties.length > 0) {
          const found = faculties.find(f => f.abbreviation === discipline.facultyAbbreviation || f.nameFaculty === discipline.facultyAbbreviation || f.name === discipline.facultyAbbreviation);
          if (found) {
            next.facultyId = found.idFaculty || found.id;
            updated = true;
          }
        }

        // Fix Department
        if (!next.departmentId && discipline.departmentName && departments.length > 0) {
          const found = departments.find(d => d.nameDepartment === discipline.departmentName || d.name === discipline.departmentName);
          if (found) {
            next.departmentId = found.idDepartment || found.id;
            updated = true;
          }
        }

        // Fix Degree Level
        if (!next.degreeLevelId && discipline.degreeLevelName && degrees.length > 0) {
          const found = degrees.find(d => d.nameEducationalDegree === discipline.degreeLevelName || d.name === discipline.degreeLevelName);
          if (found) {
            next.degreeLevelId = found.idEducationalDegree || found.id;
            updated = true;
          }
        }
        
        // Fix Type of Control ID if missing
        if (!next.typeOfControlId && discipline.typeOfControll && controlTypes.length > 0) {
           const found = controlTypes.find(c => (c.type || c.nameTypeOfControl || c.name) === discipline.typeOfControll);
           if (found) {
             next.typeOfControlId = found.idTypeOfControl || found.id;
             updated = true;
           }
        }

        return updated ? next : prev;
      });
    }
  }, [id, discipline, modalDataLoading, faculties, departments, degrees, controlTypes, editForm]);

  const handleUpdate = async () => {
    try {
      // Prepare payload to match the required structure
      const payload = {
        nameSelectiveDisciplines: editForm.nameSelectiveDisciplines,
        codeSelectiveDisciplines: editForm.codeSelectiveDisciplines,
        facultyId: editForm.facultyId,
        minCountPeople: editForm.minCountPeople || 0,
        maxCountPeople: editForm.maxCountPeople || 0,
        courses: [editForm.minCourse, editForm.maxCourse].filter(Boolean),
        isEven: editForm.isEven === 2, // true for Even (2), false for Odd (1)
        degreeLevelId: editForm.degreeLevelId,
        catalogId: (editForm.catalogId !== undefined && editForm.catalogId !== null && editForm.catalogId !== '') ? editForm.catalogId : "00000000-0000-0000-0000-000000000000",
        departmentId: (editForm.departmentId !== undefined && editForm.departmentId !== null && editForm.departmentId !== '') ? editForm.departmentId : "00000000-0000-0000-0000-000000000000",
        approvalStatusId: (editForm.approvalStatusId !== undefined && editForm.approvalStatusId !== null && editForm.approvalStatusId !== '') ? editForm.approvalStatusId : "00000000-0000-0000-0000-000000000000",
        typeOfControlId: (editForm.typeOfControlId !== undefined && editForm.typeOfControlId !== null && editForm.typeOfControlId !== '') ? editForm.typeOfControlId : "00000000-0000-0000-0000-000000000000",
        details: {
          content: {
            nameSelectiveDisciplinesEng: editForm.details.content.nameSelectiveDisciplinesEng || '',
            teacher: editForm.details.content.teacher,
            recommended: {
              branches: [],
              specialties: [],
              EducationalPrograms: []
            },
            prerequisites: editForm.details.content.prerequisites,
            language: editForm.details.content.language,
            provision: editForm.details.content.provision,
            determination: editForm.details.content.determination,
            disciplineTopics: Array.isArray(editForm.disciplineTopics) ? editForm.disciplineTopics : [],
            changedTopicIndices: [],
            whyInterestingDetermination: editForm.details.content.whyInterestingDetermination,
            resultEducation: editForm.details.content.resultEducation,
            usingIrl: editForm.details.content.usingIrl,
            typesOfTraining: editForm.details.content.typesOfTraining,
            typeOfControl: editForm.details.content.typeOfControll
          }
        },
        adminIds: [],
        recomendationBranches: selectedBranches,
        recomendationSpeciality: selectedSpecialties,
        recomendationEducationalProgram: selectedEduPrograms
      };

      if (id === 'new') {
        const response = await apiService.post<any>('DisciplineTabAdmin/CreateDisciplineWithDetails', payload);
        setIsEditModalOpen(false);
        // After creation, navigate to the new discipline's page
        if (response && (response.id || response.idSelectiveDisciplines)) {
          window.location.href = `/discipline/${response.id || response.idSelectiveDisciplines}`;
        } else {
          fetchDiscipline();
        }
      } else {
        const disciplineId = !isNaN(Number(id)) ? Number(id) : id;
        await apiService.put(`DisciplineTabAdmin/UpdateDisciplineWithDetails/${disciplineId}`, {
          ...payload,
          idSelectiveDisciplines: disciplineId
        });
        setIsEditModalOpen(false);
        fetchDiscipline();
      }
    } catch (err) {
      console.error(err);
      alert('Помилка при збереженні дисципліни');
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
      const data = await apiService.get<AvailableStudent[]>(`DisciplineTabAdmin/GetStudentsIncompleteAfterChoicePeriod?facultyId=${fId}`);
      setAvailableStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setAvailableLoading(false);
    }
  };

  const handleAddStudent = async (studentId: number) => {
    try {
      await apiService.post('DisciplineTabStudent/AddDisciplineBind', {
        studentId,
        disciplineId: discipline?.idSelectiveDisciplines,
        semestr: discipline?.isEven === 2 ? 1 : 0,
        loans: 0
      });
      setIsAddModalOpen(false);
      fetchStudents(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students;
    if (searchTerm) {
      result = result.filter(s => s.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (facultyFilter) {
      result = result.filter(s => s.faculty === facultyFilter);
    }
    if (departmentFilter) {
      result = result.filter(s => s.departmentName === departmentFilter);
    }
    if (groupFilter) {
      result = result.filter(s => s.groupCode === groupFilter);
    }
    return result;
  }, [students, searchTerm, facultyFilter, departmentFilter, groupFilter]);

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
    <div className="min-h-screen bg-[#f4f6f8] pb-12 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 pt-8 space-y-6">

        {/* Header Section */}
        <section className="bg-[#1e50f0] rounded-[32px] py-6 px-8 md:py-8 md:px-10 text-white shadow-xl relative">
          <div className="flex flex-col xl:flex-row justify-between gap-8 relative z-10">
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  {discipline.codeSelectiveDisciplines}
                </span>
                <span className="bg-[#10b981] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Набір відкрито
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {discipline.nameSelectiveDisciplines}
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

            <div className="flex flex-col md:flex-row items-center gap-6">
              <CircularProgress current={totalItems} total={discipline.maxCountPeople || 500} />

              <div className="flex flex-col gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsEditModalOpen(true)} className="flex-1 px-6 py-3 bg-white text-[#1e50f0] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                    Редагувати
                  </button>
                  <div className="relative group">
                    <button onClick={handleCompareClick} className="p-3 bg-white text-[#1e50f0] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center justify-center whitespace-nowrap" title="Порівняти дисципліну">
                      <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
                      Порівняти дисципліну
                      <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>

                <div className="flex bg-white/10 p-1 rounded-[14px] backdrop-blur-md w-full justify-between">
                  <button onClick={() => setActiveTab('details')} className={`flex-1 px-5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${activeTab === 'details' ? 'bg-white text-[#1e50f0] shadow-sm' : 'text-white hover:bg-white/10'}`}>Деталі курсу</button>
                  <button onClick={() => setActiveTab('students')} className={`flex-1 px-5 py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${activeTab === 'students' ? 'bg-white text-[#1e50f0] shadow-sm' : 'text-white hover:bg-white/10'}`}>Список студентів</button>
                </div>
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
                  <div className="space-y-2"><h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Чому важливо</h4><p className="text-[15px] font-bold text-gray-900 leading-relaxed">{discipline.whyInterestingDetermination}</p></div>
                </div>
              </DisciplineBlock>
            </div>

            <DisciplineBlock title="Перелік тем з дисципліни">
              <DisciplineTopicsBlock topics={discipline.disciplineTopics} />
            </DisciplineBlock>

            <DisciplineBlock title="Спеціальності">
              <DisciplineSpecialtiesBlock 
                specialtyIds={discipline.recomendationSpeciality || []} 
                eduProgramIds={discipline.recomendationEducationalProgram || []}
                specialtiesList={specialties}
                eduProgramsList={eduPrograms}
                recommended={discipline.recommended}
              />
            </DisciplineBlock>

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
            <div className="p-6 flex flex-col gap-4 bg-gray-50/50 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Зареєстровані студенти</h3>
                <button onClick={() => { setIsAddModalOpen(true); fetchAvailableStudents(); }}
                  className="bg-[#1e50f0] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  Додати в список
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200">
                <input 
                  type="text" 
                  placeholder="Пошук (ПІБ)..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1e50f0]/20 focus:border-[#1e50f0] outline-none transition-all"
                />
                <select 
                  value={facultyFilter} 
                  onChange={(e) => {
                    setFacultyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1e50f0]/20 focus:border-[#1e50f0] outline-none transition-all"
                >
                  <option value="">Усі факультети</option>
                  {Array.from(new Set(students.map(s => s.faculty))).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select 
                  value={departmentFilter} 
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1e50f0]/20 focus:border-[#1e50f0] outline-none transition-all"
                >
                  <option value="">Усі кафедри</option>
                  {Array.from(new Set(students.map(s => s.departmentName))).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={groupFilter} 
                  onChange={(e) => {
                    setGroupFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1e50f0]/20 focus:border-[#1e50f0] outline-none transition-all"
                >
                  <option value="">Усі групи</option>
                  {Array.from(new Set(students.map(s => s.groupCode))).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1e50f0] text-white">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">ПІБ студента</th>
                    <th className="px-4 py-3">Група</th>
                    <th className="px-4 py-3">Кафедра</th>
                    <th className="px-4 py-3">Рік</th>
                    <th className="px-4 py-3">Рівень освіти</th>
                    <th className="px-4 py-3">Факультет</th>
                    <th className="px-4 py-3 text-center">Відмова</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {studentsLoading ? <tr><td colSpan={7} className="p-12 text-center text-gray-400 animate-pulse font-medium">Завантаження даних...</td></tr> :
                    filteredStudents.length > 0 ? filteredStudents.map(s => (
                      <tr key={s.studentId} className="hover:bg-blue-50/30 transition-all group">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{s.studentName}</div>
                        </td>
                        <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold">{s.groupCode}</span></td>
                        <td className="px-4 py-3 text-gray-500 font-medium">{s.departmentName}</td>
                        <td className="px-4 py-3 font-bold text-gray-700">{s.year} курс</td>
                        <td className="px-4 py-3 text-gray-600 font-medium">{s.educationLevel}</td>
                        <td className="px-4 py-3 text-gray-500 font-medium">{s.faculty}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => { setStudentToReject(s); setRejectTemplate('Власна причина'); setRejectReason(''); setRejectError(null); }}
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} classSize="max-w-[820px]">
        <div className="relative p-[0px]">
          {/* Header */}
          <div className="bg-[#1e50f0] px-6 py-5 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold">Редагувати дисципліну</h2>
            <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-all duration-300">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="px-6 py-6 space-y-6 max-h-[72vh] overflow-y-auto bg-white">
            <div className="space-y-5">
              <ModalField label="Назва дисципліни" value={editForm?.nameSelectiveDisciplines} onChange={v => updateForm('nameSelectiveDisciplines', v)} required={true} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalField label="Код" value={editForm?.codeSelectiveDisciplines} onChange={v => updateForm('codeSelectiveDisciplines', v)} required={false} />
                <ModalField label="Кредити" value="4 бали" onChange={() => { }} placeholder="4 бали" />
              </div>

              <div className="pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.12em]">Основна інформація</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  <ModalField label="Факультет" value={editForm?.facultyId} type="select" options={faculties.map(f => ({ value: f.idFaculty || f.id, label: f.abbreviation || f.nameFaculty || f.name }))} onChange={v => updateForm('facultyId', v)} required={true} />
                  <SearchableSelect label="Кафедра" value={editForm?.departmentId} options={departments.map(d => ({ value: d.idDepartment || d.id, label: d.nameDepartment || d.name }))} onChange={v => updateForm('departmentId', v)} isLoading={modalDataLoading} required={true} />
                  <ModalField label="Рівень освіти" value={editForm?.degreeLevelId} type="select" options={degrees.map(d => ({ value: d.idEducationalDegree || d.id, label: d.nameEducationalDegree || d.name }))} onChange={v => updateForm('degreeLevelId', v)} required={true} />
                  <ModalField label="Каталог (Рік)" value={editForm?.catalogId} type="select" options={catalogYears.map(cat => ({ value: cat.idCatalogYear || cat.id, label: cat.nameCatalog || cat.name || cat.year }))} onChange={v => updateForm('catalogId', v)} required={true} />
                  <ModalField label="Викладач" value={editForm?.details?.content?.teacher} onChange={v => updateForm('details.content.teacher', v)} required={true} />
                  <ModalField label="Мова викладання" value={editForm?.details?.content?.language} type="select"
                    options={[{ value: 'Українська', label: 'Українська' }, { value: 'Англійська', label: 'Англійська' }, { value: 'Німецька', label: 'Німецька' }]}
                    onChange={v => updateForm('details.content.language', v)} />
                  <ModalField label="Тип контролю" value={editForm?.details?.content?.typeOfControll} type="select"
                    options={controlTypes.map(c => ({ value: c.type || c.nameTypeOfControl || c.name, label: c.type || c.nameTypeOfControl || c.name }))}
                    onChange={v => {
                      updateForm('details.content.typeOfControll', v);
                      const selected = controlTypes.find(c => (c.type || c.nameTypeOfControl || c.name) === v);
                      if (selected) {
                        updateForm('typeOfControlId', selected.idTypeOfControl || selected.id);
                      }
                    }} />
                  <ModalField label="Семестр" value={editForm?.isEven} type="number"
                    onChange={v => updateForm('isEven', Number(v))} />
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-[0.12em]">Опис дисципліни</h3>
                <div className="space-y-4">
                  <ModalField label="Визначення" type="textarea" value={editForm?.details?.content?.determination} onChange={v => updateForm('details.content.determination', v)} />
                  <ModalField label="Чому цікаво" type="textarea" value={editForm?.details?.content?.whyInterestingDetermination} onChange={v => updateForm('details.content.whyInterestingDetermination', v)} />
                  <ModalField label="Передумови" type="textarea" value={editForm?.details?.content?.prerequisites} onChange={v => updateForm('details.content.prerequisites', v)} />
                  <ModalField label="Результати навчання" type="textarea" value={editForm?.details?.content?.resultEducation} onChange={v => updateForm('details.content.resultEducation', v)} />
                  <ModalField label="Практичне застосування" type="textarea" value={editForm?.details?.content?.usingIrl} onChange={v => updateForm('details.content.usingIrl', v)} />
                  <InteractiveTopicsInput label="Перелік тем з дисципліни" topics={editForm?.disciplineTopics || []} onChange={v => updateForm('disciplineTopics', v)} />
                  <ModalField label="Вимоги" type="textarea" value={`Мінімальна кількість студентів: ${editForm?.minCountPeople || 0}. Рекомендована попередня підготовка.`} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex gap-3 bg-white">
            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">Скасувати</button>
            <button onClick={handleUpdate} className="flex-1 py-2.5 bg-[#1e50f0] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Зберегти зміни</button>
          </div>
        </div>
      </Modal>

      {/* Recommended Modal */}
      <Modal isOpen={isRecommendedModalOpen} onClose={() => setIsRecommendedModalOpen(false)} classSize="max-w-[1250px]">
        <div className="p-8 space-y-6 bg-white rounded-3xl">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Доступність дисципліни</h2>
            <button onClick={() => setIsRecommendedModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectionColumn title="Галузі" options={branches} selectedIds={selectedBranches}
              onToggle={handleBranchToggle} accessor="id" nameAccessor="name"
              searchTerm={branchSearch} onSearchChange={setBranchSearch} isLoading={modalDataLoading}
              activeId={activeBranchId} onActiveChange={handleActiveBranchChange} />
            <SelectionColumn title="Спеціальності" options={filteredSpecialtiesForColumn} selectedIds={selectedSpecialties}
              onToggle={id => setSelectedSpecialties(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              accessor="id" nameAccessor="displayName" searchTerm={specSearch} onSearchChange={setSpecSearch} isLoading={modalDataLoading} />
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
                    <button onClick={() => handleAddStudent(s.studentId)} className="bg-[#1e50f0] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">Додати</button>
                  </div>
                )) : <div className="p-12 text-center text-gray-400 italic">Студентів не знайдено</div>}
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal isOpen={!!studentToReject} onClose={() => setStudentToReject(null)} classSize="max-w-lg">
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Підтвердження відмови</h2>
            <button onClick={() => setStudentToReject(null)} className="hover:rotate-90 transition-all duration-300">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            <p className="text-[15px] font-medium text-gray-600 leading-relaxed">
              Ви дійсно хочете відмовити студенту <span className="font-bold text-gray-900">{studentToReject?.studentName}</span>?
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Шаблон причини відмови</label>
              <div className="relative">
                <select
                  value={rejectTemplate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRejectTemplate(val);
                    if (val === 'Власна причина') {
                      setRejectReason('');
                    } else {
                      setRejectReason(val);
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#f1f3f7] rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer text-[14px] font-bold text-gray-900"
                >
                  <option value="Власна причина">Власна причина</option>
                  <option value="Невідповідність вимогам до курсу">Невідповідність вимогам до курсу</option>
                  <option value="Група вже переповнена">Група вже переповнена</option>
                  <option value="Недостатньо кредитів / заборгованість">Недостатньо кредитів / заборгованість</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Причина відмови</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Введіть причину відмови..."
                className="w-full px-4 py-3 bg-[#f1f3f7] rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-[14px] font-bold text-gray-900 h-24 resize-none leading-relaxed placeholder:text-gray-400 placeholder:font-medium"
              />
            </div>

            {rejectError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">
                {rejectError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex gap-4 bg-gray-50/30">
            <button
              onClick={() => setStudentToReject(null)}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all bg-white"
              disabled={rejectSaving}
            >
              Скасувати
            </button>
            <button
              onClick={async () => {
                if (!studentToReject) return;
                setRejectSaving(true);
                setRejectError(null);
                try {
                  await apiService.put('DisciplineTabAdmin/UpdateChoice', [{
                    bindId: studentToReject.idBindSelectiveDisciplines,
                    isConfirm: 0 // 0 means reject
                  }]);
                  setStudentToReject(null);
                  fetchStudents(currentPage);
                } catch (err: any) {
                  setRejectError(err.message || 'Сталася помилка при збереженні');
                } finally {
                  setRejectSaving(false);
                }
              }}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              disabled={rejectSaving}
            >
              {rejectSaving ? 'Відхилення...' : 'Підтвердити відмову'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Compare Placeholder Modal */}
      <Modal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} classSize="max-w-md">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-[#1e50f0] rounded-full flex items-center justify-center mx-auto shadow-md">
            <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Порівняння дисциплін</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Цей функціонал знаходиться в розробці. Незабаром ви зможете порівнювати вибіркові дисципліни за різними параметрами!
            </p>
          </div>
          <button onClick={() => setIsCompareModalOpen(false)} className="w-full py-3 bg-[#1e50f0] text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
            Зрозуміло
          </button>
        </div>
      </Modal>

      {/* New Approval/Rejection Choice Modal */}
      <Modal isOpen={isApproveRejectModalOpen} onClose={() => setIsApproveRejectModalOpen(false)} classSize="max-w-md">
        <div className="p-8 text-center space-y-6 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-gray-900">Дія над дисципліною</h3>
          <p className="text-sm text-gray-500">Виберіть дію для цієї дисципліни, оскільки документ відсутній.</p>
          <div className="flex gap-4">
            <button 
              onClick={handleApproveDiscipline}
              disabled={isActionLoading}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all disabled:opacity-50"
            >
              Підтвердити
            </button>
            <button 
              onClick={() => {
                setIsApproveRejectModalOpen(false);
                setIsFinalRejectionModalOpen(true);
              }}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all"
            >
              Відхилити
            </button>
          </div>
        </div>
      </Modal>

      {/* Final Rejection with Reason Modal */}
      <Modal isOpen={isFinalRejectionModalOpen} onClose={() => setIsFinalRejectionModalOpen(false)} classSize="max-w-md">
        <div className="p-8 space-y-6 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-gray-900 text-center">Причина відмови</h3>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Вкажіть причину</label>
            <textarea
              value={disciplineRejectionReason}
              onChange={(e) => setDisciplineRejectionReason(e.target.value)}
              placeholder="Введіть причину відмови..."
              className="w-full px-4 py-3 bg-[#f1f3f7] rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-[15px] font-bold text-gray-900 h-32 resize-none"
            />
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleFinalReject}
              disabled={isActionLoading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all disabled:opacity-50"
            >
              Підтвердити та скасувати
            </button>
            <button 
              onClick={() => setIsFinalRejectionModalOpen(false)}
              className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Назад
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
