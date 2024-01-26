let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext('2d');
    
let heightDed = 8 + 25,
    widthDed = 44;
canvas.height = window.innerHeight - heightDed;
canvas.width  = window.innerWidth - widthDed;
//Координаты серединки
let s_height = canvas.height / 2; 
let s_width = canvas.width / 2;
//Длина единичного отрезка
let mult = Math.min(s_height, s_width)/3; 
//Заливка фона
ctx.fillStyle = "white";
ctx.strokeStyle = "#A00";
ctx.fillRect(0, 0, canvas.width, canvas.height);

//Элементы интерфейса
let btn1 = document.getElementById("button1");
btn1.onclick=function(){mult += Math.min(s_height, s_width)/10; updateIfStopped();};
let btn2 = document.getElementById("button2");
btn2.onclick=function(){mult -= Math.min(s_height, s_width)/10; updateIfStopped();};
let btn3 = document.getElementById("button3");
btn3.onclick=function(){clear();if(!updateBool){i=0;update();}i=0;};
let btn4 = document.getElementById("button4");
btn4.onclick=function(){saveImage();};
let btn5 = document.getElementById("button5");
btn5.onclick=function(){hideBool = !hideBool; updateIfStopped();};
let btn6 = document.getElementById("button6");
btn6.onclick=function(){drawFull();updateIfStopped();};

let input1 = document.getElementsByName("input1")[0];
input1.onchange=function(){lineMult = radMult * input1.value; updateIfStopped();}
let input2 = document.getElementsByName("input2")[0];
input2.onchange=function(){let fullFlag=(i >= 360 * drawCircleCount + i_inc); radNumeratorF = input2.value; reRad(); updateIfStopped(); if(fullFlag){drawFull();updateIfStopped();}}
let input3 = document.getElementsByName("input3")[0];
input3.onchange=function(){let fullFlag=(i >= 360 * drawCircleCount + i_inc); radDenumeratorF = input3.value; reRad(); updateIfStopped(); if(fullFlag){drawFull();updateIfStopped();}}
let input4 = document.getElementsByName("input4")[0];
input4.onchange=function(){i_inc = +input4.value;}

let checkbox1 = document.getElementsByName("checkbox1")[0];
checkbox1.onchange=function(){hypoBool=!hypoBool; updateIfStopped();}

//Функции обновления
function reRad(){
    radGcd = gcd(radNumeratorF, radDenumeratorF);
    radNumerator = radNumeratorF / radGcd;
    radDenumerator = radDenumeratorF / radGcd;
    radMult = radNumerator/radDenumerator;
    lineMult = radMult * input1.value;
    rotateCount = 1/radMult;
    drawCircleCount = radNumerator;
}
function updateIfStopped(){
    if(!updateBool){i>0?i-=i_inc:null;update();}
}
function drawFull(){
    i = 360 * drawCircleCount + i_inc;
}
window.addEventListener('resize', function(event) {
    canvas.height = window.innerHeight - heightDed;
    canvas.width  = window.innerWidth - widthDed;
    s_height = canvas.height / 2; 
    s_width = canvas.width / 2;
    updateIfStopped();
}, true);

//Настройка анимации
let oldTime = null;
let newTime = null;
let rAF = null;
let updateBool = false;
let hideBool = false;
let hypoBool = false;
canvas.onclick = function(){updateBool=!updateBool;};
rAF = requestAnimationFrame(loop);
function loop(){
    newTime = Date.now();
    if (newTime - oldTime > 10 && updateBool){
        update();
        oldTime = newTime;
    }
    rAF = requestAnimationFrame(loop);
}

//Кадр анимации
let i = 0;
let i_inc = 1;
let radNumeratorF = 10,
    radDenumeratorF = 21;
let radGcd = gcd(radNumeratorF, radDenumeratorF);
let radNumerator = radNumeratorF / radGcd,
    radDenumerator = radDenumeratorF / radGcd;
let radMult = radNumerator/radDenumerator,
    lineMult = radMult * 1.5;
