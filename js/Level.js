function Level (game, container, width, height) {
	this.gameLogic = game;
	this.game = game.game;
	this.width = width;
	this.height = height;
	this.outerContainer = container;
	this.entrancePosition = {x: -1, y: -1};
	this.exitPosition = {x: -1, y: -1};
	this.numWalkableTiles = -1;
	this.generate(this.width, this.height);
}

var segLengthMin = 1;
var segLengthMax = 6;
var forkOdds = 3;

var SQUARE_EMPTY = 0;
var SQUARE_WALKABLE = 1;
var SQUARE_ENTRANCE = 2;
var SQUARE_EXIT = 3;

var TILE_SIZE = 16;

var openTiles = [22, 23, 24, 43, 44, 45, 64, 65, 66];
var leftBorders = [21, 42, 63];
var rightBorders = [25, 46, 67];
var upBorders = [1, 2, 3];
var downBorders = [85, 86, 87];
var nwCorners = [0];
var neCorners = [4];
var swCorners = [84];
var seCorners = [88];
var verticalNarrows = [26];
var horizontalNarrows = [6];
var curves = [5, 7, 47, 49];
var uDeadEnds = [68];
var dDeadEnds = [89];
var lDeadEnds = [69];
var rDeadEnds = [70];

var openDoors = [71];
var closedDoors = [72];

var tileIndexMap = {
	"UDLR": openTiles,
	"UDL": rightBorders,
	"UDR": leftBorders,
	"UD": verticalNarrows,
	"ULR": downBorders,
	"UR": swCorners,
	"UL": seCorners,
	"U": dDeadEnds,
	"DLR": upBorders,
	"DL": neCorners,
	"DR": nwCorners,
	"D": uDeadEnds,
	"LR": horizontalNarrows,
	"L": rDeadEnds,
	"R": lDeadEnds
};

function getTileIndex (up, down, left, right) {
	var key = (up ? "U" : "") + (down ? "D" : "") + (left ? "L" : "") + (right ? "R" : "");
	if (!tileIndexMap[key]) {
		debugger;
	}

	return getRandomElement(tileIndexMap[key]);
}

function getRandomElement (array) {
    return array[Object.keys(array)[Math.floor(Math.random() * Object.keys(array).length)]];
}

function BresenhamLine (x0, y0, x1, y1) {
	var result = [];

	var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
	if (steep) {
		x0 = y0 + (y0=x0, 0);
		x1 = y1 + (y1=x1, 0);
	}

	if (x0 > x1) {
		x0 = x1 + (x1=x0, 0);
		y0 = y1 + (y1=y0, 0);
	}

	var deltaX = x1 - x0;
	var deltaY = Math.abs(y1 - y0);
	var error = 0;
	var yStep = -1;
	if (y0 < y1) {
		yStep = 1;
	}

	var y = y0;
	for (var x = x0; x <= x1; x++) {
		if (steep) {
			result.push([y, x]);
		} else {
			result.push([x, y]);
		}

		error += deltaY;
		if (2 * error >= deltaX) {
			y += yStep;
			error -= deltaX;
		}
	}

	return result;
};

Level.prototype.hide = function () {
	if (this.container) {
		this.container.remove(this.gameLogic.player.sprite);
		for (var i = 0; i < this.enemies.length; i++) {
			this.container.remove(this.enemies[i].sprite);
		}
		this.container.destroy();
		this.container = null;
	}
};

