import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReportViewer } from './components/ReportViewer';
import { GradebookManager } from './components/GradebookManager';
import { DiscussionVault } from './components/DiscussionVault';
import { ReportBuilder } from './components/ReportBuilder';
import { 
  initialCourses, 
  initialGradeItems, 
  initialReports, 
  initialDiscussionArchives 
} from './data/initialData';
import { WeeklyReport, GradeItem, DiscussionArchiveItem, Course } from './types/report';
import { 
  printToPdf, 
  exportToWord, 
  generateReportMarkdown, 
  copyToClipboard 
} from './utils/exportUtils';

export default function App() {
  // Local storage state initialization with resilient fallback
  const [courses] = useState<Course[]>(initialCourses);

  const [reports, setReports] = useState<WeeklyReport[]>(() => {
    try {
      const saved = localStorage.getItem('academic_reports_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load reports from localStorage', e);
    }
    return initialReports;
  });

  const [gradeItems, setGradeItems] = useState<GradeItem[]>(() => {
    try {
      const saved = localStorage.getItem('academic_grade_items_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load grade items from localStorage', e);
    }
    return initialGradeItems;
  });

  const [discussions, setDiscussions] = useState<DiscussionArchiveItem[]>(() => {
    try {
      const saved = localStorage.getItem('academic_discussions_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load discussions from localStorage', e);
    }
    return initialDiscussionArchives;
  });

  const [selectedReportId, setSelectedReportId] = useState<string>('report-week-5');
  const [activeTab, setActiveTab] = useState<'reports' | 'gradebook' | 'discussions' | 'builder'>('reports');
  const [hasCopiedNavbar, setHasCopiedNavbar] = useState(false);

  // Persist reports
  useEffect(() => {
    try {
      localStorage.setItem('academic_reports_v1', JSON.stringify(reports));
    } catch (e) {
      console.error(e);
    }
  }, [reports]);

  // Persist grade items
  useEffect(() => {
    try {
      localStorage.setItem('academic_grade_items_v1', JSON.stringify(gradeItems));
    } catch (e) {
      console.error(e);
    }
  }, [gradeItems]);

  // Persist discussions
  useEffect(() => {
    try {
      localStorage.setItem('academic_discussions_v1', JSON.stringify(discussions));
    } catch (e) {
      console.error(e);
    }
  }, [discussions]);

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Navbar actions
  const handlePrint = () => {
    // If not in reports view, switch to reports view first so printable-document is in DOM
    if (activeTab !== 'reports') {
      setActiveTab('reports');
      setTimeout(() => {
        printToPdf();
      }, 150);
    } else {
      printToPdf();
    }
  };

  const handleExportWord = () => {
    exportToWord(currentReport, courses, gradeItems);
  };

  const handleCopyMarkdown = async () => {
    const md = generateReportMarkdown(currentReport, courses, gradeItems);
    const success = await copyToClipboard(md);
    if (success) {
      setHasCopiedNavbar(true);
      setTimeout(() => setHasCopiedNavbar(false), 2000);
    }
  };

  const handleUpdateReport = (updatedReport: WeeklyReport) => {
    setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
  };

  const handleCreateReport = (newReport: WeeklyReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleNavigateToReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('reports');
  };

  // Grade Items Handlers
  const handleAddGradeItem = (item: GradeItem) => {
    setGradeItems((prev) => [item, ...prev]);
  };

  const handleUpdateGradeItem = (updated: GradeItem) => {
    setGradeItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDeleteGradeItem = (id: string) => {
    setGradeItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all coursework grades and weekly reports to default official data?')) {
      setReports(initialReports);
      setGradeItems(initialGradeItems);
      setDiscussions(initialDiscussionArchives);
      setSelectedReportId('report-week-5');
      localStorage.removeItem('academic_reports_v1');
      localStorage.removeItem('academic_grade_items_v1');
      localStorage.removeItem('academic_discussions_v1');
    }
  };

  const handleAddDiscussion = (item: DiscussionArchiveItem) => {
    setDiscussions((prev) => [item, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPrint={handlePrint}
        onExportWord={handleExportWord}
        onCopyMarkdown={handleCopyMarkdown}
        hasCopied={hasCopiedNavbar}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'reports' && (
          <ReportViewer
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReportId={setSelectedReportId}
            courses={courses}
            gradeItems={gradeItems}
            onUpdateReport={handleUpdateReport}
          />
        )}

        {activeTab === 'gradebook' && (
          <GradebookManager
            gradeItems={gradeItems}
            courses={courses}
            onAddGradeItem={handleAddGradeItem}
            onUpdateGradeItem={handleUpdateGradeItem}
            onDeleteGradeItem={handleDeleteGradeItem}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === 'discussions' && (
          <DiscussionVault
            discussions={discussions}
            onAddDiscussion={handleAddDiscussion}
          />
        )}

        {activeTab === 'builder' && (
          <ReportBuilder
            courses={courses}
            gradeItems={gradeItems}
            existingReports={reports}
            onCreateReport={handleCreateReport}
            onNavigateToReport={handleNavigateToReport}
          />
        )}
      </main>

      {/* Print-Only hidden report holder if user hits print while in another tab */}
      {activeTab !== 'reports' && (
        <div className="hidden print-only">
          <ReportViewer
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReportId={setSelectedReportId}
            courses={courses}
            gradeItems={gradeItems}
            onUpdateReport={handleUpdateReport}
          />
        </div>
      )}
    </div>
  );
}
