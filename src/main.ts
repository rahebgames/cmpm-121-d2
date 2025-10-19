import "./style.css";

interface DrawCommand {
  display(ctx: CanvasRenderingContext2D): void;
  addPoint(x: number, y: number): void;
}

const DRAWINGS: DrawCommand[] = [];
const REDO_DRAWINGS: DrawCommand[] = [];
let currentLine: DrawCommand | null = null;

const REDRAW_EVENT = new Event("drawing-changed");

const FLEXBOX = document.createElement("div");
FLEXBOX.id = "flexbox";
document.body.appendChild(FLEXBOX);

const TITLE = document.createElement("h1");
TITLE.textContent = "Sticker Sketchpad";
FLEXBOX.appendChild(TITLE);

const CANVAS_SIZE = 256;
const CANVAS = document.createElement("canvas");
CANVAS.id = "sketchpad";
CANVAS.width = CANVAS_SIZE;
CANVAS.height = CANVAS_SIZE;
FLEXBOX.appendChild(CANVAS);

const CONTEXT = CANVAS.getContext("2d");
const CURSOR = { active: false, x: 0, y: 0 };

function createDrawing(): DrawCommand {
  const NEW_CANVAS = document.createElement("canvas");
  NEW_CANVAS.width = CANVAS_SIZE;
  NEW_CANVAS.height = CANVAS_SIZE;
  const NEW_CONTEXT = NEW_CANVAS.getContext("2d")!;
  NEW_CONTEXT.lineWidth = 2;
  NEW_CONTEXT.strokeStyle = "black";

  let drawing = false;

  return {
    addPoint(x: number, y: number) {
      if (!drawing) {
        NEW_CONTEXT.beginPath();
        NEW_CONTEXT.moveTo(x, y);
        drawing = true;
      } else {
        NEW_CONTEXT.lineTo(x, y);
        NEW_CONTEXT.stroke();
      }
    },

    display(ctx: CanvasRenderingContext2D) {
      ctx.drawImage(NEW_CANVAS, 0, 0);
    },
  };
}

CANVAS.addEventListener("mousedown", (e) => {
  CURSOR.active = true;
  CURSOR.x = e.offsetX;
  CURSOR.y = e.offsetY;

  const LINE = createDrawing();
  LINE.addPoint(CURSOR.x, CURSOR.y);
  currentLine = LINE;

  DRAWINGS.push(LINE);
  REDO_DRAWINGS.length = 0;

  CANVAS.dispatchEvent(REDRAW_EVENT);
});

CANVAS.addEventListener("mousemove", (e) => {
  if (CURSOR.active && CONTEXT != null) {
    CURSOR.x = e.offsetX;
    CURSOR.y = e.offsetY;

    if (currentLine == null) currentLine = createDrawing();
    currentLine.addPoint(CURSOR.x, CURSOR.y);

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
    for (const DRAWING of DRAWINGS) DRAWING.display(CONTEXT);
  }
});

FLEXBOX.append(document.createElement("br"));

const BUTTON_FLEXBOX = document.createElement("div");
BUTTON_FLEXBOX.id = "button-flexbox";
FLEXBOX.appendChild(BUTTON_FLEXBOX);

const CLEAR_BUTTON = document.createElement("button");
CLEAR_BUTTON.innerHTML = "clear";
BUTTON_FLEXBOX.append(CLEAR_BUTTON);

CLEAR_BUTTON.addEventListener("click", () => {
  DRAWINGS.length = 0;
  CANVAS.dispatchEvent(REDRAW_EVENT);
});

const UNDO_BUTTON = document.createElement("button");
UNDO_BUTTON.innerHTML = "undo";
BUTTON_FLEXBOX.append(UNDO_BUTTON);

UNDO_BUTTON.addEventListener("click", () => {
  if (DRAWINGS.length > 0) {
    const LAST_DRAWING = DRAWINGS.pop();
    if (LAST_DRAWING) REDO_DRAWINGS.push(LAST_DRAWING);
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});

const REDO_BUTTON = document.createElement("button");
REDO_BUTTON.innerHTML = "redo";
BUTTON_FLEXBOX.append(REDO_BUTTON);

REDO_BUTTON.addEventListener("click", () => {
  if (REDO_DRAWINGS.length > 0) {
    const LAST_DRAWING = REDO_DRAWINGS.pop();
    if (LAST_DRAWING) DRAWINGS.push(LAST_DRAWING);
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});
