const activeDirectory = require('activedirectory')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const db = require('./dbController')
const connection = db.connect()
connection.connect()

// these are the congfigs that contain the login active directory
var redoeConfig = { 
    url: 'ldap://207.236.89.184',
    baseDN: 'dc=redoemold,dc=com',
    username: 'ldap',
    password: 'P@ssW0rd'
}
var redoe = new activeDirectory(redoeConfig)

var pangeoConfig = {
  url: 'ldap://10.50.0.234',
  baseDN: 'dc=pangeocorp,dc=local',
  username: 'ldap',
  password: 'P@ssW0rd'
}
var pangeo = new activeDirectory(pangeoConfig)

var porterConfig = {
  url: 'ldap://10.4.1.51',
  baseDN: 'dc=pgroup,dc=com',
  username: 'ldap',
  password: 'P@ssW0rd'
}
var porter = new activeDirectory(porterConfig)

// these functions sign the JWT with the secret
function jwtSignUser (user) {
  return jwt.sign(user, 'u9S:>xEJZkV_pw!a')
}

function jwtSignAdmin (user) {
  return jwt.sign(user, 'zHNM92}L.3*yNC2e')
}

module.exports = {
  login (req, res) {
    var email = req.body.email
    var password = req.body.password
    connection.query(`select name, domain from users where username = '${email}'`, function (error, results, fields) {
      if (error) {
        throw error
      }
      // user exists in the DB
      if (results != '') {
        let userName = results[0].name
        let domain = null
        let ad = null
        switch (results[0].domain) {
          case 'Redoe': {
            domain = 'redoemold.com'
            ad = redoe
            break
          } 
          case 'Pangeo': {
            domain = 'pangeocorp.local'
            ad = pangeo
            break
          } 
          case 'Porter': {
            domain = 'pgroup.com'
            ad = porter
            break
          }
        }
        ad.authenticate(`${email}@${domain}`, password, function(err, auth) {
          if (err) {
            console.log('ERROR: '+JSON.stringify(err))
            return res.status(403).send({
              error: 'Invalid Credientials'
            })
          }
          if (auth) {
            ad.findUser(`${email}@${domain}`, function(err, user) {
              if (err) {
                console.log('ERROR: ' + JSON.stringify(err))
                return;
              }
              // check to see if a user exists in the database
              connection.query(`select * from users where email = '${user.mail}'`, function (error, results, fields) {
                if (error) {
                  throw error
                }
                // get active and admin status of the user
                connection.query(`select userid, active, admin from users where email = '${user.mail}'`, function (error, results, fields) {
                  if (error) {
                    throw error
                  }
                  let admin = results[0].admin
                  if(results[0].active == false){
                    return res.status(403).send({
                      error: 'Account is Disabled'
                    })
                  } else {
                    // sign the users token
                    var token = jwtSignUser(userName)
                    var adminToken = null
                    if(admin){
                      // if the user has admin status give them an admin token
                      adminToken = jwtSignAdmin(domain)
                    }
                    // send the user information to the front end
                    res.send({
                      user: userName,
                      token: token,
                      admin: admin,
                      adminToken: adminToken
                    })
                  }
                }) 
              })
            })
          } else {
            console.log('Authentication failed!');
          }
        })
      } else {
        // user doesnt exist
        let domainArr = ['redoemold.com', 'pangeocorp.local', 'pgroup.com']
        let adArr = [redoe, pangeo, porter]
        let siteArr = ['Redoe', 'Pangeo', 'Porter']
        let authenticated = false
        for (let i in adArr) {
          if (authenticated) {
            break
          }
          else {
            adArr[i].authenticate(`${email}@${domainArr[i]}`, password, function(err, auth) {
              if (err) {
                return
              }
              if (auth) {
                authenticated = true
                console.log('Authenticated!');
                adArr[i].findUser(`${email}@${domainArr[i]}`, function(err, user) {
                  if (err) {
                    console.log('ERROR: ' + JSON.stringify(err))
                    return;
                  }
                  let displayName = user.displayName
                  // if the name contains an ' it will throw an error
                  if (user.displayName.includes("'")) {
                    str = displayName.replace("'", "''")
                    displayName = str
                  }
                  // check to see if a user exists in the database
                  connection.query(`select * from users where email = '${user.mail}'`, function (error, results, fields) {
                    if (error) {
                      throw error
                    }
                    // if results is empty then the user does not exist
                    if (results == '') {
                      // create the user in the DB
                      connection.query(`insert into users (name, username, email, domain, admin, active) values ('${displayName}',
                      '${user.sAMAccountName}', '${user.mail}','${siteArr[i]}', false, true)`, function (error, results, fields) {
                        if (error) {
                          throw error
                        }
                        connection.query(`select * from users where email = '${user.mail}'`, function (error, results, fields) {
                          if (error) {
                            throw error
                          }
                          let userId = results[0].userId
                          // give the user no permissions
                          connection.query(`insert into userpermissions (userid, companyid, departmentid) 
                          values (${userId}, null, null)`,
                          function (error, results, fields) {
                            if (error) {
                              throw error
                            }
                            console.log('new user created')
                          })
                        })
                      })
                    }
                    // get active and admin status of the user
                    connection.query(`select userid, active, admin from users where email = '${user.mail}'`, function (error, results, fields) {
                      if (error) {
                        throw error
                      }
                      let admin = results[0].admin
                      if(results[0].active == false){
                        return res.status(403).send({
                          error: 'Account is Disabled'
                        })
                      } else {
                        // sign the users token
                        var token = jwtSignUser(user.displayName)
                        var adminToken = null
                        if(admin){
                          // if the user has admin status give them an admin token
                          adminToken = jwtSignAdmin(domainArr[i])
                        }
                        // send the user information to the front end
                        res.send({
                          user: user.displayName,
                          token: token,
                          admin: admin,
                          adminToken: adminToken
                        })
                      }
                    }) 
                  })
                })
              } else {
                console.log('Authentication failed!');
              }
            })
          }
        }
        if (!authenticated) {
          return res.status(403).send({
            error: 'Invalid Credientials'
          })
        }
      }
    })
  }
}
