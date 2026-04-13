import { useState, useCallback, useRef, useEffect } from 'react';
import { findOrCreateDataFile, downloadData, uploadData } from '../utils/googleDriveSync';

export function useCloudSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('os_drive_token') || null);
  const [fileId, setFileId] = useState(localStorage.getItem('os_drive_fileId') || null);
  const syncTimeoutRef = useRef(null);

  // Read all current local data
  const getLocalData = () => {
    return {
      habits: JSON.parse(localStorage.getItem('os_habits') || '[]'),
      expenses: JSON.parse(localStorage.getItem('os_expenses') || '[]'),
      goals: JSON.parse(localStorage.getItem('os_goals') || '{"week":[],"month":[],"year":[]}'),
      fridge: JSON.parse(localStorage.getItem('os_fridge') || '[]'),
      profile: JSON.parse(localStorage.getItem('os_profile') || '{"username": "@operator_j", "goals": ""}'),
      assets: JSON.parse(localStorage.getItem('os_assets') || '[]')
    };
  };

  // Write cloud data back into local storage
  const setLocalData = (data) => {
    if (data.habits) localStorage.setItem('os_habits', JSON.stringify(data.habits));
    if (data.expenses) localStorage.setItem('os_expenses', JSON.stringify(data.expenses));
    if (data.goals) localStorage.setItem('os_goals', JSON.stringify(data.goals));
    if (data.fridge) localStorage.setItem('os_fridge', JSON.stringify(data.fridge));
    if (data.profile) localStorage.setItem('os_profile', JSON.stringify(data.profile));
    if (data.assets) localStorage.setItem('os_assets', JSON.stringify(data.assets));
    // Trigger custom event so components can re-render if needed
    window.dispatchEvent(new Event('os_storage_sync'));
  };

  // Run initial sync when user logs in
  const initSync = async (accessToken) => {
    setIsSyncing(true);
    setToken(accessToken);
    localStorage.setItem('os_drive_token', accessToken);

    try {
      const id = await findOrCreateDataFile(accessToken);
      setFileId(id);
      localStorage.setItem('os_drive_fileId', id);

      // Try downloading data to see if we have cloud state
      const cloudData = await downloadData(accessToken, id);

      // Basic logic: if Cloud has habits, we adopt cloud state. Otherwise we push local state.
      if (cloudData && Object.keys(cloudData).length > 0) {
        setLocalData(cloudData);
      } else {
        // Cloud is empty, push local data up
        await uploadData(accessToken, id, getLocalData());
      }
    } catch (e) {
      console.error('Initial sync failed', e);
      // Token might be expired, clear it
      setToken(null);
      localStorage.removeItem('os_drive_token');
    } finally {
      setIsSyncing(false);
    }
  };

  const uploadLocalChanges = async () => {
    if (!token || !fileId) return;
    setIsSyncing(true);
    try {
      await uploadData(token, fileId, getLocalData());
    } catch (e) {
      console.error("Failed to upload local changes", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Call this whenever important data changes in components
  const triggerSync = useCallback(() => {
    if (!token) return; // Not logged in
    
    // Debounce to prevent API spam
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      uploadLocalChanges();
    }, 2000); // Wait 2s after last interaction before syncing
  }, [token, fileId]);

  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (key.startsWith('os_') && key !== 'os_drive_token' && key !== 'os_drive_fileId' && key !== 'os_current_view') {
        triggerSync();
      }
    };
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, [triggerSync]);

  const logout = () => {
    setToken(null);
    setFileId(null);
    localStorage.removeItem('os_drive_token');
    localStorage.removeItem('os_drive_fileId');
  };

  return { token, isSyncing, initSync, triggerSync, logout };
}
