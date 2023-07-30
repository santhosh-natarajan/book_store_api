const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.port || 5000;

//Middleware
app.use(bodyParser.json());

//Listen
app.listen(port, () => { console.log(`listning on ${port}`) });

//MySql
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'simple-book',
});

//Get all
app.get('/books', (req, res) => {
    pool.getConnection((err, connect) => {
        if (err) throw err;
        connect.query('SELECT * from books', (err, rows) => {
            connect.release();
            if (err) throw err;
            res.send(rows);
        })
    })
})

//Get by id
app.get('/books/:id', (req, res) => {
    pool.getConnection((err, connnection) => {
        if (!err) {
            connnection.query("SELECT * from books WHERE id=?", [req.params.id], (err, rows) => {
                connnection.release();
                if (err) throw err;
                res.send(rows);
            })
        } else {
            console.log("Err", err)
        }
    })
})


app.delete('/books/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        connection.query("DELETE from books WHERE id=?", [req.params.id], (err, rows) => {
            connection.release();
            if (err) throw err;
            res.send(`Books row deleted with id : ${req.params.id}`)
        })
    })
})

//Insert the record into the books table

app.post('/books/create', (req, res) => {
    console.log(`create req`, req.body);
    const bookData = req.body;
    const query = `INSERT INTO books (name, author, type, price, current_stock, available) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [bookData.name, bookData.author, bookData.type, bookData.price, bookData.current_stock, bookData.available];
    pool.getConnection((err, connection) => {
        if (!err) {
            connection.query(query, values, (err, rows) => {
                connection.release();
                if (!err) {
                    res.json({ message: "Record as created", id: rows.insertId });
                } else {
                    res.json({ error: err });
                }
            })
        } else {
            throw err;
        }
    })
});

//Update books record by id
app.put('/books/update/:id', (req, res) => {
    const bookUpdatedData = req.body;
    const query = `UPDATE books SET name = ?, author = ?, type = ?, price = ?, current_stock = ?, available = ? WHERE id = ?`;
    const values = [bookUpdatedData.name, bookUpdatedData.author, bookUpdatedData.type, bookUpdatedData.price, bookUpdatedData.current_stock, bookUpdatedData.available, req.params.id];
    pool.getConnection((err, connection) => {
        if (!err) {
            connection.query(query, values, (err, results) => {
                connection.release();
                if (!err) {
                    console.log("Results", results)
                    res.json({ message: "Record has been updated!", id: parseInt(req.params.id) })
                } else {
                    res.json({ error: err })
                }
            })
        } else {
            res.json({ error: err })
        }
    })
})