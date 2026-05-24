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
STORAGE & REGISTER SYSTEM
========================= */
const getRegisteredUser = () => localStorage.getItem("prime_reg_name") || "";
const getRegisteredPass = () => localStorage.getItem("prime_reg_pass") || "";

const registerDeviceUser = (name, pass) => {
  localStorage.setItem("prime_reg_name", name);
  localStorage.setItem("prime_reg_pass", pass);
};

const getLoggedUser = () => localStorage.getItem("prime_logged_in_user") || "";
const setLoggedUser = (name) => {
  if (name) {
    localStorage.setItem("prime_logged_in_user", name);
  } else {
    localStorage.removeItem("prime_logged_in_user");
  }
};

const getRanking = () => JSON.parse(localStorage.getItem("prime_ranking") || "[]");
const saveRanking = (ranking) => localStorage.setItem("prime_ranking", JSON.stringify(ranking));

const addRanking = (name, score, mode) => {
  const ranking = getRanking();
  const existingIndex = ranking.findIndex(r => r.name === name && r.mode === mode);

  if (existingIndex !== -1) {
    if (score > ranking[existingIndex].score) {
      ranking[existingIndex].score = score;
    }
  } else {
    ranking.push({ name, score, mode });
  }

  // スコアの降順にソート（制限なしで全記録を一度保持し、表示側で制御または多めに残す）
  ranking.sort((a, b) => b.score - a.score);
  // 正確なパーセンテージと順位を出すため、上限は100件程度に拡張
  saveRanking(ranking.slice(0, 100));
};

/* =========================
STYLE & THEME
========================= */
const bg = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #121225, #050508)",
  color: "#fff",
  textAlign: "center",
  paddingTop: 20,
  paddingBottom: 40,
  fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  overflowX: "hidden"
};
const title = {
  fontSize: 44,
  letterSpacing: 6,
  fontWeight: 900,
  background: "linear-gradient(45deg, #00e5ff, #0066ff)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textShadow: "0 0 20px rgba(0,229,255,0.4)",
  margin: "10px 0 20px 0"
};
const card = {
  background: "linear-gradient(135deg, rgba(25,25,40,0.85), rgba(15,15,25,0.95))",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: 22,
  padding: 20,
  width: 340,
  margin: "15px auto",
  boxShadow: "0 15px 35px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)"
};
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 12,
  width: 340,
  margin: "15px auto"
};
const btnBase = {
  height: 65,
  fontSize: 22,
  borderRadius: 16,
  border: "none",
  cursor: "pointer",
  fontWeight: 800,
  transition: "all 0.2s ease"
};
const menuBtn = {
  width: 280,
  padding: 16,
  borderRadius: 16,
  fontWeight: 800,
  fontSize: 16,
  border: "1px solid rgba(0,229,255,0.3)",
  background: "linear-gradient(90deg, #0052d4, #4364f7, #6fb1fc)",
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(67, 100, 247, 0.4)",
  letterSpacing: 1
};
const inputStyle = {
  width: "90%",
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  marginTop: 12,
  backgroundColor: "rgba(0,0,0,0.4)",
  color: "#00e5ff",
  fontSize: 16,
  textAlign: "center",
  outline: "none",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
};

/* =========================
UTIL
========================= */
const shuffle = (a) => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const getRange = (q) =>
  q < 7 ? { min: 10, max: 99 } :
  q < 11 ? { min: 100, max: 199 } :
  q < 16 ? { min: 200, max: 499 } : { min: 500, max: 999 };

const calcScore = (time) => Math.round(10000 / (1 + (time / 3)));
const getRank = (score) => {
  if (score >= 150000) return "S";
  if (score >= 120000) return "A";
  if (score >= 90000) return "B";
  if (score >= 60000) return "C";
  return "D";
};

/* =========================
GENERATE
========================= */
function generateNumbers(q) {
  const { min, max } = getRange(q);
  const used = new Set();
  const primes = [...primePool].filter((p) => p >= min && p <= max);
  const arr = [{ value: primes[(Math.random() * primes.length) | 0], id: "p0" }];
  used.add(arr[0].value);
  while (arr.length < 9) {
    const n = ((Math.random() * (max - min + 1)) | 0) + min;
    if (isPrime(n)) continue;
    if (used.has(n)) continue;
    used.add(n);
    arr.push({ value: n, id: n });
  }
  return shuffle(arr);
}

