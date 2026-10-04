import React, { useState, useEffect, useMemo } from 'react';

// === ATHLETE CONFIG (edit here only) ===
const ATHLETE = {
  firstName: 'Aiden',
  lastName: 'Matano',
  brand: 'MATANO',                 // nav + footer wordmark
  planStart: { y: 2026, m: 9, d: 5 },   // Mon Oct 5, 2026  (m is 0-indexed)
  raceDay:   { y: 2027, m: 3, d: 24 },  // Sat Apr 24, 2027
  raceLabel: 'IRONMAN TEXAS · APRIL 24, 2027',
  established: 'Est. October 2026',
};

export default function RoadToTexasSite() {
  const [mounted, setMounted] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [calendarWeek, setCalendarWeek] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [todayDay, setTodayDay] = useState(null);

  // === DATE MATH ===
  // Every date is a "day number" = Math.floor(UTC-ms / 86400000).
  // This avoids every timezone and DST bug.
  const dayNumFromYMD = (y, m, d) => Math.floor(Date.UTC(y, m, d) / 86400000);

  // Convert a real Date (from Date.now()) to a day number in LOCAL time
  const dayNumFromNow = () => {
    const now = new Date();
    return dayNumFromYMD(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const ymdFromDayNum = (dayNum) => {
    const ms = dayNum * 86400000;
    const d = new Date(ms);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
  };

  const formatDayNum = (dayNum) => {
    const { m, d } = ymdFromDayNum(dayNum);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[m]} ${d}`;
  };

  const formatDayNumWithYear = (dayNum) => {
    const { y, m, d } = ymdFromDayNum(dayNum);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[m]} ${d}, ${String(y).slice(-2)}`;
  };

  const PLAN_START_DAY = dayNumFromYMD(ATHLETE.planStart.y, ATHLETE.planStart.m, ATHLETE.planStart.d);
  const RACE_DAY_NUM = dayNumFromYMD(ATHLETE.raceDay.y, ATHLETE.raceDay.m, ATHLETE.raceDay.d);

  const quotes = [
    { text: "You are going to be told no many, many more times than you will be told yes.", author: "David Goggins" },
    { text: "The only way to get better is to find a way to suffer more.", author: "David Goggins" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { text: "Only those who will risk going too far can possibly find out how far one can go.", author: "T.S. Eliot" },
    { text: "Pain is inevitable. Suffering is optional.", author: "Haruki Murakami" },
    { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
    { text: "Only the disciplined ones are free in life.", author: "Eliud Kipchoge" },
    { text: "No human is limited.", author: "Eliud Kipchoge" },
    { text: "If you want to run, run a mile. If you want to experience a different life, run a marathon.", author: "Emil Zátopek" },
    { text: "When you hit the wall, the wall's gonna feel a lot better than you do.", author: "Mark Allen" },
    { text: "The best training is racing, and the best racing is when you're most ready.", author: "Mark Allen" },
    { text: "You don't have to go fast. You just have to go.", author: "Mirinda Carfrae" },
    { text: "It's supposed to be hard. If it were easy, everyone would do it.", author: "Chrissie Wellington" },
    { text: "Never limit where running can take you. Physical, emotional, spiritual — let it deliver.", author: "Chrissie Wellington" },
    { text: "Keep showing up. That's the only way.", author: "Des Linden" },
    { text: "Some pursue happiness. Others create it. Triathletes do both.", author: "Lionel Sanders" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Socrates" },
    { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
    { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
    { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
    { text: "No man is free who is not master of himself.", author: "Epictetus" },
    { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
    { text: "Let him that would move the world first move himself.", author: "Socrates" },
    { text: "Somewhere, the hurting must stop.", author: "Terry Fox" },
    { text: "I don't run to add days to my life, I run to add life to my days.", author: "Ronald Rook" },
    { text: "Whether you think you can, or think you can't — you're right.", author: "Henry Ford" },
  ];

  // Initial mount: compute today's day number, and re-check every hour
  useEffect(() => {
    setMounted(true);
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
    setTodayDay(dayNumFromNow());
    const id = setInterval(() => setTodayDay(dayNumFromNow()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const getPhase = (weeksUntilRace) => {
    if (weeksUntilRace === 0) return 'RACE WEEK';
    if (weeksUntilRace <= 2) return 'TAPER';
    if (weeksUntilRace <= 4) return 'PEAK';
    if (weeksUntilRace <= 12) return (weeksUntilRace - 4) % 4 === 0 ? 'RECOVERY' : 'BUILD';
    if (weeksUntilRace <= 24) return (weeksUntilRace - 12) % 4 === 0 ? 'RECOVERY' : 'BUILD';
    if (weeksUntilRace <= 40) return (weeksUntilRace - 24) % 4 === 0 ? 'RECOVERY' : 'BASE';
    return 'FOUNDATION';
  };

  const getPhaseDetail = (phase) => {
    const details = {
      'FOUNDATION': 'Prep · consistency',
      'BASE': 'Aerobic base building',
      'BUILD': 'Specific prep · threshold work',
      'PEAK': 'Final big weeks',
      'TAPER': 'Sharpen · reduce · rest',
      'RACE WEEK': 'Texas · April 24',
      'RECOVERY': 'Absorb · adapt · deload',
    };
    return details[phase] || '';
  };

  const generateDayWorkouts = (phase, weeksUntilRace, dayOfWeek) => {
    if (phase === 'RACE WEEK') {
      const raceWeek = [
        [{ type: 'Run', title: 'Pre-race impulse running', duration: 40, distance: '4 mi', system: 'Aerobic', detail: 'Race Week · Mon · shake-out, easy pace' }],
        [{ type: 'Swim', title: 'Pre-race impulse swim', duration: 30, distance: '1800m', system: 'Aerobic', detail: 'Short race-pace bursts + cool down' }, { type: 'Cycling', title: 'Pre-race impulse cycling', duration: 45, distance: '15 mi', system: 'Aerobic', detail: 'Spin + 3x short race-pace efforts' }],
        [{ type: 'Other', title: 'Travel to The Woodlands', duration: 0, distance: '', system: 'Rest', detail: 'Day off · travel · bike check-in' }],
        [{ type: 'Run', title: 'Race course shake-out', duration: 20, distance: '2 mi', system: 'Aerobic', detail: 'Very easy · mental prep' }, { type: 'Swim', title: 'Pre-race impulse swim', duration: 20, distance: '1000m', system: 'Aerobic', detail: 'Course familiarization' }],
        [{ type: 'Cycling', title: 'Pre-race impulse cycling', duration: 30, distance: '10 mi', system: 'Aerobic', detail: 'Last bike spin · check gears' }],
        [{ type: 'Other', title: 'Rest · bike drop-off', duration: 0, distance: '', system: 'Rest', detail: 'Hydrate · early bedtime · trust the work' }],
        [{ type: 'IRONMAN', title: 'IRONMAN TEXAS 2027', duration: 720, distance: '140.6 mi', system: 'Race', detail: 'Swim 2.4mi → Bike 112mi → Run 26.2mi' }],
      ];
      return raceWeek[dayOfWeek];
    }
    if (phase === 'TAPER') {
      const taper = [
        [{ type: 'Strength', title: 'Light strength maintenance', duration: 30, distance: '', system: 'Aerobic', detail: 'Bodyweight + mobility only · no load' }],
        [{ type: 'Run', title: 'Taper tempo', duration: 45, distance: '5 mi', system: 'Aerobic', detail: '3x 1mi at race pace · short recovery' }],
        [{ type: 'Swim', title: 'Aerobic swim with short splits', duration: 60, distance: '2000m', system: 'Aerobic', detail: '400 WU · 10x100 moderate · 400 CD' }],
        [{ type: 'Cycling', title: 'Short tempo ride', duration: 60, distance: '18 mi', system: 'Aerobic', detail: '3x 5min at race pace · 3min easy between' }],
        [{ type: 'Other', title: 'Full rest day', duration: 0, distance: '', system: 'Rest', detail: 'Mobility only · foam roll · sleep' }],
        [{ type: 'Cycling', title: 'Easy aerobic ride', duration: 60, distance: '18 mi', system: 'Aerobic', detail: 'Zone 2 · sharpening legs' }, { type: 'Run', title: 'Short brick run', duration: 15, distance: '2 mi', system: 'Aerobic', detail: 'Right off the bike · race pace' }],
        [{ type: 'Run', title: 'LSD Taper', duration: 60, distance: '7 mi', system: 'Aerobic', detail: 'Easy Zone 2 · no pace focus' }],
      ];
      return taper[dayOfWeek];
    }
    if (phase === 'PEAK') {
      const peak = [
        [{ type: 'Other', title: 'Active recovery', duration: 30, distance: '', system: 'Rest', detail: 'Walk · mobility · foam roll' }, { type: 'Strength', title: 'Morning Strength', duration: 45, distance: '', system: 'Aerobic', detail: 'Full body · endurance focus' }],
        [{ type: 'Run', title: 'TAC 3x1600 ZONE 4', duration: 75, distance: '8.5 mi', system: 'Anaerobic', detail: 'WU 2mi + 3x1600m @ 10k pace (4min rest) + CD' }, { type: 'Strength', title: 'Afternoon Strength', duration: 30, distance: '', system: 'Aerobic', detail: 'Core + single-leg stability' }],
        [{ type: 'Cycling', title: 'Cycling ANT (in watts)', duration: 180, distance: '55 mi', system: 'Aerobic', detail: 'Long aerobic build · power @ 55-34-21 structure' }, { type: 'Swim', title: 'Anaerobic swim long pause', duration: 60, distance: '2000m', system: 'Anaerobic', detail: '13x100, 2x200 · 2.5min pause' }],
        [{ type: 'Run', title: '20km at half marathon pace', duration: 95, distance: '12.4 mi', system: 'Anaerobic', detail: '10min WU + 10km @ HM pace + 5km easy + CD' }, { type: 'Swim', title: 'Swim Training of Aerobic Capacity', duration: 60, distance: '2400m', system: 'Aerobic', detail: 'TAC 2x400 (5min rest)' }],
        [{ type: 'Strength', title: 'Strength maintenance', duration: 30, distance: '', system: 'Aerobic', detail: '15 min strengthening program' }, { type: 'Cycling', title: 'Easy spin', duration: 60, distance: '15 mi', system: 'Aerobic', detail: 'Recovery zone · keep legs moving' }],
        [{ type: 'Cycling', title: '90km Cycling before IRONMAN', duration: 180, distance: '56 mi', system: 'Aerobic', detail: 'Long ride at race pace · race nutrition practice' }, { type: 'Run', title: 'Short brick run', duration: 35, distance: '4 mi', system: 'Anaerobic', detail: '35 minutes run after BIKE · race pace' }],
        [{ type: 'Run', title: 'LSD Long Run', duration: 150, distance: '17 mi', system: 'Aerobic', detail: 'Long steady distance · practice race nutrition' }, { type: 'Swim', title: 'OWS as recovery', duration: 45, distance: '2100m', system: 'Aerobic', detail: 'Open water easy · 3x1000m continuous' }],
      ];
      return peak[dayOfWeek];
    }
    if (phase === 'RECOVERY') {
      const recovery = [
        [{ type: 'Other', title: 'Full recovery day', duration: 0, distance: '', system: 'Rest', detail: 'Mobility + foam roll only' }],
        [{ type: 'Run', title: 'Recovery Running', duration: 30, distance: '3 mi', system: 'Aerobic', detail: 'Zone 1 · very easy' }, { type: 'Strength', title: 'Strength maintenance', duration: 15, distance: '', system: 'Aerobic', detail: '15 min strengthening program' }],
        [{ type: 'Swim', title: 'Recovery swimming', duration: 30, distance: '1500m', system: 'Aerobic', detail: 'Easy technique-focused swim' }],
        [{ type: 'Cycling', title: '60 min aerobic cycling as recovery', duration: 60, distance: '15 mi', system: 'Aerobic', detail: 'Zone 1-2 · flat or rolling terrain' }],
        [{ type: 'Strength', title: 'Morning Strength', duration: 45, distance: '', system: 'Aerobic', detail: 'Full body · strength maintenance' }],
        [{ type: 'Cycling', title: 'Fartlek cycling', duration: 75, distance: '22 mi', system: 'Anaerobic', detail: '6x2min @ ZONE 3 with 3min easy' }],
        [{ type: 'Run', title: 'LSD run', duration: 80, distance: '9 mi', system: 'Aerobic', detail: 'Easy long run · Zone 2 only' }, { type: 'Swim', title: 'Recovery swim', duration: 30, distance: '1500m', system: 'Aerobic', detail: 'Technique · easy' }],
      ];
      return recovery[dayOfWeek];
    }
    if (phase === 'BUILD') {
      const build = [
        [{ type: 'Strength', title: 'Morning Strength', duration: 50, distance: '', system: 'Aerobic', detail: 'Full body · progressive load' }, { type: 'Swim', title: 'Aerobic Pyramid 1 km', duration: 60, distance: '1500m', system: 'Aerobic', detail: 'Pyramid set: 50-100-200-300-200-100-50' }],
        [{ type: 'Run', title: 'Anaerobic tempo running 15+10', duration: 55, distance: '6 mi', system: 'Anaerobic', detail: 'WU + 15min @ threshold + 10min @ threshold + CD' }, { type: 'Strength', title: 'Strengthening program', duration: 15, distance: '', system: 'Aerobic', detail: 'Core focus' }],
        [{ type: 'Cycling', title: 'Cycling ANT (in watts)', duration: 120, distance: '35 mi', system: 'Aerobic', detail: 'Power zones 55-34-21 · aerobic focus' }, { type: 'Swim', title: 'Aerobic swim', duration: 60, distance: '2000m', system: 'Aerobic', detail: '20x50 + 10x100 · moderate pace' }],
        [{ type: 'Run', title: 'TAC 2x1 mile ZONE4', duration: 75, distance: '8 mi', system: 'Anaerobic', detail: 'WU + 2x1mi @ 5k pace (3min rest) + CD' }, { type: 'Strength', title: 'Afternoon Strength', duration: 30, distance: '', system: 'Aerobic', detail: 'Upper body + core' }],
        [{ type: 'Strength', title: 'Morning Strength', duration: 45, distance: '', system: 'Aerobic', detail: 'Full body · maintenance' }, { type: 'Cycling', title: 'Easy aerobic cycling', duration: 60, distance: '17 mi', system: 'Aerobic', detail: 'Zone 2 · active recovery' }],
        [{ type: 'Cycling', title: 'Long aerobic cycling', duration: 150, distance: '45 mi', system: 'Aerobic', detail: 'Long Zone 2 ride · race nutrition practice' }, { type: 'Run', title: '35 minutes run after BIKE', duration: 35, distance: '4 mi', system: 'Anaerobic', detail: 'Brick run · Zone 3 · race pace' }],
        [{ type: 'Run', title: 'LSD run from low to high ZONE 2', duration: 110, distance: '12.5 mi', system: 'Aerobic', detail: 'Long progressive run · finish strong' }, { type: 'Swim', title: 'OPTIONAL OWS', duration: 45, distance: '2000m', system: 'Aerobic', detail: 'Open water continuous · weather permitting' }],
      ];
      return build[dayOfWeek];
    }
    if (phase === 'BASE') {
      const base = [
        [{ type: 'Yoga', title: 'Preferred day of mobility and Yoga', duration: 30, distance: '', system: 'Aerobic', detail: 'Full recovery · mobility focus' }],
        [{ type: 'Run', title: 'Anaerobic tempo running 20+15', duration: 55, distance: '6 mi', system: 'Anaerobic', detail: '20min @ tempo + 15min @ threshold' }, { type: 'Strength', title: 'Strengthening program', duration: 30, distance: '', system: 'Aerobic', detail: '30 min strength program' }],
        [{ type: 'Cycling', title: 'Fartlek cycling-60 min', duration: 60, distance: '17 mi', system: 'Anaerobic', detail: 'Mixed intervals · varied intensity' }, { type: 'Swim', title: 'Aerobic Swim 2km', duration: 60, distance: '2000m', system: 'Aerobic', detail: '21x50 at aerobic pace' }],
        [{ type: 'Run', title: 'Run from low to high ZONE 2', duration: 60, distance: '7 mi', system: 'Aerobic', detail: '8km progressive · Zone 2 build' }, { type: 'Strength', title: 'Core + stability', duration: 15, distance: '', system: 'Aerobic', detail: 'Core focus' }],
        [{ type: 'Strength', title: 'Morning Strength', duration: 40, distance: '', system: 'Aerobic', detail: 'Full body' }],
        [{ type: 'Cycling', title: 'Long aerobic cycling', duration: 120, distance: '35 mi', system: 'Aerobic', detail: 'Long Zone 2 · aerobic base build' }, { type: 'Strength', title: '15 min strengthening', duration: 15, distance: '', system: 'Aerobic', detail: 'Quick post-ride' }],
        [{ type: 'Run', title: 'LSD run', duration: 90, distance: '10 mi', system: 'Aerobic', detail: 'Long steady distance · Zone 2' }, { type: 'Swim', title: 'OPTIONAL recovery swim', duration: 30, distance: '1500m', system: 'Aerobic', detail: 'Easy technique swim' }],
      ];
      return base[dayOfWeek];
    }
    const foundation = [
      [{ type: 'Yoga', title: 'Mobility + Yoga', duration: 30, distance: '', system: 'Aerobic', detail: 'Hip openers + thoracic mobility' }],
      [{ type: 'Run', title: 'Aerobic run', duration: 45, distance: '5 mi', system: 'Aerobic', detail: 'Easy Zone 2 · form focus' }, { type: 'Strength', title: 'Strengthening program', duration: 30, distance: '', system: 'Aerobic', detail: 'Full body · moderate load' }],
      [{ type: 'Swim', title: 'Aerobic swim', duration: 45, distance: '1800m', system: 'Aerobic', detail: '15x100 at aerobic pace' }, { type: 'Cycling', title: 'Easy cycling', duration: 60, distance: '15 mi', system: 'Aerobic', detail: 'Zone 1-2 · form and cadence' }],
      [{ type: 'Run', title: 'Zone 2 fartlek', duration: 50, distance: '5.5 mi', system: 'Aerobic', detail: '10km run with small pickups' }],
      [{ type: 'Strength', title: 'Morning Strength', duration: 45, distance: '', system: 'Aerobic', detail: 'Full body strength program' }],
      [{ type: 'Cycling', title: 'Aerobic cycling', duration: 90, distance: '25 mi', system: 'Aerobic', detail: 'Zone 2 base ride' }],
      [{ type: 'Run', title: 'LSD run from low to high ZONE 2', duration: 60, distance: '7 mi', system: 'Aerobic', detail: 'Long Zone 2 · easy pace' }],
    ];
    return foundation[dayOfWeek];
  };

  const plan = useMemo(() => {
    const weeks = [];
    const totalDays = RACE_DAY_NUM - PLAN_START_DAY + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let i = 0; i < totalWeeks; i++) {
      const weekStartDay = PLAN_START_DAY + (i * 7);
      const weeksUntilRace = totalWeeks - i - 1;
      const phase = getPhase(weeksUntilRace);
      const phaseDetail = getPhaseDetail(phase);

      const days = [];
      let totalHours = 0, totalRun = 0, totalBike = 0, totalSwim = 0;
      for (let d = 0; d < 7; d++) {
        const dayWorkouts = generateDayWorkouts(phase, weeksUntilRace, d);
        const dayNum = weekStartDay + d;
        days.push({ dayNum, workouts: dayWorkouts });
        dayWorkouts.forEach(w => {
          totalHours += w.duration / 60;
          if (w.type === 'Run') totalRun += parseFloat(w.distance) || 0;
          if (w.type === 'Cycling') totalBike += parseFloat(w.distance) || 0;
          if (w.type === 'Swim') totalSwim += (parseFloat(w.distance) || 0) / 1609;
        });
      }

      weeks.push({
        weekNum: i + 1,
        weeksUntilRace,
        weekStartDay,
        phase,
        phaseDetail,
        hours: Math.round(totalHours),
        runMi: Math.round(totalRun),
        bikeMi: Math.round(totalBike),
        swimMi: Math.round(totalSwim * 10) / 10,
        days,
      });
    }
    return weeks;
  }, []);

  // Current week is driven by todayDay (state). Before hydration it's null → default to 0.
  const currentWeekIndex = useMemo(() => {
    if (todayDay === null) return 0;
    const diffDays = todayDay - PLAN_START_DAY;
    if (diffDays < 0) return 0;
    const idx = Math.floor(diffDays / 7);
    return Math.min(Math.max(idx, 0), plan.length - 1);
  }, [todayDay, plan.length]);

  const effectiveSelectedWeek = selectedWeek !== null ? selectedWeek : currentWeekIndex;
  const effectiveCalendarWeek = calendarWeek !== null ? calendarWeek : currentWeekIndex;

  const weeksToRace = plan.length - 1;
  const daysToRace = todayDay === null ? (RACE_DAY_NUM - PLAN_START_DAY) : Math.max(0, RACE_DAY_NUM - todayDay);
  const currentWeek = plan[effectiveSelectedWeek];
  const currentCalendarWeek = plan[effectiveCalendarWeek];

  const todayIndex = useMemo(() => {
    if (todayDay === null) return -1;
    if (effectiveCalendarWeek !== currentWeekIndex) return -1;
    const diff = todayDay - currentCalendarWeek.weekStartDay;
    return diff >= 0 && diff < 7 ? diff : -1;
  }, [todayDay, effectiveCalendarWeek, currentWeekIndex, currentCalendarWeek]);

  const phaseColor = (phase) => {
    const colors = {
      'FOUNDATION': '#4a6fa5',
      'BASE': '#3d5a99',
      'BUILD': '#2b4b8e',
      'PEAK': '#1a3b82',
      'TAPER': '#5a8fd4',
      'RACE WEEK': '#ffd700',
      'RECOVERY': '#7a9bc4',
    };
    return colors[phase] || '#2b4b8e';
  };

  const workoutTypeColor = (type) => {
    const colors = {
      'Run': '#e74c3c',
      'Cycling': '#3498db',
      'Swim': '#1abc9c',
      'Strength': '#9b59b6',
      'Yoga': '#95a5a6',
      'Other': '#7f8c8d',
      'IRONMAN': '#ffd700',
    };
    return colors[type] || '#5a8fd4';
  };

  const systemBadge = (system) => {
    if (system === 'Aerobic') return { bg: 'rgba(26, 188, 156, 0.15)', color: '#1abc9c', label: 'AE' };
    if (system === 'Anaerobic') return { bg: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', label: 'AN' };
    if (system === 'Race') return { bg: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', label: 'RACE' };
    return { bg: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6', label: 'REST' };
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayNamesLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TEXAS_RED = '#c8102e';

  return (
    <div style={{
      background: '#050814',
      color: '#f5f7ff',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #050814; overflow-x: hidden; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        @keyframes texasGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(200, 16, 46, 0.4), 0 0 40px rgba(200, 16, 46, 0.2); }
          50% { text-shadow: 0 0 30px rgba(200, 16, 46, 0.7), 0 0 60px rgba(200, 16, 46, 0.3); }
        }
        @keyframes todayPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(200, 16, 46, 0); }
        }
        
        .grain::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 1; mix-blend-mode: overlay;
        }
        
        .nav-link {
          color: #f5f7ff; cursor: pointer; transition: color 0.3s ease;
          background: none; border: none; font-family: 'Archivo', sans-serif;
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          font-weight: 700; padding: 8px 0;
        }
        .nav-link:hover { color: #5a8fd4; }
        
        .week-card { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; }
        .week-card:hover { transform: translateY(-4px); opacity: 1 !important; }
        
        .cta-btn { transition: all 0.3s ease; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(26, 59, 130, 0.6); }

        .texas-word { color: ${TEXAS_RED}; animation: texasGlow 3s ease-in-out infinite; }

        .day-col { transition: all 0.2s ease; }
        .day-col:hover { background: rgba(90, 143, 212, 0.04); }
        
        .workout-card { transition: all 0.3s ease; }
        .workout-card:hover { transform: translateX(2px); border-color: rgba(90, 143, 212, 0.5) !important; }

        .cal-nav-btn { transition: all 0.2s ease; }
        .cal-nav-btn:hover:not(:disabled) { background: #5a8fd4 !important; color: #050814 !important; }
        .cal-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .today-badge {
          display: inline-block; padding: 2px 8px;
          background: ${TEXAS_RED}; color: #fff;
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 0.15em; text-transform: uppercase;
          font-weight: 700; animation: todayPulse 2s infinite; border-radius: 2px;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        .nav-bar { padding: 20px 40px; }
        .section-pad { padding: 80px 40px; }
        .hero-pad { padding: 120px 40px 60px; }
        .countdown-pad { padding: 36px 40px; }
        .quote-pad { padding: 56px 40px; }
        .footer-pad { padding: 36px 40px; }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .overview-card {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 40px;
          padding: 40px;
          align-items: center;
        }
        .overview-stats { grid-template-columns: repeat(4, 1fr); }
        .hero-btns { flex-direction: row; }
        .cal-header-row { flex-wrap: wrap; }
        .week-bars-row { height: 180px; }

        @media (max-width: 768px) {
          .nav-bar { padding: 16px 20px; }
          .nav-bar .nav-links { gap: 16px !important; }
          .nav-bar .brand { font-size: 18px !important; }
          .section-pad { padding: 56px 20px; }
          .hero-pad { padding: 100px 20px 40px; }
          .countdown-pad { padding: 24px 20px; }
          .quote-pad { padding: 40px 20px; }
          .footer-pad { padding: 28px 20px; }

          /* Calendar stacks to 1 column, becomes daily list */
          .calendar-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .day-col {
            min-height: auto !important;
            padding: 16px !important;
          }

          /* Overview card stacks vertically, stats to 2×2 */
          .overview-card {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 24px;
          }
          .overview-stats { grid-template-columns: repeat(2, 1fr) !important; }

          /* Hero buttons full width */
          .hero-btns {
            flex-direction: column;
            align-items: stretch;
          }
          .hero-btns button { width: 100%; }

          /* Calendar week header buttons stack vertically */
          .cal-header-row {
            flex-direction: column;
            gap: 12px;
          }
          .cal-header-row button { width: 100%; }

          /* Shorter week bar chart on mobile */
          .week-bars-row { height: 120px !important; }

          /* Stats strip: smaller text */
          .countdown-pad .stat-val-num {
            font-size: clamp(28px, 9vw, 44px) !important;
          }
          .countdown-pad .stat-val-text {
            font-size: clamp(16px, 5vw, 24px) !important;
          }

          /* Hero headline lighter */
          .hero-title { font-size: clamp(40px, 13vw, 90px) !important; }

          /* Footer content wraps */
          .footer-content {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav className="nav-bar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(5, 8, 20, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(90, 143, 212, 0.15)',
      }}>
        <button onClick={() => scrollTo('top')} className="nav-link brand" style={{
          fontFamily: "'Archivo Black', sans-serif", fontSize: '22px',
          letterSpacing: '-0.02em', textTransform: 'none',
        }}>
          {ATHLETE.brand}<span style={{ color: '#5a8fd4' }}>.</span>
        </button>
        <div className="nav-links" style={{ display: 'flex', gap: '32px' }}>
          <button onClick={() => scrollTo('calendar')} className="nav-link">Calendar</button>
          <button onClick={() => scrollTo('plan')} className="nav-link">Overview</button>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
          color: '#5a8fd4', letterSpacing: '0.15em',
        }}>
          T−{daysToRace}d
        </div>
      </nav>

      {/* HERO */}
      <section id="top" className="hero-pad" style={{
        minHeight: '75vh',
        position: 'relative', display: 'flex',
        flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '-300px', width: '900px', height: '900px',
          background: 'radial-gradient(circle, rgba(26, 59, 130, 0.25) 0%, transparent 60%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-200px', width: '600px', height: '600px',
          background: `radial-gradient(circle, rgba(200, 16, 46, 0.15) 0%, transparent 60%)`,
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px',
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fadeIn 0.8s ease 0.2s backwards' : 'none',
          }}>
            <div style={{ width: '8px', height: '8px', background: TEXAS_RED, borderRadius: '50%', animation: 'pulse 2s infinite', flexShrink: 0 }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.25em', color: '#5a8fd4', fontWeight: 500,
            }}>
              {ATHLETE.firstName.toUpperCase()} {ATHLETE.lastName.toUpperCase()} · {ATHLETE.raceLabel}
            </span>
          </div>

          <h1 className="hero-title" style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 'clamp(52px, 9vw, 150px)',
            lineHeight: 0.85, letterSpacing: '-0.04em', margin: '0 0 32px',
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fadeUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s backwards' : 'none',
          }}>
            <span style={{ display: 'block' }}>THE ROAD</span>
            <span style={{ display: 'block' }}>TO <span className="texas-word">TEXAS.</span></span>
          </h1>

          <div className="hero-btns" style={{
            display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '32px',
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'fadeUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s backwards' : 'none',
          }}>
            <button onClick={() => scrollTo('calendar')} className="cta-btn" style={{
              padding: '16px 32px', background: '#1a3b82', color: '#f5f7ff', border: 'none',
              fontFamily: "'Archivo Black', sans-serif", fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
            }}>
              Today's Workout  →
            </button>
            <button onClick={() => scrollTo('plan')} className="cta-btn" style={{
              padding: '16px 32px', background: 'transparent', color: '#f5f7ff',
              border: '1px solid rgba(90, 143, 212, 0.4)',
              fontFamily: "'Archivo Black', sans-serif", fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
            }}>
              Full Plan
            </button>
          </div>
        </div>
      </section>

      {/* QUOTE (moved up — stats strip now lives at bottom) */}
      <section className="quote-pad" style={{
        background: 'linear-gradient(180deg, #050814 0%, #0a1028 50%, #050814 100%)',
        borderTop: '1px solid rgba(90, 143, 212, 0.15)',
        borderBottom: '1px solid rgba(90, 143, 212, 0.1)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '72px',
            lineHeight: 0.8, color: '#1a3b82', opacity: 0.5, marginBottom: '-12px',
          }}>"</div>
          <blockquote style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 'clamp(22px, 3.2vw, 40px)', lineHeight: 1.15,
            letterSpacing: '-0.02em', marginBottom: '24px',
          }}>
            {quotes[quoteIndex].text}
          </blockquote>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '0.25em', color: '#5a8fd4',
          }}>
            — {quotes[quoteIndex].author}
          </div>
        </div>
      </section>

      {/* CALENDAR */}
      <section id="calendar" className="section-pad" style={{
        background: 'linear-gradient(180deg, #050814 0%, #070b1c 50%, #050814 100%)',
        borderTop: '1px solid rgba(90, 143, 212, 0.15)',
        borderBottom: '1px solid rgba(90, 143, 212, 0.15)',
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '0.25em', color: '#5a8fd4', marginBottom: '32px',
          }}>
            §01 · Calendar
          </div>

          <div className="cal-header-row" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px 24px',
            background: 'rgba(26, 59, 130, 0.15)',
            border: '1px solid rgba(90, 143, 212, 0.25)',
            marginBottom: '24px',
            gap: '16px',
          }}>
            <button
              onClick={() => setCalendarWeek(Math.max(0, effectiveCalendarWeek - 1))}
              disabled={effectiveCalendarWeek === 0}
              className="cal-nav-btn"
              style={{
                padding: '12px 20px', background: 'transparent', color: '#f5f7ff',
                border: '1px solid rgba(90, 143, 212, 0.4)',
                fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
              ← Prev Week
            </button>
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                letterSpacing: '0.2em', color: '#5a8fd4', textTransform: 'uppercase', marginBottom: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap',
              }}>
                <span>Week {currentCalendarWeek.weekNum} of {plan.length} · T−{currentCalendarWeek.weeksUntilRace}</span>
                {effectiveCalendarWeek === currentWeekIndex && <span className="today-badge">This Week</span>}
              </div>
              <div style={{
                fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(22px, 4vw, 28px)',
                letterSpacing: '-0.02em', color: phaseColor(currentCalendarWeek.phase),
              }}>
                {currentCalendarWeek.phase}
              </div>
              <div style={{
                fontFamily: "'Archivo', sans-serif", fontSize: '13px',
                color: 'rgba(245, 247, 255, 0.6)', marginTop: '4px',
              }}>
                {formatDayNumWithYear(currentCalendarWeek.weekStartDay)} · {currentCalendarWeek.hours}h planned
              </div>
              {calendarWeek !== null && (
                <button
                  onClick={() => setCalendarWeek(null)}
                  style={{
                    marginTop: '8px', padding: '6px 14px', background: 'transparent',
                    color: TEXAS_RED, border: `1px solid ${TEXAS_RED}`,
                    fontFamily: "'Archivo Black', sans-serif", fontSize: '9px',
                    textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
                  }}>
                  ← Back to This Week
                </button>
              )}
            </div>
            <button
              onClick={() => setCalendarWeek(Math.min(plan.length - 1, effectiveCalendarWeek + 1))}
              disabled={effectiveCalendarWeek === plan.length - 1}
              className="cal-nav-btn"
              style={{
                padding: '12px 20px', background: 'transparent', color: '#f5f7ff',
                border: '1px solid rgba(90, 143, 212, 0.4)',
                fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
              Next Week →
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={plan.length - 1}
            value={effectiveCalendarWeek}
            onChange={(e) => setCalendarWeek(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '28px', accentColor: '#5a8fd4' }}
          />

          <div className="calendar-grid" style={{
            background: 'rgba(90, 143, 212, 0.15)',
            border: '1px solid rgba(90, 143, 212, 0.2)',
          }}>
            {currentCalendarWeek.days.map((day, i) => {
              const isToday = i === todayIndex;
              return (
                <div key={i} className="day-col" style={{
                  background: isToday ? 'rgba(200, 16, 46, 0.08)' : '#050814',
                  padding: '20px 16px',
                  minHeight: '400px',
                  display: 'flex', flexDirection: 'column',
                  borderTop: isToday ? `2px solid ${TEXAS_RED}` : 'none',
                }}>
                  <div style={{
                    paddingBottom: '12px', marginBottom: '16px',
                    borderBottom: '1px solid rgba(90, 143, 212, 0.15)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        fontFamily: "'Archivo Black', sans-serif",
                        fontSize: '16px', letterSpacing: '0.1em',
                        color: isToday ? TEXAS_RED : '#f5f7ff',
                      }}>
                        {dayNames[i]}
                      </div>
                      {isToday && <span className="today-badge">Today</span>}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                      color: 'rgba(245, 247, 255, 0.5)', letterSpacing: '0.1em', marginTop: '2px',
                    }}>
                      {formatDayNum(day.dayNum)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {day.workouts.map((w, wi) => {
                      const badge = systemBadge(w.system);
                      return (
                        <div key={wi} className="workout-card" style={{
                          padding: '12px 14px',
                          background: 'rgba(90, 143, 212, 0.05)',
                          border: `1px solid rgba(90, 143, 212, 0.15)`,
                          borderLeft: `3px solid ${workoutTypeColor(w.type)}`,
                        }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px',
                          }}>
                            <div style={{
                              fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                              color: workoutTypeColor(w.type), letterSpacing: '0.1em', textTransform: 'uppercase',
                            }}>
                              {w.type}
                            </div>
                            <div style={{
                              fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
                              padding: '2px 6px', background: badge.bg, color: badge.color,
                              letterSpacing: '0.1em', fontWeight: 600,
                            }}>
                              {badge.label}
                            </div>
                          </div>
                          <div style={{
                            fontFamily: "'Archivo', sans-serif", fontSize: '13px',
                            fontWeight: 600, color: '#f5f7ff', lineHeight: 1.3, marginBottom: '4px',
                          }}>
                            {w.title}
                          </div>
                          <div style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                            color: '#5a8fd4', letterSpacing: '0.05em', marginBottom: '6px',
                          }}>
                            {w.duration > 0 ? `${w.duration}min` : 'Rest'}
                            {w.distance && ` · ${w.distance}`}
                          </div>
                          <div style={{
                            fontFamily: "'Archivo', sans-serif", fontSize: '11px',
                            color: 'rgba(245, 247, 255, 0.55)', lineHeight: 1.4,
                          }}>
                            {w.detail}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px',
            paddingTop: '20px', borderTop: '1px solid rgba(90, 143, 212, 0.15)',
          }}>
            {['Run', 'Cycling', 'Swim', 'Strength', 'Yoga', 'Other'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', background: workoutTypeColor(t) }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                  letterSpacing: '0.15em', color: 'rgba(245, 247, 255, 0.6)', textTransform: 'uppercase',
                }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section id="plan" className="section-pad">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '0.25em', color: '#5a8fd4', marginBottom: '32px',
          }}>
            §02 · Overview
          </div>

          <div className="overview-card" style={{
            background: 'linear-gradient(135deg, rgba(26, 59, 130, 0.25) 0%, rgba(90, 143, 212, 0.05) 100%)',
            border: '1px solid rgba(90, 143, 212, 0.3)',
            marginBottom: '40px',
          }}>
            <div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                letterSpacing: '0.2em', color: '#5a8fd4', textTransform: 'uppercase', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              }}>
                <span>Week {currentWeek.weekNum} / {plan.length} · T−{currentWeek.weeksUntilRace}</span>
                {effectiveSelectedWeek === currentWeekIndex && <span className="today-badge">This Week</span>}
              </div>
              <div style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 0.9, letterSpacing: '-0.03em',
                color: phaseColor(currentWeek.phase), marginBottom: '12px',
              }}>
                {currentWeek.phase}
              </div>
              <div style={{
                fontFamily: "'Archivo', sans-serif", fontSize: '15px', fontWeight: 500,
                color: 'rgba(245, 247, 255, 0.7)', marginBottom: '8px',
              }}>
                {currentWeek.phaseDetail}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                color: 'rgba(245, 247, 255, 0.5)', letterSpacing: '0.1em',
              }}>
                Week of {formatDayNumWithYear(currentWeek.weekStartDay)}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setCalendarWeek(effectiveSelectedWeek); scrollTo('calendar'); }}
                  className="cta-btn"
                  style={{
                    padding: '12px 24px', background: '#5a8fd4', color: '#050814',
                    border: 'none', fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
                  }}>
                  View Daily Workouts →
                </button>
                {selectedWeek !== null && (
                  <button
                    onClick={() => setSelectedWeek(null)}
                    className="cta-btn"
                    style={{
                      padding: '12px 20px', background: 'transparent', color: '#f5f7ff',
                      border: '1px solid rgba(90, 143, 212, 0.4)',
                      fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                      textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
                    }}>
                    Jump to Today
                  </button>
                )}
              </div>
            </div>
            <div className="overview-stats" style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: 'Total', value: currentWeek.hours, unit: 'hrs' },
                { label: 'Run', value: currentWeek.runMi, unit: 'mi' },
                { label: 'Bike', value: currentWeek.bikeMi, unit: 'mi' },
                { label: 'Swim', value: currentWeek.swimMi, unit: 'mi' },
              ].map((stat, i) => (
                <div key={i} style={{
                  padding: '20px 16px', background: 'rgba(5, 8, 20, 0.6)',
                  border: '1px solid rgba(90, 143, 212, 0.15)',
                }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#5a8fd4',
                    textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px',
                  }}>{stat.label}</div>
                  <div style={{
                    fontFamily: "'Archivo Black', sans-serif",
                    fontSize: 'clamp(28px, 5vw, 36px)', lineHeight: 1, color: '#f5f7ff',
                  }}>
                    {stat.value}
                    <span style={{
                      fontSize: '13px', color: 'rgba(245, 247, 255, 0.5)', marginLeft: '4px',
                      fontFamily: "'Archivo', sans-serif", fontWeight: 400,
                    }}>{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
              letterSpacing: '0.2em', color: 'rgba(245, 247, 255, 0.5)',
              textTransform: 'uppercase', marginBottom: '16px', gap: '8px',
            }}>
              <span>← START</span>
              <span>CLICK A WEEK</span>
              <span>RACE →</span>
            </div>
            <div className="week-bars-row" style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', marginBottom: '8px' }}>
              {plan.map((w, i) => {
                const isCurrent = i === currentWeekIndex;
                const isSelected = i === effectiveSelectedWeek;
                return (
                  <div
                    key={i}
                    className="week-card"
                    onClick={() => setSelectedWeek(i)}
                    style={{
                      flex: 1, minWidth: '6px',
                      height: `${(w.hours / 24) * 100}%`, minHeight: '6px',
                      background: isSelected ? '#5a8fd4' : phaseColor(w.phase),
                      opacity: isSelected ? 1 : (isCurrent ? 0.9 : 0.55),
                      border: isSelected
                        ? '2px solid #f5f7ff'
                        : (isCurrent ? `2px solid ${TEXAS_RED}` : 'none'),
                    }}
                    title={`Week ${w.weekNum} · ${w.phase} · ${w.hours}h${isCurrent ? ' · THIS WEEK' : ''}`}
                  />
                );
              })}
            </div>
            <div style={{
              display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px',
              paddingTop: '20px', borderTop: '1px solid rgba(90, 143, 212, 0.15)',
            }}>
              {['FOUNDATION', 'BASE', 'BUILD', 'PEAK', 'TAPER', 'RACE WEEK', 'RECOVERY'].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', background: phaseColor(p) }} />
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                    letterSpacing: '0.15em', color: 'rgba(245, 247, 255, 0.6)',
                  }}>{p}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', background: 'transparent', border: `2px solid ${TEXAS_RED}` }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                  letterSpacing: '0.15em', color: TEXAS_RED,
                }}>THIS WEEK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP — MOVED TO BOTTOM */}
      <section className="countdown-pad" style={{
        background: 'linear-gradient(180deg, #050814 0%, #0a1028 100%)',
        borderTop: '1px solid rgba(90, 143, 212, 0.15)',
        borderBottom: '1px solid rgba(90, 143, 212, 0.15)',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px',
        }}>
          {[
            { label: 'Days to Race', value: daysToRace, isText: false },
            { label: 'Current Week', value: currentWeekIndex + 1, isText: false },
            { label: 'Total Weeks', value: weeksToRace, isText: false },
            { label: 'Current Phase', value: plan[currentWeekIndex].phase.split(' ')[0], isText: true },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 12px', textAlign: 'center' }}>
              <div
                className={s.isText ? 'stat-val-text' : 'stat-val-num'}
                style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontSize: s.isText ? 'clamp(18px, 2.8vw, 38px)' : 'clamp(32px, 4.5vw, 56px)',
                  lineHeight: 1, color: '#5a8fd4', letterSpacing: '-0.03em',
                }}>{s.value}</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
                textTransform: 'uppercase', letterSpacing: '0.2em',
                color: 'rgba(245, 247, 255, 0.5)', marginTop: '8px',
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-pad" style={{ borderTop: '1px solid rgba(90, 143, 212, 0.1)' }}>
        <div className="footer-content" style={{
          maxWidth: '1400px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '24px',
        }}>
          <div style={{
            fontFamily: "'Archivo Black', sans-serif", fontSize: '20px', letterSpacing: '-0.02em',
          }}>
            {ATHLETE.brand}<span style={{ color: '#5a8fd4' }}>.</span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
            color: 'rgba(245, 247, 255, 0.4)', letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            {ATHLETE.firstName}'s Road to <span style={{ color: TEXAS_RED }}>Texas</span> · {ATHLETE.established}
          </div>
        </div>
      </footer>
    </div>
  );
}
