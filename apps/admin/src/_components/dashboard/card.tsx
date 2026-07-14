'use client';

import React from 'react';

type ICardProps = {
  title: string;
  value: string;
  icon?: React.JSX.Element;
  borderColor: string;
  iconBg?: string;
  svg?: boolean;
  anotherTitle?: string;
  anotherValue?: string;
};

const Card = ({ item }: { item: ICardProps }) => {
  return (
    <div className="surface-card p-4 border-1 border-round-lg shadow-1 flex align-items-center gap-3 w-full" style={{ border: '1px solid var(--surface-border)', minHeight: '100px' }}>
      {/* Icon Area */}
      {item.icon && (
        <div 
          className="flex align-items-center justify-content-center border-round-lg" 
          style={{ 
            width: '3rem', 
            height: '3rem', 
            backgroundColor: '#eff4ff', 
            color: 'var(--primary-color)', 
            fontSize: '1.5rem',
            flexShrink: 0 
          }}
        >
          {!item.svg ? item.icon : ""}
        </div>
      )}
      
      {/* Text Metrics Area */}
      <div className="flex-grow-1 min-w-0">
        {/* Subtitles / Categories */}
        <div className="flex justify-content-between align-items-center mb-1">
          <span className="text-xs font-bold text-500 uppercase tracking-wider block truncate" style={{ letterSpacing: '0.05em' }}>
            {item.title}
          </span>
          {item.anotherTitle && (
            <span className="text-xs font-bold text-500 uppercase tracking-wider block truncate" style={{ letterSpacing: '0.05em' }}>
              {item.anotherTitle}
            </span>
          )}
        </div>
        
        {/* Metric Values */}
        <div className="flex justify-content-between align-items-baseline">
          <span className="text-2xl font-bold text-900 block" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
            {item.value}
          </span>
          {item.anotherValue && (
            <span className="text-lg font-bold text-primary block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {item.anotherValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
