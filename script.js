const REST_BETWEEN_SETS = 60;
const REST_BETWEEN_EXERCISES = 120;

const routines = {
  A: {
    name: "루틴 A",
    focus: "하체 중심 + 등/가슴",
    exercises: [
      {
        name: "레그 프레스",
        target: "하체 전반 / 엉덩이",
        sets: 4,
        reps: "12회",
        visual: "legPress",
        cue: "발판의 위쪽에 발을 넓게 대고, 발뒤꿈치로 묵직하게 밀어내세요."
      },
      {
        name: "레그 컬",
        target: "허벅지 뒷면",
        sets: 3,
        reps: "15회",
        visual: "legCurl",
        cue: "무릎을 접으며 패드를 당기고, 돌아갈 때는 천천히 버티세요."
      },
      {
        name: "랫 풀 다운",
        target: "등 상부",
        sets: 4,
        reps: "12회",
        visual: "latPulldown",
        cue: "가슴을 세운 상태에서 바를 쇄골 쪽으로 당겨 내립니다."
      },
      {
        name: "체스트 프레스 머신",
        target: "가슴 / 팔 뒤쪽",
        sets: 3,
        reps: "12회",
        visual: "chestPress",
        cue: "손잡이를 가슴 앞으로 밀고, 팔꿈치가 완전히 잠기기 전 멈추세요."
      }
    ]
  },
  B: {
    name: "루틴 B",
    focus: "상체 중심 + 엉덩이/복부",
    exercises: [
      {
        name: "시티드 로우",
        target: "등 중부",
        sets: 4,
        reps: "12회",
        visual: "seatedRow",
        cue: "손잡이를 배꼽 쪽으로 당기며 등 가운데를 조여주세요."
      },
      {
        name: "숄더 프레스 머신",
        target: "어깨",
        sets: 3,
        reps: "12회",
        visual: "shoulderPress",
        cue: "어깨가 으쓱 올라가지 않게 누른 채 손잡이를 위로 밀어 올립니다."
      },
      {
        name: "힙 어브덕션 / 아웃 타이",
        target: "엉덩이 측면",
        sets: 4,
        reps: "15회",
        visual: "hipAbduction",
        cue: "다리를 바깥으로 벌린 뒤 1초 멈추고 천천히 모으세요."
      },
      {
        name: "크런치 & 레그레이즈",
        target: "복부",
        sets: 3,
        reps: "각 15회",
        visual: "core",
        cue: "허리가 뜨지 않게 복부를 말아 올리고, 다리는 천천히 내립니다."
      }
    ]
  }
};

const state = {
  routineKey: localStorage.getItem("routineKey") || "A",
  exerciseIndex: Number(localStorage.getItem("exerciseIndex") || 0),
  setIndex: Number(localStorage.getItem("setIndex") || 0),
  mode: localStorage.getItem("mode") || "idle",
  elapsed: Number(localStorage.getItem("elapsed") || 0),
  restLeft: Number(localStorage.getItem("restLeft") || REST_BETWEEN_SETS),
  restType: localStorage.getItem("restType") || "set",
  paused: localStorage.getItem("paused") === "true"
};

const els = {
  body: document.body,
  timerLabel: document.querySelector("#timerLabel"),
  timerValue: document.querySelector("#timerValue"),
  pauseButton: document.querySelector("#pauseButton"),
  pauseIcon: document.querySelector("#pauseIcon"),
  tabA: document.querySelector("#tabA"),
  tabB: document.querySelector("#tabB"),
  routineName: document.querySelector("#routineName"),
  exerciseCount: document.querySelector("#exerciseCount"),
  currentTitle: document.querySelector("#currentTitle"),
  targetText: document.querySelector("#targetText"),
  repText: document.querySelector("#repText"),
  cueText: document.querySelector("#cueText"),
  exerciseVisual: document.querySelector("#exerciseVisual"),
  setStrip: document.querySelector("#setStrip"),
  exerciseList: document.querySelector("#exerciseList"),
  mainButton: document.querySelector("#mainButton"),
  prevButton: document.querySelector("#prevButton"),
  nextButton: document.querySelector("#nextButton"),
  resetButton: document.querySelector("#resetButton")
};

