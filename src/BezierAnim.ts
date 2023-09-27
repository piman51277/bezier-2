import { Draggable } from "./elements/Draggable";
import { bezier } from "./util/bezier";
type point = [number, number];

export class BezierAnim {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private draggable: Draggable;

  private inMotion: boolean = false;
  private inManualMode: boolean = false;
  private motionPath: point[] = [];
  private renderIntermediate: boolean = true;

  public time: number = 0;
  private timeBind: (t: number) => void = () => {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.draggable = new Draggable(canvas);
    this.draggable.drawBg = this.drawBg.bind(this);
    this.draggable.draw();
  }

  private drawBg() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.inMotion && !this.inManualMode) {
      this.motionPath = this.getBezierPath();
      this.drawAtTime(100, this.renderIntermediate);
    }
  }

  private getBezierPath(): point[] {
    //TODO: Cache this if the points haven't changed
    const points: point[] = this.draggable.points;
    const path: point[] = [];

    if (points.length <= 1) return path;

    for (let t = 0; t <= 100; t += 1) {
      const pathAtT = bezier(points, t);

      const endpoint = pathAtT[pathAtT.length - 1][0];
      path.push(endpoint);
    }

    return path;
  }

  private drawMotionPath(until: number = 100) {
    if (this.motionPath.length <= 1) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.motionPath[0][0], this.motionPath[0][1]);
    const end = Math.min(this.motionPath.length, until);
    for (let i = 1; i < end; i++) {
      const [x, y] = this.motionPath[i];
      this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  private drawAtTime(t: number, intermediates: boolean = true) {
    const path = this.motionPath;
    if (path.length <= 1) return;

    //this draws the generator lines to demonstrate
    //how the curve is generated
    if (intermediates) {
      const completePath = bezier(this.draggable.points, t);

      for (let i = 0; i < completePath.length - 1; i++) {
        const points = completePath[i];

        this.ctx.beginPath();
        this.ctx.moveTo(points[0][0], points[0][1]);
        for (let j = 1; j < points.length; j++) {
          const [x, y] = points[j];
          this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = "blue";
        this.ctx.stroke();
      }
    }

    //draw the actual curve
    this.drawMotionPath(t);
  }

  private motionTick() {
    if (!this.inMotion) return;

    this.time += 1;
    if (this.time > 100) this.time = 0;

    this.draggable.draw();
    this.drawAtTime(this.time, this.renderIntermediate);
    this.timeBind(this.time);

    //wait at least 30ms before drawing again (30fps)
    setTimeout(() => requestAnimationFrame(this.motionTick.bind(this)), 30);
  }

  public bindAnimationUpdate(fn: (t: number) => void) {
    this.timeBind = fn;
  }

  public startMotionHandler() {
    if (this.inMotion) return;

    //additional check to protect user
    if (this.draggable.points.length <= 1) return;

    this.inMotion = true;
    this.time = 0;
    this.draggable.disable();
    this.motionTick();

    //more user protection
    this.canvas.addEventListener(
      "mousedown",
      this.stopMotionHandler.bind(this)
    );
  }

  public stopMotionHandler() {
    if (!this.inMotion) return;

    this.inMotion = false;
    this.draggable.enable();
    this.time = 0;

    //reset the time bind
    this.timeBind(0);

    //remove the listener we added in startMotionHandler
    this.canvas.removeEventListener(
      "mousedown",
      this.stopMotionHandler.bind(this)
    );
  }

  public overrideTimeHandler(t: number) {
    if (this.inMotion) this.stopMotionHandler();

    //FIXME: clunky flag logic
    this.inManualMode = true;
    this.time = t;
    this.draggable.draw();
    this.drawAtTime(this.time, this.renderIntermediate);
    this.inManualMode = false;
  }

  public addPointHandler() {
    if (this.inMotion) this.stopMotionHandler();
    this.draggable.addPoint(250, 250);
    this.draggable.draw();
  }

  public removePointHandler() {
    if (this.inMotion) this.stopMotionHandler();
    this.draggable.removePoint();
    this.draggable.draw();
  }

  public showIntermediateHandler() {
    this.renderIntermediate = true;
    this.draggable.draw();
  }

  public hideIntermediateHandler() {
    this.renderIntermediate = false;
    this.draggable.draw();
  }

  public resetHandler() {
    this.inMotion = false;
    this.inManualMode = false;
    this.time = 0;
    this.timeBind(0);
    this.draggable.removeAllPoints();
    this.draggable.draw();
    this.draggable.enable();
  }
}
