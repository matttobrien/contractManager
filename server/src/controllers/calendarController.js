const db = require('./dbController')
var connection = db.connect()
connection.connect()

// dynamically builds the sql query based on user permissions
function buildQuery(req, companyNames, departmentNames) {
  var company = []
  var department = []
  var values = []

  for (let i in companyNames) {
    if (req.body[companyNames[i].companyname] == true) {
      company.push('companyname = ?')
      values.push(companyNames[i].companyname)
    }
  }

  for (let j in departmentNames) {
    if (req.body[departmentNames[j].departmentname] == true) {
      department.push('departmentname = ?')
      values.push(departmentNames[j].departmentname)
    }
  }
  
  return {
    company:
      company.length ?
      company.join(' or ') : '0',
    department: 
      department.length ?
      department.join(' or ') : '0',
    values: values
  }
}

module.exports = {
  async getEvents (req, res) {
    try {
      connection.query(`select companyname from company`, function (error, results, fields) {
        if (error) {
          throw error
        }
        companyNames = results
        connection.query(`select departmentname from departments`, function (error, results, fields) {
          if (error) {
            throw error
          }
          departmentNames = results
          var conditions = buildQuery(req, companyNames, departmentNames)
          var sql = 'select contractid, contractdes as title, expdate as start, eventcolor as color from contracts where (' + conditions.company + ') and (' + conditions.department + ')' 
          connection.query(sql, conditions.values, function (error, results, fields) {
            if (error) {
              throw error
            }
            res.send(results)
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the events'
      })
    }
  },
  async getLegend (req, res) {
    try {
      connection.query(`select companyname from company`, function (error, results, fields) {
        if (error) {
          throw error
        }
        companyNames = results
        var conditions = buildQuery(req, companyNames, null)
        var sql = 'select * from company where (' + conditions.company + ')'
        connection.query(sql, conditions.values, function (error, results, fields) {
          if (error) {
            throw error
          }
          res.send(results)
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the legend'
      })
    }
  },
  async getContractInfo (req, res) {
    try {
      connection.query(`select * from contracts where contractid = ${req.body.contractId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the legend'
      })
    }
  }
}