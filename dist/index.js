"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const express_handlebars_1 = require("express-handlebars");
const mongodb_2 = require("mongodb");
const client = new mongodb_1.MongoClient("mongodb://localhost:27017/?readPreference=primary");
const app = (0, express_1.default)();
app.engine("hbs", (0, express_handlebars_1.engine)({
    extname: ".hbs",
    defaultLayout: "main",
}));
app.set("view engine", "hbs");
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const books = yield getBooks();
    const loans = yield getLoans();
    res.render("home", { books, loans });
}));
app.get("/createbook", (req, res) => {
    res.render("createbook");
});
app.post("/createbook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const pages = parseInt(req.body.pages);
    yield client.connect();
    const db = yield getDb();
    yield db.collection("Books").insertOne({ title, pages });
    res.redirect("/");
}));
app.get("/book/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongodb_2.ObjectId(req.params.id);
    yield client.connect();
    const db = yield getDb();
    db.collection("Books").findOne({ _id: id }, (err, book) => {
        res.render("singlebook", book);
    });
}));
app.post("/deletebook/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongodb_2.ObjectId(req.params.id);
    yield client.connect();
    const db = yield getDb();
    yield db.collection("Books").deleteOne({ _id: id });
    res.redirect("/");
}));
app.get("/createloan", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const books = yield getBooks();
    res.render("createloan", { books });
}));
app.post("/createloan", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookId = new mongodb_2.ObjectId(req.body.book);
    const name = req.body.name;
    const db = yield getDb();
    db.collection("Books").findOne({ _id: bookId }, (err, book) => __awaiter(void 0, void 0, void 0, function* () {
        const loan = {
            _id: bookId,
            name: name,
            book: book,
        };
        yield db.collection("Loans").insertOne(loan);
        res.redirect("/");
    }));
}));
app.get("/loan/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongodb_2.ObjectId(req.params.id);
    const db = yield getDb();
    db.collection("Loans").findOne({ _id: id }, (err, loan) => {
        res.render("singleloan", loan);
    });
}));
app.post("/deleteloan/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongodb_2.ObjectId(req.params.id);
    const db = yield getDb();
    yield db.collection("Loans").deleteOne({ _id: id });
    res.redirect("/");
}));
app.listen(8000, () => {
    console.log("Live at http://localhost:8000");
});
function getDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        const db = client.db("books-loans");
        return db;
    });
}
function getBooks() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield getDb();
        const dbBooks = db.collection("Books").find();
        const books = [];
        yield dbBooks.forEach((b) => {
            books.push(b);
        });
        return books;
    });
}
function getLoans() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield getDb();
        const dbLoans = db.collection("Loans").find();
        const loans = [];
        yield dbLoans.forEach((b) => {
            loans.push(b);
        });
        return loans;
    });
}
