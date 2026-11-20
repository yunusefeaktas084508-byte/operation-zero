const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', game: 'OPERATION ZERO', uptime: process.uptime(), rooms: Object.keys(rooms).length });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

const WEAPON_STATS = {
  vandal_x:   { damage: 40, headMult: 3.5, fireRate: 105, range: 160, mag: 25 },
  phantom_z:  { damage: 35, headMult: 3.2, fireRate: 90,  range: 150, mag: 30 },
  operator_9: { damage: 150, headMult: 2.5, fireRate: 1300, range: 300, mag: 5 },
  spectre_v:  { damage: 26, headMult: 2.5, fireRate: 72,  range: 95,  mag: 30 },
  breacher_12:{ damage: 22, headMult: 2.0, fireRate: 750, range: 38,  mag: 8, pellets: 7 },
  sheriff_50: { damage: 55, headMult: 2.8, fireRate: 380, range: 120, mag: 6 },
  glock_18:   { damage: 24, headMult: 2.5, fireRate: 160, range: 90,  mag: 18 },
  odin_hmg:   { damage: 32, headMult: 2.4, fireRate: 80,  range: 130, mag: 100 },
  karambit_0: { damage: 75, headMult: 2.0, fireRate: 450, range: 4.5, mag: 1 }
};

const MAP_SPAWNS = {
  neon_district: {
    attackers: [{x:-36,y:2,z:-36},{x:-32,y:2,z:-38},{x:-38,y:2,z:-32},{x:-34,y:2,z:-34},{x:-30,y:2,z:-36}],
    defenders: [{x:36,y:2,z:36},{x:32,y:2,z:38},{x:38,y:2,z:32},{x:34,y:2,z:34},{x:30,y:2,z:36}],
    bombSites: [{id:'A',x:22,z:-22,r:7},{id:'B',x:-22,z:22,r:7}]
  },
  dust_sector: {
    attackers: [{x:-38,y:2,z:0},{x:-38,y:2,z:5},{x:-38,y:2,z:-5},{x:-35,y:2,z:3},{x:-35,y:2,z:-3}],
    defenders: [{x:38,y:2,z:0},{x:38,y:2,z:5},{x:38,y:2,z:-5},{x:35,y:2,z:3},{x:35,y:2,z:-3}],
    bombSites: [{id:'A',x:24,z:-24,r:7},{id:'B',x:24,z:24,r:7}]
  },
  arctic_base: {
    attackers: [{x:0,y:2,z:-38},{x:5,y:2,z:-38},{x:-5,y:2,z:-38},{x:3,y:2,z:-35},{x:-3,y:2,z:-35}],
    defenders: [{x:0,y:2,z:38},{x:5,y:2,z:38},{x:-5,y:2,z:38},{x:3,y:2,z:35},{x:-3,y:2,z:35}],
    bombSites: [{id:'A',x:-24,z:20,r:7},{id:'B',x:24,z:20,r:7}]
  },
  tokyo_underground: {
    attackers: [{x:-36,y:2,z:-36},{x:-32,y:2,z:-36},{x:-36,y:2,z:-32},{x:-30,y:2,z:-32},{x:-34,y:2,z:-34}],
    defenders: [{x:36,y:2,z:36},{x:32,y:2,z:36},{x:36,y:2,z:32},{x:30,y:2,z:32},{x:34,y:2,z:34}],
    bombSites: [{id:'A',x:20,z:-20,r:7},{id:'B',x:-20,z:20,r:7}]
  },
  ancient_ruins: {
    attackers: [{x:-38,y:2,z:32},{x:-34,y:2,z:36},{x:-36,y:2,z:34},{x:-32,y:2,z:32},{x:-36,y:2,z:38}],
    defenders: [{x:38,y:2,z:-32},{x:34,y:2,z:-36},{x:36,y:2,z:-34},{x:32,y:2,z:-32},{x:36,y:2,z:-38}],
    bombSites: [{id:'A',x:22,z:22,r:7},{id:'B',x:-22,z:-22,r:7}]
  },
  cyber_factory: {
    attackers: [{x:-38,y:2,z:-15},{x:-38,y:2,z:-10},{x:-38,y:2,z:-20},{x:-35,y:2,z:-12},{x:-35,y:2,z:-18}],
    defenders: [{x:38,y:2,z:15},{x:38,y:2,z:10},{x:38,y:2,z:20},{x:35,y:2,z:12},{x:35,y:2,z:18}],
    bombSites: [{id:'A',x:22,z:-22,r:7},{id:'B',x:22,z:22,r:7}]
  }
};

