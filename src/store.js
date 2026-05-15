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
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      id: d.toISOString().split('T')[0],
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      habits: [] // Start empty, sync logic will populate this
    });
  }
  return days;
};

const EMPTY_STATE = {
  profile: {
    username: '',
    password: '',
    age: '',
    education: '',
    height: '',
    weight: '',
    gender: 'Other',
    targetWeight: '',
    activityLevel: 'Moderate',
    fitnessGoal: 'Maintain',
    bodyFat: '',
    profilePicture: '',
    backgroundImage: '',
    heroImage: '',
    xp: 0
  },
  activeQuests: [], // [{ skillId, progress: 0, daysLeft: duration }]
  expenses: [],
  assets: [],
  habits: generateEmptyHabitDays(),
  goals: { week: [], month: [], year: [] },
  fridge: [],
  targets: [],
  books: [],
  movies: [],
  workouts: [],
  languages: [],
  trips: [], // Added for Trip Mode
  skills: ['core'], // Core skill is unlocked by default!
  isAuthenticated: false,
  theme: 'dark',
  accentColor: '#d48f48',
  designSettings: {
    enabled: false,
    blur: 10,
    radius: 12,
    isNeon: false,
    isCompact: false,
    font: 'Inter'
  },
  financeSettings: {
    categories: ['Utilities', 'Development', 'Home', 'Investment', 'Food', 'Entertainment', 'Health', 'Transport'],
    limits: {
      daily: 50,
      weekly: 350,
      monthly: 2000,
      yearly: 24000
    }
  }
};

