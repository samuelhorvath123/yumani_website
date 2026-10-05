/** Keep browser methods bound to their Window when passed into a controller. */
export function createAnimationScheduler(host: Pick<Window, 'requestAnimationFrame' | 'cancelAnimationFrame'>) {
  return {
    frame: (callback: () => void) => host.requestAnimationFrame(callback),
    cancelFrame: (id: number) => host.cancelAnimationFrame(id),
  };
}
