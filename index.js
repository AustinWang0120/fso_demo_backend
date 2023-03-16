require("dotenv").config()
const express = require("express")
const cors = require("cors")
const Note = require("./models/note")

// server setup
const app = express()

const requestLogger = (req, res, next) => {
  console.log("Method:", req.method)
  console.log("Path:  ", req.path)
  console.log("Body:  ", req.body)
  console.log("-------")
  next()
}

app.use(express.static("build"))
app.use(express.json())
app.use(requestLogger)
app.use(cors())

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>")
})

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes)
  })
})

app.get("/api/notes/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => (next(error)))
})

app.post("/api/notes", (req, res) => {
  const body = req.body

  if (body.content === undefined) {
    return res.status(400).json({
      error: "content missing"
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then((savedNote) => {
    res.json(savedNote)
  })
})

app.put("/api/notes/:id", (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then((updatedNote) => {
      res.json(updatedNote)
    })
    .catch((error) => (next(error)))
})

app.delete("/api/notes/:id", (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then((removedNote) => {
      res.status(204).end()
    })
    .catch((error) => (next(error)))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: "unknown endpoint"
  })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({
      error: "malformatted id"
    })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
