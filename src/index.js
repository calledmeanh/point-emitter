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

  attachChildrenEvent(childrens) {
    const container = this.getContainer();
    childrens.forEach(function (child) {
      child.addEventListener("mousedown", function (e) {
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseover", mouseover);
        document.addEventListener("mouseup", mouseup);
        /* clean these codes */
        child.classList.add("touched");
        const box = child.getBoundingClientRect();
        child.style.position = "fixed";
        child.style.top = box.top + "px";
        child.style.left = box.left + "px";
        child.style.width = box.width + "px";
        child.style.height = box.height + "px";
        child.style.zIndex = "5000";
        child.style.pointEvents = "none";

        const placeholderDiv = document.createElement("div");
        placeholderDiv.style.width = child.style.width;
        placeholderDiv.style.height = box.height + "px";
        placeholderDiv.classList.add("placeholder");
        placeholderDiv.textContent = child.textContent;
        container.insertBefore(placeholderDiv, child);
        /* clean these codes */

        /* clean these codes */
        function mousemove(e) {
          child.hidden = false;
          let x = e.pageX - box.left - box.width / 2;
          let y = e.pageY - box.top - box.height / 2;
          child.style.transform = `translate3d(${x}px,${y}px,0)`;
          child.hidden = true;
        }
        /* clean these codes */

        function mouseover(e) {
          e.stopPropagation();
          if (e.relatedTarget) {
            console.log("target: ", e.target);
            console.log("related: ", e.relatedTarget);
          }
        }

        function mouseup(e) {
          /* clean these codes */
          child.style = "";
          child.classList.remove("touched");
          container.removeChild(placeholderDiv);
          /* clean these codes */
          document.removeEventListener("mousemove", mousemove);
          document.removeEventListener("mouseover", mouseover);
          document.removeEventListener("mouseup", mouseup);
        }
      });
      child.addEventListener("dragstart", function (e) {
        return false;
      });
    });
  }

  bootstrap() {
    const childrens = this.getChildrens();
    this.attachChildrenEvent(childrens);
  }
}

const container = document.getElementsByClassName("container");
const dws = new DragWithStyle(container);
dws.bootstrap();
