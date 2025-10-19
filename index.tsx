
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP_VELOCITY, GRAVITY, SPEED_BOOST_MODIFIER, SPEED_BOOST_DURATION, JUMP_BOOST_MODIFIER, JUMP_BOOST_DURATION, ENEMY_SPEED, CHALLENGES, DAILY_CHALLENGE_REWARD, LEVELS } from './constants';

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
            this.scene.start('GameScene', { challenge: todayChallenge, isCompleted: isCompleted, levelIndex: 0, score: 0 });
            this.scene.start('UIScene', { challenge: todayChallenge, isCompleted: isCompleted, levelIndex: 0 });
        });
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
    
    // Daily Challenge Properties
    private dailyChallenge: any;
    private isChallengeCompleted = false;
    private isCompletedForSession = false;
    private challengeProgress = 0;
    private levelStartTime = 0;
    private challengeCompleteText?: Phaser.GameObjects.Text;

    private levelIndex = 0;
    private initialScore = 0;


    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data: { challenge: any; isCompleted: boolean; levelIndex: number; score?: number }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
        this.levelIndex = data.levelIndex;
        this.initialScore = data.score || 0;
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

        this.platforms = this.physics.add.staticGroup();
        level.platforms.forEach(p => {
            const platform = this.platforms.create(p.x, p.y, 'platform');
            // FIX: Property 'scaleY' does not exist on the inferred type of 'p'.
            // Using 'as any' to bypass the type check and preserve the original logic,
            // which allows for an optional 'scaleY' property.
            if ((p as any).scaleX || (p as any).scaleY) {
                platform.setScale((p as any).scaleX || 1, (p as any).scaleY || 1).refreshBody();
            }
        });

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

        this.enemies = this.physics.add.group();
        level.enemies.forEach(e => {
            const enemy = this.enemies.create(e.x, e.y, 'enemy');
            enemy.setCollideWorldBounds(true);
            enemy.setVelocityX(e.velocityX || ENEMY_SPEED);
        });

        const goal = this.physics.add.staticSprite(level.goal.x, level.goal.y, 'goal');

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, undefined, this);
        this.physics.add.collider(this.player, traps, this.hitTrap, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, undefined, this);
        this.physics.add.overlap(this.player, goal, this.reachGoal, undefined, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.registry.set('score', this.initialScore);
        this.events.emit('scoreChanged');
        this.events.emit('powerUpChanged', { type: 'None', timeLeft: 0 });

        // Challenge Init
        this.challengeProgress = 0;
        this.isCompletedForSession = this.isChallengeCompleted;
        this.levelStartTime = this.time.now;
        this.events.emit('challengeProgressChanged', { progress: 0 });
    }

    update() {
        if (!this.player.active) return;
        
        if (this.dailyChallenge.type === 'time') {
            const elapsed = (this.time.now - this.levelStartTime) / 1000;
            this.challengeProgress = elapsed;
            this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
        }
        
        this.enemies.children.each(c => {
            const enemy = c as Phaser.Physics.Arcade.Sprite;
            if (!enemy.active) return;
            if (enemy.body.blocked.right) {
                enemy.setVelocityX(-ENEMY_SPEED);
            } else if (enemy.body.blocked.left) {
                enemy.setVelocityX(ENEMY_SPEED);
            }
        });

        if (this.shieldActive && this.shieldSprite) {
            this.shieldSprite.setPosition(this.player.x, this.player.y);
        }

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const onGround = body.touching.down;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.currentSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.currentSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && onGround) {
            this.player.setVelocityY(this.currentJumpVelocity);
            this.tweens.add({ targets: this.player, scaleY: 1.2, scaleX: 0.8, duration: 100, yoyo: true, ease: 'Power1' });
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

    hitEnemy(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isInvincible) return;

        const playerSprite = player as Phaser.Physics.Arcade.Sprite;
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

        if (playerSprite.body.velocity.y > 0 && playerSprite.y < enemySprite.y) {
            enemySprite.disableBody(true, true);
            playerSprite.setVelocityY(-300); // Bounce
            if (this.dailyChallenge.type === 'enemy') {
                this.challengeProgress++;
                this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
                this.checkChallengeCompletion();
            }
        } else {
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
            } else {
                this.hitTrap();
            }
        }
    }
    
    hitTrap() {
        if (!this.player.active) return;
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

        this.tweens.killTweensOf(this.player);
        this.physics.pause();
        this.player.active = false;
        this.player.setTint(0x00ff00);
        
        const nextLevelIndex = this.levelIndex + 1;
        const isLastLevel = nextLevelIndex >= LEVELS.length;

        const message = isLastLevel ? 'You Win!' : 'Level Complete!';
        const winText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, { fontSize: '64px', color: '#f6e05e', fontStyle: 'bold' }).setOrigin(0.5);
        winText.setScrollFactor(0);

        this.time.delayedCall(2000, () => {
            this.scene.stop('UIScene');
             if (isLastLevel) {
                this.scene.start('MainMenuScene');
            } else {
                const currentScore = this.registry.get('score');
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
}

class UIScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    scene!: Phaser.Scenes.ScenePlugin;
    
    private scoreText!: Phaser.GameObjects.Text;
    private powerUpText!: Phaser.GameObjects.Text;
    private challengeText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private dailyChallenge: any;
    private isChallengeCompleted = false;
    private levelIndex = 0;

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
            gravity: { y: GRAVITY },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainMenuScene, GameScene, UIScene, GameOverScene]
};

new Phaser.Game(config);
