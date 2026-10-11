/**
 * Ranking Service
 * Provides comprehensive Hunter / RPG rank tier data, calculations,
 * perks, multipliers, and performance synergies for E.O.M.
 */

export const RANK_TIERS = [
  {
    rank: 'Z',
    title: 'Unawakened',
    subtitle: 'Dormant Potential',
    badge: '🌑',
    minXp: 0,
    color: '#71717a',
    glowColor: 'rgba(113, 113, 122, 0.4)',
    multiplier: 1.0,
    perk: 'Base 1.0x XP Gain',
    lore: 'The seed of discipline rests dormant beneath the soil. Every titan begins as an unawakened initiate.'
  },
  {
    rank: 'W',
    title: 'Wanderer',
    subtitle: 'First Footsteps',
    badge: '🧭',
    minXp: 15000,
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    multiplier: 1.05,
    perk: '+5% XP Multiplier on all activities',
    lore: 'You have chosen intentional direction over drift. The fog of doubt begins to dissipate.'
  },
  {
    rank: 'F',
    title: 'Initiate Hunter',
    subtitle: 'Foundation Established',
    badge: '⚔️',
    minXp: 40000,
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    multiplier: 1.10,
    perk: '+10% XP Multiplier & Foundation Crest',
    lore: 'Routines crystallize into steel. Your daily execution starts separating you from the masses.'
  },
  {
    rank: 'E',
    title: 'Iron Scout',
    subtitle: 'Resilient Momentum',
    badge: '🛡️',
    minXp: 75000,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    multiplier: 1.15,
    perk: '+15% XP Multiplier & Discipline Armor',
    lore: 'Resistance and fatigue no longer break your resolve. You advance under all weather.'
  },
  {
    rank: 'D',
    title: 'Vanguard Operator',
    subtitle: 'Frontline Strike',
    badge: '⚡',
    minXp: 120000,
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.5)',
    multiplier: 1.20,
    perk: '+20% XP Multiplier & Rapid Quest Progression',
    lore: 'Momentum is weaponized. Tasks are eliminated swiftly before resistance can materialize.'
  },
  {
    rank: 'C',
    title: 'Elite Striker',
    subtitle: 'Ruthless Execution',
    badge: '🔥',
    minXp: 180000,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    multiplier: 1.25,
    perk: '+25% XP Multiplier & Deep Work Focus Shield',
    lore: 'Distraction is incinerated. Every hour carries tangible kinetic velocity toward your life goals.'
  },
  {
    rank: 'B',
    title: 'Veteran Specialist',
    subtitle: 'Strategic Mastery',
    badge: '🔮',
    minXp: 260000,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    multiplier: 1.30,
    perk: '+30% XP Multiplier & Habit Synergy Buff',
    lore: 'Health, mind, and capital are no longer separate chores; they are a synchronized, unstoppable legion.'
  },
  {
    rank: 'A',
    title: 'Apex Hunter',
    subtitle: 'Pinnacle Performer',
    badge: '💎',
    minXp: 380000,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.65)',
    multiplier: 1.40,
    perk: '+40% XP Multiplier & Apex Hunter Aura',
    lore: 'A master of self-mastery. You command your habits and bend circumstances to your willpower.'
  },
  {
    rank: 'S',
    title: 'Shadow Sovereign',
    subtitle: 'Personal Sovereign',
    badge: '👑',
    minXp: 550000,
    color: '#d48f48',
    glowColor: 'rgba(212, 143, 72, 0.7)',
    multiplier: 1.50,
    perk: '+50% XP Multiplier & Sovereign Monarch Crest',
    lore: 'Total command of mind and action. The system serves you as a sovereign ruler over chaos.'
  },
  {
    rank: 'S+',
    title: 'Monarch of Order',
    subtitle: 'Transcendent Discipline',
    badge: '🌌',
    minXp: 750000,
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.75)',
    multiplier: 1.65,
    perk: '+65% XP Multiplier & Cosmic Order Halo',
    lore: 'Unshakeable consistency across all domains. You have built an empire of personal sovereignty.'
  },
  {
    rank: 'EX',
    title: 'Transcendent Apex',
    subtitle: 'Living Legend',
    badge: '☀️',
    minXp: 1000000,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.85)',
    multiplier: 1.80,
    perk: '+80% XP Multiplier & Mythic Transcendent Aura',
    lore: 'Beyond ordinary human limits. An immortal monument to relentless dedication and human potential.'
  }
];

/**
 * Calculates current rank status based on total XP
 * @param {number} xp 
 * @returns {object} Current rank, next rank, progress percentage, and XP breakdown
 */
export const calculateRank = (xp = 0) => {
  const safeXp = Math.max(0, Number(xp) || 0);
  let currentRank = RANK_TIERS[0];
  let nextRank = RANK_TIERS[1];
  let rankIndex = 0;

  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (safeXp >= RANK_TIERS[i].minXp) {
      currentRank = RANK_TIERS[i];
      rankIndex = i;
      nextRank = RANK_TIERS[i + 1] || null;
    } else {
      break;
    }
  }

  const xpInLevel = safeXp - currentRank.minXp;
  const levelTotalXp = nextRank ? nextRank.minXp - currentRank.minXp : 250000;
  const progress = nextRank 
    ? Math.min(Math.max((xpInLevel / levelTotalXp) * 100, 0), 100)
    : 100;

  return {
    currentRank,
    nextRank,
    progress,
    xpInLevel,
    levelTotalXp,
    rankIndex,
    isMaxRank: !nextRank
  };
};

/**
 * Calculates XP earned adjusted for rank multiplier
 * @param {number} baseXp 
 * @param {object} rank 
 * @returns {number} Multiplied XP
 */
export const calculateXpWithPerks = (baseXp, rank) => {
  if (!baseXp || baseXp <= 0) return baseXp;
  const multiplier = rank?.multiplier || 1.0;
  return Math.round(baseXp * multiplier);
};

/**
 * Find tier by rank code (e.g. 'S', 'Z', 'EX')
 * @param {string} code 
 * @returns {object|undefined}
 */
export const getRankByCode = (code) => {
  return RANK_TIERS.find(t => t.rank === code);
};
