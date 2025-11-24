
import React, { useEffect } from 'react';
import { useKernel } from '../../context/KernelContext';
import { DeviceMode, AppDefinition } from '../../types';
import Bootloader from './Bootloader';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';
import SetupWizard from './SetupWizard';
import { SYSTEM_ICONS } from '../../constants';

// Apps
import SystemMonitor from '../../apps/SystemMonitor';
import XlineStudio from '../../apps/XlineStudio';
import TerminalApp from '../../apps/TerminalApp';
import SettingsApp from '../../apps/SettingsApp';
import PackageInstaller from '../../apps/PackageInstaller';
import Clock from '../../apps/Clock';
import HelpApp from '../../apps/HelpApp';
import SystemHealth from '../../apps/SystemHealth';
import FileManager from '../../apps/FileManager';
import TextEditorApp from '../../apps/TextEditorApp';
import BrowserApp from '../../apps/BrowserApp';
import MediaViewer from '../../apps/MediaViewer';
import AppStore from '../../apps/AppStore';

const SystemManager: React.FC = () => {
  const { isBooted, isFirstRun, deviceMode, installApp } = useKernel();

  useEffect(() => {
    const systemApps: AppDefinition[] = [
      {
        id: 'help',
        manifest: { packageId: 'com.xline.help', name: 'Help & Docs', version: '2.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/4207/4207253.png', minOsVersion: '1.0', permissions: [] },
        type: 'SYSTEM',
        component: HelpApp
      },
      {
        id: 'app_store',
        manifest: { packageId: 'com.xline.store', name: 'App Store', version: '2.1', iconUrl: 'https://cdn-icons-png.flaticon.com/512/300/300218.png', minOsVersion: '1.0', permissions: ['internet', 'install_apps'] },
        type: 'SYSTEM',
        component: AppStore
      },
      {
        id: 'browser',
        manifest: { packageId: 'com.xline.browser', name: 'Web Browser', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3665/3665961.png', minOsVersion: '1.0', permissions: ['internet'] },
        type: 'SYSTEM',
        component: BrowserApp
      },
      {
        id: 'system_health',
        manifest: { packageId: 'com.xline.health', name: 'System Health', version: '2.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991195.png', minOsVersion: '1.0', permissions: [] },
        type: 'SYSTEM',
        component: SystemHealth
      },
      {
        id: 'files',
        manifest: { packageId: 'com.xline.files', name: 'File Manager', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3767/3767084.png', minOsVersion: '1.0', permissions: ['fs_access'] },
        type: 'SYSTEM',
        component: FileManager
      },
      {
        id: 'media_viewer',
        manifest: { packageId: 'com.xline.media', name: 'Media Viewer', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2659/2659360.png', minOsVersion: '1.0', permissions: [] },
        type: 'SYSTEM',
        component: MediaViewer
      },
      {
        id: 'editor',
        manifest: { packageId: 'com.xline.editor', name: 'CodePad', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2656/2656451.png', minOsVersion: '1.0', permissions: ['fs_access'] },
        type: 'SYSTEM',
        component: TextEditorApp
      },
      {
        id: 'system_monitor',
        manifest: { packageId: 'com.xline.monitor', name: 'Monitor', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2366/2366228.png', minOsVersion: '1.0', permissions: [] },
        type: 'SYSTEM',
        component: SystemMonitor
      },
      {
        id: 'xline_studio',
        manifest: { packageId: 'com.xline.studio', name: 'Xline Studio', version: '2.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png', minOsVersion: '1.0', permissions: ['dev_tools'] },
        type: 'SYSTEM',
        component: XlineStudio
      },
      {
        id: 'terminal',
        manifest: { packageId: 'com.xline.term', name: 'Terminal', version: '2.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/711/711284.png', minOsVersion: '1.0', permissions: ['root'] },
        type: 'SYSTEM',
        component: TerminalApp
      },
      {
        id: 'settings',
        manifest: { packageId: 'com.xline.settings', name: 'Settings', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2040/2040504.png', minOsVersion: '1.0', permissions: [] },
        type: 'SYSTEM',
        component: SettingsApp
      },
      {
        id: 'installer',
        manifest: { packageId: 'com.xline.installer', name: 'Installer', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2436/2436668.png', minOsVersion: '1.0', permissions: ['install'] },
        type: 'SYSTEM',
        component: PackageInstaller
      },
      {
        id: 'clock',
        manifest: { packageId: 'com.xline.clock', name: 'Clock', version: '1.0', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2928/2928753.png', minOsVersion: '1.0', permissions: [] },
        type: 'SYSTEM',
        component: Clock
      }
    ];

    systemApps.forEach(app => installApp(app));
  }, [installApp]);

  if (!isBooted) {
    return <Bootloader />;
  }

  if (isFirstRun) {
      return <SetupWizard />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative selection:bg-blue-500/30">
      {deviceMode === DeviceMode.MOBILE ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
};

export default SystemManager;