import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: {
    chartdata: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null,
      borderSkipped: 'bottom',
      fill: false
    }
    // height: 1500
  },
  mounted () {
    this.renderChart(this.chartdata, this.options)
  }
}
