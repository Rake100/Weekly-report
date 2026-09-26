import React, { useState } from 'react';
import { GradeItem, Course, ItemCategory, ItemStatus } from '../types/report';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Filter, 
  TrendingUp, 
  BookCheck, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface GradebookManagerProps {
  gradeItems: GradeItem[];
  courses: Course[];
  onAddGradeItem: (item: GradeItem) => void;
  onUpdateGradeItem: (item: GradeItem) => void;
  onDeleteGradeItem: (id: string) => void;
  onResetDefaults: () => void;
}

export const GradebookManager: React.FC<GradebookManagerProps> = ({
  gradeItems,
  courses,
  onAddGradeItem,
  onUpdateGradeItem,
  onDeleteGradeItem,
  onResetDefaults,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state for adding/editing an item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GradeItem | null>(null);

  // Form fields
  const [formCourseId, setFormCourseId] = useState<'ECON611' | 'ACCT210'>('ACCT210');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCategory>('Graded HW');
  const [formScoreEarned, setFormScoreEarned] = useState<string>('20');
  const [formPointsPossible, setFormPointsPossible] = useState<string>('20');
  const [formStatus, setFormStatus] = useState<ItemStatus>('GRADED');
  const [formWeekNumber, setFormWeekNumber] = useState<number>(6);
  const [formDate, setFormDate] = useState<string>('2026-09-28');
  const [formPlatform, setFormPlatform] = useState<string>('Metro State D2L');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formIsOfficial, setFormIsOfficial] = useState<boolean>(true);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormCourseId('ACCT210');
    setFormTitle('');
    setFormCategory('Graded HW');
    setFormScoreEarned('20');
    setFormPointsPossible('20');
    setFormStatus('GRADED');
    setFormWeekNumber(6);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPlatform('Metro State D2L');
    setFormNotes('');
    setFormIsOfficial(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: GradeItem) => {
    setEditingItem(item);
    setFormCourseId(item.courseId as 'ECON611' | 'ACCT210');
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormScoreEarned(item.scoreEarned !== null ? String(item.scoreEarned) : '');
    setFormPointsPossible(String(item.pointsPossible));
    setFormStatus(item.status);
    setFormWeekNumber(item.weekNumber);
    setFormDate(item.dateCompleted || '');
    setFormPlatform(item.platform);
    setFormNotes(item.notes || '');
    setFormIsOfficial(item.isOfficialGradebookItem ?? true);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = formScoreEarned.trim() !== '' ? parseFloat(formScoreEarned) : null;
    const possibleVal = parseFloat(formPointsPossible) || 1;
    const calculatedPct = scoreVal !== null ? (scoreVal / possibleVal) * 100 : undefined;

    if (editingItem) {
      const updated: GradeItem = {
        ...editingItem,
        courseId: formCourseId,
        title: formTitle,
        category: formCategory,
        scoreEarned: scoreVal,
        pointsPossible: possibleVal,
        percentage: calculatedPct,
        status: formStatus,
        weekNumber: formWeekNumber,
        dateCompleted: formDate,
        platform: formPlatform,
        notes: formNotes,
        isOfficialGradebookItem: formIsOfficial,
      };
      onUpdateGradeItem(updated);
    } else {
      const newItem: GradeItem = {
        id: `custom-item-${Date.now()}`,
        courseId: formCourseId,
        title: formTitle,
        category: formCategory,
        scoreEarned: scoreVal,
        pointsPossible: possibleVal,
        percentage: calculatedPct,
        status: formStatus,
        weekNumber: formWeekNumber,
        dateCompleted: formDate,
        platform: formPlatform,
        notes: formNotes,
        isOfficialGradebookItem: formIsOfficial,
      };
      onAddGradeItem(newItem);
    }
    setIsModalOpen(false);
  };

  // Compute stats
  const acctItems = gradeItems.filter((i) => i.courseId === 'ACCT210' && i.isOfficialGradebookItem);
  const acctEarned = acctItems.reduce((acc, curr) => acc + (curr.scoreEarned ?? 0), 0);
  const acctPossible = acctItems.reduce((acc, curr) => acc + curr.pointsPossible, 0);
  const acctPercentage = acctPossible > 0 ? (acctEarned / acctPossible) * 100 : 100;

  const econGradedItems = gradeItems.filter((i) => i.courseId === 'ECON611' && i.category === 'Graded HW');
  const econEarned = econGradedItems.reduce((acc, curr) => acc + (curr.scoreEarned ?? 0), 0);
  const econPossible = econGradedItems.reduce((acc, curr) => acc + curr.pointsPossible, 0);
  const econPercentage = econPossible > 0 ? (econEarned / econPossible) * 100 : 100;

  // Filtered list
  const filteredItems = gradeItems.filter((item) => {
    if (selectedCourseFilter !== 'ALL' && item.courseId !== selectedCourseFilter) {
      return false;
    }
    if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchPlatform = item.platform.toLowerCase().includes(q);
      return matchTitle || matchCat || matchNotes || matchPlatform;
    }
    return true;
  });

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Top Banner / Standings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ACCT 210-52 Official Total
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {acctEarned.toFixed(2)} / {acctPossible.toFixed(1)} <span className="text-emerald-700 text-sm font-semibold">({acctPercentage.toFixed(2)}% A+)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
            <BookCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ECON 611 Graded Work
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {econEarned.toFixed(1)} / {econPossible.toFixed(1)} <span className="text-blue-700 text-sm font-semibold">({econPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              All Logged Coursework
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {gradeItems.length} Assignments <span className="text-slate-500 text-xs font-normal">100% On-Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Add Button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white w-48 sm:w-56"
            />
          </div>

          {/* Course Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setSelectedCourseFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedCourseFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Courses
            </button>
            <button
              type="button"
              onClick={() => setSelectedCourseFilter('ECON611')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedCourseFilter === 'ECON611' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ECON 611
            </button>
            <button
              type="button"
              onClick={() => setSelectedCourseFilter('ACCT210')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedCourseFilter === 'ACCT210' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ACCT 210-52
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="Graded HW">Graded HW</option>
            <option value="Discussion">Discussions</option>
            <option value="SmartBook">SmartBook</option>
            <option value="Exam Prep">Exam Prep</option>
            <option value="Project">Project / Helper</option>
            <option value="Practice">Practice Problems</option>
            <option value="Reading">Readings</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            title="Restore original Week 1-5 grades data"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Main Grade Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Course</th>
                <th className="py-2.5 px-4">Assignment Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Points Earned / Possible</th>
                <th className="py-2.5 px-3 text-right">Percentage</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Week</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No coursework records matching your current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const course = courses.find((c) => c.id === item.courseId);
                  const isEcon = item.courseId === 'ECON611';
                  const scoreDisplay = item.scoreEarned !== null 
                    ? `${item.scoreEarned.toFixed(2)} / ${item.pointsPossible.toFixed(1)}` 
                    : 'Complete';
                  const pctDisplay = item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className={`inline-block font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded ${
                          isEcon ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {course ? course.code : item.courseId}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {item.title}
                        {item.notes && (
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {scoreDisplay}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {pctDisplay}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'GRADED' 
                            ? 'bg-blue-100 text-blue-800' 
                            : item.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                        W{item.weekNumber}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Score"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteGradeItem(item.id)}
                            title="Delete"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Assignment Grade' : 'Add New Course Assignment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course</label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                  >
                    <option value="ACCT210">ACCT 210-52 (Financial Accounting)</option>
                    <option value="ECON611">ECON 611 (Economic Analysis)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                  >
                    <option value="Graded HW">Graded HW</option>
                    <option value="Discussion">Discussion</option>
                    <option value="SmartBook">SmartBook</option>
                    <option value="Exam Prep">Exam Prep</option>
                    <option value="Project">Project / Homework Helper</option>
                    <option value="Practice">Practice Set</option>
                    <option value="Reading">Reading</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title (As named in portal)</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Chapter 6 Homework"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Points Earned</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formScoreEarned}
                    onChange={(e) => setFormScoreEarned(e.target.value)}
                    placeholder="20.0"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Points Possible</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPointsPossible}
                    onChange={(e) => setFormPointsPossible(e.target.value)}
                    placeholder="20.0"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-bold"
                  >
                    <option value="GRADED">GRADED</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Completed in Week #</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={formWeekNumber}
                    onChange={(e) => setFormWeekNumber(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Platform</label>
                  <input
                    type="text"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Description (Optional)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Completed early, 100% accuracy"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalIsOfficial"
                  checked={formIsOfficial}
                  onChange={(e) => setFormIsOfficial(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="modalIsOfficial" className="text-slate-700 font-medium">
                  Count towards official cumulative course gradebook
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
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
                  {editingItem ? 'Save Changes' : 'Add to Gradebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
