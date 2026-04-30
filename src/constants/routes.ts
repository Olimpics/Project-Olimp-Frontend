export const ROUTES = {
  cabinet: '/cabinet',
  catalogue: '/catalogue',
  courseCatalogue: '/course-catalogue',
  disciplines: '/disciplines',
  mainpage: '/',
  stud_catalogue: '/stud_disciplines_catalogue',
  notifications: '/notifications',
  periods: '/periods',
  parameters: '/parameters',
  additionalScores: '/additional-scores',
  archiveScores: '/archive-scores',

  // ADMIN CATALOGUES
  adminCatalogue: '/catalogue',
  adminBoundedCatalogue: '/catalogue/admin_catalogues/bind-loans',
  adminDepartmentsCatalogue: '/catalogue/admin_catalogues/departments',
  adminFacultyCatalogue: '/catalogue/admin_catalogues/faculties',
  adminEduProgCatalogue: '/catalogue/admin_catalogues/edu-programs',
  adminStudentsCatalogue: '/catalogue/admin_catalogues/students',
  adminUnGroups: '/catalogue/admin_catalogues/groups',
  adminGroupDetails: (id: string | number) => `/catalogue/admin_catalogues/groups/${id}`,
}