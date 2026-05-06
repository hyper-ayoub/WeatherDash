// Minimal GraphemeSplitter shim for Cesium label rendering.
// Uses Intl.Segmenter when available; falls back to Array.from().

class GraphemeSplitter {
	splitGraphemes(value) {
		const text = value == null ? '' : String(value);

		if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
			const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
			return Array.from(segmenter.segment(text), (segment) => segment.segment);
		}

		// Basic fallback: split by Unicode code points.
		return Array.from(text);
	}
}

export default GraphemeSplitter;
export { GraphemeSplitter };
