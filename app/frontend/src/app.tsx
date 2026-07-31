import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JsonConfigurations } from "./components/landingpagesconfig";
import { useLandingPages } from "./hooks";
import type { LandingPageData } from "./types";
import { useConfigActions } from "./hooks";
import { pageforgeApi } from "./api";

const App: React.FC = () => {
  const navigate = useNavigate();

  // Test IAP user info on mount
  useEffect(() => {
    const fetchIAPUser = async () => {
      try {
        const result = await pageforgeApi.getIAPUserInfo();
        if (result?.email) {
        } else {
        }
      } catch (error) {
        console.error("❌ Error fetching IAP user info:", error);
      }
    };
    fetchIAPUser();
  }, []);

  // Landing pages (unified)
  const lp = useLandingPages();
  type LocalConfig = {
    id: string;
    name: string;
    lastUpdated?: string;
    updatedAt?: string;
    createdAt?: string;
    createdBy?: string;
    landingPageData?: LandingPageData;
  };
  const jsonConfigs: LocalConfig[] = lp.pages.map((c) => ({
    id: c.id,
    name: c.backend.page_name,
    lastUpdated: c.backend.timestamp,
    createdAt: c.backend.timestamp,
    updatedAt: c.backend.timestamp,
    createdBy: c.backend.user,
    landingPageData: c.landingPageData,
  }));
  const loading = lp.loading;
  const refreshing = lp.loading;
  const error = lp.error;

  const { refreshData } = useConfigActions();

  const [viewMode, setViewMode] = useState<"list" | "allConfigs">("list");

  const handlePreview = (config: LocalConfig) => {
    navigate(`/landing-pages/${encodeURIComponent(config.name)}`);
  };

  const handleOpenLp = (config: LocalConfig) => {
    window.open(`/landing/${config.name}`, "_blank");
  };

  const handleDeploy = async (config: LocalConfig) => {
    try {
      const url = await lp.deploy(config.id);
      if (url) {
        await refreshData();
      }
    } catch (e) {
      console.error("Deploy failed:", e);
    }
  };

  // Overlay callbacks removed
  // Delete disabled: backend no longer supports delete

  const handleDuplicateConfig = async (config: LocalConfig) => {
    const newName = prompt(
      `Enter a name for the duplicated configuration:`,
      `${config.name} (Copy)`
    );
    if (newName && newName.trim()) {
      try {
        await lp.duplicate(config.id, newName.trim());
        await refreshData();
        alert("Configuration duplicated successfully!");
      } catch (error) {
        console.error("Error duplicating configuration:", error);
        alert(
          `Failed to duplicate configuration: ${error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handleEditTitle = async (config: LocalConfig, newTitle: string) => {
    try {
      await (lp as any).updateTitle(config.id, newTitle); // backward compat alias
      await refreshData();
    } catch (error) {
      console.error("Error updating title:", error);
      throw error;
    }
  };
  const handleSeeAll = () => {
    setViewMode("allConfigs");
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex gap-6 h-full">
            {/* Left Column - Fixed width and height, doesn't adapt to right column */}
            <div className="w-96 flex-shrink-0 flex flex-col">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-96 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Future Component
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    This space is reserved for upcoming functionality. Stay
                    tuned for new features!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Takes remaining space */}
            <div className="flex-1 flex flex-col min-w-0">
              <JsonConfigurations
                jsonConfigs={jsonConfigs}
                loading={loading}
                refreshing={refreshing}
                error={error}
                showAll={viewMode === "allConfigs"}
                onRefresh={refreshData}
                onPreview={handlePreview}
                onOpenLp={handleOpenLp}
                onDeploy={handleDeploy}
                onEdit={undefined}
                onEditTitle={handleEditTitle}
                onDuplicate={handleDuplicateConfig}
                onSeeAll={handleSeeAll}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deployment overlay removed */}
    </div>
  );
};

export default App;
