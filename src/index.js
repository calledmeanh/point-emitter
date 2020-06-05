import "./index.css";
import { ERROR, STYLES, TXTS, EVENTS } from "./constants";

const DragWithStyle = function (styles = {}) {
  const dragWithStyleEl = document.querySelector(TXTS.DRAG_WITH_STYLE_DATA_ATTR);
  if (!dragWithStyleEl) throw new Error(ERROR.CONTAINER);
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
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return JSON.stringify(obj) === JSON.stringify({});
    },
    /**
     * return true if it has default styles
     * @param {*} styles user's style
     * ```
     *  const styles = {
     *    const placeholderEl = {
     *    border: "2px solid #a5dff8",
     *    backgroundColor: "#a5dff8",
     *    color: "#101928",
     *    boxShadow: "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
     *    };
     *    const dragEl = {
     *    border: "2px solid #a5dff8",
     *    backgroundColor: "#a5dff8",
     *    color: "#101928",
     *    boxShadow: "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
     *    };
     *  }
     * ```
     */
    _isHasDefaultStyles: function (styles) {
      if (styles.placeholderEl !== undefined && styles.dragEl !== undefined) return true;
      else return false;
    },
    _createDefaultStyles: function (styles) {
      /*  
          create default style if given style is empty or (styles = {})
          style.placeholderEl, style.dragEl are both empty (styles = {placeholderEl: {}, dragEl: {}})
      */
      let defaultPlaceholderEl = null;
      let defaultDragEl = null;
      if (this._isEmptyObject(styles) && !this._isHasDefaultStyles(styles)) {
        defaultPlaceholderEl = STYLES.PLACEHOLDER_EL;
        return { defaultPlaceholderEl, defaultDragEl };
      }

      const isFoundDefaultStyle = [false, false];
      for (const style in styles) {
        if (styles.hasOwnProperty(style)) {
          if (style === TXTS.DRAG_EL) {
            defaultDragEl = styles[style];
            isFoundDefaultStyle[0] = true;
          }
          if (style === TXTS.PLACEHOLDER_EL) {
            defaultPlaceholderEl = styles[style];
            isFoundDefaultStyle[1] = true;
          }
          // found 2 default styles then stop loop
          if (isFoundDefaultStyle[0] && isFoundDefaultStyle[1]) break;
        }
        return { defaultPlaceholderEl, defaultDragEl };
      }
    },
    _initStyle: function () {
      const { defaultPlaceholderEl, defaultDragEl } = this._createDefaultStyles(styles);
      return { defaultPlaceholderEl, defaultDragEl };
    },
    apply: function () {
      const { defaultPlaceholderEl, defaultDragEl } = this._initStyle();

      const childrenByKeyValue = dragWithStyleEl.children;
      const childrenByIterable = Object.values(childrenByKeyValue);
      const childrenLength = childrenByIterable.length;

      if (!childrenLength) return;
      childrenByIterable.forEach(function (child) {
        child.addEventListener(EVENTS.MOUSEDOWN, function (e) {
          console.table(defaultPlaceholderEl);
          console.table(defaultDragEl);
        });
      });
    },
  };
};

new DragWithStyle().apply();
