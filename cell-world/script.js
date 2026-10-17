let animalScene, animalCamera, animalRenderer;
let cellMesh, innerCoreMesh, cytoplasmMesh, organelleGroup;

// 🔊 Үн эффекттерин чыгаруучу функция (Web Audio API аркылуу)
function playSound(type) {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "click") {
      // Жөнөкөй баскыч басылгандагы кыска шерңгүү
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "correct") {
      // Туура жооп үчүн жагымдуу жогорку үн (динь)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "wrong") {
      // Туура эмес жооп үчүн пас үн
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.log("Үн чыгарууда ката кетти:", e);
  }
}

// Навигация жана Секциялар арасында өтүү
function showSection(sectionId) {
  playSound("click");
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.remove("active");
  });
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (event && event.target && event.target.classList.contains("nav-btn")) {
    event.target.classList.add("active");
  }

  const navLinks = document.getElementById("navLinks");
  if (navLinks) navLinks.classList.remove("active");

  if (sectionId === "animal-cell") {
    setTimeout(resizeAnimalViewer, 100);
  }
}

// Мобилдик менюну ачуу/жабуу
const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    playSound("click");
    document.getElementById("navLinks").classList.toggle("active");
  });
}

// Модалдык терезени башкаруу
function openModal(title, text) {
  playSound("click");
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalText").innerText = text;
  document.getElementById("infoModal").style.display = "flex";
}

function closeModal() {
  playSound("click");
  document.getElementById("infoModal").style.display = "none";
}

// Үн жана Толук экран
const fullscreenToggle = document.getElementById("fullscreenToggle");
if (fullscreenToggle) {
  fullscreenToggle.addEventListener("click", () => {
    playSound("click");
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
}

let soundEnabled = true;
const soundToggle = document.getElementById("soundToggle");
if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.innerText = soundEnabled ? "🔊" : "🔇";
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initHeroViewer();
  initAnimalCellViewer();
  initQuiz();
  initGame();
});

// 1. Башкы беттеги 3D Клетка
function initHeroViewer() {
  const heroContainer = document.getElementById("heroCanvasContainer");
  if (!heroContainer) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(400, 400);
  heroContainer.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const cellSphere = new THREE.Mesh(geometry, material);
  scene.add(cellSphere);

  const coreGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x8a2be2 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  camera.position.z = 5;

  function animateHero() {
    requestAnimationFrame(animateHero);
    cellSphere.rotation.y += 0.01;
    cellSphere.rotation.x += 0.005;
    core.rotation.y -= 0.02;
    renderer.render(scene, camera);
  }
  animateHero();
}

// Органоиддердин маалымат базасы
const organelleData = {
  membrane: {
    title: "Клетка мембранасы",
    desc: "Клетка мембранасы клетканы курчап турат жана заттардын клеткага киришин, андан чыгышын жөнгө салууга катышат.",
    comp: "Салыштыруу: Ал көзөмөлдөнгөн кирүү-чыгуу системасына окшош.",
  },
  cytoplasm: {
    title: "Цитоплазма",
    desc: "Клетканын мембранасынын ичиндеги органоиддер жайгашкан ички чөйрө.",
    comp: "Салыштыруу: Клетканын ичиндеги суюк желе сымал негизги чөйрө.",
  },
  nucleus: {
    title: "Ядро",
    desc: "Ядродо ДНКнын негизги бөлүгү жайгашат. ДНКда организмдин тукум куучулук маалыматы сакталат.",
    comp: "Салыштыруу: Ядрону китепканадагы маанилүү маалыматтар сакталган бөлмөгө салыштырууга болот.",
  },
  mitochondria: {
    title: "Митохондрия",
    desc: "Митохондрия клетканын энергия алуу процесстерине катышат. Клетка колдонгон энергиянын негизги бөлүгү ушул жерде өндүрүлөт.",
    comp: "Салыштыруу: Митохондрияны электр станциясына салыштырса болот.",
  },
  ribosome: {
    title: "Рибосомалар",
    desc: "Белоктор синтезделүүчү кичинекей клеткалык түзүлүштөр.",
    comp: "Салыштыруу: Белок куруучу кичинекей фабрикалар.",
  },
  er: {
    title: "Эндоплазмалык тор",
    desc: "Заттарды синтездөөгө жана клетканын ичинде ташууга катышкан мембраналуу түзүлүш.",
    comp: "Салыштыруу: Клетка ичиндеги жолдор тармагы.",
  },
  golgi: {
    title: "Гольджи аппараты",
    desc: "Заттарды өзгөртүүгө, сорттоого жана таңгактоого катышат.",
    comp: "Салыштыруу: Почта же таңгактоо борбору.",
  },
  lysosome: {
    title: "Лизосомалар",
    desc: "Керексиз заттарды ажыратууга катышуучу ферменттерди камтыган органоиддер.",
    comp: "Салыштыруу: Клетканын тазалоочу тутуму.",
  },
};

