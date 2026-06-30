import React from 'react';

export default function SkeletonLoader({ count = 1, type = 'card' }) {
  const Skeletons = Array(count).fill(0).map((_, i) => (
    <div key={i} style={{
      width: '100%',
      height: type === 'card' ? '120px' : type === 'list-item' ? '70px' : type === 'text' ? '20px' : '60px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: type === 'text' ? '4px' : '12px',
      marginBottom: type === 'text' ? '8px' : '10px'
    }} />
  ));

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {Skeletons}
    </>
  );
}
