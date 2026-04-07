export function updateTray(tray, numbers, colors) {
    tray.innerHTML = '';
    numbers.forEach((num, i) => {
        const ballHTML = document.createElement('div');
        ballHTML.className = 'ball';
        ballHTML.textContent = num;
        ballHTML.style.backgroundColor = colors[i] || '#ffffff';
        tray.appendChild(ballHTML);
    });
}

export function setButtonState(btn, state) {
    if (state === 'drawing') {
        btn.disabled = true;
        btn.textContent = "추첨 중...";
    } else {
        btn.disabled = false;
        btn.textContent = "추첨 시작!";
    }
}
