import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useMyCompanyPosts, useSubmitCompanyPost, useTrashMyCompanyPost } from '@/modules/handbook/hooks';
import { getHandbookCategoryLabel } from '@/constants/handbookCategories';
import { TableData, type TableDataColumn } from '@/components/common/TableData';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, ExternalLink, Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toLocalCalendarDateKey } from '@/utils/dateFilter';
import type { CompanyPostMine, CompanyPostStatus } from '@/types/handbook';
import { cn } from '@/lib/utils';

function statusLabel(s: CompanyPostStatus) {
  const map: Record<CompanyPostStatus, string> = {
    DRAFT: 'Nháp',
    PENDING_REVIEW: 'Chờ duyệt',
    PUBLISHED: 'Đã đăng',
    REJECTED: 'Từ chối',
    TRASHED: 'Đã gỡ',
  };
  return map[s] ?? s;
}

function statusBadgeClass(s: CompanyPostStatus) {
  const map: Record<CompanyPostStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-800',
    PENDING_REVIEW: 'bg-amber-100 text-amber-900',
    PUBLISHED: 'bg-emerald-100 text-emerald-900',
    REJECTED: 'bg-red-100 text-red-900',
    TRASHED: 'bg-gray-200 text-gray-700',
  };
  return map[s] ?? 'bg-slate-100 text-slate-800';
}

