
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP_VELOCITY, GRAVITY, SPEED_BOOST_MODIFIER, SPEED_BOOST_DURATION, JUMP_BOOST_MODIFIER, JUMP_BOOST_DURATION, ENEMY_SPEED, CHALLENGES, DAILY_CHALLENGE_REWARD } from './constants';

class MainMenuScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a202c).setOrigin(0);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, 'Ultimate Level Challenge', {
            fontSize: '64px',
            color: '#48bb78',
            fontStyle: 'bold'
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
            color: '#a0aec0'
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, todayChallenge.description, {
            fontSize: '28px',
            color: '#cbd5e0'
        }).setOrigin(0.5);

        if (isCompleted) {
             this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, '(Completed)', {
                fontSize: '24px',
                color: '#48bb78'
            }).setOrigin(0.5);
        }


        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Click to Start', {
            fontSize: '32px',
            color: '#a0aec0'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('GameScene', { challenge: todayChallenge, isCompleted: isCompleted });
            this.scene.start('UIScene', { challenge: todayChallenge, isCompleted: isCompleted });
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


    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data: { challenge: any; isCompleted: boolean }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
    }

    preload() {
        // Avatar
        const avatarGraphics = this.make.graphics();
        avatarGraphics.fillStyle(0x63b3ed);
        avatarGraphics.fillRect(16, 24, 32, 40); 
        avatarGraphics.fillStyle(0x90cdf4);
        avatarGraphics.fillRect(24, 8, 16, 16);
        avatarGraphics.generateTexture('avatar', 64, 64);
        avatarGraphics.destroy();

        // Platform
        const platformGraphics = this.make.graphics({ fillStyle: { color: 0x4a5568 } });
        platformGraphics.fillRect(0, 0, 200, 32);
        platformGraphics.generateTexture('platform', 200, 32);
        platformGraphics.destroy();
        
        // Coin
        const coinGraphics = this.make.graphics({ fillStyle: { color: 0xf6e05e } });
        coinGraphics.fillCircle(16, 16, 16);
        coinGraphics.generateTexture('coin', 32, 32);
        coinGraphics.destroy();
        
        // Trap
        const trapGraphics = this.make.graphics({ fillStyle: { color: 0xc53030 } });
        trapGraphics.fillRect(0, 0, 64, 32);
        trapGraphics.generateTexture('trap', 64, 32);
        trapGraphics.destroy();
        
        // Goal
        const goalGraphics = this.make.graphics({ fillStyle: { color: 0x38a169 } });
        goalGraphics.fillRect(0, 0, 64, 128);
        goalGraphics.generateTexture('goal', 64, 128);
        goalGraphics.destroy();
        
        // Enemy
        const enemyGraphics = this.make.graphics();
        enemyGraphics.fillStyle(0xe53e3e);
        enemyGraphics.fillRect(8, 8, 32, 32);
        enemyGraphics.fillStyle(0xffffff);
        enemyGraphics.fillCircle(18, 18, 4);
        enemyGraphics.fillCircle(30, 18, 4);
        enemyGraphics.generateTexture('enemy', 48, 48);
        enemyGraphics.destroy();

        // Power-ups
        const speedGraphics = this.make.graphics();
        speedGraphics.fillStyle(0x4299e1);
        speedGraphics.slice(16, 16, 12, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), true);
        speedGraphics.fillPath();
        speedGraphics.generateTexture('speed_boost', 32, 32);
        speedGraphics.destroy();

        const shieldPowerupGraphics = this.make.graphics();
        shieldPowerupGraphics.fillStyle(0x4fd1c5, 0.5);
        shieldPowerupGraphics.fillCircle(16, 16, 16);
        shieldPowerupGraphics.lineStyle(2, 0x4fd1c5);
        shieldPowerupGraphics.strokeCircle(16, 16, 16);
        shieldPowerupGraphics.generateTexture('shield_powerup', 32, 32);
        shieldPowerupGraphics.destroy();

        const activeShieldGraphics = this.make.graphics();
        activeShieldGraphics.fillStyle(0x4fd1c5, 0.3);
        activeShieldGraphics.fillCircle(40, 40, 38);
        activeShieldGraphics.lineStyle(2, 0x81e6d9);
        activeShieldGraphics.strokeCircle(40, 40, 38);
        activeShieldGraphics.generateTexture('shield_active', 80, 80);
        activeShieldGraphics.destroy();

        const jumpGraphics = this.make.graphics();
        jumpGraphics.fillStyle(0x9f7aea);
        jumpGraphics.fillEllipse(16, 16, 20, 10);
        jumpGraphics.generateTexture('jump_boost', 32, 32);
        jumpGraphics.destroy();
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d3748');
        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.platforms = this.physics.add.staticGroup();
        // Redesigned Level
        this.platforms.create(150, GAME_HEIGHT - 50, 'platform'); // Start
        this.platforms.create(450, GAME_HEIGHT - 150, 'platform').setScale(0.7, 1).refreshBody();
        this.platforms.create(800, GAME_HEIGHT - 250, 'platform');
        this.platforms.create(500, GAME_HEIGHT - 380, 'platform').setScale(0.5, 1).refreshBody();
        this.platforms.create(900, GAME_HEIGHT - 500, 'platform');
        this.platforms.create(1200, GAME_HEIGHT - 350, 'platform').setScale(0.8, 1).refreshBody();
        this.platforms.create(GAME_WIDTH - 50, GAME_HEIGHT - 120, 'platform').setScale(0.5,1).refreshBody();

        this.player = this.physics.add.sprite(100, GAME_HEIGHT - 100, 'avatar');
        this.player.setCollideWorldBounds(true);

        this.coins = this.physics.add.group({ allowGravity: false });
        // Place enough coins for the challenge
        for(let i = 0; i < 10; i++) {
            this.coins.create(400 + i * 50, GAME_HEIGHT - 450, 'coin');
        }

        this.powerups = this.physics.add.group({ allowGravity: false });
        this.powerups.create(840, GAME_HEIGHT - 280, 'speed_boost').setData('type', 'speed');
        this.powerups.create(500, GAME_HEIGHT - 150, 'shield_powerup').setData('type', 'shield');
        this.powerups.create(940, GAME_HEIGHT - 530, 'jump_boost').setData('type', 'jump');

        const traps = this.physics.add.staticGroup();
        traps.create(1100, GAME_HEIGHT - 50, 'trap');

        this.enemies = this.physics.add.group();
        const enemy = this.enemies.create(850, GAME_HEIGHT - 280, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(ENEMY_SPEED);

        const goal = this.physics.add.staticSprite(GAME_WIDTH - 50, GAME_HEIGHT - 184, 'goal');

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, undefined, this);
        this.physics.add.collider(this.player, traps, this.hitTrap, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, undefined, this);
        this.physics.add.overlap(this.player, goal, this.reachGoal, undefined, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.registry.set('score', 0);
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
        const winText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'You Win!', { fontSize: '64px', color: '#f6e05e', fontStyle: 'bold' }).setOrigin(0.5);
        winText.setScrollFactor(0);
        this.time.delayedCall(2000, () => {
            this.scene.stop('UIScene');
            this.scene.start('MainMenuScene');
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
    private dailyChallenge: any;
    private isChallengeCompleted = false;

    constructor() {
        super({ key: 'UIScene' });
    }

    init(data: { challenge: any; isCompleted: boolean }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
    }

    create() {
        this.scoreText = this.add.text(16, 16, 'Coins: 0', {
            fontSize: '32px',
            color: '#f6e05e',
            fontStyle: 'bold'
        });

        this.powerUpText = this.add.text(16, 50, 'Power-up: None', {
            fontSize: '24px',
            color: '#a0aec0',
            fontStyle: 'bold'
        });

        this.challengeText = this.add.text(16, 80, '', {
             fontSize: '24px',
            color: '#cbd5e0',
            fontStyle: 'bold'
        });
        
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('scoreChanged', () => {
            this.scoreText.setText('Coins: ' + gameScene.registry.get('score'));
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
