import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Play, Info, ShoppingBag, Trophy, 
  Plus, Trash2, ChevronLeft, Timer, 
  EyeOff, Eye, AlertCircle, Coins,
  Shield, Search, Lock, Zap, Target, RefreshCw,
  Gift, Dices, Sparkles, Star, ClipboardCheck,
  MessageSquare, Send, ArrowLeft
} from 'lucide-react';
import { 
  GamePhase, Player, GamePlayer, Role, Category, UserData, Team 
} from './types';
import { CATEGORIES, ROLES, AVATARS, MOCK_LEADERBOARD } from './constants';
import { 
  loadUserData, savePlayers, updateStats, addCoins, unlockRole, claimMission,
  unlockCategory, spinWheel, saveUserData, trackAction
} from './store';

export default function App() {
  // State
  const [phase, setPhase] = useState<GamePhase>('MENU');
  const [userData, setUserData] = useState<UserData>(loadUserData());
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [showCoinBurst, setShowCoinBurst] = useState<boolean>(false);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [spyCount, setSpyCount] = useState<number>(1);
  const [autoSpyCount, setAutoSpyCount] = useState<boolean>(true);
  const [timerDuration, setTimerDuration] = useState<number>(300); // 5 mins in seconds
  const [secretWord, setSecretWord] = useState<string>('');
  const [currentRevealIndex, setCurrentRevealIndex] = useState<number>(0);
  const [isRoleVisible, setIsRoleVisible] = useState<boolean>(false);
  const [gameTimer, setGameTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [questionerIndex, setQuestionerIndex] = useState<number>(0);
  const [answererIndex, setAnswererIndex] = useState<number>(0);
  const [finalChanceWords, setFinalChanceWords] = useState<string[]>([]);
  const [winner, setWinner] = useState<Team | null>(null);
  const [isFullRandomMode, setIsFullRandomMode] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [showAbilityModal, setShowAbilityModal] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(ROLES.filter(r => !r.isPremium).map(r => r.id));
  const [storeTab, setStoreTab] = useState<'ROLES' | 'CATEGORIES' | 'WHEEL'>('ROLES');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<{ prize: string, amount?: number } | null>(null);
  const [missionTab, setMissionTab] = useState<'DAILY' | 'MONTHLY' | 'YEARLY'>('DAILY');
  const [successMessage, setSuccessMessage] = useState<{ title: string, subtitle: string } | null>(null);
  const [susPlayerIds, setSusPlayerIds] = useState<string[]>([]);
  const [discussionTimer, setDiscussionTimer] = useState<number>(60);
  const [isDiscussionTimerRunning, setIsDiscussionTimerRunning] = useState<boolean>(false);
  const [roundCount, setRoundCount] = useState<number>(0);

  // Sound effects helper
  const playSound = (type: 'click' | 'transition' | 'success' | 'timer' | 'reveal') => {
    const sounds = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      transition: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      timer: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
      reveal: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    const data = loadUserData();
    setUserData(data);
    setPlayers(data.players);
  }, []);

  // Discussion Timer Logic
  useEffect(() => {
    if (phase === 'DISCUSSION') {
      setDiscussionTimer(60);
      setIsDiscussionTimerRunning(true);
      setSusPlayerIds([]);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'DISCUSSION' && discussionTimer > 0 && isDiscussionTimerRunning) {
      const timer = setInterval(() => {
        setDiscussionTimer(prev => {
          if (prev <= 1) {
            setIsDiscussionTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, discussionTimer, isDiscussionTimerRunning]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && gameTimer > 0) {
      timerRef.current = setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            playSound('transition');
            setIsTimerRunning(false);
            setPhase('DISCUSSION');
            return 0;
          }
          if (prev <= 10) {
            playSound('timer');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, gameTimer]);

  // Actions
  const handleAddPlayer = (name: string, avatar: string) => {
    playSound('click');
    if (players.length >= 20) return;
    const newPlayer: Player = { id: Math.random().toString(36).substr(2, 9), name, avatar };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    savePlayers(updated);
    trackAction('ADD_PLAYER');
  };

  const handleRemovePlayer = (id: string) => {
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);
    savePlayers(updated);
  };

  const startGame = () => {
    playSound('transition');
    if (players.length < 4) {
      alert('يجب إضافة 4 لاعبين على الأقل!');
      return;
    }
    setPhase('ROLE_SELECTION');
  };

  const finalizeGameStart = () => {
    playSound('transition');
    let finalCategories = selectedCategories;
    let finalSpyCount = spyCount;
    let finalTimer = timerDuration;

    if (isFullRandomMode) {
      const randomCatCount = Math.floor(Math.random() * 2) + 1;
      finalCategories = [...CATEGORIES]
        .sort(() => 0.5 - Math.random())
        .slice(0, randomCatCount)
        .map(c => c.id);
      
      finalSpyCount = Math.max(1, Math.floor(players.length / 4));
      const timerOptions = [180, 300, 420, 600];
      finalTimer = timerOptions[Math.floor(Math.random() * timerOptions.length)];
    }

    if (finalCategories.length === 0) {
      finalCategories = [CATEGORIES[0].id];
    }

    const allWords = CATEGORIES
      .filter(c => finalCategories.includes(c.id))
      .flatMap(c => c.words);
    const word = allWords[Math.floor(Math.random() * allWords.length)];
    setSecretWord(word);

    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const actualSpyCount = autoSpyCount ? Math.max(1, Math.floor(players.length / 4)) : finalSpyCount;
    
    // Assign base roles first
    const newGamePlayers: GamePlayer[] = shuffledPlayers.map((p, i) => {
      const isSpy = i < actualSpyCount;
      return {
        ...p,
        role: ROLES.find(r => r.id === (isSpy ? 'spy' : 'civilian'))!,
        isSpy,
        isEliminated: false,
        hasUsedAbility: false
      };
    });

    // Assign special roles to civilians
    const availableCivilianRoles = ROLES.filter(r => 
      r.team === 'CIVILIAN' && 
      r.id !== 'civilian' && 
      selectedRoleIds.includes(r.id) &&
      (userData.unlockedRoles.includes(r.id) || !r.isPremium)
    );
    
    if (availableCivilianRoles.length > 0) {
      const civilianIndices = newGamePlayers
        .map((p, i) => !p.isSpy ? i : -1)
        .filter(i => i !== -1);
      
      const rolesToAssign = Math.min(Math.floor(civilianIndices.length / 2), availableCivilianRoles.length);
      const shuffledCivilianRoles = [...availableCivilianRoles].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < rolesToAssign; i++) {
        const idx = civilianIndices.splice(Math.floor(Math.random() * civilianIndices.length), 1)[0];
        newGamePlayers[idx].role = shuffledCivilianRoles[i];
      }
    }

    // Assign special roles to spies
    const availableSpyRoles = ROLES.filter(r => 
      r.team === 'SPY' && 
      r.id !== 'spy' && 
      selectedRoleIds.includes(r.id) &&
      (userData.unlockedRoles.includes(r.id) || !r.isPremium)
    );

    if (availableSpyRoles.length > 0) {
      const spyIndices = newGamePlayers
        .map((p, i) => p.isSpy ? i : -1)
        .filter(i => i !== -1);
      
      const rolesToAssign = Math.min(spyIndices.length, availableSpyRoles.length);
      const shuffledSpyRoles = [...availableSpyRoles].sort(() => 0.5 - Math.random());

      for (let i = 0; i < rolesToAssign; i++) {
        const idx = spyIndices.splice(Math.floor(Math.random() * spyIndices.length), 1)[0];
        newGamePlayers[idx].role = shuffledSpyRoles[i];
      }
    }

    setGamePlayers(newGamePlayers.sort(() => 0.5 - Math.random()));
    setPhase('ROLE_REVEAL');
    setCurrentRevealIndex(0);
    setIsRoleVisible(false);
    setGameTimer(finalTimer);
    setIsTimerRunning(true);
    setRoundCount(1);
  };

  const nextReveal = () => {
    playSound('reveal');
    if (currentRevealIndex < gamePlayers.length - 1) {
      setCurrentRevealIndex(prev => prev + 1);
      setIsRoleVisible(false);
    } else {
      const startIdx = Math.floor(Math.random() * gamePlayers.length);
      setQuestionerIndex(startIdx);
      
      let ansIdx = Math.floor(Math.random() * gamePlayers.length);
      while (ansIdx === startIdx) ansIdx = Math.floor(Math.random() * gamePlayers.length);
      setAnswererIndex(ansIdx);

      setPhase('PLAYING');
      setIsTimerRunning(true);
    }
  };

  const handleVote = (playerId: string) => {
    playSound('click');
    const votedPlayer = gamePlayers.find(p => p.id === playerId);
    trackAction('VOTE');
    
    if (votedPlayer?.isSpy) {
      playSound('success');
      const category = CATEGORIES.find(c => c.words.includes(secretWord))!;
      const distractors = category.words
        .filter(w => w !== secretWord)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setFinalChanceWords([...distractors, secretWord].sort(() => 0.5 - Math.random()));
      setPhase('FINAL_CHANCE');
    } else {
      playSound('timer');
      setWinner('SPY');
      addCoins(50); // Increased reward for spy win
      setPhase('RESULTS');
      
      const isPerfect = !gamePlayers.some(p => !p.isSpy && p.isEliminated);
      const isFast = roundCount === 1;
      updateStats(true, false, false, 'spy', isPerfect, isFast); // Spy won
    }
  };

  const handleFinalGuess = (word: string) => {
    const spyPlayer = gamePlayers.find(p => p.isSpy);
    const isPerfect = !gamePlayers.some(p => !p.isSpy && p.isEliminated);
    const isFast = roundCount === 1;

    if (word === secretWord) {
      playSound('transition');
      setWinner('SPY');
      addCoins(100); // Big reward for spy guessing correctly
      updateStats(true, false, false, spyPlayer?.role.id || 'spy', isPerfect, isFast); // Spy won
    } else {
      playSound('success');
      setWinner('CIVILIAN');
      addCoins(75); // Increased reward for civilians
      updateStats(true, false, false, 'civilian', isPerfect, isFast); // Civilians won
    }
    setPhase('RESULTS');
  };

  const nextTurn = () => {
    playSound('transition');
    const prevQuestioner = questionerIndex;
    const newQuestioner = answererIndex;
    
    setQuestionerIndex(newQuestioner);
    
    let nextAns = Math.floor(Math.random() * gamePlayers.length);
    // Ensure the new answerer is not the new questioner 
    // AND not the person who just asked (if there are enough players)
    while (
      nextAns === newQuestioner || 
      (gamePlayers.length > 2 && nextAns === prevQuestioner)
    ) {
      nextAns = Math.floor(Math.random() * gamePlayers.length);
    }
    setAnswererIndex(nextAns);
  };

  const skipTurn = () => {
    playSound('click');
    let nextQuest = Math.floor(Math.random() * gamePlayers.length);
    while (nextQuest === questionerIndex) {
      nextQuest = Math.floor(Math.random() * gamePlayers.length);
    }
    setQuestionerIndex(nextQuest);
    
    let nextAns = Math.floor(Math.random() * gamePlayers.length);
    while (nextAns === nextQuest) {
      nextAns = Math.floor(Math.random() * gamePlayers.length);
    }
    setAnswererIndex(nextAns);
  };

  const handleUseAbility = (playerId: string) => {
    const player = gamePlayers.find(p => p.id === playerId);
    if (!player) return;

    playSound('success');
    setGamePlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, hasUsedAbility: true };
      }
      return p;
    }));
    updateStats(false, true, false, player.role.id);
    setUserData(loadUserData());
    setShowAbilityModal(false);
    
    // Specific messages based on role
    let message = `استخدم ${player.name} قدرة ${player.role.name}!`;
    if (player.role.id === 'detective') message = `المحقق ${player.name} كشف هوية مشبوهة! 🔍`;
    if (player.role.id === 'medic') message = `الطبيب ${player.name} منح الحماية للاعب! 🛡️`;
    if (player.role.id === 'spy') message = `الجاسوس ${player.name} قام بالتمويه بنجاح! 🎭`;
    if (player.role.id === 'sniper') message = `القناص ${player.name} أطلق رصاصة دقيقة! 🎯`;
    if (player.role.id === 'hacker') message = `المخترق ${player.name} عطل قدرات الخصوم! 💻`;
    if (player.role.id === 'bodyguard') message = `الحارس ${player.name} فعل درع الحماية! 🛡️`;
    if (player.role.id === 'oracle') message = `العرافة ${player.name} رأت حرفاً من الكلمة! 🔮`;
    if (player.role.id === 'mayor') message = `العمدة ${player.name} فرض سلطته في التصويت! ⚖️`;
    if (player.role.id === 'blackmailer') message = `المبتز ${player.name} أسكت أحد اللاعبين! 🤐`;
    
    setShowCelebration(message);
    setTimeout(() => setShowCelebration(null), 5000);
  };

  const handleLongPressStart = (cat: Category) => {
    longPressTimer.current = setTimeout(() => {
      setPreviewCategory(cat);
      playSound('reveal');
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPreviewCategory(null);
  };

  const handleSpinWheel = () => {
    if (userData.coins < 100 || isSpinning) return;
    
    playSound('click');
    setIsSpinning(true);
    
    setTimeout(() => {
      const result = spinWheel(100);
      if (result.success) {
        setWheelResult({ prize: result.prize!, amount: result.amount });
        setUserData(loadUserData());
        updateStats(false, false, true); // Track spin for missions
        
        let prizeLabel = '';
        if (result.prize === 'coins') {
          prizeLabel = `${result.amount} عملة 🪙`;
          playSound('success');
          setShowCoinBurst(true);
          setTimeout(() => setShowCoinBurst(false), 2000);
        } else if (result.prize === 'role') {
          const role = ROLES.find(r => r.id === result.roleId);
          prizeLabel = `دور ${role?.name || 'جديد'} 🎭`;
          playSound('reveal');
          trackAction('UNLOCK_ROLE');
        } else if (result.prize === 'category') {
          const cat = CATEGORIES.find(c => c.id === result.categoryId);
          prizeLabel = `قائمة ${cat?.name || 'جديدة'} 📂`;
          playSound('reveal');
          trackAction('UNLOCK_CAT');
        }
        
        setShowCelebration(`مبروك! فزت بـ ${prizeLabel}`);
        setTimeout(() => setShowCelebration(null), 4000);
      }
      setIsSpinning(false);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderers
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
        <h1 className="text-6xl font-black text-white tracking-tighter mb-2 relative">مختبئون</h1>
        <h1 className="text-6xl font-black text-emerald-500 tracking-tighter relative">بيننا</h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        <button 
          onClick={() => {
            playSound('click');
            setPhase('SETUP_PLAYERS');
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Play size={24} fill="currentColor" />
          ابدأ اللعبة
        </button>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              playSound('click');
              setPhase('STORE');
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <ShoppingBag size={20} />
            <span className="text-xs">المتجر</span>
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setPhase('MISSIONS');
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Target size={20} />
            <span className="text-xs">المهمات</span>
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setPhase('INSTRUCTIONS');
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Info size={20} />
            <span className="text-xs">التعليمات</span>
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setPhase('ABILITIES');
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Zap size={20} />
            <span className="text-xs">القدرات</span>
          </button>
          <button 
            onClick={() => {
              playSound('click');
              setPhase('LEADERBOARD');
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 col-span-2"
          >
            <Trophy size={20} className="text-yellow-500" />
            <span className="text-xs">التصنيف العالمي</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
        <Coins size={16} className="text-yellow-500" />
        <span className="text-sm font-mono text-white">{userData.coins}</span>
      </div>

      <div className="absolute bottom-8 text-zinc-500 text-xs font-mono uppercase tracking-widest">
        v1.0.0 • Developed by AI
      </div>
    </div>
  );

  const renderPlayerSetup = () => {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setPhase('MENU')} className="p-2 bg-zinc-800 rounded-xl text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">اللاعبون ({players.length}/20)</h2>
          <div className="w-10" />
        </div>

        <div className="flex gap-2 mb-6">
          <button 
            className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl border-2 border-transparent hover:border-emerald-500 transition-all"
            onClick={() => {
              playSound('click');
              const nextIdx = (AVATARS.indexOf(selectedAvatar) + 1) % AVATARS.length;
              setSelectedAvatar(AVATARS[nextIdx]);
              trackAction('CHANGE_AVATAR');
            }}
          >
            {selectedAvatar}
          </button>
          <input 
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم اللاعب..."
            className="flex-1 bg-zinc-800 rounded-2xl px-4 text-white outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newName.trim()) {
                handleAddPlayer(newName.trim(), selectedAvatar);
                setNewName('');
              }
            }}
          />
          <button 
            onClick={() => {
              if (newName.trim()) {
                handleAddPlayer(newName.trim(), selectedAvatar);
                setNewName('');
              }
            }}
            className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-black"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {players.map(player => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={player.id}
              className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{player.avatar}</span>
                <span className="text-white font-bold">{player.name}</span>
              </div>
              <button onClick={() => { playSound('click'); handleRemovePlayer(player.id); }} className="text-zinc-500 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
          {players.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500 space-y-2">
              <Users size={48} opacity={0.2} />
              <p>أضف 4 لاعبين على الأقل للبدء</p>
            </div>
          )}
        </div>

        <button 
          disabled={players.length < 4}
          onClick={() => {
            playSound('click');
            setPhase('SETUP_GAME');
          }}
          className="mt-6 w-full bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold py-4 rounded-2xl transition-all active:scale-95"
        >
          التالي
        </button>
      </div>
    );
  };

  const renderGameSetup = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => { playSound('click'); setPhase('SETUP_PLAYERS'); }} className="p-2 bg-zinc-800 rounded-xl text-white">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">إعدادات اللعبة</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        <section>
          <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4">التصنيفات (اختر 1-2)</h3>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategories.includes(cat.id);
              const isLocked = cat.isPremium && !userData.unlockedCategories.includes(cat.id);
              
              return (
                <button
                  key={cat.id}
                  onMouseDown={() => handleLongPressStart(cat)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(cat)}
                  onTouchEnd={handleLongPressEnd}
                  onClick={() => {
                    playSound('click');
                    if (isLocked) return;
                    if (isSelected) {
                      setSelectedCategories(prev => prev.filter(id => id !== cat.id));
                    } else {
                      if (selectedCategories.length < 2) {
                        setSelectedCategories(prev => [...prev, cat.id]);
                      }
                    }
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-right flex items-center justify-between ${
                    isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-white'
                  } ${isLocked ? 'opacity-50 grayscale' : ''}`}
                >
                  <span className="font-bold">{cat.name}</span>
                  {isLocked && <Lock size={14} className="text-zinc-500" />}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider">عدد الجواسيس</h3>
            <button 
              onClick={() => {
                playSound('click');
                setAutoSpyCount(!autoSpyCount);
              }}
              className={`text-xs px-3 py-1 rounded-full border ${autoSpyCount ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700 text-zinc-500'}`}
            >
              تلقائي
            </button>
          </div>
          {!autoSpyCount && (
            <div className="flex items-center justify-center gap-6 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <button onClick={() => { playSound('click'); setSpyCount(Math.max(1, spyCount - 1)); }} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white">-</button>
              <span className="text-2xl font-bold text-white">{spyCount}</span>
              <button onClick={() => { playSound('click'); setSpyCount(Math.min(players.length / 2, spyCount + 1)); }} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white">+</button>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4">وقت الجولة</h3>
          <div className="grid grid-cols-4 gap-2">
            {[180, 300, 420, 600].map(time => (
              <button
                key={time}
                onClick={() => {
                  playSound('click');
                  setTimerDuration(time);
                }}
                className={`py-3 rounded-xl border-2 transition-all font-mono ${
                  timerDuration === time ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-zinc-900 border-zinc-800 text-white'
                }`}
              >
                {time / 60}m
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button 
          onClick={() => {
            playSound('click');
            setIsFullRandomMode(true);
            startGame();
          }}
          className="w-full bg-zinc-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-zinc-700"
        >
          <Zap size={20} className="text-yellow-500" fill="currentColor" />
          نمط عشوائي كامل
        </button>
        <button 
          onClick={() => {
            playSound('click');
            setIsFullRandomMode(false);
            startGame();
          }}
          className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl"
        >
          ابدأ اللعب
        </button>
      </div>
    </div>
  );

  const renderRoleSelection = () => {
    return (
      <div className="flex flex-col h-full p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { playSound('click'); setPhase('SETUP_GAME'); }} className="p-2 bg-zinc-800 rounded-xl text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-white">اختر الشخصيات</h2>
          <div className="w-10" />
        </div>

        <p className="text-zinc-500 text-xs text-center mb-4">اختر الشخصيات التي ستوزع عشوائياً على اللاعبين</p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {ROLES.map((role) => {
            const isUnlocked = userData.unlockedRoles.includes(role.id) || !role.isPremium;
            const isSelected = selectedRoleIds.includes(role.id);
            
            return (
              <button
                key={role.id}
                disabled={!isUnlocked && role.isPremium}
                onClick={() => {
                  playSound('click');
                  if (isSelected) {
                    if (role.id === 'civilian' || role.id === 'spy') return; // Cannot deselect base roles
                    setSelectedRoleIds(prev => prev.filter(id => id !== role.id));
                  } else {
                    setSelectedRoleIds(prev => [...prev, role.id]);
                  }
                }}
                className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                    : 'bg-zinc-900 border-zinc-800 text-white'
                } ${!isUnlocked && role.isPremium ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    role.team === 'CIVILIAN' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {role.team === 'CIVILIAN' ? <Shield size={16} /> : <EyeOff size={16} />}
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-bold">{role.name}</h4>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{role.description}</p>
                  </div>
                </div>
                {role.isPremium && !userData.unlockedRoles.includes(role.id) ? (
                  <Lock size={14} className="text-zinc-500" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-700'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button 
          onClick={finalizeGameStart}
          className="mt-4 w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          تأكيد وبدء اللعب
        </button>
      </div>
    );
  };

  const renderRoleReveal = () => {
    const currentPlayer = gamePlayers[currentRevealIndex];
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="mb-12">
          <span className="text-8xl mb-4 block">{currentPlayer.avatar}</span>
          <h2 className="text-4xl font-black text-white">{currentPlayer.name}</h2>
          <p className="text-zinc-500 mt-2">مرر الهاتف لهذا اللاعب</p>
        </div>

        <AnimatePresence mode="wait">
          {!isRoleVisible ? (
            <motion.button
              key="hide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => {
                playSound('reveal');
                setIsRoleVisible(true);
              }}
              className="w-full max-w-xs bg-zinc-800 text-white py-12 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-700"
            >
              <EyeOff size={48} className="text-zinc-600" />
              <span className="font-bold text-xl">اضغط لرؤية دورك</span>
            </motion.button>
          ) : (
            <motion.div
              key="show"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-xs p-8 rounded-3xl border-2 flex flex-col items-center justify-center gap-6 ${
                currentPlayer.isSpy ? 'bg-red-500/10 border-red-500' : 'bg-emerald-500/10 border-emerald-500'
              }`}
            >
              <div className={`p-4 rounded-2xl ${currentPlayer.isSpy ? 'bg-red-500 text-black' : 'bg-emerald-500 text-black'}`}>
                {currentPlayer.isSpy ? <Search size={32} /> : <Shield size={32} />}
              </div>
              <div>
                <h3 className={`text-2xl font-black mb-2 ${currentPlayer.isSpy ? 'text-red-500' : 'text-emerald-500'}`}>
                  {currentPlayer.role.name}
                </h3>
                <p className="text-white text-sm leading-relaxed">
                  {currentPlayer.role.description}
                </p>
              </div>
              
              {!currentPlayer.isSpy && (
                <div className="bg-white/10 w-full p-4 rounded-2xl">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">الكلمة السرية</p>
                  <p className="text-2xl font-black text-white">{secretWord}</p>
                </div>
              )}

              {currentPlayer.isSpy && (
                <div className="bg-white/10 w-full p-4 rounded-2xl">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">مهمتك</p>
                  <p className="text-lg font-bold text-white">اكتشف الكلمة دون أن تُكشف!</p>
                </div>
              )}

              <button 
                onClick={nextReveal}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl mt-4"
              >
                فهمت، التالي
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-12 flex gap-2">
          {gamePlayers.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${
                i === currentRevealIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-800'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  };

  const renderPlaying = () => {
    const questioner = gamePlayers[questionerIndex];
    const answerer = gamePlayers[answererIndex];

    return (
      <div className="flex flex-col h-full p-4 sm:p-6 relative">
        <AnimatePresence>
          {showAbilityModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-3xl w-full max-w-sm text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className={`p-4 rounded-3xl ${questioner.role.team === 'CIVILIAN' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                    <Zap size={48} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">قدرة {questioner.name}</h3>
                  <p className="text-zinc-400 text-sm">استخدم قدرتك بحكمة!</p>
                </div>

                <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-white">{questioner.role.name}</span>
                  </div>
                  <div className="h-px bg-zinc-700/50 w-full" />
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-500 font-black uppercase tracking-widest">القدرة</p>
                    <p className="text-lg font-bold text-white leading-tight">
                      {questioner.role.ability || 'لا توجد قدرة خاصة لهذا الدور'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {questioner.role.ability && !questioner.hasUsedAbility && (
                    <button 
                      onClick={() => handleUseAbility(questioner.id)}
                      className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Zap size={20} fill="currentColor" />
                      استخدام القدرة الآن
                    </button>
                  )}
                  {questioner.hasUsedAbility && (
                    <div className="w-full bg-zinc-800 text-zinc-500 font-bold py-4 rounded-2xl border border-zinc-700 flex items-center justify-center gap-2">
                      <Lock size={18} />
                      تم استخدام القدرة
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      playSound('click');
                      setShowAbilityModal(false);
                    }}
                    className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl shadow-white/5"
                  >
                    العودة للعبة
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6 sm:mb-12">
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
            <Timer size={18} className={gameTimer < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
            <span className={`text-xl font-mono font-bold ${gameTimer < 30 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(gameTimer)}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                playSound('click');
                setShowAbilityModal(true);
              }}
              className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20"
            >
              <Zap size={18} />
            </button>
            <button 
              onClick={() => {
                playSound('click');
                setIsTimerRunning(false);
                setPhase('DISCUSSION');
              }}
              className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl font-bold border border-red-500/20 text-sm"
            >
              إنهاء
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-6 sm:space-y-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-2 sm:space-y-4"
          >
            <div className="relative inline-block">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-6 bg-emerald-500/20 blur-xl rounded-full" 
              />
              <span className="text-6xl sm:text-8xl block relative">{questioner.avatar}</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-white">{questioner.name}</h3>
            <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] sm:text-sm">يسأل الآن</p>
          </motion.div>

          <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-emerald-500 to-transparent" />

          <motion.div 
            key={answerer.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-center space-y-2 sm:space-y-4 opacity-80"
          >
            <span className="text-5xl sm:text-6xl block">{answerer.avatar}</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{answerer.name}</h3>
            <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-widest">يجيب على السؤال</p>
          </motion.div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center">
            <div className="flex items-center justify-between mb-1">
              <p className="text-zinc-500 text-[8px] uppercase tracking-widest">تذكير بالكلمة</p>
              <Eye size={10} className="text-emerald-500" />
            </div>
            <button 
              onMouseDown={() => { playSound('reveal'); setIsRoleVisible(true); }}
              onMouseUp={() => setIsRoleVisible(false)}
              onTouchStart={() => { playSound('reveal'); setIsRoleVisible(true); }}
              onTouchEnd={() => setIsRoleVisible(false)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-xl transition-all active:scale-95 text-sm"
            >
              {isRoleVisible ? secretWord : 'اضغط باستمرار للرؤية'}
            </button>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={skipTurn}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-zinc-700 text-sm"
            >
              <RefreshCw size={16} />
              تغيير الأدوار
            </button>
            <button 
              onClick={nextTurn}
              className="flex-[2] bg-emerald-500 text-black font-bold py-3.5 rounded-2xl text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              السؤال التالي
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscussion = () => {
    const toggleSus = (id: string) => {
      playSound('click');
      setSusPlayerIds(prev => 
        prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
      );
    };

    return (
      <div className="flex flex-col h-full p-6 text-center">
        <div className="mb-8">
          <div className="inline-block p-4 bg-emerald-500/20 text-emerald-500 rounded-3xl mb-4">
            <MessageSquare size={48} />
          </div>
          <h2 className="text-4xl font-black text-white mb-2">وقت النقاش!</h2>
          <p className="text-zinc-500">تناقشوا وحاولوا كشف الجاسوس</p>
        </div>

        {/* Discussion Timer and Skip */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-3 bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800">
            <Timer size={24} className={discussionTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
            <span className={`text-3xl font-mono font-black ${discussionTimer <= 10 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(discussionTimer)}
            </span>
          </div>
          <button
            onClick={() => {
              playSound('click');
              setDiscussionTimer(0);
            }}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-white/10"
          >
            تخطي النقاش <ArrowLeft size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {gamePlayers.filter(p => !p.isEliminated).map(p => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSus(p.id)}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                  susPlayerIds.includes(p.id) 
                    ? 'bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10' 
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                {susPlayerIds.includes(p.id) && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                    <AlertCircle size={12} />
                  </div>
                )}
                <span className="text-4xl">{p.avatar}</span>
                <span className="text-sm font-black text-white truncate w-full">{p.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  susPlayerIds.includes(p.id) ? 'text-red-500' : 'text-zinc-500'
                }`}>
                  {susPlayerIds.includes(p.id) ? 'مشتبه به 🤨' : 'لاعب'}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => {
              playSound('click');
              trackAction('CHAT');
              setShowCelebration('تم تسجيل رسالة للنقاش! 💬');
              setTimeout(() => setShowCelebration(null), 2000);
            }}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl w-full flex items-center justify-center gap-3 text-white font-bold hover:border-emerald-500 transition-all active:scale-95"
          >
            <Send size={20} className="text-emerald-500" />
            إرسال رسالة (للمهمة)
          </button>

          <button 
            onClick={() => {
              playSound('click');
              setPhase('VOTING');
            }}
            className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20"
          >
            بدء التصويت
          </button>
        </div>
      </div>
    );
  };

  const renderVoting = () => (
    <div className="flex flex-col h-full p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-2">وقت التصويت!</h2>
        <p className="text-zinc-500">من تعتقد أنه الجاسوس؟</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {gamePlayers.map(player => (
          <button
            key={player.id}
            onClick={() => {
              playSound('click');
              handleVote(player.id);
            }}
            className="w-full flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-red-500 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{player.avatar}</span>
              <span className="text-white font-bold">{player.name}</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-red-500 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderFinalChance = () => (
    <div className="flex flex-col h-full p-6 text-center">
      <div className="mb-12">
        <div className="inline-block p-4 bg-red-500 text-black rounded-2xl mb-4">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-4xl font-black text-white mb-2">الفرصة الأخيرة!</h2>
        <p className="text-zinc-500">تم كشف الجواسيس، لكن يمكنهم الفوز إذا خمنوا الكلمة</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {finalChanceWords.map(word => (
          <button
            key={word}
            onClick={() => {
              playSound('click');
              handleFinalGuess(word);
            }}
            className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 text-white font-black text-xl hover:border-emerald-500 transition-all"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    const isWin = winner === 'CIVILIAN';
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 mx-auto ${
            isWin ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-red-500 shadow-lg shadow-red-500/40'
          }`}>
            <Trophy size={64} className="text-black" />
          </div>
          <h2 className={`text-5xl font-black mb-4 ${isWin ? 'text-emerald-500' : 'text-red-500'}`}>
            {isWin ? 'فوز المواطنين!' : 'فوز الجواسيس!'}
          </h2>
          <p className="text-zinc-400 text-lg">الكلمة السرية كانت: <span className="text-white font-bold">{secretWord}</span></p>
        </motion.div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 w-full max-w-xs mb-8">
          <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">الجوائز</h3>
          <div className="flex items-center justify-center gap-3">
            <Coins size={32} className="text-yellow-500" />
            <span className="text-4xl font-black text-white">+{isWin ? 50 : 20}</span>
          </div>
        </div>

        <button 
          onClick={() => { playSound('click'); setPhase('MENU'); }}
          className="w-full max-w-xs bg-white text-black font-bold py-5 rounded-3xl text-xl active:scale-95 transition-all"
        >
          العودة للقائمة
        </button>
      </div>
    );
  };

  const renderStore = () => {
  const handleUnlockRole = (roleId: string, cost: number) => {
    playSound('click');
    if (unlockRole(roleId, cost)) {
      playSound('success');
      setUserData(loadUserData());
      trackAction('UNLOCK_ROLE');
      setSuccessMessage({ 
        title: 'تم الشراء بنجاح!', 
        subtitle: `لقد قمت بفتح دور ${ROLES.find(r => r.id === roleId)?.name} بنجاح.` 
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleUnlockCategory = (catId: string, cost: number) => {
    playSound('click');
    if (unlockCategory(catId, cost)) {
      playSound('success');
      setUserData(loadUserData());
      trackAction('UNLOCK_CAT');
      setSuccessMessage({ 
        title: 'تم الشراء بنجاح!', 
        subtitle: `لقد قمت بفتح قائمة ${CATEGORIES.find(c => c.id === catId)?.name} بنجاح.` 
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

    return (
      <div className="flex flex-col h-full p-6 relative">
        {/* Success Modal Overlay */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-zinc-900 border-2 border-emerald-500 p-8 rounded-[40px] w-full max-w-xs text-center space-y-6 shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles size={48} className="text-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-1">نجاح!</h4>
                  <p className="text-2xl font-black text-white">{successMessage.title}</p>
                  <p className="text-zinc-500 text-sm mt-2 font-medium">{successMessage.subtitle}</p>
                </div>
                <button 
                  onClick={() => { playSound('click'); setSuccessMessage(null); }}
                  className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  متابعة
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { playSound('click'); setPhase('MENU'); }} className="p-2 bg-zinc-800 rounded-xl text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">المتجر</h2>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-sm font-mono text-white">{userData.coins}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button 
            onClick={() => { playSound('click'); setStoreTab('ROLES'); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              storeTab === 'ROLES' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500'
            }`}
          >
            <Shield size={14} />
            الأدوار
          </button>
          <button 
            onClick={() => { playSound('click'); setStoreTab('CATEGORIES'); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              storeTab === 'CATEGORIES' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500'
            }`}
          >
            <ShoppingBag size={14} />
            القوائم
          </button>
          <button 
            onClick={() => { playSound('click'); setStoreTab('WHEEL'); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              storeTab === 'WHEEL' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-zinc-500'
            }`}
          >
            <Gift size={14} />
            عجلة الحظ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {storeTab === 'ROLES' && (
            <div className="space-y-4">
              {ROLES.filter(r => r.isPremium).map(role => {
                const isUnlocked = userData.unlockedRoles.includes(role.id);
                return (
                  <motion.div 
                    layout
                    key={role.id} 
                    className={`p-5 rounded-3xl border-2 transition-all ${
                      isUnlocked 
                        ? 'bg-zinc-900/50 border-zinc-800/50 opacity-60' 
                        : 'bg-zinc-900 border-yellow-500/30 shadow-lg shadow-yellow-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl">
                          <Zap size={20} />
                        </div>
                        <h3 className="text-white font-black text-lg">{role.name}</h3>
                      </div>
                      {!isUnlocked && (
                        <div className="bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          مميز (Premium)
                        </div>
                      )}
                    </div>
                    <p className="text-zinc-500 text-sm mb-6 text-right">{role.description}</p>
                    <button
                      disabled={isUnlocked || userData.coins < (role.cost || 0)}
                      onClick={() => handleUnlockRole(role.id, role.cost || 0)}
                      className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                        isUnlocked 
                          ? 'bg-zinc-800 text-zinc-500' 
                          : userData.coins >= (role.cost || 0)
                            ? 'bg-yellow-500 text-black active:scale-95 shadow-lg shadow-yellow-500/20'
                            : 'bg-zinc-800 text-zinc-600'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Shield size={18} />
                          تم الفتح
                        </>
                      ) : (
                        <>
                          <Coins size={18} />
                          {role.cost} 🪙
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {storeTab === 'CATEGORIES' && (
            <div className="grid grid-cols-1 gap-4">
              {CATEGORIES.filter(c => c.isPremium).map(cat => {
                const isUnlocked = userData.unlockedCategories.includes(cat.id);
                return (
                  <motion.div 
                    layout
                    key={cat.id}
                    onMouseDown={() => handleLongPressStart(cat)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(cat)}
                    onTouchEnd={handleLongPressEnd}
                    className={`p-5 rounded-3xl border-2 transition-all ${
                      isUnlocked 
                        ? 'bg-zinc-900/50 border-zinc-800/50 opacity-60' 
                        : 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                          <ShoppingBag size={20} />
                        </div>
                        <h3 className="text-white font-black text-lg">{cat.name}</h3>
                      </div>
                      {!isUnlocked && (
                        <div className="bg-emerald-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          قائمة جديدة
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end mb-6">
                      {cat.words.slice(0, 5).map(w => (
                        <span key={w} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{w}</span>
                      ))}
                      <span className="text-[10px] text-zinc-600">...</span>
                    </div>
                    <button
                      disabled={isUnlocked || userData.coins < (cat.cost || 0)}
                      onClick={() => handleUnlockCategory(cat.id, cat.cost || 0)}
                      className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                        isUnlocked 
                          ? 'bg-zinc-800 text-zinc-500' 
                          : userData.coins >= (cat.cost || 0)
                            ? 'bg-emerald-500 text-black active:scale-95 shadow-lg shadow-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-600'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Shield size={18} />
                          تم الفتح
                        </>
                      ) : (
                        <>
                          <Coins size={18} />
                          {cat.cost} 🪙
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {storeTab === 'WHEEL' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              <div className="relative w-56 h-56">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-purple-500/10 blur-[80px] rounded-full" />
                
                {/* Wheel Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  <Target size={32} fill="currentColor" />
                </div>
                
                {/* The Wheel */}
                <motion.div 
                  animate={{ rotate: isSpinning ? 3600 + (Math.random() * 360) : 0 }}
                  transition={{ duration: 3, ease: [0.45, 0.05, 0.55, 0.95] }}
                  className="w-full h-full rounded-full border-[8px] border-zinc-800 bg-zinc-900 relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                >
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={`divider-${i}`}
                      className={`absolute top-0 left-1/2 w-px h-1/2 origin-bottom ${i % 2 === 0 ? 'bg-zinc-800/50' : 'bg-zinc-700/30'}`}
                      style={{ transform: `translateX(-50%) rotate(${i * 45}deg)` }}
                    />
                  ))}
                  
                  {/* Prize Sections Backgrounds */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={`bg-${i}`}
                      className={`absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left ${
                        i % 3 === 0 ? 'bg-yellow-500/5' : i % 3 === 1 ? 'bg-emerald-500/5' : 'bg-blue-500/5'
                      }`}
                      style={{ 
                        transform: `rotate(${i * 45}deg) skewY(-45deg)`,
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                      }}
                    />
                  ))}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full border-2 border-zinc-700 z-10 flex items-center justify-center shadow-inner">
                      <Sparkles size={18} className="text-yellow-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Prize Icons */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={`icon-${i}`}
                      className="absolute top-6 left-1/2 -translate-x-1/2 origin-[center_85px] text-sm drop-shadow-lg"
                      style={{ transform: `translateX(-50%) rotate(${i * 45 + 22.5}deg)` }}
                    >
                      {i % 3 === 0 ? '🪙' : i % 3 === 1 ? '🎭' : '📂'}
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-block px-3 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">فرصة الفوز بـ 500 🪙</span>
                </div>
                <h3 className="text-xl font-black text-white">عجلة الحظ الملكية</h3>
                <p className="text-zinc-500 text-xs max-w-[200px] mx-auto leading-relaxed">
                  جرب حظك الآن! يمكنك الفوز بعملات ذهبية، أدوار أسطورية، أو قوائم كلمات حصرية.
                </p>
                
                <button
                  disabled={isSpinning || userData.coins < 100}
                  onClick={() => { playSound('click'); handleSpinWheel(); }}
                  className={`relative group px-10 py-4 rounded-[20px] font-black text-lg transition-all flex items-center gap-3 mx-auto overflow-hidden ${
                    userData.coins >= 100 && !isSpinning
                      ? 'bg-purple-500 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] active:scale-95'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSpinning ? (
                    <RefreshCw size={28} className="animate-spin" />
                  ) : (
                    <>
                      <Dices size={28} />
                      دوران (100 🪙)
                    </>
                  )}
                </button>
              </div>

              {/* Wheel Result Modal */}
              <AnimatePresence>
                {wheelResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                  >
                    <div className="bg-zinc-900 border-2 border-purple-500 p-8 rounded-[40px] w-full max-w-xs text-center space-y-6 shadow-2xl shadow-purple-500/20">
                      <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                        {wheelResult.prize === 'coins' ? (
                          <Coins size={48} className="text-yellow-500" />
                        ) : wheelResult.prize === 'role' ? (
                          <Shield size={48} className="text-emerald-500" />
                        ) : (
                          <ShoppingBag size={48} className="text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">لقد ربحت!</h4>
                        <p className="text-3xl font-black text-white">
                          {wheelResult.prize === 'coins' ? `${wheelResult.amount} 🪙` : 
                           wheelResult.prize === 'role' ? 'دور مميز جديد!' : 'قائمة كلمات جديدة!'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setWheelResult(null)}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl"
                      >
                        رائع!
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => {
    const allPlayers = [
      ...MOCK_LEADERBOARD,
      { 
        id: 'user', 
        name: 'أنت (You)', 
        avatar: '👤', 
        wins: userData.stats.gamesWon, 
        coins: userData.coins 
      }
    ].sort((a, b) => b.wins - a.wins);

    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setPhase('MENU')} className="p-2 bg-zinc-800 rounded-xl text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black text-white">المتصدرون 🏆</h2>
          <div className="w-10" />
        </div>

        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden flex-1 flex flex-col">
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 grid grid-cols-12 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2 text-center">المركز</div>
            <div className="col-span-5">اللاعب</div>
            <div className="col-span-2 text-center">الفوز</div>
            <div className="col-span-3 text-right">العملات</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {allPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={`grid grid-cols-12 items-center p-4 border-b border-zinc-800/50 transition-colors ${
                  player.id === 'user' ? 'bg-emerald-500/10' : ''
                }`}
              >
                <div className="col-span-2 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <span className={`font-bold truncate ${player.id === 'user' ? 'text-emerald-500' : 'text-white'}`}>
                    {player.name}
                  </span>
                </div>
                <div className="col-span-2 text-center font-mono text-white">
                  {player.wins}
                </div>
                <div className="col-span-3 text-right font-mono text-yellow-500 flex items-center justify-end gap-1">
                  {player.coins}
                  <Coins size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
          <p className="text-emerald-500 text-sm font-medium">
            ترتيبك الحالي هو المركز <span className="font-bold">#{allPlayers.findIndex(p => p.id === 'user') + 1}</span> عالمياً!
          </p>
        </div>
      </div>
    );
  };

  const renderMissions = () => {
    const handleClaim = (id: string, reward: number) => {
      playSound('success');
      if (claimMission(id)) {
        setUserData(loadUserData());
        setShowCoinBurst(true);
        setTimeout(() => setShowCoinBurst(false), 2000);
        setShowCelebration(`+${reward} 🪙`);
        setTimeout(() => setShowCelebration(null), 2000);
      }
    };

    return (
      <div className="flex flex-col h-full p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { playSound('click'); setPhase('MENU'); }} className="p-2 bg-zinc-800 rounded-xl text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">المهمات</h2>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-sm font-mono text-white">{userData.coins}</span>
          </div>
        </div>

        {/* Mission Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button 
            onClick={() => { playSound('click'); setMissionTab('DAILY'); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
              missionTab === 'DAILY' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500'
            }`}
          >
            يومية
          </button>
          <button 
            onClick={() => { playSound('click'); setMissionTab('MONTHLY'); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
              missionTab === 'MONTHLY' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500'
            }`}
          >
            شهرية
          </button>
          <button 
            onClick={() => { playSound('click'); setMissionTab('YEARLY'); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
              missionTab === 'YEARLY' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-zinc-500'
            }`}
          >
            سنوية
          </button>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 mb-6 flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            missionTab === 'DAILY' ? 'bg-emerald-500/10 text-emerald-500' :
            missionTab === 'MONTHLY' ? 'bg-blue-500/10 text-blue-500' :
            'bg-purple-500/10 text-purple-500'
          }`}>
            <Sparkles size={24} />
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">تقدمك</p>
            <p className="text-lg font-black text-white">
              {userData.missions.filter(m => m.period === missionTab && m.isCompleted).length} من {userData.missions.filter(m => m.period === missionTab).length} مهمات منجزة
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {userData.missions.filter(m => m.period === missionTab).map((mission) => (
            <motion.div 
              layout
              key={mission.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-[32px] border-2 transition-all duration-500 relative overflow-hidden ${
                mission.isClaimed 
                  ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' 
                  : mission.isCompleted 
                    ? missionTab === 'DAILY' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' :
                      missionTab === 'MONTHLY' ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/5' :
                      'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/5'
                    : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {mission.isCompleted && !mission.isClaimed && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 text-right">
                  <h3 className={`font-black text-lg leading-tight ${mission.isClaimed ? 'text-zinc-500' : 'text-white'}`}>
                    {mission.description}
                  </h3>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <div className="bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins size={12} className="text-yellow-500" />
                      <span className="text-[10px] font-black text-yellow-500">+{mission.reward}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">مكافأة</span>
                  </div>
                </div>
                <div className={`p-3.5 rounded-2xl transition-all duration-500 ${
                  mission.isClaimed 
                    ? 'bg-zinc-800 text-zinc-600' 
                    : mission.isCompleted 
                      ? missionTab === 'DAILY' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' :
                        missionTab === 'MONTHLY' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                        'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {mission.isClaimed ? <Trophy size={24} /> : 
                   mission.period === 'DAILY' ? <Timer size={24} /> :
                   mission.period === 'MONTHLY' ? <Star size={24} /> :
                   <Trophy size={24} />}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      mission.isCompleted ? 'text-emerald-500' : 'text-zinc-600'
                    }`}>
                      {mission.isCompleted ? 'مكتملة!' : 'قيد التنفيذ'}
                    </span>
                    <span className={`text-sm font-black ${mission.isCompleted ? 'text-emerald-500' : 'text-white'}`}>
                      {mission.current} <span className="text-zinc-600 text-[10px]">/ {mission.target}</span>
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500">
                    {Math.round((mission.current / mission.target) * 100)}%
                  </div>
                </div>
                <div className="h-3 bg-zinc-800/50 rounded-full overflow-hidden p-0.5 border border-zinc-700/30">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(mission.current / mission.target) * 100}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    className={`h-full rounded-full ${
                      mission.isCompleted 
                        ? missionTab === 'DAILY' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                          missionTab === 'MONTHLY' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                          'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        : 'bg-zinc-600'
                    }`}
                  />
                </div>
              </div>

              {mission.isCompleted && !mission.isClaimed && (
                <button 
                  onClick={() => handleClaim(mission.id, mission.reward)}
                  className={`w-full mt-5 font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
                    missionTab === 'DAILY' ? 'bg-emerald-500 text-black shadow-emerald-500/20' :
                    missionTab === 'MONTHLY' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                    'bg-purple-500 text-white shadow-purple-500/20'
                  }`}
                >
                  <Gift size={20} />
                  استلام المكافأة
                </button>
              )}
              
              {mission.isClaimed && (
                <div className="w-full mt-5 bg-zinc-800/50 text-zinc-600 font-black py-4 rounded-2xl text-center text-sm border border-zinc-800/50">
                  تمت المهمة بنجاح
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderAbilities = () => {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { playSound('click'); setPhase('MENU'); }} className="p-2 bg-zinc-800 rounded-xl text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">قدرات الأدوار</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {ROLES.map((role) => {
            const isUnlocked = userData.unlockedRoles.includes(role.id);
            return (
              <motion.div 
                layout
                key={role.id}
                className={`p-5 rounded-3xl border-2 relative overflow-hidden transition-all ${
                  isUnlocked 
                    ? role.isPremium 
                      ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border-yellow-500/50 shadow-xl shadow-yellow-500/5' 
                      : 'bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20' 
                    : 'bg-zinc-900/50 border-zinc-800/50 opacity-60 grayscale'
                }`}
              >
                {role.isPremium && isUnlocked && (
                  <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[8px] font-black px-3 py-1 rounded-br-2xl uppercase tracking-widest shadow-lg">
                    مميز (Premium)
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      role.team === 'CIVILIAN' 
                        ? 'bg-emerald-500/20 text-emerald-500 shadow-inner' 
                        : 'bg-red-500/20 text-red-500 shadow-inner'
                    }`}>
                      {role.team === 'CIVILIAN' ? <Shield size={24} /> : <EyeOff size={24} />}
                    </div>
                    <div className="text-right">
                      <h3 className={`text-xl font-black ${role.isPremium ? 'text-yellow-500' : 'text-white'}`}>{role.name}</h3>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className={`text-[10px] font-black px-3 py-0.5 rounded-full ${
                          role.team === 'CIVILIAN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {role.team === 'CIVILIAN' ? 'مواطن' : 'جاسوس'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isUnlocked && (
                    <div className="bg-zinc-800 p-2 rounded-xl">
                      <Lock size={18} className="text-zinc-600" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 text-right">
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">{role.description}</p>
                  {role.ability && (
                    <div className={`p-4 rounded-2xl border-2 ${
                      role.isPremium 
                        ? 'bg-yellow-500/5 border-yellow-500/20' 
                        : 'bg-zinc-800/50 border-zinc-700/50'
                    }`}>
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className={`text-xs font-black uppercase tracking-widest ${
                          role.isPremium ? 'text-yellow-500' : 'text-emerald-500'
                        }`}>القدرة الخاصة</span>
                        <Zap size={14} className={role.isPremium ? 'text-yellow-500' : 'text-emerald-500'} />
                      </div>
                      <p className="text-sm text-white font-bold leading-tight">{role.ability}</p>
                    </div>
                  )}
                </div>
                
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-zinc-900/90 px-4 py-2 rounded-full border border-zinc-800 flex items-center gap-2">
                      <Lock size={14} className="text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-500">مغلق في المتجر</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInstructions = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => { playSound('click'); setPhase('MENU'); }} className="p-2 bg-zinc-800 rounded-xl text-white">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">كيف تلعب؟</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 text-right pr-2 custom-scrollbar pb-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800 space-y-4"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
            <Users size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-emerald-500 font-black text-xl">1. توزيع الأدوار</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">يتم تمرير الهاتف بين اللاعبين، كل لاعب يرى دوره والكلمة السرية (إذا لم يكن جاسوساً). الجاسوس لا يعرف الكلمة!</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800 space-y-4"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
            <Zap size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-blue-500 font-black text-xl">2. الأسئلة والقدرات</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">يبدأ لاعب بسؤال لاعب آخر عن الكلمة. استخدم قدرتك الخاصة (إذا كان لديك واحدة) لتكشف الجاسوس أو تحمي نفسك!</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800 space-y-4"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
            <Target size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-purple-500 font-black text-xl">3. التصويت النهائي</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">بعد انتهاء الوقت، يصوت الجميع على من يعتقدون أنه الجاسوس. إذا تم كشف الجاسوس، لديه فرصة أخيرة لتخمين الكلمة!</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800 space-y-4"
        >
          <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500">
            <Trophy size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-yellow-500 font-black text-xl">4. الفوز والجوائز</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">يفوز المواطنون إذا كشفوا الجاسوس وفشل في التخمين. يفوز الجاسوس إذا لم يُكشف أو خمن الكلمة. الفوز يمنحك عملات ذهبية!</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800 space-y-4"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
            <ClipboardCheck size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-emerald-500 font-black text-xl">5. المهمات والمتجر</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">أكمل المهمات اليومية والشهرية لجمع العملات. استخدم العملات في المتجر لفتح أدوار جديدة وقوائم كلمات حصرية!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none dir-rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-emerald-500 rounded-full"
          />
        ))}
      </div>

      <div className="h-full max-w-2xl mx-auto relative z-10">
        <AnimatePresence>
          {showCoinBurst && (
            <div className="fixed inset-0 pointer-events-none z-[200]">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: window.innerWidth / 2, 
                    y: window.innerHeight / 2,
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: [
                      window.innerWidth / 2, 
                      window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                      window.innerWidth - 60
                    ],
                    y: [
                      window.innerHeight / 2, 
                      window.innerHeight / 2 + (Math.random() - 0.5) * 400,
                      40
                    ],
                    scale: [0, 2, 0.5],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.8, 
                    ease: "circOut",
                    delay: i * 0.05 
                  }}
                  className="absolute text-3xl"
                >
                  🪙
                </motion.div>
              ))}
            </div>
          )}
          {showCelebration && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1.2, y: -50 }}
              exit={{ opacity: 0, scale: 0.5, y: -100 }}
              className="fixed inset-0 flex items-center justify-center z-[210] pointer-events-none"
            >
              <div className="bg-yellow-500 text-black font-black text-2xl sm:text-4xl px-8 py-4 rounded-full shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-center gap-3">
                <Trophy size={40} />
                {showCelebration}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {previewCategory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-zinc-900 border-2 border-emerald-500 p-6 rounded-[32px] w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-xl font-black text-emerald-500">{previewCategory.name}</h3>
                  <span className="text-xs text-zinc-500">معاينة الكلمات</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {previewCategory.words.map((word, i) => (
                    <div key={i} className="bg-zinc-800/50 p-2 rounded-xl text-center text-sm text-zinc-300">
                      {word}
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">اترك الضغط للإغلاق</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {phase === 'MENU' && renderMenu()}
            {phase === 'SETUP_PLAYERS' && renderPlayerSetup()}
            {phase === 'SETUP_GAME' && renderGameSetup()}
            {phase === 'ROLE_REVEAL' && renderRoleReveal()}
            {phase === 'ROLE_SELECTION' && renderRoleSelection()}
            {phase === 'PLAYING' && renderPlaying()}
            {phase === 'DISCUSSION' && renderDiscussion()}
            {phase === 'VOTING' && renderVoting()}
            {phase === 'FINAL_CHANCE' && renderFinalChance()}
            {phase === 'RESULTS' && renderResults()}
            {phase === 'STORE' && renderStore()}
            {phase === 'MISSIONS' && renderMissions()}
            {phase === 'ABILITIES' && renderAbilities()}
            {phase === 'LEADERBOARD' && renderLeaderboard()}
            {phase === 'INSTRUCTIONS' && renderInstructions()}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .dir-rtl {
          direction: rtl;
        }
      `}</style>
    </div>
  );
}
