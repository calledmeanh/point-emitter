import "./index.css";
import { ERROR, STYLES, TXTS, EVENTS } from "./constants";

const DragWithStyle = function (styles = {}) {
  const dragWithStyleEl = document.querySelector(TXTS.DRAG_WITH_STYLE_DATA_ATTR);
  if (!dragWithStyleEl) throw new Error(ERROR.CONTAINER);
  this.originStyle = null; // store origin style for dragging element
  return {
    /**
     * return true if this is an object
     * @param {*} obj obj given by the user
     */
    _isObject: function (obj) {
      if (typeof obj !== TXTS.OBJECT) return false;
      return true;
    },
    /**
     * return true if this object is empty
     * @param {*} obj obj give by the user
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
     * @param {*} obj given obj
     * @param {*} cb return key and value of that obj
     * @param {*} options optional `{empty}` true mean ignore empty value and otherwise
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
     * style.placeholderEl, style.dragEl are both empty (styles = {placeholderEl: {}, dragEl: {}})
     *
     * @param {*} styles given styles by user
     */
    _createStyles: function (styles) {
      const placeholderElStyle = { ...STYLES.PLACEHOLDER_EL };
      const dragElStyle = { ...STYLES.DEFAULT };

      // first solution - June 7, 2020
      // find another solution if I can. But later!
      let newPlaceholderStyle = styles.placeholderEl;
      if (newPlaceholderStyle && !this._isEmptyObject(newPlaceholderStyle)) {
        // for (const style in STYLES.DEFAULT) {
        //   // sure about the keys so no need to check
        //   placeholderElStyle[style] = newPlaceholderStyle[style];
        // }
        this._loopingObj(
          STYLES.DEFAULT,
          function (key) {
            placeholderElStyle[key] = newPlaceholderStyle[key];
          },
          { empty: true }
        );
      }

      let newDragStyle = styles.dragEl;
      if (newDragStyle && !this._isEmptyObject(newDragStyle)) {
        // for (const style in STYLES.DEFAULT) {
        //   // sure about the keys so no need to check
        //   dragElStyle[style] = newDragStyle[style];
        // }
        this._loopingObj(
          STYLES.DEFAULT,
          function (key) {
            dragElStyle[key] = newDragStyle[key];
          },
          { empty: true }
        );
      }
      return { placeholderElStyle, dragElStyle };
    },
    /**
     * init styles
     */
    _initStyle: function () {
      const { placeholderElStyle, dragElStyle } = this._createStyles(styles);
      return { placeholderElStyle, dragElStyle };
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
     * @param {*} childrens childrens in dragWithStyle container element
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
     * @param {*} style styles for element
     * @param {*} el element need to be updated with new style
     */
    _setStyleForEl: function (styles, el) {
      // for (const style in styles) {
      //   if (styles.hasOwnProperty(style)) {
      //     el.style[style] = styles[style];
      //   }
      // }
      this._loopingObj(styles, function (key) {
        el.style[key] = styles[key];
      });
    },
    /**
     * return an element will be cloned by the given child,
     * while creating an element, this element will have an id to use for deleting later
     * @param {*} child this child will be clone for placeholder element
     */
    _createPlaceholderElBy: function (child) {
      const { placeholderElStyle } = this._initStyle();
      const placeholderEl = child.cloneNode(true);
      this._setStyleForEl(placeholderElStyle, placeholderEl);
      placeholderEl.id = TXTS.DRAG_WTIH_STYLE_PLACEHOLDER_EL;
      placeholderEl.removeAttribute(TXTS.DRAG_WITH_STYLE_ITEM);
      return placeholderEl;
    },
    /**
     * remove an element with dragWithStyle id
     */
    _removePlaceholderEl: function () {
      const placeholderEl = document.getElementById(TXTS.DRAG_WTIH_STYLE_PLACEHOLDER_EL);
      placeholderEl.remove();
    },
    /**
     * return true if there is some key in `dragElStyle` has data
     * @param {*} dragElStyle given style by user
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
     * @param {*} dragEl element is being dragged by the user
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
     * @param {*} dragEl element is being dragged by the user
     */
    _resetStyleForDragEl: function (dragEl) {
      const originStyle = this.originStyle;
      // for (const key in originStyle) {
      //   if (originStyle.hasOwnProperty(key)) {
      //     if (originStyle[key]) {
      //       dragEl.style[key] = originStyle[key];
      //     }
      //   }
      // }
      this._loopingObj(originStyle, function (key) {
        dragEl.style[key] = originStyle[key];
      });
    },
    /**
     *
     * @param {*} dragElStyle given style by user
     * @param {*} dragEl element need to be updated with `dragElStyle`
     */
    _setStyleForDragEl: function (dragElStyle, dragEl) {
      if (this._isHasSomeStyleForDragEl(dragElStyle)) {
        this._storeOriginStyleForDragEl(dragEl);
        this._setStyleForEl(dragElStyle, dragEl);
      }
    },
    /**
     * bootstrap function
     */
    apply: function () {
      const { dragElStyle } = this._initStyle();
      const childrenByIterable = this._getDragWithStyleChildren();
      const childrenLength = childrenByIterable.length;
      if (!childrenLength) return; // if length === 0 then return

      const self = this;
      let originTop = 0;
      let originLeft = 0;
      childrenByIterable.forEach(function (child) {
        child.addEventListener(EVENTS.MOUSEDOWN, function (e) {
          // create placeholder element
          const placeholderEl = self._createPlaceholderElBy(child);
          dragWithStyleEl.appendChild(placeholderEl);
          // add class dragging here to prevent placeholder el has this class
          child.classList.add("dragging");
          // set style for dragging element if it has
          self._setStyleForDragEl(dragElStyle, child);
          originTop = e.pageY - child.offsetTop;
          originLeft = e.pageX - child.offsetLeft;

          dragWithStyleEl.addEventListener(EVENTS.MOUSEMOVE, mouseMove);
          dragWithStyleEl.addEventListener(EVENTS.MOUSEUP, mouseUp);

          function mouseMove(e) {
            const { pageX, pageY } = e;
            child.style.top = pageY - originTop + "px";
            child.style.left = pageX - originLeft + "px";
          }

          function mouseUp(e) {
            child.classList.remove("dragging");
            self._removePlaceholderEl();
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

new DragWithStyle().apply();
