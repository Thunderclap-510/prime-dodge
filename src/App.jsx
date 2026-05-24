import { useEffect, useState } from "react";

/* =========================
   PRIME DATA
========================= */

const primePool = new Set([
  11,13,17,19,23,29,31,37,41,43,
  47,53,59,61,67,71,73,79,83,89,97,
  101,103,107,109,113,127,131,137,139,149,
  151,157,163,167,173,179,181,191,193,197,199,
  211,223,227,229,233,239,241,251,257,263,
  269,271,277,281,283,293,
  307,311,313,317,331,337,347,349,353,359,
  367,373,379,383,389,397,
  401,409,419,421,431,433,439,443,449,
  457,461,463,467,479,487,491,499,
  503,509,521,523,541,547,557,563,569,571,
  577,587,593,599,
  601,607,613,617,619,631,641,643,647,653,
  659,661,673,677,683,691,
  701,709,719,727,733,739,743,751,757,761,
  769,773,787,797,
  809,811,821,823,827,829,839,853,857,859,
  863,877,881,883,887,
  907,911,919,929,937,941,947,953,967,971,
  977,983,991,997
]);

const isPrime = (n) => primePool.has(n);

/* =========================
   STYLE
========================= */

const bg = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top,#0b0b10,#000)",
  color: "#fff",
  textAlign: "center",
  paddingTop: 16,
  paddingBottom: 30,
  fontFamily: "system-ui",
  overflowX: "hidden"
};

const title = {
  fontSize: 42,
  letterSpacing: 4,
  fontWeight: 900,
  color: "#00e5ff",
  textShadow: "0 0 15px #00e5ff, 0 0 30px #0066ff",
  marginBottom: 10
};

const card = {
  background: "rgba(20,20,30,0.75)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 14,
  width: 320,
  margin: "10px auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 10,
  width: 320,
  margin: "10px auto"
};

const btn = {
  height: 70,
  fontSize: 22,
  borderRadius: 16,
  border: "none",
  cursor: "pointer",
  fontWeight: 800
};

/* =========================
   SHUFFLE
========================= */

const shuffle = (a) => {

  const arr = [...a];

  for (let i = arr.length - 1; i > 0; i--) {

    const j = (Math.random() * (i + 1)) | 0;

    [arr[i], arr[j]] =
      [arr[j], arr[i]];
  }

  return arr;
};

/* =========================
   RANGE
========================= */

const getRange = (q) =>
  q < 7
    ? { min: 10, max: 99 }
    : q < 11
    ? { min: 100, max: 199 }
    : q < 16
    ? { min: 200, max: 499 }
    : { min: 500, max: 999 };

/* =========================
   GENERATE NUMBERS
========================= */

function generateNumbers(q) {

  const { min, max } = getRange(q);

  const used = new Set();

  const primes = [...primePool].filter(
    (p) => p >= min && p <= max
  );

  const arr = [
    {
      value:
        primes[
          (Math.random() * primes.length) | 0
        ],
      id: "p0"
    }
  ];

  used.add(arr[0].value);

  while (arr.length < 9) {

    const n =
      ((Math.random() * (max - min + 1)) | 0)
      + min;

    if (primePool.has(n)) continue;
    if (used.has(n)) continue;

    if (
      q >= 16 &&
      (
        n % 2 === 0 ||
        n % 3 === 0 ||
        n % 5 === 0 ||
        n % 10 === 0
      )
    ) {
      continue;
    }

    used.add(n);

    arr.push({
      value: n,
      id: n
    });
  }

  return shuffle(arr);
}

/* =========================
   SCORE
========================= */

const calcScore = (time) => {

  return Math.round(
    10000 /
    (1 + (time / 3))
  );
};

/* =========================
   RANK
========================= */

const getRank = (score) => {

  if (score >= 150000) return "S";
  if (score >= 120000) return "A";
  if (score >= 90000) return "B";
  if (score >= 60000) return "C";

  return "D";
};

/* =========================
   HIGH SCORE
========================= */

const getHighScore = (key) => {

  return Number(
    localStorage.getItem(key) || 0
  );
};

const saveHighScore = (key, score) => {

  const current =
    getHighScore(key);

  if (score > current) {

    localStorage.setItem(
      key,
      score
    );

    return true;
  }

  return false;
};

/* =========================
   PRIME DODGE
========================= */

