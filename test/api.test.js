const request = require("supertest");
require("dotenv").config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

describe("User Register API Tests", () => {

  // 1️⃣ Successful registration
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

  // 2️⃣ Missing fields
  it("should return 400 if required fields are missing", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/registerUser")
      .send({ email: "missingfields@gmail.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("please fill the fields");
  });

  // 3️⃣ Duplicate username
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

  // 4️⃣ Duplicate email
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

  // 5️⃣ Invalid email format (optional)
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
  // 1️⃣ Invalid password
  // Login API Edge Case Tests
it("should return 400 for incorrect password", async () => {
  // 1️⃣ create a valid user first
  const uniqueEmail = `loginuser_${Date.now()}@gmail.com`;
  const password = "correctpassword123";

  await request(BASE_URL).post("/api/user/registerUser").send({
    username: `loginuser_${Date.now()}`,
    email: uniqueEmail,
    password
  });

  // 2️⃣ try to login with wrong password
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

  // 2️⃣ Non-existent user
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

  // 3️⃣ Missing fields
  it("should return 400 if email or password is missing", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({
        email: "unique1772512186155@gmail.com",
        // password missing
      });

    expect(res.status).toBe(400); // Make sure your controller returns 400 for missing fields
  });

  // 4️⃣ Invalid email format
  it("should return 400 for invalid email format", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({
        email: "invalid-email",
        password: "securepassword123",
      });

    expect(res.status).toBe(400); // Ensure your controller validates email format
  });

  // 5️⃣ Empty request body
  it("should return 400 for empty request body", async () => {
    const res = await request(BASE_URL)
      .post("/api/user/loginUser")
      .send({}); // nothing sent

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe("please fill the fields"); // match your controller's response
  });
});



// describe("Booking API Tests", () => {

//   // 1️⃣ Get all bookings
//   it("should fetch all bookings", async () => {
//     const res = await request(BASE_URL).get("/api/booking/getAllBookings");
//     expect(res.status).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data).toBeDefined();
//   });

//   // 2️⃣ Get pending bookings
//   it("should fetch pending bookings", async () => {
//     const res = await request(BASE_URL).get("/api/booking/getPendingBookings");
//     expect(res.status).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data).toBeDefined();
//   });

//   // 3️⃣ Create booking (user)
//   it("should create a new booking", async () => {
//     const res = await request(BASE_URL)
//       .post("/api/booking/createBooking")
//       .send({
//         customerName: `TestUser_${Date.now()}`,
//         email: `test_${Date.now()}@gmail.com`,
//         bookingDate: "2026-03-05",
//         timeSlot: "10:00"
//       });
//     expect(res.status).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data).toBeDefined();
//   });

//   // 4️⃣ Update booking status (admin)
//   it("should update booking status", async () => {
//     const res = await request(BASE_URL)
//       .put("/api/booking/updateBookingsStatus/1") // use an existing booking ID
//       .send({ status: "approved" });
//     expect([200, 404]).toContain(res.status); // 200 if exists, 404 if not
//   });

//   // 5️⃣ Delete booking (admin)
//   it("should delete a booking", async () => {
//     const res = await request(BASE_URL)
//       .delete("/api/booking/deleteBooking/1"); // use an existing booking ID
//     expect([200, 404]).toContain(res.status);
//   });
// });