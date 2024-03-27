//畫布預設設定
const canvasArea = document.getElementById("myCanvas");
const ctx = canvasArea.getContext("2d");
const canvasHeight = canvasArea.height;
const canvasWidth = canvasArea.width;
const unit = 50;
const row = canvasHeight / unit;
const column = canvasWidth / unit;

//初始宣告
let circle_x;
let circle_y;
let xSpeed;
let ySpeed;
let brickArray;
let brickCount;
let gameOver;
let countdownSec;
let stopIntervalId;
let radius = 20;
let ground_x = 100;
let ground_y = 500;
let ground_height = 5;

const start = document.querySelector(".start");
const countdown = document.querySelector(".countdown");

start.addEventListener("click", startGame);

//創建磚塊資料與方法
class Brick {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = unit;
    this.height = unit;
    this.visible = true;
    this.pickALocation();
  }
  drawBrick() {
    ctx.fillStyle = "gray";
    ctx.fillRect(this.x, this.y, unit, unit);
    ctx.strokeStyle = "white";
    ctx.strokeRect(this.x, this.y, unit, unit);
  }

  pickALocation() {
    let overlapping = false;
    do {
      this.x = Math.floor(Math.random() * column) * unit;
      this.y = Math.floor(Math.random() * row) * unit;
      overlapping = this.checkOverlap();
    } while (overlapping);
    brickArray.push(this);
  }

  checkOverlap() {
    for (let i = 0; i < brickArray.length; i++) {
      let checkBrick = brickArray[i];
      if (
        this.x < checkBrick.x + unit && //重疊到右邊
        this.x + unit > checkBrick.x && //重疊到左邊
        this.y < checkBrick.y + unit && //重疊到上面
        this.y + unit > checkBrick.y //重疊到下面
      ) {
        return true;
      }

      return false;
    }
  }

  touchingBall(circle_x, circle_y, radius) {
    return (
      circle_x >= this.x - radius &&
      circle_x <= this.x + this.width + radius &&
      circle_y >= this.y - radius &&
      circle_y <= this.y + this.height + radius
    );
  }
}

//事件監聽器使用滑鼠移動，左右滑動板子
canvasArea.addEventListener("mousemove", (e) => {
  ground_x = e.clientX;
});

//畫出背景
function defaultBackground() {
  ctx.fillStyle = "wheat";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

//遊戲的初始狀態
function defaultGameStates() {
  gameOver = false;
  circle_x = 160;
  circle_y = 60;
  xSpeed = 20;
  ySpeed = 20;
  countdownSec = 10;
  brickCount = 0;
  brickArray = [];
  for (let i = 0; i < 10; i++) {
    new Brick();
  }
}

//開始遊戲
function startGame() {
  clearInterval(stopIntervalId);
  defaultGameStates();
  drawBallAndBrick();
  startCountdown();
}

//生成球與磚塊
function drawBallAndBrick() {
  start.disabled = true;

  function drawCircle() {
    //確認球是否有碰到磚塊，碰到後磚塊消失、球變速
    brickArray.forEach((brick) => {
      if (brick.visible && brick.touchingBall(circle_x, circle_y, radius)) {
        brickCount++;
        brick.visible = false;
        //從磚塊下方撞擊
        if (circle_y >= brick.y + unit) {
          ySpeed *= -1;
        }
        //從磚塊上方撞擊
        else if (circle_y <= brick.y) {
          ySpeed *= -1;
        }
        //從磚塊左方撞擊
        else if (circle_x <= brick.x) {
          xSpeed *= -1;
        }
        //從磚塊右方撞擊
        else if (circle_x >= brick.x + unit) {
          xSpeed *= -1;
        }
      }
    });

    //確認球是否打到地板，改變y軸的方向，製造出回彈效果
    if (
      circle_x >= ground_x - radius &&
      circle_x <= ground_x + 100 + radius &&
      circle_y >= ground_y - radius &&
      circle_y <= ground_y + radius
    ) {
      if (ySpeed > 0) {
        circle_y -= 50;
        ySpeed *= -1;
      } else {
        circle_y += 50;
      }
      ySpeed *= -1;
    }

    //確認球有沒有打到邊界：球x座標大於（畫布寬度減去半徑）就是碰到畫布邊界了
    if (circle_x >= canvasWidth - radius) {
      xSpeed *= -1;
    }
    if (circle_x <= radius) {
      xSpeed *= -1;
    }
    if (circle_y >= canvasHeight - radius) {
      ySpeed *= -1;
    }
    if (circle_y <= radius) {
      ySpeed *= -1;
    }

    //製造出球“持續移動”
    circle_x += xSpeed;
    circle_y += ySpeed;

    //繪製背景
    defaultBackground();

    //畫出所有的方塊，在背景生成後，接續生成磚塊
    brickArray.forEach((brick) => {
      if (brick.visible) {
        brick.drawBrick();
      }
    });

    //如果遊戲狀態沒改變、畫出板子
    if (!gameOver) {
      ctx.fillStyle = "white";
      ctx.fillRect(ground_x, ground_y, 100, ground_height);

      //畫出圓球(x,y,radius,startAngle,endAngle)
      ctx.beginPath(); //開始新路徑
      ctx.arc(circle_x, circle_y, radius, 0, 2 * Math.PI); //畫出圓球
      ctx.stroke(); //繪製相連的點形成 路徑
      ctx.fillStyle = "lightgrey";
      ctx.fill(); //填充該路徑
    }
  }
  stopIntervalId = setInterval(drawCircle, 25);
}

function displayCountdown() {
  countdown.textContent = `剩餘時間：${countdownSec}秒`;
}
function startCountdown() {
  displayCountdown();
  let countdownPlayer = setInterval(() => {
    countdownSec -= 1;
    displayCountdown();
    start.disabled = true;
    if (countdownSec <= 0 || (countdownSec > 0 && brickCount == 10)) {
      clearInterval(countdownPlayer);
      checkGameOver();
    }
  }, 1000);
}

function checkGameOver() {
  clearInterval(stopIntervalId);
  if (brickCount == 10) {
    alert("挑戰成功");
  } else {
    alert("挑戰失敗");
  }
  gameOver = true;
  start.disabled = false;
  countdown.textContent = "";
  defaultBackground();
}
