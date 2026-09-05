//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function e(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var t = {}, n = [], r = () => {}, i = () => !1, a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), o = (e) => e.startsWith("onUpdate:"), s = Object.assign, c = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => v(e) === "[object Map]", p = (e) => v(e) === "[object Set]", ee = (e) => v(e) === "[object Date]", m = (e) => typeof e == "function", h = (e) => typeof e == "string", g = (e) => typeof e == "symbol", _ = (e) => typeof e == "object" && !!e, te = (e) => (_(e) || m(e)) && m(e.then) && m(e.catch), ne = Object.prototype.toString, v = (e) => ne.call(e), re = (e) => v(e).slice(8, -1), ie = (e) => v(e) === "[object Object]", y = (e) => h(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ae = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), b = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, oe = /-\w/g, se = b((e) => e.replace(oe, (e) => e.slice(1).toUpperCase())), ce = /\B([A-Z])/g, le = b((e) => e.replace(ce, "-$1").toLowerCase()), ue = b((e) => e.charAt(0).toUpperCase() + e.slice(1)), de = b((e) => e ? `on${ue(e)}` : ""), x = (e, t) => !Object.is(e, t), fe = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, pe = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, me = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, he, ge = () => he ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function _e(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = h(r) ? xe(r) : _e(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (h(e) || _(e)) return e;
}
var ve = /;(?![^(]*\))/g, ye = /:([^]+)/, be = /\/\*[^]*?\*\//g;
function xe(e) {
	let t = {};
	return e.replace(be, "").split(ve).forEach((e) => {
		if (e) {
			let n = e.split(ye);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function Se(e) {
	let t = "";
	if (h(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = Se(e[n]);
		r && (t += r + " ");
	}
	else if (_(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var Ce = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", we = /* @__PURE__ */ e(Ce);
Ce + "";
function Te(e) {
	return !!e || e === "";
}
function Ee(e, t) {
	if (e.length !== t.length) return !1;
	let n = !0;
	for (let r = 0; n && r < e.length; r++) n = S(e[r], t[r]);
	return n;
}
function De(e, t) {
	if (e.size !== t.size) return !1;
	let n = Array.from(t), r = new Uint8Array(n.length);
	for (let t of e) {
		let e = -1;
		for (let i = 0; i < n.length; i++) if (!r[i] && S(t, n[i])) {
			e = i;
			break;
		}
		if (e < 0) return !1;
		r[e] = 1;
	}
	return !0;
}
function S(e, t) {
	if (e === t) return !0;
	let n = ee(e), r = ee(t);
	if (n || r) return n && r ? e.getTime() === t.getTime() : !1;
	if (n = g(e), r = g(t), n || r) return e === t;
	if (n = d(e), r = d(t), n || r) return n && r ? Ee(e, t) : !1;
	if (n = _(e), r = _(t), n || r) {
		if (!n || !r) return !1;
		if (n = f(e), r = f(t), n || r || (n = p(e), r = p(t), n || r)) return n && r ? De(e, t) : !1;
		if (Object.keys(e).length !== Object.keys(t).length) return !1;
		for (let n in e) {
			let r = e.hasOwnProperty(n), i = t.hasOwnProperty(n);
			if (r && !i || !r && i || !S(e[n], t[n])) return !1;
		}
	}
	return String(e) === String(t);
}
function Oe(e, t) {
	return e.findIndex((e) => S(e, t));
}
var ke = (e) => !!(e && e.__v_isRef === !0), Ae = (e) => h(e) ? e : e == null ? "" : d(e) || _(e) && (e.toString === ne || !m(e.toString)) ? ke(e) ? Ae(e.value) : JSON.stringify(e, je, 2) : String(e), je = (e, t) => ke(t) ? je(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[C(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => C(e)) } : g(t) ? C(t) : _(t) && !d(t) && !ie(t) ? String(t) : t, C = (e, t = "") => g(e) ? `Symbol(${e.description ?? t})` : e, w, Me = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && w && (w.active ? (this.parent = w, this.index = (w.scopes || (w.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].pause();
			}
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].resume();
			}
			let n = this.effects.slice();
			for (e = 0, t = n.length; e < t; e++) n[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = w;
			try {
				return w = this, e();
			} finally {
				w = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = w, w = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (w === this) w = this.prevScope;
			else {
				let e = w;
				for (; e;) {
					if (e.prevScope === this) {
						e.prevScope = this.prevScope;
						break;
					}
					e = e.prevScope;
				}
			}
			this.prevScope = void 0;
		}
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				let e = this.scopes.slice();
				for (t = 0, n = e.length; t < n; t++) e[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
}, T, E = /* @__PURE__ */ new WeakSet(), Ne = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, w && (w.active ? w.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, E.has(this) && (E.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Fe(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ke(this), Le(this);
		let e = T, t = A;
		T = this, A = !0;
		try {
			return this.fn();
		} finally {
			Re(this), T = e, A = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Ve(e);
			this.deps = this.depsTail = void 0, Ke(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? E.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		ze(this) && this.run();
	}
	get dirty() {
		return ze(this);
	}
}, Pe = 0, D, O;
function Fe(e, t = !1) {
	if (e.flags |= 8, t) {
		e.next = O, O = e;
		return;
	}
	e.next = D, D = e;
}
function k() {
	Pe++;
}
function Ie() {
	if (--Pe > 0) return;
	if (O) {
		let e = O;
		for (O = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; D;) {
		let t = D;
		for (D = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function Le(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Re(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Ve(r), He(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function ze(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Be(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Be(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === j) || (e.globalVersion = j, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ze(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = T, r = A;
	T = e, A = !0;
	try {
		Le(e);
		let n = e.fn(e._value);
		(t.version === 0 || x(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		T = n, A = r, Re(e), e.flags &= -3;
	}
}
function Ve(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Ve(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function He(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var A = !0, Ue = [];
function We() {
	Ue.push(A), A = !1;
}
function Ge() {
	let e = Ue.pop();
	A = e === void 0 || e;
}
function Ke(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = T;
		T = void 0;
		try {
			t();
		} finally {
			T = e;
		}
	}
}
var j = 0, qe = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, M = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!T || !A || T === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== T) t = this.activeLink = new qe(T, this), T.deps ? (t.prevDep = T.depsTail, T.depsTail.nextDep = t, T.depsTail = t) : T.deps = T.depsTail = t, Je(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = T.depsTail, t.nextDep = void 0, T.depsTail.nextDep = t, T.depsTail = t, T.deps === t && (T.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, j++, this.notify(e);
	}
	notify(e) {
		k();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Ie();
		}
	}
};
function Je(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Je(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Ye = /* @__PURE__ */ new WeakMap(), N = /* @__PURE__ */ Symbol(""), Xe = /* @__PURE__ */ Symbol(""), P = /* @__PURE__ */ Symbol("");
function F(e, t, n) {
	if (A && T) {
		let t = Ye.get(e);
		t || Ye.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new M()), r.map = t, r.key = n), r.track();
	}
}
function I(e, t, n, r, i, a) {
	let o = Ye.get(e);
	if (!o) {
		j++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (k(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && y(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === P || !g(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(P)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(N)), f(e) && s(o.get(Xe)));
				break;
			case "delete":
				i || (s(o.get(N)), f(e) && s(o.get(Xe)));
				break;
			case "set": f(e) && s(o.get(N));
		}
	}
	Ie();
}
function L(e) {
	let t = /* @__PURE__ */ J(e);
	return t === e ? t : (F(t, "iterate", P), /* @__PURE__ */ q(e) ? t : t.map(Y));
}
function R(e) {
	return F(e = /* @__PURE__ */ J(e), "iterate", P), e;
}
function z(e, t) {
	return /* @__PURE__ */ K(e) ? X(/* @__PURE__ */ G(e) ? Y(t) : t) : Y(t);
}
var Ze = {
	__proto__: null,
	[Symbol.iterator]() {
		return Qe(this, Symbol.iterator, (e) => z(this, e));
	},
	concat(...e) {
		return L(this).concat(...e.map((e) => d(e) ? L(e) : e));
	},
	entries() {
		return Qe(this, "entries", (e) => (e[1] = z(this, e[1]), e));
	},
	every(e, t) {
		return B(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return B(this, "filter", e, t, (e) => e.map((e) => z(this, e)), arguments);
	},
	find(e, t) {
		return B(this, "find", e, t, (e) => z(this, e), arguments);
	},
	findIndex(e, t) {
		return B(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return B(this, "findLast", e, t, (e) => z(this, e), arguments);
	},
	findLastIndex(e, t) {
		return B(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return B(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return tt(this, "includes", e);
	},
	indexOf(...e) {
		return tt(this, "indexOf", e);
	},
	join(e) {
		return L(this).join(e);
	},
	lastIndexOf(...e) {
		return tt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return B(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return V(this, "pop");
	},
	push(...e) {
		return V(this, "push", e);
	},
	reduce(e, ...t) {
		return et(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return et(this, "reduceRight", e, t);
	},
	shift() {
		return V(this, "shift");
	},
	some(e, t) {
		return B(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return V(this, "splice", e);
	},
	toReversed() {
		return L(this).toReversed();
	},
	toSorted(e) {
		return L(this).toSorted(e);
	},
	toSpliced(...e) {
		return L(this).toSpliced(...e);
	},
	unshift(...e) {
		return V(this, "unshift", e);
	},
	values() {
		return Qe(this, "values", (e) => z(this, e));
	}
};
function Qe(e, t, n) {
	let r = R(e), i = r[t]();
	return r !== e && !/* @__PURE__ */ q(e) && (i._next = i.next, i.next = () => {
		let e = i._next();
		return e.done || (e.value = n(e.value)), e;
	}), i;
}
var $e = Array.prototype;
function B(e, t, n, r, i, a) {
	let o = R(e), s = o !== e && !/* @__PURE__ */ q(e), c = o[t];
	if (c !== $e[t]) {
		let t = c.apply(e, a);
		return s ? Y(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, z(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function et(e, t, n, r) {
	let i = R(e), a = i !== e && !/* @__PURE__ */ q(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = z(e, t)), n.call(this, t, z(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? z(e, c) : c;
}
function tt(e, t, n) {
	let r = /* @__PURE__ */ J(e);
	F(r, "iterate", P);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Et(n[0]) ? (n[0] = /* @__PURE__ */ J(n[0]), r[t](...n)) : i;
}
function V(e, t, n = []) {
	We(), k();
	let r = (/* @__PURE__ */ J(e))[t].apply(e, n);
	return Ie(), Ge(), r;
}
var nt = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), rt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(g));
function it(e) {
	g(e) || (e = String(e));
	let t = /* @__PURE__ */ J(this);
	return F(t, "has", e), t.hasOwnProperty(e);
}
var at = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? xt : bt : i ? yt : vt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = Ze[t])) return e;
			if (t === "hasOwnProperty") return it;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Z(e) ? e : n);
		if ((g(t) ? rt.has(t) : nt(t)) || (r || F(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Z(o)) {
			let e = a && y(t) ? o : o.value;
			return r && _(e) ? /* @__PURE__ */ Tt(e) : e;
		}
		return _(o) ? r ? /* @__PURE__ */ Tt(o) : /* @__PURE__ */ Ct(o) : o;
	}
}, ot = class extends at {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && y(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ K(i);
			if (!/* @__PURE__ */ q(n) && !/* @__PURE__ */ K(n) && (i = /* @__PURE__ */ J(i), n = /* @__PURE__ */ J(n)), !a && /* @__PURE__ */ Z(i) && !/* @__PURE__ */ Z(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Z(e) ? e : r);
		return e === /* @__PURE__ */ J(r) && s && (o ? x(n, i) && I(e, "set", t, n, i) : I(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && I(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!g(t) || !rt.has(t)) && F(e, "has", t), n;
	}
	ownKeys(e) {
		return F(e, "iterate", d(e) ? "length" : N), Reflect.ownKeys(e);
	}
}, st = class extends at {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, ct = /* @__PURE__ */ new ot(), lt = /* @__PURE__ */ new st(), ut = /* @__PURE__ */ new ot(!0), dt = (e) => e, H = (e) => Reflect.getPrototypeOf(e);
function ft(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ J(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? dt : t ? X : Y;
		return !t && F(a, "iterate", l ? Xe : N), s(Object.create(u), { next() {
			let { value: e, done: t } = u.next();
			return t ? {
				value: e,
				done: t
			} : {
				value: c ? [d(e[0]), d(e[1])] : d(e),
				done: t
			};
		} });
	};
}
function U(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function pt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ J(r), a = /* @__PURE__ */ J(n);
			e || (x(n, a) && F(i, "get", n), F(i, "get", a));
			let { has: o } = H(i), s = t ? dt : e ? X : Y;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && F(/* @__PURE__ */ J(t), "iterate", N), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ J(n), i = /* @__PURE__ */ J(t);
			return e || (x(t, i) && F(r, "has", t), F(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ J(a), s = t ? dt : e ? X : Y;
			return !e && F(o, "iterate", N), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: U("add"),
		set: U("set"),
		delete: U("delete"),
		clear: U("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ J(this), r = H(n), i = /* @__PURE__ */ J(e), a = !t && !/* @__PURE__ */ q(e) && !/* @__PURE__ */ K(e) ? i : e;
			return r.has.call(n, a) || x(e, a) && r.has.call(n, e) || x(i, a) && r.has.call(n, i) || (n.add(a), I(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ q(n) && !/* @__PURE__ */ K(n) && (n = /* @__PURE__ */ J(n));
			let r = /* @__PURE__ */ J(this), { has: i, get: a } = H(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ J(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? x(n, s) && I(r, "set", e, n, s) : I(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ J(this), { has: n, get: r } = H(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ J(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && I(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ J(this), t = e.size !== 0, n = e.clear();
			return t && I(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = ft(r, e, t);
	}), n;
}
function mt(e, t) {
	let n = pt(e, t);
	return (t, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? t : Reflect.get(u(n, r) && r in t ? n : t, r, i);
}
var ht = { get: /* @__PURE__ */ mt(!1, !1) }, gt = { get: /* @__PURE__ */ mt(!1, !0) }, _t = { get: /* @__PURE__ */ mt(!0, !1) }, vt = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), xt = /* @__PURE__ */ new WeakMap();
function St(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
// @__NO_SIDE_EFFECTS__
function Ct(e) {
	return /* @__PURE__ */ K(e) ? e : W(e, !1, ct, ht, vt);
}
// @__NO_SIDE_EFFECTS__
function wt(e) {
	return W(e, !1, ut, gt, yt);
}
// @__NO_SIDE_EFFECTS__
function Tt(e) {
	return W(e, !0, lt, _t, bt);
}
function W(e, t, n, r, i) {
	if (!_(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = St(re(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function G(e) {
	return /* @__PURE__ */ K(e) ? /* @__PURE__ */ G(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function K(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function q(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Et(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function J(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ J(t) : e;
}
function Dt(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && pe(e, "__v_skip", !0), e;
}
var Y = (e) => _(e) ? /* @__PURE__ */ Ct(e) : e, X = (e) => _(e) ? /* @__PURE__ */ Tt(e) : e;
// @__NO_SIDE_EFFECTS__
function Z(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Ot(e) {
	return kt(e, !1);
}
function kt(e, t) {
	return /* @__PURE__ */ Z(e) ? e : new At(e, t);
}
var At = class {
	constructor(e, t) {
		this.dep = new M(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ J(e), this._value = t ? e : Y(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ q(e) || /* @__PURE__ */ K(e);
		e = n ? e : /* @__PURE__ */ J(e), x(e, t) && (this._rawValue = e, this._value = n ? e : Y(e), this.dep.trigger());
	}
};
function jt(e) {
	return /* @__PURE__ */ Z(e) ? e.value : e;
}
var Mt = {
	get: (e, t, n) => t === "__v_raw" ? e : jt(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Z(i) && !/* @__PURE__ */ Z(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Nt(e) {
	return /* @__PURE__ */ G(e) ? e : new Proxy(e, Mt);
}
var Pt = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new M(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = j - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && T !== this) return Fe(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Be(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function Ft(e, t, n = !1) {
	let r, i;
	return m(e) ? r = e : (r = e.get, i = e.set), new Pt(r, i, n);
}
function Q(e, t = Infinity, n) {
	if (t <= 0 || !_(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Z(e)) Q(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) Q(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		Q(e, t, n);
	});
	else if (ie(e)) {
		for (let r in e) Q(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Q(e[r], t, n);
	}
	return e;
}
//#endregion
//#region frontend/ai-settings.js
var $ = /* @__PURE__ */ Ct({
	selection: null,
	profiles: {},
	info: null
}), It;
function Lt(e) {
	It = e;
}
function Rt(e, t) {
	return It(e, t);
}
function zt() {
	if (!$.selection) return;
	let { provider: e, fallback: t, fallback_model: n } = $.selection;
	return {
		provider: e,
		fallback: t,
		fallback_model: n,
		model: $.profiles[e]?.model
	};
}
function Bt() {
	for (let e of Object.values($.profiles)) delete e.api_key;
	window.dispatchEvent(new Event("ai-keys-cleared"));
}
try {
	let e = JSON.parse(localStorage.getItem("wanderAISettings") || "null");
	if (e?.selection) {
		$.selection = e.selection;
		for (let [t, n] of Object.entries(e.profiles || {})) $.profiles[t] = { model: n.model };
	}
} catch {}
function Vt() {
	try {
		localStorage.setItem("wanderAISettings", JSON.stringify({
			selection: $.selection,
			profiles: Object.fromEntries(Object.entries($.profiles).map(([e, t]) => [e, { model: t.model }]))
		}));
	} catch {}
}
//#endregion
export { S as $, t as A, Te as B, Y as C, I as D, Q as E, pe as F, _ as G, d as H, s as I, ae as J, a as K, ge as L, r as M, se as N, jt as O, ue as P, g as Q, u as R, J as S, F as T, m as U, fe as V, o as W, we as X, p as Y, h as Z, Nt as _, Vt as a, Ae as at, wt as b, Ne as c, G as d, Oe as et, K as f, We as g, Dt as h, Lt as i, c as it, i as j, n as k, Ft as l, q as m, $ as n, Se as nt, Rt as o, de as ot, Z as p, te as q, Bt as r, _e as rt, Me as s, zt as t, me as tt, Et as u, Ot as v, X as w, R as x, Ge as y, le as z };
