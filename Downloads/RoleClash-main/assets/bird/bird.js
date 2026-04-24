/* ================================
   1. 燈光開關功能
   ================================ */
   function toggleRoomLights() {
    const lampWrapper = document.querySelector('.lamp-wrapper');
    if (lampWrapper) {
        lampWrapper.classList.toggle('active');
        console.log("燈光切換");
    }
}

/* ================================
   2. 視差行走控制 (女孩原地踏步，家具移動)
   ================================ */
const girl = document.getElementById("girl");
const furniture = document.getElementById("furniture");

// 圖片序列
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

// 初始化第一張圖
girl.style.backgroundImage = `url('${walkFrames[0]}')`;

// 設定移動參數
const furnitureStart = 100; // 家具起始位置 (100% = 螢幕右側外)
const furnitureEnd = 0;     // 家具結束位置 (0% = 螢幕左側/滿版)

let isScrolling;

window.addEventListener("scroll", () => {
    // 1. 計算捲動進度 (0 ~ 1)
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = window.scrollY / maxScroll;

    /* --- A. 移動背景 (家具) --- */
    // 家具從右邊 (100%) 往左移動到定位 (0%)
    const currentFurniturePos = furnitureStart - (scrollPercent * (furnitureStart - furnitureEnd));
    furniture.style.left = `${currentFurniturePos}%`;

    /* --- B. 女孩原地踏步 (圖片輪播) --- */
    // 使用捲動距離來驅動影格
    const frameIndex = Math.floor(window.scrollY / 30) % walkFrames.length;
    girl.style.backgroundImage = `url('${walkFrames[frameIndex]}')`;

    /* --- C. 停止捲動時恢復站立 --- */
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        girl.style.backgroundImage = `url('${walkFrames[0]}')`;
    }, 100);
});

// 視窗縮放時重整
window.addEventListener('resize', () => {
    window.dispatchEvent(new Event('scroll'));
});