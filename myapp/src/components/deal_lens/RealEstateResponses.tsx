import React, { useState } from "react";

import { useTheme } from "./ThemeContext";
import { Block } from "./Realestate_components/Utils/RComponentsUtils";
import RRenderer from "./Realestate_components/RRenderer";

type FileType = "memorandum" | "t12" | "rent_roll";

interface Props {
  responses: Record<FileType, Block[]>;
  onBack?: () => void;
  embedded?: boolean;
  showTabs?: boolean;
  showBackButton?: boolean;
  tabLabels?: Partial<Record<FileType, string>>;
  titleText?: string;
}

const TAB_LABELS: Record<FileType, string> = {
  memorandum: "Memorandum",
  t12: "T12",
  rent_roll: "Rent Roll",
};

const RealEstateResponses: React.FC<Props> = ({
  responses,
  onBack,
  embedded = false,
  showTabs = true,
  showBackButton = true,
  tabLabels,
  titleText,
}) => {
  const { theme } = useTheme();
  const labels = { ...TAB_LABELS, ...tabLabels };
  const availableTabs = (Object.keys(responses) as FileType[]).filter(
    (key) => responses[key].length > 0
  );

  const [activeTab, setActiveTab] = useState<FileType>(availableTabs[0] ?? "memorandum");
  const tabsKey = availableTabs.join("|");

  React.useEffect(() => {
    if (availableTabs.length === 0) return;
    setActiveTab((prev) => (availableTabs.includes(prev) ? prev : availableTabs[0]));
  }, [tabsKey, availableTabs]);

  const activeBlocks = responses[activeTab] ?? [];
  const shouldShowTabs = showTabs && availableTabs.length > 1;
  const shouldShowBackButton = showBackButton && !embedded && Boolean(onBack);

  return (
    <div
      className={`${embedded ? "w-full" : "min-h-screen transition-colors"}`}
      style={
        embedded ? undefined : { backgroundColor: theme === "dark" ? "#09151A" : "#F5F5F5" }
      }
    >
      {/* Back button */}
      {shouldShowBackButton && (
        <button
          onClick={onBack}
          className="fixed top-4 left-4 px-4 py-2 rounded-lg shadow-md z-50 transition-transform hover:scale-105"
          style={{
            backgroundColor: theme === "dark" ? "#102330" : "#E5E5E5",
            color: theme === "dark" ? "#E0F7FA" : "#000",
          }}
        >
        Back
        </button>
      )}

      <div className={`${embedded ? "" : "max-w-7xl mx-auto p-6"}`}>
        {/* Tabs */}
        {shouldShowTabs && (
          <div className="flex space-x-2 mb-6">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "#1B4F72"
                      : theme === "dark"
                      ? "#102330"
                      : "#E5E5E5",
                    color: isActive ? "#E0F7FA" : theme === "dark" ? "#A0CFE8" : "#333",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Tab Content */}
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: "#0d1d29" }} // response background
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#E0F7FA" }}>
            {titleText ?? `${labels[activeTab]} Response`}
          </h2>
          {activeBlocks.length > 0 ? (
            <RRenderer blocks={activeBlocks} />
          ) : (
            <p style={{ color: "#A0CFE8" }}>No response available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealEstateResponses;
