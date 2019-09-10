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
  async getVendors (req, res) {
    try {
      connection.query('select * from vendors', function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the vendors'
      })
    }
  },
  async editVendors (req, res) {
    try {
      var contactName = req.body.contactName
      // if the name contains an ' it will throw an error
      if (contactName.includes("'")) {
        let str = contactName.replace("'", "''")
        contactName = str
      }
      connection.query(`update vendors set
      vendorname = '${req.body.vendorName}',
      contactname = '${contactName}',
      contactnum = '${req.body.contactNum}',
      contactemail = '${req.body.contactEmail}'
      where vendorid = '${req.body.vendorId}'`, 
      function (error, results, fields) {
        if (error) {
          throw error;
        }
        connection.query(`update contracts set vendorname = '${req.body.vendorName}'
        where vendorname = '${req.body.oldVendorName}'`,
        function (error, results, fields) {
          if (error) {
            throw error
          }
          res.status(200).send()
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to edit the vendors'
      })
    }
  },
  async addVendors (req, res) {
    try {
      var vendor = {vendorName: `${req.body.vendorName}`, contactName: `${req.body.contactName}`,
      contactEmail: `${req.body.contactEmail}`, contactNum: `${req.body.contactNum}`, vendorColor: `${req.body.color}`}
      connection.query('insert into vendors set ?', vendor, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.status(200).send()
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to add a vendor'
      })
    }
  },
  async deleteVendors (req, res) {
    try {
      var vendorId = req.body.vendor.vendorId
      connection.query(`delete from vendors where vendorid = ${vendorId}`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.status(200).send()
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to delete a vendor'
      })
    }
  },
  async getContracts (req, res) {
    try{
      let name = req.body.vendorName
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
          var sql = `select * from contracts where vendorname = '${name}' and ((` + conditions.company + ') and (' + conditions.department + '))'
          'group by monthname(expdate) order by month(expdate)'
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
        error: 'An error has occured trying to fetch the contracts'
      })
    }
  }
}