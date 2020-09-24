# PointEmitter

### 🔥 A small library that make your event listener much easier 🔥  

> Inspired by Pub-Sub Pattern, Node EventEmitter

# Install

`npm i point-emitter`  
`yarn add react-select`

# How to use:

```js
// query an element
const your_element = document.querySelect(selector);

// initialize a PointEmitter instance
const pe = new PointEmitter(your_element);

// listening events
pe.on("BEFORE_SELECT", (point) => {
  console.log(point); // {isTouch, x, y}
});
pe.on("SELECT_START", (point) => {
  console.log(point); // {x, y}
});
pe.on("SELECTING", (point) => {
  console.log(point); // {x, y}
});
pe.on("SELECT", (point) => {
  console.log(point); // {x, y}
});
pe.on("CLICK", (point) => {
  console.log(point); // {x, y}
});
pe.on("DB_CLICK", (point) => {
  console.log(point); // {x, y}
});
pe.on("RESET", (point) => {
  console.log(point); // {x, y}
});
// And, that's it. Happy coding!
```
