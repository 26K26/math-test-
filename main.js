const quizData = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  return { question: `${num * num} の平方根`, answer: String(num), userAnswer: "" };
});
let shuffled = quizData.sort(() => Math.random() - 0.5);
let currentIndex = 0;
let timer = 300;
let timerInterval = null;

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const questionText = document.getElementById("questionText");
const answerInput = document.getElementById("answerInput");
const scoreText = document.getElementById("scoreText");
const wrongAnswers = document.getElementById("wrongAnswers");
const timerDisplay = document.getElementById("timer");
const numberSelect = document.getElementById("number");
const keypad = document.getElementById("keypad");

function populateSelectOptions() {
  for (let i = 1; i <= 40; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    numberSelect.appendChild(opt);
  }

  const keys = [...Array(9)].map((_, i) => i + 1).concat(0);
  keys.forEach(n => {
    const btn = document.createElement("button");
    btn.textContent = n;
    btn.onclick = () => inputDigit(n);
    keypad.appendChild(btn);
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "←";
  delBtn.onclick = deleteDigit;
  keypad.appendChild(delBtn);

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "クリア";
  clearBtn.onclick = clearInput;
  keypad.appendChild(clearBtn);
}

function updateTimer() {
  let m = Math.floor(timer / 60);
  let s = timer % 60;
  timerDisplay.textContent = `残り: ${m}:${s.toString().padStart(2, '0')}`;
  if (timer <= 0) {
    clearInterval(timerInterval);
    submitAnswers(true);
  }
  timer--;
}

function startQuiz() {
  const name = document.getElementById("name").value.trim();
  const grade = document.getElementById("grade").value.trim();
  const classVal = document.getElementById("class").value;
  const number = document.getElementById("number").value;

  if (!name || !grade || !classVal || !number) {
    alert("すべての情報を入力してください。");
    return;
  }

  startScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showQuestion();
  timerInterval = setInterval(updateTimer, 1000);
}

function showQuestion() {
  const q = shuffled[currentIndex];
  questionText.textContent = `Q${currentIndex + 1}. ${q.question}`;
  answerInput.textContent = q.userAnswer || "";
}

function inputDigit(digit) {
  let val = answerInput.textContent;
  if (val.length < 3) {
    val += digit;
    answerInput.textContent = val;
    shuffled[currentIndex].userAnswer = val;
  }
}

function deleteDigit() {
  let val = answerInput.textContent;
  val = val.slice(0, -1);
  answerInput.textContent = val;
  shuffled[currentIndex].userAnswer = val;
}

function clearInput() {
  answerInput.textContent = "";
  shuffled[currentIndex].userAnswer = "";
}

function nextQuestion() {
  if (currentIndex < shuffled.length - 1) {
    currentIndex++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function submitAnswers(auto = false) {
  if (!auto && !confirm("送信してもよろしいですか？")) return;

  clearInterval(timerInterval);
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  let correct = 0;
  let wrongList = "";
  shuffled.forEach((q, i) => {
    if (q.userAnswer === q.answer) {
      correct++;
    } else {
      wrongList += `<p>Q${i + 1}: ${q.question} → あなたの答え: ${q.userAnswer || "無回答"}（正解: ${q.answer}）</p>`;
    }
  });

  scoreText.textContent = `正解数: ${correct} / ${shuffled.length}`;
  wrongAnswers.innerHTML = wrongList || "<p>全問正解です！</p>";

  const payload = {
    name: document.getElementById("name").value,
    grade: document.getElementById("grade").value,
    class: document.getElementById("class").value,
    number: document.getElementById("number").value,
    answers: shuffled.map((q, i) => `Q${i + 1}: ${q.userAnswer}`).join(", "),
    correct
  };

  fetch("https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(err => {
    console.error("送信エラー:", err);
  });
}

window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = '';
});

window.onload = populateSelectOptions;
