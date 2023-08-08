const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = mysql.createConnection({
    database: process.env.DATABASE,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});

exports.register = (req, res) => {
    // console.log(req.body)
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    db.query(
        'SELECT email FROM accounts WHERE email = ?',
        email ,
        async(error, results) => {
            console.log(results);
            if (error) {
                console.log(error);
            } 
            if (results.length > 0) {
                res.render('register', { errorMsg: 'Email entered is already in use!', color: 'alert-danger' });
            } else if (confirmPassword !== password){
                res.render('register', { errorMsg: 'Password is not match'});
            }

            const hashPassword = await bcrypt.hash(password,8);
            //console.log(hashPassword);

            db.query(
                'INSERT INTO accounts SET ?',
                { first_name: firstName, last_name: lastName, email: email, password: hashPassword },
                (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(results);
                        res.render('register', { message: 'You are now registered!' })
                    }
                }
            )
        }
    )   
}

// Login Function

exports.login = (req, res) => {
    try {
        const {email, password} = req.body;

        if (email === "" || password === " " ) {
            res.render("index", {message: "Email and password should not be empty"} )
        } else {
            db.query (
                "SELECT * FROM accounts WHERE email = ?",
                email,
                async(error, result) => {
                    console.log(result);
                    if (!result.length > 0) {
                        res.render("index", {message: "The email does not exist!"})
                    } 
                    else if (!(await bcrypt.compare(password, result[0].password))) {
                        res.render("index", {message: "Password Incorrect!"})
                    }
                    else {
                        const account_id = result[0].account_id;
                        console.log(account_id);
                        const token = jwt.sign({account_id},process.env.JWTSECRET, {expiresIn: process.env.JWTEXPIRES});
                        console.log(token);
                        // const decoded = jwt.decode(token, {complete: true});
                        // console.log(decoded);
                        const cookieoptions = {expires: new Date(Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000),
                        httpOnly: true};
                        res.cookie('JWT',token, cookieoptions);
                        console.log(cookieoptions);

                        db.query (
                            "SELECT * FROM accounts",
                            (error, result) => {
                                console.log(result);
                                res.render("listaccounts", {title: "List of Users", accounts: result})
                            }
                        )
                        
                    }
                }
            )
        }
    } catch (error) {
        console.log(`Catched error ${error}`);
    }

};

//Population update function
exports.updateform = (req, res) => {
    const email = req.params.email;
    console.log(email);
    db.query (
        "SELECT * FROM accounts WHERE email = ?",
        email,
        (error, result) => {
            // console.log(result);
            res.render("updateform", {result: result[0]});
        }
    )

}

//Modifying update function
exports.updateuser = (req, res) => {
    const {firstName, lastName, email} = req.body;
    // console.log(email);
    if (firstName === "" || lastName === "") {
        res.render("updateform", {message: "First name and last name and email should not be empty", 
        data: {firstName: first_name, lastName: last_name}});
    } else {
        db.query (
            `UPDATE accounts SET first_name = "${firstName}", last_name = "${lastName}" WHERE email = "${email}"`,
            (error, result) => {
                if (error) {
                    console.log(error)
                }
                db.query (
                    "SELECT * FROM accounts",
                    (error, result) => {
                        console.log(result);
                        res.render("listaccounts", {title: "List of Users", accounts: result})
                    }
                )
            }
        )
    }
    

}

exports.deleteaccount = (req, res) => {
    
    const account_id = req.params.account_id;
   
        db.query (
            "DELETE FROM accounts WHERE account_id = ?",
            account_id,
            (error, result) => {
                
                if (error) {
                    console.log(error)
                }
                db.query (
                    "SELECT * FROM accounts",
                    (error, result) => {
                        res.render("listaccounts", {title: "List of Users", accounts: result})
                    }
                )
            }
        )
    

}

exports.logout = (req,res) => {
    // if (req.session) {
    //     req.session.destroy(error => {
    //         if (error) {
    //             res.status(400).send('Unadble to logout')
    //         } else {
    //             res.clear.cookie("JWT").status(200).json({message: "Logged out"})
    //             res.render("index")
    //         }
    //     })
    // } else {
    //     console.log("no session");
    //     res.end();
    // }
    res.clearCookie("JWT").status(200);
    res.render("index.hbs",{message: "Logged out"});
}

exports.skillset = (req, res) => {
    const account_id = req.params.account_id;
    console.log(account_id);
    db.query (
        "SELECT * FROM skillset WHERE account_id = ?",
        account_id,
        (error, rows) => {
            // console.log(result);
            res.render("skillset", {skillset: rows});
        }
    )

}