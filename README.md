# Point Emitter

A small library that help you drag and drop an element much easier, make your code more elegent

### Live demo

Comming soon...

### Features include:

- Simple, easy to use
- Flexible approach to data, with customisable functions

### Install

```bash
$ yarn add point-emitter
```

### How to use:

```js
// query an element
const your_element = document.querySelector(selector);

const otps = {
  longPressThreshold: number, // emit touchstart after 250ms (default)
  gridMovement: number, // move element in a grid layout with specific value (default is 0)
};
// initialize a PointEmitter instance
const pe = new PointEmitter(your_element, otps);

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
