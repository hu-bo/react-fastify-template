import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { menuItems } from './navigation';

export function MenuSearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = menuItems.filter((item) =>
    `${item.label} ${item.description} ${item.keywords}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );

  const openFirstMatch = () => {
    const firstMatch = matches[0];
    if (!firstMatch) return;
    onClose();
    void navigate({ to: firstMatch.to });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 shadow-2xl sm:max-w-lg">
        <DialogHeader className="border-b px-5 pt-5 pb-4">
          <DialogTitle className="text-base font-bold">搜索菜单</DialogTitle>
          <DialogDescription className="text-xs">输入菜单名称，快速打开对应页面</DialogDescription>
        </DialogHeader>
        <div className="relative px-5 py-4">
          <Search
            aria-hidden="true"
            size={17}
            className="absolute top-1/2 left-8 -translate-y-1/2 text-primary"
          />
          <Input
            autoFocus
            aria-label="搜索菜单名称"
            placeholder="搜索菜单..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                openFirstMatch();
              }
            }}
            className="h-11 rounded-2xl bg-muted/60 pr-4 pl-10 text-sm"
          />
        </div>
        <div className="px-5 pb-5">
          <p className="mb-2 px-2 text-[10px] font-bold tracking-[0.16em] text-muted-foreground">
            工作空间
          </p>
          <nav aria-label="菜单搜索结果" className="max-h-72 overflow-y-auto">
            {matches.length ? (
              matches.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:outline-2 focus-visible:outline-primary dark:hover:bg-sky-950/40 dark:focus-visible:bg-sky-950/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
                  </Link>
                );
              })
            ) : (
              <p className="rounded-2xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
                没有找到匹配的菜单
              </p>
            )}
          </nav>
        </div>
      </DialogContent>
    </Dialog>
  );
}
