/* ===== 1. DATA: questions stored in an array of objects ===== */
const questions = [
  { question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Text Machine Language", "HyperTool Multi Language", "Home Text Markup Level"], answer: "HyperText Markup Language" },
  { question: "Which tag creates the largest heading?", options: ["<head>", "<h6>", "<h1>", "<heading>"], answer: "<h1>" },
  { question: "Which CSS property changes the text colour?", options: ["font-color", "color", "text-style", "foreground"], answer: "color" },
  { question: "Which symbol is used for an ID selector in CSS?", options: [".", "#", "*", "&"], answer: "#" },
  { question: "Which CSS layout system arranges items in rows and columns?", options: ["Grid", "Float", "Inline", "Table-less"], answer: "Grid" },
  { question: "Which keyword declares a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: "const" },
  { question: "What does console.log() do?", options: ["Prints to the browser console", "Shows a popup", "Saves a file", "Reloads the page"], answer: "Prints to the browser console" },
  { question: "Which method selects an element by its id?", options: ["getElementById()", "querySelectorAll()", "getElementsByTag()", "selectId()"], answer: "getElementById()" },
  { question: "Which event fires when a button is clicked?", options: ["onhover", "onclick", "onload", "onchange"], answer: "onclick" },
  { question: "What is the result of 5 + '5' in JavaScript?", options: ["10", "55", "Error", "undefined"], answer: "55" }
];

/* ===== 2. STATE: variables that change while the quiz runs ===== */
let quizQuestions = [];   // shuffled copy of the questions
let currentIndex = 0;     // which question we are on
let score = 0;
let answered = false;     // stops the user from scoring twice
let userAnswers = [];     // saved for the review list

/* ===== 3. SELECT DOM ELEMENTS ===== */
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const questionText = document.getElementById("question-text");
const optionsBox = document.getElementById("options");
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progress-bar");
const nextBtn = document.getElementById("next-btn");
const bestScoreText = document.getElementById("best-score");
const themeBtn = document.getElementById("theme-btn");

/* ===== 4. HELPER FUNCTIONS (with parameters and return values) ===== */

// Returns a new shuffled array (Fisher-Yates shuffle). The original is not changed.
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Returns a message depending on the percentage.
function getMessage(percentage) {
  if (percentage >= 80) return "Great job! You know your web dev.";
  if (percentage >= 50) return "Good effort! A little more practice will help.";
  return "Try again! Revise the basics and come back.";
}

// Shows one screen and hides the others.
function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

/* ===== 5. QUIZ FUNCTIONS ===== */

function startQuiz() {
  quizQuestions = shuffle(questions);   // shuffle questions every time
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  showScreen(quizScreen);
  showQuestion();
}

// Draws the current question and its option buttons.
function showQuestion() {
  answered = false;
  const current = quizQuestions[currentIndex];
  questionText.textContent = current.question;
  counter.textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
  progressBar.style.width = (currentIndex / quizQuestions.length) * 100 + "%";
  nextBtn.classList.add("hidden");
  optionsBox.innerHTML = "";            // clear old options

  // Loop over shuffled options and create a button for each one
  shuffle(current.options).forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = `${i + 1}. ${optionText}`;
    btn.dataset.value = optionText;
    btn.addEventListener("click", () => checkAnswer(btn));
    optionsBox.appendChild(btn);
  });
}

// Checks the chosen option, colours buttons, and locks the question.
function checkAnswer(selectedBtn) {
  if (answered) return;
  answered = true;
  const current = quizQuestions[currentIndex];
  const chosen = selectedBtn.dataset.value;

  if (chosen === current.answer) {
    score++;
    selectedBtn.classList.add("correct");
  } else {
    selectedBtn.classList.add("wrong");
  }

  // Disable all buttons and highlight the right answer
  optionsBox.querySelectorAll(".option").forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === current.answer) btn.classList.add("correct");
  });

  userAnswers.push({ question: current.question, chosen: chosen, correct: current.answer });
  nextBtn.textContent = currentIndex === quizQuestions.length - 1 ? "See Result" : "Next";
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < quizQuestions.length) showQuestion();
  else showResult();
}

function showResult() {
  const total = quizQuestions.length;
  const percentage = Math.round((score / total) * 100);
  progressBar.style.width = "100%";
  document.getElementById("score-text").textContent = `Score: ${score} / ${total} (${percentage}%)`;
  document.getElementById("message").textContent = getMessage(percentage);

  // Build the review list dynamically
  const list = document.getElementById("review-list");
  list.innerHTML = "";
  userAnswers.forEach((item, i) => {
    const li = document.createElement("li");
    const isRight = item.chosen === item.correct;
    li.className = isRight ? "right" : "incorrect";
    li.textContent = `${i + 1}. ${item.question} Your answer: ${item.chosen}.` +
      (isRight ? " Correct!" : ` Correct answer: ${item.correct}.`);
    list.appendChild(li);
  });

  saveBestScore(score);
  showScreen(resultScreen);
}

/* ===== 6. EXTRA FEATURES ===== */

// Best score saved in localStorage
function showBestScore() {
  const best = localStorage.getItem("quizBest");
  bestScoreText.textContent = best === null ? "none yet" : `${best} / ${questions.length}`;
}
function saveBestScore(newScore) {
  const best = Number(localStorage.getItem("quizBest") || 0);
  if (newScore > best) localStorage.setItem("quizBest", newScore);
  showBestScore();
}

// Dark / light mode, remembered in localStorage
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}
function toggleTheme() {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem("quizTheme", next);
  applyTheme(next);
}

// Keyboard shortcuts: 1-4 choose an option, Enter goes forward
document.addEventListener("keydown", (e) => {
  if (!quizScreen.classList.contains("hidden") && ["1", "2", "3", "4"].includes(e.key)) {
    const buttons = optionsBox.querySelectorAll(".option");
    const btn = buttons[Number(e.key) - 1];
    if (btn) checkAnswer(btn);
  } else if (e.key === "Enter") {
    if (!startScreen.classList.contains("hidden")) startQuiz();
    else if (!nextBtn.classList.contains("hidden") && !quizScreen.classList.contains("hidden")) nextQuestion();
  }
});

/* ===== 7. CLICK EVENT LISTENERS AND START-UP ===== */
document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
themeBtn.addEventListener("click", toggleTheme);

applyTheme(localStorage.getItem("quizTheme") || "light");
showBestScore();
console.log(questions);   // test: print the array
