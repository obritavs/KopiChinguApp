import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our context data
interface FavoritesContextType {
    favorites: number[];
    toggleFavorite: (id: number) => void;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Define the provider props
interface FavoritesProviderProps {
    children: ReactNode;
}

// Key for localStorage
const FAVORITES_STORAGE_KEY = 'kopi_favorites';

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    // Initialize state from localStorage
    const [favorites, setFavorites] = useState<number[]>(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
            return storedFavorites ? JSON.parse(storedFavorites) : [];
        } catch (error) {
            console.error("Error reading favorites from localStorage:", error);
            return [];
        }
    });

    // Effect to update localStorage whenever favorites state changes
    useEffect(() => {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error("Error writing favorites to localStorage:", error);
        }
    }, [favorites]);

    // Function to add or remove an item from favorites
    const toggleFavorite = (id: number) => {
        setFavorites(prevFavorites => {
            if (prevFavorites.includes(id)) {
                // Remove from favorites
                return prevFavorites.filter(favId => favId !== id);
            } else {
                // Add to favorites
                return [...prevFavorites, id];
            }
        });
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Custom hook to use the favorites context
export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
