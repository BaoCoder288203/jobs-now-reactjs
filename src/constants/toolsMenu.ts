export interface ToolsMenuItem {
  label: string;
  path: string;
}

export const TOOLS_MENU: ToolsMenuItem[] = [
  { label: 'Tạo CV', path: '/tools/tao-cv' },
  { label: 'Chuẩn hóa CV', path: '/tools/chuan-hoa-cv' },
  { label: 'Lương', path: '/tools/tinh-luong-gross-net' },
  { label: 'Phỏng vấn', path: '/tools/phong-van' },
];
