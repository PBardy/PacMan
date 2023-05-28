const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 456;
canvas.height = 528;

const dots = 178;
const tileSize = 24;
const spriteSize = 24;

const assets = new Map();

const modes = new Map();
modes.set('normal', 'normal');
modes.set('scatter', 'scatter');

const directions = new Map();
directions.set('east', { x: 1, y: 0 });
directions.set('west', { x: -1, y: 0 });
directions.set('north', { x: 0, y: -1 });
directions.set('south', { x: 0, y: 1 });

const Tile = ({ x, y, value }) => ({
  x,
  y,
  value,
  sprite: null,
  image: assets.get(value),
});

const SpriteAnimation = ({ delay, frameSets }) => ({
  delay,
  frameSets,
  count: 0,
  frame: 0,
  frameIndex: 0,
});

const Sprite = ({ tx, ty, name, spritesheet }) => ({
  tx,
  ty,
  name,
  spritesheet,
  animation: SpriteAnimation({ frameSets: spritesheet.frameSets, delay: 4 }),
  x: tx * spriteSize,
  y: ty * spriteSize,
  speed: 1,
  distance: 0,
  mode: modes.get('normal'),
  direction: directions.get('east'),
  intention: directions.get('east'),
});

const Pacman = () =>
  Sprite({
    tx: 9,
    ty: 12,
    name: 'pacman',
    spritesheet: {
      image: assets.get('pacman'),
      frameSets: {
        normal: {
          east: [0, 1, 2, 3],
          south: [4, 5, 6, 7],
          west: [8, 9, 10, 11],
          north: [12, 13, 14, 15],
        },
        scatter: {
          east: [0, 1, 2, 3],
          south: [4, 5, 6, 7],
          west: [8, 9, 10, 11],
          north: [12, 13, 14, 15],
        },
      },
    },
  });

const Inky = () =>
  Sprite({
    tx: 9,
    ty: 10,
    name: 'inky',
    spritesheet: {
      image: assets.get('inky'),
      frameSets: {
        normal: {
          east: [0, 1],
          south: [2, 3],
          west: [4, 5],
          north: [6, 7],
        },
        scatter: {
          east: [8, 9],
          south: [8, 9],
          west: [8, 9],
          north: [8, 9],
        },
      },
    },
  });

const Pinky = () =>
  Sprite({
    tx: 10,
    ty: 10,
    name: 'pinky',
    spritesheet: {
      image: assets.get('pinky'),
      frameSets: {
        normal: {
          east: [0, 1],
          south: [2, 3],
          west: [4, 5],
          north: [6, 7],
        },
        scatter: {
          east: [8, 9],
          south: [8, 9],
          west: [8, 9],
          north: [8, 9],
        },
      },
    },
  });

const Clyde = () =>
  Sprite({
    tx: 9,
    ty: 9,
    name: 'clyde',
    spritesheet: {
      image: assets.get('clyde'),
      frameSets: {
        normal: {
          east: [0, 1],
          south: [2, 3],
          west: [4, 5],
          north: [6, 7],
        },
        scatter: {
          east: [8, 9],
          south: [8, 9],
          west: [8, 9],
          north: [8, 9],
        },
      },
    },
  });

const Blinky = () =>
  Sprite({
    tx: 8,
    ty: 10,
    name: 'blinky',
    spritesheet: {
      image: assets.get('blinky'),
      frameSets: {
        normal: {
          east: [0, 1],
          south: [2, 3],
          west: [4, 5],
          north: [6, 7],
        },
        scatter: {
          east: [8, 9],
          south: [8, 9],
          west: [8, 9],
          north: [8, 9],
        },
      },
    },
  });

const Game = () => ({
  dots,
  score: 0,
  scattering: false,
  fps: 60,
  tick: 100,
  lastTick: 0,
  lastFrame: 0,
  animationRef: 0,
  paused: false,
  stopped: true,
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  sprites: {
    pacman: Pacman(),
    ghosts: {
      inky: Inky(),
      pinky: Pinky(),
      clyde: Clyde(),
      blinky: Blinky(),
    },
  },
});

