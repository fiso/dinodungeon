function Player(game, container) {
	this.game = game;
	this.sprite = game.add.sprite(0, 0, 'hero_sprite');
	container.add(this.sprite);
	this.sprite.smoothed = false;
	this.sprite.anchor.set(0.5, 0.5);
	this.animation = this.sprite.animations.add('walk', null, 4, true);
	this.mapPosition = {x: -1, y: -1};
	this.sprite.scale.x = 0.5;
	this.sprite.scale.y = 0.5;

	this.name = "Hero";
	this.str = 10;
	this.int = 10;
	this.vit = 10;
	this.dex = 10;
	this.equipSlots = [null, null, null, null];
	this.inventory = [];
	for (var i = 0; i < 7 * 3; i++) {
		this.inventory.push(null);
	}

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

Player.prototype.animateToMapPosition = function (x, y) {
	var coords = this.getScreenCoordinates(x, y);
	var tween = this.game.add.tween(this.sprite).to({x: coords.x, y: coords.y}, 500, Phaser.Easing.Linear.None, true);

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
		var dinoDungeon = require('DinoDungeon');
		dinoDungeon.onPlayerStepComplete();
	}, this);
};

Player.prototype.update = function () {

	if (!this.game.tweens.isTweening(this.sprite)) {
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
			var dinoDungeon = require('DinoDungeon');
			var level = dinoDungeon.currentLevel;
			if (level.squareWalkable(this.mapPosition.x + moveVector.x, this.mapPosition.y + moveVector.y)) {
				this.animateToMapPosition(this.mapPosition.x + moveVector.x, this.mapPosition.y + moveVector.y);
			}
		}
	}
};

define(function () {
	return {
		create: function (game, container) {
			return new Player(game, container);
		}
	}
});
