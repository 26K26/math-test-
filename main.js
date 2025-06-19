// === 設定 ===
const quizData = Array.from({ length: 20 }, (_, i) => {
  const root = i + 1;
  return {
    question: `√${root ** 2} = ?`,
    answer: root.toString(),
  };
});

let shuffled = [];
let currentQuestion = 0;
let userAnswers = Array(20).fill('');
let timer;
let timeRemaining = 300; // 5分 = 300秒

// === 初期化 ===
window.onload = () => {
  const numberSelect = document.getElementById("number");
  for (let i = 1; i <= 40; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    numberSelect.appendChild(option);
  }

  // テスト画面・結果画面は非表示にしておく
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "none";

  // 仮想テンキー初期化
  createKeypad();
};

// === テスト開始 ===
function startQuiz() {
  const name = document.getElementById("name").value;
  const grade = document.getElementById("grade").value;
  const cls = document.getElementById("class").value;
  const number = document.getElementById("number").value;

  if (!name || !grade || !cls || !number) {
    alert("すべての項目を入力してください");
    return;
  }

  // シャッフル
  shuffled = quizData.sort(() => Math.random() - 0.5);

  // 画面切り替え
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";

  // 初期表示
  showQuestion();

  // タイマー開始
  startTimer();
}

// === タイマー処理 ===
function startTimer() {
  updateTimerDisplay();
  timer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timer);
      alert("時間切れです。自動送信します。");
      submitAnswers();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  document.getElementById("timer").textContent = `残り: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// === 問題表示 ===
function showQuestion() {
  const q = shuffled[currentQuestion];
  document.getElementById("questionText").textContent = `Q${currentQuestion + 1}. ${q.question}`;
  document.getElementById("answerInput").textContent = userAnswers[currentQuestion] || '';
}

// === 前・次の問題へ ===
function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

function nextQuestion() {
  if (currentQuestion < shuffled.length - 1) {
    currentQuestion++;
    showQuestion();
  }
}

// === 仮想テンキー作成 ===
function createKeypad() {
  const keys = ['1','2','3','4','5','6','7','8','9','0','←','クリア'];
  const keypad = document.getElementById("keypad");
  keys.forEach((key) => {
    const btn = document.createElement("button");
    btn.textContent = key;
    btn.onclick = () => handleKeyPress(key);
    keypad.appendChild(btn);
  });
}

// === 入力処理 ===
function handleKeyPress(key) {
  let current = userAnswers[currentQuestion] || '';
  if (key === '←') {
    current = current.slice(0, -1);
  } else if (key === 'クリア') {
    current = '';
  } else {
    current += key;
  }
  userAnswers[currentQuestion] = current;
  document.getElementById("answerInput").textContent = current;
}

// === 送信処理 ===
function submitAnswers() {
  if (!confirm("送信しますか？")) return;

  clearInterval(timer);

  const name = document.getElementById("name").value;
  const grade = document.getElementById("grade").value;
  const cls = document.getElementById("class").value;
  const number = document.getElementById("number").value;

  let correctCount = 0;
  let wrongList = [];

  shuffled.forEach((q, index) => {
    const userAns = userAnswers[index];
    if (userAns === q.answer) {
      correctCount++;
    } else {
      wrongList.push(`Q${index + 1}: ${q.question} → あなたの答え: ${userAns || '(空欄)'}`);
    }
  });

  // 結果表示
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "block";
  document.getElementById("scoreText").textContent = `正解数: ${correctCount} / 20`;
  document.getElementById("wrongAnswers").innerHTML =
    wrongList.length > 0
      ? `<ul>${wrongList.map(w => `<li>${w}</li>`).join('')}</ul>`
      : "<p>全問正解！おめでとう！</p>";

  // Google Apps Script に送信
  const data = {
    name,
    grade,
    class: cls,
    number,
    answers: userAnswers,
    correct: correctCount,
  };

  fetch("https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec", {
    method: "POST",
    body: JSON.stringify(data),
  }).catch(err => console.error("送信エラー", err));
}

// === グローバルに公開 ===
window.startQuiz = startQuiz;
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.submitAnswers = submitAnswers;