const getKeyByValue = (map, searchValue) => {
  for (let [key, value] of map.entries()) {
    if (JSON.stringify(value) === JSON.stringify(searchValue)) {
      return key;
    }
  }
};

const load = async (name, src) => {
  const image = await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.setAttribute('src', src);
  });

  assets.set(name, image);
};

const loop = (timestamp) => {
  if (game.stopped) return;
  game.animationRef = requestAnimationFrame(loop);
  if (game.paused) return;

  const tickInterval = 1000 / game.tick;
  if (timestamp - game.lastTick > tickInterval) {
    game.lastTick = timestamp;
    update();
  }

  const frameInterval = 1000 / game.fps;
  if (timestamp - game.lastFrame > frameInterval) {
    game.lastFrame = timestamp;
    draw();
  }
};

const draw = () => {
  clear();
  drawTiles();
  drawSprite(game.sprites.ghosts.inky);
  drawSprite(game.sprites.ghosts.pinky);
  drawSprite(game.sprites.ghosts.clyde);
  drawSprite(game.sprites.ghosts.blinky);
  drawSprite(game.sprites.pacman);
};

const drawTile = (tile) => {
  const x = tile.x * tileSize;
  const y = tile.y * tileSize;
  context.beginPath();
  context.drawImage(tile.image, x, y);
  context.closePath();
};

const drawTiles = () => {
  game.grid.forEach((row) => row.forEach((tile) => drawTile(tile)));
};

const drawSprite = (sprite) => {
  // Update animation
  const animation = sprite.animation;
  animation.count += 1;
  if (animation.count >= animation.delay) {
    const direction = getKeyByValue(directions, sprite.direction);
    const frameSet = animation.frameSets[sprite.mode][direction];
    animation.count = 0;
    animation.frameIndex = (animation.frameIndex + 1) % frameSet.length;
    animation.frame = frameSet.at(animation.frameIndex);
  }

  // Draw current frame from spritesheet
  const img = sprite.spritesheet.image;
  const dx = animation.frame * spriteSize;
  const dy = 0;
  const dw = spriteSize;
  const dh = spriteSize;
  const x = sprite.x;
  const y = sprite.y;
  const sx = spriteSize;
  const sy = spriteSize;

  context.beginPath();
  context.drawImage(img, dx, dy, dw, dh, x, y, sx, sy);
  context.closePath();
};

const clear = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const stop = () => {
  cancelAnimationFrame(game.animationRef);
  game.stopped = true;
  game.animationRef = 0;
};

const reset = () => {
  const g = Game();
  game.grid = g.grid.map((row, y) => row.map((value, x) => Tile({ x, y, value })));
  game.lastTick = 0;
  game.lastFrame = 0;
  game.sprites = {
    pacman: Pacman(),
    ghosts: {
      inky: Inky(),
      pinky: Pinky(),
      clyde: Clyde(),
      blinky: Blinky(),
    },
  };
};

const start = () => {
  stop();
  reset();

  game.paused = false;
  game.stopped = false;

  loop(0);
};

const getTileAt = (x, y) => {
  const row = game.grid.at(y);
  const tile = row.at(x);

  return tile;
};

const getTileByCoords = (x, y) => {
  const tx = Math.floor(x / spriteSize);
  const ty = Math.floor(y / spriteSize);

  return getTileAt(tx, ty);
};

const setGhostIntention = (sprite, target) => {
  const current = getTileByCoords(sprite.x, sprite.y);
  const path = getPathBetween(current, target);
  const next = path.at(0);

  if (next) {
    const intention = { x: next.x - current.x, y: next.y - current.y };
    const direction = getKeyByValue(directions, intention);
    if (direction) {
      sprite.intention = intention;
    }
  }
};

