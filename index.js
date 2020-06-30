function Mine(tr, td, mineNum) {
    this.tr = tr; //行数
    this.td = td; //列数
    this.mineNum = mineNum; //地雷数

    this.squares = []; //存储所有方块的信息 二维数组：行列的存储方式
    this.tds = []; //存储所有方块的DOM对象
    this.surplusMine = mineNum; //剩余地雷数
    this.allRight = false; //判断所有右键标记的方块是否为地雷

    this.parent = document.getElementsByClassName("gameBox")[0];
}

//创建游戏区域
Mine.prototype.createDom = function() {
    var self = this;
    var table = document.createElement("table");

    for (var i = 0; i < this.tr; i++) {
        var domTr = document.createElement("tr");
        this.tds[i] = [];
        for (j = 0; j < this.td; j++) {
            var domTd = document.createElement("td");

            domTd.pos = [i, j]; //将方块对应的行列存储到方块自身上
            //添加鼠标点击事件
            domTd.onmousedown = function() {
                self.play(event, this); //this -> domTd
            }

            this.tds[i][j] = domTd; //存储所有创建的方块的DOM对象

            // //为地雷添加对应的CSS样式
            // if (this.squares[i][j].type == "mine") {
            //     domTd.className = "mine";
            // }

            // if (this.squares[i][j].type == "number") {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd); //将列插入行中
        }
        table.appendChild(domTr); //将行和列插入table中
    }

    this.parent.innerHTML = ""; //清空游戏区域
    this.parent.appendChild(table); //渲染游戏区域
}

//生成n个不重复的数字
Mine.prototype.randomNum = function() {
    var square = new Array(this.tr * this.td); //创建空数组，长度为方块的总数
    var len = square.length;
    for (var i = 0; i < len; i++) {
        square[i] = i;
    }
    //将square乱序
    square.sort(function() {
            return 0.5 - Math.random();
        })
        // console.log(square);
    return square.slice(0, this.mineNum); //获取数组前mineNum项
}

//获取当前方块四周的其它方块
Mine.prototype.getAround = function(square) {
    var x = square.x;
    var y = square.y;
    var result = []; //存储当前方块四周的其它方块 二维数组

    // x-1,y-1  x,y-1  x+1,y-1
    // x-1,y    x,y    x+1,y
    // x-1,y+1  x,y+1  x+1,y+1

    //通过坐标的方式循环九宫格
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 || //左边界
                i > this.td - 1 || //右边界
                j < 0 || //上边界
                j > this.tr - 1 || //下边界
                (i == x && j == y) || //自身
                this.squares[j][i].type == "mine" //地雷 注意：行列方式是squares[j][i]
            ) {
                continue; //跳出循环
            }
            result.push([j, i]); //必须以行列的方式保存
        }
    }

    return result;
}

//更新所有的数字
Mine.prototype.updateNum = function() {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            //只需更新地雷四周方块的数字
            if (this.squares[i][j].type == "number") {
                continue; //跳出循环
            }

            var num = this.getAround(this.squares[i][j]); //获取地雷四周方块的信息
            var len = num.length;

            for (var k = 0; k < len; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}

//开始游戏
Mine.prototype.play = function(ev, obj) {
    self = this;

    //ev.which == 1：表示鼠标左键
    if (ev.which == 1 && obj.className != "flag") {
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eigth'];

        if (curSquare.type == "number") {
            var value = curSquare.value;

            obj.innerHTML = value;
            obj.className = cl[value];

            if (value == 0) {
                obj.innerHTML = "";

                //获取当前方块四周value值为0的方块
                function getAllZero(square) {
                    var around = self.getAround(square);
                    var len = around.length;

                    for (var i = 0; i < len; i++) {
                        var x = around[i][0]; //行
                        var y = around[i][1]; //列
                        self.tds[x][y].className = cl[self.squares[x][y].value];

                        if (self.squares[x][y].value == 0) {
                            //当前方块的value值为0，则继续获取当前方块四周的方块
                            if (!self.tds[x][y].check) {
                                self.tds[x][y].check = true; //标记当前的方块
                                getAllZero(self.squares[x][y]);
                            }
                        } else {
                            self.tds[x][y].innerHTML = self.squares[x][y].value;
                        }
                    }
                }

                getAllZero(curSquare);
            }
        } else {
            this.gameOver(obj); //游戏结束
        }
    }

    if (ev.which == 3) {
        //点击的方块为已显示的方块，并且未右键
        if (obj.className && obj.className != "flag") {
            return;
        }
        obj.className = obj.className == "flag" ? "" : "flag";

        if (this.squares[obj.pos[0]][obj.pos[1]].type == "mine") {
            this.allRight = true;
        } else {
            this.allRight = false;
        }

        if (obj.className == "flag") {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }

        //标记的小红旗数 = 地雷数
        if (this.surplusMine == 0) {
            if (this.allRight) {
                alert("恭喜，游戏成功！！！");
            } else {
                alert("游戏失败！！！");
                this.gameOver();
            }
        }
    }
}

//游戏结束
Mine.prototype.gameOver = function(clickTd) {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == "mine") {
                this.tds[i][j].className = "mine";
            }

            this.tds[i][j].onmousedown = null;
        }
    }

    if (clickTd) {
        clickTd.style.backgroundColor = "#f00";
    }
}

//初始化
Mine.prototype.init = function() {
    var rn = this.randomNum(); //获取地雷在方块在的随机位置
    var n = 0; //方块对应的索引

    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            // n++;
            //取方块在数组中的数据使用行列的方式，获取当前方块周围的方块使用坐标的方式
            //行列的方式与坐标的方式的x和y是正好相反的
            if (rn.indexOf(++n) != -1) {
                //indexOf()：返回指定字符在字符串中第一次出现处的索引，若不存在，则返回-1
                this.squares[i][j] = {
                    type: "mine", //表示当前位置为地雷
                    x: j, //行列与坐标的x和y是正好相反的
                    y: i
                };
            } else {
                this.squares[i][j] = {
                    type: "number",
                    x: j,
                    y: i,
                    value: 0 //默认数字，需要修改
                };
            }
        }
    }

    this.updateNum();
    this.createDom();

    //阻止鼠标右键的触发事件
    this.parent.oncontextmenu = function() {
        return false;
    }

    //剩余地雷数量
    this.mineNumDom = document.getElementsByClassName("mineNum")[0];
    this.mineNumDom.innerHTML = this.surplusMine;
}

//按钮功能
var btns = document.getElementsByTagName("button");
var len = btns.length;
var mine = null; //存储实例对象
var ln = 0; //已点击按钮的索引
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
]; //游戏难度级别

//let：具有闭包的效果
for (let i = 0; i < len - 1; i++) {
    btns[i].onclick = function() {
        btns[ln].className = "";
        this.className = "active";
        ln = i;

        //mine = new Mine(...arr[i]);  //ES6语法
        mine = new Mine(arr[i][0], arr[i][1], arr[i][1]);
        mine.init();
    }
}
btns[0].onclick(); //默认游戏难度

//重新开始按钮
btns[3].onclick = function() {
    mine.init();
}