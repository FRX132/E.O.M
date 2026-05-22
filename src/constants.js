// Ranking System
export const RANK_TIERS = [
  { rank: 'Z', minXp: 0 },
  { rank: 'W', minXp: 20000 },
  { rank: 'F', minXp: 60000 },
  { rank: 'C', minXp: 80000 },
  { rank: 'B', minXp: 100000 },
  { rank: 'A', minXp: 150000 },
  { rank: 'S', minXp: 200000 },
  { rank: 'S+', minXp: 300000 },
];

export const calculateRank = (xp) => {
  let currentRank = RANK_TIERS[0];
  let nextRank = RANK_TIERS[1];

  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp >= RANK_TIERS[i].minXp) {
      currentRank = RANK_TIERS[i];
      nextRank = RANK_TIERS[i + 1] || null;
    } else {
      break;
    }
  }

  const xpInLevel = xp - currentRank.minXp;
  const levelTotalXp = nextRank ? nextRank.minXp - currentRank.minXp : 100000;
  const progress = Math.min(Math.max((xpInLevel / levelTotalXp) * 100, 0), 100);

  return { currentRank, nextRank, progress, xpInLevel, levelTotalXp };
};

export const SKILL_DEF = [
  // Core
  { id: 'core', name: 'Life Tree', habit: 'Daily Tracker Check', icon: '🌳', reqs: [], category: 'Core', xpReq: 0 },

  // --- HEALTH --- RL (Left)
  { id: 'health', name: 'Health', habit: 'Drink 2L Water', icon: '❤️', reqs: ['core'], category: 'Health', xpReq: 1000, quest: 'Complete "Drink 2L Water" 3 days in a row', duration: 3 },
  { id: 'sports', name: 'Sports', habit: '30m Activity', icon: '🏃‍♂️', reqs: ['health'], category: 'Health', xpReq: 5000, quest: 'Do any physical activity for 30m', duration: 5 },
  { id: 'gym', name: 'Gym', habit: 'Lift Weights', icon: '🏋️‍♂️', reqs: ['sports'], category: 'Health', xpReq: 10000, quest: 'Intense strength training session', duration: 7 },
  { id: 'mma', name: 'Mixed Martial Arts', habit: 'Shadowbox / Drill', icon: '🥊', reqs: ['sports'], category: 'Health', xpReq: 15000, quest: 'Practice specialized combat drills', duration: 10 },
  { id: 'challenges', name: 'Challenges & Competition', habit: 'Push Limits', icon: '🏆', reqs: ['sports'], category: 'Health', xpReq: 25000, quest: 'Win a competitive event or set a PR', duration: 14 },
  { id: 'eating', name: 'Eating Habits', habit: 'Track Macros', icon: '🥗', reqs: ['health'], category: 'Health', xpReq: 3000, quest: 'Log every meal for 5 days', duration: 5 },
  { id: 'eat_natural', name: 'Natural', habit: 'Eat 1 Fruit', icon: '🥑', reqs: ['eating'], category: 'Health', xpReq: 6000, quest: 'Eat organic/whole foods only', duration: 7 },
  { id: 'eat_self', name: 'Self Cooked', habit: 'Cook 1 Meal', icon: '🍳', reqs: ['eating'], category: 'Health', xpReq: 9000, quest: 'Prepare 10 meals at home', duration: 10 },
  { id: 'eat_fast', name: 'Fast food', habit: 'Zero Junk Food', icon: '🍔', reqs: ['eating'], category: 'Health', xpReq: 12000, quest: 'Strict no-junk-food streak', duration: 15 },
  { id: 'resting', name: 'Resting Habits', habit: 'No Screen before bed', icon: '🔋', reqs: ['health'], category: 'Health', xpReq: 4000, quest: 'Deep rest / No screens', duration: 5 },
  { id: 'sleep', name: 'Sleep Schedule', habit: '8 Hours Sleep', icon: '🛌', reqs: ['resting'], category: 'Health', xpReq: 8000, quest: 'Perfect 8h sleep cycle', duration: 7 },

  // --- INTELLIGENCE --- TB (Bottom)
  { id: 'intel', name: 'Intelligence', habit: 'Learn 1 New Fact', icon: '🧠', reqs: ['core'], category: 'Mental', xpReq: 2000, quest: 'Research a complex topic deeply', duration: 3 },
  { id: 'languages', name: 'Languages', habit: '15m Dualingo', icon: '🗣️', reqs: ['intel'], category: 'Mental', xpReq: 7000, quest: 'Achieve a 10-day streak on Lingua', duration: 10 },
  { id: 'comm', name: 'Communication', habit: 'Active Listening', icon: '💬', reqs: ['languages'], category: 'Mental', xpReq: 12000, quest: 'Deliver a presentation or speech', duration: 5 },
  { id: 'read', name: 'Reading', habit: 'Read 10 Pages', icon: '📚', reqs: ['intel'], category: 'Mental', xpReq: 6000, quest: 'Finish one non-fiction book', duration: 14 },
  { id: 'education', name: 'Education', habit: 'Study 30m', icon: '🎓', reqs: ['intel'], category: 'Mental', xpReq: 15000, quest: 'Complete an online certificate', duration: 30 },
  { id: 'studies', name: 'Studies', habit: 'Review Notes', icon: '🖊️', reqs: ['education'], category: 'Mental', xpReq: 20000, quest: 'Ace a mock exam or project', duration: 10 },

  // --- SPIRITUALITY --- BT (Top)
  { id: 'spirit', name: 'Spirituality', habit: '10m Meditation', icon: '✨', reqs: ['core'], category: 'Spirit', xpReq: 2000, quest: 'Silent retreat for one hour', duration: 3 },
  { id: 'religion', name: 'Religion', habit: 'Read Scripture', icon: '⛪', reqs: ['spirit'], category: 'Spirit', xpReq: 5000, quest: 'Visit a place of worship', duration: 5 },
  { id: 'rel_prac', name: 'Practices', habit: 'Daily Prayer', icon: '🙏', reqs: ['religion'], category: 'Spirit', xpReq: 8000, quest: 'Consistent daily devotion', duration: 7 },
  { id: 'prayers', name: 'Prayers', habit: 'Morning Prayer', icon: '📿', reqs: ['spirit'], category: 'Spirit', xpReq: 4000, quest: 'Consistent morning routine', duration: 5 },
  { id: 'thankful', name: 'Thankfulness', habit: 'Gratitude Journal', icon: '🙌', reqs: ['prayers'], category: 'Spirit', xpReq: 7000, quest: 'Weekly gratitude recap', duration: 7 },
  { id: 'holyscripts', name: 'Holy Scripts', habit: 'Study Texts', icon: '📖', reqs: ['spirit'], category: 'Spirit', xpReq: 12000, quest: 'Summarize a holy text chapter', duration: 10 },

  // --- RELATIONSHIPS --- LR (Right)
  { id: 'rel', name: 'Relationships', habit: 'Text 1 Person', icon: '🤝', reqs: ['core'], category: 'Social', xpReq: 3000, quest: 'Hang out with a new acquaintance', duration: 5 },
  { id: 'friends', name: 'Friends', habit: 'Call a friend', icon: '🍻', reqs: ['rel'], category: 'Social', xpReq: 8000, quest: 'Organize a group gathering', duration: 7 },
  { id: 'women', name: 'Women', habit: 'Approach / Compliment', icon: '💕', reqs: ['rel'], category: 'Social', xpReq: 12000, quest: 'Go on a meaningful date', duration: 10 },
  { id: 'family', name: 'Family', habit: 'Call parents', icon: '👨‍👩‍👧‍👦', reqs: ['rel'], category: 'Social', xpReq: 6000, quest: 'Help a family member with a task', duration: 5 },

  // --- AGENCY --- LR offset (Right Offset)
  { id: 'agency', name: 'Agency', habit: 'Plan the Day', icon: '♟️', reqs: ['core'], category: 'Career', xpReq: 5000, quest: 'Set one-month vision plan', duration: 7 },
  { id: 'resources', name: 'Resources', habit: 'Save $10', icon: '📦', reqs: ['agency'], category: 'Career', xpReq: 10000, quest: 'Asset allocation audit', duration: 14 },
  { id: 'res_people', name: 'People', habit: 'Networking message', icon: '👥', reqs: ['resources'], category: 'Career', xpReq: 15000, quest: 'Attend a networking workshop', duration: 7 },
  { id: 'res_db', name: 'Databases', habit: 'Organize Files', icon: '🗄️', reqs: ['resources'], category: 'Career', xpReq: 12000, quest: 'Full digital declutter', duration: 5 },
  { id: 'res_money', name: 'Money', habit: 'Track Expenses', icon: '💰', reqs: ['resources'], category: 'Career', xpReq: 20000, quest: 'Diversify revenue streams', duration: 30 },
  { id: 'res_books', name: 'Books', habit: 'Organize Library', icon: '📙', reqs: ['resources'], category: 'Career', xpReq: 8000, quest: 'Review 3 core library books', duration: 10 },
  { id: 'res_media', name: 'Media', habit: 'Consume 1 Pod', icon: '🎬', reqs: ['resources'], category: 'Career', xpReq: 10000, quest: 'Create 1 piece of content', duration: 7 },
  { id: 'media_series', name: 'Series', habit: 'Watch 1 Ep', icon: '📺', reqs: ['res_media'], category: 'Career', xpReq: 5000, quest: 'Critical review of a series', duration: 5 },
  { id: 'media_movies', name: 'Movies', habit: 'Watch Movie', icon: '🍿', reqs: ['res_media'], category: 'Career', xpReq: 6000, quest: 'Deconstruct a film narrative', duration: 5 }
];

