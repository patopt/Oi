
import React, { useState, useEffect } from 'react';
import { useKernel } from '../context/KernelContext';
import { findNodeById } from '../services/FileSystemService';
import { Folder, FileText, ArrowLeft, Plus, Upload, Trash2, File, Image, Video, Chrome, Home, HardDrive, Download } from 'lucide-react';
import { DeviceMode } from '../types';

const FileManager: React.FC = () => {
    const { fileSystemRoot, createFile, createFolder, deleteFile, openFile, deviceMode } = useKernel();
    const [currentPathId, setCurrentPathId] = useState<string>('root');
    const [history, setHistory] = useState<string[]>([]);
    const isMobile = deviceMode === DeviceMode.MOBILE;

    // We need to re-fetch the node whenever fileSystemRoot changes
    const currentNode = findNodeById(fileSystemRoot, currentPathId) || findNodeById(fileSystemRoot, 'root');

    const handleNavigate = (id: string) => {
        setHistory([...history, currentPathId]);
        setCurrentPathId(id);
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentPathId(prev);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const content = evt.target?.result as string;
                createFile(currentPathId, file.name, content, file.type);
            };
            reader.readAsText(file); // Default to text, but apps usually handle base64 manually if needed. 
            // In a real app we'd use readAsDataURL for binary, but TextEditor expects text.
            // For .xos we expect Text (JSON).
        }
    };

    const handleNewFolder = () => {
        const name = prompt("Folder name:");
        if (name && name.trim() !== '') {
            createFolder(currentPathId, name);
        }
    };

    const handleItemClick = (node: any) => {
        if (isMobile) {
            // Single tap on mobile
            if (node.type === 'DIRECTORY') {
                handleNavigate(node.id);
            } else {
                openFile(node.id);
            }
        }
    };

    const handleDoubleClick = (node: any) => {
        if (!isMobile) {
            if (node.type === 'DIRECTORY') {
                handleNavigate(node.id);
            } else {
                openFile(node.id);
            }
        }
    };

    const getIcon = (name: string, type: string) => {
        if (type === 'DIRECTORY') return <Folder size={isMobile ? 32 : 48} fill="currentColor" className="text-blue-200" />;
        const ext = name.split('.').pop()?.toLowerCase();
        if (['jpg', 'png', 'jpeg', 'gif'].includes(ext || '')) return <Image size={isMobile ? 24 : 40} className="text-purple-400" />;
        if (['mp4', 'mov', 'webm'].includes(ext || '')) return <Video size={isMobile ? 24 : 40} className="text-red-400" />;
        if (['xos'].includes(ext || '')) return <Chrome size={isMobile ? 24 : 40} className="text-green-500" />;
        return <FileText size={isMobile ? 24 : 40} className="text-gray-400" />;
    };

    return (
        <div className="h-full flex flex-col bg-white text-gray-800">
            {/* Toolbar */}
            <div className={`border-b flex items-center px-4 gap-4 bg-gray-50 shrink-0 ${isMobile ? 'h-14 overflow-x-auto' : 'h-12'}`}>
                <button 
                    onClick={handleBack} 
                    disabled={history.length === 0}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 font-mono text-sm text-gray-500 truncate flex items-center gap-2">
                    <Home size={14} /> / {currentNode?.name === 'root' ? '' : currentNode?.name}
                </div>
                <label className="p-2 hover:bg-gray-200 rounded cursor-pointer whitespace-nowrap flex items-center gap-2" title="Upload File">
                    <Upload size={18} />
                    {!isMobile && "Upload"}
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={handleNewFolder} className="p-2 hover:bg-gray-200 rounded whitespace-nowrap flex items-center gap-2" title="New Folder">
                    <Plus size={18} />
                    {!isMobile && "New Folder"}
                </button>
            </div>

            {/* Content Grid/List */}
            <div className="flex-1 overflow-auto p-4">
                {isMobile ? (
                    // Mobile List View
                    <div className="flex flex-col gap-2">
                        {currentNode?.children?.map(node => (
                            <div 
                                key={node.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 active:bg-blue-50 border border-gray-100"
                                onClick={() => handleItemClick(node)}
                            >
                                <div className="text-blue-500">
                                    {getIcon(node.name, node.type)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="font-medium text-sm truncate">{node.name}</div>
                                    <div className="text-xs text-gray-400">{new Date(node.createdAt).toLocaleDateString()}</div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteFile(node.id); }}
                                    className="p-2 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Desktop Grid View
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {currentNode?.children?.map(node => (
                            <div 
                                key={node.id}
                                className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-blue-50 cursor-pointer relative select-none"
                                onDoubleClick={() => handleDoubleClick(node)}
                            >
                                <div className="w-12 h-12 flex items-center justify-center text-blue-500">
                                    {getIcon(node.name, node.type)}
                                </div>
                                <span className="text-xs text-center truncate w-full px-1">{node.name}</span>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteFile(node.id); }}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {(!currentNode?.children || currentNode.children.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <Folder size={48} className="opacity-20" />
                        <p>Folder is empty</p>
                        <button onClick={handleNewFolder} className="text-blue-500 text-sm">Create Folder</button>
                    </div>
                )}
            </div>

            <div className="h-8 border-t bg-gray-50 flex items-center px-4 text-xs text-gray-500 justify-between shrink-0">
                <span>{currentNode?.children?.length || 0} items</span>
                <span>{currentNode?.permissions}</span>
            </div>
        </div>
    );
};

export default FileManager;
