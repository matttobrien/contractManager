import axios from 'axios'

// this is the url that the backend runs on
export default () => {
  return axios.create({
    baseURL: 'http://localhost:8081/'
  })
}
