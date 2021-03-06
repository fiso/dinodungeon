define(
	['Player', 'Level', 'Enemy', 'UI',
	'PreloadState', 'MenuState', 'PlayState'],
	function (Player, Level, Enemy, UI, PreloadState, MenuState, PlayState) {
		return {
			game: null,
			isDevelopment: false,

			start: function () {
				this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'dinodungeon');
				this.preloadState = PreloadState.create(this);
				this.menuState = MenuState.create(this);
				this.playState = PlayState.create(this);
				this.game.state.add("preloadState", this.preloadState);
				this.game.state.add("menuState", this.menuState);
				this.game.state.add("playState", this.playState);
				this.game.state.start("preloadState");
			}
		};
	}
);
