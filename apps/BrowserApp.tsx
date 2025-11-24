
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Plus, X, Star, Puzzle, Book, Globe, LayoutGrid, Search, ChevronLeft, ChevronRight, Share, Settings, MoreHorizontal } from 'lucide-react';
import { BrowserExtension, DeviceMode } from '../types';
import { useKernel } from '../context/KernelContext';

const INITIAL_EXTENSIONS: BrowserExtension[] = [
    { 
        id: 'ext_notes', 
        name: 'Quick Notes', 
        icon: Book, 
        component: () => <textarea className="w-64 h-48 p-2 text-black bg-yellow-100 resize-none outline-none text-sm" placeholder="Take notes..." />
    }
];

const BrowserApp: React.FC = () => {
    const { deviceMode } = useKernel();
    const [tabs, setTabs] = useState([{ id: 1, title: 'New Tab', url: 'about:blank' }]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [urlInput, setUrlInput] = useState('');
    const [extensions, setExtensions] = useState<BrowserExtension[]>([]);
    const [activeExtension, setActiveExtension] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'browser' | 'tabs' | 'menu'>('browser'); // Mobile view states

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    const isMobile = deviceMode === DeviceMode.MOBILE;

    const handleNavigate = (url: string) => {
        let finalUrl = url;
        if (!url.startsWith('http') && !url.startsWith('about:')) {
            finalUrl = `https://${url}`;
        }
        
        const updatedTabs = tabs.map(t => 
            t.id === activeTabId ? { ...t, url: finalUrl, title: finalUrl } : t
        );
        setTabs(updatedTabs);
        setViewMode('browser');
    };

    const handleNewTab = () => {
        const newId = Date.now();
        setTabs([...tabs, { id: newId, title: 'New Tab', url: 'about:blank' }]);
        setActiveTabId(newId);
        setUrlInput('');
        setViewMode('browser');
    };

    const closeTab = (id: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (tabs.length === 1) {
            handleNavigate('about:blank');
            return;
        }
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (id === activeTabId) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const installExtension = () => {
        if (extensions.length === 0) {
            setExtensions(INITIAL_EXTENSIONS);
            alert("Extension 'Quick Notes' installed!");
        } else {
            alert("All default extensions installed.");
        }
    };

    // Mobile Render Logic
    if (isMobile) {
        return (
            <div className="flex flex-col h-full bg-gray-100 text-gray-800">
                {/* Mobile Tab Switcher */}
                {viewMode === 'tabs' && (
                    <div className="flex-1 bg-gray-900 p-4 flex flex-col">
                        <div className="flex justify-between items-center text-white mb-4">
                            <h2 className="font-bold text-lg">Tabs ({tabs.length})</h2>
                            <button onClick={() => setViewMode('browser')} className="text-blue-400 font-bold">Done</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 overflow-auto content-start flex-1">
                            {tabs.map(tab => (
                                <div 
                                    key={tab.id} 
                                    className={`relative bg-white rounded-xl aspect-[3/4] overflow-hidden shadow-lg flex flex-col border-2 ${tab.id === activeTabId ? 'border-blue-500' : 'border-transparent'}`} 
                                    onClick={() => { setActiveTabId(tab.id); setViewMode('browser'); }}
                                >
                                    <div className="h-7 bg-gray-100 px-2 flex items-center justify-between text-xs border-b">
                                        <span className="truncate max-w-[80%] font-medium">{tab.title}</span>
                                        <button onClick={(e) => closeTab(tab.id, e)} className="p-1"><X size={12} /></button>
                                    </div>
                                    <div className="flex-1 p-2 bg-white">
                                        <div className="w-full h-full text-[8px] text-gray-400 break-all p-1 bg-gray-50 rounded">
                                            {tab.url}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-16 flex items-center justify-between px-4 text-white">
                             <button onClick={handleNewTab} className="flex items-center gap-2"><Plus /> New Tab</button>
                             <button className="text-blue-400 font-bold">Private</button>
                        </div>
                    </div>
                )}

                {/* Mobile Menu / Settings */}
                {viewMode === 'menu' && (
                     <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
                         <div className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
                             <button onClick={() => setViewMode('browser')} className="w-full p-4 border-b flex justify-between items-center font-bold text-blue-600">
                                 <span>Done</span>
                             </button>
                             <div className="p-4 grid grid-cols-4 gap-4 text-center">
                                 <button onClick={installExtension} className="flex flex-col items-center gap-2">
                                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Puzzle size={24} /></div>
                                     <span className="text-xs">Extensions</span>
                                 </button>
                                 <button className="flex flex-col items-center gap-2">
                                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Star size={24} className="text-yellow-500" /></div>
                                     <span className="text-xs">Favorites</span>
                                 </button>
                                 <button className="flex flex-col items-center gap-2">
                                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Settings size={24} /></div>
                                     <span className="text-xs">Settings</span>
                                 </button>
                                 <button className="flex flex-col items-center gap-2" onClick={() => handleNavigate(activeTab.url)}>
                                     <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><RotateCw size={24} /></div>
                                     <span className="text-xs">Reload</span>
                                 </button>
                             </div>
                         </div>
                         {extensions.length > 0 && (
                             <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                                 <h3 className="font-bold mb-2">Active Extensions</h3>
                                 {extensions.map(ext => (
                                     <div key={ext.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                         <div className="flex items-center gap-2">
                                             <ext.icon size={16} />
                                             <span>{ext.name}</span>
                                         </div>
                                         <button className="text-blue-500 text-sm">Configure</button>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                )}

                {/* Mobile Browser View */}
                {viewMode === 'browser' && (
                    <>
                        <div className="flex-1 relative bg-white overflow-hidden">
                            {activeTab.url === 'about:blank' ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 p-8 text-center">
                                    <Globe size={48} className="text-gray-300" />
                                    <h2 className="text-xl font-bold text-gray-300">Aurora Browser</h2>
                                    <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleNavigate(urlInput); }}>
                                        <input 
                                            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                            placeholder="Search or type URL"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                        />
                                    </form>
                                    <div className="flex gap-4 mt-8">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Star className="text-yellow-400" size={20} /></div>
                                            <span className="text-xs">Favorites</span>
                                        </div>
                                         <div className="flex flex-col items-center gap-1">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Book className="text-blue-400" size={20} /></div>
                                            <span className="text-xs">History</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <iframe 
                                    src={activeTab.url} 
                                    className="w-full h-full border-none bg-white pb-14" 
                                    sandbox="allow-scripts allow-forms allow-same-origin"
                                    title="Browser Content"
                                />
                            )}
                        </div>
                        
                        {/* Mobile Bottom Bar */}
                        <div className="h-14 bg-white/90 backdrop-blur border-t flex items-center justify-between px-4 shadow-2xl relative z-20">
                            <button className="p-2 text-blue-500" onClick={() => window.history.back()}><ChevronLeft /></button>
                            <button className="p-2 text-blue-500" onClick={() => window.history.forward()}><ChevronRight /></button>
                            <button className="p-2 text-blue-500" onClick={() => setViewMode('menu')}><Share size={20} /></button>
                            <button className="p-2 text-blue-500" onClick={() => setViewMode('menu')}><Book size={20} /></button>
                            <button 
                                className="w-8 h-8 flex items-center justify-center border border-blue-500 rounded text-xs font-bold text-blue-500"
                                onClick={() => setViewMode('tabs')}
                            >
                                {tabs.length}
                            </button>
                        </div>
                        
                        {/* Mobile URL Bar (Floating above content but below bottom bar) */}
                         <div className="absolute bottom-16 left-4 right-4 bg-white/80 backdrop-blur shadow-lg rounded-xl flex items-center px-3 py-2 border transition-all z-10 focus-within:bottom-auto focus-within:top-4 focus-within:bg-white">
                            <div className="text-xs text-black mr-2">AA</div>
                            <form className="flex-1" onSubmit={(e) => { e.preventDefault(); handleNavigate(urlInput); }}>
                                <input 
                                    className="w-full bg-transparent text-center text-sm outline-none text-black" 
                                    value={activeTab.url === 'about:blank' ? '' : activeTab.url}
                                    placeholder="Search or enter website name"
                                    onChange={(e) => { setUrlInput(e.target.value); }} 
                                    onFocus={() => setUrlInput(activeTab.url === 'about:blank' ? '' : activeTab.url)}
                                />
                            </form>
                            <RotateCw size={14} className="text-black ml-2" onClick={() => handleNavigate(activeTab.url)} />
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Desktop Layout
    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Tab Bar */}
            <div className="flex items-center bg-gray-200 px-2 pt-2 gap-1 overflow-x-auto">
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        onClick={() => { setActiveTabId(tab.id); setUrlInput(tab.url === 'about:blank' ? '' : tab.url); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm max-w-[200px] cursor-pointer ${activeTabId === tab.id ? 'bg-white shadow-sm' : 'bg-gray-300 hover:bg-gray-200'}`}
                    >
                        <span className="truncate flex-1 text-gray-700">{tab.title}</span>
                        <button onClick={(e) => closeTab(tab.id, e)} className="hover:bg-gray-400 rounded-full p-0.5"><X size={12} /></button>
                    </div>
                ))}
                <button onClick={handleNewTab} className="p-1 hover:bg-gray-300 rounded"><Plus size={16} /></button>
            </div>

            {/* Navigation Bar */}
            <div className="bg-white p-2 flex items-center gap-2 shadow-sm relative z-20">
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ArrowLeft size={16} /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ArrowRight size={16} /></button>
                <button onClick={() => handleNavigate(activeTab.url)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><RotateCw size={16} /></button>
                
                <form 
                    className="flex-1" 
                    onSubmit={(e) => { e.preventDefault(); handleNavigate(urlInput); }}
                >
                    <input 
                        className="w-full bg-gray-100 rounded-full px-4 py-1.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none border border-transparent focus:border-blue-500 transition-all text-gray-800"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Search or enter website name"
                    />
                </form>

                <button className="p-1.5 hover:bg-gray-100 rounded text-yellow-500"><Star size={16} /></button>
                
                <div className="relative">
                    <button onClick={() => setActiveExtension(activeExtension === 'menu' ? null : 'menu')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 relative">
                        <Puzzle size={16} />
                        {extensions.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />}
                    </button>
                    
                    {activeExtension === 'menu' && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded shadow-xl border p-2 z-50">
                            <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Extensions</div>
                            {extensions.map(ext => (
                                <div key={ext.id} className="relative group">
                                    <button 
                                        className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center gap-2 text-sm"
                                        onClick={() => setActiveExtension(activeExtension === ext.id ? null : ext.id)}
                                    >
                                        <ext.icon size={14} /> {ext.name}
                                    </button>
                                </div>
                            ))}
                             {extensions.length === 0 && (
                                <button onClick={installExtension} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded text-blue-600 text-sm">
                                    + Get Extensions
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Extension Popup Area */}
            {activeExtension && activeExtension !== 'menu' && (
                <div className="absolute top-24 right-4 bg-white shadow-xl border rounded-lg z-30">
                     {(() => {
                         const Ext = extensions.find(e => e.id === activeExtension)?.component;
                         return Ext ? <Ext /> : null;
                     })()}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 relative bg-white">
                {activeTab.url === 'about:blank' ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                            <Globe size={48} className="text-gray-300" />
                        </div>
                        <p>Enter a URL to browse</p>
                    </div>
                ) : (
                    <iframe 
                        src={activeTab.url} 
                        className="w-full h-full border-none bg-white" 
                        sandbox="allow-scripts allow-forms allow-same-origin"
                        onError={() => alert("Failed to load")}
                        title="Browser Content"
                    />
                )}
            </div>
        </div>
    );
};

export default BrowserApp;
