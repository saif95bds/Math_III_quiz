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
  const types = ["addition", "subtraction", "multiplication", "division"];
  const type = types[RNG(0, types.length - 1)];
  switch (type) {
    case "addition": {
      const a = RNG(2, 20), b = RNG(2, 20);
      const ans = a + b;
      const choices = shuffle([ans, ans+1, ans-1, ans+2].map(String));
      return {question: `What is ${a} + ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
    case "subtraction": {
      let a = RNG(5, 20), b = RNG(1, 15); if (b > a) [a,b] = [b,a];
      const ans = a - b;
      const choices = shuffle([ans, ans+1, ans-1, a+b].map(String));
      return {question: `What is ${a} - ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
    case "multiplication": {
      const a = RNG(2, 10), b = RNG(2, 10);
      const ans = a * b;
      const choices = shuffle([ans, ans+1, ans-1, a+b].map(String));
      return {question: `What is ${a} × ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
    case "division": {
      const b = RNG(2, 10), ans = RNG(2, 10), a = b * ans;
      const choices = shuffle([ans, ans+1, ans-1, b].map(String));
      return {question: `What is ${a} ÷ ${b}?`, choices, correctIndex: choices.indexOf(String(ans)), answerText: String(ans)};
    }
  }
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

// --- Start immediately on page load ---
window.addEventListener("DOMContentLoaded", () => {
  nextQuestion();
});

function updateStatus() {
  progressEl.textContent = `Q${Math.min(qNumber, TOTAL)} of ${TOTAL}`;
  scoreEl.textContent = `Score: ${score.correct}✓ / ${score.wrong}✗`;
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
      showFireworks();
  } else {
    score.wrong++;
    btn.classList.add("wrong");
    feedbackEl.textContent = `Wrong! Correct answer: ${activeQuestion.answerText}`;
    // highlight correct choice too
    const correctBtn = choicesEl.children[activeQuestion.correctIndex];
    if (correctBtn) correctBtn.classList.add("correct");
  }
  updateStatus();
  nextBtn.disabled = false;
  }

  // Simple firework animation using canvas
  function showFireworks() {
    let canvas = document.createElement('canvas');
    canvas.id = 'firework-canvas';
    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Firework particle system
    const particles = [];
    const colors = ['#ff3', '#f36', '#3ff', '#f93', '#39f', '#9f3'];
    const centerX = canvas.width/2;
    const centerY = canvas.height/2;
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = Math.random() * 4 + 2;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.alpha *= 0.96;
      });
      frame++;
      if (frame < 50) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    animate();
}
