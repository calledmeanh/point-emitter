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

  addAttr(el, id) {
    if (!el.hasAttribute("draggable")) {
      el.setAttribute("draggable", true);
      el.setAttribute("data-id", id);
    }
    return el;
  }

  makeChildrenDraggable(elements) {
    const draggableEl = elements.map((el, index) => this.addAttr(el, index));
    return draggableEl;
  }

  onChildrenDragging(draggableEls) {
    draggableEls.forEach((el) => {
      el.addEventListener("dragstart", function (e) {
        el.classList.add("dragging");
      });
      el.addEventListener("dragend", function (e) {
        el.classList.remove("dragging");
        e.target.classList.remove("over");
      });
    });
  }

  onContainerDragging(container) {
    container.addEventListener("dragover", function (e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.pageY);
      const draggingEl = document.querySelector(".dragging");
      if (afterElement) {
        // afterElement.animate(
        //   [
        //     // keyframes
        //     { transform: "translateY(0px)" },
        //     { transform: `translateY(-172px)` },
        //   ],
        //   {
        //     // timing options
        //     duration: 300,
        //   }
        // );
        container.insertBefore(draggingEl, afterElement);
      } else {
        container.appendChild(draggingEl);
      }
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll(".box:not(.dragging)")];
      return draggableElements.reduce(
        (closet, curr) => {
          const box = curr.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closet.offset) {
            return { offset, element: curr };
          } else {
            return closet;
          }
        },
        { offset: Number.NEGATIVE_INFINITY, element: null }
      ).element;
    }
  }

  bootstrap() {
    const childrens = this.getChildrens();
    const draggableEl = this.makeChildrenDraggable(childrens);
    this.onChildrenDragging(draggableEl);

    const container = this.getContainer();
    this.onContainerDragging(container);
  }
}

const container = document.getElementsByClassName("container");
const dws = new DragWithStyle(container);
dws.bootstrap();