/* =========================
RANKING
========================= */
function Ranking({ back, currentUser }) {
  const ranking = getRanking();

  // 現在のユーザーの各モードでの最高位を計算
  const getMyStats = (mode) => {
    const modeList = ranking.filter(r => r.mode === mode);
    const totalCount = modeList.length;
    if (totalCount === 0) return null;

    const myIndex = modeList.findIndex(r => r.name === currentUser);
    if (myIndex === -1) return null;

    const rank = myIndex + 1;
    // 上位パーセンテージ計算 (1人の場合は上位100%)
    const percentage = totalCount === 1 ? 100 : Math.round((rank / totalCount) * 100);

    return { rank, total: totalCount, percentage };
  };

  const dodgeStats = getMyStats("DODGE");
  const judgeStats = getMyStats("JUDGE");

  // メダル色などのスタイル定義
  const getRankStyle = (idx) => {
    if (idx === 0) return { color: "#ffd700", fontWeight: "bold" }; // 金
    if (idx === 1) return { color: "#c0c0c0", fontWeight: "bold" }; // 銀
    if (idx === 2) return { color: "#cd7f32", fontWeight: "bold" }; // 銅
    return { color: "#fff" };
  };

  return (
    <div style={bg}>
      <h1 style={title}>RANKING</h1>
      <button onClick={back} style={{ marginBottom: 15, padding: "10px 24px", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontWeight: "bold" }}>← HOME</button>
      
      {/* ★ あなたの統計エリア */}
      <div style={{ ...card, borderColor: "#00ff99", background: "linear-gradient(135deg, rgba(0,50,30,0.6), rgba(15,15,25,0.95))" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#00ff99", fontSize: 16, letterSpacing: 1 }}>YOUR STATS ({currentUser})</h3>
        
        <div style={{ display: "flex", justifyContent: "space-around", fontSize: 13, borderTop: "1px solid rgba(0,255,153,0.2)", paddingTop: 10 }}>
          <div>
            <div style={{ color: "#aaa" }}>DODGE</div>
            {dodgeStats ? (
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 18, color: "#00e5ff", fontWeight: "bold" }}>{dodgeStats.rank}</span> / {dodgeStats.total} 位<br />
                <span style={{ color: "#00ff99" }}>上位 {dodgeStats.percentage}%</span>
              </div>
            ) : <div style={{ color: "#666", marginTop: 4 }}>NO DATA</div>}
          </div>
          <div style={{ width: 1, backgroundColor: "rgba(0,255,153,0.2)" }}></div>
          <div>
            <div style={{ color: "#aaa" }}>JUDGE</div>
            {judgeStats ? (
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 18, color: "#00e5ff", fontWeight: "bold" }}>{judgeStats.rank}</span> / {judgeStats.total} 位<br />
                <span style={{ color: "#00ff99" }}>上位 {judgeStats.percentage}%</span>
              </div>
            ) : <div style={{ color: "#666", marginTop: 4 }}>NO DATA</div>}
          </div>
        </div>
      </div>

      {/* リーダーボード本体 */}
      <div style={{ ...card, width: 360 }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#4364f7", fontSize: 15 }}>TOP BOARDS</h3>
        {ranking.length === 0 && <div style={{ color: "#666", padding: 20 }}>NO DATA</div>}
        
        <div style={{ maxHeight: "40vh", overflowY: "auto", paddingRight: 5 }}>
          {ranking.slice(0, 20).map((r, i) => {
            const isMe = r.name === currentUser;
            return (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                marginBottom: 8,
                borderRadius: 10,
                background: isMe ? "rgba(0, 229, 255, 0.15)" : "rgba(255,255,255,0.03)",
                border: isMe ? "1px solid rgba(0, 229, 255, 0.4)" : "1px solid transparent"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 24, textAlign: "left", ...getRankStyle(i) }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <span style={{ fontWeight: isMe ? "bold" : "normal", color: isMe ? "#00e5ff" : "#fff" }}>
                    {r.name} {isMe && <span style={{ fontSize: 10, color: "#00ff99" }}>(YOU)</span>}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: "bold", color: "#fff" }}>{r.score}</div>
                  <div style={{ fontSize: 10, color: r.mode === "DODGE" ? "#ff007f" : "#00ff99" }}>{r.mode}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================
PRIME DODGE
========================= */
function PrimeDodge({ back, user }) {
  const MAX_Q = 20;
  const [score, setScore] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [q, setQ] = useState(1);
  const [msg, setMsg] = useState("READY");
  const [started, setStarted] = useState(false);
  const [end, setEnd] = useState(false);
  const [questionStart, setQuestionStart] = useState(0);

  const start = () => {
    setScore(0);
    setQ(1);
    setEnd(false);
    setStarted(true);
    setMsg("GO!");
    setNumbers(generateNumbers(1));
    setQuestionStart(Date.now());
  };

  const finishGame = (final) => {
    addRanking(user, final, "DODGE");
    setEnd(true);
    setStarted(false);
  };

  const click = (n) => {
    if (!started) return;
    const answerTime = (Date.now() - questionStart) / 1000;
    const base = calcScore(answerTime);
    let nextScore = score;
    if (isPrime(n)) {
      nextScore += base;
      setMsg(`✔ +${base}`);
    } else {
      nextScore += Math.round(base / 5);
      setMsg("✖");
    }
    setScore(nextScore);
    const next = q + 1;
    if (next > MAX_Q) {
      finishGame(nextScore);
      return;
    }
    setQ(next);
    setNumbers(generateNumbers(next));
    setQuestionStart(Date.now());
  };

  return (
    <div style={bg}>
      <h1 style={title}>PRIME DODGE</h1>
      <button onClick={back} style={{ padding: "6px 16px", borderRadius: 8, background: "none", color: "#aaa", border: "1px solid #444", cursor: "pointer" }}>← HOME</button>
      
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
        <div style={{ textAlign: "left" }}><span style={{ color: "#aaa", fontSize: 12 }}>PLAYER</span><br /><b style={{ color: "#00e5ff" }}>{user}</b></div>
        <div style={{ textAlign: "center" }}><span style={{ color: "#aaa", fontSize: 12 }}>SCORE</span><br /><b style={{ color: "#ffd700", fontSize: 20 }}>{score}</b></div>
        <div style={{ textAlign: "right" }}><span style={{ color: "#aaa", fontSize: 12 }}>PROGRESS</span><br /><b>{q}/{MAX_Q}</b></div>
      </div>

      <div style={{ fontSize: 24, minHeight: 40, margin: "15px 0", color: msg.includes("✔") ? "#00ff99" : msg === "✖" ? "#ff4d4d" : "#00e5ff", fontWeight: "bold" }}>{msg}</div>
      
      <div style={grid}>
        {numbers.map((v) => (
          <button key={v.id} onClick={() => click(v.value)} style={{ ...btnBase, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
            {v.value}
          </button>
        ))}
      </div>
      {!started && !end && <button onClick={start} style={{ ...menuBtn, width: 200, marginTop: 15 }}>START</button>}
      {end && (
        <div style={{ ...card, border: "2px solid #ffd700" }}>
          <h2 style={{ color: "#ffd700", margin: "5px 0" }}>GAME OVER</h2>
          <h1 style={{ fontSize: 40, margin: "10px 0", textShadow: "0 0 10px rgba(255,215,0,0.3)" }}>{score}</h1>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>RANK <span style={{ color: "#00e5ff", fontSize: 24 }}>{getRank(score)}</span></div>
        </div>
      )}
    </div>
  );
}

/* =========================
PRIME JUDGE
========================= */
function PrimeJudge({ back, user }) {
  const MAX_Q = 20;
  const [num, setNum] = useState(0);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(1);
  const [msg, setMsg] = useState("READY");
  const [started, setStarted] = useState(false);
  const [end, setEnd] = useState(false);
  const [questionStart, setQuestionStart] = useState(0);

  const nextQuestion = () => {
    const arr = [...primePool];
    const givePrime = Math.random() < 0.5;
    let n;
    if (givePrime) {
      n = arr[(Math.random() * arr.length) | 0];
    } else {
      while (true) {
        n = ((Math.random() * 990) | 0) + 10;
        if (!isPrime(n)) break;
      }
    }
    setNum(n);
    setQuestionStart(Date.now());
  };

  const start = () => {
    setScore(0);
    setQ(1);
    setStarted(true);
    setEnd(false);
    nextQuestion();
  };

  const finishGame = (final) => {
    addRanking(user, final, "JUDGE");
    setEnd(true);
    setStarted(false);
  };

  const answer = (prime) => {
    const correct = isPrime(num);
    const answerTime = (Date.now() - questionStart) / 1000;
    const base = calcScore(answerTime);
    let nextScore = score;
    if (prime === correct) {
      nextScore += base;
      setMsg(`✔ +${base}`);
    } else {
      nextScore += Math.round(base / 5);
      setMsg("✖");
    }
    setScore(nextScore);
    const next = q + 1;
    if (next > MAX_Q) {
      finishGame(nextScore);
      return;
    }
    setQ(next);
    nextQuestion();
  };

  return (
    <div style={bg}>
      <h1 style={title}>PRIME JUDGE</h1>
      <button onClick={back} style={{ padding: "6px 16px", borderRadius: 8, background: "none", color: "#aaa", border: "1px solid #444", cursor: "pointer" }}>← HOME</button>
      
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
        <div style={{ textAlign: "left" }}><span style={{ color: "#aaa", fontSize: 12 }}>PLAYER</span><br /><b style={{ color: "#00e5ff" }}>{user}</b></div>
        <div style={{ textAlign: "center" }}><span style={{ color: "#aaa", fontSize: 12 }}>SCORE</span><br /><b style={{ color: "#ffd700", fontSize: 20 }}>{score}</b></div>
        <div style={{ textAlign: "right" }}><span style={{ color: "#aaa", fontSize: 12 }}>PROGRESS</span><br /><b>{q}/{MAX_Q}</b></div>
      </div>

      <div style={{ fontSize: 90, marginTop: 20, fontWeight: 900, color: "#fff", textShadow: "0 0 25px rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>{num}</div>
      <div style={{ minHeight: 30, margin: "10px 0", color: msg.includes("✔") ? "#00ff99" : msg === "✖" ? "#ff4d4d" : "#00e5ff", fontWeight: "bold", fontSize: 20 }}>{msg}</div>
      
      {!started && !end && <button onClick={start} style={{ ...menuBtn, width: 200, marginTop: 15 }}>START</button>}
      {started && (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 15 }}>
          <button onClick={() => answer(true)} style={{ ...btnBase, width: 140, background: "linear-gradient(135deg, #00b09b, #96c93d)", color: "#fff", boxShadow: "0 4px 15px rgba(0,176,155,0.4)" }}>PRIME</button>
          <button onClick={() => answer(false)} style={{ ...btnBase, width: 140, background: "linear-gradient(135deg, #ff416c, #ff4b2b)", color: "#fff", boxShadow: "0 4px 15px rgba(255,65,108,0.4)" }}>NOT</button>
        </div>
      )}
      {end && (
        <div style={{ ...card, border: "2px solid #ffd700" }}>
          <h2 style={{ color: "#ffd700", margin: "5px 0" }}>FINISH</h2>
          <h1 style={{ fontSize: 40, margin: "10px 0", textShadow: "0 0 10px rgba(255,215,0,0.3)" }}>{score}</h1>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>RANK <span style={{ color: "#00e5ff", fontSize: 24 }}>{getRank(score)}</span></div>
        </div>
      )}
    </div>
  );
}

/* =========================
APP (MAIN CONTROLLER)
========================= */
export default function App() {
  const [mode, setMode] = useState("login"); 
  const [inputName, setInputName] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    setLoggedUser(""); 
    const registeredName = getRegisteredUser();
    if (registeredName) {
      setHasAccount(true);
      setInputName(registeredName); 
    } else {
      setHasAccount(false);
    }
  }, []);

  const handleAuth = () => {
    const trimmedName = inputName.trim();
    if (!trimmedName || !password) {
      setAuthMsg("名前とパスワードを入力してください");
      return;
    }

    if (!hasAccount) {
      registerDeviceUser(trimmedName, password);
      setLoggedUser(trimmedName);
      setAuthMsg("");
      setHasAccount(true);
      setMode("home");
    } else {
      const correctPass = getRegisteredPass();
      if (password === correctPass) {
        setLoggedUser(trimmedName);
        setAuthMsg("");
        setMode("home");
      } else {
        setAuthMsg("パスワードが違います");
      }
    }
  };

  const handleLogout = () => {
    setLoggedUser("");
    setPassword("");
    setAuthMsg("");
    setInputName(getRegisteredUser()); 
    setMode("login");
  };

  if (mode === "login") {
    return (
      <div style={bg}>
        <h1 style={title}>PRIME SYSTEM</h1>
        <div style={card}>
          <h2 style={{ color: "#00e5ff", margin: "5px 0 15px 0", fontSize: 20 }}>{hasAccount ? "LOGIN" : "INITIAL REGISTRATION"}</h2>
          <p style={{ fontSize: 12, color: "#8a8ab0", padding: "0 10px", lineHeight: "1.5" }}>
            {hasAccount 
              ? "登録済みの専用プレイヤーでログインします" 
              : "【注意】この端末で使用する唯一の名前とパスワードです。登録後の変更・再作成はできません。"}
          </p>
          
          <input
            value={inputName}
            onChange={(e) => !hasAccount && setInputName(e.target.value)} 
            placeholder="PLAYER NAME"
            disabled={hasAccount} 
            style={{
              ...inputStyle,
              backgroundColor: hasAccount ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.5)",
              color: hasAccount ? "#666" : "#00e5ff",
              border: hasAccount ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,229,255,0.3)"
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            style={{ ...inputStyle, border: "1px solid rgba(0,229,255,0.3)" }}
          />

          {authMsg && <div style={{ color: "#ff4d4d", marginTop: 12, fontSize: 14, fontWeight: "bold" }}>{authMsg}</div>}

          <button onClick={handleAuth} style={{ ...menuBtn, width: "95%", marginTop: 25, height: 50, padding: 0 }}>
            {hasAccount ? "ログイン" : "登録してゲームを始める"}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "game") {
    return <PrimeDodge user={getLoggedUser()} back={() => setMode("home")} />;
  }

  if (mode === "judge") {
    return <PrimeJudge user={getLoggedUser()} back={() => setMode("home")} />;
  }

  if (mode === "ranking") {
    return <Ranking back={() => setMode("home")} currentUser={getLoggedUser()} />;
  }

  // HOME 画面
  return (
    <div style={bg}>
      <h1 style={title}>PRIME SYSTEM</h1>
      
      <div style={{ ...card, border: "1px solid rgba(0,255,153,0.2)" }}>
        <div style={{ fontSize: 14, color: "#aaa" }}>CURRENT PLAYER</div>
        <div style={{ fontSize: 22, color: "#00ff99", fontWeight: "bold", marginTop: 4 }}>{getLoggedUser()}</div>
        <button onClick={handleLogout} style={{ marginTop: 12, padding: "6px 14px", fontSize: 11, borderRadius: 8, background: "rgba(255,77,77,0.1)", color: "#ff4d4d", border: "1px solid rgba(255,77,77,0.3)", cursor: "pointer", fontWeight: "bold" }}>LOGOUT</button>
      </div>

      <div style={{ marginTop: 35, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <button onClick={() => setMode("game")} style={{ ...menuBtn, background: "linear-gradient(90deg, #ff007f, #7928ca)" }}>PRIME DODGE</button>
        <button onClick={() => setMode("judge")} style={{ ...menuBtn, background: "linear-gradient(90deg, #00ea97, #028a57)" }}>PRIME JUDGE</button>
        <button onClick={() => setMode("ranking")} style={{ ...menuBtn, background: "linear-gradient(90deg, #00b4db, #0083b0)", border: "1px solid rgba(0,229,255,0.4)" }}>RANKING</button>
      </div>
    </div>
  );
}