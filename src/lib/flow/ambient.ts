/**
 * Direction (radians) of the slow ambient current the flow field settles into
 * behind the content sections. Shared by the background field (FlowField) and
 * the content dissolve (Dissolve), so digits shed by the text drift exactly the
 * way the background digits do.
 *
 * @param x, y   position, CSS px
 * @param t      field time (advances 0.016 per 60fps frame)
 * @param ph     per-digit phase, 0..2π
 * @param depth  scroll-linked drift (scrollY × 0.0006)
 */
export function ambientAngle(x: number, y: number, t: number, ph: number, depth: number): number {
	return (
		Math.sin(x * 0.0022 + t * 0.12 + ph * 0.4) * 1.7 +
		Math.cos(y * 0.0026 - t * 0.09 + ph * 0.2) * 1.7 +
		Math.sin((x * 0.62 + y) * 0.0014 + t * 0.07 + depth) * 1.1
	);
}
