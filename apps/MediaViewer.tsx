
import React, { useEffect, useState } from 'react';
import { useKernel } from '../context/KernelContext';
import { Image, Video, FileText, AlertTriangle } from 'lucide-react';

const MediaViewer: React.FC = () => {
    const { processes } = useKernel();
    const [file, setFile] = useState<any>(null);
    const [type, setType] = useState<string>('');

    useEffect(() => {
        // Find self process to get launch args
        const self = processes.find(p => p.name === 'Media Viewer');
        if (self && self.launchArgs) {
            setFile(self.launchArgs.file);
            setType(self.launchArgs.type);
        }
    }, [processes]);

    if (!file) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-black">
                <p>No media loaded.</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
            {type === 'image' && (
                <img src={file.content} alt={file.name} className="max-w-full max-h-full object-contain" />
            )}
            
            {type === 'video' && (
                <video controls className="max-w-full max-h-full" src={file.content} />
            )}

            {type === 'pdf' && (
                <iframe src={file.content} className="w-full h-full bg-white" title={file.name} />
            )}

            <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/50 to-transparent p-4 text-white text-sm truncate">
                {file.name}
            </div>
        </div>
    );
};

export default MediaViewer;
