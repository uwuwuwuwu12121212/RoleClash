const girl = document.getElementById("girl");
const elephant = document.getElementById("elephant");
const talk = document.querySelector(".talk");

/* 👣 小女孩走路影格（你給的） */
const walkFrames = [
  "image/girl_walk1_elephant.png",
  "image/girl_walk2_elephant.png",
  "image/girl_walk3_elephant.png",
  "image/girl_walk4_elephant.png",
  "image/girl_walk5_elephant.png",
  "image/girl_walk6_elephant.png",
  "image/girl_walk7_elephant.png",
  "image/girl_walk8_elephant.png",
  "image/girl_walk9_elephant.png"
];

girl.style.backgroundImage = `url(${walkFrames[0]})`;

let lastScroll = 0;
let walkDistance = 0;
let stopTimer = null;

/* 🐘 大象出現控制 */
const START_MEET = 800;   // 開始看到大象
const END_MEET = 1600;    // 完全走到定位
const START_X = 120;      // %
const END_X = 60;         // %

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const delta = scrollY - lastScroll;

  walkDistance += Math.abs(delta);
  lastScroll = scrollY;

  /* 👧 女孩走路輪播 */
  const frameIndex =
    Math.floor(walkDistance / 40) % walkFrames.length;

  girl.style.backgroundImage =
    `url(${walkFrames[frameIndex]})`;

  /* ⏸ 停止走路 → 站立 */
  clearTimeout(stopTimer);
  stopTimer = setTimeout(() => {
    girl.style.backgroundImage = `url(${walkFrames[0]})`;
  }, 150);

  

  /* 🐘 scroll 推進大象（核心） */
  if (scrollY >= START_MEET) {
    const progress = Math.min(
      (scrollY - START_MEET) / (END_MEET - START_MEET),
      1
    );

    const currentX =
      START_X - (START_X - END_X) * progress;

    elephant.style.left = `${currentX}%`;

    /* 完全靠近 → 顯示對話框 */
    if (progress === 1) {
      talk.classList.remove("hidden");
    }
  }
});

/* 💬 點擊對話框 */
talk.addEventListener("click", () => {
  talk.style.opacity = "0";
  setTimeout(() => {
    talk.style.display = "none";
  }, 400);
});
