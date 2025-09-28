import React from 'react';
import CReport from './CReport';

const CReportDemo = () => {
  const sampleTshirt = {
    id: 123,
    condition: 'excellent',
    condition_confidence: 'certain',
    condition_notes: 'Minor wear on collar, excellent overall condition',
    has_stains: false,
    has_holes: false,
    has_fading: true,
    has_pilling: false,
    has_repairs: false,
    condition_verified: true,
    condition_verified_at: '2024-01-15T10:30:00Z'
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <h2>Vintage C-Report Demo</h2>
      <CReport tshirt={sampleTshirt} />
    </div>
  );
};

export default CReportDemo;