let balance = 1000;
let isSpinning = false;


const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const rouletteOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const betAmountInput = document.getElementById('betAmount');
const betTypeSelect = document.getElementById('betType');
const betNumberInput = document.getElementById('betNumber');
const betColorSelect = document.getElementById('betColor');
const betEvenOddSelect = document.getElementById('betEvenOdd');
const balanceDisplay = document.getElementById('balance');
const resultDisplay = document.getElementById('result');
const numberBetDiv = document.getElementById('numberBet');
const colorBetDiv = document.getElementById('colorBet');
const evenOddBetDiv = document.getElementById('evenOddBet');

let rotationAngle = 0;


function drawRoulette() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 180;
  const sectorAngle = (2 * Math.PI) / 37;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotationAngle * Math.PI / 180);
  

  const outerGradient = ctx.createLinearGradient(0, -radius, 0, radius);
  outerGradient.addColorStop(0, '#1a1a1a');
  outerGradient.addColorStop(1, '#333333');
  ctx.beginPath();
  ctx.arc(0, 0, radius + 20, 0, 2 * Math.PI);
  ctx.fillStyle = outerGradient;
  ctx.fill();
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  

  for (let i = 0; i < 37; i++) {
    const startAngle = i * sectorAngle;
    const endAngle = (i + 1) * sectorAngle;
    const number = rouletteOrder[i];
    const isRed = redNumbers.includes(number);
    const isBlack = blackNumbers.includes(number);
    const color = number === 0 ? '#2ecc71' : (isRed ? '#e74c3c' : '#2c3e50');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();


    ctx.save();
    ctx.rotate(startAngle + sectorAngle / 2);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 0.5)';
    ctx.fillText(number.toString(), radius - 30, 0);
    ctx.restore();
  }

  const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
  innerGradient.addColorStop(0, '#ffffff');
  innerGradient.addColorStop(1, '#cccccc');
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, 2 * Math.PI);
  ctx.fillStyle = innerGradient;
  ctx.fill();

  ctx.restore();


  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.beginPath();
  ctx.moveTo(0, -radius - 20);
  ctx.lineTo(-10, -radius);
  ctx.lineTo(10, -radius);
  ctx.closePath();
  ctx.fillStyle = '#ff0000';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

drawRoulette();


betTypeSelect.addEventListener('change', () => {
  numberBetDiv.classList.add('hidden');
  colorBetDiv.classList.add('hidden');
  evenOddBetDiv.classList.add('hidden');
  if (betTypeSelect.value === 'number') numberBetDiv.classList.remove('hidden');
  if (betTypeSelect.value === 'color') colorBetDiv.classList.remove('hidden');
  if (betTypeSelect.value === 'evenOdd') evenOddBetDiv.classList.remove('hidden');
});

function getProbabilities() {
  const probs = localStorage.getItem('probabilities');
  const defaultProbs = Array(37).fill(100 / 37);
  
  if (!probs) {
    console.log("No probabilities found, resetting to default.");
    localStorage.setItem('probabilities', JSON.stringify(defaultProbs));
    return defaultProbs;
  }

  const parsedProbs = JSON.parse(probs);
  const sum = parsedProbs.reduce((a, b) => a + b, 0);
  
  if (Math.abs(sum - 100) > 0.01 || parsedProbs.length !== 37) {
    console.warn(`Sum of probabilities is not 100: ${sum}, or incorrect length: ${parsedProbs.length}. Resetting to default.`);
    localStorage.setItem('probabilities', JSON.stringify(defaultProbs));
    return defaultProbs;
  }

  const maxProb = Math.max(...parsedProbs);
  if (maxProb > 90) {
    console.warn(`One probability is too high (${maxProb}%). Resetting to default.`);
    localStorage.setItem('probabilities', JSON.stringify(defaultProbs));
    return defaultProbs;
  }

  return parsedProbs;
}


