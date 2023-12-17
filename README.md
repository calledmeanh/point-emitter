# Point Emitter

A small library that help you drag and drop an element much easier, make your code more elegent

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
  saveMouseCoords: boolean, // keep the initial shift of the element relative to the pointer (default is false)
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
// PointEmitter provides you 9 events that help your drag & drop an element much easier
// initialize a PointEmitter instance
const pe = new PointEmitter(your_element, otps);

/* 
  automatically execute this event when you click if you enable your ghost element
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

// when you click, execute this event
pe.on("BEFORE_SELECT", (point) => {
  console.log(point); // {isTouch, x, y} - first position
});

// when you slightly move your mouse, execute this event
pe.on("SELECT_START", (point) => {
  console.log(point); // {x, y}
});

// when you move your mouse, execute this event
pe.on("SELECTING", (point) => {
  console.log(point); // {x, y}
});

// when you stop and release your mouse, execute this event
pe.on("SELECT", (point) => {
  console.log(point); // {x, y} - last position after dragging
});

// when you click, execute this event
pe.on("CLICK", (point) => {
  console.log(point); // {x, y}
});

// when you db click, execute this event
pe.on("DB_CLICK", (point) => {
  console.log(point); // {x, y}
});

// when your element touches window edges, execute this event
pe.on("TOUCH_EDGES", (point) => {
  console.log("TOUCH_EDGES", point); // {x, y, dir (top, right, bottom, left)}
});

// when press any key, execute this event
pe.on("RESET", (point) => {
  console.log("reset", point); // {x,y} - last position after dragging
});

// when you have some actions like destroy or something like that, call destroy function
// pe.destroy();

// And, that's it. Happy coding!
```
