function UI (game, container) {
	this.gameLogic = game;
	this.game = game.game;

	this.margin = 8;

	this.container = this.game.add.group();
	this.container.fixedToCamera = true;

	this.xpBarBg = this.game.add.image(this.margin, this.game.height - this.margin, "xp-bar-bg");
	this.xpBarBg.anchor.y = 1;
	this.container.add(this.xpBarBg);

	this.xpBar = this.game.add.image(2, -2, "xp-bar");
	this.xpBar.anchor.y = 1;
	this.xpBar.width = 0;
	this.xpBarBg.addChild(this.xpBar);

	this.avatarFrame = this.game.add.image(this.margin, this.game.height - this.xpBarBg.height - this.margin * 2, "avatar-frame");
	this.avatarFrame.anchor.y = 1;
	this.avatarFrame.inputEnabled = true;
	this.avatarFrame.input.useHandCursor = true;
	this.container.add(this.avatarFrame);

	this.avatarFrame.events.onInputDown.add(function (self, pointer) {
		this.characterScreen.visible = !this.characterScreen.visible;
	}.bind(this));

	
	this.avatar = this.game.add.image(4, -4, "avatar");
	this.avatar.anchor.y = 1;
	this.avatarFrame.addChild(this.avatar);

	this.levelText = this.game.add.text(4, -100, "1", {font: "40px Play", fill: "#FFFFFF", align: "left", stroke: "#000000", strokeThickness: 4});
	this.avatarFrame.addChild(this.levelText);

	this.nameText = this.game.add.text(0, 0, "Ragnar Lodbrok", {font: "25px Play", fill: "#FFFFFF", align: "left"});
	this.nameText.x = this.avatarFrame.width + 2 * this.margin;
	this.nameText.y = this.game.height - 2 * this.margin - this.avatarFrame.height - this.xpBarBg.height;
	this.container.add(this.nameText);

	this.scoreText = this.game.add.text(0, 0, "0 points", {font: "40px Play", fill: "#FFFFFF", align: "right"});
	this.scoreText.anchor.x = 1;
	this.scoreText.x = this.game.width - this.margin;
	this.scoreText.y = this.margin;
	this.container.add(this.scoreText);
	
	this.depthText = this.game.add.text(0, 0, "Depth 1", {font: "40px Play", fill: "#FFFFFF", align: "right"});
	this.depthText.anchor.x = 1;
	this.depthText.x = this.game.width - this.margin;
	this.depthText.y = this.scoreText.height + 2 * this.margin;
	this.container.add(this.depthText);

	this.healthBoxes = [];
	this.setHP(10, 10);

	this.manaBoxes = [];
	this.setMP(10, 10);

	this.characterScreen = this.game.add.image(this.margin, this.game.height - 3 * this.margin - this.xpBarBg.height - this.avatarFrame.height, "character-screen");
	this.characterScreen.anchor.y = 1;
	this.characterScreen.visible = false;
	this.container.add(this.characterScreen);

	var inventoryHeading = this.game.add.text(this.margin, -this.characterScreen.height + this.margin, "INVENTORY", {font: "25px Play", fill: "#FFFFFF", align: "left"});
	this.characterScreen.addChild(inventoryHeading);

	this.statTexts = {};
	var y = -this.characterScreen.height + this.margin * 4 + inventoryHeading.height;
	["str", "int", "vit", "dex", "armor"].forEach(function (statKey) {
		var value = this.gameLogic.player[statKey];
		if (statKey === "armor") {
			value = this.gameLogic.player.getArmor();
		}
		var nameText = this.game.add.text(this.margin, y, statKey.toUpperCase(), {font: "25px Play", fill: "#c6c6c6", align: "left"});
		var valueText = this.game.add.text(150, y, value.toString(), {font: "25px Play", fill: "#ffffff", align: "left"});
		y += nameText.height + this.margin;
		this.characterScreen.addChild(nameText);
		this.characterScreen.addChild(valueText);
		this.statTexts[statKey] = {
			name: nameText,
			value: valueText
		};
	}.bind(this));

	this.score = 0;
}

UI.prototype.updateStatTexts = function () {
	["str", "int", "vit", "dex", "armor"].forEach(function (statKey) {
		var value = this.gameLogic.player[statKey];
		if (statKey === "armor") {
			value = this.gameLogic.player.getArmor();
		}

		this.statTexts[statKey].value.setText(value.toString());
	}.bind(this));
};

UI.prototype.newTurn = function () {

};

UI.prototype.update = function () {

};

UI.prototype.addScore = function (amount) {
	this.score += amount;
	this.scoreText.setText(this.score.toString() + " points");
};

var BOX_ALPHA_FADED = 0.25;

