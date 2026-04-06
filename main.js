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

        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        this.friction = 0.998; // 공기 저항 (매우 낮게)
        this.elasticity = 0.9;  // 반발 계수
        this.mass = 1;         // 질량
    }

    update() {
        if (this.isExited) return;

        const gravity = isMixing ? 0.05 : 0.25;
        this.vy += gravity;

        if (isMixing) {
            // 소용돌이 형태의 바람 힘 추가
            const dx = this.x - CENTER.x;
            const dy = this.y - CENTER.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 중심에서 멀어질수록 강한 무작위 힘 + 회전력
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

        // 벽 충돌 (돔 형태)
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
        
        // 공 그림자
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

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
        
        // 번호
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.num, this.x, this.y + 1);
        
        ctx.restore();
    }
}

// 공끼리의 충돌 처리
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
                // 충돌 각도 및 정규화된 벡터
                const angle = Math.atan2(dy, dx);
                const nx = dx / dist;
                const ny = dy / dist;

                // 상대 속도
                const vRelativeX = b1.vx - b2.vx;
                const vRelativeY = b1.vy - b2.vy;
                const vDotN = vRelativeX * nx + vRelativeY * ny;

                if (vDotN > 0) {
                    // 탄성 충돌 공식 적용
                    const impulse = (2 * vDotN) / (b1.mass + b2.mass);
                    b1.vx -= impulse * b2.mass * nx * b1.elasticity;
                    b1.vy -= impulse * b2.mass * ny * b1.elasticity;
                    b2.vx += impulse * b1.mass * nx * b2.elasticity;
                    b2.vy += impulse * b1.mass * ny * b2.elasticity;
                }

                // 끼임 방지 (위치 보정)
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
    
    // 충돌 해결 후 업데이트 및 그리기
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

async function startDrawing() {
    btn.disabled = true;
    btn.textContent = "추첨 중...";
    
    initSimulation();
    isMixing = true;
    
    // 기계 진동 효과 추가
    document.querySelector('.machine-wrapper').classList.add('vibrating');
    
    await new Promise(r => setTimeout(r, 2000));

    const availableNumbers = Array.from({length: 45}, (_, i) => i + 1);
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const selectedNum = availableNumbers.splice(randomIndex, 1)[0];
        
        const ballObj = balls.find(b => b.num === selectedNum);
        if (ballObj) ballObj.isExited = true;
        
        createTrayBall(selectedNum);
        await new Promise(r => setTimeout(r, 1500));
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

window.onload = initSimulation;
