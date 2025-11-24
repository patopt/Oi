
import React, { ReactNode } from 'react';

export enum DeviceMode {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE'
}

export enum ProcessStatus {
  RUNNING = 'RUNNING',
  SUSPENDED = 'SUSPENDED', // Background
  KILLED = 'KILLED'
}

export interface HardwareState {
  cpuLoad: number; // 0-100
  ramUsage: number; // in MB
  ramTotal: number;
  batteryLevel: number;
  deviceId: string;
  deviceName: string;
}

export enum ModuleStatus {
  OK = 'OK',
  WARNING = 'WARNING', // Corrupted but repairable
  ERROR = 'ERROR', // Down
  OFFLINE = 'OFFLINE'
}

export interface SystemModule {
  id: string;
  name: string;
  status: ModuleStatus;
  type: 'KERNEL' | 'DRIVER' | 'SERVICE' | 'UI';
  connections: string[]; // IDs of connected modules
}

export interface UserPermissions {
  isAdmin: boolean;
  canInstallApps: boolean;
  canAccessSystemFiles: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  themeColor: string;
  avatarUrl?: string;
  permissions: UserPermissions;
  developerCertificate?: string; // Hash
}

export interface Process {
  pid: number;
  name: string;
  packageId: string;
  icon: string;
  status: ProcessStatus;
  memoryUsage: number; // in MB (simulated)
  windowId: string;
  isMinimized: boolean;
  zIndex: number;
  launchArgs?: any; // Arguments passed on launch (e.g. file path)
}

export interface AppManifest {
  packageId: string; // com.xlinelabs.appname
  name: string;
  version: string;
  iconUrl: string;
  minOsVersion: string;
  permissions: string[];
  developerSignature?: string;
  developer?: string; // Human readable name
}

export interface AppDefinition {
  id: string; // Internal ID
  manifest: AppManifest;
  type: 'SYSTEM' | 'USER';
  component: React.ComponentType<any> | null;
  sourceCode?: string; 
  config?: {
    url?: string;
    width?: number;
    height?: number;
    allowResize?: boolean;
  };
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'FILE' | 'DIRECTORY';
  content?: string; // For files (text or base64)
  mimeType?: string;
  children?: FileSystemNode[]; // For directories
  parentId: string | null;
  permissions: string;
  createdAt: number;
  size: number; // bytes
}

export interface BrowserExtension {
  id: string;
  name: string;
  icon: any;
  component: React.ComponentType<any>;
}

export interface KernelState {
  isBooted: boolean;
  isFirstRun: boolean;
  bootLogs: string[];
  deviceMode: DeviceMode;
  userProfile: UserProfile;
  processes: Process[];
  installedApps: AppDefinition[];
  fileSystemRoot: FileSystemNode;
  activeWindows: string[];
  hardware: HardwareState;
  systemModules: SystemModule[];
}