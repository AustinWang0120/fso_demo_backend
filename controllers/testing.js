const testingRouter = require("express").Router()
const Note = require("../models/note")
const User = require("../models/user")

testingRouter.get("/", (req, res) => {
  res.send("<h1>Testing router is running, so you are in the testing mode</h1>")
})

testingRouter.post("/reset", async (req, res) => {
  await Note.deleteMany({})
  await User.deleteMany({})

  res.status(204).end()
})

module.exports = testingRouter
