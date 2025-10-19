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
        movingPlatforms: [],
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
        movingPlatforms: [],
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
        movingPlatforms: [],
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
        movingPlatforms: [],
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
        movingPlatforms: [],
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
    },
    // NEW LEVELS START HERE
    { // Level 6: First Steps on Air
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
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 7: The Elevator
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
             { x: 650, y: 200, velocityX: ENEMY_SPEED },
        ],
    },
    { // Level 8: Risky Ride
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
             { x: 250, y: 600, velocityX: ENEMY_SPEED },
             { x: 950, y: 600, velocityX: -ENEMY_SPEED },
        ],
    },
    { // Level 9: The Gap
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
    },
    { // Level 10: Triple Threat
        playerStart: { x: 100, y: 100 },
        goal: { x: 100, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: 164 },
            { x: 150, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 400, y: 200, moveType: 'vertical', distance: 400, duration: 3000 },
            { x: 700, y: 600, moveType: 'vertical', distance: -400, duration: 3000 },
            { x: 1000, y: 200, moveType: 'vertical', distance: 400, duration: 3000 },
        ],
        coins: [
            { x: 400, y: 400 },
            { x: 700, y: 400 },
            { x: 1000, y: 400 },
        ],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 11
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
             { x: 550, y: 250, velocityX: ENEMY_SPEED }
        ],
    },
    { // Level 12
        playerStart: { x: 640, y: 100 },
        goal: { x: 640, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 640, y: 164, scaleX: 0.5 },
            { x: 640, y: GAME_HEIGHT-50, scaleX: 0.5 },
        ],
        movingPlatforms: [
            { x: 200, y: 250, moveType: 'horizontal', distance: 880, duration: 5000 },
            { x: 1080, y: 400, moveType: 'horizontal', distance: -880, duration: 5000 },
            { x: 200, y: 550, moveType: 'horizontal', distance: 880, duration: 5000 },
        ],
        coins: [
            ...Array.from({ length: 10 }, (_, i) => ({ x: 300 + i * 80, y: 220 })),
            ...Array.from({ length: 10 }, (_, i) => ({ x: 300 + i * 80, y: 370 })),
            ...Array.from({ length: 10 }, (_, i) => ({ x: 300 + i * 80, y: 520 })),
        ],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 13
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 1180, y: GAME_HEIGHT-50 },
        ],
        movingPlatforms: [
            { x: 300, y: 650, moveType: 'vertical', distance: -100, duration: 1500 },
            { x: 450, y: 550, moveType: 'vertical', distance: 100, duration: 1500 },
            { x: 600, y: 650, moveType: 'vertical', distance: -100, duration: 1500 },
            { x: 750, y: 550, moveType: 'vertical', distance: 100, duration: 1500 },
            { x: 900, y: 650, moveType: 'vertical', distance: -100, duration: 1500 },
        ],
        coins: [],
        powerups: [],
        traps: [
            { x: 100, y: GAME_HEIGHT-50}, { x: 164, y: GAME_HEIGHT-50}, { x: 228, y: GAME_HEIGHT-50},
            { x: 1116, y: GAME_HEIGHT-50}, { x: 1052, y: GAME_HEIGHT-50},
        ],
        enemies: [
             { x: 450, y: 400, velocityX: ENEMY_SPEED }
        ],
    },
    { // Level 14
        playerStart: { x: 100, y: 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: 164 },
        ],
        movingPlatforms: [
            { x: 200, y: 650, moveType: 'horizontal', distance: 900, duration: 3000 },
            { x: 400, y: 450, moveType: 'horizontal', distance: 500, duration: 2000 },
            { x: 600, y: 250, moveType: 'horizontal', distance: 500, duration: 4000 },
        ],
        coins: [],
        powerups: [
             { x: 1100, y: 620, type: 'shield' }
        ],
        traps: [],
        enemies: [
            { x: 400, y: 450, velocityX: -ENEMY_SPEED },
            { x: 900, y: 450, velocityX: ENEMY_SPEED },
            { x: 1100, y: 250, velocityX: -ENEMY_SPEED },
        ],
    },
    { // Level 15
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 640, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 350, y: GAME_HEIGHT - 50 },
            { x: 640, y: 164 },
        ],
        movingPlatforms: [
            { x: 250, y: 600, moveType: 'vertical', distance: -400, duration: 2000 },
            { x: 450, y: 200, moveType: 'vertical', distance: 400, duration: 2000 },
        ],
        coins: [],
        powerups: [],
        traps: [
            { x: 280, y: GAME_HEIGHT - 50 }
        ],
        enemies: [],
    },
    { // Level 16
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 300, y: 650, moveType: 'horizontal', distance: 100, duration: 2000 },
            { x: 550, y: 550, moveType: 'horizontal', distance: 100, duration: 2000 },
            { x: 800, y: 450, moveType: 'horizontal', distance: 100, duration: 2000 },
            { x: 1050, y: 350, moveType: 'horizontal', distance: 100, duration: 2000 },
        ],
        coins: [
            { x: 1150, y: 320 }
        ],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 17
        playerStart: { x: 100, y: 100 },
        goal: { x: 1180, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: 164 },
            { x: 1180, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 300, y: 250, moveType: 'vertical', distance: 300, duration: 3000 },
            { x: 500, y: 550, moveType: 'vertical', distance: -300, duration: 3000 },
            { x: 700, y: 250, moveType: 'vertical', distance: 300, duration: 3000 },
            { x: 900, y: 550, moveType: 'vertical', distance: -300, duration: 3000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 18
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 1180, y: 164 },
        ],
        movingPlatforms: [
            { x: 400, y: 600, moveType: 'horizontal', distance: 600, duration: 4000 },
        ],
        coins: [],
        powerups: [],
        traps: [ { x: 600, y: 600 }, { x: 800, y: 600 } ],
        enemies: [
             { x: 400, y: 600, velocityX: ENEMY_SPEED }
        ],
    },
    { // Level 19
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 1180, y: GAME_HEIGHT-50 },
        ],
        movingPlatforms: [
            { x: 400, y: 600, moveType: 'horizontal', distance: 200, duration: 3000, scaleX: 0.5 },
            { x: 800, y: 500, moveType: 'horizontal', distance: -200, duration: 3000, scaleX: 0.5 },
            { x: 600, y: 400, moveType: 'horizontal', distance: 200, duration: 3000, scaleX: 0.5 },
            { x: 400, y: 300, moveType: 'horizontal', distance: -200, duration: 3000, scaleX: 0.5 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 20
        playerStart: { x: 640, y: 650 },
        goal: { x: 640, y: 100 },
        platforms: [
            { x: 640, y: 700 },
            { x: 640, y: 164 },
        ],
        movingPlatforms: [
            { x: 100, y: 600, moveType: 'horizontal', distance: 1080, duration: 8000 },
            { x: 1180, y: 450, moveType: 'horizontal', distance: -1080, duration: 8000 },
            { x: 100, y: 300, moveType: 'horizontal', distance: 1080, duration: 8000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [
            { x: 100, y: 600, velocityX: ENEMY_SPEED },
            { x: 1080, y: 450, velocityX: -ENEMY_SPEED },
            { x: 100, y: 300, velocityX: ENEMY_SPEED },
        ],
    },
    { // Level 21
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 250, y: 600, moveType: 'vertical', distance: -500, duration: 3000 },
            { x: 450, y: 100, moveType: 'vertical', distance: 500, duration: 3000 },
            { x: 650, y: 600, moveType: 'vertical', distance: -500, duration: 3000 },
            { x: 850, y: 100, moveType: 'vertical', distance: 500, duration: 3000 },
            { x: 1050, y: 600, moveType: 'vertical', distance: -500, duration: 3000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 22
        playerStart: { x: 100, y: 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: 164 },
            { x: 1180, y: 164 },
        ],
        movingPlatforms: [
            { x: 100, y: 300, moveType: 'horizontal', distance: 300, duration: 2000 },
            { x: 1180, y: 450, moveType: 'horizontal', distance: -300, duration: 2000 },
            { x: 100, y: 600, moveType: 'horizontal', distance: 1080, duration: 8000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [
             { x: 100, y: 600, velocityX: ENEMY_SPEED },
             { x: 640, y: 600, velocityX: ENEMY_SPEED },
             { x: 1180, y: 600, velocityX: -ENEMY_SPEED },
        ],
    },
    { // Level 23
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 1180, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 300, y: 600, moveType: 'horizontal', distance: 780, duration: 5000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [
             { x: 300, y: 600, velocityX: ENEMY_SPEED },
             { x: 640, y: 600, velocityX: -ENEMY_SPEED },
             { x: 1080, y: 600, velocityX: ENEMY_SPEED },
        ],
    },
    { // Level 24
        playerStart: { x: 100, y: 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: 164 },
            { x: 1180, y: 164 },
        ],
        movingPlatforms: [
            { x: 250, y: 250, moveType: 'vertical', distance: 400, duration: 1500 },
            { x: 450, y: 650, moveType: 'vertical', distance: -400, duration: 1500 },
            { x: 650, y: 250, moveType: 'vertical', distance: 400, duration: 1500 },
            { x: 850, y: 650, moveType: 'vertical', distance: -400, duration: 1500 },
            { x: 1050, y: 250, moveType: 'vertical', distance: 400, duration: 1500 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 25
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 300, y: 600, moveType: 'horizontal', distance: 200, duration: 4000 },
            { x: 600, y: 500, moveType: 'horizontal', distance: 200, duration: 4000 },
            { x: 900, y: 400, moveType: 'horizontal', distance: 200, duration: 4000 },
            { x: 1100, y: 300, moveType: 'horizontal', distance: 50, duration: 4000 },
        ],
        coins: [],
        powerups: [],
        traps: [
            { x: 400, y: 600 },
            { x: 700, y: 500 },
            { x: 1000, y: 400 },
        ],
        enemies: [],
    },
    { // Level 26
        playerStart: { x: 100, y: 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: 164 },
        ],
        movingPlatforms: [
            { x: 200, y: 250, moveType: 'vertical', distance: 400, duration: 2000 },
            { x: 350, y: 650, moveType: 'vertical', distance: -400, duration: 2000 },
            { x: 500, y: 250, moveType: 'vertical', distance: 400, duration: 2000 },
            { x: 650, y: 650, moveType: 'vertical', distance: -400, duration: 2000 },
            { x: 800, y: 250, moveType: 'vertical', distance: 400, duration: 2000 },
            { x: 950, y: 650, moveType: 'vertical', distance: -400, duration: 2000 },
            { x: 1100, y: 250, moveType: 'vertical', distance: 400, duration: 2000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [],
    },
    { // Level 27
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
        ],
        movingPlatforms: [
            { x: 250, y: 600, moveType: 'horizontal', distance: 880, duration: 10000 },
        ],
        coins: [],
        powerups: [],
        traps: [
            { x: 400, y: 600 }, { x: 464, y: 600 },
            { x: 700, y: 600 }, { x: 764, y: 600 },
            { x: 1000, y: 600 }, { x: 1064, y: 600 },
        ],
        enemies: [
             { x: 250, y: 600, velocityX: ENEMY_SPEED },
             { x: 1130, y: 600, velocityX: -ENEMY_SPEED },
        ],
    },
    { // Level 28
        playerStart: { x: 100, y: 100 },
        goal: { x: 200, y: GAME_HEIGHT - 116 },
        platforms: [
            { x: 150, y: 164 },
            { x: 200, y: GAME_HEIGHT - 50 }
        ],
        movingPlatforms: [
            { x: 300, y: 200, moveType: 'vertical', distance: 450, duration: 2000 },
            { x: 500, y: 650, moveType: 'vertical', distance: -450, duration: 2000 },
            { x: 700, y: 200, moveType: 'vertical', distance: 450, duration: 2000 },
            { x: 900, y: 650, moveType: 'vertical', distance: -450, duration: 2000 },
            { x: 1100, y: 200, moveType: 'horizontal', distance: -1000, duration: 8000 },
        ],
        coins: [],
        powerups: [],
        traps: [],
        enemies: [
             { x: 1100, y: 200, velocityX: -ENEMY_SPEED },
             { x: 600, y: 200, velocityX: -ENEMY_SPEED },
        ],
    },
    { // Level 29
        playerStart: { x: 100, y: GAME_HEIGHT - 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: GAME_HEIGHT - 50 },
            { x: 1180, y: 164 },
        ],
        movingPlatforms: [
            { x: 300, y: 600, moveType: 'horizontal', distance: 800, duration: 6000 },
            { x: 1100, y: 450, moveType: 'horizontal', distance: -800, duration: 6000 },
            { x: 300, y: 300, moveType: 'horizontal', distance: 800, duration: 6000 },
        ],
        coins: [],
        powerups: [],
        traps: [
            { x: 500, y: 600 }, { x: 900, y: 600 },
            { x: 400, y: 450 }, { x: 800, y: 450 },
            { x: 500, y: 300 }, { x: 900, y: 300 },
        ],
        enemies: [],
    },
    { // Level 30
        playerStart: { x: 100, y: 100 },
        goal: { x: 1180, y: 100 },
        platforms: [
            { x: 150, y: 164 },
            { x: 1180, y: 164 },
        ],
        movingPlatforms: [
            { x: 200, y: 200, moveType: 'vertical', distance: 450, duration: 1500 },
            { x: 350, y: 650, moveType: 'vertical', distance: -450, duration: 1500 },
            { x: 500, y: 200, moveType: 'vertical', distance: 450, duration: 1500 },
            { x: 650, y: 650, moveType: 'vertical', distance: -450, duration: 1500 },
            { x: 800, y: 200, moveType: 'vertical', distance: 450, duration: 1500 },
            { x: 950, y: 650, moveType: 'vertical', distance: -450, duration: 1500 },
            { x: 1100, y: 200, moveType: 'vertical', distance: 450, duration: 1500 },
        ],
        coins: [],
        powerups: [],
        traps: [
            { x: 1180, y: GAME_HEIGHT-50 },
        ],
        enemies: [
             { x: 200, y: 200, velocityX: ENEMY_SPEED },
             { x: 350, y: 650, velocityX: ENEMY_SPEED },
             { x: 500, y: 200, velocityX: ENEMY_SPEED },
             { x: 650, y: 650, velocityX: ENEMY_SPEED },
        ],
    },
];