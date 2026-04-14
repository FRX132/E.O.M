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

const generateEmptyHabitDays = () => {
  const days = [];
  const start = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    days.push({
      id: d.toISOString().split('T')[0],
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      habits: [{ id: 'h-core', name: 'Daily Tracker Check', done: false }] // Only the core skill habit
    });
  }
  return days;
};

const EMPTY_STATE = {
  profile: {
    username: '',
    password: '',
    height: 0,
    weight: 0,
    goals: '',
    profilePicture: '',
    backgroundImage: ''
  },
  expenses: [],
  assets: [],
  habits: generateEmptyHabitDays(),
  goals: { week: [], month: [], year: [] },
  fridge: [],
  targets: [],
  skills: ['core'], // Core skill is unlocked by default!
};

// Initial App State (tries to load legacy localstorage if present)
const initialState = {
  profile: migrateLegacyData('os_profile', EMPTY_STATE.profile),
  expenses: migrateLegacyData('os_expenses', EMPTY_STATE.expenses),
  assets: migrateLegacyData('os_assets', EMPTY_STATE.assets),
  habits: migrateLegacyData('os_habits', EMPTY_STATE.habits),
  goals: migrateLegacyData('os_goals', EMPTY_STATE.goals),
  fridge: migrateLegacyData('os_fridge', EMPTY_STATE.fridge),
  targets: migrateLegacyData('os_bigtargets', EMPTY_STATE.targets),
  skills: migrateLegacyData('os_skills', EMPTY_STATE.skills),
};

export const useStore = create(
  persist(
    (set) => ({
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
      
      // Cleanup helper: Resets completely to EMPTY_STATE
      resetAllData: () => set(EMPTY_STATE)
    }),
    {
      name: 'life_os_storage', // The singular key in localStorage
    }
  )
);
