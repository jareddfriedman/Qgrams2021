var express = require('express');

var app = express();
var server = app.listen(8080, listen);

var users = [];

var userGuide = {};

var valCat = {"a": 1, "b": 3, "c": 3, "d": 2, "e": 1, "f": 4, "g": 2,
              "h": 4, "i": 1, "j": 8, "k": 5, "l": 1, "m": 3, "n": 1,
              "o": 1, "p": 3, "q": 10, "r": 1, "s": 1, "t": 1, "u": 1,
              "v": 4, "w": 4, "x": 8, "y": 4, "z": 10};

var allTiles = [["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1], ["a", 1],
["b", 3], ["b", 3], ["c", 3], ["c", 3], ["d", 2], ["d", 2], ["d", 2], ["d", 2],
["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1],
["e", 1], ["f", 4], ["f", 4], ["g", 2], ["g", 2], ["g", 2],
["h", 4], ["h", 4], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1], ["i", 1],
["j", 8], ["k", 5], ["l", 1], ["l", 1], ["l", 1], ["l", 1], ["m", 3], ["m", 3], ["n", 1], ["n", 1], ["n", 1],
["n", 1], ["n", 1], ["n", 1], ["o", 1], ["o", 1], ["o", 1], ["o", 1], ["o", 1], ["o", 1], ["o", 1], ["o", 1],
["p", 3], ["p", 3], ["q", 10], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["r", 1], ["s", 1], ["s", 1],
["s", 1], ["s", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1], ["t", 1],
["u", 1], ["u", 1], ["u", 1], ["u", 1], ["v", 4], ["v", 4],
["w", 4], ["w", 4], ["x", 8], ["y", 4], ["y", 4], ["z", 10]];

var allXTiles = [["a", 1], ["d", 1], ["e", 1], ["r", 1], ["s", 1], ["t", 1], ["b", 1], ["o", 1], ["i", 1]];

var fs = require('fs');

var path = require('path');

var rawWordObject = fs.readFileSync('bigList.json');

var bigDict = JSON.parse(rawWordObject);

var datetime = require('node-datetime');

var allReady = 0;

var p1;
var p2;

var pNum = 1;

var dragX = 0;
var dragY = 0;

var grabbed = false;

var activeElement = {};

var passes = 0;

var enuff = 0;

var newTile = true;

var inProgress = false;

var lostPlayer = false;

//var masterList = keyList(bigDict);

var rawRoomObject = fs.readFileSync('gameRooms.json');

if(rawRoomObject.length > 1000) {
  var gameRooms = JSON.parse(rawRoomObject);
} else { var gameRooms = []; }

var waiters = [];

var rawBGObject = fs.readFileSync('brokenGames.json');

if(rawBGObject.length > 1000) {
  var brokenGames = JSON.parse(rawBGObject);
} else { var brokenGames = []; }

for (var i = 0; i < gameRooms.length; i++) {
  gameRooms[i].p1 = "x";
  gameRooms[i].p2 = "x";
  brokenGames.push(gameRooms[i]);
}

gameRooms = [];

console.log("tiles: " + allTiles.length);

// function keyList(listObj) {
//   return Object.keys(listObj);
// }
//
// console.log(masterList.length);

setInterval(saveLists, 60000);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

function saveLists() {
  var tempGR = [];

  for (var i = 0; i < gameRooms.length; i++) {
    var rN = gameRooms[i].roomName;
    var clientsIn = io.sockets.adapter.rooms[rN];
    if (clientsIn != undefined && clientsIn.length > 0) {
      tempGR.push(gameRooms[i]);
      console.log(rN + " is a valid room");
    } else {
      console.log(rN + " is broken");
      var tTime = datetime.create();
      gameRooms[i].brokenDate = tTime.now();
      gameRooms[i].p1 = "x";
      gameRooms[i].p2 = "x";
      brokenGames.push(gameRooms[i]);
    }
    // var numClients = Object.keys(clientsIn).length;
    // console.log("clients in " + rN + ": " + numClients);
  }

  gameRooms = tempGR;

  var gRsaves = JSON.stringify(gameRooms);
  fs.writeFile('gameRooms.json', gRsaves,
    function() {
      console.log("I just wrote a file");
    });

  var tempBG = [];
  var tTime = datetime.create();
  var tTimeX = tTime.now();
  for (var i = 0; i < brokenGames.length; i++) {
    if (tTimeX - brokenGames[i].brokenDate <= 259200000) {
      tempBG.push(brokenGames[i]);
    } else {
      console.log("farewell " + brokenGames[i].p1friendly + " & " + brokenGames[i].p2friendly)
    }
  }

  brokenGames = tempBG;
  if (brokenGames.length > 0) {
  var bGsaves = JSON.stringify(brokenGames);
  fs.writeFile('brokenGames.json', bGsaves,
    function() {
      console.log("saving broken games");
    });
  }
}

app.use(express.static('public'));

var io = require('socket.io')(server);

io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {

    socket.emit('yourID', socket.id);

    console.log("We have a new client: " + socket.id);

    if(inProgress && lostPlayer) {
      socket.emit('areYouLost', "x");
    }

    socket.on('signup',
    function(data) {
      console.log(data);
      socket.emit('signedIn', "x");
    }
  );
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {

        var tRX = userGuide[socket.id];
        var tR;
        var iffer = false;
        for (var i = 0; i < gameRooms.length; i++) {
          if (gameRooms[i].roomName == tRX) {
            iffer = true;
            tR = gameRooms[i];
            break;
          }
        }
        if (iffer) {
        // Data comes in as whatever was sent, including objects
        //console.log("Received: 'mouse' " + data.x + " " + data.y + "from " + socket.id);
        tR.dragX = data.x;
        tR.dragY = data.y;
        tR.manageTiles();
        // Send it to all other clients
        //socket.broadcast.emit('mouse', data);

        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");
      } else {socket.emit('servErr', "x");}
      }
    );

    socket.on('matchMe',
    function(data) {
      console.log("hearing from " + data);
      if(gameRooms.length === 0) {
        var newName = nameGen();
        gameRooms.push(new GameRoom(newName, socket.id.toString(), data));
        getStarted(gameRooms[0]);
        socket.join(gameRooms[0].roomName);
        socket.emit('waitHere', "x");
        console.log("created room " + gameRooms[0].roomName + " for " + gameRooms[0].p1 + " aka " + gameRooms[0].p1friendly);
      } else {
        var needNew = true;
        for (var i = 0; i < gameRooms.length; i++) {
          if (gameRooms[i].open) {
            socket.join(gameRooms[i].roomName);
            gameRooms[i].p2 = socket.id.toString();
            gameRooms[i].p2friendly = data;
            gameRooms[i].open = false;
            gameRooms[i].occupants = 2;
            needNew = false;
            console.log(data + " joined " + gameRooms[i].p1friendly + " to play Quarantinagrams!");
            kickOffGame(gameRooms[i]);
          }
        }
        if(needNew) {
          console.log("making new room");
          var newName = nameGen();
          gameRooms.push (new GameRoom(newName, socket.id.toString(), data));
          var ind = gameRooms.length - 1;
          getStarted(gameRooms[ind]);
          socket.join(gameRooms[ind].roomName);
          socket.emit('waitHere', "x");
        }
      }
    }
  );

  socket.on('findMe',
  function(data) {
    socket.join('waitingRoom');

    var q = false;
    for (var i = 0; i < waiters.length; i++) {
      if (waiters[i].name == socket.id) {
        q = true;
      }
    }
    if (!q) {
    var waiter = {
      name: socket.id.toString(),
      friendly: data
    }
    waiters.push(waiter);
    }
    io.in('waitingRoom').emit('weWait', waiters);
  }
);

socket.on('connectMe',
function(data) {
  var tUser;
  for (var i = 0; i < waiters.length; i++) {
    if (socket.id == waiters[i].name) {
      tUser = waiters[i];
      waiters[i].waiting = data;
    }
  }
  socket.leave('waitingRoom');
  io.to(data).emit('thisGuy', tUser);
}
);

socket.on('goodToGo',
function(data) {
    var tName = nameGen();
    socket.join(tName);//now you gotta break this into 2 functions to have each join the room
    socket.leave('waitingRoom');
    gameRooms.push(new GameRoom(tName, data.p1id, data.p1friendly));
    var gRL = gameRooms.length - 1;
    gameRooms[gRL].p2 = data.p2id;
    gameRooms[gRL].p2friendly = data.p2friendly;
    gameRooms[gRL].open = false;

    var tempWaiters = [];

    for (var i = 0; i < waiters.length; i++) {
      if (waiters[i].name != gameRooms[gRL].p1 && waiters[i].name != gameRooms[gRL].p2) {
        tempWaiters.push(waiters[i]);
      }
    }

    waiters = tempWaiters;

    io.in('waitingRoom').emit('weWait', waiters);

    getStarted(gameRooms[gRL]);
    io.to(gameRooms[gRL].p1).emit('joinMe', gameRooms[gRL]);
  }
);

socket.on('joined',
function(data) {
  socket.join(data.roomName);
  // var tI;
  // for (var i = 0; i < waiters.length; i++) {
  //   if (waiters[i].name == socket.id|| waiters[i].name == socket.id) {
  //     tI = i;
  //   }
  // }
  // if(tI !== undefined) {
  // waiters.splice(tI, 1);
  // io.in('waitingRoom').emit('weWait', waiters);
  // }
  socket.leave('waitingRoom');
    kickOffGame(data);
    //io.to(gameRooms[gRL].roomName).emit('afoot', gameRooms[gRL]);
  }
);

socket.on('notQuite',
function(data) {
    io.to(data.name).emit('missedCon', "x");
  }
);


socket.on('hiAgain',
function(data) {
    if(brokenGames.length < 1) {
      socket.emit('noReturn', "x");
    } else {
      var tempBG = [];
      for (var i = 0; i < brokenGames.length; i++) {
        if (brokenGames[i].p1friendly.toUpperCase() == data.toUpperCase() || brokenGames[i].p2friendly.toUpperCase() == data.toUpperCase()) {
          tempBG.push(brokenGames[i]);
        }
      }
      if (tempBG.length < 1) {
        socket.emit('nobodyName', "x");
      } else {
        console.log("you're good")
        socket.emit('hereBroken', tempBG);
      }
    }
  });

    socket.on('noChallenge',
    function(data) {
      console.log("turn it back");
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          tR = gameRooms[i];
          iffer = true;
          break;
        }
      }
      io.in(tRX).emit('turnBack', tR.aS);
    }
  );

  // socket.on('hereComTiles',
  // function(data) {
  //   comTiles = data;
  //   if (comTiles.length >= 1) {
  //     for (var i = 0; i < comTiles.length; i++) {
  //       console.log (comTiles[i]);
  //     }
  //   }
  // });

  socket.on('hiThere',
    function() {
      console.log("Hi there!");
      users.push(socket.id);
      console.log("We are now serving " + users.length + " clients.")
      if (users.length == 1 && !inProgress) {
        p1 = socket.id;
      socket.emit('hiBack', 1);
    } else if (users.length == 2 && !inProgress) {
        p2 = socket.id;
      socket.emit('hiBack', 2);
      socket.emit('readyp2', "x");
      socket.broadcast.emit('readyp1', "x");
      inProgress = true;
      getStarted();
    } else {
      socket.emit('hiBack', 3);
    }

    }
  );

  socket.on('makingWord', // tells active player and passive player their respective roles
  function() {

    var tRX = userGuide[socket.id];
    var tR;
    var iffer = false;
    for (var i = 0; i < gameRooms.length; i++) {
      if (gameRooms[i].roomName == tRX) {
        iffer = true;
        tR = gameRooms[i];
        break;
      }
    }

    if(iffer) {

    if(socket.id == tR.p1) {
      io.to(tR.p1).emit('youreOn', "x");
      io.to(tR.p2).emit('youreOff', "x");
      tR.pNum = 1;
    } else {
      io.to(tR.p1).emit('youreOff', "x");
      io.to(tR.p2).emit('youreOn', "x");
      tR.pNum = 2;
    }
    console.log ("Player " + pNum + " is making a word.");
  }
  });

  socket.on('putEmBack', // tells active player and passive player their respective roles
  function() {
    var tRX = userGuide[socket.id];
    var tR;
    var iffer = false;
    for (var i = 0; i < gameRooms.length; i++) {
      if (gameRooms[i].roomName == tRX) {
        iffer = true;
        tR = gameRooms[i];
        break;
      }
    }

    if(iffer) {
    if(tR.comTiles.length > 0){
      for (var i = 0; i<tR.comTiles.length; i++) {
        tR.comTiles[i].disp = true;
        tR.comTiles[i].x = tR.comTiles[i].snapx;
        tR.comTiles[i].y = tR.comTiles[i].snapy;
      }
    }

    if(tR.p1words.length > 0){
      for (var i = 0; i<tR.p1words.length; i++) {
        tR.p1words[i].disp = true;
        tR.p1words[i].x = tR.p1words[i].snapx;
        tR.p1words[i].y = tR.p1words[i].snapy;
      }
    }

    if(tR.p2words.length > 0){
      for (var i = 0; i<tR.p2words.length; i++) {
        tR.p2words[i].disp = true;
        tR.p2words[i].x = tR.p2words[i].snapx;
        tR.p2words[i].y = tR.p2words[i].snapy;
      }
    }
    tR.enuff = 0;
    tR.blockTiles = [];
    tR.bSWordTemp = 'x';
    tR.bSPointsTemp = 0;

    tR.placeWordTiles();
  }
  });

  socket.on('ready',
    function() {

      allReady ++;
        if (allReady == 2) {
          console.log("readying");
          if (pNum == 1) {
            socket.emit('readyp1', "x");
            allReady = 0;
            pNum = 2;
          } else if (pNum == 2) {
            socket.emit('readyp2', "x");
            allReady = 0;
            pNum = 1;
          }
        }
    });

    socket.on('drawTile',
    function() {

      var tRX = userGuide[socket.id];
      var tR;
      var picker = 0;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          if(gameRooms[i].p1 == socket.id) {
            picker = 1;
            gameRooms[i].aS = 2;
          } else {
            picker = 2;
            gameRooms[i].aS = 1;
          }
          tR = gameRooms[i];
          iffer = true;
          break;
        }
      }
      if (iffer) {
        var pickPkg = {
          picker : picker,
          tiles : tR.specTiles
        }
        io.in(tRX).emit('pickATile', pickPkg);
      // if(tR.specTiles.length>0) {
      //   console.log("got spectiles");
      //   io.in(tRX).emit('newTrans', "x");
      //   var tT = tR.specTiles[0];
      //   //specTiles[0].disp = false;
      //   tR.comTiles.unshift(tT);
      //   tR.buildTiles();
      //   //tR = buildTiles(tR);
      //   tR.specTiles.shift();
      //   console.log("sending a tile: " + tT.letter);
      //   //io.in(tR.roomName).emit('hereTile', tR.comTiles)
      // } else {
      //   io.in(tRX).emit('noMoreTiles', "x");
      // }
    } else {socket.emit('servErr', "x");}
    });

    socket.on('thisTile',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          tR = gameRooms[i];
          iffer = true;
          break;
        }
      }
      if (iffer) {

        tR.tilesLeft--;

        setTimeout(pickOver, 3000, tR);

        tR.comTiles.unshift(new LetterTile(tR.specTiles[data].letter, tR.specTiles[data].points, 0, 0, tR.specTiles[data].id));

        tR.specTiles[data].disp = false;

        io.in(tRX).emit('tilePicked', tR.specTiles[data].id);

    } else {socket.emit('servErr', "x");}
    });


    socket.on('imDone',
    function() {
      var tRX = userGuide[socket.id];
      var tR;
      var tRi;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          tR = gameRooms[i];
          tRi = i;
          iffer = true;
          break;
        }
      }
      if (iffer) {
      tR.passes++;
      if (tR.passes == 2) {
        var p1tot = 0;
        var p2tot = 0;
        for (var i = 0; i < tR.p1words.length; i++) {
          p1tot += tR.p1words[i].points;
        }
        for (var i = 0; i < tR.p2words.length; i++) {
          p2tot += tR.p2words[i].points;
        }

        var totPkg = {
          p1: p1tot,
          p2: p2tot,
          bS: tR.bSWord,
          bSP: tR.bSPoints,
          lW: tR.longest,
          bWW: tR.bestWord,
          bWP: tR.bestPoints
        };

        delete userGuide[tR.p1];
        delete userGuide[tR.p2];

        gameRooms.splice(tRi, 1);

        io.in(tR.roomName).emit('totScores', totPkg);
      }
    } else {socket.emit('servErr', "x");}
    });

    socket.on('sendWord', // next steps: write code for challenging, for abandoning word
    function() {

      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      if (iffer) {
      if(tR.enuff >= 2) {
      tR.arrangeWord();
    } else {
      socket.emit('notEnuff', "x");
    }
  } else {socket.emit('servErr', "x");}
    });

    socket.on('gameInfo', // next steps: write code for challenging, for abandoning word
    function(data) {

      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < brokenGames.length; i++) {
        if (brokenGames[i].roomName == tRX) {
          iffer = true;
          tR = brokenGames[i];
          break;
        }
      }
      if (iffer) {

      tR.gS = data.gS;
      tR.tS = data.tS;

      if (data.aS) {
        tR.aS = data.pn;
      } else {
        if (data.pn == 1) {
          tR.aS = 2;
        } else {
          tR.aS = 1;
        }
      }
    } else {socket.emit('servErr', "x");}
    });

    socket.on('grabbedTile',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      if(iffer) {
      tR.grabbed = true;
      tR.activeElement = data;
    } else {socket.emit('servErr', "x");}
      // console.log("Here's the tile you grabbed:");
      // console.log(data);
    });

    socket.on('grabbedWord',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      if(iffer) {
      tR.grabbed = true;
      tR.activeElement = data;
    } else {socket.emit('servErr', "x");}
      // console.log("Here's the word you grabbed:");
      // console.log(data);
    });
    //
    // socket.on('grabbedWord',
    // function(data) {
    //   grabbed = true;
    //   activeElement = data;
    //   console.log("Here's the word you grabbed:");
    //   console.log(data);
    // });

    socket.on('grabbedBT',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      if(iffer) {
      tR.grabbed = true;
      tR.activeElement = data;
    } else {socket.emit('servErr', "x");}
      // console.log("Here's the BT you grabbed:");
      // console.log(data);
    });

    socket.on('challengeWord',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      if(iffer) {
      socket.emit('okChallenge', "x");
      if(tR.p1 == socket.id) {
        io.to(tR.p2).emit('waitChallenge', "x");
      } else {
        io.to(tR.p1).emit('waitChallenge', "x");
      }
    } else {socket.emit('servErr', "x");}
    });


    socket.on('cWord',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      if(iffer) {
      // console.log("challenging word: " + data.word);
      if(bigDict.hasOwnProperty(data.word)) {
        tR.penaltySeq(data.pn);
      } else {
        if(data.pn == 1) {
          var tTile = tR.p2words[data.elt];
          tTile.vul = false;
          tR.p2words.splice(data.elt, 1);
          tR.p1words.push(tTile);
          tR.placeWordTiles();
        } else {
          var tTile = tR.p1words[data.elt];
          tTile.vul = false;
          tR.p1words.splice(data.elt, 1);
          tR.p2words.push(tTile);
          tR.placeWordTiles();
        }
      }
    } else {socket.emit('servErr', "x");}
    });

    socket.on('tWord',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      // console.log("taking word: " + data.word);
      if(iffer) {
        if(data.pn == 1) {
          var tTile = tR.p2words[data.elt];
          tR.p2words.splice(data.elt, 1);
          tR.p1words.push(tTile);
          tR.placeWordTiles();
        } else {
          var tTile = tR.p1words[data.elt];
          tR.p1words.splice(data.elt, 1);
          tR.p2words.push(tTile);
          tR.placeWordTiles();
        }
      } else {socket.emit('servErr', "x");}
    });

    socket.on('repairGame',
    function(data) {
      var tR;
      var pId = 0;
      var opN;
      for (var i = 0; i < brokenGames.length; i++) {
        if (brokenGames[i].roomName == data.rN) {
          if (brokenGames[i].p1friendly == data.uN) {
            userGuide[socket.id] = brokenGames[i].roomName;
            socket.join(brokenGames[i].roomName);
            opN = brokenGames[i].p2friendly;
            pId = 1;
            brokenGames[i].p1 = socket.id;
          } else if (brokenGames[i].p2friendly == data.uN) {
            userGuide[socket.id] = brokenGames[i].roomName;
            socket.join(brokenGames[i].roomName);
            opN = brokenGames[i].p1friendly;
            pId = 2;
            brokenGames[i].p2 = socket.id;
          }
            //the gameRoom is rejoined, send update package, tell other user that he's not on pause any more, and remove room from brokenGames
            var wbPkg = {
              coms: brokenGames[i].comTiles,
              blocks: brokenGames[i].blockTiles,
              p1s: brokenGames[i].p1words,
              p2s: brokenGames[i].p2words,
              gS: brokenGames[i].gS,
              tS: brokenGames[i].tS,
              aS: brokenGames[i].aS,
              pId: pId,
              opN: opN,
              tL: brokenGames[i].tilesLeft
            }

          socket.emit('returnToGame', wbPkg);

        if (brokenGames[i].p1 != "x" && brokenGames[i].p2 != "x") {
          console.log("rejoining active room");
          if (!(brokenGames[i] instanceof GameRoom)) {
            console.log("gameroomifying")
            gameRoomify(brokenGames[i]);
          } else {
          gameRooms.push(brokenGames[i]);
          }
          io.in(brokenGames[i].roomName).emit('unbreak', "x");
          brokenGames.splice(i, 1);
        } else {
          console.log("rejoining broken room");
          socket.emit('stayBroken', "x");
        }
          // else update the user but leave it paused as the room is still broken and inactive
          break;
        }
      }

    });

    socket.on('hereStuff',
    function(data) {
      var pId = 0;
      if (p1 == socket.id) {pId = 2;} else if (p2 == socket.id) {pId = 1;}
      var aS = !data.aS;
      var wbPkg = {
        coms: comTiles,
        blocks: blockTiles,
        p1s: p1words,
        p2s: p2words,
        gS: data.gS,
        tS: data.tS,
        aS: aS,
        pId: pId
      }
      socket.broadcast.emit('stuffForYou', wbPkg);
    });


    socket.on('dropLetter',
    function(data) {
      var tRX = userGuide[socket.id];
      var tR;
      var iffer = false;
      for (var i = 0; i < gameRooms.length; i++) {
        if (gameRooms[i].roomName == tRX) {
          iffer = true;
          tR = gameRooms[i];
          break;
        }
      }
      // console.log('dropLetter');
      if(iffer) {
      if (data.x < 150 || data.x > 1216 || data.y > 120) {
        if (tR.activeElement.type<4) {
      // console.log("snapping");
        var udPkg = {
          type: tR.activeElement.type,
          element: tR.activeElement.element,
          xpos: tR.activeElement.snapx,
          ypos: tR.activeElement.snapy
          }
          // console.log(udPkg);
          tR.activeElement = {};
        io.in(tR.roomName).emit('updateTile', udPkg);
      } else if (tR.activeElement.type == 4) {
        // console.log("snapping bt")
        var tElt = tR.activeElement.element;
        // console.log("tile: " + tR.blockTiles[tElt].id);
        if (tR.blockTiles[tElt].id == 0) {
          // console.log("can't break up word - snapping back");
          tR.blockTiles[tElt].x = tR.blockTiles[tElt].snapx;
          tR.blockTiles[tElt].y = tR.blockTiles[tElt].snapy;
          tR.placeBlockTiles();
        } else {
          tR.enuff--;
          for (var i = 0; i < tR.comTiles.length; i++) {
            if (tR.comTiles[i].id == tR.blockTiles[tElt].id) {
              // console.log("making visible: " + tR.comTiles[i].letter);
              tR.comTiles[i].disp = true;
              tR.comTiles[i].x = tR.comTiles[i].snapx;
              tR.comTiles[i].y = tR.comTiles[i].snapy;
            }
          }
          tR.blockTiles.splice(tElt, 1);
          tR.placeBlockTiles();
        }
      }
      } else {
        // console.log("moving to block");
        tR.moveToBlock(data, socket.id);
      }
    }
    });

    socket.on('disconnect', function() {
      for (var i = 0; i < waiters.length; i++) {
        if (waiters[i].name == socket.id) {
          waiters.splice(i, 1);
          socket.leave('waitingRoom');
          io.in('waitingRoom').emit('weWait', waiters);
        }
      }
      scrubUser(socket.id);
      // var tU;
      // for (var i = 0; i < users.length; i++) {
      //   if(users[i] = socket.id) {
      //     users.splice(i, 1);
      //   }
      // }
      // if (p1 == socket.id) {
      //   p1 = 0;
      //   lostPlayer = true;
      // }
      // if (p2 == socket.id) {
      //   p2 = 0;
      //   lostPlayer = true;
      // }
      // console.log("Client has disconnected");
    });
  }
);

