import { createContext, useContext } from 'react';
import { View } from '../types';

interface NavigationContextType {
  navigateTo: (view: View, tab?: string) => void;
}

export const NavigationContext = createContext<NavigationContextType>({ 
  navigateTo: () => console.warn("Navigation provider not found") 
});

export const useNavigation = () => useContext(NavigationContext);
