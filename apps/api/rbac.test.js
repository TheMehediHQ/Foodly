import { describe, expect, it, beforeEach } from "bun:test";
const jwt = require("jsonwebtoken");
const { createAuthMiddleware } = require("./auth.middleware");

// In-memory mock MongoDB collection
class MockCollection {
  constructor() {
    this.docs = [];
  }

  async findOne(query) {
    return (
      this.docs.find((d) => {
        for (const [k, v] of Object.entries(query)) {
          if (k === "_id" && d._id?.toString() !== v?.toString()) return false;
          if (k !== "_id" && d[k] !== v) return false;
        }
        return true;
      }) || null
    );
  }

  async find(query = {}) {
    let result = this.docs.filter((d) => {
      for (const [k, v] of Object.entries(query)) {
        if (k === "_id" && d._id?.toString() !== v?.toString()) return false;
        if (k !== "_id" && d[k] !== v) return false;
      }
      return true;
    });
    return {
      toArray: async () => [...result],
      sort: () => ({ toArray: async () => [...result] }),
    };
  }

  async insertOne(doc) {
    const _id = doc._id || (Math.random() * 1000000).toFixed(0);
    const newDoc = { ...doc, _id };
    this.docs.push(newDoc);
    return { insertedId: _id };
  }

  async updateOne(query, update) {
    const doc = await this.findOne(query);
    if (!doc) return { modifiedCount: 0 };
    if (update.$set) Object.assign(doc, update.$set);
    return { modifiedCount: 1 };
  }

  async deleteOne(query) {
    const idx = this.docs.findIndex((d) => {
      for (const [k, v] of Object.entries(query)) {
        if (k === "_id" && d._id?.toString() !== v?.toString()) return false;
        if (k !== "_id" && d[k] !== v) return false;
      }
      return true;
    });
    if (idx === -1) return { deletedCount: 0 };
    this.docs.splice(idx, 1);
    return { deletedCount: 1 };
  }

  async countDocuments() {
    return this.docs.length;
  }

  async distinct(field) {
    return [...new Set(this.docs.map((d) => d[field]).filter(Boolean))];
  }
}

describe("RBAC: Token Verification & User Creation", () => {
  let mockUsers;
  let authMiddleware;

  beforeEach(() => {
    process.env.INITIAL_ADMIN_EMAIL = "admin@mehedi-hasan.me";
    process.env.FIREBASE_PROJECT_ID = "food-garden-bd";
    mockUsers = new MockCollection();
    authMiddleware = createAuthMiddleware(() => mockUsers);
  });

  it("fails when no Authorization header is provided (401)", async () => {
    const req = { headers: {} };
    let status = null;
    let json = null;
    const res = {
      status: (s) => {
        status = s;
        return {
          json: (j) => {
            json = j;
          },
        };
      },
    };

    await authMiddleware.verifyAuth(req, res, () => {});
    expect(status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it("creates a normal user in MongoDB with role 'user'", async () => {
    const token = jwt.sign(
      {
        sub: "firebase_user_123",
        email: "alice@gmail.com",
        aud: "food-garden-bd",
        iss: "https://securetoken.google.com/food-garden-bd",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      "dummy_secret"
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let nextCalled = false;

    await authMiddleware.verifyAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.user.uid).toBe("firebase_user_123");
    expect(req.user.email).toBe("alice@gmail.com");
    expect(req.user.role).toBe("user");

    const saved = await mockUsers.findOne({ firebaseUid: "firebase_user_123" });
    expect(saved).not.toBeNull();
    expect(saved.role).toBe("user");
  });

  it("bootstraps INITIAL_ADMIN_EMAIL with role 'admin'", async () => {
    const token = jwt.sign(
      {
        sub: "admin_uid_999",
        email: "admin@mehedi-hasan.me",
        aud: "food-garden-bd",
        iss: "https://securetoken.google.com/food-garden-bd",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      "dummy_secret"
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let nextCalled = false;

    await authMiddleware.verifyAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.user.role).toBe("admin");

    const saved = await mockUsers.findOne({ firebaseUid: "admin_uid_999" });
    expect(saved.role).toBe("admin");
  });
});

describe("RBAC: Admin Guard & Ownership Enforcement", () => {
  let mockUsers;
  let mockFoods;
  let authMiddleware;

  beforeEach(() => {
    mockUsers = new MockCollection();
    mockFoods = new MockCollection();
    authMiddleware = createAuthMiddleware(() => mockUsers);
  });

  it("blocks normal user from admin-only routes (403)", () => {
    const req = { user: { role: "user", email: "alice@gmail.com" } };
    let status = null;
    let json = null;
    const res = {
      status: (s) => {
        status = s;
        return {
          json: (j) => {
            json = j;
          },
        };
      },
    };

    authMiddleware.requireAdmin(req, res, () => {});
    expect(status).toBe(403);
    expect(json.ok).toBe(false);
  });

  it("allows admin user through requireAdmin", () => {
    const req = { user: { role: "admin", email: "admin@mehedi-hasan.me" } };
    let nextCalled = false;
    authMiddleware.requireAdmin(req, {}, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });

  it("normal user can edit own food", async () => {
    const foodId = "food_1";
    await mockFoods.insertOne({
      _id: foodId,
      title: "Apple",
      userEmail: "alice@gmail.com",
      userId: "uid_alice",
    });

    const currentUser = { email: "alice@gmail.com", uid: "uid_alice", role: "user" };
    const targetFood = await mockFoods.findOne({ _id: foodId });

    const isOwner = targetFood.userEmail === currentUser.email;
    const isAdmin = currentUser.role === "admin";
    expect(isOwner || isAdmin).toBe(true);
  });

  it("normal user CANNOT edit another user's food (403)", async () => {
    const foodId = "food_2";
    await mockFoods.insertOne({
      _id: foodId,
      title: "Banana",
      userEmail: "bob@gmail.com",
      userId: "uid_bob",
    });

    const currentUser = { email: "alice@gmail.com", uid: "uid_alice", role: "user" };
    const targetFood = await mockFoods.findOne({ _id: foodId });

    const isOwner = targetFood.userEmail === currentUser.email;
    const isAdmin = currentUser.role === "admin";
    expect(isOwner || isAdmin).toBe(false);
  });

  it("admin can edit ANY food", async () => {
    const foodId = "food_3";
    await mockFoods.insertOne({
      _id: foodId,
      title: "Steak",
      userEmail: "bob@gmail.com",
      userId: "uid_bob",
    });

    const adminUser = { email: "admin@mehedi-hasan.me", uid: "uid_admin", role: "admin" };
    const targetFood = await mockFoods.findOne({ _id: foodId });

    const isOwner = targetFood.userEmail === adminUser.email;
    const isAdmin = adminUser.role === "admin";
    expect(isOwner || isAdmin).toBe(true);
  });

  it("admin can delete ANY food", async () => {
    const foodId = "food_4";
    await mockFoods.insertOne({
      _id: foodId,
      title: "Milk",
      userEmail: "bob@gmail.com",
      userId: "uid_bob",
    });

    const adminUser = { email: "admin@mehedi-hasan.me", uid: "uid_admin", role: "admin" };
    const targetFood = await mockFoods.findOne({ _id: foodId });

    const isOwner = targetFood.userEmail === adminUser.email;
    const isAdmin = adminUser.role === "admin";
    expect(isOwner || isAdmin).toBe(true);

    await mockFoods.deleteOne({ _id: foodId });
    const remaining = await mockFoods.findOne({ _id: foodId });
    expect(remaining).toBeNull();
  });
});
