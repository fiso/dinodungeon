function Player(game) {
	this.game = game;
	this.sprite = game.add.sprite(0, 0, 'hero_sprite');
	this.sprite.smoothed = false;
	this.sprite.anchor.set(0.5, 0.5);
	this.animation = this.sprite.animations.add('walk', null, 4, true);
	this.cursors = game.input.keyboard.createCursorKeys();
	this.mapPosition = {x: -1, y: -1};
	return this;
}

Player.prototype.getScreenCoordinates = function (mapX, mapY) {
	return {
		x: mapX * 16 * 2 + 16,
		y: mapY * 16 * 2 + 16
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
			this.sprite.scale.x = 1;
		}
	} else if (coords.x > this.sprite.x) {
		if (this.sprite.scale.x > 0) {
			this.sprite.scale.x = -1;
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
		if (this.cursors.up.isDown) {
			moveVector.y -= velocity;
		}
		if (this.cursors.down.isDown) {
			moveVector.y += velocity;
		}
		if (this.cursors.left.isDown) {
			moveVector.x -= velocity;
		}
		if (this.cursors.right.isDown) {
			moveVector.x += velocity;
		}

		if(Math.abs(moveVector.getMagnitudeSq()) > 0) {
			var dinoDungeon = require('DinoDungeon');
			var level = dinoDungeon.getCurrentLevel();
			if (level.squareWalkable(this.mapPosition.x + moveVector.x, this.mapPosition.y + moveVector.y)) {
				this.animateToMapPosition(this.mapPosition.x + moveVector.x, this.mapPosition.y + moveVector.y);
			}
		}
	}
};

define(function () {
	return {
		create: function (game) {
			return new Player(game);
		}
	}
});
