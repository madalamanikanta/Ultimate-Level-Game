import Phaser from 'phaser';
// FIX: Corrected typo in constant name from DAILY_CHallenge_REWARD to DAILY_CHALLENGE_REWARD.
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_JUMP_VELOCITY, GRAVITY, SPEED_BOOST_MODIFIER, SPEED_BOOST_DURATION, JUMP_BOOST_MODIFIER, JUMP_BOOST_DURATION, ENEMY_SPEED, CHALLENGES, DAILY_CHALLENGE_REWARD, LEVELS, DASH_VELOCITY, DASH_DURATION, DASH_COOLDOWN, BOSS_HEALTH, TURTLE_ROLL_SPEED, COSMETICS, PARRY_WINDOW, PARRY_COOLDOWN, ENEMY_STUN_DURATION } from './constants';
import { syncProgress, resetLocalProgress, uploadResetToServer, fetchProgressFromServer } from "./services/api";

// Helper functions for managing cosmetic data in localStorage
const getCosmeticsData = () => {
    try {
        const data = localStorage.getItem('ultimateLevelChallenge_cosmetics');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Failed to parse cosmetics data", e);
    }
    // Default data if none exists
    return {
        unlocked: ['outfit_default', 'hat_none'],
        equipped: {
            outfit: 'outfit_default',
            hat: 'hat_none'
        }
    };
};

const saveCosmeticsData = (data: any) => {
    localStorage.setItem('ultimateLevelChallenge_cosmetics', JSON.stringify(data));
};

const getLevelData = () => {
    try {
        const data = localStorage.getItem('ultimateLevelChallenge_levelData');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Failed to parse level data", e);
    }
    // Default data is an empty object
    return {};
};

const saveLevelData = (data: any) => {
    try {
        // 1️⃣ Always save locally first (offline-first)
        localStorage.setItem(
            'ultimateLevelChallenge_levelData',
            JSON.stringify(data)
        );

        // 2️⃣ Fire-and-forget backend sync
        // Does NOT block gameplay
        // Safe if internet is off
        syncProgress(data);
    } catch (err) {
        // Never crash the game because of saving
        console.error("Failed to save level data:", err);
    }
};


class MainMenuScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;
    make!: Phaser.GameObjects.GameObjectCreator;
    // FIX: The sound manager type was incorrect, causing assignment and method access errors. Changed to WebAudioSoundManager.
    sound!: Phaser.Sound.WebAudioSoundManager;

    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    private drawPlayerFrame(key: string, drawCallback: (g: Phaser.GameObjects.Graphics) => void) {
        if (this.textures.exists(key)) return;
        const g = this.make.graphics({x: 0, y: 0});
        drawCallback(g);
        g.generateTexture(key, 64, 68);
        g.destroy();
    }

    preload() {
        if (!this.textures.exists('background')) {
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

        // MOVED FROM GameScene: Player animation frames for CustomizationScene preview
        const drawBody = (g: Phaser.GameObjects.Graphics) => {
            g.fillStyle(0x8b5a2b); // Torso/Arms base color
            g.fillRect(22, 24, 20, 16);
            g.fillStyle(0xffd3a9); // Head
            g.fillRect(24, 8, 16, 16);
            g.fillStyle(0x4a5568); // Shorts
            g.fillRect(20, 40, 24, 18);
        };

        this.drawPlayerFrame('avatar_idle', g => {
            drawBody(g);
            g.fillStyle(0x5a3a22); // Boots
            g.fillRect(22, 58, 8, 10);
            g.fillRect(34, 58, 8, 10);
        });

        this.drawPlayerFrame('avatar_run_1', g => {
            drawBody(g);
            g.fillStyle(0x5a3a22); // Boots
            g.fillRect(16, 58, 8, 10); // Back leg
            g.fillRect(40, 58, 8, 10); // Front leg
        });
        
        this.drawPlayerFrame('avatar_run_2', g => {
            drawBody(g);
            g.fillStyle(0x5a3a22); // Boots
            g.fillRect(40, 58, 8, 10); // Back leg
            g.fillRect(16, 58, 8, 10); // Front leg
        });

        this.drawPlayerFrame('avatar_jump', g => {
            drawBody(g);
            g.fillStyle(0x5a3a22); // Boots
            g.fillRect(22, 52, 8, 8); // Tucked legs
            g.fillRect(34, 52, 8, 8);
        });

        this.drawPlayerFrame('avatar_hurt', g => {
            drawBody(g);
            g.fillStyle(0x5a3a22); // Boots
            g.fillRect(22, 58, 8, 10);
            g.fillRect(34, 58, 8, 10);
            // Add 'X' eyes for hurt state
            g.lineStyle(2, 0x000000);
            g.beginPath();
            // Left eye
            g.moveTo(26, 12); g.lineTo(30, 16);
            g.moveTo(30, 12); g.lineTo(26, 16);
            // Right eye
            g.moveTo(34, 12); g.lineTo(38, 16);
            g.moveTo(38, 12); g.lineTo(34, 16);
            g.strokePath();
        });

        this.drawPlayerFrame('avatar_climb', g => {
            drawBody(g);
            g.fillStyle(0x8b5a2b); // Raised arms
            g.fillRect(18, 16, 8, 8);
            g.fillRect(38, 16, 8, 8);
            g.fillStyle(0x5a3a22); // Boots
            g.fillRect(22, 58, 8, 10);
            g.fillRect(34, 58, 8, 10);
        });
        
        // Pre-generate cosmetic hat textures
        if (!this.textures.exists('hat_fedora')) {
            const fedoraGraphics = this.make.graphics();
            fedoraGraphics.fillStyle(0x8b5a2b);
            fedoraGraphics.slice(16, 12, 14, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), true).fillPath();
            fedoraGraphics.fillStyle(0x2d3748);
            fedoraGraphics.fillRect(4, 11, 24, 4);
            fedoraGraphics.generateTexture('hat_fedora', 32, 16);
            fedoraGraphics.destroy();
        }

        if (!this.textures.exists('hat_pith')) {
            const pithGraphics = this.make.graphics();
            pithGraphics.fillStyle(0xf0e68c);
            pithGraphics.fillEllipse(16, 8, 30, 14);
            pithGraphics.fillStyle(0x6b4a2b);
            pithGraphics.fillRect(2, 7, 28, 3);
            pithGraphics.generateTexture('hat_pith', 32, 16);
            pithGraphics.destroy();
        }
        
        if (!this.textures.exists('hat_tophat')) {
            const tophatGraphics = this.make.graphics();
            tophatGraphics.fillStyle(0x2d3748);
            tophatGraphics.fillRect(0, 12, 32, 4);
            tophatGraphics.fillRect(6, 0, 20, 12);
            tophatGraphics.fillStyle(0xc53030);
            tophatGraphics.fillRect(6, 9, 20, 3);
            tophatGraphics.generateTexture('hat_tophat', 32, 16);
            tophatGraphics.destroy();
        }
        
        if (!this.textures.exists('hat_crown')) {
            const crownGraphics = this.make.graphics();
            crownGraphics.fillStyle(0xf6e05e);
            crownGraphics.beginPath();
            crownGraphics.moveTo(4, 14);
            crownGraphics.lineTo(4, 2);
            crownGraphics.lineTo(10, 8);
            crownGraphics.lineTo(16, 2);
            crownGraphics.lineTo(22, 8);
            crownGraphics.lineTo(28, 2);
            crownGraphics.lineTo(28, 14);
            crownGraphics.closePath();
            crownGraphics.fillPath();
            crownGraphics.fillStyle(0xc53030);
            crownGraphics.fillCircle(16, 12, 3);
            crownGraphics.generateTexture('hat_crown', 32, 16);
            crownGraphics.destroy();
        }

        // Coin - Banana (Moved from GameScene to be globally available for UI)
        if (!this.textures.exists('coin')) {
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
        }

        // UI Progress Bar Icons
        if (!this.textures.exists('player_marker_icon')) {
            const playerMarkerGraphics = this.make.graphics();
            playerMarkerGraphics.fillStyle(0xffd3a9); // Player head color
            playerMarkerGraphics.fillCircle(8, 8, 8);
            playerMarkerGraphics.lineStyle(2, 0x5a3a22);
            playerMarkerGraphics.strokeCircle(8, 8, 8);
            playerMarkerGraphics.generateTexture('player_marker_icon', 16, 16);
            playerMarkerGraphics.destroy();
        }

        if (!this.textures.exists('goal_marker_icon')) {
            const goalMarkerGraphics = this.make.graphics();
            goalMarkerGraphics.fillStyle(0x6b4a2b); // Pole
            goalMarkerGraphics.fillRect(4, 0, 4, 16);
            goalMarkerGraphics.fillStyle(0x9b2c2c); // Red flag
            goalMarkerGraphics.fillTriangle(8, 0, 8, 8, 16, 4);
            goalMarkerGraphics.generateTexture('goal_marker_icon', 16, 16);
            goalMarkerGraphics.destroy();
        }

        // Level Complete Screen Icons
        if (!this.textures.exists('icon_clock')) {
            const clockIconGraphics = this.make.graphics();
            clockIconGraphics.fillStyle(0xedf2f7);
            clockIconGraphics.fillCircle(16, 16, 14);
            clockIconGraphics.fillStyle(0x2d3748);
            clockIconGraphics.fillRect(15, 6, 2, 11);
            clockIconGraphics.fillRect(15, 15, 10, 2);
            clockIconGraphics.generateTexture('icon_clock', 32, 32);
            clockIconGraphics.destroy();
        }
        
        if (!this.textures.exists('icon_skull')) {
            const skullIconGraphics = this.make.graphics();
            skullIconGraphics.fillStyle(0xedf2f7);
            skullIconGraphics.fillEllipse(16, 14, 24, 20);
            skullIconGraphics.fillStyle(0x2d3748);
            skullIconGraphics.fillCircle(11, 12, 4);
            skullIconGraphics.fillCircle(21, 12, 4);
            skullIconGraphics.fillTriangle(16, 18, 14, 22, 18, 22);
            skullIconGraphics.fillRect(12, 26, 2, 4);
            skullIconGraphics.fillRect(18, 26, 2, 4);
            skullIconGraphics.generateTexture('icon_skull', 32, 32);
            skullIconGraphics.destroy();
        }
        
        // Lock Icon (moved here to be globally available)
        if (!this.textures.exists('lock_icon')) {
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
        
        // Star Icons
        if (!this.textures.exists('star_filled')) {
            const starGraphics = this.make.graphics();
            const starPoints = (x: number, y: number, radius: number) => {
                const points = [];
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? radius : radius / 2;
                    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                    points.push({
                        x: x + r * Math.cos(angle),
                        y: y + r * Math.sin(angle),
                    });
                }
                return points;
            };
            
            // Filled star
            starGraphics.fillStyle(0xf6e05e); // gold
            starGraphics.fillPoints(starPoints(16, 16, 14), true);
            starGraphics.generateTexture('star_filled', 32, 32);
            starGraphics.clear();

            // Empty star
            starGraphics.lineStyle(2, 0xa0aec0); // grey
            starGraphics.strokePoints(starPoints(16, 16, 14), true);
            starGraphics.generateTexture('star_empty', 32, 32);
            starGraphics.destroy();
        }

        // Procedurally generate music if it doesn't exist
        if (!this.sound.get('background_music')) {
            // FIX: Use the game's audio context for better integration.
            const audioContext = this.sound.context;
            const sampleRate = audioContext.sampleRate;
            const duration = 120; // 2 minutes
            const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);

            // Simple procedural jungle beat
            const channel1 = buffer.getChannelData(0);
            const channel2 = buffer.getChannelData(1);
            let time = 0;
            const bpm = 120;
            const quarterNoteTime = 60 / bpm;
            let nextKick = 0;
            let nextSnare = quarterNoteTime;
            let nextHihat = 0;
            let nextTom = quarterNoteTime * 1.5;

            // Melody
            const melodyNotes = [220, 247, 261, 293, 330, 349];
            let nextMelodyNote = 0;

            for (let i = 0; i < channel1.length; i++) {
                time = i / sampleRate;

                // Kick Drum (low tom sound)
                if (time >= nextKick) {
                    const frequency = 60;
                    const attack = 0.01;
                    const decay = 0.15;
                    const volume = Math.exp(- (time - nextKick) / decay);
                    channel1[i] += Math.sin(frequency * (time - nextKick) * 2 * Math.PI) * volume * (1 - Math.exp(-(time - nextKick) / attack));
                    if (time > nextKick + decay) nextKick += quarterNoteTime;
                }
                
                // Snare (white noise burst)
                if (time >= nextSnare) {
                    const decay = 0.1;
                    const volume = Math.exp(- (time - nextSnare) / decay);
                    channel1[i] += (Math.random() * 2 - 1) * volume * 0.5;
                    if (time > nextSnare + decay) nextSnare += quarterNoteTime * 2;
                }
                
                // Hi-hat (short noise burst)
                if (time >= nextHihat) {
                    const decay = 0.05;
                    const volume = Math.exp(- (time - nextHihat) / decay);
                    channel2[i] += (Math.random() * 2 - 1) * volume * 0.2;
                    if (time > nextHihat + decay) nextHihat += quarterNoteTime / 2;
                }
                
                // Tom-tom fills
                if (time >= nextTom) {
                    const frequency = 120;
                     const decay = 0.2;
                    const volume = Math.exp(- (time - nextTom) / decay);
                    channel2[i] += Math.sin(frequency * (time - nextTom) * 2 * Math.PI) * volume;
                    if (time > nextTom + decay) {
                        nextTom += quarterNoteTime * 8 * Math.ceil(Math.random() * 2);
                        if (Math.random() > 0.5) nextTom += quarterNoteTime / 2;
                    }
                }
                
                // Ambient melody/pads
                if (time >= nextMelodyNote) {
                     const noteDuration = quarterNoteTime * 4;
                     const freq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
                     const attack = 0.2;
                     const decay = noteDuration - attack;
                     const volume = Math.exp(-(time - nextMelodyNote) / decay);
                     const attackVolume = (1 - Math.exp(-(time-nextMelodyNote)/attack));
                     const val = Math.sin(freq * (time-nextMelodyNote) * 2 * Math.PI) * volume * attackVolume * 0.1;
                     channel1[i] += val;
                     channel2[i] += val;
                     if (time > nextMelodyNote + noteDuration) {
                        nextMelodyNote += noteDuration;
                     }
                }
            }
            
            // FIX: The method `addAudio` does not exist. Use the audio cache to add the buffer.
            this.cache.audio.add('background_music', buffer);
        }

    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.add.image(0, 0, 'background').setOrigin(0);
        // Attempt to fetch authoritative progress from backend on app start/login.
        // This does NOT reset anything locally unless the backend has been reset explicitly.
        fetchProgressFromServer().catch(err => console.warn('Initial progress fetch failed:', err));
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, 'Ultimate Level Challenge', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 64,
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

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'Daily Challenge:', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#2d3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, todayChallenge.description, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 28,
            color: '#1a202c',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (isCompleted) {
             this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, '(Completed)', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
                fontSize: 24,
                color: '#38a169',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        const startButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'Start Game', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#f7fafc',
            fontStyle: 'bold',
            backgroundColor: '#8b5a2b',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();
        
        startButton.on('pointerover', () => startButton.setBackgroundColor('#6b4a2b'));
        startButton.on('pointerout', () => startButton.setBackgroundColor('#8b5a2b'));
        startButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.start('LevelSelectScene', { challenge: todayChallenge, isCompleted: isCompleted });
                }
            });
        });
        
        const customizeButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 170, 'Customize', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#f7fafc',
            fontStyle: 'bold',
            backgroundColor: '#4a5568',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        customizeButton.on('pointerover', () => customizeButton.setBackgroundColor('#2d3748'));
        customizeButton.on('pointerout', () => customizeButton.setBackgroundColor('#4a5568'));
        customizeButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.start('CustomizationScene');
                }
            });
        });

        // Explicit Reset Progress action (mobile & desktop) — requires confirmation
        const resetButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 240, 'Reset Progress', {
            fontSize: 20,
            color: '#f7fafc',
            backgroundColor: '#c53030',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setInteractive();

        resetButton.on('pointerdown', async () => {
            // Explicit confirmation to avoid accidental resets
            const ok = window.confirm('Reset all local progress and upload reset to cloud? This cannot be undone.');
            if (!ok) return;

            // 1) Reset local progress immediately so offline behavior works
            resetLocalProgress();

            // 2) Try to upload reset to server — fire-and-forget, do not block UI
            uploadResetToServer().catch(err => console.warn('Upload reset failed:', err));

            // Provide brief feedback
            resetButton.setText('Progress Reset');
            this.time.delayedCall(2000, () => resetButton.setText('Reset Progress'));
        });
    }
}

class CustomizationScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;
    make!: Phaser.GameObjects.GameObjectCreator;

    private cosmeticsData: any;
    private currentSelection: any;
    private previewAvatar!: Phaser.GameObjects.Sprite;
    private previewHat?: Phaser.GameObjects.Sprite;
    private tooltip?: Phaser.GameObjects.Text;
    
    constructor() {
        super({ key: 'CustomizationScene' });
    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.add.image(0, 0, 'background').setOrigin(0);

        this.cosmeticsData = getCosmeticsData();
        this.currentSelection = { ...this.cosmeticsData.equipped };

        this.add.text(GAME_WIDTH / 2, 80, 'Customize Your Explorer', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 64,
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Preview Area
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
        this.add.text(320, 180, 'Preview', { fontSize: 48, color: '#2d3748', fontStyle: 'bold' }).setOrigin(0.5);
        const previewBg = this.add.graphics();
        previewBg.fillStyle(0xedf2f7, 0.5);
        previewBg.fillRoundedRect(120, 220, 400, 400, 16);
        this.previewAvatar = this.add.sprite(320, 420, 'avatar_idle').setScale(4);
        this.previewHat = this.add.sprite(320, 420 - 64, 'hat_fedora').setScale(4).setVisible(false);
        
        // Selection Area
        const selectionX = 700;
        const outfits = COSMETICS.filter(c => c.type === 'outfit');
        const hats = COSMETICS.filter(c => c.type === 'hat');
        
        this.createSelectionList('Outfits', outfits, selectionX, 220);
        this.createSelectionList('Hats', hats, selectionX, 450);

        // Save Button
        const saveButton = this.add.text(GAME_WIDTH - 150, GAME_HEIGHT - 70, 'Save & Exit', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
             fontSize: 32, color: '#f7fafc', fontStyle: 'bold', backgroundColor: '#38a169', padding: {x: 15, y: 10}
        }).setOrigin(0.5).setInteractive();

        saveButton.on('pointerover', () => saveButton.setBackgroundColor('#2f855a'));
        saveButton.on('pointerout', () => saveButton.setBackgroundColor('#38a169'));
        saveButton.on('pointerdown', () => {
            this.cosmeticsData.equipped = this.currentSelection;
            saveCosmeticsData(this.cosmeticsData);
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.start('MainMenuScene');
                }
            });
        });
        
        // Tooltip for locked items
        this.tooltip = this.add.text(0, 0, '', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 18,
            color: '#f7fafc',
            backgroundColor: 'rgba(45, 55, 72, 0.9)',
            padding: { x: 10, y: 5 },
            wordWrap: { width: 250 },
            align: 'center'
        }).setOrigin(0.5, 1).setDepth(100).setVisible(false);
        
        this.updatePreview();
    }
    
    createSelectionList(title: string, items: any[], x: number, y: number) {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
        this.add.text(x, y - 20, title, { fontSize: 32, color: '#2d3748', fontStyle: 'bold' });

        const itemsPerRow = 5;
        const buttonSize = 80;
        const spacing = 20;

        items.forEach((item, index) => {
            const isUnlocked = this.cosmeticsData.unlocked.includes(item.id);
            const isEquipped = this.currentSelection[item.type] === item.id;
            
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const buttonX = x + col * (buttonSize + spacing);
            const buttonY = y + 40 + row * (buttonSize + spacing);

            const container = this.add.container(buttonX, buttonY);
            const buttonBg = this.add.graphics();
            buttonBg.lineStyle(4, isEquipped ? 0xf6e05e : (isUnlocked ? 0x2d3748 : 0xa0aec0));
            buttonBg.fillStyle(isUnlocked ? 0xedf2f7 : 0x718096, 0.8);
            buttonBg.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 8);
            buttonBg.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 8);
            container.add(buttonBg);
            
            if (item.type === 'outfit') {
                const swatch = this.add.graphics();
                swatch.fillStyle(item.tint);
                swatch.fillCircle(0, 0, 25);
                container.add(swatch);
            } else if (item.texture) {
                const hatIcon = this.add.image(0, 0, item.texture).setScale(2);
                container.add(hatIcon);
            } else {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
                 const noHatText = this.add.text(0, 0, 'None', { fontSize: 20, color: '#2d3748' }).setOrigin(0.5);
                 container.add(noHatText);
            }
            
            if (!isUnlocked) {
                 const lockIcon = this.add.image(0, 0, 'lock_icon').setScale(1.5).setAlpha(0.9);
                 container.add(lockIcon);
                 container.setSize(buttonSize, buttonSize).setInteractive();

                 let unlockText = 'Unlock condition not specified.';
                 if (item.unlock.type === 'level') {
                     const levelNum = item.unlock.value + 1;
                     const isBoss = !!LEVELS[item.unlock.value]?.boss;
                     const levelName = isBoss ? 'the Boss' : `Level ${levelNum}`;
                     unlockText = `Unlock by completing ${levelName}.`;
                 } else if (item.unlock.type === 'challenge') {
                     unlockText = 'Unlock by completing a Daily Challenge.';
                 }

                 container.on('pointerover', (pointer: Phaser.Input.Pointer) => {
                    if (this.tooltip) {
                        this.tooltip.setText(`${item.name}\n${unlockText}`);
                        this.tooltip.setPosition(pointer.x, pointer.y - 15);
                        this.tooltip.setVisible(true);
                    }
                 });
                 container.on('pointerout', () => {
                     if (this.tooltip) {
                         this.tooltip.setVisible(false);
                     }
                 });

            } else {
                 container.setSize(buttonSize, buttonSize).setInteractive();
                 container.on('pointerdown', () => {
                     this.currentSelection[item.type] = item.id;
                     // Redraw all buttons to update selection outline
                     this.scene.restart();
                 });
            }
        });
    }

    updatePreview() {
        const outfit = COSMETICS.find(c => c.id === this.currentSelection.outfit);
        const hat = COSMETICS.find(c => c.id === this.currentSelection.hat);

        if (outfit) {
            this.previewAvatar.setTint(outfit.tint);
        }

        if (this.previewHat) {
            if (hat && hat.texture && this.textures.exists(hat.texture)) {
                this.previewHat.setTexture(hat.texture).setVisible(true);
            } else {
                this.previewHat.setVisible(false);
            }
        }
    }
}

class LevelSelectScene extends Phaser.Scene {
    add!: Phaser.GameObjects.GameObjectFactory;
    input!: Phaser.Input.InputPlugin;
    scene!: Phaser.Scenes.ScenePlugin;
    make!: Phaser.GameObjects.GameObjectCreator;

