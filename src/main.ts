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

// line constructor
function createLineCommand(
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

// emoji constructor
function createStickerCommand(
  x: number,
  y: number,
  sticker: string,
): DrawCommand {
  const NEW_CANVAS = document.createElement("canvas");
  NEW_CANVAS.width = CANVAS_SIZE;
  NEW_CANVAS.height = CANVAS_SIZE;
  const NEW_CONTEXT = NEW_CANVAS.getContext("2d")!;

  NEW_CONTEXT.font = "32px monospace";
  NEW_CONTEXT.fillText(sticker, x - 8, y + 16);

  return {
    drag(new_x: number, new_y: number) {
      NEW_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
      NEW_CONTEXT.fillText(sticker, new_x - 8, new_y + 16);
      CANVAS.dispatchEvent(REDRAW_EVENT);
    },

    display(ctx: CanvasRenderingContext2D) {
      ctx.drawImage(NEW_CANVAS, 0, 0);
    },
  };
}

// cursor constructor
function createCursorCommand(
  new_x: number,
  new_y: number,
): CursorCommand {
  const NEW_CANVAS = document.createElement("canvas");
  NEW_CANVAS.width = CANVAS_SIZE;
  NEW_CANVAS.height = CANVAS_SIZE;
  const NEW_CONTEXT = NEW_CANVAS.getContext("2d")!;

  return {
    x: new_x,
    y: new_y,
    canvas: NEW_CANVAS,
    context: NEW_CONTEXT,

    draw(ctx: CanvasRenderingContext2D) {
      CANVAS.dispatchEvent(REDRAW_EVENT);
      this.context.clearRect(0, 0, CANVAS.width, CANVAS.height);
      if (sticker == "") {
        this.context.beginPath();
        this.context.arc(this.x, this.y, 10, 0, 2 * Math.PI, false);
        this.context.lineWidth = lineThickness;
        this.context.stroke();
      } else {
        ctx.font = "24px monospace";
        ctx.fillText(sticker, this.x - 8, this.y + 16);
      }

      ctx.drawImage(this.canvas, 0, 0);
    },
  };
}

function createSticker(stickerText: string) {
  const STICKER_BUTTON = document.createElement("button");
  STICKER_BUTTON.textContent = stickerText;
  STICKER_BUTTON.classList.add("left-button");
  LEFT_BUTTON_FLEXBOX.append(STICKER_BUTTON);

  STICKER_BUTTON.addEventListener("click", () => {
    sticker = stickerText;
    CANVAS.dispatchEvent(MOVE_EVENT);
  });
}

let lineThickness: number = 2;

const DRAWINGS: DrawCommand[] = [];
const REDO_DRAWINGS: DrawCommand[] = [];
let currentDrawing: DrawCommand | null = null;
let cursorCommand: CursorCommand | null = null;

const AVAILABLE_STICKERS: string[] = ["❤️", "😊", "✨"];
let sticker: string = "";

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

CANVAS.addEventListener("tool-moved", () => {
  if (CONTEXT != null) {
    if (cursorCommand != null) cursorCommand.draw(CONTEXT);
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

  let new_drawing;
  if (sticker == "") {
    new_drawing = createLineCommand(CURSOR.x, CURSOR.y, lineThickness);
  } else new_drawing = createStickerCommand(CURSOR.x, CURSOR.y, sticker);
  currentDrawing = new_drawing;
  DRAWINGS.push(new_drawing);
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

      if (currentDrawing != null) currentDrawing.drag(CURSOR.x, CURSOR.y);

      CANVAS.dispatchEvent(REDRAW_EVENT);
    }
  }
});

CANVAS.addEventListener("pointerup", (_e) => {
  CURSOR.active = false;
  currentDrawing = null;
  CANVAS.dispatchEvent(REDRAW_EVENT);
});

CANVAS.addEventListener("drawing-changed", () => {
  if (CONTEXT != null) {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (const DRAWING of DRAWINGS) DRAWING.display(CONTEXT);
  }
});

const CLEAR_BUTTON = document.createElement("button");
CLEAR_BUTTON.textContent = "clear";
CLEAR_BUTTON.classList.add("right-button");
RIGHT_BUTTON_FLEXBOX.append(CLEAR_BUTTON);

CLEAR_BUTTON.addEventListener("click", () => {
  DRAWINGS.length = 0;
  CANVAS.dispatchEvent(REDRAW_EVENT);
});

const UNDO_BUTTON = document.createElement("button");
UNDO_BUTTON.textContent = "undo";
UNDO_BUTTON.classList.add("right-button");
RIGHT_BUTTON_FLEXBOX.append(UNDO_BUTTON);

UNDO_BUTTON.addEventListener("click", () => {
  if (DRAWINGS.length > 0) {
    const LAST_DRAWING = DRAWINGS.pop();
    if (LAST_DRAWING) REDO_DRAWINGS.push(LAST_DRAWING);
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});

const REDO_BUTTON = document.createElement("button");
REDO_BUTTON.textContent = "redo";
REDO_BUTTON.classList.add("right-button");
RIGHT_BUTTON_FLEXBOX.append(REDO_BUTTON);

REDO_BUTTON.addEventListener("click", () => {
  if (REDO_DRAWINGS.length > 0) {
    const LAST_DRAWING = REDO_DRAWINGS.pop();
    if (LAST_DRAWING) DRAWINGS.push(LAST_DRAWING);
    CANVAS.dispatchEvent(REDRAW_EVENT);
  }
});

const NEW_STICKER_BUTTON = document.createElement("button");
NEW_STICKER_BUTTON.textContent = "create custom sticker";
NEW_STICKER_BUTTON.classList.add("right-button");
NEW_STICKER_BUTTON.style.fontSize = "small";
RIGHT_BUTTON_FLEXBOX.append(NEW_STICKER_BUTTON);

NEW_STICKER_BUTTON.addEventListener("click", () => {
  const NEW_STICKER = prompt("Custom sticker text", "🙃");
  if (NEW_STICKER != null) {
    AVAILABLE_STICKERS.push(NEW_STICKER);
    createSticker(NEW_STICKER);
  }
});

const THIN_BUTTON = document.createElement("button");
THIN_BUTTON.textContent = "thin";
THIN_BUTTON.classList.add("left-button");
LEFT_BUTTON_FLEXBOX.append(THIN_BUTTON);

THIN_BUTTON.addEventListener("click", () => {
  lineThickness = 2;
  sticker = "";
});

const THICK_BUTTON = document.createElement("button");
THICK_BUTTON.textContent = "thick";
THICK_BUTTON.classList.add("left-button");
LEFT_BUTTON_FLEXBOX.append(THICK_BUTTON);

THICK_BUTTON.addEventListener("click", () => {
  lineThickness = 4;
  sticker = "";
});

for (const STICKER of AVAILABLE_STICKERS) {
  createSticker(STICKER);
}
