import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminPendingPosts,
  useApproveCompanyPost,
  useRejectCompanyPost,
  useTrashCompanyPostAdmin,
} from '@/modules/handbook/hooks';
import { getHandbookCategoryLabel } from '@/constants/handbookCategories';
import { TableData, type TableDataColumn } from '@/components/common/TableData';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { toast } from 'sonner';
import type { CompanyPostAdminItem } from '@/types/handbook';

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

function AdminPostActions({
  postId,
  onApprove,
  onOpenReject,
  onTrash,
  onPreview,
  approvePending,
}: {
  postId: number;
  onApprove: (id: number) => void;
  onOpenReject: (id: number) => void;
  onTrash: (id: number) => void;
  onPreview: (id: number) => void;
  approvePending: boolean;
}) {
  return (
    <div className="flex flex-row flex-wrap justify-end gap-1.5">
      <Button size="sm" variant="secondary" onClick={() => onPreview(postId)}>
        Xem bài
      </Button>
      <Button size="sm" onClick={() => onApprove(postId)} disabled={approvePending}>
        Duyệt
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onOpenReject(postId)}>
        Từ chối
      </Button>
      <Button size="sm" variant="outline" onClick={() => onTrash(postId)}>
        Gỡ bài
      </Button>
    </div>
  );
}

export function AdminCompanyPostsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, refetch } = useAdminPendingPosts(page, limit);
  const approveMut = useApproveCompanyPost();
  const rejectMut = useRejectCompanyPost();
  const trashMut = useTrashCompanyPostAdmin();

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [previewPost, setPreviewPost] = useState<CompanyPostAdminItem | null>(null);

  const handleApprove = useCallback(
    async (postId: number) => {
      try {
        await approveMut.mutateAsync(postId);
        toast.success('Đã duyệt bài');
        refetch();
      } catch (e: unknown) {
        toast.error((e as { message?: string })?.message ?? 'Lỗi');
      }
    },
    [approveMut, refetch],
  );

  const handleOpenReject = useCallback((postId: number) => {
    setRejectId(postId);
    setRejectNote('');
  }, []);

  const handleReject = useCallback(async () => {
    if (rejectId == null) return;
    const note = rejectNote.trim();
    if (!note) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await rejectMut.mutateAsync({ postId: rejectId, rejectionNote: note });
      toast.success('Đã từ chối');
      setRejectId(null);
      setRejectNote('');
      refetch();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? 'Lỗi');
    }
  }, [rejectId, rejectNote, rejectMut, refetch]);

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

  const columns = useMemo<TableDataColumn<CompanyPostAdminItem>[]>(
    () => [
      {
        key: 'title',
        title: 'Tiêu đề',
        fixed: 'left',
        minWidth: 200,
        maxWidth: 300,
        render: (_, post) => (
          <div>
            <p className="font-semibold text-foreground line-clamp-2">{post.title}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">#{post.postId}</p>
          </div>
        ),
      },
      {
        key: 'company',
        title: 'Công ty',
        render: (_, post) => <span className="text-foreground/90">{post.companyName}</span>,
      },
      {
        key: 'category',
        title: 'Chuyên mục',
        render: (_, post) => (
          <span className="text-foreground/90">{getHandbookCategoryLabel(post.categoryKey)}</span>
        ),
      },
      {
        key: 'excerpt',
        title: 'Mô tả ngắn',
        minWidth: 200,
        maxWidth: 320,
        render: (_, post) =>
          post.excerpt ? (
            <p className="line-clamp-4 whitespace-pre-wrap text-sm text-foreground/90">{post.excerpt}</p>
          ) : (
            <span className="text-muted-foreground/60">—</span>
          ),
      },
      {
        key: 'createdAt',
        title: 'Gửi lúc',
        render: (_, post) => <DateCell value={post.createdAt} />,
        tdClassName: 'text-muted-foreground',
      },
      {
        key: 'actions',
        title: 'Thao tác',
        fixed: 'right',
        align: 'right',
        minWidth: 80,
        render: (_, post) => (
          <AdminPostActions
            postId={post.postId}
            onApprove={handleApprove}
            onOpenReject={handleOpenReject}
            onTrash={handleTrash}
            onPreview={(id) => setPreviewPost(post)}
            approvePending={approveMut.isPending}
          />
        ),
      },
    ],
    [handleApprove, handleOpenReject, handleTrash, approveMut.isPending],
  );

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="mx-auto min-w-0 max-w-6xl space-y-6 px-3 sm:px-4 lg:px-1">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Duyệt bài viết công ty</h1>

        <Card className="min-w-0 max-w-full overflow-hidden border-0 shadow-sm">
          <CardContent className="min-w-0 p-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-12 text-center text-muted-foreground">Không có bài chờ duyệt.</p>
            ) : (
              <TableData<CompanyPostAdminItem>
                columns={columns}
                data={items}
                rowKey="postId"
                minWidth={1040}
                ariaLabel="Danh sách bài chờ duyệt — vuốt ngang để xem thêm cột"
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

        {rejectId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-md border shadow-lg">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold text-foreground">Lý do từ chối</h2>
                <div className="space-y-2">
                  <Label htmlFor="admin-reject-note">Bắt buộc</Label>
                  <Textarea
                    id="admin-reject-note"
                    className="min-h-[120px]"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRejectId(null)}>
                    Hủy
                  </Button>
                  <Button onClick={handleReject} disabled={rejectMut.isPending}>
                    Gửi từ chối
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {previewPost != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-2xl border shadow-lg overflow-y-auto max-h-[90vh]">
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{previewPost.title}</h2>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      <p><strong>Công ty đăng:</strong> {previewPost.companyName}</p>
                      <p><strong>Chuyên mục:</strong> {getHandbookCategoryLabel(previewPost.categoryKey)}</p>
                      <p><strong>Thời gian tạo:</strong> {previewPost.createdAt ? new Date(previewPost.createdAt).toLocaleString('vi-VN') : '—'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-semibold text-foreground mb-2">Mô tả ngắn:</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100">
                    {previewPost.excerpt || 'Không có mô tả.'}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="font-semibold text-foreground mb-2">Nội dung bài viết:</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-100 overflow-hidden">
                    {previewPost.content ? (
                      previewPost.content.includes('<') ? (
                        <RichTextContent html={previewPost.content} className="max-w-none prose-sm" />
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{previewPost.content}</div>
                      )
                    ) : (
                      'Không có nội dung chi tiết.'
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-50">
                  <Button variant="outline" onClick={() => setPreviewPost(null)}>
                    Đóng xem trước
                  </Button>
                  <Button onClick={() => {
                    handleApprove(previewPost.postId);
                    setPreviewPost(null);
                  }} disabled={approveMut.isPending}>
                    Duyệt bài này
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
