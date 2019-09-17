const FPS = 120; // frames per second
const FRICTION = 0.7; // Friction coefficent of pace ( 0 = no Friction, 1 = lots of friction )
const GAME_LIVES = 3; // Starting numbers of lives
const LASER_MAX = 10; // Maximum number of lasers on screen at once
const LASER_SPEED = 500; // Speed of lacers
const LASER_EXPLODE_DUR = 0.1; // Lasers duriation explotion
const LASER_DIST = 0.6; // Max distance laser can travel as fraction of  screen width
const ROIDS_NUM = 3; // starting number of asteorids
const ROID_JAG = 0.4; // Jaggedess of the astroids
const ROID_PTS_LGE = 20; // Points scored for a large astorid
const ROID_PTS_MED = 50; // Points scored for a medium astorid
const ROID_PTS_SML = 100; // Points scored for a small astorid
const ROID_SIZE = 100; // starting number of asteorids
const ROIDS_SPD = 50; // Max starting Speed of asteorids in pixels per second
const ROIDS_VERT = 10; // Average number of vertices of each astorids
const SHIP_EXPLODE_DUR = 0.3; // Ship duriation explotion
const SHIP_BLINK_DUR = 0.1; // Ship duriation of the ship blink during invisibility
const SAVE_KEY_SCORE = "highscore"; // Save key of local high score
const SHIP_INV_DUR = 3; // Duration of the ship invisibility in seconds
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // Acceletation of the ship
const TURN_SPEED = 360; // turn speed in degrees per sec
const TURN_BOUNDING = false; // Show or hide collision bounding
const SHOW_CENTRE_DOT = false; // Show the center dot of the ship
let SOUND_ON = true; // Turn the sound off
let MUSIC_ON = true; // Turn the Music off
const TEXT_FACE_TIME = 2.5; // text ade in time
const TEXT_SIZE = 40; // Text size
/** @type {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

// setup sound effects
var fxLaser = new sound("sounds/laser.m4a", 5, 0.1);
var fxHit = new sound("sounds/hit.m4a", 5);
var fxExplode = new sound("sounds/explode.m4a");
var fxThrust = new sound("sounds/thrust.m4a", 1, 0.2);

// set up the music
var music = new music("sounds/music-low.m4a", "sounds/music-high.m4a");
var roidsLeft, roidsTotal;
// set up the game parameters
var level, lives, score, scoreHigh, roids, ship, text, textAlpha;
newGame();

// set up event handler
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function CreateAsteroidBelt() {
  roids = [];
  roidsTotal = (ROIDS_NUM + level) * 7;
  roidsLeft = roidsTotal;
  var x, y;
  for (var i = 0; i < ROIDS_NUM + level; i++) {
    do {
      x = Math.floor(Math.random() * canv.width);
      y = Math.floor(Math.random() * canv.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
    roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 2)));
  }
}

function destroyAstroid(index) {
  var x = roids[index].x;
  var y = roids[index].y;
  var r = roids[index].r;

  // split the asteroid in two
  if (r == Math.ceil(ROID_SIZE / 2)) {
    roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
    roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
    score += ROID_PTS_LGE;
  } else if (r == Math.ceil(ROID_SIZE / 4)) {
    roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
    roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
    score += ROID_PTS_MED;
  } else {
    score += ROID_PTS_SML;
  }

  //check high score
  if (score > scoreHigh) {
    scoreHigh = score;
    localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
  }

  // destroy the astorid

  roids.splice(index, 1);
  fxHit.play();

  // calculate the ratio of the remining asteroid of determing music temp
  roidsLeft--;
  music.setAsteroidRation(roidsLeft == 0 ? 1 : roidsLeft / roidsTotal);

  // new level when no more asteroids
  if (roids.length == 0) {
    level++;
    newLevel();
  }
}

function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, colour = "white") {
  ctx.strokeStyle = colour;
  ctx.lineWidth = SHIP_SIZE / 20;
  ctx.beginPath();
  ctx.moveTo(
    // Nose of the ship
    x + (4 / 3) * ship.r * Math.cos(a),
    y - (4 / 3) * ship.r * Math.sin(a)
  );
  ctx.lineTo(
    // rear left
    x - ship.r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
    y + ship.r * ((2 / 3) * Math.sin(a) - Math.cos(a))
  );
  ctx.lineTo(
    // rear right
    x - ship.r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
    y + ship.r * ((2 / 3) * Math.sin(a) + Math.cos(a))
  );
  ctx.closePath();
  ctx.stroke();
}

// Set up game loop
setInterval(update, 1000 / FPS);

function explodeShip() {
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
  fxExplode.play();
}

function gameOver() {
  ship.dead = true;
  text = "Game over";
  textAlpha = 1.0;
}

function keyDown(/** @type {keyboardEvent}*/ ev) {
  if (ship.dead) {
    return;
  }
  switch (ev.keyCode) {
    case 32: // Space bar (Shoopt lacer)
      shootLaser();
      break;
    case 37: // left Arrow (rotate ship left)
      ship.rot = ((TURN_SPEED / 180) * Math.PI) / FPS;

      break;
    case 38: // up arrow (thrust the ship forward)
      ship.thrusting = true;
      break;
    case 39: // right arrow ( rotate ship right)
      ship.rot = ((-TURN_SPEED / 180) * Math.PI) / FPS;
      break;
  }
}

