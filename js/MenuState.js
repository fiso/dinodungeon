function MenuState(game) {
	this.gameLogic = game;
}

MenuState.prototype = {
	create: function () {
		if (this.gameLogic.isDevelopment) {
			this.startGame("fsoderholm");	// Dev override
			return;
		}

		this.logo = this.game.add.text(0, 0, "DINO DUNGEON", {
	        font: "200px Play",
	        fill: "#000000",
	        stroke: "#ffffff",
	        strokeThickness: 10,
	        align: "center"
	    });

	    this.logo.anchor.x = 0.5;
	    this.logo.anchor.y = 0.5;
	    this.logo.x = this.game.width / 2;
	    this.logo.y = this.game.height / 2 - 100;
	    this.logo.alpha = 0;
	    var tween = this.game.add.tween(this.logo).to({alpha: 1}, 2500, Phaser.Easing.Quadratic.InOut, true);
		tween.onComplete.add(function () {
			this.blinkText = this.game.add.text(0, 0, "CLICK ANYWHERE TO START", {
				font: "50px Play",
				fill: "#ffffff",
				align: "center"
			});
			this.blinkText.anchor.x = 0.5;
			this.blinkText.anchor.y = 0.5;
			this.blinkText.x = this.game.width / 2;
			this.blinkText.y = this.game.height / 2 + 100;

			var timer = this.game.time.events.loop(1000, function() {
				this.blinkText.alpha = this.blinkText.alpha ? 0 : 1;
			}, this);
		}, this);

	    this.game.input.onDown.add(function (self, pointer) {
	    	var playerName = prompt("Please enter your name. Use a valid Dinolog username to get highscore tracking, or just pick a cool viking name for flavor points!");
	    	if (playerName) {
	    		this.startGame(playerName);
	    	}
	    }, this);
	    if (!this.gameLogic.isDevelopment && !this.music) {
	    	console.log("START MUSIC");
		    this.music = this.game.add.audio("bgmusic");
	    	this.music.play();
	    }
	},

	update: function () {

	},

	render: function () {

	},

	startGame: function (playerName) {
		console.log("== STARTING PLAYSTATE ==");
		this.gameLogic.playState.playerName = playerName;
		this.game.state.start("playState");
	}
};

define(function () {
	return {
		create: function (game) {
			return new MenuState(game);
		}
	}
});