// 2. Жаныбар клеткасынын 3D Viewer программасы
function initAnimalCellViewer() {
  const container = document.getElementById("threeCellContainer");
  if (!container) return;

  animalScene = new THREE.Scene();
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 400;

  animalCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  animalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  animalRenderer.setSize(width, height);
  container.appendChild(animalRenderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  animalScene.add(ambientLight);

  organelleGroup = new THREE.Group();
  animalScene.add(organelleGroup);

  const membraneGeo = new THREE.SphereGeometry(2.2, 32, 32);
  const membraneMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  cellMesh = new THREE.Mesh(membraneGeo, membraneMat);
  organelleGroup.add(cellMesh);

  const cytoGeo = new THREE.SphereGeometry(2.1, 32, 32);
  const cytoMat = new THREE.MeshBasicMaterial({
    color: 0x112233,
    transparent: true,
    opacity: 0.4,
  });
  cytoplasmMesh = new THREE.Mesh(cytoGeo, cytoMat);
  organelleGroup.add(cytoplasmMesh);

  const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x8a2be2 });
  innerCoreMesh = new THREE.Mesh(coreGeo, coreMat);
  innerCoreMesh.position.set(0.3, 0.2, 0);
  organelleGroup.add(innerCoreMesh);

  const mitoGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const mitoMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
  const mito1 = new THREE.Mesh(mitoGeo, mitoMat);
  mito1.scale.set(1.5, 0.8, 0.8);
  mito1.position.set(-1, -0.8, 0.5);
  organelleGroup.add(mito1);

  const mito2 = mito1.clone();
  mito2.position.set(0.9, -0.7, -0.6);
  organelleGroup.add(mito2);

  const riboGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const riboMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  for (let i = 0; i < 6; i++) {
    const r = new THREE.Mesh(riboGeo, riboMat);
    r.position.set(
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 2.5,
    );
    organelleGroup.add(r);
  }

  animalCamera.position.z = 5;

  document.querySelectorAll(".org-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      playSound("click");
      document
        .querySelectorAll(".org-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      const orgKey = e.target.getAttribute("data-org");
      const data = organelleData[orgKey];
      if (data) {
        document.getElementById("orgTitle").innerText = data.title;
        document.getElementById("orgDesc").innerText = data.desc;
        document.getElementById("orgComp").innerText = data.comp;
      }

      highlightOrganelle3D(orgKey);
    });
  });

  function animateAnimal() {
    requestAnimationFrame(animateAnimal);
    if (organelleGroup) {
      organelleGroup.rotation.y += 0.004;
    }
    animalRenderer.render(animalScene, animalCamera);
  }
  animateAnimal();
}

function highlightOrganelle3D(key) {
  cellMesh.material.color.setHex(0x00e5ff);
  cellMesh.material.opacity = 0.3;
  innerCoreMesh.visible = true;

  if (key === "membrane") {
    cellMesh.material.color.setHex(0xffffff);
    cellMesh.material.opacity = 0.8;
  } else if (key === "nucleus") {
    innerCoreMesh.scale.set(1.4, 1.4, 1.4);
  } else {
    innerCoreMesh.scale.set(1, 1, 1);
  }
}

