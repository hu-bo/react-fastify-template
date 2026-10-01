import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  FolderKanban,
  Grid2X2,
  List,
  LoaderCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { errorMessage } from '@/api/api-error';
import {
  createProject,
  deleteProject,
  getListProjectsQueryKey,
  getListProjectsQueryOptions,
  updateProject,
} from '@/api/generated/projects-api';
import type { ListProjects200ItemsItem } from '@/api/generated/models';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

type Project = ListProjects200ItemsItem;
const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
const formatDate = (value: string) => dateFormat.format(new Date(value));
const listKey = getListProjectsQueryKey();
const cardTones = [
  'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
  'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300',
  'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
];

function ProjectFormDialog({
  project,
  onClose,
  onDelete,
}: {
  project?: Project;
  onClose: () => void;
  onDelete: (project: Project) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(project?.name ?? '');
  const [validation, setValidation] = useState('');
  const save = useMutation({
    mutationFn: (value: string) =>
      project ? updateProject(project.id, { name: value }) : createProject({ name: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
      onClose();
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (save.isPending) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 200) {
      setValidation(trimmed ? '项目名称不能超过 200 个字符。' : '请输入项目名称。');
      return;
    }
    setValidation('');
    save.mutate(trimmed);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !save.isPending) onClose();
      }}
    >
      <DialogContent
        className="max-w-[calc(100%-2rem)] gap-0 rounded-3xl p-0 shadow-2xl sm:max-w-md"
        showCloseButton={false}
      >
        <form onSubmit={submit}>
          <DialogHeader className="border-b px-6 py-6">
            <span className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
              <FolderKanban size={21} />
            </span>
            <DialogTitle className="text-xl font-bold">
              {project ? '编辑项目' : '创建新项目'}
            </DialogTitle>
            <DialogDescription>
              {project ? '给项目一个更清晰的名字。' : '从一个名字开始，整理接下来的工作。'}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            <label htmlFor="project-name" className="mb-2 block text-sm font-semibold">
              项目名称
            </label>
            <Input
              id="project-name"
              autoFocus
              disabled={save.isPending}
              maxLength={200}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setValidation('');
                if (save.isError) save.reset();
              }}
              placeholder="例如：全新产品网站"
              className="h-11 rounded-xl bg-card px-3"
              aria-invalid={Boolean(validation)}
              aria-describedby={validation ? 'project-name-error' : undefined}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>起一个便于团队识别的名字</span>
              <span>{name.length}/200</span>
            </div>
            {validation && (
              <p id="project-name-error" role="alert" className="mt-3 text-sm text-destructive">
                {validation}
              </p>
            )}
            {save.isError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {errorMessage(save.error)}
              </p>
            )}
          </div>
          <DialogFooter className="mx-0 mb-0 rounded-b-3xl border-t bg-muted/40 px-6 py-4 sm:justify-between">
            {project ? (
              <Button
                type="button"
                variant="destructive"
                disabled={save.isPending}
                onClick={() => {
                  onClose();
                  onDelete(project);
                }}
              >
                <Trash2 size={15} />
                删除项目
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={save.isPending}
                className="h-10 px-4"
                onClick={onClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={save.isPending}
                className="h-10 bg-sky-600 px-5 text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950"
              >
                {save.isPending && <LoaderCircle className="animate-spin" />}
                {project ? '保存更改' : '创建项目'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
      onClose();
    },
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !remove.isPending) onClose();
      }}
    >
      <DialogContent className="rounded-3xl p-6 shadow-2xl sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
            <Trash2 size={20} />
          </span>
          <DialogTitle className="text-xl font-bold">删除项目？</DialogTitle>
          <DialogDescription>“{project.name}”将被永久删除，此操作无法撤销。</DialogDescription>
        </DialogHeader>
        {remove.isError && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage(remove.error)}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={remove.isPending}
            className="h-10 px-4"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            type="button"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
            className="h-10 bg-rose-600 px-4 text-white hover:bg-rose-700"
          >
            {remove.isPending && <LoaderCircle className="animate-spin" />}确认删除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsPage() {
  const projectsQuery = useQuery(getListProjectsQueryOptions({ limit: 100 }));
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const projects = projectsQuery.data?.items ?? [];
  const filtered = projects.filter((project) =>
    project.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const latest = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const newThisMonth = projects.filter((project) => {
    const date = new Date(project.createdAt);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>工作空间</span>
          <span>/</span>
          <strong className="font-semibold text-foreground">项目空间</strong>
        </div>
        <span className="rounded-full border bg-card px-3 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground">
          STUDIO WORKSPACE
        </span>
      </div>

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 p-6 text-white shadow-lg shadow-sky-500/15 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-12 size-72 rounded-full bg-amber-200/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 size-72 rounded-full bg-sky-200/20 blur-3xl"
        />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-200" />
              创意从这里开始
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              给每个想法，一个清晰的起点。
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-sky-50/95">
              在项目空间中整理你的工作，随时找到正在推进的事情。
            </p>
            <button
              type="button"
              onClick={() => setEditing('new')}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-blue-900 shadow-md transition-colors hover:bg-sky-50"
            >
              <Plus size={18} className="text-orange-500" />
              新建项目
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-100">
              <span>当前项目</span>
              <FolderKanban size={17} />
            </div>
            <div className="mt-3 text-4xl font-extrabold tabular-nums">
              {projectsQuery.isSuccess ? projects.length : '—'}
              {projectsQuery.isSuccess && (
                <span className="ml-2 text-sm font-semibold text-sky-100">个</span>
              )}
            </div>
            <div className="mt-5 border-t border-white/20 pt-3 text-[11px] text-sky-100">
              把进展留在这里，继续向前。
            </div>
          </div>
        </div>
      </section>

      <section aria-label="项目概览" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-card p-5 shadow-sm shadow-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">当前项目</span>
            <span className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
              <FolderKanban size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">
            {projectsQuery.isSuccess ? projects.length : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">最多显示最近 100 个项目</p>
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-sm shadow-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">本月创建</span>
            <span className="rounded-xl bg-orange-50 p-2 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
              <Sparkles size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">
            {projectsQuery.isSuccess ? newThisMonth : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">从新想法开始积累</p>
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-sm shadow-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">最近更新</span>
            <span className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Clock3 size={18} />
            </span>
          </div>
          <p className="mt-3 truncate text-xl font-extrabold">
            {latest ? formatDate(latest.updatedAt) : projectsQuery.isSuccess ? '暂无记录' : '—'}
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {latest?.name ?? (projectsQuery.isSuccess ? '创建项目，开始记录进展' : '等待项目数据')}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="projects-heading"
        className="rounded-[28px] border bg-card p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[0.16em] text-primary">
              YOUR PROJECTS
            </span>
            <h2 id="projects-heading" className="mt-1 text-2xl font-extrabold tracking-tight">
              全部项目
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">查看、搜索和整理当前的项目。</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search
                size={17}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="project-search"
                aria-label="搜索项目"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索项目名称"
                className="h-10 w-full rounded-xl bg-background pr-10 pl-10 sm:w-56"
              />
              {search && (
                <button
                  type="button"
                  aria-label="清除搜索"
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
              <button
                type="button"
                aria-label="网格视图"
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                className={cn(
                  'rounded-lg p-2 text-muted-foreground',
                  view === 'grid' && 'bg-card text-primary shadow-sm',
                )}
              >
                <Grid2X2 size={16} />
              </button>
              <button
                type="button"
                aria-label="列表视图"
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
                className={cn(
                  'rounded-lg p-2 text-muted-foreground',
                  view === 'list' && 'bg-card text-primary shadow-sm',
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 border-t pt-5">
          {projectsQuery.isPending ? (
            <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-44 animate-pulse rounded-2xl bg-muted" />
              ))}
              <span className="sr-only">正在加载项目</span>
            </div>
          ) : projectsQuery.isError ? (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-10 text-center dark:border-rose-900 dark:bg-rose-950/20"
            >
              <CircleAlert className="mx-auto text-rose-500" size={30} />
              <h3 className="mt-3 font-bold">暂时无法加载项目</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {errorMessage(projectsQuery.error)}
              </p>
              <Button
                type="button"
                onClick={() => void projectsQuery.refetch()}
                className="mt-5 h-9 bg-sky-600 px-4 text-white hover:bg-sky-700"
              >
                重新加载
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-14 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                <FolderKanban size={27} />
              </span>
              <h3 className="mt-4 font-bold">{search ? '没有找到匹配的项目' : '还没有项目'}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? '试试其他关键词，或清除搜索。' : '创建第一个项目，让新的想法有处可放。'}
              </p>
              <Button
                type="button"
                onClick={() => (search ? setSearch('') : setEditing('new'))}
                className="mt-5 h-9 bg-sky-600 px-4 text-white hover:bg-sky-700"
              >
                {search ? '清除搜索' : '创建项目'}
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-4',
                view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
              )}
            >
              {filtered.map((project, index) => (
                <article
                  key={project.id}
                  className={cn(
                    'group rounded-2xl border bg-background/40 p-5 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md hover:shadow-sky-500/5 dark:hover:border-sky-800',
                    view === 'list' && 'sm:flex sm:items-center sm:gap-5',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                      cardTones[index % cardTones.length],
                    )}
                  >
                    <FolderKanban size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="mt-4 truncate text-base font-bold sm:mt-4">{project.name}</h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      项目编号 · {project.id.slice(0, 8)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'mt-5 flex items-center justify-between border-t pt-4',
                      view === 'list' && 'sm:mt-0 sm:w-64 sm:border-0 sm:pt-0',
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays size={14} />
                      {formatDate(project.updatedAt)} 更新
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditing(project)}
                      aria-label={`管理项目 ${project.name}`}
                      className="flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-sky-700 dark:hover:text-sky-200"
                    >
                      管理 <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        {!projectsQuery.isPending && !projectsQuery.isError && (
          <p className="mt-5 flex items-center gap-1.5 border-t pt-4 text-xs text-muted-foreground">
            <Check size={14} className="text-sky-500" />
            显示 {filtered.length} 个项目{search && `，共加载 ${projects.length} 个`}
          </p>
        )}
      </section>

      {editing && (
        <ProjectFormDialog
          key={editing === 'new' ? 'new' : editing.id}
          project={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onDelete={setDeleting}
        />
      )}
      {deleting && (
        <DeleteProjectDialog
          key={deleting.id}
          project={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
