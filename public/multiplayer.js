window.OZ_NET = (function () {
  let socket = null, connected = false, currentRoom = null, playerId = null;
  const listeners = {};
  function on(ev, fn) { if (!listeners[ev]) listeners[ev] = []; listeners[ev].push(fn); }
  function emitLocal(ev, d) { (listeners[ev] || []).forEach(fn => fn(d)); }

  function connect() {
    if (socket || typeof io === 'undefined') return;
    const url = (window.OZ_CONFIG && window.OZ_CONFIG.SERVER_URL) || window.location.origin;
    socket = io(url, { transports: ['websocket', 'polling'], reconnection: true });
    socket.on('connect', () => { connected = true; playerId = socket.id; emitLocal('connection_status', { connected: true, id: socket.id }); socket.emit('get_rooms'); });
    socket.on('disconnect', () => { connected = false; emitLocal('connection_status', { connected: false }); });
    socket.on('connect_error', () => { connected = false; emitLocal('connection_status', { connected: false }); });
    ['room_list','joined_room','player_joined','player_left','player_moved','player_fired','player_damaged','player_killed','player_respawned','round_start','round_end','match_end','timer_sync','spike_planted','spike_defused','spike_exploded','chat_msg','error_msg'].forEach(ev => {
      socket.on(ev, payload => {
        if (ev === 'joined_room') { currentRoom = payload.roomCode; playerId = payload.playerId; }
        emitLocal(ev, payload);
      });
    });
  }

  return {
    connect, on,
    isConnected: () => connected,
    getPlayerId: () => playerId,
    getCurrentRoom: () => currentRoom,
    refreshRooms: () => socket && connected && socket.emit('get_rooms'),
    createRoom: opts => socket && connected ? (socket.emit('create_room', opts), true) : false,
    joinRoom: opts => socket && connected ? (socket.emit('join_room', opts), true) : false,
    quickMatch: opts => socket && connected ? (socket.emit('quick_match', opts), true) : false,
    sendMove: st => socket && connected && currentRoom && socket.emit('player_move', st),
    sendShoot: sd => socket && connected && currentRoom && socket.emit('player_shoot', sd),
    sendPlantSpike: () => socket && connected && currentRoom && socket.emit('plant_spike'),
    sendDefuseSpike: () => socket && connected && currentRoom && socket.emit('defuse_spike'),
    leaveRoom: () => { if (socket) { socket.disconnect(); socket = null; connected = false; currentRoom = null; connect(); } }
  };
})();
