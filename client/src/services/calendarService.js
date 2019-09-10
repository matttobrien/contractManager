import Api from '@/services/Api'

export default {
  getEvents (data) {
    return Api().post('calendar', data)
  },
  getLegend (data) {
    return Api().post('getlegend', data)
  },
  getContractInfo (data) {
    return Api().post('getcontractinfo', data)
  }
}
