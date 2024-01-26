let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext('2d');
let xOffset = 10, yOffset = 18;
let xSize = 11;
let ySize = 17;
let cellSize = Math.min(Math.floor((window.innerWidth - xOffset)*0.4/xSize),Math.floor((window.innerHeight - yOffset)/ySize));
canvas.height = ySize * cellSize;
canvas.width  = xSize * cellSize;
let fontMult = 0.6;
let scoreTexts = document.getElementsByClassName("score_text");
resizeText();
window.addEventListener('resize', function(event) {
    cellSize = Math.min(Math.floor((window.innerWidth - xOffset)*0.4/xSize),Math.floor((window.innerHeight - yOffset)/ySize));
    canvas.height = ySize * cellSize;
    canvas.width  = xSize * cellSize;
    startBool?deadBool?drawDeadScreen():drawGame():drawStartScreen();
    startBool?deadBool?drawDeadScreen():drawGame():drawStartScreen();
    resizeText();
}, true);

//Начальный экран
let score = 0;
drawStartScreen();
showScore();

//Интерфейс
function resizeText(){
    for (let i=0;i<scoreTexts.length;i++){
        scoreTextLen = (scoreTexts[i].innerHTML).length;
        scoreTexts[i].setAttribute("style","font-size:" + Math.floor((window.innerWidth - xOffset)*0.8*fontMult/scoreTextLen) + "px;");
    }
}
function showScore(){
    for (let i=0;i<scoreTexts.length;i++){
        scoreTexts[i].innerHTML = "score: " + score;
    }
}

//Фигурки и цвета
let colors = [
    "#a32261","#7346ad","#434ca3","#46737d","#2a6637","#9c6410","#cb2b3b"
]
let allFigures = [
    [
        [1, 1],
        [1, 1],
    ],
    [
        [0,1,0],
        [1,1,1],
        [0,0,0]
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ]
]

