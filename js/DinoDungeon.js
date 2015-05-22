define(
	['Player', 'Level'],
	function (Player, Level) {
		return {
			game: null,
			player: null,
			levels: [],
			currentLevelIndex: -1,

			start: function () {
				this.game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'dinodungeon', {
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
				this.game.world.setBounds(0, 0, 10000, 10000);
				this.player = Player.create(this.game);
				this.addLevel();
				this.setCurrentLevel(0, true);
			},

			render: function () {
				this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
			},

			update: function () {
				this.player.update();

				var velocity = 10;
				var moveVector = new Phaser.Point(0, 0);
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
					moveVector.y -= velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
					moveVector.y += velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
					moveVector.x -= velocity;
				}
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
					moveVector.x += velocity;
				}

				moveVector.normalize();
				moveVector.multiply(velocity, velocity);
				this.game.camera.x += moveVector.x;
				this.game.camera.y += moveVector.y;
			},

			addLevel: function () {
				var level = Level.create(this.game, 30, 30);
				this.levels.push(level);
			},

			setCurrentLevel: function (index, goingDown) {
				if (this.currentLevelIndex > -1) {
					this.levels[this.currentLevelIndex].hide();
				}
				this.currentLevelIndex = index;
				var level = this.levels[index];
				level.show();

				if (goingDown) {
					this.player.setMapPosition(level.entrancePosition.x, level.entrancePosition.y);
				} else {
					this.player.setMapPosition(level.exitPosition.x, level.exitPosition.y);
				}
				this.player.sprite.bringToTop();
			},

			getCurrentLevel: function () {
				return this.levels[this.currentLevelIndex];
			},

			onPlayerStepComplete: function () {
				var level = this.getCurrentLevel();
				if (this.player.mapPosition.x === level.entrancePosition.x && this.player.mapPosition.y === level.entrancePosition.y) {
					if (this.currentLevelIndex > 0) {
						this.setCurrentLevel(this.currentLevelIndex - 1, false);
					}
				}
				if (this.player.mapPosition.x === level.exitPosition.x && this.player.mapPosition.y === level.exitPosition.y) {
					if (this.currentLevelIndex === this.levels.length - 1) {
						this.addLevel();
					}
					this.setCurrentLevel(this.currentLevelIndex + 1, true);
				}
			}
		};
});