console.log("My socket server is running, fool");

function gameRoomify(roomObj) {
  gameRooms.push(new GameRoom(roomObj.roomName, roomObj.p1, roomObj.p1friendly));
  // var q = gameRooms.length-1;
  // var keyObj = Object.keys(gameRooms[q]);
  //     console.log(gameRooms[q]);
  // for (var i = 0; i < keyObj.length; i++) {
  //   var tI = keyObj[i];
  //   gameRooms[q].tI = roomObj.tI
  //   console.log(keyObj[i]);
  //   //gameRooms[q].keyObj[i]
  // }
  var i = gameRooms.length - 1;
  gameRooms[i].roomName = roomObj.roomName;
  gameRooms[i].open = roomObj.open;
  gameRooms[i].p1 = roomObj.p1;
  gameRooms[i].p2 = roomObj.p2;
  gameRooms[i].specTiles = roomObj.specTiles;
  gameRooms[i].comTiles = roomObj.comTiles;
  gameRooms[i].blockTiles = roomObj.blockTiles;
  gameRooms[i].p1words = roomObj.p1words;
  gameRooms[i].p2words = roomObj.p2words;
  gameRooms[i].p1friendly = roomObj.p1friendly;
  gameRooms[i].p2friendly = roomObj.p2friendly;
  gameRooms[i].roomFriendly = roomObj.roomFriendly;
  gameRooms[i].occupants = roomObj.occupants;
  gameRooms[i].dragX = 0;
  gameRooms[i].dragY = 0;
  gameRooms[i].grabbed = roomObj.grabbed;
  gameRooms[i].activeElement = roomObj.activeElement;
  gameRooms[i].pNum = roomObj.pNum;
  gameRooms[i].enuff = roomObj.enuff;
  gameRooms[i].tComs = roomObj.tComs;
  gameRooms[i].tBlocks = roomObj.tBlocks;
  gameRooms[i].passes = 0;
  gameRooms[i].gS = roomObj.gS;
  gameRooms[i].tS = roomObj.tS;
  gameRooms[i].aS = roomObj.aS;
  gameRooms[i].brokenDate = roomObj.brokenDate;
}

