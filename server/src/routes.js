const authenticationController = require('./controllers/authenticationController')
const contractController = require('./controllers/contractController')
const calendarController = require('./controllers/calendarController')
const vendorController = require('./controllers/vendorController')
const chartController = require('./controllers/chartController')
const userController = require('./controllers/userController')
const fileController = require('./controllers/fileController')
const jwt = require("jsonwebtoken")
const db = require('./controllers/dbController')
const multer = require('multer')
var connection = db.connect()
// where the files will be stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
//   if (!allowedTypes.includes(file.mimetype)) {
//     const error = new Error('Incorrect File')
//     return cb(error, false)
//   }
//   cb(null, true)
// }
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 512000000
  }
})
connection.connect()

module.exports = (app) => {
  app.post('/login', authenticationController.login)

  app.post('/downloadfiles', (req, res) => {
    let fileName = req.body.fileName
    res.setHeader('File-Name', fileName)
    res.download(`./uploads/${fileName}`)
  })

  app.post('/uploadfile', upload.array('files', 12), (req, res) => {
    res.json({file: req.files})
  })

  // protected routes

  app.use(function(req, res, next) {
    // check post parameters for token
    let token = req.body.token
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, 'u9S:>xEJZkV_pw!a', function(err, decoded) {
        if (err) {
          return res.json({
            success: false,
            message: "Failed to authenticate token."
          })
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next()
        }
      })
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: "No token provided."
      })
    }
  })

  app.post('/editcontracts',
  contractController.editContracts)

  app.post('/addcontracts',
  contractController.addContracts)

  app.post('/renewcontracts',
  contractController.renewContracts)

  app.post('/vendors',
  vendorController.getVendors)

  app.post('/editvendors',
  vendorController.editVendors)

  app.post('/addvendors',
  vendorController.addVendors)

  app.post('/deletevendors',
  vendorController.deleteVendors)

  app.post('/getvendors',
  contractController.getVendors)

  app.post('/paymenthistory',
  contractController.getPaymentHistory)

  app.post('/archpaymenthistory',
  contractController.getArchivedPaymentHistory)

  app.post('/getcurrencys',
  contractController.getCurrency)

  app.post('/getuserscontract',
  contractController.getUsers)

  app.post('/adminnotes',
  contractController.adminNotes)

  app.post('/getfiles',
  fileController.getFiles)

  app.post('/getarchfiles',
  fileController.getArchivedFiles)

  app.post('/addtocontract',
  fileController.addToContract)

  app.post('/deletefiles',
  fileController.deleteFiles)

  app.post('/deletearchfiles',
  fileController.deleteArchivedFiles)

  app.post('/editdescription',
  fileController.editDescription)
  
  app.post('/paymentchartdata',
  chartController.getPaymentData)
  
  app.post('/archpaymentchartdata',
  chartController.getArchPaymentData)

  app.post('/vendorcolor',
  chartController.getVendorColor)

  app.post('/getcontractinfo',
  calendarController.getContractInfo)

  // routes that require user permissions

  // middleware to dynamically assign user permissions based on the user permissions table
  app.use( function(req, res, next) {
    var user = req.body.user
    if (user.includes("'")) {
      let str = user.replace("'", "''")
      user = str
    }
    connection.query(`select userid from users where name = '${user}'`, function (error, results, fields) {
      if (error) {
        throw error
      }
      connection.query(`select * from userpermissions where userid = ${results[0].userid}`, function (error, results, fields) {
        if (error) {
          throw error
        }
        var userInfo = results
        connection.query('select * from company', function (error, results, fields) {
          if (error) {
            throw error
          }
          var companyInfo = results
          connection.query('select * from departments', function (error, results, fields) {
            if (error) {
              throw error
            }
            var departmentInfo = results
            for (let i in userInfo) {
              for (let j in companyInfo) {
                // if the user has permssion to the company in question
                if (userInfo[i].companyid == companyInfo[j].companyId){
                  // assign that value to true
                  req.body[companyInfo[j].companyName] = true
                }
              }
              for (let k in departmentInfo) {
                // if the user has permssion to the department in question
                if (userInfo[i].departmentid == departmentInfo[k].departmentId){
                  // assign that value to true
                  req.body[departmentInfo[k].departmentName] = true
                }
              }
            }
            next()
          })
        })
      })
    })
  })

  app.post('/contracts',
  contractController.getContracts)

  app.post('/archivedcontracts',
  contractController.getArchivedContracts)

  app.post('/calendar',
  calendarController.getEvents)

  app.post('/getlegend',
  calendarController.getLegend)

  app.post('/getexpcontracts',
  contractController.getExpContracts)

  app.post('/getcontracts',
  vendorController.getContracts)

  app.post('/contractchartdata',
  chartController.getContractData)

  app.post('/vendorchartdata',
  chartController.getVendorData)

  app.post('/companychartdata',
  chartController.getCompanyData)

  app.post('/expchartdata',
  chartController.getExpData)

  app.post('/getdepartments',
  contractController.getDepartments)

  app.post('/getcompanys',
  contractController.getCompanys)

  app.post('/archivecontract',
  contractController.archiveContract)

  app.post('/unarchivecontract',
  contractController.unArchiveContract)

  app.post('/deletearchive',
  contractController.deleteArchive)

  // admin protected routes

  app.use(function(req, res, next) {
    // check post parameters for token
    let token = req.body.adminToken
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, 'zHNM92}L.3*yNC2e', function(err, decoded) {
        if (err) {
          return res.json({
            success: false,
            message: "Failed to authenticate token."
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: "No admin token provided."
      });
    }
  });

  app.post('/users',
  userController.getUsers)

  app.post('/userp',
  userController.getUserPermissions)

  app.post('/edituser',
  userController.editUser)

  app.post('/deleteuser',
  userController.deleteUser)

  app.post('/divisions',
  userController.getDivisions)

  app.post('/departments',
  userController.getDepartments)

  app.post('/adddivision',
  userController.addDivision)

  app.post('/adddepartment',
  userController.addDepartment)

  app.post('/deletediv',
  userController.deleteDivision)

  app.post('/deletedepartment',
  userController.deleteDepartment)

  app.post('/editcolor',
  userController.editColor)

  app.post('/primarycontacts',
  userController.getPrimaryContacts)

  app.post('/usercontracts',
  userController.getContracts)

  app.post('/getcurrency',
  userController.getCurrency)

  app.post('/addcurrency',
  userController.addCurrency)

  app.post('/deletecurrency',
  userController.deleteCurrency)
}