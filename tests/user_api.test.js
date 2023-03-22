const mongoose = require("mongoose")
const supertest = require("supertest")
const bcrypt = require("bcrypt")
const User = require("../models/user")
const helper = require("./test_helper")
const app = require("../app")
const api = supertest(app)

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash("password", 10)
    const user = new User({ username: "root", passwordHash })
    await user.save()
  })

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: "yyaustin",
      name: "Austin Wang",
      password: "password"
    }
    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    const usernames = usersAtEnd.map((user) => (user.username))
    expect(usernames).toContain(newUser.username)
  })

  test("creation fails with proper status code and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: "root",
      name: "Superuser",
      password: "password"
    }
    const res = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)
    expect(res.body.error).toContain("expected `username` to be unique")
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(async () => {
  mongoose.connection.close()
})
