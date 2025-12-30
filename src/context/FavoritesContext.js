import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch all favorites
  const fetchFavorites = useCallback(async () => {
    console.log('[FavoritesContext] Fetching favorites...');
    try {
      const response = await api.get('/api/favorites');
      console.log('[FavoritesContext] Favorites response:', response.data);

      if (response.data.success) {
        const favs = response.data.data || [];
        console.log('[FavoritesContext] Favorites data:', favs);
        console.log('[FavoritesContext] Favorites count:', favs.length);

        // Debug: Check the structure of the first favorite
        if (favs.length > 0) {
          console.log('[FavoritesContext] First favorite structure:', favs[0]);
          console.log('[FavoritesContext] First favorite product:', favs[0].product);
          console.log('[FavoritesContext] First favorite product_id:', favs[0].product_id);
        }

        setFavorites(favs);
        setFavoritesCount(favs.length);

        // Create a Set of favorite product IDs for quick lookup
        // Try multiple possible structures
        const ids = new Set(favs.map(fav => {
          const productId = fav.product?.id || fav.product_id || fav.id;
          console.log('[FavoritesContext] Extracting ID from favorite:', { fav, productId });
          return productId;
        }).filter(Boolean));

        console.log('[FavoritesContext] Favorite IDs:', Array.from(ids));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error('[FavoritesContext] Error fetching favorites:', error);
      console.error('[FavoritesContext] Error response:', error.response);

      // If unauthorized, clear favorites
      if (error.response?.status === 401) {
        console.log('[FavoritesContext] User not authenticated, clearing favorites');
        setFavorites([]);
        setFavoritesCount(0);
        setFavoriteIds(new Set());
      }
    }
  }, []);

  // Fetch favorites count only
  const fetchFavoritesCount = useCallback(async () => {
    try {
      const response = await api.get('/api/favorites/count');
      setFavoritesCount(response.data?.count || 0);
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      if (error.response?.status === 401) {
        setFavoritesCount(0);
      }
    }
  }, []);

  // Check if a product is favorited
  const isFavorite = useCallback((productId) => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  // Add to favorites
  const addToFavorites = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await api.post('/api/favorites', { product_id: productId });
      if (response.data.success) {
        // Update local state immediately for instant UI feedback
        setFavoriteIds(prev => new Set([...prev, productId]));
        setFavoritesCount(prev => prev + 1);

        // Refresh full favorites list in background
        await fetchFavorites();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to favorites'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/api/favorites/${productId}`);
      if (response.data.success) {
        // Update local state immediately
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setFavoritesCount(prev => Math.max(0, prev - 1));

        // Refresh full favorites list in background
        await fetchFavorites();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from favorites'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (productId) => {
    if (isFavorite(productId)) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Clear all favorites
  const clearAllFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.delete('/api/favorites');
      if (response.data.success) {
        setFavorites([]);
        setFavoritesCount(0);
        setFavoriteIds(new Set());
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear favorites'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize favorites on mount (only if user is logged in)
  useEffect(() => {
    const initializeFavorites = async () => {
      console.log('[FavoritesContext] Initializing favorites...');
      try {
        await api.get('/sanctum/csrf-cookie');
        const userRes = await api.get('/api/user');
        const userData = userRes.data?.user ?? userRes.data?.data ?? null;

        console.log('[FavoritesContext] User data:', userData);

        if (userData) {
          // User is logged in, fetch their favorites
          console.log('[FavoritesContext] User is logged in, fetching favorites...');
          await fetchFavorites();
        } else {
          console.log('[FavoritesContext] No user data found');
        }
      } catch (error) {
        // User not logged in, keep favorites empty
        console.log('[FavoritesContext] User not authenticated, skipping favorites fetch', error);
      }
    };

    initializeFavorites();
  }, [fetchFavorites]);

  const value = {
    favorites,
    favoritesCount,
    favoriteIds,
    loading,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearAllFavorites,
    fetchFavorites,
    fetchFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
