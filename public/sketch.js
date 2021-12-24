var socket;

var gameState = 11; // 0 and 1 are beginning states, 2 is the game, 3 is the end sequence, 4 is instructions, 5 is pause

var turnState = 0; // turnState 1 is "player X draw", 2 is "player X make a word", 3 is challenging a word, 4 is penalty for bad challenge

var actState = false; //your turn or theirs

var transState = false;

var transTime = 0;

var grabbed = false;

var initState = true; // moves text based on whether game is in progress

var animTime = 0;

var tilesLeft = 98;

var blockTiles = [];

var specTiles = [];

var pn = 0;
var opn = 0;

var opName;

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

var username = "";

var usernameLetters = [];

var waiters = [];

var brokenGames = [];

var socketID;

var propUser;

var broken = false;

var tooShort = false;

var oldRoot = false;

var initWords = [];

var thisPick = 0;

var valCat = {"a": 1, "b": 3, "c": 3, "d": 2, "e": 1, "f": 4, "g": 2,
              "h": 4, "i": 1, "j": 8, "k": 5, "l": 1, "m": 3, "n": 1,
              "o": 1, "p": 3, "q": 10, "r": 1, "s": 1, "t": 1, "u": 1,
              "v": 4, "w": 4, "x": 8, "y": 4, "z": 10};

var prefixes = ["un", "in", "pre", "non", "re", "de", "dis"];

var suffixes = ["s", "es", "ed", "er", "ers", "ing", "ly", "ship", "ish", "ous", "ist", "est", "y", "iest", "ier", "d", "r"];

var suff2 = ["ed", "er", "ers", "ing", "y", "ier", "iest", "est"];

var exceptions = ["badger", "lady", "winy", "wind", "piny", "spiny"];

var bSWord;

var bSPoints = 0;

var endState = false;

var passState = false;

var isMob = false;

