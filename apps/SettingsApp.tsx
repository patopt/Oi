
import React, { useState, useEffect } from 'react';
import { useKernel } from '../context/KernelContext';
import { 
    Smartphone, Monitor, User, Moon, Activity, HardDrive, 
    Shield, Box, ChevronRight, LogOut, Database, Download
} from 'lucide-react';
import { DeviceMode } from '../types';

const SettingsApp: React.FC = () => {
    const { 
        deviceMode, toggleDeviceMode, userProfile, 
        installedApps, uninstallApp, fileSystemRoot, 
        runSystemDiagnostics
    } = useKernel();

    const [activeSection, setActiveSection] = useState<'main' | 'apps' | 'storage'>('main');
    const [storageStats, setStorageStats] = useState({ used: 0, total: 5 * 1024 * 1024, files: 0, connected: false });

    const isMobile = deviceMode === DeviceMode.MOBILE;

    // Simulate checking storage
    useEffect(() => {
        if (activeSection === 'storage') {
            const calculateSize = (node: any): number => {
                let size = node.size || 0;
                if (node.children) {
                    node.children.forEach((c: any) => size += calculateSize(c));
                }
                return size;
            };
            const countFiles = (node: any): number => {
                let count = node.type === 'FILE' ? 1 : 0;
                if (node.children) {
                    node.children.forEach((c: any) => count += countFiles(c));
                }
                return count;
            };

            const used = calculateSize(fileSystemRoot);
            const files = countFiles(fileSystemRoot);
            const lsUsed = new Blob([JSON.stringify(localStorage)]).size;
            
            setStorageStats({
                used: lsUsed, // Actual LS usage
                total: 5 * 1024 * 1024, // 5MB standard LS limit
                files: files,
                connected: !!localStorage.getItem('xline_fs_v3')
            });
        }
    }, [activeSection, fileSystemRoot]);

    const handleBackup = () => {
        const event = new CustomEvent('xline-backup-request');
        window.dispatchEvent(event);
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="px-4 py-2 mt-4 mb-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        </div>
    );

    const SettingsItem = ({ icon: Icon, color, label, value, onClick, isDestructive }: any) => (
        <button 
            onClick={onClick}
            className={`w-full flex items-center px-4 py-3 bg-white/5 backdrop-blur-sm border-b border-white/5 first:rounded-t-xl last:rounded-b-xl last:border-0 hover:bg-white/10 transition-colors ${isDestructive ? 'text-red-400' : 'text-white'}`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div className="flex-1 text-left font-medium">{label}</div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                {value}
                {onClick && <ChevronRight size={16} />}
            </div>
        </button>
    );

    // Apps Management View
    if (activeSection === 'apps') {
        return (
            <div className="h-full bg-os-bg text-white flex flex-col">
                 <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2">
                    <button onClick={() => setActiveSection('main')} className="text-blue-400 flex items-center text-sm font-medium hover:opacity-80">
                        <ChevronRight className="rotate-180" size={18} /> Settings
                    </button>
                    <span className="font-bold ml-auto mr-auto pr-8">App Management</span>
                 </div>
                 <div className="p-4 overflow-auto space-y-2">
                     <p className="text-xs text-gray-400 px-2 mb-2">User installed applications can be removed. System apps are protected.</p>
                     {installedApps.map(app => (
                         <div key={app.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                             <img src={app.manifest.iconUrl} className="w-10 h-10 rounded-lg bg-white/10" onError={(e) => e.currentTarget.src='https://via.placeholder.com/32'} />
                             <div className="flex-1 min-w-0">
                                 <div className="font-bold truncate">{app.manifest.name}</div>
                                 <div className="text-xs text-gray-500 truncate">{app.manifest.packageId}</div>
                             </div>
                             {app.type === 'USER' ? (
                                 <button onClick={() => uninstallApp(app.id)} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/30">
                                     Uninstall
                                 </button>
                             ) : (
                                 <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">System</span>
                             )}
                         </div>
                     ))}
                 </div>
            </div>
        );
    }

    // Storage Management View
    if (activeSection === 'storage') {
        const usagePercent = (storageStats.used / storageStats.total) * 100;
        
        return (
             <div className="h-full bg-os-bg text-white flex flex-col">
                 <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2">
                    <button onClick={() => setActiveSection('main')} className="text-blue-400 flex items-center text-sm font-medium hover:opacity-80">
                        <ChevronRight className="rotate-180" size={18} /> Settings
                    </button>
                    <span className="font-bold ml-auto mr-auto pr-8">Storage & Memory</span>
                 </div>
                 <div className="p-6 overflow-auto">
                    <div className="bg-white/5 rounded-2xl p-6 text-center mb-6">
                        <div className="text-4xl font-light mb-1">{(storageStats.used / 1024).toFixed(1)} KB</div>
                        <div className="text-sm text-gray-400">Used of 5.0 MB (LocalStorage)</div>
                        
                        <div className="w-full h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                        </div>
                    </div>

                    <SectionHeader title="Integrity Check" />
                    <div className="bg-white/5 rounded-xl overflow-hidden">
                         <div className="p-4 flex items-center justify-between border-b border-white/5">
                             <span className="text-sm">Browser Storage Link</span>
                             <span className={`text-xs font-bold px-2 py-1 rounded ${storageStats.connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                 {storageStats.connected ? 'CONNECTED' : 'DISCONNECTED'}
                             </span>
                         </div>
                         <div className="p-4 flex items-center justify-between">
                             <span className="text-sm">Total Index Nodes</span>
                             <span className="text-sm text-gray-400">{storageStats.files} Objects</span>
                         </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Database className="text-blue-400 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-sm text-blue-100">System Backup</h4>
                                <p className="text-xs text-blue-200/70 mt-1">
                                    If you experience issues, download a full system state backup (.xosys). You can restore this file from the Setup screen.
                                </p>
                                <button onClick={handleBackup} className="mt-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <Download size={16} /> Export System State (.xosys)
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    // Main Settings View
    return (
        <div className="h-full bg-os-bg text-white flex flex-col overflow-hidden">
            <div className="h-16 border-b border-white/10 flex items-center px-6 shrink-0">
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
                
                {/* Profile Card */}
                <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                        {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} className="w-full h-full rounded-full" /> : userProfile.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{userProfile.name}</h2>
                        <p className="text-gray-400 text-sm">@{userProfile.username}</p>
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                             {userProfile.permissions.isAdmin ? 'Administrator' : 'User'}
                        </span>
                    </div>
                </div>

                <SectionHeader title="General" />
                <div className="bg-white/5 rounded-xl overflow-hidden mb-2">
                    <SettingsItem 
                        icon={isMobile ? Smartphone : Monitor} 
                        color="bg-gray-500" 
                        label="Interface Mode" 
                        value={isMobile ? 'Mobile' : 'Desktop'} 
                        onClick={toggleDeviceMode} 
                    />
                    <SettingsItem 
                        icon={HardDrive} 
                        color="bg-indigo-500" 
                        label="Storage & Memory" 
                        onClick={() => setActiveSection('storage')} 
                    />
                    <SettingsItem 
                        icon={Activity} 
                        color="bg-orange-500" 
                        label="System Health" 
                        onClick={() => runSystemDiagnostics()} 
                    />
                </div>

                <SectionHeader title="Applications" />
                <div className="bg-white/5 rounded-xl overflow-hidden mb-2">
                     <SettingsItem 
                        icon={Box} 
                        color="bg-purple-500" 
                        label="App Management" 
                        value={`${installedApps.length} Apps`} 
                        onClick={() => setActiveSection('apps')} 
                    />
                    <SettingsItem 
                        icon={Shield} 
                        color="bg-teal-500" 
                        label="Developer Tools" 
                        value={userProfile.developerCertificate ? 'Active' : 'Setup Required'} 
                    />
                </div>

                <div className="mt-8">
                    <button 
                        onClick={() => {
                             if(confirm("End current session? This will reload the OS.")) {
                                 window.location.reload(); 
                             }
                        }}
                        className="w-full bg-white/5 hover:bg-red-500/10 text-red-500 p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut size={18} /> End Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsApp;
