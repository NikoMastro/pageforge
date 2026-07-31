import React from 'react';
import type { Experiment } from '../../../types/experiments';

interface ExperimentStatsProps {
  experiment: Experiment;
}

const ExperimentStats: React.FC<ExperimentStatsProps> = ({ experiment }) => {
  if (!experiment.stats) {
    return null;
  }

  const stats = Object.entries(experiment.stats);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Performance Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(([lpName, data]) => {
          const landingPage = experiment.landingPages.find(lp => lp.name === lpName);
          const weight = landingPage ? (landingPage.weight * 100).toFixed(0) : '0';

          return (
            <div
              key={lpName}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-200 truncate flex-1">
                  {lpName}
                </h4>
                <span className="ml-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {weight}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Views</span>
                  <span className="text-sm font-semibold text-gray-200">
                    {data.views.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Conversions</span>
                  <span className="text-sm font-semibold text-gray-200">
                    {data.conversions.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Conversion Rate</span>
                    <span className="text-sm font-bold text-blue-500">
                      {data.conversionRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual bar for conversion rate */}
              <div className="mt-3">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(data.conversionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats.length > 1 && (
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Winner Analysis</h4>
          <p className="text-sm text-blue-200">
            {(() => {
              const sorted = [...stats].sort((a, b) => b[1].conversionRate - a[1].conversionRate);
              const winner = sorted[0];
              const improvement = sorted.length > 1
                ? ((winner[1].conversionRate - sorted[1][1].conversionRate) / sorted[1][1].conversionRate * 100)
                : 0;

              return (
                <>
                  <strong className="text-blue-100">{winner[0]}</strong> is performing best with a conversion rate of{' '}
                  <strong className="text-blue-100">{winner[1].conversionRate.toFixed(2)}%</strong>
                  {improvement > 0 && (
                    <>, which is <strong className="text-blue-100">{improvement.toFixed(1)}%</strong> better than the next variant</>
                  )}
                  .
                </>
              );
            })()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExperimentStats;
