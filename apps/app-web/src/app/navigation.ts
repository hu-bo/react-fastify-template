import { FolderKanban } from 'lucide-react';

export const menuItems = [
  {
    label: '项目空间',
    description: '查看和管理项目',
    keywords: '工作空间 projects',
    to: '/projects' as const,
    icon: FolderKanban,
  },
];
