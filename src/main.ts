import "./style.css";

interface DrawCommand {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}

interface CursorCommand {
  x: number;
  y: number;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  draw(ctx: CanvasRenderingContext2D): void;
}

let lineThickness: number = 2;

const DRAWINGS: DrawCommand[] = [];
const REDO_DRAWINGS: DrawCommand[] = [];
let currentLine: DrawCommand | null = null;

let cursorCommand: CursorCommand | null = null;

const REDRAW_EVENT = new Event("drawing-changed");
const MOVE_EVENT = new Event("tool-moved");

const OUTER_FLEXBOX = document.createElement("div");
OUTER_FLEXBOX.id = "outer-flexbox";
document.body.appendChild(OUTER_FLEXBOX);

const TITLE = document.createElement("h1");
TITLE.textContent = "Sticker Sketchpad";
OUTER_FLEXBOX.appendChild(TITLE);

const CANVAS_FLEXBOX = document.createElement("div");
CANVAS_FLEXBOX.id = "canvas-flexbox";
OUTER_FLEXBOX.appendChild(CANVAS_FLEXBOX);

const LEFT_BUTTON_FLEXBOX = document.createElement("div");
LEFT_BUTTON_FLEXBOX.id = "left-button-flexbox";
CANVAS_FLEXBOX.appendChild(LEFT_BUTTON_FLEXBOX);

const CANVAS_SIZE = 256;
const CANVAS = document.createElement("canvas");
CANVAS.id = "sketchpad";
CANVAS.width = CANVAS_SIZE;
CANVAS.height = CANVAS_SIZE;
CANVAS_FLEXBOX.appendChild(CANVAS);

const RIGHT_BUTTON_FLEXBOX = document.createElement("div");
RIGHT_BUTTON_FLEXBOX.id = "right-button-flexbox";
CANVAS_FLEXBOX.appendChild(RIGHT_BUTTON_FLEXBOX);

const CONTEXT = CANVAS.getContext("2d");
const CURSOR = { active: false, x: 0, y: 0 };
CANVAS.style.cursor = "none";

// draw constructor
function createDrawCommand(
  x: number,
  y: number,
  thickness: number,
): DrawCommand {
  const NEW_CANVAS = document.createElement("canvas");
  NEW_CANVAS.width = CANVAS_SIZE;
  NEW_CANVAS.height = CANVAS_SIZE;
  const NEW_CONTEXT = NEW_CANVAS.getContext("2d")!;
  NEW_CONTEXT.lineWidth = thickness;
  NEW_CONTEXT.strokeStyle = "black";

  NEW_CONTEXT.beginPath();
  NEW_CONTEXT.moveTo(x, y);

  return {
    drag(x: number, y: number) {
      NEW_CONTEXT.lineTo(x, y);
      NEW_CONTEXT.stroke();
    },

    display(ctx: CanvasRenderingContext2D) {
      ctx.drawImage(NEW_CANVAS, 0, 0);
    },
  };
}

function createCursorCommand(
  new_x: number,
  new_y: number,
): CursorCommand {
  const NEW_CANVAS = document.createElement("canvas");
  NEW_CANVAS.width = CANVAS_SIZE;
  NEW_CANVAS.height = CANVAS_SIZE;
  const NEW_CONTEXT = NEW_CANVAS.getContext("2d")!;
  console.log(NEW_CONTEXT);

  return {
    x: new_x,
    y: new_y,
    canvas: NEW_CANVAS,
    context: NEW_CONTEXT,

    draw(ctx: CanvasRenderingContext2D) {
      CANVAS.dispatchEvent(REDRAW_EVENT);
      this.context.clearRect(0, 0, CANVAS.width, CANVAS.height);
      this.context.beginPath();
      this.context.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
      this.context.lineWidth = lineThickness;
      this.context.stroke();
      ctx.drawImage(this.canvas, 0, 0);
    },
  };
}

CANVAS.addEventListener("tool-moved", () => {
  if (cursorCommand != null && CONTEXT != null) {
    cursorCommand.draw(CONTEXT);
  }
});