// Initial App State (tries to load legacy localstorage if present)
const initialState = {
  profile: migrateLegacyData('os_profile', EMPTY_STATE.profile),
  activeQuests: migrateLegacyData('os_active_quests', EMPTY_STATE.activeQuests),
  expenses: migrateLegacyData('os_expenses', EMPTY_STATE.expenses),
  assets: migrateLegacyData('os_assets', EMPTY_STATE.assets),
  habits: migrateLegacyData('os_habits', EMPTY_STATE.habits),
  goals: migrateLegacyData('os_goals', EMPTY_STATE.goals),
  fridge: migrateLegacyData('os_fridge', EMPTY_STATE.fridge),
  targets: migrateLegacyData('os_bigtargets', EMPTY_STATE.targets),
  skills: migrateLegacyData('os_skills', EMPTY_STATE.skills),
  books: migrateLegacyData('os_books', EMPTY_STATE.books),
  movies: migrateLegacyData('os_movies', EMPTY_STATE.movies),
  workouts: migrateLegacyData('os_workouts', EMPTY_STATE.workouts),
  languages: migrateLegacyData('os_languages', EMPTY_STATE.languages),
  trips: migrateLegacyData('os_trips', EMPTY_STATE.trips), // Added for Trip Mode
  isAuthenticated: migrateLegacyData('os_is_authenticated', false),
  theme: migrateLegacyData('os_theme', EMPTY_STATE.theme),
  accentColor: migrateLegacyData('os_accent_color', EMPTY_STATE.accentColor),
  designSettings: migrateLegacyData('os_design_settings', EMPTY_STATE.designSettings),
  financeSettings: migrateLegacyData('os_finance_settings', EMPTY_STATE.financeSettings),
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
      setBooks: (updater) => set((state) => ({ books: typeof updater === 'function' ? updater(state.books) : updater })),
      setMovies: (updater) => set((state) => ({ movies: typeof updater === 'function' ? updater(state.movies) : updater })),
      setWorkouts: (updater) => set((state) => ({ workouts: typeof updater === 'function' ? updater(state.workouts) : updater })),
      setLanguages: (updater) => set((state) => ({ languages: typeof updater === 'function' ? updater(state.languages) : updater })),
      setTrips: (updater) => set((state) => ({ trips: typeof updater === 'function' ? updater(state.trips) : updater })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setAccentColor: (color) => set({ accentColor: color }),
      setDesignSettings: (newSettings) => set((state) => ({ 
        designSettings: { ...state.designSettings, ...newSettings } 
      })),
      setFinanceSettings: (newSettings) => set((state) => ({
        financeSettings: { ...state.financeSettings, ...newSettings }
      })),
      applyDesignPreset: (config) => set((state) => ({
        accentColor: config.accent || state.accentColor,
        designSettings: {
          ...state.designSettings,
          blur: config.blur ?? state.designSettings.blur,
          radius: config.radius ?? state.designSettings.radius,
          isNeon: config.isNeon ?? state.designSettings.isNeon,
          isCompact: config.isCompact ?? state.designSettings.isCompact,
          font: config.font ?? state.designSettings.font
        }
      })),
      
      // XP & Quest Actions
      addXP: (amount) => set((state) => {
        const amt = Number(amount) || 0;
        const currentXP = state.profile?.xp || 0;
        return { 
          profile: { ...state.profile, xp: Math.max(0, currentXP + amt) } 
        };
      }),
      
      startQuest: (skillId, duration) => set((state) => ({
        activeQuests: [...state.activeQuests, { skillId, progress: 0, total: duration }]
      })),

      updateQuestProgress: (skillId) => set((state) => {
        const quest = state.activeQuests.find(q => q.skillId === skillId);
        if (!quest) return {};

        const newProgress = quest.progress + 1;
        if (newProgress >= quest.total) {
          // Quest Complete!
          return {
            activeQuests: state.activeQuests.filter(q => q.skillId !== skillId),
            skills: state.skills.includes(skillId) ? state.skills : [...state.skills, skillId]
          };
        }

        return {
          activeQuests: state.activeQuests.map(q => 
            q.skillId === skillId ? { ...q, progress: newProgress } : q
          )
        };
      }),

      completeQuest: (skillId) => set((state) => ({
        activeQuests: state.activeQuests.filter(q => q.skillId !== skillId),
        skills: state.skills.includes(skillId) ? state.skills : [...state.skills, skillId]
      })),
      
      syncHabits: (skillDefs) => set((state) => {
        let needsUpdate = false;
        let updatedHabits = [...state.habits];

        // 1. Rollover & Roadmap Check
        const today = new Date();
        const futureDays = 7; // Look 7 days ahead
        
        for (let i = 0; i <= futureDays; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const id = d.toISOString().split('T')[0];
          const name = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          if (!updatedHabits.find(h => h.id === id)) {
            needsUpdate = true;
            const newDay = { id, date: name, habits: [] };
            updatedHabits.push(newDay);
          }
        }
        
        // Sort by date and keep a window (past 1 day + future 7 days)
        updatedHabits.sort((a, b) => a.id.localeCompare(b.id));
        
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayId = yesterday.toISOString().split('T')[0];
        
        updatedHabits = updatedHabits.filter(h => h.id >= yesterdayId);
        if (updatedHabits.length > 10) updatedHabits = updatedHabits.slice(0, 10);


        // 2. Skill Sync
        const habitsThatShouldExist = skillDefs
          .filter(skill => state.skills.includes(skill.id) && skill.habit)
          .map(skill => ({ id: `h-${skill.id}`, name: skill.habit }));

        updatedHabits = updatedHabits.map(day => {
          const existingIds = new Set(day.habits.map(h => h.id));
          const missingHabits = habitsThatShouldExist.filter(h => !existingIds.has(h.id));
          if (missingHabits.length > 0) {
            needsUpdate = true;
            return { 
              ...day, 
              habits: [...day.habits, ...missingHabits.map(h => ({ ...h, done: false }))] 
            };
          }
          return day;
        });

        if (needsUpdate) return { habits: updatedHabits };
        return {};
      }),

      // Auth Actions
      login: (username, password) => set((state) => {
        if (state.profile.username === username && state.profile.password === password) {
          return { isAuthenticated: true };
        }
        return {}; 
      }),
      register: (userData) => set((state) => ({
        profile: { ...state.profile, ...userData },
        isAuthenticated: true
      })),
      logout: () => set({ isAuthenticated: false }),

      // Cleanup helper: Resets completely to EMPTY_STATE
      resetAllData: () => set(EMPTY_STATE)
    }),
    {
      name: 'life_os_storage', // The singular key in localStorage
    }
  )
);