const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms[code] ? generateRoomCode() : code;
}

function getPublicRoomList() {
  return Object.values(rooms)
    .filter(r => !r.isPrivate)
    .map(r => ({
      code: r.code,
      name: r.name,
      map: r.map,
      mode: r.mode,
      players: Object.keys(r.players).length,
      maxPlayers: r.maxPlayers,
      status: r.state
    }));
}

function getSpawnForPlayer(room, player, idx = 0) {
  const mapCfg = MAP_SPAWNS[room.map] || MAP_SPAWNS.neon_district;
  if (room.mode === 'deathmatch') {
    const all = [...mapCfg.attackers, ...mapCfg.defenders];
    return all[Math.floor(Math.random() * all.length)];
  }
  const list = player.team === 'attackers' ? mapCfg.attackers : mapCfg.defenders;
  return list[idx % list.length];
}

function startNewRound(room) {
  room.round++;
  room.state = 'playing';
  room.roundTimer = room.mode === 'competitive' ? 105 : 300;
  room.spikePlanted = false;
  room.spikeSite = null;
  room.spikePos = null;
  room.spikeTimer = 40;

  let atkIdx = 0, defIdx = 0;
  Object.values(room.players).forEach(p => {
    p.hp = 100;
    p.armor = 50;
    p.alive = true;
    const sp = getSpawnForPlayer(room, p, p.team === 'attackers' ? atkIdx++ : defIdx++);
    p.x = sp.x; p.y = sp.y; p.z = sp.z;
    p.lastShot = 0;
  });

  io.to(room.code).emit('round_start', {
    round: room.round,
    scores: room.scores,
    roundTimer: room.roundTimer,
    players: room.players
  });
}

function endRound(room, winnerTeam, reason) {
  if (room.state !== 'playing') return;
  room.state = 'round_end';
  if (winnerTeam === 'attackers') room.scores.attackers++;
  if (winnerTeam === 'defenders') room.scores.defenders++;

  io.to(room.code).emit('round_end', {
    winner: winnerTeam,
    reason,
    scores: room.scores,
    round: room.round
  });

  const targetRounds = room.mode === 'competitive' ? 7 : 1;
  if (room.scores.attackers >= targetRounds || room.scores.defenders >= targetRounds) {
    setTimeout(() => {
      if (!rooms[room.code]) return;
      room.state = 'match_end';
      io.to(room.code).emit('match_end', {
        winner: room.scores.attackers > room.scores.defenders ? 'attackers' : 'defenders',
        scores: room.scores,
        players: room.players
      });
    }, 3500);
  } else {
    setTimeout(() => {
      if (rooms[room.code]) startNewRound(room);
    }, 4500);
  }
}

setInterval(() => {
  Object.values(rooms).forEach(room => {
    if (room.state !== 'playing') return;

    if (room.mode === 'competitive') {
      if (room.spikePlanted) {
        room.spikeTimer--;
        if (room.spikeTimer <= 0) {
          io.to(room.code).emit('spike_exploded', { pos: room.spikePos });
          endRound(room, 'attackers', 'SPIKE DETONATED');
          return;
        }
      } else {
        room.roundTimer--;
        if (room.roundTimer <= 0) {
          endRound(room, 'defenders', 'TIME EXPIRED');
          return;
        }
      }

      const pList = Object.values(room.players);
      const atkTotal = pList.filter(p => p.team === 'attackers').length;
      const defTotal = pList.filter(p => p.team === 'defenders').length;
      const atkAlive = pList.filter(p => p.team === 'attackers' && p.alive).length;
      const defAlive = pList.filter(p => p.team === 'defenders' && p.alive).length;

      if (atkTotal > 0 && defTotal > 0) {
        if (defAlive === 0) {
          endRound(room, 'attackers', 'DEFENDERS ELIMINATED');
        } else if (atkAlive === 0 && !room.spikePlanted) {
          endRound(room, 'defenders', 'ATTACKERS ELIMINATED');
        }
      }
    } else {
      room.roundTimer--;
      if (room.roundTimer <= 0) {
        room.state = 'match_end';
        io.to(room.code).emit('match_end', {
          winner: room.scores.attackers >= room.scores.defenders ? 'attackers' : 'defenders',
          scores: room.scores,
          players: room.players
        });
      }
    }

    io.to(room.code).emit('timer_sync', {
      roundTimer: room.roundTimer,
      spikePlanted: room.spikePlanted,
      spikeTimer: room.spikeTimer
    });
  });
}, 1000);