function parseApiDate(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const normalized = trimmed.includes('T')
      ? trimmed
      : trimmed.replace(/^(\d{4}-\d{2}-\d{2})[ T](\d)/, '$1T$2');
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, mo, day, h = 0, min = 0, sec = 0, nano = 0] = value.map((n) => Number(n));
    const ms = typeof nano === 'number' ? Math.floor(nano / 1e6) : 0;
    const d = new Date(y, mo - 1, day, h, min, sec, ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDateTime(value: unknown) {
  const d = parseApiDate(value);
  if (!d) return { line1: '—', line2: '' as string };
  return {
    line1: d.toLocaleDateString('vi-VN'),
    line2: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

function DateCell({ value }: { value: unknown }) {
  const { line1, line2 } = formatDateTime(value);
  return (
    <>
      <div className="tabular-nums">{line1}</div>
      {line2 ? <div className="text-xs text-muted-foreground/80 tabular-nums">{line2}</div> : null}
    </>
  );
}

function PostActions({
  post,
  publicPostPath,
  editPath,
  onSubmit,
  onTrash,
  submitPending,
  trashPending,
}: {
  post: CompanyPostMine;
  publicPostPath: string;
  editPath: string;
  onSubmit: (id: number) => void;
  onTrash: (id: number) => void;
  submitPending: boolean;
  trashPending: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="hidden flex-row flex-wrap justify-end gap-1.5 md:flex">
        {post.status === 'PUBLISHED' && (
          <Button size="sm" variant="outline" asChild className="h-8 gap-1">
            <Link to={publicPostPath}>
              <ExternalLink className="h-3.5 w-3.5" />
              Xem bài
            </Link>
          </Button>
        )}
        {post.status !== 'TRASHED' && (
          <Button size="sm" variant="secondary" asChild className="h-8 gap-1">
            <Link to={editPath}>
              <Pencil className="h-3.5 w-3.5" />
              Sửa
            </Link>
          </Button>
        )}
        {(post.status === 'DRAFT' || post.status === 'REJECTED') && (
          <Button size="sm" className="h-8" onClick={() => onSubmit(post.postId)} disabled={submitPending}>
            Gửi duyệt
          </Button>
        )}
        {post.status !== 'TRASHED' && (
          <Button
            size="sm"
            variant="destructive"
            className="h-8"
            onClick={() => onTrash(post.postId)}
            disabled={trashPending}
          >
            Gỡ
          </Button>
        )}
      </div>

      <div className="relative md:hidden" ref={menuRef}>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label="Thao tác bài viết"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Menu className="h-4 w-4" strokeWidth={2.25} />
        </Button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {post.status === 'PUBLISHED' && (
              <Link
                role="menuitem"
                to={publicPostPath}
                onClick={closeMenu}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Xem bài
              </Link>
            )}
            {post.status !== 'TRASHED' && (
              <Link
                role="menuitem"
                to={editPath}
                onClick={closeMenu}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 shrink-0" />
                Sửa
              </Link>
            )}
            {(post.status === 'DRAFT' || post.status === 'REJECTED') && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center px-3 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => {
                  closeMenu();
                  onSubmit(post.postId);
                }}
                disabled={submitPending}
              >
                Gửi duyệt
              </button>
            )}
            {post.status !== 'TRASHED' && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                onClick={() => {
                  closeMenu();
                  onTrash(post.postId);
                }}
                disabled={trashPending}
              >
                Gỡ bài
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function CompanyPostMobileCard({
  post,
  onSubmit,
  onTrash,
  submitPending,
  trashPending,
}: {
  post: CompanyPostMine;
  onSubmit: (id: number) => void;
  onTrash: (id: number) => void;
  submitPending: boolean;
  trashPending: boolean;
}) {
  const publicPostPath = `/cam-nang-viec-lam/bai-viet/${post.slug}`;
  const editPath = `/employer/posts/${post.postId}`;
  const created = formatDateTime(post.createdAt);
  const updated = formatDateTime(post.updatedAt ?? post.createdAt);
  const published =
    post.status === 'PUBLISHED' && post.publishedAt ? formatDateTime(post.publishedAt) : null;

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {post.status === 'PUBLISHED' ? (
              <Link
                to={publicPostPath}
                className="font-semibold text-foreground hover:text-primary line-clamp-2 inline-flex items-start gap-1"
              >
                <span>{post.title}</span>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              </Link>
            ) : (
              <Link to={editPath} className="font-semibold text-foreground hover:text-primary line-clamp-2">
                {post.title}
              </Link>
            )}
            <p className="font-mono text-xs text-muted-foreground">#{post.postId}</p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-foreground/90">{getHandbookCategoryLabel(post.categoryKey)}</span>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                  statusBadgeClass(post.status),
                )}
              >
                {statusLabel(post.status)}
              </span>
            </div>

            <dl className="space-y-1 text-xs text-muted-foreground">
              <div>
                <dt className="inline font-medium text-gray-600">Tạo: </dt>
                <dd className="inline tabular-nums">
                  {created.line1}
                  {created.line2 ? ` · ${created.line2}` : ''}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">Cập nhật: </dt>
                <dd className="inline tabular-nums">{updated.line1}</dd>
              </div>
              {published && (
                <div>
                  <dt className="inline font-medium text-gray-600">Đăng: </dt>
                  <dd className="inline tabular-nums">
                    {published.line1}
                    {published.line2 ? ` · ${published.line2}` : ''}
                  </dd>
                </div>
              )}
            </dl>

            {post.featuredImageUrl ? (
              <img
                src={post.featuredImageUrl}
                alt=""
                className="mt-2 max-h-28 w-full rounded-md object-cover sm:max-w-xs"
              />
            ) : null}

            {post.status === 'REJECTED' && post.rejectionNote ? (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
                <p className="font-semibold">Lý do từ chối</p>
                <p className="mt-1 whitespace-pre-wrap">{post.rejectionNote}</p>
              </div>
            ) : null}
          </div>

          <PostActions
            post={post}
            publicPostPath={publicPostPath}
            editPath={editPath}
            onSubmit={onSubmit}
            onTrash={onTrash}
            submitPending={submitPending}
            trashPending={trashPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyPostsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [postSearch, setPostSearch] = useState('');
  const [postDateFrom, setPostDateFrom] = useState('');
  const [postDateTo, setPostDateTo] = useState('');
  const { data, isLoading, refetch } = useMyCompanyPosts(page, limit);
  const submitMut = useSubmitCompanyPost();
  const trashMut = useTrashMyCompanyPost();

  const handleSubmit = useCallback(
    async (postId: number) => {
      try {
        await submitMut.mutateAsync(postId);
        toast.success('Đã gửi duyệt');
        refetch();
      } catch (e: unknown) {
        toast.error((e as { message?: string })?.message ?? 'Không thể gửi');
      }
    },
    [submitMut, refetch],
  );

  const handleTrash = useCallback(
    async (postId: number) => {
      if (!confirm('Gỡ bài này?')) return;
      try {
        await trashMut.mutateAsync(postId);
        toast.success('Đã gỡ bài');
        refetch();
      } catch (e: unknown) {
        toast.error((e as { message?: string })?.message ?? 'Lỗi');
      }
    },
    [trashMut, refetch],
  );

  const items = data?.items ?? [];

  const hasActivePostFilters = Boolean(postSearch.trim() || postDateFrom || postDateTo);

  const filteredItems = useMemo(() => {
    let list = items;
    const q = postSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((post) => (post.title || '').toLowerCase().includes(q));
    }
    if (postDateFrom) {
      list = list.filter((post) => {
        const key = toLocalCalendarDateKey(post.createdAt);
        return key && key >= postDateFrom;
      });
    }
    if (postDateTo) {
      list = list.filter((post) => {
        const key = toLocalCalendarDateKey(post.createdAt);
        return key && key <= postDateTo;
      });
    }
    return list;
  }, [items, postSearch, postDateFrom, postDateTo]);

  const columns = useMemo<TableDataColumn<CompanyPostMine>[]>(
    () => [
      {
        key: 'title',
        title: 'Tiêu đề',
        fixed: 'left',
        minWidth: 140,
        maxWidth: 240,
        render: (_, post) => {
          const publicPostPath = `/cam-nang-viec-lam/bai-viet/${post.slug}`;
          const editPath = `/employer/posts/${post.postId}`;
          return (
            <div>
              {post.status === 'PUBLISHED' ? (
                <Link
                  to={publicPostPath}
                  className="font-semibold text-foreground hover:text-primary line-clamp-2 inline-flex items-start gap-1"
                >
                  <span>{post.title}</span>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                </Link>
              ) : (
                <Link
                  to={editPath}
                  className="font-semibold text-foreground hover:text-primary line-clamp-2"
                >
                  {post.title}
                </Link>
              )}
              <p className="mt-1 font-mono text-xs text-muted-foreground">#{post.postId}</p>
            </div>
          );
        },
      },
      {
        key: 'category',
        title: 'Chuyên mục',
        render: (_, post) => (
          <span className="text-foreground/90">{getHandbookCategoryLabel(post.categoryKey)}</span>
        ),
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (_, post) => (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
              statusBadgeClass(post.status),
            )}
          >
            {statusLabel(post.status)}
          </span>
        ),
      },
      {
        key: 'createdAt',
        title: 'Tạo',
        render: (_, post) => <DateCell value={post.createdAt} />,
        tdClassName: 'text-muted-foreground',
      },
      {
        key: 'updatedAt',
        title: 'Cập nhật',
        render: (_, post) => <DateCell value={post.updatedAt ?? post.createdAt} />,
        tdClassName: 'text-muted-foreground',
      },
      {
        key: 'publishedAt',
        title: 'Đăng',
        render: (_, post) => {
          if (post.status === 'PUBLISHED' && post.publishedAt) {
            return <DateCell value={post.publishedAt} />;
          }
          return <span className="text-muted-foreground/60">—</span>;
        },
        tdClassName: 'text-muted-foreground',
      },
      {
        key: 'cover',
        title: 'Ảnh bìa',
        render: (_, post) =>
          post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt=""
              className="h-14 w-[88px] rounded-md object-cover"
            />
          ) : (
            <span className="text-muted-foreground/60">—</span>
          ),
      },
      {
        key: 'actions',
        title: 'Thao tác',
        fixed: 'right',
        align: 'right',
        minWidth: 100,
        render: (_, post) => (
          <PostActions
            post={post}
            publicPostPath={`/cam-nang-viec-lam/bai-viet/${post.slug}`}
            editPath={`/employer/posts/${post.postId}`}
            onSubmit={handleSubmit}
            onTrash={handleTrash}
            submitPending={submitMut.isPending}
            trashPending={trashMut.isPending}
          />
        ),
      },
    ],
    [handleSubmit, handleTrash, submitMut.isPending, trashMut.isPending],
  );

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 px-3 sm:px-4 lg:px-1">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="min-w-0 text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            Bài viết công ty
          </h1>
          <Link to="/employer/posts/new" className="w-full shrink-0 sm:w-auto">
            <Button className="w-full sm:w-auto">Tạo bài mới</Button>
          </Link>
        </div>

        <Card className="w-full min-w-0 max-w-full overflow-hidden border-0 shadow-sm">
          <CardContent className="min-w-0 p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-12 text-center text-muted-foreground">Chưa có bài viết.</p>
            ) : (
              <>
                {items.length > 0 && (
                  <div className="flex flex-col gap-3 bg-muted/30 p-3 sm:p-4">
                    <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
                      <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                        <label htmlFor="employer-post-search" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Tìm theo tiêu đề
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="employer-post-search"
                            type="search"
                            value={postSearch}
                            onChange={(e) => setPostSearch(e.target.value)}
                            placeholder="Nhập tiêu đề bài viết…"
                            className="h-9 pl-9"
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <label htmlFor="employer-post-from" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Tạo từ ngày
                        </label>
                        <Input
                          id="employer-post-from"
                          type="date"
                          value={postDateFrom}
                          onChange={(e) => setPostDateFrom(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end lg:flex-col">
                        <div className="min-w-0 flex-1">
                          <label htmlFor="employer-post-to" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Đến ngày
                          </label>
                          <Input
                            id="employer-post-to"
                            type="date"
                            value={postDateTo}
                            onChange={(e) => setPostDateTo(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        {hasActivePostFilters && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 shrink-0 whitespace-nowrap"
                            onClick={() => {
                              setPostSearch('');
                              setPostDateFrom('');
                              setPostDateTo('');
                            }}
                          >
                            Xóa lọc
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {filteredItems.length === 0 ? (
                  <p className="px-6 py-12 text-center text-muted-foreground">Không có bài viết khớp bộ lọc.</p>
                ) : (
                  <>
                    <div className="space-y-3 px-3 py-3 md:hidden">
                      {filteredItems.map((post) => (
                        <CompanyPostMobileCard
                          key={post.postId}
                          post={post}
                          onSubmit={handleSubmit}
                          onTrash={handleTrash}
                          submitPending={submitMut.isPending}
                          trashPending={trashMut.isPending}
                        />
                      ))}
                    </div>
                    <div className="hidden min-w-0 w-full max-w-full md:block">
                      <TableData<CompanyPostMine>
                        columns={columns}
                        data={filteredItems}
                        rowKey="postId"
                        minWidth={680}
                        ariaLabel="Danh sách bài viết — vuốt ngang để xem thêm cột"
                        renderSubRow={(post) =>
                          post.status === 'REJECTED' && post.rejectionNote ? (
                            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950">
                              <p className="font-semibold">Lý do từ chối</p>
                              <p className="mt-1 whitespace-pre-wrap">{post.rejectionNote}</p>
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  </>
                )}
              </>
            )}
            {data && data.totalCount > limit && (
              <div className="flex flex-wrap justify-center gap-2 px-3 py-4 sm:px-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
