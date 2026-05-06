// Minimal bitmap-sdf implementation to satisfy Cesium label rendering.
// Source based on the bitmap-sdf package (MIT).

const INF = 1e20;

function calcSDF(src, options) {
	const config = options || {};
	const cutoff = config.cutoff == null ? 0.25 : config.cutoff;
	const radius = config.radius == null ? 8 : config.radius;
	const channel = config.channel || 0;
	let w;
	let h;
	let size;
	let data;
	let intData;
	let stride;
	let ctx;
	let canvas;
	let imgData;
	let i;
	let l;

	if (ArrayBuffer.isView(src) || Array.isArray(src)) {
		if (!config.width || !config.height) {
			throw new Error("For raw data width and height should be provided by options");
		}
		w = config.width;
		h = config.height;
		data = src;

		if (!config.stride) {
			stride = Math.floor(src.length / w / h);
		} else {
			stride = config.stride;
		}
	} else if (window.HTMLCanvasElement && src instanceof window.HTMLCanvasElement) {
		canvas = src;
		ctx = canvas.getContext("2d");
		w = canvas.width;
		h = canvas.height;
		imgData = ctx.getImageData(0, 0, w, h);
		data = imgData.data;
		stride = 4;
	} else if (window.CanvasRenderingContext2D && src instanceof window.CanvasRenderingContext2D) {
		canvas = src.canvas;
		ctx = src;
		w = canvas.width;
		h = canvas.height;
		imgData = ctx.getImageData(0, 0, w, h);
		data = imgData.data;
		stride = 4;
	} else if (window.ImageData && src instanceof window.ImageData) {
		imgData = src;
		w = src.width;
		h = src.height;
		data = imgData.data;
		stride = 4;
	}

	size = Math.max(w, h);

	if ((window.Uint8ClampedArray && data instanceof window.Uint8ClampedArray) || (window.Uint8Array && data instanceof window.Uint8Array)) {
		intData = data;
		data = Array(w * h);

		for (i = 0, l = Math.floor(intData.length / stride); i < l; i += 1) {
			data[i] = intData[i * stride + channel] / 255;
		}
	} else if (stride !== 1) {
		throw new Error("Raw data can have only 1 value per pixel");
	}

	const gridOuter = Array(w * h);
	const gridInner = Array(w * h);
	const f = Array(size);
	const d = Array(size);
	const z = Array(size + 1);
	const v = Array(size);

	for (i = 0, l = w * h; i < l; i += 1) {
		const a = data[i];
		gridOuter[i] = a === 1 ? 0 : a === 0 ? INF : Math.pow(Math.max(0, 0.5 - a), 2);
		gridInner[i] = a === 1 ? INF : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
	}

	edt(gridOuter, w, h, f, d, v, z);
	edt(gridInner, w, h, f, d, v, z);

	const dist = window.Float32Array ? new Float32Array(w * h) : new Array(w * h);

	for (i = 0, l = w * h; i < l; i += 1) {
		dist[i] = Math.min(Math.max(1 - ((gridOuter[i] - gridInner[i]) / radius + cutoff), 0), 1);
	}

	return dist;
}

function edt(data, width, height, f, d, v, z) {
	for (let x = 0; x < width; x += 1) {
		for (let y = 0; y < height; y += 1) {
			f[y] = data[y * width + x];
		}
		edt1d(f, d, v, z, height);
		for (let y = 0; y < height; y += 1) {
			data[y * width + x] = d[y];
		}
	}
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			f[x] = data[y * width + x];
		}
		edt1d(f, d, v, z, width);
		for (let x = 0; x < width; x += 1) {
			data[y * width + x] = Math.sqrt(d[x]);
		}
	}
}

function edt1d(f, d, v, z, n) {
	v[0] = 0;
	z[0] = -INF;
	z[1] = +INF;

	for (let q = 1, k = 0; q < n; q += 1) {
		let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
		while (s <= z[k]) {
			k -= 1;
			s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
		}
		k += 1;
		v[k] = q;
		z[k] = s;
		z[k + 1] = +INF;
	}

	for (let q = 0, k = 0; q < n; q += 1) {
		while (z[k + 1] < q) k += 1;
		d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
	}
}

export default calcSDF;
