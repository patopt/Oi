
import React, { useState } from 'react';
import { Book, Code, Terminal as TerminalIcon, Cpu, ChevronRight, Layout, Command } from 'lucide-react';
import { OS_NAME } from '../constants';

const HelpApp: React.FC = () => {
    const [section, setSection] = useState<'user' | 'dev' | 'sys' | 'cmds'>('user');

    return (
        <div className="flex h-full bg-white text-gray-800 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Book className="text-blue-600" /> Help Center
                    </h1>
                </div>
                <div className="p-2 space-y-1">
                    <button 
                        onClick={() => setSection('user')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${section === 'user' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Layout size={18} /> User Guide
                    </button>
                    <button 
                        onClick={() => setSection('dev')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${section === 'dev' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Code size={18} /> Developer Guide
                    </button>
                    <button 
                        onClick={() => setSection('cmds')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${section === 'cmds' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <TerminalIcon size={18} /> Terminal Commands
                    </button>
                    <button 
                        onClick={() => setSection('sys')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${section === 'sys' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Cpu size={18} /> System Internals
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                {section === 'user' && (
                    <div className="max-w-3xl space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">User Guide</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Welcome to {OS_NAME} Aurora. This operating system is designed to provide a unified experience across Desktop and Mobile interfaces.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Desktop Interface</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li>**Launch Apps:** Double-click icons on the desktop or single-click from the Dock.</li>
                                <li>**Window Management:** Drag title bars to move. Use the traffic light buttons (Red=Close, Yellow=Minimize, Green=Maximize).</li>
                                <li>**System Menu:** Click the Apple logo in the top left for system options.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Mobile Interface</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li>**Navigation:** Swipe left/right to switch home screens.</li>
                                <li>**App Switcher:** Swipe up from the bottom bar (or click the bar) to see running apps.</li>
                                <li>**Closing Apps:** In the App Switcher, tap 'X' to close an app completely.</li>
                                <li>**Background:** Pressing the Home bar minimizes the app without killing the process.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {section === 'dev' && (
                    <div className="max-w-3xl space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">Developer Documentation</h2>
                            <p className="text-gray-600">
                                Build native applications for {OS_NAME} using Xline Studio. Apps are compiled into JSON packages that can be shared and installed.
                            </p>
                        </div>

                        <div className="bg-gray-900 text-gray-200 p-6 rounded-xl overflow-x-auto">
                            <h4 className="text-blue-400 font-bold mb-2">Package Format (JSON)</h4>
                            <pre className="font-mono text-sm">{`{
  "id": "app_id_unique",
  "manifest": {
    "packageId": "com.xlinelabs.myapp",
    "name": "My Great App",
    "version": "1.0.0",
    "iconUrl": "https://...",
    "permissions": ["install_apps"],
    "developerSignature": "SIGNED_HASH_..."
  },
  "type": "USER",
  "sourceCode": "..."
}`}</pre>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Internal Components</h3>
                            <p>You can use standard HTML/Tailwind classes, or reference system styles.</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded">
                                    <div className="font-bold mb-2">Primary Button</div>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Action</button>
                                    <code className="block mt-2 text-xs bg-gray-100 p-1">class="bg-blue-600 text-white px-4 py-2 rounded"</code>
                                </div>
                                <div className="p-4 border rounded">
                                    <div className="font-bold mb-2">Input Field</div>
                                    <input className="border px-3 py-2 rounded w-full" placeholder="Type..." />
                                    <code className="block mt-2 text-xs bg-gray-100 p-1">class="border px-3 py-2 rounded w-full"</code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {section === 'cmds' && (
                    <div className="max-w-3xl space-y-8">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">Terminal Reference</h2>
                        <div className="overflow-hidden border rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Command</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Example</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">ls</td>
                                        <td className="px-6 py-4">List directory contents</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">ls /home</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">cd</td>
                                        <td className="px-6 py-4">Change directory</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">cd docs</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">touch</td>
                                        <td className="px-6 py-4">Create a new file</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">touch file.txt</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">mkdir</td>
                                        <td className="px-6 py-4">Create a new directory</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">mkdir photos</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">echo</td>
                                        <td className="px-6 py-4">Print text or variable</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">echo $hello</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">sys_info</td>
                                        <td className="px-6 py-4">Display hardware & kernel stats</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">sys_info</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">$var=val</td>
                                        <td className="px-6 py-4">Set a variable</td>
                                        <td className="px-6 py-4 font-mono text-gray-500">$user=Aurora</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {section === 'sys' && (
                    <div className="max-w-3xl space-y-8">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">System Internals</h2>
                        <div className="prose prose-blue max-w-none">
                            <h3>Kernel Architecture</h3>
                            <p>
                                The {OS_NAME} kernel operates as a microkernel architecture in the browser. It handles hardware abstraction via a simulated HAL (Hardware Abstraction Layer).
                            </p>
                            <h4>Process Scheduling</h4>
                            <p>
                                The kernel maintains a process table and uses a round-robin scheduler (simulated via the <code>Hardware Simulation Tick</code>) to allocate CPU cycles. 
                                Each process is isolated in its own memory space (React State closure).
                            </p>
                            <h4>Virtual File System (VFS)</h4>
                            <p>
                                Files are stored in a persistent Virtual File System backed by LocalStorage. The VFS supports:
                            </p>
                            <ul>
                                <li>Permissions (User/Group/World)</li>
                                <li>MIME types</li>
                                <li>Hierarchical directory structure</li>
                            </ul>
                            <h3>Security</h3>
                            <p>
                                Applications are sandboxed. Installation requires a valid package manifest. Developers must sign their packages using a generated SHA-256 hash certificate derived from their password.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpApp;
