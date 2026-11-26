/** One `progress` value (0 = dusk … 1 = night). Scroll and the clock both write the target; the scene damps toward it. */
export const progress = { target: 0, shown: 0, dragging: false };
export const setTarget = (v: number) => {
  progress.target = Math.min(1, Math.max(0, v));
};
