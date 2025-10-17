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
