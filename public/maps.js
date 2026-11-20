window.OZ_MAPS = (function () {
  const MAPS = {
    neon_district: { id: 'neon_district', name: 'NEON DISTRICT', skyColor: 0x070b19, fogColor: 0x090e24, fogDensity: 0.011, ambientColor: 0x3b4875, sunColor: 0x7aa2f7, sunIntensity: 0.85, accentNeon1: 0x00f5d4, accentNeon2: 0xff007f, floorColor: '#161b2e', wallColor: '#1f2942', coverColor: '#2d3b5e', attackersSpawn: { x: -36, y: 2, z: -36 }, defendersSpawn: { x: 36, y: 2, z: 36 }, bombSites: [{ id: 'A', x: 22, z: -22, r: 7, color: 0xff007f }, { id: 'B', x: -22, z: 22, r: 7, color: 0x00f5d4 }], blocks: [[0, 3, 0, 8, 6, 8, 'wall'], [-14, 2.5, -14, 10, 5, 3, 'wall'], [14, 2.5, 14, 10, 5, 3, 'wall'], [18, 1.3, -20, 2.8, 2.6, 2.8, 'cover'], [-18, 1.3, 20, 2.8, 2.6, 2.8, 'cover']] },
    dust_sector: { id: 'dust_sector', name: 'DUST SECTOR', skyColor: 0xd9a773, fogColor: 0xd9a773, fogDensity: 0.007, ambientColor: 0xffe4c4, sunColor: 0xfff3d6, sunIntensity: 1.45, accentNeon1: 0xf59e0b, accentNeon2: 0xd97706, floorColor: '#c29b61', wallColor: '#9c7844', coverColor: '#785a32', attackersSpawn: { x: -38, y: 2, z: 0 }, defendersSpawn: { x: 38, y: 2, z: 0 }, bombSites: [{ id: 'A', x: 24, z: -24, r: 7, color: 0xf59e0b }, { id: 'B', x: 24, z: 24, r: 7, color: 0xef4444 }], blocks: [[0, 3, 0, 7, 6, 7, 'wall'], [-15, 2, -15, 8, 4, 3, 'wall'], [15, 2, 15, 8, 4, 3, 'wall']] },
    arctic_base: { id: 'arctic_base', name: 'ARCTIC BASE', skyColor: 0x8ecae6, fogColor: 0xbde0fe, fogDensity: 0.009, ambientColor: 0xcaf0f8, sunColor: 0xffffff, sunIntensity: 1.35, accentNeon1: 0x00b4d8, accentNeon2: 0x0077b6, floorColor: '#e2e8f0', wallColor: '#475569', coverColor: '#1e293b', attackersSpawn: { x: 0, y: 2, z: -38 }, defendersSpawn: { x: 0, y: 2, z: 38 }, bombSites: [{ id: 'A', x: -24, z: 20, r: 7, color: 0x0284c7 }, { id: 'B', x: 24, z: 20, r: 7, color: 0x38bdf8 }], blocks: [[0, 3.5, 0, 10, 7, 10, 'wall'], [-16, 2, 0, 3, 4, 14, 'wall'], [16, 2, 0, 3, 4, 14, 'wall']] },
    tokyo_underground: { id: 'tokyo_underground', name: 'TOKYO UNDERGROUND', skyColor: 0x090d16, fogColor: 0x111827, fogDensity: 0.012, ambientColor: 0x4b5563, sunColor: 0xf43f5e, sunIntensity: 0.95, accentNeon1: 0xf43f5e, accentNeon2: 0x38bdf8, floorColor: '#1e2430', wallColor: '#2c3545', coverColor: '#3f4c63', attackersSpawn: { x: -36, y: 2, z: -36 }, defendersSpawn: { x: 36, y: 2, z: 36 }, bombSites: [{ id: 'A', x: 20, z: -20, r: 7, color: 0xf43f5e }, { id: 'B', x: -20, z: 20, r: 7, color: 0x38bdf8 }], blocks: [[-4, 1.8, 0, 3.6, 3.6, 18, 'wall'], [5, 1.8, 0, 3.6, 3.6, 18, 'wall']] },
    ancient_ruins: { id: 'ancient_ruins', name: 'ANCIENT RUINS', skyColor: 0x3b5249, fogColor: 0x4a6b5d, fogDensity: 0.0085, ambientColor: 0xa3b18a, sunColor: 0xffe8a3, sunIntensity: 1.25, accentNeon1: 0x52b788, accentNeon2: 0xfbbf24, floorColor: '#586e53', wallColor: '#6b705c', coverColor: '#a5a58d', attackersSpawn: { x: -38, y: 2, z: 32 }, defendersSpawn: { x: 38, y: 2, z: -32 }, bombSites: [{ id: 'A', x: 22, z: 22, r: 7, color: 0xfbbf24 }, { id: 'B', x: -22, z: -22, r: 7, color: 0x52b788 }], blocks: [[0, 2.8, 0, 9, 5.6, 9, 'wall'], [-12, 2.5, -8, 2.5, 5, 2.5, 'wall'], [12, 2.5, 8, 2.5, 5, 2.5, 'wall']] },
    cyber_factory: { id: 'cyber_factory', name: 'CYBER FACTORY', skyColor: 0x10141f, fogColor: 0x161d2e, fogDensity: 0.01, ambientColor: 0x64748b, sunColor: 0x38bdf8, sunIntensity: 1.15, accentNeon1: 0xf97316, accentNeon2: 0x06b6d4, floorColor: '#1e293b', wallColor: '#334155', coverColor: '#ea580c', attackersSpawn: { x: -38, y: 2, z: -15 }, defendersSpawn: { x: 38, y: 2, z: 15 }, bombSites: [{ id: 'A', x: 22, z: -22, r: 7, color: 0xf97316 }, { id: 'B', x: 22, z: 22, r: 7, color: 0x06b6d4 }], blocks: [[0, 3, -6, 14, 6, 3.5, 'wall'], [0, 3, 6, 14, 6, 3.5, 'wall']] }
  };

  function buildMapScene(scene, mapId, qualitySettings) {
    const cfg = MAPS[mapId] || MAPS.neon_district;
    const colliders = [];
    const mapGroup = new THREE.Group();
    scene.background = new THREE.Color(cfg.skyColor);
    scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);

    mapGroup.add(new THREE.HemisphereLight(cfg.sunColor, cfg.ambientColor, 0.8));
    const dirLight = new THREE.DirectionalLight(cfg.sunColor, cfg.sunIntensity);
    dirLight.position.set(45, 75, 35);
    mapGroup.add(dirLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: cfg.floorColor, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    mapGroup.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: cfg.wallColor, roughness: 0.65 });
    const coverMat = new THREE.MeshStandardMaterial({ color: cfg.coverColor, roughness: 0.5 });

    const perimeters = [
      [0, 4, -50, 100, 8, 2, 'wall'],
      [0, 4, 50, 100, 8, 2, 'wall'],
      [-50, 4, 0, 2, 8, 100, 'wall'],
      [50, 4, 0, 2, 8, 100, 'wall']
    ];

    [...perimeters, ...cfg.blocks].forEach(b => {
      const [x, y, z, w, h, d, type] = b;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), type === 'cover' ? coverMat : wallMat);
      mesh.position.set(x, y, z);
      mapGroup.add(mesh);
      colliders.push({ minX: x - w/2, maxX: x + w/2, minY: y - h/2, maxY: y + h/2, minZ: z - d/2, maxZ: z + d/2, mesh });
    });

    scene.add(mapGroup);
    return { config: cfg, group: mapGroup, colliders };
  }

  return { MAPS, buildMapScene };
})();
