import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP_VELOCITY, GRAVITY, SPEED_BOOST_MODIFIER, SPEED_BOOST_DURATION, JUMP_BOOST_MODIFIER, JUMP_BOOST_DURATION, ENEMY_SPEED, CHALLENGES, DAILY_CHALLENGE_REWARD, LEVELS, DASH_VELOCITY, DASH_DURATION, DASH_COOLDOWN, BOSS_HEALTH } from './constants';

class MainMenuScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;
    make!: Phaser.GameObjects.GameObjectCreator;

    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    preload() {
        const bgGraphics = this.make.graphics();
        bgGraphics.fillStyle(0x87ceeb);
        bgGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        bgGraphics.fillStyle(0x1e4620, 0.5);
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * GAME_WIDTH;
            const h = 100 + Math.random() * 150;
            const w = 40 + Math.random() * 40;
            bgGraphics.fillEllipse(x, GAME_HEIGHT - h/2 + 50, w, h);
        }
         bgGraphics.fillStyle(0x2f6b2f, 0.7);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * GAME_WIDTH;
            const h = 150 + Math.random() * 200;
            const w = 50 + Math.random() * 50;
            bgGraphics.fillEllipse(x, GAME_HEIGHT - h/2 + 80, w, h);
        }
        bgGraphics.generateTexture('background', GAME_WIDTH, GAME_HEIGHT);
        bgGraphics.destroy();
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, 'Ultimate Level Challenge', {
            fontSize: '64px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Daily Challenge Display
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const challengeIndex = dayOfYear % CHALLENGES.length;
        const todayChallenge = CHALLENGES[challengeIndex];
        
        const lastCompletion = localStorage.getItem('challengeCompletedDate');
        const today = new Date().toDateString();
        const isCompleted = lastCompletion === today;

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Daily Challenge:', {
            fontSize: '32px',
            color: '#2d3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, todayChallenge.description, {
            fontSize: '28px',
            color: '#1a202c',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (isCompleted) {
             this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, '(Completed)', {
                fontSize: '24px',
                color: '#38a169',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }


        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Click to Start', {
            fontSize: '32px',
            color: '#2d3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('LevelSelectScene', { challenge: todayChallenge, isCompleted: isCompleted });
        });
    }
}

class LevelSelectScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;
    make!: Phaser.GameObjects.GameObjectCreator;

    private dailyChallenge: any;
    private isChallengeCompleted = false;
    
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data: { challenge: any; isCompleted: boolean; }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
    }

    preload() {
        // Lock Icon
        const lockGraphics = this.make.graphics();
        lockGraphics.fillStyle(0x4a5568); // dark grey
        lockGraphics.fillRoundedRect(8, 12, 16, 14, 4); // body
        lockGraphics.lineStyle(4, 0x718096); // light grey
        lockGraphics.beginPath();
        lockGraphics.arc(16, 12, 8, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360));
        lockGraphics.strokePath();
        lockGraphics.generateTexture('lock_icon', 32, 32);
        lockGraphics.destroy();
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0);

        this.add.text(GAME_WIDTH / 2, 80, 'Select Level', {
            fontSize: '64px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        const unlockedLevel = parseInt(localStorage.getItem('ultimateLevelChallenge_unlockedLevel') || '0', 10);
        
        const levelsPerRow = 5;
        const buttonSize = 100;
        const buttonSpacing = 40;
        const gridWidth = levelsPerRow * (buttonSize + buttonSpacing) - buttonSpacing;
        const startX = (GAME_WIDTH - gridWidth) / 2;
        const startY = 220;
        
        LEVELS.forEach((level, index) => {
            const row = Math.floor(index / levelsPerRow);
            const col = index % levelsPerRow;
            
            const x = startX + col * (buttonSize + buttonSpacing) + buttonSize / 2;
            const y = startY + row * (buttonSize + buttonSpacing) + buttonSize / 2;

            const isLocked = index > unlockedLevel;
            const isBossLevel = !!level.boss;

            const buttonContainer = this.add.container(x, y);

            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(isLocked ? 0x4a5568 : (isBossLevel ? 0x9b2c2c : 0x8b5a2b));
            buttonBg.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
            buttonBg.lineStyle(4, isLocked ? 0x2d3748 : (isBossLevel ? 0x742a2a : 0x6b4a2b));
            buttonBg.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
            buttonContainer.add(buttonBg);
            
            const levelText = this.add.text(0, 0, `${index + 1}`, {
                fontSize: '50px',
                color: '#f7fafc',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            if (isBossLevel) {
                 levelText.setText('B');
                 levelText.setFontSize('60px');
            }
            buttonContainer.add(levelText);

            if (isLocked) {
                const lockIcon = this.add.image(0, 0, 'lock_icon');
                buttonContainer.add(lockIcon);
                levelText.setAlpha(0.3);
            } else {
                buttonContainer.setSize(buttonSize, buttonSize);
                buttonContainer.setInteractive();
                
                buttonContainer.on('pointerover', () => {
                    buttonBg.clear();
                    buttonBg.fillStyle(isBossLevel ? 0x742a2a : 0x6b4a2b);
                    buttonBg.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
                    buttonBg.lineStyle(4, isBossLevel ? 0x521b1b : 0x4a2b1b);
                    buttonBg.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
                });

                buttonContainer.on('pointerout', () => {
                    buttonBg.clear();
                    buttonBg.fillStyle(isBossLevel ? 0x9b2c2c : 0x8b5a2b);
                    buttonBg.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
                    buttonBg.lineStyle(4, isBossLevel ? 0x742a2a : 0x6b4a2b);
                    buttonBg.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
                });

                buttonContainer.on('pointerdown', () => {
                    this.scene.start('GameScene', {
                        challenge: this.dailyChallenge,
                        isCompleted: this.isChallengeCompleted,
                        levelIndex: index,
                        score: 0
                    });
                    this.scene.start('UIScene', {
                        challenge: this.dailyChallenge,
                        isCompleted: this.isChallengeCompleted,
                        levelIndex: index
                    });
                });
            }
        });

        // Back button
        const backButton = this.add.text(100, GAME_HEIGHT - 70, '< Back', {
            fontSize: '48px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerover', () => backButton.setColor('#f6e05e'));
        backButton.on('pointerout', () => backButton.setColor('#f7fafc'));
        backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
    }
}

class GameScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    cameras!: Phaser.Cameras.Scene2D.CameraManager;
    events!: Phaser.Events.EventEmitter;
    input!: Phaser.Input.InputPlugin;
    make!: Phaser.GameObjects.GameObjectCreator;
    physics!: Phaser.Physics.Arcade.ArcadePhysics;
    registry!: Phaser.Data.DataManager;
    scene!: Phaser.Scenes.ScenePlugin;
    time!: Phaser.Time.Clock;
    tweens!: Phaser.Tweens.TweenManager;

    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private movingPlatforms!: Phaser.Physics.Arcade.Group;
    private coins!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private powerups!: Phaser.Physics.Arcade.Group;
    private wasOnGround = false;
    private shieldActive = false;
    private shieldSprite?: Phaser.GameObjects.Sprite;
    private activePowerUpTimer?: Phaser.Time.TimerEvent;
    private currentSpeed = PLAYER_SPEED;
    private currentJumpVelocity = PLAYER_JUMP_VELOCITY;
    private isInvincible = false;
    private canDoubleJump = false;
    
    // Dash Properties
    private shiftKey!: Phaser.Input.Keyboard.Key;
    private canDash = true;
    private isDashing = false;
    private facingDirection = 'right';
    private dashCooldownTimer?: Phaser.Time.TimerEvent;

    // Daily Challenge Properties
    private dailyChallenge: any;
    private isChallengeCompleted = false;
    private isCompletedForSession = false;
    private challengeProgress = 0;
    private levelStartTime = 0;
    private challengeCompleteText?: Phaser.GameObjects.Text;

    private levelIndex = 0;
    private initialScore = 0;

    // Boss properties
    private boss?: Phaser.Physics.Arcade.Sprite;
    private bossHealth = 0;
    private projectiles!: Phaser.Physics.Arcade.Group;
    private homingProjectiles!: Phaser.Physics.Arcade.Group;
    private isBossLevel = false;
    private goal?: Phaser.Physics.Arcade.Sprite;
    private attackTimer?: Phaser.Time.TimerEvent;
    private bossAttackPattern = 1;

    // Hazard properties
    private fallingRockSpawners!: Phaser.Physics.Arcade.StaticGroup;
    private fallingRocks!: Phaser.Physics.Arcade.Group;
    private geysers!: Phaser.Physics.Arcade.Group;
    private quicksandPits!: Phaser.Physics.Arcade.StaticGroup;
    private playerInQuicksand = false;

    // Visual Effects
    private vines!: Phaser.GameObjects.Group;
    private drips!: Phaser.Physics.Arcade.Group;


    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data: { challenge: any; isCompleted: boolean; levelIndex: number; score?: number }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
        this.levelIndex = data.levelIndex;
        this.initialScore = data.score || 0;
        this.isBossLevel = false;
        this.boss = undefined;
    }

    preload() {
        // Avatar - Little Explorer
        const avatarGraphics = this.make.graphics();
        avatarGraphics.fillStyle(0x8b5a2b);
        avatarGraphics.fillRect(16, 16, 32, 8);
        avatarGraphics.fillRect(22, 8, 20, 8);
        avatarGraphics.fillStyle(0xffd3a9);
        avatarGraphics.fillRect(24, 24, 16, 16);
        avatarGraphics.fillStyle(0x4a5568);
        avatarGraphics.fillRect(20, 40, 24, 18);
        avatarGraphics.fillStyle(0x5a3a22);
        avatarGraphics.fillRect(22, 58, 8, 10);
        avatarGraphics.fillRect(34, 58, 8, 10);
        avatarGraphics.generateTexture('avatar', 64, 68);
        avatarGraphics.destroy();

        // Platform - Mossy rock/wood
        const platformGraphics = this.make.graphics();
        platformGraphics.fillStyle(0x6b4a2b);
        platformGraphics.fillRect(0, 0, 200, 32);
        platformGraphics.fillStyle(0x48bb78, 0.7);
        platformGraphics.fillRect(0, 0, 200, 8);
        platformGraphics.fillRect(30, 8, 50, 5);
        platformGraphics.fillRect(120, 8, 40, 5);
        platformGraphics.generateTexture('platform', 200, 32);
        platformGraphics.destroy();
        
        // Moving Platform
        const movingPlatformGraphics = this.make.graphics();
        movingPlatformGraphics.fillStyle(0x8b5a2b); // Base color
        movingPlatformGraphics.fillRect(0, 0, 200, 32);
        movingPlatformGraphics.fillStyle(0xf6e05e, 0.8); // Add gold accents
        movingPlatformGraphics.fillCircle(15, 16, 8);
        movingPlatformGraphics.fillCircle(185, 16, 8);
        movingPlatformGraphics.fillRect(15, 14, 170, 4);
        movingPlatformGraphics.generateTexture('moving_platform', 200, 32);
        movingPlatformGraphics.destroy();

        // Coin - Banana
        const coinGraphics = this.make.graphics();
        coinGraphics.fillStyle(0xf6e05e);
        coinGraphics.beginPath();
        // Draw a crescent/banana shape using two arcs
        coinGraphics.arc(16, 30, 14, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
        coinGraphics.arc(16, 25, 12, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(180), true);
        coinGraphics.closePath();
        coinGraphics.fillPath();
        // Add a small brown stem
        coinGraphics.fillStyle(0x6b4a2b);
        coinGraphics.fillRect(27, 16, 3, 5);
        coinGraphics.generateTexture('coin', 32, 32);
        coinGraphics.destroy();
        
        // Trap - Spikes
        const trapGraphics = this.make.graphics();
        trapGraphics.fillStyle(0x8b5a2b);
        trapGraphics.beginPath();
        trapGraphics.moveTo(0, 32);
        for (let i = 0; i < 4; i++) {
            trapGraphics.lineTo(i * 16 + 8, 0);
            trapGraphics.lineTo((i + 1) * 16, 32);
        }
        trapGraphics.closePath();
        trapGraphics.fillPath();
        trapGraphics.generateTexture('trap', 64, 32);
        trapGraphics.destroy();
        
        // Goal - Temple Door
        const goalGraphics = this.make.graphics();
        goalGraphics.fillStyle(0x718096);
        goalGraphics.fillRect(0, 0, 64, 128);
        goalGraphics.fillStyle(0x2d3748);
        goalGraphics.fillRect(12, 20, 40, 108);
        goalGraphics.fillStyle(0xa0aec0);
        goalGraphics.fillRect(8, 12, 48, 8);
        goalGraphics.generateTexture('goal', 64, 128);
        goalGraphics.destroy();
        
        // Enemy - Snake
        const enemyGraphics = this.make.graphics();
        enemyGraphics.fillStyle(0x48bb78);
        enemyGraphics.fillEllipse(24, 24, 40, 16);
        enemyGraphics.fillStyle(0x000000);
        enemyGraphics.fillCircle(12, 20, 3);
        // Forked tongue - using a filled polygon for stability
        enemyGraphics.fillStyle(0xf56565);
        enemyGraphics.beginPath();
        enemyGraphics.moveTo(8, 24); // base of tongue
        enemyGraphics.lineTo(2, 21); // top fork tip
        enemyGraphics.lineTo(4, 24); // inner point
        enemyGraphics.lineTo(2, 27); // bottom fork tip
        enemyGraphics.closePath();
        enemyGraphics.fillPath();
        enemyGraphics.generateTexture('enemy', 48, 48);
        enemyGraphics.destroy();

        // Enemy - Bat
        const batGraphics = this.make.graphics();
        batGraphics.fillStyle(0x4a5568); // Dark grey body
        batGraphics.fillEllipse(24, 24, 20, 12); // Body

        // Create wings using paths, as Graphics object doesn't have quadraticBezierTo directly
        const leftWing = new Phaser.Curves.Path();
        leftWing.moveTo(15, 24);
        leftWing.quadraticBezierTo(0, 10, 5, 5);
        leftWing.quadraticBezierTo(15, 15, 24, 20);
        leftWing.closePath();
        batGraphics.fillPoints(leftWing.getPoints(), true);

        const rightWing = new Phaser.Curves.Path();
        rightWing.moveTo(33, 24);
        rightWing.quadraticBezierTo(48, 10, 43, 5);
        rightWing.quadraticBezierTo(33, 15, 24, 20);
        rightWing.closePath();
        batGraphics.fillPoints(rightWing.getPoints(), true);
        
        batGraphics.fillStyle(0xc53030); // Red eyes
        batGraphics.fillCircle(20, 22, 2);
        batGraphics.fillCircle(28, 22, 2);
        batGraphics.generateTexture('enemy_bat', 48, 48);
        batGraphics.destroy();

        // Boss - Jungle Gorilla
        const bossGraphics = this.make.graphics();
        bossGraphics.fillStyle(0x5a3a22); // Dark brown fur
        bossGraphics.fillRoundedRect(10, 20, 108, 100, 20); // Body
        bossGraphics.fillRoundedRect(30, 0, 68, 60, 15); // Head
        bossGraphics.fillStyle(0x4a2b1b); // Darker brown for details
        bossGraphics.fillEllipse(64, 110, 90, 30); // Chest
        bossGraphics.fillStyle(0xffd3a9); // Face color
        bossGraphics.fillEllipse(64, 35, 40, 25);
        bossGraphics.fillStyle(0xc53030); // Red eyes
        bossGraphics.fillCircle(54, 30, 5);
        bossGraphics.fillCircle(74, 30, 5);
        bossGraphics.generateTexture('boss_gorilla', 128, 128);
        bossGraphics.destroy();

        // Projectile - Coconut
        const projectileGraphics = this.make.graphics();
        projectileGraphics.fillStyle(0x6b4a2b);
        projectileGraphics.fillCircle(16, 16, 12);
        projectileGraphics.fillStyle(0x4a2b1b);
        projectileGraphics.fillCircle(12, 12, 3);
        projectileGraphics.fillCircle(20, 12, 3);
        projectileGraphics.generateTexture('projectile', 32, 32);
        projectileGraphics.destroy();
        
        // Homing Projectile - Banana-rang
        const homingProjectileGraphics = this.make.graphics();
        homingProjectileGraphics.fillStyle(0xf6e05e); // Banana yellow
        const boomerangPath = new Phaser.Curves.Path(16, 0);
        boomerangPath.cubicBezierTo(32, 0, 32, 32, 16, 32);
        boomerangPath.cubicBezierTo(24, 32, 24, 8, 16, 0);
        homingProjectileGraphics.fillPoints(boomerangPath.getPoints(), true);
        homingProjectileGraphics.generateTexture('projectile_homing', 32, 32);
        homingProjectileGraphics.destroy();

        // Boss Tell VFX
        const sparkleGraphics = this.make.graphics();
        sparkleGraphics.fillStyle(0xffffff);
        sparkleGraphics.beginPath();
        sparkleGraphics.moveTo(8, 0);
        sparkleGraphics.lineTo(10, 6);
        sparkleGraphics.lineTo(16, 8);
        sparkleGraphics.lineTo(10, 10);
        sparkleGraphics.lineTo(8, 16);
        sparkleGraphics.lineTo(6, 10);
        sparkleGraphics.lineTo(0, 8);
        sparkleGraphics.lineTo(6, 6);
        sparkleGraphics.closePath();
        sparkleGraphics.fillPath();
        sparkleGraphics.generateTexture('sparkle', 16, 16);
        sparkleGraphics.destroy();

        // Power-ups
        const speedGraphics = this.make.graphics();
        speedGraphics.fillStyle(0x4299e1);
        speedGraphics.fillRoundedRect(4, 8, 24, 16, 5);
        speedGraphics.fillStyle(0xffffff);
        speedGraphics.fillRoundedRect(8, 6, 18, 10, 4);
        speedGraphics.generateTexture('speed_boost', 32, 32);
        speedGraphics.destroy();

        const shieldPowerupGraphics = this.make.graphics();
        shieldPowerupGraphics.fillStyle(0x8b5a2b);
        shieldPowerupGraphics.fillEllipse(16, 16, 28, 22);
        shieldPowerupGraphics.lineStyle(2, 0x6b4a2b);
        shieldPowerupGraphics.strokeEllipse(16, 16, 28, 22);
        shieldPowerupGraphics.fillStyle(0x6b4a2b);
        shieldPowerupGraphics.fillRect(4, 15, 24, 2);
        shieldPowerupGraphics.generateTexture('shield_powerup', 32, 32);
        shieldPowerupGraphics.destroy();

        const activeShieldGraphics = this.make.graphics();
        activeShieldGraphics.fillStyle(0x9ae6b4, 0.4);
        activeShieldGraphics.fillCircle(40, 40, 38);
        activeShieldGraphics.lineStyle(2, 0x68d391);
        activeShieldGraphics.strokeCircle(40, 40, 38);
        activeShieldGraphics.generateTexture('shield_active', 80, 80);
        activeShieldGraphics.destroy();

        const jumpGraphics = this.make.graphics();
        jumpGraphics.fillStyle(0x68d391);
        jumpGraphics.fillEllipse(16, 18, 20, 14);
        jumpGraphics.fillStyle(0xffffff);
        jumpGraphics.fillCircle(12, 14, 5);
        jumpGraphics.fillCircle(20, 14, 5);
        jumpGraphics.fillStyle(0x000000);
        jumpGraphics.fillCircle(12, 14, 2);
        jumpGraphics.fillCircle(20, 14, 2);
        jumpGraphics.generateTexture('jump_boost', 32, 32);
        jumpGraphics.destroy();

        // Hazards
        const rockGraphics = this.make.graphics();
        rockGraphics.fillStyle(0x718096);
        rockGraphics.beginPath();
        rockGraphics.moveTo(20, 0);
        rockGraphics.lineTo(40, 10);
        rockGraphics.lineTo(35, 35);
        rockGraphics.lineTo(10, 40);
        rockGraphics.lineTo(0, 20);
        rockGraphics.closePath();
        rockGraphics.fillPath();
        rockGraphics.generateTexture('falling_rock', 40, 40);
        rockGraphics.destroy();

        const geyserHoleGraphics = this.make.graphics();
        geyserHoleGraphics.fillStyle(0x6b4a2b);
        geyserHoleGraphics.fillEllipse(24, 16, 48, 12);
        geyserHoleGraphics.fillStyle(0x4a2b1b);
        geyserHoleGraphics.fillEllipse(24, 14, 20, 8);
        geyserHoleGraphics.generateTexture('geyser_hole', 48, 32);
        geyserHoleGraphics.destroy();

        const geyserJetGraphics = this.make.graphics();
        geyserJetGraphics.fillStyle(0xedf2f7, 0.8);
        geyserJetGraphics.fillRect(0, 0, 24, 150);
        geyserJetGraphics.fillStyle(0xa0aec0, 0.6);
        geyserJetGraphics.fillRect(4, 0, 16, 150);
        geyserJetGraphics.generateTexture('geyser_jet', 24, 150);
        geyserJetGraphics.destroy();
        
        const quicksandGraphics = this.make.graphics();
        quicksandGraphics.fillStyle(0x6b4a2b);
        quicksandGraphics.fillRect(0, 0, 100, 40);
        quicksandGraphics.fillStyle(0x5a3a22, 0.8);
        for(let i = 0; i < 3; i++) {
             quicksandGraphics.fillEllipse(Phaser.Math.Between(10, 90), Phaser.Math.Between(5, 35), Phaser.Math.Between(10, 25), Phaser.Math.Between(5, 10));
        }
        quicksandGraphics.generateTexture('quicksand', 100, 40);
        quicksandGraphics.destroy();
        
        // Visual Effects
        const vineGraphics = this.make.graphics();
        vineGraphics.lineStyle(8, 0x2f855a);
        // Fix: Use a Path object to draw the quadratic bezier curve, as the Graphics object does not have a `quadraticBezierTo` method.
        const vinePath = new Phaser.Curves.Path(10, 0);
        vinePath.quadraticBezierTo(20, 50, 10, 100);
        vinePath.quadraticBezierTo(0, 150, 10, 200);
        vinePath.draw(vineGraphics);
        vineGraphics.generateTexture('vine', 20, 200);
        vineGraphics.destroy();

        const dripGraphics = this.make.graphics();
        dripGraphics.fillStyle(0x4299e1);
        dripGraphics.fillEllipse(4, 8, 8, 16);
        dripGraphics.generateTexture('drip', 16, 24);
        dripGraphics.destroy();

        const splashGraphics = this.make.graphics();
        splashGraphics.lineStyle(2, 0x4299e1, 0.8);
        splashGraphics.strokeCircle(16, 16, 6);
        splashGraphics.strokeCircle(16, 16, 12);
        splashGraphics.generateTexture('splash', 32, 32);
        splashGraphics.destroy();
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0).setDepth(-1);
        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const level = LEVELS[this.levelIndex];
        if (!level) {
            console.error('Invalid level index:', this.levelIndex);
            this.scene.start('MainMenuScene');
            return;
        }

        this.isBossLevel = !!level.boss;

        this.platforms = this.physics.add.staticGroup();
        level.platforms.forEach(p => {
            const platform = this.platforms.create(p.x, p.y, 'platform');
            if ((p as any).scaleX || (p as any).scaleY) {
                platform.setScale((p as any).scaleX || 1, (p as any).scaleY || 1).refreshBody();
            }
        });

        this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
        if (level.movingPlatforms) {
            level.movingPlatforms.forEach(p => {
                const platform = this.movingPlatforms.create(p.x, p.y, 'moving_platform') as Phaser.Physics.Arcade.Sprite;
                if(p.scaleX) platform.setScale(p.scaleX, 1).refreshBody();

                if (p.moveType === 'horizontal') {
                    this.tweens.add({
                        targets: platform,
                        x: p.x + p.distance,
                        duration: p.duration,
                        ease: 'linear',
                        yoyo: true,
                        repeat: -1
                    });
                } else if (p.moveType === 'vertical') {
                     this.tweens.add({
                        targets: platform,
                        y: p.y + p.distance,
                        duration: p.duration,
                        ease: 'linear',
                        yoyo: true,
                        repeat: -1
                    });
                }
            });
        }
        
        // Visual Effects Setup
        this.vines = this.add.group();
        if (level.vines) {
            level.vines.forEach(v => {
                const vine = this.vines.create(v.x, v.y, 'vine') as Phaser.GameObjects.Sprite;
                vine.setOrigin(0.5, 0).setDepth(-1);
            });
        }
        
        this.drips = this.physics.add.group();
        if (level.dripSpawners) {
            level.dripSpawners.forEach(spawner => {
                this.time.addEvent({
                    delay: Phaser.Math.Between(2000, 6000),
                    callback: () => this.spawnDrip(spawner.x, spawner.y),
                    callbackScope: this,
                    loop: true
                });
            });
        }

        this.player = this.physics.add.sprite(level.playerStart.x, level.playerStart.y, 'avatar');
        this.player.setCollideWorldBounds(true);

        this.coins = this.physics.add.group({ allowGravity: false });
        level.coins.forEach(c => {
            this.coins.create(c.x, c.y, 'coin');
        });

        this.powerups = this.physics.add.group({ allowGravity: false });
        level.powerups.forEach(p => {
            const key = p.type === 'shield' ? 'shield_powerup' : `${p.type}_boost`;
            this.powerups.create(p.x, p.y, key).setData('type', p.type);
        });

        const traps = this.physics.add.staticGroup();
        level.traps.forEach(t => {
            traps.create(t.x, t.y, 'trap');
        });
        
        // Hazard Setup
        this.fallingRockSpawners = this.physics.add.staticGroup();
        this.fallingRocks = this.physics.add.group();
        this.geysers = this.physics.add.group({ allowGravity: false });
        this.quicksandPits = this.physics.add.staticGroup();
        this.playerInQuicksand = false;

        if (level.hazards) {
            level.hazards.forEach(h => {
                switch(h.type) {
                    case 'falling_rock_spawner':
                        const zone = this.fallingRockSpawners.create(h.x, h.y, undefined).setVisible(false);
                        zone.setSize(h.width, h.height).setOrigin(0.5, 0);
                        break;
                    case 'geyser':
                        this.add.sprite(h.x, h.y, 'geyser_hole').setOrigin(0.5, 1);
                        const jet = this.geysers.create(h.x, h.y - 150, 'geyser_jet').setVisible(false);
                        (jet.body as Phaser.Physics.Arcade.Body).enable = false;
                        
                        this.time.addEvent({
                           delay: 3000,
                           loop: true,
                           callback: () => {
                               if (!jet.scene) return;
                               jet.setVisible(true);
                               (jet.body as Phaser.Physics.Arcade.Body).enable = true;
                               this.time.delayedCall(1000, () => {
                                   if (jet.active) {
                                       jet.setVisible(false);
                                       (jet.body as Phaser.Physics.Arcade.Body).enable = false;
                                   }
                               });
                           }
                        });
                        break;
                    case 'quicksand':
                        const pit = this.quicksandPits.create(h.x, h.y, 'quicksand');
                        pit.setSize(h.width, h.height).setDisplaySize(h.width, h.height).refreshBody();
                        break;
                }
            });
        }


        this.enemies = this.physics.add.group();
        if (!this.isBossLevel) {
            level.enemies.forEach(e => {
                if (e.type === 'bat') {
                    const enemy = this.enemies.create(e.x, e.y, 'enemy_bat') as Phaser.Physics.Arcade.Sprite;
                    (enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
                    enemy.setData('type', 'bat');
                    enemy.setData('patrolCenter', e.x);
                    enemy.setData('isSwooping', false);
                    enemy.setVelocityX(ENEMY_SPEED * 0.8);
                    enemy.setCollideWorldBounds(true);
                } else { // Default to snake
                    const enemy = this.enemies.create(e.x, e.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
                    enemy.setData('type', 'snake');
                    enemy.setCollideWorldBounds(true);
                    enemy.setVelocityX(e.velocityX || ENEMY_SPEED);
                }
            });
        }
        
        if (!this.isBossLevel) {
            this.goal = this.physics.add.staticSprite(level.goal.x, level.goal.y, 'goal');
            this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
        }

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.movingPlatforms);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, undefined, this);
        this.physics.add.collider(this.player, traps, this.hitTrap, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, undefined, this);
        
        // Hazard Colliders
        this.physics.add.overlap(this.player, this.fallingRockSpawners, this.triggerFallingRock, undefined, this);
        this.physics.add.overlap(this.player, this.fallingRocks, this.hitByHazard, undefined, this);
        this.physics.add.overlap(this.player, this.geysers, this.hitByGeyser, undefined, this);
        
        // Visuals Colliders
        this.physics.add.collider(this.drips, this.platforms, this.handleDripSplash, undefined, this);
        this.physics.add.collider(this.drips, this.movingPlatforms, this.handleDripSplash, undefined, this);
        
        // Boss Setup
        if (this.isBossLevel && level.boss) {
            this.boss = this.physics.add.sprite(level.boss.x, level.boss.y, 'boss_gorilla').setImmovable(true);
            this.boss.setCollideWorldBounds(true);
            (this.boss.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.bossHealth = BOSS_HEALTH;
            this.bossAttackPattern = level.boss.attackPattern || 1;
            this.boss.setData('isAttacking', false);

            this.projectiles = this.physics.add.group({ allowGravity: true, bounceX: 0.5, bounceY: 0.5 });
            this.homingProjectiles = this.physics.add.group({ allowGravity: false });

            this.physics.add.collider(this.boss, this.platforms);
            this.physics.add.collider(this.player, this.boss, this.hitBoss, (player, boss) => {
                return (player as Phaser.Physics.Arcade.Sprite).body.velocity.y > 0 && (player as Phaser.Physics.Arcade.Sprite).y < (boss as Phaser.Physics.Arcade.Sprite).y;
            }, this);
            this.physics.add.collider(this.projectiles, this.platforms, (projectile) => projectile.destroy(), undefined, this);
            this.physics.add.collider(this.homingProjectiles, this.platforms, (projectile) => projectile.destroy(), undefined, this);
            
            this.physics.add.overlap(this.player, this.projectiles, this.hitByProjectile, undefined, this);
            this.physics.add.overlap(this.player, this.homingProjectiles, this.hitByProjectile, undefined, this);

            this.events.emit('bossSpawned', { maxHealth: BOSS_HEALTH, currentHealth: this.bossHealth });
            this.startBossAttacks();
        }


        this.cursors = this.input.keyboard.createCursorKeys();
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.registry.set('score', this.initialScore);
        this.events.emit('scoreChanged');
        this.events.emit('powerUpChanged', { type: 'None', timeLeft: 0 });
        this.events.emit('dashStatusChanged', { ready: true, cooldown: 0 });

        // Challenge Init
        this.challengeProgress = 0;
        this.isCompletedForSession = this.isChallengeCompleted;
        this.levelStartTime = this.time.now;
        this.events.emit('challengeProgressChanged', { progress: 0 });
    }

    update() {
        if (!this.player.active) return;
        
        if (this.isDashing) {
            return; // Ignore other inputs while dashing
        }
        
        if (this.dailyChallenge.type === 'time' && !this.isBossLevel) {
            const elapsed = (this.time.now - this.levelStartTime) / 1000;
            this.challengeProgress = elapsed;
            this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
        }
        
        this.enemies.getChildren().forEach(c => {
            const enemy = c as Phaser.Physics.Arcade.Sprite;
            if (!enemy.active) return;

            const type = enemy.getData('type');

            if (type === 'snake') {
                if (enemy.body.blocked.right) {
                    enemy.setVelocityX(-ENEMY_SPEED);
                    enemy.setFlipX(false);
                } else if (enemy.body.blocked.left) {
                    enemy.setVelocityX(ENEMY_SPEED);
                    enemy.setFlipX(true);
                }
            } else if (type === 'bat') {
                const isSwooping = enemy.getData('isSwooping');

                if (isSwooping) {
                    const swoopState = enemy.getData('swoopState');
                    const originalY = enemy.getData('originalY');
                    const patrolCenter = enemy.getData('patrolCenter');

                    // State: swooping down
                    if (swoopState === 'down' && enemy.y >= originalY + 250) {
                        enemy.setData('swoopState', 'up');
                        const duration = 1200; // ms to return
                        const velocityX = (patrolCenter - enemy.x) / (duration / 1000);
                        const velocityY = (originalY - enemy.y) / (duration / 1000);
                        enemy.setVelocity(velocityX, velocityY);
                    } 
                    // State: swooping up
                    else if (swoopState === 'up' && enemy.y <= originalY) {
                        enemy.y = originalY; // Snap to original Y to prevent overshooting
                        enemy.setData('isSwooping', false);
                        enemy.setData('swoopState', undefined);
                        enemy.setVelocity(ENEMY_SPEED * 0.8, 0); // Resume patrol
                    }
                } else { // Not swooping, so patrol
                    const patrolCenter = enemy.getData('patrolCenter');
                    if (enemy.x > patrolCenter + 100) {
                        enemy.setVelocityX(-ENEMY_SPEED * 0.8);
                    } else if (enemy.x < patrolCenter - 100) {
                        enemy.setVelocityX(ENEMY_SPEED * 0.8);
                    }
                    
                    // Swoop trigger logic
                    const distanceToPlayerX = Math.abs(this.player.x - enemy.x);
                    const distanceToPlayerY = this.player.y - enemy.y;
                    if (this.player.active && distanceToPlayerX < 250 && distanceToPlayerY > 30 && distanceToPlayerY < 400) {
                        // Start swoop
                        enemy.setData('isSwooping', true);
                        enemy.setData('swoopState', 'down');
                        enemy.setData('originalY', enemy.y);
                        
                        const targetX = this.player.x;
                        const targetY = enemy.y + 250;
                        const duration = 800; // ms to reach target
                        const velocityX = (targetX - enemy.x) / (duration / 1000);
                        const velocityY = (targetY - enemy.y) / (duration / 1000);
                        enemy.setVelocity(velocityX, velocityY);
                    }
                }
                
                // Flip sprite based on velocity, applies to all states
                if (enemy.body.velocity.x !== 0) {
                    enemy.setFlipX(enemy.body.velocity.x < 0);
                }
            }
        });
        
        this.fallingRocks.getChildren().forEach(r => {
            if ((r as Phaser.Physics.Arcade.Sprite).y > GAME_HEIGHT + 20) {
                r.destroy();
            }
        });

        // Vine swaying logic
        this.vines.getChildren().forEach(v => {
            const vine = v as Phaser.GameObjects.Sprite;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, vine.x, vine.y);
            if (distance < 150 && !vine.getData('isSwaying')) {
                vine.setData('isSwaying', true);
                this.tweens.add({
                    targets: vine,
                    angle: 10,
                    duration: 1200,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1,
                });
            } else if (distance >= 150 && vine.getData('isSwaying')) {
                 vine.setData('isSwaying', false);
                 this.tweens.killTweensOf(vine);
                 this.tweens.add({ targets: vine, angle: 0, duration: 600, ease: 'Sine.easeInOut' });
            }
        });

        // Quicksand Logic
        let onQuicksand = false;
        let overlappingPit: Phaser.Physics.Arcade.Sprite | null = null;
        this.physics.overlap(this.player, this.quicksandPits, (_player, pit) => {
            onQuicksand = true;
            overlappingPit = pit as Phaser.Physics.Arcade.Sprite;
        });
        
        if (onQuicksand) {
            this.player.setVelocityX(this.player.body.velocity.x * 0.9);
            if (this.player.body.velocity.y > 50) {
                 this.player.setVelocityY(this.player.body.velocity.y * 0.9);
            } else {
                 this.player.setVelocityY(this.player.body.velocity.y + 15);
            }
            if (!this.playerInQuicksand) {
                 this.playerInQuicksand = true;
            }
            // Check if fully submerged
            if(overlappingPit && this.player.getBounds().top > overlappingPit.getBounds().centerY) {
                this.hitTrap();
            }

        } else if (this.playerInQuicksand) {
             this.playerInQuicksand = false;
        }

        if(this.isBossLevel && this.boss && this.boss.active) {
            this.boss.setFlipX(this.player.x < this.boss.x);
        }

        if (this.shieldActive && this.shieldSprite) {
            this.shieldSprite.setPosition(this.player.x, this.player.y);
        }

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const onGround = body.touching.down || body.blocked.down;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.currentSpeed);
            this.player.setFlipX(true);
            this.facingDirection = 'left';
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.currentSpeed);
            this.player.setFlipX(false);
            this.facingDirection = 'right';
        } else {
            if (!onQuicksand) { // Don't stop immediately in quicksand
                this.player.setVelocityX(0);
            }
        }

        const upJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        const shiftJustDown = Phaser.Input.Keyboard.JustDown(this.shiftKey);

        if (shiftJustDown && this.canDash) {
            this.performDash();
        }

        if (this.dashCooldownTimer) {
            const remaining = this.dashCooldownTimer.getRemaining();
            this.events.emit('dashStatusChanged', { ready: false, cooldown: remaining });
        }

        if (onGround || onQuicksand) {
            this.canDoubleJump = true;
        }

        if (upJustDown) {
            if (onGround || onQuicksand) {
                this.player.setVelocityY(this.currentJumpVelocity * (onQuicksand ? 0.7 : 1));
                this.tweens.add({ targets: this.player, scaleY: 1.2, scaleX: 0.8, duration: 100, yoyo: true, ease: 'Power1' });
            } else if (this.canDoubleJump) {
                this.player.setVelocityY(this.currentJumpVelocity * 0.85);
                this.canDoubleJump = false;
                this.tweens.add({ targets: this.player, scaleY: 1.2, scaleX: 0.8, duration: 100, yoyo: true, ease: 'Power1' });
            }
        }
        
        if (this.cursors.down.isDown && !onGround) {
            this.player.setVelocityY(this.currentSpeed);
        }

        if (onGround && !this.wasOnGround) {
            this.tweens.add({ targets: this.player, scaleY: 0.9, scaleX: 1.1, duration: 80, yoyo: true, ease: 'Power1' });
        }
        this.wasOnGround = onGround;
        
        if (this.player.y > GAME_HEIGHT) {
            this.hitTrap();
        }

        // Homing projectile logic
        if (this.homingProjectiles) {
            this.homingProjectiles.getChildren().forEach(p => {
                const projectile = p as Phaser.Physics.Arcade.Sprite;
                if (!projectile.active || !this.player.active) return;
                
                const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, this.player.x, this.player.y);
                const currentVelocity = projectile.body.velocity.clone();
                const targetVelocity = new Phaser.Math.Vector2();
                this.physics.velocityFromRotation(angle, 300, targetVelocity); // Homing speed
                
                // Interpolate for smoother turning
                const newVelocityX = Phaser.Math.Interpolation.Linear([currentVelocity.x, targetVelocity.x], 0.05);
                const newVelocityY = Phaser.Math.Interpolation.Linear([currentVelocity.y, targetVelocity.y], 0.05);
                
                projectile.setVelocity(newVelocityX, newVelocityY);
                projectile.setRotation(projectile.body.velocity.angle() + Math.PI / 2);
            });
        }
    }

    performDash() {
        if (!this.canDash) return;

        this.canDash = false;
        this.isDashing = true;
        this.isInvincible = true;

        const dashVelocity = this.facingDirection === 'right' ? DASH_VELOCITY : -DASH_VELOCITY;
        
        (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.player.setVelocity(dashVelocity, 0);

        this.tweens.add({
            targets: this.player,
            scaleX: this.player.flipX ? -1.5 : 1.5,
            scaleY: 0.7,
            duration: DASH_DURATION,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });

        this.time.delayedCall(DASH_DURATION, () => {
            if (!this.player.active) return;
            this.isDashing = false;
            // A short period of invincibility after dash
            this.time.delayedCall(100, () => { this.isInvincible = false; });
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
            this.player.setVelocityX(0); 
        });

        this.dashCooldownTimer = this.time.delayedCall(DASH_COOLDOWN, () => {
            this.canDash = true;
            this.dashCooldownTimer = undefined;
            this.events.emit('dashStatusChanged', { ready: true, cooldown: 0 });
        });
    }

    collectCoin(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, coin: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        (coin as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
        const score = this.registry.get('score') + 10;
        this.registry.set('score', score);
        this.events.emit('scoreChanged');

        if (this.dailyChallenge.type === 'coins') {
            this.challengeProgress++;
            this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
            this.checkChallengeCompletion();
        }
    }

    collectPowerUp(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, powerup: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const powerupSprite = powerup as Phaser.Physics.Arcade.Sprite;
        const type = powerupSprite.getData('type');
        powerupSprite.disableBody(true, true);

        if (this.activePowerUpTimer) {
            this.activePowerUpTimer.remove();
            this.resetPowerUps();
        }
        
        let duration = 0;
        if (type === 'speed') {
            this.currentSpeed = PLAYER_SPEED * SPEED_BOOST_MODIFIER;
            duration = SPEED_BOOST_DURATION;
        } else if (type === 'jump') {
            this.currentJumpVelocity = PLAYER_JUMP_VELOCITY * JUMP_BOOST_MODIFIER;
            duration = JUMP_BOOST_DURATION;
        } else if (type === 'shield') {
            this.shieldActive = true;
            this.shieldSprite = this.add.sprite(this.player.x, this.player.y, 'shield_active').setDepth(1);
        }

        if (duration > 0) {
            this.activePowerUpTimer = this.time.delayedCall(duration, this.resetPowerUps, [], this);
            const timer = this.time.addEvent({
              delay: 1000,
              callback: () => {
                if (this.activePowerUpTimer) {
                    const timeLeft = Math.round((this.activePowerUpTimer.getRemaining()) / 1000);
                    this.events.emit('powerUpChanged', { type, timeLeft });
                }
              },
              repeat: duration / 1000 -1
            });
        }
        this.events.emit('powerUpChanged', { type, timeLeft: duration / 1000 });
    }

    resetPowerUps() {
        if (!this.scene.isActive()) {
            return;
        }
        this.currentSpeed = PLAYER_SPEED;
        this.currentJumpVelocity = PLAYER_JUMP_VELOCITY;
        if (this.shieldActive) {
            this.shieldActive = false;
            if (this.shieldSprite && this.shieldSprite.active) {
                this.tweens.add({
                    targets: this.shieldSprite,
                    alpha: 0,
                    scale: 1.5,
                    duration: 200,
                    onComplete: () => {
                        this.shieldSprite?.destroy();
                        this.shieldSprite = undefined;
                    }
                });
            } else {
                this.shieldSprite?.destroy();
                this.shieldSprite = undefined;
            }
        }
        this.events.emit('powerUpChanged', { type: 'None', timeLeft: 0 });
    }
    
    takeDamage() {
        if (this.isInvincible) return false;
        
        if (this.shieldActive) {
            this.resetPowerUps();
            this.isInvincible = true;
            this.player.setAlpha(0.5);
            this.time.delayedCall(1000, () => {
                if (this.player && this.player.active) {
                    this.player.setAlpha(1);
                    this.isInvincible = false;
                }
            });
            return false;
        } else {
            this.hitTrap();
            return true;
        }
    }

    hitEnemy(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isInvincible) return;

        const playerSprite = player as Phaser.Physics.Arcade.Sprite;
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

        if (playerSprite.body.velocity.y > 0 && playerSprite.y < enemySprite.y - (enemySprite.height * enemySprite.scaleY) / 2) {
            enemySprite.destroy();
            playerSprite.setVelocityY(-300); // Bounce
            if (this.dailyChallenge.type === 'enemy') {
                this.challengeProgress++;
                this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
                this.checkChallengeCompletion();
            }
        } else {
            this.takeDamage();
        }
    }
    
    hitTrap() {
        if (this.isInvincible || !this.player.active) return;
        this.isInvincible = false;
        this.tweens.killTweensOf(this.player);
        this.physics.pause();
        this.player.active = false;
        this.player.setTint(0xff0000);
        this.time.delayedCall(500, () => {
             this.scene.stop('UIScene');
             this.scene.start('GameOverScene');
        });
    }
    
    reachGoal() {
        if (!this.player.active) return;
    
        if (this.dailyChallenge.type === 'time') {
            this.checkChallengeCompletion();
        }
    
        // Stop all dynamic elements for a clean transition
        this.physics.pause();
        this.tweens.killAll();
        this.time.removeAllEvents();
    
        this.player.active = false;
        this.player.setTint(0x00ff00);
    
        const nextLevelIndex = this.levelIndex + 1;
        const isLastLevel = nextLevelIndex >= LEVELS.length;
    
        if (!isLastLevel) {
            const currentUnlocked = parseInt(localStorage.getItem('ultimateLevelChallenge_unlockedLevel') || '0', 10);
            if (nextLevelIndex > currentUnlocked) {
                localStorage.setItem('ultimateLevelChallenge_unlockedLevel', nextLevelIndex.toString());
            }
        }
    
        const message = isLastLevel ? 'You Win!' : 'Level Complete!';
        const winText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
            fontSize: '64px',
            color: '#f6e05e',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        winText.setScrollFactor(0);
    
        // Create a new timer specifically for the transition
        this.time.delayedCall(2000, () => {
            this.scene.stop('UIScene');
            if (isLastLevel) {
                this.scene.start('MainMenuScene');
            } else {
                const currentScore = this.registry.get('score');
                // Restarting the scene will create a fresh state for the next level
                this.scene.start('GameScene', {
                    challenge: this.dailyChallenge,
                    isCompleted: this.isCompletedForSession,
                    levelIndex: nextLevelIndex,
                    score: currentScore
                });
                this.scene.start('UIScene', {
                    challenge: this.dailyChallenge,
                    isCompleted: this.isCompletedForSession,
                    levelIndex: nextLevelIndex
                });
            }
        });
    }

    checkChallengeCompletion() {
        if (this.isCompletedForSession) return;
        
        let completed = false;
        if (this.dailyChallenge.type === 'time') {
            if (this.challengeProgress < this.dailyChallenge.goal) {
                completed = true;
            }
        } else {
            if (this.challengeProgress >= this.dailyChallenge.goal) {
                completed = true;
            }
        }

        if (completed) {
            this.isCompletedForSession = true;
            localStorage.setItem('challengeCompletedDate', new Date().toDateString());
            
            const currentScore = this.registry.get('score');
            this.registry.set('score', currentScore + DAILY_CHALLENGE_REWARD);
            this.events.emit('scoreChanged');

            if (this.challengeCompleteText && this.challengeCompleteText.active) {
                this.challengeCompleteText.destroy();
            }

            this.challengeCompleteText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Challenge Complete!', {
                fontSize: '48px',
                color: '#48bb78',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#1a202c'
            }).setOrigin(0.5).setPadding(20);
            this.challengeCompleteText.setScrollFactor(0);

            this.time.delayedCall(2500, () => {
                if (this.challengeCompleteText && this.challengeCompleteText.active) {
                    this.challengeCompleteText.destroy();
                }
            });

            this.events.emit('challengeCompleted');
        }
    }

    // Hazard Methods
    triggerFallingRock(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, spawner: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const spawnerSprite = spawner as Phaser.Physics.Arcade.Sprite;
        const lastTrigger = spawnerSprite.getData('lastTrigger') || 0;
        if (this.time.now < lastTrigger + 2000) return; // 2 second cooldown

        spawnerSprite.setData('lastTrigger', this.time.now);
        const rock = this.fallingRocks.create((player as Phaser.Physics.Arcade.Sprite).x, spawnerSprite.y, 'falling_rock');
        rock.body.setSize(rock.width * 0.8, rock.height * 0.8);
    }
    
    hitByHazard(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, rock: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        (rock as Phaser.Physics.Arcade.Sprite).destroy();
        this.takeDamage();
    }
    
    hitByGeyser(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, geyser: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isInvincible) return;
        
        this.player.setVelocityY(PLAYER_JUMP_VELOCITY * 0.9);
        this.canDoubleJump = false; // Prevent double jumping out of a geyser boost
        this.takeDamage();
    }
    
    // Visual Effects Methods
    spawnDrip(x: number, y: number) {
        if (!this.scene.isActive()) return;
        const drip = this.drips.create(x, y, 'drip');
        drip.setVelocityX(Phaser.Math.Between(-10, 10));
    }

    handleDripSplash(drip: Phaser.Types.Physics.Arcade.GameObjectWithBody, platform: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const dripSprite = drip as Phaser.Physics.Arcade.Sprite;
        const splash = this.add.sprite(dripSprite.x, dripSprite.y, 'splash').setOrigin(0.5, 1);
        dripSprite.destroy();

        this.tweens.add({
            targets: splash,
            scale: 1.5,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                splash.destroy();
            }
        });
    }

    // Boss Methods
    startBossAttacks() {
        this.attackTimer = this.time.addEvent({
            delay: 2000,
            callback: this.bossAttack,
            callbackScope: this,
            loop: true
        });
    }

    bossAttack() {
        if (!this.boss || !this.boss.active) {
            this.attackTimer?.remove();
            return;
        }

        if (this.boss.getData('isAttacking')) {
            return; // Don't start a new attack if one is in progress (during a 'tell')
        }

        const phase = this.bossHealth > BOSS_HEALTH / 2 ? 1 : 2;

        switch (this.bossAttackPattern) {
            case 1: // First Boss
                if (phase === 1) {
                    if (Phaser.Math.Between(1, 10) <= 7) {
                        this.bossThrowProjectile();
                    } else {
                        this.bossCharge();
                    }
                } else { // Phase 2
                    if (Phaser.Math.Between(1, 10) <= 5) {
                        this.bossThrowProjectile();
                        this.time.delayedCall(200, this.bossThrowProjectile, [], this);
                    } else {
                        this.bossCharge();
                    }
                }
                break;
            case 2: // Second Boss
                const attackType = Phaser.Math.Between(1, 3);
                if (attackType === 1) {
                    this.bossThrowSpreadProjectile(phase === 1 ? 3 : 5);
                } else if (attackType === 2) {
                    this.bossThrowHomingProjectile();
                } else {
                    this.bossCharge();
                }
                break;
        }
    }

    bossThrowProjectile() {
        if (!this.boss || !this.boss.active || !this.player.active) return;
        
        this.boss.setData('isAttacking', true);
        this.boss.setTint(0xf6e05e); // Yellow tint for regular throw
    
        this.time.delayedCall(400, () => {
            if (!this.boss || !this.boss.active) {
                this.boss?.setData('isAttacking', false);
                return;
            }
    
            this.boss.clearTint();
            const projectile = this.projectiles.create(this.boss.x, this.boss.y, 'projectile');
            projectile.body.onWorldBounds = true;
            this.physics.moveToObject(projectile, this.player, 400);
            
            this.boss.setData('isAttacking', false);
        });
    }

    bossThrowSpreadProjectile(count: number) {
        if (!this.boss || !this.boss.active || !this.player.active) return;
        
        this.boss.setData('isAttacking', true);
        this.boss.setTint(0xed8936); // Orange for spread
        this.tweens.add({
            targets: this.boss,
            scale: 1.1,
            duration: 300,
            yoyo: true,
            ease: 'Power1'
        });
    
        this.time.delayedCall(600, () => {
            if (!this.boss || !this.boss.active) {
                this.boss?.setData('isAttacking', false);
                return;
            }
    
            this.boss.clearTint();
            const centerAngle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
            const spreadAngle = Phaser.Math.DegToRad(15);
            const startAngle = centerAngle - (spreadAngle * (count - 1)) / 2;
    
            for (let i = 0; i < count; i++) {
                const angle = startAngle + i * spreadAngle;
                const projectile = this.projectiles.create(this.boss.x, this.boss.y, 'projectile');
                projectile.setScale(0.8);
                this.physics.velocityFromRotation(angle, 450, projectile.body.velocity);
            }
    
            this.boss.setData('isAttacking', false);
        });
    }

    bossThrowHomingProjectile() {
        if (!this.boss || !this.boss.active) return;
        
        this.boss.setData('isAttacking', true);
        this.boss.setTint(0x9f7aea); // Purple for homing
    
        const sparkle = this.add.sprite(this.boss.x, this.boss.y - 60, 'sparkle').setAlpha(0);
    
        this.tweens.add({
            targets: sparkle,
            alpha: 1,
            scale: 2,
            angle: 180,
            duration: 400,
            yoyo: true,
            repeat: 0
        });
    
        this.time.delayedCall(800, () => {
            sparkle.destroy();
            if (!this.boss || !this.boss.active) {
                this.boss?.setData('isAttacking', false);
                return;
            }
    
            this.boss.clearTint();
            const projectile = this.homingProjectiles.create(this.boss.x, this.boss.y, 'projectile_homing');
            this.physics.moveToObject(projectile, this.player, 300);
            
            this.time.delayedCall(5000, () => {
                if (projectile.active) {
                    projectile.destroy();
                }
            });
    
            this.boss.setData('isAttacking', false);
        });
    }
    
    bossCharge() {
        if (!this.boss || !this.boss.active) return;
    
        this.boss.setData('isAttacking', true);
        this.boss.setTint(0xff6666); // Red tint
        this.tweens.add({
            targets: this.boss,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 250,
            yoyo: true,
            ease: 'Power1',
        });
    
        this.time.delayedCall(500, () => {
            if (!this.boss || !this.boss.active) {
                this.boss?.setData('isAttacking', false);
                return;
            }
    
            this.boss.clearTint();
            const chargeSpeed = 800;
            const targetX = this.player.x;
            this.boss.setVelocityX(targetX < this.boss.x ? -chargeSpeed : chargeSpeed);
            
            this.time.delayedCall(800, () => {
                if (this.boss && this.boss.active) {
                    this.boss.setVelocityX(0);
                }
                this.time.delayedCall(200, () => {
                    this.boss?.setData('isAttacking', false);
                });
            });
        });
    }

    hitBoss(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, boss: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isInvincible) return;

        const playerSprite = player as Phaser.Physics.Arcade.Sprite;
        playerSprite.setVelocityY(-400);

        this.bossHealth--;
        this.events.emit('bossHealthChanged', { currentHealth: this.bossHealth });

        this.boss?.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            this.boss?.clearTint();
        });

        if (this.bossHealth <= 0) {
            this.bossDie();
        } else if (this.bossHealth === BOSS_HEALTH / 2) {
            // Phase change visual effect
            this.boss?.setTint(0xffff00);
            this.time.delayedCall(500, () => this.boss?.clearTint());
            this.attackTimer?.remove();
            this.attackTimer = this.time.addEvent({
                delay: 1200, // Faster attacks in phase 2
                callback: this.bossAttack,
                callbackScope: this,
                loop: true
            });
        }
    }
    
    hitByProjectile(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        (projectile as Phaser.Physics.Arcade.Sprite).destroy();
        this.takeDamage();
    }

    bossDie() {
        if (!this.boss) return;
        this.attackTimer?.remove();
        this.boss.disableBody(true, false);

        this.events.emit('bossDefeated');

        this.tweens.add({
            targets: this.boss,
            alpha: 0,
            scale: 2,
            angle: 360,
            duration: 500,
            onComplete: () => {
                this.boss?.destroy();
            }
        });

        const level = LEVELS[this.levelIndex];
        this.time.delayedCall(1000, () => {
            this.goal = this.physics.add.staticSprite(level.goal.x, level.goal.y, 'goal');
            this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
        });
    }
}

class UIScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    scene!: Phaser.Scenes.ScenePlugin;
    
    private scoreText!: Phaser.GameObjects.Text;
    private powerUpText!: Phaser.GameObjects.Text;
    private challengeText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private dashText!: Phaser.GameObjects.Text;
    private dailyChallenge: any;
    private isChallengeCompleted = false;
    private levelIndex = 0;

    // Boss UI
    private bossHealthBar?: Phaser.GameObjects.Graphics;
    private bossHealthBarBg?: Phaser.GameObjects.Graphics;
    private bossNameText?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIScene' });
    }

    init(data: { challenge: any; isCompleted: boolean; levelIndex: number }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
        this.levelIndex = data.levelIndex;
    }

    create() {
        this.scoreText = this.add.text(16, 16, 'Bananas: 0', {
            fontSize: '32px',
            color: '#f6e05e',
            fontStyle: 'bold',
            stroke: '#6b4a2b',
            strokeThickness: 5
        });

        this.powerUpText = this.add.text(16, 50, 'Power-up: None', {
            fontSize: '24px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 4
        });

        this.levelText = this.add.text(GAME_WIDTH - 16, 16, `Level: ${this.levelIndex + 1}`, {
            fontSize: '32px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 5
        }).setOrigin(1, 0);

        this.challengeText = this.add.text(16, 80, '', {
             fontSize: '24px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 4
        });

        this.dashText = this.add.text(16, 110, 'Dash: Ready', {
            fontSize: '24px',
            color: '#4299e1',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 4
        });
        
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('scoreChanged', () => {
            this.scoreText.setText('Bananas: ' + gameScene.registry.get('score') / 10);
        });

        gameScene.events.on('powerUpChanged', (data: { type: string, timeLeft: number }) => {
            if (data.timeLeft > 0) {
                const typeName = data.type.charAt(0).toUpperCase() + data.type.slice(1);
                this.powerUpText.setText(`Power-up: ${typeName} (${data.timeLeft}s)`);
            } else if (data.type === 'shield') {
                this.powerUpText.setText('Power-up: Shield');
            }
            else {
                this.powerUpText.setText('Power-up: None');
            }
        });

        gameScene.events.on('dashStatusChanged', (data: { ready: boolean, cooldown: number }) => {
            if (data.ready) {
                this.dashText.setText('Dash: Ready');
                this.dashText.setColor('#4299e1');
            } else {
                const cooldownSeconds = (data.cooldown / 1000).toFixed(1);
                this.dashText.setText(`Dash: ${cooldownSeconds}s`);
                this.dashText.setColor('#a0aec0');
            }
        });

        // Challenge UI
        if (this.isChallengeCompleted) {
            this.challengeText.setText('Challenge: Completed');
            this.challengeText.setColor('#48bb78');
        } else {
             this.challengeText.setText(`Challenge: ${this.dailyChallenge.progressText(0)}`);
        }
       
        gameScene.events.on('challengeProgressChanged', (data: { progress: number }) => {
            if (!this.isChallengeCompleted) {
                this.challengeText.setText(`Challenge: ${this.dailyChallenge.progressText(data.progress)}`);
            }
        });

        gameScene.events.on('challengeCompleted', () => {
            this.isChallengeCompleted = true;
            this.challengeText.setText('Challenge: Completed');
            this.challengeText.setColor('#48bb78');
        });

        // Boss UI Listeners
        gameScene.events.on('bossSpawned', this.createBossUI, this);
        gameScene.events.on('bossHealthChanged', this.updateBossHealth, this);
        gameScene.events.on('bossDefeated', this.destroyBossUI, this);
    }
    
    createBossUI(data: { maxHealth: number, currentHealth: number }) {
        const barWidth = 400;
        const barHeight = 25;
        const x = GAME_WIDTH / 2 - barWidth / 2;
        const y = 50;

        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.fillStyle(0x2d3748, 0.8);
        this.bossHealthBarBg.fillRoundedRect(x, y, barWidth, barHeight, 8);

        this.bossHealthBar = this.add.graphics();
        this.updateBossHealth({ currentHealth: data.currentHealth });

        this.bossNameText = this.add.text(GAME_WIDTH / 2, y - 5, 'Jungle Gorilla', {
            fontSize: '28px',
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 5
        }).setOrigin(0.5);
    }

    updateBossHealth(data: { currentHealth: number }) {
        if (!this.bossHealthBar) return;

        const percentage = Math.max(0, data.currentHealth / BOSS_HEALTH);
        const barWidth = 400;
        const barHeight = 25;
        const x = GAME_WIDTH / 2 - barWidth / 2;
        const y = 50;

        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(percentage > 0.5 ? 0x48bb78 : (percentage > 0.2 ? 0xf6e05e : 0xc53030));
        this.bossHealthBar.fillRoundedRect(x, y, barWidth * percentage, barHeight, 8);
    }

    destroyBossUI() {
        this.bossHealthBar?.destroy();
        this.bossHealthBarBg?.destroy();
        this.bossNameText?.destroy();
        this.bossHealthBar = undefined;
        this.bossHealthBarBg = undefined;
        this.bossNameText = undefined;
    }
}

class GameOverScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Game Over', {
            fontSize: '64px',
            color: '#c53030',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Click to Restart', {
            fontSize: '32px',
            color: '#a0aec0'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }
}


const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: GRAVITY },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainMenuScene, LevelSelectScene, GameScene, UIScene, GameOverScene]
};

new Phaser.Game(config);