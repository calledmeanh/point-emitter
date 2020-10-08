enum EVENT_TYPE {
  BEFORE_SELECT = "BEFORE_SELECT",
  SELECT_START = "SELECT_START",
  SELECTING = "SELECTING",
  SELECT = "SELECT",
  CLICK = "CLICK",
  DB_CLICK = "DB_CLICK",
  TOUCH_EDGES = "TOUCH_EDGES",
  BEFORE_CREATE_GHOST = "BEFORE_CREATE_GHOST",
  RESET = "RESET",
}

enum DIRECTION {
  TOP = "TOP",
  RIGHT = "RIGHT",
  BOTTOM = "BOTTOM",
  LEFT = "LEFT",
}

type PointData = {
  x: number;
  y: number;
};

type EdgeData = PointData & {
  dir: DIRECTION;
};

type EventData = PointData & {
  isTouch: boolean;
};

type BoxData = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ListenerData = { [key: string]: Function[] };

type Ghost = {
  enable: boolean;
  style?: CSSStyleDeclaration;
};

class PointEmitter {
  private readonly clickTolerance: number = 5;
  private readonly clickInterval: number = 250;

  private readonly currentWindowWidth: number =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  private readonly currentWindowHeight: number =
    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  private longPressThreshold: number | null;
  private gridMovement: number | null;
  private saveMouseCoords: boolean | null;
  private ghost: Ghost | null;

  private bodyEl: HTMLBodyElement | null;

  private node: Element | null;
  private listeners: ListenerData;
  private initialEventData: EventData | null;
  private origDistanceFromXToNode: number | null;
  private origDistanceFromYToNode: number | null;
  private selecting: boolean | null;
  private selectEventData: PointData | null; // save currX & currY for SELECTING & SELECT type cause "touchEnd" doesn't have "pageX, pageY"
  private lastClickData: number | null; // save last click to compare with latest click for DB_CLICK type

  private removeInitialEventListener: Function;
  private removeMoveListener: Function;
  private removeEndListener: Function;
  private removeKeyListener: Function;
  private removeTouchMoveWindowListener: Function;

  constructor(
    node: Element | null,
    { longPressThreshold = 250, gridMovement = 0, saveMouseCoords = false, ghost = { enable: false } } = {}
  ) {
    this.longPressThreshold = longPressThreshold;
    this.gridMovement = gridMovement;
    this.saveMouseCoords = saveMouseCoords;
    this.ghost = ghost;

    this.bodyEl = document.querySelector("body");

    this.node = node;
    this.listeners = Object.create(null);
    this.selecting = false;

    // Fixes an iOS 10 bug where scrolling could not be prevented on the window.
    this.removeTouchMoveWindowListener = this.listener("touchmove", () => {}, window);

    this.onInitialEventListener();
  }

  destroy = () => {
    this.longPressThreshold = null;
    this.gridMovement = null;
    this.saveMouseCoords = null;
    this.ghost = null;

    this.bodyEl = null;

    this.node = null;
    this.listeners = Object.create(null);
    this.initialEventData = null;
    this.origDistanceFromXToNode = null;
    this.origDistanceFromYToNode = null;
    this.selecting = null;
    this.selectEventData = null;
    this.lastClickData = null;

    this.removeInitialEventListener && this.removeInitialEventListener();
    this.removeMoveListener && this.removeMoveListener();
    this.removeEndListener && this.removeEndListener();
    this.removeKeyListener && this.removeKeyListener();
    this.removeTouchMoveWindowListener && this.removeTouchMoveWindowListener();
  };
  /* getter setter */
  get getNode(): Element {
    return this.node;
  }

  get getListeners(): ListenerData {
    return this.listeners;
  }
  /* getter setter */

  /* wrapper for add event listener */
  private listener = (type: string, handler: EventListenerOrEventListenerObject, target?: any) => {
    target && target.addEventListener(type, handler, { passive: false });
    !target && this.node && this.node.addEventListener(type, handler, { passive: false });

    return () => {
      target && target.removeEventListener(type, handler);
      !target && this.node && this.node.removeEventListener(type, handler);
    };
  };
  /* wrapper for add event listener */

  /*  */
  private getBoundingRect = (node: Element): BoxData => {
    if (!node) return;

    const nodeBox: DOMRect = node.getBoundingClientRect();
    return {
      top: nodeBox.top + window.pageYOffset,
      left: nodeBox.left + window.pageXOffset,
      width: nodeBox.width,
      height: nodeBox.height,
    };
  };
  /*  */

