import { UserData, Mission, Player } from './types';
import { INITIAL_MISSIONS, ROLES, CATEGORIES } from './constants';

const STORAGE_KEY = 'hidden_among_us_data';

const DEFAULT_DATA: UserData = {
  coins: 100,
  unlockedRoles: ['civilian', 'spy', 'detective', 'medic'],
  unlockedCategories: ['food', 'countries', 'animals', 'movies', 'jobs', 'clothing', 'household', 'transport', 'school', 'body', 'weather', 'colors', 'fruits', 'vegetables', 'nature'],
  lastWheelSpin: null,
  players: [],
  lastMissionDate: new Date().toDateString(),
  lastMonthlyReset: new Date().getMonth().toString() + '-' + new Date().getFullYear().toString(),
  lastYearlyReset: new Date().getFullYear().toString(),
  missions: INITIAL_MISSIONS,
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    abilitiesUsed: 0
  }
};

export const loadUserData = (): UserData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_DATA;
    
    const parsed = JSON.parse(data) as UserData;
    
    // Migration for new fields
    if (!parsed.unlockedCategories) parsed.unlockedCategories = DEFAULT_DATA.unlockedCategories;
    if (parsed.lastWheelSpin === undefined) parsed.lastWheelSpin = null;
    if (!parsed.lastMonthlyReset) parsed.lastMonthlyReset = DEFAULT_DATA.lastMonthlyReset;
    if (!parsed.lastYearlyReset) parsed.lastYearlyReset = DEFAULT_DATA.lastYearlyReset;
    if (!parsed.stats) parsed.stats = DEFAULT_DATA.stats;
    if (!parsed.players) parsed.players = DEFAULT_DATA.players;
    if (parsed.coins === undefined) parsed.coins = DEFAULT_DATA.coins;
    if (!parsed.unlockedRoles) parsed.unlockedRoles = DEFAULT_DATA.unlockedRoles;
    
    let needsSave = false;

  // Migration for missions
  if (!parsed.missions || parsed.missions.length === 0) {
    parsed.missions = INITIAL_MISSIONS;
    needsSave = true;
  } else {
    // Merge INITIAL_MISSIONS to add any new ones
    const existingIds = new Set(parsed.missions.map(m => m.id));
    const newMissions = INITIAL_MISSIONS.filter(m => !existingIds.has(m.id));
    if (newMissions.length > 0) {
      parsed.missions = [...parsed.missions, ...newMissions];
      needsSave = true;
    }
    // Remove any missions that are no longer in INITIAL_MISSIONS
    const initialIds = new Set(INITIAL_MISSIONS.map(m => m.id));
    const filteredMissions = parsed.missions.filter(m => initialIds.has(m.id));
    if (filteredMissions.length !== parsed.missions.length) {
      parsed.missions = filteredMissions;
      needsSave = true;
    }
  }
  
  // Ensure all non-premium roles are unlocked
  const nonPremiumRoleIds = ROLES.filter(r => !r.isPremium).map(r => r.id);
  const uniqueUnlocked = Array.from(new Set([...parsed.unlockedRoles, ...nonPremiumRoleIds]));
  if (uniqueUnlocked.length !== parsed.unlockedRoles.length) {
    parsed.unlockedRoles = uniqueUnlocked;
    needsSave = true;
  }
  
  // Check if missions need reset
  const today = new Date().toDateString();
  const currentMonth = new Date().getMonth().toString() + '-' + new Date().getFullYear().toString();
  const currentYear = new Date().getFullYear().toString();
  
  if (parsed.lastMissionDate !== today) {
    parsed.lastMissionDate = today;
    // Reset daily missions
    parsed.missions = parsed.missions.map(m => {
      const initial = INITIAL_MISSIONS.find(im => im.id === m.id);
      return m.period === 'DAILY' && initial ? { ...initial, current: 0, isCompleted: false, isClaimed: false } : m;
    });
    needsSave = true;
  }
  
  if (parsed.lastMonthlyReset !== currentMonth) {
    parsed.lastMonthlyReset = currentMonth;
    // Reset monthly missions
    parsed.missions = parsed.missions.map(m => {
      const initial = INITIAL_MISSIONS.find(im => im.id === m.id);
      return m.period === 'MONTHLY' && initial ? { ...initial, current: 0, isCompleted: false, isClaimed: false } : m;
    });
    needsSave = true;
  }
  
  if (parsed.lastYearlyReset !== currentYear) {
    parsed.lastYearlyReset = currentYear;
    // Reset yearly missions
    parsed.missions = parsed.missions.map(m => {
      const initial = INITIAL_MISSIONS.find(im => im.id === m.id);
      return m.period === 'YEARLY' && initial ? { ...initial, current: 0, isCompleted: false, isClaimed: false } : m;
    });
    needsSave = true;
  }
  
  if (needsSave) saveUserData(parsed);
  
  return parsed;
  } catch (e) {
    console.error("Error loading user data:", e);
    return DEFAULT_DATA;
  }
};

