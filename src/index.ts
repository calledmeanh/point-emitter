enum EVENT_TYPE {
  BEFORE_SELECT = "",
  SELECT_START = "",
  SELECTING = "",
  SELECT = "",
  CLICK = "",
  DB_CLICK = "",
  RESET = "",
}

type Coords = {
  x: number;
  y: number;
};

class PointEmitter {
  private node: HTMLElement;
  private longPressThreshold: number;
  private listener: { [key: string]: Function[] };

  constructor(node: HTMLElement, { longPressThreshold = 250 } = {}) {
    this.node = node;
    this.longPressThreshold = longPressThreshold;
    this.listener = Object.create(null);

    this.onInitialEvent();
  }
  /* getter setter */
  get getNode() {
    return this.node;
  }

  get getListener() {
    return this.listener;
  }
  /* getter setter */

  /* Listen for mousedown & touchstart. When one is received, disabled the other */
  // xu ly vu click va touch luc chuyen giao giua cac device
  private onInitialEvent() {
    this.node.addEventListener("touchstart", this.onTouchStart, { passive: false });
    this.node.addEventListener("mousedown", this.onMouseDown, { passive: false });
  }

  private onTouchStart = (e: TouchEvent) => {
    this.node.removeEventListener("mousedown", this.onMouseDown);
    this.onAddLongPress(e);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.node.removeEventListener("touchstart", this.onTouchStart);
    this.onHandleMouseDown(e);
  };

  /* add long press if they don't move their finger within 250ms */
  private onAddLongPress = (e: TouchEvent) => {
    let longPressTimer: NodeJS.Timeout | null = null;
    longPressTimer = setTimeout(() => {
      cleanup();
      const { x, y } = this.getTouchEventCoords(e);
      this.emit(EVENT_TYPE.BEFORE_SELECT, { type: e.type, x, y });
    }, this.longPressThreshold);

    this.node.addEventListener("touchmove", () => cleanup(), { passive: false });
    this.node.addEventListener("touchend", () => cleanup(), { passive: false });

    const cleanup = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = null;
    };

    return () => {
      cleanup();
    };
  };

  private onHandleMouseDown = (e: MouseEvent) => {
    // prevent right click
    if (this.preventRightClick(e)) return;
    const { x, y } = this.getMouseEventCoords(e);
    this.emit(EVENT_TYPE.BEFORE_SELECT, { type: e.type, x, y });
  };

  private preventRightClick = (e: MouseEvent) => {
    if (e.which === 3 || e.button === 2) return true;
    return false;
  };

  private getTouchEventCoords = (e: TouchEvent) => {
    if (e.touches.length) {
      return { x: e.touches[0].pageX, y: e.touches[0].pageY };
    }
    return { x: null, y: null };
  };

  private getMouseEventCoords = (e: MouseEvent) => {
    if (e.pageX && e.pageY) {
      return { x: e.pageX, y: e.pageY };
    }
    return { x: null, y: null };
  };

  /* Listen for mousedown & touchstart. When one is received, disabled the other */

  /* Inspire by EventEmiiter, turnsout it's PubSub pattern */
  on = (type: string, handler: Function) => {
    let idx: number = (this.listener[type] || (this.listener[type] = [])).push(handler) - 1;
    return {
      off() {
        this.listener[type].splice(idx, 1);
      },
    };
  };

  emit = (type: string, ...args: any) => {
    (this.listener[type] || []).forEach((fn) => {
      fn(...args);
    });
  };
  /* Inspire by EventEmiiter, turnsout it's PubSub pattern */
}

const box: HTMLElement = document.querySelector(".box");
const pe: PointEmitter = new PointEmitter(box);

pe.on(EVENT_TYPE.BEFORE_SELECT, (data: Coords) => {
  console.log(data);
});
