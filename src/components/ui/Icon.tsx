import React from 'react';

const P: Record<string, string> = {
  target: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a5 5 0 100 10 5 5 0 000-10zm0 4a1 1 0 100 2 1 1 0 000-2z',
  swap: 'M7 7h10l-3-3m3 3l-3 3M17 17H7l3-3m-3 3l3 3',
  grid: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  table: 'M4 5h16v14H4V5zm0 5h16M9 10v9',
  matrix: 'M4 4h16v16H4V4zm5.3 0v16M14.7 4v16M4 9.3h16M4 14.7h16',
  branch: 'M7 4v6a3 3 0 003 3h4a3 3 0 013 3v4M7 4a2 2 0 110 4 2 2 0 010-4zm10 12a2 2 0 110 4 2 2 0 010-4z',
  bolt: 'M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  history: 'M3 12a9 9 0 109-9 9 9 0 00-7.5 4M3 4v4h4M12 7v5l3.5 2',
  ruler: 'M3 9l6-6 12 12-6 6L3 9zm4-1l2 2m1-5l2 2m1-5l2 2',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  up: 'M12 20V5m0 0l-6 6m6-6l6 6',
  clipboard: 'M9 4h6v3H9V4zM7 5H5v15h14V5h-2M9 11h6M9 15h4',
  route: 'M6 19a2 2 0 100-4 2 2 0 000 4zm12-10a2 2 0 100-4 2 2 0 000 4zM6 15V9a3 3 0 013-3h6',
  play: 'M6 4l14 8-14 8V4z',
  alert: 'M12 3l10 18H2L12 3zm0 6v5m0 3h.01',
  check: 'M4 12l5 5L20 6',
  award: 'M12 3a5 5 0 100 10 5 5 0 000-10zm-3 10l-2 8 5-3 5 3-2-8',
  home: 'M3 11l9-8 9 8M6 10v10h12V10',
  book: 'M4 4h7a3 3 0 013 3v13a3 3 0 00-3-3H4V4zm16 0h-3a3 3 0 00-3 3v13a3 3 0 013-3h3V4z',
  tools: 'M14 3a5 5 0 016 6l-9 9-4 1 1-4 6-6M3 21l4-4',
  chart: 'M4 20V10m5 10V4m5 16v-7m5 7V8',
  file: 'M13 3H6v18h12V8l-5-5zm0 0v5h5',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V5h6v2m-8 0l1 13h8l1-13',
  edit: 'M4 20h4L20 8l-4-4L4 16v4z',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zm9 16l-4.5-4.5',
  x: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
  chevronD: 'M6 9l6 6 6-6',
  print: 'M7 8V3h10v5M7 18H4v-7h16v7h-3M7 14h10v7H7v-7z',
  download: 'M12 3v12m0 0l-5-5m5 5l5-5M4 21h16',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v1m0 3v6',
  lock: 'M6 11h12v9H6v-9zm3 0V8a3 3 0 016 0v3',
  refresh: 'M3 12a9 9 0 0115.5-6.2M21 12a9 9 0 01-15.5 6.2M18 3v4h-4M6 21v-4h4',
  copy: 'M9 9h10v12H9V9zM5 15H3V3h12v2',
  drag: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  flag: 'M5 21V4h13l-2.5 4L18 12H5',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v5l3 2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
};

export function Icon({ name, className = 'w-5 h-5', strokeWidth = 1.7 }: { name: string; className?: string; strokeWidth?: number }) {
  const d = P[name] ?? P.info;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
