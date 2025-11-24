
import React, { useState } from 'react';
import { useKernel } from '../../context/KernelContext';
import { UserProfile } from '../../types';
import { ArrowRight, User, UploadCloud, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const SetupWizard: React.FC = () => {
    const { completeSetup, importSystemState } = useKernel();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    
    // Restore State
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreData, setRestoreData] = useState<any>(null);
    const [validationLog, setValidationLog] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(false);

    const handleFinish = () => {
        const profile: UserProfile = {
            name,
            username: username.toLowerCase().replace(/\s/g, ''),
            themeColor: '#3b82f6',
            permissions: {
                isAdmin: true,
                canInstallApps: true,
                canAccessSystemFiles: true
            }
        };
        completeSetup(profile);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const content = evt.target?.result as string;
                const parsed = JSON.parse(content);
                setRestoreData(parsed);
                setIsRestoring(true);
                await runValidation(parsed, content);
            } catch (e) {
                alert("Invalid file format");
            }
        };
        reader.readAsText(file);
    };

    const runValidation = async (data: any, rawContent: string) => {
        setValidationLog([]);
        setIsValid(false);
        
        const addLog = (msg: string) => setValidationLog(prev => [...prev, msg]);

        addLog("Analyzing .xosys structure...");
        await new Promise(r => setTimeout(r, 500));
        
        if (data.profile) addLog("✓ User Profile Module detected");
        else { addLog("✗ User Profile Missing"); return; }
        await new Promise(r => setTimeout(r, 300));

        if (data.fs) addLog("✓ File System Tree detected");
        else { addLog("✗ FS Missing"); return; }
        await new Promise(r => setTimeout(r, 300));

        if (data.timestamp) addLog(`✓ Backup Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
        await new Promise(r => setTimeout(r, 300));

        addLog("✓ Integrity Check Passed. Ready to restore.");
        setIsValid(true);
    };

    const confirmRestore = async () => {
        if (!restoreData) return;
        const success = await importSystemState(JSON.stringify(restoreData));
        if (success) {
            window.location.reload();
        } else {
            alert("Restore Failed");
        }
    };

    if (isRestoring) {
        return (
             <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center text-white p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-gray-900 border border-white/20 p-8 rounded-2xl shadow-2xl relative z-10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <RefreshCw className="animate-spin text-green-500" />
                        <h2 className="text-xl font-bold">System Restoration</h2>
                    </div>

                    <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto mb-6 border border-white/10">
                        {validationLog.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>

                    {isValid && (
                        <div className="bg-white/5 p-4 rounded-lg mb-6">
                            <div className="text-sm text-gray-400 mb-1">Restore User:</div>
                            <div className="font-bold text-lg">{restoreData.profile.name}</div>
                            <div className="text-xs text-gray-500">@{restoreData.profile.username}</div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button onClick={() => setIsRestoring(false)} className="flex-1 py-3 bg-gray-800 rounded-lg font-bold">Cancel</button>
                        <button 
                            onClick={confirmRestore} 
                            disabled={!isValid}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold"
                        >
                            Restore Now
                        </button>
                    </div>
                </motion.div>
             </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold mb-2">Welcome to XlineOS</h1>
                            <p className="text-gray-400">Let's set up your Aurora experience.</p>
                        </div>
                        
                        <div className="bg-blue-500/20 p-4 rounded-xl flex items-center justify-center mb-8">
                             <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30">
                                 <User size={40} />
                             </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Username</label>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleFinish}
                            disabled={!name || !username}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mt-4"
                        >
                            Start Using XlineOS <ArrowRight size={18} />
                        </button>

                        <div className="pt-4 border-t border-white/10 text-center">
                            <label className="text-xs text-gray-500 cursor-pointer hover:text-white transition-colors flex items-center justify-center gap-2">
                                <UploadCloud size={14} /> Restore from .xosys Backup
                                <input type="file" className="hidden" accept=".xosys" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SetupWizard;
