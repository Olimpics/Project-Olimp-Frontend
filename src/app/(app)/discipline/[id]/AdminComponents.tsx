"use client"
import React from 'react';

// ─── Discipline Badge ───
export const DisciplineBadge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' }) => {
  const variants = {
    default: "bg-white/20 backdrop-blur-md text-white border border-white/10",
    success: "bg-[#10b981] text-white shadow-sm shadow-green-900/20"
  };

  return (
    <span className={`${variants[variant]} px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all`}>
      {children}
    </span>
  );
};

// ─── Circular Progress ───
export const CircularProgress = ({ current, total }: { current: number; total: number }) => {
  const percentage = Math.min((current / total) * 100, 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/10 backdrop-blur-[12px] border border-white/20 rounded-[24px] p-4 flex items-center gap-4 min-w-[250px] shadow-lg shadow-black/5">
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle cx="28" cy="28" r={radius} stroke="rgba(255,255,255,0.15)" strokeWidth="5" fill="transparent" />
          <circle cx="28" cy="28" r={radius} stroke="white" strokeWidth="5" fill="transparent"
            strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round"
            className="transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[10px] font-bold text-white leading-none">{current}</span>
          <div className="w-4 h-[1px] bg-white/20 my-0.5" />
          <span className="text-[10px] font-bold text-white/40 leading-none">{total}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-medium text-blue-100/70">Записано</span>
        <span className="text-[16px] font-bold text-white leading-tight mt-0.5 tracking-tight">{current} з {total}</span>
      </div>
    </div>
  );
};

// ─── Discipline Header ───
interface DisciplineHeaderProps {
  code: string;
  name: string;
  details: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
  progress?: { current: number; total: number };
  tabs?: React.ReactNode;
}

export const DisciplineHeader = ({ code, name, details, actions, progress, tabs }: DisciplineHeaderProps) => {
  return (
    <section className="bg-[#1e50f0] rounded-[40px] py-6 px-8 md:py-8 md:px-12 text-white shadow-[0_20px_50px_rgba(30,80,240,0.15)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-50px] w-[300px] h-[300px] bg-blue-400/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col xl:flex-row justify-between gap-10 relative z-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <DisciplineBadge>{code}</DisciplineBadge>
            <DisciplineBadge variant="success">Набір відкрито</DisciplineBadge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] max-w-3xl">
            {name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] font-medium text-blue-100/80">
            {details.map((detail, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2">
                  {detail.label}: <span className="text-white font-bold">{detail.value}</span>
                </div>
                {idx < details.length - 1 && <span className="hidden sm:block opacity-20">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-4 md:w-auto xl:self-start xl:items-end xl:pt-3">
          {actions && (
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3 xl:justify-end">
                {actions}
              </div>

              {tabs && (
                <div className="flex bg-white/10 p-1.5 rounded-[20px] backdrop-blur-md border border-white/5 w-full justify-between">
                  {tabs}
                </div>
              )}
            </div>
          )}

          {!actions && tabs && (
            <div className="flex bg-white/10 p-1.5 rounded-[20px] backdrop-blur-md border border-white/5 w-full justify-between">
              {tabs}
            </div>
          )}

          {progress && <CircularProgress current={progress.current} total={progress.total} />}
        </div>
      </div>
    </section>
  );
};

// ─── Pagination ───
export const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ totalPages, currentPage, onPageChange }) => {
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 16) return Array.from({ length: totalPages }, (_, i) => i + 1);
    pages.push(1);
    if (currentPage > 4) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav className="flex justify-center mt-4 space-x-2">
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2">...</span>
        ) : (
          <button key={page} onClick={() => onPageChange(Number(page))}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${currentPage === page
              ? 'bg-[#1e50f0] text-white shadow-lg shadow-blue-500/25'
              : 'bg-white text-[#1e50f0] border border-gray-100 hover:bg-blue-50'}`}>
            {page}
          </button>
        )
      )}
    </nav>
  );
};

// ─── Selection Column (for Recommended modal) ───
export const SelectionColumn = ({
  title, options, selectedIds, onToggle, accessor, nameAccessor,
  searchTerm, onSearchChange, isLoading, activeId, onActiveChange
}: {
  title: string; options: any[]; selectedIds: any[];
  onToggle: (id: any) => void; accessor: string; nameAccessor: string;
  searchTerm: string; onSearchChange: (v: string) => void; isLoading: boolean;
  activeId?: any; onActiveChange?: (id: any) => void;
}) => {
  const filtered = options.filter((opt: any) =>
    String(opt[nameAccessor] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-5 bg-gray-50/50 border-b border-gray-100">
        <h4 className="text-[15px] font-bold text-gray-900 mb-3">{title}</h4>
        <div className="relative">
          <input type="text" placeholder="Пошук..." value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-[12px] text-gray-400 mt-2 font-medium">Обрано: {selectedIds.length}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((opt: any, i: number) => {
            const isSelected = selectedIds.includes(opt[accessor]);
            const isActive = activeId !== undefined && activeId === opt[accessor];
            return (
              <div key={`${opt[accessor]}-${i}`}
                onClick={() => onActiveChange && onActiveChange(opt[accessor])}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all group ${
                  isActive ? 'bg-blue-50 border border-blue-100/50' : 'hover:bg-blue-50/30 border border-transparent'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={isSelected}
                    onChange={() => onToggle(opt[accessor])}
                    className="w-4.5 h-4.5 text-[#1e50f0] border-gray-300 rounded-lg focus:ring-[#1e50f0] cursor-pointer transition-all" />
                  <span className={`text-sm font-medium transition-colors line-clamp-2 leading-snug ${
                    isActive ? 'text-[#1e50f0] font-bold' : 'text-gray-700 group-hover:text-[#1e50f0]'
                  }`}>
                    {opt[nameAccessor]}
                  </span>
                </label>
                {onActiveChange && (
                  <svg className={`w-4 h-4 transition-all shrink-0 ${
                    isActive ? 'text-[#1e50f0] translate-x-0' : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-sm text-gray-400 italic">Нічого не знайдено</div>
        )}
      </div>
    </div>
  );
};

