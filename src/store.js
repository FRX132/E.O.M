import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Migration Logic: Safely fetch legacy data if it exists.
const migrateLegacyData = (key, defaultVal) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Failed to parse legacy ${key}`, e);
  }
  return defaultVal;
};

// Initial App State
const initialState = {
  profile: migrateLegacyData('os_profile', {
    username: '@operator_j',
    password: '',
    height: 180,
    weight: 75,
    goals: '1. Build a successful startup\n2. Run a marathon\n3. Read 20 books this year',
    profilePicture: '',
    backgroundImage: ''
  }),
  expenses: migrateLegacyData('os_expenses', []),
  assets: migrateLegacyData('os_assets', []),
  habits: migrateLegacyData('os_habits', []),
  goals: migrateLegacyData('os_goals', { week: [], month: [], year: [] }),
  fridge: migrateLegacyData('os_fridge', []),
  targets: migrateLegacyData('os_bigtargets', []),
  skills: migrateLegacyData('os_skills', []),
};

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),
      setExpenses: (updater) => set((state) => ({ expenses: typeof updater === 'function' ? updater(state.expenses) : updater })),
      setAssets: (updater) => set((state) => ({ assets: typeof updater === 'function' ? updater(state.assets) : updater })),
      setHabits: (updater) => set((state) => ({ habits: typeof updater === 'function' ? updater(state.habits) : updater })),
      setGoals: (updater) => set((state) => ({ goals: typeof updater === 'function' ? updater(state.goals) : updater })),
      setFridge: (updater) => set((state) => ({ fridge: typeof updater === 'function' ? updater(state.fridge) : updater })),
      setTargets: (updater) => set((state) => ({ targets: typeof updater === 'function' ? updater(state.targets) : updater })),
      setSkills: (updater) => set((state) => ({ skills: typeof updater === 'function' ? updater(state.skills) : updater })),
      
      // Cleanup helper: call this if you want to perform a hard reset in the future
      resetAllData: () => set(initialState)
    }),
    {
      name: 'life_os_storage', // The singular key in localStorage
    }
  )
);
