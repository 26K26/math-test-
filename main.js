document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const testSection = document.getElementById("testSection");
  const startSection = document.getElementById("startSection");
  const resultSection = document.getElementById("resultSection");
  const questionText = document.getElementById("questionText");
  const currentQuestionNumber = document.getElementById("currentQuestionNumber");
  const answerInput = document.getElementById("answerInput");
  const timerDisplay = document.getElementById("timer");
  const errorList = document.getElementById("errorList");
  const finalScore = document.getElementById("finalScore");
  const submitBtn = document.getElementById("submitBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const keys = document.querySelectorAll(".key");
  const clearBtn = document.getElementById("clearBtn");
  const backspaceBtn = document.getElementById("backspaceBtn");

  const nameInput = document.getElementById("name");
  const gradeSelect = document.getElementById("grade");
  const classSelect = document.getElementById("class");
  const numberSelect = document.getElementById("number");

  let questions = [];
  let currentQuestion = 0;
  let answers = [];
  let correctAnswers = [];
  let timer;
  let timeLimit = 60 * 3; // 3分

  const GAS_URL = "https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec";

  function generateQuestions() {
    const nums = Array.from({ length: 20 }, (_, i) => i + 1);
    nums.sort(() => Math.random() - 0.5);
    questions = nums.map(n => n * n);
    correctAnswers = nums;
    answers = Array(20).fill("");
  }

  function renderQuestion() {
    currentQuestionNumber.textContent = `${currentQuestion + 1}/20`;
    questionText.innerHTML = `\\( \\sqrt{${questions[currentQuestion]}} = \\)`;
    answerInput.value = answers[currentQuestion];
    MathJax.typesetPromise();
  }

  function startTimer() {
    let timeLeft = timeLimit;
    timerDisplay.textContent = formatTime(timeLeft);
    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        forceSubmit();
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function forceSubmit() {
    alert("時間切れです。自動的に送信します。");
    showResult();
  }

  function showResult() {
    testSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    let score = 0;
    let errors = [];

    answers.forEach((ans, i) => {
      if (ans == correctAnswers[i]) {
        score++;
      } else {
        errors.push(`第${i + 1}問: √${questions[i]} → ${ans}（正解: ${correctAnswers[i]}）`);
      }
    });

    finalScore.textContent = `${score} / 20`;
    errorList.innerHTML = errors.map(e => `<li>${e}</li>`).join("");

    const payload = {
      name: nameInput.value,
      grade: gradeSelect.value,
      class: classSelect.value,
      number: numberSelect.value,
      answers: answers,
      correct: score,
      timestamp: new Date().toISOString(),
    };

    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  startBtn.addEventListener("click", () => {
  if (!nameInput.value.trim()) {
    alert("名前を入力してください");
    return;
  }
  if (!gradeSelect.value.trim()) {
    alert("学年を入力してください");
    return;
  }
  if (!classSelect.value) {
    alert("クラスを選択してください");
    return;
  }
  if (!numberSelect.value) {
    alert("出席番号を選択してください");
    return;
  }

  generateQuestions();
  renderQuestion();
  startSection.classList.add("hidden");
  testSection.classList.remove("hidden");
  startTimer();
});


  prevBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion();
    }
  });

  nextBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    if (currentQuestion < 19) {
      currentQuestion++;
      renderQuestion();
    }
  });

  function saveCurrentAnswer() {
    answers[currentQuestion] = answerInput.value.trim();
  }

  submitBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    if (!confirm("送信しますか？")) return;
    clearInterval(timer);
    showResult();
  });

  keys.forEach(key => {
    key.addEventListener("click", () => {
      answerInput.value += key.getAttribute("data-value");
    });
  });

  clearBtn.addEventListener("click", () => {
    answerInput.value = "";
  });

  backspaceBtn.addEventListener("click", () => {
    answerInput.value = answerInput.value.slice(0, -1);
  });

  window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "テストを離れようとしています。";
  });

  let visibilityCount = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      visibilityCount++;
      if (visibilityCount >= 2) {
        alert("画面外操作が検出されました。テストを終了します。");
        clearInterval(timer);
        showResult();
      }
    }
  });
});
