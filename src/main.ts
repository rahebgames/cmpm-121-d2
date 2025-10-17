import "./style.css";

const FLEXBOX = document.createElement("div");
FLEXBOX.id = "flexbox";
document.body.appendChild(FLEXBOX);

const TITLE = document.createElement("h1");
TITLE.textContent = "Sticker Sketchpad";
FLEXBOX.appendChild(TITLE);

const CANVAS = document.createElement("canvas");
CANVAS.id = "sketchpad";
CANVAS.width = 256;
CANVAS.height = 256;
FLEXBOX.appendChild(CANVAS);

const CONTEXT = CANVAS.getContext("2d");
const CURSOR = { active: false, x: 0, y: 0 };

CANVAS.addEventListener("mousedown", (e) => {
  CURSOR.active = true;
  CURSOR.x = e.offsetX;
  CURSOR.y = e.offsetY;
});

CANVAS.addEventListener("mousemove", (e) => {
  if (CURSOR.active && CONTEXT != null) {
    CONTEXT.beginPath();
    CONTEXT.moveTo(CURSOR.x, CURSOR.y);
    CONTEXT.lineTo(e.offsetX, e.offsetY);
    CONTEXT.stroke();
    CURSOR.x = e.offsetX;
    CURSOR.y = e.offsetY;
  }
});

CANVAS.addEventListener("mouseup", (_e) => {
  CURSOR.active = false;
});

const CLEAR_BUTTON = document.createElement("button");
CLEAR_BUTTON.innerHTML = "clear";
CLEAR_BUTTON.id = "clear_button";
FLEXBOX.append(CLEAR_BUTTON);

CLEAR_BUTTON.addEventListener("click", () => {
  if (CONTEXT != null) CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
});
