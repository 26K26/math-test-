<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>平方根テスト</title>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    body {
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
    }
    #quiz-screen {
      display: none;
    }
    input[type="text"] {
      font-size: 24px;
      width: 100px;
      text-align: center;
    }
    #question-text {
      font-size: 32px;
      margin-bottom: 20px;
    }
    #timer {
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 18px;
      color: red;
    }
  </style>
</head>
<body>
  <div id="timer"></div>

  <div id="start-screen">
    <h2>平方根テスト</h2>
    <form id="user-form">
      <label>名前: <input type="text" id="name" required></label><br>
      <label>学年: <input type="text" id="grade" required></label><br>
      <label>クラス: <input type="text" id="class" required></label><br>
      <button type="submit">開始</button>
    </form>
  </div>

  <div id="quiz-screen">
    <div id="question-text"></div>
    <input type="text" id="answer-input" autocomplete="off" />
    <div>
      <button onclick="nextQuestion()" id="next-button">次へ</button>
    </div>
  </div>

  <script>
    // 出題データ：x² = ○○ の形で、答えは 1〜20
    const quizData = [];
    for (let i = 1; i <= 20; i++) {
      quizData.push({
        question: `x^2 = ${i * i}`,
        answer: i.toString()
      });
    }

    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzaEbohb33NPS8iYg8YmCB46xcd99OwvjuV28EUXt9elnQ7DTzaFJkcmF8r0ez_BIXEZQ/exec';

    let currentQuestionIndex = 0;
    let answers = [];
    let timerInterval;
    let remainingTime = 60 * 3; // 3分

    document.getElementById('user-form').addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('quiz-screen').style.display = 'block';
      document.addEventListener("visibilitychange", handleVisibilityChange);
      startTimer();
      showQuestion();
    });

    function showQuestion() {
      if (currentQuestionIndex >= quizData.length) {
        submitAnswers();
        return;
      }
      const q = quizData[currentQuestionIndex];
      document.getElementById('question-text').innerHTML = `\\(${q.question.replace("^2", "^{2}")}\\)`;
      document.getElementById('answer-input').value = '';
      if (window.MathJax) {
        MathJax.typesetPromise();
      }
    }

    document.getElementById('next-button').addEventListener('click', nextQuestion);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        nextQuestion();
      }
    });

    function nextQuestion() {
      const input = document.getElementById('answer-input').value.trim();
      if (input === "") {
        alert("答えを入力してください");
        return;
      }
      answers.push(input);
      currentQuestionIndex++;
      showQuestion();
    }

    function insertSymbol(sym) {
      const input = document.getElementById('answer-input');
      input.val
