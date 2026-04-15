export const SKILL_DEF = [
  // Core
  { id: 'core', name: 'Life Tree', habit: 'Daily Tracker Check', icon: '🌳', reqs: [], category: 'Core' },

  // --- HEALTH --- RL (Left)
  { id: 'health', name: 'Health', habit: 'Drink 2L Water', icon: '❤️', reqs: ['core'], category: 'Health' },
  { id: 'sports', name: 'Sports', habit: '30m Activity', icon: '🏃‍♂️', reqs: ['health'], category: 'Health' },
  { id: 'gym', name: 'Gym', habit: 'Lift Weights', icon: '🏋️‍♂️', reqs: ['sports'], category: 'Health' },
  { id: 'mma', name: 'Mixed Martial Arts', habit: 'Shadowbox / Drill', icon: '🥊', reqs: ['sports'], category: 'Health' },
  { id: 'challenges', name: 'Challenges & Competition', habit: 'Push Limits', icon: '🏆', reqs: ['sports'], category: 'Health' },
  { id: 'eating', name: 'Eating Habits', habit: 'Track Macros', icon: '🥗', reqs: ['health'], category: 'Health' },
  { id: 'eat_natural', name: 'Natural', habit: 'Eat 1 Fruit', icon: '🥑', reqs: ['eating'], category: 'Health' },
  { id: 'eat_self', name: 'Self Cooked', habit: 'Cook 1 Meal', icon: '🍳', reqs: ['eating'], category: 'Health' },
  { id: 'eat_fast', name: 'Fast food', habit: 'Zero Junk Food', icon: '🍔', reqs: ['eating'], category: 'Health' },
  { id: 'resting', name: 'Resting Habits', habit: 'No Screen before bed', icon: '🔋', reqs: ['health'], category: 'Health' },
  { id: 'sleep', name: 'Sleep Schedule', habit: '8 Hours Sleep', icon: '🛌', reqs: ['resting'], category: 'Health' },

  // --- INTELLIGENCE --- TB (Bottom)
  { id: 'intel', name: 'Intelligence', habit: 'Learn 1 New Fact', icon: '🧠', reqs: ['core'], category: 'Mental' },
  { id: 'languages', name: 'Languages', habit: '15m Dualingo', icon: '🗣️', reqs: ['intel'], category: 'Mental' },
  { id: 'comm', name: 'Communication', habit: 'Active Listening', icon: '💬', reqs: ['languages'], category: 'Mental' },
  { id: 'read', name: 'Reading', habit: 'Read 10 Pages', icon: '📚', reqs: ['intel'], category: 'Mental' },
  { id: 'education', name: 'Education', habit: 'Study 30m', icon: '🎓', reqs: ['intel'], category: 'Mental' },
  { id: 'studies', name: 'Studies', habit: 'Review Notes', icon: '🖊️', reqs: ['education'], category: 'Mental' },

  // --- SPIRITUALITY --- BT (Top)
  { id: 'spirit', name: 'Spirituality', habit: '10m Meditation', icon: '✨', reqs: ['core'], category: 'Spirit' },
  { id: 'religion', name: 'Religion', habit: 'Read Scripture', icon: '⛪', reqs: ['spirit'], category: 'Spirit' },
  { id: 'rel_prac', name: 'Practices', habit: 'Daily Prayer', icon: '🙏', reqs: ['religion'], category: 'Spirit' },
  { id: 'prayers', name: 'Prayers', habit: 'Morning Prayer', icon: '📿', reqs: ['spirit'], category: 'Spirit' },
  { id: 'thankful', name: 'Thankfulness', habit: 'Gratitude Journal', icon: '🙌', reqs: ['prayers'], category: 'Spirit' },
  { id: 'holyscripts', name: 'Holy Scripts', habit: 'Study Texts', icon: '📖', reqs: ['spirit'], category: 'Spirit' },

  // --- RELATIONSHIPS --- LR (Right)
  { id: 'rel', name: 'Relationships', habit: 'Text 1 Person', icon: '🤝', reqs: ['core'], category: 'Social' },
  { id: 'friends', name: 'Friends', habit: 'Call a friend', icon: '🍻', reqs: ['rel'], category: 'Social' },
  { id: 'women', name: 'Women', habit: 'Approach / Compliment', icon: '💕', reqs: ['rel'], category: 'Social' },
  { id: 'family', name: 'Family', habit: 'Call parents', icon: '👨‍👩‍👧‍👦', reqs: ['rel'], category: 'Social' },

  // --- AGENCY --- LR offset (Right Offset)
  { id: 'agency', name: 'Agency', habit: 'Plan the Day', icon: '♟️', reqs: ['core'], category: 'Career' },
  { id: 'resources', name: 'Resources', habit: 'Save $10', icon: '📦', reqs: ['agency'], category: 'Career' },
  { id: 'res_people', name: 'People', habit: 'Networking message', icon: '👥', reqs: ['resources'], category: 'Career' },
  { id: 'res_db', name: 'Databases', habit: 'Organize Files', icon: '🗄️', reqs: ['resources'], category: 'Career' },
  { id: 'res_money', name: 'Money', habit: 'Track Expenses', icon: '💰', reqs: ['resources'], category: 'Career' },
  { id: 'res_books', name: 'Books', habit: 'Organize Library', icon: '📙', reqs: ['resources'], category: 'Career' },
  { id: 'res_media', name: 'Media', habit: 'Consume 1 Pod', icon: '🎬', reqs: ['resources'], category: 'Career' },
  { id: 'media_series', name: 'Series', habit: 'Watch 1 Ep', icon: '📺', reqs: ['res_media'], category: 'Career' },
  { id: 'media_movies', name: 'Movies', habit: 'Watch Movie', icon: '🍿', reqs: ['res_media'], category: 'Career' }
];
