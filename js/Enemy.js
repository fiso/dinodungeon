function Enemy(game, container, position) {
	this.game = game;
	this.sprite = game.add.sprite(0, 0, 'hero_sprite');
	container.add(this.sprite);
	this.sprite.smoothed = false;
	this.sprite.anchor.set(0.5, 0.5);
	this.animation = this.sprite.animations.add('walk', null, 4, true);
	this.mapPosition = {x: -1, y: -1};
	this.sprite.scale.x = 0.5;
	this.sprite.scale.y = 0.5;

	this.name = "Enemy";
	this.str = 10;
	this.int = 10;
	this.vit = 10;
	this.dex = 10;

	this.setMapPosition(position.x, position.y);

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
	}, this);
};

Enemy.prototype.update = function () {

};

define(function () {
	return {
		create: function (game, container, position) {
			return new Enemy(game, container, position);
		}
	}
});
