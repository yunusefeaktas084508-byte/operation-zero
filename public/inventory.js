window.OZ_INVENTORY = (function () {
  const STORAGE_KEY = 'operation_zero_save_v1';
  const defaultState = {
    playerName: 'Agent_' + Math.floor(1000 + Math.random() * 9000),
    credits: 12500,
    xp: 1450,
    level: 4,
    kills: 0,
    deaths: 0,
    wins: 0,
    ownedSkins: ['default', 'shadow_assassin', 'cyber_neon'],
    equippedSkins: { vandal_x: 'cyber_neon', phantom_z: 'default', operator_9: 'default', spectre_v: 'shadow_assassin', breacher_12: 'default', odin_hmg: 'default', sheriff_50: 'default', glock_18: 'default', karambit_0: 'cyber_neon' },
    loadout: { primary: 'vandal_x', secondary: 'sheriff_50', melee: 'karambit_0' },
    crosshair: { color: '#00f5d4', size: 10, thickness: 2, gap: 4, dot: true },
    settings: { graphics: 'High', sensitivity: 1.0, volume: 0.5, fov: 75 }
  };

  let state = loadState();
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultState, ...JSON.parse(raw) } : JSON.parse(JSON.stringify(defaultState));
    } catch (e) { return JSON.parse(JSON.stringify(defaultState)); }
  }
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }
  function getState() { return state; }
  function setPlayerName(name) { const c = String(name || '').trim().slice(0, 18); if (c) { state.playerName = c; saveState(); } }
  function addCredits(amt) { state.credits += Math.max(0, Math.round(amt)); saveState(); return state.credits; }
  function recordMatchStats(k, d, won) { state.kills += k; state.deaths += d; if (won) state.wins += 1; state.credits += k * 75 + (won ? 500 : 150); saveState(); }
  function buySkin(skinId) {
    const skin = window.OZ_WEAPONS.SKINS[skinId];
    if (!skin) return { ok: false, msg: 'Skin bulunamadı.' };
    if (state.ownedSkins.includes(skinId)) return { ok: false, msg: 'Zaten sahip olduğunuz skin.' };
    if (state.credits < skin.price) return { ok: false, msg: 'Yetersiz Z-Kredi!' };
    state.credits -= skin.price;
    state.ownedSkins.push(skinId);
    saveState();
    return { ok: true, msg: `${skin.name} satın alındı!` };
  }
  function equipSkin(wId, sId) { if (!state.ownedSkins.includes(sId)) return false; state.equippedSkins[wId] = sId; saveState(); return true; }
  function setLoadoutWeapon(wId) {
    const w = window.OZ_WEAPONS.WEAPONS[wId];
    if (!w) return;
    if (w.slot === 1) state.loadout.primary = wId;
    else if (w.slot === 2) state.loadout.secondary = wId;
    else if (w.slot === 3) state.loadout.melee = wId;
    saveState();
  }
  function updateCrosshair(p) { state.crosshair = { ...state.crosshair, ...p }; saveState(); }
  function updateSettings(p) { state.settings = { ...state.settings, ...p }; saveState(); }
  function getGraphicsPreset() {
    const p = state.settings.graphics;
    if (p === 'Low') return { pixelRatio: 0.75, shadows: false, shadowMapSize: 512, pointLights: false, antialias: false };
    if (p === 'Ultra') return { pixelRatio: Math.min(window.devicePixelRatio || 1, 2), shadows: true, shadowMapSize: 2048, pointLights: true, antialias: true };
    return { pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5), shadows: true, shadowMapSize: 1024, pointLights: true, antialias: true };
  }

  return { getState, setPlayerName, addCredits, recordMatchStats, buySkin, equipSkin, setLoadoutWeapon, updateCrosshair, updateSettings, getGraphicsPreset };
})();
