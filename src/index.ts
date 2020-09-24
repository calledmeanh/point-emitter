enum EVENT_TYPE {
  BEFORE_SELECT = "BEFORE_SELECT",
  SELECT_START = "SELECT_START",
  SELECTING = "SELECTING",
  SELECT = "SELECT",
  CLICK = "CLICK",
  DB_CLICK = "DB_CLICK",
  RESET = "RESET",
}

type EventData = PointData & {
  isTouch: boolean;
};

type PointData = {
  x: number;
  y: number;
};

type ListenerData = { [key: string]: Function[] };

class PointEmitter {
  private readonly clickTolerance: number = 5;
  private readonly clickInterval: number = 250;

  private longPressThreshold: number;

  private node: HTMLElement;
  private listeners: ListenerData;
  private initialEventData: EventData | null;
  private selecting: boolean;
  private selectEventData: PointData;
  private lastClickData: number | null;

  private removeInitialEventListener: Function;
  private removeMoveListener: Function;
  private removeEndListener: Function;
  private removeTouchMoveWindowListener: Function;

  constructor(node: HTMLElement, { longPressThreshold = 250 } = {}) {
    this.node = node;
    this.listeners = Object.create(null);
    this.selecting = false;
    this.longPressThreshold = longPressThreshold;

    // Fixes an iOS 10 bug where scrolling could not be prevented on the window.
    this.removeTouchMoveWindowListener = this.listener("touchmove", () => {}, window);

    this.onInitialEventListener();
  }

  destroy = () => {
    this.node = null;
    this.listeners = Object.create(null);
    this.initialEventData = null;
    this.selecting = false;
    this.lastClickData = null;

    this.removeInitialEventListener && this.removeInitialEventListener();
    this.removeMoveListener && this.removeMoveListener();
    this.removeEndListener && this.removeEndListener();
    this.removeTouchMoveWindowListener && this.removeTouchMoveWindowListener();
  };
  /* getter setter */
  get getNode(): HTMLElement {
    return this.node;
  }

  get getListeners(): ListenerData {
    return this.listeners;
  }
  /* getter setter */

  /* wrapper for add event listener */
  listener = (type: string, handler: EventListenerOrEventListenerObject, target?: any) => {
    target && target.addEventListener(type, handler, { passive: false });
    !target && this.node.addEventListener(type, handler, { passive: false });

    return () => {
      target && target.removeEventListener(type, handler, { passive: false });
      !target && this.node.removeEventListener(type, handler);
    };
  };
  /* wrapper for add event listener */

  /* Listen for mousedown & touchstart. When one is received, disabled the other and setup future event base on type */
  onInitialEventListener = (): void => {
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
  onHandleEventListener = (e: any) => {
    const { isTouch, x, y } = this.getEventCoords(e);
    this.emit(EVENT_TYPE.BEFORE_SELECT, (this.initialEventData = { isTouch, x, y }));

    switch (e.type) {
      case "touchstart":
        this.removeMoveListener = this.listener("touchmove", this.onMoveListener);
        this.removeEndListener = this.listener("touchend", this.onEndListener);
        break;
      case "mousedown":
        this.removeMoveListener = this.listener("mousemove", this.onMoveListener);
        this.removeEndListener = this.listener("mouseup", this.onEndListener);
        break;
      default:
        break;
    }
  };

  /* add long press listener if user touch the screen without moving their finger for 250ms */
  onAddLongPressListener = (handleEventListener: Function, e: any) => {
    let longPressTimer: NodeJS.Timeout | null = null;
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

  onMoveListener = (e: any) => {
    if (!this.initialEventData) return;

    const { x: initX, y: initY } = this.initialEventData;
    const { x, y } = this.getEventCoords(e);
    const old: boolean = this.selecting,
      w: number = Math.abs(initX - x),
      h: number = Math.abs(initY - y),
      click = this.isClick(x, y);

    // Prevent emitting selectStart event until mouse is moved.
    // in Chrome on Windows, mouseMove event may be fired just after mouseDown event.
    if (this.isClick(x, y) && !old && !(w || h)) return;

    this.selecting = true;
    this.selectEventData = { x, y };

    !old && this.emit(EVENT_TYPE.SELECT_START, { x: initX, y: initY });
    !click && this.emit(EVENT_TYPE.SELECTING, this.selectEventData);

    e.preventDefault();
  };

  onEndListener = (e: any) => {
    this.removeMoveListener && this.removeMoveListener();
    this.removeEndListener && this.removeEndListener();
    this.selecting = false;

    if (!this.initialEventData) return;

    const inRoot = this.node.contains(e.target);

    const { x, y } = this.getEventCoords(e);
    const click: boolean = this.isClick(x, y);

    if (click && inRoot) return this.onClickListener(e);

    if (!click) return this.emit(EVENT_TYPE.SELECT, this.selectEventData);
  };

  onClickListener = (e: any) => {
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

  isClick = (currX: number, currY: number): boolean => {
    const { isTouch, x, y } = this.initialEventData;
    return !isTouch && Math.abs(currX - x) <= this.clickTolerance && Math.abs(currY - y) <= this.clickTolerance;
  };
  /* handling event */

  /* Inspire by EventEmiiter, turnsout it's PubSub pattern */
  on = (type: string, handler: Function): { off: Function } => {
    let idx: number = (this.listeners[type] || (this.listeners[type] = [])).push(handler) - 1;
    return {
      off() {
        this.listeners[type].splice(idx, 1);
      },
    };
  };

  emit = (type: string, ...args: any): void => {
    (this.listeners[type] || []).forEach((fn) => {
      fn(...args);
    });
  };
  /* Inspire by EventEmiiter, turnsout it's PubSub pattern */
}