const update = () => {
  updateInky();
  updatePinky();
  updateClyde();
  updateBlinky();
  updatePacman();
  updateGame();
};

const updateInky = () => {
  const inky = game.sprites.ghosts.inky;
  const pacman = game.sprites.pacman;

  if (!game.scattering) {
    const target = getTileByCoords(pacman.x, pacman.y);
    setGhostIntention(inky, target);
  }

  updateSprite(inky);
};

const updatePinky = () => {
  const pinky = game.sprites.ghosts.pinky;
  const pacman = game.sprites.pacman;

  if (game.scattering) {
    const target = getTileByCoords(1 * spriteSize, 1 * spriteSize);

    setGhostIntention(pinky, target);
  }

  if (!game.scattering) {
    const target = getTileByCoords(
      pacman.x + pacman.intention.x * pacman.speed * 2,
      pacman.y + pacman.intention.y * pacman.speed * 2
    );

    setGhostIntention(pinky, target);
  }

  updateSprite(pinky);
};

const updateClyde = () => {
  const clyde = game.sprites.ghosts.clyde;
  const pacman = game.sprites.pacman;

  if (!game.scattering) {
    const target = getTileByCoords(pacman.x, pacman.y);
    setGhostIntention(clyde, target);
  }

  updateSprite(clyde);
};

const updateBlinky = () => {
  const blinky = game.sprites.ghosts.blinky;
  const pacman = game.sprites.pacman;

  if (game.dots === dots * 0.5) {
    blinky.speed = 1.5;
  }

  if (!game.scattering) {
    const target = getTileByCoords(pacman.x, pacman.y);
    setGhostIntention(blinky, target);
  }

  updateSprite(blinky);
};

const updatePacman = () => {
  const pacman = game.sprites.pacman;
  const tile = getTileByCoords(pacman.x, pacman.y);

  // If pacman is over a tile with a dot, eat it
  if (tile.value === 1) {
    game.dots -= 1;
    game.score += 1;
    tile.value = 2;
    tile.image = assets.get(2);
  }

  // If pacman is over a pill, start the scatter mode
  if (tile.value === 4) {
    tile.value = 2;
    tile.image = assets.get(2);
    scatter();
  }

  updateSprite(pacman);
};

const updateSprite = (sprite) => {
  // Calculate next intended position
  const inx1 = sprite.x + sprite.speed * sprite.intention.x;
  const iny1 = sprite.y + sprite.speed * sprite.intention.y;
  const inx2 = sprite.x + sprite.speed * sprite.intention.x + (tileSize - 1);
  const iny2 = sprite.y + sprite.speed * sprite.intention.y + (tileSize - 1);

  // Get tiles for each corner
  const itl = getTileByCoords(inx1, iny1);
  const itr = getTileByCoords(inx2, iny1);
  const ibl = getTileByCoords(inx1, iny2);
  const ibr = getTileByCoords(inx2, iny2);

  // Only update position is no corner will touch a wall
  if (itl.value !== 0 && itr.value !== 0 && ibl.value !== 0 && ibr.value !== 0) {
    sprite.direction = sprite.intention;
  }

  // Calculate actual next position
  const nx1 = sprite.x + sprite.speed * sprite.direction.x;
  const ny1 = sprite.y + sprite.speed * sprite.direction.y;
  const nx2 = sprite.x + sprite.speed * sprite.direction.x + (tileSize - 1);
  const ny2 = sprite.y + sprite.speed * sprite.direction.y + (tileSize - 1);

  // Get tiles for each corner
  const tl = getTileByCoords(nx1, ny1);
  const tr = getTileByCoords(nx2, ny1);
  const bl = getTileByCoords(nx1, ny2);
  const br = getTileByCoords(nx2, ny2);

  // Only update position is no corner will touch a wall
  if (tl.value !== 0 && tr.value !== 0 && bl.value !== 0 && br.value !== 0) {
    sprite.x += sprite.speed * sprite.direction.x;
    sprite.y += sprite.speed * sprite.direction.y;
  }
};