function preload() {
  regFont = loadFont('Museo_Slab_500_2.otf');
  tileFont = loadFont('Museo_Slab_500_2.otf');
}

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function setup() {
  createCanvas(1366, 750);

  frameRate(30);

  isMob = window.mobileCheck();

  socket = io.connect('http://10.108.0.2:3000');

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

    socket.on('yourID',
      function(data) {
        socketID = data;
        console.log("I got the yourid package");
      });

  socket.on('test',
    function(data) {
      console.log(data);
    });

    socket.on('turnBack',
    function(data) {
      console.log("turning back");
      turnState = 1;
      if (data == pn) {
        actState = true;
      } else {
        actState = false;
      }
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

  socket.on('brokenGame',
    function() {
      broken = true;
      var bgPkg = {
        gS: gameState,
        tS: turnState,
        aS: actState,
        pn: pn
      }
      socket.emit('gameInfo', bgPkg);
    });

    socket.on('returnToGame',
      function(data) {
        comTiles = data.coms;
        blockTiles = data.blocks;
        p1words = data.p1s;
        p2words = data.p2s;
        gameState = data.gS;
        turnState = data.tS;
        pn = data.pId;
        tilesLeft = data.tL;
        if (pn == 1) {
          opn = 2;
        } else if (pn == 2) {
          opn = 1;
        }
        opName = data.opN;

        if (pn == data.aS) {
          actState = true;
        } else {
          actState = false;
        }
      });

  socket.on('unbreak',
          function() {
            broken = false;
          });

  socket.on('stayBroken',
          function() {
            broken = true;
          });

  socket.on('initWord',
      function(data) {
        initWords.push(data);
      });

  socket.on('hereTile',
    function(data) {
      fadeTime = transTime - 1000;

      //console.log(data)
      //fadeTime = transTime;
      comTiles = data.tiles;
      if (data.aS == pn) {
        actState = true;
      } else {
        actState = false;
      }
      //actState = !actState;
      turnState = 1;
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
      endState = true;
      turnState = 5;
    });

    socket.on('tilePicked',
    function(data) {
      tilesLeft--;
      thisPick = data;
      fadeTime = transTime;
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

    socket.on('tossBack',
    function(data) {
      comTiles = data.coms;
      blockTiles = data.blocks;
      p1words = data.p1s;
      p2words = data.p2s;

      turnState = 1;
      actState = !actState;
    });

    socket.on('updateWords',
    function(data) {
      p1words = data.p1;
      p2words = data.p2;
      if (data.coms == 0) {
        comTiles = [];
      }
      blockTiles = [];
      if (!endState) {
      turnState = 1;
    } else {
      turnState = 5;
    }
      transState = false;
      if (data.aS == pn) {
        actState = true;
      } else {
        actState = false;
      }
    });

    socket.on('pickATile',
    function(data) {
      if (data.picker == pn) {
        actState = true;
      } else {
        actState = false;
      }

      turnState = 6;

      specTiles = data.tiles;

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
      fadeTime = transTime;
      notEnuff = true;
    });

    socket.on('totScores',
    function(data) {
      p1tot = data.p1;
      p2tot = data.p2;
      bSWord = data.bS;
      bSPoints = data.bSP;
      longWord = data.lW;
      bestWord = data.bWW;
      bestPoints = data.bWP;
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

    socket.on('signedIn',
    function() {
      gameState = 12;
    });

    socket.on('waitHere',
    function() {
      gameState = 13;
    });

    socket.on('weWait',
    function(data) {
      waiters = data;
      calcWaiters();
    });

    socket.on('thisGuy',
    function(data) {
      propUser = data;
      gameState = 17;
    });

    socket.on('joinMe',
    function(data) {
      socket.emit('joined', data);
    });

    socket.on('missedCon',
    function() {
      gameState = 18;
    });

    socket.on('noReturn',
    function() {
      gameState = 18;
    });

    socket.on('nobodyName',
    function() {
      //username = "";
      gameState = 20;
    });

    socket.on('servErr',
    function() {
      gameState = 22;
    });

    socket.on('hereBroken',
    function(data) {
      console.log(data);
      brokenGames = data;
      calcBG();
    });



    socket.on('afoot',
    function(data) {
      console.log('afooting');
      fadeTime = transTime;
      transState = true;
      if(socketID == data.p1) {
        pn = 1;
        opn = 2;
        opName = data.p2friendly;
        gameState = 19;
        turnState = 1;
        actState = true;
      } else {
        pn = 2;
        opn = 1;
        opName = data.p1friendly;
        gameState = 19;
        turnState = 1;
        actState = false;//here you left it
      }

    });


    fill(230, 255, 215);
    textSize(24);
    textFont(regFont);

}



function draw() {
  var wW = windowWidth;
  var wH = windowHeight;
  var wWR = (wW/1366) * 0.98;
  var wHR = (wH/750) * 0.98;

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

  if (gameState == 11) {
    enterName();
  }

  if (gameState == 12) {
    vestibule();
  }

  if (gameState == 13) {
    waitRando();
  }

  if (gameState == 14) {
    waitFriend();
  }

  if (gameState == 15) {
    showWaiters(waiters);
  }

  if (gameState == 16) {
    waitResp();
  }

  if (gameState == 17) {
    askUser();
  }

  if (gameState == 18) {
    reVestibule();
  }

  if (gameState == 19) {
    introducePlayers();
  }

  if (gameState == 20) {
    noNameVest();
  }

  if (gameState == 21) {
    showBG();
  }

  if (gameState == 22) {
    servErrScreen();
  }

  if(broken) {
    brokenScreen();
  }

  if(oldRoot) {
    rootAnim();
  }

  if(tooShort) {
    shortAnim();
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

  if (turnState == 6) {
    pickScreen();
  }
}

function brokenScreen() {
  background(0, 0, 0, 150);

  push();
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(60);



  textAlign(CENTER, CENTER);
  text("HRMM... SEEMS LIKE " + opName.toUpperCase() + "\nDISCONNECTED... YOU CAN WAIT\nHERE FOR THEM OR REFRESH\nTO RETURN TO THE LOBBY", 683, 174);
  pop();
}

function servErrScreen() {
  background(0, 0, 0, 150);

  push();
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(48);



  textAlign(CENTER, CENTER);
  text("HRMM... SEEMS LIKE SOMETHING WENT WRONG...\nREFRESH YOUR BROWSER, ENTER THE SAME\nUSERNAME AND CHOOSE \"REJOIN A GAME\"\nTO GET BACK TO YOUR GAME", 683, 174);
  pop();
}


function pickScreen() {
  var tT;
  var tB = false;

  var fadeTime3 = transTime;

  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);
  textAlign(CENTER);
  textSize(60);
  if(actState) {
  text('PICK A TILE! ANY TILE!', 683, 75);
} else {
  text(opName.toUpperCase() + ' IS PICKING', 683, 75);
}

  for (var i = 0; i < specTiles.length; i++) {
    if (specTiles[i].disp) {
      textSize(24);
      strokeWeight(2);
      stroke(50, 80, 0);
      fill(230, 255, 215);
      rectMode(CENTER);
      var tX = specTiles[i].x;
      var tY = specTiles[i].y;
      rect(tX, tY, 52, 70, 10);
      // noStroke();
      // fill(50, 80, 0);
      // textAlign(CENTER, CENTER);
      // textFont(tileFont);
      // var tL = blockTiles[i].letter.toUpperCase();
      // text(tL, tX, tY);
      // textSize(14);
      // text(blockTiles[i].points, tX + 10, tY + 14);
    }
  }

  for (var i = 0; i < specTiles.length; i++) {
  if (specTiles[i].id == thisPick) {
    var newY;
    if(specTiles[i].y > 630) {
      newY = 630;
    } else {
      newY = specTiles[i].y;
    }
  if(fadeTime3 - fadeTime < 120) {
  textSize(144);
  strokeWeight(5);
  stroke(50, 80, 0);
  fill(230, 255, 215);
  rectMode(CENTER);
  rect(specTiles[i].x, newY, 150, 200, 20);
  if (fadeTime3 - fadeTime < 60) {
    var fader = fadeTime3 - fadeTime;
    var fillMap = map(fader, 0, 60, 255, 0)
    fill(0, 0, 0, fillMap);
    rectMode(CENTER);
    rect(specTiles[i].x, newY, 150, 200, 20);
    } else {
    push();
    textAlign(CENTER, CENTER);
    fill(50, 80, 0);
    noStroke();
    text(specTiles[i].letter.toUpperCase(), specTiles[i].x, newY);
    textSize(24);
    //text(specTiles[i].points, 713, 460);
    pop();
    }
  }
 }
}
}

function introducePlayers() {
  var fadeTime2 = transTime - fadeTime;
  if (fadeTime2 >= 45) {
    transState = false;
    gameState = 2;
  }

  var fadeBk = map(fadeTime2, 0, 45, 150, 0);
  background(0, 0, 0, fadeBk);

  push();
  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(60);



  textAlign(CENTER, CENTER);
  text(username.toUpperCase() + ", MEET " + opName.toUpperCase() + "!\nLET'S PLAY QUARANTINAGRAMS!", 683, 174);
  pop();
}

function enterName() {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(48);

  text("TYPE YOUR NAME AND PRESS \"ENTER\".", 683, 65);

  textSize(90);
  text(username.toUpperCase(), 683, 360);
}

function noNameVest() {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(48);

  text("It doesn't look like there are any games\nmissing a player by that name...\nRe-enter your name here or click\nanywhere to return to the lobby.", 683, 65);
  textSize(90);
  text(username.toUpperCase(), 683, 360);
}

function waitRando() {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(60);

  text("Super! We're matching you up now!", 683, 360);
}

function waitResp() {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(60);

  text("Super! We're matching you up now!", 683, 360);
}

function waitFriend() {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(60);

  text("There isn't anyone currently waiting for a friend.\nWhen your friend shows up, they'll see you\nand the game will start.", 683, 260);
}

function calcWaiters() {

  for (var i = 0; i < waiters.length; i++) {
    if (waiters[i].name == socketID) {
      waiters.splice(i, 1);
    }
  }

  var lCounter = 0;
  var lC2 = 0;
  for (var i = 0; i < waiters.length; i++){
    var tLets = waiters[i].friendly.split('');
    waiters[i].letters = tLets;
    var wordBreadth = waiters[i].friendly.length * 60;
    if (lCounter + wordBreadth >= 1200) {
      lCounter = 0;
      lC2 += 100;
    }
    waiters[i].x = 83 + lCounter;
    waiters[i].y = lC2 + 184;
    lCounter += wordBreadth + 20;
  }
    // for (var i = 0; i < waiters.length; i++) {
    //
    //   var tLets = waiters[i].friendly.split('');
    //   waiters[i].letters = tLets;
    //   waiters[i].x = 683 - ((tLets.length-1) * 30)
    //   waiters[i].y = i * 120 + 350;
    // }

    gameState = 15;

}

function calcBG() {

  for(var i = 0; i < brokenGames.length; i ++) {
    var tName;
    if (username.toUpperCase() == brokenGames[i].p1friendly.toUpperCase()) {
      tName = brokenGames[i].p2friendly;
    } else {
      tName = brokenGames[i].p1friendly;
    }
    brokenGames[i].tName = tName;
    brokenGames[i].x = 683 - (brokenGames[i].tName.length-1)*30;
    brokenGames[i].y = i * 100 + 300;
  }

    gameState = 21;

}

function showBG() {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(40);

  if(brokenGames.length > 0) {

  text("If you see the person you were playing\nwith, click on their name, or click\nanywhere to return to the lobby.", 683, 30);

  for(var i = 0; i < brokenGames.length; i ++) {
    var tLets = brokenGames[i].tName.split('');
    push();
    for(var j = 0; j < tLets.length; j++) {
      var tJX = brokenGames[i].x + j * 60;
      var tY = brokenGames[i].y;
      rectMode(CENTER, CENTER);
      fill(230, 255, 215);
      strokeWeight(2);
      stroke(50, 80, 0);
      rect(tJX, tY, 60, 80, 10);
      textAlign(CENTER, CENTER);
      fill(50, 80, 0);
      noStroke();
      textSize(48);
      text(tLets[j].toUpperCase(), tJX, tY);
    }
    pop();
  }
}
}

function showWaiters(data) {
  background(0, 0, 0, 150);
  noStroke();
  fill(230, 255, 215);

  textAlign(CENTER, CENTER);
  textSize(40);

  if(waiters.length > 0) {

  text("Here are the people currently waiting! If you see your friend,\nclick on their name, or click anywhere else to return to the lobby.", 683, 30);

  for(var i = 0; i < waiters.length; i ++) {
    var tLets = waiters[i].letters;
    push();
    for(var j = 0; j < tLets.length; j++) {
      var tJX = waiters[i].x + j * 60;
      var tY = waiters[i].y;
      rectMode(CENTER, CENTER);
      fill(230, 255, 215);
      strokeWeight(2);
      stroke(50, 80, 0);
      rect(tJX, tY, 60, 80, 10);
      textAlign(CENTER, CENTER);
      fill(50, 80, 0);
      noStroke();
      textSize(48);
      text(tLets[j].toUpperCase(), tJX, tY);
    }
    pop();
  }
} else {
  textSize(60);
  text("Hrmm... looks like you're the only\none waiting right now, but your\nfriend will show up here\nwhen they log on.\n\nIf you want to return to the lobby,\nclick anywhere.", 683, 150);
}

}


function reVestibule() {
  background(0, 0, 0, 150);

  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(48);

  push();

  textAlign(CENTER, CENTER);
  text("Hrmm... something seems to have gone wrong...\nclick below to make another selection.", 683, 64);


  strokeWeight(3);
  stroke(50, 80, 0);
  fill(180, 205, 165);
  rect(300, 234, 300, 200, 10);
  rect(766, 234, 300, 200, 10);
  noFill();
  strokeWeight(2);
  stroke(110, 150, 0);

  line(305, 247, 305, 347);
  line(313, 239, 423, 239);
  arc(313, 247, 16, 16, PI, PI + HALF_PI);
  line(771, 247, 771, 347);
  line(779, 239, 889, 239);
  arc(779, 247, 16, 16, PI, PI + HALF_PI);

  strokeWeight(3);
  stroke(50, 80, 0);
  fill(180, 205, 165);
  rect(300, 484, 300, 200, 10);
  rect(766, 484, 300, 200, 10);
  noFill();
  strokeWeight(2);
  stroke(110, 150, 0);

  line(305, 497, 305, 597);
  line(313, 489, 423, 489);
  arc(313, 497, 16, 16, PI, PI + HALF_PI);
  line(771, 497, 771, 597);
  line(779, 489, 889, 489);
  arc(779, 497, 16, 16, PI, PI + HALF_PI);


  textAlign(CENTER, CENTER);

    textSize(54);
    fill(50, 80, 0);
    noStroke();
    text("RANDOM\nMATCH", 450, 290);
    textSize(60);
    text("PLAY A\nFRIEND", 916, 290);

    text("REJOIN\nA GAME", 450, 540);
    textSize(60);
    text("HOW TO\nPLAY", 916, 540);


  pop();

  pop();
}

function vestibule() {
  background(0, 0, 0, 150);

  fill(230, 255, 215);
  strokeWeight(2);
  stroke(50, 80, 0);

  textSize(84);

  push();

  textAlign(CENTER, CENTER);
  text("QUARANTINAGRAMS!!", 683, 64);
  textSize(36);
  text("HI, " + username.toUpperCase() + "! WHAT WOULD YOU LIKE TO DO?", 683, 174);

  strokeWeight(3);
  stroke(50, 80, 0);
  fill(180, 205, 165);
  rect(300, 234, 300, 200, 10);
  rect(766, 234, 300, 200, 10);
  noFill();
  strokeWeight(2);
  stroke(110, 150, 0);

  line(305, 247, 305, 347);
  line(313, 239, 423, 239);
  arc(313, 247, 16, 16, PI, PI + HALF_PI);
  line(771, 247, 771, 347);
  line(779, 239, 889, 239);
  arc(779, 247, 16, 16, PI, PI + HALF_PI);

  strokeWeight(3);
  stroke(50, 80, 0);
  fill(180, 205, 165);
  rect(300, 484, 300, 200, 10);
  rect(766, 484, 300, 200, 10);
  noFill();
  strokeWeight(2);
  stroke(110, 150, 0);

  line(305, 497, 305, 597);
  line(313, 489, 423, 489);
  arc(313, 497, 16, 16, PI, PI + HALF_PI);
  line(771, 497, 771, 597);
  line(779, 489, 889, 489);
  arc(779, 497, 16, 16, PI, PI + HALF_PI);


  textAlign(CENTER, CENTER);

    textSize(54);
    fill(50, 80, 0);
    noStroke();
    text("RANDOM\nMATCH", 450, 290);
    textSize(60);
    text("PLAY A\nFRIEND", 916, 290);

    text("REJOIN\nA GAME", 450, 540);
    textSize(60);
    text("HOW TO\nPLAY", 916, 540);


  pop();

  pop();
}

function showButtons() {
  var showButt = true;

  if (gameState <= 1 || gameState == 3 || gameState >= 4 || turnState == 3 || turnState == 4 || turnState == 6) {
    showButt = false;
  }

  // if (turnState == 2 && actState == false) {
  //   showButt = false;
  // }

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

  if(turnState == 1) {

  if(actState && !transState) {
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
    if(actState && !transState) {
    text("PICK A NEW TILE", 683, 60);

  } else if (!actState && !transState) {
    text(opName.toUpperCase() + "\'S TURN TO DRAW", 683, 60);
    }

    var greyOut = false;

    if((comTiles.length < 1 && (p1words.length + p2words.length < 2)) || ((p1words.length + p2words.length < 1) && comTiles.length < 3)) {
      greyOut = true;
    }

    if(transState || greyOut) {
      fill(180, 205, 165, 128);
      rect(10, 10, 130, 100, 10);
    }
    if (transState || p1words.length < 1 || p2words.length < 1) {
      fill(180, 205, 165, 128);
      rect(1226, 10, 130, 100, 10);
    }
  }

  if(turnState == 2) {
    if (actState) {
    textSize(30);
    fill(50, 80, 0);
    noStroke();
    text("TAKE\nWORD", 75, 43);
    textSize(26);
    text("CANCEL\nWORD", 1291, 43);
  } else {
    textSize(30);
    fill(50, 80, 0);
    noStroke();
    text("MAKE\nWORD", 75, 43);
    textSize(26);
    text("CHECK\nWORD", 1291, 43);
    fill(180, 205, 165, 128);
    rect(10, 10, 130, 100, 10);
    rect(1226, 10, 130, 100, 10);
    }
  }

  if(turnState == 5) {
    textSize(30);
    fill(50, 80, 0);
    noStroke();
    text("MAKE\nWORD", 75, 43);
    textSize(26);
    text("CHECK\nWORD", 1291, 43);
  }
  pop();
}
}

function endSeq() {
  if (p1words.length > 0) {
    push();
    textSize(36);
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
        rect((tX + (j * 45)), tY, 45, 60, 8);
        push();
          fill(180);
          noStroke();
          translate(22, 30);
          textAlign(CENTER, CENTER);
          textFont(tileFont);
          text(wordLetters[j].toUpperCase(), (tX + (j * 45)), tY);
          translate(15, 20);
          textAlign(CENTER, CENTER);
          textSize(12);
          text(valCat[wordLetters[j]], (tX + (j * 45)), tY);
        pop();
      }
    }
    var tSX = tX + (p1words[i].breadth * 22);
    push();
    textSize(64);
    fill(180, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(p1words[i].points, tSX, tY + 30);
    pop();
    }

    pop();
  }

  if (p2words.length > 0) {
    push();
    textSize(36);
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
        rect((tX + (j * 45)), tY, 45, 60, 8);
        push();
          fill(180);
          noStroke();
          translate(22, 30);
          textAlign(CENTER, CENTER);
          textFont(tileFont);
          text(wordLetters[j].toUpperCase(), (tX + (j * 45)), tY);
          translate(15, 20);
          textAlign(CENTER, CENTER);
          textSize(12);
          text(valCat[wordLetters[j]], (tX + (j * 45)), tY);
        pop();
      }
    }
    var tSX = tX + (p2words[i].breadth * 22);
    push();
    textSize(64);
    fill(180, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(p2words[i].points, tSX, tY + 30);
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
  if (pn == 1) {
  text(username.toUpperCase() + ": " + p1tot + " " + opName.toUpperCase() + ": " + p2tot, 0, 0);
} else if (pn == 2) {
  text(opName.toUpperCase() + ": " + p1tot + " " + username.toUpperCase() + ": " + p2tot, 0, 0);
  }
  translate(0, 300);
  strokeWeight(4);
  textSize(84);
  if (p1tot == p2tot) {
    text("TIE GAME!", 0, 0);
  } else if ((p1tot > p2tot && pn == 1) || (p2tot>p1tot && pn == 2)) {
    text("YOU WIN!!", 0, 0);
  } else {
    text(opName.toUpperCase() + " WINS!", 0, 0);
  }
  textSize(64);
  text("LONGEST WORD: " + longWord.toUpperCase(), 0, 100);
  textSize(48);
  text("BEST WORD: " + bestWord.toUpperCase() + " FOR " + bestPoints + " POINTS!", 0, 180);
  if(bSWord != "x") {
  text("BEST STEAL: " + bSWord.toUpperCase() + " FOR " + bSPoints + " POINTS!", 0, 250);
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
  text ("YOUR WORDS:", 20, 155);
  textAlign(RIGHT);
  text (opName.toUpperCase() + "'S WORDS:", 1346, 155);
  pop();
} else {

    push();
    textAlign(LEFT);
    fill(230, 255, 215);
    noStroke();
    textSize(24);
    text (opName.toUpperCase() + "'S WORDS:", 20, 155);
    textAlign(RIGHT);
    text ("YOUR WORDS:", 1346, 155);
    pop();

}

textSize(24);
noStroke();
fill(230, 255, 215);
textAlign(LEFT);
text("TILES REMAINING: " + tilesLeft, 20, 735);
}

function passSeq() {
  if (!passState) {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(36);

    push();
    translate(683, 32);
    textAlign(CENTER, CENTER);
    text("NO MORE TILES!\nCLICK HERE WHEN YOU'RE READY TO ADD UP SCORES", 0, 0);
    pop();
  } else {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(48);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text("WAITING ON " + opName.toUpperCase() + " TO END THE GAME", 0, 0);
    pop();
  }
}

function penaltyAnim() {
  if (actState) {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(40);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text("GO AHEAD AND TAKE A WORD FROM " + opName.toUpperCase(), 0, 0);
    pop();
  } else {
    fill(230, 255, 215);
    strokeWeight(2);
    stroke(50, 80, 0);

    textSize(40);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    text(opName.toUpperCase() + " GETS TO TAKE ONE OF YOUR WORDS", 0, 0);
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
    text("CLICK ON A WORD TO CHALLENGE IT\nOR CLICK HERE TO RETURN TO THE GAME", 0, 0);

  } else {
    push();
    translate(0, 0);
    textSize(36);
    text("THAT WORD HAS ALREADY BEEN CHALLENGED\nCHOOSE A DIFERENT WORD OR CLICK HERE TO EXIT", 0, 0);
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
    text(opName.toUpperCase() + " IS CHALLENGING ONE OF YOUR WORDS!", 0, 0);
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
      if (mouseX2 > cT.x && mouseX2 < (cT.x + (cT.breadth*45)) && mouseY2 > cT.y && mouseY2 < cT.y + 60 && cT.disp) {
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

      if (mouseX2 > nX && mouseX2 < cT.x + (p2words[i].breadth * 45) && mouseY2 > cT.y && mouseY2 < cT.y + 60 && cT.disp) {
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
      if (mouseX2 > cT.x && mouseX2 < (cT.x + (cT.breadth*45)) && mouseY2 > cT.y && mouseY2 < cT.y + 60) {
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

      if (mouseX2 > nX && mouseX2 < cT.x + (p2words[i].breadth * 45) && mouseY2 > cT.y && mouseY2 < cT.y + 60) {
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
if (notEnuff) {
  fadeTime2 = transTime;
  if (fadeTime2 - fadeTime < 120) {
    push();
    strokeWeight(2);
    stroke(230, 255, 215);
    fill(50, 80, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("You must combine more\nthan one element to\nmake a new word", 683, 300);
    pop();
   }
  }
}

function shortAnim() {

  fadeTime2 = transTime;
  if (fadeTime2 - fadeTime < 120) {
    push();
    strokeWeight(2);
    stroke(230, 255, 215);
    fill(50, 80, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("Your word must contain\nthree or more letters.", 683, 300);
    pop();
  } else {
    tooShort = false;
  }

}

function rootAnim() {

  fadeTime2 = transTime;
  if (fadeTime2 - fadeTime < 60) {
    push();
    strokeWeight(2);
    stroke(230, 255, 215);
    fill(50, 80, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("You must change the root\nto make a new word!", 683, 300);
    pop();
  } else {
    oldRoot = false;
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

    textSize(48);

    push();
    translate(683, 64);
    textAlign(CENTER, CENTER);
    if (actState) {
    text("DRAG TILES HERE TO MAKE A WORD", 0, 0);
  } else {
    text(opName.toUpperCase() + " IS MAKING A WORD", 0, 0);
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
   textSize(36);
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
       rect((tX + (j *45)), tY, 45, 60, 8);
       push();
       if (p1words[i].vul) {
         fill(50, 80, 0);
       } else {
         fill(180, 0, 0);
       }
         noStroke();
         translate(22, 30);
         textAlign(CENTER, CENTER);
         textFont(tileFont);
         text(wordLetters[j].toUpperCase(), (tX + (j * 45)), tY);
         translate(15, 20);
         textAlign(CENTER, CENTER);
         textSize(12);
         text(valCat[wordLetters[j]], (tX + (j * 45)), tY);
       pop();
     }
   }
   }

   pop();
 }

 if (p2words.length > 0) {
   push();
   textSize(36);
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
       rect((tX + (j * 45)), tY, 45, 60, 8);
       push();
       if (p2words[i].vul) {
         fill(50, 80, 0);
       } else {
         fill(180, 0, 0);
       }
         noStroke();
         translate(22, 30);
         textAlign(CENTER, CENTER);
         textFont(tileFont);
         text(wordLetters[j].toUpperCase(), (tX + (j * 45)), tY);
         translate(15, 20);
         textAlign(CENTER, CENTER);
         textSize(12);
         text(valCat[wordLetters[j]], (tX + (j * 45)), tY);
       pop();
     }
   }
   }

   pop();
 }
}

function showComTiles() {
  // var fadeTime2 = transTime - fadeTime;
  // if (fadeTime2 >= 30) {
  //   transState = false;
  // }
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
      fadeR = floor(map(fadeTime2, 0, 30, 50, 230));
      fadeG = floor(map(fadeTime2, 0, 30, 80, 255));
      fadeB = floor(map(fadeTime2, 0, 30, 0, 215));
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

function askUser() {

background(0, 0, 0, 150);

fill(230, 255, 215);
strokeWeight(2);
stroke(50, 80, 0);

textSize(54);

push();

textAlign(CENTER, CENTER);
text(propUser.friendly.toUpperCase() + " SELECTED YOU!\nIS THIS THE PERSON\nYOU'D LIKE TO PLAY WITH?", 683, 50);
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
line(305, 297, 305, 397);
line(313, 289, 423, 289);
arc(313, 297, 16, 16, PI, PI + HALF_PI);
line(771, 297, 771, 397);
line(779, 289, 889, 289);
arc(779, 297, 16, 16, PI, PI + HALF_PI);


textAlign(CENTER, CENTER);

  textSize(84);
  fill(50, 80, 0);
  noStroke();
  text("YES", 450, 380);
  text("NO", 916, 380);

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

function sendMakeWord() {
  var gTg = true;

  if (blockTiles.length < 3) {
    gTg = false;
    fadeTime = transTime;
    tooShort = true;
  }

  if (initWords.length > 0) {
  var possWord;
  var possWordLets = [];

  for (var i = 0; i < blockTiles.length; i++) {
    possWordLets.push(blockTiles[i].letter);
  }

  possWord = possWordLets.join('');

  for (var i = 0; i < initWords.length; i++){
      for (var j = 0; j < prefixes.length; j ++) {
        var testReg = new RegExp('^' + prefixes[j] + initWords[i]);
        var testWord = prefixes[j].concat(initWords[i]);
        if (possWord.match(testReg) != null) {
          console.log("found a prefix booboo")
          gTg = false;
          fadeTime = transTime;
          oldRoot = true;
          break;
        }
      }
      for (var j = 0; j < suffixes.length; j ++) {
        var testReg = new RegExp(initWords[i] + suffixes[j] + '$');
        var testWord = initWords[i].concat(suffixes[j]);
        if (possWord.match(testReg) != null) {
          gTg = false;
          fadeTime = transTime;
          oldRoot = true;
          break;
        }
      }
      var init2 = /(\w+(\w))/
      var init3 = '$1$2'
      var init4 = initWords[i].replace(init2, init3);
      for (var j = 0; j < suff2.length; j ++) {
        var testReg = new RegExp(init4 + suff2[j] + '$');
        if (possWord.match(testReg) != null) {
          gTg = false;
          fadeTime = transTime;
          oldRoot = true;
          break;
        }
      }
      var exc = new RegExp('^' + possWord + '$');
      for (var j = 0; j < exceptions.length; j ++) {
        if (exceptions[j].match(exc) != null) {
          gTg = true;
          oldRoot = false;
          break;
        }
      }
    }
  }

  if (gTg) {
    initWords = [];
    socket.emit('sendWord', "x");
  }
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

  if (gameState == 12 || gameState == 18) {
    if (mouseX2 > 300 && mouseX2 < 600 && mouseY2 > 234 && mouseY2 < 434) {socket.emit('matchMe', username);}
    if (mouseX2 > 766 && mouseX2 < 1066 && mouseY2 > 234 && mouseY2 < 434) {
      socket.emit('findMe', username);
    }
    if (mouseX2 > 300 && mouseX2 < 600 && mouseY2 > 484 && mouseY2 < 684) {socket.emit('hiAgain', username);}
    if (mouseX2 > 766 && mouseX2 < 1066 && mouseY2 > 484 && mouseY2 < 684) {
      gameState = 4; //here is where you stop!!
    }
  }

  if (turnState == 1 && actState) {
    if (b3 && !transState) {
      //transState = true;
      socket.emit('drawTile', "x");
    }
  }

  if (turnState == 1 || turnState == 5) {

      var noMake = false;
      if((comTiles.length < 1 && (p1words.length + p2words.length < 2)) || ((p1words.length + p2words.length < 1) && comTiles.length < 3)) {
        noMake = true;
      }

      if(!transState && !noMake) {
        if (b1) {socket.emit('makingWord', pn);}
      }
      if (!transState && p1words.length >= 1 && p2words.length >= 1) {
          if(b2) {socket.emit('challengeWord', pn);}
      }
  }

  if (turnState == 5) {
    if (b3 && !passState) {

      socket.emit('imDone', "x");
      passState = true;
    }
  }

  if (turnState == 2 && actState) {
    if(b1) {sendMakeWord();}
    if(b2) {socket.emit('putEmBack', pn);}
  }

  if (turnState == 3 && actState) {
    if(b3) {
      invul = false;
      socket.emit('noChallenge', "x");
    }
  }

  if (gameState == 15) {
    for (var i = 0; i < waiters.length; i++) {
      var tX1 = waiters[i].x - 30;
      var tX2 = waiters[i].x + 30 + (waiters[i].letters.length * 60);
      var tY1 = waiters[i].y - 40;
      var tY2 = waiters[i].y + 40;

      if (mouseX2 > tX1 && mouseX2 < tX2 && mouseY2 > tY1 && mouseY2 < tY2) {
        gameState = 16;
        socket.emit('connectMe', waiters[i].name);
      }
    }
  }

  if (gameState == 21) {
    for (var i = 0; i < brokenGames.length; i++) {
      var tX1 = brokenGames[i].x - 30;
      var tX2 = brokenGames[i].x + 30 + (brokenGames[i].tName.length * 30);
      var tY1 = brokenGames[i].y - 40;
      var tY2 = brokenGames[i].y + 40;

      if (mouseX2 > tX1 && mouseX2 < tX2 && mouseY2 > tY1 && mouseY2 < tY2) {
        var repairPkg = {
          rN: brokenGames[i].roomName,
          uN: username
        }
        socket.emit('repairGame', repairPkg);
      }
    }
  }

  if (gameState == 17) {
    if (mouseX2 > 300 && mouseX2 < 600 && mouseY2 > 284 && mouseY2 < 484) {
      var gamePkg = {
        p1id: propUser.name,
        p1friendly: propUser.friendly,
        p2id: socketID,
        p2friendly: username
      }
      console.log('sending good to go')
      socket.emit('goodToGo', gamePkg);
    }

    if (mouseX2 > 766 && mouseX2 < 1066 && mouseY2 > 284 && mouseY2 < 484) {
      gameState = 15;
      socket.emit('notQuite', propUser);
    }

  }

}

function pickStuff() {
  for (var i = 0; i < specTiles.length; i ++) {
    if (mouseX2 > specTiles[i].x - 20 && mouseX2 < specTiles[i].x + 20 && mouseY2 > specTiles[i].y - 26 && mouseY2 < specTiles[i].y + 26) {
      socket.emit('thisTile', i);
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
    text("The object of Quarantinagrams is to win\nas many points as you can. Each letter is\nworth a certain number of points; the rarer\nthe letter, the more points it carries.\n\nPlayers take turns drawing tiles into the\ncommunity pot by clicking the \“PICK A NEW\nTILE\” button and then clicking on a blank tile.\n\nClick anywhere to continue...", 160, 180);
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
  if(!broken) {
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

     if (turnState == 6 && actState) {
       pickStuff();
     }

     if (gameState == 4 && pageState < 6) {
       turnPage();
     }

     if (gameState == 20 || gameState == 15 || gameState == 21) {
       gameState = 12;
     }

     if (pageState >= 6) {
       gameState = 12;
       pageState = 0;
     }
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

function sendName() {
  socket.emit('signup', username);
}

function writeName() {
  username = usernameLetters.join('');
  //username = username.toUpperCase();
}

function keyPressed() {
  if (gameState == 11 || gameState == 20) {
    if (keyCode == BACKSPACE) {
      usernameLetters.pop();
      writeName();
    }
  }
}

function keyTyped() {

  console.log("actState: " + actState);
  console.log("turnState: " + turnState);

  if(gameState == 11 || gameState == 20) {
    if (keyCode == ENTER) {
      sendName();
      usernameLetters = [];
    } else {
      usernameLetters.push(key);
      writeName();
    }
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
  sendMakeWord(); // leaving here 5/2
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