function nameGen() {
  return Math.random().toString(36).substr(2, 6);
}

function charGen() {
  return Math.random().toString(36).substr(2, 1);
}

function penaltySeq(playNum) {
  io.emit('penSeq', playNum);
}

function scrubUser(user){

  var tRX = userGuide[user];
  if(tRX) {
  var tR;
  var tRi;
  var bGb = false;
  for (var i = 0; i < gameRooms.length; i++) {
    if (gameRooms[i].roomName == tRX) {
      tR = gameRooms[i];
      tRi = i;
      break;
    }
  }

if (brokenGames.length > 0) {
  for (var i = 0; i < brokenGames.length; i++) {
    if (brokenGames[i].roomName == tRX) {
      tR = brokenGames[i];
      tRi = i;
      bGb = true;
    }
  }
}

  delete userGuide[user];

  if(!bGb) {
  if(tR.p1 == user) {
    tR.p1 = "x";
  } else if (tR.p2 == user) {
    tR.p2 = "x";
  }
  var tTime = datetime.create();

  tR.brokenDate = tTime.now();
  console.log("broken at: " + tR.brokenDate);
  brokenGames.push(tR);
  var joint = " & ";
  var friendMaker = tR.p1friendly.concat(joint, tR.p2friendly);
  tR.roomFriendly = friendMaker;
  gameRooms.splice(tRi, 1);
  // console.log("broke game: " + tR.roomFriendly);
  io.in(tR.roomName).emit("brokenGame", "x");
} else {
  // console.log("broke twice!");
  // console.log("users: " + Object.keys(userGuide).length);
  if(tR.p1 == user) {
    tR.p1 = "x";
  } else if (tR.p2 == user) {
    tR.p2 = "x";
  }
}
  }

}

