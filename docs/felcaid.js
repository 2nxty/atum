(function () {
  "use strict";

  /* ─── Config ─────────────────────────────────────────── */
  const CACHE_KEY = "felcaid_v01_" + location.hostname;
  const MIN_AGE   = 18;

  const QUESTIONS = [
    {
      text: "Em que ano o Brasil se tornou <strong>pentacampeão</strong> mundial?",
      options: ["1994", "1998", "2002"],
      answer: "2002",
    },
    {
      text: "Em qual governo brasileiro foram <strong>criados mais impostos</strong>?",
      options: ["FHC", "Lula", "Bolsonaro"],
      answer: "Lula",
    },
    {
      text: "Qual é a cor do <strong>cavalo branco</strong> de Napoleão?",
      options: ["Cinza", "Branco", "Bege"],
      answer: "Branco",
    },
  ];

  /* ─── Guard: already verified ─────────────────────────── */
  try {
    if (localStorage.getItem(CACHE_KEY) === "1") return;
  } catch (_) {}

  /* ─── State ───────────────────────────────────────────── */
  let step     = 0;   // 0 = age, 1-3 = questions
  let wrong    = 0;   // wrong answers this session
  let age      = "";

  /* ─── Inject styles ───────────────────────────────────── */
  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&display=swap');

    #felcaid-root *{box-sizing:border-box;margin:0}

    #felcaid-root{
      position:fixed;inset:0;z-index:2147483647;
      background:#0d0d18;
      display:flex;align-items:center;justify-content:center;
      font-family:'Sora',sans-serif;
      overflow:hidden;
    }

    #felcaid-card{
      position:relative;z-index:1;
      width:min(420px,92vw);
      background:rgba(16,16,28,.85);
      border:1px solid rgba(99,102,241,.25);
      border-radius:20px;
      padding:40px 36px 36px;
      backdrop-filter:blur(24px);
      box-shadow:0 0 80px rgba(99,102,241,.12),0 24px 64px rgba(0,0,0,.6);
      animation:felcaid-in .45s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes felcaid-in{
      from{opacity:0;transform:translateY(28px) scale(.97)}
      to{opacity:1;transform:none}
    }

    #felcaid-logo{
      display:flex;align-items:center;gap:10px;
      margin-bottom:28px;
    }
    #felcaid-logo svg{flex-shrink:0}
    #felcaid-logo-text{
      font-size:22px;font-weight:700;letter-spacing:-.5px;
      color:#fff;
    }
    #felcaid-logo-text span{color:#818cf8}

    #felcaid-progress{
      display:flex;gap:6px;margin-bottom:28px;
    }
    .felcaid-dot{
      flex:1;height:3px;border-radius:99px;
      background:rgba(255,255,255,.1);
      transition:background .3s;
    }
    .felcaid-dot.active{background:#6366f1}
    .felcaid-dot.done{background:#34d399}

    #felcaid-title{
      font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
      color:#6366f1;margin-bottom:10px;
    }
    #felcaid-question{
      font-size:17px;font-weight:400;line-height:1.55;
      color:rgba(255,255,255,.9);margin-bottom:28px;
    }
    #felcaid-question strong{color:#fff;font-weight:600}

    /* age input */
    #felcaid-age-wrap{
      display:flex;gap:12px;align-items:stretch;
    }
    #felcaid-age-input{
      flex:1;
      background:rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.12);
      border-radius:10px;
      padding:14px 18px;
      font-size:24px;font-weight:600;
      font-family:inherit;
      color:#fff;
      outline:none;
      text-align:center;
      letter-spacing:.05em;
      transition:border-color .2s,background .2s;
      width:100%;
    }
    #felcaid-age-input:focus{
      border-color:#6366f1;
      background:rgba(99,102,241,.08);
    }
    #felcaid-age-input::placeholder{color:rgba(255,255,255,.2)}

    /* options */
    #felcaid-options{display:flex;flex-direction:column;gap:12px}
    .felcaid-opt{
      background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1);
      border-radius:12px;
      padding:18px 22px;
      color:rgba(255,255,255,.85);
      font-family:inherit;font-size:16px;font-weight:500;
      cursor:pointer;text-align:left;
      transition:border-color .18s,background .18s,color .18s,transform .12s;
      line-height:1.3;
    }
    .felcaid-opt:hover{
      border-color:rgba(99,102,241,.5);
      background:rgba(99,102,241,.1);
      color:#fff;
      transform:translateX(4px);
    }
    .felcaid-opt.correct{
      border-color:#34d399;background:rgba(52,211,153,.12);color:#34d399;
    }
    .felcaid-opt.wrong-ans{
      border-color:#f87171;background:rgba(248,113,113,.1);color:#f87171;
    }

    /* primary button */
    #felcaid-btn{
      margin-top:20px;width:100%;
      background:linear-gradient(135deg,#6366f1,#818cf8);
      border:none;border-radius:10px;
      padding:15px;
      font-family:inherit;font-size:15px;font-weight:600;
      color:#fff;cursor:pointer;
      letter-spacing:.03em;
      transition:opacity .2s,transform .12s,box-shadow .2s;
      box-shadow:0 4px 24px rgba(99,102,241,.35);
    }
    #felcaid-btn:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 6px 32px rgba(99,102,241,.45)}
    #felcaid-btn:active{transform:translateY(0)}
    #felcaid-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}

    /* feedback */
    #felcaid-feedback{
      margin-top:14px;
      font-size:13px;text-align:center;
      min-height:18px;
      transition:opacity .25s;
    }
    #felcaid-feedback.error{color:#f87171}
    #felcaid-feedback.success{color:#34d399}

    /* success screen */
    #felcaid-success{
      text-align:center;
      animation:felcaid-in .4s cubic-bezier(.22,1,.36,1) both;
    }
    #felcaid-success-icon{
      width:64px;height:64px;margin:0 auto 20px;
      background:rgba(52,211,153,.12);
      border:1px solid rgba(52,211,153,.3);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
    }
    #felcaid-success h2{
      font-size:20px;font-weight:700;color:#fff;margin-bottom:8px;
    }
    #felcaid-success p{
      font-size:14px;color:rgba(255,255,255,.5);line-height:1.6;
    }

    /* footer */
    #felcaid-footer{
      margin-top:28px;
      font-size:11px;color:rgba(255,255,255,.2);
      text-align:center;letter-spacing:.04em;
    }
    #felcaid-footer a{color:rgba(99,102,241,.6);text-decoration:none}
  `;

  /* ─── DOM ─────────────────────────────────────────────── */
  const styleEl = document.createElement("style");
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  const root = document.createElement("div");
  root.id = "felcaid-root";
  root.innerHTML = `
    <div id="felcaid-card">
      <div id="felcaid-logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L4 7V15.5C4 21.9 9.4 27.7 16 30C22.6 27.7 28 21.9 28 15.5V7L16 2Z" fill="rgba(99,102,241,.15)" stroke="#6366f1" stroke-width="1.5"/>
          <path d="M11 16l3.5 3.5L21 12" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div id="felcaid-logo-text">Felca<span>ID</span></div>
      </div>

      <div id="felcaid-progress"></div>

      <div id="felcaid-body"></div>

      <div id="felcaid-footer">
        Verificação segura por <a href="#" onclick="return false">FelcaID</a> &bull; Seus dados não são armazenados
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const $body     = root.querySelector("#felcaid-body");
  const $progress = root.querySelector("#felcaid-progress");

  /* ─── Progress dots ───────────────────────────────────── */
  function renderProgress() {
    const total = QUESTIONS.length + 1; // age + 3 questions
    $progress.innerHTML = Array.from({ length: total }, (_, i) => {
      const cls = i < step ? "done" : i === step ? "active" : "";
      return `<div class="felcaid-dot ${cls}"></div>`;
    }).join("");
  }

  /* ─── Shake animation ─────────────────────────────────── */
  function shake(el) {
    el.style.animation = "none";
    el.offsetWidth; // reflow
    el.style.animation = "";
    const card = root.querySelector("#felcaid-card");
    card.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 380, easing: "ease-out" }
    );
  }

  /* ─── Step 0: Age input ───────────────────────────────── */
  function renderAge() {
    $body.innerHTML = `
      <div id="felcaid-title">Verificação de Acesso</div>
      <div id="felcaid-question">Qual é a sua <strong>idade</strong>?</div>
      <div id="felcaid-age-wrap">
        <input id="felcaid-age-input" type="number" min="1" max="120"
               placeholder="00" autocomplete="off" inputmode="numeric"/>
      </div>
      <button id="felcaid-btn">Continuar →</button>
      <div id="felcaid-feedback"></div>
    `;

    const input    = $body.querySelector("#felcaid-age-input");
    const btn      = $body.querySelector("#felcaid-btn");
    const feedback = $body.querySelector("#felcaid-feedback");

    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btn.click();
    });

    btn.addEventListener("click", () => {
      const v = parseInt(input.value, 10);
      if (!v || v < 1 || v > 120) {
        feedback.className = "error";
        feedback.textContent = "Por favor, insira uma idade válida.";
        shake(input);
        return;
      }
      if (v < MIN_AGE) {
        feedback.className = "error";
        feedback.textContent = `Acesso restrito. Você precisa ter pelo menos ${MIN_AGE} anos.`;
        shake(input);
        return;
      }
      age = v;
      step = 1;
      renderStep();
    });
  }

  /* ─── Steps 1-3: Questions ────────────────────────────── */
  function renderQuestion() {
    const q    = QUESTIONS[step - 1];
    const opts = [...q.options].sort(() => Math.random() - .5);

    $body.innerHTML = `
      <div id="felcaid-title">Pergunta ${step} de ${QUESTIONS.length}</div>
      <div id="felcaid-question">${q.text}</div>
      <div id="felcaid-options">
        ${opts.map((o) => `<button class="felcaid-opt" data-val="${o}">${o}</button>`).join("")}
      </div>
      <div id="felcaid-feedback"></div>
    `;

    const feedback = $body.querySelector("#felcaid-feedback");

    $body.querySelectorAll(".felcaid-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        $body.querySelectorAll(".felcaid-opt").forEach((b) => (b.disabled = true));

        if (btn.dataset.val === q.answer) {
          btn.classList.add("correct");
          feedback.className = "success";
          feedback.textContent = "Correto! ✓";
          step++;
          setTimeout(renderStep, 700);
        } else {
          btn.classList.add("wrong-ans");
          const correct = $body.querySelector(`[data-val="${q.answer}"]`);
          if (correct) correct.classList.add("correct");
          feedback.className = "error";
          feedback.textContent = "Resposta incorreta. Reiniciando…";
          wrong++;
          shake(btn);
          setTimeout(() => {
            step = 1;
            renderStep();
          }, 1600);
        }
      });
    });
  }

  /* ─── Success ─────────────────────────────────────────── */
  function renderSuccess() {
    $body.innerHTML = `
      <div id="felcaid-success">
        <div id="felcaid-success-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l5.5 5.5L22 8" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Acesso Liberado</h2>
        <p>Identidade verificada com sucesso.</p>
      </div>
    `;
    $progress.innerHTML = Array.from({ length: QUESTIONS.length + 1 }, () =>
      `<div class="felcaid-dot done"></div>`
    ).join("");

    try { localStorage.setItem(CACHE_KEY, "1"); } catch (_) {}

    setTimeout(() => {
      root.style.transition = "opacity .5s";
      root.style.opacity    = "0";
      setTimeout(() => root.remove(), 520);
    }, 1200);
  }

  /* ─── Router ──────────────────────────────────────────── */
  function renderStep() {
    renderProgress();
    $body.innerHTML = "";

    if (step === 0)                    return renderAge();
    if (step <= QUESTIONS.length)      return renderQuestion();
    return renderSuccess();
  }

  renderStep();
})();
