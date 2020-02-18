const { Pool, Client } = require("pg")
const uuidv4 = require("uuid/v4")

const client = new Client("postgres://localhost/author_nodepg_workshop")

client.connect()

const sync = async () => {
  const SQL = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  DROP TABLE IF EXISTS articles;
  DROP TABLE IF EXISTS authors;
  CREATE TABLE authors
  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR,
    last_name VARCHAR,
    date_created VARCHAR
  );

  CREATE TABLE articles
  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR,
    body VARCHAR,
    date_created VARCHAR,
    author_id UUID REFERENCES authors(id)
  );
  INSERT INTO authors (
    id, first_name, last_name
  ) VALUES (
    '${uuidv4()}', 'lucy', 'goosey'
   );

  `

  await client.query(SQL)
  const articles = await readArticles()
  const firstArticle = articles.find(article => article.title === "Article One")
  console.log(firstArticle)
  // firstArticle.title = "The first Article"
  const author = await createAuthor("Dr. Author", "butts")
}

////ARTICLES////

const readArticles = async () => {
  const SQL = `SELECT * FROM articles`
  const response = await client.query(SQL)
  console.log(response.rows)
  return response.rows
}

const readArticle = async id => {
  const SQL = `SELECT * FROM articles WHERE id=$1`
  const response = await client.query(SQL, [id])
  return response.rows[0]
}

const deleteArticle = async id => {
  const SQL = ` DELETE FROM articles WHERE id =$1`
  await client.query(SQL, [id])
}

const createArticle = async (first, last, title, body) => {
  const SQL = `INSERT INTO articles(author_id, title, body) values ( (SELECT id FROM authors WHERE (first_name = $3 AND last_name = $4)), $1, $2) returning *`

  //   ((SELECT author_id FROM authors WHERE (first_name = ${firstName} AND last_name = ${lastName})
  const response = await client.query(SQL, [title, body, first, last])
  return response.rows[0]
}

const updateArticle = async article => {
  const SQL = `UPDATE articles set title = $1 where id = $2 returning *`
  const response = await client.query(SQL, [article.title, article.id])
  return response.rows[0]
}

////AUTHORS////
const readAuthors = async () => {
  const SQL = `SELECT * FROM authors`
  const response = await client.query(SQL)
  return response.rows
}

const readAuthor = async id => {
  const SQL = `SELECT * FROM authors WHERE id=$1`
  const response = await client.query(SQL, [id])
  console.log(response.rows)
  return response.rows[0]
}

const deleteAuthor = async id => {
  const SQL = `DELETE FROM authors WHERE id =$1`
  await client.query(SQL, [id])
}

const createAuthor = async (firstName, lastName) => {
  const SQL = `INSERT INTO authors( first_name, last_name) values ($1, $2) returning *`
  const response = await client.query(SQL, [firstName, lastName])

  return response.rows[0]
}

const updateAuthor = async (firstName, lastName) => {
  const SQL = `INSERT INTO authors(id, first_name, last_name) values ($1, $2, $3) returning *`
  const response = await client.query(SQL, [uuidv4(), firstName, lastName])

  return response.rows[0]
}

sync()

module.exports = {
  sync,
  readArticle,
  readArticles,
  readAuthor,
  readAuthors,
  deleteArticle,
  updateArticle,
  createArticle,
  createAuthor,
  updateAuthor,
  deleteAuthor
}
