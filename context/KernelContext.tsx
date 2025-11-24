import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppDefinition, DeviceMode, FileSystemNode, KernelState, Process, ProcessStatus, UserProfile, HardwareState, SystemModule, ModuleStatus } from '../types';
import { loadFileSystem, saveFileSystem, addFile, deleteNode, createDirectory, findNodeById } from '../services/FileSystemService';
import { OS_NAME, OS_VERSION } from '../constants';
import { checkConnection } from '../services/Networking';

const USER_PREF_KEY = 'xline_user_prefs';

interface KernelContextType extends KernelState {
  boot: () => Promise<void>;
  completeSetup: (profile: UserProfile) => void;
  launchApp: (appId: string, args?: any) => void;
  killProcess: (pid: number) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  installApp: (app: AppDefinition) => void;
  uninstallApp: (appId: string) => void;
  createFile: (parentId: string, name: string, content: string, mime?: string) => void;
  createFolder: (parentId: string, name: string) => void;
  deleteFile: (id: string) => void;
  openFile: (fileId: string) => void;
  closeWindow: (windowId: string) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  toggleDeviceMode: () => void;
  runSystemDiagnostics: () => Promise<void>;
  generateDeveloperCertificate: (password: string) => Promise<string>;
  importDeveloperCertificate: (certString: string, password: string) => Promise<boolean>;
  endSession: () => void;
  exportSystemState: () => void;
  importSystemState: (content: string) => Promise<boolean>;
}

const KernelContext = createContext<KernelContextType | null>(null);

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  username: 'user',
  themeColor: '#3b82f6',
  avatarUrl: '',
  permissions: { isAdmin: false, canInstallApps: true, canAccessSystemFiles: false }
};

const INITIAL_MODULES: SystemModule[] = [
    { id: 'mod_kernel', name: 'Aurora Kernel', status: ModuleStatus.OFFLINE, type: 'KERNEL', connections: ['mod_fs', 'mod_hardware', 'mod_net'] },
    { id: 'mod_fs', name: 'VFS Controller', status: ModuleStatus.OFFLINE, type: 'SERVICE', connections: ['mod_kernel'] },
    { id: 'mod_hardware', name: 'HAL (Hardware Abstraction)', status: ModuleStatus.OFFLINE, type: 'DRIVER', connections: ['mod_kernel', 'mod_gpu'] },
    { id: 'mod_gpu', name: 'Compositor / GPU', status: ModuleStatus.OFFLINE, type: 'DRIVER', connections: ['mod_ui'] },
    { id: 'mod_ui', name: 'Window Manager', status: ModuleStatus.OFFLINE, type: 'UI', connections: ['mod_gpu'] },
    { id: 'mod_net', name: 'Network Stack', status: ModuleStatus.OFFLINE, type: 'SERVICE', connections: ['mod_kernel'] },
];

