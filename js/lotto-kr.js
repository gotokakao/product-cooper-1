import { MiniBall, resolveCollisions } from './engine.js';
import { LOTTO_HISTORY_KR, getBallColorKR } from './data.js';

export class LottoKR {
    constructor(canvas, tray, excludeCheckbox) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tray = tray;
        this.excludeCheckbox = excludeCheckbox;
        this.balls = [];
        this.isMixing = false;
        this.animationId = null;
    }

    init() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.balls = [];
        this.tray.innerHTML = '';
        for (let i = 1; i <= 45; i++) {
            this.balls.push(new MiniBall(i, getBallColorKR(i)));
        }
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        resolveCollisions(this.balls);
        this.balls.forEach(ball => {
            ball.update(this.isMixing);
            ball.draw(this.ctx);
        });
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    isPastWinner(selectedNums) {
        const sortedSelected = [...selectedNums].sort((a, b) => a - b);
        return LOTTO_HISTORY_KR.some(h => {
            const sortedHistory = [...h.nums].sort((a, b) => a - b);
            return sortedHistory.every((val, index) => val === sortedSelected[index]);
        });
    }

    async draw() {
        this.isMixing = true;
        document.querySelector('.machine-wrapper').classList.add('vibrating');
        
        await new Promise(r => setTimeout(r, 2000));

        let finalNumbers = [];
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            let tempNumbers = [];
            let pool = Array.from({length: 45}, (_, i) => i + 1);
            
            for (let i = 0; i < 6; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                tempNumbers.push(pool.splice(idx, 1)[0]);
            }

            if (!this.excludeCheckbox.checked || !this.isPastWinner(tempNumbers)) {
                finalNumbers = tempNumbers.sort((a, b) => a - b);
                break;
            }
            attempts++;
        }

        for (const num of finalNumbers) {
            const ballObj = this.balls.find(b => b.num === num);
            if (ballObj) ballObj.isExited = true;
            this.addBallToTray(num);
            await new Promise(r => setTimeout(r, 1200));
        }

        this.isMixing = false;
        document.querySelector('.machine-wrapper').classList.remove('vibrating');
    }

    addBallToTray(num) {
        const ballHTML = document.createElement('div');
        ballHTML.className = 'ball';
        ballHTML.textContent = num;
        ballHTML.style.backgroundColor = getBallColorKR(num);
        this.tray.appendChild(ballHTML);
    }
}