  /* Listen for mousedown & touchstart. When one is received, disabled the other and setup future event base on type */
  private onInitialEventListener = (): void => {
    if (!this.node) return;

    const removeTouchStartListener = this.listener("touchstart", (e) => {
      this.removeInitialEventListener();
      this.removeInitialEventListener = this.onAddLongPressListener(this.onHandleEventListener, e);
    });

    const removeMouseDownListener = this.listener("mousedown", (e) => {
      this.removeInitialEventListener();
      this.onHandleEventListener(e);
      this.removeInitialEventListener = this.listener("mousedown", this.onHandleEventListener);
    });

    this.removeInitialEventListener = () => {
      removeTouchStartListener();
      removeMouseDownListener();
    };
  };
  /* Listen for mousedown & touchstart. When one is received, disabled the other and setup future event base on type */

  /* handling event */
  private onHandleEventListener = (e: any) => {
    if (!this.node) return;

    const { isTouch, x, y } = this.getEventCoords(e);
    const { top, left } = this.getBoundingRect(this.node);
    this.origDistanceFromYToNode = y - top;
    this.origDistanceFromXToNode = x - left;
    this.selectEventData = { x, y };
    this.initialEventData = { isTouch, x, y };

    this.onCreateGhostEl(this.node);
    this.emit(EVENT_TYPE.BEFORE_SELECT, this.initialEventData);

    switch (e.type) {
      case "touchstart":
        this.removeMoveListener = this.listener("touchmove", this.onMoveListener, window);
        this.removeEndListener = this.listener("touchend", this.onEndListener, window);
        this.removeKeyListener = this.listener("keydown", this.onEndListener, window);
        break;
      case "mousedown":
        this.removeMoveListener = this.listener("mousemove", this.onMoveListener, window);
        this.removeEndListener = this.listener("mouseup", this.onEndListener, window);
        this.removeKeyListener = this.listener("keydown", this.onEndListener, window);
        break;
      default:
        break;
    }
  };

  /* add long press listener if user touch the screen without moving their finger for 250ms */
  private onAddLongPressListener = (handleEventListener: Function, e: any) => {
    let longPressTimer: number | null = null;
    let removeTouchMoveListener: Function | null = null;
    let removeToucEndListener: Function | null = null;

    const cleanup = () => {
      longPressTimer && clearTimeout(longPressTimer);
      removeTouchMoveListener && removeTouchMoveListener();
      removeToucEndListener && removeToucEndListener();

      longPressTimer = null;
      removeTouchMoveListener = null;
      removeToucEndListener = null;
    };

    const onTouchStart = (e: any) => {
      longPressTimer = setTimeout(() => {
        cleanup();
        handleEventListener(e);
      }, this.longPressThreshold);
      removeTouchMoveListener = this.listener("touchmove", () => cleanup());
      removeToucEndListener = this.listener("touchend", () => cleanup());
    };

    const removeTouchStartListener = this.listener("touchstart", onTouchStart);

    e && onTouchStart(e);

    return () => {
      cleanup();
      removeTouchStartListener();
    };
  };

  private onMoveListener = (e: any) => {
    if (!this.initialEventData) return;

    const { x: initX, y: initY } = this.initialEventData;
    const { x, y } = this.getEventCoords(e);
    const origSelecting: boolean = this.selecting,
      distanceFromInitXToX: number = Math.abs(initX - x),
      distanceFromInitYToY: number = Math.abs(initY - y),
      click = this.isClick(x, y);

    // Prevent emitting selectStart event until mouse is moved.
    // in Chrome on Windows, mouseMove event may be fired just after mouseDown event.
    if (this.isClick(x, y) && !origSelecting && !(distanceFromInitXToX || distanceFromInitYToY)) return;

    let afterX: number = x;
    let afterY: number = y;
    if (this.saveMouseCoords) {
      afterX = x - this.origDistanceFromXToNode;
      afterY = y - this.origDistanceFromYToNode;
    }

    if (this.gridMovement) {
      afterX = this.calcGridMovement(afterX);
      afterY = this.calcGridMovement(afterY);
    }

    this.selectEventData = { x: afterX, y: afterY };
    this.selecting = true;

    !origSelecting && this.emit(EVENT_TYPE.SELECT_START, { x: initX, y: initY });
    !click && this.emit(EVENT_TYPE.SELECTING, this.selectEventData);

    const { touch, dir } = this.touchEdges(x, y);
    if (touch) {
      return this.emit(EVENT_TYPE.TOUCH_EDGES, { ...this.selectEventData, dir });
    }

    e.preventDefault();
  };

