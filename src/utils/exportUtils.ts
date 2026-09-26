import { WeeklyReport, Course, GradeItem } from '../types/report';

export function getWordDocumentHTML(
  report: WeeklyReport,
  courses: Course[],
  allItems: GradeItem[]
): string {
  const econCourse = courses.find((c) => c.id === 'ECON611') || courses[0];
  const acctCourse = courses.find((c) => c.id === 'ACCT210') || courses[1];

  const econItems = allItems.filter((i) => report.econWeeklyItemIds.includes(i.id));
  const acctWeeklyItems = allItems.filter((i) => report.acctWeeklyItemIds.includes(i.id));
  const acctFullGradebook = allItems
    .filter((i) => i.courseId === 'ACCT210' && i.isOfficialGradebookItem)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const acctTotalEarned = acctFullGradebook.reduce((sum, item) => sum + (item.scoreEarned ?? 0), 0);
  const acctTotalPossible = acctFullGradebook.reduce((sum, item) => sum + item.pointsPossible, 0);
  const acctCumulativePct = (acctTotalEarned / acctTotalPossible) * 100;

  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${report.weekLabel} Academic Progress Report</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 10pt; color: #2d3748; line-height: 1.4; }
        .doc-title { font-size: 18pt; font-weight: bold; color: #1a202c; margin-bottom: 8px; border-bottom: 2pt solid #2b6cb0; padding-bottom: 4px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; background-color: #ebf8ff; border: 1pt solid #bee3f8; }
        .meta-table td { padding: 6px 10px; font-size: 9.5pt; }
        .meta-label { color: #4a5568; font-weight: bold; }
        .meta-value { color: #2b6cb0; font-weight: bold; }
        .status-pill { background-color: #c6f6d5; color: #22543d; padding: 2px 6px; font-weight: bold; }
        
        .section-title { font-size: 11.5pt; font-weight: bold; color: #2b6cb0; margin-top: 14px; margin-bottom: 6px; border-left: 3pt solid #3182ce; padding-left: 6px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt; }
        table.data-table th { background-color: #edf2f7; color: #4a5568; font-weight: bold; text-align: left; padding: 5px 8px; border: 1pt solid #cbd5e0; }
        table.data-table td { padding: 5px 8px; border: 1pt solid #e2e8f0; }
        tr.total-row td { background-color: #f7fafc; font-weight: bold; border-top: 1.5pt solid #cbd5e0; }
        
        .badge { font-weight: bold; font-size: 8.5pt; padding: 1px 5px; }
        .badge-graded { background-color: #ebf8ff; color: #2b6cb0; }
        .badge-completed { background-color: #c6f6d5; color: #22543d; }
        .badge-new { background-color: #feebc8; color: #7b341e; }
        
        .summary-box { background-color: #f0fff4; border: 1pt solid #c6f6d5; padding: 10px 14px; margin-top: 14px; }
        .summary-box h3 { font-size: 11pt; color: #22543d; margin: 0 0 6px 0; }
        .summary-box ul { margin: 0; padding-left: 18px; font-size: 9pt; color: #2f855a; }
        .summary-box li { margin-bottom: 3px; }
      </style>
    </head>
    <body>
  `;

  const metaHtml = `
    <h1 class="doc-title">Weekly Academic Progress Report (${report.weekLabel})</h1>
    <table class="meta-table">
      <tr>
        <td><span class="meta-label">Client Name:</span> <span class="meta-value">${report.clientName}</span></td>
        <td><span class="meta-label">Overall Status:</span> <span class="status-pill">${report.overallStatus} (${report.overallGradeDisplay})</span></td>
      </tr>
      <tr>
        <td><span class="meta-label">Reporting Period:</span> <span class="meta-value">${report.reportingPeriod}</span></td>
        <td><span class="meta-label">Submission Rate:</span> <span class="meta-value">${report.submissionRate}</span></td>
      </tr>
      <tr>
        <td><span class="meta-label">Courses Covered:</span> <span class="meta-value">${econCourse.code} & ${acctCourse.code}</span></td>
        <td><span class="meta-label">ACCT 210-52 Standing:</span> <span class="meta-value">${acctTotalEarned.toFixed(2)} / ${acctTotalPossible.toFixed(1)} (${acctCumulativePct.toFixed(2)}%)</span></td>
      </tr>
    </table>
  `;

  const econTableHtml = `
    <div class="section-title">1. ${econCourse.code} – ${econCourse.name} (${econCourse.platform})</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Assignment / Task</th>
          <th>Category</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${econItems
          .map(
            (item) => `
          <tr>
            <td><strong>${item.title}</strong></td>
            <td>${item.category}</td>
            <td>${item.scoreEarned !== null ? item.scoreEarned.toFixed(1) : '—'} / ${item.pointsPossible.toFixed(1)}</td>
            <td>${item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%'}</td>
            <td><span class="badge ${item.status === 'GRADED' ? 'badge-graded' : 'badge-completed'}">${item.status}</span></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  const acctWeeklyHtml = `
    <div class="section-title">2. ${acctCourse.code} – Work Completed This Week (${acctCourse.platform})</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Assignment / Module</th>
          <th>Category</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${acctWeeklyItems
          .map(
            (item) => `
          <tr>
            <td><strong>${item.title}</strong></td>
            <td>${item.category}</td>
            <td>${item.scoreEarned !== null ? item.scoreEarned.toFixed(1) : '—'} / ${item.pointsPossible.toFixed(1)}</td>
            <td>${item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%'}</td>
            <td><span class="badge badge-new">${item.status} (${report.weekLabel})</span></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  const acctGradebookHtml = report.showFullAcctGradebook
    ? `
    <div class="section-title">3. ${acctCourse.code} – Official Itemized Gradebook (No Grouping / Exact Match to D2L)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Grade Item (D2L Official)</th>
          <th>Category</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${acctFullGradebook
          .map(
            (item) => `
          <tr>
            <td>${item.title}</td>
            <td>${item.category}</td>
            <td>${item.scoreEarned !== null ? item.scoreEarned.toFixed(2) : '—'} / ${item.pointsPossible.toFixed(1)}</td>
            <td>${item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '100%'}</td>
            <td><span class="badge ${report.acctWeeklyItemIds.includes(item.id) ? 'badge-new' : 'badge-graded'}">${item.status}</span></td>
          </tr>
        `
          )
          .join('')}
        <tr class="total-row">
          <td colspan="2">ACCT 210-52 Cumulative Total Points:</td>
          <td>${acctTotalEarned.toFixed(2)} / ${acctTotalPossible.toFixed(1)}</td>
          <td>${acctCumulativePct.toFixed(2)}%</td>
          <td><span class="badge badge-completed">Grade: A+</span></td>
        </tr>
      </tbody>
    </table>
  `
    : '';

  const summaryHtml = `
    <div class="summary-box">
      <h3>Executive Summary & Next Week's Plan</h3>
      <p style="font-weight: bold; margin-bottom: 4px; color: #22543d;">Key Highlights:</p>
      <ul>
        ${report.executiveSummary.map((s) => `<li>${s}</li>`).join('')}
      </ul>
      <p style="font-weight: bold; margin-top: 8px; margin-bottom: 4px; color: #22543d;">Upcoming Action Items:</p>
      <ul>
        ${report.nextWeekActionItems.map((a) => `<li>${a}</li>`).join('')}
      </ul>
    </div>
  `;

  const footer = `
      <p style="margin-top: 20px; font-size: 8.5pt; color: #718096; border-top: 1pt solid #e2e8f0; padding-top: 6px;">
        Generated by Academic Course Progress Suite &bull; Prepared by ${report.preparedBy} &bull; Verified Grade Records
      </p>
    </body>
    </html>
  `;

  return header + metaHtml + econTableHtml + acctWeeklyHtml + acctGradebookHtml + summaryHtml + footer;
}

export function exportToWord(report: WeeklyReport, courses: Course[], allItems: GradeItem[]) {
  const htmlContent = getWordDocumentHTML(report, courses, allItems);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  document.body.appendChild(downloadLink);
  downloadLink.href = url;
  const safeFilename = `${report.weekLabel.replace(/\s+/g, '_')}_Academic_Progress_Report.doc`;
  downloadLink.download = safeFilename;
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

export function printToPdf() {
  window.print();
}

export function generateReportMarkdown(
  report: WeeklyReport,
  courses: Course[],
  allItems: GradeItem[]
): string {
  const econCourse = courses.find((c) => c.id === 'ECON611') || courses[0];
  const acctCourse = courses.find((c) => c.id === 'ACCT210') || courses[1];

  const econItems = allItems.filter((i) => report.econWeeklyItemIds.includes(i.id));
  const acctWeeklyItems = allItems.filter((i) => report.acctWeeklyItemIds.includes(i.id));
  const acctFullGradebook = allItems
    .filter((i) => i.courseId === 'ACCT210' && i.isOfficialGradebookItem)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const acctTotalEarned = acctFullGradebook.reduce((sum, item) => sum + (item.scoreEarned ?? 0), 0);
  const acctTotalPossible = acctFullGradebook.reduce((sum, item) => sum + item.pointsPossible, 0);
  const acctCumulativePct = (acctTotalEarned / acctTotalPossible) * 100;

  let md = `# 📊 WEEKLY ACADEMIC PROGRESS REPORT (${report.weekLabel.toUpperCase()})\n\n`;
  md += `**Prepared For:** ${report.clientName}  \n`;
  md += `**Reporting Period:** ${report.reportingPeriod}  \n`;
  md += `**Overall Status:** 🟢 **${report.overallStatus} (${report.overallGradeDisplay})**  \n`;
  md += `**Submission Rate:** ${report.submissionRate}  \n`;
  md += `**ACCT 210-52 Cumulative Standing:** **${acctTotalEarned.toFixed(2)} / ${acctTotalPossible.toFixed(1)} Points (${acctCumulativePct.toFixed(2)}% A+)**  \n\n`;
  md += `---\n\n`;

  md += `## Executive Summary\n\n`;
  report.executiveSummary.forEach((point) => {
    md += `* ${point}\n`;
  });
  md += `\n---\n\n`;

  md += `## 1. ${econCourse.code} – ${econCourse.name}\n\n`;
  md += `**Platform:** ${econCourse.platform}  \n\n`;
  md += `| Assignment / Task | Category | Score | Percentage | Status |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: |\n`;
  econItems.forEach((i) => {
    const scoreStr = i.scoreEarned !== null ? `${i.scoreEarned.toFixed(1)} / ${i.pointsPossible.toFixed(1)}` : 'Complete';
    const pctStr = i.percentage !== undefined ? `${i.percentage.toFixed(1)}%` : '100%';
    md += `| **${i.title}** | ${i.category} | **${scoreStr}** | **${pctStr}** | ${i.status} |\n`;
  });
  md += `\n---\n\n`;

  md += `## 2. ${acctCourse.code} – Work Completed This Week\n\n`;
  md += `**Institution:** ${acctCourse.institution} | **Platform:** ${acctCourse.platform}  \n\n`;
  md += `| Assignment / Module | Category | Score | Percentage | Status |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: |\n`;
  acctWeeklyItems.forEach((i) => {
    const scoreStr = i.scoreEarned !== null ? `${i.scoreEarned.toFixed(1)} / ${i.pointsPossible.toFixed(1)}` : 'Complete';
    const pctStr = i.percentage !== undefined ? `${i.percentage.toFixed(1)}%` : '100%';
    md += `| **${i.title}** | ${i.category} | **${scoreStr}** | **${pctStr}** | ${i.status} |\n`;
  });
  md += `\n`;

  if (report.showFullAcctGradebook) {
    md += `### Official ACCT 210-52 Itemized Gradebook (D2L Exact Match)\n\n`;
    md += `| Grade Item (As Listed in D2L) | Category | Score Earned | Percentage | Status |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: |\n`;
    acctFullGradebook.forEach((i) => {
      const isWeekNew = report.acctWeeklyItemIds.includes(i.id);
      const scoreStr = i.scoreEarned !== null ? `${i.scoreEarned.toFixed(2)} / ${i.pointsPossible.toFixed(1)}` : '—';
      const pctStr = i.percentage !== undefined ? `${i.percentage.toFixed(1)}%` : '100%';
      md += `| ${isWeekNew ? `**${i.title}**` : i.title} | ${i.category} | ${scoreStr} | ${pctStr} | ${i.status} ${isWeekNew ? '(New)' : ''} |\n`;
    });
    md += `| **ACCT 210 Cumulative Total** | **Cumulative Standing** | **${acctTotalEarned.toFixed(2)} / ${acctTotalPossible.toFixed(1)}** | **${acctCumulativePct.toFixed(2)}%** | **Grade: A+** |\n\n`;
  }

  md += `---\n\n`;
  md += `## Next Week's Action Items\n\n`;
  report.nextWeekActionItems.forEach((action, idx) => {
    md += `${idx + 1}. ${action}\n`;
  });

  return md;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed', err);
    return false;
  }
}
