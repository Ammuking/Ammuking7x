import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import HistoryScreen from './components/HistoryScreen';
import ProfileScreen from './components/ProfileScreen';
import BottomNav from './components/BottomNav';
import { GeneratedImage, Screen, User, Plan } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.GENERATE);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const handleLogin = (emailOrPhone: string) => {
    setUser({
      id: '123',
      emailOrPhone,
      credits: 50,
      plan: 'Free',
      dailyGenerations: 0,
      lastGenerationDate: new Date().toISOString().split('T')[0],
    });
  };

  useEffect(() => {
    if (user && user.plan === 'Free') {
        const today = new Date().toISOString().split('T')[0];
        if (user.lastGenerationDate !== today) {
            setUser(prev => prev ? { ...prev, dailyGenerations: 0, lastGenerationDate: today } : null);
        }
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setActiveScreen(Screen.GENERATE);
  };
  
  const addImageToHistory = useCallback((image: GeneratedImage) => {
    setHistory(prev => [image, ...prev]);
  }, []);
  
  const updateImageInHistory = useCallback((imageId: string, newImageUrl: string) => {
    setHistory(prev =>
      prev.map(image =>
        image.id === imageId
          ? { ...image, imageUrl: newImageUrl, isUpscaled: true }
          : image
      )
    );
  }, []);

  const deductCredits = useCallback((amount: number) => {
    if (user) {
      setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - amount) } : null);
    }
  }, [user]);

  const recordFreeGeneration = useCallback(() => {
    if (user && user.plan === 'Free') {
        setUser(prev => prev ? {
            ...prev,
            dailyGenerations: prev.dailyGenerations + 1,
        } : null);
    }
  }, [user]);

  const purchasePlan = useCallback((plan: Plan) => {
    if (user) {
      setUser(prev => prev ? { ...prev, credits: prev.credits + plan.credits, plan: plan.name } : null);
      setActiveScreen(Screen.PROFILE); // Navigate to profile to see the update
    }
  }, [user]);

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.GENERATE:
        return <MainScreen user={user!} addImageToHistory={addImageToHistory} deductCredits={deductCredits} updateImageInHistory={updateImageInHistory} recordFreeGeneration={recordFreeGeneration} />;
      case Screen.HISTORY:
        return <HistoryScreen history={history} />;
      case Screen.PROFILE:
        return <ProfileScreen user={user!} onLogout={handleLogout} onPurchasePlan={purchasePlan} setActiveScreen={setActiveScreen} />;
      default:
        return <MainScreen user={user!} addImageToHistory={addImageToHistory} deductCredits={deductCredits} updateImageInHistory={updateImageInHistory} recordFreeGeneration={recordFreeGeneration} />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-gray-900 text-white overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
}