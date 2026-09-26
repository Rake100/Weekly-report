import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  BookOpen, 
  Table, 
  MessageSquare, 
  PlusCircle, 
  Check, 
  Copy
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'reports' | 'gradebook' | 'discussions' | 'builder';
  setActiveTab: (tab: 'reports' | 'gradebook' | 'discussions' | 'builder') => void;
  onPrint: () => void;
  onExportWord: () => void;
  onCopyMarkdown: () => void;
  hasCopied: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onPrint,
  onExportWord,
  onCopyMarkdown,
  hasCopied,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Wordmark & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                Academic Progress Studio
              </div>
              <div className="text-xs text-slate-500 font-medium">
                ECON 611 · ACCT 210-52 Client Manager
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-blue-50 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Weekly Reports</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gradebook')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'gradebook'
                  ? 'bg-blue-50 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Full Gradebook</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussions')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'discussions'
                  ? 'bg-blue-50 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussion Vault</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'bg-blue-50 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Builder</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Exports */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopyMarkdown}
              title="Copy formatted Markdown report to clipboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onExportWord}
              title="Download Microsoft Word .doc report"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              title="Save or Print as PDF (color & background preserved)"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save as PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
