export interface ToolsMenuItem {
  label: string;
  path: string;
}

export const TOOLS_MENU: ToolsMenuItem[] = [
  { label: 'Tạo CV', path: '/tools/tao-cv' },
  { label: 'Chuẩn hóa CV', path: '/tools/chuan-hoa-cv' },
  { label: 'Cẩm nang việc làm', path: '/cam-nang-viec-lam' },
  { label: 'Lương', path: '/tools/tinh-luong-gross-net' },
  { label: 'Phỏng vấn', path: '/tools/phong-van' },
];
