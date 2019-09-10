import Api from '@/services/Api'

export default {
  login (credentials) {
    return Api().post('login', credentials)
  },
  logout () {
    return Api().post('logout')
  }
}
