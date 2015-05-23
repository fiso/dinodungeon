function Enemy(game, container, position, depth) {
	this.gameLogic = game;
	this.game = game.game;
	this.sprite = this.game.add.sprite(0, 0, 'enemy_sprite');
	container.add(this.sprite);
	this.sprite.smoothed = false;
	this.sprite.anchor.set(0.5, 0.5);
	this.animation = this.sprite.animations.add('walk', null, 8, true);
	this.mapPosition = {x: -1, y: -1};
	this.sprite.scale.x = 0.5;
	this.sprite.scale.y = 0.5;
	this.sprite.enemy = this;
	this.depth = depth;

	this.name = "Enemy";
	this.str = 10 + (depth - 1) * 2;
	this.int = 10;
	this.vit = 10;
	this.dex = 10 + Math.floor(0.5 * depth);

	this.health = 5;
	this.xpValue = 50;
	this.pointValue = 100;

	this.lastPlayerPosition = null;
	this.setMapPosition(position.x, position.y);

	this.sprite.inputEnabled = true;
	this.sprite.input.useHandCursor = true;

	this.sprite.events.onInputDown.add(function (self, pointer) {
		if (pointer.button === Phaser.Mouse.RIGHT_BUTTON) {
			this.gameLogic.capturedRightclick = false;
			if (this.gameLogic.currentLevel.arePointsAdjacent(this.gameLogic.player.mapPosition, this.mapPosition)) {
				this.gameLogic.player.takeAction(this.gameLogic.player.actions.ATTACK, {enemy: this});
			} else {
				console.log("Out of range!");
			}
		}
	}.bind(this));

	return this;
}

Enemy.prototype.getScreenCoordinates = function (mapX, mapY) {
	return {
		x: mapX * 16 + 8,
		y: mapY * 16 + 8
	};
};

Enemy.prototype.setMapPosition = function (x, y) {
	var coords = this.getScreenCoordinates(x, y);
	this.sprite.x = coords.x;
	this.sprite.y = coords.y;
	this.mapPosition.x = x;
	this.mapPosition.y = y;
};

Enemy.prototype.animateToMapPosition = function (x, y) {
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
	}, this);
};

Enemy.prototype.update = function () {

};

Enemy.prototype.attackPlayer = function () {
	var player = this.gameLogic.player;
	var chanceToHit = Math.min(Math.max(this.dex / (player.dex * 2), 0.01), 0.99);
	var damageDealt = Math.floor((Math.floor(Math.random() * 2)) + this.str * 0.1);
	console.log(chanceToHit);
	if (Math.random() > chanceToHit) {
		console.log("Attack missed");
		return;
	}
	this.gameLogic.player.takeDamage(damageDealt);
};

Enemy.prototype.destroy = function () {
	this.sprite.inputEnabled = false;
	var tween = this.game.add.tween(this.sprite).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
	tween.onComplete.add(function () {
		this.sprite.destroy();
	}, this);
};

Enemy.prototype.takeDamage = function (amount) {
	this.health -= amount;
	this.gameLogic.currentLevel.showDamage(this.sprite, amount);
	if (this.health < 1) {
		console.log("Enemy killed!");
		this.gameLogic.player.onDefeatEnemy(this);
		this.gameLogic.currentLevel.killEnemy(this);
	}
};

Enemy.prototype.newTurn = function () {
	var playerVisible = this.gameLogic.currentLevel.tileVisible(this.gameLogic.player.mapPosition, this.mapPosition);
	var isNextToPlayer = this.gameLogic.currentLevel.arePointsAdjacent(this.gameLogic.player.mapPosition, this.mapPosition);
	var moveToPos = null;

	if (playerVisible) {
		if (!this.lastPlayerPosition) {
			this.gameLogic.dinoRoar.play();
		}
		this.lastPlayerPosition = {
			x: this.gameLogic.player.mapPosition.x,
			y: this.gameLogic.player.mapPosition.y
		};

		if (isNextToPlayer) {
			this.attackPlayer();
		} else {
			console.log("Moving toward player");
			moveToPos = this.gameLogic.player.mapPosition;
		}
	} else if (this.lastPlayerPosition) {
		if (this.mapPosition.x === this.lastPlayerPosition.x &&
			this.mapPosition.y === this.lastPlayerPosition.y) {
			console.log("Reached last known position. Stopping here.");
			this.lastPlayerPosition = null;
		} else  {
			console.log("Moving toward last known position");
			moveToPos = this.lastPlayerPosition;
		}
	}

	if (moveToPos) {
		var path = this.gameLogic.currentLevel.getPath(this.mapPosition, moveToPos);
		if (path.length < 2) {
			console.log("I am on the player tile? This should not happen");
			return;
		}
		if (!this.gameLogic.currentLevel.arePointsAdjacent(this.mapPosition, {x: path[1][0], y: path[1][1] })) {
			debugger;
		}
		if (this.gameLogic.currentLevel.squareWalkable(path[1][0], path[1][1])) {
			this.animateToMapPosition(path[1][0], path[1][1]);
		} else {
			console.log("Something is in the way. Not moving.");
		}
	}
};

define(function () {
	return {
		create: function (game, container, position, depth) {
			return new Enemy(game, container, position, depth);
		}
	}
});
