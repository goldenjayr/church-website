import { format } from 'date-fns';

export function exportToCSV(data: any, filename: string = 'dashboard-export') {
  const csvContent = convertToCSV(data);
  downloadFile(csvContent, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
}

export function exportToJSON(data: any, filename: string = 'dashboard-export') {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
}

function convertToCSV(data: any): string {
  const lines: string[] = [];
  
  // Stats section
  lines.push('DASHBOARD STATISTICS');
  lines.push('Category,Value');
  if (data.stats) {
    Object.entries(data.stats).forEach(([key, value]) => {
      lines.push(`"${formatKey(key)}","${value}"`);
    });
  }
  
  lines.push('');
  lines.push('CONTENT OVERVIEW');
  lines.push('Type,Published,Drafts,Total');
  if (data.contentOverview) {
    Object.entries(data.contentOverview).forEach(([key, value]: [string, any]) => {
      lines.push(`"${formatKey(key)}","${value.published}","${value.drafts}","${value.total}"`);
    });
  }
  
  lines.push('');
  lines.push('RECENT ACTIVITY');
  lines.push('Type,Title,Description,User,Date');
  if (data.recentActivity) {
    data.recentActivity.forEach((activity: any) => {
      lines.push(`"${activity.type}","${activity.title}","${activity.description}","${activity.user}","${format(new Date(activity.createdAt), 'yyyy-MM-dd HH:mm')}"`);
    });
  }
  
  return lines.join('\n');
}

function formatKey(key: string): string {
  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateDashboardReport(data: any): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(50));
  lines.push('CHURCH DASHBOARD REPORT');
  lines.push(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`);
  lines.push('='.repeat(50));
  lines.push('');
  
  if (data.stats) {
    lines.push('📊 STATISTICS SUMMARY');
    lines.push('-'.repeat(30));
    lines.push(`Total Members: ${data.stats.totalMembers}`);
    lines.push(`New Members (This Month): ${data.stats.monthlyMembers || 0}`);
    lines.push(`Total Blog Posts: ${data.stats.totalBlogPosts}`);
    lines.push(`Upcoming Events: ${data.stats.upcomingEvents}`);
    lines.push(`Active Prayer Requests: ${data.stats.prayerRequests}`);
    lines.push(`Unread Messages: ${data.stats.unreadMessages}`);
    lines.push(`Messages Today: ${data.stats.todayMessages || 0}`);
    lines.push(`Pending Volunteers: ${data.stats.pendingVolunteers || 0}`);
    lines.push(`Published Testimonials: ${data.stats.totalTestimonials || 0}`);
    lines.push('');
  }
  
  if (data.contentOverview) {
    lines.push('📝 CONTENT OVERVIEW');
    lines.push('-'.repeat(30));
    Object.entries(data.contentOverview).forEach(([key, value]: [string, any]) => {
      lines.push(`${formatKey(key)}:`);
      lines.push(`  • Published: ${value.published}`);
      lines.push(`  • Drafts: ${value.drafts}`);
      lines.push(`  • Total: ${value.total}`);
    });
    lines.push('');
  }
  
  if (data.recentActivity && data.recentActivity.length > 0) {
    lines.push('🕐 RECENT ACTIVITY');
    lines.push('-'.repeat(30));
    data.recentActivity.forEach((activity: any, index: number) => {
      lines.push(`${index + 1}. ${activity.title}`);
      lines.push(`   ${activity.description}`);
      lines.push(`   By: ${activity.user} | ${format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}`);
      lines.push('');
    });
  }
  
  lines.push('='.repeat(50));
  lines.push('END OF REPORT');
  
  return lines.join('\n');
}
