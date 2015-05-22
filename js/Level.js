function Level (game, width, height) {
	this.game = game;
	this.width = width;
	this.height = height;
	this.entrancePosition = {x: -1, y: -1};
	this.exitPosition = {x: -1, y: -1};
	this.numWalkableTiles = -1;
	this.generate(this.width, this.height);
}

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

Level.prototype.hide = function () {
	if (this.container) {
		this.container.destroy();
		this.container = null;
	}
};

Level.prototype.show = function () {
	this.hide();

	var sprite;
	this.container = this.game.add.group();
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

			sprite = this.game.add.sprite(x * 16, y * 16, 'map_tiles', spriteIndex, this.container);
			sprite.smoothed = false;
		}
	}

	sprite = this.game.add.sprite(
		this.entrancePosition.x * 16,
		this.entrancePosition.y * 16,
		'map_tiles', getRandomElement(openDoors), this.container);
	sprite.smoothed = false;
	sprite = this.game.add.sprite(
		this.exitPosition.x * 16,
		this.exitPosition.y * 16,
		'map_tiles', getRandomElement(closedDoors), this.container);
	sprite.smoothed = false;

	this.container.scale.setTo(2, 2);
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

	debugger;
};

Level.prototype.squareWalkable = function (x, y) {
	return this.mapdata[this.width * y + x] > 0;
};

var segLengthMin = 1;
var segLengthMax = 5;
var forkOdds = 2;

var SQUARE_EMPTY = 0;
var SQUARE_WALKABLE = 1;
var SQUARE_ENTRANCE = 2;
var SQUARE_EXIT = 3;

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
	this.generatePath(5, 5, 1, 0, Math.segLengthMin + Math.round(Math.random() * (segLengthMax - segLengthMin)));

	this.numWalkableTiles = 0;
	for (var i = 0; i < this.mapdata.length; i++) {
		if (this.mapdata[i]) {
			this.numWalkableTiles++;
		}
	}

	this.entrancePosition = this.getRandomWalkableTile();
	this.exitPosition = this.getRandomWalkableTile();
	while (this.entrancePosition.x === this.exitPosition.x && this.entrancePosition.y === this.exitPosition.y) {
		// FIXME
		this.exitPosition = this.getRandomWalkableTile();
	}
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
		create: function (game, width, height) {
			return new Level(game, width, height);
		}
	}
});
