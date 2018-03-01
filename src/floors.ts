interface IEnvMaterial {
  pattern?: HTMLImageElement;
  color?: string;
  hardness?: number;
  impassible?: boolean;
  thickness?: number;
}

export enum ENV_MATERIAL {
  GRASS = 0x0,
  STONE = 0x2,
  BRICK = 0x1,
  WINDOW = 0x3,
  CARPET = 0x4,
  METAL = 0x5,
}

const loadImage = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

export const TILES: { [matType: string]: IEnvMaterial } = {
  [ENV_MATERIAL.GRASS]: {
    color: '#97cc74',
    // pattern: loadImage('/img/grass.png'),
    hardness: 0,
  },
  [ENV_MATERIAL.METAL]: {
    color: '#273745',
    // pattern: loadImage('/img/grass.png'),
    hardness: 4,
  },
  [ENV_MATERIAL.BRICK]: {
    color: '#805959',
    // pattern: loadImage('/img/brick.png'),
    // thickness: 5,
    impassible: true,
  },
  [ENV_MATERIAL.STONE]: {
    color: 'rgba(190, 190, 190, 1)',
    // pattern: loadImage('/img/stone.png'),
    hardness: 0,
  },
  [ENV_MATERIAL.WINDOW]: {
    color: 'rgba(137, 207, 240, 0.3)',
    thickness: 2,
    impassible: true,
  },
  [ENV_MATERIAL.CARPET]: {
    color: '#cc7474',
    // pattern: loadImage('/img/grass.png'),
    hardness: 0,
  },
};

export const getMaterialForType = (mapIdx: number): IEnvMaterial => {
  return this.TILES[this.TILE_MAP[mapIdx]];
};

export const TILE_MAP: { [id: number]: ENV_MATERIAL } = {
  0x0: ENV_MATERIAL.GRASS,
  0x1: ENV_MATERIAL.BRICK,
  0x2: ENV_MATERIAL.STONE,
  0x3: ENV_MATERIAL.WINDOW,
  0x4: ENV_MATERIAL.CARPET,
  0x5: ENV_MATERIAL.METAL,
};