const mysql = require('mysql')

// the credientials to access the database
module.exports = {
    connect () {
        var connection = mysql.createConnection({

        });
        return connection
    }
}