io.on('connection', (socket) => {
  socket.emit('room_list', getPublicRoomList());

  socket.on('get_rooms', () => {
    socket.emit('room_list', getPublicRoomList());
  });

  socket.on('create_room', (data) => {
    const code = generateRoomCode();
    const room = {
      code,
      name: (data.roomName || `${data.playerName || 'Agent'}'s Lobby`).slice(0, 28),
      hostId: socket.id,
      map: MAP_SPAWNS[data.map] ? data.map : 'neon_district',
      mode: ['competitive', 'tdm', 'deathmatch'].includes(data.mode) ? data.mode : 'competitive',
      maxPlayers: Math.min(Math.max(parseInt(data.maxPlayers) || 10, 2), 10),
      isPrivate: !!data.isPrivate,
      state: 'playing',
      round: 1,
      roundTimer: data.mode === 'competitive' ? 105 : 300,
      scores: { attackers: 0, defenders: 0 },
      spikePlanted: false,
      spikeSite: null,
      spikePos: null,
      spikeTimer: 40,
      players: {}
    };

    rooms[code] = room;
    joinRoomLogic(socket, room, data.playerName, data.team || 'attackers', data.weapon || 'vandal_x', data.skin || 'default');
    io.emit('room_list', getPublicRoomList());
  });

  socket.on('join_room', (data) => {
    const code = (data.code || '').toUpperCase().trim();
    const room = rooms[code];
    if (!room) {
      socket.emit('error_msg', 'Oda bulunamadı! Kodu kontrol edin.');
      return;
    }
    if (Object.keys(room.players).length >= room.maxPlayers) {
      socket.emit('error_msg', 'Oda dolu!');
      return;
    }
    const pList = Object.values(room.players);
    const atkCount = pList.filter(p => p.team === 'attackers').length;
    const defCount = pList.filter(p => p.team === 'defenders').length;
    const autoTeam = data.team || (atkCount <= defCount ? 'attackers' : 'defenders');

    joinRoomLogic(socket, room, data.playerName, autoTeam, data.weapon || 'vandal_x', data.skin || 'default');
    io.emit('room_list', getPublicRoomList());
  });

  socket.on('quick_match', (data) => {
    const mode = data.mode || 'competitive';
    let targetRoom = Object.values(rooms).find(
      r => !r.isPrivate && r.mode === mode && r.state !== 'match_end' && Object.keys(r.players).length < r.maxPlayers
    );
    if (!targetRoom) {
      const maps = Object.keys(MAP_SPAWNS);
      const randomMap = maps[Math.floor(Math.random() * maps.length)];
      const code = generateRoomCode();
      targetRoom = {
        code,
        name: `Official ${mode.toUpperCase()} #${code}`,
        hostId: socket.id,
        map: randomMap,
        mode,
        maxPlayers: 10,
        isPrivate: false,
        state: 'playing',
        round: 1,
        roundTimer: mode === 'competitive' ? 105 : 300,
        scores: { attackers: 0, defenders: 0 },
        spikePlanted: false,
        spikeSite: null,
        spikePos: null,
        spikeTimer: 40,
        players: {}
      };
      rooms[code] = targetRoom;
    }
    const pList = Object.values(targetRoom.players);
    const atkCount = pList.filter(p => p.team === 'attackers').length;
    const defCount = pList.filter(p => p.team === 'defenders').length;
    const team = atkCount <= defCount ? 'attackers' : 'defenders';
    joinRoomLogic(socket, targetRoom, data.playerName, team, data.weapon || 'vandal_x', data.skin || 'default');
    io.emit('room_list', getPublicRoomList());
  });

  function joinRoomLogic(sock, room, playerName, team, weapon, skin) {
    sock.join(room.code);
    sock.roomCode = room.code;
    const safeName = (playerName || 'Agent_' + sock.id.slice(0, 4)).replace(/[<>]/g, '').slice(0, 18);
    const player = {
      id: sock.id,
      name: safeName,
      team: team === 'defenders' ? 'defenders' : 'attackers',
      x: 0, y: 2, z: 0,
      rotY: 0, rotX: 0,
      hp: 100,
      armor: 50,
      alive: true,
      weapon: WEAPON_STATS[weapon] ? weapon : 'vandal_x',
      skin: skin || 'default',
      kills: 0,
      deaths: 0,
      score: 0,
      crouching: false,
      lastShot: 0
    };
    const sp = getSpawnForPlayer(room, player, Object.keys(room.players).length);
    player.x = sp.x; player.y = sp.y; player.z = sp.z;
    room.players[sock.id] = player;

    sock.emit('joined_room', {
      roomCode: room.code,
      roomName: room.name,
      map: room.map,
      mode: room.mode,
      round: room.round,
      roundTimer: room.roundTimer,
      scores: room.scores,
      spikePlanted: room.spikePlanted,
      spikePos: room.spikePos,
      playerId: sock.id,
      players: room.players
    });

    sock.to(room.code).emit('player_joined', player);
  }

  socket.on('player_move', (data) => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    const p = room.players[socket.id];
    if (!p || !p.alive) return;

    const dx = data.x - p.x;
    const dz = data.z - p.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 18) {
      p.x = Math.max(-46, Math.min(46, Number(data.x) || 0));
      p.y = Math.max(0.5, Math.min(15, Number(data.y) || 2));
      p.z = Math.max(-46, Math.min(46, Number(data.z) || 0));
    }
    p.rotY = Number(data.rotY) || 0;
    p.rotX = Number(data.rotX) || 0;
    p.crouching = !!data.crouching;
    if (data.weapon && WEAPON_STATS[data.weapon]) p.weapon = data.weapon;
    if (data.skin) p.skin = data.skin;

    socket.to(room.code).emit('player_moved', {
      id: p.id,
      x: p.x, y: p.y, z: p.z,
      rotY: p.rotY, rotX: p.rotX,
      crouching: p.crouching,
      weapon: p.weapon,
      skin: p.skin
    });
  });

  socket.on('player_shoot', (data) => {
    const room = rooms[socket.roomCode];
    if (!room || room.state !== 'playing') return;
    const shooter = room.players[socket.id];
    if (!shooter || !shooter.alive) return;

    const wId = WEAPON_STATS[data.weapon] ? data.weapon : shooter.weapon;
    const wStats = WEAPON_STATS[wId];
    const now = Date.now();

    if (now - shooter.lastShot < wStats.fireRate * 0.72) return;
    shooter.lastShot = now;

    socket.to(room.code).emit('player_fired', {
      id: shooter.id,
      weapon: wId,
      origin: data.origin,
      hitPoint: data.hitPoint
    });

    if (data.targetId && room.players[data.targetId]) {
      const target = room.players[data.targetId];
      if (!target.alive) return;
      if (room.mode !== 'deathmatch' && target.team === shooter.team) return;

      const dist = Math.hypot(shooter.x - target.x, shooter.y - target.y, shooter.z - target.z);
      if (dist > wStats.range + 5) return;

      const isHeadshot = !!data.headshot;
      let rawDmg = wStats.damage * (isHeadshot ? wStats.headMult : 1.0);
      if (wStats.pellets) {
        const hits = Math.min(wStats.pellets, Math.max(1, parseInt(data.pelletsHit) || 1));
        rawDmg = wStats.damage * hits * (isHeadshot ? 1.5 : 1.0);
      }

      let finalDmg = Math.round(rawDmg);
      if (target.armor > 0) {
        const absorbed = Math.min(target.armor, Math.round(finalDmg * 0.45));
        target.armor -= absorbed;
        finalDmg -= absorbed;
      }

      target.hp = Math.max(0, target.hp - finalDmg);

      io.to(room.code).emit('player_damaged', {
        targetId: target.id,
        attackerId: shooter.id,
        damage: finalDmg,
        hp: target.hp,
        armor: target.armor,
        headshot: isHeadshot
      });

      if (target.hp <= 0) {
        target.alive = false;
        target.deaths++;
        shooter.kills++;
        shooter.score += isHeadshot ? 150 : 100;

        if (room.mode === 'tdm') {
          if (shooter.team === 'attackers') room.scores.attackers++;
          else room.scores.defenders++;
        }

        io.to(room.code).emit('player_killed', {
          victimId: target.id,
          victimName: target.name,
          killerId: shooter.id,
          killerName: shooter.name,
          weapon: wId,
          headshot: isHeadshot,
          scores: room.scores
        });

        if (room.mode === 'tdm' && (room.scores.attackers >= 30 || room.scores.defenders >= 30)) {
          room.state = 'match_end';
          io.to(room.code).emit('match_end', {
            winner: room.scores.attackers >= 30 ? 'attackers' : 'defenders',
            scores: room.scores,
            players: room.players
          });
        } else if (room.mode === 'deathmatch' && shooter.kills >= 20) {
          room.state = 'match_end';
          io.to(room.code).emit('match_end', {
            winner: shooter.name,
            scores: room.scores,
            players: room.players
          });
        } else if (room.mode !== 'competitive') {
          setTimeout(() => {
            if (!rooms[room.code] || !room.players[target.id] || room.state !== 'playing') return;
            target.hp = 100;
            target.armor = 50;
            target.alive = true;
            const sp = getSpawnForPlayer(room, target, Math.floor(Math.random() * 5));
            target.x = sp.x; target.y = sp.y; target.z = sp.z;
            io.to(room.code).emit('player_respawned', {
              id: target.id,
              x: target.x, y: target.y, z: target.z,
              hp: target.hp, armor: target.armor
            });
          }, 3000);
        }
      }
    }
  });

  socket.on('plant_spike', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'competitive' || room.state !== 'playing' || room.spikePlanted) return;
    const p = room.players[socket.id];
    if (!p || !p.alive || p.team !== 'attackers') return;

    const sites = (MAP_SPAWNS[room.map] || MAP_SPAWNS.neon_district).bombSites;
    const nearSite = sites.find(s => Math.hypot(p.x - s.x, p.z - s.z) <= s.r + 2);
    if (!nearSite) return;

    room.spikePlanted = true;
    room.spikeSite = nearSite.id;
    room.spikePos = { x: p.x, y: 0.2, z: p.z };
    room.spikeTimer = 40;
    p.score += 200;

    io.to(room.code).emit('spike_planted', {
      site: nearSite.id,
      pos: room.spikePos,
      planter: p.name
    });
  });

  socket.on('defuse_spike', () => {
    const room = rooms[socket.roomCode];
    if (!room || room.mode !== 'competitive' || room.state !== 'playing' || !room.spikePlanted) return;
    const p = room.players[socket.id];
    if (!p || !p.alive || p.team !== 'defenders') return;

    if (room.spikePos && Math.hypot(p.x - room.spikePos.x, p.z - room.spikePos.z) <= 5.5) {
      p.score += 300;
      io.to(room.code).emit('spike_defused', { defuser: p.name });
      endRound(room, 'defenders', 'SPIKE DEFUSED');
    }
  });

  socket.on('chat_msg', (msg) => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    const p = room.players[socket.id];
    if (!p) return;
    const clean = String(msg || '').replace(/[<>]/g, '').slice(0, 140);
    if (!clean) return;
    io.to(room.code).emit('chat_msg', {
      sender: p.name,
      team: p.team,
      text: clean
    });
  });

  socket.on('disconnect', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;
    delete room.players[socket.id];
    io.to(code).emit('player_left', socket.id);

    if (Object.keys(room.players).length === 0) {
      delete rooms[code];
    } else if (room.hostId === socket.id) {
      room.hostId = Object.keys(room.players)[0];
    }
    io.emit('room_list', getPublicRoomList());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`OPERATION ZERO SERVER RUNNING ON PORT ${PORT}`);
});
