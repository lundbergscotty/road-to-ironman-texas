import React, { useState, useEffect, useMemo } from 'react';

// === ATHLETE CONFIG (edit here only) ===
const ATHLETE = {
  firstName: 'Aiden',
  lastName: 'Matano',
  brand: 'MATANO',                      // nav + footer wordmark
  planStart: { y: 2026, m: 9, d: 5 },   // Mon Oct 5, 2026 (m is 0-indexed). Snaps back to the week start below.
  raceDay:   { y: 2027, m: 3, d: 24 },  // Sat Apr 24, 2027
  raceLabel: 'IRONMAN TEXAS · APRIL 24, 2027',
  established: 'Est. October 2026',
};

// === SCHEDULE CONFIG ===
// Weekdays are 0=Sun … 6=Sat. caps = max minutes available in that window (0 = no window).
const SCHEDULE = {
  weekStartsOn: 0,                        // calendar week starts Sunday so the two free days lead
  slotTimes: { AM: '5:45', PM: '7:30' },
  days: {
    0: { label: 'Free',        work: false, heavy: false, caps: { AM: 240, PM: 90 } },
    1: { label: 'Free',        work: false, heavy: false, caps: { AM: 360, PM: 60 } },
    2: { label: 'Work',        work: true,  heavy: false, caps: { AM: 60,  PM: 0 } },
    3: { label: 'Work',        work: true,  heavy: false, caps: { AM: 0,   PM: 90 } },
    4: { label: 'Heavy work',  work: true,  heavy: true,  caps: { AM: 45,  PM: 0 } },
    5: { label: 'Heavy work',  work: true,  heavy: true,  caps: { AM: 0,   PM: 45 } },
    6: { label: 'Early leave', work: true,  heavy: false, caps: { AM: 0,   PM: 120 } },
  },
};

// === MILESTONES === optional dated one-offs. Add { date: { y, m, d }, title, type, detail } to pin a gold card to that day.
const MILESTONES = [];

