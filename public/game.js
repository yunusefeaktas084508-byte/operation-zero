(function () {
  const canvas = document.getElementById('game-canvas');
  const qPreset = window.OZ_INVENTORY.getGraphicsPreset();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: qPreset.antialias });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(qPreset.pixelRatio);
  renderer.shadowMap.enabled = qPreset.shadows;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
  const weaponScene = new THREE.Scene();
  const weaponCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 10);
  weaponScene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const wLight = new THREE.DirectionalLight(0xffffff, 1.1);
  wLight.position.set(2, 4, 3);
  weaponScene.add(wLight);

  let state = {
    inGame: false,
    isOfflineBots: false,
    selectedMode: 'competitive',
    selectedWeaponForSkin: 'vandal_x',
    mapData: null,
    colliders: [],
    remotePlayers: {},
    bots: [],
    tracers: [],
    pos: new THREE.Vector3(0, 2, 0),
    vel: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    pitch: 0,
    hp: 100,
    armor: 50,
    alive: true,
    team: 'attackers',
    grounded: false,
    crouching: false,
    sprinting: false,
    ads: false,
    currentSlot: 1,
    weaponsState: {},
    reloading: false,
    lastShotTime: 0,
    weaponMesh: null,
    lobbyShowcaseMesh: null,
    keys: {},
    mouseDown: false,
    matchKills: 0,
    matchDeaths: 0,
    spikePlanted: false,
    lastNetSync: 0
  };

  function clearScene() {
    while (scene.children.length > 0) scene.remove(scene.children[0]);
    while (weaponScene.children.length > 2) weaponScene.remove(weaponScene.children[2]);
    state.remotePlayers = {};
    state.bots = [];
    state.tracers = [];
  }

  function initLobbyShowcase() {
    clearScene();
    scene.background = new THREE.Color(0x090d16);
    scene.add(new THREE.AmbientLight(0x4f46e5, 0.8));
    const spot = new THREE.SpotLight(0x00f5d4, 2.2);
    spot.position.set(2, 4, 3);
    scene.add(spot);
    updateLobbyWeaponModel();
    camera.position.set(0, 0.15, 0.4);
    camera.rotation.set(0, 0, 0);
  }

  function updateLobbyWeaponModel() {
    if (state.lobbyShowcaseMesh) scene.remove(state.lobbyShowcaseMesh);
    const inv = window.OZ_INVENTORY.getState();
    const wId = state.selectedWeaponForSkin || inv.loadout.primary;
    const sId = (inv.equippedSkins && inv.equippedSkins[wId]) || 'default';
    const mesh = window.OZ_WEAPONS.buildWeaponMesh(wId, sId);
    mesh.scale.set(2.1, 2.1, 2.1);
    mesh.position.set(0.65, -0.05, -1.8);
    scene.add(mesh);
    state.lobbyShowcaseMesh = mesh;
  }

  function createCharacterMesh(team, weaponId, skinId) {
    const group = new THREE.Group();
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.95, 0.38),
      new THREE.MeshStandardMaterial({ color: team === 'attackers' ? 0xe11d48 : 0x0284c7 })
    );
    torso.position.y = 1.05;
    torso.name = 'body';
    group.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    head.position.y = 1.75;
    head.name = 'head';
    group.add(head);

    const wMesh = window.OZ_WEAPONS.buildWeaponMesh(weaponId || 'vandal_x', skinId || 'default');
    wMesh.position.set(0.32, 1.25, -0.35);
    group.add(wMesh);

    return { group, head };
  }

  function startMatch(payload, isOffline = false) {
    state.inGame = true;
    state.isOfflineBots = isOffline;
    state.matchKills = 0;
    state.matchDeaths = 0;
    state.alive = true;
    state.hp = 100;
    state.armor = 50;
    state.spikePlanted = false;

    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    document.getElementById('pause-menu').classList.add('hidden');

    clearScene();
    const mapBuilt = window.OZ_MAPS.buildMapScene(scene, payload.map || 'neon_district', qPreset);
    state.mapData = mapBuilt.config;
    state.colliders = mapBuilt.colliders;

    const inv = window.OZ_INVENTORY.getState();
    [inv.loadout.primary, inv.loadout.secondary, inv.loadout.melee].forEach((wId, i) => {
      const wDef = window.OZ_WEAPONS.WEAPONS[wId] || window.OZ_WEAPONS.WEAPONS.vandal_x;
      state.weaponsState[i + 1] = { id: wDef.id, mag: wDef.magSize, reserve: wDef.reserveAmmo };
    });
    equipSlot(1);

    if (isOffline) {
      state.team = 'attackers';
      const sp = state.mapData.attackersSpawn;
      state.pos.set(sp.x, sp.y, sp.z);
      document.getElementById('hud-room-code').textContent = 'MOD: OFFLINE BOTS';
      spawnOfflineBots(4);
    } else {
      const me = payload.players[payload.playerId];
      state.team = me ? me.team : 'attackers';
      if (me) state.pos.set(me.x, me.y, me.z);
      document.getElementById('hud-room-code').textContent = `ODA: ${payload.roomCode}`;
      document.getElementById('pause-room-code').textContent = payload.roomCode;
      Object.values(payload.players).forEach((p) => {
        if (p.id !== payload.playerId) addOrUpdateRemotePlayer(p);
      });
    }

    applyCrosshairUI();
    updateHUD();
    requestPointerLock();
  }

  function spawnOfflineBots(count) {
    const defSp = state.mapData.defendersSpawn;
    for (let i = 0; i < count; i++) {
      const char = createCharacterMesh('defenders', 'vandal_x', 'crimson_reaper');
      char.group.position.set(defSp.x + (Math.random() - 0.5) * 14, 0, defSp.z + (Math.random() - 0.5) * 14);
      scene.add(char.group);
      state.bots.push({ id: 'bot_' + i, name: `BOT_${i + 1}`, hp: 100, alive: true, mesh: char.group, nextShot: 0 });
    }
  }

  function addOrUpdateRemotePlayer(p) {
    if (!state.remotePlayers[p.id]) {
      const char = createCharacterMesh(p.team, p.weapon, p.skin);
      scene.add(char.group);
      state.remotePlayers[p.id] = { mesh: char.group, data: p };
    }
    const rp = state.remotePlayers[p.id];
    rp.data = { ...rp.data, ...p };
    const isAlive = p.alive !== false;
    rp.mesh.visible = isAlive;
    rp.mesh.children.forEach((c) => {
      c.userData.playerId = p.id;
    });
    const baseY = (Number.isFinite(Number(p.y)) ? Number(p.y) : 2) - 2;
    rp.mesh.position.set(Number(p.x) || 0, Math.max(0, baseY), Number(p.z) || 0);
    rp.mesh.rotation.y = Number(p.rotY) || 0;
    rp.mesh.scale.y = p.crouching ? 0.65 : 1.0;
  }

  function equipSlot(slot) {
    if (!state.weaponsState[slot] || state.reloading) return;
    state.currentSlot = slot;
    const wId = state.weaponsState[slot].id;
    const skinId = window.OZ_INVENTORY.getState().equippedSkins[wId] || 'default';
    if (state.weaponMesh) weaponScene.remove(state.weaponMesh);
    state.weaponMesh = window.OZ_WEAPONS.buildWeaponMesh(wId, skinId);
    state.weaponMesh.position.set(0.24, -0.22, -0.45);
    weaponScene.add(state.weaponMesh);
    updateHUD();
  }

  function tryShoot() {
    if (!state.inGame || !state.alive || state.reloading) return;
    const wSlot = state.weaponsState[state.currentSlot];
    const wDef = window.OZ_WEAPONS.WEAPONS[wSlot.id] || window.OZ_WEAPONS.WEAPONS.vandal_x;
    const now = performance.now();
    if (now - state.lastShotTime < wDef.fireRate) return;
    if (!wDef.isMelee && wSlot.mag <= 0) {
      startReload();
      return;
    }

    state.lastShotTime = now;
    if (!wDef.isMelee) wSlot.mag--;
    window.OZ_WEAPONS.playWeaponSound(wDef.soundProfile, window.OZ_INVENTORY.getState().settings.volume);

    if (state.weaponMesh) {
      state.weaponMesh.position.z += 0.06;
      const mf = state.weaponMesh.getObjectByName('muzzleFlash');
      if (mf) {
        mf.material.opacity = 0.95;
        setTimeout(() => {
          mf.material.opacity = 0;
        }, 45);
      }
    }

    state.pitch += wDef.recoilY * (state.ads ? 0.65 : 1.0);
    state.yaw += (Math.random() - 0.5) * wDef.recoilX;

    const raycaster = new THREE.Raycaster();
    raycaster.far = wDef.range;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const wallMeshes = state.colliders.map((c) => c.mesh);
    const targetMeshes = [];
    Object.values(state.remotePlayers).forEach((rp) => {
      if (rp.data.alive !== false) {
        rp.mesh.traverse((c) => {
          if (c.isMesh) {
            c.userData.playerId = rp.data.id;
            targetMeshes.push(c);
          }
        });
      }
    });
    state.bots.forEach((b) => {
      if (b.alive) {
        b.mesh.traverse((c) => {
          if (c.isMesh) {
            c.userData.botId = b.id;
            targetMeshes.push(c);
          }
        });
      }
    });

    const hits = raycaster.intersectObjects([...wallMeshes, ...targetMeshes], false);
    let hitPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(60));
    let hitTargetId = null;
    let isHeadshot = false;

    if (hits.length > 0) {
      hitPoint = hits[0].point;
      isHeadshot = hits[0].object.name === 'head';
      if (hits[0].object.userData.playerId) {
        hitTargetId = hits[0].object.userData.playerId;
        showHitmarker(isHeadshot);
      } else if (hits[0].object.userData.botId) {
        const bot = state.bots.find((b) => b.id === hits[0].object.userData.botId);
        if (bot && bot.alive) {
          bot.hp -= wDef.damage * (isHeadshot ? wDef.headMult : 1);
          showHitmarker(isHeadshot);
          if (bot.hp <= 0) {
            bot.alive = false;
            bot.mesh.visible = false;
            state.matchKills++;
            addKillFeed(window.OZ_INVENTORY.getState().playerName, bot.name, wDef.name, isHeadshot);
            setTimeout(() => {
              bot.hp = 100;
              bot.alive = true;
              bot.mesh.visible = true;
            }, 3000);
          }
        }
      }
    }

    if (!wDef.isMelee) spawnTracer(camera.position.clone().add(new THREE.Vector3(0, -0.15, 0)), hitPoint, 0x00f5d4);

    if (!state.isOfflineBots) {
      window.OZ_NET.sendShoot({
        weapon: wSlot.id,
        origin: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        hitPoint: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
        targetId: hitTargetId,
        headshot: isHeadshot
      });
    }
    updateHUD();
  }

  function spawnTracer(start, end, colorHex) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([start, end]),
      new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 })
    );
    scene.add(line);
    state.tracers.push({ line, life: 0.09 });
  }

  function startReload() {
    const wSlot = state.weaponsState[state.currentSlot];
    const wDef = window.OZ_WEAPONS.WEAPONS[wSlot.id] || window.OZ_WEAPONS.WEAPONS.vandal_x;
    if (state.reloading || wDef.isMelee || wSlot.mag >= wDef.magSize || wSlot.reserve <= 0) return;
    state.reloading = true;
    document.getElementById('hud-ammo-mag').textContent = 'RLD';
    setTimeout(() => {
      const take = Math.min(wDef.magSize - wSlot.mag, wSlot.reserve);
      wSlot.mag += take;
      wSlot.reserve -= take;
      state.reloading = false;
      updateHUD();
    }, wDef.reloadTime);
  }

  function showHitmarker(hs) {
    const hm = document.getElementById('hitmarker');
    hm.style.color = hs ? '#fbbf24' : '#ff4655';
    hm.classList.remove('hidden');
    window.OZ_WEAPONS.playSoundEffect(hs ? 'headshot' : 'hitmarker', 0.5);
    setTimeout(() => hm.classList.add('hidden'), 110);
  }

  function addKillFeed(k, v, w, hs) {
    const kf = document.getElementById('kill-feed');
    const div = document.createElement('div');
    div.className = 'kf-entry';
    div.textContent = `${k} [${w}${hs ? ' HS' : ''}] ${v}`;
    kf.prepend(div);
    setTimeout(() => div.remove(), 4000);
  }

  function checkCollision(nx, ny, nz) {
    const r = 0.42;
    for (const c of state.colliders) {
      if (nx + r > c.minX && nx - r < c.maxX && nz + r > c.minZ && nz - r < c.maxZ && ny - 1.8 < c.maxY && ny + 0.2 > c.minY) {
        return true;
      }
    }
    return false;
  }

  function updatePlayerPhysics(dt) {
    if (!state.inGame) return;
    if (!state.alive) {
      camera.position.copy(state.pos);
      camera.quaternion.setFromEuler(new THREE.Euler(state.pitch, state.yaw, 0, 'YXZ'));
      return;
    }
    const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    const moveDir = new THREE.Vector3();
    if (state.keys['KeyW']) moveDir.add(forward);
    if (state.keys['KeyS']) moveDir.sub(forward);
    if (state.keys['KeyD']) moveDir.add(right);
    if (state.keys['KeyA']) moveDir.sub(right);
    if (moveDir.lengthSq() > 0) moveDir.normalize();

    state.crouching = !!state.keys['ControlLeft'];
    state.sprinting = !!state.keys['ShiftLeft'] && !state.crouching && !state.ads;
    const speed = state.crouching ? 4.5 : (state.sprinting ? 10.5 : 7.4);

    const nx = state.pos.x + moveDir.x * speed * dt;
    const nz = state.pos.z + moveDir.z * speed * dt;
    if (!checkCollision(nx, state.pos.y, state.pos.z)) state.pos.x = nx;
    if (!checkCollision(state.pos.x, state.pos.y, nz)) state.pos.z = nz;

    if (state.keys['Space'] && state.grounded) {
      state.vel.y = 7.6;
      state.grounded = false;
    }
    state.vel.y -= 20.0 * dt;
    state.pos.y += state.vel.y * dt;

    const eyeH = state.crouching ? 1.25 : 2.0;
    if (state.pos.y <= eyeH) {
      state.pos.y = eyeH;
      state.vel.y = 0;
      state.grounded = true;
    }

    camera.position.copy(state.pos);
    camera.quaternion.setFromEuler(new THREE.Euler(state.pitch, state.yaw, 0, 'YXZ'));

    const wSlot = state.weaponsState[state.currentSlot];
    const wDef = (wSlot && window.OZ_WEAPONS.WEAPONS[wSlot.id]) || window.OZ_WEAPONS.WEAPONS.vandal_x;
    const targetFov = state.ads ? wDef.adsFov : window.OZ_INVENTORY.getState().settings.fov;
    camera.fov += (targetFov - camera.fov) * 14 * dt;
    camera.updateProjectionMatrix();

    document.getElementById('sniper-scope').classList.toggle('hidden', !(state.ads && wDef.isSniper));
    if (state.weaponMesh) {
      state.weaponMesh.visible = !(state.ads && wDef.isSniper);
      state.weaponMesh.position.z += (-0.45 - state.weaponMesh.position.z) * 12 * dt;
    }

    if (state.mouseDown && wDef.auto) tryShoot();

    const now = performance.now();
    if (!state.isOfflineBots && now - state.lastNetSync > 33) {
      state.lastNetSync = now;
      const wId = wDef.id;
      window.OZ_NET.sendMove({
        x: state.pos.x,
        y: state.pos.y,
        z: state.pos.z,
        rotY: state.yaw,
        rotX: state.pitch,
        crouching: state.crouching,
        weapon: wId,
        skin: window.OZ_INVENTORY.getState().equippedSkins[wId]
      });
    }
  }

  function drawMinimap() {
    const ctx = document.getElementById('minimap-canvas').getContext('2d');
    ctx.clearRect(0, 0, 160, 160);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    state.colliders.forEach((c) => {
      ctx.fillRect(
        80 + (c.minX - state.pos.x) * 1.6,
        80 + (c.minZ - state.pos.z) * 1.6,
        (c.maxX - c.minX) * 1.6,
        (c.maxZ - c.minZ) * 1.6
      );
    });
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(80, 80, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateHUD() {
    document.getElementById('hud-hp').textContent = state.hp;
    document.getElementById('hud-armor').textContent = state.armor;
    const wSlot = state.weaponsState[state.currentSlot];
    if (wSlot) {
      const wDef = window.OZ_WEAPONS.WEAPONS[wSlot.id] || window.OZ_WEAPONS.WEAPONS.vandal_x;
      const skinId = window.OZ_INVENTORY.getState().equippedSkins[wDef.id] || 'default';
      const sk = window.OZ_WEAPONS.SKINS[skinId] || { name: skinId };
      document.getElementById('hud-weapon-name').textContent = wDef.name;
      document.getElementById('hud-skin-name').textContent = sk.name;
      document.getElementById('hud-ammo-mag').textContent = wDef.isMelee ? '∞' : wSlot.mag;
      document.getElementById('hud-ammo-res').textContent = wDef.isMelee ? '∞' : wSlot.reserve;
    }
  }

  function applyCrosshairUI() {
    const ch = window.OZ_INVENTORY.getState().crosshair;
    const lines = document.querySelectorAll('#crosshair-container .ch-line');
    lines.forEach((l) => {
      l.style.background = ch.color;
    });
    document.querySelector('#crosshair-container .ch-dot').style.background = ch.color;
    lines[0].style.cssText = `background:${ch.color};width:${ch.thickness}px;height:${ch.size}px;left:${-ch.thickness / 2}px;top:${-ch.gap - ch.size}px;`;
    lines[1].style.cssText = `background:${ch.color};width:${ch.thickness}px;height:${ch.size}px;left:${-ch.thickness / 2}px;top:${ch.gap}px;`;
    lines[2].style.cssText = `background:${ch.color};height:${ch.thickness}px;width:${ch.size}px;top:${-ch.thickness / 2}px;left:${-ch.gap - ch.size}px;`;
    lines[3].style.cssText = `background:${ch.color};height:${ch.thickness}px;width:${ch.size}px;top:${-ch.thickness / 2}px;left:${ch.gap}px;`;
  }

  let lastFrame = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (!state.inGame) {
      if (state.lobbyShowcaseMesh) state.lobbyShowcaseMesh.rotation.y += dt * 0.65;
      renderer.render(scene, camera);
      return;
    }
    updatePlayerPhysics(dt);
    drawMinimap();
    for (let i = state.tracers.length - 1; i >= 0; i--) {
      state.tracers[i].life -= dt;
      if (state.tracers[i].life <= 0) {
        scene.remove(state.tracers[i].line);
        state.tracers.splice(i, 1);
      }
    }
    renderer.autoClear = true;
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(weaponScene, weaponCamera);
  }

  function requestPointerLock() {
    if (canvas.requestPointerLock) canvas.requestPointerLock();
  }

  canvas.addEventListener('click', () => {
    window.OZ_WEAPONS.ensureAudio();
    if (state.inGame && document.pointerLockElement !== canvas) requestPointerLock();
  });

  document.addEventListener('mousemove', (e) => {
    if (!state.inGame || document.pointerLockElement !== canvas) return;
    const sens = window.OZ_INVENTORY.getState().settings.sensitivity * 0.0022;
    state.yaw -= e.movementX * sens;
    state.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, state.pitch - e.movementY * sens));
  });

  document.addEventListener('mousedown', (e) => {
    if (!state.inGame || document.pointerLockElement !== canvas) return;
    if (e.button === 0) {
      state.mouseDown = true;
      tryShoot();
    }
    if (e.button === 2) state.ads = true;
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button === 0) state.mouseDown = false;
    if (e.button === 2) state.ads = false;
  });

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    state.keys[e.code] = true;
    if (!state.inGame) return;
    if (e.code === 'Digit1') equipSlot(1);
    if (e.code === 'Digit2') equipSlot(2);
    if (e.code === 'Digit3') equipSlot(3);
    if (e.code === 'KeyR') startReload();
    if (e.code === 'KeyE') {
      if (state.team === 'attackers') window.OZ_NET.sendPlantSpike();
      else window.OZ_NET.sendDefuseSpike();
    }
    if (e.code === 'Tab') {
      e.preventDefault();
      document.getElementById('scoreboard').classList.remove('hidden');
    }
  });

  document.addEventListener('keyup', (e) => {
    state.keys[e.code] = false;
    if (e.code === 'Tab') document.getElementById('scoreboard').classList.add('hidden');
  });

  document.addEventListener('pointerlockchange', () => {
    if (state.inGame) {
      document.getElementById('pause-menu').classList.toggle('hidden', document.pointerLockElement === canvas);
    }
  });

  window.OZ_NET.on('connection_status', (st) => {
    document.querySelector('#server-status .dot').className = 'dot ' + (st.connected ? 'online' : 'offline');
    document.getElementById('server-status-text').textContent = st.connected ? 'SUNUCU ÇEVRİMİÇİ' : 'OFFLINE / BOT HAZIR';
  });

  window.OZ_NET.on('room_list', (list) => {
    const box = document.getElementById('room-list-container');
    box.innerHTML = (!list || !list.length)
      ? '<div class="empty-msg">Açık oda yok. Oda kur veya Maç Bul!</div>'
      : list.map((r) => `<div class="room-item"><div><b>${r.name}</b> <small>(${r.map.toUpperCase()} • ${r.mode.toUpperCase()})</small></div><div><span>${r.players}/${r.maxPlayers}</span> <button class="mini-btn" onclick="joinRoomByCode('${r.code}')">KATIL</button></div></div>`).join('');
  });

  window.joinRoomByCode = (code) => {
    const inv = window.OZ_INVENTORY.getState();
    window.OZ_NET.joinRoom({
      code,
      playerName: inv.playerName,
      weapon: inv.loadout.primary,
      skin: inv.equippedSkins[inv.loadout.primary]
    });
  };

  window.OZ_NET.on('joined_room', (p) => startMatch(p, false));
  window.OZ_NET.on('player_joined', (p) => addOrUpdateRemotePlayer(p));
  window.OZ_NET.on('player_moved', (p) => addOrUpdateRemotePlayer(p));
  window.OZ_NET.on('player_left', (id) => {
    if (state.remotePlayers[id]) {
      scene.remove(state.remotePlayers[id].mesh);
      delete state.remotePlayers[id];
    }
  });

  window.OZ_NET.on('player_damaged', (d) => {
    const myId = window.OZ_NET.getPlayerId();
    if (d.targetId === myId) {
      state.hp = d.hp;
      state.armor = d.armor;
      updateHUD();
    }
  });

  window.OZ_NET.on('player_killed', (d) => {
    addKillFeed(d.killerName, d.victimName, d.weapon.toUpperCase(), d.headshot);
    document.getElementById('hud-score-atk').textContent = d.scores.attackers;
    document.getElementById('hud-score-def').textContent = d.scores.defenders;
    const myId = window.OZ_NET.getPlayerId();
    if (d.killerId === myId) state.matchKills++;
    if (d.victimId === myId) {
      state.alive = false;
      state.hp = 0;
      state.matchDeaths++;
      updateHUD();
    }
    if (state.remotePlayers[d.victimId]) {
      state.remotePlayers[d.victimId].data.alive = false;
      state.remotePlayers[d.victimId].mesh.visible = false;
    }
  });

  window.OZ_NET.on('player_respawned', (d) => {
    const myId = window.OZ_NET.getPlayerId();
    if (d.id === myId) {
      state.alive = true;
      state.hp = d.hp;
      state.armor = d.armor;
      state.vel.set(0, 0, 0);
      state.pos.set(d.x, Math.max(2, d.y), d.z);
      updateHUD();
    } else if (state.remotePlayers[d.id]) {
      const rp = state.remotePlayers[d.id];
      rp.data.alive = true;
      rp.mesh.visible = true;
      rp.mesh.position.set(d.x, Math.max(0, (d.y || 2) - 2), d.z);
    }
  });

  window.OZ_NET.on('round_start', (p) => {
    state.alive = true;
    state.hp = 100;
    state.armor = 50;
    state.vel.set(0, 0, 0);
    const myId = window.OZ_NET.getPlayerId();
    if (p.players && p.players[myId]) {
      state.pos.set(p.players[myId].x, Math.max(2, p.players[myId].y), p.players[myId].z);
    }
    Object.values(p.players || {}).forEach((pl) => {
      if (pl.id !== myId) addOrUpdateRemotePlayer(pl);
    });
    updateHUD();
  });

  function renderUI() {
    const inv = window.OZ_INVENTORY.getState();
    document.getElementById('ui-credits').textContent = inv.credits;
    document.getElementById('ui-level').textContent = inv.level;
    document.getElementById('player-name-input').value = inv.playerName;
    document.getElementById('stat-kills').textContent = inv.kills;
    document.getElementById('stat-deaths').textContent = inv.deaths;
    document.getElementById('stat-wins').textContent = inv.wins;

    document.getElementById('weapon-grid').innerHTML = Object.values(window.OZ_WEAPONS.WEAPONS)
      .map((w) => `<div class="item-card ${Object.values(inv.loadout).includes(w.id) ? 'equipped' : ''}" data-wid="${w.id}"><div class="rarity">${w.category}</div><b>${w.name}</b></div>`)
      .join('');

    document.querySelectorAll('#weapon-grid .item-card').forEach((c) => {
      c.onclick = () => {
        state.selectedWeaponForSkin = c.dataset.wid;
        window.OZ_INVENTORY.setLoadoutWeapon(c.dataset.wid);
        document.getElementById('selected-weapon-title').textContent = window.OZ_WEAPONS.WEAPONS[c.dataset.wid].name;
        updateLobbyWeaponModel();
        renderUI();
      };
    });

    const curW = state.selectedWeaponForSkin;
    const owned = Array.isArray(inv.ownedSkins) && inv.ownedSkins.length ? inv.ownedSkins : ['default'];
    document.getElementById('skin-grid').innerHTML = owned
      .map((sId) => {
        const sk = window.OZ_WEAPONS.SKINS[sId] || { id: sId, name: String(sId).toUpperCase(), rarity: 'COMMON' };
        const eq = inv.equippedSkins && inv.equippedSkins[curW] === sId;
        return `<div class="item-card ${eq ? 'equipped' : ''}" data-sid="${sId}"><div class="rarity">${sk.rarity}</div><b>${sk.name}</b><div>${eq ? 'KUŞANILDI' : 'KUŞAN'}</div></div>`;
      })
      .join('');

    document.querySelectorAll('#skin-grid .item-card').forEach((c) => {
      c.onclick = () => {
        window.OZ_INVENTORY.equipSkin(curW, c.dataset.sid);
        updateLobbyWeaponModel();
        renderUI();
      };
    });

    document.getElementById('store-grid').innerHTML = Object.values(window.OZ_WEAPONS.SKINS)
      .filter((s) => s.price > 0)
      .map((sk) => `<div class="item-card" data-buy="${sk.id}"><div class="rarity">${sk.rarity}</div><b>${sk.name}</b><div>${owned.includes(sk.id) ? 'ENVANTERDE' : '◈ ' + sk.price}</div></div>`)
      .join('');

    document.querySelectorAll('#store-grid .item-card').forEach((c) => {
      c.onclick = () => {
        alert(window.OZ_INVENTORY.buySkin(c.dataset.buy).msg);
        renderUI();
      };
    });
  }

  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll('.nav-btn').forEach((x) => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('tab-' + b.dataset.tab).classList.add('active');
    };
  });

  document.querySelectorAll('.mode-card').forEach((c) => {
    c.onclick = () => {
      document.querySelectorAll('.mode-card').forEach((x) => x.classList.remove('selected'));
      c.classList.add('selected');
      state.selectedMode = c.dataset.mode;
    };
  });

  document.getElementById('player-name-input').onchange = (e) => window.OZ_INVENTORY.setPlayerName(e.target.value);

  document.getElementById('btn-quick-match').onclick = () => {
    const inv = window.OZ_INVENTORY.getState();
    if (!window.OZ_NET.isConnected()) return startMatch({ map: 'neon_district', mode: state.selectedMode }, true);
    window.OZ_NET.quickMatch({
      mode: state.selectedMode,
      playerName: inv.playerName,
      weapon: inv.loadout.primary,
      skin: inv.equippedSkins[inv.loadout.primary]
    });
  };

  document.getElementById('btn-offline-bots').onclick = () => startMatch({ map: 'neon_district', mode: state.selectedMode }, true);

  document.getElementById('btn-join-code').onclick = () => {
    const code = document.getElementById('join-code-input').value;
    if (code) window.joinRoomByCode(code);
  };

  document.getElementById('btn-create-room').onclick = () => {
    const inv = window.OZ_INVENTORY.getState();
    const map = document.getElementById('custom-map').value;
    const mode = document.getElementById('custom-mode').value;
    if (!window.OZ_NET.isConnected()) return startMatch({ map, mode }, true);
    window.OZ_NET.createRoom({
      roomName: document.getElementById('custom-room-name').value,
      mode,
      map,
      team: document.getElementById('custom-team').value,
      maxPlayers: document.getElementById('custom-max-players').value,
      isPrivate: document.getElementById('custom-private').checked,
      playerName: inv.playerName,
      weapon: inv.loadout.primary,
      skin: inv.equippedSkins[inv.loadout.primary]
    });
  };

  document.getElementById('btn-refresh-rooms').onclick = () => window.OZ_NET.refreshRooms();
  document.getElementById('btn-free-credits').onclick = () => {
    window.OZ_INVENTORY.addCredits(1000);
    renderUI();
  };
  document.getElementById('btn-resume').onclick = () => requestPointerLock();
  document.getElementById('btn-leave-match').onclick = () => {
    window.OZ_INVENTORY.recordMatchStats(state.matchKills, state.matchDeaths, false);
    state.inGame = false;
    window.OZ_NET.leaveRoom();
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    initLobbyShowcase();
    renderUI();
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    weaponCamera.aspect = window.innerWidth / window.innerHeight;
    weaponCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  initLobbyShowcase();
  renderUI();
  window.OZ_NET.connect();
  requestAnimationFrame(animate);
})();