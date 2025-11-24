
import React, { useEffect, useState } from 'react';
import { useKernel } from '../context/KernelContext';
import { fetchStoreData, fetchXosFile, StoreData, StoreAppDetails } from '../services/AppStoreService';
import { Search, ChevronLeft, Layers, RefreshCw, WifiOff, Download, Loader2, Info } from 'lucide-react';
import { AppDefinition } from '../types';

const AppStore: React.FC = () => {
    const { installApp } = useKernel();
    
    // View State
    const [view, setView] = useState<'loading' | 'home' | 'details' | 'error'>('loading');
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [selectedApp, setSelectedApp] = useState<StoreAppDetails | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Connecting to Store...');
    
    // Install State
    const [installingXid, setInstallingXid] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        initializeStore();
    }, []);

    const initializeStore = async (forceRefresh = false) => {
        setView('loading');
        setLoadingMessage('Checking connectivity...');

        if (!forceRefresh) {
            const localDataStr = localStorage.getItem('xos_store_data');
            if (localDataStr) {
                try {
                    const parsed = JSON.parse(localDataStr);
                    setStoreData(parsed);
                } catch (e) { console.error("Cache corrupted"); }
            }
        }

        setLoadingMessage('Scraping Catalog Data...');
        const localVersion = forceRefresh ? null : localStorage.getItem('xos_store_version');
        
        const result = await fetchStoreData(localVersion);
        
        if (result.status === 'UPDATE_NEEDED' && result.data) {
            localStorage.setItem('xos_store_version', result.data.version);
            localStorage.setItem('xos_store_data', JSON.stringify(result.data));
            setStoreData(result.data);
            setView('home');
        } else if (result.status === 'ERROR') {
            if (storeData) {
                console.warn("Sync failed, using cache.");
                setView('home');
            } else {
                setView('error');
            }
        } else if (result.status === 'UP_TO_DATE') {
            setView('home');
        }
    };

    const handleInstall = async (app: StoreAppDetails) => {
        if (installingXid) return;
        setInstallingXid(app.xid);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return 90;
                return prev + Math.random() * 5;
            });
        }, 100);

        try {
            const xosContent = await fetchXosFile(app.xosUrl);
            
            clearInterval(interval);
            setProgress(100);

            if (xosContent) {
                try {
                    const pkg = JSON.parse(xosContent);
                    const newApp: AppDefinition = {
                        id: pkg.id || `pkg_${Date.now()}`,
                        manifest: {
                            ...pkg.manifest,
                            developer: app.developer
                        },
                        type: 'USER',
                        component: () => (
                            <div className="h-full bg-white flex flex-col">
                                {pkg.config?.url ? (
                                    <iframe src={pkg.config.url} className="w-full h-full border-none" title={pkg.manifest.name} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                        <h1 className="text-2xl font-bold">{pkg.manifest.name}</h1>
                                        <p className="text-gray-500 mt-2">App content loaded.</p>
                                    </div>
                                )}
                            </div>
                        )
                    };

                    setTimeout(() => {
                        installApp(newApp);
                        setInstallingXid(null);
                        alert(`${app.title} has been successfully installed.`);
                    }, 500);
                } catch (e) {
                    setInstallingXid(null);
                    alert("Installation Failed: The XOS package is invalid.");
                }
            } else {
                setInstallingXid(null);
                alert("Download Failed: File not found.");
            }
        } catch (e) {
            clearInterval(interval);
            setInstallingXid(null);
            alert("Network Error during download.");
        }
    };

    if (view === 'loading') {
        return (
            <div className="h-full bg-white flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">Xline Store</h2>
                    <p className="text-gray-400 font-medium text-sm mt-1">{loadingMessage}</p>
                </div>
            </div>
        );
    }

    if (view === 'error') {
        return (
            <div className="h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <WifiOff className="text-red-500" size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Unavailable</h2>
                <p className="text-gray-500 mb-6 max-w-xs">Unable to parse store data. Please ensure the server tags are correct.</p>
                <button onClick={() => initializeStore(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2">
                    <RefreshCw size={16} /> Retry Connection
                </button>
            </div>
        );
    }

    // Details View
    if (selectedApp) {
        return (
            <div className="h-full bg-white overflow-y-auto animate-[fadeIn_0.3s_ease-out] flex flex-col">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 h-14 border-b flex items-center text-blue-600 font-medium cursor-pointer shrink-0" onClick={() => setSelectedApp(null)}>
                    <ChevronLeft size={24} /> Back
                </div>
                
                <div className="p-6 max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <img src={selectedApp.icon} className="w-32 h-32 rounded-[22%] border border-gray-200 shadow-lg object-cover bg-gray-50 mx-auto md:mx-0" onError={(e) => e.currentTarget.src='https://via.placeholder.com/128'} />
                        <div className="flex flex-col text-center md:text-left min-w-0 flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{selectedApp.title}</h1>
                            <p className="text-gray-500 font-medium mb-1">{selectedApp.developer}</p>
                            <p className="text-gray-400 text-xs mb-4">Version {selectedApp.version}</p>
                            
                            <div className="flex justify-center md:justify-start gap-3 mt-auto">
                                {installingXid === selectedApp.xid ? (
                                    <div className="h-10 w-32 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200">
                                        <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }}></div>
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 mix-blend-difference text-white">DOWNLOADING</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleInstall(selectedApp)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-transform active:scale-95 uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-blue-500/30"
                                    >
                                        <Download size={18} /> GET
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Screenshots Carousel */}
                    {selectedApp.screenshots.length > 0 && (
                        <div className="mb-8">
                             <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                                 {selectedApp.screenshots.map((src, i) => (
                                     <img key={i} src={src} className="h-72 w-auto rounded-xl border border-gray-100 shadow-sm snap-center object-cover bg-gray-50" onError={(e) => e.currentTarget.style.display='none'} />
                                 ))}
                             </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                         <p className="text-gray-700 leading-relaxed text-base">{selectedApp.description}</p>
                    </div>
                    
                    {/* Info */}
                    <div className="border-t pt-6 text-xs text-gray-400 font-mono">
                        App ID: {selectedApp.xid}
                    </div>
                </div>
            </div>
        );
    }

    // Home View
    return (
        <div className="h-full bg-white flex flex-col font-sans">
            {/* Header */}
            <div className="h-16 px-6 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">App Store</h1>
                <div className="flex items-center gap-3">
                     <button onClick={() => initializeStore(true)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Reload Catalog">
                        <RefreshCw size={18} />
                     </button>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-blue-600">
                        <Search size={18} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-20">
                
                {/* Hero Section */}
                {storeData?.heroApp && storeData.heroApp.details ? (
                    <div 
                        className="relative w-full aspect-[16/9] md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-10 cursor-pointer group shrink-0 bg-gray-900"
                        onClick={() => storeData?.heroApp?.details && setSelectedApp(storeData.heroApp.details)}
                    >
                        <img 
                            src={storeData.heroApp.bannerUrl} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt="Hero"
                            onError={(e) => e.currentTarget.src='https://via.placeholder.com/800x400'} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">Featured Application</span>
                            <h2 className="text-white text-3xl md:text-5xl font-bold mb-3 drop-shadow-xl">{storeData.heroApp.details.title}</h2>
                            <p className="text-gray-200 line-clamp-2 max-w-xl text-sm md:text-base drop-shadow-md">{storeData.heroApp.details.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-2xl mb-8 flex items-center justify-center text-gray-400">
                         {storeData?.heroApp ? "Loading Hero..." : "No Featured App"}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Available Apps</h2>
                </div>

                {storeData?.apps && storeData.apps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storeData.apps.map(app => (
                            <div 
                                key={app.xid} 
                                onClick={() => setSelectedApp(app)}
                                className="flex gap-4 p-4 rounded-2xl bg-white hover:bg-gray-50 active:scale-[0.98] cursor-pointer border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
                            >
                                <img src={app.icon} className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-100 object-cover shrink-0" alt="" onError={(e) => e.currentTarget.src='https://via.placeholder.com/64'} />
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-900 truncate text-lg">{app.title}</h3>
                                    <p className="text-gray-500 text-xs truncate mb-2">{app.developer}</p>
                                    <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold w-max uppercase hover:bg-blue-100 transition-colors">
                                        GET
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        <Layers size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Catalog is empty.</p>
                    </div>
                )}
                
                {/* Version Footer */}
                <div className="text-center text-gray-400 text-xs py-8 mt-4 flex flex-col items-center gap-1 border-t border-gray-100">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">Store DB v{storeData?.version}</span>
                    <span>Last Updated: {new Date(storeData?.lastUpdated || 0).toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};

export default AppStore;
