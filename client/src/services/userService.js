import Api from '@/services/Api'

export default {
  getUsers (token) {
    return Api().post('users', token)
  },
  getUserPermissions (item) {
    return Api().post('userp', item)
  },
  editPermissions (data) {
    return Api().post('edituser', data)
  },
  deleteUser (user) {
    return Api().post('deleteuser', user)
  },
  deleteDivision (div) {
    return Api().post('deletediv', div)
  },
  deleteDepartment (dep) {
    return Api().post('deletedepartment', dep)
  },
  getDivisions (token) {
    return Api().post('divisions', token)
  },
  getDepartments (token) {
    return Api().post('departments', token)
  },
  addDivision (data) {
    return Api().post('adddivision', data)
  },
  addDepartment (data) {
    return Api().post('adddepartment', data)
  },
  editColor (data) {
    return Api().post('editcolor', data)
  },
  getPrimaryContacts (data) {
    return Api().post('primarycontacts', data)
  },
  getContracts (data) {
    return Api().post('usercontracts', data)
  },
  getCurrency (data) {
    return Api().post('getcurrency', data)
  },
  addCurrency (data) {
    return Api().post('addcurrency', data)
  },
  deleteCurrency (data) {
    return Api().post('deletecurrency', data)
  }
}
