var socket;

var gameState = 0; // 0 and 1 are beginning states, 2 is the game, 3 is the end sequence, 4 is instructions, 5 is pause

var turnState = 0; // turnState 1 is "player X draw", 2 is "player X make a word", 3 is challenging a word, 4 is penalty for bad challenge

var actState = false; //your turn or theirs

var transState = false;

var transTime = 0;

var grabbed = false;

var initState = true; // moves text based on whether game is in progress

var animTime = 0;

var blockTiles = [];

var pn = 0;
var opn = 0;

var p1words = [];
var p2words = [];

var comTiles = [];

var invul = false;

var p1tot = 0;
var p2tot = 0;

var notEnuff = false;

var mouseX2 = 0;
var mouseY2 = 0;

var fadeTime = 0;

var regFont;
var tileFont;

var pageState = 0;

var showHow = false;

var rejoiner = false;

function preload() {
  regFont = loadFont('Museo_Slab_500_2.otf');
  tileFont = loadFont('Museo_Slab_500_2.otf');
}

function setup() {
  createCanvas(1366, 750);

  socket = io.connect('http://167.172.149.111:3000');

  //socket = io.connect('http://localhost:3000');

  socket.on('areYouLost',
    function() {
      rejoiner = true;
    });

  socket.on('hiBack',
    function(data) {
      console.log("you are player number " + data);
      pn = data;
      if (pn == 1) {
        gameState = 1;
        opn = 2;
      } else if (pn == 2) {opn = 1;}
      else if (pn == 3) {gameState = 10;}
    });

  socket.on('test',
    function(data) {
      console.log(data);
    });

    socket.on('turnBack',
    function() {
      console.log("turning back");
      turnState = 1;
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
      gameState = 2;
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
      gameState = 2;
  });

  socket.on('hereTile',
    function(data) {
      //fadeTime = transTime;
      comTiles = data;
      actState = !actState;
      initState = false;
    });

    socket.on('youreOn',
    function() {
      turnState = 2;
      actState = true;
    });

    socket.on('youreOff',
    function() {
      turnState = 2;
      actState = false;
    });

    socket.on('updateTile',
    function(data) {
      if(data.type == 1) {
        console.log("I hear... ");
        console.log(data);
        moveComTile(data);
      }
      if(data.type == 2) {
        console.log("p1word grabbed");
        moveP1Word(data);
      }
      if(data.type == 3) {
        console.log("p2word grabbed");
        moveP2Word(data);
      }
      if(data.type == 4) {
        console.log("blockTile grabbed");
        moveBT(data);
      }

    });

    socket.on('noMoreTiles',
    function() {
      actState = true;
      turnState = 5;
    });

    socket.on('newTrans',
    function() {
      fadeTime = transTime;
      transState = true;
      // socket.emit('yesTrans', "x");
    });

    socket.on('revLists',
    function(data) {
      console.log('receiving lists');
      comTiles = data.coms;
      blockTiles = data.blocks;
      p1words = data.p1s; // go find out if this is worth standardizing
      p2words = data.p2s;
      if (data.enuff > 1) {
        notEnuff = false;
      }
      console.log("comtiles: " + comTiles.length + " blockTiles: " + blockTiles.length + " p1words: " + p1words.length + " p2words: " + p2words.length);
    });

    socket.on('endTurn',
    function(data) {
      comTiles = data.coms;
      blockTiles = data.blocks;

      turnState = 1;
      actState = !actState;
    });

    socket.on('updateWords',
    function(data) {
      p1words = data.p1;
      p2words = data.p2;
      blockTiles = [];
      turnState = 1;
      transState = false;
      actState = !actState;
    });

    socket.on('okChallenge',
    function() {
      actState = true;
      turnState = 3;
    });

    socket.on('waitChallenge',
    function() {
      actState = false;
      turnState = 3;
    });


    socket.on('penSeq',
    function(data) {
      if (data == pn) {
        turnState = 4;
        actState = false;
        } else {
        turnState = 4;
        actState = true;
      }
    });

    socket.on('notEnuff',
    function() {
      notEnuff = true;
    });

    socket.on('totScores',
    function(data) {
      p1tot = data.p1;
      p2tot = data.p2;
      gameState = 3;
    });

    socket.on('tellMeStuff',
    function() {
      var tmsPkg = {
        aS: actState,
        gS: gameState,
        tS: turnState
      }
      socket.emit('hereStuff', tmsPkg);
    });

    socket.on('stuffForYou',
    function(data) {
      comTiles = data.coms;
      blockTiles = data.blocks;
      p1words = data.p1s;
      p2words = data.p2s;
      gameState = data.gS;
      turnState = data.tS;
      actState = data.aS;
      pn = data.pId;
      if (pn == 1) {opn = 2;} else {opn = 1;}
    });



    fill(230, 255, 215);
    textSize(24);
    textFont(regFont);

}