function keyUp(/** @type {keyboardEvent}*/ ev) {
  if (ship.dead) {
    return;
  }

  switch (ev.keyCode) {
    case 32: // Space bar (Allow shooting again)
      ship.canShoot = true;
      break;
    case 37: // left Arrow (Stop roating left)
      ship.rot = 0;
      break;
    case 38: // up arrow (up arrow)
      ship.thrusting = false;
      break;
    case 39: // right arrow ( stop rotating right)
      ship.rot = 0;
      break;
  }
}

function newAsteroid(x, y, r) {
  var lvlMult = 1 + 0.1 * level;
  var roid = {
    x: x,
    y: y,
    xv:
      ((Math.random() * ROIDS_SPD * lvlMult) / FPS) *
      (Math.random() < 0.5 ? 1 : -1),
    yv:
      ((Math.random() * ROIDS_SPD * lvlMult) / FPS) *
      (Math.random() < 0.5 ? 1 : -1),
    r: r,
    a: Math.random() * Math.PI * 2, // in Radius
    vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
    offs: []
  };

  for (var i = 0; i < roid.vert; i++) {
    roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
  }
  return roid;
}

function newGame() {
  level = 0;
  lives = GAME_LIVES;
  score = 0;
  ship = newShip();

  // get the high score from local storage
  var scoreStr = (scoreHigh = localStorage.getItem(SAVE_KEY_SCORE));
  if (scoreStr == null) {
    scoreHigh = 0;
  } else {
    scoreHigh = parseInt(scoreStr);
  }
  newLevel();
}

function newLevel() {
  text = "level " + (level + 1);
  textAlpha = 1.0;
  CreateAsteroidBelt();
}

// new ship
function newShip() {
  return {
    x: canv.width / 2,
    y: canv.height / 2,
    r: SHIP_SIZE / 2,
    a: (90 / 180) * Math.PI, // conver to radians
    blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
    blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
    canShoot: true,
    lasers: [],
    dead: false,
    explodeTime: 0,
    rot: 0,
    thrusting: false,
    thrust: {
      x: 0,
      y: 0
    }
  };
}

function shootLaser() {
  // create the laser object
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      // from the nose of the ship
      x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
      y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
      xv: (LASER_SPEED * Math.cos(ship.a)) / FPS,
      yv: (-LASER_SPEED * Math.sin(ship.a)) / FPS,
      dist: 0,
      explodeTime: 0
    });
    fxLaser.play();
  }
  // prevent furter shooting
  ship.canShoot = false;
}

