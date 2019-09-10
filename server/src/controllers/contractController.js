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
  async getContracts (req, res) {
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
          var sql = 'select * from contracts where (' + conditions.company + ') and (' + conditions.department + ') order by expDate asc'
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
  },
  async getArchivedContracts (req, res) {
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
          var sql = 'select * from archives where (' + conditions.company + ') and (' + conditions.department + ')'
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
  },
  async editContracts (req, res) {
    try {
      let capexId = req.body.capexId
      if (capexId == '') {
        capexId = null
      }
      let notes = req.body.contractNotes
      let primaryContact = req.body.primaryContact
      let temp = req.body.cost
      temp = temp.replace(",", "")
      let cost  = parseFloat(temp)
      // if the name contains an ' it will throw an error
      if (notes.includes("'")) {
        str = displayName.replace("'", "''")
        notes = str
      }
      if (primaryContact.includes("'")) {
        str = primaryContact.replace("'", "''")
        primaryContact = str
      }
      connection.query(`select eventcolor from company where companyname = '${req.body.companyName}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        var color = results[0].eventcolor
        let sql = `update contracts set ponumber = '${req.body.poNumber}', contractdes = '${req.body.contractDes}', companyname = '${req.body.companyName}', 
        departmentname = '${req.body.departmentName}', vendorname = '${req.body.vendorName}', cost = ${cost}, expdate = '${req.body.expDate}', notes = '${notes}', 
        renewal = '${req.body.renewal}', capexid = ${capexId}, primarycontact = '${primaryContact}', currency = '${req.body.currency}', eventcolor = '${color}' 
        where contractid = ${req.body.contractId}`
        connection.query(sql, function (error, results, fields) {
          if (error) {
            throw error;
          }
          connection.query(`select paymentno from paymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let lastPayNo = results[results.length - 1].paymentno
            let sql = `update paymenthistory set price = ${cost}, renewaldate = '${req.body.expDate}', renewedby = '${primaryContact}', ponumber = '${req.body.poNumber}',
            capexid = ${capexId}, vendorname = '${req.body.vendorName}', currency = '${req.body.currency}' where contractid = ${req.body.contractId} and paymentno = ${lastPayNo}`
            connection.query(sql, function (error, results, fields) {
              if (error) {
                throw error
              }
              res.status(200).send()
            })
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to edit the contracts'
      })
    }
  },
  async archiveContract (req, res) {
    try {
      // ensure the contract data is removed from all foreign key constraints first
      var contractId = req.body.item.contractId
      connection.query(`insert into archives select * from contracts where contractid = ${contractId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        connection.query(`insert into archivedpaymenthistory select * from paymenthistory where contractid = ${contractId}`, function (error, results, fields) {
          if (error){
            throw error
          }
          connection.query(`delete from paymenthistory where contractid = ${contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            connection.query(`insert into archivedfiles select * from files where contractid = ${contractId}`, function (error, results, fields){
              if (error) {
                throw error
              }
              connection.query(`delete from files where contractid = ${contractId}`, function (error, results, fields) {
                if (error) {
                  throw error
                }
                connection.query(`delete from contracts where contractid = ${contractId}`, function (error, results, fields) {
                  if (error) {
                    throw error
                  }
                  res.status(200).send() 
                }) 
              })
            })
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to edit the contracts'
      })
    }
  },
  async unArchiveContract (req, res) {
    try {
      // re inject the contract data into the other tables
      var contractId = req.body.item.contractId
      connection.query(`insert into contracts select * from archives where contractid = ${contractId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        connection.query(`insert into paymenthistory select * from archivedpaymenthistory where contractid = ${contractId}`, function (error, results, feilds) {
          if (error) {
            throw error
          }
          connection.query(`delete from archivedpaymenthistory where contractid = ${contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            connection.query(`insert into files select * from archivedfiles where contractid = ${contractId}`, function (error, results, fields) {
              if (error) {
                throw error
              }
              connection.query(`delete from archivedfiles where contractid = ${contractId}`, function (error, results, fields) {
                if (error) {
                  throw error
                }
                connection.query(`delete from archives where contractid = ${contractId}`, function (error, results, feilds) {
                  if (error) {
                    throw error
                  }
                  res.status(200).send()
                })
              })
            })
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to un-archive the contract'
      })
    }
  },
  async deleteArchive (req, res) {
    try {
      let contractId = req.body.item.contractId
      connection.query(`insert into deletedpaymenthistory select * from archivedpaymenthistory where contractid = ${contractId}`, (error, results, fields) => {
        if (error) {
          throw error
        }
        connection.query(`delete from archivedpaymenthistory where contractid = ${contractId}`, function (error, results, fields) {
          if (error) {
            throw error
          }
          connection.query(`insert into deletedcontracts select * from archives where contractid = ${contractId}`, (error, results, fields) => {
            if (error) {
              throw error
            }
            connection.query(`delete from archives where contractid = ${contractId}`, function (error, results, fields) {
              if (error) {
                throw error
              }
              res.status(200).send()
            })
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to delete the contract'
      })
    }
  },
  async addContracts (req, res) {
    try {
      let capexId = req.body.capexId
      if (capexId == '') {
        capexId = null
      }
      connection.query(`select eventcolor from company where companyname = '${req.body.companyName}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        var color = results[0].eventcolor
        // these varibles hold all of the information to be inserted into the table
        var contract = {capexId: capexId, poNumber: `${req.body.poNumber}`, contractDes: `${req.body.contractDes}`, companyName: `${req.body.companyName}`, departmentName: `${req.body.departmentName}`, 
        vendorName: `${req.body.vendorName}`, cost: `${req.body.cost}`, currency: `${req.body.currency}`, expDate: `${req.body.expDate}`, notes: `${req.body.contractNotes}`, renewal: `${req.body.renewal}`, 
        primaryContact: `${req.body.primaryContact}`, eventColor: `${color}`, file: 0}
        connection.query('insert into contracts set ?', contract, function (error, results, fields) {
          if (error) {
            throw error
          }
          connection.query('select last_insert_id() as contractid', function (error, results, fields) {
            if (error) {
              throw error
            }
            var contractId = results[0].contractid
            var user = req.body.user
            if (user.includes("'")) {
              let str = user.replace("'", "''")
              user = str
            }
            connection.query(`insert into paymenthistory (contractid, price, renewaldate, renewedby, ponumber, capexid, vendorname, currency, paymentNo) values 
            (${contractId}, ${req.body.cost}, '${req.body.expDate}', '${user}', '${req.body.poNumber}', ${capexId}, '${req.body.vendorName}', '${req.body.currency}', 0)`, 
            function(error, results, fields) {
              if (error) {
                throw error
              }
              res.status(200).send()
            })
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to add a contract'
      })
    }
  },
  async getVendors (req, res) {
    try{
      connection.query('select vendorname from vendors', function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the vendors'
      })
    }
  },
  async getCurrency (req, res) {
    try{
      connection.query('select name from currency', function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the vendors'
      })
    }
  },
  async getExpContracts (req, res) {
    try {
      var temp = req.body.period.split(" ")
      var period = temp[0]
      let company = req.body.division
      if (company == null || company == 'All') {
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
            var sql = `select *, datediff(curdate(), expdate) as count from contracts where datediff(curdate(), expdate) > -${period} and ((` + conditions.company + ') and (' + conditions.department + '))' +
            'order by count desc'
            connection.query(sql, conditions.values, function (error, results, fields) {
              if (error) {
                throw error
              }
              res.send(results)
            })
          })
        })
      } else {
        connection.query(`select companyname from company where companyname = '${company}'`, function (error, results, fields) {
          if (error) {
            throw error
          }
          companyNames = results
          console.log(results)
          connection.query(`select departmentname from departments`, function (error, results, fields) {
            if (error) {
              throw error
            }
            departmentNames = results
            var conditions = buildQuery(req, companyNames, departmentNames)
            var sql = `select *, datediff(curdate(), expdate) as count from contracts where datediff(curdate(), expdate) > -${period} and ((` + conditions.company + ') and (' + conditions.department + '))' +
            'order by count desc'
            connection.query(sql, conditions.values, function (error, results, fields) {
              if (error) {
                throw error
              }
              res.send(results)
            })
          })
        })
      }
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the contracts'
      })
    }
  },
  async renewContracts (req, res) {
    try {
      // renew the contract based on its renewal value
      if (req.body.renewal == 'Annually'){
        let capexId = req.body.capexId
        let user = req.body.user
        if (capexId == '') {
          capexId = null
        }
        if (user.includes("'")) {
          let str = user.replace("'", "''")
          user = str
        }
        connection.query(`update contracts set capexid = ${capexId}, ponumber = '${req.body.poNumber}', cost = ${req.body.cost}, vendorname = '${req.body.vendorName}', expdate = date_add('${req.body.expDate}', interval 1 year), 
        currency = '${req.body.currency}', renewal = '${req.body.renewal}' where contractid = ${req.body.contractId}`, function (error, results, fields) {
          if (error) {
            throw error
          }
          connection.query(`select paymentno from paymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let lastPayNo = results[results.length - 1].paymentno
            connection.query(`insert into paymenthistory (contractid, price, renewaldate, renewedby, ponumber, capexid, vendorName, currency, paymentno) 
            values (${req.body.contractId}, ${req.body.cost}, date_add('${req.body.expDate}', interval 1 year), '${user}', '${req.body.poNumber}', ${capexId}, '${req.body.vendorName}', '${req.body.currency}', ${++lastPayNo})`, 
            function (error, results, fields) {
              if (error){
                throw error
              }
              res.status(200).send()
            })
          })
        })
      } else if (req.body.renewal == 'Monthly'){
        let capexId = req.body.capexId
        let user = req.body.user
        if (capexId == '') {
          capexId = null
        }
        if (user.includes("'")) {
          let str = user.replace("'", "''")
          user = str
        }
        connection.query(`update contracts set capexid = ${capexId}, ponumber = '${req.body.poNumber}', cost = ${req.body.cost}, vendorname = '${req.body.vendorName}', expdate = date_add('${req.body.expDate}', interval 1 month), 
        currency = '${req.body.currency}', renewal = '${req.body.renewal}' where contractid = ${req.body.contractId}`, function (error, results, fields) {
          if (error) {
            throw error
          }
          connection.query(`select paymentno from paymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let lastPayNo = results[results.length - 1].paymentno
            connection.query(`insert into paymenthistory (contractid, price, renewaldate, renewedby, ponumber, capexid, vendorName, currency, paymentno) 
            values (${req.body.contractId}, ${req.body.cost}, date_add('${req.body.expDate}', interval 1 month), '${user}', '${req.body.poNumber}', ${capexId}, '${req.body.vendorName}', '${req.body.currency}', ${++lastPayNo})`, 
            function (error, results, fields) {
              if (error){
                throw error
              }
              res.status(200).send()
            })
          })
        })
      } else if (req.body.renewal == '3 Year'){
        let capexId = req.body.capexId
        let user = req.body.user
        if (capexId == '') {
          capexId = null
        }
        if (user.includes("'")) {
          let str = user.replace("'", "''")
          user = str
        }
        connection.query(`update contracts set capexid = ${capexId}, ponumber = '${req.body.poNumber}', cost = ${req.body.cost}, vendorname = '${req.body.vendorName}', expdate = date_add('${req.body.expDate}', interval 3 year), 
        currency = '${req.body.currency}', renewal = '${req.body.renewal}' where contractid = ${req.body.contractId}`, function (error, results, fields) {
          if (error) {
            throw error
          }
          connection.query(`select paymentno from paymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let lastPayNo = results[results.length - 1].paymentno
            connection.query(`insert into paymenthistory (contractid, price, renewaldate, renewedby, ponumber, capexid, vendorName, currency, paymentno) 
            values (${req.body.contractId}, ${req.body.cost}, date_add('${req.body.expDate}', interval 3 year), '${user}', '${req.body.poNumber}', ${capexId}, '${req.body.vendorName}', '${req.body.currency}', ${++lastPayNo})`, 
            function (error, results, fields) {
              if (error){
                throw error
              }
              res.status(200).send()
            })
          })
        })
      } else {
        let capexId = req.body.capexId
        let user = req.body.user
        if (capexId == '') {
          capexId = null
        }
        if (user.includes("'")) {
          let str = user.replace("'", "''")
          user = str
        }
        connection.query(`update contracts set capexid = ${capexId}, ponumber = '${req.body.poNumber}', cost = ${req.body.cost}, vendorname = '${req.body.vendorName}', expdate = '${req.body.customDate}', 
        currency = '${req.body.currency}', renewal = '${req.body.renewal}' where contractid = ${req.body.contractId}`, function (error, results, fields) {
          if (error) {
            throw error
          }
          connection.query(`select paymentno from paymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let lastPayNo = results[results.length - 1].paymentno
            connection.query(`insert into paymenthistory (contractid, price, renewaldate, renewedby, ponumber, capexid, vendorName, currency, paymentno) 
            values (${req.body.contractId}, ${req.body.cost}, '${req.body.customDate}', '${user}', '${req.body.poNumber}', ${capexId}, '${req.body.vendorName}', '${req.body.currency}', ${++lastPayNo})`, 
            function (error, results, fields) {
              if (error){
                throw error
              }
              res.status(200).send()
            })
          })
        })
      }
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the vendors'
      })
    }
  },
  async getDepartments (req, res) {
    try {
      connection.query(`select departmentname from departments`, function (error, results, fields) {
        if (error) {
          throw error
        }
        departmentNames = results
        var conditions = buildQuery(req, null, departmentNames)
        var sql = 'select * from departments where ' + conditions.department
        connection.query(sql, conditions.values, function (error, results, fields) {
          if (error) {
            throw error
          }
          res.send(results)
        })
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the departments'
      })
    }
  },
  async getCompanys (req, res) {
    try {
      connection.query(`select companyname from company`, function (error, results, fields) {
        if (error) {
          throw error
        }
        companyNames = results
        var conditions = buildQuery(req, companyNames, null)
        var sql = 'select * from company where ' + conditions.company
        connection.query(sql, conditions.values, function (error, results, fields) {
          if (error) {
            throw error
          }
          res.send(results)
        })
      })
      
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the departments'
      })
    }
  },
  async getPaymentHistory (req, res) {
    try {
      connection.query(`select * from paymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the departments'
      })
    }
  },
  async getArchivedPaymentHistory (req, res) {
    try {
      connection.query(`select * from archivedpaymenthistory where contractid = ${req.body.contractId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the departments'
      })
    }
  },
  async getUsers (req, res) {
    try {
      connection.query('select * from users', function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the users'
      })
    }
  },
  async adminNotes (req, res) {
    try {
      connection.query(`update contracts set adminnotes = '${req.body.adminNotes}' where contractid = ${req.body.contractId}`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.status(200).send()
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the users'
      })
    }
  }
}