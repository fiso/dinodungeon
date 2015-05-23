function Player(game, container) {
	this.gameLogic = game;
	this.game = game.game;
	this.sprite = this.game.add.sprite(0, 0, 'hero_sprite');
	container.add(this.sprite);
	this.sprite.smoothed = false;
	this.sprite.anchor.set(0.5, 0.5);
	this.animation = this.sprite.animations.add('walk', null, 8, true);
	this.mapPosition = {x: -1, y: -1};
	this.sprite.scale.x = 0.5;
	this.sprite.scale.y = 0.5;

	this.name = "Hero";
	this.str = 10;
	this.int = 10;
	this.vit = 10;
	this.dex = 10;
	this.health = 10;
	this.maxHealth = 10;
	this.mana = 10;
	this.maxMana = 10;
	this.level = 1;
	this.equipSlots = [null, null, null, null];
	this.inventory = [];
	for (var i = 0; i < 7 * 3; i++) {
		this.inventory.push(null);
	}

	this.actions = {
		MOVE_TO_POSITION: "MOVE_TO_POSITION",
		WAIT: "WAIT",
		SLEEP: "SLEEP",
		CAST_SPELL: "CAST_SPELL",
		ATTACK: "ATTACK",
		SEARCH: "SEARCH"
	};

	this.game.input.keyboard.onDownCallback = this.onKeypress.bind(this);

	return this;
}

Player.prototype.getScreenCoordinates = function (mapX, mapY) {
	return {
		x: mapX * 16 + 8,
		y: mapY * 16 + 8
	};
};

Player.prototype.setMapPosition = function (x, y) {
	var coords = this.getScreenCoordinates(x, y);
	this.sprite.x = coords.x;
	this.sprite.y = coords.y;
	this.mapPosition.x = x;
	this.mapPosition.y = y;
};

Player.prototype.onKeypress = function (event) {
	if (event.repeat || this.game.tweens.isTweening(this.sprite)) {
		return;
	}

	switch (event.keyCode) {
		case Phaser.Keyboard.Z:
			this.takeAction(this.actions.WAIT);
			break;
		default:
			break;
	}
};

Player.prototype.takeAction = function (action, actionData) {
	console.log("Player action taken: " + action);
	switch (action) {
		case this.actions.MOVE_TO_POSITION:
			this.animateToMapPosition(actionData.x, actionData.y);
			break;
		case this.actions.WAIT:
			break;
		case this.actions.ATTACK:
			this.attackEnemy(actionData.enemy);
			break;
		default:
			console.log("UNHANDLED player action: " + action);
	}

	this.gameLogic.newTurn();
};

Player.prototype.animateToMapPosition = function (x, y) {
	var coords = this.getScreenCoordinates(x, y);
	var tween = this.game.add.tween(this.sprite).to({x: coords.x, y: coords.y}, 250, Phaser.Easing.Linear.None, true);

	this.mapPosition.x = x;
	this.mapPosition.y = y;

	if (coords.x < this.sprite.x) {
		if (this.sprite.scale.x < 0) {
			this.sprite.scale.x = 0.5;
		}
	} else if (coords.x > this.sprite.x) {
		if (this.sprite.scale.x > 0) {
			this.sprite.scale.x = -0.5;
		}
	}

	this.animation.play();

	tween.onComplete.add(function () {
		this.animation.stop(1);
		this.gameLogic.onPlayerStepComplete();
	}, this);
};

Player.prototype.update = function () {
	if (this.game.tweens.isTweening(this.sprite)) {
		return;
	}

	if (this.moveDestination) {
		var path = this.gameLogic.currentLevel.getPath(this.mapPosition, this.moveDestination);
		if (path.length < 2) {
			console.log("Destination reached");
			this.moveDestination = null;
		} else {
			if (!this.gameLogic.currentLevel.arePointsAdjacent(this.mapPosition, {x: path[1][0], y: path[1][1] })) {
				debugger;
			}
			if (this.gameLogic.currentLevel.squareWalkable(path[1][0], path[1][1])) {
				this.takeAction(this.actions.MOVE_TO_POSITION, {
					x: path[1][0],
					y: path[1][1]
				});
			} else {
				console.log("Something is in the way. Aborting pathing.");
				this.moveDestination = null;
			}
		}
	} else {

		var velocity = 1;
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

		if(Math.abs(moveVector.getMagnitudeSq()) > 0) {
			var level = this.gameLogic.currentLevel;
			if (level.squareWalkable(this.mapPosition.x + moveVector.x, this.mapPosition.y + moveVector.y)) {
				this.takeAction(this.actions.MOVE_TO_POSITION, {
					x: this.mapPosition.x + moveVector.x,
					y: this.mapPosition.y + moveVector.y
				});
			}
		}
	}
};

Player.prototype.setMoveDestination = function (destination) {
	this.moveDestination = destination;
};

Player.prototype.getArmor = function () {
	// This is a product of equipment worn
	return 0;
};

Player.prototype.takeDamage = function (amount) {
	amount = Math.max(1, amount - this.getArmor());
	this.gameLogic.currentLevel.showDamage(this.sprite, amount);
	this.health -= amount;
	this.gameLogic.UI.setHP(this.health);
	if (this.health < 1) {
		console.log("GAME OVER! TODO: Show UI for game over");
	}
};

Player.prototype.attackEnemy = function (enemy) {
	var chanceToHit = Math.min(Math.max((this.dex * 2) / enemy.dex, 0.01), 0.99);
	var damageDealt = Math.floor((Math.floor(Math.random() * 3) + 1) + this.str * 0.1);
	if (Math.random() > chanceToHit) {
		console.log("Attack missed");
		return;
	}
	enemy.takeDamage(damageDealt);
};

define(function () {
	return {
		create: function (game, container) {
			return new Player(game, container);
		}
	}
});
