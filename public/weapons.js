(function () {
  const WEAPONS = {
    vandal_x: {
      id: 'vandal_x',
      name: 'VANDAL-X',
      category: 'ASSAULT RIFLE',
      damage: 40,
      headMult: 3.5,
      fireRate: 105,
      range: 160,
      magSize: 25,
      reserveAmmo: 75,
      reloadTime: 1800,
      recoilY: 0.022,
      recoilX: 0.016,
      adsFov: 52,
      auto: true,
      soundProfile: 'rifle',
      modelUrl: './models/vandal_x.glb',
      modelScale: 0.45,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.05, 0]
    },
    phantom_z: {
      id: 'phantom_z',
      name: 'PHANTOM-Z',
      category: 'STEALTH RIFLE',
      damage: 35,
      headMult: 3.2,
      fireRate: 90,
      range: 150,
      magSize: 30,
      reserveAmmo: 90,
      reloadTime: 1650,
      recoilY: 0.018,
      recoilX: 0.012,
      adsFov: 55,
      auto: true,
      soundProfile: 'suppressed',
      modelUrl: './models/phantom_z.glb',
      modelScale: 0.45,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.05, 0]
    },
    operator_9: {
      id: 'operator_9',
      name: 'OPERATOR-9',
      category: 'SNIPER RIFLE',
      damage: 150,
      headMult: 2.5,
      fireRate: 1300,
      range: 300,
      magSize: 5,
      reserveAmmo: 15,
      reloadTime: 2400,
      recoilY: 0.065,
      recoilX: 0.02,
      adsFov: 22,
      auto: false,
      isSniper: true,
      soundProfile: 'sniper',
      modelUrl: './models/operator_9.glb',
      modelScale: 0.52,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.06, 0]
    },
    spectre_v: {
      id: 'spectre_v',
      name: 'SPECTRE-V',
      category: 'SMG',
      damage: 26,
      headMult: 2.5,
      fireRate: 72,
      range: 95,
      magSize: 30,
      reserveAmmo: 90,
      reloadTime: 1400,
      recoilY: 0.015,
      recoilX: 0.015,
      adsFov: 58,
      auto: true,
      soundProfile: 'smg',
      modelUrl: './models/spectre_v.glb',
      modelScale: 0.42,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.04, 0]
    },
    breacher_12: {
      id: 'breacher_12',
      name: 'BREACHER-12',
      category: 'SHOTGUN',
      damage: 22,
      headMult: 2.0,
      fireRate: 750,
      range: 38,
      magSize: 8,
      reserveAmmo: 32,
      reloadTime: 2000,
      recoilY: 0.055,
      recoilX: 0.03,
      adsFov: 62,
      auto: false,
      pellets: 7,
      soundProfile: 'shotgun',
      modelUrl: './models/breacher_12.glb',
      modelScale: 0.45,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.05, 0]
    },
    sheriff_50: {
      id: 'sheriff_50',
      name: 'SHERIFF .50',
      category: 'HEAVY PISTOL',
      damage: 55,
      headMult: 2.8,
      fireRate: 380,
      range: 120,
      magSize: 6,
      reserveAmmo: 24,
      reloadTime: 1500,
      recoilY: 0.035,
      recoilX: 0.014,
      adsFov: 60,
      auto: false,
      soundProfile: 'pistol_heavy',
      modelUrl: './models/sheriff_50.glb',
      modelScale: 0.34,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.03, 0]
    },
    glock_18: {
      id: 'glock_18',
      name: 'ZERO-9 PISTOL',
      category: 'SIDEARM',
      damage: 24,
      headMult: 2.5,
      fireRate: 160,
      range: 90,
      magSize: 18,
      reserveAmmo: 54,
      reloadTime: 1200,
      recoilY: 0.014,
      recoilX: 0.01,
      adsFov: 64,
      auto: false,
      soundProfile: 'pistol',
      modelUrl: './models/glock_18.glb',
      modelScale: 0.32,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.03, 0]
    },
    odin_hmg: {
      id: 'odin_hmg',
      name: 'ODIN HMG',
      category: 'HEAVY MG',
      damage: 32,
      headMult: 2.4,
      fireRate: 80,
      range: 130,
      magSize: 100,
      reserveAmmo: 200,
      reloadTime: 2800,
      recoilY: 0.025,
      recoilX: 0.022,
      adsFov: 56,
      auto: true,
      soundProfile: 'heavy',
      modelUrl: './models/odin_hmg.glb',
      modelScale: 0.5,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.06, 0]
    },
    karambit_0: {
      id: 'karambit_0',
      name: 'KARAMBIT-0',
      category: 'MELEE',
      damage: 75,
      headMult: 2.0,
      fireRate: 450,
      range: 4.5,
      magSize: 1,
      reserveAmmo: 1,
      reloadTime: 500,
      recoilY: 0.01,
      recoilX: 0.01,
      adsFov: 75,
      auto: false,
      isMelee: true,
      soundProfile: 'knife',
      modelUrl: './models/karambit_0.glb',
      modelScale: 0.36,
      modelRot: [0, Math.PI, 0],
      modelPos: [0, -0.04, 0]
    }
  };

  const SKINS = {
    default: { id: 'default', name: 'STANDARD CARBON', rarity: 'COMMON', price: 0, color: 0x2b303a, emissive: 0x000000, metalness: 0.65, roughness: 0.35 },
    crimson_reaper: { id: 'crimson_reaper', name: 'CRIMSON REAPER', rarity: 'RARE', price: 1500, color: 0xe11d48, emissive: 0x3b0712, metalness: 0.75, roughness: 0.25 },
    cyber_neon: { id: 'cyber_neon', name: 'CYBER NEON', rarity: 'EPIC', price: 3000, color: 0x00f5d4, emissive: 0x005f56, metalness: 0.8, roughness: 0.2 },
    solar_flare: { id: 'solar_flare', name: 'SOLAR FLARE', rarity: 'LEGENDARY', price: 5000, color: 0xf59e0b, emissive: 0x78350f, metalness: 0.9, roughness: 0.18 }
  };

  let gltfLoader = null;
  const modelCache = {};

  function ensureGLTFLoader() {
    if (gltfLoader) return gltfLoader;
    if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function') {
      gltfLoader = new THREE.GLTFLoader();
    }
    return gltfLoader;
  }

  function applySkinToObject(obj, skin) {
    obj.traverse(child => {
      if (child.isMesh && child.name !== 'muzzleFlash' && child.material) {
        const mat = child.material.clone ? child.material.clone() : child.material;
        if (skin.id !== 'default' && mat.color) {
          mat.color.setHex(skin.color);
          if (mat.emissive) mat.emissive.setHex(skin.emissive);
          if (typeof mat.metalness === 'number') mat.metalness = skin.metalness;
          if (typeof mat.roughness === 'number') mat.roughness = skin.roughness;
        }
        child.material = mat;
      }
    });
  }

  function buildFallbackWeaponMesh(weaponId, skinId) {
    const wDef = WEAPONS[weaponId] || WEAPONS.vandal_x;
    const skin = SKINS[skinId] || SKINS.default;
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: skin.color,
      emissive: skin.emissive,
      metalness: skin.metalness,
      roughness: skin.roughness
    });

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.55), bodyMat);
    group.add(receiver);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 10), bodyMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.4);
    group.add(barrel);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.09), bodyMat);
    mag.position.set(0, -0.12, -0.06);
    mag.rotation.x = 0.18;
    group.add(mag);

    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0
    });
    const muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flashMat);
    muzzleFlash.name = 'muzzleFlash';
    muzzleFlash.position.set(0, 0.02, -0.58);
    group.add(muzzleFlash);

    return group;
  }

  function buildWeaponMesh(weaponId, skinId) {
    const wDef = WEAPONS[weaponId] || WEAPONS.vandal_x;
    const skin = SKINS[skinId] || SKINS.default;
    const wrapper = new THREE.Group();

    const fallback = buildFallbackWeaponMesh(weaponId, skinId);
    fallback.name = 'fallbackWeapon';
    wrapper.add(fallback);

    const loader = ensureGLTFLoader();
    if (!loader || !wDef.modelUrl) {
      return wrapper;
    }

    const attachLoadedModel = (gltfScene) => {
      const fb = wrapper.getObjectByName('fallbackWeapon');
      if (fb) wrapper.remove(fb);

      const model = gltfScene.clone(true);
      const sc = wDef.modelScale || 0.45;
      model.scale.set(sc, sc, sc);
      const pos = wDef.modelPos || [0, -0.05, 0];
      model.position.set(pos[0], pos[1], pos[2]);
      const rot = wDef.modelRot || [0, Math.PI, 0];
      model.rotation.set(rot[0], rot[1], rot[2]);
      applySkinToObject(model, skin);

      const flashMat = new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0
      });
      const muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flashMat);
      muzzleFlash.name = 'muzzleFlash';
      muzzleFlash.position.set(0, 0.02, -0.58);
      model.add(muzzleFlash);

      wrapper.add(model);
    };

    if (modelCache[wDef.modelUrl]) {
      attachLoadedModel(modelCache[wDef.modelUrl]);
      return wrapper;
    }

    loader.load(
      wDef.modelUrl,
      (gltf) => {
        if (gltf && gltf.scene) {
          modelCache[wDef.modelUrl] = gltf.scene;
          attachLoadedModel(gltf.scene);
        }
      },
      undefined,
      () => {
        // .glb dosyası henüz yoksa yedek model sorunsuz kalır
      }
    );

    return wrapper;
  }

  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playWeaponSound(profile, volume = 0.5) {
    ensureAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    const vol = Math.max(0.01, Math.min(1, Number(volume) || 0.5)) * 0.25;

    if (profile === 'sniper') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.28);
    } else if (profile === 'suppressed') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);
    } else if (profile === 'shotgun') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.11);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  function playSoundEffect(type, volume = 0.5) {
    ensureAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    osc.type = type === 'headshot' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(type === 'headshot' ? 1180 : 720, now);
    osc.frequency.exponentialRampToValueAtTime(type === 'headshot' ? 520 : 280, now + 0.07);
    gain.gain.setValueAtTime(Math.max(0.02, volume * 0.25), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  window.OZ_WEAPONS = {
    WEAPONS,
    SKINS,
    buildWeaponMesh,
    ensureAudio,
    playWeaponSound,
    playSoundEffect
  };
})();