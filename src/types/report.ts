export type ItemCategory = 
  | 'Discussion'
  | 'Graded HW'
  | 'SmartBook'
  | 'Exam Prep'
  | 'Project'
  | 'Reading'
  | 'Practice';

export type ItemStatus = 'GRADED' | 'SUBMITTED' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';

export interface GradeItem {
  id: string;
  courseId: 'ECON611' | 'ACCT210' | string;
  title: string;
  category: ItemCategory;
  scoreEarned: number | null; // null if pending or ungraded
  pointsPossible: number;
  percentage?: number;
  status: ItemStatus;
  weekNumber: number; // week when completed
  dateCompleted?: string;
  platform: 'Cengage MindTap' | 'Metro State D2L' | 'McGraw-Hill Connect' | string;
  notes?: string;
  isOfficialGradebookItem?: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  institution: string;
  platform: string;
  instructor?: string;
  term: string;
  color: string;
  currentPointsEarned: number;
  currentPointsPossible: number;
}

export interface DiscussionArchiveItem {
  id: string;
  title: string;
  courseId: string;
  weekNumber: number;
  date: string;
  wordCount: number;
  scoreDisplay?: string;
  topicSummary: string;
  keyConcepts: string[];
  fullContent: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  weekLabel: string;
  reportingPeriod: string;
  clientName: string;
  overallStatus: 'EXCELLENT' | 'ON TRACK' | 'SATISFACTORY' | 'ACTION NEEDED';
  overallGradeDisplay: string;
  submissionRate: string;
  executiveSummary: string[];
  nextWeekActionItems: string[];
  econWeeklyItemIds: string[];
  acctWeeklyItemIds: string[];
  showFullAcctGradebook: boolean;
  discussionHighlightIds?: string[];
  preparedBy: string;
}
