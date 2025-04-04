const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456789", 
    database: "blog_management"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: ", err);
        return;
    }
    console.log("Connected to MySQL");
});


const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


app.post("/blogs", upload.single("image"), (req, res) => {
    const { title, content, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const query = "INSERT INTO blogs (title, content, author, image) VALUES (?, ?, ?, ?)";
    db.query(query, [title, content, author, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Blog created", id: result.insertId, image });
    });
});


app.get("/blogs", (req, res) => {
    const query = "SELECT * FROM blogs";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});


app.get("/blogs/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM blogs WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(results[0]);
    });
});

app.put("/blogs/:id", upload.single("image"), (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const query = image 
        ? "UPDATE blogs SET title = ?, content = ?, author = ?, image = ? WHERE id = ?"
        : "UPDATE blogs SET title = ?, content = ?, author = ? WHERE id = ?";
    const values = image ? [title, content, author, image, id] : [title, content, author, id];
    
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Blog updated" });
    });
});


app.delete("/blogs/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM blogs WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Blog deleted" });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
