// Minimal URI.js-compatible shim for Cesium's needs.
// Implements a subset of the API: scheme, authority, path, query, fragment,
// search, absoluteTo, normalize, toString.

function parseParts(input) {
	const raw = input ?? '';
	const result = {
		scheme: '',
		authority: '',
		path: '',
		query: '',
		fragment: '',
	};

	const hashIndex = raw.indexOf('#');
	const beforeHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
	result.fragment = hashIndex >= 0 ? raw.slice(hashIndex + 1) : '';

	const queryIndex = beforeHash.indexOf('?');
	const beforeQuery = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
	result.query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : '';

	// Absolute URI with scheme.
	const schemeMatch = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.exec(beforeQuery);
	if (schemeMatch) {
		try {
			const url = new URL(raw);
			result.scheme = url.protocol.replace(':', '');
			result.authority = url.host || '';
			result.path = url.pathname || '';
			result.query = url.search ? url.search.slice(1) : result.query;
			result.fragment = url.hash ? url.hash.slice(1) : result.fragment;
			return result;
		} catch (error) {
			// Fall through to basic parsing.
			result.scheme = schemeMatch[0].slice(0, -1);
		}
	}

	// Relative URI parsing.
	result.path = beforeQuery || '';
	return result;
}

function buildString(parts) {
	const hasAuthority = parts.authority && parts.authority.length > 0;
	const hasScheme = parts.scheme && parts.scheme.length > 0;
	const path = parts.path || (hasAuthority ? '/' : '');
	const schemePrefix = hasScheme ? `${parts.scheme}:` : '';
	const authorityPrefix = hasAuthority ? `//${parts.authority}` : '';
	const query = parts.query ? `?${parts.query}` : '';
	const fragment = parts.fragment ? `#${parts.fragment}` : '';
	return `${schemePrefix}${authorityPrefix}${path}${query}${fragment}`;
}

class Uri {
	constructor(url, base) {
		if (!(this instanceof Uri)) {
			return new Uri(url, base);
		}

		const parts = parseParts(url);
		this._parts = parts;
		if (base !== undefined && parts.scheme === '') {
			const resolved = this.absoluteTo(base);
			this._parts = resolved._parts;
		}
	}

	scheme() {
		return this._parts.scheme || '';
	}

	authority(value) {
		if (value === undefined) {
			return this._parts.authority || '';
		}
		this._parts.authority = String(value);
		return this;
	}

	path(value) {
		if (value === undefined) {
			return this._parts.path || (this._parts.authority ? '/' : '');
		}
		this._parts.path = String(value);
		return this;
	}

	query(value) {
		if (value === undefined) {
			return this._parts.query || '';
		}
		const next = String(value);
		this._parts.query = next.startsWith('?') ? next.slice(1) : next;
		return this;
	}

	fragment(value) {
		if (value === undefined) {
			return this._parts.fragment || '';
		}
		const next = String(value);
		this._parts.fragment = next.startsWith('#') ? next.slice(1) : next;
		return this;
	}

	search(value) {
		if (value === undefined) {
			return this._parts.query ? `?${this._parts.query}` : '';
		}
		return this.query(value);
	}

	absoluteTo(base) {
		const baseString = base instanceof Uri ? base.toString() : String(base ?? '');
		if (this._parts.scheme) {
			return new Uri(this.toString());
		}

		try {
			const resolved = new URL(this.toString(), baseString).toString();
			return new Uri(resolved);
		} catch (error) {
			return new Uri(this.toString());
		}
	}

	normalize() {
		if (this._parts.scheme) {
			this._parts.scheme = this._parts.scheme.toLowerCase();
		}
		if (this._parts.authority) {
			this._parts.authority = this._parts.authority.toLowerCase();
		}
		return this;
	}

	toString() {
		return buildString(this._parts);
	}
}

export { Uri, Uri as URI };
export default Uri;
