function UI (game, container) {
	this.gameLogic = game;
	this.game = game.game;
	//this.outerContainer = container;

	this.margin = 8;

	this.container = this.game.add.group();
	this.container.fixedToCamera = true;

	this.scoreText = this.game.add.text(0, 0, "0", {font: "40px Play", fill: "#FFFFFF", align: "right"});
	this.scoreText.anchor.x = 1;
	this.scoreText.x = this.game.width - this.margin;
	this.scoreText.y = this.margin;
	this.container.add(this.scoreText);
	
	this.depthText = this.game.add.text(0, 0, "Depth 1", {font: "40px Play", fill: "#FFFFFF", align: "right"});
	this.depthText.anchor.x = 1;
	this.depthText.x = this.game.width - this.margin;
	this.depthText.y = this.scoreText.height + 2 * this.margin;
	this.container.add(this.depthText);

	this.xpText = this.game.add.text(0, 0, "XP: 0 / 100", {font: "40px Play", fill: "#FFFFFF", align: "left"});
	this.xpText.anchor.y = 1;
	this.xpText.x = this.margin;
	this.xpText.y = this.game.height - this.margin;
	this.container.add(this.xpText);

	this.manaText = this.game.add.text(0, 0, "MP: 10", {font: "40px Play", fill: "#FFFFFF", align: "left"});
	this.manaText.anchor.y = 1;
	this.manaText.x = this.margin;
	this.manaText.y = this.game.height - this.xpText.height - 2 * this.margin;
	this.container.add(this.manaText);

	this.healthText = this.game.add.text(0, 0, "HP: 10", {font: "40px Play", fill: "#FFFFFF", align: "left"});
	this.healthText.anchor.y = 1;
	this.healthText.x = this.margin;
	this.healthText.y = this.game.height - this.xpText.height - this.manaText.height - 3 * this.margin;
	this.container.add(this.healthText);

	this.score = 0;
}

UI.prototype.newTurn = function () {

};

UI.prototype.update = function () {

};

UI.prototype.addScore = function (amount) {
	this.score += amount;
	this.scoreText.setText(this.score);
};

UI.prototype.setHP = function (hp) {
	this.healthText.setText("HP: " + hp.toString());
};

UI.prototype.setMP = function (mp) {
	this.manaText.setText("MP: " + mp.toString());
};

UI.prototype.setXP = function (xp, maxXp) {
	this.xpText.setText("XP: " + xp.toString() + " / " + maxXp.toString());
};

UI.prototype.setDepth = function (depth) {
	this.depthText.setText("Depth " + depth.toString());
};

define(function () {
	return {
		create: function (game, container) {
			return new UI(game, container);
		}
	}
});
