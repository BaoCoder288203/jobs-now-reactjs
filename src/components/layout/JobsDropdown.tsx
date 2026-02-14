import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JOB_CATEGORIES, type JobCategoryId } from '@/constants/jobCategories';

interface JobsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function JobsDropdown({ isOpen, onClose, anchorRef }: JobsDropdownProps) {
  const [selectedId, setSelectedId] = useState<JobCategoryId>('it');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const selected = JOB_CATEGORIES.find((c) => c.id === selectedId);
  const count = selectedRoles.size;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleClear = () => setSelectedRoles(new Set());

  const handleApply = () => {
    const params = new URLSearchParams();
    if (selectedRoles.size) {
      params.set('roles', Array.from(selectedRoles).join(','));
    }
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full mt-0 z-[100] w-[min(90vw,720px)] rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="flex min-h-[320px]">
        {/* Left: categories */}
        <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-50/50 py-2">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedId(cat.id as JobCategoryId)}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                selectedId === cat.id
                  ? 'bg-[#81d1f3]/20 text-[#0ea5e9]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Right: roles */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-wrap gap-2">
            {selected?.roles.map((role) => {
              const active = selectedRoles.has(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'bg-[#81d1f3] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-gray-50/80">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Xóa hết ({count})
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-[#81d1f3] px-4 py-2 text-sm font-medium text-white hover:bg-[#5bb8e8]"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