let cur_x = 4;
let cur_y = 0;
let cur_figure_id = null;
let cur_figure = null;
let blocks = new Array(ySize);
for (let i=0;i<ySize;i++){
    blocks[i] = new Array(xSize);
    blocks[i].fill(0);
}
createFigure(cur_x, cur_y);
//Настройка отрисовки
let oldTime = null;
let newTime = null;
let rAF = null;
let updateBool = false;
let deadBool = false;
let startBool = false;
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
    if (deadBool){
        deadBool = false;
        blocksClear();
        score = 0;
        showScore();
        step = 0;
    }
    startBool = true;
    //Умирать
    if (step===25){
        if (moveCurrent(0, 1)) null;
        else {
            stopFigure();
            removeLines();
            cur_x = 4;
            cur_y = 0;
            if (createFigure(cur_x, cur_y)) null;
            else {
                updateBool = false;
                deadBool = true;
                drawDeadScreen();
                return;
            }
        }
        step=0;
    }
    step++;
    //Рисовать
    drawGame();
}
//Отрисовка она игры
function drawGame(){
    clear();
    ctx.fillStyle = cur_figure_id!==null?colors[cur_figure_id]:"black";
    for (let i=0;i<cur_figure.length;i++){
        for (let j=0;j<cur_figure[i].length;j++){
            if (cur_figure[i][j]===1) ctx.fillRect(cellSize * (cur_x + j), cellSize * (cur_y + i), cellSize, cellSize);
        }
    }
    ctx.fillStyle = "grey";
    ctx.strokeStyle="#252526";
    for (let i=0;i<blocks.length;i++){
        for (let j=0;j<blocks[i].length;j++){
            if (blocks[i][j]===1) ctx.fillRect(cellSize * j, cellSize * i, cellSize, cellSize);
            ctx.strokeRect(cellSize * j, cellSize * i, cellSize, cellSize);
        }
    }
}
//Отрисовка экрана проигрыша
function drawDeadScreen(){
    ctx.fillStyle = "orange";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    for (let i=0;i<blocks.length;i++){
        for (let j=0;j<blocks[i].length;j++){
            if (blocks[i][j]===1) ctx.fillRect(cellSize * j, cellSize * i, cellSize, cellSize);
        }
    }
    for (let i=0;i<cur_figure.length;i++){
        for (let j=0;j<cur_figure[i].length;j++){
            if (cur_figure[i][j]===1) ctx.fillRect(cellSize * (cur_x + j), cellSize * (cur_y + i), cellSize, cellSize);
        }
    }
    let fontSize = Math.floor((canvas.width - xOffset)*fontMult/5);
    ctx.font = fontSize + "px sans";
    ctx.fillStyle = "white";
    ctx.fillText("You lose :(", canvas.width/2-canvas.width/4, canvas.height/2);
}
//Отрисовка начального экрана
function drawStartScreen(){
    ctx.fillStyle = "orange";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
//Фигуру можно поставить
function figureIsReal(figure,x,y){
    for (let i=0;i<figure.length;i++){
        for (let j=0;j<figure[i].length;j++){
            if (figure[i][j]==1 && blocks[y+i]===undefined) return false;
            if (figure[i][j]==1 && (blocks[y+i][x+j]===1 || blocks[y+i][x+j]===undefined)) return false;
        }
    }
    return true;
}
//Сдвиг фигуры
function moveCurrent(x, y){
    if (figureIsReal(cur_figure, cur_x+x, cur_y+y)){
        cur_x+=x;
        cur_y+=y;
        return true;
    }
    return false;
}
//Появление фигуры
function createFigure(x, y){
    let figureIndex = Math.floor(Math.random() * allFigures.length);
    let figure = allFigures[figureIndex];
    if (figureIsReal(figure, x, y)){
        cur_figure = figure;
        cur_figure_id = figureIndex;
        return true;
    }
    return false;
}
//Полная остановка фигуры
function stopFigure(){
    for (let i=0;i<cur_figure.length;i++){
        for (let j=0;j<cur_figure[i].length;j++){
            if (cur_figure[i][j]==1) blocks[cur_y+i][cur_x+j]=1;
        }
    }
}
//Повород фигуры
function rotateFigure(right = true){
    let newFigure = new Array(cur_figure.length);
    for (let i=0;i<cur_figure.length;i++){
        newFigure[i] = new Array(cur_figure[i].length);
        newFigure[i].fill(0);
        if (right){
            for (let j=0;j<cur_figure[0].length;j++){
                newFigure[i][j]=cur_figure[j][cur_figure[0].length-i-1];
            }
        }
    }
    if (figureIsReal(newFigure,cur_x,cur_y))cur_figure = newFigure;
}
//Удаление заполненных строк
function removeLines(){
    let delCount = 0;
    for (let i=blocks.length-1;i>=0;i--){
        let doRemove = true;
        for (let j=0;j<blocks[i].length;j++){
            if(blocks[i][j]!=1)doRemove=false;
        }
        if (doRemove){
            blocks.splice(i, 1);
            blocks = [new Array(xSize)].concat(blocks);
            blocks[0].fill(0);
            delCount++;
            i++;
        }
    }
    if (delCount>=4){
        score+=100;
    }
    else{
        score+=delCount;
    }
    showScore();
}
//Очистка массива блоков
function blocksClear(){
    for (let i=0;i<ySize;i++){
        blocks[i].fill(0);
    }
}

//Обработка нажатий клавиш
window.addEventListener("keydown", (event) => {
    switch(event.keyCode){
        case 32: updateBool=!updateBool; break;
        case 83: if (updateBool) moveCurrent(0, 1); break;
        case 65: if (updateBool) moveCurrent(-1, 0); break;
        case 68: if (updateBool) moveCurrent(1, 0); break;
        case 87: if (updateBool) rotateFigure(); break;
        default: break;
    }
    return;
});

//Очистка поля
function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#252526";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}