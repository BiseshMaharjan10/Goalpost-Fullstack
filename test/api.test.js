const request = require("supertest");
require("dotenv").config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

const createAndLoginUser = async () => {
  const uniqueStamp = Date.now();
  const email = `booking_user_${uniqueStamp}@gmail.com`;
  const password = "securepassword123";

  const registerRes = await request(BASE_URL)
    .post("/api/user/registerUser")
    .send({
      username: `booking_user_${uniqueStamp}`,
      email,
      password,
    });

  expect(registerRes.status).toBe(201);

  const loginRes = await request(BASE_URL)
    .post("/api/user/loginUser")
    .send({ email, password });

  expect(loginRes.status).toBe(200);

  return {
    token: loginRes.body.token,
    email,
  };
};

describe("User Register API Tests", () => {

  // Successful registration
  it("should register a new user successfully", async () => {
    const uniqueName = `testuser_${Date.now()}`;
    const uniqueEmail = `register_${Date.now()}@gmail.com`;

    const res = await request(BASE_URL)
      .post("/api/user/registerUser")
      .send({
        username: uniqueName,
        email: uniqueEmail,
        password: "securepassword123"
      });

    console.log("STATUS:", res.status);
    console.log("BODY:", res.body);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("register successfully");
    expect(res.body.user.email).toBe(uniqueEmail);
  });

  //Missing fields
  it("should return 400 if required fields are missing", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/registerUser")
      .send({ email: "missingfields@gmail.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("please fill the fields");
  });

  // Duplicate username
  it("should return 400 if username already exists", async () => {
    const duplicateName = `dupuser_${Date.now()}`;
    const email1 = `dup_${Date.now()}@gmail.com`;

    await request(BASE_URL).post("/api/user/registerUser").send({
      username: duplicateName,
      email: email1,
      password: "securepassword123"
    });

    const res2 = await request(BASE_URL).post("/api/user/registerUser").send({
      username: duplicateName,
      email: `another_${Date.now()}@gmail.com`,
      password: "securepassword123"
    });

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain(`${duplicateName} already exists`);
  });

  // Duplicate email
  it("should return 400 if email already exists", async () => {
    const username1 = `user_${Date.now()}`;
    const duplicateEmail = `dupemail_${Date.now()}@gmail.com`;

    await request(BASE_URL).post("/api/user/registerUser").send({
      username: username1,
      email: duplicateEmail,
      password: "securepassword123"
    });

    const res2 = await request(BASE_URL).post("/api/user/registerUser").send({
      username: `user2_${Date.now()}`,
      email: duplicateEmail,
      password: "securepassword123"
    });

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain("already exists");
  });

  //  Invalid email format (optional)
  it("should return 400 if email format is invalid", async () => {
    const res = await request(BASE_URL).post("/api/user/registerUser").send({
      username: `invalid_${Date.now()}`,
      email: "invalid-email",
      password: "securepassword123"
    });

    expect(res.status).toBe(400);
  });
});

describe("Login API Edge Case Tests", () => {
  //  Invalid password
  // Login API Edge Case Tests
it("should return 400 for incorrect password", async () => {
  // create a valid user first
  const uniqueEmail = `loginuser_${Date.now()}@gmail.com`;
  const password = "correctpassword123";

  await request(BASE_URL).post("/api/user/registerUser").send({
    username: `loginuser_${Date.now()}`,
    email: uniqueEmail,
    password
  });

  // try to login with wrong password
  const res = await request(BASE_URL)
    .post("/api/user/loginUser")
    .send({
      email: uniqueEmail,
      password: "wrongpassword",
    });

  expect(res.status).toBe(400); // now it will hit invalid password branch
  expect(res.body.success).toBeFalsy();
  expect(res.body.message).toBe("Invalid email or password");
});



  //  Non-existent user
  it("should return 404 for non-existent email", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({
        email: `notfound_${Date.now()}@gmail.com`,
        password: "securepassword123",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe("User not found");
  });

  // Missing fields
  it("should return 400 if email or password is missing", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({
        email: "unique1772512186155@gmail.com",
        // password missing
      });

    expect(res.status).toBe(400); // Make sure your controller returns 400 for missing fields
  });

  // Invalid email format
  it("should return 400 for invalid email format", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({
        email: "invalid-email",
        password: "securepassword123",
      });

    expect(res.status).toBe(400); // Ensure your controller validates email format
  });

  // Empty request body
  it("should return 400 for empty request body", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({}); // nothing sent

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe("please fill the fields"); // match your controller's response
  });
});


describe("Booking API Tests", () => {
  it("should return 401 when creating booking without token", async () => {
    const res = await request(BASE_URL).post("/api/booking").send({
      customerName: "No Auth User",
      email: `noauth_${Date.now()}@gmail.com`,
      phoneNumber: "9800000000",
      bookingDate: "2026-03-20",
      timeSlot: "10:00 AM - 11:00 AM",
      notes: "Unauthorized booking",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Authorization token missing");
  });

  it("should return 401 when fetching my bookings without token", async () => {
    const res = await request(BASE_URL).get("/api/booking/my-bookings");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Authorization token missing");
  });

  it("should return 400 when required booking fields are missing", async () => {
    const { token } = await createAndLoginUser();

    const res = await request(BASE_URL)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: `missing_${Date.now()}@gmail.com`,
        phoneNumber: "9800000000",
        bookingDate: "2026-03-21",
        timeSlot: "11:00 AM - 12:00 PM",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Please provide all required fields");
  });

  it("should create booking successfully for authenticated user", async () => {
    const { token, email } = await createAndLoginUser();
    const uniqueSlot = `slot_${Date.now()}`;

    const res = await request(BASE_URL)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerName: "Booking Success User",
        email,
        phoneNumber: "9800000000",
        bookingDate: "2026-03-22",
        timeSlot: uniqueSlot,
        notes: "Test booking creation",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Booking created successfully. Waiting for approval.");
    expect(res.body.data.customerName).toBe("Booking Success User");
    expect(res.body.data.status).toBe("pending");
  });

  it("should return 400 when booking same time slot twice", async () => {
    const { token, email } = await createAndLoginUser();
    const duplicateSlot = `dup_slot_${Date.now()}`;
    const payload = {
      customerName: "Duplicate Slot User",
      email,
      phoneNumber: "9800000000",
      bookingDate: "2026-03-23",
      timeSlot: duplicateSlot,
      notes: "First booking",
    };

    const firstRes = await request(BASE_URL)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(firstRes.status).toBe(200);

    const secondRes = await request(BASE_URL)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(secondRes.status).toBe(400);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toBe("This time slot is already booked");
  });
});

