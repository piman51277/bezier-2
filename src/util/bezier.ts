type point = [number, number];

export function bezier(controls: point[], t: number): point[][] {
  //t must be in [0,100]
  if (t < 0 || t > 100) {
    throw new Error("t must be in [0,100]");
  }

  t /= 100;

  //first level is the controls
  const points: point[][] = [controls];

  for (let i = 0; i < controls.length - 1; i++) {
    const last = points[i];

    //if there is only one point, we are done
    if (last.length === 1) {
      break;
    }

    //interpolate the points using t
    const next: point[] = [];

    //iterate in pairs
    for (let i = 0; i < last.length - 1; i++) {
      const [x1, y1] = last[i];
      const [x2, y2] = last[i + 1];

      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;

      next.push([x, y]);
    }

    points.push(next);
  }

  return points;
}
