import request from "supertest";
import waitOn from "wait-on";

const BASE = "http://localhost:4000";
let token;

beforeAll(async () => {
  await waitOn({ resources: [`${BASE}/health`], timeout: 20000 });
});

describe("Health check", () => {
  it("GET /health should return ok:true", async () => {
    const res = await request(BASE).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("Auth and Family flow", () => {
  const email = `ci${Date.now()}@test.com`;
  const password = "Pass123!";
  const fullName = "CI Bot";

  it("POST /auth/register → should register user", async () => {
    const res = await request(BASE)
      .post("/auth/register")
      .send({ fullName, email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("POST /auth/login → should login user", async () => {
    const res = await request(BASE)
      .post("/auth/login")
      .send({ email, password });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    expect(token).toBeTruthy();
  });

  it("POST /family/create → should create family for logged user", async () => {
    const res = await request(BASE)
      .post("/family/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ nickname: "TestFam" });
    expect(res.statusCode).toBe(200);
    expect(res.body.family).toBeDefined();
  });
});
