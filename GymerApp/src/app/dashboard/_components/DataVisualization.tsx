'use client';

import React from 'react';
import {Bar, BarChart, CartesianGrid, Line, LineChart, XAxis} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {type ChartConfig} from '@/components/ui/chart';

// Define types for the data structure
interface DataPoint {
  month: string;
  desktop: number;
  mobile: number;
  [key: string]: string | number;
}

interface DataVizComponentProps {
  data?: DataPoint[];
  className?: string;
  config?: ChartConfig;
  type?: 'bar' | 'line';
}

const defaultConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb',
  },
  mobile: {
    label: 'Mobile',
    color: '#60a5fa',
  },
} as const;

const defaultData = [
  {month: 'January', desktop: 186, mobile: 80},
  {month: 'February', desktop: 305, mobile: 200},
  {month: 'March', desktop: 237, mobile: 120},
  {month: 'April', desktop: 73, mobile: 190},
  {month: 'May', desktop: 209, mobile: 130},
  {month: 'June', desktop: 214, mobile: 140},
];

export const DataVisualization = ({
  data = defaultData,
  type = 'bar',
  config = defaultConfig,
}: DataVizComponentProps) => {
  return (
    <ChartContainer config={config} className="min-h-[200px] w-full">
      {type === 'bar' ? (
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={value => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        </BarChart>
      ) : (
        <LineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={value => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="desktop"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={{fill: 'var(--color-desktop)', strokeWidth: 0}}
            activeDot={{r: 6, strokeWidth: 0}}
          />
        </LineChart>
      )}
    </ChartContainer>
  );
};

export type {DataPoint, DataVizComponentProps};
export default DataVisualization;
