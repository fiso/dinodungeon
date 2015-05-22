define(
	['Player', 'Level', 'Enemy', 'UI'],
	function (Player, Level, Enemy, UI) {
		return {
			game: null,
			player: null,
			levels: [],
			currentLevelIndex: -1,
			cameraOffset: {
				x: 0,
				y: 0
			},
			turnNumber: 0,

			start: function () {
				this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'dinodungeon', {
					preload: this.preload.bind(this),
					create: this.create.bind(this),
					render: this.render.bind(this),
					update: this.update.bind(this)
				});
			},

			preload: function () {
				this.game.load.spritesheet('hero_sprite', 'img/hero.png', 64, 64);
				this.game.load.spritesheet('map_tiles', 'img/dungeon_tiles_compact_and_varied.png', 16, 16);
			},

			create: function () {
				this.game.stage.disableVisibilityChange = true;
				this.game.time.advancedTiming = true;
				this.game.world.setBounds(-10000, -10000, 20000, 20000);
				this.playField = this.game.add.group(this.game.world, "playField");
				this.player = Player.create(this, this.playField);
				this.UI = UI.create(this);
				this.addLevel();
				this.setCurrentLevel(0, true);
				this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
				this.game.scale.setShowAll();
				this.game.scale.refresh();
				this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
			    this.game.input.onDown.add(function (self, pointer) {
			    	if (pointer.button === Phaser.Mouse.RIGHT_BUTTON) {
				    	this.capturedRightclick = true;
				    	this.capturedPointer = pointer;
			    	}
			    }, this);
			},

			render: function () {
				// this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
			},

			update: function () {
				if (this.capturedRightclick) {
			    	this.capturedRightclick = false;
			    	var mapPosition = this.currentLevel.getMapPosition(this.capturedPointer);
			    	if (this.currentLevel.squareWalkable(mapPosition.x, mapPosition.y) &&
			    		this.currentLevel.squareDiscovered(mapPosition.x, mapPosition.y)) {
				    	this.player.setMoveDestination(mapPosition);
			    	}
				}

				this.player.update();
				this.centerCameraOnMapPixelPosition({
					x: this.player.sprite.position.x + this.cameraOffset.x,
					y: this.player.sprite.position.y + this.cameraOffset.y
				});

				var velocity = 5;
				var moveVector = new Phaser.Point(0, 0);
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
					moveVector.y -= velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
					moveVector.y += velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
					moveVector.x -= velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
					moveVector.x += velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
					this.cameraOffset.x = 0;
					this.cameraOffset.y = 0;
				}

				moveVector.normalize();
				moveVector.multiply(velocity, velocity);
				this.cameraOffset.x += moveVector.x;
				this.cameraOffset.y += moveVector.y;
			},

			newTurn: function () {
				this.turnNumber++;
				console.log("== Turn " + this.turnNumber + " starting ==");

				this.currentLevel.newTurn();
			},

			addLevel: function () {
				var level = Level.create(this, this.playField, 20, 20);		// TODO: Tweak level sizes, and make larger and larger levels as you venture further down
				this.levels.push(level);
			},

			setCurrentLevel: function (index, goingDown) {
				if (this.currentLevel) {
					this.currentLevel.hide();
				}
				var level = this.levels[index];
				this.currentLevel = level;
				this.currentLevelIndex = index;
				level.makeCurrent(goingDown);
				this.UI.setDepth(index + 1);
			},

			centerCameraOnMapPosition: function (mapPosition) {
				var level = this.levels[this.currentLevelIndex];
				var p = level.getPixelPosition(mapPosition.x, mapPosition.y);
				game.game.world.camera.x = -(game.game.width / 2 - (p.x + level.getTileSize() / 2) * level.container.scale.x);
				game.game.world.camera.y = -(game.game.height / 2 - (p.y + level.getTileSize() / 2) * level.container.scale.y);
			},

			centerCameraOnMapPixelPosition: function (mapPosition) {
				var level = this.levels[this.currentLevelIndex];
				game.game.world.camera.x = -(game.game.width / 2 - (mapPosition.x + level.getTileSize() / 2) * level.container.scale.x);
				game.game.world.camera.y = -(game.game.height / 2 - (mapPosition.y + level.getTileSize() / 2) * level.container.scale.y);
			},

			onPlayerStepComplete: function () {
				this.currentLevel.updateFogOfWar();

				// Check if we stepped on anything interesting

				var level = this.currentLevel;
				if (this.player.mapPosition.x === level.entrancePosition.x && this.player.mapPosition.y === level.entrancePosition.y) {
					if (this.currentLevelIndex > 0) {
						this.setCurrentLevel(this.currentLevelIndex - 1, false);
					}
				}
				if (this.player.mapPosition.x === level.exitPosition.x && this.player.mapPosition.y === level.exitPosition.y) {
					if (this.currentLevelIndex === this.levels.length - 1) {
						// New level reached, award score!
						this.UI.addScore(1000);
						this.addLevel();
					}
					this.setCurrentLevel(this.currentLevelIndex + 1, true);
				}
			}
		};
	}
);
