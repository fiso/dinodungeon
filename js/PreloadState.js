function PreloadState(game) {
	this.gameLogic = game;
	this.game = game.game;
}

PreloadState.prototype = {
	preload: function () {
		this.game.load.spritesheet('hero_sprite', 'img/hero.png', 64, 64);
		this.game.load.spritesheet('enemy_sprite', 'img/enemy.png', 64, 64);
		this.game.load.spritesheet('map_tiles', 'img/dungeon_tiles_compact_and_varied.png', 16, 16);
		this.game.load.image("avatar", "img/avatar.png");
		this.game.load.image("avatar-frame", "img/avatar-frame.png");
		this.game.load.image("health-box", "img/health-box.png");
		this.game.load.image("mana-box", "img/mana-box.png");
		this.game.load.image("xp-bar", "img/xp-bar.png");
		this.game.load.image("xp-bar-bg", "img/xp-bar-bg.png");
	},

	create: function () {
		this.game.stage.disableVisibilityChange = true;
		this.game.time.advancedTiming = true;
		this.game.world.setBounds(-10000, -10000, 20000, 20000);
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.setShowAll();
		this.game.scale.refresh();
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		console.log("== PRELOAD COMPLETE - MOVING TO MENU ==");
		this.game.state.start("menuState");
	}
};

define(function () {
	return {
		create: function (game) {
			return new PreloadState(game);
		}
	}
});
