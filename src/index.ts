import { BezierAnim } from "./BezierAnim";

function ready(fn: any) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(() => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  //force canvas to be 500x500
  canvas.width = 500;
  canvas.height = 500;

  const anim = new BezierAnim(canvas);

  const binds: [string, string, () => void][] = [
    ["add-point-btn", "click", anim.addPointHandler],
    ["remove-point-btn", "click", anim.removePointHandler],
    ["start-btn", "click", anim.startMotionHandler],
    ["stop-btn", "click", anim.stopMotionHandler],
    ["reset-btn", "click", anim.resetHandler],
  ];

  for (const [id, event, handler] of binds) {
    const el = document.getElementById(id)!;
    el.addEventListener(event, handler.bind(anim));
  }

  //time slider
  const timeSlider = document.getElementById(
    "time-control"
  ) as HTMLInputElement;
  timeSlider.addEventListener("input", () => {
    anim.overrideTimeHandler(parseInt(timeSlider.value));
  });

  //bind the slider value to the time
  anim.bindAnimationUpdate((t) => {
    timeSlider.value = t.toString();
  });

  //intermediate checkbox
  const intermediateCheckbox = document.getElementById(
    "show-inter"
  ) as HTMLInputElement;
  intermediateCheckbox.addEventListener("change", () => {
    const checked = intermediateCheckbox.checked;

    if (checked) {
      anim.showIntermediateHandler();
    } else {
      anim.hideIntermediateHandler();
    }
  });

  //set the demo scene
  anim.setDemoPoints();
});
