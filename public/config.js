// OPERATION ZERO — Global Configuration
window.OZ_CONFIG = {
  SERVER_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? window.location.origin
    : 'https://YOUR-BACKEND-SERVER-URL.onrender.com',
  ALLOW_OFFLINE_BOTS: true,
  TICK_RATE: 30,
  VERSION: '1.0.0-COMPETITIVE',
  DEFAULT_CURRENCY: 12500
};
