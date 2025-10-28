import request from "supertest";
import app from "../server.js";

let token;

describe("Health check", () => {
  it("GET /api/health should return ok:true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("Auth and Family flow", () => {
  const email = `ci${Date.now()}@test.com`;
  const password = "Pass123!";
  const fullName = "CI Bot";

  it("POST /api/auth/register → should register user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ fullName, email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("POST /api/auth/login → should login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    expect(token).toBeTruthy();
  });

  it("POST /api/family/create → should create family for logged user", async () => {
    const res = await request(app)
      .post("/api/family/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ nickname: "TestFam" });
    expect(res.statusCode).toBe(200);
    expect(res.body.family).toBeDefined();
  });
});