UI.prototype.setHP = function (hp, maxHp) {
	while (this.healthBoxes.length < maxHp) {
		var box = this.game.add.image(this.avatarFrame.width + 2 * this.margin + this.healthBoxes.length * (28 + 3), this.game.height - this.margin * 2 - this.xpBarBg.height, "health-box");
		box.anchor.y = 1;
		if (this.healthBoxes.length > hp) {
			box.alpha = BOX_ALPHA_FADED;
		}
		this.container.add(box);
		this.healthBoxes.push(box);
	}

	for (var i = 0; i < this.healthBoxes.length; i++) {
		var alpha = BOX_ALPHA_FADED;
		if (i <= hp) {
			alpha = 1;
		}

		this.game.add.tween(this.healthBoxes[i]).to({
			alpha: alpha
		}, 500, Phaser.Easing.Quadratic.InOut, true);
	}
};

UI.prototype.setMP = function (mp, maxMp) {
	while (this.manaBoxes.length < maxMp) {
		var box = this.game.add.image(this.avatarFrame.width + 2 * this.margin + this.manaBoxes.length * (28 + 3), this.game.height - this.margin * 3 - this.xpBarBg.height - this.healthBoxes[0].height, "mana-box");
		box.anchor.y = 1;
		if (this.manaBoxes.length > mp) {
			box.alpha = BOX_ALPHA_FADED;
		}
		this.container.add(box);
		this.manaBoxes.push(box);
	}

	for (var i = 0; i < this.manaBoxes.length; i++) {
		var alpha = BOX_ALPHA_FADED;
		if (i <= mp) {
			alpha = 1;
		}

		this.game.add.tween(this.manaBoxes[i]).to({
			alpha: alpha
		}, 500, Phaser.Easing.Quadratic.InOut, true);
	}
};

UI.prototype.setXP = function (xp, maxXp) {
	this.game.add.tween(this.xpBar).to({
		width: (xp / maxXp) * (this.xpBarBg.width - 4)
	}, 500, Phaser.Easing.Quadratic.InOut, true);
};

UI.prototype.setLevel = function (level) {
	this.levelText.setText(level.toString());

    var style = {
        font: "30px Play",
        fill: "#00ff00",
        stroke: "#ffffff",
        strokeThickness: 3,
        align: "center"
    };

    this.avatarFrame.bringToTop();
    var text = this.game.add.text(this.levelText.x, this.levelText.y - 40, "LEVEL UP!", style);
    this.avatarFrame.addChild(text);

    var speed = 500;
    var delay = 300;

    var tween = this.game.add.tween(text).to({
        alpha: 0,
        y: text.y - 40
    }, speed, Phaser.Easing.Quadratic.InOut, true, delay);

    tween.onComplete.add(function () {
        this.destroy();
    }, text);
};

UI.prototype.setDepth = function (depth) {
	this.depthText.setText("Depth " + depth.toString());
};

UI.prototype.setName = function (name) {
	this.nameText.setText(name);
};

UI.prototype.showGameOver = function (name) {
	var animationTime = 2000;

	this.screenFader = this.game.add.graphics(0, 0);
	this.screenFader.beginFill(0x110000, 1);
	this.screenFader.drawRect(0, 0, this.game.width, this.game.height);
	this.screenFader.endFill();
	this.container.add(this.screenFader);
	this.screenFader.alpha = 0;
	this.game.add.tween(this.screenFader).to({
		alpha: 0.9
	}, animationTime, Phaser.Easing.Quadratic.InOut, true);

	this.gameoverText = this.game.add.text(0, 0, "GAME OVER", {
	        font: "200px Play",
	        fill: "#000000",
	        stroke: "#ffffff",
	        strokeThickness: 10,
	        align: "center"
	    });

    this.gameoverText.anchor.x = 0.5;
    this.gameoverText.anchor.y = 0.5;
    this.gameoverText.x = this.game.width / 2;
    this.gameoverText.y = this.game.height / 2 - 100;
    this.gameoverText.alpha = 0;
	this.container.add(this.gameoverText);
    var tween = this.game.add.tween(this.gameoverText).to({alpha: 1}, animationTime, Phaser.Easing.Quadratic.InOut, true);
	tween.onComplete.add(function () {
		this.blinkText = this.game.add.text(0, 0, "CLICK ANYWHERE TO QUIT", {
			font: "50px Play",
			fill: "#ffffff",
			align: "center"
		});
		this.blinkText.anchor.x = 0.5;
		this.blinkText.anchor.y = 0.5;
		this.blinkText.x = this.game.width / 2;
		this.blinkText.y = this.game.height / 2 + 100;
		this.container.add(this.blinkText);

	    this.game.input.onDown.add(function (self, pointer) {
	    	this.game.state.start("menuState");
	    }, this);

		var timer = this.game.time.events.loop(1000, function() {
			this.blinkText.alpha = this.blinkText.alpha ? 0 : 1;
		}, this);
	}, this);
};

define(function () {
	return {
		create: function (game, container) {
			return new UI(game, container);
		}
	}
});
