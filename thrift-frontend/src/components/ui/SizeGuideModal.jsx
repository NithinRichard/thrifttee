import React from 'react';

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Vintage Size Guide</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">T-Shirt Measurements</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Size</th>
                      <th className="border p-3 text-left">Chest (inches)</th>
                      <th className="border p-3 text-left">Length (inches)</th>
                      <th className="border p-3 text-left">Shoulder (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-3">XS</td><td className="border p-3">34-36</td><td className="border p-3">26-27</td><td className="border p-3">16-17</td></tr>
                    <tr><td className="border p-3">S</td><td className="border p-3">36-38</td><td className="border p-3">27-28</td><td className="border p-3">17-18</td></tr>
                    <tr><td className="border p-3">M</td><td className="border p-3">38-40</td><td className="border p-3">28-29</td><td className="border p-3">18-19</td></tr>
                    <tr><td className="border p-3">L</td><td className="border p-3">40-42</td><td className="border p-3">29-30</td><td className="border p-3">19-20</td></tr>
                    <tr><td className="border p-3">XL</td><td className="border p-3">42-44</td><td className="border p-3">30-31</td><td className="border p-3">20-21</td></tr>
                    <tr><td className="border p-3">XXL</td><td className="border p-3">44-46</td><td className="border p-3">31-32</td><td className="border p-3">21-22</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📏 How to Measure</h4>
              <ul className="text-sm space-y-2 text-gray-700">
                <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
                <li><strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem</li>
                <li><strong>Shoulder:</strong> Measure from shoulder seam to shoulder seam</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">⚠️ Vintage Sizing Note</h4>
              <p className="text-sm text-gray-700">
                Vintage items may fit differently than modern clothing. Always check the specific measurements provided for each item. 
                When in doubt, size up for a more relaxed fit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
