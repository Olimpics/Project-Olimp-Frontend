"use client"
import React from 'react';

// ─── Circular Progress ───
export const CircularProgress = ({ current, total }: { current: number; total: number }) => {
  const percentage = Math.min((current / total) * 100, 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 min-w-[200px]">
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle cx="28" cy="28" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="5" fill="transparent" />
          <circle cx="28" cy="28" r={radius} stroke="white" strokeWidth="5" fill="transparent"
            strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round"
            className="transition-all duration-500 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[10px] font-bold text-white leading-none">{current}</span>
          <div className="w-4 h-[1px] bg-white/30 my-0.5" />
          <span className="text-[10px] font-bold text-white/50 leading-none">{total}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-blue-100">Записано</span>
        <span className="text-sm font-bold text-white leading-none mt-1">{current} з {total}</span>
      </div>
    </div>
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
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === page
              ? 'bg-[#1e50f0] text-white shadow-md'
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
    <div className="flex flex-col h-[400px] bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-2">{title}</h4>
        <div className="relative">
          <input type="text" placeholder="Пошук..." value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">Обрано: {selectedIds.length}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((opt: any, i: number) => (
            <label key={`${opt[accessor]}-${i}`} className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group">
              <input type="checkbox" checked={selectedIds.includes(opt[accessor])}
                onChange={() => onToggle(opt[accessor])}
                className="w-4 h-4 text-[#1e50f0] border-gray-300 rounded focus:ring-[#1e50f0] cursor-pointer" />
              <span className="text-xs font-medium text-gray-700 group-hover:text-[#1e50f0] transition-colors line-clamp-2">
                {opt[nameAccessor]}
              </span>
            </label>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 italic">Нічого не знайдено</div>
        )}
      </div>
    </div>
  );
};

// ─── InfoBlock (view mode) ───
export function InfoBlock({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center pr-4 min-h-[20px]">
        <span className="text-[13px] font-medium text-gray-400">{label}</span>
        {children}
      </div>
      <span className="text-sm font-bold text-gray-900 leading-tight">
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
  const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-900 bg-gray-50/50";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-400">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${baseClass} h-28 resize-none`} />
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
  const baseClass = "w-full px-4 py-3 bg-[#f1f3f7] rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[15px] font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[13px] font-bold text-gray-500 px-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${baseClass} h-24 resize-none`} />
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
  <div className={`bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col ${className}`}>
    <h3 className="text-[20px] font-bold text-gray-900 mb-6">{title}</h3>
    {children}
  </div>
);
