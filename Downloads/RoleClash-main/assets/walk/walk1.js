const character = document.getElementById("character");
  const npc = document.getElementById("npc1");
  const world = document.querySelector(".world");

  /* 主角動畫影格 */
  const frames = [
    "image/girl_walk1.png",
    "image/girl_walk2.png",
    "image/girl_walk3.png",
    "image/girl_walk4.png",
    "image/girl_walk5.png",
    "image/girl_walk6.png",
    "image/girl_walk7.png",
    "image/girl_walk8.png",
    "image/girl_walk9.png",
    "image/girl_walk10.png"
  ];

  /* 路人動畫影格 */
  const npcFrames = [
    "image/girl_walk1.png",
    "image/girl_walk2.png",
    "image/girl_walk3.png",
    "image/girl_walk4.png",
    "image/girl_walk5.png",
    "image/girl_walk6.png",
    "image/girl_walk7.png",
    "image/girl_walk8.png",
    "image/girl_walk9.png",
    "image/girl_walk10.png"
  ];

  character.style.backgroundImage = `url(${frames[0]})`;
  npc.style.backgroundImage = `url(${npcFrames[0]})`;

  let lastScroll = 0;
  let walkDistance = 0;
  let ticking = false;
  let scrollY = 0;

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    const delta = scrollY - lastScroll;
    walkDistance += Math.abs(delta);
    lastScroll = scrollY;

    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });

  function update() {
    /* 👣 主角走路動畫 */
    const frameIndex = Math.floor(walkDistance / 40) % frames.length;
    character.style.backgroundImage = `url(${frames[frameIndex]})`;

    /* 🌍 世界移動 */
    world.style.transform = `translateX(${-scrollY * 0.4}px)`;

    /* 🚶 路人動畫 */
    const npcFrame =
      Math.floor(walkDistance / 80) % npcFrames.length;
    npc.style.backgroundImage = `url(${npcFrames[npcFrame]})`;

    /* 🚶 路人位置 */
    const npcX = 110 - scrollY * 0.03;
    npc.style.left = `${npcX}%`;

    if (npcX < -30) {
      npc.style.left = "110%";
    }

    ticking = false;
  }