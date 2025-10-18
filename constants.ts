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
