import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { applyJobDraftToForm } from '@/lib/applyJobDraft';
import { suggestJobDraft } from '@/services/ai.service';
import { toast } from 'sonner';
import type { JobCategoryDTO } from '@/services/category.service';
import type { MajorDTO } from '@/services/major.service';
import type { Skill } from '@/types';

const MIN_TITLE_LEN = 8;
const DEBOUNCE_MS = 900;

export function useJobDraftAiSuggest<T extends Record<string, unknown>>(opts: {
  /** Auto-suggest on title debounce (create mode, or edit when title differs from initial) */
  enabled: boolean;
  title: string;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
  categories: JobCategoryDTO[];
  skills: Skill[];
  majors: MajorDTO[];
}) {
  const { enabled, title, setValue, getValues, categories, skills, majors } = opts;
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastAppliedTitleRef = useRef('');
  const reqIdRef = useRef(0);

  const categoryNames = categories
    .map((c) => c.categoryName)
    .filter((n): n is string => Boolean(n?.trim()));
  const skillNames = skills.map((s) => s.name).filter((n): n is string => Boolean(n?.trim()));
  const majorNames = majors.map((m) => m.name).filter((n): n is string => Boolean(n?.trim()));

  const runSuggest = useCallback(
    async (force = false) => {
      const t = title.trim();
      if (t.length < MIN_TITLE_LEN) return;

      const titleChanged = t !== lastAppliedTitleRef.current;
      if (!force && !titleChanged) return;

      const id = ++reqIdRef.current;
      setLoading(true);
      try {
        const draft = await suggestJobDraft({
          title: t,
          locale: 'vi',
          categoryNames: categoryNames.length ? categoryNames : undefined,
          skillNames: skillNames.length ? skillNames : undefined,
          majorNames: majorNames.length ? majorNames : undefined,
        });
        if (id !== reqIdRef.current) return;

        const overwriteAiFields = titleChanged || force;
        const isTitleUpdate = lastAppliedTitleRef.current !== '' && titleChanged;

        const result = applyJobDraftToForm({
          draft,
          setValue,
          getValues,
          overwriteAiFields,
          categories,
          skills,
          majors,
        });

        lastAppliedTitleRef.current = t;
        const parts = [
          isTitleUpdate
            ? 'AI đã cập nhật gợi ý theo tiêu đề mới. Bạn có thể chỉnh sửa trước khi đăng tin.'
            : 'AI đã điền gợi ý vào form. Bạn có thể chỉnh sửa trước khi đăng tin.',
          result.appliedFields.length ? `Đã áp dụng: ${result.appliedFields.join(', ')}.` : '',
          result.unmatchedSkills.length
            ? `Kỹ năng chưa có trong hệ thống: ${result.unmatchedSkills.join(', ')}.`
            : '',
          result.unmatchedMajors.length
            ? `Chuyên ngành chưa khớp: ${result.unmatchedMajors.join(', ')}.`
            : '',
        ].filter(Boolean);
        setBanner(parts.join(' '));
      } catch {
        if (id === reqIdRef.current) {
          setBanner(null);
          toast.error('Không gợi ý được từ AI. Vui lòng thử lại.');
        }
      } finally {
        if (id === reqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [title, setValue, getValues, categories, skills, majors, categoryNames, skillNames, majorNames]
  );

  useEffect(() => {
    if (!enabled) return;
    const t = title.trim();
    if (t.length < MIN_TITLE_LEN) return;

    const timer = setTimeout(() => {
      void runSuggest(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [enabled, title, runSuggest]);

  return {
    aiBanner: banner,
    setAiBanner: setBanner,
    aiLoading: loading,
    suggestNow: () => void runSuggest(true),
  };
}
