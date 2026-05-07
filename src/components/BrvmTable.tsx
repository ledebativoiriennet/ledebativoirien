import React from 'react';

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export default function BrvmTable({ stocks }: { stocks: Stock[] }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '1rem 0.5rem', fontWeight: 800 }}>Symbole</th>
            <th style={{ padding: '1rem 0.5rem', fontWeight: 800 }}>Désignation</th>
            <th style={{ padding: '1rem 0.5rem', fontWeight: 800, textAlign: 'right' }}>Cours (FCFA)</th>
            <th style={{ padding: '1rem 0.5rem', fontWeight: 800, textAlign: 'right' }}>Var. %</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stock.symbol}</td>
              <td style={{ padding: '0.75rem 0.5rem' }}>{stock.name}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{stock.price}</td>
              <td style={{ 
                padding: '0.75rem 0.5rem', 
                textAlign: 'right', 
                fontWeight: 'bold',
                color: stock.trend === 'UP' ? '#22c55e' : stock.trend === 'DOWN' ? '#ef4444' : 'inherit'
              }}>
                {stock.trend === 'UP' ? '+' : ''}{stock.change}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
