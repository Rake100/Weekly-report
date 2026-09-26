import React, { useState } from 'react';
import { DiscussionArchiveItem } from '../types/report';
import { 
  Copy, 
  Check, 
  MessageSquare, 
  FileText, 
  Plus, 
  Award, 
  BookOpen, 
  Calendar,
  X
} from 'lucide-react';
import { copyToClipboard } from '../utils/exportUtils';

interface DiscussionVaultProps {
  discussions: DiscussionArchiveItem[];
  onAddDiscussion: (item: DiscussionArchiveItem) => void;
}

export const DiscussionVault: React.FC<DiscussionVaultProps> = ({
  discussions,
  onAddDiscussion,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New discussion form
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('ACCT210');
  const [weekNumber, setWeekNumber] = useState(6);
  const [date, setDate] = useState('Sep 28, 2026');
  const [scoreDisplay, setScoreDisplay] = useState('2.0 / 2.0 (100%)');
  const [topicSummary, setTopicSummary] = useState('');
  const [keyConcepts, setKeyConcepts] = useState('');
  const [fullContent, setFullContent] = useState('');

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const words = fullContent.trim().split(/\s+/).filter(Boolean).length;
    const newItem: DiscussionArchiveItem = {
      id: `disc-custom-${Date.now()}`,
      title,
      courseId,
      weekNumber,
      date,
      wordCount: words,
      scoreDisplay,
      topicSummary,
      keyConcepts: keyConcepts.split('\n').filter((c) => c.trim().length > 0),
      fullContent,
    };
    onAddDiscussion(newItem);
    setIsModalOpen(false);
    setTitle('');
    setTopicSummary('');
    setFullContent('');
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-700" />
            <span>Discussion Posts & Academic Submissions Vault</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete archive of client discussion posts, analytical essays, and group project guides prepared for ACCT 210-52 and ECON 611.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Archive New Discussion</span>
        </button>
      </div>

      {/* Discussion List */}
      <div className="space-y-5">
        {discussions.map((disc) => {
          const isCopied = copiedId === disc.id;
          return (
            <div 
              key={disc.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-slate-800 hover:border-slate-300 transition-all"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                      {disc.courseId} &bull; Week {disc.weekNumber}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {disc.date}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      &bull; {disc.wordCount} words
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {disc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {disc.scoreDisplay && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md">
                      <Award className="w-3.5 h-3.5" />
                      {disc.scoreDisplay}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(disc.id, disc.fullContent)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isCopied ? 'Copied Content' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Topic Summary */}
              <p className="text-xs text-slate-700 font-medium mb-3">
                {disc.topicSummary}
              </p>

              {/* Key Concepts */}
              {disc.keyConcepts.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Core Concepts Covered:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {disc.keyConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Content */}
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
                {disc.fullContent}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding discussion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Archive Discussion / Project Submission
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                  >
                    <option value="ACCT210">ACCT 210-52 (Financial Accounting)</option>
                    <option value="ECON611">ECON 611 (Economic Analysis)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Week Number</label>
                  <input
                    type="number"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discussion Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Discussion 5 – Internal Controls & Bank Reconciliation"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Submitted</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Sep 28, 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Score Display</label>
                  <input
                    type="text"
                    value={scoreDisplay}
                    onChange={(e) => setScoreDisplay(e.target.value)}
                    placeholder="2.0 / 2.0 (100%)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Summary</label>
                <input
                  type="text"
                  value={topicSummary}
                  onChange={(e) => setTopicSummary(e.target.value)}
                  placeholder="One sentence synopsis of discussion thesis"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Concepts (1 per line)</label>
                <textarea
                  rows={2}
                  value={keyConcepts}
                  onChange={(e) => setKeyConcepts(e.target.value)}
                  placeholder="Separation of Duties&#10;Bank Reconciliation items&#10;Petty Cash reconciliation"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Submission Text</label>
                <textarea
                  rows={6}
                  required
                  value={fullContent}
                  onChange={(e) => setFullContent(e.target.value)}
                  placeholder="Paste complete essay or discussion forum reply here..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs"
                >
                  Save Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
