const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const tray = document.getElementById('resultTray');
const btn = document.getElementById('drawBtn');

const DOME_RADIUS = 140;
const CENTER = { x: DOME_RADIUS, y: DOME_RADIUS };
const BALL_RADIUS = 10;

let balls = [];
let isMixing = false;
let animationId;

function getBallColor(num) {
    if (num <= 10) return '#fbc400';
    if (num <= 20) return '#69c8f2';
    if (num <= 30) return '#ff7272';
    if (num <= 40) return '#aaaaaa';
    return '#b0d840';
}

class MiniBall {
    constructor(num) {
        this.num = num;
        this.radius = BALL_RADIUS;
        this.color = getBallColor(num);
        this.isExited = false;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (DOME_RADIUS - BALL_RADIUS - 20);
        this.x = CENTER.x + Math.cos(angle) * dist;
        this.y = CENTER.y + Math.sin(angle) * dist;

        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        
        this.friction = 0.995;
        this.elasticity = 0.85;
    }

    update() {
        if (this.isExited) return;

        // 중력 적용 (섞기 중에는 약하게, 평소에는 정상적으로)
        const gravity = isMixing ? 0.1 : 0.2;
        this.vy += gravity;

        if (isMixing) {
            // 모든 방향으로 역동적인 무작위 힘 (강한 바람 효과)
            this.vx += (Math.random() - 0.5) * 4;
            this.vy += (Math.random() - 0.5) * 4;
            
            // 속도 제한 (너무 빠르면 벽을 뚫고 나감)
            const maxSpeed = 12;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        
        // 마찰력/공기저항 (속도가 점차 줄어들게 함)
        this.vx *= this.friction;
        this.vy *= this.friction;

        const dx = this.x - CENTER.x;
        const dy = this.y - CENTER.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > DOME_RADIUS - this.radius) {
            const nx = dx / dist;
            const ny = dy / dist;
            const vDotN = this.vx * nx + this.vy * ny;

            if (vDotN > 0) {
                this.vx -= (1 + this.elasticity) * vDotN * nx;
                this.vy -= (1 + this.elasticity) * vDotN * ny;
                const overlap = dist - (DOME_RADIUS - this.radius);
                this.x -= nx * overlap;
                this.y -= ny * overlap;
            }
        }
    }

    draw() {
        if (this.isExited) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
            this.x - this.radius*0.3, this.y - this.radius*0.3, this.radius*0.1,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, "white");
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, "rgba(0,0,0,0.3)");
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        
        ctx.fillStyle = "white";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.num, this.x, this.y + 1);
    }
}

function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
        ball.update();
        ball.draw();
    });
    animationId = requestAnimationFrame(animationLoop);
}

function initSimulation() {
    if (animationId) cancelAnimationFrame(animationId);
    balls = [];
    tray.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
        balls.push(new MiniBall(i));
    }
    animationLoop();
}

async function startDrawing() {
    btn.disabled = true;
    btn.textContent = "추첨 중...";
    
    initSimulation();
    isMixing = true;
    
    await new Promise(r => setTimeout(r, 1500));

    const availableNumbers = Array.from({length: 45}, (_, i) => i + 1);
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const selectedNum = availableNumbers.splice(randomIndex, 1)[0];
        
        const ballObj = balls.find(b => b.num === selectedNum);
        if (ballObj) ballObj.isExited = true;
        
        createTrayBall(selectedNum);
        await new Promise(r => setTimeout(r, 1200));
    }

    isMixing = false;
    btn.textContent = "다시 추첨하기";
    btn.disabled = false;
}

function createTrayBall(num) {
    const ballHTML = document.createElement('div');
    ballHTML.className = 'ball';
    ballHTML.textContent = num;
    ballHTML.style.backgroundColor = getBallColor(num);
    tray.appendChild(ballHTML);
}

window.onload = initSimulation;
