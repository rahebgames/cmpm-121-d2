import "./style.css";

interface Point {
  x: number;
  y: number;
}

const LINES: Point[][] = [];
let currentLine: Point[] | null = null;

const REDRAW_EVENT = new Event("drawing-changed");

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

  currentLine = [];
  LINES.push(currentLine);
  currentLine.push({ x: CURSOR.x, y: CURSOR.y });

  CANVAS.dispatchEvent(REDRAW_EVENT);
});

CANVAS.addEventListener("mousemove", (e) => {
  if (CURSOR.active && CONTEXT != null) {
    CURSOR.x = e.offsetX;
    CURSOR.y = e.offsetY;

    if (currentLine != null) currentLine.push({ x: CURSOR.x, y: CURSOR.y });
    else currentLine = [{ x: CURSOR.x, y: CURSOR.y }];
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});

CANVAS.addEventListener("mouseup", (_e) => {
  CURSOR.active = false;
  currentLine = null;
  CANVAS.dispatchEvent(REDRAW_EVENT);
});

CANVAS.addEventListener("drawing-changed", () => {
  if (CONTEXT != null) {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (const LINE of LINES) {
      if (LINE.length > 1) {
        CONTEXT.beginPath();
        const { x, y } = LINE[0];
        CONTEXT.moveTo(x, y);
        for (const { x, y } of LINE) {
          CONTEXT.lineTo(x, y);
        }
        CONTEXT.stroke();
      }
    }
  }
});

const CLEAR_BUTTON = document.createElement("button");
CLEAR_BUTTON.innerHTML = "clear";
CLEAR_BUTTON.id = "clear_button";
FLEXBOX.append(CLEAR_BUTTON);

CLEAR_BUTTON.addEventListener("click", () => {
  LINES.splice(0, LINES.length);
  CANVAS.dispatchEvent(REDRAW_EVENT);
});
