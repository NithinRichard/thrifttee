import React from 'react';
import './CReport.css';

const CReport = ({ tshirt }) => {
  if (!tshirt) return null;

  const serialNumber = `CR-${tshirt.id}`;
  const originalityScore = tshirt.condition_confidence === 'certain' ? 9 : 
                          tshirt.condition_confidence === 'mostly_certain' ? 7 : 
                          tshirt.condition_confidence === 'unsure' ? 5 : 3;
  const primaryFlaw = tshirt.condition_notes;
  const materialCondition = {
    'Stains': tshirt.has_stains,
    'Holes': tshirt.has_holes,
    'Fading': tshirt.has_fading,
    'Pilling': tshirt.has_pilling
  };
  const hasIssues = Object.values(materialCondition).some(Boolean);

  return (
    <div className="c-report">
      <div className="stamped-header">
        <div className="serial-stamp">Item #{serialNumber}</div>
        <div className="condition-badge">
          {tshirt.condition?.replace('_', ' ').toUpperCase() || 'GOOD'}
        </div>
      </div>

      <div className="condition-summary">
        <div className="condition-score">
          <label>Condition Score</label>
          <div className="score-display">
            <span className="score-number">{originalityScore}</span>
            <span className="score-max">/10</span>
          </div>
        </div>
        
        {primaryFlaw && (
          <div className="condition-notes">
            <label>Notes</label>
            <p>{primaryFlaw}</p>
          </div>
        )}
      </div>

      {hasIssues && (
        <div className="condition-details">
          <label>Condition Details</label>
          <div className="condition-list">
            {Object.entries(materialCondition).map(([material, checked]) => (
              checked && (
                <div key={material} className="condition-item">
                  <span className="condition-icon">•</span>
                  <span>Minor {material.toLowerCase()}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {(tshirt.pit_to_pit || tshirt.front_length) && (
        <div className="measurements">
          <label>Key Measurements</label>
          <div className="measurement-grid">
            {tshirt.pit_to_pit && <div>Chest: {tshirt.pit_to_pit}"</div>}
            {tshirt.front_length && <div>Length: {tshirt.front_length}"</div>}
          </div>
        </div>
      )}

      {tshirt.condition_verified && (
        <div className="verification-seal">
          <span className="verified-icon">✓</span>
          <span>Staff Verified</span>
        </div>
      )}
    </div>
  );
};

export default CReport;