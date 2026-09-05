const hex = (bytes) => Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
const digest = async (text) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
async function hashPassword(password, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name: "PBKDF2", hash: "SHA-256", iterations: 100000, salt: Uint8Array.from(salt.match(/../g), b => parseInt(b, 16))}, key, 256);
  return `${salt}:${hex(bits)}`;
}
export async function authenticate(request, env) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  if (!token) return null;
  const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?").bind(await digest(token), Math.floor(Date.now()/1000)).first();
  return session?.user_id || null;
}
export async function authRoute(request, env, path) {
  const json = (data, status = 200) => Response.json(data, {status, headers: {"cache-control": "no-store"}});
  const now = Math.floor(Date.now()/1000);
  if (request.method !== "POST") return json({detail: "Method not allowed"}, 405);
  if (path === "/api/auth/logout") {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(request.headers.get("authorization")?.replace(/^Bearer /, "") || "")).run();
    return json({message: "Logged out"});
  }
  if (!["/api/auth/login", "/api/auth/register"].includes(path)) return json({detail: "Not found"},404);
  const key = await digest(request.headers.get("cf-connecting-ip") || "local");
  await env.DB.prepare("INSERT INTO auth_attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END").bind(key,now+900,now,now).run();
  const attempts = await env.DB.prepare("SELECT count FROM auth_attempts WHERE key=?").bind(key).first();
  if (attempts.count > 20) return json({detail:"Too many attempts. Try again in 15 minutes."},429);
  let data;
  try { data = await request.json(); } catch { return json({detail:"Invalid JSON"},400); }
  const password = data?.password;
  if (typeof password !== "string" || !password.length || password.length>128) return json({detail:"Invalid password"},400);
  if (path.endsWith("register")) {
    const username = String(data.username || "").toLowerCase();
    const email = String(data.email || "").trim().toLowerCase();
    if (!/^[a-z0-9_]{3,32}$/.test(username) || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length<8) return json({detail:"Use a 3–32 character username, valid email, and password of at least 8 characters."},400);
    try {
      await env.DB.prepare("INSERT INTO users VALUES (?,?,?,?)").bind(crypto.randomUUID(),username,email,await hashPassword(password)).run();
    } catch (error) {
      if (!String(error).includes("UNIQUE")) throw error;
      return json({detail:"Username or email is already registered"},409);
    }
    return json({message:"Account created. Please log in."});
  }
  const identifier = String(data.identifier || "").trim().slice(0,254);
  const user = await env.DB.prepare("SELECT * FROM users WHERE username=? COLLATE NOCASE OR email=? COLLATE NOCASE").bind(identifier,identifier).first();
  const expected = user?.password_hash || `${"00".repeat(16)}:${"00".repeat(32)}`;
  const actual = await hashPassword(password, expected.split(":")[0]);
  let diff = actual.length ^ expected.length;
  for (let i=0;i<actual.length;i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff || !user) return json({detail:"Invalid username/email or password"},401);
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at<=?").bind(now),
    env.DB.prepare("INSERT INTO sessions VALUES (?,?,?)").bind(await digest(token),user.id,now+28800),
  ]);
  return json({token,username:user.username});
}