function draw() {
  var wW = windowWidth;
  var wH = windowHeight;
  var wWR = wW/1366;
  var wHR = wH/750;

  push();

  if (wWR >= wHR) {
    scale(wHR);
    mouseX2 = floor(mouseX / wHR);
    mouseY2 = floor(mouseY / wHR);
  } else {
    scale(wWR);
    mouseX2 = floor(mouseX / wWR);
    mouseY2 = floor(mouseY / wWR);
  }

  transTime++;

  background(0, 128, 56);

  push();
  strokeWeight(12);
  stroke(230, 255, 215);
  noFill();

  rect(0, 0, 583, 750, 20);
  rect(783, 0, 583, 750, 20);

  fill(0, 128, 56);
  rect(150, 0, 1066, 120, 20);
  pop();

  showButtons();

  if (gameState == 0) {
    opSeq();
  }

  if (gameState == 1) {
    setTheTable();
  }

  if (gameState == 2) {
    runGame();
  }

  if (gameState == 3) {
    endSeq();
  }

  if (gameState == 4) {
    howToPlay();
  }

  if (gameState == 10) {
    tooMany();
  }
  pop();
}

//-------------------------//

function runGame() {

//  turnAnim();

    showTiles();


  makingWords();


  if (turnState == 3) {
    challengeAnim();
  }

  if (turnState == 4) {
    penaltyAnim();
  }

  if (turnState == 5) {
    passSeq();
  }

  idAnim();
}

function showButtons() {
  var showButt = true;

  if (gameState <= 1 || gameState >= 4 || turnState == 3 || transState) {
    showButt = false;
  }

  if (turnState == 2 && actState == false) {
    showButt = false;
  }

  if(showButt) {
  push();
  strokeWeight(3);
  stroke(50, 80, 0);
  fill(180, 205, 165);
  rect(10, 10, 130, 100, 10);
  rect(1226, 10, 130, 100, 10);
  noFill();
  strokeWeight(2);
  stroke(110, 150, 0);
  //rect(15, 15, 120, 90, 10);
  line(15, 23, 15, 63);
  line(23, 15, 103, 15);
  arc(23, 23, 16, 16, PI, PI + HALF_PI);
  line(1231, 23, 1231, 63);
  line(1239, 15, 1319, 15);
  arc(1239, 23, 16, 16, PI, PI + HALF_PI);
//  stroke(50, 80, 0);
  arc(128, 98, 16, 16, 0, HALF_PI);
  arc(1344, 98, 16, 16, 0, HALF_PI);

  textAlign(CENTER, CENTER);

  if(gameState == 0) {
    textSize(24);
    fill(50, 80, 0);
    noStroke();
    text("HOW TO\nPLAY", 75, 43);
    textSize(28);
    text("START\nGAME", 1291, 43);
  }

  if(turnState == 1) {

  if(actState) {
    strokeWeight(3);
    stroke(50, 80, 0);
    fill(230, 255, 215);
    rect(160, 10, 1046, 100, 10);
    noFill();
    strokeWeight(2);
    stroke(110, 150, 0);
    //rect(15, 15, 120, 90, 10);
    line(165, 23, 165, 63);
    line(173, 15, 253, 15);
    arc(173, 23, 16, 16, PI, PI + HALF_PI);
  //  stroke(50, 80, 0);
    arc(1193, 98, 16, 16, 0, HALF_PI);
  }

    textSize(30);
    fill(50, 80, 0);
    noStroke();
    text("MAKE\nWORD", 75, 43);
    textSize(28);
    text("CHECK\nWORD", 1291, 43);
    textSize(60);
    if(actState) {
    text("DRAW A TILE", 683, 60);
  } else {
    text("PLAYER " + opn + " IS DRAWING", 683, 60);
  }
  }

  if(turnState == 2) {
    textSize(30);
    fill(50, 80, 0);
    noStroke();
    text("TAKE\nWORD", 75, 43);
    textSize(26);
    text("CANCEL\nWORD", 1291, 43);
  }
  pop();
}
}

