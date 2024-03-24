//抓取畫布元素、使用getContext渲染為2D畫布、宣告高與寬
const canvasArea = document.getElementById("myCanvas");
const ctx = canvasArea.getContext("2d");
const canvasHeight = canvasArea.height;
const canvasWidth = canvasArea.width;

//設定圓的x,y座標數字、半徑數字
let circle_x = 160;
let circle_y = 60;
let radius = 20;
//設定往x,y座標的速度
let xSpeed = 20;
let ySpeed = 20;
//設定板子的x,y座標，地板的高度
let ground_x = 100;
let ground_y = 500;
let ground_height = 5;
//設定磚塊的初始、磚塊次數
let brickArray = [];
let brickCount = 0;

class Brick {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    brickArray.push(this);
    this.visible = true;
  }
  drawBrick() {
    ctx.fillStyle = "gray";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
  //以磚塊為中心去看上下左右的球過來的座標
  //碰到球回傳true
  touchingBall(ballX, ballY) {
    return (
      ballX >= this.x - radius &&
      ballX <= this.x + this.width + radius &&
      ballY >= this.y - radius &&
      ballY <= this.y + this.height + radius
    );
  }

  pickALocation() {
    let overlapping = false;
    let newBrick_x;
    let newBrick_y;

    function checkOverlap(newBrick_x, newBrick_y) {
      for (let i = 0; i < brickArray.length; i++) {
        let checkBrick = brickArray[i];
        //從nowBrick磚塊的上下左右方位去看
        if (this === checkBrick) continue; //跳過自己
        if (
          this.x < checkBrick.x + checkBrick.width && //重疊到右邊
          this.x + this.width > checkBrick.x && //重疊到左邊
          this.y < checkBrick.y + checkBrick.height && //重疊到上面
          this.y + this.height > checkBrick.y //重疊到下面
        ) {
          //發現重疊;
          overlapping = true;
          return;
        }
      }
      overlapping = false;
    }
  }
}

function buildRandomBrick() {
  //創建一個介於min和max(不包含max)之間的隨機數
  //為什麼不包含max？因為Math.random生成是min~max的範圍的隨機小數，不包含max
  function getRandomArbitrary(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  //藉由new加上建構子函數去創建一個新的物件，將物件作為this傳遞給建構子涵數
  //製作所有的磚塊，這邊設定為10個隨機位置的磚塊
  for (let i = 0; i < 10; i++) {
    let newBrickX = getRandomArbitrary(0, 950 - 50 * 2);
    let newBrickY = getRandomArbitrary(0, 550 - 50 * 2);
    newBrickX += 50;
    newBrickY += 50;
    let newBrick = new Brick(newBrickX, newBrickY);
    do {
      let newBrickX = getRandomArbitrary(0, 950 - 50 * 2);
      let newBrickY = getRandomArbitrary(0, 550 - 50 * 2);
    } while (newBrick.pickALocation());
    newBrick = new Brick(newBrickX, newBrickY);
  }
}
buildRandomBrick();

//事件監聽器使用滑鼠移動，執行：瀏覽器窗口的x軸被賦值給板子的x座標
canvasArea.addEventListener("mousemove", (e) => {
  ground_x = e.clientX;
});

function defaultEnvironment() {
  //畫出燕麥色背景
  ctx.fillStyle = "wheat";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawCircle() {
  //確認球是否有打到磚塊
  brickArray.forEach((brick) => {
    //改變x,y方向速度，並且將brick從brickArray移除
    if (brick.visible && brick.touchingBall(circle_x, circle_y)) {
      brickCount++;
      brick.visible = false;

      //從磚塊下方撞擊
      if (circle_y >= brick.y + brick.height) {
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
      else if (circle_x >= brick.x + brick.width) {
        xSpeed *= -1;
      }

      if (brickCount == 10) {
        alert("Game Over!!");
        clearInterval(stopIntervalId);
      }
    }
  });
  //以地板為中心去看 上下左右
  //確認球是否打到地板，改變y軸的方向，製造出回彈效果
  //ground_x,ground_y的座標位置是在板子的左上方
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

  //製造出球“持續移動”且藉由上述條件會有反彈的效果
  circle_x += xSpeed;
  circle_y += ySpeed;

  //如果沒有將繪製背景函式放入，背景沒有被重新繪製，所以上一幀畫面的圓球還會顯示在螢幕上。
  defaultEnvironment();

  //畫出所有的方塊，在背景生成後，接續生成磚塊
  brickArray.forEach((brick) => {
    if (brick.visible) {
      brick.drawBrick();
    }
  });

  //畫出可控制的地板
  ctx.fillStyle = "white";
  ctx.fillRect(ground_x, ground_y, 100, ground_height);

  //畫出圓球(x,y,radius,startAngle,endAngle)
  //(圓心x座標,圓心y座標,半徑,開始角度,結束角度)
  //0*2 PI是360度
  ctx.beginPath(); //開始新路徑
  ctx.arc(circle_x, circle_y, radius, 0, 2 * Math.PI); //畫出圓球
  ctx.stroke(); //繪製相連的點形成 路徑
  ctx.fillStyle = "lightgrey";
  ctx.fill(); //填充該路徑
}

let stopIntervalId = setInterval(drawCircle, 25);
