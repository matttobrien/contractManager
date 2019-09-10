const db = require('./dbController')
const fs = require('fs')
var connection = db.connect()
connection.connect()

module.exports = {
  getFiles (req, res) {
    let contractId = req.body.contractId
    connection.query(`select * from files where contractid = ${contractId}`, function(error, results, fields) {
      if (error) {
        throw error
      }
      res.send(results)
    })
  },
  getArchivedFiles (req, res) {
    let contractId = req.body.contractId
    connection.query(`select * from archivedfiles where contractid = ${contractId}`, function(error, results, fields) {
      if (error) {
        throw error
      }
      res.send(results)
    })
  },
  addToContract (req, res) {
    let contractId = req.body.contractId
    let files = req.body.files
    let user = req.body.user
    if (user.includes("'")) {
      let str = user.replace("'", "''")
      user = str
    }
    // if the length if > 1 then there is more than 1 file in the array
    if (files.length > 1) {
      for (let i in files) {
        connection.query(`insert into files (filename, uploadedby, date, contractid) values ('${files[i]}', '${user}', curdate(), ${contractId})`,
        function(error, results, fields) {
          if (error) {
            throw error
          }
        })
      }
    } else {
      connection.query(`insert into files (filename, uploadedby, date, contractid) values ('${files}', '${user}', curdate(), ${contractId})`,
      function(error, results, fields) {
        if (error) {
          throw error
        }
      })
    }
    connection.query(`update contracts set file = true where contractid = ${contractId}`, function (error, results, fields) {
      if (error) throw error
      res.status(200).send()
    })
  },
  deleteFiles (req, res) {
    connection.query(`delete from files where filename = '${req.body.file}'`, function(error, results, fields) {
      if (error) {
        throw error
      }
      fs.unlink(`./uploads/${req.body.file}`, (err) => {
        if (err) throw err
      })
      connection.query(`select * from files where contractid = ${req.body.contractId}`, function(error, results, fields) {
        if (error) {
          throw error
        }
        if (results == '') {
          connection.query(`update contracts set file = false where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) throw error
            res.status(200).send()
          })
        } else res.status(200).send()
      })
    })
  },
  deleteArchivedFiles (req, res) {
    connection.query(`delete from files where filename = '${req.body.file}'`, function(error, results, fields) {
      if (error) {
        throw error
      }
      fs.unlink(`./uploads/${req.body.file}`, (err) => {
        if (err) throw err
      })
      connection.query(`select * from files where contractid = ${req.body.contractId}`, function(error, results, fields) {
        if (error) {
          throw error
        }
        if (results == '') {
          connection.query(`update contracts set file = false where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) throw error
            res.status(200).send()
          })
        } else res.status(200).send()
      })
    })
  },
  editDescription (req, res) {
    connection.query(`update files set filedes = '${req.body.fileDes}' where filename = '${req.body.fileName}'`, function (error, results, fields) {
      if (error) {
        throw error
      }
      res.status(200).send()
    })
  }
}