// ─── InfoBlock (view mode) ───
export function InfoBlock({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center pr-2 min-h-[18px]">
        <span className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
        {children}
      </div>
      <span className="text-[16px] font-bold text-gray-900 leading-tight">
        {value || (children ? '' : 'Не вказано')}
      </span>
    </div>
  );
}

// ─── EditableField (edit mode) ───
export function EditableField({
  label, value, onChange, type = 'input', options, placeholder
}: {
  label: string; value: string | number | null;
  onChange: (val: string) => void;
  type?: 'input' | 'textarea' | 'select' | 'number';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}) {
  const baseClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 bg-gray-50/50 placeholder:text-gray-400 placeholder:font-medium";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-gray-400 px-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${baseClass} h-32 resize-none leading-relaxed`} />
      ) : type === 'select' && options ? (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={baseClass}>
          <option value="">Оберіть значення</option>
          {options.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'number' ? (
        <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={baseClass} />
      ) : (
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={baseClass} />
      )}
    </div>
  );
}

// ─── ModalField (for Edit Modal) ───
export function ModalField({
  label, value, onChange, type = 'input', options, placeholder, className = ""
}: {
  label: string; value: string | number | null;
  onChange: (val: string) => void;
  type?: 'input' | 'textarea' | 'select' | 'number';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const baseClass = "w-full min-w-0 px-3.5 py-2.5 bg-[#f1f3f7] rounded-xl border border-transparent focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-100 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium";

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-bold text-gray-500 px-1 uppercase tracking-[0.12em]">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${baseClass} h-24 resize-y leading-relaxed`} />
      ) : type === 'select' && options ? (
        <div className="relative">
          <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${baseClass} appearance-none cursor-pointer pr-10`}>
            <option value="">Оберіть...</option>
            {options.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      ) : (
        <input type={type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={baseClass} />
      )}
    </div>
  );
}

// ─── SearchableSelect (for Edit Modal) ───
export function SearchableSelect({
  label, value, onChange, options, placeholder, isLoading
}: {
  label: string; value: string | number | null;
  onChange: (val: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-[11px] font-bold text-gray-500 px-1 uppercase tracking-[0.12em]">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-[#f1f3f7] rounded-xl border border-transparent cursor-pointer flex justify-between items-center transition-all hover:bg-[#e8eaef]"
      >
        <span className={`text-sm font-semibold truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder || 'Оберіть...'}
        </span>
        <svg className={`w-4.5 h-4.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-3 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="Пошук..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600" />
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div
                  key={`${opt.value}-${i}`}
                  onClick={() => {
                    onChange(String(opt.value));
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                    value === opt.value ? 'bg-blue-50 text-[#1e50f0] font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400 italic">Нічого не знайдено</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Discipline Card/Block ───
export const DisciplineBlock = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 flex flex-col ${className}`}>
    <h3 className="text-[22px] font-bold text-gray-900 mb-8 tracking-tight">{title}</h3>
    {children}
  </div>
);

