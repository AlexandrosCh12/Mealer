import React from 'react';
import { WeeklyCostSummary as WeeklyCostSummaryType } from '../types/meal';

interface WeeklyCostSummaryProps {
  costSummary: WeeklyCostSummaryType;
}

export const WeeklyCostSummary: React.FC<WeeklyCostSummaryProps> = ({ costSummary }) => {
  return (
    <div className="cost-summary-card" style={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Weekly Cost Summary</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Estimated weekly cost:</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#28a745' }}>
            {costSummary.estimated_total}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Best option:</span>
          <span style={{ fontWeight: '500' }}>{costSummary.cheapest_option}</span>
        </div>
        {parseFloat(costSummary.savings_vs_premium.replace(/[^\d.]/g, '')) > 0 && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            color: '#155724',
          }}>
            💰 You save {costSummary.savings_vs_premium} vs premium stores
          </div>
        )}
      </div>
    </div>
  );
};

