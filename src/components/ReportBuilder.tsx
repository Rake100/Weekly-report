import React, { useState } from 'react';
import { WeeklyReport, Course, GradeItem } from '../types/report';
import { 
  PlusCircle, 
  Sparkles, 
  Check, 
  FileText, 
  ArrowRight, 
  Calendar, 
  BookOpen, 
  Layers,
  CheckCircle2
} from 'lucide-react';

interface ReportBuilderProps {
  courses: Course[];
  gradeItems: GradeItem[];
  existingReports: WeeklyReport[];
  onCreateReport: (report: WeeklyReport) => void;
  onNavigateToReport: (reportId: string) => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  courses,
  gradeItems,
  existingReports,
  onCreateReport,
  onNavigateToReport,
}) => {
  // Determine next week number
  const maxWeek = Math.max(...existingReports.map((r) => r.weekNumber), 5);
  const nextWeekNumber = maxWeek + 1;

  const [weekNumber, setWeekNumber] = useState<number>(nextWeekNumber);
  const [weekLabel, setWeekLabel] = useState<string>(`Week ${nextWeekNumber}`);
  const [reportingPeriod, setReportingPeriod] = useState<string>('Week Ending October 3, 2026');
  const [clientName, setClientName] = useState<string>('Client');
  const [overallStatus, setOverallStatus] = useState<'EXCELLENT' | 'ON TRACK' | 'SATISFACTORY'>('EXCELLENT');
  const [overallGradeDisplay, setOverallGradeDisplay] = useState<string>('99.6% Avg');
  const [submissionRate, setSubmissionRate] = useState<string>('100% Complete & On Time');
  const [showFullGradebook, setShowFullGradebook] = useState<boolean>(true);

  // Selected item IDs for this week's report
  const econAvailableItems = gradeItems.filter((i) => i.courseId === 'ECON611');
  const acctAvailableItems = gradeItems.filter((i) => i.courseId === 'ACCT210');

  const [selectedEconIds, setSelectedEconIds] = useState<string[]>([]);
  const [selectedAcctIds, setSelectedAcctIds] = useState<string[]>([]);

  // Default bullet points
  const [execSummaryText, setExecSummaryText] = useState<string>(
    `Flawless progression across both courses with top marks maintained.\nACCT 210-52: Completed Chapter 6 Homework (20/20 pts) and contributed prompt to Discussion 5.\nECON 611: Finished Chapter 6 modules and homework with high scores in MindTap.`
  );
  const [nextWeekActionsText, setNextWeekActionsText] = useState<string>(
    `ACCT 210-52: Complete Chapter 7 SmartBook & Homework sets.\nECON 611: Review Chapter 7 market efficiency and taxation modules.`
  );

  const toggleEconItem = (id: string) => {
    setSelectedEconIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAcctItem = (id: string) => {
    setSelectedAcctIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reportId = `report-week-${weekNumber}-${Date.now()}`;
    const newReport: WeeklyReport = {
      id: reportId,
      weekNumber,
      weekLabel,
      reportingPeriod,
      clientName,
      overallStatus,
      overallGradeDisplay,
      submissionRate,
      preparedBy: 'Academic Course Manager',
      executiveSummary: execSummaryText.split('\n').filter((l) => l.trim().length > 0),
      nextWeekActionItems: nextWeekActionsText.split('\n').filter((l) => l.trim().length > 0),
      econWeeklyItemIds: selectedEconIds.length > 0 ? selectedEconIds : econAvailableItems.slice(-2).map((i) => i.id),
      acctWeeklyItemIds: selectedAcctIds.length > 0 ? selectedAcctIds : acctAvailableItems.slice(-3).map((i) => i.id),
      showFullAcctGradebook: showFullGradebook,
    };

    onCreateReport(newReport);
    onNavigateToReport(reportId);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Create New Weekly Progress Report
            </h2>
            <p className="text-xs text-slate-500">
              Generate a tailored weekly report for your client for Week {nextWeekNumber} or any reporting cycle.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6 text-xs">
          
          {/* Section 1: Period & Metadata */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-3">
              1. Report Period & Identifiers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Week Label</label>
                <input
                  type="text"
                  required
                  value={weekLabel}
                  onChange={(e) => setWeekLabel(e.target.value)}
                  placeholder="e.g. Week 6"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Week Number</label>
                <input
                  type="number"
                  required
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reporting Period Date</label>
                <input
                  type="text"
                  required
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  placeholder="Week Ending Oct 3, 2026"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overall Status</label>
                <select
                  value={overallStatus}
                  onChange={(e) => setOverallStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800 font-bold"
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="ON TRACK">ON TRACK</option>
                  <option value="SATISFACTORY">SATISFACTORY</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade Display Text</label>
                <input
                  type="text"
                  value={overallGradeDisplay}
                  onChange={(e) => setOverallGradeDisplay(e.target.value)}
                  placeholder="99.6% Avg"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Choose ECON 611 Items to Include */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              2. Select ECON 611 Items Completed for this Week
            </span>
            <p className="text-[11px] text-slate-500 mb-3">
              Pick the assignments, practice modules, and readings from Cengage MindTap completed during this week.
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 bg-white p-3 rounded-md border border-slate-200">
              {econAvailableItems.map((item) => {
                const isSelected = selectedEconIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEconItem(item.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.scoreEarned !== null ? `${item.scoreEarned}/${item.pointsPossible}` : 'Complete'} &bull; W{item.weekNumber}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Choose ACCT 210 Items to Include */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              3. Select ACCT 210-52 Items Completed for this Week
            </span>
            <p className="text-[11px] text-slate-500 mb-3">
              Pick the homeworks, discussions, and SmartBook chapters completed during this reporting cycle.
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 bg-white p-3 rounded-md border border-slate-200">
              {acctAvailableItems.map((item) => {
                const isSelected = selectedAcctIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAcctItem(item.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{item.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.scoreEarned !== null ? `${item.scoreEarned}/${item.pointsPossible}` : 'Complete'} &bull; W{item.weekNumber}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="builderIncludeGradebook"
                checked={showFullGradebook}
                onChange={(e) => setShowFullGradebook(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="builderIncludeGradebook" className="text-slate-700 font-semibold text-[11.5px]">
                Include Full Itemized ACCT 210-52 Official D2L Gradebook in report
              </label>
            </div>
          </div>

          {/* Section 4: Executive Summary & Next Week Focus */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-3">
              4. Executive Highlights & Next Week's Plan
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Executive Summary Points (1 bullet per line)
                </label>
                <textarea
                  rows={4}
                  required
                  value={execSummaryText}
                  onChange={(e) => setExecSummaryText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-slate-800 font-mono text-xs leading-relaxed"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upcoming Action Items (1 item per line)
                </label>
                <textarea
                  rows={4}
                  required
                  value={nextWeekActionsText}
                  onChange={(e) => setNextWeekActionsText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-slate-800 font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs text-xs transition-colors"
            >
              <span>Generate & View Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
