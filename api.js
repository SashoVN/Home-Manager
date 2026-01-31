const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

require("dotenv").config();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

const SECRET_KEY = "super_secret_key_123";
let tokenCheck = '';

app.use(express.json());
app.use(cors());


app.post('/user', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }

    const sql = "SELECT * FROM users WHERE username = ? AND password = ? AND valid_to = '0000-00-00'";
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        )

        tokenCheck = token;

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    });
});


app.get('/apartaments', (req, res) => {
    const sql = "SELECT * FROM apartaments WHERE valid_to = '0000-00-00' ORDER BY `apartaments`.`name` ASC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.status(200).json(results);
    })
});

function authMiddleware(req, res, next) {
    const token = req.headers['x-authorization'];

    if (!token) {
        return res.status(401).json({ message: "Missing token" });
    }

    jwt.verify(token, SECRET_KEY, (err, userData) => {
        if (err) {
            console.log("Invalid or expired token");
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = userData;
        next();
    });
}

app.post('/deleteAp', authMiddleware, (req, res) => {
    const { floor, number } = req.body;
    const date = new Date();

    if (!floor || !number) {
        return res.status(400).json({ message: 'Missing floor or number' });
    }

    const sql = `UPDATE apartaments SET valid_to = ? WHERE floor = ? AND number = ?`;
    db.query(sql, [date, floor, number], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: "Appartament delete successfully",
        });
    })
});

app.post('/addAp', authMiddleware, (req, res) => {
    const { name, floor, number, living, remaining, chip } = req.body;

    const sql = "INSERT INTO apartaments (name, floor, number, living, remaining, chip) VALUE (?, ?, ?, ? ,?, ?)"

    db.query(sql, [name, floor, number, living, remaining, chip], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.json({
            message: "Appartament added successfully",
        });
    });

});

app.post('/editAp', authMiddleware, (req, res) => {
    const date = new Date().toISOString().slice(0, 10);
    const { name, floor, number, living, remaining, chip, oldFloor, oldNumber, } = req.body;


    const sql = `UPDATE apartaments SET valid_to = ? WHERE floor = ? AND number = ?`;
    const sql1 = "INSERT INTO apartaments (name, floor, number, living, remaining, chip) VALUE (?, ?, ?, ? ,?, ?)"

    db.query(sql, [date, oldFloor, oldNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        db.query(sql1, [name, floor, number, living, remaining, chip], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }

            res.json({
                message: "Appartament added and edit successfully",
            });
        });
    });



});

app.get('/services', authMiddleware, (req, res) => {
    const sql = "SELECT * FROM service WHERE valid_to = '0000-00-00' ";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });

        res.status(200).json(results);
    })



});

app.post('/addServices', authMiddleware, (req, res) => {
    const { name, price, type, date } = req.body;

    const sql = 'INSERT INTO service (name, price, type, date) VALUE (?, ?, ?, ?)';

    db.query(sql, [name, price, type, date], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.json({
            message: "Service add successfully"
        });
    })
})

app.post('/deleteService', authMiddleware, (req, res) => {
    const { name, price } = req.body;

    const date = new Date();

    if (!name || !price) {
        return res.status(400).json({ message: 'Missing name or price' });
    }

    const sql = `UPDATE service SET valid_to = ? WHERE name = ? AND price = ?`;
    db.query(sql, [date, name, price], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: "Service delete successfully",
        });
    })
});

app.post('/editSer', authMiddleware, (req, res) => {
    const valid_to = new Date();
    const { name, price, type, date, oldName, oldPrice } = req.body;


    const sql = `UPDATE service SET valid_to = ? WHERE name = ? AND price = ?`;
    const sql1 = "INSERT INTO service (name, price, type, date) VALUE (?, ?, ?, ?)"

    db.query(sql, [valid_to, oldName, oldPrice], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        db.query(sql1, [name, price, type, date], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }

            res.json({
                message: "Service added and edit successfully",
            });
        });
    });



});

//TAXES
app.get('/payTaxes', authMiddleware, (req, res) => {
    const sql = "SELECT * FROM taxes WHERE pay = 1";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });

        res.status(200).json(results);
    })
});

app.post('/addAutoTax', authMiddleware, (req, res) => {
    const { apNum, month, year, price, date, pay, type } = req.body;

    const sql = 'INSERT INTO taxes (apNum, month, year, price, date, pay, type) VALUE (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [apNum, month, year, price, date, pay, type], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.json({
            message: "Auto taxes add successfully"
        });
    })
})

app.get('/servicesTypeOneTwo', authMiddleware, (req, res) => {
    const sql = "SELECT * FROM service WHERE valid_to = '0000-00-00' AND type > 0";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });

        res.status(200).json(results);
    })
});

app.post('/taxesForAp', authMiddleware, (req, res) => {
    const { apNum, typeFee } = req.body;

    if (!apNum) {
        return res.status(400).json({ message: 'Missing apart number' });
    }

    const sql = "SELECT * FROM taxes WHERE apNum = ? AND type = ?";
    db.query(sql, [apNum, typeFee], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        res.json(results)
    });
});

app.post('/addPayDoc', authMiddleware, (req, res) => {
    const { payer, apNum, price, date } = req.body

    const sql = 'INSERT INTO pay_doc (payer, apNum, price, date) VALUES(?, ?, ?, ?)'

    db.query(sql, [payer, apNum, price, date], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: 'Pay doc add successfully'
            // id: result.id
        })

    })
})


app.post('/taxPay', authMiddleware, (req, res) =>{
    const { payDate, doc_id } = req.body

    const sql = 'UPDATE taxes SET payDate = ? AND pay = 1 AND doc_id ?'; 

    db.query(sql, [payDate, doc_id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: 'Taxes update successfully',
        })
    })

})


app.listen(3000, () => {
    console.log("API is running on http://localhost:3000");
});