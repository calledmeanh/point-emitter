# PointEmitter

### 🔥 A small library that make your event listener much easier 🔥

> Inspired by Pub-Sub Pattern, Node EventEmitter

# Install

`npm i point-emitter`  
`yarn add point-emitter`

# How to use:

```js
// query an element
const your_element = document.querySelect(selector);

const otp = {
  longPressThreshold: 250, // emit touchstart after 250ms (default)
};
// initialize a PointEmitter instance
const pe = new PointEmitter(your_element, otp);

// listening events
pe.on("BEFORE_SELECT", (point) => {
  console.log(point); // {isTouch, x, y} - first position
});
pe.on("SELECT_START", (point) => {
  console.log(point); // {x, y}
});
pe.on("SELECTING", (point) => {
  console.log(point); // {x, y}
});
pe.on("SELECT", (point) => {
  console.log(point); // {x, y} - last position after dragging
});
pe.on("CLICK", (point) => {
  console.log(point); // {x, y}
});
pe.on("DB_CLICK", (point) => {
  console.log(point); // {x, y}
});
pe.on("TOUCH_EDGES", (point) => {
  console.log("TOUCH_EDGES", point); // {x, y, dir (top, right, bottom, left)}
});
// press any key to reset
pe.on("RESET", (point) => {
  console.log("reset", point); // {x,y} - last position after dragging
});
// And, that's it. Happy coding!
```