function PrimeDodge({ back }) {

  const MAX_Q = 20;

  const [score, setScore] = useState(0);

  const [lives, setLives] = useState(3);

  const [time, setTime] = useState(0);

  const [started, setStarted] =
    useState(false);

  const [numbers, setNumbers] =
    useState([]);

  const [q, setQ] = useState(1);

  const [end, setEnd] = useState(false);

  const [msg, setMsg] =
    useState("READY");

  const [questionStart,
    setQuestionStart] =
    useState(0);

  const [highScore, setHighScore] =
    useState(
      getHighScore("prime_dodge")
    );

  const [newRecord, setNewRecord] =
    useState(false);

  useEffect(() => {

    if (!started) return;

    const startTime = Date.now();

    const id = setInterval(() => {

      setTime(
        (Date.now() - startTime) / 1000
      );

    }, 100);

    return () => clearInterval(id);

  }, [started]);

  const finishGame = (finalScore) => {

    const isNew =
      saveHighScore(
        "prime_dodge",
        finalScore
      );

    if (isNew) {

      setHighScore(finalScore);

      setNewRecord(true);

      setMsg("🏆 最高スコア更新！");
    }

    setEnd(true);

    setStarted(false);
  };

  const start = () => {

    setScore(0);

    setLives(3);

    setTime(0);

    setQ(1);

    setEnd(false);

    setStarted(true);

    setMsg("GO!");

    setNewRecord(false);

    setNumbers(
      generateNumbers(1)
    );

    setQuestionStart(Date.now());
  };

  const click = (n) => {

    if (!started) return;

    const answerTime =
      (Date.now() - questionStart)
      / 1000;

    const baseScore =
      calcScore(answerTime);

    let nextLives = lives;

    let nextScore = score;

    if (isPrime(n)) {

      nextScore += baseScore;

      setScore(nextScore);

      setMsg(`✔ +${baseScore}`);

    } else {

      const reduced =
        Math.round(baseScore / 5);

      nextScore += reduced;

      setScore(nextScore);

      nextLives = lives - 1;

      setLives(nextLives);

      setMsg(`✖ +${reduced}`);
    }

    const nextQ = q + 1;

    if (
      nextQ > MAX_Q ||
      nextLives <= 0
    ) {

      finishGame(nextScore);

      return;
    }

    setQ(nextQ);

    setNumbers(
      generateNumbers(nextQ)
    );

    setQuestionStart(Date.now());
  };

  return (
    <div style={bg}>

      <h1 style={title}>
        PRIME DODGE
      </h1>

      <button
        onClick={back}
        style={{
          marginBottom: 8,
          background: "transparent",
          color: "#aaa",
          border: "1px solid #333",
          padding: "6px 12px",
          borderRadius: 10
        }}
      >
        ← HOME
      </button>

      <div style={card}>

        <div>
          Score: {score}
        </div>

        <div>
          High Score: {highScore}
        </div>

        <div>
          Q: {q}/{MAX_Q}
        </div>

        <div>
          Time: {time.toFixed(1)}s
        </div>

        <div>
          Lives: {"❤".repeat(lives)}
        </div>

      </div>

      <div
        style={{
          color:
            msg.includes("✔")
            ? "#00ffb3"
            : msg.includes("🏆")
            ? "#ffd700"
            : "#ff4d6d",
          fontSize: 18,
          minHeight: 30,
          fontWeight: 800
        }}
      >
        {msg}
      </div>

      <div style={grid}>
        {numbers.map((v) => (
          <button
            key={v.id}
            onClick={() => click(v.value)}
            style={{
              ...btn,
              background:
                "rgba(255,255,255,0.06)",
              color: "#fff"
            }}
          >
            {v.value}
          </button>
        ))}
      </div>

      <button
        onClick={start}
        style={{
          padding: "12px 36px",
          borderRadius: 16,
          background:
            "linear-gradient(90deg,#00e5ff,#0066ff)",
          border: "none",
          fontWeight: 900,
          marginTop: 8
        }}
      >
        {started
          ? "PLAYING"
          : "START"}
      </button>

      {end && (
        <div style={card}>

          <h2>GAME OVER</h2>

          <h1>{score}</h1>

          <h2>
            RANK {getRank(score)}
          </h2>

          {newRecord && (
            <h2
              style={{
                color: "#ffd700"
              }}
            >
              🏆 最高スコア更新！
            </h2>
          )}

        </div>
      )}

    </div>
  );
}

/* =========================
   PRIME JUDGE
========================= */

