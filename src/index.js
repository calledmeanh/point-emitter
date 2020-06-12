import "./index.css";
import { ERROR, STYLES, TXTS, EVENTS } from "./constants";

const DragWithStyle = function (styles = {}) {
  const dragWithStyleEl = document.querySelector(TXTS.DRAG_WITH_STYLE_DATA_ATTR);
  if (!dragWithStyleEl) throw new Error(ERROR.CONTAINER);
  this.originStyle = null; // store origin style for dragging element
  this.collidedObjects = null;
  return {
    /**
     * return true if this is an object
     * @param {Object()} obj obj given by the user
     */
    _isObject: function (obj) {
      if (typeof obj !== TXTS.OBJECT) return false;
      return true;
    },
    /**
     * return true if this object is empty
     * @param {Object} obj obj give by the user
     */
    _isEmptyObject: function (obj) {
      if (!this._isObject(obj)) throw new Error(ERROR.OBJECT);
      // TODO: cannot use loopingObj here
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return JSON.stringify(obj) === JSON.stringify({});
    },
    /**
     * loop through an object and return the key and value in the callback function
     * @param {Object} obj given obj
     * @callback return key and value of that obj
     * @param {{empty: boolean}} options optional `{empty}` true mean ignore empty value, otherwise not ignore
     */
    _loopingObj: function (obj, cb, options = { empty: false }) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (options.empty) {
            cb(key, obj[key]);
          } else {
            if (obj[key]) {
              cb(key, obj[key]);
            }
          }
        }
      }
    },
    /**
     * create default style if given style is empty or (styles = {})
     * style.ghostEl, style.dragEl are both empty (styles = {ghostEl: {}, dragEl: {}})
     *
     * @param {{ghostEl: Object, dragEl: Object}} styles given styles by user
     */
    _createStyles: function (styles) {
      const ghostElStyle = { ...STYLES.GHOST_EL };
      const dragElStyle = { ...STYLES.DEFAULT };

      // first solution - June 7, 2020
      // find another solution if I can. But later!
      let newGhostStyle = styles.ghostEl;
      if (newGhostStyle && !this._isEmptyObject(newGhostStyle)) {
        this._loopingObj(
          STYLES.DEFAULT,
          function (key) {
            ghostElStyle[key] = newGhostStyle[key];
          },
          { empty: true }
        );
      }

      let newDragStyle = styles.dragEl;
      if (newDragStyle && !this._isEmptyObject(newDragStyle)) {
        this._loopingObj(
          STYLES.DEFAULT,
          function (key) {
            dragElStyle[key] = newDragStyle[key];
          },
          { empty: true }
        );
      }
      return { ghostElStyle, dragElStyle };
    },
    /**
     * init styles
     */
    _initStyle: function () {
      const { ghostElStyle, dragElStyle } = this._createStyles(styles);
      return { ghostElStyle, dragElStyle };
    },
    /**
     * return childrens in dragWithStyle container element, create a `dragWithStyleItem` mark attribute for elements
     */
    _getDragWithStyleChildren: function () {
      const childrenByKeyValue = dragWithStyleEl.children;
      const childrenByIterable = Object.values(childrenByKeyValue);
      const childrenWithAttr = this._setDragWithStyleAttrForChildrens(childrenByIterable);
      return childrenWithAttr;
    },
    /**
     * return elements with a `dragWithStyleItem` mark attribute
     * @param {HTMLElement[]} childrens childrens in dragWithStyle container element
     */
    _setDragWithStyleAttrForChildrens: function (childrens) {
      const childrenCopy = [...childrens];
      for (let i = 0; i < childrenCopy.length; i++) {
        const child = childrens[i];
        child.setAttribute(TXTS.DRAG_WITH_STYLE_ITEM, "");
      }
      return childrenCopy;
    },
    /**
     *
     * @param {Object} style styles for element
     * @param {HTMLElement} el element need to be updated with new style
     */
    _setStyleForEl: function (styles, el) {
      this._loopingObj(styles, function (key) {
        el.style[key] = styles[key];
      });
    },
    /**
     * return an element will be cloned by the given child,
     * while creating an element, this element will have an id to use for deleting later
     * @param {HTMLElement} child this child will be clone for ghost element
     */
    _createGhostElBy: function (child) {
      const { ghostElStyle } = this._initStyle();
      const ghostEl = child.cloneNode(true);
      this._setStyleForEl(ghostElStyle, ghostEl);
      ghostEl.id = TXTS.DRAG_WTIH_STYLE_GHOST_EL;
      ghostEl.removeAttribute(TXTS.DRAG_WITH_STYLE_ITEM);
      return ghostEl;
    },
    /**
     * remove an element with dragWithStyle id
     */
    _removeGhostEl: function () {
      const ghostEl = document.getElementById(TXTS.DRAG_WTIH_STYLE_GHOST_EL);
      ghostEl.remove();
    },
    /**
     * return true if there is some key in `dragElStyle` has data
     * @param {Object} dragElStyle given style by user
     */
    _isHasSomeStyleForDragEl: function (dragElStyle) {
      // TODO: cannot use loopingObj here
      for (const key in dragElStyle) {
        if (dragElStyle.hasOwnProperty(key)) {
          if (dragElStyle[key]) return true;
        }
      }
      return false;
    },
    /**
     * return the origin style of drag el when dragging to revert it when the user stop dragging
     * @param {HTMLElement} dragEl element is being dragged by the user
     */
    _storeOriginStyleForDragEl: function (dragEl) {
      const originStyle = { ...STYLES.DEFAULT };
      const dragElStyle = window.getComputedStyle(dragEl);
      // TODO: cannot use loopingObj here
      for (const key in originStyle) {
        if (originStyle.hasOwnProperty(key)) {
          if (dragElStyle[key]) {
            originStyle[key] = dragElStyle[key];
          }
        }
      }
      this.originStyle = originStyle;
    },
    /**
     * revert style for dragging element
     * @param {HTMLElement} dragEl element is being dragged by the user
     */
    _resetStyleForDragEl: function (dragEl) {
      const originStyle = this.originStyle;
      this._loopingObj(originStyle, function (key) {
        dragEl.style[key] = originStyle[key];
      });
    },
    /**
     *
     * @param {Object} dragElStyle given style by user
     * @param {HTMLElement} dragEl element need to be updated with `dragElStyle`
     */
    _setStyleForDragEl: function (dragElStyle, dragEl) {
      if (this._isHasSomeStyleForDragEl(dragElStyle)) {
        this._storeOriginStyleForDragEl(dragEl);
        this._setStyleForEl(dragElStyle, dragEl);
      }
    },
    /**
     * return true if the user want to drag an el by grid
     * @param {Object} moveByGrid obj given by the user
     */
    _isMoveByGrid: function (moveByGrid) {
      if (moveByGrid && moveByGrid.enable) return true;
      else return false;
    },
    /**
     * calculate new position top or left in grid mode
     * @param {number} pos postion
     * @param {number} gridValue px for each move
     */
    _calcPosByGrid: function (pos, gridValue) {
      const newPos = Math.round(parseFloat(pos) / gridValue) * gridValue;
      return newPos;
    },
    /**
     * return a new position by grid if the user want to move by grid, otherwise return a normal position of the mouse
     * @param {Object} moveByGrid obj given by the user
     * @param {number} top y coordinate of the mouse
     * @param {number} left x coordinate of the mouse
     */
    _getPosByGrid: function (moveByGrid, top, left) {
      let topValue = 0,
        leftValue = 0;
      const isGrid = this._isMoveByGrid(moveByGrid);
      if (isGrid) {
        let gridValue = 0;
        if (moveByGrid.value) {
          gridValue = moveByGrid.value;
        } else gridValue = 40;
        topValue = this._calcPosByGrid(top, gridValue);
        leftValue = this._calcPosByGrid(left, gridValue);
      } else {
        topValue = top;
        leftValue = left;
      }
      return { topValue, leftValue };
    },
    /**
     * return a position to calculate its boundaries
     * @param {HTMLElement} node HTML element
     * @return {Object} {top, left, right, bottom}
     */
    _getBoundsForNode(node) {
      if (!node.getBoundingClientRect) return node;

      let rect = node.getBoundingClientRect(),
        left = rect.left + (document.body.scrollLeft || 0),
        top = rect.top + (document.body.scrollTop || 0);

      return {
        top: top,
        left: left,
        right: (node.offsetHeight || 0) + left,
        bottom: (node.offsetHeight || 0) + top,
        width: node.offsetWidth,
        height: node.offsetHeight,
      };
    },
    _objectsCollide: function (nodeA, nodeB, tolerance = 0) {
      let { top: aTop, left: aLeft, right: aRight = aLeft, bottom: aBottom = aTop } = this._getBoundsForNode(nodeA);
      let { top: bTop, left: bLeft, right: bRight = bLeft, bottom: bBottom = bTop } = this._getBoundsForNode(nodeB);

      return !(
        // 'a' bottom doesn't touch 'b' top
        (
          aBottom - tolerance < bTop ||
          // 'a' top doesn't touch 'b' bottom
          aTop + tolerance > bBottom ||
          // 'a' right doesn't touch 'b' left
          aRight - tolerance < bLeft ||
          // 'a' left doesn't touch 'b' right
          aLeft + tolerance > bRight
        )
      );
    },
    _detectRightClick: function (e) {
      if (e.which === 3 || e.button === 2) return true;
      return false;
    },
    /**
     * bootstrap function
     * @param {{moveByGrid: { enable: boolean, value: number }}} config
     */
    apply: function (config = {}) {
      const { dragElStyle } = this._initStyle();
      const childrenByIterable = this._getDragWithStyleChildren();
      const childrenLength = childrenByIterable.length;
      if (!childrenLength) return; // if length === 0 then return

      const self = this;
      let originTop = 0;
      let originLeft = 0;
      childrenByIterable.forEach(function (child) {
        child.addEventListener(EVENTS.MOUSEDOWN, function (e) {
          // right clicks
          const isRightClick = self._detectRightClick(e);
          if (isRightClick) return;
          // create ghost element
          const ghostEl = self._createGhostElBy(child);
          dragWithStyleEl.appendChild(ghostEl);
          // add class dragging here to prevent ghost el has this class
          child.classList.add(TXTS.DRAGGING_CLASS);
          // set style for dragging element if it has
          self._setStyleForDragEl(dragElStyle, child);
          originTop = e.pageY - child.offsetTop;
          originLeft = e.pageX - child.offsetLeft;

          dragWithStyleEl.addEventListener(EVENTS.MOUSEMOVE, mouseMove);
          dragWithStyleEl.addEventListener(EVENTS.MOUSEUP, mouseUp);

          function mouseMove(e) {
            const { pageX, pageY } = e;
            const top = pageY - originTop;
            const left = pageX - originLeft;

            // move by grid
            const { moveByGrid } = config;
            let { topValue /* , leftValue */ } = self._getPosByGrid(moveByGrid, top, left);
            // move by grid

            /* TODO: clean code -- constant file is not clear */
            const childBox = self._getBoundsForNode(child);
            const containerBox = self._getBoundsForNode(dragWithStyleEl);
            if (topValue + childBox.height >= containerBox.height) {
              topValue = containerBox.height - childBox.height;
            } else if (topValue <= 0) {
              topValue = 0;
            }

            /* TODO: clean code */

            child.style.top = topValue + "px";
          }

          function mouseUp(e) {
            child.classList.remove(TXTS.DRAGGING_CLASS);
            self._removeGhostEl();
            self._resetStyleForDragEl(child);

            dragWithStyleEl.removeEventListener(EVENTS.MOUSEMOVE, mouseMove);
            dragWithStyleEl.removeEventListener(EVENTS.MOUSEUP, mouseUp);
          }
        });
        child.addEventListener(EVENTS.DRAGSTART, function (e) {
          return false;
        });
      });
    },
  };
};

new DragWithStyle().apply({ moveByGrid: { enable: true, value: 20 } });
