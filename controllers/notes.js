const notesRouter = require("express").Router()
const Note = require("../models/note")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

const getTokenFrom = (req) => {
  const authorization = req.get("authorization")
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "")
  }
  return null
}

notesRouter.get("/", async (req, res) => {
  const notes = await Note.find({}).populate("user")
  res.json(notes)
})

notesRouter.get("/:id", async (req, res) => {
  const note = await Note.findById(req.params.id)
  if (note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})

notesRouter.post("/", async (req, res) => {
  const body = req.body
  // validate the token
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({
      error: "invalid token"
    })
  }

  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  res.status(201).json(savedNote)
})

notesRouter.put("/:id", async (req, res) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important || false
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, { new: true, runValidators: true, context: "query" })
  res.json(updatedNote)
})

notesRouter.delete("/:id", async (req, res) => {
  await Note.findByIdAndRemove(req.params.id)
  res.status(204).end()
})

module.exports = notesRouter
