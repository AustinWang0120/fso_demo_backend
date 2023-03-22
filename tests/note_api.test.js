const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./test_helper")
const app = require("../app")
const api = supertest(app)
const Note = require("../models/note")

// initialize the database
beforeEach(async () => {
  await Note.deleteMany({})
  
  const noteObjects = helper.initialNotes.map((note) => (new Note(note)))
  const promiseArray = noteObjects.map((note) => note.save())
  await Promise.all(promiseArray)
})

describe("when there is initially some notes saved", () => {
  test("notes are returned as json", async () => {
    await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/)
  })

  test("there are two notes", async () => {
    const res = await api.get("/api/notes")
    expect(res.body).toHaveLength(helper.initialNotes.length)
  })

  test("a specific note is within the returned notes", async () => {
    const res = await api.get("/api/notes")
    const contents = res.body.map((note) => (note.content))
    expect(contents).toContain("Browser can execute only JavaScript")
  })
})

describe("viewing a specific note", () => {
  test("a specific note can be viewed", async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/)
    expect(resultNote.body).toEqual(noteToView)
  })

  test("the first note is about HTML", async () => {
    const res = await api.get("/api/notes")
    expect(res.body[0].content).toBe("HTML is easy")
  })

  test("fails with status code 404 if note does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonExistingId}`)
      .expect(404)
  })
})

describe("addition of a new note", () => {
  test("a valid note can be added", async () => {
    const newNote = {
      content: "async/await simplifies making async calls",
      important: true
    }
    await api
      .post("/api/notes")
      .send(newNote)
      .expect(201)
      .expect("Content-Type", /application\/json/)
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
    const contents = notesAtEnd.map((note) => (note.content))
    expect(contents).toContain(newNote.content)
  })

  test("note without content is not added", async () => {
    const newNote = {
      important: true
    }
    await api
      .post("/api/notes")
      .send(newNote)
      .expect(400)
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})

describe("deletion of a note", () => {
  test("a note can be deleted", async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

    const contents = notesAtEnd.map((note) => (note.content))
    expect(contents).not.toContain(noteToDelete.content)
  })
})

// close the database
afterAll(async () => {
  await mongoose.connection.close()
})