CANVAS.addEventListener("pointerenter", (e) => {
  cursorCommand = createCursorCommand(e.offsetX, e.offsetY);
  CANVAS.dispatchEvent(MOVE_EVENT);
});

CANVAS.addEventListener("pointerout", (_e) => {
  cursorCommand = null;
  CANVAS.dispatchEvent(MOVE_EVENT);
});

CANVAS.addEventListener("pointerdown", (e) => {
  CURSOR.active = true;
  CURSOR.x = e.offsetX;
  CURSOR.y = e.offsetY;

  const LINE = createDrawCommand(CURSOR.x, CURSOR.y, lineThickness);
  currentLine = LINE;

  DRAWINGS.push(LINE);
  REDO_DRAWINGS.length = 0;

  CANVAS.dispatchEvent(REDRAW_EVENT);
});

CANVAS.addEventListener("pointermove", (e) => {
  if (cursorCommand == null) {
    cursorCommand = createCursorCommand(e.offsetX, e.offsetY);
  } else {
    cursorCommand.x = e.offsetX;
    cursorCommand.y = e.offsetY;
  }
  CANVAS.dispatchEvent(MOVE_EVENT);

  if (CURSOR.active) {
    if (CONTEXT != null) {
      CURSOR.x = e.offsetX;
      CURSOR.y = e.offsetY;

      if (currentLine == null) {
        currentLine = createDrawCommand(CURSOR.x, CURSOR.y, lineThickness);
      } else currentLine.drag(CURSOR.x, CURSOR.y);

      CANVAS.dispatchEvent(REDRAW_EVENT);
    }
  }
});

CANVAS.addEventListener("pointerup", (_e) => {
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

const CLEAR_BUTTON = document.createElement("button");
CLEAR_BUTTON.innerHTML = "clear";
CLEAR_BUTTON.classList.add("button");
RIGHT_BUTTON_FLEXBOX.append(CLEAR_BUTTON);

CLEAR_BUTTON.addEventListener("click", () => {
  DRAWINGS.length = 0;
  CANVAS.dispatchEvent(REDRAW_EVENT);
});

RIGHT_BUTTON_FLEXBOX.append(document.createElement("br"));

const UNDO_BUTTON = document.createElement("button");
UNDO_BUTTON.innerHTML = "undo";
UNDO_BUTTON.classList.add("button");
RIGHT_BUTTON_FLEXBOX.append(UNDO_BUTTON);

UNDO_BUTTON.addEventListener("click", () => {
  if (DRAWINGS.length > 0) {
    const LAST_DRAWING = DRAWINGS.pop();
    if (LAST_DRAWING) REDO_DRAWINGS.push(LAST_DRAWING);
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});

RIGHT_BUTTON_FLEXBOX.append(document.createElement("br"));

const REDO_BUTTON = document.createElement("button");
REDO_BUTTON.innerHTML = "redo";
REDO_BUTTON.classList.add("button");
RIGHT_BUTTON_FLEXBOX.append(REDO_BUTTON);

REDO_BUTTON.addEventListener("click", () => {
  if (REDO_DRAWINGS.length > 0) {
    const LAST_DRAWING = REDO_DRAWINGS.pop();
    if (LAST_DRAWING) DRAWINGS.push(LAST_DRAWING);
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});

const THIN_BUTTON = document.createElement("button");
THIN_BUTTON.innerHTML = "thin";
THIN_BUTTON.classList.add("button");
LEFT_BUTTON_FLEXBOX.append(THIN_BUTTON);

THIN_BUTTON.addEventListener("click", () => {
  lineThickness = 2;
});

LEFT_BUTTON_FLEXBOX.append(document.createElement("br"));

const THICK_BUTTON = document.createElement("button");
THICK_BUTTON.innerHTML = "thick";
THICK_BUTTON.classList.add("button");
LEFT_BUTTON_FLEXBOX.append(THICK_BUTTON);

THICK_BUTTON.addEventListener("click", () => {
  lineThickness = 4;
});
