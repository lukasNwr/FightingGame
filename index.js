const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: "./Assets/background.png",
});

const shop = new Sprite({
  position: { x: 650, y: 128 },
  imageSrc: "./Assets/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  color: "red",
  offset: { x: 0, y: 0 },
  imageSrc: "./Assets/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: { x: 215, y: 157 },
  sprites: {
    idle: {
      imageSrc: "./Assets/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./Assets/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./Assets/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./Assets/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./Assets/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./Assets/samuraiMack/Take hit.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./Assets/samuraiMack/Death.png",
      framesMax: 6,
    },
    death: {
      imageSrc: "./Assets/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: { x: 80, y: 40 },
    width: 180,
    height: 50,
  },
});

const enemy = new Fighter({
  position: { x: 400, y: 100 },
  velocity: { x: 0, y: 0 },
  color: "blue",
  offset: { x: -50, y: 0 },
  imageSrc: "./Assets/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: { x: 215, y: 170 },
  sprites: {
    idle: {
      imageSrc: "./Assets/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./Assets/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./Assets/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./Assets/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./Assets/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./Assets/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./Assets/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: { x: -170, y: 50 },
    width: 150,
    height: 50,
  },
});

console.log(player);

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  // Player movement
  player.velocity.x = 0;
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprites("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprites("run");
  } else {
    player.switchSprites("idle");
  }

  if (player.velocity.y < 0) {
    player.switchSprites("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprites("fall");
  }

  // Enemy movement
  enemy.velocity.x = 0;

  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprites("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprites("run");
  } else {
    enemy.switchSprites("idle");
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprites("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprites("fall");
  }

  // Detection of collision
  // Player
  if (
    rectCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    console.log("attack");
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }

  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // Enemy
  if (
    rectCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }

  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;

      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;

      case "w":
        player.velocity.y = -17;
        break;

      case "s":
        player.attack();
        break;
    }

    if (!enemy.dead) {
      switch (event.key) {
        case "ArrowLeft":
          keys.ArrowLeft.pressed = true;
          enemy.lastKey = "ArrowLeft";
          break;

        case "ArrowRight":
          keys.ArrowRight.pressed = true;
          enemy.lastKey = "ArrowRight";
          break;

        case "ArrowUp":
          enemy.velocity.y = -17;
          break;

        case "ArrowDown":
          enemy.attack();
          break;
      }
    }
  }
  //   console.log(event.key);
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;

    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;

    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
  }
});