function kickOffGame(gameRm) {
  // console.log('kicking off game for ' + gameRm.roomName);
  userGuide[gameRm.p1] = gameRm.roomName;
  userGuide[gameRm.p2] = gameRm.roomName;
  for(var i = 0; i < gameRooms.length; i++) {
    // console.log("Room " + i + " is named " + gameRooms[i].roomName + " and contains " + gameRooms[i].p1friendly + " and " + gameRooms[i].p2friendly);
  }
  // console.log(userGuide);
  gameRm.gS = 2;
  gameRm.tS = 1;
  gameRm.aS = 1;
  var tTime = datetime.create();
  gameRm.brokenDate = tTime.now();
  io.in(gameRm.roomName).emit('afoot', gameRm);
}

function arrangeWord() {
  var blockWord;
  var blockLetters = [];
  var blockVal = 0;
  for (var i = 0; i < blockTiles.length; i++) {
    blockLetters.push(blockTiles[i].letter);
    blockVal += blockTiles[i].points;
  }

  blockWord = blockLetters.join('');

  blockPkg = {word: blockWord, valu: blockVal};

  makeWord(blockPkg);
}

function moveToBlock(data) {
  if(activeElement.type == 2 || activeElement.type == 3) {
    enuff++;
    wordToBlock(activeElement.type, activeElement.element, data);
  } else if (activeElement.type == 1) {
    enuff++;
    tileToBlock(activeElement.element, data);
  } else if (activeElement.type == 4) {
    moveBlockTile(data);
  }
}

