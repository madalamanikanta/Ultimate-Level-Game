export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PLAYER_SPEED = 350;
export const PLAYER_JUMP_VELOCITY = -700;
export const GRAVITY = 1500;

export const COIN_VALUE = 10;

// Power-up Constants
export const SPEED_BOOST_MODIFIER = 1.5;
export const SPEED_BOOST_DURATION = 5000; // in ms
export const JUMP_BOOST_MODIFIER = 1.25;
export const JUMP_BOOST_DURATION = 10000; // in ms

// Enemy Constants
export const ENEMY_SPEED = 100;

// Daily Challenge Constants
export const DAILY_CHALLENGE_REWARD = 50;

export const CHALLENGES = [
    {
        id: 'collect_10_coins',
        description: 'Collect 10 coins',
        goal: 10,
        type: 'coins',
        progressText: (progress: number) => `Collect coins (${progress}/10)`
    },
    {
        id: 'finish_under_45',
        description: 'Finish in under 45 seconds',
        goal: 45,
        type: 'time',
        progressText: (progress: number) => `Time: ${progress.toFixed(1)}s / 45s`
    },
    {
        id: 'stomp_enemy',
        description: 'Defeat the enemy',
        goal: 1,
        type: 'enemy',
        progressText: (progress: number) => `Defeat enemy (${progress}/1)`
    }
];