Level.prototype.makeCurrent = function (goingDown) {
	this.hide();

	var sprite;
	this.container = this.game.add.group(this.outerContainer);
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			if (!this.mapdata[this.width * y + x]) {
				continue;
			}

			var upFree = y > 0 ? (this.mapdata[this.width * (y - 1) + x] ? true : false) : false;
			var downFree = y < (this.height - 1) ? (this.mapdata[this.width * (y + 1) + x] ? true : false) : false;
			var leftFree = x > 0 ? (this.mapdata[this.width * y + (x - 1)] ? true : false) : false;
			var rightFree = x < (this.width - 1) ? (this.mapdata[this.width * y + (x + 1)] ? true : false) : false;
			var spriteIndex = getTileIndex(upFree, downFree, leftFree, rightFree);

			sprite = this.game.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'map_tiles', spriteIndex, this.container);
			sprite.discovered = false;
			sprite.smoothed = false;
		}
	}

	sprite = this.game.add.sprite(
		this.entrancePosition.x * TILE_SIZE,
		this.entrancePosition.y * TILE_SIZE,
		'map_tiles', getRandomElement(openDoors), this.container);
	sprite.smoothed = false;
	sprite = this.game.add.sprite(
		this.exitPosition.x * TILE_SIZE,
		this.exitPosition.y * TILE_SIZE,
		'map_tiles', getRandomElement(closedDoors), this.container);
	sprite.smoothed = false;

	this.container.scale.setTo(3, 3);

	if (goingDown) {
		this.gameLogic.player.setMapPosition(this.entrancePosition.x, this.entrancePosition.y);
	} else {
		this.gameLogic.player.setMapPosition(this.exitPosition.x, this.exitPosition.y);
	}
	this.container.add(this.gameLogic.player.sprite);
	for (var i = 0; i < this.enemies.length; i++) {
		this.container.add(this.enemies[i].sprite);
	}

	this.updateFogOfWar();
};

Level.prototype.updateFogOfWar = function () {
	for (var i = 0; i < this.container.children.length; i++) {
		var sprite = this.container.children[i];
		var mapCoordinate = {
			x: (sprite.x - (sprite.isEnemy ? TILE_SIZE / 2 : 0)) / TILE_SIZE,
			y: (sprite.y - (sprite.isEnemy ? TILE_SIZE / 2 : 0)) / TILE_SIZE
		};

		var dx = mapCoordinate.x - this.gameLogic.player.mapPosition.x;
		var dy = mapCoordinate.y - this.gameLogic.player.mapPosition.y;
		var distance = Math.sqrt(dx * dx + dy * dy);
		var visible = distance < 5;
		if (visible) {
			// Do line of sight testing, but only for tiles within visible range
			visible = this.tileVisible(mapCoordinate, this.gameLogic.player.mapPosition);
		}

		if (visible) {
			sprite.discovered = true;
			sprite.alpha = 1;
		} else {
			sprite.alpha = sprite.enemy ? 0 : (sprite.discovered ? 0.2 : 0);
		}
	}
};

Level.prototype.newTurn = function () {
	for (var i = 0; i < this.enemies.length; i++) {
		this.enemies[i].newTurn();
	}
};

Level.prototype.killEnemy = function (deadEnemy) {
	var myIndex = -1;
	for (var i = 0; i < this.enemies.length; i++) {
		var enemy = this.enemies[i];
		if (enemy === deadEnemy) {
			myIndex = i;
			break;
		}
	}

	if (myIndex === -1) {
		debugger;
	}

	enemy.sprite.destroy();
	this.enemies.splice(myIndex, 1);
};

Level.prototype.getPath = function (a, b) {
	var line = BresenhamLine(a.x, a.y, b.x, b.y);
	if (line[0][0] !== a.x || line[0][1] !== a.y) {
		line.reverse();
	}
	return line;
};

Level.prototype.arePointsAdjacent = function (a, b) {
	var dx = Math.abs(a.x - b.x);
	var dy = Math.abs(a.y - b.y);
	var manhattanDistance = dx + dy;

	if (manhattanDistance === 1) {
		return true;
	}

	if (dx === 1 && dy === 1) {
		return true;
	}

	return false;
};

Level.prototype.tileVisible = function (a, b) {
	var line = BresenhamLine(a.x, a.y, b.x, b.y);

	for (var i = 0; i < line.length; i++) {
		var point = line[i];
		if (this.mapdata[this.width * point[1] + point[0]] === SQUARE_EMPTY) {
			return false;
		}
	}

	return true;
};

Level.prototype.getRandomWalkableTile = function () {
	var chosen = Math.floor(Math.random() * this.numWalkableTiles);
	var count = 0;
	for (var i = 0; i < this.mapdata.length; i++) {
		if (this.mapdata[i]) {
			count++;
			if (count > chosen) {
				return {
					x: i % this.width,
					y: Math.floor(i / this.width)
				};
			}
		}
	}
};