function resizeAnimalViewer() {
  const container = document.getElementById("threeCellContainer");
  if (!container || !animalRenderer || !animalCamera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  animalCamera.aspect = width / height;
  animalCamera.updateProjectionMatrix();
  animalRenderer.setSize(width, height);
}

// Викторина логикасы
const quizData = [
  {
    question: "1. Клетка деген эмне?",
    options: [
      "Тирүү организмдердин негизги түзүлүштүк бирдиги",
      "Жөнөкөй химиялык элемент",
      "Суунун молекуласы",
      "Таштын түрү",
    ],
    correct: 0,
    explanation:
      "Клетка — бардык тирүү организмдердин курулуш жана функционалдык негизги бирдиги.",
  },
  {
    question: "2. Митохондриянын негизги кызматы кандай?",
    options: ["Белок жасоо", "Энергия өндүрүү", "Суу сактоо", "Ядрону коргоо"],
    correct: 1,
    explanation: "Митохондрия — клетканын 'энергия станциясы' болуп саналат.",
  },
  {
    question: "3. Өсүмдүк клеткасындагы фотосинтез жүрүүчү органоид:",
    options: ["Митохондрия", "Хлоропласт", "Лизосома", "Рибосома"],
    correct: 1,
    explanation: "Хлоропласттарда күн нурунун жардамы менен фотосинтез жүрөт.",
  },
  {
    question: "4. Клетканын башкаруу борбору кайсы?",
    options: ["Цитоплазма", "Ядро", "Мембрана", "Вакуоль"],
    correct: 1,
    explanation: "Ядродо ДНК сакталып, бардык процесс башкарылат.",
  },
];

let currentQuizIndex = 0;
let score = 0;

function initQuiz() {
  loadQuizQuestion();
}

function loadQuizQuestion() {
  const q = quizData[currentQuizIndex];
  const quizContainer = document.getElementById("quizContainer");
  if (!quizContainer) return;

  if (!q) {
    quizContainer.style.display = "none";
    const res = document.getElementById("quizResult");
    if (res) {
      res.style.display = "block";
      res.innerHTML = `<h3>Викторина аяктады!</h3><p>Сиздин упай: ${score} / ${quizData.length}</p>`;
    }
    return;
  }

  document.getElementById("questionText").innerText = q.question;
  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(index, q.correct, q.explanation);
    optionsContainer.appendChild(btn);
  });
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.style.display = "none";
}

function checkAnswer(selected, correct, explanation) {
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach((btn, idx) => {
    if (idx === correct) btn.classList.add("correct");
    if (idx === selected && idx !== correct) btn.classList.add("wrong");
    btn.disabled = true;
  });

  if (selected === correct) {
    score++;
    playSound("correct"); // Туура болгондо жагымдуу үн
  } else {
    playSound("wrong"); // Ката болгондо паст үн
  }

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.style.display = "block";
}

function nextQuestion() {
  playSound("click");
  currentQuizIndex++;
  loadQuizQuestion();
}

// Оюн логикасы (Оңдолгон версия)
let gameScore = 0;

function initGame() {
  const gameBox = document.getElementById("gameBox");
  if (!gameBox) return;

  loadNewGameRound();
}

function loadNewGameRound() {
  const tasks = [
    {
      task: "Митохондрияны тап!",
      correctName: "Митохондрия",
      options: ["Митохондрия", "Митопласт", "Митохондрин", "Ядро"],
    },
    {
      task: "Клетканын башкаруу борборун (Ядро) тап!",
      correctName: "Ядро",
      options: ["Нуклеоид", "Ядро", "Ядрочо", "Шыбак"],
    },
    {
      task: "Өсүмдүк клеткасындагы фотосинтез органоидин тап!",
      correctName: "Хлоропласт",
      options: ["Эритроцит", "Хлоропласт", "Темир", "Нейрон"],
    },
    {
      task: "Клетка мембранасын тап!",
      correctName: "Клетка мембранасы",
      options: ["Кирпик", "Клетка мембранасы", "Чач", "Сөөк"],
    },
  ];

  // Кокусунан бир тапшырманы тандоо
  const currentTask = tasks[Math.floor(Math.random() * tasks.length)];

  document.getElementById("gameTask").innerText =
    `Тапшырма: ${currentTask.task}`;
  const gameChoices = document.getElementById("gameChoices");
  gameChoices.innerHTML = "";

  currentTask.options.forEach((optName) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = optName;
    btn.onclick = () => {
      if (optName === currentTask.correctName) {
        gameScore += 10;
        btn.style.background = "#2e7d32"; // Жашыл (Туура)
        playSound("correct");
      } else {
        btn.style.background = "#c62828"; // Кызыл (Ката)
        playSound("wrong");
      }

      document.getElementById("gameScore").innerText = `Упай: ${gameScore}`;

      // 1 секундадан кийин кийинки тапшырмага өтүү
      setTimeout(() => {
        loadNewGameRound();
      }, 1000);
    };
    gameChoices.appendChild(btn);
  });
}
