// --- Utilities ---
const RNG = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// --- Validation ---
function assertQuestion(q) {
  if (!q || typeof q.question !== "string" || !q.question.trim()) return false;
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return false;
  if (typeof q.correctIndex !== "number") return false;
  return true;
}

// --- Question generator with fallback ---
function safeGenerateQuestion(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const q = generateQuestionOnce();
    if (assertQuestion(q)) return q;
  }
  return {
    question: "What is 1 + 1?",
    choices: ["1", "2", "3", "0"],
    correctIndex: 1,
    answerText: "2"
  };
}

function generateQuestionOnce() {
  const difficultySettings = DIFFICULTY_LEVELS[currentDifficulty];
  
  const types = ["addition", "subtraction", "multiplication", "division"];
  const type = types[RNG(0, types.length - 1)];
  switch (type) {
    case "addition": {
      const settings = difficultySettings.addition;
      const a = RNG(settings.min, settings.max);
      const b = RNG(settings.min, settings.max);
      const ans = a + b;
      const choices = shuffle([ans, ans+1, ans-1, ans+2].map(String));
      return {question: `What is ${a} + ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
    case "subtraction": {
      const settings = difficultySettings.subtraction;
      let a = RNG(settings.min, settings.max);
      let b = RNG(settings.min, settings.max);
      if (b > a) [a,b] = [b,a]; // Ensure a > b to avoid negative results
      const ans = a - b;
      const choices = shuffle([ans, ans+1, ans-1, a+b].map(String));
      return {question: `What is ${a} - ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
    case "multiplication": {
      const settings = difficultySettings.multiplication;
      const a = RNG(settings.min, settings.max);
      const b = RNG(settings.min, settings.max);
      const ans = a * b;
      const choices = shuffle([ans, ans+1, ans-1, a+b].map(String));
      return {question: `What is ${a} × ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
    case "division": {
      const settings = difficultySettings.division;
      // Select divisor from allowed list for clean division
      const b = settings.divisors[RNG(0, settings.divisors.length - 1)];
      const ans = RNG(settings.min, settings.max);
      const a = b * ans; // Ensures clean division
      const choices = shuffle([ans, ans+1, ans-1, b].map(String));
      return {question: `What is ${a} ÷ ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
  }
}

// --- Difficulty Levels ---
const DIFFICULTY_LEVELS = {
  easy: {
    addition: { min: 2, max: 10 },
    subtraction: { min: 1, max: 10 },
    multiplication: { min: 1, max: 5 },
    division: { min: 1, max: 5, divisors: [2, 3, 4, 5] }
  },
  medium: {
    addition: { min: 5, max: 20 },
    subtraction: { min: 3, max: 20 },
    multiplication: { min: 2, max: 10 },
    division: { min: 2, max: 10, divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10] }
  },
  hard: {
    addition: { min: 10, max: 100 },
    subtraction: { min: 10, max: 100 },
    multiplication: { min: 5, max: 20 },
    division: { min: 5, max: 12, divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
  }
};

let currentDifficulty = "easy"; // Default difficulty

// --- Function to set difficulty level ---
function setDifficulty(level) {
  if (DIFFICULTY_LEVELS[level]) {
    currentDifficulty = level;
    
    // Update container background color
    const container = document.querySelector('.container');
    container.classList.remove('easy', 'medium', 'hard');
    container.classList.add(level);
    
    // Reset the quiz when difficulty changes
    resetQuiz();
    return true;
  }
  return false;
}

// --- Reset quiz function ---
function resetQuiz() {
  qNumber = 1;
  score.correct = 0;
  score.wrong = 0;
  nextQuestion();
}

// --- Quiz state ---
let qNumber = 1;               // 1..10
let activeQuestion = null;
const score = { correct: 0, wrong: 0 };
const TOTAL = 10;

// --- DOM ---
const questionEl = document.getElementById("question");
const choicesEl  = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const nextBtn    = document.getElementById("nextBtn");
const resultEl   = document.getElementById("result");
const progressEl = document.getElementById("progress");
const scoreEl    = document.getElementById("score");

nextBtn.addEventListener("click", () => {
  nextQuestion();
});

// --- Start after creating difficulty selector on page load ---
window.addEventListener("DOMContentLoaded", () => {
  // Create difficulty selector UI
  const container = document.querySelector('.container');
  // Set initial background class
  container.classList.add(currentDifficulty);
  
  const quizEl = document.getElementById('quiz');
  
  const difficultyContainer = document.createElement('div');
  difficultyContainer.className = 'difficulty-container';
  
  const difficultyLabel = document.createElement('h3');
  difficultyLabel.textContent = 'Select Difficulty:';
  difficultyContainer.appendChild(difficultyLabel);
  
  const difficultySelector = document.createElement('div');
  difficultySelector.className = 'difficulty-selector';
  
  // Create buttons for each difficulty level
  Object.keys(DIFFICULTY_LEVELS).forEach(level => {
    const btn = document.createElement('button');
    btn.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    btn.className = `difficulty-btn ${level === currentDifficulty ? 'active' : ''}`;
    btn.setAttribute('data-difficulty', level);
    btn.addEventListener('click', (e) => {
      // Remove active class from all buttons
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
      // Add active class to the clicked button
      e.target.classList.add('active');
      // Set the new difficulty
      setDifficulty(level);
    });
    difficultySelector.appendChild(btn);
  });
  
  difficultyContainer.appendChild(difficultySelector);
  container.insertBefore(difficultyContainer, quizEl);
  
  // Start the quiz with default difficulty
  nextQuestion();
});

function updateStatus() {
  progressEl.textContent = `Q${Math.min(qNumber, TOTAL)} of ${TOTAL}`;
  scoreEl.textContent = `Score: ${score.correct}✓ / ${score.wrong}✗`;
  
  // Update difficulty display
  const difficultyEl = document.getElementById("current-difficulty");
  if (difficultyEl) {
    const capitalizedDifficulty = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    difficultyEl.textContent = `Level: ${capitalizedDifficulty}`;
  }
}

function nextQuestion() {
  feedbackEl.textContent = "";
  nextBtn.disabled = true; // disabled until an answer is chosen
  updateStatus();

  if (qNumber > TOTAL) {
    // End of quiz
    questionEl.textContent = "Quiz Finished!";
    choicesEl.innerHTML = "";
    resultEl.classList.remove("hidden");
    resultEl.textContent = `You answered ${score.correct} correct and ${score.wrong} wrong out of ${TOTAL}.`;
    nextBtn.classList.add("hidden");
    return;
  }

  activeQuestion = safeGenerateQuestion();
  questionEl.textContent = `Q${qNumber}: ${activeQuestion.question}`;
  choicesEl.innerHTML = "";

  activeQuestion.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "choice";
    btn.addEventListener("click", () => submitAnswer(i, btn));
    choicesEl.appendChild(btn);
  });

  qNumber++;
}

function submitAnswer(index, btn) {
  // prevent multiple selections
  Array.from(choicesEl.children).forEach(b => b.disabled = true);

  if (index === activeQuestion.correctIndex) {
    score.correct++;
    btn.classList.add("correct");
    feedbackEl.textContent = "Correct!";
    if (typeof showFireworks === 'function') showFireworks();
    // Animate mascot for correct answer
    if (typeof mascotCorrectAnswer === 'function') mascotCorrectAnswer();
  } else {
    score.wrong++;
    btn.classList.add("wrong");
    feedbackEl.textContent = `Wrong! Correct answer: ${activeQuestion.answerText}`;
    // highlight correct choice too
    const correctBtn = choicesEl.children[activeQuestion.correctIndex];
    if (correctBtn) correctBtn.classList.add("correct");
    // Animate mascot for wrong answer
    if (typeof mascotWrongAnswer === 'function') mascotWrongAnswer();
  }
  updateStatus();
  nextBtn.disabled = false;
  }
