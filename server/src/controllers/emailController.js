const schedule = require('node-schedule')
const nodemailer = require("nodemailer")
const db = require('./dbController')
var connection = db.connect()
connection.connect()

const rule = new schedule.RecurrenceRule()
// dayOfWeek (0-6) Starting with Sunday
rule.dayOfWeek = [1]
rule.hour = 09
rule.minute = 00

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "mail.redoemold.com",
  port: 25,
  secure: false,
  tls: {rejectUnauthorized: false}
});

// dynamically builds the sql query based on user permissions
function buildQuery(sendTo, companyNames, departmentNames) {
  var company = []
  var department = []
  var values = []

  for (let i in companyNames) {
    if (sendTo[companyNames[i].companyname] == true) {
      company.push('companyname = ?')
      values.push(companyNames[i].companyname)
    }
  }

  for (let j in departmentNames) {
    if (sendTo[departmentNames[j].departmentname] == true) {
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

const sendEmail = schedule.scheduleJob(rule, () => {
  connection.query(`select userid, email, name from users`, function (error, results, fields) {
    if (error) {
      throw error
    }
    var userArr = results
    connection.query('select companyname, companyid from company', function (error, results, fields) {
      if (error) {
        throw error
      }
      var companyInfo = results
      connection.query('select departmentname, departmentid from departments', function (error, results, fields) {
        if (error) {
          throw error
        }
        var departmentInfo = results
        // send a persionalized email to each user, a user will only recived reminders about contracts they have access to
        for (let i in userArr) {
          let userId = userArr[i].userid
          let email = userArr[i].email
          let userName = userArr[i].name
          // grab the user's permissions and store them in the sendTo object
          connection.query(`select * from userpermissions where userid = ${userId}`, function (error, results, fields) {
            if (error) {
              throw error
            }
            let userInfo = results
            let sendTo = {}
            for (let i in userInfo) {
              for (let j in companyInfo) {
                for (let k in departmentInfo) {
                  if (userInfo[i].companyId == companyInfo[j].companyid){
                    sendTo[companyInfo[j].companyname] = true
                  }
                  if (userInfo[i].deppartmentId == departmentInfo[k].departmentid){
                    sendTo[departmentInfo[k].departmentname] = true
                  }
                }
              }
            }
            var conditions = buildQuery(sendTo, companyInfo, departmentInfo)
            console.log(conditions)
            var sql = `select * from contracts where datediff(curdate(), expdate) > -90 and ((`+ conditions.company + ') and (' + conditions.department + '))'
            connection.query(sql, conditions.values, function (error, results, fields) {
              if (error) {
                throw error
              }
              // if (results.length == 0) {
              //   return
              // }
              let str = '<table style="border-collapse: collapse;width: 100%;"><tr><td style="text-align:left;font-weight:600;">PO Number</td><td style="text-align:left;font-weight:600;">Description</td><td style="text-align:left;font-weight:600;">Company</td><td style="text-align:left;font-weight:600;">Department</td><td style="text-align:left;font-weight:600;">Vendor</td><td style="text-align:left;font-weight:600;">Cost</td><td style="text-align:left;font-weight:600;">Expiry Date</td></tr>'
              for (let i = 0; i < results.length; i++){
                str += `<tr><td style="text-align:left">${results[i].poNumber}</td><td style="text-align:left">${results[i].contractDes}</td><td style="text-align:left">${results[i].companyName}</td><td style="text-align:left">${results[i].departmentName}</td><td style="text-align:left">${results[i].vendorName}</td><td style="text-align:left">$${results[i].cost}</td><td style="text-align:left">${results[i].expDate}</td></tr>`
              }
              str += '</table>'
              console.log('sending..')
              // send the email
              let info = transporter.sendMail({
                from: '"Contract Manager" <contractmanager@pangeo.com>', // sender address
                to: email, // list of receivers
                subject: `Alert - ${userName} - Contract Expiry Upcoming`, // Subject line
                text: `${str}`, // plain text body
                html: `
              <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                  <head>
                    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
                    <!-- [ if !mso]> <!-->
                    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
                    <!-- <![endif] -->
                    <meta content="telephone=no" name="format-detection" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <title>Contract Manager</title>
                    <link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">
                    <script src='http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
                    <style type="text/css">
                      .ExternalClass {width: 100%;}
                      .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div, .ExternalClass b, .ExternalClass br, .ExternalClass img {line-height: 100% !important;}
                      /* iOS BLUE LINKS */
                      .appleBody a {color:#212121; text-decoration: none;}
                      .appleFooter a {color:#212121!important; text-decoration: none!important;}
                      /* END iOS BLUE LINKS */
                      img {color: #ffffff;text-align: center;font-family: Open Sans, Helvetica, Arial, sans-serif;display: block;}
                      body {margin: 0;padding: 0;-webkit-text-size-adjust: 100% !important;-ms-text-size-adjust: 100% !important;font-family: 'Open Sans', Helvetica, Arial, sans-serif!important;}
                      body,#body_style {background: #fffffe;}
                      table td {border-collapse: collapse;border-spacing: 0 !important;}
                      table tr {border-collapse: collapse;border-spacing: 0 !important;}
                      table tbody {border-collapse: collapse;border-spacing: 0 !important;}
                      table {border-collapse: collapse;border-spacing: 0 !important;}
                      span.yshortcuts,a span.yshortcuts {color: #000001;background-color: none;border: none;}
                      span.yshortcuts:hover,
                      span.yshortcuts:active,
                      span.yshortcuts:focus {color: #000001; background-color: none; border: none;}
                      img {-ms-interpolation-mode: : bicubic;}
                      a[x-apple-data-detectors] {color: inherit !important;text-decoration: none !important;font-size: inherit !important;font-family: inherit !important;font-weight: inherit !important;line-height: inherit !important;
                      }
                      /**** desktop styles ****/
                      @media only screen and (min-width: 600px) {
                        .noDesk {display: none !important;}
                        .td-padding {padding-left: 15px!important;padding-right: 15px!important;}
                        .padding-container {padding: 0px 15px 0px 15px!important;mso-padding-alt: 0px 15px 0px 15px!important;}
                        .mobile-column-left-padding { padding: 0px 0px 0px 0px!important; mso-alt-padding: 0px 0px 0px 0px!important; }
                        .mobile-column-right-padding { padding: 0px 0px 0px 0px!important; mso-alt-padding: 0px 0px 0px 0px!important; }
                        .mobile {display: none !important}
                      }
                      /**** mobile styles ****/
                      @media only screen and (max-width: 599px) and (-webkit-min-device-pixel-ratio: 1) {
                        *[class].wrapper { width:100% !important; }
                        *[class].container { width:100% !important; }
                        *[class].mobile { width:100% !important; display:block !important; }
                        *[class].image{ width:100% !important; height:auto; }
                        *[class].center{ margin:0 auto !important; text-align:left !important; }
                        *[class="mobileOff"] { width: 0px !important; display: none !important; }
                        *[class*="mobileOn"] { display: block !important; max-height:none !important; }
                        p[class="mobile-padding"] {padding-left: 0px!important;padding-top: 10px;}
                        .padding-container {padding: 0px 15px 0px 15px!important;mso-padding-alt: 0px 15px 0px 15px!important;}
                        .hund {width: 100% !important;height: auto !important;}
                        .td-padding {padding-left: 15px!important;padding-right: 15px!important;}
                        .mobile-column-left-padding { padding: 18px 0px 18px 0px!important; mso-alt-padding: 18px 0px 18px 0px!important; }
                        .mobile-column-right-padding { padding: 18px 0px 0px 0px!important; mso-alt-padding: 18px 0px 0px 0px!important; }
                        .stack { width: 100% !important; }
                        img {width: 100%!important;height: auto!important;}
                        *[class="hide"] {display: none !important}
                        *[class="Gmail"] {display: none !important}
                        .Gmail {display: none !important}
                        .bottom-padding-fix {padding: 0px 0px 18px 0px!important; mso-alt-padding: 0px 0px 18px 0px;}
                      }
                      .card-1 {
                        box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);
                        -webkit-box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);
                        -moz-box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);
                        transition: box-shadow .45s;
                      }
                      .card-1:hover {
                        box-shadow: 0 8px 17px 0 rgba(0,0,0,.2), 0 6px 20px 0 rgba(0,0,0,.19);
                        -webkit-box-shadow: 0 8px 17px 0 rgba(0,0,0,.2), 0 6px 20px 0 rgba(0,0,0,.19);
                        -moz-box-shadow: 0 8px 17px 0 rgba(0,0,0,.2), 0 6px 20px 0 rgba(0,0,0,.19);
                        transition: box-shadow .45s;
                      }
                    </style>

                  </head>
                  <body style="margin:0; padding:0; background-color: #dcdde1;" bgcolor="#dcdde1">
                    <!-- START EMAIL -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#dcdde1">
                      <div class="Gmail" style="height: 1px !important; margin-top: -1px !important; max-width: 600px !important; min-width: 600px !important; width: 600px !important;"></div>
                      <div style="display: none; max-height: 0px; overflow: hidden;">
                        There are Contracts that are Expiring Soon!
                      </div>
                      <!-- Insert &zwnj;&nbsp; hack after hidden preview text -->
                      <div style="display: none; max-height: 0px; overflow: hidden;">
                        &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>

                      <!-- START LOGO -->
                      <tr>
                        <td width="100%" valign="top" align="center" class="padding-container" style="padding: 18px 0px 18px 0px!important; mso-padding-alt: 18px 0px 18px 0px;">
                          <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="wrapper">
                            <tr>
                              <td align="center">
                                <table cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td width="100%" valign="top" align="center">
                                      <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="wrapper" bgcolor="#dcdde1">
                                        <tr>
                                          <td align="center">
                                            <table width="600" cellpadding="0" cellspacing="0" border="0" class="container" align="center">
                                              <!-- START HEADER IMAGE -->
                                              <tr>
                                                <td align="center" class="hund" width="600">
                                                  <h1>Contract Manager</h1>
                                                </td>
                                              </tr>
                                              <!-- END HEADER IMAGE -->
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- END LOGO -->

                      <!-- START CARD 1 -->
                      <tr>
                        <td width="100%" valign="top" align="center" class="padding-container" style="padding-top: 0px!important; padding-bottom: 18px!important; mso-padding-alt: 0px 0px 18px 0px;">
                          <table width="900" cellpadding="0" cellspacing="0" border="0" align="center" class="wrapper">
                            <tr>
                              <td>
                                <table cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="border-radius: 3px; border-bottom: 2px solid #d4d4d4;" class="card-1" width="100%" valign="top" align="center">
                                      <table style="border-radius: 3px;" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="wrapper" bgcolor="#ffffff">
                                        <tr>
                                          <td align="center">
                                            <table width="900" cellpadding="0" cellspacing="0" border="0" class="container">
                                              <!-- START BODY COPY -->
                                              <tr>
                                                <td class="td-padding" align="left" style="font-family: 'Roboto Mono', monospace; color: #212121!important; font-size: 24px; line-height: 30px; padding-top: 18px; padding-left: 18px!important; padding-right: 18px!important; padding-bottom: 0px!important; mso-line-height-rule: exactly; mso-padding-alt: 18px 18px 0px 13px;">
                                                  <h2>Contracts that Expire in Under 90 Days:</h2>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td class="td-padding" align="left" style="font-family: 'Roboto Mono', monospace; color: #212121!important; font-size: 16px; line-height: 24px; padding-top: 18px; padding-left: 18px!important; padding-right: 18px!important; padding-bottom: 0px!important; mso-line-height-rule: exactly; mso-padding-alt: 18px 18px 0px 18px;">
                                                  <br>
                                                  ${str}
                                                  <h4>Renew now on <a href="http://contracts.pangeo.com">Contract Manager</a>!</h4>
                                                  <br>
                                                </td>
                                              </tr>
                                              <!-- END BODY COPY -->
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- END CARD 1 -->

                      <!-- SPACER -->
                      <!--[if gte mso 9]>
                      <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                        <tr>
                          <td align="center" valign="top" width="600" height="18">
                            <![endif]-->
                            <tr><td height="12px"></td></tr>
                            <!--[if gte mso 9]>
                          </td>
                        </tr>
                      </table>
                      <![endif]-->
                      <!-- END SPACER -->

                      <!-- FOOTER -->
                      <tr>
                        <td width="100%" valign="top" align="center" class="padding-container">
                          <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="wrapper">
                            <tr>
                              <td width="100%" valign="top" align="center">
                                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="wrapper" bgcolor="#dcdde1">
                                  <tr>
                                    <td align="center">
                                      <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                                        <tr>
                                          <td class="td-padding" align="center" style="font-family: 'Roboto Mono', monospace; color: #212121!important; font-size: 16px; line-height: 24px; padding-top: 0px; padding-left: 0px!important; padding-right: 0px!important; padding-bottom: 0px!important; mso-line-height-rule: exactly; mso-padding-alt: 0px 0px 0px 0px;">
                                            &copy; 2019 Pangeo Group
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- FOOTER -->

                      <!-- SPACER -->
                      <!--[if gte mso 9]>
                      <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                        <tr>
                          <td align="center" valign="top" width="600" height="36">
                            <![endif]-->
                            <tr><td height="36px"></td></tr>
                            <!--[if gte mso 9]>
                          </td>
                        </tr>
                      </table>
                      <![endif]-->
                      <!-- END SPACER -->

                    </table>
                    <!-- END EMAIL -->
                    <div style="display:none; white-space:nowrap; font:15px courier; line-height:0;">
                      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    </div>
                  </body>
                </html>`   
              })
            })
          })
        }
      })
    })
  })
})