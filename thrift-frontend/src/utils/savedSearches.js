// Saved Search Management Utilities with Backend Integration
import apiService from '../services/api';

export const saveSearchNotification = async (email, searchQuery, filters) => {
  try {
    // Try to save to backend first
    const response = await apiService.post('/users/saved_searches/create/', {
      email,
      query: searchQuery,
      filters,
      source: 'zero_results_page'
    });

    // Also save to local storage for offline access
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    savedSearches.push({
      email,
      query: searchQuery,
      filters,
      timestamp: new Date().toISOString(),
      backend_id: response.id
    });

    // Keep only last 5 searches per email
    const uniqueSearches = savedSearches.reduce((acc, search) => {
      const existing = acc.find(s => s.email === search.email && s.query === search.query);
      if (!existing) acc.push(search);
      return acc;
    }, []).slice(-5);

    localStorage.setItem('savedSearches', JSON.stringify(uniqueSearches));
    return true;
  } catch (error) {
    console.error('Failed to save search to backend, falling back to local storage:', error);

    // Fallback to local storage if backend fails
    try {
      const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      savedSearches.push({
        email,
        query: searchQuery,
        filters,
        timestamp: new Date().toISOString(),
        error: 'backend_failed'
      });

      // Keep only last 5 searches per email
      const uniqueSearches = savedSearches.reduce((acc, search) => {
        const existing = acc.find(s => s.email === search.email && s.query === search.query);
        if (!existing) acc.push(search);
        return acc;
      }, []).slice(-5);

      localStorage.setItem('savedSearches', JSON.stringify(uniqueSearches));
      return true;
    } catch (localError) {
      console.error('Failed to save to local storage:', localError);
      return false;
    }
  }
};

export const getSavedSearches = (email = null) => {
  try {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    if (email) {
      return savedSearches.filter(search => search.email === email);
    }
    return savedSearches;
  } catch (error) {
    console.error('Failed to get saved searches:', error);
    return [];
  }
};

export const clearExpiredSearches = () => {
  try {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activeSearches = savedSearches.filter(
      search => new Date(search.timestamp) > thirtyDaysAgo
    );

    localStorage.setItem('savedSearches', JSON.stringify(activeSearches));
    return activeSearches.length;
  } catch (error) {
    console.error('Failed to clear expired searches:', error);
    return 0;
  }
};

// Backend integration for saved searches (when user logs in)
export const submitSavedSearchToBackend = async (email, searchQuery, filters) => {
  try {
    // This is now handled in the saveSearchNotification function above
    // But we keep this wrapper for backward compatibility
    return await saveSearchNotification(email, searchQuery, filters);
  } catch (error) {
    console.error('Failed to submit saved search to backend:', error);
    return false;
  }
};

// Sync local saved searches to backend when user logs in
export const syncSavedSearchesOnLogin = async (userEmail) => {
  try {
    const localSearches = getSavedSearches();

    for (const search of localSearches) {
      if (search.backend_id || search.error === 'backend_failed') {
        // Skip searches that were already synced or failed
        continue;
      }

      try {
        await saveSearchNotification(search.email, search.query, search.filters);
      } catch (error) {
        console.warn('Failed to sync individual search:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to sync saved searches on login:', error);
    return false;
  }
};
