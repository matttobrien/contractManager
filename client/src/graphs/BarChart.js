import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    chartdata: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null,
      borderSkipped: 'bottom'
    }
    // height: 1500
  },
  mounted () {
    this.renderChart(this.chartdata, this.options)
  }
}
