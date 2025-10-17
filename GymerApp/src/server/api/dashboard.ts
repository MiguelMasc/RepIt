'use server';

import {getSessionHistory} from '@/server/api/sessions';
import {getGoalHistory} from '@/server/api/goals';
import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';

export type DashboardKpi = {label: string; value: string};
export type DashboardTrendPoint = {month: string; desktop: number; mobile: number};
export type DashboardMetrics = {kpis: DashboardKpi[]; trendData: DashboardTrendPoint[]};

function getIsoDateString(date: Date): string {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

function countSessionsInRange(sessions: {date: Date}[], start: Date, end: Date): number {
  return sessions.reduce((count, s) => (isWithinInterval(s.date, {start, end}) ? count + 1 : count), 0);
}

function computeSevenDayConsistency(sessions: {date: Date}[]): number {
  const today = startOfDay(new Date());
  const start = startOfDay(subDays(today, 6));
  const daysWithSession = new Set<string>();

  for (const s of sessions) {
    if (isWithinInterval(s.date, {start, end: today})) {
      daysWithSession.add(getIsoDateString(s.date));
    }
  }

  return Math.round((daysWithSession.size / 7) * 100);
}

function computeCurrentStreakDays(sessions: {date: Date}[]): number {
  if (sessions.length === 0) return 0;
  const byDay = new Set<string>(sessions.map(s => getIsoDateString(s.date)));
  let streak = 0;
  let cursor = startOfDay(new Date());

  // Count today if a session exists today
  while (byDay.has(getIsoDateString(cursor))) {
    streak += 1;
    cursor = startOfDay(subDays(cursor, 1));
  }

  return streak;
}

function buildLastSixMonthsTrend(sessions: {date: Date}[]): DashboardTrendPoint[] {
  const now = new Date();
  const points: DashboardTrendPoint[] = [];

  // Oldest to newest: 5 months ago up to current month
  for (let i = 5; i >= 0; i -= 1) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(monthStart);
    const count = countSessionsInRange(sessions, monthStart, monthEnd);
    points.push({month: format(monthStart, 'MMM'), desktop: count, mobile: 0});
  }

  return points;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [sessions, goals] = await Promise.all([getSessionHistory(), getGoalHistory()]);

  // Sessions this week
  const startWeek = startOfWeek(new Date(), {weekStartsOn: 1});
  const endWeek = endOfWeek(new Date(), {weekStartsOn: 1});
  const sessionsThisWeek = countSessionsInRange(sessions, startWeek, endWeek);

  // Consistency and streak
  const consistency7dPct = computeSevenDayConsistency(sessions);
  const streakDays = computeCurrentStreakDays(sessions);

  // Active goals
  const today = startOfDay(new Date());
  const activeGoals = goals.filter(g => !g.completed && (isAfter(g.dueDate, today) || isSameDay(g.dueDate, today))).length;

  // Trend data (last 6 months, by month)
  const trendData = buildLastSixMonthsTrend(sessions);

  const kpis: DashboardKpi[] = [
    {label: 'Consistency (7d)', value: `${consistency7dPct}%`},
    {label: 'Sessions this week', value: `${sessionsThisWeek}`},
    {label: 'Active goals', value: `${activeGoals}`},
    {label: 'Streak', value: `${streakDays} ${streakDays === 1 ? 'day' : 'days'}`},
  ];

  return {kpis, trendData};
}


