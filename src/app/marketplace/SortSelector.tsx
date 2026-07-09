'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
  { value: 'numero-desc', label: 'N° le plus récent', icon: '🔢' },
  { value: 'numero-asc',  label: 'N° le plus ancien', icon: '🔡' },
  { value: 'date-desc',   label: 'Date de parution ↓', icon: '📅' },
  { value: 'date-asc',    label: 'Date de parution ↑', icon: '📅' },
  { value: 'prix-asc',    label: 'Prix croissant',      icon: '💸' },
  { value: 'prix-desc',   label: 'Prix décroissant',    icon: '💰' },
];

export default function SortSelector({ current }: { current: string }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const params    = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = new URLSearchParams(params.toString());
    p.set('tri', e.target.value);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        Trier par
      </span>
      <div style={{ position: 'relative' }}>
        <select
          value={current}
          onChange={handleChange}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.45rem 2.2rem 0.45rem 0.85rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--foreground)',
            cursor: 'pointer',
            outline: 'none',
            lineHeight: 1.4,
            minWidth: '180px',
          }}
        >
          {OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.icon}  {o.label}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <span style={{
          position: 'absolute', right: '0.7rem', top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none', fontSize: '0.65rem',
          color: 'var(--muted)'
        }}>▼</span>
      </div>
    </div>
  );
}
