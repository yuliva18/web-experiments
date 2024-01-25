let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext('2d');

let cellSize = 50;
let xSize = 11;
let ySize = 15;
canvas.height = ySize * cellSize;
canvas.width  = xSize * cellSize;
//Заливка фона
ctx.fillStyle = "orange";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let cur_x = 5;
let cur_y = 0;
let blocks = new Array(ySize);
for (let i=0;i<ySize;i++){
    blocks[i] = new Array(xSize);
    blocks[i].fill(0);
}
//Настройка отрисовки
let oldTime = null;
let newTime = null;
let rAF = null;
let updateBool = false;
rAF = requestAnimationFrame(loop);
function loop(){
    newTime = Date.now();
    if (newTime - oldTime > 10 && updateBool){
        update();
        oldTime = newTime;
    }
    rAF = requestAnimationFrame(loop);
}
let step = 0;
function update(){
    clear();
    //Умирать
    if (step===5){
        if (moveCurrent(0, 1)) null;
        else {
            blocks[cur_y][cur_x] = 1;
            if (createFigure(5, 0)) null;
            else {
                updateBool = false;
                console.log("lose");
                blocksClear();
                ctx.fillStyle = "orange";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                step = 0;
                return;
            }
        }
        step=0;
    }
    step++;
    //Рисовать
    ctx.fillStyle = "black";
    ctx.fillRect(cellSize * cur_x, cellSize * cur_y, cellSize, cellSize);
    ctx.fillStyle = "grey";
    for (let i=0;i<blocks.length;i++){
        for (let j=0;j<blocks[i].length;j++){
            if (blocks[i][j]===1) ctx.fillRect(cellSize * j, cellSize * i, cellSize, cellSize);
        }
    }
}

function moveCurrent(x, y){
    try {
        if (blocks[cur_y+y][cur_x+x]===0) {
            cur_y+=y;
            cur_x+=x;
            return true;
        }
    }
    catch{return false;}
}
function createFigure(x, y){
    if (blocks[y][x]!=1) {
        cur_y=y;
        cur_x=x;
        return true;
    }
    return false;
}
function blocksClear(){
    for (let i=0;i<ySize;i++){
        blocks[i].fill(0);
    }
}

//Обработка нажатий клавиш
window.addEventListener("keydown", (event) => {
    // console.log(event.key, event.keyCode);
    switch(event.keyCode){
        case 32: updateBool=!updateBool; break;
        case 83: if (updateBool) moveCurrent(0, 1); break;
        case 65: if (updateBool) moveCurrent(-1, 0); break;
        case 68: if (updateBool) moveCurrent(1, 0); break;
        default: break;
    }
    return;
});

//Очистка поля
function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}