const express = require('express');
var mysql = require('mysql');
var cors = require('cors')
const port = process.env.PORT || 3000;
var app = express();

var mysqlConnection = mysql.createConnection({
  host: "sql6.freemysqlhosting.net",
  user: "sql6418563",
  password: "iaQRShVh9g",
  database: "sql6418563",
  port: 3306
});

app.use(cors());
app.use(express.json());


app.get('/customers', function (req, res) {
    mysqlConnection.query('SELECT * from customers', (err, result) => {
        res.status(200).send({customers: result})
    })
});

app.get('/customers/:id', function (req, res) {
    mysqlConnection.query('SELECT * from customers WHERE id = ?', [req.params.id], (err, result) => {
        res.status(200).send({customer: result})
    })
});

app.post('/transfer', function (req, res) {
    const { fromid, toid, amount } = req.body;
    mysqlConnection.query('SELECT * from customers WHERE id = ?', [fromid], (err, result) => {
        if(result[0].amount >= amount) {
            mysqlConnection.query('UPDATE customers SET amount = amount - ? WHERE id = ?', [amount, fromid], (err, result) => {
                if(!err) {
                    mysqlConnection.query('UPDATE customers SET amount = amount + ? WHERE id = ?', [amount, toid], (err, result) => {
                        mysqlConnection.query('INSERT transaction_logs (from_id, to_id, amount) VALUES (?,?,?)', [fromid, toid, amount], (err, result) => {

                        });
                        res.status(200).send({error: false, message: 'Amount Transfered Successfully !'});
                    });
                }
            });
        }
        else {
            res.status(400).send({error: true, message: 'Your Bank balance amount is insufficient to transfer'});
        }
    })
});
app.listen(port, () => {
    mysqlConnection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
});