export const EXERCISE_DATABASE = {
  chest: [
    { name: 'Bench Press', type: 'Free Weight', sets: 3, reps: '8-12' },
    { name: 'Incline Dumbbell Press', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Chest Flyes', type: 'Free Weight', sets: 3, reps: '12-15' },
    { name: 'Pushups', type: 'Bodyweight', sets: 3, reps: 'Until Failure' },
    { name: 'Chest Press Machine', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Pec Deck Machine', type: 'Machine', sets: 3, reps: '12-15' },
    { name: 'Cable Crossovers', type: 'Cable', sets: 3, reps: '12-15' }
  ],
  'upper-back': [
    { name: 'Pullups', type: 'Bodyweight', sets: 3, reps: 'Until Failure' },
    { name: 'Bent Over Rows', type: 'Free Weight', sets: 3, reps: '8-10' },
    { name: 'Lat Pulldowns', type: 'Cable', sets: 3, reps: '10-12' },
    { name: 'Seated Cable Row', type: 'Cable', sets: 3, reps: '10-12' },
    { name: 'T-Bar Row Machine', type: 'Machine', sets: 3, reps: '8-10' }
  ],
  'lower-back': [
    { name: 'Deadlifts', type: 'Free Weight', sets: 3, reps: '5-8' },
    { name: 'Hyperextensions', type: 'Bodyweight', sets: 3, reps: '15' },
    { name: 'Back Extension Machine', type: 'Machine', sets: 3, reps: '12-15' }
  ],
  deltoids: [
    { name: 'Overhead Press', type: 'Free Weight', sets: 3, reps: '8-10' },
    { name: 'Lateral Raises', type: 'Free Weight', sets: 3, reps: '15-20' },
    { name: 'Front Raises', type: 'Free Weight', sets: 3, reps: '12-15' },
    { name: 'Rear Delt Flyes', type: 'Free Weight', sets: 3, reps: '12-15' },
    { name: 'Shoulder Press Machine', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Cable Lateral Raises', type: 'Cable', sets: 3, reps: '12-15' }
  ],
  biceps: [
    { name: 'Barbell Curls', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Hammer Curls', type: 'Free Weight', sets: 3, reps: '12' },
    { name: 'Preacher Curls', type: 'Free Weight', sets: 2, reps: '12-15' },
    { name: 'Bicep Curl Machine', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Cable Curls', type: 'Cable', sets: 3, reps: '12-15' }
  ],
  triceps: [
    { name: 'Skull Crushers', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Tricep Pushdowns', type: 'Cable', sets: 3, reps: '12-15' },
    { name: 'Dips', type: 'Bodyweight', sets: 3, reps: 'Until Failure' },
    { name: 'Tricep Extension Machine', type: 'Machine', sets: 3, reps: '10-12' }
  ],
  abs: [
    { name: 'Plank', type: 'Bodyweight', sets: 3, reps: '60s' },
    { name: 'Leg Raises', type: 'Bodyweight', sets: 3, reps: '15-20' },
    { name: 'Crunches', type: 'Bodyweight', sets: 3, reps: '20' },
    { name: 'Ab Crunch Machine', type: 'Machine', sets: 3, reps: '15-20' },
    { name: 'Cable Crunches', type: 'Cable', sets: 3, reps: '15-20' }
  ],
  quadriceps: [
    { name: 'Squats', type: 'Free Weight', sets: 3, reps: '8-10' },
    { name: 'Leg Press', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Leg Extensions', type: 'Machine', sets: 3, reps: '15' },
    { name: 'Hack Squat Machine', type: 'Machine', sets: 3, reps: '8-10' }
  ],
  hamstring: [
    { name: 'Stiff Leg Deadlifts', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Seated Leg Curls', type: 'Machine', sets: 3, reps: '12-15' },
    { name: 'Lying Leg Curls', type: 'Machine', sets: 3, reps: '10-12' }
  ],
  calves: [
    { name: 'Standing Calf Raises', type: 'Free Weight', sets: 4, reps: '15-20' },
    { name: 'Seated Calf Raise Machine', type: 'Machine', sets: 3, reps: '15-20' },
    { name: 'Calf Press on Leg Press Machine', type: 'Machine', sets: 3, reps: '15-20' }
  ]
};