    public dailyChallenge: any;
    private isChallengeCompleted = false;
    private currentScore = 0;
    
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data: { challenge: any; isCompleted: boolean; currentScore?: number }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
        this.currentScore = data.currentScore || 0;
    }

    preload() {
        // Star and Lock Icons are now preloaded in MainMenuScene
    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.add.image(0, 0, 'background').setOrigin(0);

        this.add.text(GAME_WIDTH / 2, 80, 'Select Level', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 64,
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 8
        }).setOrigin(0.5);

        const levelData = getLevelData();
        let totalStars = 0;
        Object.values(levelData).forEach((data: any) => {
            totalStars += data.stars || 0;
        });

        this.add.text(GAME_WIDTH - 40, 60, `${totalStars} ★`, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 48, color: '#f6e05e', fontStyle: 'bold', stroke: '#2d3748', strokeThickness: 6
        }).setOrigin(1, 0.5);
        
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
            
            const starsForThisLevel = levelData[index]?.stars || 0;
            const starsRequired = level.starsToUnlock;
            const isLocked = totalStars < starsRequired;
            const isBossLevel = !!level.boss;

            const buttonContainer = this.add.container(x, y);

            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(isLocked ? 0x4a5568 : (isBossLevel ? 0x9b2c2c : 0x8b5a2b));
            buttonBg.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
            buttonBg.lineStyle(4, isLocked ? 0x2d3748 : (isBossLevel ? 0x742a2a : 0x6b4a2b));
            buttonBg.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 16);
            buttonContainer.add(buttonBg);
            
            const levelText = this.add.text(0, -10, `${index + 1}`, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
                fontSize: 50,
                color: '#f7fafc',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            if (isBossLevel) {
                 levelText.setText('B');
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
                 levelText.setFontSize(60);
            }
            buttonContainer.add(levelText);

            if (isLocked) {
                const lockIcon = this.add.image(0, 0, 'lock_icon');
                buttonContainer.add(lockIcon);
                levelText.setAlpha(0.3);

// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
                const requiredText = this.add.text(0, 35, `${starsRequired} ★`, { fontSize: 24, color: '#f7fafc' }).setOrigin(0.5);
                buttonContainer.add(requiredText);
            } else {
                for (let i = 0; i < 3; i++) {
                    const starTexture = i < starsForThisLevel ? 'star_filled' : 'star_empty';
                    const star = this.add.image(-25 + i * 25, 35, starTexture).setScale(0.7);
                    buttonContainer.add(star);
                }

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
                    this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                        if (progress === 1) {
                            this.scene.start('GameScene', {
                                challenge: this.dailyChallenge,
                                isCompleted: this.isChallengeCompleted,
                                levelIndex: index,
                                score: this.currentScore
                            });
                            this.scene.launch('UIScene', {
                                challenge: this.dailyChallenge,
                                isCompleted: this.isChallengeCompleted,
                                levelIndex: index
                            });
                        }
                    });
                });
            }
        });

        // Back button
        const backButton = this.add.text(100, GAME_HEIGHT - 70, '< Back', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 48,
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerover', () => backButton.setColor('#f6e05e'));
        backButton.on('pointerout', () => backButton.setColor('#f7fafc'));
        backButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.start('MainMenuScene');
                }
            });
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
    // FIX: The sound manager type was incorrect, causing assignment errors. Changed to WebAudioSoundManager.
    sound!: Phaser.Sound.WebAudioSoundManager;
    textures!: Phaser.Textures.TextureManager;

    private player!: Phaser.Physics.Arcade.Sprite;
    private playerHat?: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private movingPlatforms!: Phaser.Physics.Arcade.Group;
    private coins!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private powerups!: Phaser.Physics.Arcade.Group;
    private wasOnGround = false;
    private shieldActive = false;
    private shieldWasUsedThisLevel = false;
    private shieldSprite?: Phaser.GameObjects.Sprite;
    private activePowerUpTimer?: Phaser.Time.TimerEvent;
    private currentSpeed = PLAYER_SPEED;
    private currentJumpVelocity = PLAYER_JUMP_VELOCITY;
    private isInvincible = false;
    private canDoubleJump = false;
    private isHurt = false;
    
    // Dash Properties
    private shiftKey!: Phaser.Input.Keyboard.Key;
    private canDash = true;
    private isDashing = false;
    private facingDirection = 'right';
    private dashCooldownTimer?: Phaser.Time.TimerEvent;

    // Parry Properties
    private ctrlKey!: Phaser.Input.Keyboard.Key;
    private canParry = true;
    private isParrying = false;
    private parryCooldownTimer?: Phaser.Time.TimerEvent;

    // Daily Challenge Properties
    public dailyChallenge: any;
    public isChallengeCompleted = false;
    private isCompletedForSession = false;
    private challengeProgress = 0;
    private levelStartTime = 0;
    private challengeCompleteText?: Phaser.GameObjects.Text;

    public levelIndex = 0;
    public initialScore = 0;
    private levelStartX = 0;
    private levelEndX = 0;

    // Level Stats
    private levelCoinsCollected = 0;
    private levelEnemiesDefeated = 0;

    // Boss properties
    private boss?: Phaser.Physics.Arcade.Sprite;
    private bossHealth = 0;
    private projectiles!: Phaser.Physics.Arcade.Group;
    private homingProjectiles!: Phaser.Physics.Arcade.Group;
    public isBossLevel = false;
    private goal?: Phaser.Physics.Arcade.Sprite;
    private attackTimer?: Phaser.Time.TimerEvent;
    private bossAttackPattern = 1;

    // NEW: Visual Effects Emitters
    private dashEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private landEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private collectEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    // FIX: The ParticleEmitterManager type is incorrect in newer Phaser versions.
    // The related logic has been updated to use the ParticleEmitter directly.
    private enemyDefeatEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private parrySuccessEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private bossHitEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    // FIX: Add a property to hold the dynamic particle tint for collection effects.
    private particleTint = 0xffffff;

    // Hazard properties
    private fallingRockSpawners!: Phaser.Physics.Arcade.StaticGroup;
    private fallingRocks!: Phaser.Physics.Arcade.Group;
    private geysers!: Phaser.Physics.Arcade.Group;
    private quicksandPits!: Phaser.Physics.Arcade.StaticGroup;
    private playerInQuicksand = false;

    // Visual Effects
    private vines!: Phaser.Physics.Arcade.Group;
    private drips!: Phaser.Physics.Arcade.Group;
    
    // Tutorial Properties
    private tutorialTriggers!: Phaser.Physics.Arcade.StaticGroup;
    private shownTutorials!: Set<string>;

    // Pause Properties
    private escapeKey!: Phaser.Input.Keyboard.Key;

    // Vine Swinging Properties
    private isSwinging = false;
    private attachedVine: Phaser.Physics.Arcade.Sprite | null = null;
    private swingAnchor: { x: number, y: number } | null = null;
    private swingRadius = 0;
    private swingAngle = 0;
    private swingAngularVelocity = 0;
    private grabbableVine: Phaser.Physics.Arcade.Sprite | null = null;
    private grabCooldown = false;

    // Control Optimization Properties
    private lastOnGroundTime = 0;
    private jumpBufferTime = 0;
    private readonly COYOTE_TIME = 100; // ms
    private readonly JUMP_BUFFER = 100; // ms
    private readonly HORIZONTAL_ACCELERATION = 2000;
    private readonly HORIZONTAL_DRAG = 2500;

    // Mobile touch input flags (MobileControls)
    private moveLeft = false;
    private moveRight = false;
    private jumpPressed = false;
    private dashPressed = false;
    private parryPressed = false;
    // Edge detection for action buttons (to emulate JustDown)
    private lastJumpPressed = false;
    private lastDashPressed = false;
    private lastParryPressed = false;

    // New Enemy Properties
    private spiderProjectiles!: Phaser.Physics.Arcade.Group;


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
        this.isHurt = false;
        this.levelCoinsCollected = 0;
        this.levelEnemiesDefeated = 0;
        this.shieldWasUsedThisLevel = false;

        // Load shown tutorials from localStorage
        try {
            const stored = localStorage.getItem('ultimateLevelChallenge_shownTutorials');
            this.shownTutorials = stored ? new Set(JSON.parse(stored)) : new Set();
        } catch (e) {
            this.shownTutorials = new Set();
        }
    }

    preload() {
        // Platform - Mossy rock/wood
        if (!this.textures.exists('platform')) {
            const platformGraphics = this.make.graphics();
            platformGraphics.fillStyle(0x6b4a2b);
            platformGraphics.fillRect(0, 0, 200, 32);
            platformGraphics.fillStyle(0x48bb78, 0.7);
            platformGraphics.fillRect(0, 0, 200, 8);
            platformGraphics.fillRect(30, 8, 50, 5);
            platformGraphics.fillRect(120, 8, 40, 5);
            platformGraphics.generateTexture('platform', 200, 32);
            platformGraphics.destroy();
        }
        
        // Moving Platform
        if (!this.textures.exists('moving_platform')) {
            const movingPlatformGraphics = this.make.graphics();
            movingPlatformGraphics.fillStyle(0x8b5a2b); // Base color
            movingPlatformGraphics.fillRect(0, 0, 200, 32);
            movingPlatformGraphics.fillStyle(0xf6e05e, 0.8); // Add gold accents
            movingPlatformGraphics.fillCircle(15, 16, 8);
            movingPlatformGraphics.fillCircle(185, 16, 8);
            movingPlatformGraphics.fillRect(15, 14, 170, 4);
            movingPlatformGraphics.generateTexture('moving_platform', 200, 32);
            movingPlatformGraphics.destroy();
        }

        // Trap - Spikes
        if (!this.textures.exists('trap')) {
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
        }
        
        // Goal - Temple Door
        if (!this.textures.exists('goal')) {
            const goalGraphics = this.make.graphics();
            goalGraphics.fillStyle(0x718096);
            goalGraphics.fillRect(0, 0, 64, 128);
            goalGraphics.fillStyle(0x2d3748);
            goalGraphics.fillRect(12, 20, 40, 108);
            goalGraphics.fillStyle(0xa0aec0);
            goalGraphics.fillRect(8, 12, 48, 8);
            goalGraphics.generateTexture('goal', 64, 128);
            goalGraphics.destroy();
        }
        
        // Enemy - Snake
        if (!this.textures.exists('enemy')) {
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
        }

        // Enemy - Bat
        if (!this.textures.exists('enemy_bat')) {
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
        }
        
        // NEW ENEMY: Flying Beetle
        if (!this.textures.exists('enemy_beetle')) {
            const beetleGraphics = this.make.graphics();
            beetleGraphics.fillStyle(0x5a3a22); // Dark brown body
            beetleGraphics.fillEllipse(24, 24, 30, 20);
            beetleGraphics.fillStyle(0xa0aec0, 0.8); // Grey wings
            beetleGraphics.fillEllipse(16, 16, 16, 10);
            beetleGraphics.fillEllipse(32, 16, 16, 10);
            beetleGraphics.fillStyle(0xc53030); // Red eye
            beetleGraphics.fillCircle(14, 22, 3);
            beetleGraphics.generateTexture('enemy_beetle', 48, 48);
            beetleGraphics.destroy();
        }

        // NEW ENEMY: Spitting Spider
        if (!this.textures.exists('enemy_spider')) {
            const spiderGraphics = this.make.graphics();
            spiderGraphics.fillStyle(0x2d3748); // Dark grey body
            spiderGraphics.fillEllipse(24, 24, 24, 18); // body
            spiderGraphics.lineStyle(4, 0x2d3748); // legs
            spiderGraphics.beginPath();
            // Top legs
            spiderGraphics.moveTo(16, 18); spiderGraphics.lineTo(4, 8);
            spiderGraphics.moveTo(18, 16); spiderGraphics.lineTo(8, 4);
            spiderGraphics.moveTo(30, 16); spiderGraphics.lineTo(40, 4);
            spiderGraphics.moveTo(32, 18); spiderGraphics.lineTo(44, 8);
            // Bottom legs
            spiderGraphics.moveTo(16, 30); spiderGraphics.lineTo(4, 40);
            spiderGraphics.moveTo(18, 32); spiderGraphics.lineTo(8, 44);
            spiderGraphics.moveTo(30, 32); spiderGraphics.lineTo(40, 44);
            spiderGraphics.moveTo(32, 30); spiderGraphics.lineTo(44, 40);
            spiderGraphics.strokePath();
            spiderGraphics.fillStyle(0xc53030); // Red hourglass
            spiderGraphics.fillTriangle(24, 22, 20, 28, 28, 28);
            spiderGraphics.generateTexture('enemy_spider', 48, 48);
            spiderGraphics.destroy();
        }
        
        // NEW: Spider Venom Projectile
        if (!this.textures.exists('projectile_venom')) {
            const venomGraphics = this.make.graphics();
            venomGraphics.fillStyle(0x48bb78); // Green
            venomGraphics.fillCircle(8, 8, 6);
            venomGraphics.fillStyle(0x38a169, 0.7); // Darker green highlight
            venomGraphics.fillCircle(6, 6, 2);
            venomGraphics.generateTexture('projectile_venom', 16, 16);
            venomGraphics.destroy();
        }

        // Enemy - Spiky Turtle
        if (!this.textures.exists('enemy_turtle')) {
            const turtleGraphics = this.make.graphics();
            turtleGraphics.fillStyle(0x8b5a2b); // brown body
            turtleGraphics.fillEllipse(24, 28, 40, 20); // body
            turtleGraphics.fillStyle(0x2f855a); // dark green shell
            turtleGraphics.fillEllipse(24, 22, 36, 24); // shell
            turtleGraphics.fillStyle(0xf6e05e); // yellow spikes
            turtleGraphics.fillTriangle(16, 12, 12, 2, 20, 2);
            turtleGraphics.fillTriangle(24, 15, 20, 5, 28, 5);
            turtleGraphics.fillTriangle(32, 12, 28, 2, 36, 2);
            turtleGraphics.fillStyle(0x000000); // eye
            turtleGraphics.fillCircle(10, 26, 2);
            turtleGraphics.generateTexture('enemy_turtle', 48, 48);
            turtleGraphics.destroy();
        }

        // Boss - Jungle Gorilla
        if (!this.textures.exists('boss_gorilla')) {
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
        }

        // Projectile - Coconut
        if (!this.textures.exists('projectile')) {
            const projectileGraphics = this.make.graphics();
            projectileGraphics.fillStyle(0x6b4a2b);
            projectileGraphics.fillCircle(16, 16, 12);
            projectileGraphics.fillStyle(0x4a2b1b);
            projectileGraphics.fillCircle(12, 12, 3);
            projectileGraphics.fillCircle(20, 12, 3);
            projectileGraphics.generateTexture('projectile', 32, 32);
            projectileGraphics.destroy();
        }
        
        // Homing Projectile - Banana-rang
        if (!this.textures.exists('projectile_homing')) {
            const homingProjectileGraphics = this.make.graphics();
            homingProjectileGraphics.fillStyle(0xf6e05e); // Banana yellow
            const boomerangPath = new Phaser.Curves.Path(16, 0);
            boomerangPath.cubicBezierTo(32, 0, 32, 32, 16, 32);
            boomerangPath.cubicBezierTo(24, 32, 24, 8, 16, 0);
            homingProjectileGraphics.fillPoints(boomerangPath.getPoints(), true);
            homingProjectileGraphics.generateTexture('projectile_homing', 32, 32);
            homingProjectileGraphics.destroy();
        }

        // Boss Tell VFX
        if (!this.textures.exists('sparkle')) {
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
        }

        // Explosion Particle
        if (!this.textures.exists('explosion_particle')) {
            const explosionParticleGraphics = this.make.graphics();
            explosionParticleGraphics.fillStyle(0xf6e05e); // Yellow
            explosionParticleGraphics.fillCircle(8, 8, 8);
            explosionParticleGraphics.generateTexture('explosion_particle', 16, 16);
            explosionParticleGraphics.destroy();
        }
        
        // Parry/Stun Effects
        if (!this.textures.exists('parry_effect')) {
            const parryEffectGraphics = this.make.graphics();
            parryEffectGraphics.lineStyle(4, 0x4299e1);
            parryEffectGraphics.fillStyle(0x4299e1, 0.3);
            parryEffectGraphics.beginPath();
            parryEffectGraphics.moveTo(0, 0);
            parryEffectGraphics.lineTo(32, 0);
            parryEffectGraphics.lineTo(32, 32);
            parryEffectGraphics.lineTo(16, 40);
            parryEffectGraphics.lineTo(0, 32);
            parryEffectGraphics.closePath();
            parryEffectGraphics.fillPath();
            parryEffectGraphics.strokePath();
            parryEffectGraphics.generateTexture('parry_effect', 32, 40);
            parryEffectGraphics.destroy();
        }

        if (!this.textures.exists('stun_effect')) {
            const stunEffectGraphics = this.make.graphics();
            stunEffectGraphics.fillStyle(0xf6e05e);
            const drawStar = (x: number, y: number) => {
                const spikes = 4;
                const outerRadius = 8;
                const innerRadius = 4;
                const points = [];
                const rot = Math.PI / 2 * 3;
                const angleStep = Math.PI / spikes;

                for (let i = 0; i < spikes * 2; i++) {
                    const radius = (i % 2 === 0) ? outerRadius : innerRadius;
                    const angle = rot + i * angleStep;
                    points.push({
                        x: x + radius * Math.cos(angle),
                        y: y + radius * Math.sin(angle),
                    });
                }

                stunEffectGraphics.beginPath();
                stunEffectGraphics.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    stunEffectGraphics.lineTo(points[i].x, points[i].y);
                }
                stunEffectGraphics.closePath();
                stunEffectGraphics.fillPath();
            };
            drawStar(8, 16);
            drawStar(24, 8);
            drawStar(40, 16);
            stunEffectGraphics.generateTexture('stun_effect', 48, 24);
            stunEffectGraphics.destroy();
        }

        // Power-ups
        if (!this.textures.exists('speed_boost')) {
            const speedGraphics = this.make.graphics();
            speedGraphics.fillStyle(0x4299e1);
            speedGraphics.fillRoundedRect(4, 8, 24, 16, 5);
            speedGraphics.fillStyle(0xffffff);
            speedGraphics.fillRoundedRect(8, 6, 18, 10, 4);
            speedGraphics.generateTexture('speed_boost', 32, 32);
            speedGraphics.destroy();
        }

        if (!this.textures.exists('shield_powerup')) {
            const shieldPowerupGraphics = this.make.graphics();
            shieldPowerupGraphics.fillStyle(0x8b5a2b);
            shieldPowerupGraphics.fillEllipse(16, 16, 28, 22);
            shieldPowerupGraphics.lineStyle(2, 0x6b4a2b);
            shieldPowerupGraphics.strokeEllipse(16, 16, 28, 22);
            shieldPowerupGraphics.fillStyle(0x6b4a2b);
            shieldPowerupGraphics.fillRect(4, 15, 24, 2);
            shieldPowerupGraphics.generateTexture('shield_powerup', 32, 32);
            shieldPowerupGraphics.destroy();
        }

        if (!this.textures.exists('shield_active')) {
            const activeShieldGraphics = this.make.graphics();
            activeShieldGraphics.fillStyle(0x9ae6b4, 0.4);
            activeShieldGraphics.fillCircle(40, 40, 38);
            activeShieldGraphics.lineStyle(2, 0x68d391);
            activeShieldGraphics.strokeCircle(40, 40, 38);
            activeShieldGraphics.generateTexture('shield_active', 80, 80);
            activeShieldGraphics.destroy();
        }

        if (!this.textures.exists('jump_boost')) {
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

        // Hazards
        if (!this.textures.exists('falling_rock')) {
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
        }

        if (!this.textures.exists('geyser_hole')) {
            const geyserHoleGraphics = this.make.graphics();
            geyserHoleGraphics.fillStyle(0x6b4a2b);
            geyserHoleGraphics.fillEllipse(24, 16, 48, 12);
            geyserHoleGraphics.fillStyle(0x4a2b1b);
            geyserHoleGraphics.fillEllipse(24, 14, 20, 8);
            geyserHoleGraphics.generateTexture('geyser_hole', 48, 32);
            geyserHoleGraphics.destroy();
        }

        if (!this.textures.exists('geyser_jet')) {
            const geyserJetGraphics = this.make.graphics();
            geyserJetGraphics.fillStyle(0xedf2f7, 0.8);
            geyserJetGraphics.fillRect(0, 0, 24, 150);
            geyserJetGraphics.fillStyle(0xa0aec0, 0.6);
            geyserJetGraphics.fillRect(4, 0, 16, 150);
            geyserJetGraphics.generateTexture('geyser_jet', 24, 150);
            geyserJetGraphics.destroy();
        }
        
        if (!this.textures.exists('quicksand')) {
            const quicksandGraphics = this.make.graphics();
            quicksandGraphics.fillStyle(0x6b4a2b);
            quicksandGraphics.fillRect(0, 0, 100, 40);
            quicksandGraphics.fillStyle(0x5a3a22, 0.8);
            for(let i = 0; i < 3; i++) {
                 quicksandGraphics.fillEllipse(Phaser.Math.Between(10, 90), Phaser.Math.Between(5, 35), Phaser.Math.Between(10, 25), Phaser.Math.Between(5, 10));
            }
            quicksandGraphics.generateTexture('quicksand', 100, 40);
            quicksandGraphics.destroy();
        }
        
        // Visual Effects
        if (!this.textures.exists('vine')) {
            const vineGraphics = this.make.graphics();
            vineGraphics.lineStyle(8, 0x2f855a);
            const vinePath = new Phaser.Curves.Path(10, 0);
            vinePath.quadraticBezierTo(20, 50, 10, 100);
            vinePath.quadraticBezierTo(0, 150, 10, 200);
            vinePath.draw(vineGraphics);
            vineGraphics.generateTexture('vine', 20, 200);
            vineGraphics.destroy();
        }

        if (!this.textures.exists('drip')) {
            const dripGraphics = this.make.graphics();
            dripGraphics.fillStyle(0x4299e1);
            dripGraphics.fillEllipse(4, 8, 8, 16);
            dripGraphics.generateTexture('drip', 16, 24);
            dripGraphics.destroy();
        }

        if (!this.textures.exists('splash')) {
            const splashGraphics = this.make.graphics();
            splashGraphics.lineStyle(2, 0x4299e1, 0.8);
            splashGraphics.strokeCircle(16, 16, 6);
            splashGraphics.strokeCircle(16, 16, 12);
            splashGraphics.generateTexture('splash', 32, 32);
            splashGraphics.destroy();
        }
        
        // NEW: VFX Particles
        if (!this.textures.exists('particle_blue')) {
            const blueParticle = this.make.graphics();
            blueParticle.fillStyle(0x4299e1);
            blueParticle.fillCircle(4, 4, 4);
            blueParticle.generateTexture('particle_blue', 8, 8);
            blueParticle.destroy();
        }

        if (!this.textures.exists('particle_smoke')) {
            const smokeParticle = this.make.graphics();
            smokeParticle.fillStyle(0xa0aec0, 0.7);
            smokeParticle.fillCircle(8, 8, 8);
            smokeParticle.generateTexture('particle_smoke', 16, 16);
            smokeParticle.destroy();
        }

        // FIX: Changed particle to white so it can be tinted dynamically for different collection effects.
        if (!this.textures.exists('particle_gold')) {
            const goldParticle = this.make.graphics();
            goldParticle.fillStyle(0xffffff);
            goldParticle.beginPath();
            goldParticle.moveTo(4, 0); goldParticle.lineTo(5, 3); goldParticle.lineTo(8, 4); goldParticle.lineTo(5, 5);
            goldParticle.lineTo(4, 8); goldParticle.lineTo(3, 5); goldParticle.lineTo(0, 4); goldParticle.lineTo(3, 3);
            goldParticle.closePath();
            goldParticle.fillPath();
            goldParticle.generateTexture('particle_gold', 8, 8);
            goldParticle.destroy();
        }
    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.sound.play('background_music', { loop: true, volume: 0.5 });
        this.events.on('pause', () => this.sound.pauseAll());
        this.events.on('resume', () => this.sound.resumeAll());
        this.events.on('shutdown', () => this.sound.stopAll());

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
        if (level.platforms) {
            level.platforms.forEach(p => {
                const platform = this.platforms.create(p.x, p.y, 'platform');
                if ((p as any).scaleX || (p as any).scaleY) {
                    platform.setScale((p as any).scaleX || 1, (p as any).scaleY || 1).refreshBody();
                }
            });
        }

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
        this.vines = this.physics.add.group({ allowGravity: false });
        if (level.vines) {
            level.vines.forEach(v => {
                const vine = this.vines.create(v.x, v.y, 'vine') as Phaser.Physics.Arcade.Sprite;
                vine.setOrigin(0.5, 0).refreshBody();
                (vine.body as Phaser.Physics.Arcade.Body).setSize(10, vine.height);
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

        this.player = this.physics.add.sprite(level.playerStart.x, level.playerStart.y, 'avatar_idle');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(32, 60);
        this.player.setDragX(this.HORIZONTAL_DRAG);
        
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'avatar_idle' }],
            frameRate: 1,
        });
        this.anims.create({
            key: 'run',
            frames: [{ key: 'avatar_run_1' }, { key: 'avatar_run_2' }],
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'avatar_jump' }],
            frameRate: 1,
        });
        this.anims.create({
            key: 'hurt',
            frames: [{ key: 'avatar_hurt' }],
            frameRate: 1,
        });
        this.anims.create({
            key: 'climb',
            frames: [{ key: 'avatar_climb' }],
            frameRate: 1,
        });
        
        // Apply cosmetics
        const cosmeticsData = getCosmeticsData();
        const equippedOutfit = COSMETICS.find(c => c.id === cosmeticsData.equipped.outfit);
        if (equippedOutfit) {
            this.player.setTint(equippedOutfit.tint);
        }
        const equippedHat = COSMETICS.find(c => c.id === cosmeticsData.equipped.hat);
        if (equippedHat && equippedHat.texture) {
            this.playerHat = this.add.sprite(this.player.x, this.player.y - 32, equippedHat.texture).setOrigin(0.5, 1);
        }


        this.coins = this.physics.add.group({ allowGravity: false });
        if (level.coins) {
            level.coins.forEach(c => {
                this.coins.create(c.x, c.y, 'coin');
            });
        }

        this.powerups = this.physics.add.group({ allowGravity: false });
        if (level.powerups) {
            level.powerups.forEach(p => {
                const key = p.type === 'shield' ? 'shield_powerup' : `${p.type}_boost`;
                this.powerups.create(p.x, p.y, key).setData('type', p.type);
            });
        }

        const traps = this.physics.add.staticGroup();
        if (level.traps) {
            level.traps.forEach(t => {
                traps.create(t.x, t.y, 'trap');
            });
        }
        
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

        this.spiderProjectiles = this.physics.add.group({ allowGravity: false });

        this.enemies = this.physics.add.group();
        if (!this.isBossLevel && level.enemies) {
            level.enemies.forEach(e => {
                if (e.type === 'bat') {
                    const enemy = this.enemies.create(e.x, e.y, 'enemy_bat') as Phaser.Physics.Arcade.Sprite;
                    (enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
                    enemy.setData('type', 'bat');
                    enemy.setData('patrolCenter', e.x);
                    enemy.setData('isSwooping', false);
                    enemy.setVelocityX(ENEMY_SPEED * 0.8);
                    enemy.setCollideWorldBounds(true);
                } else if (e.type === 'turtle') {
                    const enemy = this.enemies.create(e.x, e.y, 'enemy_turtle') as Phaser.Physics.Arcade.Sprite;
                    enemy.setData('type', 'turtle');
                    enemy.setData('isRolling', false);
                    enemy.setCollideWorldBounds(true);
                    (enemy.body as Phaser.Physics.Arcade.Body).setImmovable(true);
                } else if (e.type === 'beetle') {
                    const enemy = this.enemies.create(e.x, e.y, 'enemy_beetle') as Phaser.Physics.Arcade.Sprite;
                    (enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
                    enemy.setData('type', 'beetle');
                    enemy.setData('isCharging', false);
                    enemy.setData('originPos', { x: e.x, y: e.y });
                    enemy.setCollideWorldBounds(true);
                } else if (e.type === 'spider') {
                    const enemy = this.enemies.create(e.x, e.y, 'enemy_spider') as Phaser.Physics.Arcade.Sprite;
                    (enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
                    enemy.setData('type', 'spider');
                    enemy.setData('lastSpit', 0);
                    this.tweens.add({
                        targets: enemy,
                        y: e.y + (e.patrolDistance || 100),
                        duration: 3000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                } else { // Default to snake
                    const enemy = this.enemies.create(e.x, e.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
                    enemy.setData('type', 'snake');
                    enemy.setCollideWorldBounds(true);
                    enemy.setVelocityX(e.velocityX || ENEMY_SPEED);
                }
            });
        }
        
        // Emitter setup
        this.dashEmitter = this.add.particles(0, 0, 'particle_blue', {
            speed: { min: -100, max: 100 },
            scale: { start: 1, end: 0 },
            blendMode: 'SCREEN',
            lifespan: 200,
            gravityY: 200,
            emitting: false
        });
        this.dashEmitter.startFollow(this.player);


        this.landEmitter = this.add.particles(0 , 0 , 'particle_smoke', {
            speed: { min: 50, max: 100 },
            angle: { min: 240, max: 300 },
            scale: { start: 1, end: 0 },
            lifespan: 300,
            quantity: 10,
            emitting: false
        });

        this.collectEmitter = this.add.particles(0 , 0 , 'particle_gold', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 400,
            emitting: false
        });
        // FIX: Add an event listener to dynamically tint particles on emission.
        this.collectEmitter.on('emit', (particle: Phaser.GameObjects.Particles.Particle) => {
            if (particle) {
                particle.tint = this.particleTint;
            }
        });

        this.enemyDefeatEmitter = this.add.particles(0,0,'particle_smoke', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 15,
            emitting: false
        });

        this.parrySuccessEmitter = this.add.particles(0,0,'particle_blue', {
            speed: { min: 200, max: 400 },
            scale: { start: 2, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            emitting: false
        });

        this.bossHitEmitter = this.add.particles(0,0,'explosion_particle', {
            speed: { min: 100, max: 300 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'SCREEN',
            lifespan: 400,
            emitting: false
        });

        // Ensure particle emitters and timers are cleaned up when the scene shuts down
        this.events.once('shutdown', () => {
            try {
                const emitters = [this.dashEmitter, this.landEmitter, this.collectEmitter, this.enemyDefeatEmitter, this.parrySuccessEmitter, this.bossHitEmitter];
                emitters.forEach(em => {
                    if (!em) return;
                    // Particle managers returned by add.particles expose destroy()
                    try { (em as any).stop && (em as any).stop(); } catch (e) {}
                    try { (em as any).destroy && (em as any).destroy(); } catch (e) {}
                });

                // Stop any active timers
                try { this.activePowerUpTimer && this.activePowerUpTimer.destroy(); } catch (e) {}
                try { this.dashCooldownTimer && this.dashCooldownTimer.destroy(); } catch (e) {}
                try { this.parryCooldownTimer && this.parryCooldownTimer.destroy(); } catch (e) {}
                try { this.attackTimer && this.attackTimer.destroy(); } catch (e) {}

                // Stop all sounds to avoid referencing destroyed audio contexts
                try { this.sound && this.sound.stopAll(); } catch (e) {}
            } catch (err) {
                console.warn('Error during GameScene shutdown cleanup', err);
            }
        });

        if (!this.isBossLevel) {
            this.goal = this.physics.add.staticSprite(level.goal.x, level.goal.y, 'goal');
            this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
            this.levelStartX = level.playerStart.x;
            this.levelEndX = level.goal.x;
        } else {
            this.levelStartX = 0;
            this.levelEndX = 0;
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
        
        // New Enemy Colliders
        this.physics.add.overlap(this.player, this.spiderProjectiles, this.hitBySpiderVenom, undefined, this);
        this.physics.add.collider(this.spiderProjectiles, this.platforms, (p) => p.destroy(), undefined, this);

        // Visuals Colliders
        this.physics.add.collider(this.drips, this.platforms, this.handleDripSplash, undefined, this);
        this.physics.add.collider(this.drips, this.movingPlatforms, this.handleDripSplash, undefined, this);
        this.physics.add.overlap(this.player, this.vines, this.handleVineOverlap, undefined, this);
        
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
            this.physics.add.collider(this.player, this.boss, this.handlePlayerBossCollision, undefined, this);
            this.physics.add.collider(this.projectiles, this.platforms, (projectile) => projectile.destroy(), undefined, this);
            this.physics.add.collider(this.homingProjectiles, this.platforms, (projectile) => projectile.destroy(), undefined, this);
            
            this.physics.add.overlap(this.player, this.projectiles, this.hitByProjectile, undefined, this);
            this.physics.add.overlap(this.player, this.homingProjectiles, this.hitByProjectile, undefined, this);

            this.events.emit('bossSpawned', { maxHealth: BOSS_HEALTH, currentHealth: this.bossHealth });
            this.startBossCinematic();
        }


        this.cursors = this.input.keyboard.createCursorKeys();
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        // FIX: Use string key code 'Escape' as `KeyCodes.ESCAPE` may not exist in all Phaser type definitions.
        this.escapeKey = this.input.keyboard.addKey('Escape');

        // Mobile controls: create HUD only on touch-capable devices
        if (this.sys.game.device.input.touch) {
            // Prevent multi-touch conflicts: only the top-most input will be considered.
            // This improves Android WebView touch performance and avoids accidental multi-presses.
            this.input.setTopOnly(true);

            const hud = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
            // Increase base size for better touch targets on mobile
            const size = 100;
            const padding = 18;
            const y = GAME_HEIGHT - 80;

            // Movement buttons: bottom-left cluster (only left and right arrows)
            // Use larger visuals and a generous hit area.
            const leftX = 80;
            const rightX = leftX + size + padding;

            const leftBtn = this.add.circle(leftX, y, size / 2, 0x000000, 0.35).setScrollFactor(0).setInteractive();
            const rightBtn = this.add.circle(rightX, y, size / 2, 0x000000, 0.35).setScrollFactor(0).setInteractive();

            const leftIcon = this.add.text(leftX, y, '<=', { fontSize: 48, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);
            const rightIcon = this.add.text(rightX, y, '=>', { fontSize: 48, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);

            hud.add([leftBtn, rightBtn, leftIcon, rightIcon]);

            // Jump button: stays on bottom-right and should be larger for thumb access
            const jumpSize = Math.floor(size * 1.2);
            const jumpX = GAME_WIDTH - 100;
            const jumpBtn = this.add.circle(jumpX, y, jumpSize / 2, 0x000000, 0.4).setScrollFactor(0).setInteractive();
            const jumpIcon = this.add.text(jumpX, y, '^', { fontSize: 44, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);
            hud.add([jumpBtn, jumpIcon]);

            // Helper to bind pointer events (pointerdown -> start, pointerup/out/upoutside -> stop)
            const bindToggle = (btn: Phaser.GameObjects.GameObject, onSet: () => void, onClear: () => void) => {
                btn.on('pointerdown', (p: any) => { p.event.preventDefault?.(); onSet(); });
                btn.on('pointerup', (p: any) => { p.event.preventDefault?.(); onClear(); });
                btn.on('pointerout', (p: any) => { p.event.preventDefault?.(); onClear(); });
                btn.on('pointerupoutside', (p: any) => { p.event.preventDefault?.(); onClear(); });
            };

            // Movement uses press-and-hold. Flags merge with keyboard logic (OR checks in update()).
            bindToggle(leftBtn, () => { this.moveLeft = true; }, () => { this.moveLeft = false; });
            bindToggle(rightBtn, () => { this.moveRight = true; }, () => { this.moveRight = false; });
            // Jump handled separately (only bottom-right), do not create jump on bottom-left
            bindToggle(jumpBtn, () => { this.jumpPressed = true; }, () => { this.jumpPressed = false; });
        }

        this.registry.set('score', this.initialScore);
        this.events.emit('scoreChanged');
        this.events.emit('powerUpChanged', { type: 'None', timeLeft: 0 });
        this.events.emit('dashStatusChanged', { ready: true, cooldown: 0 });
        this.events.emit('parryStatusChanged', { ready: true, cooldown: 0 });

        // Challenge Init
        this.challengeProgress = 0;
        this.isCompletedForSession = this.isChallengeCompleted;
        this.levelStartTime = this.time.now;
        this.events.emit('challengeProgressChanged', { progress: 0 });

        // Tutorial Setup
        this.tutorialTriggers = this.physics.add.staticGroup();
        if (level.tutorials) {
            level.tutorials.forEach(tut => {
                if (this.shownTutorials.has(tut.id)) return;

                if (tut.type === 'level_start') {
                    this.time.delayedCall(500, () => this.displayHint(tut.text, tut.id));
                } else if (tut.type === 'trigger_zone') {
                    const zone = this.tutorialTriggers.create(tut.x, tut.y, undefined).setVisible(false);
                    zone.setSize(tut.width, tut.height).setOrigin(0.5, 0.5);
                    zone.setData('text', tut.text);
                    zone.setData('id', tut.id);
                    zone.refreshBody();
                }
            });
        }
        this.physics.add.overlap(this.player, this.tutorialTriggers, this.showTutorialHint, undefined, this);
    }

    update() {
        this.grabbableVine = null;
        if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            if (this.scene.isActive()) {
                this.scene.pause();
                this.scene.pause('UIScene');
                this.scene.launch('PauseScene', {
                    levelIndex: this.levelIndex,
                    challenge: this.dailyChallenge,
                    isCompleted: this.isChallengeCompleted,
                    score: this.initialScore
                });
            }
            return;
        }

        if (!this.player.active) return;
        
        if (this.isSwinging) {
            this.handleSwinging();
            if (this.playerHat) {
                this.playerHat.setPosition(this.player.x, this.player.y - 32);
                this.playerHat.setRotation(this.player.rotation);
                this.playerHat.setFlipX(this.player.flipX);
            }
            return;
        }

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const onGround = body.touching.down || body.blocked.down;
        
        // --- Animation Control ---
        if (!this.isHurt && !this.isDashing) {
             if (this.isSwinging) {
                this.player.anims.play('climb', true);
            } else if (onGround) {
                if (Math.abs(body.velocity.x) > 10) {
                    this.player.anims.play('run', true);
                } else {
                    this.player.anims.play('idle', true);
                }
            } else {
                this.player.anims.play('jump', true);
            }
        }

        if (this.isDashing) {
            if (this.playerHat) {
                this.playerHat.setPosition(this.player.x, this.player.y - 32);
                this.playerHat.setFlipX(this.player.flipX);
            }
            return; // Ignore other inputs while dashing
        }
        
        if (this.dailyChallenge.type === 'time' && !this.isBossLevel) {
            const elapsed = (this.time.now - this.levelStartTime) / 1000;
            this.challengeProgress = elapsed;
            this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
        }
        
        if (!this.isBossLevel && this.player.active && this.levelEndX > this.levelStartX) {
            const progress = Phaser.Math.Clamp((this.player.x - this.levelStartX) / (this.levelEndX - this.levelStartX), 0, 1);
            this.events.emit('progressUpdated', progress);
        }

        this.enemies.getChildren().forEach(c => {
            const enemy = c as Phaser.Physics.Arcade.Sprite;
            if (!enemy.active || enemy.getData('isStunned')) return;

            const type = enemy.getData('type');

            if (type === 'snake') {
                if (enemy.body.blocked.right) {
                    enemy.setVelocityX(-ENEMY_SPEED);
                    enemy.setFlipX(true);
                } else if (enemy.body.blocked.left) {
                    enemy.setVelocityX(ENEMY_SPEED);
                    enemy.setFlipX(false);
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
            } else if (type === 'turtle') {
                const isRolling = enemy.getData('isRolling');

                if (isRolling) {
                    enemy.setAngularVelocity(enemy.body.velocity.x * 2.5); // Spin when rolling
                    if (enemy.body.blocked.right) {
                        enemy.setVelocityX(-TURTLE_ROLL_SPEED);
                    } else if (enemy.body.blocked.left) {
                        enemy.setVelocityX(TURTLE_ROLL_SPEED);
                    }
                } else { // Not rolling, check for player
                    const distanceToPlayerX = Math.abs(this.player.x - enemy.x);
                    const distanceToPlayerY = Math.abs(this.player.y - enemy.y);
                    if (this.player.active && distanceToPlayerX < 300 && distanceToPlayerY < 50) {
                        enemy.setData('isRolling', true);
                        const rollSpeed = this.player.x < enemy.x ? -TURTLE_ROLL_SPEED : TURTLE_ROLL_SPEED;
                        enemy.setVelocityX(rollSpeed);

                        // "Tuck in" visual effect
                        this.tweens.add({
                            targets: enemy,
                            scaleY: 0.8,
                            duration: 100,
                            ease: 'Power1'
                        });
                    }
                }
            } else if (type === 'beetle') {
                const isCharging = enemy.getData('isCharging');
                const lastCharge = enemy.getData('lastCharge') || 0;
                const chargeCooldown = 3000;

                if (!isCharging && this.time.now > lastCharge + chargeCooldown) {
                    const distanceToPlayerX = Math.abs(this.player.x - enemy.x);
                    const distanceToPlayerY = Math.abs(this.player.y - enemy.y);

                    if (this.player.active && distanceToPlayerX < 400 && distanceToPlayerY < 100) {
                        enemy.setData('isCharging', true);
                        this.physics.moveToObject(enemy, this.player, 400);

                        this.time.delayedCall(1500, () => {
                            if (!enemy.active) return;
                            enemy.setVelocity(0, 0);

                            const originPos = enemy.getData('originPos');
                            this.tweens.add({
                                targets: enemy,
                                x: originPos.x,
                                y: originPos.y,
                                duration: 1000,
                                ease: 'Power2',
                                onComplete: () => {
                                    if (enemy.active) {
                                        enemy.setData('isCharging', false);
                                        enemy.setData('lastCharge', this.time.now);
                                    }
                                }
                            });
                        });
                    }
                }
                if (enemy.body.velocity.x !== 0) {
                    enemy.setFlipX(enemy.body.velocity.x < 0);
                }
            } else if (type === 'spider') {
                const lastSpit = enemy.getData('lastSpit') || 0;
                const spitCooldown = 2500;

                if (this.time.now > lastSpit + spitCooldown) {
                    const distanceToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    if (this.player.active && distanceToPlayer < 500 && this.player.y > enemy.y) {
                        enemy.setData('lastSpit', this.time.now);
                        const venom = this.spiderProjectiles.create(enemy.x, enemy.y, 'projectile_venom');
                        if (venom) {
                           this.physics.moveToObject(venom, this.player, 300);
                        }
                    }
                }
                enemy.setFlipX(this.player.x < enemy.x);
            }
        });
        
        this.fallingRocks.getChildren().forEach(r => {
            if ((r as Phaser.Physics.Arcade.Sprite).y > GAME_HEIGHT + 20) {
                r.destroy();
            }
        });

        // Quicksand Logic
        let onQuicksand = false;
        let overlappingPit: Phaser.Physics.Arcade.Sprite | null = null;
        this.physics.overlap(this.player, this.quicksandPits, (_player, pit) => {
            onQuicksand = true;
            overlappingPit = pit as Phaser.Physics.Arcade.Sprite;
        });

        this.playerInQuicksand = onQuicksand;

        if (this.playerInQuicksand) {
            this.player.setVelocityX(this.player.body.velocity.x * 0.9);
            if (this.player.body.velocity.y < 150) {
                this.player.setVelocityY(this.player.body.velocity.y + 20);
            }
            if (overlappingPit && this.player.getBounds().top > overlappingPit.getBounds().centerY) {
                this.hitTrap();
            }
        }

        if(this.isBossLevel && this.boss && this.boss.active) {
            this.boss.setFlipX(this.player.x < this.boss.x);
        }

        if (this.shieldActive && this.shieldSprite) {
            this.shieldSprite.setPosition(this.player.x, this.player.y);
        }
        
        if (this.playerHat) {
            this.playerHat.setPosition(this.player.x, this.player.y - 32);
            this.playerHat.setFlipX(this.player.flipX);
            if (!this.isSwinging) {
                this.player.setRotation(0);
                this.playerHat.setRotation(0);
            }
        }

        // --- Horizontal Movement with Acceleration ---
        if (!this.playerInQuicksand) {
            if (this.cursors.left.isDown || this.moveLeft) {
                this.player.setAccelerationX(-this.HORIZONTAL_ACCELERATION);
                this.player.setFlipX(true);
                this.facingDirection = 'left';
            } else if (this.cursors.right.isDown || this.moveRight) {
                this.player.setAccelerationX(this.HORIZONTAL_ACCELERATION);
                this.player.setFlipX(false);
                this.facingDirection = 'right';
            } else {
                this.player.setAccelerationX(0);
            }
        }
        // Update max speed in case of power-ups
        (this.player.body as Phaser.Physics.Arcade.Body).setMaxVelocityX(this.currentSpeed);


        // Merge keyboard and mobile touch inputs. For buttons that should act on press (jump/dash/parry)
        // we emulate JustDown by detecting a rising edge between current and last frame.
        const upJustDownKeyboard = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        const shiftJustDownKeyboard = Phaser.Input.Keyboard.JustDown(this.shiftKey);
        const ctrlJustDownKeyboard = Phaser.Input.Keyboard.JustDown(this.ctrlKey);

        const upJustDownMobile = this.jumpPressed && !this.lastJumpPressed;
        const dashJustDownMobile = this.dashPressed && !this.lastDashPressed;
        const parryJustDownMobile = this.parryPressed && !this.lastParryPressed;

        const upJustDown = upJustDownKeyboard || upJustDownMobile;
        const shiftJustDown = shiftJustDownKeyboard || dashJustDownMobile;
        const ctrlJustDown = ctrlJustDownKeyboard || parryJustDownMobile;

        if (shiftJustDown && this.canDash) {
            this.performDash();
        }

        if (ctrlJustDown) {
            this.performParry();
        }

        if (this.dashCooldownTimer) {
            const remaining = this.dashCooldownTimer.getRemaining();
            this.events.emit('dashStatusChanged', { ready: false, cooldown: remaining });
        }

        if (this.parryCooldownTimer) {
            const remaining = this.parryCooldownTimer.getRemaining();
            this.events.emit('parryStatusChanged', { ready: false, cooldown: remaining });
        }

        if (onGround) {
            this.lastOnGroundTime = this.time.now;
            this.canDoubleJump = true;
        }

        // Buffer jump input (keyboard or mobile)
        if (upJustDown) {
            this.jumpBufferTime = this.time.now;
        }

        // --- JUMP LOGIC ---
        let didJumpThisFrame = false;
        // Check for buffered single jump (ground jump, coyote jump)
        if (this.time.now < this.jumpBufferTime + this.JUMP_BUFFER) {
            const canCoyoteJump = (this.time.now < this.lastOnGroundTime + this.COYOTE_TIME) && body.velocity.y >= 0;

            if (onGround || this.playerInQuicksand || canCoyoteJump) {
                this.player.setVelocityY(this.currentJumpVelocity * (this.playerInQuicksand ? 0.7 : 1));
                this.tweens.add({ targets: this.player, scaleY: 1.2, scaleX: 0.8, duration: 100, yoyo: true, ease: 'Power1' });
                
                this.jumpBufferTime = 0; // Consume buffer
                this.lastOnGroundTime = 0; // Consume coyote time to prevent multi-jumps
                this.canDoubleJump = true; // This jump enables a double jump
                didJumpThisFrame = true;
            }
        }

        // Check for double jump (must be a fresh press, not buffered, and not on ground)
        if (upJustDown && !onGround && !this.playerInQuicksand && this.canDoubleJump && !didJumpThisFrame) {
            this.player.setVelocityY(this.currentJumpVelocity * 0.85);
            this.canDoubleJump = false; // Consume double jump
            this.lastOnGroundTime = 0; // Double jumping also consumes coyote time
            this.tweens.add({ targets: this.player, scaleY: 1.2, scaleX: 0.8, duration: 100, yoyo: true, ease: 'Power1' });
        }
        
        // Check for vine grab (must be a fresh press)
        if (upJustDown && this.grabbableVine && !this.isSwinging && body.velocity.y >= 0) {
            this.startSwinging(this.grabbableVine);
        }
        
        if (this.cursors.down.isDown && !onGround) {
            this.player.setVelocityY(this.currentSpeed);
        }

        if (onGround && !this.wasOnGround) {
            this.tweens.add({ targets: this.player, scaleY: 0.9, scaleX: 1.1, duration: 80, yoyo: true, ease: 'Power1' });
            this.landEmitter?.explode(10, this.player.x, this.player.y + 30);
        }
        this.wasOnGround = onGround;
        
        if (this.player.y > GAME_HEIGHT) {
            this.hitTrap();
        }

        // Update last-frame mobile action states for JustDown emulation
        this.lastJumpPressed = this.jumpPressed;
        this.lastDashPressed = this.dashPressed;
        this.lastParryPressed = this.parryPressed;

        // Homing projectile logic
        if (this.homingProjectiles) {
            this.homingProjectiles.getChildren().forEach(p => {
                const projectile = p as Phaser.Physics.Arcade.Sprite;
                if (!projectile.active || !this.player.active) return;
                
                const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, this.player.x, this.player.y);
                const currentVelocity = projectile.body.velocity.clone();
                const targetVelocity = new Phaser.Math.Vector2();
                this.physics.velocityFromRotation(angle, 300, targetVelocity);
                
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

        this.dashEmitter?.start();

        const dashVelocity = this.facingDirection === 'right' ? DASH_VELOCITY : -DASH_VELOCITY;
        
        (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.player.setVelocity(dashVelocity, 0);
        this.player.setAccelerationX(0);

        this.tweens.add({
            targets: this.player,
            scaleX: this.player.flipX ? -1.5 : 1.5,
            scaleY: 0.7,
            duration: DASH_DURATION,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
        if (this.playerHat) {
            this.tweens.add({ targets: this.playerHat, y: this.playerHat.y + 10, duration: DASH_DURATION / 2, yoyo: true, ease: 'Sine.easeInOut' });
        }

        this.time.delayedCall(DASH_DURATION, () => {
            if (!this.player.active) return;
            this.isDashing = false;
            this.dashEmitter?.stop();
            this.time.delayedCall(100, () => { this.isInvincible = false; });
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
        });

        this.dashCooldownTimer = this.time.delayedCall(DASH_COOLDOWN, () => {
            this.canDash = true;
            this.dashCooldownTimer = undefined;
            this.events.emit('dashStatusChanged', { ready: true, cooldown: 0 });
        });
    }

    performParry() {
        if (!this.canParry) return;

        this.canParry = false;
        this.isParrying = true;

        const parryEffect = this.add.sprite(this.player.x + (this.player.flipX ? -30 : 30), this.player.y, 'parry_effect').setAlpha(0.8);
        this.tweens.add({
            targets: parryEffect,
            alpha: 0,
            duration: PARRY_WINDOW + 100,
            onComplete: () => parryEffect.destroy()
        });
        
        this.time.delayedCall(PARRY_WINDOW, () => {
            this.isParrying = false;
        });

        this.parryCooldownTimer = this.time.delayedCall(PARRY_COOLDOWN, () => {
            this.canParry = true;
            this.parryCooldownTimer = undefined;
            this.events.emit('parryStatusChanged', { ready: true, cooldown: 0 });
        });
    }

    parrySuccess(target: Phaser.Physics.Arcade.Sprite, isProjectile = false) {
        this.parrySuccessEmitter?.explode(30, target.x, target.y);

        if (isProjectile) {
            target.destroy();
            if (this.isBossLevel && this.boss && this.boss.active) {
                this.bossHealth--;
                this.events.emit('bossHealthChanged', { currentHealth: this.bossHealth });
                this.boss.setTint(0xff0000);
                this.time.delayedCall(100, () => this.boss?.clearTint());
                if (this.bossHealth <= 0) {
                    this.bossDie();
                }
            }
        } else {
            // It's an enemy
            target.setData('isStunned', true);
            target.setVelocity(0, 0);

            const stunEffect = this.add.sprite(target.x, target.y - target.height / 2, 'stun_effect').setDepth(target.depth + 1);
            this.tweens.add({
                targets: stunEffect,
                y: stunEffect.y - 10,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            this.time.delayedCall(ENEMY_STUN_DURATION, () => {
                if (target.active) {
                    target.setData('isStunned', false);
                    stunEffect.destroy();
                    // Resume patrol
                    if (target.getData('type') === 'snake') {
                        target.setVelocityX(target.flipX ? -ENEMY_SPEED : ENEMY_SPEED);
                    } else if (target.getData('type') === 'turtle') {
                        target.setData('isRolling', false);
                        target.setVelocityX(0);
                        target.setAngularVelocity(0);
                        this.tweens.add({ targets: target, scaleY: 1, duration: 100 });
                    }
                } else {
                    stunEffect.destroy();
                }
            });
        }
    }

    collectCoin(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, coin: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
        // FIX: Set the tint color for the particle emitter before exploding particles.
        this.particleTint = 0xf6e05e;
        this.collectEmitter?.explode(15, coinSprite.body.center.x, coinSprite.body.center.y);
        coinSprite.disableBody(true, true);

        // FIX: Ensure score is treated as a number to prevent string concatenation bugs.
        const score = Number(this.registry.get('score')) + 10;
        this.registry.set('score', score);
        this.events.emit('scoreChanged');
        this.levelCoinsCollected++;

        if (this.dailyChallenge.type === 'coins') {
            this.challengeProgress++;
            this.events.emit('challengeProgressChanged', { progress: this.challengeProgress });
            this.checkChallengeCompletion();
        }
    }

    collectPowerUp(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, powerup: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const powerupSprite = powerup as Phaser.Physics.Arcade.Sprite;
        const type = powerupSprite.getData('type');

        let particleTint = 0xffffff;
        if (type === 'speed') particleTint = 0x4299e1;
        if (type === 'jump' || type === 'shield') particleTint = 0x68d391;
        
        // FIX: Set the tint color for the particle emitter before exploding particles.
        this.particleTint = particleTint;
        this.collectEmitter?.explode(20, powerupSprite.body.center.x, powerupSprite.body.center.y);
        
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
            this.shieldWasUsedThisLevel = true;
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
            this.cameras.main.shake(200, 0.01);
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
        const playerBody = playerSprite.body as Phaser.Physics.Arcade.Body;
        const enemyBody = enemySprite.body as Phaser.Physics.Arcade.Body;

        if (enemySprite.getData('isStunned')) {
            this.enemyDefeatEmitter?.explode(15, enemySprite.x, enemySprite.y);
            this.tweens.killTweensOf(enemySprite);
            enemySprite.destroy();
            this.levelEnemiesDefeated++;
            return;
        }

        if (this.isParrying) {
            this.parrySuccess(enemySprite);
            return;
        }

        const enemyType = enemySprite.getData('type');

        if (enemyType === 'turtle' && enemySprite.getData('isRolling')) {
            this.takeDamage();
            return;
        }

        // A robust way to check for a stomp is to see if the player's bottom edge in the previous frame
        // was above the enemy's top edge in the previous frame.
        const wasAbove = playerBody.prev.y + playerBody.height <= enemyBody.prev.y;

        if (wasAbove) {
            this.enemyDefeatEmitter?.explode(15, enemySprite.x, enemySprite.y);
            this.tweens.killTweensOf(enemySprite);
            enemySprite.destroy();
            this.levelEnemiesDefeated++;
            playerSprite.setVelocityY(-300);
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
    if (this.isInvincible || !this.player.active || this.isHurt) return;

    // ☠️ DEATH COUNTER (GLOBAL, PERSISTENT)
    const deaths = Number(localStorage.getItem("ulg_deaths") || 0);
    localStorage.setItem("ulg_deaths", String(deaths + 1));

    this.isHurt = true;
    this.isInvincible = false;
    this.cameras.main.shake(200, 0.01);
    this.tweens.killTweensOf(this.player);
    this.physics.pause();
    this.player.active = false;

    if (this.isSwinging) {
        this.stopSwinging(true);
    }

    this.player.anims.play('hurt');
    this.player.setTint(0xff0000);
    this.playerHat?.setTint(0xff0000);

    this.time.delayedCall(500, () => {
        this.cameras.main.fadeOut(500, 0, 0, 0, (_camera, progress) => {
            if (progress === 1) {
                this.scene.stop('UIScene');
                this.scene.start('GameOverScene');
            }
        });
    });
}


    
    reachGoal() {
        if (!this.player.active) return;

        this.physics.pause();
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.player.active = false;

        if (this.dailyChallenge.type === 'time') {
            this.checkChallengeCompletion();
        }
    
        this.checkForCosmeticUnlock();

        const timeTaken = (this.time.now - this.levelStartTime) / 1000;
        const level = LEVELS[this.levelIndex];
        const parTime = level.parTime || 60;

        const completionBonus = 100;
        const timeBonus = Math.max(0, Math.floor((parTime - timeTaken) * 5));
        const enemyBonus = this.levelEnemiesDefeated * 25;
        // Coin bonus is already added to score registry directly, but we show it in the summary
        const coinBonus = this.levelCoinsCollected * 10;

        // FIX: Ensure score from registry is treated as a number to prevent string concatenation bugs.
        const currentScore = Number(this.registry.get('score'));
        // Add bonuses that aren't coins (which are already added)
        const newTotalScore = currentScore + timeBonus + enemyBonus + completionBonus;
        this.registry.set('score', newTotalScore);

        this.scene.stop('UIScene');
        this.scene.launch('LevelCompleteScene', {
            levelIndex: this.levelIndex,
            timeTaken: timeTaken,
            coinsCollected: this.levelCoinsCollected,
            enemiesDefeated: this.levelEnemiesDefeated,
            timeBonus: timeBonus,
            coinBonus: coinBonus,
            enemyBonus: enemyBonus,
            completionBonus: completionBonus,
            newTotalScore: newTotalScore,
            challenge: this.dailyChallenge,
            isCompletedForSession: this.isCompletedForSession,
            shieldWasUsed: this.shieldWasUsedThisLevel
        });
    }

    checkForCosmeticUnlock() {
        const cosmeticsToUnlock = COSMETICS.filter(c => c.unlock.type === 'level' && c.unlock.value === this.levelIndex);
        if (cosmeticsToUnlock.length > 0) {
            const cosmeticsData = getCosmeticsData();
            let newUnlock = false;
            cosmeticsToUnlock.forEach(cosmetic => {
                if (!cosmeticsData.unlocked.includes(cosmetic.id)) {
                    cosmeticsData.unlocked.push(cosmetic.id);
                    newUnlock = true;
                    this.showUnlockMessage(`Unlocked: ${cosmetic.name}`);
                }
            });
            if (newUnlock) {
                saveCosmeticsData(cosmeticsData);
            }
        }
    }
    
    showUnlockMessage(message: string) {
        const unlockText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, message, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 48,
            color: '#4299e1',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: '#1a202c'
        }).setOrigin(0.5).setPadding(20).setDepth(101);
        unlockText.setScrollFactor(0);

        this.time.delayedCall(2500, () => {
            if (unlockText && unlockText.active) {
                unlockText.destroy();
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

            const challengeCosmetic = COSMETICS.find(c => c.unlock.type === 'challenge');
            if (challengeCosmetic) {
                const cosmeticsData = getCosmeticsData();
                if (!cosmeticsData.unlocked.includes(challengeCosmetic.id)) {
                    cosmeticsData.unlocked.push(challengeCosmetic.id);
                    saveCosmeticsData(cosmeticsData);
                    this.showUnlockMessage(`Unlocked: ${challengeCosmetic.name}`);
                }
            }
            
            // FIX: Ensure score is treated as a number to prevent string concatenation bugs.
            const currentScore = Number(this.registry.get('score'));
            this.registry.set('score', currentScore + DAILY_CHALLENGE_REWARD);
            this.events.emit('scoreChanged');

            if (this.challengeCompleteText && this.challengeCompleteText.active) {
                this.challengeCompleteText.destroy();
            }

            this.challengeCompleteText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Challenge Complete!', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
                fontSize: 48,
                color: '#48bb78',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#1a202c'
            }).setOrigin(0.5).setPadding(20).setDepth(101);
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
        if (this.time.now < lastTrigger + 2000) return;

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
        this.canDoubleJump = false;
        this.takeDamage();
    }

    hitBySpiderVenom(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, venom: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        (venom as Phaser.Physics.Arcade.Sprite).destroy();
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

    // Tutorial Methods
    showTutorialHint(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, trigger: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const triggerSprite = trigger as Phaser.Physics.Arcade.Sprite;
        const text = triggerSprite.getData('text');
        const id = triggerSprite.getData('id');
        triggerSprite.destroy();
        this.displayHint(text, id);
    }

    displayHint(text: string, id: string) {
        if (this.shownTutorials.has(id)) return;

        this.shownTutorials.add(id);
        localStorage.setItem('ultimateLevelChallenge_shownTutorials', JSON.stringify(Array.from(this.shownTutorials)));

        const hintText = this.add.text(GAME_WIDTH / 2, 100, text, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#f7fafc',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: 'rgba(45, 55, 72, 0.8)',
            padding: { x: 20, y: 10 },
            wordWrap: { width: 600 }
        }).setOrigin(0.5).setDepth(100);
        hintText.setScrollFactor(0);

        this.time.delayedCall(5000, () => {
            if (hintText && hintText.active) {
                hintText.destroy();
            }
        });
    }

    // Boss Methods
    startBossCinematic() {
        if (!this.boss) return;

        this.player.active = false;
        this.physics.pause();

        const bossName = this.add.text(this.boss.x, this.boss.y - 120, 'JUNGLE KING', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 48,
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#c53030',
            strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0).setDepth(100);

        const fightText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'FIGHT!', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 96,
            color: '#f6e05e',
            fontStyle: 'bold',
            stroke: '#c53030',
            strokeThickness: 10
        }).setOrigin(0.5).setAlpha(0).setScale(0.5).setScrollFactor(0).setDepth(100);

        // FIX: Replaced the tween timeline with a more robust sequence of individual tweens and timers
        // to prevent "timeline is not a function" errors.
        
        // 1. Camera pans to boss
        this.tweens.add({
            targets: this.cameras.main,
            panX: this.boss.x,
            panY: this.boss.y,
            zoom: 1.5,
            duration: 1500,
            ease: 'Sine.easeInOut',
        });

        // 2. During pan, boss "roars" and name appears
        this.time.delayedCall(1000, () => {
             if (!this.scene.isActive()) return;
            this.tweens.add({
                targets: this.boss,
                scale: 1.1,
                duration: 200,
                yoyo: true,
                ease: 'Power1',
            });
            this.tweens.add({
                targets: bossName,
                alpha: 1,
                duration: 500,
                ease: 'Power1',
            });
        });
        
        // 3. Name fades out, camera pans back
        this.time.delayedCall(2500, () => {
             if (!this.scene.isActive()) return;
            this.tweens.add({
                targets: bossName,
                alpha: 0,
                duration: 500,
                ease: 'Power1',
            });
            this.tweens.add({
                targets: this.cameras.main,
                panX: this.cameras.main.width / 2,
                panY: this.cameras.main.height / 2,
                zoom: 1,
                duration: 1000,
                ease: 'Sine.easeInOut',
                delay: 500, // wait for name to fade
                onComplete: () => {
                     if (!this.scene.isActive()) return;
                    // 4. Show "FIGHT!" text
                    this.tweens.add({
                        targets: fightText,
                        alpha: 1,
                        scale: 1,
                        duration: 300,
                        ease: 'Back.easeOut',
                        yoyo: true,
                        hold: 500,
                        onComplete: () => {
                            // 5. Start the game
                            if (this.scene.isActive()) {
                                this.player.active = true;
                                this.physics.resume();
                                this.startBossAttacks();
                            }
                        }
                    });
                }
            });
        });
    }

    startBossAttacks() {
        if (!this.boss || !this.boss.active) return;
        this.attackTimer = this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (!this.boss || !this.boss.active || this.boss.getData('isAttacking')) return;
    
                this.boss.setData('isAttacking', true);
    
                const pattern1Attacks = [this.bossGroundSlam, this.bossThrowProjectiles];
                const pattern2Attacks = [this.bossGroundSlam, this.bossThrowProjectiles, this.bossThrowHomingProjectiles];
                const enragedAttacks = [this.bossFrenzyAttack, this.bossSummonMinions, this.bossThrowHomingProjectiles];
    
                let availableAttacks: ((...args: any[]) => void)[];
                if (this.bossAttackPattern === 1) {
                    availableAttacks = [...pattern1Attacks];
                    if (this.bossHealth <= BOSS_HEALTH / 2) {
                        availableAttacks.push(this.bossSummonMinions);
                    }
                } else { // Pattern 2 or higher
                    if (this.bossHealth <= BOSS_HEALTH / 2) {
                        availableAttacks = enragedAttacks;
                    } else {
                        availableAttacks = pattern2Attacks;
                    }
                }
    
                const selectedAttack = Phaser.Math.RND.pick(availableAttacks);
    
                const tellVFX = this.add.particles(0,0,'sparkle', {
                    x: this.boss.x,
                    y: this.boss.y - 64,
                    speed: { min: -100, max: 100 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 500
                });
    
                this.time.delayedCall(500, () => {
                    tellVFX.stop();
                    this.time.delayedCall(500, () => tellVFX.destroy());
    
                    selectedAttack.call(this);
    
                    // Make cooldown longer for more complex attacks
                    const attackCooldown = (selectedAttack === this.bossFrenzyAttack) ? 3000 : 2000;
                    this.time.delayedCall(attackCooldown, () => {
                        if (this.boss) this.boss.setData('isAttacking', false);
                    });
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    bossGroundSlam() {
        if (!this.boss || !this.boss.active) return;
        
        const originalY = this.boss.y;
        this.tweens.add({
            targets: this.boss,
            y: originalY - 100,
            duration: 200,
            ease: 'Power2',
            yoyo: true,
            onYoyo: () => {
                if (!this.boss || !this.boss.active) return;
                this.cameras.main.shake(300, 0.01);
                // Create shockwave effect or spawn hazards from the ground
                for (let i = 0; i < 3; i++) {
                    const rock = this.fallingRocks.create(Phaser.Math.Between(100, GAME_WIDTH - 100), -50, 'falling_rock');
                    rock.setVelocityY(Phaser.Math.Between(300, 500));
                }
            }
        });
    }
    
    bossThrowProjectiles(count = 3, speed = 400, spread = 50, delay = 200) {
        if (!this.boss || !this.boss.active || !this.player.active) return;
    
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * delay, () => {
                if (!this.boss || !this.boss.active || !this.player.active) return;
                const projectile = this.projectiles.create(this.boss.x, this.boss.y, 'projectile');
                const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y + Phaser.Math.Between(-spread, spread));
                this.physics.velocityFromRotation(angle, speed, projectile.body.velocity);
            });
        }
    }

    bossThrowHomingProjectiles() {
        if (!this.boss || !this.boss.active || !this.player.active) return;
        
        const projectile = this.homingProjectiles.create(this.boss.x, this.boss.y, 'projectile_homing');
        projectile.setVelocity(this.boss.flipX ? -200 : 200, -200);
    }
    
    bossSummonMinions() {
        if (!this.boss || !this.boss.active) return;
        this.cameras.main.flash(200, 255, 0, 0);

        const positions = [
            { x: this.boss.x - 150, flip: true, velocity: -ENEMY_SPEED },
            { x: this.boss.x + 150, flip: false, velocity: ENEMY_SPEED }
        ];

        for (const pos of positions) {
            const spawnX = Phaser.Math.Clamp(pos.x, 50, GAME_WIDTH - 50);
            const enemy = this.enemies.create(spawnX, this.boss.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
            enemy.setData('type', 'snake');
            enemy.setCollideWorldBounds(true);
            enemy.setVelocityX(pos.velocity);
            enemy.setFlipX(pos.flip);
        }
    }

    bossFrenzyAttack() {
        if (!this.boss || !this.boss.active) return;
        this.bossGroundSlam();
        this.time.delayedCall(400, () => {
            this.bossThrowProjectiles(5, 500, 70, 100);
        });
    }

    handlePlayerBossCollision(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, boss: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const playerSprite = player as Phaser.Physics.Arcade.Sprite;
        const bossSprite = boss as Phaser.Physics.Arcade.Sprite;
        const playerBody = playerSprite.body as Phaser.Physics.Arcade.Body;
        const bossBody = bossSprite.body as Phaser.Physics.Arcade.Body;

        // A robust way to check for a stomp is to see if the player's bottom edge in the previous frame
        // was above the boss's top edge in the previous frame. This is more reliable than checking velocity,
        // which might be altered by the collision resolution before this callback runs.
        const wasAbove = playerBody.prev.y + playerBody.height <= bossBody.prev.y;
        
        // Check if the player is horizontally aligned with the boss's head (center part of the sprite)
        const isHorizontallyAligned = Math.abs(playerSprite.x - bossSprite.x) < 40;

        // A successful stomp requires the player to be coming from above and hit the head.
        if (wasAbove && isHorizontallyAligned) {
            this.hitBoss(player, boss);
        } else {
            this.hitByBossBody(player, boss);
        }
    }

    hitBoss(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, boss: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isInvincible) return;

        this.cameras.main.shake(100, 0.005);
        this.bossHitEmitter?.explode(25, player.body.center.x, boss.body.position.y);

        const playerSprite = player as Phaser.Physics.Arcade.Sprite;
        playerSprite.setVelocityY(-400);
        this.bossHealth--;
        this.events.emit('bossHealthChanged', { currentHealth: this.bossHealth });

        this.boss?.setTint(0xff0000);
        this.time.delayedCall(100, () => this.boss?.clearTint());

        if (this.bossHealth <= 0) {
            this.bossDie();
        }
    }
    
    hitByBossBody(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, boss: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isInvincible) return;
        this.takeDamage();
    }

    hitByProjectile(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isParrying) {
            this.parrySuccess(projectile as Phaser.Physics.Arcade.Sprite, true);
        } else {
             (projectile as Phaser.Physics.Arcade.Sprite).destroy();
            this.takeDamage();
        }
    }

    bossDie() {
        if (this.attackTimer) this.attackTimer.remove();
        if (!this.boss) return;

        this.cameras.main.shake(500, 0.02);

        const emitter = this.add.particles(0,0,'explosion_particle', {
            x: this.boss.x,
            y: this.boss.y,
            speed: { min: -400, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
        });

        emitter.explode(50);
        this.boss.destroy();
        this.projectiles.clear(true, true);
        this.homingProjectiles.clear(true, true);

        // FIX: The particle emitter should be destroyed directly, not its non-existent 'manager'.
        // Destroy the emitter after its particles have expired to prevent memory leaks.
        this.time.delayedCall(800, () => {
            if (emitter) {
                emitter.destroy();
            }
        });

        this.goal = this.physics.add.staticSprite(LEVELS[this.levelIndex].goal.x, LEVELS[this.levelIndex].goal.y, 'goal');
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
    }
    
    // Vine Swinging Methods
    handleVineOverlap(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, vine: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.isSwinging || (player as Phaser.Physics.Arcade.Sprite).body.velocity.y < 0) return;
        this.grabbableVine = vine as Phaser.Physics.Arcade.Sprite;
    }
    
    startSwinging(vine: Phaser.Physics.Arcade.Sprite) {
        if (this.grabCooldown) return;

        this.isSwinging = true;
        this.attachedVine = vine;
        (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.player.setVelocity(0, 0);

        this.swingAnchor = { x: vine.x, y: vine.y };
        const dx = this.player.x - this.swingAnchor.x;
        const dy = this.player.y - this.swingAnchor.y;
        this.swingRadius = Math.sqrt(dx * dx + dy * dy);
        this.swingAngle = Math.atan2(dy, dx);
        this.swingAngularVelocity = 0.01;
    }

    handleSwinging() {
        if (!this.isSwinging || !this.swingAnchor) return;
        
        // Apply gravity-like force to the swing
        this.swingAngularVelocity += Math.cos(this.swingAngle) * 0.001;
        
        // Dampen the swing
        this.swingAngularVelocity *= 0.99;
        
        this.swingAngle += this.swingAngularVelocity;
        
        this.player.x = this.swingAnchor.x + this.swingRadius * Math.cos(this.swingAngle);
        this.player.y = this.swingAnchor.y + this.swingRadius * Math.sin(this.swingAngle);
        
        const angleDegrees = Phaser.Math.RadToDeg(this.swingAngle) + 90;
        this.player.setAngle(angleDegrees);
        this.player.setFlipX(this.swingAngularVelocity < 0);
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.stopSwinging();
        }
    }
    
    stopSwinging(isDamage = false) {
        if (!this.isSwinging || !this.swingAnchor) return;

        this.isSwinging = false;
        this.attachedVine = null;
        this.grabCooldown = true;
        this.time.delayedCall(500, () => { this.grabCooldown = false; });
        
        (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
        this.player.setAngle(0);
        
        if (!isDamage) {
            const releaseVelocityX = -this.swingAngularVelocity * this.swingRadius * Math.sin(this.swingAngle) * 60;
            const releaseVelocityY = this.swingAngularVelocity * this.swingRadius * Math.cos(this.swingAngle) * 60;
            this.player.setVelocity(releaseVelocityX, releaseVelocityY - 300);
        }

        this.swingAnchor = null;
    }

}

class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data: {
        levelIndex: number;
        timeTaken: number;
        coinsCollected: number;
        enemiesDefeated: number;
        timeBonus: number;
        coinBonus: number;
        enemyBonus: number;
        completionBonus: number;
        newTotalScore: number;
        challenge: any;
        isCompletedForSession: boolean;
        shieldWasUsed: boolean;
    }) {
        this.data.set('stats', data);
    }
    
    create() {
        this.scene.get('GameScene').sound.stopAll();
        const stats = this.data.get('stats');
        const level = LEVELS[stats.levelIndex];

        // --- Star Calculation ---
        let starsEarned = 1; // 1 star for completion
        const totalCoinsInLevel = level.coins?.length || 0;
        const allCoinsCollected = stats.coinsCollected === totalCoinsInLevel;
        const beatParTime = stats.timeTaken <= level.parTime;

        if (level.boss) { // Boss level criteria
            if (beatParTime) starsEarned++;
            if (!stats.shieldWasUsed) starsEarned++;
        } else { // Standard level criteria
            if (allCoinsCollected) starsEarned++;
            if (beatParTime) starsEarned++;
        }

        // --- Save Progress ---
        const levelData = getLevelData();
        const currentLevelProgress = levelData[stats.levelIndex] || { stars: 0 };
        if (starsEarned > currentLevelProgress.stars) {
            levelData[stats.levelIndex] = { ...currentLevelProgress, stars: starsEarned };
        }
        // Could also save best time here:
        // if (!currentLevelProgress.bestTime || stats.timeTaken < currentLevelProgress.bestTime) {
        //     levelData[stats.levelIndex].bestTime = stats.timeTaken;
        // }
        saveLevelData(levelData);
        

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const panel = this.add.graphics();
        panel.fillStyle(0xedf2f7, 0.9);
        panel.fillRoundedRect(GAME_WIDTH / 2 - 300, GAME_HEIGHT / 2 - 250, 600, 500, 16);
        panel.lineStyle(4, 0x2d3748);
        panel.strokeRoundedRect(GAME_WIDTH / 2 - 300, GAME_HEIGHT / 2 - 250, 600, 500, 16);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, 'Level Complete!', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 48, color: '#2d3748', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Display stars earned this run
        for (let i = 0; i < 3; i++) {
            const starTexture = i < starsEarned ? 'star_filled' : 'star_empty';
            this.add.image(GAME_WIDTH / 2 - 70 + i * 70, GAME_HEIGHT / 2 - 140, starTexture);
        }


        const startY = GAME_HEIGHT / 2 - 60;
        const leftColX = GAME_WIDTH / 2 - 200;
        const rightColX = GAME_WIDTH / 2 + 180;
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
        const textStyle = { fontSize: 28, color: '#2d3748' };

        this.add.image(leftColX - 30, startY, 'icon_clock').setScale(1.2);
        this.add.text(leftColX, startY, `Time: ${stats.timeTaken.toFixed(2)}s`, textStyle).setOrigin(0, 0.5);
        this.add.text(rightColX, startY, `+${stats.timeBonus}`, textStyle).setOrigin(1, 0.5);

        this.add.image(leftColX - 30, startY + 50, 'coin').setScale(1.2);
        this.add.text(leftColX, startY + 50, `Bananas: ${stats.coinsCollected}`, textStyle).setOrigin(0, 0.5);
        this.add.text(rightColX, startY + 50, `+${stats.coinBonus}`, textStyle).setOrigin(1, 0.5);

        this.add.image(leftColX - 30, startY + 100, 'icon_skull').setScale(1.2);
        this.add.text(leftColX, startY + 100, `Enemies: ${stats.enemiesDefeated}`, textStyle).setOrigin(0, 0.5);
        this.add.text(rightColX, startY + 100, `+${stats.enemyBonus}`, textStyle).setOrigin(1, 0.5);

        this.add.text(leftColX, startY + 150, `Completion Bonus`, textStyle).setOrigin(0, 0.5);
        this.add.text(rightColX, startY + 150, `+${stats.completionBonus}`, textStyle).setOrigin(1, 0.5);

        const line = this.add.graphics();
        line.fillStyle(0x4a5568);
        line.fillRect(GAME_WIDTH/2 - 250, startY + 200, 500, 2);

        this.add.text(GAME_WIDTH / 2, startY + 240, `Total Score: ${stats.newTotalScore}`, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 36, color: '#2d3748', fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const nextLevelIndex = stats.levelIndex + 1;
        const isLastLevel = nextLevelIndex >= LEVELS.length;

        const buttonText = isLastLevel ? 'Finish' : 'Continue';
        
        const continueButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, buttonText, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32, color: '#f7fafc', fontStyle: 'bold', backgroundColor: '#38a169', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        continueButton.on('pointerover', () => continueButton.setBackgroundColor('#2f855a'));
        continueButton.on('pointerout', () => continueButton.setBackgroundColor('#38a169'));
        continueButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.stop('GameScene'); // Explicitly stop the paused game scene
                    if (isLastLevel) {
                        // FIX: Ensure newTotalScore is a number before passing it to the next scene.
                        this.scene.start('GameCompleteScene', { finalScore: Number(stats.newTotalScore) });
                    } else {
                         // Return to level select to see newly unlocked levels, passing the new score
                        this.scene.start('LevelSelectScene', {
                            challenge: stats.challenge,
                            isCompleted: stats.isCompletedForSession,
                            currentScore: stats.newTotalScore
                        });
                    }
                }
            });
        });
    }
}

class GameCompleteScene extends Phaser.Scene {
    private finalScore = 0;
    make!: Phaser.GameObjects.GameObjectCreator;

    constructor() {
        super({ key: 'GameCompleteScene' });
    }

    init(data: { finalScore: number }) {
        this.finalScore = data.finalScore || 0;
    }
    
    preload() {
        // Confetti particle
        if (!this.textures.exists('confetti')) {
            const particleGraphics = this.make.graphics();
            particleGraphics.fillStyle(0xffffff);
            particleGraphics.fillRect(0, 0, 8, 8);
            particleGraphics.generateTexture('confetti', 8, 8);
            particleGraphics.destroy();
        }
    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.scene.get('GameScene').sound.stopAll();
        this.add.image(0, 0, 'background').setOrigin(0);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 'Congratulations!', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 80,
            color: '#f6e05e', // Gold color
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 10
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'You have completed the\nUltimate Level Challenge!', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 40,
            color: '#f7fafc',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#2d3748',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, `Final Score: ${this.finalScore}`, {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 48,
            color: '#f7fafc',
            fontStyle: 'bold',
            stroke: '#2d3748',
            strokeThickness: 6
        }).setOrigin(0.5);

        const menuButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Return to Main Menu', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#f7fafc',
            fontStyle: 'bold',
            backgroundColor: '#38a169',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerover', () => menuButton.setBackgroundColor('#2f855a'));
        menuButton.on('pointerout', () => menuButton.setBackgroundColor('#38a169'));
        menuButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.start('MainMenuScene');
                }
            });
        });
        
        this.add.particles(0,0,'confetti', {
            x: { min: 0, max: GAME_WIDTH },
            y: -10,
            lifespan: 5000,
            speedY: { min: 100, max: 300 },
            speedX: { min: -50, max: 50 },
            scale: { start: 1, end: 0.5 },
            quantity: 2,
            blendMode: 'NORMAL',
            tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
        });
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.scene.get('GameScene').sound.stopAll();
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Game Over', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 64,
            color: '#c53030',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const retryButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Retry', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#f7fafc',
            fontStyle: 'bold',
            backgroundColor: '#8b5a2b',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        retryButton.on('pointerover', () => retryButton.setBackgroundColor('#6b4a2b'));
        retryButton.on('pointerout', () => retryButton.setBackgroundColor('#8b5a2b'));
        retryButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    // FIX: Refined type casting for better readability and type safety.
                    const gameScene = this.scene.get('GameScene') as GameScene;
                    const data = {
                        levelIndex: gameScene.levelIndex,
                        score: gameScene.initialScore,
                        challenge: gameScene.dailyChallenge,
                        isCompleted: gameScene.isChallengeCompleted
                    };
                    this.scene.start('GameScene', data);
                    this.scene.launch('UIScene', data);
                }
            });
        });

        const menuButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 'Main Menu', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32,
            color: '#f7fafc',
            fontStyle: 'bold',
            backgroundColor: '#4a5568',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerover', () => menuButton.setBackgroundColor('#2d3748'));
        menuButton.on('pointerout', () => menuButton.setBackgroundColor('#4a5568'));
        menuButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.start('MainMenuScene');
                }
            });
        });
    }
}

