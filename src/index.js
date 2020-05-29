import "./index.css";

class DragWithStyle {
  constructor(container) {
    this.container = container;
  }

  getContainer() {
    return this.container[0];
  }

  getChildrens() {
    const childrenByKeyValue = this.getContainer().children;
    const childrensByIterable = Object.values(childrenByKeyValue);
    const childrens = childrensByIterable.slice(0, childrensByIterable.length);
    return childrens;
  }

  addMouseEvent() {
    const childrens = this.getChildrens();
    let originTop = 0;
    let originLeft = 0;
    childrens.forEach((child, i) => {
      child.addEventListener("mousedown", function (e) {
        child.classList.add("touched");
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        document.addEventListener("mouseover", mouseover);
        document.addEventListener("mouseleave", mouseleave);
      });

      function mousemove(e) {
        const { width, height } = child.getBoundingClientRect();
        /* cach 1 */
        const centerXForTranslate = e.pageX - child.offsetLeft - width / 2;
        const centerYForTranslate = e.pageY - child.offsetTop - height / 2;
        child.style.transform = `translate3d(${centerXForTranslate}px, ${centerYForTranslate}px, 0)`;
        /* cach 2 */
        // const centerYForLeft = e.pageX - width / 2;
        // const centerXForTop = e.pageY - height / 2;
        // child.style.left = `${centerYForLeft}px`;
        // child.style.top = `${centerXForTop}px`;
      }

      function mouseover(e) {
        // e.preventDefault();
        const draggedEl = e.relatedTarget;
        const stayEl = e.target;
        const draggedElPos = draggedEl.getBoundingClientRect();
        const stayElPos = stayEl.getBoundingClientRect();
        stayEl.style.transform = `translate3d(${originLeft}px, -${draggedElPos.height + 8}px, 0)`;
      }

      function mouseleave() {
        child.classList.remove("touched");
        child.style.transform = `translate3d(${originLeft}px, ${originTop}px, 0)`;
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        document.removeEventListener("mouseenter", mouseover);
        document.removeEventListener("mouseleave", mouseleave);
      }

      function mouseup(e) {
        child.classList.remove("touched");
        child.style.transform = `translate3d(${originLeft}px, ${originTop}px, 0)`;
        if (i === 0) {
          child.style.transform = `translate3d(${originLeft}px, ${172}px, 0)`;
        }
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        document.removeEventListener("mouseover", mouseover);
        document.removeEventListener("mouseleave", mouseleave);
      }
    });
  }

  run() {
    this.addMouseEvent();
  }
}

const container = document.getElementsByClassName("container");
const dws = new DragWithStyle(container);
dws.run();
