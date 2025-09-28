import React from 'react';

const SimpleConditionCard = ({ tshirt }) => {
  if (!tshirt) return null;

  const hasIssues = tshirt.has_stains || tshirt.has_holes || tshirt.has_fading || tshirt.has_pilling || tshirt.has_repairs;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-vintage font-bold text-vintage-600">Item Condition</h3>
        {tshirt.condition_verified && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-gray-600 mb-2">Overall Condition</div>
          <div className="text-2xl font-vintage font-bold text-vintage-600 mb-2">
            {tshirt.condition?.replace('_', ' ').toUpperCase() || 'GOOD'}
          </div>
          {tshirt.condition_notes && (
            <p className="text-gray-700 text-sm italic">"{tshirt.condition_notes}"</p>
          )}
        </div>

        {hasIssues && (
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-2">Condition Notes</div>
            <div className="space-y-1">
              {tshirt.has_stains && <div className="text-sm text-red-600">• Minor staining</div>}
              {tshirt.has_holes && <div className="text-sm text-red-600">• Small holes present</div>}
              {tshirt.has_fading && <div className="text-sm text-yellow-600">• Some fading</div>}
              {tshirt.has_pilling && <div className="text-sm text-yellow-600">• Light pilling</div>}
              {tshirt.has_repairs && <div className="text-sm text-blue-600">• Previous repairs</div>}
            </div>
          </div>
        )}
      </div>

      {(tshirt.pit_to_pit || tshirt.front_length) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-semibold text-gray-600 mb-2">Key Measurements</div>
          <div className="flex gap-4 text-sm">
            {tshirt.pit_to_pit && <span>Chest: {tshirt.pit_to_pit}"</span>}
            {tshirt.front_length && <span>Length: {tshirt.front_length}"</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleConditionCard;