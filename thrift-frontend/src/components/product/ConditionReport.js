import React from 'react';
import { motion } from 'framer-motion';

const ConditionReport = ({ tshirt }) => {
  if (!tshirt) return null;

  const conditionInfo = {
    has_stains: tshirt.has_stains,
    has_holes: tshirt.has_holes,
    has_fading: tshirt.has_fading,
    has_pilling: tshirt.has_pilling,
    has_repairs: tshirt.has_repairs,
  };

  const measurements = {
    pit_to_pit: tshirt.pit_to_pit,
    shoulder_to_shoulder: tshirt.shoulder_to_shoulder,
    front_length: tshirt.front_length,
    back_length: tshirt.back_length,
    sleeve_length: tshirt.sleeve_length,
    weight_grams: tshirt.weight_grams,
  };

  const hasConditionIssues = Object.values(conditionInfo).some(Boolean);
  const hasMeasurements = Object.values(measurements).some(val => val !== null && val !== undefined);

  const getConditionBadgeClass = (condition) => {
    const badgeClasses = {
      'new_with_tags': 'bg-green-100 text-green-800 border-green-200',
      'new_without_tags': 'bg-green-100 text-green-800 border-green-200',
      'excellent': 'bg-blue-100 text-blue-800 border-blue-200',
      'very_good': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'good': 'bg-orange-100 text-orange-800 border-orange-200',
      'fair': 'bg-red-100 text-red-800 border-red-200',
      'poor': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badgeClasses[condition] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceBadgeClass = (confidence) => {
    const badgeClasses = {
      'certain': 'bg-green-100 text-green-800',
      'mostly_certain': 'bg-blue-100 text-blue-800',
      'unsure': 'bg-yellow-100 text-yellow-800',
      'guessing': 'bg-orange-100 text-orange-800',
    };
    return badgeClasses[confidence] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h3 className="text-xl font-vintage font-bold text-gray-900 mb-4">
        Condition Report
      </h3>

      {/* Condition Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConditionBadgeClass(tshirt.condition)}`}>
          {tshirt.condition_display || tshirt.condition.replace('_', ' ').toUpperCase()}
        </span>
        {tshirt.condition_confidence && (
          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeClass(tshirt.condition_confidence)}`}>
            {tshirt.condition_confidence.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Condition Notes */}
      {tshirt.condition_notes && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Condition Notes</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {tshirt.condition_notes}
          </p>
        </div>
      )}

      {/* Condition Issues */}
      {hasConditionIssues && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Condition Details</h4>
          <div className="flex flex-wrap gap-2">
            {tshirt.has_stains && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Has Stains
              </span>
            )}
            {tshirt.has_holes && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Has Holes
              </span>
            )}
            {tshirt.has_fading && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Has Fading
              </span>
            )}
            {tshirt.has_pilling && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Has Pilling
              </span>
            )}
            {tshirt.has_repairs && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Has Repairs
              </span>
            )}
          </div>
        </div>
      )}

      {/* Measurements */}
      {hasMeasurements && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Measurements</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {tshirt.pit_to_pit && (
              <div className="flex justify-between">
                <span className="text-gray-600">Chest (pit-to-pit):</span>
                <span className="font-medium">{tshirt.pit_to_pit}"</span>
              </div>
            )}
            {tshirt.shoulder_to_shoulder && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shoulders:</span>
                <span className="font-medium">{tshirt.shoulder_to_shoulder}"</span>
              </div>
            )}
            {tshirt.front_length && (
              <div className="flex justify-between">
                <span className="text-gray-600">Front Length:</span>
                <span className="font-medium">{tshirt.front_length}"</span>
              </div>
            )}
            {tshirt.back_length && (
              <div className="flex justify-between">
                <span className="text-gray-600">Back Length:</span>
                <span className="font-medium">{tshirt.back_length}"</span>
              </div>
            )}
            {tshirt.sleeve_length && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sleeve Length:</span>
                <span className="font-medium">{tshirt.sleeve_length}"</span>
              </div>
            )}
            {tshirt.weight_grams && (
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium">{tshirt.weight_grams}g</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Condition Photos */}
      {tshirt.condition_photos && tshirt.condition_photos.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Condition Photos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tshirt.condition_photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo.url}
                  alt={photo.description}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(photo.url, '_blank')}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                  {photo.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Status */}
      {tshirt.condition_verified && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Condition Verified</p>
              <p className="text-xs text-green-600">
                Verified by staff on {new Date(tshirt.condition_verified_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Trust Score:</span>
          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= (tshirt.condition_confidence === 'certain' ? 5 :
                            tshirt.condition_confidence === 'mostly_certain' ? 4 :
                            tshirt.condition_confidence === 'unsure' ? 3 : 2)
                      ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConditionReport;
