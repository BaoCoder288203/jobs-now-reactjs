import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TiptapEditor } from '@/components/ui/TiptapEditor';
import { ImageUploadSingle } from '@/components/ui/image-upload';
import { HandbookCategoryCombobox } from '@/components/handbook/HandbookCategoryCombobox';
import { HANDBOOK_CATEGORY_OPTIONS } from '@/constants/handbookCategories';
import {
  useCreateCompanyPost,
  useMyCompanyPost,
  useSubmitCompanyPost,
  useUpdateCompanyPost,
} from '@/modules/handbook/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { slugify } from '@/lib/slugify';
import { htmlToPlainText, plainTextToTipTapHtml } from '@/lib/htmlUtils';

const MIN_CONTENT_PLAIN = 20;

export function CompanyPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const postId = !isNew && id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();

  const { data: existing, isLoading } = useMyCompanyPost(postId);
  const createMut = useCreateCompanyPost();
  const updateMut = useUpdateCompanyPost();
  const submitMut = useSubmitCompanyPost();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryKey, setCategoryKey] = useState(HANDBOOK_CATEGORY_OPTIONS[0]?.slug ?? '');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');

  const slugManualRef = useRef(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSlug(existing.slug);
      setCategoryKey(existing.categoryKey);
      setExcerpt(existing.excerpt ?? '');
      setContent(plainTextToTipTapHtml(existing.content ?? ''));
      setFeaturedImageUrl(existing.featuredImageUrl ?? '');
      slugManualRef.current = true;
    } else if (isNew) {
      slugManualRef.current = false;
    }
  }, [existing, isNew]);

  const validateForSubmit = (): boolean => {
    if (!title.trim()) {
      toast.error('Nhập tiêu đề');
      return false;
    }
    if (!categoryKey) {
      toast.error('Chọn chuyên mục');
      return false;
    }
    const plain = htmlToPlainText(content);
    if (plain.length < MIN_CONTENT_PLAIN) {
      toast.error(`Nội dung cần ít nhất ${MIN_CONTENT_PLAIN} ký tự (không tính định dạng)`);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        await createMut.mutateAsync({
          title,
          slug: slug || undefined,
          categoryKey,
          excerpt,
          content,
          featuredImageUrl: featuredImageUrl || undefined,
        });
        toast.success('Đã tạo bài');
        navigate('/employer/posts');
      } else if (postId) {
        await updateMut.mutateAsync({
          postId,
          payload: {
            title,
            slug: slug || undefined,
            categoryKey,
            excerpt,
            content,
            featuredImageUrl: featuredImageUrl || undefined,
          },
        });
        toast.success('Đã lưu');
        navigate('/employer/posts');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Lỗi');
    }
  };

  const handleSaveAndSubmit = async () => {
    if (!validateForSubmit()) return;
    try {
      if (isNew) {
        const created = await createMut.mutateAsync({
          title,
          slug: slug || undefined,
          categoryKey,
          excerpt,
          content,
          featuredImageUrl: featuredImageUrl || undefined,
        });
        await submitMut.mutateAsync(created.postId);
        toast.success('Đã gửi duyệt');
        navigate('/employer/posts');
      } else if (postId) {
        await updateMut.mutateAsync({
          postId,
          payload: {
            title,
            slug: slug || undefined,
            categoryKey,
            excerpt,
            content,
            featuredImageUrl: featuredImageUrl || undefined,
          },
        });
        await submitMut.mutateAsync(postId);
        toast.success('Đã gửi duyệt');
        navigate('/employer/posts');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Lỗi');
    }
  };

  const pending = createMut.isPending || updateMut.isPending || submitMut.isPending;
  const isPendingReview = !isNew && existing?.status === 'PENDING_REVIEW';

  if (!isNew && postId && isLoading) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">{isNew ? 'Tạo bài viết' : 'Sửa bài viết'}</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(280px,320px)] lg:items-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTitle(v);
                    if (!slugManualRef.current) {
                      setSlug(slugify(v));
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (tùy chọn)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    slugManualRef.current = true;
                    setSlug(e.target.value);
                  }}
                  placeholder={slugify(title)}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Gõ tiêu đề sẽ tự tạo slug; chỉnh slug tay nếu bạn muốn URL khác (sau đó slug không còn đổi
                  theo tiêu đề).
                </p>
              </div>

              <HandbookCategoryCombobox value={categoryKey} onChange={setCategoryKey} />

              <div>
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <textarea
                  id="excerpt"
                  className="mt-1 min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="content">Nội dung</Label>
                <TiptapEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Soạn thảo nội dung bài viết…"
                  minHeight="280px"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Featured Image</CardTitle>
              </CardHeader>
              <CardContent> 
                <ImageUploadSingle
                  id="company-post-cover"
                  label="Tải ảnh lên"
                  value={featuredImageUrl || undefined}
                  onChange={(url) => setFeaturedImageUrl(url)}
                  onClear={() => setFeaturedImageUrl('')}
                  previewClassName="h-40 w-full max-w-full object-cover"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-4 pt-6">
                {isPendingReview ? (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Bài viết đang chờ duyệt. Bạn vẫn có thể chỉnh sửa, hệ thống sẽ cập nhật nội dung mới nhất để
                    admin duyệt.
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/employer/posts')}
                  disabled={pending}
                >
                  Hủy
                </Button>
                <Button type="button" className="w-full" onClick={handleSave} disabled={pending}>
                  {isPendingReview ? 'Lưu thay đổi' : 'Lưu nháp'}
                </Button>
                {!isPendingReview ? (
                  <Button type="button" className="w-full" onClick={handleSaveAndSubmit} disabled={pending}>
                    Lưu và gửi duyệt
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