export const LEVELS = [
    { // Level 1
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH - 50, y: GAME_HEIGHT - 184 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 450, y: GAME_HEIGHT - 150, scaleX: 0.7 },
            { x: 800, y: GAME_HEIGHT - 250 },
            { x: 500, y: GAME_HEIGHT - 380, scaleX: 0.5 },
            { x: 900, y: GAME_HEIGHT - 500 },
            { x: 1200, y: GAME_HEIGHT - 350, scaleX: 0.8 },
            { x: GAME_WIDTH - 50, y: GAME_HEIGHT - 120, scaleX: 0.5 },
        ],
        coins: [
            ...Array.from({ length: 10 }, (_, i) => ({ x: 400 + i * 50, y: GAME_HEIGHT - 450 }))
        ],
        powerups: [
            { x: 840, y: GAME_HEIGHT - 280, type: 'speed' },
            { x: 500, y: GAME_HEIGHT - 150, type: 'shield' },
            { x: 940, y: GAME_HEIGHT - 530, type: 'jump' },
        ],
        traps: [
            { x: 1100, y: GAME_HEIGHT - 50 },
        ],
        enemies: [
            { x: 850, y: GAME_HEIGHT - 280, velocityX: ENEMY_SPEED },
        ],
    },
    { // Level 2
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH - 100, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 400, y: GAME_HEIGHT - 180 },
            { x: 200, y: GAME_HEIGHT - 300, scaleX: 0.5 },
            { x: 600, y: GAME_HEIGHT - 400 },
            { x: 900, y: GAME_HEIGHT - 300 },
            { x: 1100, y: GAME_HEIGHT - 450, scaleX: 0.5 },
            { x: 800, y: GAME_HEIGHT - 580 },
            { x: 500, y: 300 },
            { x: 900, y: 200 },
            { x: GAME_WIDTH - 150, y: 164 },
        ],
        coins: [
            { x: 400, y: GAME_HEIGHT - 210 },
            { x: 430, y: GAME_HEIGHT - 210 },
            { x: 200, y: GAME_HEIGHT - 330 },
            { x: 600, y: GAME_HEIGHT - 430 },
            { x: 900, y: GAME_HEIGHT - 330 },
            { x: 800, y: GAME_HEIGHT - 610 },
            { x: 500, y: 270 },
            { x: 900, y: 170 },
        ],
        powerups: [
            { x: 620, y: GAME_HEIGHT - 430, type: 'jump' },
        ],
        traps: [
            { x: 850, y: GAME_HEIGHT - 300 },
        ],
        enemies: [
            { x: 450, y: GAME_HEIGHT - 180, velocityX: -ENEMY_SPEED },
            { x: 650, y: GAME_HEIGHT - 400, velocityX: ENEMY_SPEED },
        ],
    },
    { // Level 3
        playerStart: { x: 100, y: 100 },
        goal: { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: 164 },
            { x: 450, y: 250 },
            { x: 200, y: 350 },
            { x: 500, y: 450 },
            { x: 800, y: 500 },
            { x: 1100, y: 400 },
            { x: 900, y: 300 },
            { x: 1200, y: 200 },
            { x: 100, y: GAME_HEIGHT - 200 },
            { x: 400, y: GAME_HEIGHT - 150 },
            { x: 700, y: GAME_HEIGHT - 250 },
            { x: GAME_WIDTH - 150, y: GAME_HEIGHT - 50 },
        ],
        coins: [
            { x: 450, y: 220 },
            { x: 200, y: 320 },
            { x: 500, y: 420 },
            { x: 800, y: 470 },
            { x: 1100, y: 370 },
            { x: 100, y: GAME_HEIGHT - 230 },
            { x: 400, y: GAME_HEIGHT - 180 },
            { x: 700, y: GAME_HEIGHT - 280 },
        ],
        powerups: [
             { x: 100, y: GAME_HEIGHT - 230, type: 'shield' },
        ],
        traps: [
            { x: 400, y: 250 },
            { x: 750, y: 500 },
            { x: 350, y: GAME_HEIGHT - 150 },
        ],
        enemies: [
            { x: 550, y: 450, velocityX: ENEMY_SPEED },
            { x: 1150, y: 400, velocityX: -ENEMY_SPEED },
            { x: 450, y: GAME_HEIGHT - 150, velocityX: ENEMY_SPEED },
        ],
    },
    { // Level 4: The Descent
        playerStart: { x: 100, y: 100 },
        goal: { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 584 },
        platforms: [
            { x: 150, y: 164, scaleX: 0.8 },
            { x: 400, y: 300 },
            { x: 100, y: 450, scaleX: 0.5 },
            { x: 350, y: GAME_HEIGHT - 100, scaleX: 2.5 },
            { x: 800, y: GAME_HEIGHT - 200 },
            { x: 1100, y: GAME_HEIGHT - 300 },
            { x: 950, y: GAME_HEIGHT - 450 },
            { x: GAME_WIDTH - 150, y: GAME_HEIGHT - 520 },
        ],
        coins: [
            { x: 400, y: 270 }, { x: 430, y: 270 }, { x: 460, y: 270 },
            { x: 100, y: 420 },
            ...Array.from({ length: 5 }, (_, i) => ({ x: 800 + i * 40, y: GAME_HEIGHT - 230 })),
             { x: 1100, y: GAME_HEIGHT - 330 }
        ],
        powerups: [
            { x: 400, y: GAME_HEIGHT - 130, type: 'jump' },
            { x: 950, y: GAME_HEIGHT - 480, type: 'shield' },
        ],
        traps: [
            { x: 500, y: GAME_HEIGHT - 100 },
            { x: 1050, y: GAME_HEIGHT - 300 },
        ],
        enemies: [
            { x: 400, y: GAME_HEIGHT - 100, velocityX: ENEMY_SPEED },
            { x: 850, y: GAME_HEIGHT - 200, velocityX: -ENEMY_SPEED },
        ],
    },
    { // Level 5: The Gauntlet
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH - 100, y: 100 },
        platforms: [
            { x: 200, y: GAME_HEIGHT - 50, scaleX: 2 },
            { x: 550, y: GAME_HEIGHT - 100, scaleX: 0.3 },
            { x: 700, y: GAME_HEIGHT - 180, scaleX: 0.3 },
            { x: 550, y: GAME_HEIGHT - 280, scaleX: 0.3 },
            { x: 900, y: GAME_HEIGHT - 150, scaleX: 2 },
            { x: 1200, y: GAME_HEIGHT - 250 },
            { x: 900, y: GAME_HEIGHT - 350 },
            { x: 600, y: GAME_HEIGHT - 450 },
            { x: 300, y: 250, scaleX: 1.5 },
            { x: 700, y: 180 },
            { x: GAME_WIDTH - 150, y: 164 },
        ],
        coins: [
            ...Array.from({ length: 3 }, (_, i) => ({ x: 850 + i * 40, y: GAME_HEIGHT - 180 })),
            { x: 1200, y: GAME_HEIGHT - 280 },
            { x: 900, y: GAME_HEIGHT - 380 },
            { x: 300, y: 220 }, { x: 340, y: 220 },
            { x: 700, y: 150 }
        ],
        powerups: [
             { x: 200, y: GAME_HEIGHT - 80, type: 'speed' },
             { x: 1000, y: GAME_HEIGHT - 180, type: 'shield' },
        ],
        traps: [
            { x: 880, y: GAME_HEIGHT - 150 },
            { x: 960, y: GAME_HEIGHT - 150 },
            { x: 1040, y: GAME_HEIGHT - 150 },
            { x: 550, y: GAME_HEIGHT - 450 },
            { x: 350, y: 250 },
        ],
        enemies: [
            { x: 300, y: GAME_HEIGHT - 50, velocityX: ENEMY_SPEED },
            { x: 950, y: GAME_HEIGHT - 150, velocityX: -ENEMY_SPEED },
            { x: 650, y: GAME_HEIGHT - 450, velocityX: ENEMY_SPEED },
            { x: 750, y: 180, velocityX: ENEMY_SPEED },
        ],
    }
];