let ticker = window.setInterval(tick, 1000);
let renderedVisual = "";

function currentRoutine() {
  return routines[state.routineKey];
}

function currentExercise() {
  return currentRoutine().exercises[state.exerciseIndex];
}

function saveState() {
  localStorage.setItem("routineKey", state.routineKey);
  localStorage.setItem("exerciseIndex", String(state.exerciseIndex));
  localStorage.setItem("setIndex", String(state.setIndex));
  localStorage.setItem("mode", state.mode);
  localStorage.setItem("elapsed", String(state.elapsed));
  localStorage.setItem("restLeft", String(state.restLeft));
  localStorage.setItem("restType", state.restType);
  localStorage.setItem("paused", String(state.paused));
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function tick() {
  if (state.paused || state.mode === "idle" || state.mode === "finished") {
    render();
    return;
  }

  if (state.mode === "work") {
    state.elapsed += 1;
  }

  if (state.mode === "rest") {
    state.restLeft -= 1;
    if (state.restLeft <= 0) {
      state.mode = "work";
      state.restLeft = REST_BETWEEN_SETS;
      state.restType = "set";
    }
  }

  saveState();
  render();
}

function completeSet() {
  if (state.mode === "idle") {
    state.mode = "work";
    state.paused = false;
    render();
    return;
  }

  if (state.mode === "rest") {
    state.mode = "work";
    state.restLeft = REST_BETWEEN_SETS;
    state.restType = "set";
    render();
    return;
  }

  const exercise = currentExercise();
  const isLastSet = state.setIndex >= exercise.sets - 1;
  const isLastExercise = state.exerciseIndex >= currentRoutine().exercises.length - 1;

  if (!isLastSet) {
    state.setIndex += 1;
    state.mode = "rest";
    state.restLeft = REST_BETWEEN_SETS;
    state.restType = "set";
    render();
    return;
  }

  if (!isLastExercise) {
    state.exerciseIndex += 1;
    state.setIndex = 0;
    state.mode = "rest";
    state.restLeft = REST_BETWEEN_EXERCISES;
    state.restType = "transition";
    render();
    return;
  }

  state.mode = "finished";
  state.paused = true;
  render();
}

function moveExercise(direction) {
  const nextIndex = state.exerciseIndex + direction;
  const max = currentRoutine().exercises.length - 1;
  state.exerciseIndex = Math.min(Math.max(nextIndex, 0), max);
  state.setIndex = 0;
  state.mode = state.mode === "idle" ? "idle" : "work";
  state.restLeft = REST_BETWEEN_SETS;
  state.restType = "set";
  render();
}

function resetWorkout() {
  state.exerciseIndex = 0;
  state.setIndex = 0;
  state.mode = "idle";
  state.elapsed = 0;
  state.restLeft = REST_BETWEEN_SETS;
  state.restType = "set";
  state.paused = false;
  render();
}

function selectRoutine(key) {
  if (state.routineKey === key) return;
  state.routineKey = key;
  resetWorkout();
}

function timerLabel() {
  if (state.mode === "rest") {
    return state.restType === "transition" ? "기구 이동 휴식" : "세트 휴식";
  }
  if (state.mode === "finished") return "완료";
  if (state.mode === "work") return `${currentExercise().name} ${state.setIndex + 1}세트`;
  return "대기 중";
}

function mainButtonLabel() {
  if (state.mode === "idle") return "운동 시작";
  if (state.mode === "rest") return "휴식 넘기기";
  if (state.mode === "finished") return "다시 시작";
  return `${state.setIndex + 1}세트 완료`;
}

function renderSetStrip(exercise) {
  els.setStrip.innerHTML = "";
  for (let index = 0; index < exercise.sets; index += 1) {
    const dot = document.createElement("span");
    dot.className = "set-dot";
    if (state.mode === "finished" || index < state.setIndex) dot.classList.add("done");
    if (index === state.setIndex && state.mode !== "finished") dot.classList.add("current");
    els.setStrip.append(dot);
  }
}

function visualTemplate(type) {
  const visuals = {
    legPress: `
      <svg viewBox="0 0 320 156" role="img">
        <line class="guide-line" x1="230" y1="26" x2="230" y2="132"></line>
        <path class="machine" d="M54 125h190M76 124l38-74h78l44 74M220 42v84"></path>
        <rect class="pad" x="72" y="74" width="74" height="24" rx="7" transform="rotate(-22 109 86)"></rect>
        <rect class="pad moving-pad press-legs" x="216" y="42" width="18" height="78" rx="7"></rect>
        <circle class="head" cx="96" cy="62" r="12"></circle>
        <path class="body-line" d="M106 76l40 28"></path>
        <path class="body-line moving-limb press-legs" d="M146 104l40-18 35 0M145 104l42 16 34 0"></path>
        <circle class="joint moving-limb press-legs" cx="186" cy="86" r="5"></circle>
      </svg>
    `,
    legCurl: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine" d="M52 122h210M80 122V46M80 46h136M232 68v56"></path>
        <rect class="pad" x="84" y="53" width="120" height="24" rx="8"></rect>
        <rect class="pad" x="78" y="82" width="82" height="18" rx="8"></rect>
        <circle class="head" cx="218" cy="58" r="12"></circle>
        <path class="body-line" d="M204 66l-62 22"></path>
        <path class="body-line" d="M142 88l-54 2"></path>
        <path class="body-line moving-limb curl-leg" d="M142 88l58 26"></path>
        <circle class="weight moving-limb curl-leg" cx="204" cy="116" r="10"></circle>
      </svg>
    `,
    latPulldown: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine" d="M66 128h188M92 128V24M92 24h136M228 24v104"></path>
        <rect class="pad" x="126" y="110" width="70" height="16" rx="7"></rect>
        <g class="moving-bar pull-bar">
          <line class="machine-thin" x1="112" y1="38" x2="208" y2="38"></line>
          <path class="body-line" d="M136 50l28 30 28-30"></path>
        </g>
        <circle class="head" cx="164" cy="76" r="12"></circle>
        <path class="body-line" d="M164 88v35M144 124h40"></path>
      </svg>
    `,
    chestPress: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine" d="M68 126h190M86 126V52M86 52h104M230 50v76"></path>
        <rect class="pad" x="88" y="66" width="42" height="56" rx="8"></rect>
        <circle class="head" cx="142" cy="58" r="12"></circle>
        <path class="body-line" d="M132 72l34 35"></path>
        <g class="moving-limb press-arms">
          <path class="body-line" d="M166 88l38 0"></path>
          <line class="machine-thin" x1="204" y1="70" x2="204" y2="106"></line>
          <circle class="weight" cx="238" cy="88" r="13"></circle>
        </g>
      </svg>
    `,
    seatedRow: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine" d="M56 126h210M76 126V78M214 38v88M214 38h40"></path>
        <rect class="pad" x="88" y="94" width="72" height="18" rx="7"></rect>
        <circle class="head" cx="156" cy="62" r="12"></circle>
        <path class="body-line" d="M156 76l-22 36"></path>
        <g class="moving-limb row-arms">
          <path class="body-line" d="M154 82l54 6"></path>
          <line class="machine-thin" x1="210" y1="80" x2="232" y2="96"></line>
        </g>
        <path class="body-line" d="M132 112l-44 10M132 112l-34-24"></path>
      </svg>
    `,
    shoulderPress: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine" d="M66 128h190M92 128V42M230 42v86M92 42h138"></path>
        <rect class="pad" x="104" y="84" width="54" height="40" rx="8"></rect>
        <circle class="head" cx="164" cy="72" r="12"></circle>
        <path class="body-line" d="M158 86v38"></path>
        <g class="moving-limb shoulder-arms">
          <path class="body-line" d="M154 86l-20-30M174 86l20-30"></path>
          <line class="machine-thin" x1="128" y1="52" x2="200" y2="52"></line>
        </g>
      </svg>
    `,
    hipAbduction: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine" d="M62 128h196M88 128V72M232 72v56M88 72h144"></path>
        <rect class="pad" x="124" y="78" width="76" height="22" rx="8"></rect>
        <circle class="head" cx="162" cy="56" r="12"></circle>
        <path class="body-line" d="M162 70v38"></path>
        <g class="moving-limb abduct-legs">
          <path class="body-line" d="M160 108l-54 18M164 108l54 18"></path>
          <rect class="pad" x="88" y="108" width="18" height="28" rx="7"></rect>
          <rect class="pad" x="216" y="108" width="18" height="28" rx="7"></rect>
        </g>
      </svg>
    `,
    core: `
      <svg viewBox="0 0 320 156" role="img">
        <path class="machine-thin" d="M54 124h212"></path>
        <rect class="pad" x="76" y="104" width="142" height="18" rx="9"></rect>
        <circle class="head" cx="90" cy="84" r="12"></circle>
        <path class="body-line" d="M100 94l58 20"></path>
        <path class="body-line moving-limb core-legs" d="M154 112l54 0 36-14"></path>
        <path class="body-line" d="M100 94l-22 18"></path>
      </svg>
    `
  };

  return visuals[type] || visuals.legPress;
}

function renderList() {
  els.exerciseList.innerHTML = "";
  currentRoutine().exercises.forEach((exercise, index) => {
    const item = document.createElement("article");
    item.className = "exercise-item";
    if (index === state.exerciseIndex) item.classList.add("active");
    if (index < state.exerciseIndex || state.mode === "finished") item.classList.add("done");
    item.innerHTML = `
      <div class="exercise-meta">
        <span>${exercise.sets}세트 x ${exercise.reps}</span>
        <span>${exercise.target}</span>
      </div>
      <h3>${exercise.name}</h3>
    `;
    item.addEventListener("click", () => {
      state.exerciseIndex = index;
      state.setIndex = 0;
      state.mode = state.mode === "idle" ? "idle" : "work";
      state.restLeft = REST_BETWEEN_SETS;
      state.restType = "set";
      render();
    });
    els.exerciseList.append(item);
  });
}

function render() {
  const routine = currentRoutine();
  const exercise = currentExercise();
  const displaySeconds = state.mode === "rest" ? state.restLeft : state.elapsed;

  els.timerLabel.textContent = state.paused && state.mode !== "finished" ? "일시정지" : timerLabel();
  els.timerValue.textContent = formatTime(displaySeconds);
  els.pauseIcon.textContent = state.paused ? "▶" : "II";
  els.pauseButton.disabled = state.mode === "idle" || state.mode === "finished";
  els.routineName.textContent = `${routine.name} · ${routine.focus}`;
  els.exerciseCount.textContent = `${state.exerciseIndex + 1} / ${routine.exercises.length}`;
  els.currentTitle.textContent = exercise.name;
  els.targetText.textContent = exercise.target;
  if (renderedVisual !== exercise.visual) {
    els.exerciseVisual.innerHTML = visualTemplate(exercise.visual);
    renderedVisual = exercise.visual;
  }
  els.exerciseVisual.classList.toggle("work-active", state.mode === "work" && !state.paused);
  els.repText.textContent = `${exercise.sets}세트 x ${exercise.reps}`;
  els.cueText.textContent = exercise.cue;
  els.mainButton.textContent = mainButtonLabel();
  els.prevButton.disabled = state.exerciseIndex === 0;
  els.nextButton.disabled = state.exerciseIndex === routine.exercises.length - 1;

  els.tabA.classList.toggle("active", state.routineKey === "A");
  els.tabB.classList.toggle("active", state.routineKey === "B");
  els.tabA.setAttribute("aria-selected", String(state.routineKey === "A"));
  els.tabB.setAttribute("aria-selected", String(state.routineKey === "B"));
  els.body.classList.toggle("resting", state.mode === "rest");
  els.body.classList.toggle("finished", state.mode === "finished");

  renderSetStrip(exercise);
  renderList();
  saveState();
}

els.mainButton.addEventListener("click", () => {
  if (state.mode === "finished") {
    resetWorkout();
    return;
  }
  completeSet();
});

els.pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  render();
});

els.prevButton.addEventListener("click", () => moveExercise(-1));
els.nextButton.addEventListener("click", () => moveExercise(1));
els.resetButton.addEventListener("click", resetWorkout);
els.tabA.addEventListener("click", () => selectRoutine("A"));
els.tabB.addEventListener("click", () => selectRoutine("B"));

render();