Level.prototype.squareWalkable = function (x, y) {
	if (this.gameLogic.player.mapPosition.x === x && this.gameLogic.player.mapPosition.y === y) {
		return false;
	}

	for (var i = 0; i < this.enemies.length; i++) {
		var enemy = this.enemies[i];
		if (enemy.mapPosition.x === x && enemy.mapPosition.y === y) {
			return false;
		}
	}

	return this.mapdata[this.width * y + x] > 0;
};

Level.prototype.consoleDump = function () {
	for (var row = 0; row < this.height; row++) {
		var output = "" + row + (row < 10 ? " " : "") + "> ";
		for (var cellIndex = row * this.width; cellIndex < (row + 1) * this.width; cellIndex++) {
			output += this.mapdata[cellIndex];
		}
		console.log(output);
	}
};

Level.prototype.generate = function (width, height) {
	this.width = width;
	this.height = height;
	this.mapdata = new Uint8Array(this.width * this.height);
	this.generatePath(Math.floor(width / 2), Math.floor(height / 2), 1, 0, Math.segLengthMin + Math.round(Math.random() * (segLengthMax - segLengthMin)));

	this.numWalkableTiles = 0;
	var i;
	for (i = 0; i < this.mapdata.length; i++) {
		if (this.mapdata[i]) {
			this.numWalkableTiles++;
		}
	}

	// FIXME : Determine exit location in a better way. Maybe force a certain distance from the entrance etc.
	this.entrancePosition = this.getRandomWalkableTile();
	this.exitPosition = this.getRandomWalkableTile();
	while (this.entrancePosition.x === this.exitPosition.x && this.entrancePosition.y === this.exitPosition.y) {
		this.exitPosition = this.getRandomWalkableTile();
	}

	var Enemy = require('Enemy');
	this.enemies = [];
	for (i = 0; i < 5; i++) {
		var position = this.getRandomWalkableTile();
		var enemy = Enemy.create(this.gameLogic, this.outerContainer, position);
		enemy.sprite.isEnemy = true;
		this.enemies.push(enemy);
	}
};

Level.prototype.getPixelPosition = function (mapX, mapY) {
	return {
		x: mapX * TILE_SIZE,
		y: mapY * TILE_SIZE
	};
};

Level.prototype.getTileSize = function () {
	return TILE_SIZE;
};

Level.prototype.generatePath = function (startX, startY, dirX, dirY, iLength) {
	if(!iLength) {
		// Time to turn/fork
		var iOldDirX = dirX;
		var iOldDirY = dirY;
		if(dirX) {
			dirX = 0;
			dirY = Math.random() < 0.5 ? 1 : -1;
		} else {
			dirX = Math.random() < 0.5 ? 1 : -1;
			dirY = 0;
		}

		iLength = segLengthMin + Math.round(Math.random() * (segLengthMax - segLengthMin));
		this.generatePath(startX, startY, dirX, dirY, iLength);
		if(!(Math.random() < (1 / forkOdds))) {
			if(Math.random() < 0.5) {
				dirX = iOldDirX;
				dirY = iOldDirY;
			} else {
				if(iOldDirX) {
					dirY = -dirY;
				} else {
					dirX = -dirX;
				}
			}
			iLength = segLengthMin + Math.round(Math.random() * (segLengthMax - segLengthMin));
			this.generatePath(startX, startY, dirX, dirY, iLength);
		}
		return;
	}

	if(Math.abs(dirX + dirY) != 1) {
		debugger; // erroneus direction
	}

	this.mapdata[this.width * startY + startX] = SQUARE_WALKABLE;

	if(dirX) {
		var newX = startX + dirX;
		if(newX > -1 && newX < this.width) {
			if(this.mapdata[this.width * startY + newX] == 0) {
				this.mapdata[this.width * startY + newX] = 1;
				this.generatePath(newX, startY, dirX, dirY, iLength - 1);
			}
			else {
				return;
			}
		}
		else {
			return;
		}
	} else if(dirY) {
		var newY = startY + dirY;
		if(newY > -1 && newY < this.height) {
			if(this.mapdata[this.width * newY + startX] == 0) {
				this.mapdata[this.width * newY + startX] = 1;
				this.generatePath(startX, newY, dirX, dirY, iLength - 1);
			} else {
				return;
			}
		}
		else {
			return;
		}
	}
};

define(function () {
	return {
		create: function (game, container, width, height) {
			return new Level(game, container, width, height);
		}
	}
});