const updateGame = () => {
  // If all dots are eaten stop the game
  if (game.dots === 0) {
    stop();
  }

  // Check collisions
  const s = spriteSize;
  const b = game.sprites.pacman;
  const ghosts = game.sprites.ghosts;
  for (const key in ghosts) {
    const a = ghosts[key];
    if (!(a.y + s < b.y || a.y > b.y + s || a.x + s < b.x || a.x > b.x + s)) {
      // If scattering, eat ghost
      if (game.scattering) {
        // eat ghost
        a.x = 10 * spriteSize;
        a.y = 10 * spriteSize;

        continue;
      }

      // Otherwise play death animation
    }
  }
};

const scatter = () => {
  game.scattering = true;

  // Scatter ghosts
  const ghosts = game.sprites.ghosts;
  const pacman = game.sprites.pacman;
  for (const key in ghosts) {
    const ghost = ghosts[key];
    ghost.mode = modes.get('scatter');
  }

  // Speed up pacman
  game.tick = 200;
  pacman.animation.delay = 2;

  // Reset everything
  const timeout = setTimeout(() => {
    for (const key in ghosts) {
      const ghost = ghosts[key];
      ghost.mode = modes.get('normal');
    }

    game.tick = 100;
    pacman.animation.delay = 4;

    clearTimeout(timeout);
  }, 10000);
};

const hash = (tile) => {
  const a = String.fromCharCode(tile.x + 65);
  const b = tile.y;

  return a + b;
};

const getPathFromLeaf = (tree, leaf) => {
  let x = 50;
  let path = [];
  let current = leaf;
  while (x > 0 && current && tree[hash(current)]) {
    x--;
    path.unshift(current);
    current = tree[hash(current)];
  }

  return path;
};

const getPathBetween = (a, b) => {
  let x = 100;

  const tree = {};
  const visited = [];
  const frontier = [a];
  while (x > 0 && frontier.length) {
    x--;

    const current = frontier.shift();

    // Visit current
    visited.push(hash(current));

    if (current.x === b.x && current.y === b.y) {
      return getPathFromLeaf(tree, current);
    }

    // Expore neighbors
    const neighbors = [
      getTileAt(current.x + 1, current.y + 0),
      getTileAt(current.x - 1, current.y + 0),
      getTileAt(current.x + 0, current.y + 1),
      getTileAt(current.x - 0, current.y - 1),
    ];

    for (const neighbor of neighbors) {
      // if neighbor hasn't been visited and isn't a wall
      if (neighbor && !visited.includes(hash(neighbor))) {
        if (neighbor.value !== 0) {
          frontier.push(neighbor);
          tree[hash(neighbor)] = current;
        }
      }
    }
  }

  return [];
};

const game = Game();

window.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase();
  switch (key) {
    case 'W':
      game.sprites.pacman.intention = directions.get('north');
      break;
    case 'A':
      game.sprites.pacman.intention = directions.get('west');
      break;
    case 'S':
      game.sprites.pacman.intention = directions.get('south');
      break;
    case 'D':
      game.sprites.pacman.intention = directions.get('east');
      break;
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  await load(1, './assets/images/dot.png');
  await load(4, './assets/images/pill.png');
  await load('inky', './assets/images/inky.png');
  await load(0, './assets/images/blue.png');
  await load(2, './assets/images/black.png');
  await load(3, './assets/images/black.png');
  await load('pinky', './assets/images/pinky.png');
  await load('clyde', './assets/images/clyde.png');
  await load('blinky', './assets/images/blinky.png');
  await load('pacman', './assets/images/pacman.png');

  reset();
  draw();
  start();

  document.body.appendChild(canvas);
});
