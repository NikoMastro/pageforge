import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  TagIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import JsonCard from './jsonCard';
import JsonListView from './jsonCardsList';
import { pageforgeApi } from '../../../api';
import { buildBackendPayload } from '../../../utils/backendPayload';
import { useAuth } from '../../layout/authContext';
import { useTopNavigation } from '../../layout/topNavigationContext';
import Pagination from '../pagination';
// import { usePagination } from '../../../hooks/hooksPages';

export interface TemporaryGroup {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

import type { LandingPageData } from '../../../types';

interface JsonCardsGroupProps {
  jsonConfigs: { id: string; name: string; path: string; hasHtml?: boolean; kind?: string; lastUpdated?: string; createdBy?: string; landingPageData?: LandingPageData; htmlConfig?: any }[];
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  showAll?: boolean;
  onRefresh?: () => void;
  onPreview: (config: { id: string; name: string }) => void;
  onOpenLp: (config: { id: string; name: string }) => void;
  onDeploy: (config: { id: string; name: string }) => void;
  // Legacy HTML actions removed
  onEdit?: (config: { id: string; name: string }) => void;
  onEditTitle?: (config: { id: string; name: string }, newTitle: string) => Promise<void>;
  onDuplicate?: (config: { id: string; name: string }) => void;
  onDelete?: (config: { id: string; name: string }) => void;
  onSeeAll?: () => void;
  onCardDragStart?: () => void;
  onCardDragEnd?: () => void;
}

const JsonCardsGroup: React.FC<JsonCardsGroupProps> = ({
  jsonConfigs,
  loading,
  refreshing: propRefreshing,
  error,
  showAll = false,
  onRefresh: propOnRefresh,
  onPreview,
  onOpenLp,
  onDeploy,
  // legacy removed
  onEdit,
  onEditTitle,
  onDuplicate,
  onDelete,
  onSeeAll,
  onCardDragStart,
  onCardDragEnd,
}) => {
  const [temporaryGroups, setTemporaryGroups] = useState<TemporaryGroup[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [isAllGroupsDragOver, setIsAllGroupsDragOver] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return !window.matchMedia('(min-width: 640px)').matches;
  });

  const { user: authUser } = useAuth();
  const actor = authUser?.email || 'unknown';

  // Get viewMode from context, fallback to local state if context not available
  const topNavCtx = (() => {
    try { return useTopNavigation(); } catch { return undefined; }
  })();
  const viewMode = topNavCtx?.viewMode || 'list';

  // Use context refresh if no prop refresh provided
  const refreshing = propRefreshing ?? topNavCtx?.isRefreshing ?? false;
  const onRefresh = propOnRefresh ?? (topNavCtx?.refreshCallback ? async () => {
    if (topNavCtx.refreshCallback) {
      topNavCtx.setIsRefreshing(true);
      try {
        await topNavCtx.refreshCallback();
      } finally {
        topNavCtx.setIsRefreshing(false);
      }
    }
  } : undefined);

