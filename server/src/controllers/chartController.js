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
  // number of contracts per month
  async getContractData (req, res) {
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
          var sql = 'select monthname(expdate) as labels, count(*) as data from contracts where (' 
          + conditions.company + ') and (' + conditions.department + ')' +
          'and (expdate > curdate() and expdate < date_add(curdate(), interval 6 month)) group by monthname(expdate) order by convert(expdate, DATE) asc'
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
        error: 'An error has occured trying to fetch the contract data'
      })
    }
  },
  // number of contracts per vendor
  async getVendorData (req, res) {
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
          var sql = 'select vendorname as labels, count(vendorname) as data, companyname, vendorname from contracts where (' + 
          conditions.company + ') and (' + conditions.department + ')' + 'group by vendorname order by data desc limit 5'
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
        error: 'An error has occured trying to fetch the vendor data'
      })
    }
  },
  // number of contracts per company
  async getCompanyData (req, res) {
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
          var sql = `select company.companyname as labels, ifnull(b.data, 0) as data 
          from company 
          right join (
          select contracts.companyname as labels, ifnull(count(*), 0) as data 
          from contracts 
          where (${conditions.company} and ${conditions.department})
          group by contracts.companyname) b 
          on (company.companyname = b.labels)`
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
        error: 'An error has occured trying to fetch the company data'
      })
    }
  },
  // number of soon to expire contracts per company
  async getExpData (req, res) {
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
          var sql = `select company.companyname as labels, ifnull(count(*), 0) as data
          from (( company
          right join (select contracts.companyname as labels, ifnull(count(*), 0) as data
          from contracts
          where datediff(curdate(), expDate)
          group by contracts.companyname) b on (company.companyname = b.labels))
          right join (select contracts.companyname as labels, ifnull(count(*), 0) as data
          from contracts
          where (${conditions.company} and ${conditions.department})
          group by contracts.companyname) c on (company.companyname = c.labels))`
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
        error: 'An error has occured trying to fetch the contract data'
      })
    }
  },
  // cost over time for contracts
  async getPaymentData (req, res) {
    try {
      let contractId = req.body.item.contractId
      connection.query(`select renewalDate as labels, price as data from paymenthistory where contractid = '${contractId}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the payment data'
      })
    }
  },
  async getArchPaymentData (req, res) {
    try {
      let contractId = req.body.item.contractId
      connection.query(`select renewalDate as labels, price as data from archivedpaymenthistory where contractid = '${contractId}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the payment data'
      })
    }
  },
  async getVendorColor (req, res) {
    try {
      connection.query(`select vendorColor from vendors where vendorName = '${req.body.vendor}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the payment data'
      })
    }
  }
}