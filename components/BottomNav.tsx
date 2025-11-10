
import React from 'react';
import { Screen } from '../types';
import { MagicWandIcon, HistoryIcon, UserCircleIcon } from './Icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    const activeClass = isActive ? 'text-green-400' : 'text-gray-400';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${activeClass} hover:text-green-300`}>
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};

export default function BottomNav({ activeScreen, setActiveScreen }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-gray-900 border-t border-gray-700">
      <div className="flex justify-around items-center h-full">
        <NavItem
          icon={<MagicWandIcon className="h-6 w-6" />}
          label="Generate"
          isActive={activeScreen === Screen.GENERATE}
          onClick={() => setActiveScreen(Screen.GENERATE)}
        />
        <NavItem
          icon={<HistoryIcon className="h-6 w-6" />}
          label="History"
          isActive={activeScreen === Screen.HISTORY}
          onClick={() => setActiveScreen(Screen.HISTORY)}
        />
        <NavItem
          icon={<UserCircleIcon className="h-6 w-6" />}
          label="Profile"
          isActive={activeScreen === Screen.PROFILE}
          onClick={() => setActiveScreen(Screen.PROFILE)}
        />
      </div>
    </div>
  );
}