function getSectorFromAngle(angle) {
  const sectorAngle = 360 / 37; 
  const normalizedAngle = (angle + 90) % 360; 
  let sectorIndex = Math.floor(normalizedAngle / sectorAngle);
  
 
  if (sectorIndex < 0) sectorIndex += 37;
  if (sectorIndex >= 37) sectorIndex -= 37;

 
  sectorIndex = (37 - sectorIndex) % 37; 
  sectorIndex = (sectorIndex - 1 + 37) % 37; 
  const number = rouletteOrder[sectorIndex];
  return { sectorIndex, number };
}

function spinRoulette() {
  if (isSpinning) {
    console.log("Spin in progress, please wait...");
    return;
  }

  const betAmount = parseInt(betAmountInput.value);
  const betType = betTypeSelect.value;

  if (betAmount <= 0 || betAmount > balance) {
    resultDisplay.textContent = 'Invalid bet amount!';
    resultDisplay.classList.remove('glow-text');
    return;
  }

  balance -= betAmount;
  balanceDisplay.textContent = balance;
  isSpinning = true;
  spinButton.disabled = true;
  resultDisplay.textContent = 'Spinning...';
  resultDisplay.classList.remove('glow-text');

  const probabilities = getProbabilities();
  console.log("Probabilities:", probabilities);

  const sectorAngle = 360 / 37;
  const angleRanges = [];
  let cumulative = 0;

  for (let i = 0; i < 37; i++) {
    const startAngle = cumulative;
    cumulative += probabilities[i] * (360 / 100);
    const endAngle = cumulative;
    angleRanges.push({ start: startAngle, end: endAngle, index: i });
  }


  const random = Math.random() * 360;
  console.log("Random angle (probability-based):", random);

  let selectedIndex = 0;
  for (const range of angleRanges) {
    if (random >= range.start && random < range.end) {
      selectedIndex = range.index;
      break;
    }
  }

  console.log("Selected Index (probability-based):", selectedIndex);


  const baseAngle = selectedIndex * sectorAngle;
  const extraSpins = 360 * 5;
  const randomOffset = Math.random() * sectorAngle;
  const finalAngle = extraSpins + baseAngle + randomOffset;

  console.log("Calculated angle:", finalAngle, "Base angle:", baseAngle);


  rotationAngle = 0;
  drawRoulette();

  spinAnimation(finalAngle, () => {
    rotationAngle = finalAngle % 360;
    drawRoulette();

 
    const { sectorIndex, number: winningNumber } = getSectorFromAngle(rotationAngle);
    console.log("Final Sector Index:", sectorIndex, "Winning Number (from wheel):", winningNumber);

    let winnings = 0;
    let message = `Number ${winningNumber} won! `;
    const isRed = redNumbers.includes(winningNumber);
    const isBlack = blackNumbers.includes(winningNumber);

    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');

    if (betType === 'number') {
      const betNumber = parseInt(betNumberInput.value);
      if (betNumber === winningNumber) {
        winnings = betAmount * 36;
        message += `You won ${winnings} (Specific Number)!`;
      } else {
        message += 'You lost.';
      }
    } else if (betType === 'color') {
      const betColor = betColorSelect.value;
      if ((betColor === 'red' && isRed) || (betColor === 'black' && isBlack)) {
        winnings = betAmount * 2;
        message += `You won ${winnings} (Color: ${betColor})!`;
      } else {
        message += 'You lost.';
      }
    } else if (betType === 'evenOdd') {
      const betEvenOdd = betEvenOddSelect.value;
      const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
      if ((betEvenOdd === 'even' && isEven) || (betEvenOdd === 'odd' && !isEven && winningNumber !== 0)) {
        winnings = betAmount * 2;
        message += `You won ${winnings} (Even/Odd: ${betEvenOdd})!`;
      } else {
        message += 'You lost.';
      }
    }

    balance += winnings;
    balanceDisplay.textContent = balance;
    resultDisplay.textContent = message;
    if (winnings > 0) {
      resultDisplay.classList.add('glow-text');
      winSound.play().catch(err => console.log('Win sound play failed:', err));
    } else {
      loseSound.play().catch(err => console.log('Lose sound play failed:', err));
    }
    isSpinning = false;
    spinButton.disabled = false;
  });
}

spinButton.addEventListener('click', spinRoulette); 