'use client'

import React, { useState, useEffect } from 'react'
import DataTable from '@/components/ui/DataTable'
import { apiService } from '@/services/axiosService'
import { Modal } from '@/components/ui/Modal'

interface Normative {
  idNormative: number
  count: number
  isFaculty: number
  degreeLevelId: number
  degreeLevelName: string
}

interface EducationStatus {
  idEducationStatus: number
  nameEducationStatus: string
}

interface TypeOfDiscipline {
    idTypeOfDiscipline: number
    typeName: string
}

interface EducationalDegree {
  idEducationalDegree: number
  nameEducationalDegreec: string
  studentsCount: number
}

interface StudyForm {
  idStudyForm: number
  nameStudyForm: string
}

interface NotificationTemplate {
  idNotificationTemplates: number
  notificationType: string
  title: string
  message: string
}

interface Role {
    idRole: number
    nameRole: string
    permissions?: string[]
}

interface Permission {
    idPermissions: number
    typePermission: string
    tableName: string
}

interface User {
    idUsers: number
    email: string
    roleName: string | string[] // Support multiple roles
    fullName?: string // Mocked
    lastLogin?: string // Mocked
    firstName?: string
    lastName?: string
    patronymic?: string
    roleId?: number | number[]
}

const Pagination: React.FC<{
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}> = ({ totalPages, currentPage, onPageChange }) => {
  const getPages = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 10) return Array.from({ length: totalPages }, (_, i) => i + 1)

    pages.push(1)
    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)

    return pages
  }

  return (
    <nav className="flex justify-center mt-4 space-x-2">
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={`w-10 h-10 rounded-lg font-bold transition ${currentPage === page
              ? 'bg-blue-600 text-white shadow-md'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )
      )}
    </nav>
  )
}

const ParametersPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('Нормативи')
  
  // States for different tabs
  const [normatives, setNormatives] = useState<Normative[]>([])
  const [eduStatuses, setEduStatuses] = useState<EducationStatus[]>([])
  const [typeOfDisciplines, setTypeOfDisciplines] = useState<TypeOfDiscipline[]>([])
  const [eduDegrees, setEduDegrees] = useState<EducationalDegree[]>([])
  const [studyForms, setStudyForms] = useState<StudyForm[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)

  // Pagination for Users
  const [currentPageUsers, setCurrentPageUsers] = useState(1)
  const itemsPerPage = 5

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [modalTarget, setModalTarget] = useState<'eduStatus' | 'eduDegree' | 'template' | 'role' | 'user' | 'typeOfDiscipline' | 'studyForm' | 'normative'>('eduStatus')
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentId, setCurrentId] = useState<number | null>(null)
  
  // Input fields for modals
  const [nameInput, setNameInput] = useState('') 
  const [countInput, setCountInput] = useState(0) // For Normatives
  const [templateInput, setTemplateInput] = useState({ type: '', title: '', message: '' })
  const [userInput, setUserInput] = useState({
      firstName: '',
      lastName: '',
      patronymic: '',
      email: '',
      roleId: 0 as number | number[],
      sendResetLink: false
  })
  
  // Permission modal specific
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [newPermissionInput, setNewPermissionInput] = useState('')
  const [rolePermissions, setRolePermissions] = useState<string[]>([])

  const menuItems = [
    'Нормативи',
    'Статус навчання',
    'Рівень освіти',
    'Шаблони повідомлень',
    'Ролі',
    'Користувачі',
  ]

  useEffect(() => {
    switch (activeSubTab) {
      case 'Нормативи': fetchNormatives(); break;
      case 'Статус навчання': fetchEducationStatuses(); fetchTypeOfDisciplines(); break;
      case 'Рівень освіти': fetchEducationalDegrees(); fetchStudyForms(); break;
      case 'Шаблони повідомлень': fetchTemplates(); break;
      case 'Ролі': fetchRoles(); fetchAllPermissions(); break;
      case 'Користувачі': fetchUsers(); fetchRoles(); break;
    }
  }, [activeSubTab])

  const fetchNormatives = async () => {
    setLoading(true)
    try {
      const data = await apiService.get<Normative[]>('Parameters/Normatives')
      setNormatives(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchEducationStatuses = async () => {
    setLoading(true)
    try {
      const data = await apiService.get<EducationStatus[]>('Parameters/EducationStatuses')
      setEduStatuses(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchTypeOfDisciplines = async () => {
      setLoading(true)
      try {
          const data = await apiService.get<TypeOfDiscipline[]>('Parameters/TypeOfDisciplines')
          setTypeOfDisciplines(data)
      } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchEducationalDegrees = async () => {
    setLoading(true)
    try {
      const data = await apiService.get<EducationalDegree[]>('Parameters/EducationalDegrees')
      setEduDegrees(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchStudyForms = async () => {
    setLoading(true)
    try {
      const data = await apiService.get<StudyForm[]>('Parameters/StudyForms')
      setStudyForms(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const data = await apiService.get<NotificationTemplate[]>('Parameters/NotificationTemplates')
      setTemplates(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const data = await apiService.get<Role[]>('Role')
      const mockRoles = data.map(r => {
          let perms = ['View Own Data']
          if (r.nameRole === 'Admin' || r.nameRole === 'Administrator') perms = ['Manage Users', 'Manage Roles', 'View Reports', 'Edit Parameters']
          if (r.nameRole === 'Manager') perms = ['Manage Users', 'View Reports']
          return { ...r, permissions: perms }
      })
      setRoles(mockRoles)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchUsers = async () => {
      setLoading(true)
      try {
          const data = await apiService.get<User[]>('User')
          const mockUsers = data.map((u, idx) => ({
              ...u,
              fullName: u.fullName || ['Іванов', 'Петров', 'Сидоров', 'Коваленко'][idx % 4] + ' ' + ['Іван', 'Петро', 'Олексій', 'Василь'][idx % 4] + ' ' + ['Іванович', 'Петрович', 'Сергійович', 'Борисович'][idx % 4],
              lastLogin: u.lastLogin || '2025-05-12 14:30',
              roleName: idx === 0 ? ['Admin', 'Manager'] : [u.roleName]
          }))
          setUsers(mockUsers)
      } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchAllPermissions = async () => {
    try {
        const data = await apiService.get<Permission[]>('Permission')
        setAllPermissions(data)
    } catch (error) { console.error(error) }
  }

  const handleOpenNormativeModal = (norm: Normative) => {
      setModalTarget('normative'); setModalMode('edit'); setCurrentId(norm.idNormative); setCountInput(norm.count); setIsModalOpen(true);
  }

  const handleOpenStatusModal = (mode: 'add' | 'edit', status?: EducationStatus) => {
    setModalTarget('eduStatus'); setModalMode(mode); setCurrentId(status?.idEducationStatus || null); setNameInput(status?.nameEducationStatus || ''); setIsModalOpen(true);
  }

  const handleOpenTypeOfDisciplineModal = (mode: 'add' | 'edit', type?: TypeOfDiscipline) => {
      setModalTarget('typeOfDiscipline'); setModalMode(mode); setCurrentId(type?.idTypeOfDiscipline || null); setNameInput(type?.typeName || ''); setIsModalOpen(true);
  }

  const handleOpenDegreeModal = (mode: 'add' | 'edit', degree?: EducationalDegree) => {
    setModalTarget('eduDegree'); setModalMode(mode); setCurrentId(degree?.idEducationalDegree || null); setNameInput(degree?.nameEducationalDegreec || ''); setIsModalOpen(true);
  }

  const handleOpenStudyFormModal = (mode: 'add' | 'edit', form?: StudyForm) => {
    setModalTarget('studyForm'); setModalMode(mode); setCurrentId(form?.idStudyForm || null); setNameInput(form?.nameStudyForm || ''); setIsModalOpen(true);
  }

  const handleOpenTemplateModal = (mode: 'add' | 'edit', template?: NotificationTemplate) => {
    setModalTarget('template'); setModalMode(mode); setCurrentId(template?.idNotificationTemplates || null); setTemplateInput({ type: template?.notificationType || '', title: template?.title || '', message: template?.message || '' }); setIsModalOpen(true);
  }

  const handleOpenRoleModal = (mode: 'add' | 'edit', role?: Role) => {
    setModalTarget('role'); setModalMode(mode); setCurrentId(role?.idRole || null); setNameInput(role?.nameRole || ''); setIsModalOpen(true);
  }

  const handleOpenUserModal = (mode: 'add' | 'edit', user?: User) => {
      setModalTarget('user')
      setModalMode(mode)
      setCurrentId(user?.idUsers || null)
      if (user) {
          const names = user.fullName?.split(' ') || ['', '', '']
          const rName = Array.isArray(user.roleName) ? user.roleName[0] : user.roleName
          setUserInput({
              firstName: names[1] || '',
              lastName: names[0] || '',
              patronymic: names[2] || '',
              email: user.email,
              roleId: roles.find(r => r.nameRole === rName)?.idRole || 0,
              sendResetLink: false
          })
      } else {
          setUserInput({ firstName: '', lastName: '', patronymic: '', email: '', roleId: 0, sendResetLink: false })
      }
      setIsModalOpen(true)
  }

  const handleOpenPermissionModal = (role: Role) => {
    setSelectedRole(role); setRolePermissions(role.permissions || []); setNewPermissionInput(''); setIsPermissionModalOpen(true);
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (modalTarget === 'eduStatus') {
        if (!nameInput.trim()) return
        if (modalMode === 'add') { await apiService.post('Parameters/CreateEducationStatus', [{ idEducationStatus: 0, nameEducationStatus: nameInput }]) }
        else { await apiService.put(`Parameters/UpdateEducationStatus/${currentId}`, [{ idEducationStatus: currentId, nameEducationStatus: nameInput }]) }
        fetchEducationStatuses()
      } else if (modalTarget === 'typeOfDiscipline') {
          if (!nameInput.trim()) return
          if (modalMode === 'add') { await apiService.post('Parameters/CreateTypeOfDiscipline', { typeName: nameInput }) }
          else { await apiService.put(`Parameters/UpdateTypeOfDiscipline/${currentId}`, { idTypeOfDiscipline: currentId, typeName: nameInput }) }
          fetchTypeOfDisciplines()
      } else if (modalTarget === 'eduDegree') {
        if (!nameInput.trim()) return
        if (modalMode === 'add') { await apiService.post('Parameters/CreateEducationalDegree', { nameEducationalDegreec: nameInput }) }
        else { await apiService.put(`Parameters/UpdateEducationalDegree/${currentId}`, { nameEducationalDegreec: nameInput, idEducationalDegree: currentId }) }
        fetchEducationalDegrees()
      } else if (modalTarget === 'studyForm') {
        if (!nameInput.trim()) return
        const payload = { idStudyForm: currentId || 0, nameStudyForm: nameInput }
        if (modalMode === 'add') { await apiService.post('Parameters/CreateStudyForm', payload) }
        else { await apiService.put(`Parameters/UpdateStudyForm/${currentId}`, payload) }
        fetchStudyForms()
      } else if (modalTarget === 'template') {
        const payload = { notificationType: templateInput.type, title: templateInput.title, message: templateInput.message }
        if (modalMode === 'add') { await apiService.post('Parameters/CreateNotificationTemplate', payload) }
        else { await apiService.put(`Parameters/UpdateNotificationTemplate/${currentId}`, payload) }
        fetchTemplates()
      } else if (modalTarget === 'role') {
          const payload = { idRole: currentId || 0, nameRole: nameInput }
          if (modalMode === 'add') { await apiService.post('Role', payload) }
          else { await apiService.put(`Role/${currentId}`, payload) }
          fetchRoles()
      } else if (modalTarget === 'user') {
          const payload = { email: userInput.email, password: 'password', roleId: userInput.roleId }
          if (modalMode === 'add') { console.log('Mock: Create user', payload) }
          else { await apiService.put(`User/${currentId}`, payload) }
          fetchUsers()
      } else if (modalTarget === 'normative') {
          const norm = normatives.find(n => n.idNormative === currentId)
          if (norm) {
              const payload = { idNormative: currentId, count: countInput, isFaculty: norm.isFaculty, degreeLevelId: norm.degreeLevelId }
              await apiService.put(`Parameters/UpdateNormative/${currentId}`, payload)
              fetchNormatives()
          }
      }
      setIsModalOpen(false)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }


  const handleAddPermission = () => {
    if (newPermissionInput.trim() && !rolePermissions.includes(newPermissionInput)) {
        setRolePermissions([...rolePermissions, newPermissionInput]); setNewPermissionInput('');
    }
  }

  const handleRemovePermission = (perm: string) => {
    setRolePermissions(rolePermissions.filter(p => p !== perm))
  }

  const handleSavePermissions = () => {
    setIsPermissionModalOpen(false)
  }

  // Pagination Logic for Users
  const totalPagesUsers = Math.ceil(users.length / itemsPerPage)
  const paginatedUsers = users.slice((currentPageUsers - 1) * itemsPerPage, currentPageUsers * itemsPerPage)

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#f4f6f8] font-sans">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">System Parameters</h2>
        </div>
        <nav className="flex-grow p-4 space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveSubTab(item)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeSubTab === item ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow p-4 lg:p-8 xl:p-10 2xl:p-12 overflow-auto">
        <div className="w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto space-y-8 transition-all duration-300">

          
          {activeSubTab === 'Нормативи' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Нормативи</h1>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable columns={[{ header: 'Norm ID', accessor: 'idNormative' }, { header: 'Standard Type', accessor: 'isFaculty', render: (r: any) => r.isFaculty === 1 ? 'Faculty' : 'General' }, { header: 'Education Level', accessor: 'degreeLevelName' }, { header: 'Minimum Student Count', accessor: 'count' }] as any} data={normatives} isActionEnabled={true} onEdit={(n) => handleOpenNormativeModal(n as Normative)} emptyMessage={loading ? 'Завантаження...' : 'Нормативів не знайдено'} />
                </div>
            </div>
          )}

          {activeSubTab === 'Статус навчання' && (
            <div className="space-y-12">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Статус навчання</h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <DataTable columns={[{ header: 'Status ID', accessor: 'idEducationStatus' }, { header: 'Status Name', accessor: 'nameEducationStatus' }] as any} data={eduStatuses} isActionEnabled={true} onEdit={(s) => handleOpenStatusModal('edit', s)} emptyMessage={loading ? 'Завантаження...' : 'Статусів не знайдено'} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Статус набору дисциплін</h2>
                        <button onClick={() => handleOpenTypeOfDisciplineModal('add')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2"><span className="text-xl">+</span> Add Status</button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <DataTable columns={[{ header: 'Status ID', accessor: 'idTypeOfDiscipline' }, { header: 'Status Description', accessor: 'typeName' }] as any} data={typeOfDisciplines} isActionEnabled={true} showDeleteAction={false} onEdit={(t) => handleOpenTypeOfDisciplineModal('edit', t)} emptyMessage="Статусів не знайдено" />
                    </div>
                </div>
            </div>
          )}

          {activeSubTab === 'Рівень освіти' && (
            <div className="space-y-12">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Рівень освіти</h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <DataTable columns={[{ header: 'Level ID', accessor: 'idEducationalDegree' }, { header: 'Level Name', accessor: 'nameEducationalDegreec' }] as any} data={eduDegrees} isActionEnabled={true} showDeleteAction={false} onEdit={(d) => handleOpenDegreeModal('edit', d)} emptyMessage={loading ? 'Завантаження...' : 'Рівнів не знайдено'} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Форма навчання</h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <DataTable columns={[{ header: 'Mode ID', accessor: 'idStudyForm' }, { header: 'Mode Name', accessor: 'nameStudyForm' }] as any} data={studyForms} isActionEnabled={true} showDeleteAction={false} onEdit={(s) => handleOpenStudyFormModal('edit', s)} emptyMessage="Не знайдено" />
                    </div>
                </div>
            </div>
          )}

          {activeSubTab === 'Шаблони повідомлень' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Шаблони повідомлень</h1>
                    <button onClick={() => handleOpenTemplateModal('add')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2"><span className="text-xl">+</span> Add Template</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable columns={[{ header: 'Template ID', accessor: 'idNotificationTemplates' }, { header: 'Type', accessor: 'notificationType' }, { header: 'Title', accessor: 'title' }, { header: 'Message', accessor: 'message' }] as any} data={templates} isActionEnabled={true} showDeleteAction={false} onEdit={(t) => handleOpenTemplateModal('edit', t)} emptyMessage={loading ? 'Завантаження...' : 'Шаблонів не знайдено'} />
                </div>
            </div>
          )}

          {activeSubTab === 'Ролі' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Ролі</h1>
                    <button onClick={() => handleOpenRoleModal('add')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2"><span className="text-xl">+</span> Add Role</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable 
                        columns={[{ header: 'Number', accessor: 'idRole', render: (_: any, idx: number) => idx + 1 }, { header: 'Role Name', accessor: 'nameRole' }, { header: 'Permissions', accessor: 'permissions', render: (row: Role) => (<div className="flex flex-wrap gap-1">{row.permissions?.map((p, i) => (<span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{p}</span>))}</div>) }] as any} 
                        data={roles} 
                        isActionEnabled={true} 
                        showDeleteAction={false}
                        onEdit={(r) => handleOpenRoleModal('edit', r as Role)} 
                        onManagePermissions={(r) => handleOpenPermissionModal(r as Role)}
                        emptyMessage={loading ? 'Завантаження...' : 'Ролей не знайдено'} 
                    />
                </div>
            </div>
          )}

          {activeSubTab === 'Користувачі' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Користувачі</h1>
                    <button onClick={() => handleOpenUserModal('add')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition active:scale-95 flex items-center gap-2"><span className="text-xl">+</span> Add User</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable 
                        columns={[
                            { header: 'Number', accessor: 'idUsers', render: (_: any, idx: number) => (currentPageUsers - 1) * itemsPerPage + idx + 1 }, 
                            { header: 'ПІБ', accessor: 'fullName' }, 
                            { header: 'Email', accessor: 'email' }, 
                            { 
                                header: 'Role', 
                                accessor: 'roleName',
                                render: (row: User) => (
                                    <div className="flex flex-wrap gap-1">
                                        {Array.isArray(row.roleName) 
                                            ? row.roleName.map((r, i) => <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold border border-blue-100">{r}</span>)
                                            : <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold border border-blue-100">{row.roleName}</span>
                                        }
                                    </div>
                                )
                            }, 
                            { header: 'Last Login', accessor: 'lastLogin' }
                        ] as any} 
                        data={paginatedUsers} 
                        isActionEnabled={true} 
                        onEdit={(u) => handleOpenUserModal('edit', u as User)} 
                        onDelete={(u) => console.log('Mock Delete user', u)} 
                        emptyMessage={loading ? 'Завантаження...' : 'Користувачів не знайдено'} 
                    />
                    {totalPagesUsers > 1 && (
                        <div className="p-6 border-t border-gray-100">
                            <Pagination 
                                totalPages={totalPagesUsers} 
                                currentPage={currentPageUsers} 
                                onPageChange={setCurrentPageUsers} 
                            />
                        </div>
                    )}
                </div>
            </div>
          )}

          {!menuItems.includes(activeSubTab) && (
            <div className="p-20 text-center text-gray-400 italic bg-white rounded-xl shadow-sm border border-gray-200"> Контент для "{activeSubTab}" знаходиться в розробці </div>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
                {modalTarget === 'eduStatus' ? (modalMode === 'add' ? 'Add Study Status' : 'Edit Study Status') : 
                 modalTarget === 'typeOfDiscipline' ? (modalMode === 'add' ? 'Add Status' : 'Edit Status') :
                 modalTarget === 'eduDegree' ? 'Edit Education Level' :
                 modalTarget === 'studyForm' ? (modalMode === 'add' ? 'Add Study Form' : 'Edit Study Form') :
                 modalTarget === 'role' ? (modalMode === 'add' ? 'Add New Role' : 'Edit Role') :
                 modalTarget === 'user' ? (modalMode === 'add' ? 'Add New User' : 'Edit User') :
                 modalTarget === 'normative' ? 'Edit Normative' :
                 (modalMode === 'add' ? 'Add Template' : 'Edit Template')}
            </h3>
            <div className="space-y-4">
                {modalTarget === 'user' ? (
                    <>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm font-semibold text-gray-700">First Name</label><input type="text" placeholder="Enter first name" value={userInput.firstName} onChange={(e) => setUserInput({...userInput, firstName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div><div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Last Name</label><input type="text" placeholder="Enter last name" value={userInput.lastName} onChange={(e) => setUserInput({...userInput, lastName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div></div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Patronymic</label><input type="text" placeholder="Enter patronymic" value={userInput.patronymic} onChange={(e) => setUserInput({...userInput, patronymic: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Email</label><input type="email" placeholder="Enter email" value={userInput.email} onChange={(e) => setUserInput({...userInput, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Role</label><select value={Array.isArray(userInput.roleId) ? userInput.roleId[0] : userInput.roleId} onChange={(e) => setUserInput({...userInput, roleId: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"><option value={0}>Select role</option>{roles.map(r => <option key={r.idRole} value={r.idRole}>{r.nameRole}</option>)}</select></div>
                        {modalMode === 'edit' && (<div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 border border-blue-100"><div className="text-blue-500"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div><label className="flex items-center gap-2 cursor-pointer flex-grow"><input type="checkbox" checked={userInput.sendResetLink} onChange={(e) => setUserInput({...userInput, sendResetLink: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span className="text-sm font-medium text-blue-700">Send password reset link to user's email</span></label></div>)}
                    </>
                ) : modalTarget === 'template' ? (
                    <>
                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Notification Type</label><input type="text" placeholder="Enter notification type" value={templateInput.type} onChange={(e) => setTemplateInput({...templateInput, type: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Title</label><input type="text" placeholder="Enter title" value={templateInput.title} onChange={(e) => setTemplateInput({...templateInput, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">Message</label><textarea placeholder="Enter message" value={templateInput.message} onChange={(e) => setTemplateInput({...templateInput, message: e.target.value})} rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" /></div>
                    </>
                ) : modalTarget === 'normative' ? (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Minimum Student Count</label>
                        <input type="number" value={countInput} onChange={(e) => setCountInput(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{modalTarget === 'role' ? 'Role Name' : (modalTarget === 'typeOfDiscipline' ? 'Status Name' : (modalTarget === 'eduStatus' ? 'Status Name' : (modalTarget === 'studyForm' ? 'Form Name' : 'Level Name')))}</label>
                        <input type="text" placeholder={`Enter name`} value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        {modalTarget === 'role' && modalMode === 'add' && (<p className="text-xs text-gray-400 mt-1">After creating the role, use the shield button to manage permissions.</p>)}
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition">
                    {modalTarget === 'user' ? (modalMode === 'add' ? 'Add User' : 'Save Changes') : modalTarget === 'template' ? 'Save Template' : (modalMode === 'add' ? (modalTarget === 'role' ? 'Add Role' : 'Add') : 'Save Changes')}
                </button>
            </div>
        </div>
      </Modal>

      <Modal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} classSize="max-w-2xl">
        <div className="space-y-6">
            <div className="relative">
                <h3 className="text-xl font-bold text-gray-900">Manage Permissions - {selectedRole?.nameRole}</h3>
                <p className="text-sm text-gray-400 mt-0.5">Add or remove permissions for this role</p>
                <button onClick={() => setIsPermissionModalOpen(false)} className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900">Add New Permission</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter permission name" 
                        value={newPermissionInput} 
                        onChange={(e) => setNewPermissionInput(e.target.value)} 
                        className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    />
                    <button 
                        onClick={handleAddPermission} 
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        + Add
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900">Current Permissions ({rolePermissions.length})</label>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {rolePermissions.map((perm, idx) => (
                            <div key={idx} className="flex justify-between items-center px-4 py-3.5 group hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-400">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    </div>
                                    <span className="text-gray-700 font-medium">{perm}</span>
                                </div>
                                <button 
                                    onClick={() => handleRemovePermission(perm)} 
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                        {rolePermissions.length === 0 && (
                            <div className="text-gray-400 italic text-sm py-12 text-center">
                                No permissions assigned to this role.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button 
                    onClick={() => setIsPermissionModalOpen(false)} 
                    className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                    Close
                </button>
                <button 
                    onClick={handleSavePermissions} 
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition"
                >
                    Save Permissions
                </button>
            </div>
        </div>
      </Modal>
    </div>
  )
}

export default ParametersPage
