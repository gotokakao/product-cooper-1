import { LottoKR } from './js/lotto-kr.js';
import { LottoUS } from './js/lotto-us.js';
import { ScratchCard } from './js/scratch.js';
import { LOTTO_HISTORY_KR, getBallColorKR } from './js/data.js';

const canvas = document.getElementById('simCanvas');
const tray = document.getElementById('resultTray');
const drawBtn = document.getElementById('drawBtn');
const historyBody = document.getElementById('historyBody');
const excludeCheckbox = document.getElementById('excludePastWinners');
const lottoContainer = document.getElementById('lotto-machine-container');
const scratchContainer = document.getElementById('scratch-container');
const tabButtons = document.querySelectorAll('.tab-btn');

let currentApp = null;
let currentTab = 'kr';

const apps = {
    kr: new LottoKR(canvas, tray, excludeCheckbox),
    us: new LottoUS(canvas, tray),
    scratch: new ScratchCard(scratchContainer)
};

async function handleDraw() {
    if (currentTab === 'scratch') return;
    
    drawBtn.disabled = true;
    drawBtn.textContent = "추첨 중...";
    
    await currentApp.draw();
    
    drawBtn.textContent = "다시 추첨하기";
    drawBtn.disabled = false;
}

function switchTab(tab) {
    currentTab = tab;
    
    // UI reset
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Clear previous app
    if (currentApp && currentApp.stop) currentApp.stop();
    
    if (tab === 'scratch') {
        lottoContainer.style.display = 'none';
        scratchContainer.style.display = 'block';
        
        currentApp = apps.scratch;
        currentApp.init();
    } else {
        lottoContainer.style.display = 'block';
        scratchContainer.style.display = 'none';
        
        // Options group is only for KR
        document.querySelector('.options-group').style.display = (tab === 'kr') ? 'block' : 'none';
        
        currentApp = apps[tab];
        currentApp.init();
        
        // Reset button state
        drawBtn.textContent = "추첨 시작!";
        drawBtn.disabled = false;
    }
}

// 이력 테이블 렌더링 (KR 기준)
function renderHistory() {
    if (!historyBody) return;
    historyBody.innerHTML = LOTTO_HISTORY_KR.map(h => `
        <tr>
            <td>${h.draw}회/td>
            <td>${h.date}</td>
            <td>
                <div class="history-balls">
                    ${h.nums.map(n => `<span class="h-ball" style="background:${getBallColorKR(n)}">${n}</span>`).join('')}
                </div>
            </td>
        </tr>
    `).join('');
}

window.startDrawing = handleDraw;

document.addEventListener('DOMContentLoaded', () => {
    tabButtons.forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });
    
    renderHistory();
    switchTab('kr');
});
