/* const box = document.querySelector(".box");

const pe = new PointEmitter(box, { longPressThreshold: 250, gridMovement: 20 });

pe.on("BEFORE_SELECT", (point: PointData) => {
  console.log("BEFORE_SELECT", point); // {isTouch, x, y}
});
pe.on("SELECT_START", (point: PointData) => {
  box.classList.add("dragging");
  console.log("SELECT_START", point); // {x, y}
});
pe.on("SELECTING", (point: PointData) => {
  (box as HTMLElement).style.top = point.y + "px";
  (box as HTMLElement).style.left = point.x + "px";
  console.log("SELECTING", point); // {x, y}
});
pe.on("SELECT", (point: PointData) => {
  box.classList.remove("dragging");
  console.log("SELECT", point); // {x, y}
});
pe.on("CLICK", (point: PointData) => {
  console.log("CLICK", point); // {x, y}
});
pe.on("DB_CLICK", (point: PointData) => {
  console.log("DB_CLICK", point); // {x, y}
});

pe.on("TOUCH_EDGES", (point: EdgeData) => {
  console.log("TOUCH_EDGES", point); // {x, y, dir}
});

pe.on("RESET", (point: PointData) => {
  console.log("RESET", point);
  box.classList.remove("dragging");
});
 */