function music(srcLow, srcHigh) {
  this.soundLow = new Audio(srcLow);
  this.soundhigh = new Audio(srcHigh);
  this.low = true;
  this.tempo = 1.0; // seconds per beat
  this.beatTime = 0; // frames left until next beat

  this.play = function() {
    if (MUSIC_ON) {
      if (this.low) {
        this.soundLow.play();
      } else {
        this.soundhigh.play();
      }
      this.low = !this.low;
    }
  };

  this.setAsteroidRation = function(ratio) {
    this.tempo = 1.0 - 0.75 * (1.0 - ratio);
  };

  this.tick = function() {
    if (this.beatTime == 0) {
      this.play();
      this.beatTime = Math.ceil(this.tempo * FPS);
    } else {
      this.beatTime--;
    }
  };
}

function sound(src, maxStreams = 1, vol = 1.0) {
  this.streamNum = 0;
  this.streams = [];
  for (var i = 0; i < maxStreams; i++) {
    this.streams.push(new Audio(src));
    this.streams[i].volume = vol;
  }

  this.play = function() {
    if (SOUND_ON) {
      this.streamNum = (this.streamNum + 1) % maxStreams;
      this.streams[this.streamNum].play();
    }
  };
  this.stop = function() {
    this.streams[this.streamNum].pause();
    this.streams[this.streamNum].currentTime = 0;
  };
}

function gameSounds() {
  if (SOUND_ON == true) {
    SOUND_ON = false;
    document.getElementById("sound").innerHTML = "Sound off";
  } else {
    SOUND_ON = true;
    document.getElementById("sound").innerHTML = "Sound on";
  }
}
function gameMusic() {
  if (MUSIC_ON == true) {
    MUSIC_ON = false;
    document.getElementById("music").innerHTML = "Music off";
  } else {
    MUSIC_ON = true;
    document.getElementById("music").innerHTML = "Music on";
  }
}

