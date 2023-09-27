type DragPoint = {
  //position
  x: number;
  y: number;

  //display
  size: number;
  label: string;
  color: string;

  //used to determine which point is dragged first
  priority: number;

  //used to determine if the point is being dragged
  isDragging: boolean;
};

export class Draggable {
  private dragPoints: DragPoint[] = [];
  private nextPointId = 0;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private pickup: boolean = false;
  private pickupPoint: DragPoint | null = null;

  public drawBg() {}

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.attachListeners();
  }

  private attachListeners() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private removeListeners() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  private drawPoint(point: DragPoint) {
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
    this.ctx.fillStyle = point.color;
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.fillStyle = "black";
    this.ctx.fillText(point.label, point.x + 5, point.y - point.size - 5);
  }

  private mouseDownHandler = (e: MouseEvent) => {
    const x = e.offsetX;
    const y = e.offsetY;

    //find all points that are within the mouse click
    const points = this.dragPoints.filter((point) => {
      const dx = point.x - x;
      const dy = point.y - y;

      //add a little lee-way
      const thresh = point.size + 5;

      return dx * dx + dy * dy <= thresh * thresh;
    });

    //no need to continue if no points were found
    if (points.length === 0) return;

    //find the point with the highest priority
    const point = points.reduce((prev, current) =>
      prev.priority > current.priority ? prev : current
    );

    //if a point was found, set it as the pickup point
    if (point) {
      this.pickupPoint = point;
      this.pickup = true;
    }
  };

  private mouseUpHandler = (e: MouseEvent) => {
    this.pickup = false;
    this.pickupPoint = null;
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    if (this.pickup) {
      const x = e.offsetX;
      const y = e.offsetY;

      this.pickupPoint!.x = x;
      this.pickupPoint!.y = y;

      this.draw();
    }
  };

  public draw() {
    //call the draw function
    this.drawBg();

    //draw the points
    this.dragPoints.forEach((point) => this.drawPoint(point));
  }

  public set drawCallback(callback: () => void) {
    this.drawBg = callback;
  }

  public enable() {
    this.attachListeners();
  }

  public disable() {
    this.removeListeners();
  }

  public addPoint(x: number, y: number, size = 7, label = "", color = "black") {
    const thisId = this.nextPointId++;

    if (label === "") {
      label = thisId.toString();
    }

    this.dragPoints.push({
      x,
      y,
      size,
      label,
      color,
      priority: thisId,
      isDragging: false,
    });
  }

  public removePoint() {
    //remove the last point
    this.dragPoints.pop();
  }

  public removeAllPoints() {
    this.dragPoints = [];

    //the following is not needed
    //but its for better UX
    this.nextPointId = 0;
  }

  public get points(): [number, number][] {
    return this.dragPoints.map((point) => [point.x, point.y]);
  }
}
