import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import {
  ChevronLeft,
  ChevronRight,
  Command,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { MenuSearchDialog } from './menu-search-dialog';
import { menuItems } from './navigation';

export function AppShell() {
  const menuSearchShortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuSearchOpen, setMenuSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [dark, setDark] = useState(() => localStorage.getItem('studio-theme') === 'dark');
  const openNavRef = useRef<HTMLButtonElement>(null);
  const closeNavRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileOpen(false);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (mobileOpen) closeNavRef.current?.focus();
    else if (wasMobileOpen.current) openNavRef.current?.focus();
    wasMobileOpen.current = mobileOpen;
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('studio-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMenuSearchOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === '[') {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-xl focus:bg-card focus:p-3 focus:not-sr-only"
      >
        跳转到主要内容
      </a>
      <button
        ref={openNavRef}
        type="button"
        aria-label="打开导航栏"
        aria-expanded={mobileOpen}
        aria-controls="workspace-sidebar"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 flex size-11 items-center justify-center rounded-2xl border bg-card/95 text-primary shadow-md backdrop-blur-md md:hidden"
      >
        <Menu size={20} />
      </button>
      {mobileOpen && (
        <button
          type="button"
          aria-label="关闭导航栏"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="workspace-sidebar"
        aria-label="工作台导航"
        aria-hidden={isMobile && !mobileOpen}
        inert={isMobile && !mobileOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card/96 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-[width,transform] duration-300 md:translate-x-0 md:shadow-none',
          collapsed && 'md:w-[76px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between gap-2 border-b px-4">
          <Link
            to="/projects"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-orange-300 text-white shadow-sm shadow-sky-500/25">
              <Sparkles size={19} />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-sky-300 ring-2 ring-card" />
            </span>
            <span className={cn('min-w-0', collapsed && 'md:hidden')}>
              <span className="block truncate text-[13px] font-extrabold tracking-tight">
                STUDIO SPACE
              </span>
              <span className="block truncate text-[10px] font-medium text-muted-foreground">
                让每个好想法都有位置
              </span>
            </span>
          </Link>
          <button
            ref={closeNavRef}
            type="button"
            aria-label="关闭导航栏"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden"
          >
            <X size={18} />
          </button>
          <button
            type="button"
            aria-label={collapsed ? '展开导航栏' : '折叠导航栏'}
            title={collapsed ? '展开导航栏 (⌘ + [)' : '折叠导航栏 (⌘ + [)'}
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              'hidden rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:flex',
              collapsed && 'absolute top-6 -right-3 border bg-card shadow-sm',
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="px-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setMenuSearchOpen(true);
            }}
            aria-label="搜索菜单"
            title="搜索菜单 (Ctrl/⌘ + K)"
            className={cn(
              'flex h-10 items-center gap-2 rounded-2xl border bg-muted/70 px-3 text-xs text-muted-foreground transition-colors hover:border-sky-200 hover:text-primary',
              collapsed && 'md:justify-center md:px-0',
            )}
          >
            <Search size={16} className="shrink-0 text-primary" />
            <span className={cn('flex-1 truncate', collapsed && 'md:hidden')}>搜索菜单...</span>
            <kbd
              className={cn(
                'rounded-md border bg-card px-1.5 py-0.5 text-[10px]',
                collapsed && 'md:hidden',
              )}
            >
              {menuSearchShortcut}
            </kbd>
          </button>
        </div>

        <nav className="flex-1 px-3 pt-7" aria-label="主导航">
          <p
            className={cn(
              'mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-muted-foreground',
              collapsed && 'md:sr-only',
            )}
          >
            工作空间
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={item.label}
                className={cn(
                  'flex h-11 items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 px-3 text-xs font-bold text-white shadow-md shadow-sky-500/20',
                  collapsed && 'md:justify-center md:px-0',
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className={cn(collapsed && 'md:sr-only')}>{item.label}</span>
                <span
                  className={cn(
                    'ml-auto size-1.5 rounded-full bg-white/90',
                    collapsed && 'md:hidden',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            aria-label={dark ? '切换浅色模式' : '切换深色模式'}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              collapsed && 'md:justify-center md:px-0',
            )}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            <span className={cn(collapsed && 'md:sr-only')}>{dark ? '浅色模式' : '深色模式'}</span>
          </button>
          <div
            className={cn(
              'mt-2 flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-3',
              collapsed && 'md:justify-center md:px-0',
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">
              <Command size={17} />
            </span>
            <span className={cn('min-w-0', collapsed && 'md:sr-only')}>
              <span className="block truncate text-xs font-bold">我的工作台</span>
              <span className="block truncate text-[10px] text-muted-foreground">
                专注每一步进展
              </span>
            </span>
          </div>
        </div>
      </aside>

      <div
        inert={isMobile && mobileOpen}
        className={cn(
          'min-w-0 transition-[padding] duration-300 md:pl-64',
          collapsed && 'md:pl-[76px]',
        )}
      >
        <main
          id="main-content"
          className="mx-auto min-h-screen max-w-[1512px] px-4 pt-18 pb-12 sm:px-7 md:px-9 md:pt-8 lg:px-12"
        >
          <Outlet />
        </main>
      </div>
      {menuSearchOpen && <MenuSearchDialog onClose={() => setMenuSearchOpen(false)} />}
    </div>
  );
}
