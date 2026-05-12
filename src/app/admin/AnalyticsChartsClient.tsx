"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

export default function AnalyticsChartsClient({
  countryData,
  browserData,
  deviceData,
  brandData,
  visitsData
}: {
  countryData: { name: string, value: number }[],
  browserData: { name: string, value: number }[],
  deviceData: { name: string, value: number }[],
  brandData: { name: string, value: number }[],
  visitsData: {
    day: { label: string, count: number }[],
    week: { label: string, count: number }[],
    month: { label: string, count: number }[],
    year: { label: string, count: number }[]
  }
}) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const currentVisits = visitsData[period];

  const visitsChartData = {
    labels: currentVisits.map(d => d.label),
    datasets: [{
      label: 'Visites',
      data: currentVisits.map(d => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }]
  };

  const visitsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const backgroundColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', 
    '#14b8a6', '#f97316', '#6366f1', '#ec4899', '#84cc16'
  ];

  // Country Chart (Horizontal Bar)
  const countryChartData = {
    labels: countryData.map(d => d.name),
    datasets: [{
      label: 'Visiteurs',
      data: countryData.map(d => d.value),
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }]
  };

  const countryChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  };

  // Browser Chart (Doughnut)
  const browserChartData = {
    labels: browserData.map(d => d.name),
    datasets: [{
      data: browserData.map(d => d.value),
      backgroundColor: backgroundColors.slice(0, browserData.length),
      borderWidth: 1,
    }]
  };

  const browserChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' as const } }
  };

  // Device Chart (Pie)
  const deviceChartData = {
    labels: deviceData.map(d => d.name),
    datasets: [{
      data: deviceData.map(d => d.value),
      backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
      borderWidth: 1,
    }]
  };

  const deviceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  // Brand Chart (Bar)
  const brandChartData = {
    labels: brandData.map(d => d.name),
    datasets: [{
      label: 'Marque',
      data: brandData.map(d => d.value),
      backgroundColor: '#8b5cf6',
      borderRadius: 4,
    }]
  };

  const brandChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
      
      {/* NOUVEAU GRAPHIQUE DES VISITES */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '2.5rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>📈 Évolution des Visites</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Analyse du trafic humain dédoublonné</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: period === p ? 'white' : 'transparent',
                  color: period === p ? '#3b82f6' : '#64748b',
                  boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '350px', position: 'relative' }}>
          <Line data={visitsChartData} options={visitsChartOptions} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>🌍 Analytics de l'Audience</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Origine Géographique</h3>
          <div style={{ height: '250px' }}>
            <Bar data={countryChartData} options={countryChartOptions} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Navigateurs Web</h3>
          <div style={{ height: '250px' }}>
            <Doughnut data={browserChartData} options={browserChartOptions} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Type d'Appareil</h3>
          <div style={{ height: '250px' }}>
            <Pie data={deviceChartData} options={deviceChartOptions} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Constructeurs (Marques)</h3>
          <div style={{ height: '250px' }}>
            <Bar data={brandChartData} options={brandChartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}
