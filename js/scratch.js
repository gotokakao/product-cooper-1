export class ScratchCard {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.scratchedPercent = 0;
        this.prize = "";
    }

    init() {
        this.container.innerHTML = `
            <div class="scratch-card-wrapper">
                <div class="scratch-prize" id="scratchPrize">?</div>
                <canvas id="scratchCanvas" width="300" height="150"></canvas>
            </div>
            <p class="scratch-hint">긁어서 당첨금을 확인하세요!</p>
            <button id="resetScratchBtn">새 카드 받기</button>
        `;

        this.canvas = document.getElementById('scratchCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.prizeElement = document.getElementById('scratchPrize');
        this.resetBtn = document.getElementById('resetScratchBtn');

        this.generatePrize();
        this.drawOverlay();
        this.addEventListeners();
        
        this.resetBtn.onclick = () => this.init();
    }

    generatePrize() {
        const prizes = ["1등: 50억", "2등: 1억", "3등: 1천만원", "다음 기회에...", "꽝", "5,000원"];
        const rand = Math.random();
        if (rand < 0.01) this.prize = prizes[0];
        else if (rand < 0.05) this.prize = prizes[1];
        else if (rand < 0.1) this.prize = prizes[2];
        else if (rand < 0.4) this.prize = prizes[5];
        else if (rand < 0.7) this.prize = prizes[3];
        else this.prize = prizes[4];
        
        this.prizeElement.textContent = this.prize;
    }

    drawOverlay() {
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add some "texture" to the scratch area
        this.ctx.fillStyle = '#A0A0A0';
        for(let i=0; i<100; i++) {
            this.ctx.fillRect(Math.random()*this.canvas.width, Math.random()*this.canvas.height, 2, 2);
        }
        
        this.ctx.font = "20px sans-serif";
        this.ctx.fillStyle = "#666";
        this.ctx.textAlign = "center";
        this.ctx.fillText("SCRATCH HERE", this.canvas.width/2, this.canvas.height/2 + 7);
    }

    addEventListeners() {
        const start = (e) => {
            this.isDrawing = true;
            this.scratch(e);
        };
        const move = (e) => {
            if (this.isDrawing) this.scratch(e);
        };
        const end = () => {
            this.isDrawing = false;
        };

        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', move);
        this.canvas.addEventListener('mouseup', end);
        this.canvas.addEventListener('mouseleave', end);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            move(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', end);
    }

    scratch(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
