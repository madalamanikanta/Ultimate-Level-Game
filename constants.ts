export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PLAYER_SPEED = 350;
export const PLAYER_JUMP_VELOCITY = -700;
export const GRAVITY = 1500;

export const COIN_VALUE = 10;

// Dash Constants
export const DASH_VELOCITY = 1000;
export const DASH_DURATION = 150; // ms
export const DASH_COOLDOWN = 1500; // ms

// Power-up Constants
export const SPEED_BOOST_MODIFIER = 1.5;
export const SPEED_BOOST_DURATION = 5000; // in ms
export const JUMP_BOOST_MODIFIER = 1.25;
export const JUMP_BOOST_DURATION = 10000; // in ms

// Enemy Constants
export const ENEMY_SPEED = 100;
export const BOSS_HEALTH = 10;

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
    { // Level 1: The Basics (Original 1)
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
        movingPlatforms: [],
        coins: [
            { x: 450, y: GAME_HEIGHT - 180 },
            { x: 800, y: GAME_HEIGHT - 280 },
            { x: 500, y: GAME_HEIGHT - 410 },
            { x: 900, y: GAME_HEIGHT - 530 }
        ],
        powerups: [],
        traps: [
            { x: 1100, y: GAME_HEIGHT - 50 },
        ],
        enemies: [
            { type: 'snake', x: 850, y: GAME_HEIGHT - 280, velocityX: ENEMY_SPEED },
        ],
        hazards: [],
        vines: [ { x: 600, y: GAME_HEIGHT - 500 } ],
        dripSpawners: [ { x: 800, y: 0 } ]
    },
    { // Level 2: Going Up (Original 2)
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
        movingPlatforms: [],
        coins: [
            { x: 400, y: GAME_HEIGHT - 210 },
            { x: 200, y: GAME_HEIGHT - 330 },
            { x: 600, y: GAME_HEIGHT - 430 },
            { x: 900, y: GAME_HEIGHT - 330 },
            { x: 800, y: GAME_HEIGHT - 610 },
            { x: 500, y: 270 },
            { x: 900, y: 170 },
        ],
        powerups: [ { x: 620, y: GAME_HEIGHT - 430, type: 'jump' } ],
        traps: [ { x: 850, y: GAME_HEIGHT - 300 } ],
        enemies: [
            { type: 'snake', x: 450, y: GAME_HEIGHT - 180, velocityX: -ENEMY_SPEED },
            { type: 'snake', x: 650, y: GAME_HEIGHT - 400, velocityX: ENEMY_SPEED },
        ],
        hazards: []
    },
    { // Level 3: First Steps on Air (Original 6)
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH - 100, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: GAME_WIDTH - 150, y: 164 },
        ],
        movingPlatforms: [
            { x: 400, y: GAME_HEIGHT - 150, moveType: 'horizontal', distance: 300, duration: 4000 },
            { x: 800, y: GAME_HEIGHT - 300, moveType: 'vertical', distance: -150, duration: 2500 },
            { x: 600, y: GAME_HEIGHT - 500, moveType: 'horizontal', distance: -300, duration: 3000 },
            { x: 300, y: 300, moveType: 'vertical', distance: 150, duration: 2500 },
        ],
        coins: [
            { x: 550, y: GAME_HEIGHT - 180 },
            { x: 800, y: GAME_HEIGHT - 400 },
            { x: 450, y: GAME_HEIGHT - 530 },
            { x: 300, y: 350 },
        ],
        powerups: [ { x: 150, y: GAME_HEIGHT - 80, type: 'shield' } ],
        traps: [],
        enemies: [],
        hazards: []
    },
    { // Level 4: The Elevator (Original 7)
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH - 100, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 400, y: GAME_HEIGHT - 50 },
            { x: GAME_WIDTH - 150, y: 164 },
        ],
        movingPlatforms: [
            { x: 250, y: GAME_HEIGHT - 200, moveType: 'vertical', distance: -400, duration: 5000 },
            { x: 600, y: 200, moveType: 'horizontal', distance: 400, duration: 3000 },
        ],
        coins: [
            { x: 250, y: GAME_HEIGHT - 300 },
            { x: 250, y: GAME_HEIGHT - 500 },
            { x: 800, y: 170 },
        ],
        powerups: [],
        traps: [ { x: 350, y: GAME_HEIGHT - 50 } ],
        enemies: [
             { type: 'snake', x: 650, y: 200, velocityX: ENEMY_SPEED },
             { type: 'bat', x: 450, y: 350 },
        ],
        hazards: [ { type: 'geyser', x: 400, y: GAME_HEIGHT - 50 } ],
        vines: [ { x: 800, y: 210 } ],
        dripSpawners: [ { x: 250, y: 0 } ]
    },
    { // Level 5: BOSS BATTLE 1 (Original 5)
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 184 },
        platforms: [
            { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, scaleX: 10 },
            { x: 200, y: GAME_HEIGHT - 250 },
            { x: GAME_WIDTH - 200, y: GAME_HEIGHT - 250 }
        ],
        movingPlatforms: [],
        coins: [],
        powerups: [{ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80, type: 'shield' }],
        traps: [],
        enemies: [],
        boss: { type: 'gorilla', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 150, attackPattern: 1 },
        hazards: [],
        vines: [],
        dripSpawners: [],
    },
    { // Level 6: The Descent (Original 4)
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
        movingPlatforms: [],
        coins: [
            { x: 400, y: 270 }, { x: 430, y: 270 },
            { x: 100, y: 420 },
            ...Array.from({ length: 5 }, (_, i) => ({ x: 800 + i * 40, y: GAME_HEIGHT - 230 })),
             { x: 1100, y: GAME_HEIGHT - 330 }
        ],
        powerups: [ { x: 950, y: GAME_HEIGHT - 480, type: 'shield' } ],
        traps: [
            { x: 500, y: GAME_HEIGHT - 100 },
            { x: 1050, y: GAME_HEIGHT - 300 },
        ],
        enemies: [
            { type: 'snake', x: 400, y: GAME_HEIGHT - 100, velocityX: ENEMY_SPEED },
        ],
        hazards: [ { type: 'falling_rock_spawner', x: 870, y: 0, width: 300, height: GAME_HEIGHT } ],
        vines: [],
        dripSpawners: [],
    },
    { // Level 7: The Gap (Original 9)
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 200, y: GAME_HEIGHT - 50, scaleX: 2 },
            { x: GAME_WIDTH - 200, y: GAME_HEIGHT - 50, scaleX: 2 },
        ],
        movingPlatforms: [
            { x: 500, y: GAME_HEIGHT - 200, moveType: 'horizontal', distance: 280, duration: 2000, scaleX: 0.5 },
        ],
        coins: [],
        powerups: [ { x: 100, y: GAME_HEIGHT - 80, type: 'jump' } ],
        traps: [ { x: 600, y: GAME_HEIGHT - 50 } ],
        enemies: [],
        hazards: [
            { type: 'quicksand', x: 640, y: GAME_HEIGHT - 20, width: 250, height: 40 }
        ],
        vines: [],
        dripSpawners: [],
    },
    { // Level 8: Risky Ride (Original 8)
        playerStart: { x: 100, y: 100 },
        goal: { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: 164 },
        ],
        movingPlatforms: [
            { x: 200, y: 300, moveType: 'horizontal', distance: 800, duration: 6000 },
            { x: 1000, y: 450, moveType: 'horizontal', distance: -800, duration: 7000 },
            { x: 200, y: 600, moveType: 'horizontal', distance: 800, duration: 5000 },
        ],
        coins: [
             ...Array.from({ length: 5 }, (_, i) => ({ x: 500 + i * 40, y: 270 })),
             ...Array.from({ length: 5 }, (_, i) => ({ x: 400 + i * 40, y: 420 })),
        ],
        powerups: [ { x: 150, y: 570, type: 'shield' } ],
        traps: [
            { x: 600, y: 300 },
            { x: 500, y: 450 },
        ],
        enemies: [
             { type: 'snake', x: 250, y: 600, velocityX: ENEMY_SPEED },
             { type: 'snake', x: 950, y: 600, velocityX: -ENEMY_SPEED },
        ],
        hazards: [],
        vines: [],
        dripSpawners: [],
    },
    { // Level 9: Gauntlet (Original 11)
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 300, y: 600, moveType: 'horizontal', distance: 200, duration: 2000 },
            { x: 700, y: 500, moveType: 'vertical', distance: -200, duration: 3000 },
            { x: 500, y: 250, moveType: 'horizontal', distance: 400, duration: 4000 },
        ],
        coins: [],
        powerups: [],
        traps: [
             { x: 400, y: 600 },
             { x: 700, y: 284 }
        ],
        enemies: [
             { type: 'snake', x: 550, y: 250, velocityX: ENEMY_SPEED },
             { type: 'bat', x: 700, y: 150 },
        ],
        hazards: [],
        vines: [],
        dripSpawners: [],
    },
    { // Level 10: FINAL BOSS (Original 10)
        playerStart: { x: 100, y: 100 },
        goal: { x: GAME_WIDTH - 100, y: GAME_HEIGHT - 184 },
        platforms: [
            { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, scaleX: 10 },
            { x: 150, y: 164 },
        ],
        movingPlatforms: [
            { x: 400, y: GAME_HEIGHT - 250, moveType: 'vertical', distance: -150, duration: 2000 },
            { x: GAME_WIDTH - 400, y: GAME_HEIGHT - 400, moveType: 'vertical', distance: 150, duration: 2000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [],
        boss: { type: 'gorilla', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 150, attackPattern: 2 },
        hazards: [],
        vines: [],
        dripSpawners: [],
    },
];