function PlayState(game, container) {
	this.gameLogic = game;
	this.levels = [];
	this.currentLevelIndex = -1;
	this.cameraOffset = {
		x: 0,
		y: 0
	};
	this.turnNumber = 0;
}

PlayState.prototype = {
	create: function () {
		this.playField = this.game.add.group(this.game.world, "playField");
		this.player = new Player(this, this.playField);
		this.UI = new UI(this);
		this.UI.setName(this.playerName);
		this.addLevel();
		this.setCurrentLevel(0, true);
	    this.game.input.onDown.add(function (self, pointer) {
	    	if (pointer.button === Phaser.Mouse.RIGHT_BUTTON) {
		    	this.capturedRightclick = true;
		    	this.capturedPointer = pointer;
	    	}
	    }, this);

	    this.dinoRoar = this.game.add.audio("dinoroar");

	    if (this.gameLogic.isDevelopment) {
		    this.dinoRoar.volume = 0;
		}
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

	shutdown: function () {
		for (var i = 0; i < this.levels.length; i++) {
			this.levels[i].destroy();
		}
		this.levels = [];
	},

	newTurn: function () {
		this.turnNumber++;
		console.log("== Turn " + this.turnNumber + " starting ==");

		this.currentLevel.newTurn();
	},

	addLevel: function () {
		var level = new Level(this, this.playField, 20, 20, this.levels.length + 1);		// TODO: Tweak level sizes, and make larger and larger levels as you venture further down
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
		this.player.moveDestination = null;
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
	},

	submitScore: function () {
		this.post("http://upr-jstenninge1.dice.ad.ea.com:3000/api/score", {dinokey: "a718d380-00b9-11e5-ba75-dd20de7eed80", username: this.playerName, score: this.UI.score});
	},

	post: function (url, params) {
		$.ajax({
		    type: 'POST',
		    url: url,
		    crossDomain: true,
		    data: params,
		    dataType: 'json',
		    success: function(responseData, textStatus, jqXHR) {
		        console.log("RESPONSE:", responseData);
		    },
		    error: function (responseData, textStatus, errorThrown) {
		        console.log("POST FAILED");
		    }
		});		
	}
};

define(function () {
	return {
		create: function (game) {
			return new PlayState(game);
		}
	}
});
