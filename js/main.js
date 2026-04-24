document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM 載入完成，初始化腳本...");

  // --- 基礎變數與狀態管理 ---
  const mainLogo = document.getElementById("main-logo");
  const character = document.getElementById("character");
  const dialogueContainer = document.getElementById("dialogue-container");
  const introOverlay = document.getElementById("intro-overlay");
  const introImage = document.getElementById("intro-image");
  const elephantScene = document.getElementById("elephant-scene");
  const elephantImg = document.getElementById("elephant-img");
  const elephantContainer = document.getElementById("elephant-container");
  const birdScene = document.getElementById("bird-scene");
  const birdImg = document.getElementById("bird-img");
  const birdContainer = document.getElementById("bird-container");
  const seaScene = document.getElementById("sea-scene");
  const seaClound = document.getElementById("sea-clound");
  const finalTextContainer = document.getElementById("final-text-container");
  const lightWallContainer = document.getElementById("light-wall-container");

  // --- 開場影片邏輯 (點擊播放/暫停 + 拖曳控制) ---
  const videoOpeningContainer = document.getElementById("video-opening-container");
  const openingVideo = document.getElementById("opening-video");
  const skipVideoBtn = document.getElementById("skip-video-btn");
  const videoProgressBar = document.getElementById("video-progress-bar");
  const videoProgressFill = document.getElementById("video-progress-fill");

  let isGameStarted = false;
  let isDraggingVideo = false;

  function startGame() {
    if (isGameStarted) return;
    isGameStarted = true;
    openingVideo.pause();
    videoOpeningContainer.classList.add("hidden");
    document.querySelector(".background-container").classList.remove("content-hidden");
    character.classList.remove("content-hidden");
    dialogueContainer.classList.remove("content-hidden");
    updateUI();
  }

  // 點擊影片主體播放或暫停
  openingVideo.onclick = () => {
    if (openingVideo.paused) {
      openingVideo.play().catch(err => console.log("播放受阻:", err));
    } else {
      openingVideo.pause();
    }
  };

  // 進度條控制
  openingVideo.ontimeupdate = () => {
    const pct = (openingVideo.currentTime / openingVideo.duration) * 100;
    videoProgressFill.style.width = `${pct}%`;
  };

  const seekVideo = (e) => {
    const rect = videoProgressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    openingVideo.currentTime = pct * openingVideo.duration;
  };

  videoProgressBar.onmousedown = (e) => {
    isDraggingVideo = true;
    seekVideo(e);
  };
  window.onmousemove = (e) => { if (isDraggingVideo) seekVideo(e); };
  window.onmouseup = () => { isDraggingVideo = false; };

  if (skipVideoBtn) {
    skipVideoBtn.onclick = () => startGame();
  }

  openingVideo.onended = () => startGame();
  openingVideo.onerror = () => startGame();

  // --- 角色與影格 ---
  const frames = Array.from({ length: 11 }, (_, i) => `assets/walk/image/girl_walk${i + 1}.png`);
  frames.forEach(src => { const img = new Image(); img.src = src; });

  let walkDistance = 0;
  let ticking = false;
  let currentStep = 0;
  let typingTimer = null;

  // --- 打字機效果函式 ---
  function typeEffect(element, html, speed = 30) {
    if (typingTimer) clearTimeout(typingTimer);
    element.innerHTML = "";
    let i = 0;
    function type() {
      if (i < html.length) {
        if (html.charAt(i) === "<") {
          const tagEnd = html.indexOf(">", i);
          i = tagEnd !== -1 ? tagEnd + 1 : i + 1;
        } else {
          i++;
        }
        element.innerHTML = html.substring(0, i);
        typingTimer = setTimeout(type, speed);
      }
    }
    type();
  }

  let isWalkingPhase = 0; 
  let isElephantActive = false;
  let isBirdActive = false;
  let isFinalScene = false;
  let canClearBlame = false;
  let canTurnOffLamp = false;
  let removedBlameCount = 0;
  let isFirstLightWall = true; 
  const runThreshold = frames.length * 50; 

  character.style.backgroundImage = `url(${frames[0]})`;

  // --- 音效與音樂系統 ---
  const bgm = new Audio();
  bgm.loop = true;
  let currentTrack = "";

  const hitSound = new Audio("assets/elephant/music/elephant_glass_hit.mp3");
  const lampSound = new Audio("assets/bird/music/bird_lamp_off.mp3");

  function playMusic(trackPath) {
    if (!isGameStarted) return;
    if (currentTrack === trackPath) return;
    currentTrack = trackPath;
    bgm.src = trackPath;
    bgm.load();
    bgm.play().catch(() => {});
  }

  function updateBGM() {
    if (isFinalScene) {
      playMusic("assets/sea/music/final1.mp3");
      return;
    }
    if (currentStep <= 15) {
      playMusic("assets/elephant/music/elephant1.mp3");
    } else if (currentStep >= 16 && currentStep <= 37) {
      playMusic("assets/bird/music/bird1.mp3");
    } else if (currentStep >= 38) {
      playMusic("assets/sea/music/final1.mp3");
    }
  }

  // --- 劇情資料庫 ---
  const storyData = [
    /* 0 */ { title: "遊戲說明", content: "前面的經歷，女主角深深陷入淺意識中... <br> 請使用滑鼠滾輪移動，陪伴女主角離開...", avatar: "assets/sea/image/avatar_game.png" },
    /* 1 */ { title: "女主角", content: "痾...這個是...?", avatar: "assets/elephant/image/avatar_girl_sad.png" },
    /* 2 */ { title: "???", content: "嗚嗚...為什麼要這樣說我...<br> 我明明不是這樣的...", avatar: "assets/elephant/image/avatar_elephant_sad.png" },
    /* 3 */ { title: "遊戲說明", content: "請用滑鼠點擊對話框，讓對話框消失<br> 讓？？？可以逃離他人的流言蜚語", avatar: "assets/sea/image/avatar_game.png" },
    /* 4 */ { title: "大象", content: "我是大象。人們總說大象很強壯、能背負很多東西，也許正因為這樣，我以為自己理所當然", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 5 */ { title: "大象", content: "要承受這一切。<br> 一開始，那只是一兩句話。", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 6 */ { title: "大象", content: "「你怎麼還不會？」、「你應該要更努力一點吧？」、「為什麼別人都做得到？」", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 7 */ { title: "大象", content: "我把這些話全收進了心裡。我想要符合大家的期待，我想證明自己可以。但漸漸地，這些聲", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 8 */ { title: "大象", content: "音變成了具體的形狀，它們變成了一個個沉重的對話框，堆疊在我的背上。", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 9 */ { title: "大象", content: "後來，就算別人沒有開口，我也能「聽見」他在批評我.我開始害怕出門，害怕面對別人", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 10 */ { title: "大象", content: "的眼神。我把自己關進一個純黑的空間裡，我以為只要斷絕與外界的接觸，只要躲起來，那", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 11 */ { title: "大象", content: "些聲音就會消失。", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 12 */ { title: "大象", content: "直到你的出現！<br>原來，我不需要一個人扛下所有的惡意與期待", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 13 */ { title: "大象", content: "原來，<br>這世界上還有願意理解我的！", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 14 */ { title: "大象", content: "謝謝妳，我想我也該往前走了！再見了！", avatar: "assets/elephant/image/avatar_elephant_fun.png" },
    /* 15 */ { title: "女主角", content: "這些都不是我們的錯，也不是我們必須背負的。<br>謝謝你，現在我們也可以學會放下了。", avatar: "assets/elephant/image/avatar_girl_fun.png" },
    /* 16 */ { title: "遊戲說明", content: "道別過大象，路仍然要自己繼續向前...<br>請使用滑鼠滾輪移動，陪伴女主角向前...", avatar: "assets/sea/image/avatar_game.png" },
    /* 17 */ { title: "女主角", content: "痾...好亮呀...!?", avatar: "assets/bird/image/avatar_girl_sad.png" },
    /* 18 */ { title: "???", content: "「眼看著就要做完了⋯⋯我一定會搞砸的。<br>如果停下來，他們就會發現我其實很糟⋯⋯」", avatar: "assets/bird/image/avatar_bird_sad.png" },
    /* 19 */ { title: "遊戲說明", content: "請用滑鼠點擊燈光，讓燈光消失<br> 讓？？？停下來，好好休息！", avatar: "assets/bird/image/avatar_game.png" },
    /* 20 */ { title: "女主角", content: "妳已經做得很好了。", avatar: "assets/bird/image/avatar_girl_fun.png" },
    /* 21 */ { title: "蒼鷺", content: "我是蒼鷺。<br>在別人眼中，我永遠是那個穿著體面工作裝、", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 22 */ { title: "蒼鷺", content: "羽毛梳理得一絲不苟、辦事俐落的女強人。<br>「她總是那麼可靠。」他們這麼說。", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 23 */ { title: "蒼鷺", content: "但沒有人知道，我坐在一張多麼刺眼的書桌前，<br>那盞燈亮得讓我睜不開眼，但我不敢關掉它。", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 24 */ { title: "蒼鷺", content: "桌上的紙張像暴風雪一樣亂飛，我拼命地寫、<br>拼命地改、拼命地刪掉重來。", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 25 */ { title: "蒼鷺", content: "「眼看著就要做完了⋯⋯我一定會搞砸的。<br>如果我不夠努力，他們就會」", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 26 */ { title: "蒼鷺", content: "發現我其實很糟。我一定會搞砸的，我根本<br>沒有他們想的那麼厲害。」", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 27 */ { title: "蒼鷺", content: "我像是被困在一個沒有出口的高壓艙裡，只能<br>不停地運轉，連停下來喘一口氣都覺得充滿罪", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 28 */ { title: "蒼鷺", content: "惡感。我好累，我的翅膀僵硬得快要斷掉，但<br>我只能死死盯著那刺眼的光，繼續苛責自己。", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 29 */ { title: "蒼鷺", content: "直到那盞燈關上了...<br>我愣住了，抬起頭看著周圍。沒有人責備我停", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 30 */ { title: "蒼鷺", content: "下筆，沒有人因為燈暗了就離開我。<br>那是一種好安靜、好細緻的陪伴。", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 31 */ { title: "蒼鷺", content: "「原來，我也可以停下來一下。原來，就算我<br>不完美，也有資格好好休息。」", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 32 */ { title: "蒼鷺", content: "謝謝你，<br>我想我不完美，也可以往前走！", avatar: "assets/bird/image/avatar_bird_fun.png" },
    /* 33 */ { title: "女主角", content: "我們的價值，從來都不需要用燃燒自己來證明。<br>原來，我們也可以停下來一下的，對吧？", avatar: "assets/bird/image/avatar_girl_fun.png" },
    /* 34 */ { title: "女主角", content: "遇見他們，<br> 就像撿回了散落在黑暗裡的我自己。", avatar: "assets/bird/image/avatar_girl_fun.png" },
    /* 35 */ { title: "女主角", content: "我們都在這片漆黑的海上漂流，跌跌撞撞地，<br>尋找著那個能讓心靈停泊的彼岸。", avatar: "assets/bird/image/avatar_girl_fun.png" },
    /* 36 */ { title: "女主角", content: "現在，天亮了。<br>我們一起走吧！", avatar: "assets/bird/image/avatar_girl_fun.png" },
    /* 37 */ { title: "遊戲說明", content: "現在，請使用滑鼠滾輪移動，<br>陪伴女主角，一起走向光明！", avatar: "assets/sea/image/avatar_game.png" },
    /* 38 */ { title: "遊戲說明", content: "請用滑鼠點擊留言，<br> 一起分享跟妳一樣迷惘的人吧！", avatar: "assets/sea/image/avatar_game_white.png", theme: "white" }
  ];

  // --- 初始化與元件載入 ---
  async function init() {
    try {
      const [tfRes, tfWhiteRes, btnRes] = await Promise.all([
        fetch("components/textfield-dark.html"),
        fetch("components/textfield-white.html"),
        fetch("components/commonButton.html")
      ]);
      const tfDoc = new DOMParser().parseFromString(await tfRes.text(), "text/html");
      const tfWhiteDoc = new DOMParser().parseFromString(await tfWhiteRes.text(), "text/html");
      const btnDoc = new DOMParser().parseFromString(await btnRes.text(), "text/html");

      window.tfDarkTemplate = tfDoc.querySelector(".dialog-scene");
      // 修正白色模板的選擇器，使其能正確載入元件
      window.tfWhiteTemplate = tfWhiteDoc.querySelector(".mecha-dialogue");
      
      const buttonTemplate = btnDoc.querySelector(".mecha-wrapper");

      window.createControls = () => {
        const controls = document.createElement("div");
        controls.className = "dialogue-controls";
        const prevBtn = buttonTemplate.cloneNode(true);
        prevBtn.classList.add("btn-prev");
        prevBtn.querySelector(".main-fill").innerHTML = "<span>上一頁</span>";
        const nextBtn = buttonTemplate.cloneNode(true);
        nextBtn.classList.add("btn-next");
        nextBtn.querySelector(".main-fill").innerHTML = "<span>下一頁</span>";
        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        return controls;
      };

      const blameContainer = document.getElementById("blame-container");
      for (let i = 1; i <= 10; i++) {
        const img = document.createElement("img");
        img.src = `assets/elephant/image/blame_${i}.png`;
        img.id = `blame-${i}`;
        img.className = "blame-img";
        img.onclick = (e) => {
          if (!canClearBlame) return;
          e.stopPropagation();
          hitSound.currentTime = 0; hitSound.play();
          img.classList.add("fade-out-anim");
          setTimeout(() => {
            img.remove();
            if (++removedBlameCount === 10) finishClearingBlame();
          }, 600);
        };
        blameContainer.appendChild(img);
      }

      birdContainer.onclick = () => {
        if (canTurnOffLamp) {
          canTurnOffLamp = false;
          lampSound.currentTime = 0; lampSound.play();
          birdImg.src = "assets/bird/image/bird_lamp_off.png";
          currentStep = 20; updateUI(); dialogueContainer.classList.remove("hidden");
        }
      };

      const manualBtn = document.getElementById("manual-open-board");
      if (manualBtn) { manualBtn.onclick = () => showFinalBoard(); }

    } catch (err) { console.error("初始化失敗:", err); }
  }

  function updateUI() {
    if (!isGameStarted) return;
    const data = storyData[currentStep];
    if (!data) return;
    updateBGM();
    
    dialogueContainer.innerHTML = ""; 
    const isWhite = data.theme === "white" || currentStep === 38;
    
    // 切換主題類名，由 style.css 控制細節顯示
    dialogueContainer.classList.toggle("is-white-theme", isWhite);
    
    const template = isWhite ? window.tfWhiteTemplate : window.tfDarkTemplate;
    if (!template) return;
    const scene = template.cloneNode(true);
    
    if (isWhite) {
      // 填入白色模板內容 (支援白色模板專用類名)
      const nameEl = scene.querySelector(".name-tag");
      const textEl = scene.querySelector(".text-content");
      if (nameEl) nameEl.textContent = data.title;
      if (textEl) {
        const finalHTML = data.content.includes("<p>") ? data.content : `<p>${data.content}</p>`;
        typeEffect(textEl, finalHTML);
      }

      // 填入頭像 (白色模板內部補上 img)
      const avatarContainer = scene.querySelector(".avatar-inner");
      if (avatarContainer && !avatarContainer.querySelector("img")) {
        const img = document.createElement("img");
        img.className = "avatar-panel__image";
        img.style.width = "100%"; img.style.height = "100%"; img.style.objectFit = "contain";
        img.src = data.avatar;
        avatarContainer.appendChild(img);
      }

      const controls = window.createControls();
      const controlParent = scene.querySelector(".panel-wrapper");
      if (controlParent) controlParent.appendChild(controls);
      
    } else {
      // 深色模板填充
      scene.querySelector(".dialog-shell__title").textContent = data.title;
      const textEl = scene.querySelector(".dialog-shell__text");
      if (textEl) typeEffect(textEl, data.content);
      const avatarImg = scene.querySelector(".avatar-panel__image");
      if (avatarImg) {
        avatarImg.src = data.avatar;
        avatarImg.style.width = "95%"; // 縮小深色模板頭像
        avatarImg.style.height = "100%";
        avatarImg.style.margin = "auto";
      }
      const controls = window.createControls();
      scene.querySelector(".dialog-shell").appendChild(controls);
    }

    dialogueContainer.appendChild(scene);
    
    const prevBtn = dialogueContainer.querySelector(".btn-prev");
    const nextBtn = dialogueContainer.querySelector(".btn-next");
    if (prevBtn) prevBtn.onclick = () => { if (currentStep > 0) { currentStep--; updateUI(); } };
    if (nextBtn) nextBtn.onclick = handleNextAction;
    
    const nextOnlySteps = [0, 15, 17, 20, 33, 34, 38];
    if (prevBtn) prevBtn.classList.toggle("hidden", nextOnlySteps.includes(currentStep));
    
    const isInteracting = (currentStep === 3 && canClearBlame) || (currentStep === 19 && canTurnOffLamp);
    const controlsDiv = dialogueContainer.querySelector(".dialogue-controls");
    if (controlsDiv) controlsDiv.classList.toggle("hidden", isInteracting);
  }

  function handleNextAction() {
    if (currentStep === 0) {
      showIntro("assets/sea/image/indrouction_mouse.png", () => { isWalkingPhase = 1; });
    } else if (currentStep === 3) {
      showInteractionIntro();
    } else if (currentStep === 14) {
      elephantScene.classList.add("hidden");
      currentStep = 15; updateUI();
    } else if (currentStep === 16) {
      showIntro("assets/sea/image/indrouction_mouse.png", () => {
        isElephantActive = false; isWalkingPhase = 3; walkDistance = 0;
      });
    } else if (currentStep === 19) {
      showBirdInteractionIntro();
    } else if (currentStep === 32) {
      birdScene.classList.add("hidden");
      currentStep = 33; updateUI();
    } else if (currentStep === 37) {
      startSeaTransition();
    } else if (currentStep === 38) {
      showBoardIntro();
    } else if (currentStep < storyData.length - 1) {
      currentStep++; updateUI();
    }
  }

  function showIntro(src, callback, useFade = true) {
    dialogueContainer.classList.add("hidden");
    if (useFade) {
      document.querySelector(".background-container").classList.add("fade-out");
      character.classList.add("fade-out");
    }
    introImage.src = src;
    introImage.style.opacity = "1";
    introOverlay.classList.remove("hidden");
    const closeIntro = () => {
      introImage.style.opacity = "0";
      setTimeout(() => {
        introOverlay.classList.add("hidden");
        if (useFade) {
          document.querySelector(".background-container").classList.remove("fade-out");
          character.classList.remove("fade-out");
        }
        if (callback) callback();
      }, 500);
      introOverlay.onclick = null;
      window._onWheelIntro = null;
    };
    introOverlay.onclick = closeIntro;
    window._onWheelIntro = closeIntro;
  }

  function startSeaTransition() {
    dialogueContainer.classList.add("hidden");
    isElephantActive = false; isBirdActive = false;
    seaScene.classList.remove("hidden");
    seaClound.style.opacity = "1";
    showIntro("assets/sea/image/indrouction_mouse.png", () => {
      isWalkingPhase = 5; walkDistance = 0;
    });
  }

  function startRun2() { isWalkingPhase = 2; walkDistance = 0; elephantScene.classList.remove("hidden"); }
  function startRun4() { isWalkingPhase = 4; walkDistance = 0; birdScene.classList.remove("hidden"); }
  function finishClearingBlame() {
    canClearBlame = false; elephantImg.src = "assets/elephant/image/elephant_stand.png";
    currentStep = 4; updateUI(); dialogueContainer.classList.remove("hidden");
  }
  function showInteractionIntro() { showIntro("assets/elephant/image/indrouction_chat.png", () => { canClearBlame = true; }); }
  function showBirdInteractionIntro() { showIntro("assets/bird/image/indrouction_lamp.png", () => { canTurnOffLamp = true; }); }
  function showBoardIntro() { showIntro("assets/sea/image/indrouction_board.png", () => showFinalBoard(), false); }

  async function showFinalBoard() {
    const boardOverlay = document.getElementById("board-overlay");
    try {
      const res = await fetch("components/board.html");
      const html = await res.text();
      boardOverlay.innerHTML = html;
      boardOverlay.classList.remove("hidden");
      setTimeout(() => boardOverlay.classList.add("active"), 50);
      const confirmBtn = document.getElementById("board-confirm-btn");
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          const userText = boardOverlay.querySelector("textarea").value;
          boardOverlay.classList.remove("active");
          setTimeout(() => { boardOverlay.classList.add("hidden"); createLightWall(userText); }, 800);
        };
      }
    } catch (err) { console.error("無法載入留言板:", err); }
  }

  function createLightWall(userMessage) {
    const manualBtn = document.getElementById("manual-open-board");
    if (manualBtn) manualBtn.classList.add("active");
    if (finalTextContainer) {
      finalTextContainer.style.transition = "opacity 1s ease";
      finalTextContainer.style.opacity = "0";
      setTimeout(() => finalTextContainer.classList.add("hidden"), 1000);
    }
    const quotes = [
      "今天只要有好好呼吸、好好吃頓飯，就已經是非常棒的一天了！",
      "允許自己擁有脆弱的權利。",
      "妳不需要活成別人期待的樣子。",
      "你本身就是值得存在的。",
      "不管走得多慢，甚至退後了幾步也無所謂。",
      "有不逼著我前進，只是靜靜陪我留在原地的人。",
      "你的價值，從來就不執於你符合了多少人的期待。"
    ];
    let allTexts = isFirstLightWall ? (userMessage.trim() ? [userMessage, ...quotes] : quotes) : (userMessage.trim() ? [userMessage] : []);
    isFirstLightWall = false;
    if (allTexts.length === 0) return;
    const rows = 5, cols = 4, grid = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) grid.push({ r, c });
    grid.sort(() => Math.random() - 0.5);
    allTexts.forEach((text, index) => {
      if (index >= grid.length) return;
      const pos = grid[index], textEl = document.createElement("div");
      textEl.className = "light-text"; textEl.textContent = text;
      textEl.style.top = `${5 + (pos.r * 7) + Math.random() * 4}%`;
      textEl.style.left = `${5 + (pos.c * 23) + Math.random() * 8}%`;
      const delay = isFirstLightWall ? 0.8 : 0.2;
      textEl.style.animationDelay = `${index * delay}s, ${index * delay}s`;
      lightWallContainer.appendChild(textEl);
    });
  }

  window.addEventListener("wheel", (e) => {
    if (!isGameStarted) return;
    const delta = Math.abs(e.deltaY);
    if (!introOverlay.classList.contains("hidden")) { if (window._onWheelIntro) window._onWheelIntro(); return; }
    if (isWalkingPhase === 1) {
      walkDistance += delta; if (walkDistance >= runThreshold) startRun2();
    } else if (isWalkingPhase === 2) {
      walkDistance += delta;
      const progress = Math.min(1, walkDistance / runThreshold);
      elephantContainer.style.transform = `translateX(${150 - progress * 150}vw)`;
      if (progress >= 1) {
        isWalkingPhase = 0; isElephantActive = true;
        currentStep = 1; updateUI(); dialogueContainer.classList.remove("hidden");
        document.querySelectorAll(".blame-img").forEach((img, i) => setTimeout(() => img.classList.add("show"), 500 + i * 100));
        updateAnimation();
      }
    } else if (isWalkingPhase === 3) {
      walkDistance += delta; if (walkDistance >= runThreshold) startRun4();
    } else if (isWalkingPhase === 4) {
      walkDistance += delta;
      const progress = Math.min(1, walkDistance / runThreshold);
      birdContainer.style.transform = `translateX(${150 - progress * 150}vw)`;
      if (progress >= 1) {
        isWalkingPhase = 0; isBirdActive = true;
        currentStep = 17; updateUI(); dialogueContainer.classList.remove("hidden");
        updateAnimation();
      }
    } else if (isWalkingPhase === 5) {
      walkDistance += delta;
      const cloudProgress = Math.min(1, walkDistance / (runThreshold * 2.5));
      seaClound.style.transform = `translateX(${-cloudProgress * 180}%)`;
      if (cloudProgress >= 0.3 && !isFinalScene) completeSeaScene();
      if (walkDistance >= runThreshold * 2.5) isWalkingPhase = 0;
    }
    if (!ticking && isWalkingPhase !== 0) { requestAnimationFrame(updateAnimation); ticking = true; }
  });

  function completeSeaScene() {
    isFinalScene = true; updateBGM();
    document.querySelector(".background-container").style.backgroundImage = "url('assets/sea/image/sea_background.png')";
    character.style.backgroundImage = "url('assets/sea/image/girl_sea.png')";
    // 切換黑色 Logo
    if (mainLogo) mainLogo.src = "assets/sea/image/logo_black.png";
    seaClound.classList.add("hidden");
    const topCloud = document.getElementById("final-clound-top");
    topCloud.classList.remove("hidden");
    setTimeout(() => topCloud.classList.add("show"), 100);
    finalTextContainer.classList.remove("hidden");
    document.querySelectorAll(".final-text").forEach((line, i) => setTimeout(() => line.classList.add("show"), 500 + i * 1500));
    setTimeout(() => { currentStep = 38; updateUI(); dialogueContainer.classList.remove("hidden"); }, 4500);
  }

  function updateAnimation() {
    if (isFinalScene) { character.style.backgroundImage = "url('assets/sea/image/girl_sea.png')"; return; }
    let isMoving = [1, 3, 5].includes(isWalkingPhase) || ([2, 4].includes(isWalkingPhase) && (Math.min(1, walkDistance / runThreshold) < 1));
    character.style.backgroundImage = `url(${frames[isMoving ? Math.floor(walkDistance / 40) % frames.length : 0]})`;
    ticking = false;
  }

  init();
});
