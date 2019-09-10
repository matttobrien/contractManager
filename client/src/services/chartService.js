import Api from '@/services/Api'

export default {
  getContractData (data) {
    return Api().post('contractchartdata', data)
  },
  getVendorData (data) {
    return Api().post('vendorchartdata', data)
  },
  getCompanyData (data) {
    return Api().post('companychartdata', data)
  },
  getExpData (data) {
    return Api().post('expchartdata', data)
  },
  getPaymentData (data) {
    return Api().post('paymentchartdata', data)
  },
  getArchPaymentData (data) {
    return Api().post('archpaymentchartdata', data)
  },
  getVendorColors (data) {
    return Api().post('vendorcolor', data)
  }
}