class PauseScene extends Phaser.Scene {
    private previousSceneData: any;

    constructor() {
        super({ key: 'PauseScene' });
    }

    init(data: any) {
        this.previousSceneData = data;
    }

    create() {
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Paused', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 64,
            color: '#f7fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const resumeButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Resume', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32, color: '#f7fafc', fontStyle: 'bold', backgroundColor: '#38a169', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        resumeButton.on('pointerover', () => resumeButton.setBackgroundColor('#2f855a'));
        resumeButton.on('pointerout', () => resumeButton.setBackgroundColor('#38a169'));
        resumeButton.on('pointerdown', () => {
            this.scene.resume('GameScene');
            this.scene.resume('UIScene');
            this.scene.stop();
        });

        const restartButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 'Restart Level', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32, color: '#f7fafc', fontStyle: 'bold', backgroundColor: '#8b5a2b', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerover', () => restartButton.setBackgroundColor('#6b4a2b'));
        restartButton.on('pointerout', () => restartButton.setBackgroundColor('#8b5a2b'));
        restartButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.stop('GameScene');
                    this.scene.stop('UIScene');
                    this.scene.start('GameScene', this.previousSceneData);
                    this.scene.launch('UIScene', this.previousSceneData);
                }
            });
        });

        const menuButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 190, 'Main Menu', {
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
            fontSize: 32, color: '#f7fafc', fontStyle: 'bold', backgroundColor: '#4a5568', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerover', () => menuButton.setBackgroundColor('#2d3748'));
        menuButton.on('pointerout', () => menuButton.setBackgroundColor('#4a5568'));
        menuButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(250, 0, 0, 0, (_camera, progress) => {
                if (progress === 1) {
                    this.scene.stop('GameScene');
                    this.scene.stop('UIScene');
                    this.scene.start('MainMenuScene');
                }
            });
        });
    }
}

class UIScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private powerUpText!: Phaser.GameObjects.Text;
    private challengeText!: Phaser.GameObjects.Text;
    private bossHealthBar?: Phaser.GameObjects.Graphics;
    private bossHealthBarBg?: Phaser.GameObjects.Graphics;
    private progressBarBg?: Phaser.GameObjects.Graphics;
    private progressBar?: Phaser.GameObjects.Graphics;
    private playerMarker?: Phaser.GameObjects.Image;
    private dashIcon?: Phaser.GameObjects.Graphics;
    private dashCooldownText?: Phaser.GameObjects.Text;
    private parryIcon?: Phaser.GameObjects.Graphics;
    private parryCooldownText?: Phaser.GameObjects.Text;
    
    private dailyChallenge: any;
    private isChallengeCompleted = false;
    private levelIndex = 0;

    constructor() {
        super({ key: 'UIScene' });
    }
    
    init(data: { challenge: any; isCompleted: boolean; levelIndex: number; }) {
        this.dailyChallenge = data.challenge;
        this.isChallengeCompleted = data.isCompleted;
        this.levelIndex = data.levelIndex;
    }

    create() {
        const gameScene = this.scene.get('GameScene');

// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: 32, color: '#f7fafc', fontStyle: 'bold', stroke: '#2d3748', strokeThickness: 6 });
// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
        this.powerUpText = this.add.text(GAME_WIDTH - 90, 20, '', { fontSize: 24, color: '#f7fafc', fontStyle: 'bold', align: 'right' }).setOrigin(1, 0);

// FIX: The fontSize property in Phaser text styles expects a number, not a string. Changed to a numeric value.
        this.challengeText = this.add.text(GAME_WIDTH / 2, 20, this.dailyChallenge.progressText(0), { fontSize: 24, color: '#f7fafc', fontStyle: 'bold' }).setOrigin(0.5, 0);
        if (this.isChallengeCompleted) {
            this.challengeText.setText('Daily Challenge Completed!');
            this.challengeText.setColor('#48bb78');
        }

        // Add a pause button (larger on mobile for easier touch)
        const pauseButtonContainer = this.add.container(GAME_WIDTH - 50, 32.5).setScrollFactor(0);
        const pauseIcon = this.add.graphics();
        pauseIcon.fillStyle(0xf7fafc, 1);
        pauseIcon.fillRect(-14, -14, 10, 28);
        pauseIcon.fillRect(4, -14, 10, 28);
        pauseButtonContainer.add(pauseIcon);
        pauseButtonContainer.setSize(56, 56).setInteractive(); // Larger interactive area for mobile
        pauseButtonContainer.setAlpha(0.9);

        pauseButtonContainer.on('pointerover', () => {
            pauseButtonContainer.setAlpha(1);
        });

        pauseButtonContainer.on('pointerout', () => {
            pauseButtonContainer.setAlpha(0.8);
        });

        pauseButtonContainer.on('pointerdown', () => {
            const gameSceneInstance = this.scene.get('GameScene') as GameScene;
            if (gameSceneInstance && gameSceneInstance.scene.isActive()) {
                gameSceneInstance.scene.pause();
                this.scene.pause(); // Pause UIScene itself
                this.scene.launch('PauseScene', {
                    levelIndex: this.levelIndex,
                    challenge: this.dailyChallenge,
                    isCompleted: this.isChallengeCompleted,
                    score: gameSceneInstance.initialScore
                });
            }
        });

        // Ensure pause button stays above mobile controls so it remains clickable on touch devices
        pauseButtonContainer.setDepth(1200);

        // Mobile-only Dash & Parry buttons: placed at top-left directly under the score
        // These set flags on the GameScene instead of directly changing physics to keep
        // all physics changes inside the GameScene update loop (safer & consistent).
        if (this.sys.game.device.input.touch) {
            // Ensure top-only input is set in this UI scene as well.
            this.input.setTopOnly(true);
            const gameSceneInstance = this.scene.get('GameScene') as GameScene;
            if (gameSceneInstance) {
                const mobileContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
                // Larger dash/parry buttons for more reliable touch hit areas
                const btnSize = 80;
                const gap = 14;
                const startX = 80; // under the scoreText (which is at x=20)
                const startY = 70;

                const dashBtn = this.add.circle(startX, startY, btnSize / 2, 0x4299e1, 0.35).setScrollFactor(0).setInteractive();
                const parryBtn = this.add.circle(startX + btnSize + gap, startY, btnSize / 2, 0x68d391, 0.35).setScrollFactor(0).setInteractive();
                const dashLabel = this.add.text(startX, startY, 'DASH', { fontSize: 16, color: '#fff' }).setOrigin(0.5).setScrollFactor(0);
                const parryLabel = this.add.text(startX + btnSize + gap, startY, 'PARRY', { fontSize: 16, color: '#fff' }).setOrigin(0.5).setScrollFactor(0);

                mobileContainer.add([dashBtn, parryBtn, dashLabel, parryLabel]);

                // Move the challenge/timer text into the mobile controls area (under the buttons)
                // Only reposition on touch devices to keep desktop layout centered.
                this.challengeText.setPosition(startX + (btnSize + gap) / 2, startY + (btnSize / 2) + 10);
                this.challengeText.setOrigin(0.5, 0);
                this.challengeText.setScrollFactor(0);
                this.challengeText.setDepth(1001);

                // Bind pointer events to toggle GameScene flags. We DO NOT call physics methods here.
                dashBtn.on('pointerdown', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).dashPressed = true; });
                dashBtn.on('pointerup', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).dashPressed = false; });
                dashBtn.on('pointerout', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).dashPressed = false; });
                dashBtn.on('pointerupoutside', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).dashPressed = false; });

                parryBtn.on('pointerdown', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).parryPressed = true; });
                parryBtn.on('pointerup', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).parryPressed = false; });
                parryBtn.on('pointerout', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).parryPressed = false; });
                parryBtn.on('pointerupoutside', (p: any) => { p.event.preventDefault?.(); (gameSceneInstance as any).parryPressed = false; });
            }
        }

        // Register named handlers so we can remove them on UI shutdown and avoid leaks
        const onScoreChanged = () => {
            this.scoreText.text = `Score: ${gameScene.registry.get('score')}`;
        };

        const onPowerUpChanged = (data: { type: string; timeLeft: number }) => {
            if (data.type === 'None' || data.timeLeft <= 0) {
                this.powerUpText.text = '';
            } else if (data.type === 'shield') {
                this.powerUpText.text = 'Shield Active';
                this.powerUpText.setColor('#68d391');
            } else {
                this.powerUpText.text = `${data.type.toUpperCase()} Boost: ${data.timeLeft}s`;
                this.powerUpText.setColor(data.type === 'speed' ? '#4299e1' : '#68d391');
            }
        };

        const onChallengeProgressChanged = (data: { progress: number }) => {
            if (!this.isChallengeCompleted) {
                this.challengeText.text = this.dailyChallenge.progressText(data.progress);
            }
        };

        const onChallengeCompleted = () => {
            this.isChallengeCompleted = true;
            this.challengeText.text = 'Challenge Complete!';
            this.challengeText.setColor('#48bb78');
        };

        const onBossSpawned = (data: { maxHealth: number; currentHealth: number }) => {
            this.bossHealthBarBg = this.add.graphics();
            this.bossHealthBarBg.fillStyle(0x2d3748, 0.8);
            this.bossHealthBarBg.fillRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT - 60, 500, 30);

            this.bossHealthBar = this.add.graphics();
            this.bossHealthBar.fillStyle(0xc53030);
            this.bossHealthBar.fillRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT - 60, 500, 30);

            const bossTitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 75, '', { fontSize: 24, color: '#f7fafc', fontStyle: 'bold' }).setOrigin(0.5, 0);
            bossTitle.text = 'JUNGLE KING';
        };

        const onBossHealthChanged = (data: { currentHealth: number }) => {
            if (this.bossHealthBar) {
                const width = 500 * (data.currentHealth / BOSS_HEALTH);
                this.bossHealthBar.clear();
                this.bossHealthBar.fillStyle(0xc53030);
                this.bossHealthBar.fillRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT - 60, width, 30);
            }
        };

        // Progress bar UI (non-boss levels)
        if (!(gameScene as GameScene).isBossLevel) {
            const barWidth = 400;
            const barX = GAME_WIDTH / 2 - barWidth / 2;
            const barY = GAME_HEIGHT - 40;

            this.progressBarBg = this.add.graphics();
            this.progressBarBg.fillStyle(0x2d3748, 0.7);
            this.progressBarBg.fillRoundedRect(barX, barY, barWidth, 12, 6);

            this.progressBar = this.add.graphics();
            this.progressBar.fillStyle(0xf6e05e);
            this.progressBar.fillRoundedRect(barX, barY, 0, 12, 6);

            this.add.image(barX - 25, barY + 6, 'player_marker_icon').setOrigin(0.5);
            this.add.image(barX + barWidth + 25, barY + 6, 'goal_marker_icon').setOrigin(0.5);

            this.playerMarker = this.add.image(barX, barY + 6, 'player_marker_icon').setOrigin(0.5);

            const onProgressUpdated = (progress: number) => {
                const newWidth = barWidth * progress;
                if (this.progressBar) {
                    this.progressBar.clear();
                    this.progressBar.fillStyle(0xf6e05e);
                    this.progressBar.fillRoundedRect(barX, barY, newWidth, 12, 6);
                }
                if (this.playerMarker) {
                    this.playerMarker.x = barX + newWidth;
                }
            };

            gameScene.events.on('progressUpdated', onProgressUpdated, this);
            // Remember to remove on shutdown (below)
        }

        // Ability Cooldowns UI
        const abilityY = GAME_HEIGHT - 50;
        
        // Dash UI
        this.dashIcon = this.add.graphics();
        this.dashIcon.fillStyle(0x4299e1, 0.8);
        this.dashIcon.fillRoundedRect(30, abilityY - 25, 50, 50, 8);
        const dashLabel = this.add.text(55, abilityY, 'DASH', { fontSize: 14, color: '#fff', fontStyle: 'bold'}).setOrigin(0.5);
        this.dashCooldownText = this.add.text(55, abilityY, '', { fontSize: 24, color: '#fff', fontStyle: 'bold'}).setOrigin(0.5);

        // Parry UI
        this.parryIcon = this.add.graphics();
        this.parryIcon.fillStyle(0x68d391, 0.8);
        this.parryIcon.fillRoundedRect(90, abilityY - 25, 50, 50, 8);
        const parryLabel = this.add.text(115, abilityY, 'PARRY', { fontSize: 12, color: '#fff', fontStyle: 'bold'}).setOrigin(0.5);
        this.parryCooldownText = this.add.text(115, abilityY, '', { fontSize: 24, color: '#fff', fontStyle: 'bold'}).setOrigin(0.5);

        const onDashStatusChanged = (data: { ready: boolean; cooldown: number }) => {
            if (data.ready) {
                this.dashIcon?.setAlpha(1);
                if (this.dashCooldownText) this.dashCooldownText.text = '';
            } else {
                this.dashIcon?.setAlpha(0.4);
                if (this.dashCooldownText) this.dashCooldownText.text = `${(data.cooldown / 1000).toFixed(1)}`;
            }
        };

        const onParryStatusChanged = (data: { ready: boolean; cooldown: number }) => {
            if (data.ready) {
                this.parryIcon?.setAlpha(1);
                if (this.parryCooldownText) this.parryCooldownText.text = '';
            } else {
                this.parryIcon?.setAlpha(0.4);
                if (this.parryCooldownText) this.parryCooldownText.text = `${(data.cooldown / 1000).toFixed(1)}`;
            }
        };

        // Attach named handlers
        gameScene.events.on('scoreChanged', onScoreChanged, this);
        gameScene.events.on('powerUpChanged', onPowerUpChanged, this);
        gameScene.events.on('challengeProgressChanged', onChallengeProgressChanged, this);
        gameScene.events.on('challengeCompleted', onChallengeCompleted, this);
        gameScene.events.on('bossSpawned', onBossSpawned, this);
        gameScene.events.on('bossHealthChanged', onBossHealthChanged, this);
        gameScene.events.on('dashStatusChanged', onDashStatusChanged, this);
        gameScene.events.on('parryStatusChanged', onParryStatusChanged, this);

        // Ensure UI removes its listeners when it shuts down to avoid referencing destroyed GameScene
        this.events.once('shutdown', () => {
            try {
                gameScene.events.off('scoreChanged', onScoreChanged, this);
                gameScene.events.off('powerUpChanged', onPowerUpChanged, this);
                gameScene.events.off('challengeProgressChanged', onChallengeProgressChanged, this);
                gameScene.events.off('challengeCompleted', onChallengeCompleted, this);
                gameScene.events.off('bossSpawned', onBossSpawned, this);
                gameScene.events.off('bossHealthChanged', onBossHealthChanged, this);
                gameScene.events.off('dashStatusChanged', onDashStatusChanged, this);
                gameScene.events.off('parryStatusChanged', onParryStatusChanged, this);
                gameScene.events.off('progressUpdated');
            } catch (err) {
                console.warn('Error cleaning up UI listeners:', err);
            }
        });
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: GRAVITY },
            debug: false
        }
    },
    scene: [MainMenuScene, CustomizationScene, LevelSelectScene, GameScene, UIScene, LevelCompleteScene, GameCompleteScene, GameOverScene, PauseScene]
};

const game = new Phaser.Game(config);