import { MiniBall, resolveCollisions } from './engine.js';
import { getBallColorUS } from './data.js';

export class LottoUS {
    constructor(canvas, tray) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tray = tray;
        this.balls = [];
        this.isMixing = false;
        this.animationId = null;
    }

    init() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.balls = [];
        this.tray.innerHTML = '';
        
        // Add 69 white balls
        for (let i = 1; i <= 69; i++) {
            this.balls.push(new MiniBall(i, getBallColorUS(i, false)));
        }
        // Add 26 Powerballs (red) - actually in real Powerball they are in a separate machine, 
        // but for this sim we can put them together or just simulate the draw.
        // Let's keep it simple and just have 69 white balls in the machine, and draw the PB separately or add it.
        // Actually, let's put both but with different colors.
        for (let i = 1; i <= 26; i++) {
            this.balls.push(new MiniBall(i, getBallColorUS(i, true), { isPowerball: true }));
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

    async draw() {
        this.isMixing = true;
        document.querySelector('.machine-wrapper').classList.add('vibrating');
        
        await new Promise(r => setTimeout(r, 2000));

        // Draw 5 white balls (1-69)
        let whiteNumbers = [];
        let whitePool = Array.from({length: 69}, (_, i) => i + 1);
        for (let i = 0; i < 5; i++) {
            const idx = Math.floor(Math.random() * whitePool.length);
            whiteNumbers.push(whitePool.splice(idx, 1)[0]);
        }
        whiteNumbers.sort((a, b) => a - b);

        // Draw 1 Powerball (1-26)
        const powerball = Math.floor(Math.random() * 26) + 1;

        // Visual exit for white balls
        for (const num of whiteNumbers) {
            const ballObj = this.balls.find(b => b.num === num && !b.isPowerball);
            if (ballObj) ballObj.isExited = true;
            this.addBallToTray(num, false);
            await new Promise(r => setTimeout(r, 1200));
        }

        // Visual exit for Powerball
        const pbObj = this.balls.find(b => b.num === powerball && b.isPowerball);
        if (pbObj) pbObj.isExited = true;
        this.addBallToTray(powerball, true);

        this.isMixing = false;
        document.querySelector('.machine-wrapper').classList.remove('vibrating');
    }

    addBallToTray(num, isPowerball) {
        const ballHTML = document.createElement('div');
        ballHTML.className = 'ball' + (isPowerball ? ' powerball' : '');
        ballHTML.textContent = num;
        ballHTML.style.backgroundColor = getBallColorUS(num, isPowerball);
        if (isPowerball) ballHTML.style.color = 'white';
        else ballHTML.style.color = 'black';
        this.tray.appendChild(ballHTML);
    }
}