export const saveUserData = (data: UserData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateStats = (won: boolean, abilityUsed: boolean, spin: boolean = false, role?: string, isPerfect?: boolean, isFast?: boolean) => {
  const data = loadUserData();
  data.stats.gamesPlayed += 1;
  if (won) data.stats.gamesWon += 1;
  if (abilityUsed) data.stats.abilitiesUsed += 1;
  
  const currentRole = ROLES.find(r => r.id === role);
  const isSpy = currentRole?.team === 'SPY';
  const isCivilian = currentRole?.team === 'CIVILIAN';

  // Update missions
  data.missions = data.missions.map(m => {
    // Play missions
    if (m.id.startsWith('play-')) m.current = Math.min(m.target, m.current + 1);
    
    // Win missions
    if (m.id.startsWith('win-') && won) {
      if (m.id === 'win-spy-monthly' && !isSpy) return m;
      if (m.id === 'win-civ-monthly' && !isCivilian) return m;
      if (m.id === 'spy-master' && !isSpy) return m;
      if (m.id === 'civ-hero' && !isCivilian) return m;
      if (m.id === 'fool-win' && role !== 'fool') return m;
      if (m.id === 'serial-killer-pro' && role !== 'serial_killer') return m;
      m.current = Math.min(m.target, m.current + 1);
    }
    
    // Perfect win missions
    if (m.id.includes('perfect-win') && isPerfect && won) {
      m.current = Math.min(m.target, m.current + 1);
    }

    // Fast win missions
    if (m.id.includes('fast-win') && isFast && won) {
      m.current = Math.min(m.target, m.current + 1);
    }

    // Ability missions
    if ((m.id.includes('ability-') || m.id.includes('-pro') || m.id.includes('-monthly')) && abilityUsed) {
      if (m.id === 'detective-monthly' && role !== 'detective') return m;
      if (m.id === 'medic-monthly' && role !== 'medic') return m;
      if (m.id === 'sniper-pro' && role !== 'sniper') return m;
      if (m.id === 'hacker-pro' && role !== 'hacker') return m;
      if (m.id === 'medic-pro' && role !== 'medic') return m;
      if (m.id === 'detective-pro' && role !== 'detective') return m;
      if (m.id === 'mayor-pro' && role !== 'mayor') return m;
      if (m.id === 'thief-pro' && role !== 'thief') return m;
      if (m.id === 'werewolf-pro' && role !== 'werewolf') return m;
      if (m.id === 'vampire-pro' && role !== 'vampire') return m;
      
      if (m.id.includes('ability-') || m.id.includes('-pro') || m.id.includes('-monthly')) {
        m.current = Math.min(m.target, m.current + 1);
      }
    }
    
    if (m.id === 'use-ability-daily' && abilityUsed) m.current = Math.min(m.target, m.current + 1);

    // Spin missions
    if (m.id.startsWith('spin-') && spin) m.current = Math.min(m.target, m.current + 1);
    
    // Unlock missions
    if (m.id.startsWith('unlock-')) {
      const premiumRoles = data.unlockedRoles.filter(id => ROLES.find(r => r.id === id)?.isPremium).length;
      const premiumCats = data.unlockedCategories.filter(id => CATEGORIES.find(c => c.id === id)?.isPremium).length;
      m.current = Math.min(m.target, premiumRoles + premiumCats);
    }

    // Coins missions
    if (m.id.startsWith('coins-yearly-') || m.id === 'coins-monthly') {
      m.current = Math.min(m.target, data.coins);
    }

    if (m.current >= m.target) m.isCompleted = true;
    return m;
  });
  
  saveUserData(data);
};

export const trackAction = (action: 'ADD_PLAYER' | 'CHANGE_AVATAR' | 'VOTE' | 'CHAT' | 'UNLOCK_ROLE' | 'UNLOCK_CAT') => {
  const data = loadUserData();
  data.missions = data.missions.map(m => {
    if (action === 'ADD_PLAYER' && m.id === 'add-players-daily') m.current = Math.min(m.target, m.current + 1);
    if (action === 'CHANGE_AVATAR' && m.id === 'change-avatar-daily') m.current = Math.min(m.target, m.current + 1);
    if (action === 'VOTE' && (m.id === 'vote-monthly' || m.id === 'vote-daily')) m.current = Math.min(m.target, m.current + 1);
    if (action === 'CHAT' && (m.id === 'chat-monthly' || m.id === 'chat-daily')) m.current = Math.min(m.target, m.current + 1);
    if (action === 'UNLOCK_ROLE' && m.id === 'unlock-role-monthly') m.current = Math.min(m.target, m.current + 1);
    if (action === 'UNLOCK_CAT' && m.id === 'unlock-cat-monthly') m.current = Math.min(m.target, m.current + 1);
    
    if (m.current >= m.target) m.isCompleted = true;
    return m;
  });
  saveUserData(data);
};

export const addCoins = (amount: number) => {
  const data = loadUserData();
  data.coins += amount;
  
  // Update coin missions
  data.missions = data.missions.map(m => {
    if (m.id.startsWith('coins-yearly-') || m.id === 'coins-monthly') {
      m.current = Math.min(m.target, data.coins);
      if (m.current >= m.target) m.isCompleted = true;
    }
    return m;
  });
  
  saveUserData(data);
};

export const unlockRole = (roleId: string, cost: number): boolean => {
  const data = loadUserData();
  if (data.coins >= cost && !data.unlockedRoles.includes(roleId)) {
    data.coins -= cost;
    data.unlockedRoles.push(roleId);
    saveUserData(data);
    return true;
  }
  return false;
};

export const unlockCategory = (categoryId: string, cost: number): boolean => {
  const data = loadUserData();
  if (data.coins >= cost && !data.unlockedCategories.includes(categoryId)) {
    data.coins -= cost;
    data.unlockedCategories.push(categoryId);
    saveUserData(data);
    return true;
  }
  return false;
};

export const savePlayers = (players: Player[]) => {
  const data = loadUserData();
  data.players = players;
  saveUserData(data);
};

export const claimMission = (missionId: string): boolean => {
  const data = loadUserData();
  const mission = data.missions.find(m => m.id === missionId);
  if (mission && mission.isCompleted && !mission.isClaimed) {
    mission.isClaimed = true;
    data.coins += mission.reward;
    saveUserData(data);
    return true;
  }
  return false;
};

export const spinWheel = (cost: number): { success: boolean, prize?: string, amount?: number, roleId?: string, categoryId?: string } => {
  const data = loadUserData();
  if (data.coins < cost) return { success: false };
  
  data.coins -= cost;
  data.lastWheelSpin = new Date().toISOString();
  
  const prizes = [
    { type: 'coins', amount: 50, weight: 40 },
    { type: 'coins', amount: 100, weight: 25 },
    { type: 'coins', amount: 200, weight: 15 },
    { type: 'coins', amount: 500, weight: 5 },
    { type: 'role', weight: 10 },
    { type: 'category', weight: 5 }
  ];
  
  const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedPrize = prizes[0];
  
  for (const p of prizes) {
    if (random < p.weight) {
      selectedPrize = p;
      break;
    }
    random -= p.weight;
  }
  
  if (selectedPrize.type === 'coins') {
    data.coins += selectedPrize.amount!;
    saveUserData(data);
    return { success: true, prize: 'coins', amount: selectedPrize.amount };
  } else if (selectedPrize.type === 'role') {
    const lockedRoles = ROLES.filter(r => r.isPremium && !data.unlockedRoles.includes(r.id));
    if (lockedRoles.length > 0) {
      const role = lockedRoles[Math.floor(Math.random() * lockedRoles.length)];
      data.unlockedRoles.push(role.id);
      saveUserData(data);
      return { success: true, prize: 'role', amount: 1, roleId: role.id };
    } else {
      data.coins += 300; // Fallback
      saveUserData(data);
      return { success: true, prize: 'coins', amount: 300 };
    }
  } else {
    // category
    const lockedCats = CATEGORIES.filter(c => c.isPremium && !data.unlockedCategories.includes(c.id));
    if (lockedCats.length > 0) {
      const cat = lockedCats[Math.floor(Math.random() * lockedCats.length)];
      data.unlockedCategories.push(cat.id);
      saveUserData(data);
      return { success: true, prize: 'category', amount: 1, categoryId: cat.id };
    } else {
      data.coins += 200; // Fallback
      saveUserData(data);
      return { success: true, prize: 'coins', amount: 200 };
    }
  }
};
