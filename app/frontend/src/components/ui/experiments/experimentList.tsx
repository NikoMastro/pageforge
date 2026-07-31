import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Experiment } from '../../../types/experiments';
import {
  BeakerIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Pagination from '../pagination';
import { usePagination } from '../../../hooks/hooksPages';

interface ExperimentListProps {
  experiments: Experiment[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ExperimentList: React.FC<ExperimentListProps> = ({
  experiments,
  onDelete,
  onToggleStatus,
}) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { currentItems, currentPage, goToPage } = usePagination({
    items: experiments,
    itemsPerPage: 100,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (experiments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-12">
        <div className="text-center">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-200">No experiments</h3>
          <p className="mt-1 text-sm text-gray-400">
            Get started by creating a new experiment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Variants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {currentItems.map((experiment) => (
            <tr
              key={experiment.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate(`/experiments/${experiment.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <BeakerIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="text-sm font-medium text-gray-200">
                    {experiment.experimentName}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${experiment.variantType === 'landingPages'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
                  }`}>
                  {experiment.variantType === 'landingPages' ? 'Landing Pages' : 'Pixels'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(experiment.id);
                  }}
                  className="inline-flex items-center"
                >
                  {experiment.active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Inactive
                    </span>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {experiment.variantType === 'landingPages'
                  ? `${experiment.landingPages.length} page${experiment.landingPages.length !== 1 ? 's' : ''}`
                  : `${experiment.pixels.length} pixel${experiment.pixels.length !== 1 ? 's' : ''}`
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {formatDate(experiment.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(experiment.id);
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deletingId && (() => {
        const experiment = experiments.find(exp => exp.id === deletingId);
        if (!experiment) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Experiment</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <span className="font-semibold text-white">"{experiment.experimentName}"</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(experiment.id);
                    setDeletingId(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sticky pagination at bottom */}
      {experiments.length > 100 && (
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-10">
          <Pagination
            currentPage={currentPage}
            totalItems={experiments.length}
            itemsPerPage={100}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};

export default ExperimentList;