  private onEndListener = (e: any) => {
    if (!this.initialEventData) return;

    this.onDelGhostEl();

    this.removeMoveListener && this.removeMoveListener();
    this.removeEndListener && this.removeEndListener();
    this.removeKeyListener && this.removeKeyListener();
    this.selecting = false;

    const inRoot = this.node.contains(e.target);

    const { x, y } = this.getEventCoords(e);
    const click: boolean = this.isClick(x, y);

    if (e.key) {
      return this.emit(EVENT_TYPE.RESET, this.selectEventData);
    }

    if (click && inRoot) return this.onClickListener(e);

    if (!click) return this.emit(EVENT_TYPE.SELECT, this.selectEventData);
  };

  private onClickListener = (e: any) => {
    const { x, y } = this.getEventCoords(e);
    const now: number = new Date().getTime();
    if (this.lastClickData && now - this.lastClickData <= this.clickInterval) {
      this.lastClickData = null;
      return this.emit(EVENT_TYPE.DB_CLICK, { x, y });
    }
    this.lastClickData = now;
    return this.emit(EVENT_TYPE.CLICK, { x, y });
  };

  private getEventCoords = (e: any): EventData => {
    const coords: EventData = {
      isTouch: false,
      x: e.pageX,
      y: e.pageY,
    };
    /* if (e.touches && e.touches.length) {
      coords.isTouch = true;
      coords.x = e.touches[0].pageX;
      coords.y = e.touches[0].pageY;
    } */

    /* try new way =)) */
    e.touches &&
      e.touches.length &&
      ((coords.isTouch = true), (coords.x = e.touches[0].pageX), (coords.y = e.touches[0].pageY));
    return coords;
  };

  private isClick = (currX: number, currY: number): boolean => {
    const { isTouch, x, y } = this.initialEventData;
    return !isTouch && Math.abs(currX - x) <= this.clickTolerance && Math.abs(currY - y) <= this.clickTolerance;
  };

  private touchEdges = (x: number, y: number): { touch: boolean; dir: string | null } => {
    const { width, height } = this.getBoundingRect(this.node);

    let afterX: number = x;
    let afterY: number = y;

    if (this.saveMouseCoords) {
      afterX = x - this.origDistanceFromXToNode;
      afterY = y - this.origDistanceFromYToNode;
    }

    if (afterX < 0) {
      return { touch: true, dir: DIRECTION.LEFT };
    }
    if (afterX + width > this.currentWindowWidth) {
      return { touch: true, dir: DIRECTION.RIGHT };
    }
    if (afterY < 0) {
      return { touch: true, dir: DIRECTION.TOP };
    }
    if (afterY + height > this.currentWindowHeight) {
      return { touch: true, dir: DIRECTION.BOTTOM };
    }
    return { touch: false, dir: null };
  };

  private calcGridMovement = (currPosition: number) => {
    return Math.floor(currPosition / this.gridMovement) * this.gridMovement;
  };
  /* handling event */

  /* DOM manipulation */
  private onCreateGhostEl = (node: Element) => {
    // create ghost el
    if (this.ghost && this.ghost.enable) {
      const ghost: Node = node.cloneNode(true);
      (ghost as HTMLElement).id = "pe-ghost";
      if (this.ghost.style) {
        for (let s in this.ghost.style) {
          if (this.ghost.style[s]) {
            (ghost as HTMLElement).style[s] = this.ghost.style[s];
          }
        }
      }
      this.emit(EVENT_TYPE.BEFORE_CREATE_GHOST, ghost);
      this.bodyEl.insertBefore(ghost, node);
    }
  };

  private onDelGhostEl = () => this.ghost && this.ghost.enable && document.querySelector("#pe-ghost").remove();
  /* DOM manipulation */

  /* Inspire by EventEmiiter, turnsout it's PubSub pattern */
  on = (type: string, handler: Function): { off: Function } => {
    let idx: number = (this.listeners[type] || (this.listeners[type] = [])).push(handler) - 1;
    return {
      off() {
        this.listeners[type].splice(idx, 1);
      },
    };
  };

  private emit = (type: string, ...args: any): void => {
    (this.listeners[type] || []).forEach((fn) => {
      fn(...args);
    });
  };
  /* Inspire by EventEmiiter, turnsout it's PubSub pattern */
}
export default PointEmitter;
