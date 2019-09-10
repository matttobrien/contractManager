import Api from '@/services/Api'

export default {
  getFiles (data) {
    return Api().post('getfiles', data)
  },
  uploadFile (file) {
    return Api().post('uploadfile', file)
  },
  getArchivedFiles (data) {
    return Api().post('getarchfiles', data)
  },
  addToContract (data) {
    return Api().post('addtocontract', data)
  },
  deleteFiles (data) {
    return Api().post('deletefiles', data)
  },
  deleteArchivedFiles (data) {
    return Api().post('deletearchfiles', data)
  },
  editDescription (data) {
    return Api().post('editdescription', data)
  }
}
