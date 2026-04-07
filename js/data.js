// 실제 로또 당첨 데이터 (예시 - 실제 서비스 시 최신 데이터로 업데이트 필요)
export const LOTTO_HISTORY_KR = [
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
];

export function getBallColorKR(num) {
    if (num <= 10) return '#fbc400';
    if (num <= 20) return '#69c8f2';
    if (num <= 30) return '#ff7272';
    if (num <= 40) return '#aaaaaa';
    return '#b0d840';
}

export function getBallColorUS(num, isPowerball = false) {
    if (isPowerball) return '#ff1a1a'; // Powerball is usually red
    return '#ffffff'; // Powerball white balls are white
}
