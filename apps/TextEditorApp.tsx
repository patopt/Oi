
import React, { useState, useEffect } from 'react';
import { useKernel } from '../context/KernelContext';
import { Save, File as FileIcon, Play } from 'lucide-react';

const TextEditorApp: React.FC = () => {
    const { createFile, processes } = useKernel();
    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState('untitled.txt');

    useEffect(() => {
        // Find self process to get launch args
        const self = processes.find(p => p.name === 'CodePad');
        if (self && self.launchArgs && self.launchArgs.file) {
            setContent(self.launchArgs.file.content || '');
            setFileName(self.launchArgs.file.name);
        }
    }, [processes]);

    const handleSave = () => {
        const name = prompt("Save as:", fileName);
        if (name) {
            setFileName(name);
            createFile('user', name, content); // Defaulting to user home for simplicity
            alert("File saved to /home/user/");
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#282c34] text-[#abb2bf] font-mono">
            <div className="h-10 bg-[#21252b] flex items-center px-2 gap-2 select-none">
                <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 hover:bg-[#3e4451] rounded text-sm transition-colors">
                    <Save size={14} className="text-blue-400" /> Save
                </button>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-sm text-gray-500">{fileName}</span>
            </div>
            <textarea 
                className="flex-1 bg-transparent p-4 resize-none outline-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
            />
            <div className="h-6 bg-[#21252b] border-t border-black/20 flex items-center px-4 text-xs text-gray-500 justify-between">
                <span>Ln {content.split('\n').length}, Col {content.length}</span>
                <span>UTF-8</span>
            </div>
        </div>
    );
};

export default TextEditorApp;
