import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function MarketSparkline({ data, width = 100, height = 30, color = 'var(--primary)' }: SparklineProps) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const trendColor = data[data.length - 1] >= data[0] ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={trendColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Small dot at the end */}
      <circle 
        cx={width} 
        cy={height - ((data[data.length - 1] - min) / range) * height} 
        r="3" 
        fill={trendColor} 
      />
    </svg>
  );
}
