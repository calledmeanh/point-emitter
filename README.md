# Point Emitter

A small library that help you drag and drop an element much easier, make your code more elegent

### Live demo

See [point-emitter.vercel.app](https://point-emitter.vercel.app/) for live demo

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
  // set a ghost el behind your_element
  // create if enable is true and vice versa (default is false if there is no ghost property)
  // style for modifing, if one of your styles is empty then ignore. Code below is example ;)
  ghost: {
    enable: true,
    style: {
      background: "#fff",
      border: "1px solid lightblue",
      opacity: 0.5,
      boxShadow: "",
      color: "",
    },
  },
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

/* 
  callback function (cbf) for modifiying ghost element,
  this cbf happens before append to body tag but after apply your style (*), 
  so if your dont want to set your style above then you can do it here or do sth as you wish.
  (*): {
    applying style...
    cb();
    appending to body...
  }
*/
pe.on("BEFORE_CREATE_GHOST", (ghost) => {
  // for example
  // ghost.classList.add("your_class")
  // ghost.setAttribute("key", "value") ...
  console.log("BEFORE_CREATE_GHOST", ghost); // ghost element
});

// press any key to reset
pe.on("RESET", (point) => {
  console.log("reset", point); // {x,y} - last position after dragging
});
// And, that's it. Happy coding!
```
