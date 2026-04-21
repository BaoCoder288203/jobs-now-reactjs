import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useMyCompanyPosts, useSubmitCompanyPost, useTrashMyCompanyPost } from '@/modules/handbook/hooks';
import { getHandbookCategoryLabel } from '@/constants/handbookCategories';
import { TableData, type TableDataColumn } from '@/components/common/TableData';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, ExternalLink } from 'lucide-react';
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
  return (
    <div className="flex flex-row flex-wrap justify-end gap-1.5">
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
  );
}

export function CompanyPostsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
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

  const columns = useMemo<TableDataColumn<CompanyPostMine>[]>(
    () => [
      {
        key: 'title',
        title: 'Tiêu đề',
        fixed: 'left',
        minWidth: 200,
        maxWidth: 280,
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
      <div className="mx-auto min-w-0 max-w-6xl space-y-6 px-3 sm:px-4 lg:px-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Bài viết công ty</h1>
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <Link to="/employer/posts/new">Tạo bài mới</Link>
          </Button>
        </div>

        <Card className="min-w-0 max-w-full overflow-hidden border-0 shadow-sm">
          <CardContent className="min-w-0 p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-12 text-center text-muted-foreground">Chưa có bài viết.</p>
            ) : (
              <TableData<CompanyPostMine>
                columns={columns}
                data={items}
                rowKey="postId"
                minWidth={960}
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