function endSeq() {
  if (p1words.length > 0) {
    push();
    textSize(30);
    for (var i = 0; i < p1words.length; i++) {
      if(p1words[i].disp){
      var wordLetters = p1words[i].word.split('');
      var tX = p1words[i].x;
      var tY = p1words[i].y;

      for (var j = 0; j < wordLetters.length; j++) {
        fill(230, 255, 215);
        stroke(180);
        strokeWeight(1);
        rectMode(CORNER);
        rect((tX + (j * 30)), tY, 30, 40, 5);
        push();
          fill(180);
          noStroke();
          translate(15, 20);
          textAlign(CENTER, CENTER);
          textFont(tileFont);
          text(wordLetters[j].toUpperCase(), (tX + (j * 30)), tY);
        pop();
      }
    }
    var tSX = tX + (p1words[i].breadth * 15);
    push();
    textSize(64);
    fill(180, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(p1words[i].points, tSX, tY + 15);
    pop();
    }

    pop();
  }

  if (p2words.length > 0) {
    push();
    textSize(30);
    for (var i = 0; i < p2words.length; i++) {
      if(p2words[i].disp){
      var wordLetters = p2words[i].word.split('');
      var tX = p2words[i].x;
      var tY = p2words[i].y;

      for (var j = 0; j < wordLetters.length; j++) {
        fill(230, 255, 215);
        stroke(180);
        strokeWeight(1);
        rectMode(CORNER);
        rect((tX + (j * 30)), tY, 30, 40, 5);
        push();
          fill(180);
          noStroke();
          translate(15, 20);
          textAlign(CENTER, CENTER);
          textFont(tileFont);
          text(wordLetters[j].toUpperCase(), (tX + (j * 30)), tY);
        pop();
      }
    }
    var tSX = tX + (p2words[i].breadth * 15);
    push();
    textSize(64);
    fill(180, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(p2words[i].points, tSX, tY + 15);
    pop();
    }

    pop();
  }

  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(60);

  push();
  translate(683, 64);
  textAlign(CENTER, CENTER);
  text("Player 1: " + p1tot + " Player 2: " + p2tot, 0, 0);
  translate(0, 300);
  textSize(84);
  if ((p1tot > p2tot && pn == 1) || (p2tot>p1tot && pn == 2)) {
    text("You win!!", 0, 0);
  } else {
    text("Player " + opn + " wins. Better luck next time!", 0, 0);
  }
  pop();

}

function idAnim(){

if(pn == 1) {
  push();
  textAlign(LEFT);
  fill(230, 255, 215);
  noStroke();
  textSize(24);
  text ("Your Words:", 20, 155);
  textAlign(RIGHT);
  text ("Player 2's Words:", 1346, 155);
  pop();
} else {

    push();
    textAlign(LEFT);
    fill(230, 255, 215);
    noStroke();
    textSize(24);
    text ("Player 1's Words:", 20, 155);
    textAlign(RIGHT);
    text ("Your Words:", 1346, 155);
    pop();

}
}

function passSeq() {
  if (actState) {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(36);

    push();
    translate(683, 32);
    textAlign(CENTER, CENTER);
    text("No more tiles!\nPress \"P\" when you're ready to add up the scores", 0, 0);
    pop();
  } else {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(48);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text("Waiting on player " + opn + " to end the game", 0, 0);
    pop();
  }
}

function penaltyAnim() {
  if (actState) {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(48);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text("Go ahead and take a word from Player " + opn, 0, 0);
    pop();
  } else {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(48);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text("Player " + opn + " gets to take one of your words", 0, 0);
    pop();
  }
}

function challengeAnim() {
  if (actState) {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(36);

    push();
    translate(683, 44);
    textAlign(CENTER, CENTER);
    if (!invul) {
    text("Click on a word to challenge it\nor click here to return to the game", 0, 0);

  } else {
    push();
    translate(0, -32);
    textSize(36);
    text("That word has already been challenged.\nChoose a different word or press C to exit", 0, 0);
    pop();
  }
    pop();
  } else {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(48);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text("Player " + opn + " is challenging one of your words!", 0, 0);
    pop();
  }
}

function moveComTile(udPkg) {
  console.log("moving tile")
  var tElt = udPkg.element;
  comTiles[tElt].x = udPkg.xpos;
  console.log("moveComTile makes x: " + comTiles[tElt].x + udPkg.xpos);
  comTiles[tElt].y = udPkg.ypos;
}

function moveBT(udPkg) {
    var tElt = udPkg.element;
  console.log("moving block tile");
  blockTiles[tElt].x = udPkg.xpos;
  //console.log("moveComTile makes x: " + blockTiles[tElt].x + udPkg.xpos);
  blockTiles[tElt].y = udPkg.ypos;
}

function moveP1Word(udPkg) {
  console.log("moving tile")
  var tElt = udPkg.element;
  p1words[tElt].x = udPkg.xpos;
  console.log("moveComTile makes x: " + p1words[tElt].x + udPkg.xpos);
  p1words[tElt].y = udPkg.ypos;
}

function moveP2Word(udPkg) {
  console.log("moving tile")
  var tElt = udPkg.element;
  p2words[tElt].x = udPkg.xpos;
  console.log("moveComTile makes x: " + p2words[tElt].x + udPkg.xpos);
  p2words[tElt].y = udPkg.ypos;
}

function grabTile() {
  if (comTiles.length >= 1) {
    for (var i = 0; i < comTiles.length; i++) {
      var cT = comTiles[i];
      if (mouseX2 > cT.xmin && mouseX2 < cT.xmax && mouseY2 > cT.ymin && mouseY2 < cT.ymax && cT.disp) {
        grabbed = true;
        var data = {type:1, element:i, snapx:cT.snapx, snapy:cT.snapy}
        socket.emit('grabbedTile', data);
      }
    }
  }

  if (p1words.length >= 1) {
    for (var i = 0; i < p1words.length; i++) {
      var cT = p1words[i];
      if (mouseX2 > cT.x && mouseX2 < (cT.x + (cT.breadth*30)) && mouseY2 > cT.y && mouseY2 < cT.y + 40 && cT.disp) {
        grabbed = true;
        var data = {type:2, element:i, snapx:cT.x, snapy:cT.y}
        socket.emit('grabbedWord', data);
      }
    }
  }

  if (p2words.length >= 1) {
    for (var i = 0; i < p2words.length; i++) {
      var cT = p2words[i];
      var nX = p2words[i].x;

      if (mouseX2 > nX && mouseX2 < cT.x + (p2words[i].breadth * 30) && mouseY2 > cT.y && mouseY2 < cT.y + 40 && cT.disp) {
        grabbed = true;
        var data = {type:3, element:i, snapx:nX, snapy:cT.y}
        socket.emit('grabbedWord', data);
      }
    }
  }

  if (blockTiles.length >= 1) {
    for (var i = 0; i < blockTiles.length; i++) {
      var cT = blockTiles[i];

      if (mouseX2 > cT.x-30 && mouseX2 < cT.x+30 && mouseY2 > cT.y - 40 && mouseY2 < cT.y + 40) {
        grabbed = true;
        var data = {type:4, element:i, snapx:cT.x, snapy:cT.y}
        socket.emit('grabbedBT', data);
      }
    }
  }
}

function grabCWord (){
  if (p1words.length >= 1 && pn == 2) {
    for (var i = 0; i < p1words.length; i++) {
      var cT = p1words[i];
      if (mouseX2 > cT.x && mouseX2 < (cT.x + (cT.breadth*30)) && mouseY2 > cT.y && mouseY2 < cT.y + 40) {
        if (cT.vul){
        var data =  {word: cT.word, elt: i, pn: pn};
        invul = false;
        socket.emit('cWord', data);
      } else {
        invul = true;
      }
      }
    }
  }

  if (p2words.length >= 1 && pn == 1) {
    for (var i = 0; i < p2words.length; i++) {
      var cT = p2words[i];
      var nX = p2words[i].x;

      if (mouseX2 > nX && mouseX2 < cT.x + (p2words[i].breadth * 30) && mouseY2 > cT.y && mouseY2 < cT.y + 40) {
        if (cT.vul){
        var data =  {word: cT.word, elt: i, pn: pn};
        invul = false;
        socket.emit('cWord', data);
      } else {
        invul = true;
      }
      }
    }
  }
}

function takeWord (){
  if (p1words.length >= 1 && pn == 2) {
    for (var i = 0; i < p1words.length; i++) {
      var cT = p1words[i];
      if (mouseX2 > cT.x && mouseX2 < (cT.x + (cT.breadth*30)) && mouseY2 > cT.y && mouseY2 < cT.y + 40) {

        var data =  {word: cT.word, elt: i, pn: pn};
        socket.emit('tWord', data);
      }
    }
  }

  if (p2words.length >= 1 && pn == 1) {
    for (var i = 0; i < p2words.length; i++) {
      var cT = p2words[i];
      var nX = p2words[i].x;

      if (mouseX2 > nX && mouseX2 < cT.x + (p2words[i].breadth * 30) && mouseY2 > cT.y && mouseY2 < cT.y + 40) {

        var data =  {word: cT.word, elt: i, pn: pn};
        socket.emit('tWord', data);
      }
    }
  }
}

function makingWords() {
  if (turnState == 2) {
    if (blockTiles.length == 0) {
    dragAnim();
  } else {
    direxAnim();
  }
  }
}

function direxAnim() {
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(36);

  push();
//   translate(20, 154);
//   textAlign(LEFT, CENTER);
//   if (actState) {
//   text("Press enter when done", 0, 0);
// } else {
//   text("Player " + opn + " is making a word", 0, 0);
// }
  pop();
  if (notEnuff) {
    push();
    translate(683, 300);
    fill(230, 255, 215);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("You must combine more\nthan one element to\nmake a new word", 0, 0);
    pop();
  }
}

function dragAnim(){
  var mouseIsHome;
  if (mouseX2 > 150 && mouseX2 < 1066 && mouseY2 > 0 && mouseY2 < 150) {
    mouseIsHome = true;
      } else {
    mouseIsHome = false;
      }

  if (!mouseIsPressed || !mouseIsHome) {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(64);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    if (actState) {
    text("Drag tiles here to make words", 0, 0);
  } else {
    text("Player " + opn + " is making a word", 0, 0);
  }
    pop();
  }
}

function turnAnim() {
if (!transState && turnState == 1) {
  if (actState == true) {
    yourTurn();

  } else {
    theirTurn();

  }
}
}

function showTiles() {


  if (blockTiles.length > 0) {
  showBlockTiles();
  }

  if (p1words.length > 0 || p2words.length > 0) {
  showWordTiles();
  }

  if (comTiles.length > 0) {
    showComTiles();
  }
}

function showBlockTiles() {
  push();

  for (var i = 0; i < blockTiles.length; i++) {

    textSize(48);
    strokeWeight(2);
    stroke(50, 80, 0);
    fill(230, 255, 215);
    rectMode(CENTER);
    var tX = blockTiles[i].x;
    var tY = blockTiles[i].y;
    rect(tX, tY, 60, 80, 10);
    noStroke();
    fill(50, 80, 0);
    textAlign(CENTER, CENTER);
    textFont(tileFont);
    var tL = blockTiles[i].letter.toUpperCase();
    text(tL, tX, tY);
    textSize(14);
    text(blockTiles[i].points, tX + 20, tY + 28);
  }

  pop();
}

function showWordTiles() {
 if (p1words.length > 0) {
   push();
   textSize(28);
   for (var i = 0; i < p1words.length; i++) {
     if(p1words[i].disp){
     var wordLetters = p1words[i].word.split('');
     var tX = p1words[i].x;
     var tY = p1words[i].y;

     for (var j = 0; j < wordLetters.length; j++) {
       fill(230, 255, 215);
       stroke(50, 80, 0);
       strokeWeight(1);
       rectMode(CORNER);
       rect((tX + (j * 30)), tY, 30, 40, 5);
       push();
       if (p1words[i].vul) {
         fill(50, 80, 0);
       } else {
         fill(180, 0, 0);
       }
         noStroke();
         translate(15, 20);
         textAlign(CENTER, CENTER);
         textFont(tileFont);
         text(wordLetters[j].toUpperCase(), (tX + (j * 30)), tY);
       pop();
     }
   }
   }

   pop();
 }

 if (p2words.length > 0) {
   push();
   textSize(28);
   for (var i = 0; i < p2words.length; i++) {
     if(p2words[i].disp){
     var wordLetters = p2words[i].word.split('');
     var tX = p2words[i].x;
     var tY = p2words[i].y;

     for (var j = 0; j < wordLetters.length; j++) {
       fill(230, 255, 215);
       stroke(50, 80, 0);
       strokeWeight(1);
       rectMode(CORNER);
       rect((tX + (j * 30)), tY, 30, 40, 5);
       push();
       if (p2words[i].vul) {
         fill(50, 80, 0);
       } else {
         fill(180, 0, 0);
       }
         noStroke();
         translate(15, 20);
         textAlign(CENTER, CENTER);
         textFont(tileFont);
         text(wordLetters[j].toUpperCase(), (tX + (j * 30)), tY);
       pop();
     }
   }
   }

   pop();
 }
}

function showComTiles() {
  var fadeTime2 = transTime - fadeTime;
  if (fadeTime2 >= 120) {
    transState = false;
  }
  push();

    if(!transState && comTiles[0].disp) {
    textSize(48);
    strokeWeight(2);
    stroke(50, 80, 0);
    fill(230, 255, 215);
    rectMode(CENTER);
    var tX = comTiles[0].x;
    var tY = comTiles[0].y;
    rect(tX, tY, 60, 80, 10);
    noStroke();
    fill(50, 80, 0);
    textAlign(CENTER, CENTER);
    textFont(tileFont);
    var tL = comTiles[0].letter.toUpperCase();
    text(tL, tX, tY);
    textSize(14);
    text(comTiles[0].points, tX + 20, tY + 28);

    }

if(comTiles.length > 0) {
  for (var i = 1; i < comTiles.length; i++) {
    if(comTiles[i].disp) {
    textSize(48);
    strokeWeight(2);
    stroke(50, 80, 0);
    fill(230, 255, 215);
    rectMode(CENTER);
    var tX = comTiles[i].x;
    var tY = comTiles[i].y;
    rect(tX, tY, 60, 80, 10);
    noStroke();
    fill(50, 80, 0);
    textAlign(CENTER, CENTER);
    textFont(tileFont);
    var tL = comTiles[i].letter.toUpperCase();
    text(tL, tX, tY);
    textSize(14);
    text(comTiles[i].points, tX + 20, tY + 28);

    }
  }
}
  pop();

  if(transState) {
    push();
    var fadeR = 0;
    var vadeG = 0;
    var fadeB = 0;
    if(fadeTime2 > 0) {
      fadeR = floor(map(fadeTime2, 0, 120, 50, 230));
      fadeG = floor(map(fadeTime2, 0, 120, 80, 255));
      fadeB = floor(map(fadeTime2, 0, 120, 0, 215));
    }
    rectMode(CENTER);
    noStroke();
    fill(fadeR, fadeG, fadeB);
    rect(comTiles[0].x, comTiles[0].y, 60, 80, 10);
    pop();
  }
}

function yourTurn(){

  if (initState) {
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(72);

  push();
  translate(683, 384);
  textAlign(CENTER, CENTER);
  text("Your turn! Click here to draw a tile", 0, 0);
  pop();
} else {
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(72);

  push();
  translate(683, 64);
  textAlign(CENTER, CENTER);
  text("Your turn", 0, 0);
  pop();
}

}

function theirTurn() {
  if (initState) {
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(72);

  push();
  translate(683, 384);
  textAlign(CENTER, CENTER);
  text("Player " + opn + " is drawing", 0, 0);
  pop();
} else {
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(72);

  push();
  translate(683, 64);
  textAlign(CENTER, CENTER);
  text("Player " + opn + "\'s turn", 0, 0);
  pop();
}
}

function setTheTable() {

  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(72);

  push();
  translate(683, 384);
  textAlign(CENTER, CENTER);
  text("You are Player 1", 0, 0);
  translate(0, 140);
  textSize(36);
  text("Waiting on Player 2 to join...", 0, 0);
  pop();

}

function opSeq() {

background(0, 0, 0, 100);

fill(230, 255, 215);
strokeWeight(2);
stroke(50, 80, 0);

textSize(84);

push();

textAlign(CENTER, CENTER);
text("QUARANTINAGRAMS!!", 683, 64);
// translate(0, 140);
// textSize(36);
// text("Press X to get started!", 0, 0);

strokeWeight(3);
stroke(50, 80, 0);
fill(180, 205, 165);
rect(300, 284, 300, 200, 10);
rect(766, 284, 300, 200, 10);
noFill();
strokeWeight(2);
stroke(110, 150, 0);
//rect(15, 15, 120, 90, 10);
line(305, 297, 305, 397);
line(313, 289, 423, 289);
arc(313, 297, 16, 16, PI, PI + HALF_PI);
line(771, 297, 771, 397);
line(779, 289, 889, 289);
arc(779, 297, 16, 16, PI, PI + HALF_PI);
//  stroke(50, 80, 0);
// arc(128, 98, 16, 16, 0, HALF_PI);
// arc(1344, 98, 16, 16, 0, HALF_PI);

textAlign(CENTER, CENTER);

  textSize(72);
  fill(50, 80, 0);
  noStroke();
  text("START\nGAME", 450, 340);
  textSize(60);
  text("HOW TO\nPLAY", 916, 340);

  if(rejoiner) {
    strokeWeight(3);
    stroke(50, 80, 0);
    fill(180, 205, 165);
    rect(433, 584, 500, 100, 10);
    noFill();
    strokeWeight(2);
    stroke(110, 150, 0);
    //rect(15, 15, 120, 90, 10);
    line(438, 597, 438, 647);
    line(446, 589, 746, 589);
    arc(446, 597, 16, 16, PI, PI + HALF_PI);
    textSize(54);
    textAlign(CENTER, CENTER);
    fill(50, 80, 0);
    noStroke();
    text("REJOIN GAME?", 683, 640);
  }

pop();

pop();

}

function tooMany() {
    background(0, 0, 0, 100);
    fill(230, 255, 215);
    textSize(72);
    textAlign(CENTER, CENTER);
    text("The Room is Full...", 683, 65);
    textSize(60);
    textAlign(LEFT);
    text("Sadly there are too many people\ncurrently playing Quarantinagrams!\nPlease come back soon\nand play again!", 160, 280);
    console.log("Kilroy was here");
}

function buttonStuff() {
  var b1 = false;
  var b2 = false;
  var b3 = false;

  if (gameState > 0) {

  if (mouseX2 > 10 && mouseX2 < 140 && mouseY2 > 10 && mouseY2 < 110) {
    b1 = true;
  } else {
    b1 = false;
  }

  if (mouseX2 > 1226 && mouseX2 < 1356 && mouseY2 > 10 && mouseY2 < 110) {
    b2 = true;
  } else {
    b2 = false;
  }

  if (mouseX2 > 160 && mouseX2 < 1206 && mouseY2 > 10 && mouseY2 < 110) {
    b3 = true;
  } else {
    b3 = false;
  }
}

  if (gameState == 0) {
    if (mouseX2 > 300 && mouseX2 < 600 && mouseY2 > 284 && mouseY2 < 484) {sendHi();}
    if (mouseX2 > 766 && mouseX2 < 1066 && mouseY2 > 284 && mouseY2 < 484) {
      console.log("gamestate 4! all hail gamestate 4!");
      gameState = 4;
    }
    if (mouseX2 > 433 && mouseX2 < 933 && mouseY2 > 584 && mouseY2 < 684) {
      socket.emit('imBack', "x");
    }
  }

  if (turnState == 1 && actState) {
    if (b3 && !transState) {
      transState = true;
      socket.emit('drawTile', "x");
    }
  }

  if (turnState == 1) {
    if (b1) {socket.emit('makingWord', pn);}
      if(b2) {socket.emit('challengeWord', pn);}
  }

  if (turnState == 2 && actState) {
    if(b1) {socket.emit('sendWord', "x");}
    if(b2) {socket.emit('putEmBack', pn);}
  }

  if (turnState == 3 && actState) {
    if(b3) {
      invul = false;
      socket.emit('noChallenge', "x");
    }
  }
}

function howToPlay() {
  background(0, 0, 0, 150);

  fill(230, 255, 215);
  noStroke();

  if(pageState == 1) {
    textSize(72);
    textAlign(CENTER, CENTER);
    text("Let’s play Quarantinagrams!", 683, 65);
    textSize(46);
    textAlign(LEFT);
    text("The object of Quarantinagrams is to win\nas many points as you can. Each letter is\nworth a certain number of points; the rarer\nthe letter, the more points it carries.\n\nPlayers take turns drawing tiles into the\ncommunity pot by clicking the \“Draw a Tile\”\nbutton or pressing enter.\n\nClick anywhere to continue...", 160, 180);
    console.log("Kilroy was here");
  }

  if(pageState == 2) {
    textSize(48);
    textAlign(LEFT);
    text("When you see a word (of 3 or more letters) that\ncan be made from the tiles in the center, press\nthe spacebar or the \“Make Word\” button, drag\nthe letters onto the block at the top of the\nscreen, and arrange them into the word you\nwant to make. When the word is complete, hit\nenter or \“Take Word.\” Or to cancel, hit the\nspacebar again, or the \“Cancel\” button.\n\nClick anywhere to continue...", 160, 180);
  }

  if(pageState == 3) {
    textSize(48);
    textAlign(CENTER, CENTER);
    text("But you\’re not restricted to community tiles!", 683, 65);
    textSize(44);
    textAlign(LEFT);
    text("You can drag any combination of your words,\nyour opponent\’s words and the community tiles\nonto the block to make a new word. The only\nrules are that you must change the root (so \“cat\”\n+ \“s\” -> \“cats\” doesn\’t work, but -> \“cast\” does)\nand you must use more than one component to\nmake your word (so you can\’t just take your\nopponent\’s word and rearrange the letters).\n\nClick anywhere to continue...", 160, 180);

  }

  if(pageState == 4) {
    textSize(56);
    textAlign(CENTER, CENTER);
    text("Words aren\'t automatically validated", 683, 65);
    textSize(46);
    textAlign(LEFT);
    text("If you think one of your opponent\’s words\nmay not be a real word, click the \“Check Word\”\nbutton or hit \“c\” on the keyboard. The game\nwill match it against our (admittedly unofficial)\ndictionary. If it\’s not a word, you get to take\nit, and your opponent can\’t take it back; if it\nis a word, your opponent gets to take any word\nof yours.\n\nClick anywhere to continue...", 160, 180);

  }

  if(pageState == 5) {
    textSize(56);
    textAlign(CENTER, CENTER);
    text("The game ends when the tiles run out", 683, 65);
    textSize(46);
    textAlign(LEFT);
    text("Both players have an opportunity to make last\nwords. Once you’re sure there’s nothing\nelse you can make, click “End Game” or press\n“p”. The game will then total up each\nplayer’s points.\n\nClick anywhere to return to the game!", 160, 180);

  }
}


function LetterTile(letter, points, x, y, id){
  this.letter = letter;
  this.points = points;
  this.x = x;
  this.y = y;
  this.id = id;
  this.disp = true;
  this.xmin;
  this.xmax;
  this.ymin;
  this.ymax;
  this.snapx;
  this.snapy;
}

function mousePressed() {
  buttonStuff();

  if  (turnState == 2 && actState && !transState) {
     grabTile();
   }

   if  (turnState == 3 && actState) {
    grabCWord();
    }

    if  (turnState == 4 && actState) {
     takeWord();
     }

     if (gameState == 4 && pageState < 6) {
       turnPage();
     }

     if (pageState >= 6) {
       gameState = 0;
       pageState = 0;
     }
return false;
}

function turnPage() {
  pageState++;
}

function mouseDragged() {
  if (turnState == 2 && actState && grabbed) {
    sendMouse(mouseX2, floor(mouseY2));
  }
  return false;
}

function sendMouse(xpos, ypos) {
  //console.log("sendmouse: " + xpos + " " + ypos);
  var data = {
    x: xpos,
    y: ypos
  };

  socket.emit('mouse', data);
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

if (keyCode == ENTER && actState == true && turnState == 1) {
  transState = true;
  socket.emit('drawTile', "x");
  console.log("drawing a tile");
}

if (key == "c" && turnState == 1 && p1words.length > 0 && p2words.length > 0){
  console.log("player " + pn + " is challenging a word");
  socket.emit('challengeWord', pn);
}

if (key == "p" && turnState == 5 && actState){
  actState = false;
  socket.emit('imDone', pn);
}

if (key == "c" && turnState == 3 && actState){
  console.log("unchallenging");
  invul = false;
  socket.emit('noChallenge', "x");
}

if (keyCode == ENTER && actState == true && turnState == 2 && blockTiles.length > 2) {
  socket.emit('sendWord', "x"); // leaving here 5/2
}

if (key == " " && (turnState == 1 || turnState == 5)) {
  socket.emit('makingWord', pn);
}

if (key == " " && turnState == 2 && actState) {
  socket.emit('putEmBack', pn);
}


return false;
}


function mouseReleased(){
  if(grabbed) {
  grabbed = false;
  var mousePos = {x: mouseX2, y: floor(mouseY2)};
  console.log("mouse is released at " + mousePos.x);
  socket.emit('dropLetter', mousePos);
  }
  return false;
}
