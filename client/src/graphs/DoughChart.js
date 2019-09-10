import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
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