  // Track screen size to disable groups on small screens (< sm / 640px)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setIsSmallScreen(!mq.matches);
    update();
    // Support both modern and older listeners
    const listener = (e: MediaQueryListEvent) => setIsSmallScreen(!e.matches);
    if (mq.addEventListener) mq.addEventListener('change', listener);
    else if ((mq as any).addListener) (mq as any).addListener(listener);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', listener);
      else if ((mq as any).removeListener) (mq as any).removeListener(listener);
    };
  }, []);

  // Effective selection: on small screens, always treat as "All"
  const effectiveSelectedGroupName = isSmallScreen ? null : selectedGroupName;

  const getColorForGroup = (groupName: string) => {
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
      '#EF4444', '#06B6D4', '#84CC16', '#EC4899'
    ];
    const hash = groupName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Extract unique groups from landing page metadata
  const availableGroups = React.useMemo(() => {
    const groupSet = new Set<string>();
    jsonConfigs.forEach(config => {
      const group = config.landingPageData?.metadata?.group;
      if (group && group.trim()) {
        groupSet.add(group.toLowerCase().trim());
      }
    });
    return Array.from(groupSet).sort();
  }, [jsonConfigs]);

  // Merge temporary groups with groups from data
  const allGroups = React.useMemo(() => {
    const existingGroupNames = new Set(availableGroups);
    const merged = [
      ...availableGroups.map(name => ({
        name,
        isTemporary: false,
        color: getColorForGroup(name)
      })),
      ...temporaryGroups
        .filter(tg => !existingGroupNames.has(tg.name.toLowerCase()))
        .map(tg => ({
          name: tg.name,
          isTemporary: true,
          color: tg.color
        }))
    ];
    return merged;
  }, [availableGroups, temporaryGroups]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCardDragStart = () => {
    setIsDragActive(true);
    if (onCardDragStart) onCardDragStart();
  };

  const handleCardDragEnd = () => {
    setIsDragActive(false);
    if (onCardDragEnd) onCardDragEnd();
  };

  const isGroupNameExists = (name: string, excludeName?: string) => {
    const normalizedName = name.toLowerCase().trim();
    const normalizedExcludeName = excludeName?.toLowerCase().trim();

    return allGroups.some(group =>
      group.name.toLowerCase().trim() === normalizedName && group.name.toLowerCase().trim() !== normalizedExcludeName
    ) || temporaryGroups.some(group =>
      group.name.toLowerCase().trim() === normalizedName && group.name.toLowerCase().trim() !== normalizedExcludeName
    );
  };

  const handleCreateGroup = async (name?: string) => {
    const groupName = name || newGroupName;

    if (!groupName.trim()) {
      return;
    }

    if (isGroupNameExists(groupName)) {
      alert(`A group with the name "${groupName.trim()}" already exists. Please choose another name.`);
      return;
    }

    const normalizedName = groupName.toLowerCase().trim();
    const newGroup: TemporaryGroup = {
      id: `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: normalizedName,
      color: getColorForGroup(normalizedName),
      createdAt: new Date().toISOString()
    };

    setTemporaryGroups([...temporaryGroups, newGroup]);
    setNewGroupName('');
    setIsCreatingGroup(false);
  };

  const handleEditGroup = async (oldGroupName: string, newName: string) => {
    if (!newName.trim()) return;

    const normalizedNewName = newName.toLowerCase().trim();
    const normalizedOldName = oldGroupName.toLowerCase().trim();

    if (isGroupNameExists(normalizedNewName, oldGroupName)) {
      alert(`A group with the name "${newName.trim()}" already exists. Please choose another name.`);
      return;
    }

    try {
      // Update temporary groups
      setTemporaryGroups(temporaryGroups.map(group =>
        group.name === normalizedOldName ? { ...group, name: normalizedNewName } : group
      ));

      // Find all pages that have the old group name and update them
      const affectedConfigs = jsonConfigs.filter(config =>
        config.landingPageData?.metadata?.group?.toLowerCase() === normalizedOldName
      );

      // Update all affected pages
      for (const config of affectedConfigs) {
        try {
          const updatedLandingPageData: LandingPageData = {
            ...config.landingPageData,
            sections: config.landingPageData?.sections || [],
            metadata: {
              ...config.landingPageData?.metadata,
              group: normalizedNewName
            }
          };
          await updateLandingPageData(config.id, updatedLandingPageData);
        } catch (error) {
          console.error(`Error updating group for ${config.name}:`, error);
        }
      }

      // Update selected group name if it matches the old name
      if (selectedGroupName === normalizedOldName) {
        setSelectedGroupName(normalizedNewName);
      }

      setEditingGroupId(null);

      if (affectedConfigs.length > 0) {
        showNotification(`Updated group name from "${oldGroupName}" to "${newName}" on ${affectedConfigs.length} page(s)`, 'success');
        if (onRefresh) onRefresh(); // Refresh to get updated data
      } else {
        showNotification(`Group renamed from "${oldGroupName}" to "${newName}"`, 'success');
      }
    } catch (error) {
      console.error('Error editing group:', error);
      showNotification('Error updating group name', 'error');
    }
  };

  // Helper function to update landing page data
  const updateLandingPageData = async (configId: string, updatedLandingPageData: LandingPageData) => {
    try {
      const config = jsonConfigs.find(c => c.id === configId);
      if (!config) throw new Error('Config not found');

      let existingHtmlConfig: any | undefined;
      let existingGeneratedHtml: string | undefined;
      try {
        const latest = await pageforgeApi.getJsonFromFirestore(config.name);
        existingHtmlConfig = latest.htmlConfig ?? {};
        existingGeneratedHtml = typeof latest.generatedHtml === 'string' ? latest.generatedHtml : '';
      } catch (e) {
        console.error('Failed to fetch current LP JSON; aborting group update to avoid HTML overwrite:', e);
        showNotification('Could not load latest page data. Group update aborted to avoid overwriting HTML.', 'error');
        throw e;
      }

      const { metadata } = await buildBackendPayload({
        page_name: config.name,
        landingPageData: updatedLandingPageData,
        htmlConfig: existingHtmlConfig,
        commit: 'group-update',
        user: actor,
        type: 'update'
      }, { overrideHtml: existingGeneratedHtml });

      await pageforgeApi.saveToFirestore({ metadata });
    } catch (error) {
      console.error('Error updating landing page data:', error);
      throw error;
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    // If it's a temporary group, remove it
    setTemporaryGroups(temporaryGroups.filter(group => group.name !== groupName));

    // If it's a group from data, clear the group field for all pages with this group
    const affectedConfigs = jsonConfigs.filter(config =>
      config.landingPageData?.metadata?.group?.toLowerCase() === groupName.toLowerCase()
    );

    for (const config of affectedConfigs) {
      try {
        const updatedLandingPageData: LandingPageData = {
          ...config.landingPageData,
          sections: config.landingPageData?.sections || [],
          metadata: {
            ...config.landingPageData?.metadata,
            group: ''
          }
        };
        await updateLandingPageData(config.id, updatedLandingPageData);
      } catch (error) {
        console.error(`Error clearing group for ${config.name}:`, error);
      }
    }

    if (selectedGroupName === groupName) {
      setSelectedGroupName(null);
    }

    if (affectedConfigs.length > 0) {
      showNotification(`Cleared group "${groupName}" from ${affectedConfigs.length} page(s)`, 'success');
      if (onRefresh) onRefresh(); // Refresh to get updated data
    }
  };
  const handleAssignCardToGroup = async (cardId: string, groupName: string) => {
    try {
      const config = jsonConfigs.find(c => c.id === cardId);
      if (!config) return;

      const normalizedGroupName = groupName.toLowerCase().trim();
      const updatedLandingPageData: LandingPageData = {
        ...config.landingPageData,
        sections: config.landingPageData?.sections || [],
        metadata: {
          ...config.landingPageData?.metadata,
          group: normalizedGroupName
        }
      };

      await updateLandingPageData(cardId, updatedLandingPageData);
      showNotification(`Card "${config.name}" assigned to group "${groupName}"`, 'success');
      if (onRefresh) onRefresh(); // Refresh to get updated data
    } catch (error) {
      console.error('Error assigning card to group:', error);
      showNotification('Error assigning card to group', 'error');
    }
  };

  const handleRemoveCardFromGroups = async (cardId: string) => {
    try {
      const config = jsonConfigs.find(c => c.id === cardId);
      if (!config) return;

      const updatedLandingPageData: LandingPageData = {
        ...config.landingPageData,
        sections: config.landingPageData?.sections || [],
        metadata: {
          ...config.landingPageData?.metadata,
          group: ''
        }
      };

      await updateLandingPageData(cardId, updatedLandingPageData);
      showNotification(`Card "${config.name}" removed from all groups`, 'success');
      if (onRefresh) onRefresh(); // Refresh to get updated data
    } catch (error) {
      console.error('Error removing card from groups:', error);
      showNotification('Error removing card from groups', 'error');
    }
  };

  const handleGroupDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleGroupDrop = async (e: React.DragEvent, groupName: string) => {
    e.preventDefault();

    try {
      const data = e.dataTransfer.getData('application/json');
      const draggedItem = JSON.parse(data);

      if (draggedItem.type === 'json-card' && draggedItem.cardId) {
        await handleAssignCardToGroup(draggedItem.cardId, groupName);
      }
    } catch (error) {
      console.error('Error during drop:', error);
      showNotification('Error adding card to group', 'error');
    }
  };

  const handleRemoveFromAllGroups = async (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const data = e.dataTransfer.getData('application/json');
      const draggedItem = JSON.parse(data);

      if (draggedItem.type === 'json-card' && draggedItem.cardId) {
        await handleRemoveCardFromGroups(draggedItem.cardId);
      }
    } catch (error) {
      console.error('Error during drop:', error);
      showNotification('Error removing card from groups', 'error');
    }
  };

  // Filter cards based on selected group
  const getFilteredCards = () => {
    if (!effectiveSelectedGroupName) return jsonConfigs;

    return jsonConfigs.filter(config =>
      config.landingPageData?.metadata?.group?.toLowerCase() === effectiveSelectedGroupName.toLowerCase()
    );
  };

  // Map configs to include pageTitle for list view
  const mapConfigsWithPageTitle = (configs: typeof jsonConfigs) => {
    return configs.map(config => ({
      ...config,
      pageTitle: (config as any).htmlConfig?.title || config.landingPageData?.metadata?.title || ''
    }));
  };

  // Get count of cards in a group
  const getGroupCardCount = (groupName: string) => {
    return jsonConfigs.filter(config =>
      config.landingPageData?.metadata?.group?.toLowerCase() === groupName.toLowerCase()
    ).length;
  };

  // Component to display a group
  const GroupTag: React.FC<{
    group: { name: string; color: string; isTemporary?: boolean };
    isSelected: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
  }> = ({ group, isSelected, onClick, onEdit, onDelete, onDrop, onDragOver }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
      if (onDragOver) onDragOver(e);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (onDrop) onDrop(e);
    };

    const cardCount = getGroupCardCount(group.name);

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 ${isSelected
          ? 'ring-2 ring-white/50 shadow-lg scale-105'
          : 'hover:scale-105 hover:shadow-md'
          } ${isDragOver ? 'ring-2 ring-yellow-400 shadow-lg scale-110' : ''}`}
        style={{
          backgroundColor: isDragOver ? `${group.color}dd` : group.color,
          color: 'white'
        }}
        onClick={onClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isSelected ? <FolderOpenIcon className="h-4 w-4" /> : <FolderIcon className="h-4 w-4" />}
        <span className="text-sm font-medium">{group.name}</span>
        {cardCount > 0 && (
          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
            {cardCount}
          </span>
        )}

        {showGroupManagement && (
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors duration-150"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors duration-150"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Component for group editing
  const GroupEditor: React.FC<{
    group?: { name: string; id: string };
    initialName?: string;
    onSave: (name: string) => void;
    onCancel: () => void;
  }> = ({ initialName = '', onSave, onCancel }) => {
    const [name, setName] = useState(initialName);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(name);
    };

    return (
      <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="px-3 py-1.5 border border-gray-600 rounded-md bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-150"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </form>
    );
  };

  // Main content rendering
  const renderMainContent = () => {
    if (loading && !refreshing) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
            <p className="mt-4 text-lg text-gray-300">Loading configurations...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <p className="text-lg text-red-400">{error}</p>
          </div>
        </div>
      );
    }

    const filteredCards = getFilteredCards();

    if (filteredCards.length === 0) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <TagIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-lg text-gray-300">
              {selectedGroupName
                ? "No cards in this group."
                : "No configuration found."
              }
            </p>
            {selectedGroupName && (
              <button
                onClick={() => setSelectedGroupName(null)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-700 hover:bg-gray-600"
              >
                See all cards
              </button>
            )}
            {!selectedGroupName && jsonConfigs.length > 0 && (
              <div className="mt-4 text-sm text-gray-400 border-t border-gray-600 pt-4">
                💡 <strong>Tip:</strong> You can drag and drop cards onto groups to organize them!
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto overflow-x-hidden space-y-6 scrollbar-hide no-scrollbar">
        {/* Main section - show all cards if no group is selected */}
        {!effectiveSelectedGroupName && (
          <div>
            {viewMode === 'cards' ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
                {filteredCards.map((config) => (
                  <div key={config.id} className="relative">
                    <JsonCard
                      name={config.name}
                      author={config.createdBy}
                      lastUpdated={config.lastUpdated}
                      configId={config.id}
                      landingPageData={config.landingPageData}
                      onPreview={() => onPreview(config)}
                      onOpenLp={() => onOpenLp(config)}
                      onDeploy={() => onDeploy(config)}
                      // legacy removed
                      onEdit={onEdit ? () => onEdit(config) : undefined}
                      onEditTitle={onEditTitle ? (newTitle) => onEditTitle(config, newTitle) : undefined}
                      onDuplicate={onDuplicate ? () => onDuplicate(config) : undefined}
                      onDragStart={handleCardDragStart}
                      onDragEnd={handleCardDragEnd}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <JsonListView
                configs={mapConfigsWithPageTitle(filteredCards)}
                onPreview={onPreview}
                onOpenLp={onOpenLp}
                onDeploy={onDeploy}
                onEdit={onEdit}
                onEditTitle={onEditTitle}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
              />
            )}
          </div>
        )}

        {/* Main section of cards - only if a group is selected */}
        {effectiveSelectedGroupName && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <FolderOpenIcon className="h-4 w-4" />
              Group cards ({filteredCards.length})
            </h3>

            {viewMode === 'cards' ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
                {filteredCards.map((config) => (
                  <div key={config.id} className="relative">
                    <JsonCard
                      name={config.name}
                      author={config.createdBy}
                      lastUpdated={config.lastUpdated}
                      configId={config.id}
                      landingPageData={config.landingPageData}
                      onPreview={() => onPreview(config)}
                      onOpenLp={() => onOpenLp(config)}
                      onDeploy={() => onDeploy(config)}
                      onEdit={onEdit ? () => onEdit(config) : undefined}
                      onEditTitle={onEditTitle ? (newTitle) => onEditTitle(config, newTitle) : undefined}
                      onDuplicate={onDuplicate ? () => onDuplicate(config) : undefined}
                      onDragStart={handleCardDragStart}
                      onDragEnd={handleCardDragEnd}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <JsonListView
                configs={mapConfigsWithPageTitle(filteredCards)}
                onPreview={onPreview}
                onOpenLp={onOpenLp}
                onDeploy={onDeploy}
                onEdit={onEdit}
                onEditTitle={onEditTitle}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
              />
            )}
          </div>
        )}

        {!showAll && !effectiveSelectedGroupName && jsonConfigs.length > 3 && onSeeAll && (
          <div className="mt-6 text-center">
            <button
              onClick={onSeeAll}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              See all cards
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-full rounded-lg flex flex-col min-h-0">
        {/* Main content */}
        <div className="flex-1 min-h-0 overflow-hidden w-full">
          {renderMainContent()}
        </div>

        {/* Groups and controls at bottom */}
        <div className="flex justify-between items-center mt-6 p-4 border-gray-700 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto flex-1 mr-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {isDragActive && (
              <div className="flex-shrink-0 text-xs text-yellow-400 flex items-center gap-1">
                ✨ Drag onto a group to add the card, or onto "All" to remove it from all groups
              </div>
            )}

            {/* "All" button */}
            <button
              onClick={() => setSelectedGroupName(null)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAllGroupsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAllGroupsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAllGroupsDragOver(false);
                handleRemoveFromAllGroups(e);
              }}
              className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full transition-all duration-200 ${selectedGroupName === null
                ? 'text-white bg-blue-600 shadow-md'
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                } ${isAllGroupsDragOver ? 'ring-2 ring-yellow-400 bg-yellow-600/20' : ''}`}
            >
              All
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full ml-2">
                {jsonConfigs.length}
              </span>
              {isAllGroupsDragOver && (
                <span className="text-xs ml-1">(remove from groups)</span>
              )}
            </button>

            {/* Existing groups */}
            {allGroups.map((group) => (
              <div key={group.name} className="flex-shrink-0">
                {editingGroupId === group.name ? (
                  <GroupEditor
                    initialName={group.name}
                    onSave={(name) => handleEditGroup(group.name, name)}
                    onCancel={() => setEditingGroupId(null)}
                  />
                ) : (
                  <GroupTag
                    group={group}
                    isSelected={selectedGroupName === group.name}
                    onClick={() => setSelectedGroupName(selectedGroupName === group.name ? null : group.name)}
                    onEdit={() => setEditingGroupId(group.name)}
                    onDelete={() => handleDeleteGroup(group.name)}
                    onDrop={(e) => handleGroupDrop(e, group.name)}
                    onDragOver={handleGroupDragOver}
                  />
                )}
              </div>
            ))}

            {/* Add new group button */}
            {isCreatingGroup ? (
              <div className="flex-shrink-0">
                <GroupEditor
                  onSave={handleCreateGroup}
                  onCancel={() => setIsCreatingGroup(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="flex-shrink-0 inline-flex items-center px-3 py-1.5 border-2 border-dashed border-gray-600 text-sm font-medium rounded-full text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New group
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowGroupManagement(!showGroupManagement)}
              className={`hidden sm:inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 ${showGroupManagement
                ? 'text-orange-300 bg-orange-900/50 hover:bg-orange-800/50'
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                }`}
            >
              <TagIcon className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Manage groups</span>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${notification.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
            }`}>
            {notification.message}
          </div>
        )}

        {/* Sticky pagination at bottom */}
        {jsonConfigs.length > 100 && (
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-10">
            <Pagination
              currentPage={1}
              totalItems={jsonConfigs.length}
              itemsPerPage={100}
              onPageChange={(page) => {
                // Pagination will be managed at the parent page level
                console.log('Page change:', page);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonCardsGroup;
