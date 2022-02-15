import express from "express";
import mongodb from "mongodb";
import { MongoClient } from "mongodb";
import { engine } from "express-handlebars";
import { ObjectId } from "mongodb";
import { Express } from "express";

const client: MongoClient = new MongoClient(
    "mongodb://localhost:27017/?readPreference=primary"
);

const app: Express = express();

app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "main",
    })
);

app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    const books: Book[] = await getBooks();
    const loans: Loan[] = await getLoans();

    res.render("home", { books, loans });
});

app.get("/createbook", (req, res) => {
    res.render("createbook");
});

app.post("/createbook", async (req, res) => {
    const title: string = req.body.title;
    const pages: number = parseInt(req.body.pages);

    await client.connect();

    const db: mongodb.Db = await getDb();

    await db.collection("Books").insertOne({ title, pages });

    res.redirect("/");
});

app.get("/book/:id", async (req, res) => {
    const id: ObjectId = new ObjectId(req.params.id);

    await client.connect();

    const db: mongodb.Db = await getDb();

    db.collection("Books").findOne({ _id: id }, (err, book) => {
        res.render("singlebook", book);
    });
});

app.post("/deletebook/:id", async (req, res) => {
    const id: ObjectId = new ObjectId(req.params.id);

    await client.connect();

    const db: mongodb.Db = await getDb();

    await db.collection("Books").deleteOne({ _id: id });

    res.redirect("/");
});

app.get("/createloan", async (req, res) => {
    const books: Book[] = await getBooks();

    res.render("createloan", { books });
});

app.post("/createloan", async (req, res) => {
    const bookId: ObjectId = new ObjectId(req.body.book);
    const name: string = req.body.name;

    const db: mongodb.Db = await getDb();

    db.collection("Books").findOne({ _id: bookId }, async (err, book: Book) => {
        const loan: Loan = {
            _id: bookId,
            name: name,
            book: book,
        };

        await db.collection("Loans").insertOne(loan);

        res.redirect("/");
    });
});

app.get("/loan/:id", async (req, res) => {
    const id: ObjectId = new ObjectId(req.params.id);

    const db: mongodb.Db = await getDb();

    db.collection("Loans").findOne({ _id: id }, (err, loan: Loan) => {
        res.render("singleloan", loan);
    });
});

app.post("/deleteloan/:id", async (req, res) => {
    const id: ObjectId = new ObjectId(req.params.id);

    const db: mongodb.Db = await getDb();

    await db.collection("Loans").deleteOne({ _id: id });

    res.redirect("/");
});

app.listen(8000, () => {
    console.log("Live at http://localhost:8000");
});

async function getDb() {
    await client.connect();

    const db: mongodb.Db = client.db("books-loans");

    return db;
}

async function getBooks() {
    const db: mongodb.Db = await getDb();

    const dbBooks: mongodb.Document = db.collection("Books").find();

    const books: Book[] = [];

    await dbBooks.forEach((b) => {
        books.push(b);
    });
    return books;
}

async function getLoans() {
    const db: mongodb.Db = await getDb();

    const dbLoans: mongodb.Document = db.collection("Loans").find();

    const loans: Loan[] = [];

    await dbLoans.forEach((b) => {
        loans.push(b);
    });
    return loans;
}

interface Book {
    _id: ObjectId;
    title: string;
    pages: number;
}

interface Loan {
    _id: ObjectId;
    name: string;
    book: Book;
}
