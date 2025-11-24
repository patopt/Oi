
import React, { useState, useRef, useEffect } from 'react';
import { useKernel } from '../context/KernelContext';
import { findNodeById } from '../services/FileSystemService';
import { FileSystemNode } from '../types';

const TerminalApp: React.FC = () => {
    const { fileSystemRoot, userProfile, createFile, hardware } = useKernel();
    const [history, setHistory] = useState<string[]>(['XlineOS Kernel Shell v2.1', 'Type "help" for commands.']);
    const [currentPath, setCurrentPath] = useState<string>('/home/user');
    const [input, setInput] = useState('');
    const [variables, setVariables] = useState<Record<string, string>>({});
    const endRef = useRef<HTMLDivElement>(null);

    const resolvePath = (path: string): FileSystemNode | null => {
        if (path === '/') return fileSystemRoot;
        if (path === '/home/user') return findNodeById(fileSystemRoot, 'user');
        return findNodeById(fileSystemRoot, 'root');
    };

    const processInput = (cmd: string) => {
        // Variable substitution ($var)
        return cmd.replace(/\$(\w+)/g, (_, key) => variables[key] || '');
    };

    const handleCommand = (rawCmd: string) => {
        const processedCmd = processInput(rawCmd);
        const parts = processedCmd.trim().split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        const newHistory = [...history, `${userProfile.username}@aurora:${currentPath}$ ${rawCmd}`];

        // Variable assignment check ($var=value)
        if (rawCmd.startsWith('$') && rawCmd.includes('=')) {
            const [key, val] = rawCmd.substring(1).split('=');
            if (key && val) {
                setVariables(prev => ({ ...prev, [key]: val }));
                setHistory(newHistory);
                setInput('');
                return;
            }
        }

        switch (command) {
            case 'help':
                newHistory.push('Commands: help, ls, clear, whoami, pwd, echo, touch, sys_info, date');
                break;
            case 'clear':
                setHistory([]);
                setInput('');
                return;
            case 'sys_info':
                newHistory.push(`Device: ${hardware.deviceName} (${hardware.deviceId})`);
                newHistory.push(`CPU Load: ${hardware.cpuLoad}%`);
                newHistory.push(`RAM: ${hardware.ramUsage}MB / ${hardware.ramTotal}MB`);
                newHistory.push(`Battery: ${hardware.batteryLevel.toFixed(1)}%`);
                break;
            case 'whoami':
                newHistory.push(`${userProfile.username} (Admin: ${userProfile.permissions.isAdmin})`);
                break;
            case 'echo':
                newHistory.push(args.join(' '));
                break;
            case 'touch':
                if (args[0]) {
                    const parentId = currentPath === '/home/user' ? 'user' : 'root';
                    createFile(parentId, args[0], '');
                    newHistory.push(`Created file ${args[0]}`);
                }
                break;
            case 'ls':
                const dir = resolvePath(currentPath);
                if (dir && dir.children) {
                    const files = dir.children.map(c => 
                        c.type === 'DIRECTORY' ? `[DIR] ${c.name}` : c.name
                    ).join('  ');
                    newHistory.push(files || '(empty)');
                }
                break;
            case '':
                break;
            default:
                newHistory.push(`Command not found: ${command}`);
        }

        setHistory(newHistory);
        setInput('');
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(input);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="h-full bg-black/90 p-4 font-mono text-sm text-green-400 overflow-hidden flex flex-col" onClick={() => document.getElementById('term-input')?.focus()}>
            <div className="flex-1 overflow-auto">
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="flex items-center mt-2">
                <span className="text-blue-400 mr-2">{userProfile.username}@aurora:{currentPath}$</span>
                <input 
                    id="term-input"
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="bg-transparent border-none outline-none flex-1 text-white"
                    autoFocus
                    autoComplete="off"
                />
            </div>
        </div>
    );
};

export default TerminalApp;
