const ADMIN_PASSWORD = 'admin123'; 

const loginButton = document.getElementById('loginButton');
const passwordInput = document.getElementById('password');
const loginDiv = document.getElementById('login');
const probabilitiesDiv = document.getElementById('probabilities');
const saveButton = document.getElementById('saveButton');
const probError = document.getElementById('probError');

loginButton.addEventListener('click', () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    loginDiv.classList.add('hidden');
    probabilitiesDiv.classList.remove('hidden');
  } else {
    probError.textContent = 'Incorrect password!';
  }
});

saveButton.addEventListener('click', () => {
  const probs = [];
  let sum = 0;

  for (let i = 0; i <= 36; i++) {
    const prob = parseInt(document.getElementById(`prob${i}`).value) || 0;
    probs.push(prob);
    sum += prob;
  }

  if (sum !== 100) {
    probError.textContent = 'Sum of probabilities must be 100%';
    return;
  }

  localStorage.setItem('probabilities', JSON.stringify(probs));
  probError.textContent = 'Probabilities saved!';
  probError.classList.remove('text-red-500');
  probError.classList.add('text-green-500');
});