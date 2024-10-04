// src/index.umd.ts

import SimpleSparkLineChart from './simple-sparkline-chart';

// Attach to the global window object
if (typeof window !== 'undefined') {
  (window as any).SimpleSparkLineChart = SimpleSparkLineChart;
}