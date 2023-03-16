const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("please provide password")
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://yyaustin:${password}@cluster0.67lc8j3.mongodb.net/fso-demo?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model("Note", noteSchema)

// const note = new Note({
//   content: "GET and POST are the most important methods of HTTP protocol",
//   important: true
// })

Note.find({ important: true }).then((result) => {
  result.forEach((note) => {
    console.log(note)
  })
  mongoose.connection.close()
})
