import Api from '@/services/Api'

export default {
  getVendors (token) {
    return Api().post('vendors', token)
  },
  getContracts (vendor) {
    return Api().post('getcontracts', vendor)
  },
  editVendors (editedVendor) {
    return Api().post('editvendors', editedVendor)
  },
  addVendors (newVendor) {
    return Api().post('addvendors', newVendor)
  },
  deleteVendors (vendor) {
    return Api().post('deletevendors', vendor)
  }
}