export const KernelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Kernel State
  const [isBooted, setIsBooted] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(DeviceMode.DESKTOP);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [installedApps, setInstalledApps] = useState<AppDefinition[]>([]);
  const [fileSystemRoot, setFileSystemRoot] = useState<FileSystemNode>(loadFileSystem());
  const [activeWindows, setActiveWindows] = useState<string[]>([]); // Ordered by Z-Index
  const [systemModules, setSystemModules] = useState<SystemModule[]>(INITIAL_MODULES);
  
  // Lazy initialize Profile and FirstRun from localStorage to prevent flash
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
      const saved = localStorage.getItem(USER_PREF_KEY);
      return saved ? JSON.parse(saved).profile : DEFAULT_PROFILE;
  });
  
  const [isFirstRun, setIsFirstRun] = useState<boolean>(() => {
      const saved = localStorage.getItem(USER_PREF_KEY);
      return !saved;
  });

  const [hardware, setHardware] = useState<HardwareState>({
      cpuLoad: 0,
      ramUsage: 512, // System reserved
      ramTotal: 8192,
      batteryLevel: 100,
      deviceId: 'Unknown',
      deviceName: 'Xline Device'
  });

  const processesRef = useRef(processes);
  processesRef.current = processes;

  // Listen for backup requests from UI components
  useEffect(() => {
    const handleBackupRequest = () => exportSystemState();
    window.addEventListener('xline-backup-request', handleBackupRequest);
    return () => window.removeEventListener('xline-backup-request', handleBackupRequest);
  }, [userProfile, installedApps, fileSystemRoot]);

  // Network Connectivity Monitor
  useEffect(() => {
    const updateNetworkStatus = () => {
        const isOnline = checkConnection();
        setSystemModules(prev => prev.map(m => 
            m.id === 'mod_net' 
            ? { ...m, status: isOnline ? ModuleStatus.OK : ModuleStatus.ERROR } 
            : m
        ));
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    // Initial check
    setTimeout(updateNetworkStatus, 1000);

    return () => {
        window.removeEventListener('online', updateNetworkStatus);
        window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Generate Device ID on Mount
  useEffect(() => {
    const existingId = localStorage.getItem('xline_device_id');
    if (existingId) {
        setHardware(h => ({...h, deviceId: existingId, deviceName: `Xline-${existingId.substring(0,4).toUpperCase()}`}));
    } else {
        const newId = crypto.randomUUID();
        localStorage.setItem('xline_device_id', newId);
        setHardware(h => ({...h, deviceId: newId, deviceName: `Xline-${newId.substring(0,4).toUpperCase()}`}));
    }
  }, []);

  // Hardware Simulation Tick (Heartbeat)
  useEffect(() => {
      if (!isBooted) return;
      const interval = setInterval(() => {
          setHardware(prev => {
              // Calculate RAM based on processes
              const procMem = processesRef.current.reduce((acc, p) => acc + p.memoryUsage, 0);
              const sysMem = 512 + (Math.random() * 50); // System fluctuation
              const totalUsed = Math.min(procMem + sysMem, prev.ramTotal);
              
              // CPU Load fluctuation based on process count
              const baseLoad = 2 + (processesRef.current.length * 5);
              const jitter = Math.random() * 10 - 5;
              const cpu = Math.max(1, Math.min(100, baseLoad + jitter));

              return {
                  ...prev,
                  ramUsage: Math.floor(totalUsed),
                  cpuLoad: Math.floor(cpu),
                  batteryLevel: Math.max(0, prev.batteryLevel - 0.001) // Very slow drain
              };
          });
      }, 2000);
      return () => clearInterval(interval);
  }, [isBooted]);

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDeviceMode(DeviceMode.MOBILE);
      }
    };
    if (!isBooted) handleResize();
  }, [isBooted]);

  // Real Boot Sequence
  const boot = useCallback(async () => {
    if (isBooted) return;
    
    const addLog = (msg: string) => setBootLogs(prev => [...prev, msg]);
    const updateModule = (id: string, status: ModuleStatus) => {
        setSystemModules(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    };

    addLog(`Initializing ${OS_NAME} Bootloader...`);
    
    // 1. Kernel Init
    await new Promise(r => setTimeout(r, 600));
    updateModule('mod_kernel', ModuleStatus.OK);
    addLog(`[KERNEL] Loaded Aurora Kernel v${OS_VERSION}`);
    addLog(`[KERNEL] CPU: Virtual Xline Core @ 3.2GHz`);

    // 2. Hardware Abstraction
    await new Promise(r => setTimeout(r, 400));
    updateModule('mod_hardware', ModuleStatus.OK);
    addLog(`[HAL] Drivers initialized.`);
    addLog(`[HAL] Memory Check: ${hardware.ramTotal}MB OK`);

    // 3. File System Mount
    await new Promise(r => setTimeout(r, 500));
    try {
        const fs = loadFileSystem();
        setFileSystemRoot(fs);
        updateModule('mod_fs', ModuleStatus.OK);
        addLog(`[VFS] Root filesystem mounted. Permissions: ${fs.permissions}`);
    } catch (e) {
        updateModule('mod_fs', ModuleStatus.WARNING);
        addLog(`[VFS] Warning: Filesystem integrity check failed. Recovered.`);
    }

    // 4. Network & Services
    await new Promise(r => setTimeout(r, 400));
    const isOnline = checkConnection();
    updateModule('mod_net', isOnline ? ModuleStatus.OK : ModuleStatus.ERROR);
    addLog(isOnline ? `[NET] Interface eth0 UP. Connected to Internet.` : `[NET] Interface eth0 DOWN. Offline Mode.`);
    
    // 5. UI Server
    await new Promise(r => setTimeout(r, 400));
    updateModule('mod_gpu', ModuleStatus.OK);
    updateModule('mod_ui', ModuleStatus.OK);
    addLog(`[UI] Starting Window Manager...`);
    addLog(`[UI] Compositor active.`);

    if (isFirstRun) {
        addLog(`[INIT] Setup required. Launching Wizard...`);
    } else {
        addLog(`[INIT] Loading user profile: ${userProfile.username}`);
    }

    await new Promise(r => setTimeout(r, 800));
    setIsBooted(true);
  }, [isBooted, isFirstRun, userProfile, hardware.ramTotal]);

  const completeSetup = useCallback((profile: UserProfile) => {
    const updatedProfile = {
        ...profile,
        permissions: { isAdmin: true, canInstallApps: true, canAccessSystemFiles: true }
    };
    setUserProfile(updatedProfile);
    setIsFirstRun(false);
    localStorage.setItem(USER_PREF_KEY, JSON.stringify({ profile: updatedProfile }));
  }, []);

  const launchApp = useCallback((appId: string, args?: any) => {
    setInstalledApps(currentInstalledApps => {
        const app = currentInstalledApps.find(a => a.id === appId);
        if (!app) {
            console.error(`App ${appId} not installed.`);
            return currentInstalledApps;
        }

        setProcesses(currentProcesses => {
            // Check if single instance app is already running
            const existing = currentProcesses.find(p => p.name === app.manifest.name);
            if (existing) {
               // Update args if new args provided (e.g. open new file in existing editor)
               const updatedProcesses = currentProcesses.map(p => 
                   p.pid === existing.pid ? { ...p, isMinimized: false, launchArgs: args } : p
               );
               setActiveWindows(prev => [...prev.filter(id => id !== existing.windowId), existing.windowId]);
               return updatedProcesses;
            }

            const pid = Math.floor(Math.random() * 10000) + 1000;
            const windowId = `win_${pid}`;
            const newProcess: Process = {
              pid,
              name: app.manifest.name,
              packageId: app.manifest.packageId,
              icon: app.manifest.iconUrl,
              status: ProcessStatus.RUNNING,
              memoryUsage: Math.floor(Math.random() * 100) + 20,
              windowId,
              isMinimized: false,
              zIndex: activeWindows.length + 1,
              launchArgs: args
            };
            
            setActiveWindows(prev => [...prev, windowId]);
            return [...currentProcesses, newProcess];
        });
        
        return currentInstalledApps;
    });
  }, [activeWindows.length]);

  const minimizeWindow = useCallback((windowId: string) => {
      setProcesses(prev => prev.map(p => 
          p.windowId === windowId ? { ...p, isMinimized: true, status: ProcessStatus.SUSPENDED } : p
      ));
      setActiveWindows(prev => prev.filter(id => id !== windowId)); // Remove from active stack but keep process
  }, []);

  const restoreWindow = useCallback((windowId: string) => {
      setProcesses(prev => prev.map(p => 
          p.windowId === windowId ? { ...p, isMinimized: false, status: ProcessStatus.RUNNING } : p
      ));
      setActiveWindows(prev => [...prev, windowId]);
  }, []);

  const focusWindow = useCallback((windowId: string) => {
      setActiveWindows(prev => [...prev.filter(id => id !== windowId), windowId]);
  }, []);

  const killProcess = useCallback((pid: number) => {
    setProcesses(prev => {
        const proc = prev.find(p => p.pid === pid);
        if (proc) {
            setActiveWindows(wins => wins.filter(id => id !== proc.windowId));
        }
        return prev.filter(p => p.pid !== pid);
    });
  }, []);

  const closeWindow = useCallback((windowId: string) => {
    setProcesses(prev => prev.filter(p => p.windowId !== windowId));
    setActiveWindows(prev => prev.filter(id => id !== windowId));
  }, []);

  const installApp = useCallback((app: AppDefinition) => {
    setInstalledApps(prev => {
      if (prev.some(a => a.id === app.id)) return prev;
      return [...prev, app];
    });
  }, []);

  const uninstallApp = useCallback((appId: string) => {
    // Cannot uninstall System apps easily in this sim, but user apps yes
    setInstalledApps(prev => prev.filter(a => a.id !== appId || a.type === 'SYSTEM'));
  }, []);

  const createFile = useCallback((parentId: string, name: string, content: string, mime?: string) => {
    setFileSystemRoot(prev => addFile(prev, parentId, name, content, mime));
  }, []);

  const createFolder = useCallback((parentId: string, name: string) => {
      setFileSystemRoot(prev => createDirectory(prev, parentId, name));
  }, []);

  const deleteFile = useCallback((id: string) => {
      setFileSystemRoot(prev => deleteNode(prev, id));
  }, []);

  const openFile = useCallback((fileId: string) => {
      const file = findNodeById(fileSystemRoot, fileId);
      if (!file || file.type !== 'FILE') return;

      const ext = file.name.split('.').pop()?.toLowerCase();

      // Association Logic
      if (ext === 'xos') {
          launchApp('installer', { content: file.content });
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
          launchApp('media_viewer', { file, type: 'image' });
      } else if (['mp4', 'webm', 'mov'].includes(ext || '')) {
          launchApp('media_viewer', { file, type: 'video' });
      } else if (ext === 'pdf') {
          launchApp('media_viewer', { file, type: 'pdf' });
      } else if (['js', 'css', 'html', 'json', 'txt', 'md', 'ts', 'tsx'].includes(ext || '')) {
          launchApp('editor', { file });
      } else {
          // Default fallback
          launchApp('editor', { file });
      }
  }, [fileSystemRoot, launchApp]);

  const toggleDeviceMode = useCallback(() => {
    setDeviceMode(prev => prev === DeviceMode.DESKTOP ? DeviceMode.MOBILE : DeviceMode.DESKTOP);
  }, []);

  const runSystemDiagnostics = useCallback(async () => {
      // Simulate random failure and repair
      setSystemModules(prev => prev.map(m => ({ ...m, status: Math.random() > 0.7 ? ModuleStatus.WARNING : ModuleStatus.OK })));
      
      await new Promise(r => setTimeout(r, 2000));
      
      // Auto repair
      setSystemModules(prev => prev.map(m => m.status === ModuleStatus.WARNING ? { ...m, status: ModuleStatus.OK } : m));
  }, []);

  const generateDeveloperCertificate = useCallback(async (password: string): Promise<string> => {
      if (!password) throw new Error("Password required");
      const hash = btoa(`${userProfile.username}:${password}:${Date.now()}`);
      const newProfile = { ...userProfile, developerCertificate: hash };
      setUserProfile(newProfile);
      localStorage.setItem(USER_PREF_KEY, JSON.stringify({ profile: newProfile }));
      return hash;
  }, [userProfile]);

  const importDeveloperCertificate = useCallback(async (certString: string, password: string): Promise<boolean> => {
      // In a real OS this would decrypt. Here we mock check.
      if (password && certString) {
          const newProfile = { ...userProfile, developerCertificate: certString };
          setUserProfile(newProfile);
          localStorage.setItem(USER_PREF_KEY, JSON.stringify({ profile: newProfile }));
          return true;
      }
      return false;
  }, [userProfile]);

  const endSession = useCallback(() => {
      window.location.reload();
  }, []);

  const exportSystemState = useCallback(() => {
      const state = {
          profile: userProfile,
          fs: fileSystemRoot,
          // Only user apps are exported
          userApps: installedApps.filter(app => app.type === 'USER'),
          timestamp: Date.now()
      };
      
      const blob = new Blob([JSON.stringify(state)], { type: 'application/x-xosys' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${userProfile.username}_${new Date().toISOString().split('T')[0]}.xosys`;
      a.click();
      URL.revokeObjectURL(url);
  }, [userProfile, fileSystemRoot, installedApps]);

  const importSystemState = useCallback(async (content: string): Promise<boolean> => {
      try {
          const state = JSON.parse(content);
          if (!state.profile || !state.fs) throw new Error("Invalid backup file");

          // Restore
          localStorage.setItem(USER_PREF_KEY, JSON.stringify({ profile: state.profile }));
          saveFileSystem(state.fs); // Updates LS
          
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  }, []);

  return (
    <KernelContext.Provider value={{
      isBooted,
      isFirstRun,
      bootLogs,
      deviceMode,
      userProfile,
      processes,
      installedApps,
      fileSystemRoot,
      activeWindows,
      hardware,
      systemModules,
      boot,
      completeSetup,
      launchApp,
      killProcess,
      minimizeWindow,
      restoreWindow,
      focusWindow,
      installApp,
      uninstallApp,
      createFile,
      createFolder,
      deleteFile,
      openFile,
      closeWindow,
      setDeviceMode,
      toggleDeviceMode,
      runSystemDiagnostics,
      generateDeveloperCertificate,
      importDeveloperCertificate,
      endSession,
      exportSystemState,
      importSystemState
    }}>
      {children}
    </KernelContext.Provider>
  );
};

export const useKernel = () => {
  const context = useContext(KernelContext);
  if (!context) {
    throw new Error("useKernel must be used within a KernelProvider");
  }
  return context;
};
