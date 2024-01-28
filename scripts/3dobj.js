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
//Подготовка к отрисовке
clear();
drawGrid();

//Всякие нужные штуки
let selectedFile = null;
let verts = null;
let fills = null;
let mesh = null;
let deep = 0.1;

// перевод в 2д координаты с учётом перспективы
function to2dCoord(vert){
    let res = Array(2);
    res[0] = vert[0] * (1 + vert[2] * deep);
    res[1] = -vert[1] * (1 + vert[2] * deep);
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
                //drawVerts();
                mesh = getMesh();
                // mesh = triangulateMesh(mesh);
                updateBool = true;
                canvas.onclick = function(){updateBool=!updateBool;};
                // mesh = getMesh();
                // drawTriangleMesh(mesh);
            };
            reader.onerror = function() {
                console.log(reader.error);
            };
        }
    }
});


//Настройка анимации
let oldTime = null;
let newTime = null;
let rAF = null;
let updateBool = false;
rAF = requestAnimationFrame(loop);
function loop(){
    newTime = Date.now();
    if (newTime - oldTime > 100 && updateBool){
        update();
        oldTime = newTime;
    }
    rAF = requestAnimationFrame(loop);
}

function update(){
    mesh = rotateMesh(mesh, 10);
    drawFrame();
}

function drawFrame(){
    clear();
    drawGrid();
    drawTriangleMesh(mesh);
}

//Очистка
function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

//Отрисовка сетки
function drawGrid(){
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
}

//Получить нормаль к плоскости
function getNormal(v){
    // let v = 
    // [
    //     [1, 4, 0],
    //     [2, 0, 0],
    //     [0, 3, 1]
    // ];
    let res = Array(3);
    res[0] = (v[1][1]-v[0][1])*(v[2][2]-v[0][2])-(v[1][2]-v[0][2])*(v[2][1]-v[0][1])
    res[1] = (v[1][2]-v[0][2])*(v[2][0]-v[0][0])-(v[1][0]-v[0][0])*(v[2][2]-v[0][2])
    res[2] = (v[1][0]-v[0][0])*(v[2][1]-v[0][1])-(v[1][1]-v[0][1])*(v[2][0]-v[0][0])
    return(res)
}

//Получить глубину треугольника
function getDeep(v){
    // let v = 
    // [
    //     [1, 4, 0],
    //     [2, 0, 0],
    //     [0, 3, 1]
    // ];
    return (v[0][2]+v[1][2]+v[2][2])/3;
}

//Сравнить треугольники по глубине
function compareTrianglePlanesByDeep(a, b) {
    if (getDeep(a)<getDeep(b)) {
      return -1;
    }
    if (getDeep(a)>getDeep(b)) {
      return 1;
    }
    return 0;
}

//Триангулируем меш
function triangulateMesh(m){
    // let m = 
    // [
    //     [
    //         [1, 4, 0],
    //         [2, 0, 0],
    //         [0, 3, 1],
    //         [1, 1, 2]
    //     ]
    // ];
    let res = Array();
    m.forEach(p => {
        p.push(p[0]);
        for (let i=0;i<p.length-2;i+=2){
            let t = p.slice(i,i+3);
            res.push(t);
        }
        p.pop();
    });
    return res;
}

//Собрать меш из verts и fills
function getMesh(){
    let res = Array();
    fills.forEach(f => {
        let p = Array();
        f.forEach(vn => {
            p.push(verts[vn-1]);
        });
        res.push(p);
    });
    return res;
}

function normalizeVector(v){
    // let v = [1, 2, 3];
    // let s = 0;
    // v.forEach(e => {
    //     s += e;
    // });
    // let len = (v[0]**2+v[1]**2+v[2]**2)**0.5;
    let max = Math.max(Math.abs(v[0]),Math.abs(v[1]),Math.abs(v[2]));
    max = max>0?max:1;
    let res = Array();
    v.forEach(e => {
        res.push(e/max);
    });
    return res;
}

function getColorByNormal(v){
    let n = normalizeVector(v);
    return "rgb("+255*n[0]+", "+255*n[1]+", "+255*n[2]+")";
}

function drawTriangle(t){
    // let t = 
    // [
    //     [1, 1, 1],
    //     [-1, 1, 1],
    //     [-1, -1, 1]
    // ];
    let n = getNormal(t);
    if (n[2]>0){
        let c = getColorByNormal(n);
        let t2 = Array();
        t.forEach(e => {
            t2.push(to2dCoord(e));
        });
        ctx.fillStyle = c;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(s_width + t2[0][0] * mult, s_height + t2[0][1] * mult);
        for (let i=1;i<t2.length;i++){
            ctx.lineTo(s_width + t2[i][0] * mult, s_height + t2[i][1] * mult);
        }
        ctx.fill();
        ctx.stroke();
    }
}

function drawTriangleMesh(m){
    m.sort(compareTrianglePlanesByDeep);
    m.forEach(t => {
        drawTriangle(t);
    });
}

function rotateVert(v, a){
    //let v = [0,1,0];
    let v1 = Array(3);
    v1[0]=v[0]*Math.cos(a/180*Math.PI)-v[2]*Math.sin(a/180*Math.PI);
    v1[1]=v[1];
    v1[2]=v[0]*Math.sin(a/180*Math.PI)+v[2]*Math.cos(a/180*Math.PI);
    return v1;
}

function rotateMesh(m, a){
    let rm = Array();
    m.forEach(p => {
        let rp=Array();
        p.forEach(v => {
            rp.push(rotateVert(v, a));
        });
        rm.push(rp);
    });
    return rm;
}