function moveBlockTile(data) {
  var snip = activeElement.element;
  var tempT = blockTiles[snip];
  // console.log("placing tile: " + tempT);
  var tempBt = blockTiles;
  // console.log("blockTiles length:" + tempBt.length);

  blockTiles.splice(snip, 1);

  // console.log("removed element. new length: " + blockTiles.length);

  if (data.x < blockTiles[0].x) {
    blockTiles.unshift(tempT);
  } else if (data.x > blockTiles[blockTiles.length-1].x) {
    blockTiles.push(tempT);
  } else {
    // console.log("i am here")
    var buildBt = [];
    for(var i = 0; i< blockTiles.length; i++) {
      buildBt.push(blockTiles[i]);
    }
    // console.log ("working length: " + blockTiles.length);
    // console.log ("buildBt working length: " + buildBt.length);
  for(var i = 0; i < blockTiles.length-1; i++) {
    if (data.x >= blockTiles[i].x && data.x < blockTiles[i+1].x){
      buildBt.splice(i+1, 0, tempT);
    }
  }

      // console.log ("inserted elt. new buildBt working length: " + buildBt.length);
      // console.log ("blocktiles working length: " + blockTiles.length);
  blockTiles = buildBt;

        console.log ("blocktiles new working length: " + blockTiles.length);
 }
 placeBlockTiles();
}


function wordToBlock(type, index, data) {
  // console.log('word to block');
  var pushingLetters = [];
  var pushingTiles = [];
  var addWord;
  if(type == 2) {
    p1words[index].x = data.x;
    p1words[index].disp = false;
    addWord = p1words[index].word;
    pushingLetters = p1words[index].word.split('');
  } else if (type == 3) {
    p2words[index].x = data.x;
    p2words[index].disp = false;
    addWord = p1words[index].word;
    pushingLetters = p2words[index].word.split('');
  }

  for (var i = 0; i < pushingLetters.length; i++) {
    var tLet = pushingLetters[i];
    pushingTiles.push(new LetterTile(tLet, valCat[tLet], 0, 0, 0));
  }

  // console.log('placing word tiles on block');
  if (blockTiles.length == 0) {
    blockTiles = pushingTiles;
    placeBlockTiles();
  } else {
    if(data.x <= blockTiles[0].x) {
      var tempBlock = pushingTiles.concat(blockTiles);
      blockTiles = tempBlock;
      placeBlockTiles();
    } else if (data.x > blockTiles[blockTiles.length-1].x) {
      var tempBlock = blockTiles.concat(pushingTiles);
      blockTiles = tempBlock;
      placeBlockTiles();
    } else {

      var newBT = [];
    for (var i = 1; i < blockTiles.length; i++) {
      if (data.x > blockTiles[i-1].x && data.x < blockTiles[i].x) {
        // console.log ('splitting tiles');
        var arr1 = blockTiles.slice(0, i);
        var arr2 = blockTiles.slice(i, blockTiles.length);
        newBT = arr1.concat(pushingTiles, arr2);
      } //this is where i am... it almost works
        }
        blockTiles = newBT;
        // console.log('tile between tiles');
        placeBlockTiles();
    }
  }
}

