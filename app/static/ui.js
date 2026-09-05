import { $ as e, A as t, B as n, C as r, D as i, E as a, F as o, G as s, H as c, I as l, J as u, K as d, L as f, M as p, N as m, O as h, P as g, Q as _, R as v, S as y, T as b, U as x, V as S, W as C, X as ee, Y as w, Z as T, _ as te, a as ne, at as E, b as re, c as ie, d as ae, et as oe, f as se, g as ce, h as le, it as ue, j as de, k as fe, l as pe, m as me, n as D, nt as he, o as O, ot as ge, p as k, q as _e, rt as ve, s as ye, tt as A, u as be, v as j, w as xe, x as Se, y as Ce, z as M } from "./ui-ai-settings-YwWsTTH9.js";
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function we(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		Te(e, t, n);
	}
}
function N(e, t, n, r) {
	if (x(e)) {
		let i = we(e, t, n, r);
		return i && _e(i) && i.catch((e) => {
			Te(e, t, n);
		}), i;
	}
	if (c(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(N(e[a], t, n, r));
		return i;
	}
}
function Te(e, n, r, i = !0) {
	let a = n ? n.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: s } = n && n.appContext.config || t;
	if (n) {
		let t = n.parent, i = n.proxy, a = `https://vuejs.org/error-reference/#runtime-${r}`;
		for (; t;) {
			let n = t.ec;
			if (n) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, a) === !1) return;
			}
			t = t.parent;
		}
		if (o) {
			ce(), we(o, null, 10, [
				e,
				i,
				a
			]), Ce();
			return;
		}
	}
	Ee(e, r, a, i, s);
}
function Ee(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var P = [], F = -1, De = [], Oe = null, ke = 0, Ae = /* @__PURE__ */ Promise.resolve(), je = null;
function Me(e) {
	let t = je || Ae;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function Ne(e) {
	let t = F + 1, n = P.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = P[r], a = ze(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function Pe(e) {
	if (!(e.flags & 1)) {
		let t = ze(e), n = P[P.length - 1];
		!n || !(e.flags & 2) && t >= ze(n) ? P.push(e) : P.splice(Ne(t), 0, e), e.flags |= 1, Fe();
	}
}
function Fe() {
	je ||= Ae.then(Be);
}
function Ie(e) {
	if (!c(e)) Oe && e.id === -1 ? Oe.splice(ke + 1, 0, e) : e.flags & 1 || (De.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) De.push(e[t]);
	Fe();
}
function Le(e, t, n = F + 1) {
	for (; n < P.length; n++) {
		let t = P[n];
		if (t && t.flags & 2) {
			if (e && t.id !== e.uid) continue;
			P.splice(n, 1), n--, t.flags & 4 && (t.flags &= -2), t(), t.flags & 4 || (t.flags &= -2);
		}
	}
}
function Re(e) {
	if (De.length) {
		let e = [...new Set(De)].sort((e, t) => ze(e) - ze(t));
		if (De.length = 0, Oe) {
			for (let t = 0; t < e.length; t++) Oe.push(e[t]);
			return;
		}
		for (Oe = e, ke = 0; ke < Oe.length; ke++) {
			let e = Oe[ke];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		Oe = null, ke = 0;
	}
}
var ze = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function Be(e) {
	try {
		for (F = 0; F < P.length; F++) {
			let e = P[F];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), we(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; F < P.length; F++) {
			let e = P[F];
			e && (e.flags &= -2);
		}
		F = -1, P.length = 0, Re(e), je = null, (P.length || De.length) && Be(e);
	}
}
var I = null, Ve = null;
function He(e) {
	let t = I;
	return I = e, Ve = e && e.type.__scopeId || null, t;
}
function Ue(e, t = I, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Sn(-1);
		let i = He(t), a = yn.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = yn.length; e > a; e--) bn();
			He(i), r._d && Sn(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function L(e, n) {
	if (I === null) return e;
	let r = Zn(I), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [o, s, c, l = t] = n[e];
		o && (x(o) && (o = {
			mounted: o,
			updated: o
		}), o.deep && a(s), i.push({
			dir: o,
			instance: r,
			value: s,
			oldValue: void 0,
			arg: c,
			modifiers: l
		}));
	}
	return e;
}
function We(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (ce(), N(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), Ce());
	}
}
var Ge = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ Symbol("_vte"), qe = (e) => e.__isTeleport, Je = (e) => e && (e.disabled || e.disabled === ""), Ye = (e) => e && (e.defer || e.defer === ""), Xe = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Ze = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Qe = (e, t) => {
	let n = e && e.to;
	return T(n) ? t ? t(n) : null : n;
}, $e = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Je(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Je(e.props), r = e.target = Qe(e.props, m), a = it(r, e, h, p);
			r && (o !== "svg" && Xe(r) ? o = "svg" : o !== "mathml" && Ze(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), rt(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Ge.get(e) === t) {
					if (Ge.delete(e), Je(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), rt(e, !0);
					}
					x(e);
				}
			};
			Ge.set(e, t), R(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Ye(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), rt(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Ge.get(e);
			if (u) {
				u.flags |= 8, Ge.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Je(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Xe(p) ? o = "svg" : (o === "mathml" || Ze(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), un(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : et(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Qe(t.props, m);
				e && (t.target = e, et(t, e, null, l, 0));
			} else g && et(t, p, h, l, 1);
			rt(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Je(f), m = a || !p, h = Ge.get(e);
		if (h && (h.flags |= 8, Ge.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: et,
	hydrate: tt
};
function et(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && r(e.targetAnchor, t, n);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Ge.has(e) && (!d || Je(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function tt(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
	function f(e, n) {
		let r = n;
		for (; r;) {
			if (r && r.nodeType === 8) {
				if (r.data === "teleport start anchor") t.targetStart = r;
				else if (r.data === "teleport anchor") {
					t.targetAnchor = r, e._lpa = t.targetAnchor && o(t.targetAnchor);
					break;
				}
			}
			r = o(r);
		}
	}
	function p(e, t) {
		t.anchor = d(o(e), t, s(e), n, r, i, a);
	}
	let m = t.target = Qe(t.props, c), h = Je(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || it(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || it(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), rt(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var nt = $e;
function rt(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function it(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Ke] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var at = /* @__PURE__ */ Symbol("_leaveCb");
function ot(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== B) {
			t = n;
			break;
		}
	}
	return t;
}
function st(e) {
	if (!ht(e)) return qe(e.type) && e.children ? ot(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && x(n.default)) return n.default();
	}
}
function ct(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		ct(qe(n.type) && st(n) || n, t);
	} else e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function lt(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function ut(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var dt = /* @__PURE__ */ new WeakMap();
function ft(e, n, r, i, a = !1) {
	if (c(e)) {
		e.forEach((e, t) => ft(e, n && (c(n) ? n[t] : n), r, i, a));
		return;
	}
	if (mt(i) && !a) {
		i.shapeFlag & 512 && i.type.__asyncResolved && i.component.subTree.component && ft(e, n, r, i.component.subTree);
		return;
	}
	let o = i.shapeFlag & 4 ? Zn(i.component) : i.el, s = a ? null : o, { i: l, r: u } = e, d = n && n.r, f = l.refs === t ? l.refs = {} : l.refs, p = l.setupState, m = y(p), h = p === t ? de : (e) => !ut(f, e) && v(m, e), g = (e, t) => !(t && ut(f, t));
	if (d != null && d !== u) {
		if (pt(n), T(d)) f[d] = null, h(d) && (p[d] = null);
		else if (k(d)) {
			let e = n;
			g(d, e.k) && (d.value = null), e.k && (f[e.k] = null);
		}
	}
	if (x(u)) we(u, l, 12, [s, f]);
	else {
		let t = T(u), n = k(u);
		if (t || n) {
			let i = () => {
				if (e.f) {
					let n = t ? h(u) ? p[u] : f[u] : g(u) || !e.k ? u.value : f[e.k];
					if (a) c(n) && ue(n, o);
					else if (c(n)) n.includes(o) || n.push(o);
					else if (t) f[u] = [o], h(u) && (p[u] = f[u]);
					else {
						let t = [o];
						g(u, e.k) && (u.value = t), e.k && (f[e.k] = t);
					}
				} else t ? (f[u] = s, h(u) && (p[u] = s)) : n && (g(u, e.k) && (u.value = s), e.k && (f[e.k] = s));
			};
			if (s) {
				let t = () => {
					i(), dt.delete(e);
				};
				t.id = -1, dt.set(e, t), R(t, r);
			} else pt(e), i();
		}
	}
}
function pt(e) {
	let t = dt.get(e);
	t && (t.flags |= 8, dt.delete(e));
}
f().requestIdleCallback, f().cancelIdleCallback;
var mt = (e) => !!e.type.__asyncLoader, ht = (e) => e.type.__isKeepAlive;
function gt(e, t, n = Rn, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			ce();
			let i = Vn(n), a = N(t, n, e, r);
			return i(), Ce(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var _t = (e) => (t, n = Rn) => {
	(!Wn || e === "sp") && gt(e, (...e) => t(...e), n);
}, vt = _t("m"), yt = _t("um"), bt = /* @__PURE__ */ Symbol.for("v-ndc");
function xt(e, t, n, i) {
	let a, o = n && n[i], l = c(e);
	if (l || T(e)) {
		let n = l && ae(e), i = !1, s = !1;
		n && (i = !me(e), s = se(e), e = Se(e)), a = Array(e.length);
		for (let n = 0, c = e.length; n < c; n++) a[n] = t(i ? s ? xe(r(e[n])) : r(e[n]) : e[n], n, void 0, o && o[n]);
	} else if (typeof e == "number") {
		a = Array(e);
		for (let n = 0; n < e; n++) a[n] = t(n + 1, n, void 0, o && o[n]);
	} else if (s(e)) {
		if (e[Symbol.iterator]) a = Array.from(e, (e, n) => t(e, n, void 0, o && o[n]));
		else {
			let n = Object.keys(e);
			a = Array(n.length);
			for (let r = 0, i = n.length; r < i; r++) {
				let i = n[r];
				a[r] = t(e[i], i, r, o && o[r]);
			}
		}
	} else a = [];
	return n && (n[i] = a), a;
}
var St = (e) => e ? Un(e) ? Zn(e) : St(e.parent) : null, Ct = /* @__PURE__ */ l(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => St(e.parent),
	$root: (e) => St(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => e.type,
	$forceUpdate: (e) => e.f ||= () => {
		Pe(e.update);
	},
	$nextTick: (e) => e.n ||= Me.bind(e.proxy),
	$watch: (e) => p
}), wt = (e, n) => e !== t && !e.__isScriptSetup && v(e, n), Tt = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (wt(i, n)) return s[n] = 1, i[n];
			else if (v(o, n)) return s[n] = 3, o[n];
			else if (r !== t && v(r, n)) return s[n] = 4, r[n];
			else s[n] = 0;
		}
		let u = Ct[n], d, f;
		if (u) return n === "$attrs" && b(e.attrs, "get", ""), u(e);
		if ((d = c.__cssModules) && (d = d[n])) return d;
		if (r !== t && v(r, n)) return s[n] = 4, r[n];
		if (f = l.config.globalProperties, v(f, n)) return f[n];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return wt(i, t) ? (i[t] = n, !0) : v(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || wt(t, s) || v(a, s) || v(r, s) || v(Ct, s) || v(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? v(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Et() {
	return {
		app: null,
		config: {
			isNativeTag: de,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var Dt = 0;
function Ot(e, t) {
	return function(n, r = null) {
		x(n) || (n = l({}, n)), r != null && !s(r) && (r = null);
		let i = Et(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, u = i.app = {
			_uid: Dt++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: $n,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && x(e.install) ? (a.add(e), e.install(u, ...t)) : x(e) && (a.add(e), e(u, ...t))), u;
			},
			mixin(e) {
				return u;
			},
			component(e, t) {
				return t ? (i.components[e] = t, u) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, u) : i.directives[e];
			},
			mount(a, o, s) {
				if (!c) {
					let l = u._ceVNode || G(n, r);
					return l.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(l, a) : e(l, a, s), c = !0, u._container = a, a.__vue_app__ = u, Zn(l.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (N(o, u._instance, 16), e(null, u._container), delete u._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, u;
			},
			runWithContext(e) {
				let t = kt;
				kt = u;
				try {
					return e();
				} finally {
					kt = t;
				}
			}
		};
		return u;
	};
}
var kt = null, At = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${m(t)}Modifiers`] || e[`${M(t)}Modifiers`];
function jt(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && At(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => T(e) ? e.trim() : e)), s.number && (a = a.map(A)));
	let c, l = i[c = ge(n)] || i[c = ge(m(n))];
	!l && o && (l = i[c = ge(M(n))]), l && N(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, N(u, e, 6, a);
	}
}
function Mt(e, t, n = !1) {
	let r = t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {};
	return a ? (c(a) ? a.forEach((e) => o[e] = null) : l(o, a), s(e) && r.set(e, o), o) : (s(e) && r.set(e, null), null);
}
function Nt(e, t) {
	return !e || !d(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), v(e, t[0].toLowerCase() + t.slice(1)) || v(e, M(t)) || v(e, t));
}
function Pt(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, g = He(e), _, v;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			_ = J(l.call(t, e, u, d, p, f, m)), v = s;
		} else {
			let e = t;
			_ = J(e.length > 1 ? e(d, {
				attrs: s,
				slots: o,
				emit: c
			}) : e(d, null)), v = t.props ? s : Ft(s);
		}
	} catch (t) {
		yn.length = 0, Te(t, e, 1), _ = G(B);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(C) && (v = It(v, a)), y = jn(y, v, !1, !0));
	}
	return n.dirs && (y = jn(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && ct(qe(y.type) && st(y) || y, n.transition), _ = y, He(g), _;
}
var Ft = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || d(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, It = (e, t) => {
	let n = {};
	for (let r in e) (!C(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function Lt(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? Rt(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (zt(o, r, n) && !Nt(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || Rt(r, o, l) : !!o;
	return !1;
}
function Rt(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (zt(t, e, a) && !Nt(n, a)) return !0;
	}
	return !1;
}
function zt(t, n, r) {
	let i = t[r], a = n[r];
	return r === "style" && s(i) && s(a) ? !e(i, a) : i !== a;
}
function Bt({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Vt = {}, Ht = () => Object.create(Vt), Ut = (e) => Object.getPrototypeOf(e) === Vt;
function Wt(e, t, n, r = !1) {
	let i = {}, a = Ht();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Kt(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : re(i) : e.type.props ? i : a, e.attrs = a;
}
function Gt(e, t, n, r) {
	let { props: a, attrs: o, vnode: { patchFlag: s } } = e, c = y(a), [l] = e.propsOptions, u = !1;
	if ((r || s > 0) && !(s & 16)) {
		if (s & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let i = n[r];
				if (Nt(e.emitsOptions, i)) continue;
				let s = t[i];
				if (l) {
					if (v(o, i)) s !== o[i] && (o[i] = s, u = !0);
					else {
						let t = m(i);
						a[t] = qt(l, c, t, s, e, !1);
					}
				} else s !== o[i] && (o[i] = s, u = !0);
			}
		}
	} else {
		Kt(e, t, a, o) && (u = !0);
		let r;
		for (let i in c) (!t || !v(t, i) && ((r = M(i)) === i || !v(t, r))) && (l ? n && (n[i] !== void 0 || n[r] !== void 0) && (a[i] = qt(l, c, i, void 0, e, !0)) : delete a[i]);
		if (o !== c) for (let e in o) (!t || !v(t, e)) && (delete o[e], u = !0);
	}
	u && i(e.attrs, "set", "");
}
function Kt(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (u(t)) continue;
		let l = n[t], d;
		a && v(a, d = m(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : Nt(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = y(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = qt(a, n, s, i[s], e, !v(i, s));
		}
	}
	return s;
}
function qt(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = v(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && x(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Vn(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === M(n)) && (r = !0));
	}
	return r;
}
function Jt(e, n, r = !1) {
	let i = n.propsCache, a = i.get(e);
	if (a) return a;
	let o = e.props, u = {}, d = [];
	if (!o) return s(e) && i.set(e, fe), fe;
	if (c(o)) for (let e = 0; e < o.length; e++) {
		let n = m(o[e]);
		Yt(n) && (u[n] = t);
	}
	else if (o) for (let e in o) {
		let t = m(e);
		if (Yt(t)) {
			let n = o[e], r = u[t] = c(n) || x(n) ? { type: n } : l({}, n), i = r.type, a = !1, s = !0;
			if (c(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = x(t) && t.name;
				if (n === "Boolean") {
					a = !0;
					break;
				}
				n === "String" && (s = !1);
			}
			else a = x(i) && i.name === "Boolean";
			r[0] = a, r[1] = s, (a || v(r, "default")) && d.push(t);
		}
	}
	let f = [u, d];
	return s(e) && i.set(e, f), f;
}
function Yt(e) {
	return e[0] !== "$" && !u(e);
}
var Xt = (e) => e === "_" || e === "_ctx" || e === "$stable", Zt = (e) => c(e) ? e.map(J) : [J(e)], Qt = (e, t, n) => {
	if (t._n) return t;
	let r = Ue((...e) => Zt(t(...e)), n);
	return r._c = !1, r;
}, $t = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Xt(n)) continue;
		let i = e[n];
		if (x(i)) t[n] = Qt(n, i, r);
		else if (i != null) {
			let e = Zt(i);
			t[n] = () => e;
		}
	}
}, en = (e, t) => {
	let n = Zt(t);
	e.slots.default = () => n;
}, tn = (e, t, n) => {
	for (let r in t) (n || !Xt(r)) && (e[r] = t[r]);
}, nn = (e, t, n) => {
	let r = e.slots = Ht();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (tn(r, t, n), n && o(r, "_", e, !0)) : $t(t, r);
	} else t && en(e, t);
}, rn = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : tn(a, n, r) : (o = !n.$stable, $t(n, a)), s = n;
	} else n && (en(e, n), s = { default: 1 });
	if (o) for (let e in a) !Xt(e) && s[e] == null && delete a[e];
}, R = gn;
function an(e) {
	return on(e);
}
function on(e, n) {
	let r = f();
	r.__VUE__ = !0;
	let { insert: i, remove: a, patchProp: o, createElement: s, createText: c, createComment: l, setText: d, setElementText: m, parentNode: h, nextSibling: g, setScopeId: _ = p, insertStaticContent: v } = e, y = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !En(e, t) && (r = be(e), k(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case _n:
				b(e, t, n, r);
				break;
			case B:
				x(e, t, n, r);
				break;
			case vn:
				e ?? C(t, n, r, o);
				break;
			case z:
				se(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? T(e, t, n, r, i, a, o, s, c) : d & 6 ? le(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, Se);
		}
		u != null && i ? ft(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && ft(e.ref, null, a, e, !0);
	}, b = (e, t, n, r) => {
		if (e == null) i(t.el = c(t.children), n, r);
		else {
			let n = t.el = e.el;
			t.children !== e.children && d(n, t.children);
		}
	}, x = (e, t, n, r) => {
		e == null ? i(t.el = l(t.children || ""), n, r) : t.el = e.el;
	}, C = (e, t, n, r) => {
		[e.el, e.anchor] = v(e.children, t, n, r, e.el, e.anchor);
	}, ee = ({ el: e, anchor: t }, n, r) => {
		let a;
		for (; e && e !== t;) a = g(e), i(e, n, r), e = a;
		i(t, n, r);
	}, w = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = g(e), a(e), e = n;
		a(t);
	}, T = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) te(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), re(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, te = (e, t, n, r, a, c, l, d) => {
		let f, p, { props: h, shapeFlag: g, transition: _, dirs: v } = e;
		if (f = e.el = s(e.type, c, h && h.is, h), g & 8 ? m(f, e.children) : g & 16 && E(e.children, f, null, r, a, sn(e, c), l, d), v && We(e, null, r, "created"), ne(f, e, e.scopeId, l, r), h) {
			for (let e in h) e !== "value" && !u(e) && o(f, e, null, h[e], c, r);
			"value" in h && o(f, "value", null, h.value, c), (p = h.onVnodeBeforeMount) && X(p, r, e);
		}
		v && We(e, null, r, "beforeMount");
		let y = ln(a, _);
		y && _.beforeEnter(f), i(f, t, n), ((p = h && h.onVnodeMounted) || y || v) && R(() => {
			try {
				p && X(p, r, e), y && _.enter(f), v && We(e, null, r, "mounted");
			} finally {}
		}, a);
	}, ne = (e, t, n, r, i) => {
		if (n && _(e, n), r) for (let t = 0; t < r.length; t++) _(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || hn(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				ne(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, E = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? Y(e[l]) : J(e[l]);
			y(null, c, t, n, r, i, a, o, s);
		}
	}, re = (e, n, r, i, a, s, c) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let p = e.props || t, h = n.props || t, g;
		if (r && cn(r, !1), (g = h.onVnodeBeforeUpdate) && X(g, r, n, e), f && We(n, e, r, "beforeUpdate"), r && cn(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, c = !1, d = null), (p.innerHTML && h.innerHTML == null || p.textContent && h.textContent == null) && m(l, ""), d ? ae(e.dynamicChildren, d, l, r, i, sn(n, a), s) : c || D(e, n, l, null, r, i, sn(n, a), s, !1), u > 0) {
			if (u & 16) oe(l, p, h, r, a);
			else if (u & 2 && p.class !== h.class && o(l, "class", null, h.class, a), u & 4 && o(l, "style", p.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = p[n], s = h[n];
					(s !== i || n === "value") && o(l, n, i, s, a, r);
				}
			}
			u & 1 && e.children !== n.children && m(l, n.children);
		} else !c && d == null && oe(l, p, h, r, a);
		((g = h.onVnodeUpdated) || f) && R(() => {
			g && X(g, r, n, e), f && We(n, e, r, "updated");
		}, i);
	}, ae = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el && (c.type === z || !En(c, l) || c.shapeFlag & 198) ? h(c.el) : n;
			y(c, l, u, null, r, i, a, o, !0);
		}
	}, oe = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !u(t) && !(t in r) && o(e, t, n[t], null, a, i);
			for (let t in r) {
				if (u(t)) continue;
				let s = r[t], c = n[t];
				s !== c && t !== "value" && o(e, t, c, s, a, i);
			}
			"value" in r && o(e, "value", n.value, r.value, a);
		}
	}, se = (e, t, n, r, a, o, s, l, u) => {
		let d = t.el = e ? e.el : c(""), f = t.anchor = e ? e.anchor : c(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (i(d, n, r), i(f, n, r), E(t.children || [], n, f, a, o, s, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (ae(e.dynamicChildren, m, n, a, o, s, l), (t.key != null || a && t === a.subTree) && un(e, t, !0)) : D(e, t, n, f, a, o, s, l, u);
	}, le = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : ue(t, n, r, i, a, o, c) : de(e, t, c);
	}, ue = (e, t, n, r, i, a, o) => {
		let s = e.component = Ln(e, r, i);
		if (ht(e) && (s.ctx.renderer = Se), Gn(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, pe, o), !e.el) {
				let r = s.subTree = G(B);
				x(null, r, t, n), e.placeholder = r.el;
			}
		} else pe(s, e, t, n, i, a, o);
	}, de = (e, t, n) => {
		let r = t.component = e.component;
		if (Lt(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				me(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, r.vnode = t;
	}, pe = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = fn(e);
					if (n) {
						t && (t.el = c.el, me(e, t, o)), n.asyncDep.then(() => {
							R(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				cn(e, !1), t ? (t.el = c.el, me(e, t, o)) : t = c, n && S(n), (d = t.props && t.props.onVnodeBeforeUpdate) && X(d, s, t, c), cn(e, !0);
				let f = Pt(e), p = e.subTree;
				e.subTree = f, y(p, f, h(p.el), be(p), e, i, a), t.el = f.el, u === null && Bt(e, f.el), r && R(r, i), (d = t.props && t.props.onVnodeUpdated) && R(() => X(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = mt(t);
				if (cn(e, !1), l && S(l), !m && (o = c && c.onVnodeBeforeMount) && X(o, d, t), cn(e, !0), s && we) {
					let t = () => {
						e.subTree = Pt(e), we(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = Pt(e);
					y(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && R(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					R(() => X(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && mt(d.vnode) && d.vnode.shapeFlag & 256) && e.a && R(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new ie(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Pe(u), cn(e, !0), l();
	}, me = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Gt(e, t.props, r, n), rn(e, t.children, n), ce(), Le(e), Ce();
	}, D = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: p } = t;
		if (f > 0) {
			if (f & 128) {
				O(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				he(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		p & 8 ? (u & 16 && A(l, i, a), d !== l && m(n, d)) : u & 16 ? p & 16 ? O(l, d, n, r, i, a, o, s, c) : A(l, i, a, !0) : (u & 8 && m(n, ""), p & 16 && E(d, n, r, i, a, o, s, c));
	}, he = (e, t, n, r, i, a, o, s, c) => {
		e ||= fe, t ||= fe;
		let l = e.length, u = t.length, d = Math.min(l, u), f = 0;
		for (; f < d; f++) {
			let r = t[f] = c ? Y(t[f]) : J(t[f]);
			y(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? A(e, i, a, !0, !1, d) : E(t, n, r, i, a, o, s, c, d);
	}, O = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, f = u - 1;
		for (; l <= d && l <= f;) {
			let r = e[l], u = t[l] = c ? Y(t[l]) : J(t[l]);
			if (En(r, u)) y(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= f;) {
			let r = e[d], l = t[f] = c ? Y(t[f]) : J(t[f]);
			if (En(r, l)) y(r, l, n, null, i, a, o, s, c);
			else break;
			d--, f--;
		}
		if (l > d) {
			if (l <= f) {
				let e = f + 1, d = e < u ? t[e].el : r;
				for (; l <= f;) y(null, t[l] = c ? Y(t[l]) : J(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > f) for (; l <= d;) k(e[l], i, a, !0), l++;
		else {
			let p = l, m = l, h = /* @__PURE__ */ new Map();
			for (l = m; l <= f; l++) {
				let e = t[l] = c ? Y(t[l]) : J(t[l]);
				e.key != null && h.set(e.key, l);
			}
			let g, _ = 0, v = f - m + 1, b = !1, x = 0, S = Array(v);
			for (l = 0; l < v; l++) S[l] = 0;
			for (l = p; l <= d; l++) {
				let r = e[l];
				if (_ >= v) {
					k(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = h.get(r.key);
				else for (g = m; g <= f; g++) if (S[g - m] === 0 && En(r, t[g])) {
					u = g;
					break;
				}
				u === void 0 ? k(r, i, a, !0) : (S[u - m] = l + 1, u >= x ? x = u : b = !0, y(r, t[u], n, null, i, a, o, s, c), _++);
			}
			let C = b ? dn(S) : fe;
			for (g = C.length - 1, l = v - 1; l >= 0; l--) {
				let e = m + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || mn(f) : r;
				S[l] === 0 ? y(null, d, n, p, i, a, o, s, c) : b && (g < 0 || l !== C[g] ? ge(d, n, p, 2) : g--);
			}
		}
	}, ge = (e, t, n, r, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) {
			ge(e.component.subTree, t, n, r);
			return;
		}
		if (d & 128) {
			e.suspense.move(t, n, r);
			return;
		}
		if (d & 64) {
			c.move(e, t, n, Se);
			return;
		}
		if (c === z) {
			i(s, t, n);
			for (let e = 0; e < u.length; e++) ge(u[e], t, n, r);
			i(e.anchor, t, n);
			return;
		}
		if (c === vn) {
			ee(e, t, n);
			return;
		}
		if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !s[at] ? i(s, t, n) : (l.beforeEnter(s), i(s, t, n), R(() => l.enter(s), o));
			else {
				let { leave: r, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? a(s) : i(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[at];
					s._isLeaving && s[at](!0), l.persisted && !e ? u() : r(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else i(s, t, n);
	}, k = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if (d === -2 && (i = !1), s != null && (ce(), ft(s, null, n, e, !0), Ce()), p != null && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !mt(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && X(_, t, e), u & 6) ye(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && We(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, Se, r) : l && !l.hasOnce && (a !== z || d > 0 && d & 64) ? A(l, t, n, !1, !0) : (a === z && d & 384 || !i && u & 16) && A(c, t, n), r && _e(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && R(() => {
			_ && X(_, t, e), h && We(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, _e = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e;
		if (t === z) {
			ve(n, r);
			return;
		}
		if (t === vn) {
			w(e);
			return;
		}
		let o = () => {
			a(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (e.shapeFlag & 1 && i && !i.persisted) {
			let { leave: t, delayLeave: r } = i, a = () => t(n, o);
			r ? r(e.el, o, a) : a();
		} else o();
	}, ve = (e, t) => {
		let n;
		for (; e !== t;) n = g(e), a(e), e = n;
		a(t);
	}, ye = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		pn(c), pn(l), r && S(r), i.stop(), a && (a.flags |= 8, k(o, e, t, n)), s && R(s, t), R(() => {
			e.isUnmounted = !0;
		}, t);
	}, A = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) k(e[o], t, n, r, i);
	}, be = (e) => {
		if (e.shapeFlag & 6) return be(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = g(e.anchor || e.el), n = t && t[Ke];
		return n ? g(n) : t;
	}, j = !1, xe = (e, t, n) => {
		let r;
		e == null ? t._vnode && (k(t._vnode, null, null, !0), r = t._vnode.component) : y(t._vnode || null, e, t, null, null, null, n), t._vnode = e, j ||= (j = !0, Le(r), Re(), !1);
	}, Se = {
		p: y,
		um: k,
		m: ge,
		r: _e,
		mt: ue,
		mc: E,
		pc: D,
		pbc: ae,
		n: be,
		o: e
	}, M, we;
	return n && ([M, we] = n(Se)), {
		render: xe,
		hydrate: M,
		createApp: Ot(xe, M)
	};
}
function sn({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function cn({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ln(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function un(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (c(r) && c(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Y(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && un(t, a)), a.type === _n && (a.patchFlag === -1 && (a = i[e] = Y(a)), a.el = t.el), a.type === B && !a.el && (a.el = t.el);
	}
}
function dn(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function fn(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : fn(t);
}
function pn(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function mn(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? mn(t.subTree) : null;
}
var hn = (e) => e.__isSuspense;
function gn(e, t) {
	t && t.pendingBranch ? c(e) ? t.effects.push(...e) : t.effects.push(e) : Ie(e);
}
var z = /* @__PURE__ */ Symbol.for("v-fgt"), _n = /* @__PURE__ */ Symbol.for("v-txt"), B = /* @__PURE__ */ Symbol.for("v-cmt"), vn = /* @__PURE__ */ Symbol.for("v-stc"), yn = [], V = null;
function H(e = !1) {
	yn.push(V = e ? null : []);
}
function bn() {
	yn.pop(), V = yn[yn.length - 1] || null;
}
var xn = 1;
function Sn(e, t = !1) {
	xn += e, e < 0 && V && t && (V.hasOnce = !0);
}
function Cn(e) {
	return e.dynamicChildren = xn > 0 ? V || fe : null, bn(), xn > 0 && V && V.push(e), e;
}
function U(e, t, n, r, i, a) {
	return Cn(W(e, t, n, r, i, a, !0));
}
function wn(e, t, n, r, i) {
	return Cn(G(e, t, n, r, i, !0));
}
function Tn(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function En(e, t) {
	return e.type === t.type && e.key === t.key;
}
var Dn = ({ key: e }) => e ?? null, On = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : T(e) || k(e) || x(e) ? {
	i: I,
	r: e,
	k: t,
	f: !!n
} : e);
function W(e, t = null, n = null, r = 0, i = null, a = e === z ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Dn(t),
		ref: t && On(t),
		scopeId: Ve,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: I
	};
	return s ? (Nn(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= T(n) ? 8 : 16), xn > 0 && !o && V && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && V.push(c), c;
}
var G = kn;
function kn(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === bt) && (e = B), Tn(e)) {
		let r = jn(e, t, !0);
		return n && Nn(r, n), xn > 0 && !a && V && (r.shapeFlag & 6 ? V[V.indexOf(e)] = r : V.push(r)), r.patchFlag = -2, r;
	}
	if (Qn(e) && (e = e.__vccOpts), t) {
		t = An(t);
		let { class: e, style: n } = t;
		e && !T(e) && (t.class = he(e)), s(n) && (be(n) && !c(n) && (n = l({}, n)), t.style = ve(n));
	}
	let o = T(e) ? 1 : hn(e) ? 128 : qe(e) ? 64 : s(e) ? 4 : x(e) ? 2 : 0;
	return W(e, t, n, r, i, o, a, !0);
}
function An(e) {
	return e ? be(e) || Ut(e) ? l({}, e) : e : null;
}
function jn(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: l } = e, u = t ? Pn(i || {}, t) : i, d = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: u,
		key: u && Dn(u),
		ref: t && t.ref ? n && a ? c(a) ? a.concat(On(t)) : [a, On(t)] : On(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== z ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: l,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && jn(e.ssContent),
		ssFallback: e.ssFallback && jn(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce
	};
	return l && r && ct(d, l.clone(d)), d;
}
function K(e = " ", t = 0) {
	return G(_n, null, e, t);
}
function Mn(e, t) {
	let n = G(vn, null, e);
	return n.staticCount = t, n;
}
function q(e = "", t = !1) {
	return t ? (H(), wn(B, null, e)) : G(B, null, e);
}
function J(e) {
	return e == null || typeof e == "boolean" ? G(B) : c(e) ? G(z, null, e.slice()) : Tn(e) ? Y(e) : G(_n, null, String(e));
}
function Y(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : jn(e);
}
function Nn(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (c(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), Nn(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Ut(t) ? t._ctx = I : r === 3 && I && (I.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (x(t)) {
		if (r & 65) {
			Nn(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: I
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [K(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Pn(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = he([t.class, r.class]));
		else if (e === "style") t.style = ve([t.style, r.style]);
		else if (d(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(c(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !C(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function X(e, t, n, r = null) {
	N(e, t, 7, [n, r]);
}
var Fn = Et(), In = 0;
function Ln(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || Fn, o = {
		uid: In++,
		vnode: e,
		type: i,
		parent: n,
		appContext: a,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new ye(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: n ? n.provides : Object.create(a.provides),
		ids: n ? n.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: Jt(i, a),
		emitsOptions: Mt(i, a),
		emit: null,
		emitted: null,
		propsDefaults: t,
		inheritAttrs: i.inheritAttrs,
		ctx: t,
		data: t,
		props: t,
		attrs: t,
		slots: t,
		refs: t,
		setupState: t,
		setupContext: null,
		suspense: r,
		suspenseId: r ? r.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = jt.bind(null, o), e.ce && e.ce(o), o;
}
var Rn = null, zn, Bn;
{
	let e = f(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	zn = t("__VUE_INSTANCE_SETTERS__", (e) => Rn = e), Bn = t("__VUE_SSR_SETTERS__", (e) => Wn = e);
}
var Vn = (e) => {
	let t = Rn;
	return zn(e), e.scope.on(), () => {
		e.scope.off(), zn(t);
	};
}, Hn = () => {
	Rn && Rn.scope.off(), zn(null);
};
function Un(e) {
	return e.vnode.shapeFlag & 4;
}
var Wn = !1;
function Gn(e, t = !1, n = !1) {
	t && Bn(t);
	let { props: r, children: i } = e.vnode, a = Un(e);
	Wt(e, r, a, t), nn(e, i, n || t);
	let o = a ? Kn(e, t) : void 0;
	return t && Bn(!1), o;
}
function Kn(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Tt);
	let { setup: r } = n;
	if (r) {
		ce();
		let n = e.setupContext = r.length > 1 ? Xn(e) : null, i = Vn(e), a = we(r, e, 0, [e.props, n]), o = _e(a);
		if (Ce(), i(), (o || e.sp) && !mt(e) && lt(e), o) {
			if (a.then(Hn, Hn), t) return a.then((n) => {
				Bn(!0);
				try {
					qn(e, n, t);
				} finally {
					Bn(!1);
				}
			}).catch((t) => {
				Te(t, e, 0);
			});
			e.asyncDep = a;
		} else qn(e, a, t);
	} else Jn(e, t);
}
function qn(e, t, n) {
	x(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : s(t) && (e.setupState = te(t)), Jn(e, n);
}
function Jn(e, t, n) {
	let r = e.type;
	e.render ||= r.render || p;
}
var Yn = { get(e, t) {
	return b(e, "get", ""), e[t];
} };
function Xn(e) {
	return {
		attrs: new Proxy(e.attrs, Yn),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Zn(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(te(le(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Ct) return Ct[n](e);
		},
		has(e, t) {
			return t in e || t in Ct;
		}
	}) : e.proxy;
}
function Qn(e) {
	return x(e) && "__vccOpts" in e;
}
var Z = (e, t) => pe(e, t, Wn), $n = "3.5.42", er = void 0, tr = typeof window < "u" && window.trustedTypes;
if (tr) try {
	er = /* @__PURE__ */ tr.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var nr = er ? (e) => er.createHTML(e) : (e) => e, rr = "http://www.w3.org/2000/svg", ir = "http://www.w3.org/1998/Math/MathML", Q = typeof document < "u" ? document : null, ar = Q && /* @__PURE__ */ Q.createElement("template"), or = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Q.createElementNS(rr, e) : t === "mathml" ? Q.createElementNS(ir, e) : n ? Q.createElement(e, { is: n }) : Q.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Q.createTextNode(e),
	createComment: (e) => Q.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Q.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			ar.innerHTML = nr(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = ar.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, sr = /* @__PURE__ */ Symbol("_vtc");
function cr(e, t, n) {
	let r = e[sr];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var lr = /* @__PURE__ */ Symbol("_vod"), ur = /* @__PURE__ */ Symbol("_vsh"), dr = /* @__PURE__ */ Symbol(""), fr = /(?:^|;)\s*display\s*:/;
function pr(e, t, n) {
	let r = e.style, i = T(n), a = !1;
	if (n && !i) {
		if (t) {
			if (T(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? hr(r, t, "");
			}
			else for (let e in t) n[e] ?? hr(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? hr(r, i, "") : yr(e, i, !T(t) && t ? t[i] : void 0, o) || hr(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[dr];
			e && (n += ";" + e), r.cssText = n, a = fr.test(n);
		}
	} else t && e.removeAttribute("style");
	lr in e && (e[lr] = a ? r.display : "", e[ur] && (r.display = "none"));
}
var mr = /\s*!important$/;
function hr(e, t, n) {
	if (c(n)) n.forEach((n) => hr(e, t, n));
	else if (n ??= "", t.startsWith("--")) mr.test(n) ? e.setProperty(t, n.replace(mr, ""), "important") : e.setProperty(t, n);
	else {
		let r = vr(e, t);
		mr.test(n) ? e.setProperty(M(r), n.replace(mr, ""), "important") : e[r] = n;
	}
}
var gr = [
	"Webkit",
	"Moz",
	"ms"
], _r = {};
function vr(e, t) {
	let n = _r[t];
	if (n) return n;
	let r = m(t);
	if (r !== "filter" && r in e) return _r[t] = r;
	r = g(r);
	for (let n = 0; n < gr.length; n++) {
		let i = gr[n] + r;
		if (i in e) return _r[t] = i;
	}
	return t;
}
function yr(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && T(r) && n === r;
}
var br = "http://www.w3.org/1999/xlink";
function xr(e, t, r, i, a, o = ee(t)) {
	i && t.startsWith("xlink:") ? r == null ? e.removeAttributeNS(br, t.slice(6, t.length)) : e.setAttributeNS(br, t, r) : r == null || o && !n(r) ? e.removeAttribute(t) : e.setAttribute(t, o ? "" : _(r) ? String(r) : r);
}
function Sr(e, t, r, i, a) {
	if (t === "innerHTML" || t === "textContent") {
		r != null && (e[t] = t === "innerHTML" ? nr(r) : r);
		return;
	}
	let o = e.tagName;
	if (t === "value" && o !== "PROGRESS" && !o.includes("-")) {
		let n = o === "OPTION" ? e.getAttribute("value") || "" : e.value, i = r == null ? e.type === "checkbox" ? "on" : "" : String(r);
		(n !== i || !("_value" in e)) && (e.value = i), r ?? e.removeAttribute(t), e._value = r;
		return;
	}
	let s = !1;
	if (r === "" || r == null) {
		let i = typeof e[t];
		i === "boolean" ? r = n(r) : r == null && i === "string" ? (r = "", s = !0) : i === "number" && (r = 0, s = !0);
	}
	try {
		e[t] = r;
	} catch {}
	s && e.removeAttribute(a || t);
}
function Cr(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function wr(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var Tr = /* @__PURE__ */ Symbol("_vei");
function Er(e, t, n, r, i = null) {
	let a = e[Tr] || (e[Tr] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = kr(t);
		r ? Cr(e, n, a[t] = Nr(r, i), s) : o && (wr(e, n, o, s), a[t] = void 0);
	}
}
var Dr = /(Once|Passive|Capture)$/, Or = /^on:?(?:Once|Passive|Capture)$/;
function kr(e) {
	let t, n;
	for (; (n = e.match(Dr)) && !Or.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : M(e.slice(2)), t];
}
var Ar = 0, jr = /* @__PURE__ */ Promise.resolve(), Mr = () => Ar ||= (jr.then(() => Ar = 0), Date.now());
function Nr(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (c(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && N(e, t, 5, a);
			}
		} else N(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Mr(), n;
}
var Pr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Fr = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? cr(e, r, o) : t === "style" ? pr(e, n, r) : d(t) ? C(t) || Er(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Ir(e, t, r, o)) ? (Sr(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && xr(e, t, r, o, a, t !== "value")) : e._isVueCE && (Lr(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !T(r))) ? Sr(e, m(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), xr(e, t, r, o));
};
function Ir(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Pr(t) && x(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Pr(t) && T(n) ? !1 : t in e;
}
function Lr(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = m(t);
	return Array.isArray(n) ? n.some((e) => m(e) === r) : Object.keys(n).some((e) => m(e) === r);
}
var Rr = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return c(t) ? (e) => S(t, e) : t;
};
function zr(e) {
	e.target.composing = !0;
}
function Br(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var $ = /* @__PURE__ */ Symbol("_assign"), Vr = /* @__PURE__ */ Symbol("_initialValue");
function Hr(e, t, n) {
	return t && (e = e.trim()), n && (e = A(e)), e;
}
var Ur = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Vr] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Vr] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[$] = Rr(i);
		let a = r || i.props && i.props.type === "number";
		Cr(e, t ? "change" : "input", (t) => {
			t.target.composing || e[$](Hr(e.value, n, a));
		}), (n || a) && Cr(e, "change", () => {
			e.value = Hr(e.value, n, a);
		}), t || (Cr(e, "compositionstart", zr), Cr(e, "compositionend", Br), Cr(e, "change", Br));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Vr];
		delete e[Vr], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[$](Hr(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[$] = Rr(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? A(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, Wr = {
	deep: !0,
	created(e, t, n) {
		e[$] = Rr(n), Cr(e, "change", () => {
			let t = e._modelValue, n = Yr(e), r = e.checked, i = e[$];
			if (c(t)) {
				let e = oe(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (w(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Xr(e, r));
		});
	},
	mounted: Gr,
	beforeUpdate(e, t, n) {
		e[$] = Rr(n), Gr(e, t, n);
	}
};
function Gr(t, { value: n, oldValue: r }, i) {
	t._modelValue = n;
	let a;
	if (c(n)) a = oe(n, i.props.value) > -1;
	else if (w(n)) a = n.has(i.props.value);
	else {
		if (n === r) return;
		a = e(n, Xr(t, !0));
	}
	t.checked !== a && (t.checked = a);
}
var Kr = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, Cr(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? A(Yr(e)) : Yr(e)), r = e.multiple, i = r ? w(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? c(i) ? t.slice() : t : i];
			try {
				e[$](i);
			} finally {
				Me(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[$] = Rr(r);
	},
	mounted(e, { value: t }) {
		Jr(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[$] = Rr(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !qr(t, n[1], n[0])) && Jr(e, t);
	}
};
function qr(t, n, r) {
	if (!r || c(t)) return e(t, n);
	if (w(t)) {
		if (t.size !== n.length) return !1;
		for (let e of n) if (!t.has(e)) return !1;
		return !0;
	}
	return !1;
}
function Jr(t, n) {
	let r = t.multiple, i = c(n);
	if (!r || i || w(n)) {
		for (let a = 0, o = t.options.length; a < o; a++) {
			let o = t.options[a], s = Yr(o);
			if (r) {
				if (i) {
					let e = typeof s;
					o.selected = e === "string" || e === "number" ? n.some((e) => String(e) === String(s)) : oe(n, s) > -1;
				} else o.selected = n.has(s);
			} else if (e(Yr(o), n)) {
				t.selectedIndex !== a && (t.selectedIndex = a);
				return;
			}
		}
		!r && t.selectedIndex !== -1 && (t.selectedIndex = -1);
	}
}
function Yr(e) {
	return "_value" in e ? e._value : e.value;
}
function Xr(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Zr = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Qr = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => Zr.some((n) => e[`${n}Key`] && !t.includes(n))
}, $r = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Qr[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, ei = /* @__PURE__ */ l({ patchProp: Fr }, or), ti;
function ni() {
	return ti ||= an(ei);
}
var ri = ((...e) => {
	let t = ni().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = ai(e);
		if (!r) return;
		let i = t._component;
		!x(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, ii(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function ii(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function ai(e) {
	return T(e) ? document.querySelector(e) : e;
}
var oi = {
	gemini: {
		name: "Google Gemini",
		url: "https://generativelanguage.googleapis.com/v1beta/openai",
		model: "gemini-flash-latest",
		note: "Google AI Studio API key required. Free-tier quotas depend on the model."
	},
	deepseek: {
		name: "DeepSeek",
		url: "https://api.deepseek.com",
		model: "deepseek-v4-flash",
		note: "DeepSeek API key required."
	},
	openrouter: {
		name: "OpenRouter",
		url: "https://openrouter.ai/api/v1",
		model: "openrouter/free",
		note: "Cloud model marketplace. Free models still need an OpenRouter API key and have rate limits."
	},
	freerouter: {
		name: "FreeRouter",
		url: "http://localhost:18800/v1",
		model: "auto",
		note: "A self-hosted free-model router. Start FreeRouter on the backend machine; a gateway key is optional unless your router requires one.",
		requires_api_key: !1,
		base_url_env: "FREEROUTER_BASE_URL"
	},
	groq: {
		name: "Groq",
		url: "https://api.groq.com/openai/v1",
		model: "llama-3.3-70b-versatile",
		note: "Groq API key required. Free-tier quotas apply."
	},
	ollama: {
		name: "Local Ollama",
		url: "",
		model: "qwen3.5:9b",
		note: "No API key. Install Ollama and download a model on the machine running the backend. Hosted deployments need an administrator-configured Ollama connection."
	}
}, si = ["title"], ci = ["disabled"], li = ["value"], ui = { class: "ai-provider-note" }, di = ["disabled"], fi = {
	key: 0,
	value: ""
}, pi = ["value"], mi = ["disabled", "placeholder"], hi = { id: "ai-model-options" }, gi = ["value"], _i = ["disabled"], vi = { class: "ai-key-status" }, yi = { class: "ai-key-actions" }, bi = ["disabled"], xi = ["disabled"], Si = { for: "ai-provider-key" }, Ci = ["disabled"], wi = { class: "ai-key-actions" }, Ti = ["disabled"], Ei = ["disabled"], Di = { key: 2 }, Oi = ["disabled"], ki = { class: "ai-key-actions" }, Ai = ["disabled"], ji = { class: "ai-fallback" }, Mi = ["disabled"], Ni = ["placeholder"], Pi = {
	class: "ai-test-status",
	role: "status"
}, Fi = ["disabled"], Ii = ["disabled"], Li = {
	__name: "AISettings",
	setup(e) {
		let t = j(null), n = j("deepseek"), r = j({}), i = j(!1), a = j(""), o = j(""), s = j(!1), c = j(!1), l = j([]), u = j(!1);
		function d() {
			delete p.value.api_key, u.value = !1;
		}
		let f = Z(() => oi[n.value]), p = Z(() => r.value[n.value] || {}), m = Z(() => D.info?.providers?.find((e) => e.id === n.value)), g = Z(() => f.value?.requires_api_key !== !1), _ = Z(() => D.info?.providers?.find((e) => e.id === "ollama")?.available === !0), v = Z(() => D.selection ? `${oi[D.selection.provider]?.name || "AI"} · ${D.profiles[D.selection.provider]?.model || ""}` : "Choose your AI");
		async function y() {
			u.value = !1, r.value = Object.fromEntries(Object.entries(oi).map(([e, t]) => [e, {
				model: t.model,
				...D.profiles[e]
			}])), n.value = D.selection?.provider || "deepseek", i.value = D.selection?.fallback || !1, a.value = D.selection?.fallback_model || "", o.value = "", l.value = [], t.value.showModal(), c.value = !0;
			try {
				D.info = await O("/api/providers"), D.selection || (n.value = D.info.default_provider || "deepseek");
				for (let e of D.info.providers || []) D.profiles[e.id] || (r.value[e.id].model = e.model);
			} catch (e) {
				o.value = b(e);
			} finally {
				c.value = !1;
			}
			n.value === "ollama" && m.value?.available && await C();
		}
		function b(e) {
			return e.message === "Not Found" ? "The app backend needs a restart or update to enable AI settings. Ollama may still be running normally." : e.message;
		}
		async function x() {
			u.value = !1;
			for (let e of Object.values(r.value)) delete e.api_key;
			o.value = "", l.value = [], n.value === "ollama" && m.value?.available && await C();
		}
		function S() {
			return {
				provider: n.value,
				model: p.value.model?.trim(),
				api_key: p.value.api_key?.trim() || void 0
			};
		}
		async function C() {
			s.value = !0, o.value = "Loading models…";
			try {
				let e = await O("/api/providers/models", {
					method: "POST",
					body: JSON.stringify(S())
				});
				l.value = e.models || [], n.value === "ollama" ? (l.value.includes(p.value.model) || (p.value.model = l.value[0] || ""), o.value = l.value.length ? `${l.value.length} installed chat models available.` : "No chat models installed. Download a chat model in Ollama, then refresh this list.") : o.value = l.value.length ? "Models loaded. Choose one in the model field." : "No models found. You can enter a model ID manually.";
			} catch (e) {
				o.value = b(e);
			} finally {
				s.value = !1;
			}
		}
		async function ee() {
			s.value = !0, o.value = "Connecting…";
			try {
				let e = await O("/api/providers/test", {
					method: "POST",
					body: JSON.stringify(S())
				});
				o.value = e.message || "Connected. This model is ready to use.";
			} catch (e) {
				o.value = b(e);
			} finally {
				s.value = !1;
			}
		}
		async function w(e = n.value) {
			let t = r.value[e]?.api_key?.trim();
			return t ? (await O("/api/providers/key", {
				method: "POST",
				body: JSON.stringify({
					provider: e,
					api_key: t
				})
			}), delete r.value[e].api_key, u.value = !1, D.profiles[e] && delete D.profiles[e].api_key, D.info = await O("/api/providers"), !0) : (o.value = "Enter an API key first.", !1);
		}
		async function T(e = !1) {
			s.value = !0, o.value = "";
			try {
				e ? (await O("/api/providers/key", {
					method: "POST",
					body: JSON.stringify({
						provider: n.value,
						api_key: null
					})
				}), delete p.value.api_key, u.value = !1, D.info = await O("/api/providers"), o.value = "Saved key removed. A server default key will be used if configured.") : await w() && (o.value = "API key saved securely to your account.");
			} catch (e) {
				o.value = b(e);
			} finally {
				s.value = !1;
			}
		}
		async function te() {
			if (!p.value.model?.trim()) {
				o.value = "Enter a model name.";
				return;
			}
			if (m.value?.available === !1) {
				o.value = "Ollama is not connected to this server.";
				return;
			}
			if (n.value !== "ollama" && g.value && !m.value?.configured && !p.value.api_key?.trim() && !(i.value && _.value)) {
				o.value = "Enter an API key for this provider.";
				return;
			}
			p.value.model = p.value.model.trim(), s.value = !0;
			try {
				for (let [e, t] of Object.entries(r.value)) e !== "ollama" && t.api_key?.trim() && await w(e);
				D.profiles = Object.fromEntries(Object.entries(r.value).map(([e, t]) => [e, { model: t.model }])), D.selection = {
					provider: n.value,
					fallback: i.value && _.value,
					fallback_model: a.value.trim()
				}, ne(), t.value.close();
			} catch (e) {
				o.value = b(e);
			} finally {
				s.value = !1;
			}
		}
		function re() {
			u.value = !1;
			for (let e of Object.values(r.value)) delete e.api_key;
			t.value?.close();
		}
		return vt(() => window.addEventListener("ai-keys-cleared", re)), yt(() => window.removeEventListener("ai-keys-cleared", re)), (e, r) => (H(), U(z, null, [W("button", {
			id: "ai-settings-button",
			class: "ai-settings-button",
			type: "button",
			"aria-label": "AI settings",
			title: v.value,
			onClick: y
		}, [r[13] ||= W("svg", {
			class: "utility-icon",
			viewBox: "0 0 24 24",
			fill: "none",
			"aria-hidden": "true"
		}, [W("path", {
			d: "M12 5c-2-4-7-2-6 2-4 0-4 6-1 7-2 4 3 8 7 4m0-13c2-4 7-2 6 2 4 0 4 6 1 7 2 4-3 8-7 4V5Zm-6 2 2 2m-3 5 3-1m10-6-2 2m3 5-3-1",
			stroke: "currentColor",
			"stroke-width": "1.6",
			"stroke-linecap": "round",
			"stroke-linejoin": "round"
		})], -1), W("small", null, E(v.value), 1)], 8, si), (H(), wn(nt, { to: "body" }, [W("dialog", {
			ref_key: "dialog",
			ref: t,
			class: "ai-settings-dialog",
			"aria-labelledby": "ai-settings-title",
			onClick: r[12] ||= (e) => {
				e.target === t.value && t.value.close();
			}
		}, [W("form", { onSubmit: $r(te, ["prevent"]) }, [
			W("header", null, [r[14] ||= W("div", null, [W("p", { class: "eyebrow" }, "MAKE IT YOURS"), W("h2", { id: "ai-settings-title" }, "Your AI, your choice")], -1), W("button", {
				type: "button",
				class: "icon-button",
				"aria-label": "Close AI settings",
				onClick: r[0] ||= (e) => t.value.close()
			}, "×")]),
			r[21] ||= W("p", { class: "ai-settings-intro" }, "Switch providers in seconds. Changes apply to your next message.", -1),
			r[22] ||= W("label", { for: "ai-provider" }, "Provider", -1),
			L(W("select", {
				id: "ai-provider",
				"onUpdate:modelValue": r[1] ||= (e) => n.value = e,
				disabled: s.value || c.value,
				onChange: x
			}, [(H(!0), U(z, null, xt(h(oi), (e, t) => (H(), U("option", {
				key: t,
				value: t
			}, E(e.name), 9, li))), 128))], 40, ci), [[Kr, n.value]]),
			W("p", ui, E(f.value.note), 1),
			r[23] ||= W("label", { for: "ai-model" }, "Model", -1),
			n.value === "ollama" ? L((H(), U("select", {
				key: 0,
				id: "ai-model",
				"onUpdate:modelValue": r[2] ||= (e) => p.value.model = e,
				disabled: s.value || c.value || !l.value.length,
				required: ""
			}, [l.value.length ? q("", !0) : (H(), U("option", fi, E(s.value ? "Loading installed models…" : "No chat models available"), 1)), (H(!0), U(z, null, xt(l.value, (e) => (H(), U("option", {
				key: e,
				value: e
			}, E(e), 9, pi))), 128))], 8, di)), [[Kr, p.value.model]]) : L((H(), U("input", {
				key: 1,
				id: "ai-model",
				list: "ai-model-options",
				"onUpdate:modelValue": r[3] ||= (e) => p.value.model = e,
				required: "",
				maxlength: "200",
				disabled: s.value || c.value,
				placeholder: f.value.model
			}, null, 8, mi)), [[Ur, p.value.model]]),
			W("datalist", hi, [(H(!0), U(z, null, xt(l.value, (e) => (H(), U("option", {
				key: e,
				value: e
			}, null, 8, gi))), 128))]),
			W("button", {
				class: "ai-load-models",
				type: "button",
				disabled: s.value || c.value || m.value?.available === !1,
				onClick: C
			}, E(n.value === "ollama" ? "Refresh installed models" : "Load available models"), 9, _i),
			W("small", null, E(n.value === "ollama" ? "Choose an installed chat model. Embedding-only models are excluded." : "Enter the exact model ID from your provider."), 1),
			n.value !== "ollama" && g.value ? (H(), U(z, { key: 2 }, [m.value?.configured && !u.value ? (H(), U(z, { key: 0 }, [W("p", vi, [r[15] ||= W("strong", null, "API key configured", -1), W("small", null, E(m.value?.saved_key ? "Saved to your account" : "Using the server key"), 1)]), W("div", yi, [W("button", {
				type: "button",
				class: "ai-test-button",
				disabled: s.value || c.value,
				onClick: r[4] ||= (e) => u.value = !0
			}, "Replace API key", 8, bi), m.value?.saved_key ? (H(), U("button", {
				key: 0,
				type: "button",
				class: "ai-test-button",
				disabled: s.value || c.value,
				onClick: r[5] ||= (e) => T(!0)
			}, "Remove saved key", 8, xi)) : q("", !0)])], 64)) : c.value ? q("", !0) : (H(), U(z, { key: 1 }, [
				W("label", Si, E(m.value?.configured ? "New API key" : "API key"), 1),
				L(W("input", {
					id: "ai-provider-key",
					"onUpdate:modelValue": r[6] ||= (e) => p.value.api_key = e,
					type: "password",
					autocomplete: "new-password",
					maxlength: "4096",
					disabled: s.value,
					placeholder: "Paste your new API key"
				}, null, 8, Ci), [[Ur, p.value.api_key]]),
				r[16] ||= W("small", null, "Your key is saved encrypted on the backend and is never displayed after saving.", -1),
				W("div", wi, [W("button", {
					type: "button",
					class: "ai-test-button",
					disabled: s.value || c.value || !p.value.api_key?.trim(),
					onClick: r[7] ||= (e) => T()
				}, "Save API key", 8, Ti), u.value ? (H(), U("button", {
					key: 0,
					type: "button",
					class: "ai-test-button",
					disabled: s.value,
					onClick: d
				}, "Cancel replacement", 8, Ei)) : q("", !0)])
			], 64)), h(D).info?.key_storage_available === !1 ? (H(), U("small", Di, "Saving keys needs one-time secure storage setup on this server. You can still use its configured default key.")) : q("", !0)], 64)) : n.value === "freerouter" && !c.value ? (H(), U(z, { key: 3 }, [
				r[17] ||= W("label", { for: "ai-provider-key" }, [K("Gateway key "), W("span", null, "Optional")], -1),
				L(W("input", {
					id: "ai-provider-key",
					"onUpdate:modelValue": r[8] ||= (e) => p.value.api_key = e,
					type: "password",
					autocomplete: "new-password",
					maxlength: "4096",
					disabled: s.value,
					placeholder: "Only needed by secured FreeRouter gateways"
				}, null, 8, Oi), [[Ur, p.value.api_key]]),
				r[18] ||= W("small", null, "FreeRouter normally runs without a key. If your gateway is secured, save its key here.", -1),
				W("div", ki, [W("button", {
					type: "button",
					class: "ai-test-button",
					disabled: s.value || !p.value.api_key?.trim(),
					onClick: r[9] ||= (e) => T()
				}, "Save gateway key", 8, Ai)])
			], 64)) : q("", !0),
			W("div", ji, [
				W("label", null, [L(W("input", {
					"onUpdate:modelValue": r[10] ||= (e) => i.value = e,
					type: "checkbox",
					disabled: !_.value || n.value === "ollama" || s.value
				}, null, 8, Mi), [[Wr, i.value]]), r[19] ||= K(" Use local Ollama if this provider fails", -1)]),
				W("p", null, "No API key needed. " + E(_.value ? "Ollama must be running with the fallback model installed." : "Connect Ollama to the backend to enable this option."), 1),
				i.value && _.value && n.value !== "ollama" ? (H(), U(z, { key: 0 }, [r[20] ||= W("label", { for: "ai-fallback-model" }, "Fallback model", -1), L(W("input", {
					id: "ai-fallback-model",
					"onUpdate:modelValue": r[11] ||= (e) => a.value = e,
					placeholder: h(D).info?.providers?.find((e) => e.id === "ollama")?.model,
					maxlength: "200"
				}, null, 8, Ni), [[Ur, a.value]])], 64)) : q("", !0)
			]),
			W("p", Pi, E(o.value), 1),
			W("footer", null, [W("button", {
				type: "button",
				class: "ai-test-button",
				disabled: s.value || c.value || m.value?.available === !1 || n.value === "ollama" && !l.value.includes(p.value.model),
				onClick: ee
			}, E(s.value ? "Testing…" : "Test connection"), 9, Fi), W("button", {
				class: "new-chat-button",
				type: "submit",
				disabled: s.value || c.value || m.value?.available === !1 || n.value === "ollama" && !l.value.includes(p.value.model)
			}, "Save settings", 8, Ii)])
		], 32)], 512)]))], 64));
	}
}, Ri = {
	key: 1,
	class: "ai-settings-button",
	"aria-label": "Connections"
}, zi = { class: "setup-shell" }, Bi = { class: "setup-aside" }, Vi = {
	class: "setup-steps",
	"aria-label": "Setup progress"
}, Hi = { class: "setup-main" }, Ui = { class: "setup-mobile-header" }, Wi = {
	key: 0,
	class: "setup-panel",
	"aria-labelledby": "setup-ai-title"
}, Gi = { class: "provider-grid" }, Ki = ["disabled", "onClick"], qi = { class: "provider-monogram" }, Ji = { key: 0 }, Yi = { key: 1 }, Xi = { key: 2 }, Zi = { class: "setup-fields" }, Qi = { class: "setup-inline" }, $i = ["disabled"], ea = {
	key: 0,
	value: ""
}, ta = ["value"], na = ["disabled"], ra = ["placeholder", "disabled"], ia = { for: "setup-ai-key" }, aa = ["disabled"], oa = ["disabled"], sa = {
	key: 2,
	class: "detected-key"
}, ca = { class: "setup-actions" }, la = ["disabled"], ua = {
	key: 1,
	class: "setup-panel",
	"aria-labelledby": "setup-google-title"
}, da = { class: "google-connection-card" }, fa = { class: "setup-fields" }, pa = ["disabled"], ma = {
	key: 1,
	class: "detected-key"
}, ha = ["disabled"], ga = {
	key: 3,
	class: "detected-key"
}, _a = { class: "setup-actions" }, va = ["disabled"], ya = ["disabled"], ba = {
	key: 2,
	class: "setup-panel setup-ready",
	"aria-labelledby": "setup-ready-title"
}, xa = { class: "setup-lead" }, Sa = { class: "ready-summary" }, Ca = { class: "provider-monogram" }, wa = { class: "setup-actions" }, Ta = ["disabled"], Ea = ["disabled"], Da = {
	key: 3,
	class: "setup-status",
	role: "status"
}, Oa = {
	__name: "SetupWizard",
	setup(e) {
		let t = j(null), n = j(!1), r = j(null), i = j(1), a = j("gemini"), o = j({}), s = j([]), c = j(""), l = j(""), u = j(""), d = j(!1), f = j(!1), p = j(!1), m = j(!1), g = !1, _ = Z(() => oi[a.value]), v = Z(() => o.value[a.value] || {}), y = Z(() => r.value?.providers?.find((e) => e.id === a.value)), b = Z(() => r.value?.google || {}), x = Z(() => a.value === "ollama" ? y.value?.available === !0 && s.value.includes(v.value.model) : _.value?.requires_api_key === !1 || y.value?.configured === !0 || !!v.value.api_key?.trim()), S = Z(() => {
			if (!r.value) return "First-run guide";
			let e = r.value.providers?.filter((e) => e.configured).length || 0;
			return `${e} AI option${e === 1 ? "" : "s"} · ${b.value.places_configured ? "Maps ready" : "Maps needed"}`;
		});
		function C(e) {
			o.value = Object.fromEntries(Object.entries(oi).map(([t, n]) => [t, { model: D.profiles[t]?.model || e.providers?.find((e) => e.id === t)?.model || n.model }]));
		}
		function ee(e) {
			let t = (t) => {
				let n = e.providers?.find((e) => e.id === t);
				return t === "ollama" ? n?.available === !0 : n?.configured === !0;
			};
			return [
				D.selection?.provider,
				e.default_provider,
				...Object.keys(oi)
			].find((e) => e && t(e)) || e.default_provider || "gemini";
		}
		async function w(e = !1) {
			if (n.value || e) {
				d.value = !0, u.value = "Checking your local services…";
				try {
					let o = await O("/api/setup");
					if (n.value = o.available === !0, !n.value) return;
					r.value = o, C(o), a.value = ee(o), i.value = 1, u.value = "", f.value = !1, p.value = !1, c.value = "", l.value = "", (!e || !o.complete) && (t.value?.showModal(), a.value === "ollama" && await te());
				} catch (e) {
					u.value = e.message;
				} finally {
					d.value = !1;
				}
			}
		}
		async function T(e) {
			a.value = e, f.value = !1, u.value = "", s.value = [], e === "ollama" && y.value?.available && await te();
		}
		async function te() {
			d.value = !0, u.value = "Finding installed Ollama chat models…";
			try {
				let e = await O("/api/providers/models", {
					method: "POST",
					body: JSON.stringify({
						provider: "ollama",
						model: v.value.model
					})
				});
				s.value = e.models || [], s.value.includes(v.value.model) || (v.value.model = s.value[0] || ""), u.value = s.value.length ? `${s.value.length} local chat model${s.value.length === 1 ? "" : "s"} found.` : "Ollama is running, but no chat model is installed yet.";
			} catch (e) {
				u.value = e.message;
			} finally {
				d.value = !1;
			}
		}
		function re() {
			return {
				provider: a.value,
				model: v.value.model?.trim(),
				api_key: v.value.api_key?.trim() || void 0
			};
		}
		async function ie() {
			if (!x.value) {
				u.value = a.value === "ollama" ? "Start Ollama and install a chat model, or choose a cloud provider." : `Add a ${_.value.name} API key to continue.`;
				return;
			}
			d.value = !0, u.value = `Testing ${_.value.name}…`;
			try {
				let e = await O("/api/providers/test", {
					method: "POST",
					body: JSON.stringify(re())
				});
				f.value = !0, u.value = e.message || `${_.value.name} is connected and ready.`, i.value = 2;
			} catch (e) {
				f.value = !1, u.value = e.message;
			} finally {
				d.value = !1;
			}
		}
		async function ae() {
			if (!b.value.places_configured && !c.value.trim()) {
				u.value = "Add a Google Places API key to enable live recommendations.";
				return;
			}
			d.value = !0, u.value = "Saving and testing Google Places…";
			try {
				r.value = await O("/api/setup", {
					method: "POST",
					body: JSON.stringify({
						google_places_api_key: c.value.trim() || void 0,
						google_maps_embed_api_key: l.value.trim() || void 0
					})
				});
				let e = await O("/api/setup/google/test", {
					method: "POST",
					body: "{}"
				});
				p.value = !0, u.value = e.message, c.value = "", l.value = "", i.value = 3;
			} catch (e) {
				p.value = !1, u.value = e.message;
			} finally {
				d.value = !1;
			}
		}
		async function oe() {
			if (f.value && p.value) {
				d.value = !0, u.value = "Saving your setup…";
				try {
					a.value !== "ollama" && v.value.api_key?.trim() && (await O("/api/providers/key", {
						method: "POST",
						body: JSON.stringify({
							provider: a.value,
							api_key: v.value.api_key.trim()
						})
					}), delete v.value.api_key), D.profiles = Object.fromEntries(Object.entries(o.value).map(([e, t]) => [e, { model: t.model }])), D.selection = {
						provider: a.value,
						fallback: !1,
						fallback_model: ""
					}, ne(), r.value = await O("/api/setup", {
						method: "POST",
						body: JSON.stringify({ complete: !0 })
					}), D.info = await O("/api/providers"), t.value.close(), window.dispatchEvent(new Event("wander-setup-complete"));
				} catch (e) {
					u.value = e.message;
				} finally {
					d.value = !1;
				}
			}
		}
		function se(e) {
			n.value = e.detail?.local_setup_available === !0, n.value && m.value && !g && (g = !0, w(!0));
		}
		function ce() {
			m.value = !0, n.value && !g && (g = !0, w(!0));
		}
		function le() {
			m.value = !1, g = !1, t.value?.close();
		}
		return vt(() => {
			window.addEventListener("wander-config", se), window.addEventListener("wander-authenticated", ce), window.addEventListener("wander-locked", le);
		}), yt(() => {
			window.removeEventListener("wander-config", se), window.removeEventListener("wander-authenticated", ce), window.removeEventListener("wander-locked", le);
		}), (e, o) => (H(), U(z, null, [n.value ? (H(), U("button", {
			key: 0,
			id: "setup-button",
			class: "ai-settings-button setup-launcher",
			type: "button",
			onClick: o[0] ||= (e) => w(!1)
		}, [
			o[14] ||= W("svg", {
				class: "utility-icon",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true"
			}, [W("path", {
				d: "m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2",
				stroke: "currentColor",
				"stroke-width": "1.8",
				"stroke-linecap": "round"
			})], -1),
			o[15] ||= W("span", { class: "sr-only" }, "Connections", -1),
			W("small", null, E(S.value), 1)
		])) : (H(), U("div", Ri, [...o[16] ||= [W("svg", {
			class: "utility-icon",
			viewBox: "0 0 24 24",
			fill: "none",
			"aria-hidden": "true"
		}, [W("path", {
			d: "m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2",
			stroke: "currentColor",
			"stroke-width": "1.8",
			"stroke-linecap": "round"
		})], -1), W("small", null, "Google Maps", -1)]])), (H(), wn(nt, { to: "body" }, [W("dialog", {
			ref_key: "dialog",
			ref: t,
			class: "setup-dialog",
			"aria-labelledby": "setup-title"
		}, [W("div", zi, [W("aside", Bi, [
			o[20] ||= W("a", {
				class: "brand setup-brand",
				href: "/",
				"aria-label": "Wander Pico home"
			}, [W("span", {
				class: "brand-mark",
				"aria-hidden": "true"
			}, [W("svg", {
				viewBox: "0 0 24 24",
				fill: "none"
			}, [W("circle", {
				cx: "12",
				cy: "12",
				r: "8.5",
				stroke: "currentColor",
				"stroke-width": "1.7"
			}), W("path", {
				d: "m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z",
				fill: "currentColor"
			})])]), W("span", null, [W("strong", null, "Wander Pico"), W("small", null, "Local setup")])], -1),
			o[21] ||= W("div", { class: "setup-aside-copy" }, [
				W("p", { class: "eyebrow" }, "FIRST-RUN GUIDE"),
				W("h2", { id: "setup-title" }, "From clone to conversation."),
				W("p", null, "Connect one AI, verify Google Places, and start exploring.")
			], -1),
			W("ol", Vi, [
				W("li", { class: he({
					active: i.value === 1,
					done: i.value > 1
				}) }, [...o[17] ||= [W("span", null, "1", -1), W("div", null, [W("strong", null, "Choose your AI"), W("small", null, "Cloud or local")], -1)]], 2),
				W("li", { class: he({
					active: i.value === 2,
					done: i.value > 2
				}) }, [...o[18] ||= [W("span", null, "2", -1), W("div", null, [W("strong", null, "Connect Google"), W("small", null, "Live place data")], -1)]], 2),
				W("li", { class: he({ active: i.value === 3 }) }, [...o[19] ||= [W("span", null, "3", -1), W("div", null, [W("strong", null, "Start exploring"), W("small", null, "Everything checked")], -1)]], 2)
			]),
			o[22] ||= W("p", { class: "setup-security" }, "Keys stay on your backend. Server defaults are detected but never revealed to the browser.", -1)
		]), W("main", Hi, [
			W("header", Ui, [W("p", null, "STEP " + E(i.value) + " OF 3", 1), W("button", {
				type: "button",
				class: "icon-button",
				"aria-label": "Close setup",
				onClick: o[1] ||= (e) => t.value.close()
			}, "×")]),
			i.value === 1 ? (H(), U("section", Wi, [
				o[32] ||= W("p", { class: "eyebrow" }, "YOUR ASSISTANT", -1),
				o[33] ||= W("h3", { id: "setup-ai-title" }, "Pick the brain behind the journey", -1),
				o[34] ||= W("p", { class: "setup-lead" }, [
					K("Configured keys from "),
					W("code", null, ".env"),
					K(" are ready to use. Or keep every prompt on this machine with Ollama.")
				], -1),
				W("div", Gi, [(H(!0), U(z, null, xt(h(oi), (e, t) => (H(), U("button", {
					key: t,
					type: "button",
					class: he(["provider-choice", { selected: a.value === t }]),
					disabled: d.value || t === "ollama" && r.value?.providers?.find((e) => e.id === t)?.available === !1,
					onClick: (e) => T(t)
				}, [
					W("span", qi, E(e.name.charAt(0)), 1),
					W("span", null, [W("strong", null, E(e.name), 1), r.value?.providers?.find((e) => e.id === t)?.configured ? (H(), U("small", Ji, "Ready")) : t === "ollama" ? (H(), U("small", Yi, "Not detected")) : (H(), U("small", Xi, "Key needed"))]),
					o[23] ||= W("span", {
						class: "choice-check",
						"aria-hidden": "true"
					}, "✓", -1)
				], 10, Ki))), 128))]),
				W("div", Zi, [a.value === "ollama" ? (H(), U(z, { key: 0 }, [o[24] ||= W("label", { for: "setup-ai-model" }, "Installed chat model", -1), W("div", Qi, [L(W("select", {
					id: "setup-ai-model",
					"onUpdate:modelValue": o[2] ||= (e) => v.value.model = e,
					disabled: d.value || !s.value.length,
					onChange: o[3] ||= (e) => f.value = !1
				}, [s.value.length ? q("", !0) : (H(), U("option", ea, "No chat model found")), (H(!0), U(z, null, xt(s.value, (e) => (H(), U("option", {
					key: e,
					value: e
				}, E(e), 9, ta))), 128))], 40, $i), [[Kr, v.value.model]]), W("button", {
					type: "button",
					class: "setup-secondary",
					disabled: d.value,
					onClick: te
				}, "Refresh", 8, na)])], 64)) : (H(), U(z, { key: 1 }, [
					o[29] ||= W("label", { for: "setup-ai-model" }, "Model", -1),
					L(W("input", {
						id: "setup-ai-model",
						"onUpdate:modelValue": o[4] ||= (e) => v.value.model = e,
						maxlength: "200",
						placeholder: _.value.model,
						disabled: d.value,
						onInput: o[5] ||= (e) => f.value = !1
					}, null, 40, ra), [[Ur, v.value.model]]),
					!y.value?.configured && _.value?.requires_api_key !== !1 ? (H(), U(z, { key: 0 }, [
						W("label", ia, E(_.value.name) + " API key", 1),
						L(W("input", {
							id: "setup-ai-key",
							"onUpdate:modelValue": o[6] ||= (e) => v.value.api_key = e,
							type: "password",
							autocomplete: "new-password",
							maxlength: "4096",
							placeholder: "Paste your API key",
							disabled: d.value,
							onInput: o[7] ||= (e) => f.value = !1
						}, null, 40, aa), [[Ur, v.value.api_key]]),
						o[25] ||= W("small", null, "Encrypted on the backend after setup. It is never saved in browser storage.", -1)
					], 64)) : a.value === "freerouter" ? (H(), U(z, { key: 1 }, [
						o[26] ||= W("label", { for: "setup-ai-key" }, [K("Gateway key "), W("span", null, "Optional")], -1),
						L(W("input", {
							id: "setup-ai-key",
							"onUpdate:modelValue": o[8] ||= (e) => v.value.api_key = e,
							type: "password",
							autocomplete: "new-password",
							maxlength: "4096",
							placeholder: "Only needed by secured FreeRouter gateways",
							disabled: d.value,
							onInput: o[9] ||= (e) => f.value = !1
						}, null, 40, oa), [[Ur, v.value.api_key]]),
						o[27] ||= W("small", null, "FreeRouter normally needs no key. Add one only if your gateway is secured.", -1)
					], 64)) : (H(), U("p", sa, [...o[28] ||= [W("span", null, "✓", -1), W("span", null, [W("strong", null, "API key detected"), W("small", null, "Using the private server configuration")], -1)]]))
				], 64))]),
				W("div", ca, [o[31] ||= W("span", null, null, -1), W("button", {
					class: "setup-primary",
					type: "button",
					disabled: d.value || !x.value,
					onClick: ie
				}, [K(E(d.value ? "Testing connection…" : "Test & continue") + " ", 1), o[30] ||= W("span", null, "→", -1)], 8, la)])
			])) : i.value === 2 ? (H(), U("section", ua, [
				o[44] ||= W("p", { class: "eyebrow" }, "LIVE LOCAL DATA", -1),
				o[45] ||= W("h3", { id: "setup-google-title" }, "Bring real places into every answer", -1),
				o[46] ||= W("p", { class: "setup-lead" }, "Places API (New) powers verified names, ratings, addresses, and photos. Maps Embed adds the optional in-app map preview.", -1),
				W("div", da, [
					o[36] ||= W("span", {
						class: "google-mark",
						"aria-hidden": "true"
					}, "G", -1),
					W("div", null, [o[35] ||= W("strong", null, "Google Maps Platform", -1), W("small", null, E(b.value.places_configured ? "Places key detected in local configuration" : "Places API key required"), 1)]),
					W("span", { class: he(["connection-pill", { ready: b.value.places_configured }]) }, E(b.value.places_configured ? "Ready" : "Connect"), 3)
				]),
				W("div", fa, [b.value.places_configured ? (H(), U("p", ma, [...o[39] ||= [W("span", null, "✓", -1), W("span", null, [W("strong", null, "Google Places key detected"), W("small", null, "The key remains on the backend")], -1)]])) : (H(), U(z, { key: 0 }, [
					o[37] ||= W("label", { for: "setup-places-key" }, "Google Places API key", -1),
					L(W("input", {
						id: "setup-places-key",
						"onUpdate:modelValue": o[10] ||= (e) => c.value = e,
						type: "password",
						autocomplete: "new-password",
						maxlength: "4096",
						placeholder: "Paste the server-restricted key",
						disabled: d.value
					}, null, 8, pa), [[Ur, c.value]]),
					o[38] ||= W("small", null, "Enable Places API (New) and restrict this private key to your backend IP.", -1)
				], 64)), b.value.embed_configured ? (H(), U("p", ga, [...o[42] ||= [W("span", null, "✓", -1), W("span", null, [W("strong", null, "Maps Embed key detected"), W("small", null, "Live map previews are enabled")], -1)]])) : (H(), U(z, { key: 2 }, [
					o[40] ||= W("label", { for: "setup-embed-key" }, [K("Maps Embed API key "), W("span", null, "Optional")], -1),
					L(W("input", {
						id: "setup-embed-key",
						"onUpdate:modelValue": o[11] ||= (e) => l.value = e,
						type: "password",
						autocomplete: "new-password",
						maxlength: "4096",
						placeholder: "Add for live map previews",
						disabled: d.value
					}, null, 8, ha), [[Ur, l.value]]),
					o[41] ||= W("small", null, "Use a separate website-restricted key. Direct Google Maps links work without it.", -1)
				], 64))]),
				W("div", _a, [W("button", {
					class: "setup-back",
					type: "button",
					disabled: d.value,
					onClick: o[12] ||= (e) => i.value = 1
				}, "← Back", 8, va), W("button", {
					class: "setup-primary",
					type: "button",
					disabled: d.value || !b.value.places_configured && !c.value.trim(),
					onClick: ae
				}, [K(E(d.value ? "Testing Google…" : "Test Google & continue") + " ", 1), o[43] ||= W("span", null, "→", -1)], 8, ya)])
			])) : (H(), U("section", ba, [
				o[51] ||= W("span", {
					class: "ready-orbit",
					"aria-hidden": "true"
				}, [W("span", null, "✓")], -1),
				o[52] ||= W("p", { class: "eyebrow" }, "ALL SYSTEMS READY", -1),
				o[53] ||= W("h3", { id: "setup-ready-title" }, "Your local guide is ready to roam", -1),
				W("p", xa, "The demo will use " + E(_.value.name) + " with " + E(v.value.model) + " and ground place recommendations in live Google data.", 1),
				W("div", Sa, [W("div", null, [
					W("span", Ca, E(_.value.name.charAt(0)), 1),
					W("span", null, [o[47] ||= W("small", null, "AI provider", -1), W("strong", null, E(_.value.name), 1)]),
					o[48] ||= W("b", null, "Connected", -1)
				]), o[49] ||= W("div", null, [
					W("span", { class: "google-mark" }, "G"),
					W("span", null, [W("small", null, "Place data"), W("strong", null, "Google Places")]),
					W("b", null, "Connected")
				], -1)]),
				W("div", wa, [W("button", {
					class: "setup-back",
					type: "button",
					disabled: d.value,
					onClick: o[13] ||= (e) => i.value = 2
				}, "← Back", 8, Ta), W("button", {
					class: "setup-primary",
					type: "button",
					disabled: d.value,
					onClick: oe
				}, [K(E(d.value ? "Opening demo…" : "Finish & start chatting") + " ", 1), o[50] ||= W("span", null, "→", -1)], 8, Ea)])
			])),
			u.value ? (H(), U("p", Da, E(u.value), 1)) : q("", !0)
		])])], 512)]))], 64));
	}
}, ka = [
	"aria-checked",
	"aria-label",
	"title"
], Aa = "wander-pico-theme", ja = {
	__name: "ThemeSwitcher",
	setup(e) {
		let t = j(!1), n;
		function r(e) {
			t.value = e, document.documentElement.dataset.theme = e ? "dark" : "light";
		}
		function i(e) {
			localStorage.getItem(Aa) || r(e.matches);
		}
		function a() {
			let e = t.value ? "light" : "dark";
			localStorage.setItem(Aa, e), r(e === "dark");
		}
		return vt(() => {
			n = window.matchMedia("(prefers-color-scheme: dark)");
			let e = localStorage.getItem(Aa);
			r(e ? e === "dark" : n.matches), n.addEventListener("change", i);
		}), yt(() => n?.removeEventListener("change", i)), (e, n) => (H(), U("button", {
			class: "theme-switch",
			type: "button",
			role: "switch",
			"aria-checked": t.value,
			"aria-label": t.value ? "Switch to light mode" : "Switch to dark mode",
			title: t.value ? "Switch to light mode" : "Switch to dark mode",
			onClick: a
		}, [...n[0] ||= [
			W("span", {
				class: "theme-switch-icon theme-switch-sun",
				"aria-hidden": "true"
			}, "☀", -1),
			W("span", {
				class: "theme-switch-track",
				"aria-hidden": "true"
			}, [W("span")], -1),
			W("span", {
				class: "theme-switch-icon theme-switch-moon",
				"aria-hidden": "true"
			}, "☾", -1)
		]], 8, ka));
	}
}, Ma = {
	id: "empty-state",
	class: "empty-state",
	"aria-labelledby": "empty-title"
}, Na = {
	class: "suggestion-grid",
	"aria-label": "Example searches"
}, Pa = ["onClick"], Fa = {
	class: "suggestion-icon",
	"aria-hidden": "true"
}, Ia = { class: "suggestion-copy" }, La = {
	__name: "WelcomeScreen",
	emits: ["discover"],
	setup(e) {
		let t = [
			{
				icon: "☕",
				title: "Find my coffee spot",
				detail: "Quiet cafés & a change of scenery",
				prompt: "Quiet work cafés in Bandung with outdoor seating"
			},
			{
				icon: "🍜",
				title: "Eat like a local",
				detail: "Good food, close to home",
				prompt: "Authentic Padang food near Blok M, Jakarta"
			},
			{
				icon: "🌿",
				title: "Take a breather",
				detail: "Parks, fresh air & slower moments",
				prompt: "A peaceful park for an evening walk in Central Jakarta"
			},
			{
				icon: "☀️",
				title: "Make a day of it",
				detail: "A little adventure for the weekend",
				prompt: "Family-friendly things to do in Yogyakarta this weekend"
			}
		];
		return (e, n) => (H(), U("section", Ma, [n[0] ||= Mn("<span class=\"empty-logo\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" stroke=\"currentColor\" stroke-width=\"1.7\"></circle><path d=\"m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z\" fill=\"currentColor\"></path></svg></span><p class=\"eyebrow\"><span></span> A little closer to your next favorite place</p><h1 id=\"empty-title\">Where should we go?</h1><p class=\"empty-copy\"> Find a quiet café, plan a little escape, or discover something new nearby. Start with whatever you have in mind. </p>", 4), W("div", Na, [(H(), U(z, null, xt(t, (t) => W("button", {
			key: t.title,
			class: "suggestion-card",
			type: "button",
			onClick: (n) => e.$emit("discover", t.prompt)
		}, [W("span", Fa, E(t.icon), 1), W("span", Ia, [W("strong", null, E(t.title), 1), W("small", null, E(t.detail), 1)])], 8, Pa)), 64))])]));
	}
}, Ra = { class: "app-shell" }, za = {
	id: "sidebar",
	class: "sidebar",
	"aria-label": "Sidebar"
}, Ba = { class: "sidebar-bottom" }, Va = { class: "sidebar-utilities" }, Ha = { class: "theme-control" }, Ua = { class: "utility-row" }, Wa = { class: "utility-row" }, Ga = { class: "main-pane" }, Ka = {
	id: "conversation",
	class: "chat-scroll"
}, qa = {
	id: "thread",
	class: "thread",
	role: "log",
	"aria-live": "polite",
	"aria-relevant": "additions"
};
//#endregion
//#region frontend/main.js
ri({
	__name: "App",
	setup(e) {
		function t(e) {
			let t = document.querySelector("#message");
			t.value = e, t.dispatchEvent(new Event("input", { bubbles: !0 })), document.querySelector("#chat-form").requestSubmit();
		}
		return vt(() => import("./ui-app-7OH7e2yE.js")), (e, n) => (H(), U(z, null, [
			n[7] ||= W("section", {
				id: "auth-page",
				class: "auth-page",
				"aria-labelledby": "auth-title"
			}, [W("div", { class: "auth-card" }, [
				W("p", { class: "eyebrow" }, "Wander Pico"),
				W("h1", { id: "auth-title" }, "Welcome back"),
				W("p", null, "Save your discoveries and continue your conversations."),
				W("form", { id: "auth-form" }, [
					W("label", { id: "identifier-label" }, [K("Username or email"), W("input", {
						id: "identifier",
						autocomplete: "username",
						required: "",
						maxlength: "254"
					})]),
					W("label", {
						id: "register-email-label",
						hidden: ""
					}, [K("Email"), W("input", {
						id: "register-email",
						type: "email",
						autocomplete: "email",
						maxlength: "254"
					})]),
					W("label", null, [K("Password"), W("input", {
						id: "password",
						type: "password",
						autocomplete: "current-password",
						required: "",
						maxlength: "128"
					})]),
					W("p", {
						id: "auth-success",
						role: "status",
						"aria-live": "polite"
					}),
					W("p", {
						id: "auth-error",
						role: "alert"
					}),
					W("button", {
						id: "auth-submit",
						type: "submit",
						class: "new-chat-button auth-action"
					}, [
						W("svg", {
							class: "auth-icon auth-icon-login",
							viewBox: "0 0 24 24",
							fill: "none",
							"aria-hidden": "true"
						}, [W("path", {
							d: "M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 3-3-3-3m3 3H9",
							stroke: "currentColor",
							"stroke-width": "1.8",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						})]),
						W("svg", {
							class: "auth-icon auth-icon-register",
							viewBox: "0 0 24 24",
							fill: "none",
							"aria-hidden": "true",
							hidden: ""
						}, [W("path", {
							d: "M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-5v6m-3-3h6",
							stroke: "currentColor",
							"stroke-width": "1.8",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						})]),
						W("span", { class: "auth-submit-label" }, "Log in")
					])
				]),
				W("p", { class: "auth-switch" }, [W("span", { id: "auth-toggle-description" }, "New to Wander Pico?"), W("a", {
					id: "auth-toggle",
					href: "#register"
				}, [
					W("svg", {
						class: "auth-icon auth-icon-register",
						viewBox: "0 0 24 24",
						fill: "none",
						"aria-hidden": "true"
					}, [W("path", {
						d: "M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-5v6m-3-3h6",
						stroke: "currentColor",
						"stroke-width": "1.8",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					})]),
					W("svg", {
						class: "auth-icon auth-icon-login",
						viewBox: "0 0 24 24",
						fill: "none",
						"aria-hidden": "true",
						hidden: ""
					}, [W("path", {
						d: "M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 3-3-3-3m3 3H9",
						stroke: "currentColor",
						"stroke-width": "1.8",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					})]),
					W("span", { class: "auth-toggle-label" }, "Create an account")
				])])
			])], -1),
			n[8] ||= W("a", {
				class: "skip-link",
				href: "#message"
			}, "Skip to chat input", -1),
			W("div", Ra, [W("aside", za, [n[5] ||= Mn("<div class=\"sidebar-top\"><a class=\"brand\" href=\"/\" aria-label=\"Wander Pico home\"><span class=\"brand-mark\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" stroke=\"currentColor\" stroke-width=\"1.7\"></circle><path d=\"m13.9 7.8-2.1 4.1-4.1 2.2 4.6.1 1.6 2.1.2-4.5 2.2-4-2.4-.1Z\" fill=\"currentColor\"></path></svg></span><span><strong>Wander Pico</strong><small>Local discovery</small></span></a><button id=\"new-chat\" class=\"new-chat-button\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path></svg><span>New chat</span></button></div><div class=\"sidebar-history\"><h2 class=\"sidebar-heading\">Your chats</h2><input id=\"history-search\" type=\"search\" placeholder=\"Search chats\" aria-label=\"Search chats\"><div id=\"history-list\" class=\"history-list\"></div></div>", 2), W("div", Ba, [
				n[3] ||= W("div", { class: "sidebar-bottom-header" }, [W("span", null, "Workspace"), W("a", {
					class: "docs-link",
					href: "/docs",
					target: "_blank",
					rel: "noopener noreferrer"
				}, [K(" Docs "), W("svg", {
					viewBox: "0 0 24 24",
					fill: "none",
					"aria-hidden": "true"
				}, [W("path", {
					d: "M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
					stroke: "currentColor",
					"stroke-width": "1.7",
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				})])])], -1),
				W("div", Va, [
					W("div", Ha, [n[0] ||= W("span", null, "Appearance", -1), G(ja)]),
					W("div", Ua, [G(Li), n[1] ||= W("span", {
						id: "model-status",
						class: "service-led checking",
						role: "status",
						"aria-label": "Checking AI connection",
						title: "Checking AI connection"
					}, [W("span", { class: "status-dot" }), W("span", { class: "service-copy" }, [W("span", null, "AI"), W("strong", null, "Checking")])], -1)]),
					W("div", Wa, [G(Oa), n[2] ||= W("span", {
						id: "maps-status",
						class: "service-led checking",
						role: "status",
						"aria-label": "Checking Google Maps configuration",
						title: "Checking Google Maps configuration"
					}, [W("span", { class: "status-dot" }), W("span", { class: "service-copy" }, [W("span", null, "Maps"), W("strong", null, "Checking")])], -1)])
				]),
				n[4] ||= W("button", {
					id: "logout",
					class: "sidebar-logout",
					type: "button"
				}, [W("svg", {
					viewBox: "0 0 24 24",
					fill: "none",
					"aria-hidden": "true"
				}, [W("path", {
					d: "M10 4H5v16h5m5-12 4 4-4 4m-6-4h10",
					stroke: "currentColor",
					"stroke-width": "1.8",
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				})]), K("Log out")], -1)
			])]), W("div", Ga, [W("main", Ka, [W("div", qa, [G(La, { onDiscover: t })])]), n[6] ||= W("div", { class: "composer-wrap" }, [W("div", { class: "composer-shell" }, [W("div", {
				id: "notice",
				class: "notice",
				role: "status",
				"aria-live": "polite",
				hidden: ""
			}), W("form", { id: "chat-form" }, [
				W("div", { class: "composer-box" }, [W("textarea", {
					id: "message",
					required: "",
					maxlength: "4000",
					rows: "1",
					"aria-label": "Your message",
					placeholder: "Where would you like to explore?"
				}), W("button", {
					id: "send",
					class: "send-button",
					type: "submit",
					"aria-label": "Send message",
					disabled: ""
				}, [W("svg", {
					viewBox: "0 0 24 24",
					fill: "none",
					"aria-hidden": "true"
				}, [W("path", {
					d: "m14 5 5 7-5 7M19 12H5",
					stroke: "currentColor",
					"stroke-width": "1.8",
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				})])])]),
				W("p", { class: "composer-hint" }, [K("Try a place, a mood, or a neighborhood."), W("span", null, "Enter to send · Shift + Enter for a new line")]),
				W("div", { class: "composer-options" }, [W("details", {
					id: "api-key-wrap",
					class: "option-panel",
					hidden: ""
				}, [
					W("summary", null, "Connect to this protected assistant"),
					W("label", { for: "api-key" }, "Backend access key"),
					W("input", {
						id: "api-key",
						type: "password",
						autocomplete: "off",
						placeholder: "Enter APP_API_KEY"
					}),
					W("p", null, "Stored only for this browser tab.")
				])])
			])])], -1)])]),
			n[9] ||= Mn("<button id=\"sidebar-toggle\" class=\"sidebar-toggle\" type=\"button\" aria-label=\"Open sidebar\" aria-expanded=\"false\" aria-controls=\"sidebar\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 7h16M4 12h16M4 17h16\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path></svg></button><div id=\"sidebar-backdrop\" class=\"sidebar-backdrop\" hidden></div><dialog id=\"map-dialog\" class=\"map-dialog\" aria-labelledby=\"dialog-title\"><div class=\"dialog-shell\"><header class=\"dialog-header\"><div class=\"dialog-place-summary\"><span class=\"dialog-pin\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z\" fill=\"currentColor\"></path><circle cx=\"12\" cy=\"10\" r=\"2.1\" fill=\"white\"></circle></svg></span><div><strong id=\"dialog-title\"></strong><span id=\"dialog-view-label\">Photos &amp; live map</span></div></div><div class=\"dialog-header-actions\"><a id=\"dialog-maps-link\" class=\"dialog-external\" target=\"_blank\" rel=\"noopener noreferrer\"> Open in Google Maps <svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></a><button id=\"dialog-close\" class=\"icon-button\" type=\"button\" aria-label=\"Close map\"><svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"m7 7 10 10M17 7 7 17\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path></svg></button></div></header><div class=\"map-dialog-content\"><section class=\"live-map-panel\" aria-label=\"Live Google map\"><div id=\"map-canvas\" aria-label=\"Interactive Google map\" hidden></div><iframe id=\"map-frame\" title=\"Google map for the selected place\" loading=\"eager\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe><div id=\"map-loading\" class=\"map-loading\" aria-live=\"polite\"><span class=\"map-loader\" aria-hidden=\"true\"></span><strong>Loading Google Maps</strong><span>Bringing the selected place into view…</span></div><div id=\"map-unavailable\" class=\"map-unavailable\" hidden><span class=\"dialog-pin\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z\" fill=\"currentColor\"></path><circle cx=\"12\" cy=\"10\" r=\"2.1\" fill=\"white\"></circle></svg></span><strong>Map preview unavailable</strong><p>You can still open this place safely in Google Maps.</p></div></section><aside class=\"place-details\"><p class=\"section-kicker\">Verified place details</p><h2 id=\"dialog-place-name\"></h2><p id=\"dialog-address\" class=\"dialog-address\"></p><div class=\"dialog-rating\"><span id=\"dialog-rating\"></span><span id=\"dialog-reviews\"></span></div><div class=\"gallery-panel\"><p class=\"section-kicker\">Photos</p><h3>Real photos from Google</h3><div id=\"dialog-photos\" class=\"photo-gallery\" aria-live=\"polite\"></div></div></aside></div></div></dialog>", 3)
		], 64));
	}
}).mount("#app");
//#endregion
