import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon, DocumentTextIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { JsonLanding, JsonLandingFullContent, JsonLandingPhone } from '../../landingpagesconfig/index';
// Updated to use consolidated hooks file (barrel removed)
import { useOptimizedDeploymentStatus } from '../../../hooks';
import type { LandingPageData } from '../../../types';
// API fetch removed for preview (landingPageData passed in)

interface JsonCardProps {
  name: string;
  description?: string;
  author?: string;
  lastUpdated?: string;
  thumbnail?: string;
  configId?: string; // formerly config.id (legacy)
  landingPageData?: LandingPageData; // direct data to avoid per-card fetch
  onPreview: () => void;
  onOpenLp: () => void;
  onDeploy: () => void;
  onEdit?: () => void;
  onEditTitle?: (newTitle: string) => Promise<void>;
  onDuplicate?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const JsonCard: React.FC<JsonCardProps> = ({
  name,
  description,
  author,
  lastUpdated,
  configId,
  landingPageData,
  onPreview,
  onOpenLp,
  onDeploy,
  onEdit,
  onEditTitle,
  onDuplicate,
  onDragStart,
  onDragEnd
}) => {
  const [previewData, setPreviewData] = useState<LandingPageData | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [canRenderPreview, setCanRenderPreview] = useState(false); // lazy gate
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(name);
  const [isSavingTitle, setIsSavingTitle] = useState<boolean>(false);

  const { deploymentStatuses, refreshStatus } = useOptimizedDeploymentStatus([name]);
  const deploymentStatus = deploymentStatuses[name];

  // Lazy observe visibility
  useEffect(() => {
    if (canRenderPreview || !cardRef.current) return;
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCanRenderPreview(true);
          observerRef.current?.disconnect();
        }
      });
    }, { rootMargin: '100px' });
    observerRef.current.observe(cardRef.current);
    return () => observerRef.current?.disconnect();
  }, [canRenderPreview]);

  // When allowed & data provided, set preview
  useEffect(() => {
    if (!canRenderPreview) return;
    if (landingPageData) {
      setPreviewData(landingPageData);
      setPreviewError(false);
      setPreviewLoading(false);
    } else if (!previewData && !previewLoading) {
      // No data provided – mark as error (should not happen if parent passes data)
      setPreviewError(true);
    }
  }, [canRenderPreview, landingPageData, previewData, previewLoading]);

  useEffect(() => {
    if (name && !deploymentStatus) {
      refreshStatus(name).catch((error: Error) => {
        console.error('Failed to check deployment status:', error);
      });
    }
  }, [name, deploymentStatus, refreshStatus]);

  useEffect(() => {
    setEditedTitle(name);
  }, [name]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() && editedTitle !== name && onEditTitle) {
      try {
        setIsSavingTitle(true);
        await onEditTitle(editedTitle.trim());
      } catch (error) {
        console.error('Error updating title:', error);
        setEditedTitle(name);
      } finally {
        setIsSavingTitle(false);
      }
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(name);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!configId) return;
    e.dataTransfer.setData('application/json', JSON.stringify({
      cardId: configId,
      cardName: name,
      type: 'json-card'
    }));
    e.dataTransfer.effectAllowed = 'copy';

    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';

    if (onDragStart) onDragStart();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';

    if (onDragEnd) onDragEnd();
  }; return (
    <div
      className="overflow-hidden shadow-lg border border-gray-700 rounded-lg hover:shadow-xl transition-all duration-300 relative hover:scale-105 group cursor-move"
      style={{
        backgroundColor: '#0e2432',
        transition: 'transform 0.3s ease, border-color 0.3s ease'
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#77dd76';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(55, 65, 81)';
      }}
      ref={cardRef}
    >
      {/* Header Section */}
      <div className="px-4 py-4 text-center border-b border-gray-700">
        {/* Title with Icons */}
        <div className="flex items-center justify-between mb-2">
          {/* Left spacer (HTML edit removed) */}
          <div className="flex-1" />

          {/* Centered Title */}
          <div className="flex-1 flex items-center justify-center px-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="text-lg font-medium text-gray-100 bg-transparent text-center border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 max-w-full"
                  autoFocus
                  disabled={isSavingTitle}
                />
                {isSavingTitle && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            ) : (
              <h3
                className="text-lg font-medium text-gray-100 text-center truncate cursor-pointer hover:text-blue-400 transition-colors duration-200"
                title={`${name} - Click to edit`}
                onClick={handleTitleClick}
              >
                {name}
              </h3>
            )}
          </div>

          {/* Edit/Duplicate Icons on the right */}
          <div className="flex-1 flex items-center justify-end gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-500 hover:text-blue-400 transition-colors duration-200"
                title="Edit configuration"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="p-1 text-gray-500 hover:text-green-400 transition-colors duration-200"
                title="Duplicate configuration"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Centered Description */}
        {description && (
          <p className="text-sm text-gray-400 mb-2 max-w-md mx-auto">
            {description}
          </p>
        )}

        {/* Author */}
        {author && (
          <p className="text-xs text-gray-500">{author}</p>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-600 mt-1">Last updated: {formatDate(lastUpdated)}</p>
        )}
      </div>

      {/* Main Preview Content Area */}
      <div
        className="px-4 py-6 flex justify-center items-center min-h-32 relative cursor-pointer"
        style={{ backgroundColor: '#0e2432' }}
        onClick={onPreview}
      >
        {/* Hover Preview Overlay - Only covers this section */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          <span className="text-white text-2xl font-bold tracking-wide">PREVIEW</span>
        </div>
        {previewLoading ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading preview...</p>
          </div>
        ) : previewError ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-900/50 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <DocumentTextIcon className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-sm text-red-400">Failed to load preview</p>
          </div>
        ) : previewData ? (
          <div
            className="w-full h-32 overflow-hidden rounded-lg border border-gray-600 relative"
            style={{
              backgroundColor: '#0e2432',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
            }}
          >
            <div
              className="absolute inset-0 origin-top-left overflow-hidden"
              style={{
                transform: 'scale(0.15)',
                transformOrigin: 'top left',
                width: '666.67%',
                height: '666.67%'
              }}
            >
              <div className="w-full min-h-screen bg-white">
                {(() => {
                  const metadata = (previewData as any)?.metadata;
                  const preset = metadata?.preset;

                  if (preset === 'full-content') {
                    return <JsonLandingFullContent content={previewData} />;
                  }

                  if (preset === 'basic' || preset === 'widget') {
                    return <JsonLandingPhone content={previewData} />;
                  }

                  return <JsonLanding content={previewData} />;
                })()}
              </div>
            </div>
            {/* Overlay to prevent interaction */}
            <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <DocumentTextIcon className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">{configId ? 'Loading preview...' : 'No preview available'}</p>
          </div>
        )}
      </div>

      {/* Bottom Buttons Section */}
      <div className="px-4 py-3 border-t border-gray-700 flex justify-between items-center relative z-10" style={{ backgroundColor: '#0e2432' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLp();
            }}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md hover:opacity-90 transition-opacity duration-200 relative z-10 cursor-pointer hover:bg-gray-700"
            style={{ color: '#77dd76' }}
          >
            OPEN
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeploy();
            }}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md hover:opacity-90 transition-opacity duration-200 relative z-10 cursor-pointer hover:bg-gray-700"
            style={{ color: '#77dd76' }}
          >
            DEPLOY
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonCard;
