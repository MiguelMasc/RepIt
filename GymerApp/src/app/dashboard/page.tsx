import React from 'react';
import {AIQuestionContainer} from './_components/AIQuestionContainer';
import dynamic from 'next/dynamic';
const DataVisualization = dynamic(
  () => import('./_components/DataVisualization'),
  {
    ssr: false,
  },
);
import {getDashboardMetrics} from '@/server/api/dashboard';

export default async function DashboardPage() {
  // Fetch accurate metrics from server utilities
  const {kpis, trendData} = await getDashboardMetrics();

  const trendConfig = {
    desktop: {label: 'Sessions', color: '#7c3aed'},
    mobile: {label: 'Intensity', color: '#22c55e'},
  } as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {kpi.label}
              </div>
              <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* AI / Today Focus */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Ask RepIt
          </h2>
          <AIQuestionContainer />
        </div>

        {/* Trends */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Training trends
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last 6 months
            </div>
          </div>
          <DataVisualization
            data={trendData}
            type="line"
            config={trendConfig}
          />
        </div>

        {/* Sessions Section
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Sessions
          </h2>
          <Suspense fallback={<div>Loading sessions...</div>}>
            <SessionsList />
          </Suspense>
        </div> */}

        {/* Supplements Section
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Supplements
          </h2>
          <Suspense fallback={<div>Loading supplements...</div>}>
            <SupplementsList />
          </Suspense>
        </div> */}

        {/* Goals Section
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Goals
          </h2>
          <Suspense fallback={<div>Loading goals...</div>}>
            <GoalsList />
          </Suspense>
        </div> */}
      </div>
    </div>
  );
}
