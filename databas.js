const mongodb = require("mongodb");
const express = require("express");
const exphbs = require("express-handlebars");

const client = new mongodb.MongoClient(
    "mongodb://localhost:27017/?readPreference=primary"
);

const app = express();

app.get("/", (req, res) => {
    res.send("Hello");
});

app.get("/addbook", async (req, res) => {
    const db = await getDb("books-loans");

    const newBook = await db
        .collection("Books")
        .findOne({ title: "Harry Potter" });

    const newLoans = {
        name: "Pelle",
        book: newBook,
    };

    await db.collection("Loans").insertOne(newLoans);

    console.log(newLoans);

    // res.sendStatus(201);
    res.redirect("/");
});

app.listen(8000, () => {
    console.log("Live");
});

async function getDb(dbName) {
    await client.connect();
    const db = await client.db(dbName);
    return db;
}
