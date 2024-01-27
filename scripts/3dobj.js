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
ctx.fillRect(0, 0, canvas.width, canvas.height);

//сОси
ctx.beginPath();
ctx.strokeStyle = "#A00";
ctx.moveTo(0,s_height);
ctx.lineTo(canvas.width,s_height);
ctx.stroke();

ctx.beginPath();
ctx.strokeStyle = "#0A0";
ctx.moveTo(s_width,0);
ctx.lineTo(s_width,canvas.width);
ctx.stroke();

//Единичный квадрат
let sizeSq = 1;
ctx.beginPath();
ctx.strokeStyle = "#AAA";
ctx.moveTo(s_width - sizeSq * mult, s_height - sizeSq * mult);
ctx.lineTo(s_width - sizeSq * mult, s_height + sizeSq * mult);
ctx.lineTo(s_width + sizeSq * mult, s_height + sizeSq * mult);
ctx.lineTo(s_width + sizeSq * mult, s_height - sizeSq * mult);
ctx.lineTo(s_width - sizeSq * mult, s_height - sizeSq * mult);
ctx.stroke();

//Всякие нужные штуки
let selectedFile = null;
let verts = null;
let fills = null;
let deep = 0.1;

// перевод в 2д координаты с учётом перспективы
function to2dCoord(vert){
    let res = Array(2);
    res[0] = vert[0] * (1 + vert[1] * deep);
    res[1] = vert[2] * (1 + vert[1] * deep);
    return res;
}

// отрисовка вершин
function drawVerts(){
    ctx.fillStyle = "red";
    let sizeSq = 5;
    verts.forEach(v => {
        let v2d = to2dCoord(v);
        ctx.fillRect(s_width + v2d[0] * mult, s_height + v2d[1] * mult, sizeSq, sizeSq);
    });
}

// загрузка файла
document.querySelector('[type="file"]').addEventListener('change', (e) => {
    let files = e.target.files;
    const countFiles = files.length;
    if (countFiles) {
        selectedFile = files[0];
        if(selectedFile.name.slice(selectedFile.name.length-4, selectedFile.name.length) === ".obj"){
            let reader = new FileReader();
            reader.readAsText(selectedFile);
            reader.onload = function() {
                console.log(reader.result);
                verts = new Array();
                fills = new Array();
                let res_ar = reader.result.split("\n");
                res_ar.forEach(line => {
                    if (line.slice(0,2)=="v "){
                        let line_ar = line.split(" ").slice(1, 4);
                        let vert = new Array();
                        line_ar.forEach(el => {
                            vert.push(Number(el));
                        })
                        verts.push(vert);
                    }
                    else if (line.slice(0,2)=="f "){
                        let line_ar = line.split(" ")
                        line_ar = line_ar.slice(1,line_ar.length);
                        let fill = new Array();
                        line_ar.forEach(el => {
                            fill.push(Number(el));
                        })
                        fills.push(fill);
                    }
                });
            };
            reader.onerror = function() {
                console.log(reader.error);
            };
        }
    }
});