// ─── Discipline Topics/Themes Block ───
export const DisciplineTopicsBlock = ({ topics }: { topics: string | string[] }) => {
  if (!topics || (Array.isArray(topics) && topics.length === 0)) {
    return <p className="text-gray-400 italic font-medium">Не вказано</p>;
  }

  const lines = Array.isArray(topics) 
    ? topics.map(line => line.trim()).filter(Boolean)
    : topics.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length === 0) return <p className="text-gray-400 italic font-medium">Не вказано</p>;

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const match = line.match(/^(Тема\s+\d+[\.:]?|Theme\s+\d+[\.:]?|\d+[\.:])\s*(.*)$/i);
        if (match) {
          return (
            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50/70 rounded-2xl border border-gray-100/80 hover:bg-blue-50/20 transition-all duration-200">
              <span className="bg-[#1e50f0]/10 text-[#1e50f0] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
                {match[1].replace(/[\.:]$/, '')}
              </span>
              <span className="text-[15px] font-bold text-gray-900 leading-relaxed pt-0.5">
                {match[2]}
              </span>
            </div>
          );
        }
        return (
          <div key={index} className="flex gap-3 items-start p-4 bg-gray-50/70 rounded-2xl border border-gray-100/80 hover:bg-blue-50/20 transition-all duration-200">
            <span className="w-2 h-2 rounded-full bg-[#1e50f0] mt-2 shrink-0 shadow-sm" />
            <span className="text-[15px] font-bold text-gray-900 leading-relaxed">
              {line}
            </span>
          </div>
        );
      })}
    </div>
  );
};

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

// ─── Discipline Specialties Block ───
export const DisciplineSpecialtiesBlock = ({ 
  specialtyIds, 
  eduProgramIds, 
  specialtiesList, 
  eduProgramsList,
  recommended
}: { 
  specialtyIds: number[]; 
  eduProgramIds: number[]; 
  specialtiesList: any[]; 
  eduProgramsList: any[]; 
  recommended?: string | null;
}) => {
  const parsedRecommended = React.useMemo(() => {
    if (!recommended) return null;
    try {
      // Handle both string and object just in case
      if (typeof recommended === 'object') return recommended;
      return JSON.parse(recommended);
    } catch (e) {
      console.error("Failed to parse recommended JSON", e);
      return null;
    }
  }, [recommended]);

  // Extract and group unique branches based on selected specialties (fallback logic)
  const selectedSpecs = specialtyIds
    .map(id => specialtiesList.find(s => s.id === id))
    .filter(Boolean);

  const selectedBranches = React.useMemo(() => {
    const codes = Array.from(
      new Set(
        selectedSpecs
          .map(s => (s.code && s.code.length >= 2 ? s.code.substring(0, 2) : ''))
          .filter(Boolean)
      )
    );
    return codes
      .map(code => ({
        code,
        name: BRANCH_NAMES[code] || `Галузь знань ${code}`
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [selectedSpecs]);

  const branchesToDisplay = parsedRecommended?.branches || selectedBranches.map(b => `${b.code} - ${b.name}`);
  const specialtiesToDisplay = parsedRecommended?.specialties || specialtyIds.map(id => {
    const spec = specialtiesList.find(s => s.id === id);
    return spec ? `${spec.code} - ${spec.name}` : id.toString();
  });
  const eduProgramsToDisplay = parsedRecommended?.EducationalPrograms || eduProgramIds.map(id => {
    const edu = eduProgramsList.find(e => e.id === id);
    return edu ? edu.name : id.toString();
  });

  return (
    <div className="space-y-8">
      {/* 1. Галузі знань */}
      <div className="space-y-3">
        <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Галузі знань</h4>
        {branchesToDisplay.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {branchesToDisplay.map((branch: string, index: number) => (
              <span key={index} className="bg-purple-50 text-purple-600 px-3.5 py-1.5 rounded-xl text-[13px] font-bold border border-purple-100 shadow-sm animate-fade-in">
                {branch}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-gray-500 font-medium bg-gray-50/70 px-4 py-2.5 rounded-xl border border-gray-100/80">Для всіх галузей знань</p>
        )}
      </div>

      {/* 2. Спеціальності */}
      <div className="space-y-3">
        <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Спеціальності</h4>
        {specialtiesToDisplay.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specialtiesToDisplay.map((spec: string, index: number) => (
              <span key={index} className="bg-blue-50 text-[#1e50f0] px-3.5 py-1.5 rounded-xl text-[13px] font-bold border border-blue-100 shadow-sm">
                {spec}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-gray-500 font-medium bg-gray-50/70 px-4 py-2.5 rounded-xl border border-gray-100/80">Для всіх спеціальностей</p>
        )}
      </div>

      {/* 3. Освітні програми */}
      <div className="space-y-3">
        <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-tight">Освітні програми</h4>
        {eduProgramsToDisplay.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {eduProgramsToDisplay.map((edu: string, index: number) => (
              <span key={index} className="bg-[#10b981]/10 text-[#10b981] px-3.5 py-1.5 rounded-xl text-[13px] font-bold border border-[#10b981]/20 shadow-sm">
                {edu}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-gray-500 font-medium bg-gray-50/70 px-4 py-2.5 rounded-xl border border-gray-100/80">Для всіх освітніх програм</p>
        )}
      </div>
    </div>
  );
};
