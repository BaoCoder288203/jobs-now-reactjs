import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS_MENU } from '@/constants/toolsMenu';

interface ToolsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function ToolsDropdown({ isOpen, onClose, anchorRef }: ToolsDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full mt-0 z-[100] min-w-[200px] rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
    >
      {TOOLS_MENU.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0ea5e9]"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
