import { useState } from 'react';
import { Sparkles, Edit3, Upload } from 'lucide-react';
import { AIGeneratorForm } from './AIGeneratorForm';
import { ManualCVForm } from './ManualCVForm';
import { CVUploadForm } from './CVUploadForm';
import type { ExtractedCVData } from '@/types';

type TabId = 'ai' | 'manual' | 'upload';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'ai', label: 'Viết CV bằng AI', icon: Sparkles },
  { id: 'manual', label: 'Tạo CV thủ công', icon: Edit3 },
  { id: 'upload', label: 'Tải CV lên', icon: Upload },
];

interface CVFormTabsProps {
  editResumeId?: string | null;
  initialCVData?: ExtractedCVData;
  editResumeName?: string;
  editTemplateKey?: string;
}

export function CVFormTabs({
  editResumeId,
  initialCVData,
  editResumeName,
  editTemplateKey,
}: CVFormTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(editResumeId ? 'manual' : 'ai');

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'ai' && <AIGeneratorForm />}
      {activeTab === 'manual' && (
        <ManualCVForm
          initialData={initialCVData}
          editResumeId={editResumeId}
          editResumeName={editResumeName}
          editTemplateKey={editTemplateKey}
        />
      )}
      {activeTab === 'upload' && <CVUploadForm />}
    </div>
  );
}
