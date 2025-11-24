import React from 'react';
import { KernelProvider } from './context/KernelContext';
import SystemManager from './components/system/SystemManager';

const App: React.FC = () => {
  return (
    <KernelProvider>
      <SystemManager />
    </KernelProvider>
  );
};

export default App;