let rotateCount = 1/radMult;
let centerSize = 1/30;
let drawCircleCount = radNumerator;
update();
i = 0;
//обновление начальных значений из html-кода
input2.onchange();
input3.onchange();
input1.onchange();
function update(){
        clear();
        let x = Math.cos(i/180*Math.PI) * mult * (1 + (hypoBool?-radMult:radMult)),
            y = -Math.sin(i/180*Math.PI)* mult * (1 + (hypoBool?-radMult:radMult));
            x0 = Math.cos((hypoBool?-i:i)/180*Math.PI*(hypoBool?rotateCount-1:rotateCount+1)-Math.PI)* mult * lineMult,
            y0 = -Math.sin((hypoBool?-i:i)/180*Math.PI*(hypoBool?rotateCount-1:rotateCount+1)-Math.PI)* mult * lineMult;

        if (!hideBool){
        ctx.beginPath();
        ctx.strokeStyle = "#AAA";
        ctx.moveTo(s_width, 0);
        ctx.lineTo(s_width, canvas.height);
        ctx.moveTo(0, s_height);
        ctx.lineTo(canvas.width, s_height);
        ctx.stroke(); 

        ctx.beginPath();
        ctx.strokeStyle = "#000";
        drawCircle(0, 0, centerSize, 18);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        drawCircle(0, 0, 1, 9);
        ctx.stroke(); 

        ctx.beginPath();
        ctx.strokeStyle = "#F00";
        drawCircle(x, y, centerSize, 18);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        drawCircle(x, y, radMult, 9);
        ctx.moveTo(s_width + x, s_height + y);
        ctx.lineTo(s_width + x + x0, s_height + y + y0);
        ctx.stroke(); 

        ctx.beginPath();
        ctx.strokeStyle = "#A00";
        drawCircle(x + x0, y + y0, centerSize, 18);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        }
        else{
            ctx.beginPath();
            ctx.strokeStyle = "#A00";
        }
        //Рисуем улитку от 0 до i
        for (let i0=0; i0<Math.min(i + + i_inc, 360 * drawCircleCount + i_inc); i0++){
            x = Math.cos(i0/180*Math.PI) * mult * (1 + (hypoBool?-radMult:radMult)),
            y = -Math.sin(i0/180*Math.PI)* mult * (1 + (hypoBool?-radMult:radMult));
            x0 = Math.cos((hypoBool?-i0:i0)/180*Math.PI*(hypoBool?rotateCount-1:rotateCount+1)-Math.PI)* mult * lineMult,
            y0 = -Math.sin((hypoBool?-i0:i0)/180*Math.PI*(hypoBool?rotateCount-1:rotateCount+1)-Math.PI)* mult * lineMult;
            if (i0===0){
                ctx.moveTo(s_width + x + x0, s_height + y + y0);
            }
            else{
                ctx.lineTo(s_width + x + x0, s_height + y + y0);
            }
        }
        ctx.stroke(); 

        ctx.beginPath();
        ctx.strokeStyle = "#000";
        ctx.rect(0,0,canvas.width,canvas.height);
        ctx.stroke();

        i+=i_inc;
}

//Очистка поля
function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

//Сохранение изображения
function saveImage(){
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'CanvasAsImage.png');
    canvas.toBlob(function(blob) {
      let url = URL.createObjectURL(blob);
      downloadLink.setAttribute('href', url);
      downloadLink.click();
    });
}

//Отрисовка окружности
function drawCircle(x0, y0, r, t = 1){
    for (let i=0; i<360+t; i+=t){
        let x = Math.cos(i/180*Math.PI) * mult * r,
            y = -Math.sin(i/180*Math.PI) * mult * r;
        if (i===0){
            ctx.moveTo(s_width + x + x0, s_height + y + y0);
        }
        else{
            ctx.lineTo(s_width + x + x0, s_height + y + y0);
        }
    }
}

//НОД
function gcd(a, b){
    if (!b) {
        return a;
    }
    return gcd(b, a % b);
}