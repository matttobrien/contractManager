const db = require('./dbController')
var connection = db.connect()
connection.connect()

module.exports = {
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
  async getUserPermissions (req, res) {
    try {
      let userId = req.body.userId
      connection.query(`select * from userpermissions where userid = ${userId}`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the users permissions'
      })
    }
  },
  async editUser (req, res) {
    try {
      connection.query(`update users set admin = ${req.body.editedUser.Admin}, active = ${req.body.editedUser.Active} where userid = ${req.body.userId}`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        connection.query(`select * from userpermissions where userid = ${req.body.userId}`, function (error, results, fields) {
          if (error) {
            throw error
          }
          let userInfo = results
          connection.query(`select * from company`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let companyNames = results
            connection.query(`select * from departments`, function (error, results, fields) {
              if (error) {
                throw error
              }
              // grab the new permissions for the user and store them in the Arrays
              let departmentNames = results
              let userId = req.body.userId
              let companyArr = []
              let departmentArr = []
              let compId = []
              let depId = []
              for (let x in companyNames) {
                let temp = companyNames[x].companyName
                companyArr.push(req.body.editedUser[`${temp}`])
                compId.push(companyNames[x].companyId)
              }
              for (let y in departmentNames) {
                let temp = departmentNames[y].departmentName
                departmentArr.push(req.body.editedUser[`${temp}`])
                depId.push(departmentNames[y].departmentId)
              }
              for (let i in companyArr) {
                for (let j in departmentArr) {
                  if (companyArr[i] == null || departmentArr[j] == null) {
                    continue
                  }
                  // edit the user permission table for each permission individually 
                  editPermissions(userInfo, userId, companyArr[i], compId[i], departmentArr[j], depId[j])
                }
              }
              res.status(200).send()
            })
          })
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to edit the users permissions'
      })
    }
  },
  async deleteUser (req, res) {
    try {
      connection.query(`delete from userpermissions where userid = ${req.body.item.userId}`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        connection.query(`delete from users where userid = ${req.body.item.userId}`, function (error, results, fields) {
          if (error) {
            throw error;
          }
          res.status(200).send()
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to delete the user'
      })
    }
  },
  async deleteDivision (req, res) {
    try {
      connection.query(`delete from userpermissions where companyid = ${req.body.item.companyId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        connection.query(`delete from company where companyid = ${req.body.item.companyId}`, function (error, results, fields) {
          if (error) {
            throw error;
          }
          res.status(200).send()
        })
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to delete the division'
      })
    }
  },
  async deleteDepartment (req, res) {
    try {
      connection.query(`delete from userpermissions where departmentid = ${req.body.item.departmentId}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        connection.query(`delete from departments where departmentid = ${req.body.item.departmentId}`, function (error, results, fields) {
          if (error) {
            throw error;
          }
          res.status(200).send()
        })
     })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to delete the division'
      })
    }
  },
  async deleteCurrency (req, res) {
    try {
      connection.query(`delete from currency where name = '${req.body.item.name}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.status(200).send()
     })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to delete the currency'
      })
    }
  },
  async getDivisions (req, res) {
    try {
      connection.query('select * from company', function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the divisions'
      })
    }
  },
  async getDepartments (req, res) {
    try {
      connection.query('select * from departments', function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the departments'
      })
    }
  },
  async addDivision (req, res) {
    try {
      connection.query(`insert into company (companyname, eventcolor) values ('${req.body.companyName}', '${req.body.color}')`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.status(200).send()
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to add a division'
      })
    }
  },
  async addDepartment (req, res) {
    try {
      connection.query(`insert into departments (departmentname) values ('${req.body.departmentName}')`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.status(200).send()
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to add a department'
      })
    }
  },
  async editColor (req, res) {
    try {
      connection.query(`update company set eventcolor = '${req.body.color}' where companyid = ${req.body.companyId}`, function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.status(200).send()
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to edit the color'
      })
    }
  },
  async getPrimaryContacts (req, res) {
    try {
      connection.query('select primarycontact as labels, count(*) as data from contracts group by labels', function (error, results, fields) {
        if (error) {
          throw error;
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to edit the color'
      })
    }
  },
  async getContracts (req, res) {
    try {
      var user = req.body.name
      // if the name contains an ' it will throw an error
      if (user.includes("'")) {
        let str = user.replace("'", "''")
        user = str
      }
      connection.query(`select * from contracts where primarycontact = '${user}'`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to edit the color'
      })
    }
  },
  async getCurrency (req, res) {
    try {
      connection.query(`select * from currency`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.send(results)
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to edit the color'
      })
    }
  },
  async addCurrency (req, res) {
    try {
      connection.query(`insert into currency (name) values ('${req.body.name}')`, function (error, results, fields) {
        if (error) {
          throw error
        }
        res.status(200).send()
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error has occured trying to edit the color'
      })
    }
  }
}

// function that edits the user permission table
function editPermissions (userInfo, userId, company, compId, department, depId) {
  // check if you are adding or deleting a company permission
  if (company) {
    let bool = false
    // check if the user already has permission to this company
    for (let i in userInfo) {
      if (userInfo[i].companyid == compId) {
        bool = true
      }
    }
    if (!bool) {
      // the user does not already have permission so give them permission
      if (department) {
        connection.query(`insert into userpermissions (userid, companyid, departmentid) values (${userId}, ${compId}, ${depId})`,
        function (error, results, fields) {
          if (error) {
            throw error
          }
        })
      }
    } else {
      let bool = false
      // check if the user already has permssion to this department
      for (let i in userInfo) {
        if (userInfo[i].departmentid == depId) {
          bool = true
        }
      }
      // if the user does not already have permission
      if (department && !bool) {
        connection.query(`insert into userpermissions (userid, companyid, departmentid) values (${userId}, ${compId}, ${depId})`,
        function (error, results, fields) {
          if (error) {
            throw error
          }
        })
        //if the user already has permission but it has been taken away
      } else if (!department && bool) {
        connection.query(`delete from userpermissions where userid = ${userId} and departmentid = ${depId}`,
        function (error, results, fields) {
          if (error) {
            throw error
          }
        })
      }
    }
  } else {
    let bool = false
    // if the user already has permission to the company
    for (let i in userInfo) {
      if (userInfo[i].companyid == compId) {
        bool = true
      }
    }
    // if they do, remove it
    if (bool) {
      connection.query(`delete from userpermissions where userid = ${userId} and companyid = ${compId}`,
      function (error, results, fields) {
        if (error) {
          throw error
        }
      })
    }
  }
}