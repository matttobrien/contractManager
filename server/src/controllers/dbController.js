const mysql = require('mysql')

// the credientials to access the database
module.exports = {
    connect () {
        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'red0em0ld',
            database : 'contracts'
        });
        return connection
    }
}