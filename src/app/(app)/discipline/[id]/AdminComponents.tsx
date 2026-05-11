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
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/10 backdrop-blur-[12px] border border-white/20 rounded-[24px] p-5 flex items-center gap-5 min-w-[220px] shadow-lg shadow-black/5">
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
          <circle cx="32" cy="32" r={radius} stroke="white" strokeWidth="6" fill="transparent"
            strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round"
            className="transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[11px] font-bold text-white leading-none">{current}</span>
          <div className="w-5 h-[1px] bg-white/20 my-1" />
          <span className="text-[11px] font-bold text-white/40 leading-none">{total}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-blue-100/70">Записано</span>
        <span className="text-[17px] font-bold text-white leading-tight mt-0.5 tracking-tight">{current} з {total}</span>
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
    <section className="bg-[#1e50f0] rounded-[40px] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(30,80,240,0.15)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-50px] w-[300px] h-[300px] bg-blue-400/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-3">
            <DisciplineBadge>{code}</DisciplineBadge>
            <DisciplineBadge variant="success">Набір відкрито</DisciplineBadge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl">
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

        <div className="flex flex-col items-center md:items-end justify-between gap-8 min-w-fit">
          <div className="flex items-center gap-4">
            {actions}
          </div>

          {progress && <CircularProgress current={progress.current} total={progress.total} />}

          {tabs && (
            <div className="flex bg-white/10 p-1.5 rounded-[20px] backdrop-blur-md border border-white/5">
              {tabs}
            </div>
          )}
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
  searchTerm, onSearchChange, isLoading
}: {
  title: string; options: any[]; selectedIds: number[];
  onToggle: (id: number) => void; accessor: string; nameAccessor: string;
  searchTerm: string; onSearchChange: (v: string) => void; isLoading: boolean;
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
          filtered.map((opt: any, i: number) => (
            <label key={`${opt[accessor]}-${i}`} className="flex items-center gap-3 p-3 hover:bg-blue-50/50 rounded-xl cursor-pointer transition-all group">
              <input type="checkbox" checked={selectedIds.includes(opt[accessor])}
                onChange={() => onToggle(opt[accessor])}
                className="w-4.5 h-4.5 text-[#1e50f0] border-gray-300 rounded-lg focus:ring-[#1e50f0] cursor-pointer transition-all" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#1e50f0] transition-colors line-clamp-2 leading-snug">
                {opt[nameAccessor]}
              </span>
            </label>
          ))
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
  const baseClass = "w-full px-4 py-3 bg-[#f1f3f7] rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[15px] font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[13px] font-bold text-gray-500 px-1 uppercase tracking-wider">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${baseClass} h-28 resize-none leading-relaxed`} />
      ) : type === 'select' && options ? (
        <div className="relative">
          <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${baseClass} appearance-none cursor-pointer`}>
            {options.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      ) : (
        <input type={type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={baseClass} />
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

