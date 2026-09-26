import React, { useState } from 'react';
import { 
  WeeklyReport, 
  Course, 
  GradeItem 
} from '../types/report';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Calendar, 
  Award, 
  ListChecks, 
  Layers, 
  CheckCircle2,
  Share2,
  FileCheck
} from 'lucide-react';
import { 
  exportToWord, 
  printToPdf, 
  generateReportMarkdown, 
  copyToClipboard,
  getWordDocumentHTML
} from '../utils/exportUtils';

interface ReportViewerProps {
  reports: WeeklyReport[];
  selectedReportId: string;
  onSelectReportId: (id: string) => void;
  courses: Course[];
  gradeItems: GradeItem[];
  onUpdateReport: (updatedReport: WeeklyReport) => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  reports,
  selectedReportId,
  onSelectReportId,
  courses,
  gradeItems,
  onUpdateReport,
}) => {
  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const [isEditing, setIsEditing] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Editable local state for quick inline editing
  const [editClientName, setEditClientName] = useState(currentReport.clientName);
  const [editReportingPeriod, setEditReportingPeriod] = useState(currentReport.reportingPeriod);
  const [editOverallStatus, setEditOverallStatus] = useState(currentReport.overallStatus);
  const [editOverallGradeDisplay, setEditOverallGradeDisplay] = useState(currentReport.overallGradeDisplay);
  const [editExecutiveSummary, setEditExecutiveSummary] = useState(currentReport.executiveSummary.join('\n'));
  const [editNextWeekActions, setEditNextWeekActions] = useState(currentReport.nextWeekActionItems.join('\n'));
  const [showFullGradebook, setShowFullGradebook] = useState(currentReport.showFullAcctGradebook);

  // Sync edit form when selected report changes
  React.useEffect(() => {
    setEditClientName(currentReport.clientName);
    setEditReportingPeriod(currentReport.reportingPeriod);
    setEditOverallStatus(currentReport.overallStatus);
    setEditOverallGradeDisplay(currentReport.overallGradeDisplay);
    setEditExecutiveSummary(currentReport.executiveSummary.join('\n'));
    setEditNextWeekActions(currentReport.nextWeekActionItems.join('\n'));
    setShowFullGradebook(currentReport.showFullAcctGradebook);
  }, [currentReport]);

  const handleSaveEdits = () => {
    const updated: WeeklyReport = {
      ...currentReport,
      clientName: editClientName,
      reportingPeriod: editReportingPeriod,
      overallStatus: editOverallStatus,
      overallGradeDisplay: editOverallGradeDisplay,
      executiveSummary: editExecutiveSummary.split('\n').filter((l) => l.trim().length > 0),
      nextWeekActionItems: editNextWeekActions.split('\n').filter((l) => l.trim().length > 0),
      showFullAcctGradebook: showFullGradebook,
    };
    onUpdateReport(updated);
    setIsEditing(false);
  };

  const econCourse = courses.find((c) => c.id === 'ECON611') || courses[0];
  const acctCourse = courses.find((c) => c.id === 'ACCT210') || courses[1];

  const econWeeklyItems = gradeItems.filter((i) => currentReport.econWeeklyItemIds.includes(i.id));
  const acctWeeklyItems = gradeItems.filter((i) => currentReport.acctWeeklyItemIds.includes(i.id));
  
  // All ACCT items, individual itemized match to D2L (NO artificial grouping)
  const acctFullGradebook = gradeItems
    .filter((i) => i.courseId === 'ACCT210' && i.isOfficialGradebookItem)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const acctTotalEarned = acctFullGradebook.reduce((sum, item) => sum + (item.scoreEarned ?? 0), 0);
  const acctTotalPossible = acctFullGradebook.reduce((sum, item) => sum + item.pointsPossible, 0);
  const acctCumulativePct = (acctTotalEarned / acctTotalPossible) * 100;

  const handleCopyMarkdown = async () => {
    const md = generateReportMarkdown(currentReport, courses, gradeItems);
    const success = await copyToClipboard(md);
    if (success) {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2200);
    }
  };

  const handleCopyRichHtml = async () => {
    const html = getWordDocumentHTML(currentReport, courses, gradeItems);
    const success = await copyToClipboard(html);
    if (success) {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Week Selector Bar */}
      <div className="no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">
            Reports:
          </span>
          {reports.map((rep) => {
            const isSelected = rep.id === selectedReportId;
            return (
              <button
                key={rep.id}
                type="button"
                onClick={() => onSelectReportId(rep.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{rep.weekLabel}</span>
                {rep.weekNumber === 5 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-blue-900 text-blue-100' : 'bg-emerald-100 text-emerald-800'}`}>
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isEditing 
                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Close Editor' : 'Customize Report'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedMd ? 'Copied MD' : 'Copy MD'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyRichHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Copy as formatted HTML table for Gmail or Outlook"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedHtml ? 'Copied HTML' : 'Copy HTML'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportToWord(currentReport, courses, gradeItems)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={printToPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Edit Drawer if toggled */}
      {isEditing && (
        <div className="no-print bg-amber-50/70 border border-amber-200 rounded-xl p-5 mb-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span>Customize Report Fields Before Export</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdits}
                className="px-3 py-1 text-xs font-bold bg-amber-700 text-white rounded-md hover:bg-amber-800"
              >
                Apply Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Period</label>
              <input
                type="text"
                value={editReportingPeriod}
                onChange={(e) => setEditReportingPeriod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Overall Status & Display</label>
              <input
                type="text"
                value={editOverallGradeDisplay}
                onChange={(e) => setEditOverallGradeDisplay(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary Points (1 per line)</label>
              <textarea
                rows={4}
                value={editExecutiveSummary}
                onChange={(e) => setEditExecutiveSummary(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Next Week's Action Items (1 per line)</label>
              <textarea
                rows={4}
                value={editNextWeekActions}
                onChange={(e) => setEditNextWeekActions(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFullAcctGradebook"
              checked={showFullGradebook}
              onChange={(e) => setShowFullGradebook(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showFullAcctGradebook" className="text-xs font-medium text-slate-700">
              Include full itemized ACCT 210-52 official gradebook table in report (Recommended for Week 5)
            </label>
          </div>
        </div>
      )}

      {/* Main Printable Document Sheet (Exact Client-Grade Layout) */}
      <div 
        id="printable-report"
        className="printable-document bg-white rounded-xl shadow-md border border-slate-200 p-8 sm:p-10 text-slate-800 transition-all"
      >
        {/* Document Header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-blue-700 pb-3 mb-4">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Weekly Academic Progress Report
            </h1>
            <span className="text-sm font-bold text-blue-800 tracking-wide uppercase">
              {currentReport.weekLabel}
            </span>
          </div>

          {/* Meta Grid */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-medium">Reporting Period:</span>
              <span className="font-bold text-blue-900">{currentReport.reportingPeriod}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-medium">Overall Status:</span>
              <span className="inline-flex items-center gap-1 font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {currentReport.overallStatus} ({currentReport.overallGradeDisplay})
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-medium">Courses Covered:</span>
              <span className="font-bold text-blue-900">{econCourse.code} & {acctCourse.code}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600 font-medium">ACCT 210-52 Cumulative:</span>
              <span className="font-bold text-emerald-800">
                {acctTotalEarned.toFixed(2)} / {acctTotalPossible.toFixed(1)} ({acctCumulativePct.toFixed(2)}% A+)
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: ECON 611 */}
        <div className="mt-6 mb-5 page-break-avoid">
          <div className="flex items-center gap-2 mb-2 pb-1 border-l-4 border-blue-600 pl-2.5">
            <h2 className="text-sm font-bold text-blue-900 tracking-tight">
              1. {econCourse.code} – {econCourse.name} ({econCourse.platform})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="py-2 px-3 text-left">Assignment / Task</th>
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-right">Score</th>
                  <th className="py-2 px-3 text-right">Percentage</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {econWeeklyItems.map((item) => {
                  const scoreDisplay = item.scoreEarned !== null 
                    ? `${item.scoreEarned.toFixed(1)} / ${item.pointsPossible.toFixed(1)}`
                    : 'Complete';
                  const pctDisplay = item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%';
                  const isGraded = item.status === 'GRADED';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-slate-900 font-medium">
                        {item.title}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {scoreDisplay}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-blue-900">
                        {pctDisplay}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          isGraded 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: ACCT 210-52 - Work Completed This Week */}
        <div className="mt-6 mb-5 page-break-avoid">
          <div className="flex items-center gap-2 mb-2 pb-1 border-l-4 border-emerald-600 pl-2.5">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              2. {acctCourse.code} – Work Completed This Week ({acctCourse.platform})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="py-2 px-3 text-left">Assignment / Module</th>
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-right">Score</th>
                  <th className="py-2 px-3 text-right">Percentage</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {acctWeeklyItems.map((item) => {
                  const scoreDisplay = item.scoreEarned !== null 
                    ? `${item.scoreEarned.toFixed(1)} / ${item.pointsPossible.toFixed(1)}`
                    : 'Complete';
                  const pctDisplay = item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-slate-900 font-medium">
                        {item.title}
                        {item.notes && (
                          <span className="block text-[11px] text-slate-500 font-normal">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {scoreDisplay}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800">
                        {pctDisplay}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-900">
                          GRADED ({currentReport.weekLabel})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Official Itemized ACCT 210-52 Gradebook (No False Grouping / D2L Exact Match) */}
        {showFullGradebook && (
          <div className="mt-6 mb-5 page-break-avoid">
            <div className="flex items-center justify-between mb-2 pb-1 border-l-4 border-blue-600 pl-2.5">
              <h2 className="text-sm font-bold text-blue-900 tracking-tight">
                3. {acctCourse.code} – Official Itemized Gradebook (Metro State University D2L)
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Verified Portal Records · Zero Bundling
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <th className="py-2 px-3 text-left">Grade Item (As Listed in D2L)</th>
                    <th className="py-2 px-3 text-left">Category</th>
                    <th className="py-2 px-3 text-right">Points Earned / Possible</th>
                    <th className="py-2 px-3 text-right">Percentage</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {acctFullGradebook.map((item) => {
                    const isNewThisWeek = currentReport.acctWeeklyItemIds.includes(item.id);
                    const scoreDisplay = item.scoreEarned !== null 
                      ? `${item.scoreEarned.toFixed(2)} / ${item.pointsPossible.toFixed(1)}` 
                      : '—';
                    const pctDisplay = item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%';
                    
                    return (
                      <tr 
                        key={item.id} 
                        className={isNewThisWeek ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50/50'}
                      >
                        <td className="py-1.5 px-3 text-slate-900">
                          {item.title}
                          {isNewThisWeek && (
                            <span className="ml-2 text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                              NEW
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600">{item.category}</td>
                        <td className="py-1.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                          {scoreDisplay}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {pctDisplay}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isNewThisWeek ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Cumulative Total Row */}
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900">
                    <td className="py-2 px-3" colSpan={2}>
                      ACCT 210-52 Total Points Earned:
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-blue-900">
                      {acctTotalEarned.toFixed(2)} / {acctTotalPossible.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-800">
                      {acctCumulativePct.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-200 text-emerald-900">
                        Grade: A+
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Executive Summary & Next Week's Plan */}
        <div className="mt-6 page-break-avoid bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 text-xs">
          <h3 className="text-sm font-bold text-emerald-900 mb-2.5 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Executive Summary & Next Week's Plan</span>
          </h3>

          <div className="space-y-3">
            <div>
              <p className="font-bold text-emerald-950 mb-1">Key Accomplishments & Standings:</p>
              <ul className="list-disc pl-5 space-y-1 text-emerald-900 leading-relaxed">
                {currentReport.executiveSummary.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-emerald-200/80">
              <p className="font-bold text-emerald-950 mb-1">Upcoming Action Items & Targets:</p>
              <ul className="list-disc pl-5 space-y-1 text-emerald-900 leading-relaxed">
                {currentReport.nextWeekActionItems.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer & Verification Note */}
        <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center text-[10.5px] text-slate-500">
          <div>
            Prepared by <strong className="text-slate-700">{currentReport.preparedBy}</strong> &bull; Client Confidential Report
          </div>
          <div className="font-mono text-slate-400">
            Certified Record &bull; {currentReport.reportingPeriod}
          </div>
        </div>

      </div>

    </div>
  );
};
