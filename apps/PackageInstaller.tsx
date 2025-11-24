
import React, { useState, useEffect } from 'react';
import { useKernel } from '../context/KernelContext';
import { Package, Download, CheckCircle, AlertTriangle, Shield, User, Smartphone, X } from 'lucide-react';
import { AppDefinition } from '../types';

const PackageInstaller: React.FC = () => {
    const { installApp, processes, closeWindow } = useKernel();
    const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'installing' | 'success' | 'error'>('upload');
    const [packageData, setPackageData] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Check for launch args (opened via double click from FileManager)
    useEffect(() => {
        const self = processes.find(p => p.name === 'Installer');
        if (self && self.launchArgs && self.launchArgs.content) {
            try {
                const parsed = JSON.parse(self.launchArgs.content);
                setPackageData(parsed);
                setStep('analyzing');
            } catch (e) {
                setErrorMsg("Corrupted .xos file content.");
                setStep('error');
            }
        }
    }, [processes]);

    // Simulate Analysis
    useEffect(() => {
        if (step === 'analyzing') {
            const timer = setTimeout(() => {
                if (validatePackage(packageData)) {
                    setStep('review');
                } else {
                    setStep('error');
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [step, packageData]);

    const validatePackage = (data: any) => {
        if (!data || !data.manifest) {
            setErrorMsg("Invalid Package: Missing Manifest");
            return false;
        }
        if (!data.manifest.packageId || !data.manifest.name) {
            setErrorMsg("Invalid Package: Missing Identity");
            return false;
        }
        return true;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xos')) {
            setErrorMsg("Invalid file format. Only .xos packages are supported.");
            setStep('error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const parsed = JSON.parse(evt.target?.result as string);
                setPackageData(parsed);
                setStep('analyzing');
            } catch (e) {
                setErrorMsg("Failed to parse package data.");
                setStep('error');
            }
        };
        reader.readAsText(file);
    };

    const handleInstall = () => {
        setStep('installing');
        setTimeout(() => {
            try {
                const newApp: AppDefinition = {
                    id: packageData.id || `pkg_${Date.now()}`,
                    manifest: packageData.manifest,
                    type: 'USER',
                    component: () => (
                        <div className="h-full bg-white text-black p-4 overflow-hidden">
                            {packageData.config?.url ? (
                                <iframe src={packageData.config.url} className="w-full h-full border-none" title={packageData.manifest.name} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <h1 className="text-2xl font-bold">{packageData.manifest.name}</h1>
                                    <pre className="mt-4 bg-gray-100 p-2 rounded text-xs overflow-auto max-w-full">
                                        {packageData.sourceCode || "No source code provided."}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )
                };
                installApp(newApp);
                setStep('success');
            } catch (e) {
                setErrorMsg("Installation aborted.");
                setStep('error');
            }
        }, 2000);
    };

    const handleClose = () => {
        // Find my window ID and close
        const self = processes.find(p => p.name === 'Installer');
        if (self) closeWindow(self.windowId);
    };

    return (
        <div className="h-full bg-gray-50 text-gray-800 flex flex-col font-sans relative overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-white shadow-sm flex items-center px-6 gap-3 z-10 shrink-0">
                <Package className="text-blue-600" />
                <span className="font-bold text-lg">Package Installer</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {/* Step: Upload */}
                {step === 'upload' && (
                    <div className="text-center space-y-6 max-w-sm w-full">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                            <Download size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Install App</h2>
                            <p className="text-gray-500 mt-2">Select an .xos package file to verify and install onto XlineOS.</p>
                        </div>
                        <label className="block w-full cursor-pointer group">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
                                <span className="text-blue-600 font-medium">Click to select file</span>
                            </div>
                            <input type="file" className="hidden" accept=".xos" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}

                {/* Step: Analyzing */}
                {step === 'analyzing' && (
                    <div className="text-center space-y-6">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <Shield className="absolute inset-0 m-auto text-blue-600" size={32} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Verifying Package...</h2>
                            <p className="text-gray-500 text-sm">Checking security signature and integrity</p>
                        </div>
                    </div>
                )}

                {/* Step: Review */}
                {step === 'review' && packageData && (
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col animate-[fadeIn_0.3s_ease-out]">
                        <div className="p-8 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
                            <img 
                                src={packageData.manifest.iconUrl} 
                                className="w-24 h-24 rounded-2xl shadow-md mb-4 bg-white" 
                                alt="App Icon" 
                                onError={(e) => e.currentTarget.src='https://via.placeholder.com/96'}
                            />
                            <h2 className="text-2xl font-bold text-gray-900">{packageData.manifest.name}</h2>
                            <p className="text-gray-500 text-sm">{packageData.manifest.version}</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <User size={16} className="text-gray-400" />
                                <span className="text-gray-500">Developer:</span>
                                {/* Ensure Developer name is shown explicitly */}
                                <span className="font-medium text-gray-800 break-all truncate">
                                    {packageData.manifest.developer || 'Unknown Developer'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Smartphone size={16} className="text-gray-400" />
                                <span className="text-gray-500">OS Target:</span>
                                <span className="font-medium text-gray-800">Aurora v{packageData.manifest.minOsVersion}+</span>
                            </div>
                            
                            {packageData.manifest.permissions && packageData.manifest.permissions.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Access Permissions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {packageData.manifest.permissions.map((perm: string) => (
                                            <span key={perm} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md font-medium border border-yellow-200">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => setStep('upload')} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleInstall} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                                Install
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Installing */}
                {step === 'installing' && (
                    <div className="w-full max-w-xs bg-white p-6 rounded-2xl shadow-xl text-center space-y-4">
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 animate-[progress_1s_ease-in-out_infinite] w-full origin-left"></div>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Installing {packageData?.manifest?.name}...</p>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="text-center space-y-6 animate-[scaleIn_0.3s_ease-out]">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                            <CheckCircle size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">App Installed!</h2>
                            <p className="text-gray-500 mt-2">{packageData?.manifest?.name} is ready to use.</p>
                        </div>
                        <button onClick={handleClose} className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
                            Done
                        </button>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="text-center space-y-6">
                         <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Installation Failed</h2>
                            <p className="text-red-500 mt-2">{errorMsg}</p>
                        </div>
                        <button onClick={() => setStep('upload')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium">
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageInstaller;