function tileToBlock(index, data) {
  comTiles[index].x = data.x;
  // console.log('placing tile on block: ' + comTiles[index].id);
  if (blockTiles.length == 0) {
    blockTiles.push(comTiles[index]);
    comTiles[index].disp = false;
    // console.log('first tile placed');
    placeBlockTiles();
  } else {
    if(comTiles[index].x < blockTiles[0].x) {
      // console.log("dropping tile at X: " + comTiles[index].x + " against blockTile at " + blockTiles[0].x);
      blockTiles.splice(0, 0, comTiles[index]);
      comTiles[index].disp = false;
      // console.log('placing new tile at beginning');
      placeBlockTiles();
    } else if (comTiles[index].x > blockTiles[blockTiles.length-1].x) {
      // console.log("dropping tile at X: " + comTiles[index].x + " against blockTile at " + blockTiles[0].x);
      blockTiles.push(comTiles[index]);
      comTiles[index].disp = false;
      // console.log('new tile at end');
      placeBlockTiles();
    } else {
    for (var i = 0; i < blockTiles.length-1; i++) {
      if (comTiles[index].x > blockTiles[i].x && comTiles[index].x < blockTiles[i+1].x) {
        blockTiles.splice(i+1, 0, comTiles[index]);
      comTiles[index].disp = false;
        }
      }
      // console.log('tile between tiles');
      placeBlockTiles();
    }
  }
}

function pickOver(tR) {
  var isDone = true;

  for (var i = 0; i < tR.specTiles.length; i++) {
    if (tR.specTiles[i].disp) {
      isDone = false;
      break;
    }
  }

  if(!isDone) {
    console.log("got spectiles");
    tR.buildTiles();

  } else {
    tR.buildTiles();
    io.in(tR.roomName).emit('noMoreTiles', "x");
  }
}

function manageTiles() {
    var udPkg = {
      type: activeElement.type,
      element: activeElement.element,
      xpos: dragX,
      ypos: dragY
      }
      // console.log("x is now " + udPkg.xpos);
    io.emit('updateTile', udPkg);
}

function makeWord(data) {
  enuff = 0;
  var tWord = new WordTile(data.word, data.valu);
  tWord.breadth = tWord.word.length;
  if (pNum == 1) {
    p1words.push(tWord);
  } else {
    p2words.push(tWord);
  }
  placeWordTiles();
}

function placeWordTiles() {

  if(p1words.length > 0) {
    var tempP1 = [];
    for (var i = 0; i < p1words.length; i++){
      if (p1words[i].disp) {
        tempP1.push(p1words[i]);
      }
    }
    p1words = tempP1; // gets rid of dead words
    var lCounter = 0;
    var lC2 = 0;
    for (var i = 0; i < p1words.length; i++){
      var wordBreadth = p1words[i].breadth * 30;
      if (lCounter + wordBreadth >= 563) {
        lCounter = 0;
        lC2 += 50;
      }
      p1words[i].x = 20 + lCounter;
      p1words[i].y = lC2 + 164;
      lCounter += wordBreadth + 10;
    }
  }

  if(p2words.length > 0) {
    var tempP2 = [];
    for (var i = 0; i < p2words.length; i++){
      if (p2words[i].disp) {
        tempP2.push(p2words[i]);
      }
    }
    p2words = tempP2; // gets rid of dead words
    var lCounter = 0;
    var lC2 = 0;
    for (var i = 0; i < p2words.length; i++){
      var wordBreadth = p2words[i].breadth * 30;
      if (lCounter + wordBreadth >= 563) {
        lCounter = 0;
        lC2 += 50;
      }
      p2words[i].x = 1346 - lCounter - wordBreadth;
      p2words[i].y = lC2 + 164;
      lCounter += wordBreadth + 10;
    }
  }

  var tempComs = [];

  for (var i = 0; i < comTiles.length; i++) {
    if (comTiles[i].disp) {
      tempComs.push(comTiles[i]);
    }
  }

  comTiles = tempComs;

  if (comTiles.length > 0) {buildTiles();} //this is letting in some asynchronicity so a good place to start hunting gremlins...

  var udWordPkg = {p1: p1words, p2: p2words, coms: comTiles.length};

  blockTiles = [];

  io.emit('updateWords', udWordPkg);
}

function placeBlockTiles() {
  var wordLength = (blockTiles.length - 1) * 70;
  var startPlace = 683 - (wordLength/2);
  for(var i = 0; i < blockTiles.length; i++) {
    blockTiles[i].x = startPlace + i*70;
    blockTiles[i].y = 60;
    // console.log("tile " + i + " is " + blockTiles[i].letter + " at " + blockTiles[i].x);
  }
  grabbed = false;
  activeElement = {};
  sendLists();
}

function sendLists() {
  // console.log("sending lists. enuff: " + enuff);
  var listPkg = {
    coms: comTiles,
    blocks: blockTiles,
    p1s: p1words,
    p2s: p2words,
    enuff: enuff
  }
  io.emit('revLists', listPkg);
}

function dropTile() {

}

// function buildTTTiles(data) {
//
//   data.comTiles[0].x = 683;
//   data.comTiles[0].y = 200;
//   data.comTiles[0].xmin = data.comTiles[0].x - 30;
//   data.comTiles[0].xmax = data.comTiles[0].x + 30;
//   data.comTiles[0].ymin = data.comTiles[0].y - 40;
//   data.comTiles[0].ymax = data.comTiles[0].y + 40;
//   data.comTiles[0].snapx = data.comTiles[0].x;
//   data.comTiles[0].snapy = data.comTiles[0].y;
//
//   if (data.comTiles.length > 1) {
//   for (var i = 1; i < data.comTiles.length; i++) {
//     var ns = Math.floor((i-1)/2);
//     if (i % 2 == 0) {
//       data.comTiles[i].x = 733;
//     } else {
//       data.comTiles[i].x = 633;
//     }
//
//     data.comTiles[i].y = ns * 100 + 300;
//     data.comTiles[i].xmin = data.comTiles[i].x - 30;
//     data.comTiles[i].xmax = data.comTiles[i].x + 30;
//     data.comTiles[i].ymin = data.comTiles[i].y - 40;
//     data.comTiles[i].ymax = data.comTiles[i].y + 40;
//     data.comTiles[i].snapx = data.comTiles[i].x;
//     data.comTiles[i].snapy = data.comTiles[i].y;
//     }
//   }
//     return data;
// }

function getStarted(roomObj) {
  allTiles = shuffle(allTiles);

for (var i = 0; i < allTiles.length; i++) {
  var tX = (i % 14) * 70 + 228;
  var tY = (Math.floor(i / 14)) * 85 + 175;
  roomObj.specTiles.push(new LetterTile(allTiles[i][0], allTiles[i][1], tX, tY, i+1));
  }
}