function update() {
  var exploding = ship.explodeTime > 0;
  var BlinkOn = ship.blinkNum % 2 == 0;

  // tick the music
  music.tick();
  // draw space
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canv.width, canv.height);

  // Thrust the ship
  if (ship.thrusting && !ship.dead) {
    ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FPS;
    ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FPS;
    fxThrust.play();
    // Draw the thruster
    if (!exploding && BlinkOn) {
      ctx.fillStyle = "red";
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = SHIP_SIZE / 10;
      ctx.beginPath();
      ctx.moveTo(
        // raer left
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineTo(
        // behind the ship
        ship.x - ship.r * ((6 / 3) * Math.cos(ship.a)),
        ship.y + ship.r * ((6 / 3) * Math.sin(ship.a))
      );
      ctx.lineTo(
        // rear right
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
    ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
    fxThrust.stop();
  }
  // Draw the triangular ship
  if (!exploding) {
    if (BlinkOn && !ship.dead) {
      drawShip(ship.x, ship.y, ship.a);
    }

    // handle Blinking
    if (ship.blinkNum > 0) {
      // reduce the blink time
      ship.blinkTime--;

      //reduce the blink num
      if (ship.blinkTime == 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
        ship.blinkNum--;
      }
    }
  } else {
    // draw the explosion
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  if (TURN_BOUNDING) {
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }
  // Draw the Asteroids

  ctx.lineWidth = SHIP_SIZE / 20;
  var x, y, r, a, vert, offs;
  for (var i = 0; i < roids.length; i++) {
    ctx.strokeStyle = "slategray";
    // get the asteroid propperti
    x = roids[i].x;
    y = roids[i].y;
    r = roids[i].r;
    a = roids[i].a;
    vert = roids[i].vert;
    offs = roids[i].offs;

    //draw a path
    ctx.beginPath();
    ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a));

    // draw the polygon
    for (var j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vert),
        y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vert)
      );
    }
    ctx.closePath();
    ctx.stroke();

    if (TURN_BOUNDING) {
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }
  // center dot
  if (SHOW_CENTRE_DOT) {
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  // Draw the lasers
  for (var i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime == 0) {
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 15,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    } else {
      ctx.fillStyle = "orangered";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.75,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.25,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    }
  }

  // draw the game text
  if (textAlpha >= 0) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255," + textAlpha + ")";
    ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(text, canv.width / 2, canv.height * 0.75);
    textAlpha -= 1.0 / TEXT_FACE_TIME / FPS;
  } else if (ship.dead) {
    newGame();
  }

  // draw the lives
  var lifeColour;
  for (var i = 0; i < lives; i++) {
    lifeColour = exploding && i == lives - 1 ? "red" : "white";
    drawShip(
      SHIP_SIZE + i * SHIP_SIZE * 1.2,
      SHIP_SIZE,
      0.5 * Math.PI,
      lifeColour
    );
  }

  // Draw the score
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = TEXT_SIZE + "px dejavu sans mono";
  ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);
  // Draw the High score
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = TEXT_SIZE * 0.75 + "px dejavu sans mono";
  ctx.fillText("BEST " + scoreHigh, canv.width / 2, SHIP_SIZE);

  // detect laser hits on asteroids
  var ax, ay, ar, lx, ly;
  for (var i = roids.length - 1; i >= 0; i--) {
    // grab the asteroid properties
    ax = roids[i].x;
    ay = roids[i].y;
    ar = roids[i].r;

    // loop over the lasers
    for (var j = ship.lasers.length - 1; j >= 0; j--) {
      // grab the laser prop
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;

      // detect hits
      if (
        ship.lasers[j].explodeTime == 0 &&
        distBetweenPoints(ax, ay, lx, ly) < ar
      ) {
        // remove the asteroid

        destroyAstroid(i);
        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
        break;
      }
    }
  }

  // Check for asteroid collision
  if (!exploding) {
    // only check when not blinking
    if (ship.blinkNum == 0 && !ship.dead) {
      for (var i = 0; i < roids.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) <
          ship.r + roids[i].r
        ) {
          explodeShip();
          destroyAstroid(i);
          break;
        }
      }
    }

    // Rotate the ship
    ship.a += ship.rot;
    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  } else {
    ship.explodeTime--;

    // reset the ship
    if (ship.explodeTime == 0) {
      lives--;
      if (lives == 0) {
        gameOver();
      } else {
        ship = newShip();
      }
    }
  }

  // handle edge of screen
  if (ship.x < 0 - ship.r) {
    ship.x = canv.width + ship.r;
  } else if (ship.x > canv.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = canv.height + ship.r;
  } else if (ship.y > canv.height + ship.r) {
    ship.y = 0 - ship.r;
  }

  //move the lasers
  for (var i = ship.lasers.length - 1; i >= 0; i--) {
    // check distance travlled
    if (ship.lasers[i].dist > LASER_DIST * canv.width) {
      ship.lasers.splice(i, 1);
      continue;
    }

    // handle the explosion
    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;

      // destry the laser after the duration is up
      if (ship.lasers[i].explodeTime == 0) {
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      // move the laser
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv;

      // calculate the distance travelled

      ship.lasers[i].dist += Math.sqrt(
        Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2)
      );
    }

    // handle edge of screen
    if (ship.lasers[i].x < 0) {
      ship.lasers[i].x = canv.width;
    } else if (ship.lasers[i].x > canv.width) {
      ship.lasers[i].x = 0;
    }
    // handle edge of screen
    if (ship.lasers[i].y < 0) {
      ship.lasers[i].y = canv.height;
    } else if (ship.lasers[i].y > canv.height) {
      ship.lasers[i].y = 0;
    }
  }

  // move the asteroid
  for (var i = 0; i < roids.length; i++) {
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;
    // handle edge of screen

    if (roids[i].x < 0 - roids[i].r) {
      roids[i].x = canv.width + roids[i].r;
    } else if (roids[i].x > canv.width + roids[i].r) {
      roids[i].x = 0 - roids[i].r;
    }

    if (roids[i].y < 0 - roids[i].r) {
      roids[i].y = canv.height + roids[i].r;
    } else if (roids[i].y > canv.height + roids[i].r) {
      roids[i].y = 0 - roids[i].r;
    }
  }
}
