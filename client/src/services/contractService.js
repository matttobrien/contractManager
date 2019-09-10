import Api from '@/services/Api'

export default {
  getContracts (domain) {
    return Api().post('contracts', domain)
  },
  getArchivedContracts (domain) {
    return Api().post('archivedcontracts', domain)
  },
  editContracts (editedContract) {
    return Api().post('editcontracts', editedContract)
  },
  addContracts (newContract) {
    return Api().post('addcontracts', newContract)
  },
  getExpContracts (domain) {
    return Api().post('getexpcontracts', domain)
  },
  renewContracts (data) {
    return Api().post('renewcontracts', data)
  },
  getVendors (token) {
    return Api().post('getvendors', token)
  },
  getDepartments (token) {
    return Api().post('getdepartments', token)
  },
  getCompanys (token) {
    return Api().post('getcompanys', token)
  },
  getPaymentHistory (data) {
    return Api().post('paymenthistory', data)
  },
  getArchivedPaymentHistory (data) {
    return Api().post('archpaymenthistory', data)
  },
  archiveContract (contract) {
    return Api().post('archivecontract', contract)
  },
  unArchiveContract (contract) {
    return Api().post('unarchivecontract', contract)
  },
  deleteArchive (contract) {
    return Api().post('deletearchive', contract)
  },
  getCurrency (data) {
    return Api().post('getcurrencys', data)
  },
  getUsers (data) {
    return Api().post('getuserscontract', data)
  },
  adminNotes (data) {
    return Api().post('adminnotes', data)
  }
}