// Original katana drawn in a 1000 x 140 box, tip pointing right, centred on y=70.
function Katana({ x, y, rotate = 0, scale = 1, flip = false }) {
  const diamonds = Array.from({ length: 9 }, (_, i) => 78 + i * 22);
  // stylised hamon (temper line): gentle zigzag following the blade's curve
  const q = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  const hamon = Array.from({ length: 29 }, (_, i) => {
    const t = i / 28;
    return `${i === 0 ? 'M' : 'L'} ${q(318, 660, 990, t).toFixed(1)} ${(q(74, 62, 42, t) + (i % 2 ? 2.5 : -2.5)).toFixed(1)}`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -scale : scale} ${scale}) translate(-500 -70)`}>
      {/* kashira (pommel) */}
      <rect x="40" y="52" width="14" height="36" rx="4" fill="#1b2238" stroke="url(#gold)" strokeWidth="1.5" />
      {/* tsuka (handle) with red ito wrap */}
      <rect x="54" y="55" width="222" height="30" rx="6" fill="#262c42" />
      {diamonds.map(cx => (
        <polygon key={cx} points={`${cx},57 ${cx + 11},70 ${cx},83 ${cx - 11},70`} fill="#c8102e" opacity="0.9" />
      ))}
      {diamonds.map(cx => (
        <line key={`l${cx}`} x1={cx - 11} y1="55" x2={cx + 11} y2="85" stroke="#0b0f1e" strokeWidth="2" />
      ))}
      {/* tsuba (guard) */}
      <ellipse cx="284" cy="70" rx="9" ry="34" fill="#121829" stroke="url(#gold)" strokeWidth="2" />
      {/* habaki (collar) */}
      <rect x="293" y="56" width="22" height="28" fill="url(#gold)" />
      {/* blade with sori (curve) and kissaki (tip) */}
      <path d="M 315 54 Q 660 30 990 32 L 1000 44 Q 660 60 315 86 Z" fill="url(#steel)" />
      {/* shinogi (ridge line) */}
      <path d="M 315 64 Q 660 44 992 36" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none" />
      {/* hamon */}
      <path d={hamon} stroke="rgba(255,255,255,0.55)" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </g>
  );
}

function KatanaBackdrop() {
  return (
    <div className="katana-bg" aria-hidden="true">
      <svg viewBox="0 0 1000 700" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e4eaf7" />
            <stop offset="0.42" stopColor="#8c9ab6" />
            <stop offset="0.5" stopColor="#f3f6fc" />
            <stop offset="1" stopColor="#5a688a" />
          </linearGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1d27a" />
            <stop offset="1" stopColor="#9c7a1c" />
          </linearGradient>
          <filter id="kglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.56  0 0 0 0 0.83  0 0 0 0.9 0" result="c" />
            <feMerge><feMergeNode in="c" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter="url(#kglow)">
          <Katana x={500} y={350} rotate={-30} scale={0.8} />
          <Katana x={500} y={350} rotate={30} scale={0.8} flip />
        </g>
      </svg>
    </div>
  );
}

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
  // Weekday of a day number, 0=Sun … 6=Sat (day 0 = Thu Jan 1, 1970)
  const weekdayOf = (dayNum) => ((dayNum + 4) % 7 + 7) % 7;

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

  // Snap the configured start back to the configured week-start day so week 1 is a full calendar week
  const rawPlanStart = dayNumFromYMD(ATHLETE.planStart.y, ATHLETE.planStart.m, ATHLETE.planStart.d);
  const PLAN_START_DAY = rawPlanStart - ((weekdayOf(rawPlanStart) - SCHEDULE.weekStartsOn + 7) % 7);
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

  const getPhase = (weeksUntilRace, weekIndex) => {
    if (weeksUntilRace === 0) return 'RACE WEEK';
    if (weeksUntilRace <= 2) return 'TAPER';
    if (weeksUntilRace <= 4) return 'PEAK';
    // 3 weeks on / 1 recovery, counted from plan start so week 1 is never a recovery week
    if (weekIndex % 4 === 3) return 'RECOVERY';
    if (weeksUntilRace <= 12) return 'BUILD';
    if (weeksUntilRace <= 40) return 'BASE';
    return 'FOUNDATION';
  };

  const getPhaseDetail = (phase) => {
    const details = {
      'FOUNDATION': 'Prep · consistency',
      'BASE': 'Aerobic base · bricks begin',
      'BUILD': 'IM-specific · two bricks a week',
      'PEAK': 'Biggest Sun–Mon blocks',
      'TAPER': 'Sharpen · no plyos · rest',
      'RACE WEEK': 'Texas · April 24',
      'RECOVERY': 'Absorb · adapt · deload',
    };
    return details[phase] || '';
  };

  // Templates are indexed 0=Sun … 6=Sat to match SCHEDULE.
  // Each workout: type, title, duration (min), distance, system, slot (AM/PM), detail, optional tag / optional flag.
  const generateDayWorkouts = (phase, weeksUntilRace, dayOfWeek) => {
    const R = (o) => ({ type: 'Run', system: 'Aerobic', ...o });
    const C = (o) => ({ type: 'Cycling', system: 'Aerobic', ...o });
    const S = (o) => ({ type: 'Swim', system: 'Aerobic', ...o });
    const ST = (o) => ({ type: 'Strength', system: 'Aerobic', distance: '', ...o });
    const OFF = (title, detail) => ({ type: 'Other', title, duration: 0, distance: '', system: 'Rest', slot: 'AM', detail });

    if (phase === 'RACE WEEK') {
      // Sun Apr 18 → Sat Apr 24 (race day). Work-window checks are skipped this week.
      return [
        [R({ title: 'Easy shake-out run', duration: 40, distance: '4 mi', slot: 'AM', detail: 'Zone 1–2 · 4x30s strides · stay loose' })],
        [C({ title: 'Pre-race impulse ride', duration: 45, distance: '15 mi', slot: 'AM', tag: 'Kickr', detail: 'Spin + 3x2 min at race pace' }),
         S({ title: 'Pre-race impulse swim', duration: 30, distance: '1500m', slot: 'PM', detail: 'Short race-pace bursts + easy' })],
        [S({ title: 'Easy swim', duration: 30, distance: '1200m', slot: 'AM', tag: 'EOS / OWS', detail: 'Feel for the water · nothing hard' })],
        [OFF('Travel to The Woodlands', 'Day off · travel · hydrate · athlete check-in')],
        [R({ title: 'Race course shake-out', duration: 20, distance: '2 mi', slot: 'AM', detail: 'Very easy · mental prep' }),
         S({ title: 'Practice swim', duration: 20, distance: '1000m', slot: 'AM', detail: 'Course familiarization · sighting' })],
        [C({ title: 'Last spin · bike drop-off', duration: 30, distance: '10 mi', slot: 'AM', detail: 'Check gears · drop bike · early bedtime' })],
        [{ type: 'IRONMAN', title: 'IRONMAN TEXAS 2027', duration: 720, distance: '140.6 mi', system: 'Race', slot: 'AM', detail: 'Swim 2.4mi → Bike 112mi → Run 26.2mi · trust the work' }],
      ][dayOfWeek];
    }

    if (phase === 'TAPER') {
      return [
        [R({ title: 'Taper long run', duration: 75, distance: '8 mi', slot: 'AM', detail: 'Zone 2 · 3x8 min at IM pace · soft surface' })],
        [C({ title: 'Taper ride', duration: 120, distance: '36 mi', slot: 'AM', detail: '2x20 min at IM power · final gear + fit check' }),
         R({ title: 'Brick run', duration: 20, distance: '2.5 mi', slot: 'AM', tag: 'Brick', detail: 'Right off the bike · IM pace · smooth' }),
         ST({ title: 'Mobility + activation', duration: 20, slot: 'PM', detail: 'Hips · calves · balance · no load · no plyos' })],
        [S({ title: 'Race-pace swim', duration: 45, distance: '2000m', slot: 'AM', tag: 'EOS / OWS', detail: '6x200 at race pace · sight every 6 strokes' })],
        [R({ title: 'Taper tempo', duration: 45, distance: '5 mi', slot: 'PM', system: 'Anaerobic', detail: '3x5 min at IM pace · 2 min easy' })],
        [S({ title: 'Easy swim', duration: 30, distance: '1200m', slot: 'AM', tag: 'Club / OWS', detail: 'Technique only' })],
        [ST({ title: 'Activation only', duration: 20, slot: 'PM', detail: 'Band work · single-leg balance · no plyos · no load' })],
        [C({ title: 'Kickr openers', duration: 60, distance: '18 mi', slot: 'PM', tag: 'Kickr', detail: '3x3 min at race pace · otherwise easy' }),
         R({ title: 'Short brick', duration: 15, distance: '1.5 mi', slot: 'PM', tag: 'Brick', detail: 'Easy · form check' })],
      ][dayOfWeek];
    }

    if (phase === 'PEAK') {
      return [
        [R({ title: 'Long run · race rehearsal', duration: 160, distance: '17 mi', slot: 'AM', detail: 'Zone 2 · full race nutrition · last 30 min at IM pace' }),
         C({ title: 'Kickr spin', duration: 90, distance: '27 mi', slot: 'PM', tag: 'Kickr', detail: 'Zone 2 · flush the long run · nutrition top-up' })],
        [C({ title: 'Long ride · IM power', duration: 300, distance: '95 mi', slot: 'AM', detail: '3x50 min at IM power · full nutrition rehearsal · race kit' }),
         R({ title: 'Brick run · IM pace', duration: 50, distance: '6 mi', slot: 'AM', tag: 'Brick', system: 'Anaerobic', detail: 'Hold form on tired legs · even splits' }),
         ST({ title: 'Stability + mobility', duration: 20, slot: 'PM', detail: 'Hip abductors · calf raises · single-leg balance · no plyos' })],
        [S({ title: 'Race-pace swim', duration: 60, distance: '2800m', slot: 'AM', tag: 'EOS / OWS', detail: '3x800 at race pace · sighting · wetsuit if OWS' })],
        [R({ title: 'IM race-pace run', duration: 60, distance: '7 mi', slot: 'PM', system: 'Anaerobic', detail: '10 min WU · 40 min at IM pace · 10 min CD' }),
         ST({ title: 'Core', duration: 15, slot: 'PM', detail: 'Anti-rotation · dead bugs · side plank' })],
        [S({ title: 'Easy swim', duration: 40, distance: '1800m', slot: 'AM', tag: 'Club / OWS', detail: '8x100 moderate · easy' })],
        [ST({ title: 'Single-leg strength · light', duration: 30, slot: 'PM', tag: 'Low plyo', detail: 'Split squats · step-downs · SL RDL · pogo hops 2x15 only' })],
        [C({ title: 'Kickr · IM power', duration: 90, distance: '27 mi', slot: 'PM', tag: 'Kickr', detail: '3x15 min at IM power · 5 min easy' }),
         R({ title: 'Brick run', duration: 20, distance: '2.5 mi', slot: 'PM', tag: 'Brick', detail: 'Easy to steady' })],
      ][dayOfWeek];
    }

    if (phase === 'RECOVERY') {
      return [
        [R({ title: 'Easy long run', duration: 60, distance: '6.5 mi', slot: 'AM', detail: 'Zone 1–2 · soft surface · no pace' })],
        [C({ title: 'Easy ride', duration: 90, distance: '27 mi', slot: 'AM', tag: 'Kickr OK', detail: 'Zone 1–2 · flat · spin' }),
         R({ title: 'Short brick', duration: 15, distance: '1.5 mi', slot: 'AM', tag: 'Brick', detail: 'Easy · form only' }),
         ST({ title: 'Mobility', duration: 20, slot: 'PM', detail: 'Foam roll · hips · calves · balance' })],
        [S({ title: 'Recovery swim', duration: 40, distance: '1600m', slot: 'AM', tag: 'EOS / OWS', detail: 'Easy · technique · drills' })],
        [R({ title: 'Recovery run', duration: 40, distance: '4.5 mi', slot: 'PM', detail: 'Zone 1 · very easy' })],
        [OFF('Full rest day', 'Sleep · hydrate · nothing')],
        [ST({ title: 'Single-leg strength · light', duration: 30, slot: 'PM', detail: 'Reduced load · no plyos this week' })],
        [C({ title: 'Easy Kickr spin', duration: 60, distance: '18 mi', slot: 'PM', tag: 'Kickr', detail: 'Zone 1–2 · cadence drills' })],
      ][dayOfWeek];
    }

    if (phase === 'BUILD') {
      return [
        [R({ title: 'Long run · fast finish', duration: 120, distance: '13 mi', slot: 'AM', detail: 'Zone 2 · last 20 min at IM pace · soft surface · nutrition practice' }),
         C({ title: 'Kickr spin', duration: 75, distance: '22 mi', slot: 'PM', tag: 'Kickr', detail: 'Zone 2 · flush the long run · nutrition top-up' })],
        [C({ title: 'Long ride · IM blocks', duration: 210, distance: '65 mi', slot: 'AM', tag: 'Kickr OK', detail: 'Zone 2 · 3x25 min at IM power · race nutrition' }),
         R({ title: 'Brick run · IM pace', duration: 30, distance: '3.5 mi', slot: 'AM', tag: 'Brick', system: 'Anaerobic', detail: 'Right off the bike · IM pace · quick feet' }),
         ST({ title: 'Stability + mobility', duration: 25, slot: 'PM', detail: 'Hip abductors · calf · single-leg balance · no plyos' })],
        [S({ title: 'Aerobic swim', duration: 60, distance: '2400m', slot: 'AM', tag: 'EOS / OWS', detail: '4x400 aerobic · pull + paddles · sighting if OWS' })],
        [R({ title: 'Tempo run', duration: 60, distance: '7 mi', slot: 'PM', system: 'Anaerobic', detail: '2x15 min at HM–IM pace · 3 min easy between' }),
         ST({ title: 'Core', duration: 15, slot: 'PM', detail: 'Anti-rotation · dead bugs · side plank' })],
        [S({ title: 'Easy swim', duration: 40, distance: '1800m', slot: 'AM', tag: 'Club / OWS', detail: '8x100 moderate · easy · technique' })],
        [ST({ title: 'Single-leg strength + plyos', duration: 40, slot: 'PM', tag: 'Plyos', detail: 'Split squats · step-downs · SL RDL · lateral hops · pogo hops · right-leg focus' })],
        [C({ title: 'Kickr threshold', duration: 90, distance: '27 mi', slot: 'PM', tag: 'Kickr', system: 'Anaerobic', detail: '4x10 min at threshold · 5 min easy' }),
         R({ title: 'Brick run', duration: 20, distance: '2.5 mi', slot: 'PM', tag: 'Brick', detail: 'Easy to steady' })],
      ][dayOfWeek];
    }

    // BASE (FOUNDATION falls through to the same template)
    return [
      [R({ title: 'Long run', duration: 75, distance: '8 mi', slot: 'AM', detail: 'Zone 2 · soft surface where possible · relaxed' }),
       S({ title: 'OPTIONAL easy OWS', duration: 30, distance: '1200m', slot: 'PM', optional: true, tag: 'OWS', detail: 'Easy · bay swim if conditions allow' })],
      [C({ title: 'Long ride', duration: 120, distance: '35 mi', slot: 'AM', tag: 'Kickr OK', detail: 'Zone 2 · steady cadence · Kickr until the fit is done' }),
       R({ title: 'Brick run', duration: 15, distance: '1.5 mi', slot: 'AM', tag: 'Brick', detail: 'Right off the bike · easy · find your legs' }),
       ST({ title: 'Stability + mobility', duration: 25, slot: 'PM', detail: 'Hip abductors · calf · single-leg balance · no plyos' })],
      [S({ title: 'Aerobic swim', duration: 50, distance: '2000m', slot: 'AM', tag: 'EOS / OWS', detail: '10x100 aerobic + drills · technique focus' })],
      [R({ title: 'Steady run', duration: 50, distance: '5.5 mi', slot: 'PM', detail: 'Zone 2 · last 10 min low Zone 3 · relaxed form' }),
       ST({ title: 'Core', duration: 15, slot: 'PM', detail: 'Anti-rotation · dead bugs · side plank' })],
      [S({ title: 'Easy swim', duration: 35, distance: '1500m', slot: 'AM', tag: 'Club / OWS', detail: 'Technique · easy · short' })],
      [ST({ title: 'Single-leg strength + plyos', duration: 40, slot: 'PM', tag: 'Plyos', detail: 'Split squats · step-downs · SL RDL · lateral hops · pogo hops · right-leg focus' })],
      [C({ title: 'Kickr sweet spot', duration: 60, distance: '18 mi', slot: 'PM', tag: 'Kickr', detail: '3x8 min sweet spot · 4 min easy' })],
    ][dayOfWeek];
  };

  const plan = useMemo(() => {
    const weeks = [];
    const totalDays = RACE_DAY_NUM - PLAN_START_DAY + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let i = 0; i < totalWeeks; i++) {
      const weekStartDay = PLAN_START_DAY + (i * 7);
      const weeksUntilRace = totalWeeks - i - 1;
      const phase = getPhase(weeksUntilRace, i);
      const phaseDetail = getPhaseDetail(phase);

      const days = [];
      let totalHours = 0, totalRun = 0, totalBike = 0, totalSwim = 0;
      for (let d = 0; d < 7; d++) {
        const weekday = (SCHEDULE.weekStartsOn + d) % 7;
        const dayWorkouts = generateDayWorkouts(phase, weeksUntilRace, weekday);
        const dayNum = weekStartDay + d;
        days.push({ dayNum, weekday, workouts: dayWorkouts });
        dayWorkouts.forEach(w => {
          if (w.optional) return; // optional sessions don't count toward planned load
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
        hours: Math.round(totalHours * 10) / 10,
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

  const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const GOLD = '#ffd700';

  // Over-window check: sum non-optional minutes per slot vs SCHEDULE caps. Skipped in race week.
  const windowIssues = (day, phase) => {
    if (phase === 'RACE WEEK') return [];
    const caps = SCHEDULE.days[day.weekday].caps;
    const used = { AM: 0, PM: 0 };
    day.workouts.forEach(w => { if (!w.optional && w.slot) used[w.slot] += w.duration; });
    return ['AM', 'PM'].filter(slot => used[slot] > caps[slot]).map(slot => ({ slot, over: used[slot] - caps[slot] }));
  };

  const milestonesOn = (dayNum) => MILESTONES.filter(m => m.date && dayNumFromYMD(m.date.y, m.date.m, m.date.d) === dayNum);

  const maxHours = Math.max(...plan.map(w => w.hours), 1);
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

        @keyframes katanaFloat {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(calc(-50% - 10px)) translateX(4px); }
        }
        .katana-bg {
          position: absolute; top: 50%; right: -2%;
          width: min(1050px, 78vw); aspect-ratio: 10 / 7;
          opacity: 0.26; pointer-events: none; z-index: 1;
          animation: katanaFloat 9s ease-in-out infinite;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%, #000 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 22%, #000 100%);
        }
        @media (max-width: 768px) {
          .katana-bg { width: 125vw; right: -32vw; top: 56%; opacity: 0.14; }
        }

        .day-col.free-day { background: rgba(90, 143, 212, 0.05); }
        .day-col.work-day { background: #050814; }
        .day-col.heavy-day { background: rgba(5, 8, 20, 1); }
        .sched-chip {
          display: inline-block; padding: 2px 6px; border-radius: 2px;
          font-family: 'JetBrains Mono', monospace; font-size: 8px;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
        }
        .sched-free { background: rgba(90, 143, 212, 0.18); color: #5a8fd4; }
        .sched-work { background: rgba(245, 247, 255, 0.06); color: rgba(245, 247, 255, 0.45); }
        .sched-heavy { background: rgba(200, 16, 46, 0.14); color: #e07a8a; }
        .slot-chip {
          font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
          padding: 2px 6px; background: rgba(245, 247, 255, 0.06); color: rgba(245, 247, 255, 0.7);
          font-weight: 600; white-space: nowrap;
        }
        .tag-chip {
          display: inline-block; margin-top: 4px; padding: 1px 6px;
          font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
          text-transform: uppercase; border: 1px solid rgba(90, 143, 212, 0.35); color: #5a8fd4;
        }
        .fit-warn {
          margin-top: 8px; padding: 4px 8px;
          font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.08em;
          background: rgba(255, 215, 0, 0.1); color: #ffd700; border: 1px solid rgba(255, 215, 0, 0.35);
        }
        .workout-card.optional { border-style: dashed !important; opacity: 0.7; }
        .milestone-card { border-left-color: #ffd700 !important; background: rgba(255, 215, 0, 0.06) !important; }

        /* ========== MOBILE RESPONSIVE ========== */
        .nav-bar { padding: 20px 40px; }
        .section-pad { padding: 80px 40px; }
        .hero-pad { padding: 120px 40px 60px; }
        .countdown-pad { padding: 36px 40px; }
        .quote-pad { padding: 56px 40px; }
        .footer-pad { padding: 36px 40px; }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 2px;
        }
        .day-col { min-width: 0; }
        .workout-card { min-width: 0; }
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

          /* Calendar week header: title on top, Prev / Next side by side underneath */
          .cal-header-row {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 12px;
          }
          .cal-header-row > div { flex: 1 1 100% !important; order: 1; }
          .cal-header-row > button {
            flex: 1 1 0; order: 2; min-width: 0; min-height: 44px;
            padding: 12px 8px !important; font-size: 10px !important;
          }

          /* Bigger tap targets in the nav */
          .nav-bar .nav-link { padding: 12px 4px; }

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

        <KatanaBackdrop />

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
            style={{ width: '100%', marginBottom: '20px', accentColor: '#5a8fd4' }}
          />


          <div className="calendar-grid" style={{
            background: 'rgba(90, 143, 212, 0.15)',
            border: '1px solid rgba(90, 143, 212, 0.2)',
          }}>
            {currentCalendarWeek.days.map((day, i) => {
              const isToday = i === todayIndex;
              const sched = SCHEDULE.days[day.weekday];
              const dayClass = sched.heavy ? 'heavy-day' : (sched.work ? 'work-day' : 'free-day');
              const schedClass = sched.heavy ? 'sched-heavy' : (sched.work ? 'sched-work' : 'sched-free');
              const issues = windowIssues(day, currentCalendarWeek.phase);
              const dayMilestones = milestonesOn(day.dayNum);
              return (
                <div key={i} className={`day-col ${dayClass}`} style={{
                  background: isToday ? 'rgba(200, 16, 46, 0.08)' : undefined,
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
                        {WEEKDAY_NAMES[day.weekday]}
                      </div>
                      {isToday ? <span className="today-badge">Today</span> : <span className={`sched-chip ${schedClass}`}>{sched.label}</span>}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                      color: 'rgba(245, 247, 255, 0.5)', letterSpacing: '0.1em', marginTop: '2px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
                    }}>
                      <span>{formatDayNum(day.dayNum)}</span>
                      {isToday && <span className={`sched-chip ${schedClass}`}>{sched.label}</span>}
                    </div>
                    {issues.map(iss => (
                      <div key={iss.slot} className="fit-warn">⚠ {iss.slot} over window by {iss.over} min</div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {dayMilestones.map((m, mi) => (
                      <div key={`m${mi}`} className="workout-card milestone-card" style={{
                        padding: '12px 14px',
                        border: `1px solid rgba(255, 215, 0, 0.3)`,
                        borderLeft: `3px solid ${GOLD}`,
                      }}>
                        <div style={{
                          fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                          color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
                        }}>Milestone</div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: '13px', fontWeight: 600, color: '#f5f7ff', lineHeight: 1.3, marginBottom: '4px' }}>{m.title}</div>
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: '11px', color: 'rgba(245, 247, 255, 0.55)', lineHeight: 1.4 }}>{m.detail}</div>
                      </div>
                    ))}
                    {day.workouts.map((w, wi) => {
                      const badge = systemBadge(w.system);
                      return (
                        <div key={wi} className={`workout-card${w.optional ? ' optional' : ''}`} style={{
                          padding: '12px 14px',
                          background: 'rgba(90, 143, 212, 0.05)',
                          border: `1px solid rgba(90, 143, 212, 0.15)`,
                          borderLeft: `3px solid ${workoutTypeColor(w.type)}`,
                        }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '6px', flexWrap: 'wrap',
                          }}>
                            <div style={{
                              fontFamily: "'Archivo Black', sans-serif", fontSize: '11px',
                              color: workoutTypeColor(w.type), letterSpacing: '0.1em', textTransform: 'uppercase',
                            }}>
                              {w.type}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {w.slot && w.duration > 0 && (
                                <span className="slot-chip">{w.slot} · {SCHEDULE.slotTimes[w.slot]}</span>
                              )}
                              <div style={{
                                fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
                                padding: '2px 6px', background: badge.bg, color: badge.color,
                                letterSpacing: '0.1em', fontWeight: 600,
                              }}>
                                {badge.label}
                              </div>
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
                          {w.tag && <span className="tag-chip">{w.tag}</span>}
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
            {['Run', 'Cycling', 'Swim', 'Strength', 'Other'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', background: workoutTypeColor(t) }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                  letterSpacing: '0.15em', color: 'rgba(245, 247, 255, 0.6)', textTransform: 'uppercase',
                }}>{t}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', border: '1px dashed rgba(90, 143, 212, 0.6)' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(245, 247, 255, 0.6)', textTransform: 'uppercase' }}>Optional · not counted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sched-chip sched-free">Free</span>
              <span className="sched-chip sched-work">Work</span>
              <span className="sched-chip sched-heavy">Heavy work</span>
            </div>
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
                      flex: 1, minWidth: '6px', height: '100%',
                      display: 'flex', alignItems: 'flex-end', gap: '1px',
                    }}
                    title={`Week ${w.weekNum} · ${w.phase} · ${w.hours}h${isCurrent ? ' · THIS WEEK' : ''}`}
                  >
                    <div style={{
                      flex: 1,
                      height: `${(w.hours / maxHours) * 100}%`, minHeight: '6px',
                      background: isSelected ? '#5a8fd4' : phaseColor(w.phase),
                      opacity: isSelected ? 1 : (isCurrent ? 0.9 : 0.55),
                      border: isSelected
                        ? '2px solid #f5f7ff'
                        : (isCurrent ? `2px solid ${TEXAS_RED}` : 'none'),
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{
              display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px',
              paddingTop: '20px', borderTop: '1px solid rgba(90, 143, 212, 0.15)',
            }}>
              {['BASE', 'BUILD', 'PEAK', 'TAPER', 'RACE WEEK', 'RECOVERY'].map(p => (
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
            { label: 'Total Weeks', value: plan.length, isText: false },
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
