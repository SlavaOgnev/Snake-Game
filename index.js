let options={
    gridSize:10
};  

function init_Cells(setting){
    const options = setting || {
        gridSize: 10
    };
    const gameContanier = document.querySelector('.game_container');
    for (let y = 0; y < options.gridSize; y++){
        for (let x = 0; x < options.gridSize; x++){
            const cells = document.createElement('div');
            cells.classList.add('cell');
            cells.dataset.x = x;
            cells.dataset.y = y;
            gameContanier.appendChild(cells);
        }
    }
    console.log('Инициализация ячеек завершена');
}   

class Snake {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.body = [{ x: 2, y: 2 }, {x:1, y:2}];
        this.direction = 'right';
        this.newDirection = 'right';
        this.headDirection = 'right';
    }

    setDirection(newDirection) {
        const allowedDirection = {
            'up': ['right', 'left'],
            'down': ['right', 'left'],
            'right': ['up', 'down'],
            'left': ['up', 'down'],
        };
        if (allowedDirection[this.direction].includes(newDirection)) {
            this.newDirection = newDirection;
            this.headDirection = newDirection;
        }

    }

    move() {
        this.direction = this.newDirection;
        const head = this.body[0];
        let newHead;

        if (this.direction === 'right') {
            newHead = { x: (head.x + 1) % this.gridSize, y: head.y };
        } else if (this.direction === 'left') {
            newHead = { x: (head.x - 1 + this.gridSize) % this.gridSize, y: head.y };
        } else if (this.direction === 'up') {
            newHead = { x: head.x, y: (head.y - 1 + this.gridSize) % this.gridSize };
        } else if (this.direction === 'down') {
            newHead = { x: head.x, y: (head.y + 1) % this.gridSize };
        }

        if (this.body.some(section => section.x === newHead.x && section.y === newHead.y)) {
            throw new Error('Game Over');
        }

        this.body.unshift(newHead);
        if (!this.grow) {
            this.body.pop();
        } else {
            this.grow = false;
        }
    }

    growSnake() {
        this.grow = true;
    }
}

class Apple{
    constructor(gridSize, snake){
        this.snake = snake;
        this.gridSize = gridSize;
        this.position = this.randomPosition();
    }
    //функция для выбора позиции яблока с учетом положения змейки
    randomPosition() {
        let position;
        do {
          position = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
          };
        } while (this.snake.body.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
      }

    newApple(){
        this.position=this.randomPosition();
    }
}

class Game {
    constructor(gridSize) {
      this.gridSize = gridSize;
      this.snake = new Snake(gridSize);
      this.apple = new Apple(gridSize, this.snake);
      this.score = 0;
      
    }
    
    start() {
        this.interval = setInterval(() => {
          try {
            this.snake.move();
            this.checkAppleCollision();
            this.updateGrid();
          } catch (e) {
            alert(e.message);
            this.stop();
          }
        }, 450);

        document.addEventListener('keydown', (e) => {
            const directionMap = {
              'ArrowUp': 'up',
              'ArrowDown': 'down',
              'ArrowLeft': 'left',
              'ArrowRight': 'right'
            };
      
            if (directionMap[e.key]) {
              this.snake.setDirection(directionMap[e.key]);
            }
          });
    }
    checkAppleCollision() {
        const head = this.snake.body[0];
        if (head.x === this.apple.position.x && head.y === this.apple.position.y) {
          this.snake.growSnake();
          this.apple.newApple();
          this.score += 1;
          const scoreDiv = document.querySelector('.scoreNow');
          scoreDiv.innerHTML = `${this.score}`
        //   Обновление рекорда в localStorage
          const bestScore = localStorage.getItem('bestScore') || 0;
          if (this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
          }
        }
      }

    stop(){
        clearInterval(this.interval);
    }
    updateGrid(){
        document.querySelectorAll('.snake').forEach(cell => cell.classList.remove('snake'));
        document.querySelectorAll('.snake-head').forEach(cell => {
            cell.classList.remove('snake-head', 'right', 'left', 'up', 'down');
        });
        document.querySelectorAll('.apple').forEach(cell => cell.classList.remove('apple'));

        this.snake.body.forEach( (section, index)=>
            {if (index == 0){
                setHeadSnake(section.x, section.y, this.snake.headDirection)
            }else setSnakeCell(section.x, section.y)});
        setAppleCell(this.apple.position.x, this.apple.position.y);

    }
}

//фунуции для взаимподействия с сеткой
//получение клетки
function getCell (x,y){
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function setSnakeCell(x,y){
    const cell = getCell(x,y);
    if(cell){
        cell.classList.add('snake')
    }
}

function setHeadSnake (x,y, direction){
    const cell = getCell(x,y);
    if (cell){
        cell.classList.add('snake-head');
        cell.classList.add(direction);
    }
}


function setAppleCell (x,y){
    const cell = getCell(x,y);
    if(cell){
        cell.classList.add('apple')
    }
}


document.addEventListener('DOMContentLoaded', function  () {
    const options = {
        gridSize: 10
    };
    init_Cells(options);

    const score = document.querySelector('.score');
    if (localStorage.getItem('bestScore') != null) {
        score.innerHTML = localStorage.getItem('bestScore');
    }

    let game = new Game(options.gridSize);
    console.log('Игра начата');
    game.start();

    const clearRecord = document.querySelector('.clearRecord');
    if (clearRecord) {
        clearRecord.addEventListener('click', function () {
            localStorage.clear();
            score.innerHTML = 0;
        });
    } else {
        console.error("Element '.clearRecord' not found.");
    }

    const btnStop = document.querySelector('#stop');
    if (btnStop) {
        btnStop.addEventListener('click', () => {
            game.stop();
            console.log('Игра остановлена');
        });
    } else {
        console.error("Element '#stop' not found.");
    }

    const btnRestart = document.querySelector('#restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            game.stop();
            game = new Game(options.gridSize);
            const scoreDiv = document.querySelector('.scoreNow');
            scoreDiv.innerHTML = `0`
            if (localStorage.getItem('bestScore') != null) {
                score.innerHTML = localStorage.getItem('bestScore');
            }
            game.start();
            console.log('Игра перезапущена');
            
        });
    } else {
        console.error("Element '#restart' not found.");
    }
});
