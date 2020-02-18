const express = require("express")
const app = express()
const path = require("path")
const DATA_PATH = "./notes.json"
const db = require("./db")
const bodyParser = require("body-parser")
const uuidv4 = require("uuid/v4")
const { Pool, Client } = require("pg")

db.sync().then(async () => {
  console.log("synched")
  await db.readArticles()
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`listening on port ${port}`))
