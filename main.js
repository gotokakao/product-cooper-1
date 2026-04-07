const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const tray = document.getElementById('resultTray');
const btn = document.getElementById('drawBtn');
const historyBody = document.getElementById('historyBody');
const excludeCheckbox = document.getElementById('excludePastWinners');

const DOME_RADIUS = 140;
const CENTER = { x: DOME_RADIUS, y: DOME_RADIUS };
const BALL_RADIUS = 10;

// 실제 로또 당첨 데이터 (예시 - 실제 서비스 시 최신 데이터로 업데이트 필요)
// 구조: { draw: 회차, date: '날짜', nums: [1,2,3,4,5,6] }
const LOTTO_HISTORY = [
    { draw: 1115, date: '2024-04-13', nums: [7, 12, 23, 32, 34, 36] },
    { draw: 1114, date: '2024-04-06', nums: [10, 16, 19, 32, 33, 38] },
    { draw: 1113, date: '2024-03-30', nums: [11, 13, 20, 21, 32, 44] },
    { draw: 1112, date: '2024-03-23', nums: [16, 20, 26, 36, 42, 44] },
    { draw: 1111, date: '2024-03-16', nums: [3, 13, 30, 33, 43, 45] },
    { draw: 1110, date: '2024-03-09', nums: [3, 7, 11, 20, 22, 41] },
    { draw: 1109, date: '2024-03-02', nums: [10, 12, 13, 19, 33, 40] },
    { draw: 1108, date: '2024-02-24', nums: [7, 19, 31, 33, 38, 44] },
    { draw: 1107, date: '2024-02-17', nums: [6, 14, 30, 31, 40, 41] },
    { draw: 1106, date: '2024-02-10', nums: [1, 3, 4, 29, 42, 45] },
    // ... 더 많은 데이터를 추가할 수 있습니다.
];

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

        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        this.friction = 0.998;
        this.elasticity = 0.9;
        this.mass = 1;
    }

    update() {
        if (this.isExited) return;
        const gravity = isMixing ? 0.05 : 0.25;
        this.vy += gravity;

        if (isMixing) {
            const dx = this.x - CENTER.x;
            const dy = this.y - CENTER.y;
            this.vx += (Math.random() - 0.5) * 2 - (dy / 100);
            this.vy += (Math.random() - 0.5) * 2 + (dx / 100);
            
            const maxSpeed = 15;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
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
        ctx.save();
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
        ctx.fillStyle = "white";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.num, this.x, this.y + 1);
        ctx.restore();
    }
}

function resolveCollisions() {
    for (let i = 0; i < balls.length; i++) {
        if (balls[i].isExited) continue;
        for (let j = i + 1; j < balls.length; j++) {
            if (balls[j].isExited) continue;
            const b1 = balls[i];
            const b2 = balls[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;
            if (dist < minDist) {
                const nx = dx / dist;
                const ny = dy / dist;
                const vRelativeX = b1.vx - b2.vx;
                const vRelativeY = b1.vy - b2.vy;
                const vDotN = vRelativeX * nx + vRelativeY * ny;
                if (vDotN > 0) {
                    const impulse = (2 * vDotN) / (b1.mass + b2.mass);
                    b1.vx -= impulse * b2.mass * nx * b1.elasticity;
                    b1.vy -= impulse * b2.mass * ny * b1.elasticity;
                    b2.vx += impulse * b1.mass * nx * b2.elasticity;
                    b2.vy += impulse * b1.mass * ny * b2.elasticity;
                }
                const overlap = minDist - dist;
                b1.x -= nx * (overlap / 2);
                b1.y -= ny * (overlap / 2);
                b2.x += nx * (overlap / 2);
                b2.y += ny * (overlap / 2);
            }
        }
    }
}

function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resolveCollisions();
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

// 번호 조합이 과거 기록에 있는지 확인
function isPastWinner(selectedNums) {
    const sortedSelected = [...selectedNums].sort((a, b) => a - b);
    return LOTTO_HISTORY.some(h => {
        const sortedHistory = [...h.nums].sort((a, b) => a - b);
        return sortedHistory.every((val, index) => val === sortedSelected[index]);
    });
}

async function startDrawing() {
    btn.disabled = true;
    btn.textContent = "추첨 중...";
    initSimulation();
    isMixing = true;
    document.querySelector('.machine-wrapper').classList.add('vibrating');
    
    await new Promise(r => setTimeout(r, 2000));

    let finalNumbers = [];
    let attempts = 0;
    const maxAttempts = 100; // 무한 루프 방지

    while (attempts < maxAttempts) {
        let tempNumbers = [];
        let pool = Array.from({length: 45}, (_, i) => i + 1);
        
        for (let i = 0; i < 6; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            tempNumbers.push(pool.splice(idx, 1)[0]);
        }

        if (!excludeCheckbox.checked || !isPastWinner(tempNumbers)) {
            finalNumbers = tempNumbers;
            break;
        }
        attempts++;
        console.log("과거 당첨 조합 감지! 재추첨 중...");
    }

    // 시각적 연출을 위해 하나씩 표시
    for (const num of finalNumbers) {
        const ballObj = balls.find(b => b.num === num);
        if (ballObj) ballObj.isExited = true;
        createTrayBall(num);
        await new Promise(r => setTimeout(r, 1200));
    }

    isMixing = false;
    document.querySelector('.machine-wrapper').classList.remove('vibrating');
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

// 이력 테이블 렌더링
function renderHistory() {
    historyBody.innerHTML = LOTTO_HISTORY.map(h => `
        <tr>
            <td>${h.draw}회</td>
            <td>${h.date}</td>
            <td>
                <div class="history-balls">
                    ${h.nums.map(n => `<span class="h-ball" style="background:${getBallColor(n)}">${n}</span>`).join('')}
                </div>
            </td>
        </tr>
    `).join('');
}

window.onload = () => {
    initSimulation();
    renderHistory();
};
