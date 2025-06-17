const GAS_URL = "https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec";

// 1〜20の平方数（1²～20²）
const squares = Array.from({ length: 20 }, (_, i) => (i + 1) ** 2);

// 出題順をランダムに
const questions = shuffleArray(squares);

let userInfo = {};
let currentQuestionIndex = 0;
let answers = [];
let startTime;
let timerInterval;

// --- イベントリスナーなど省略せずにセットする ---
document.getElementById("user-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const grade = document.getElementById("grade").value.trim();
  const className = document.getElementById("class").value;
  const number = document.getElementById("number").value;

  if (!name || !grade || !className || !number) {
    alert("すべての項目を入力してください。");
    return;
  }

  userInfo = { name, grade, class: className, number };
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display = "block";
  document.addEventListener("visibilitychange", handleVisibilityChange);
  startTimer();
  showQuestion();
});

// --- 出題を表示 ---
function showQuestion() {
  const questionNumber = currentQuestionIndex + 1;
  const squareValue = questions[currentQuestionIndex];
  document.getElementById("question-number").textContent = `問${questionNumber}`;
  document.getElementById("question").innerHTML = `\\( \\sqrt{${squareValue}} \\) の値は？`;
  document.getElementById("answer-input").value = "";
  MathJax.typeset(); // MathJaxで再描画
}

// --- テンキー入力処理 ---
document.querySelectorAll(".key").forEach(button => {
  button.addEventListener("click", function () {
    const input = document.getElementById("answer-input");
    const value = this.textContent;
    if (value === "クリア") {
      input.value = "";
    } else if (value === "←") {
      input.value = input.value.slice(0, -1);
    } else {
      input.value += value;
    }
  });
});

// --- 「次へ」ボタン ---
document.getElementById("next-btn").addEventListener("click", function () {
  const input = document.getElementById("answer-input").value.trim();
  if (!input) {
    alert("答えを入力してください。");
    return;
  }

  answers.push(input);
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    stopTimer();
    submitAnswers();
  }
});

// --- 成績送信処理 ---
async function submitAnswers() {
  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000); // 秒数
  const score = answers.reduce((acc, ans, i) => acc + (parseInt(ans) === Math.sqrt(questions[i]) ? 1 : 0), 0);
  const incorrect = questions.map((q, i) => {
    const correct = Math.sqrt(q);
    return parseInt(answers[i]) === correct ? null : `問${i + 1}: √${q} → ${answers[i]}（正解：${correct}）`;
  }).filter(Boolean).join("\n");

  const data = {
    timestamp: new Date().toLocaleString("ja-JP"),
    name: userInfo.name,
    grade: userInfo.grade,
    class: userInfo.class,
    number: userInfo.number,
    score,
    total: questions.length,
    duration,
    answers: answers.join(","),
    incorrect
  };

  document.getElementById("next-btn").disabled = true;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      break;
    } catch (err) {
      if (attempt === 3) alert("送信に失敗しました。通信環境をご確認ください。");
    }
  }

  showResult(score, questions.length, incorrect);
}

// --- 結果表示 ---
function showResult(score, total, incorrect) {
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  document.getElementById("score").textContent = `正解数：${score} / ${total}`;
  document.getElementById("details").textContent = incorrect || "すべて正解です！";
}

// --- タイマー機能 ---
function startTimer() {
  const timer = document.getElementById("timer");
  let timeLeft = 300;
  startTime = new Date();

  timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("時間切れです。自動的に送信します。");
      submitAnswers();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function handleVisibilityChange() {
  if (document.hidden) {
    alert("画面外操作が検出されました。送信します。");
    submitAnswers();
  }
}

// --- 配列シャッフル関数 ---
function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