function PrimeJudge({ back }) {

  const MAX_Q = 20;

  const [num, setNum] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [q, setQ] =
    useState(1);

  const [msg, setMsg] =
    useState("READY");

  const [end, setEnd] =
    useState(false);

  const [time, setTime] =
    useState(0);

  const [started, setStarted] =
    useState(false);

  const [questionStart,
    setQuestionStart] =
    useState(0);

  const [highScore, setHighScore] =
    useState(
      getHighScore("prime_judge")
    );

  const [newRecord, setNewRecord] =
    useState(false);

  useEffect(() => {

    if (!started) return;

    const globalStart = Date.now();

    const id = setInterval(() => {

      setTime(
        (Date.now() - globalStart)
        / 1000
      );

    }, 100);

    return () => clearInterval(id);

  }, [started]);

  const nextQuestion = (currentQ) => {

    let n;

    const givePrime =
      Math.random() < 0.5;

    if (givePrime) {

      const primes = [...primePool];

      n =
        primes[
          (Math.random() * primes.length) | 0
        ];

    } else {

      while (true) {

        n =
          ((Math.random() * 990) | 0)
          + 10;

        if (isPrime(n)) continue;

        if (
          currentQ >= 16 &&
          (
            n % 2 === 0 ||
            n % 3 === 0 ||
            n % 5 === 0 ||
            n % 10 === 0
          )
        ) {
          continue;
        }

        break;
      }
    }

    setNum(n);

    setQuestionStart(Date.now());
  };

  const finishGame = (finalScore) => {

    const isNew =
      saveHighScore(
        "prime_judge",
        finalScore
      );

    if (isNew) {

      setHighScore(finalScore);

      setNewRecord(true);

      setMsg("🏆 最高スコア更新！");
    }

    setEnd(true);

    setStarted(false);
  };

  const start = () => {

    setScore(0);

    setQ(1);

    setMsg("GO!");

    setEnd(false);

    setTime(0);

    setStarted(true);

    setNewRecord(false);

    nextQuestion(1);
  };

  const answer = (prime) => {

    if (!started || end) return;

    const correct =
      isPrime(num);

    const answerTime =
      (Date.now() - questionStart)
      / 1000;

    const baseScore =
      calcScore(answerTime);

    let nextScore = score;

    if (prime === correct) {

      nextScore += baseScore;

      setScore(nextScore);

      setMsg(`✔ +${baseScore}`);

    } else {

      const reduced =
        Math.round(baseScore / 5);

      nextScore += reduced;

      setScore(nextScore);

      setMsg(`✖ +${reduced}`);
    }

    const next = q + 1;

    if (next > MAX_Q) {

      finishGame(nextScore);

      return;
    }

    setQ(next);

    nextQuestion(next);
  };

  return (
    <div style={bg}>

      <h1 style={title}>
        PRIME JUDGE
      </h1>

      <button
        onClick={back}
        style={{
          marginBottom: 8,
          background: "transparent",
          color: "#aaa",
          border: "1px solid #333",
          padding: 6,
          borderRadius: 10
        }}
      >
        ← HOME
      </button>

      <div style={card}>

        <div>
          Score: {score}
        </div>

        <div>
          High Score: {highScore}
        </div>

        <div>
          Q: {q}/{MAX_Q}
        </div>

        <div>
          Total Time:
          {" "}
          {time.toFixed(1)}s
        </div>

      </div>

      <div
        style={{
          fontSize: 72,
          marginTop: 24,
          color: "#00e5ff",
          textShadow:
            "0 0 20px #0066ff"
        }}
      >
        {num}
      </div>

      <div
        style={{
          fontSize: 18,
          marginTop: 16,
          minHeight: 30,
          fontWeight: 800,
          color:
            msg.includes("✔")
            ? "#00ffb3"
            : msg.includes("🏆")
            ? "#ffd700"
            : "#ff4d6d"
        }}
      >
        {msg}
      </div>

      {!started && !end && (
        <button
          onClick={start}
          style={{
            marginTop: 20,
            padding: "12px 36px",
            borderRadius: 16,
            background:
              "linear-gradient(90deg,#00e5ff,#0066ff)",
            border: "none",
            fontWeight: 900
          }}
        >
          START
        </button>
      )}

      {started && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 24
          }}
        >

          <button
            onClick={() => answer(true)}
            style={{
              ...btn,
              width: 150,
              background: "#00ff99"
            }}
          >
            PRIME
          </button>

          <button
            onClick={() => answer(false)}
            style={{
              ...btn,
              width: 150,
              background: "#ff4d4d"
            }}
          >
            NOT
          </button>

        </div>
      )}

      {end && (
        <div style={card}>

          <h2>FINISH</h2>

          <h1>{score}</h1>

          <h2>
            RANK {getRank(score)}
          </h2>

          {newRecord && (
            <h2
              style={{
                color: "#ffd700"
              }}
            >
              🏆 最高スコア更新！
            </h2>
          )}

        </div>
      )}

    </div>
  );
}

/* =========================
   APP
========================= */

export default function App() {

  const [mode, setMode] =
    useState("home");

  if (mode === "game") {

    return (
      <PrimeDodge
        back={() => setMode("home")}
      />
    );
  }

  if (mode === "judge") {

    return (
      <PrimeJudge
        back={() => setMode("home")}
      />
    );
  }

  return (
    <div style={bg}>

      <h1 style={title}>
        PRIME SYSTEM
      </h1>

      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center"
        }}
      >

        <button
          onClick={() => setMode("game")}
          style={{
            width: 280,
            padding: 14,
            borderRadius: 14,
            fontWeight: 800
          }}
        >
          PRIME DODGE
        </button>

        <button
          onClick={() => setMode("judge")}
          style={{
            width: 280,
            padding: 14,
            borderRadius: 14,
            fontWeight: 800
          }}
        >
          PRIME JUDGE
        </button>

      </div>

    </div>
  );
}