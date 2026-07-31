import React, { useState } from 'react';
import { 
  SteamWidgetCropBuy, 
  SteamWidgetCropInstall, 
  SteamWidgetCropWishlist,
  getAvailableLanguages,
  getButtonWidth
} from '@pageforge/static-websites';
import { useNotifications } from '../../../components/ui';

const TestPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [scale, setScale] = useState(1);

  // Get available languages from centralized config
  const languages = getAvailableLanguages();

  const getCurrentLanguageData = () => {
    return languages.find(lang => lang.code === selectedLanguage) || languages[0];
  };

  const getCropDimensionsBuy = () => {
    const buttonWidth = getButtonWidth(selectedLanguage, 'buy');
    return {
      cropX: 646 - 12 - buttonWidth,
      cropY: 190 - 3 - 34,
      cropWidth: buttonWidth * scale,
      cropHeight: 34 * scale
    };
  };

  const getCropDimensionsInstall = () => {
    const buttonWidth = getButtonWidth(selectedLanguage, 'install');
    return {
      cropX: 646 - 12 - buttonWidth,
      cropY: 190 - 3 - 34,
      cropWidth: buttonWidth * scale,
      cropHeight: 34 * scale
    };
  };

  const getCropDimensionsWishlist = () => {
    const buttonWidth = getButtonWidth(selectedLanguage, 'wishlist');
    return {
      cropX: 646 - 16 - buttonWidth,
      cropY: 190 - 9 - 34,
      cropWidth: buttonWidth * scale,
      cropHeight: 34 * scale
    };
  };

  const langData = getCurrentLanguageData();
  const cropDimsBuy = getCropDimensionsBuy();
  const cropDimsInstall = getCropDimensionsInstall();
  const cropDimsWishlist = getCropDimensionsWishlist();

  const { backendFail, userCreatedLp, deploymentSuccess, success } = useNotifications();

  return (
    <div className="min-h-screen bg-steam-dark p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Test of SteamWidgetCrop components (Buy, Install & Wishlist)
        </h1>

        {/* Notifications Test Panel */}
        <div className="steam-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">Notifications – Test</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
              onClick={() => backendFail('Simulated 500 error from backend')}
            >
              Trigger Backend Fail (Red)
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-sm"
              onClick={() => userCreatedLp('test-landing', 'dev-user')}
            >
              Trigger LP Created (Dark Blue)
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
              onClick={() => deploymentSuccess('test-landing', 'https://example.com/deployed/test-landing')}
            >
              Trigger Deployed Success (Green)
            </button>
            <button
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white text-sm"
              onClick={() => success('Deployment started for "test-landing"', { title: 'Deployment' })}
            >
              Trigger Deployment Started (Green)
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-gray-300">
            The toast stack is positioned to the right and above the sidebar bell icon.
          </p>
        </div>

        {/* Interactive controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          {/* Language selector */}
          <div className="steam-card">
            <label className="block text-center mb-4 text-lg text-white">
              Select language:
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Size selector */}
          <div className="steam-card">
            <label className="block text-center mb-4 text-lg text-white">
              Button size:
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value={1}>x1 (Normal)</option>
              <option value={1.2}>x1.2</option>
              <option value={1.5}>x1.5</option>
              <option value={2}>x2 (Double)</option>
              <option value={3}>x3 (Triple)</option>
              <option value={4}>x4 (Quadruple)</option>
            </select>
          </div>
        </div>

        {/* Debug information */}
        <div className="max-w-4xl mx-auto mb-8 p-6 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-white text-center">Debug information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Debug Buy Widget */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3 text-center">Widget Buy</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Language:</strong> {langData.name}</div>
                <div><strong>Scale:</strong> x{scale}</div>
                <div><strong>Button width:</strong> {getButtonWidth(selectedLanguage, 'buy')}px</div>
                <div><strong>X position:</strong> {cropDimsBuy.cropX}px</div>
                <div><strong>Y position:</strong> {cropDimsBuy.cropY}px</div>
                <div><strong>Crop size:</strong> {cropDimsBuy.cropWidth} × {cropDimsBuy.cropHeight}px</div>
              </div>
            </div>

            {/* Debug Install Widget */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3 text-center">Widget Install</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Language:</strong> {langData.name}</div>
                <div><strong>Scale:</strong> x{scale}</div>
                <div><strong>Button width:</strong> {getButtonWidth(selectedLanguage, 'install')}px</div>
                <div><strong>X position:</strong> {cropDimsInstall.cropX}px</div>
                <div><strong>Y position:</strong> {cropDimsInstall.cropY}px</div>
                <div><strong>Crop size:</strong> {cropDimsInstall.cropWidth} × {cropDimsInstall.cropHeight}px</div>
              </div>
            </div>

            {/* Debug Wishlist Widget */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3 text-center">Widget Wishlist</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Language:</strong> {langData.name}</div>
                <div><strong>Scale:</strong> x{scale}</div>
                <div><strong>Button width:</strong> {getButtonWidth(selectedLanguage, 'wishlist')}px</div>
                <div><strong>X position:</strong> {cropDimsWishlist.cropX}px</div>
                <div><strong>Y position:</strong> {cropDimsWishlist.cropY}px</div>
                <div><strong>Crop size:</strong> {cropDimsWishlist.cropWidth} × {cropDimsWishlist.cropHeight}px</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buy widget with dynamic controls */}
        <div className="steam-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Widget Buy ({langData.name}) - Scale x{scale}
          </h2>
          <div className="flex justify-center mb-4">
            <SteamWidgetCropBuy
              gameId="294100"
              scale={scale}
              language={selectedLanguage}
              className="steam-widget-crop"
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            Cropped Buy button: {getButtonWidth(selectedLanguage, 'buy')} × 32px (Scale x{scale})
          </div>
        </div>

        {/* Install widget with dynamic controls */}
        <div className="steam-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Widget Install ({langData.name}) - Scale x{scale}
          </h2>
          <div className="flex justify-center mb-4">
            <SteamWidgetCropInstall
              gameId="544810"
              scale={scale}
              language={selectedLanguage}
              className="steam-widget-crop"
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            Cropped Install button: {getButtonWidth(selectedLanguage, 'install')} × 32px (Scale x{scale})
          </div>
        </div>

        {/* Wishlist widget with dynamic controls */}
        <div className="steam-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Widget Wishlist ({langData.name}) - Scale x{scale}
          </h2>
          <div className="flex justify-center mb-4">
            <SteamWidgetCropWishlist
              gameId="2868840"
              scale={scale}
              language={selectedLanguage}
              className="steam-widget-crop"
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            Cropped Wishlist button: {getButtonWidth(selectedLanguage, 'wishlist')} × 32px (Scale x{scale})
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
