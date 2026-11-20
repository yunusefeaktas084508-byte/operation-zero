window.OZ_WEAPONS = (function () {
  const SKINS = {
    default: { id: 'default', name: 'Standard Tactical', rarity: 'Common', price: 0, primary: '#23272e', secondary: '#121417', accent: '#4a5568', emissive: '#000000', emissiveIntensity: 0.0, metalness: 0.78, roughness: 0.35, pattern: 'solid', tracerColor: 0xffe066 },
    dragon_flame: { id: 'dragon_flame', name: 'Dragon Flame', rarity: 'Mythic', price: 4500, primary: '#8b0000', secondary: '#1a0505', accent: '#ff6a00', emissive: '#ff4500', emissiveIntensity: 0.65, metalness: 0.85, roughness: 0.22, pattern: 'scales', tracerColor: 0xff5500 },
    cyber_neon: { id: 'cyber_neon', name: 'Cyber Neon', rarity: 'Legendary', price: 3200, primary: '#0d0221', secondary: '#19053a', accent: '#00f5d4', emissive: '#ff007f', emissiveIntensity: 0.75, metalness: 0.6, roughness: 0.2, pattern: 'circuit', tracerColor: 0x00f5d4 },
    galaxy: { id: 'galaxy', name: 'Galaxy Nebula', rarity: 'Mythic', price: 4800, primary: '#140b2e', secondary: '#090418', accent: '#9d4edd', emissive: '#5a189a', emissiveIntensity: 0.55, metalness: 0.9, roughness: 0.15, pattern: 'stars', tracerColor: 0xc77dff },
    crimson_reaper: { id: 'crimson_reaper', name: 'Crimson Reaper', rarity: 'Legendary', price: 3000, primary: '#111111', secondary: '#2b0909', accent: '#e63946', emissive: '#d90429', emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.28, pattern: 'slashes', tracerColor: 0xff1e38 },
    frozen_crystal: { id: 'frozen_crystal', name: 'Frozen Crystal', rarity: 'Epic', price: 2100, primary: '#48cae4', secondary: '#023e8a', accent: '#caf0f8', emissive: '#00b4d8', emissiveIntensity: 0.45, metalness: 0.35, roughness: 0.12, pattern: 'crystal', tracerColor: 0x90e0ef },
    golden_phantom: { id: 'golden_phantom', name: 'Golden Phantom', rarity: 'Legendary', price: 3500, primary: '#d4af37', secondary: '#1c1917', accent: '#fef08a', emissive: '#ca8a04', emissiveIntensity: 0.3, metalness: 0.96, roughness: 0.14, pattern: 'filigree', tracerColor: 0xfde047 },
    toxic_venom: { id: 'toxic_venom', name: 'Toxic Venom', rarity: 'Epic', price: 1950, primary: '#142615', secondary: '#0a120a', accent: '#70e000', emissive: '#38b000', emissiveIntensity: 0.6, metalness: 0.65, roughness: 0.3, pattern: 'hazard', tracerColor: 0x70e000 },
    electric_storm: { id: 'electric_storm', name: 'Electric Storm', rarity: 'Epic', price: 2200, primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.7, metalness: 0.82, roughness: 0.2, pattern: 'lightning', tracerColor: 0x38bdf8 },
    shadow_assassin: { id: 'shadow_assassin', name: 'Shadow Assassin', rarity: 'Rare', price: 1200, primary: '#18181b', secondary: '#09090b', accent: '#71717a', emissive: '#27272a', emissiveIntensity: 0.15, metalness: 0.88, roughness: 0.42, pattern: 'carbon', tracerColor: 0xa1a1aa },
    diamond_luxury: { id: 'diamond_luxury', name: 'Diamond Luxury', rarity: 'Mythic', price: 5000, primary: '#e2e8f0', secondary: '#94a3b8', accent: '#ffffff', emissive: '#bae6fd', emissiveIntensity: 0.4, metalness: 0.98, roughness: 0.08, pattern: 'crystal', tracerColor: 0xffffff }
  };

  const WEAPONS = {
    vandal_x: { id: 'vandal_x', name: 'VANDAL-X', category: 'Assault Rifles', slot: 1, price: 2900, damage: 40, headMult: 3.5, fireRate: 105, reloadTime: 2100, magSize: 25, reserveAmmo: 75, auto: true, recoilY: 0.034, recoilX: 0.016, spread: 0.008, adsFov: 52, range: 160, modelType: 'rifle_heavy', soundProfile: 'rifle_loud', modelUrl: 'models/vandal_x.glb', modelScale: 0.35 },
    phantom_z: { id: 'phantom_z', name: 'PHANTOM-Z', category: 'Assault Rifles', slot: 1, price: 2900, damage: 35, headMult: 3.2, fireRate: 90, reloadTime: 1950, magSize: 30, reserveAmmo: 90, auto: true, recoilY: 0.025, recoilX: 0.012, spread: 0.006, adsFov: 55, range: 150, modelType: 'rifle_silenced', soundProfile: 'rifle_suppressed', modelUrl: 'models/phantom_z.glb', modelScale: 0.35 },
    operator_9: { id: 'operator_9', name: 'OPERATOR-9', category: 'Sniper Rifles', slot: 1, price: 4700, damage: 150, headMult: 2.5, fireRate: 1300, reloadTime: 2900, magSize: 5, reserveAmmo: 15, auto: false, recoilY: 0.095, recoilX: 0.025, spread: 0.001, adsFov: 24, isSniper: true, range: 300, modelType: 'sniper', soundProfile: 'sniper_boom', modelUrl: 'models/operator_9.glb', modelScale: 0.42 },
    spectre_v: { id: 'spectre_v', name: 'SPECTRE-V', category: 'SMG', slot: 1, price: 1600, damage: 26, headMult: 2.5, fireRate: 72, reloadTime: 1650, magSize: 30, reserveAmmo: 90, auto: true, recoilY: 0.018, recoilX: 0.014, spread: 0.014, adsFov: 60, range: 95, modelType: 'smg', soundProfile: 'smg_rapid', modelUrl: 'models/spectre_v.glb', modelScale: 0.32 },
    breacher_12: { id: 'breacher_12', name: 'BREACHER-12', category: 'Shotguns', slot: 1, price: 1850, damage: 22, headMult: 2.0, fireRate: 750, reloadTime: 2400, magSize: 8, reserveAmmo: 32, auto: false, pellets: 7, recoilY: 0.075, recoilX: 0.03, spread: 0.055, adsFov: 62, range: 38, modelType: 'shotgun', soundProfile: 'shotgun_blast', modelUrl: 'models/breacher_12.glb', modelScale: 0.35 },
    odin_hmg: { id: 'odin_hmg', name: 'ODIN-HMG', category: 'Heavy Weapons', slot: 1, price: 3200, damage: 32, headMult: 2.4, fireRate: 80, reloadTime: 3200, magSize: 100, reserveAmmo: 200, auto: true, recoilY: 0.028, recoilX: 0.022, spread: 0.015, adsFov: 56, range: 130, modelType: 'heavy', soundProfile: 'heavy_thump', modelUrl: 'models/odin_hmg.glb', modelScale: 0.4 },
    sheriff_50: { id: 'sheriff_50', name: 'SHERIFF .50', category: 'Pistols', slot: 2, price: 800, damage: 55, headMult: 2.8, fireRate: 380, reloadTime: 1700, magSize: 6, reserveAmmo: 24, auto: false, recoilY: 0.055, recoilX: 0.015, spread: 0.005, adsFov: 62, range: 120, modelType: 'revolver', soundProfile: 'pistol_heavy', modelUrl: 'models/sheriff_50.glb', modelScale: 0.25 },
    glock_18: { id: 'glock_18', name: 'VIPER-18', category: 'Pistols', slot: 2, price: 400, damage: 24, headMult: 2.5, fireRate: 160, reloadTime: 1400, magSize: 18, reserveAmmo: 54, auto: false, recoilY: 0.022, recoilX: 0.01, spread: 0.01, adsFov: 64, range: 90, modelType: 'pistol', soundProfile: 'pistol_light', modelUrl: 'models/glock_18.glb', modelScale: 0.24 },
    karambit_0: { id: 'karambit_0', name: 'ZERO KARAMBIT', category: 'Melee Weapons', slot: 3, price: 0, damage: 75, headMult: 2.0, fireRate: 450, reloadTime: 0, magSize: 1, reserveAmmo: 1, auto: false, isMelee: true, recoilY: 0.01, recoilX: 0.01, spread: 0, adsFov: 75, range: 4.5, modelType: 'knife', soundProfile: 'knife_slash', modelUrl: 'models/karambit_0.glb', modelScale: 0.28 }
  };

  const textureCache = {};
  function createSkinTexture(skinId) {
    if (textureCache[skinId]) return textureCache[skinId];
    const skin = SKINS[skinId] || SKINS.default;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = skin.primary;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = skin.accent;
    ctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(512 - i, 512);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    textureCache[skinId] = tex;
    return tex;
  }

  let gltfLoader = null;
  const gltfCache = {};

  function getGLTFLoader() {
    if (gltfLoader) return gltfLoader;
    if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function') {
      gltfLoader = new THREE.GLTFLoader();
    }
    return gltfLoader;
  }

  function applySkinToGltf(object, skin, tex) {
    const skinMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xffffff,
      metalness: skin.metalness,
      roughness: skin.roughness,
      emissive: new THREE.Color(skin.emissive),
      emissiveIntensity: skin.emissiveIntensity
    });
    object.traverse((child) => {
      if (child.isMesh && child.name !== 'muzzleFlash') {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = skinMat;
      }
    });
  }

  function buildProceduralWeaponMesh(w, skin, tex) {
    const group = new THREE.Group();

    const primaryMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xffffff,
      metalness: skin.metalness,
      roughness: skin.roughness,
      emissive: new THREE.Color(skin.emissive),
      emissiveIntensity: skin.emissiveIntensity
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: skin.secondary, metalness: 0.85, roughness: 0.3 });
    const glowMat = new THREE.MeshStandardMaterial({ color: skin.accent, emissive: new THREE.Color(skin.accent), emissiveIntensity: 0.9 });

    if (w.modelType === 'knife') {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.16), darkMat);
      handle.position.set(0, -0.02, 0.04);
      group.add(handle);
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.22, 4), primaryMat);
      blade.rotation.x = -Math.PI / 2 + 0.28;
      blade.position.set(0, 0.01, -0.11);
      group.add(blade);
      return group;
    }

    const isPistol = (w.modelType === 'pistol' || w.modelType === 'revolver');
    const bodyLen = isPistol ? 0.28 : (w.modelType === 'sniper' ? 0.72 : (w.modelType === 'smg' ? 0.42 : 0.56));
    const bodyH = isPistol ? 0.065 : 0.085;
    const bodyW = w.modelType === 'heavy' ? 0.085 : 0.055;

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyLen), primaryMat);
    receiver.castShadow = true;
    group.add(receiver);

    const strip = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.004, 0.012, bodyLen * 0.75), glowMat);
    strip.position.set(0, 0.01, 0);
    group.add(strip);

    const barrelLen = isPistol ? 0.12 : (w.modelType === 'sniper' ? 0.48 : 0.28);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, barrelLen, 12), darkMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.012, -bodyLen * 0.5 - barrelLen * 0.5);
    group.add(barrel);

    const muzzleFlash = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.22, 8),
      new THREE.MeshBasicMaterial({ color: 0xffdd55, transparent: true, opacity: 0.0 })
    );
    muzzleFlash.rotation.x = -Math.PI / 2;
    muzzleFlash.position.set(0, 0.012, -bodyLen * 0.5 - barrelLen - 0.12);
    muzzleFlash.name = 'muzzleFlash';
    group.add(muzzleFlash);

    return group;
  }

  function buildWeaponMesh(weaponId, skinId) {
    const w = WEAPONS[weaponId] || WEAPONS.vandal_x;
    const skin = SKINS[skinId] || SKINS.default;
    const tex = createSkinTexture(skin.id);
    const wrapper = new THREE.Group();

    const fallback = buildProceduralWeaponMesh(w, skin, tex);
    fallback.name = 'proceduralFallback';
    wrapper.add(fallback);

    const loader = getGLTFLoader();
    if (!loader || !w.modelUrl) return wrapper;

    const attachGltf = (sceneTemplate) => {
      try {
        const model = sceneTemplate.clone(true);
        const s = w.modelScale || 0.35;
        model.scale.set(s, s, s);
        model.rotation.y = Math.PI;
        applySkinToGltf(model, skin, tex);

        const muzzleFlash = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.22, 8),
          new THREE.MeshBasicMaterial({ color: 0xffdd55, transparent: true, opacity: 0.0 })
        );
        muzzleFlash.rotation.x = -Math.PI / 2;
        muzzleFlash.position.set(0, 0.02, -0.45);
        muzzleFlash.name = 'muzzleFlash';
        model.add(muzzleFlash);

        const prev = wrapper.getObjectByName('proceduralFallback');
        if (prev) wrapper.remove(prev);

        wrapper.add(model);
        console.log('GLB takıldı:', w.modelUrl);
      } catch (e) {
        console.warn('GLB attach hatası:', w.modelUrl, e);
      }
    };

    if (gltfCache[w.modelUrl]) {
      attachGltf(gltfCache[w.modelUrl]);
      return wrapper;
    }

    loader.load(
      w.modelUrl,
      (gltf) => {
        if (gltf && gltf.scene) {
          gltfCache[w.modelUrl] = gltf.scene;
          attachGltf(gltf.scene);
        }
      },
      undefined,
      (err) => {
        console.warn('GLB yüklenemedi:', w.modelUrl, err);
      }
    );

    return wrapper;
  }

  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playWeaponSound(profile, volume = 0.45) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = profile === 'sniper_boom' ? 0.42 : 0.2;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(gain).connect(ctx.destination);
    noise.start(now);
  }

  function playSoundEffect(type, volume = 0.4) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(type === 'headshot' ? 2400 : 1200, now);
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  return { SKINS, WEAPONS, buildWeaponMesh, playWeaponSound, playSoundEffect, ensureAudio };
})();