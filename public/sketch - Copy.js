var socket;

var myWords = [];
var thisWord = [];
var otherWords = [];

var allTiles = [["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1],
["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["b", 3], ["b", 3], ["b", 3], ["b", 3],
["c", 3], ["c", 3], ["c", 3], ["c", 3], ["d", 2], ["d", 2], ["d", 2], ["d", 2], ["d", 2], ["d", 2], ["d", 2], ["d", 2], ["e", 1],
["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1],
["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1],
["e", 1], ["f", 4], ["f", 4], ["f", 4], ["f", 4], ["g", 2], ["g", 2], ["g", 2], ["g", 2], ["g", 2], ["g", 2],
["h", 4], ["h", 4], ["h", 4], ["h", 4], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1],
["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["j", 8], ["j", 8],
["k", 5], ["k", 5], ["l", 1], ["l", 1], ["l", 1], ["l", 1], ["l", 1], ["l", 1], ["l", 1], ["l", 1], ["m", 3],
["m", 3], ["m", 3], ["m", 3], ["n", 1], ["n", 1], ["n", 1], ["n", 1], ["n", 1], ["n", 1], ["n", 1], ["n", 1],
["n", 1], ["n", 1], ["n", 1], ["n", 1], ["p", 3], ["p", 3], ["p", 3], ["p", 3], ["q", 10], ["q", 10],
["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1],
["r", 1], ["s", 1], ["s", 1], ["s", 1], ["s", 1], ["s", 1], ["s", 1], ["s", 1], ["s", 1], ["t", 1],
["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1],
["u", 1], ["u", 1], ["u", 1], ["u", 1], ["u", 1], ["u", 1], ["u", 1], ["u", 1], ["v", 4], ["v", 4], ["v", 4], ["v", 4],
["w", 4], ["w", 4], ["w", 4], ["w", 4], ["x", 8], ["x", 8], ["y", 4], ["y", 4], ["y", 4], ["y", 4], ["z", 10], ["z", 10], [" ", 0], [" ", 0]];

var specTiles = [];

var gameState = 0;

var turnState = 0; // turnState 1 is "player X draw", turnState 2 is "any player ring in", 3 is "player X make a word"

var actState = false;

var transState = false;

var animTime = 0;

var pn = 0;
var opn = 0;

var p1words = [];
var p2words = [];
var p1tiles = [];
var p2tiles = [];
var p1fields = [];
var p2fields = [];

var comTiles = [];

function setup() {
  createCanvas(1366, 768);

  socket = io.connect('http://localhost:3000');
  socket.on('mouse',

    function(data) {
      console.log("got: " + data.x + " " + data.y);
      fill(0, 0, 255);
      noStroke();
      ellipse(data.x, data.y, 20, 20);
    });

  socket.on('word',

    function(data) {
      otherWords.push(data);
    });

  socket.on('hiBack',
    function(data) {
      console.log("you are player number " + data);
      pn = data;
      if (pn == 1) {opn = 2} else if (pn == 2) {opn = 1}
      animTime = 120;
      gameState = 1;
    });

  socket.on('test',
    function(data) {
      console.log(data);
    });

  socket.on('readyp1', // here's a new tile
    function() {
      turnState = 1;
      // transState = true;
      animTime = 620;
      if (pn == 1) {
        actState = true;
      } else {
        actState = false;
      }
  });

  socket.on('readyp2',
    function() {
      turnState = 1;
      // transState = true
      animTime = 620;
      if (pn == 2) {
        actState = false;
      } else {
        actState = true;
      }
  });

  socket.on('hereTile',
    function(data) {
      var thisTile = data;
      comTiles.unshift(thisTile);
      buildTiles();
    });


    fill(255);
    textSize(24);
    textFont('Georgia');

}

function dragTile(){

}

function draw() {

  background(0, 128, 56);

  strokeWeight(12);
  stroke(255);
  noFill();

  rect(0, 0, 533, 768);
  rect(833, 0, 533, 768);

  fill(0, 128, 56);
  rect(150, 0, 1066, 120);

  if (gameState == 0) {
    opSeq();
  }

  if (gameState == 1) {
    setTheTable();
  }

  if (gameState == 2) {
    runGame();
  }
}

//-------------------------//

function runGame() {
  if (actState == true && transState == true) {
    yourTurn();
    //turnAnim();
  } else if (actState == false && transState == true) {
    theirTurn();
    //turnAnim();
  }

  if (comTiles.length > 0) {
    showTiles();
  }
}

function turnAnim() {
  if (animTime > 0) {
    animTime --;
  } else {
    transState = false;
  }
}

function buildTiles() {

  comTiles[0].x = 683;
  comTiles[0].y = 200;
  if (comTiles.length > 1) {
  for (var i = 1; i < comTiles.length; i++) {
    var ns = floor((i-1)/2);
    if (i % 2 == 0) {
      comTiles[i].x = 783;
    } else {
      comTiles[i].x = 583;
    }

    comTiles[i].y = ns * 100 + 300;
    }
  }
}

function showTiles() {
  showComTiles();
}

function showComTiles() {
  push();

  for (var i = 0; i < comTiles.length; i++) {
    textSize(48);
    strokeWeight(2);
    stroke(0);
    fill(255);
    rectMode(CENTER);
    var tX = comTiles[i].x;
    var tY = comTiles[i].y;
    rect(tX, tY, 60, 80);
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    var tL = comTiles[i].letter.toUpperCase();
    text(tL, tX, tY);
    textSize(14);
    text(comTiles[i].points, tX + 20, tY + 28);


  }
  pop();
}

function yourTurn(){
  fill(255);
  strokeWeight(2);
  stroke(0);

  textSize(72);

  push();
  translate(683, 384);
  textAlign(CENTER, CENTER);
  text("Your turn! Press enter to draw a tile", 0, 0);
  pop();

}

function theirTurn() {
  fill(255);
  strokeWeight(2);
  stroke(0);

  textSize(72);

  push();
  translate(683, 384);
  textAlign(CENTER, CENTER);
  text("Player " + opn + " is drawing", 0, 0);
  pop();
}

function setTheTable() {

  if (animTime > 0) {

  fill(255);
  strokeWeight(2);
  stroke(0);

  textSize(72);

  push();
  translate(683, 384);
  textAlign(CENTER, CENTER);
  text("You are player number " + pn, 0, 0);
  translate(0, 140);
  textSize(36);
  text("Get ready to play!", 0, 0);
  pop();

  animTime--;
    } else {
  actState = true;
  socket.emit('ready', "x");
  gameState = 2;
    }

}

function opSeq() {

fill(255);
strokeWeight(2);
stroke(0);

textSize(72);

push();
translate(683, 384);
textAlign(CENTER, CENTER);
text("QUARANTINAGRAMS!!", 0, 0);
translate(0, 140);
textSize(36);
text("Press X to get started!", 0, 0);
pop();

}


function LetterTile(letter, points, x, y, id){
  this.letter = letter;
  this.points = points;
  this.x = x;
  this.y = y;
  this.id = id;
  this.disp = false;
}

function mouseDragged() {
  for (var i = 0; i < specTiles.length; i++) {
    if (mouseX > specTiles[i].x-15 && mouseX <specTiles[i].x+15 && mouseY > specTiles[i].y-15 && mouseY <specTiles[i].y+15 && specTiles[i].disp != false) {
      specTiles[i].x = mouseX;
      specTiles[i].y = mouseY;
    }
  }
}

function sendMouse(xpos, ypos) {
  console.log("sendmouse: " + xpos + " " + ypos);
  var data = {
    x: xpos,
    y: ypos
  };

  socket.emit('mouse', data);
}

function sendWord(word) {
  var noteWd = join(word, '');
  console.log("sending out: " + noteWd);

  socket.emit('word', word);
}

function sendHi() {
  socket.emit('hiThere', "x");
}

function keyTyped() {

  console.log("actState: " + actState);
  console.log("turnState: " + turnState);

if (key == "x" && gameState == 0) {
  sendHi();
  gameState = 1;
}

if (actState == true && turnState == 1) {
  socket.emit('drawTile', "x");
  console.log("drawing a tile");
  transState = false;
}

}


function mouseReleased(){
  for (var i = 0; i < specTiles.length; i++) {
    if (specTiles[i].x == 0 && specTiles[i].y == 0 && specTiles[i].disp == false) {
      specTiles[i].x = 300;
      specTiles[i].y = 300;
      specTiles[i].disp = true;
      break;
    }
  }
}
