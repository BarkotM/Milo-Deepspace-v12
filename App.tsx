
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ResearchEngine from './components/ResearchEngine';
import DataExplorer from './components/DataExplorer';
import DiscoveriesDatabase from './components/DiscoveriesDatabase';
import ValidationLab from './components/ValidationLab';
import Simulations from './components/Simulations';
import DiscoveryPipeline from './components/DiscoveryPipeline';
import Home from './pages/Home';
import { Discovery, User, ResearchMode, ExplanationLevel } from './types';
import { RegistryService } from './services/registryService';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [currentResearch, setCurrentResearch] = useState<Discovery | null>(null);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  
  // Navigation passing for home -> research engine
  const [initialResearchParams, setInitialResearchParams] = useState<{
    query: string;
    imageData?: string;
    mode?: string;
  } | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const activeUser = await RegistryService.getActiveSession();
      if (activeUser) {
        setUser(activeUser);
        setDiscoveries(activeUser.discoveries || []);
      } else {
        // Create a default session if none exists for this local instance
        const newUser: User = { 
          email: 'guest@milostellar.sci', 
          username: 'Researcher', 
          discoveries: [], 
          archive: [] 
        };
        await RegistryService.saveUser(newUser);
        setUser(newUser);
      }
    };
    loadSession();
  }, []);

  const handleNewDiscovery = async (discovery: Discovery) => {
    setCurrentResearch(discovery);
    const updatedDiscoveries = [discovery, ...discoveries.filter(d => d.id !== discovery.id)];
    setDiscoveries(updatedDiscoveries);
    if (user) {
      const updatedUser = { ...user, discoveries: updatedDiscoveries };
      await RegistryService.saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  const handleHomeAction = (query: string, imageData?: string, mode?: string) => {
    setInitialResearchParams({ query, imageData, mode });
    setActiveSection('research');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home level={ExplanationLevel.RESEARCH} onAnalysisComplete={handleHomeAction} />;
      case 'research':
        return (
          <ResearchEngine 
            key={initialResearchParams ? 'init' : 'manual'}
            onDiscovery={handleNewDiscovery} 
            initialTarget={initialResearchParams?.query}
            initialMode={initialResearchParams?.mode}
            initialImage={initialResearchParams?.imageData}
          />
        );
      case 'explorer':
        return <DataExplorer activeData={currentResearch} onSelectDiscovery={(d) => setCurrentResearch(d)} />;
      case 'discoveries':
        return <DiscoveriesDatabase discoveries={discoveries} onSelect={(d) => { setCurrentResearch(d); setActiveSection('explorer'); }} />;
      case 'simulations':
        return <Simulations onClose={() => setActiveSection('home')} />;
      case 'discovery_pipeline':
        return <DiscoveryPipeline />;
      default:
        return <Home level={ExplanationLevel.RESEARCH} onAnalysisComplete={handleHomeAction} />;
    }
  };

  return (
    <Layout 
      activeSection={activeSection} 
      setActiveSection={(s) => {
        setActiveSection(s);
        if (s !== 'research') setInitialResearchParams(null);
      }}
      user={user}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