function GameRoom(roomName, p1, p1friendly) {
  this.roomName = roomName;
  this.open = true;
  this.p1 = p1;
  this.p2 = 0;
  this.specTiles = [];
  this.comTiles = [];
  this.blockTiles = [];
  this.p1words = [];
  this.p2words = [];
  this.p1friendly = p1friendly;
  this.p2friendly = '';
  this.roomFriendly;
  this.occupants = 1;
  this.dragX = 0;
  this.dragY = 0;
  this.grabbed = false;
  this.activeElement = {};
  this.pNum = 0;
  this.enuff = 0;
  this.tComs;
  this.tBlocks;
  this.tP1s;
  this.tP2s;
  this.tEnuff;
  this.passes = 0;
  this.gS;
  this.tS;
  this.aS;
  this.brokenDate;
  this.bSWord = 'x';
  this.bSPoints = 0;
  this.bSWordTemp = 'x';
  this.bSPointsTemp = 0;
  this.longest = 'x';
  this.bestWord = 'x';
  this.bestPoints = 0;
  this.tilesLeft = 90;
}

  GameRoom.prototype.buildTiles = function() {
    console.log("building tiles for room " + this.roomName);
    if (this.comTiles.length > 0) {
    this.comTiles[0].x = 683;
    this.comTiles[0].y = 200;
    this.comTiles[0].xmin = this.comTiles[0].x - 30;
    this.comTiles[0].xmax = this.comTiles[0].x + 30;
    this.comTiles[0].ymin = this.comTiles[0].y - 40;
    this.comTiles[0].ymax = this.comTiles[0].y + 40;
    this.comTiles[0].snapx = this.comTiles[0].x;
    this.comTiles[0].snapy = this.comTiles[0].y;
  }

    if (this.comTiles.length > 1) {
    for (var i = 1; i < this.comTiles.length; i++) {
      var ns = Math.floor((i-1)/2);
      if (i % 2 == 0) {
        this.comTiles[i].x = 733;
      } else {
        this.comTiles[i].x = 633;
      }

      this.comTiles[i].y = ns * 100 + 300;
      this.comTiles[i].xmin = this.comTiles[i].x - 30;
      this.comTiles[i].xmax = this.comTiles[i].x + 30;
      this.comTiles[i].ymin = this.comTiles[i].y - 40;
      this.comTiles[i].ymax = this.comTiles[i].y + 40;
      this.comTiles[i].snapx = this.comTiles[i].x;
      this.comTiles[i].snapy = this.comTiles[i].y;
      }
    }

          var strName = this.roomName.toString();
          var htPkg = {tiles: this.comTiles, aS: this.aS}

          io.in(strName).emit('hereTile', htPkg);
  }

  GameRoom.prototype.manageTiles = function() {
    var udPkg = {
      type: this.activeElement.type,
      element: this.activeElement.element,
      xpos: this.dragX,
      ypos: this.dragY
      }
      // console.log("x is now " + udPkg.xpos);
    io.to(this.roomName).emit('updateTile', udPkg);
  }

  GameRoom.prototype.placeBlockTiles = function() {
    var wordLength = (this.blockTiles.length - 1) * 70;
    var startPlace = 683 - (wordLength/2);
    for(var i = 0; i < this.blockTiles.length; i++) {
      this.blockTiles[i].x = startPlace + i*70;
      this.blockTiles[i].y = 60;
    }
    this.grabbed = false;
    this.activeElement = {};
    this.sendLists();
  }

  GameRoom.prototype.sendLists = function() {
    var listPkg = {
      coms: this.comTiles,
      blocks: this.blockTiles,
      p1s: this.p1words,
      p2s: this.p2words,
      enuff: this.enuff
    }
    io.in(this.roomName).emit('revLists', listPkg);
  }

  GameRoom.prototype.moveToBlock = function(data, sId) {

    if(this.activeElement.type == 2 || this.activeElement.type == 3) {
      this.enuff++;
      this.wordToBlock(this.activeElement.type, this.activeElement.element, data, sId);
    } else if (this.activeElement.type == 1) {
      this.enuff++;
      this.tileToBlock(this.activeElement.element, data);
    } else if (this.activeElement.type == 4) {
      this.moveBlockTile(data);
    }
  }

  GameRoom.prototype.wordToBlock = function(type, index, data, sId) {
    // console.log('word to block');
    var pushingLetters = [];
    var pushingTiles = [];
    var addWord;
    var addVal = 0;
    var stealBool = false;
    if(type == 2) {
      this.p1words[index].x = data.x;
      this.p1words[index].disp = false;
      addWord = this.p1words[index].word;
      pushingLetters = this.p1words[index].word.split('');
      if(this.p1 != sId) {
        stealBool = true;
      }
    } else if (type == 3) {
      this.p2words[index].x = data.x;
      this.p2words[index].disp = false;
      addWord = this.p2words[index].word;
      pushingLetters = this.p2words[index].word.split('');
      if(this.p2 != sId) {
        stealBool = true;
      }
    }

    io.in(this.roomName).emit('initWord', addWord);

    for (var i = 0; i < pushingLetters.length; i++) {
      var tLet = pushingLetters[i];
      addVal += valCat[tLet];
      pushingTiles.push(new LetterTile(tLet, valCat[tLet], 0, 0, 0));
    }

    if (addVal > this.bSPoints && stealBool) {
      this.bSWordTemp = addWord;
      this.bSPointsTemp = addVal;
    }

    // console.log('placing word tiles on block');
    if (this.blockTiles.length == 0) {
      this.blockTiles = pushingTiles;
      this.placeBlockTiles();
    } else {
      if(data.x <= this.blockTiles[0].x) {
        var tempBlock = pushingTiles.concat(this.blockTiles);
        this.blockTiles = tempBlock;
        this.placeBlockTiles();
      } else if (data.x > this.blockTiles[this.blockTiles.length-1].x) {
        var tempBlock = this.blockTiles.concat(pushingTiles);
        this.blockTiles = tempBlock;
        this.placeBlockTiles();
      } else {

        var newBT = [];
      for (var i = 1; i < this.blockTiles.length; i++) {
        if (data.x > this.blockTiles[i-1].x && data.x < this.blockTiles[i].x) {
          // console.log ('splitting tiles');
          var arr1 = this.blockTiles.slice(0, i);
          var arr2 = this.blockTiles.slice(i, this.blockTiles.length);
          newBT = arr1.concat(pushingTiles, arr2);
        } //this is where i am... it almost works
          }
          this.blockTiles = newBT;
          // console.log('tile between tiles');
          this.placeBlockTiles();
      }
    }
  }

  GameRoom.prototype.tileToBlock = function(index,data) {
    this.comTiles[index].x = data.x;
    // console.log('placing tile on block: ' + this.comTiles[index].id);
    if (this.blockTiles.length == 0) {
      this.blockTiles.push(this.comTiles[index]);
      this.comTiles[index].disp = false;
      // console.log('first tile placed');
      this.placeBlockTiles();
    } else {
      if(this.comTiles[index].x < this.blockTiles[0].x) {
        // console.log("dropping tile at X: " + this.comTiles[index].x + " against blockTile at " + this.blockTiles[0].x);
        this.blockTiles.splice(0, 0, this.comTiles[index]);
        this.comTiles[index].disp = false;
        // console.log('placing new tile at beginning');
        this.placeBlockTiles();
      } else if (this.comTiles[index].x > this.blockTiles[this.blockTiles.length-1].x) {
        // console.log("dropping tile at X: " + this.comTiles[index].x + " against blockTile at " + this.blockTiles[0].x);
        this.blockTiles.push(this.comTiles[index]);
        this.comTiles[index].disp = false;
        // console.log('new tile at end');
        this.placeBlockTiles();
      } else {
      for (var i = 0; i < this.blockTiles.length-1; i++) {
        if (this.comTiles[index].x > this.blockTiles[i].x && this.comTiles[index].x < this.blockTiles[i+1].x) {
          this.blockTiles.splice(i+1, 0, this.comTiles[index]);
        this.comTiles[index].disp = false;
          }
        }
        // console.log('tile between tiles');
        this.placeBlockTiles();
      }
    }
  }

  GameRoom.prototype.moveBlockTile = function(data) {
    var snip = this.activeElement.element;
    var tempT = this.blockTiles[snip];
    // console.log("placing tile: " + tempT);
    var tempBt = this.blockTiles;
    // console.log("blockTiles length:" + tempBt.length);

    this.blockTiles.splice(snip, 1);

    // console.log("removed element. new length: " + this.blockTiles.length);

    if (data.x < this.blockTiles[0].x) {
      this.blockTiles.unshift(tempT);
    } else if (data.x > this.blockTiles[this.blockTiles.length-1].x) {
      this.blockTiles.push(tempT);
    } else {
      // console.log("i am here")
      var buildBt = [];
      for(var i = 0; i< this.blockTiles.length; i++) {
        buildBt.push(this.blockTiles[i]);
      }
      // console.log ("working length: " + this.blockTiles.length);
      // console.log ("buildBt working length: " + buildBt.length);
    for(var i = 0; i < this.blockTiles.length-1; i++) {
      if (data.x >= this.blockTiles[i].x && data.x < this.blockTiles[i+1].x){
        buildBt.splice(i+1, 0, tempT);
      }
    }

        // console.log ("inserted elt. new buildBt working length: " + buildBt.length);
        // console.log ("blocktiles working length: " + this.blockTiles.length);
    this.blockTiles = buildBt;

          // console.log ("blocktiles new working length: " + this.blockTiles.length);
   }
   this.placeBlockTiles();
  }

  GameRoom.prototype.arrangeWord = function() {
    var blockWord;//not done yet
    var blockLetters = [];
    var blockVal = 0;
    for (var i = 0; i < this.blockTiles.length; i++) {
      blockLetters.push(this.blockTiles[i].letter);
      blockVal += this.blockTiles[i].points;
    }

    blockWord = blockLetters.join('');

    blockPkg = {word: blockWord, valu: blockVal};

    this.makeWord(blockPkg);
  }

  GameRoom.prototype.makeWord = function(data) {
    this.enuff = 0;
    var tWord = new WordTile(data.word, data.valu);
    tWord.breadth = tWord.word.length;
    if (this.pNum == 1) {
      this.p1words.push(tWord);
    } else {
      this.p2words.push(tWord);
    }
    if(this.bSWordTemp != "x" && bigDict.hasOwnProperty(this.bSWordTemp)) {
      this.bSWord = this.bSWordTemp;
      this.bSPoints = this.bSPointsTemp;
      this.bSWordTemp = "x";
      this.bSPointsTemp = 0;
    }
    if(data.word.length > this.longest.length) {
      this.longest = data.word;
    }

    if(data.valu > this.bestPoints) {
      this.bestWord = data.word;
      this.bestPoints = data.valu;
    }

    this.placeWordTiles();
  }

  GameRoom.prototype.placeWordTiles = function() {
    if(this.p1words.length > 0) {
      var tempP1 = [];
      for (var i = 0; i < this.p1words.length; i++){
        if (this.p1words[i].disp) {
          tempP1.push(this.p1words[i]);
        }
      }
      this.p1words = tempP1; // gets rid of dead words
      var lCounter = 0;
      var lC2 = 0;
      for (var i = 0; i < this.p1words.length; i++){
        var wordBreadth = this.p1words[i].breadth * 45;
        if (lCounter + wordBreadth >= 560) {
          lCounter = 0;
          lC2 += 75;
        }
        this.p1words[i].x = 20 + lCounter;
        this.p1words[i].y = lC2 + 164;
        lCounter += wordBreadth + 10;
      }
    }

    if(this.p2words.length > 0) {
      var tempP2 = [];
      for (var i = 0; i < this.p2words.length; i++){
        if (this.p2words[i].disp) {
          tempP2.push(this.p2words[i]);
        }
      }
      this.p2words = tempP2; // gets rid of dead words
      var lCounter = 0;
      var lC2 = 0;
      for (var i = 0; i < this.p2words.length; i++){
        var wordBreadth = this.p2words[i].breadth * 45;
        if (lCounter + wordBreadth >= 560) {
          lCounter = 0;
          lC2 += 75;
        }
        this.p2words[i].x = 1346 - lCounter - wordBreadth;
        this.p2words[i].y = lC2 + 164;
        lCounter += wordBreadth + 10;
      }
    }

    var tempComs = [];

    for (var i = 0; i < this.comTiles.length; i++) {
      if (this.comTiles[i].disp) {
        tempComs.push(this.comTiles[i]);
      }
    }

    this.comTiles = tempComs;

    if (this.comTiles.length > 0) {this.buildTiles();} //this is letting in some asynchronicity so a good place to start hunting gremlins...

    var udWordPkg = {p1: this.p1words, p2: this.p2words, coms: this.comTiles.length, aS: this.aS};

    this.blockTiles = [];

    io.in(this.roomName).emit('updateWords', udWordPkg);
  }

  GameRoom.prototype.penaltySeq = function(data) {
    io.in(this.roomName).emit('penSeq', data);
  }


function WordTile(word, points) {
  this.word = word;
  this.points = points;
  this.x;
  this.y;
  this.snapx;
  this.snapy;
  this.disp = true;
  this.vul = true;
  this.breadth;
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

var shuffle = function (array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};
