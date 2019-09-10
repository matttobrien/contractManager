<template>
  <v-container>
    <v-layout align-center justify-space-around row fill-height>
      <v-flex shrink>
        <div class="white elevation-3" id="container">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Home</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-layout row wrap justify-space-around>
              <v-flex xs12 lg4>
                <v-card>
                  <v-card-title class="justify-center" id="title">
                    <h2>Contracts Per Top 5 Vendors</h2>
                  </v-card-title>
                    <div class="container" id="chartContainer">
                      <dough-chart
                        id="charts"
                        v-if="vendorLoaded"
                        :chartdata="vendorChartData"
                        :options="pieOptions"
                      />
                    </div>
                  </v-card>
              </v-flex>
              <v-flex xs12 lg4>
                <v-card>
                  <v-card-title class="justify-center" id="title">
                    <h2>Contracts Per Next 6 Months</h2>
                  </v-card-title>
                    <div class="container" id="chartContainer">
                      <bar-chart
                        id="charts"
                        v-if="contractLoaded"
                        :chartdata="contractChartData"
                        :options="options"
                      />
                    </div>
                  </v-card>
              </v-flex>
              <v-flex xs12 lg4>
                <v-card>
                  <v-card-title class="justify-center" id="title">
                    <h2>Contracts Per Company</h2>
                  </v-card-title>
                  <div class="container" id="chartContainer">
                    <radar-chart
                      id="charts"
                      v-if="companyLoaded"
                      :chartdata="companyChartData"
                      :options="compOptions"
                    />
                  </div>
                </v-card>
              </v-flex>
              <v-flex xs12>
                <v-card>
                  <v-card-title>
                    <h2 id="exp">Soon to Expire Contracts</h2>
                    <v-spacer></v-spacer>
                    <v-select
                      :items="company"
                      v-model="division"
                      label="Division"
                      single-line
                      solo
                    ></v-select>
                    <v-select
                      :items="periods"
                      v-model="period"
                      label="Period"
                      single-line
                      solo
                    ></v-select>
                  </v-card-title>
                  <v-data-table
                    :headers="headers"
                    :items="contracts"
                    :total-items="totalContracts"
                    :loading="loading"
                    hide-actions
                    id="table"
                  >
                    <template v-slot:items="props">
                      <tr :class="props.item.color">
                        <!-- <td class="text-xs-center"><a @click="openCapex(props.item.capexId)">{{ props.item.capexId }}</a></td> -->
                        <td class="text-xs-center">{{ props.item.capexId }}</td>
                        <td class="text-xs-center">{{ props.item.poNumber }}</td>
                        <td class="text-xs-center">{{ props.item.companyName }}</td>
                        <td class="text-xs-center">{{ props.item.primaryContact }}</td>
                        <td class="text-xs-center">{{ props.item.departmentName }}</td>
                        <td class="text-xs-center">{{ props.item.vendorName }}</td>
                        <td class="text-xs-center">{{ props.item.renewal }}</td>
                        <td class="text-xs-center">{{ props.item.expDate }}</td>
                        <td class="text-xs-center">{{ props.item.count * -1 }}</td>
                        <td class="justify-center">
                          <v-btn
                            color="info"
                            small
                            @click="router(props.item)">
                            more info
                          </v-btn>
                          <v-btn
                            color="error"
                            small
                            @click="editItem(props.item)">
                            renew
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialog"
      width="500"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Renew Contract
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field v-model="editedItem.capexId" label="Capex ID" color="green darken-1"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field v-model="editedItem.poNumber" label="PO Number" color="green darken-1" :rules="[rules.required]"></v-text-field>
              </v-flex>
              <v-flex xs12 sm4>
                <v-select v-model="editedItem.vendorName"  label="Vendor" :items="vendors" color="green darken-1" :rules="[rules.required]"></v-select>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field v-model="editedItem.cost" label="Cost" color="green darken-1" :rules="[rules.required]"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6>
                <v-select v-model="editedItem.currency"  label="Currency" :items="currencys" color="green darken-1" :rules="[rules.required]"></v-select>
              </v-flex>
              <v-flex xs12>
                <v-select v-model="editedItem.renewal"  label="Renew" :items="renewal" color="green darken-1" :rules="[rules.required]"></v-select>
              </v-flex>
              <v-flex xs12 v-if="editedItem.renewal == 'Custom'">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="date"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="date"
                      color="green darken-1"
                      label="Exp Date"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="date" no-title scrollable dark color="green darken-1">
                    <v-spacer></v-spacer>
                    <v-btn flat color="green darken-1" @click="menu = false">Cancel</v-btn>
                    <v-btn flat color="green darken-1" @click="$refs.menu.save(date),
                    editedItem.expDate = date">OK</v-btn>
                  </v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
            <div class="err">
              <h4>{{err}}</h4>
            </div>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn
              color="grey darken-3"
              flat
              @click="close"
            >
              Cancel
            </v-btn>
            <v-btn
              color="grey darken-3"
              flat
              @click="save"
            >
              Renew
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import DoughChart from '@/graphs/DoughChart.js'
import BarChart from '@/graphs/BarChart.js'
import RadarChart from '@/graphs/RadarChart.js'
import ChartService from '@/services/chartService'
import ContractService from '@/services/contractService'
import RandomColor from 'randomcolor'
export default {
  components: { DoughChart, BarChart, RadarChart },
  data: () => ({
    date: new Date().toISOString().substr(0, 10),
    menu: false,
    contractLoaded: false,
    vendorLoaded: false,
    companyLoaded: false,
    loading: true,
    contractChartData: null,
    vendorChartData: null,
    companyChartData: null,
    dialog: false,
    totalContracts: 0,
    contracts: [],
    vendors: [],
    currencys: [],
    company: [],
    err: '',
    // the default period for the soon to expire table
    period: '90',
    division: null,
    periods: ['30 Days', '90 Days', '365 Days'],
    date: new Date().toISOString().substr(0, 10),
    rules: {
      required: value => !!value || 'Required.'
    },
    // the renewal option for contracts
    renewal: ['Monthly', 'Annually', '3 Year', 'Custom'],
    // the options for the Contract Per Month chart
    options: {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    },
    // the options for the Contract Per Company chart
    compOptions: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    },
    // the options for the Contract Per Vendor chart
    pieOptions: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            display: 0,
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: false
            }
          }
        ]
      }
    },
    // header for the soon to expire contracts table
    headers: [
      { text: 'Capex ID', value: 'capexId', align: 'center', sortable: false },
      { text: 'PO Number', value: 'name', align: 'center', sortable: false },
      { text: 'Company', value: 'companyName', align: 'center', sortable: false },
      { text: 'Primary Contact', value: 'primaryContact', align: 'center', sortable: false },
      { text: 'Department', value: 'departmentName', align: 'center', sortable: false },
      { text: 'Vendor', value: 'vendorName', align: 'center', sortable: false },
      { text: 'Renewal', value: 'renewal', align: 'center', sortable: false },
      { text: 'Exp Date', value: 'expDate', align: 'center', sortable: false },
      { text: 'Days Left', value: 'count', align: 'center', sortable: false },
      { text: 'Action', value: 'Action', align: 'center', sortable: false }
    ],
    editedIndex: -1,
    editedItem: {
      capexId: '',
      poNumber: '',
      cost: '',
      renewal: '',
      vendorName: '',
      currency: '',
      expDate: ''
    },
    defaultItem: {
      capexId: '',
      poNumber: '',
      cost: '',
      renewal: '',
      vendorName: '',
      currency: '',
      expDate: ''
    }
  }),
  created () {
    this.getContracts()
    this.getContractData()
    this.getVendorData()
    this.getCompanyData()
    this.getCurrency()
    this.getVendors()
    this.getCompanys()
  },
  watch: {
    period: function () {
      this.contracts = []
      this.getContracts()
    },
    division: function () {
      this.contracts = []
      this.getContracts()
    }
  },
  methods: {
    async getContracts () {
      this.loading = true
      try {
        // get the soon to exp contracts
        // const response = await ContractService.getExpContracts({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user,
        //   period: this.period,
        //   division: this.division
        // })
        // for (let i in response.data) {
        //   let rowColor = null
        //   if (response.data[i].count > -90) {
        //     rowColor = 'red lighten-2'
        //   } else if (response.data[i].count < -90 && response.data[i].count > -120) {
        //     rowColor = 'yellow lighten-2'
        //   } else {
        //     rowColor = 'green lighten-2'
        //   }
        // this.contracts.push({
        //   contractId: response.data[i].contractId,
        //   capexId: response.data[i].capexId,
        //   poNumber: response.data[i].poNumber,
        //   companyName: response.data[i].companyName,
        //   primaryContact: response.data[i].primaryContact,
        //   departmentName: response.data[i].departmentName,
        //   vendorName: response.data[i].vendorName,
        //   renewal: response.data[i].renewal,
        //   expDate: response.data[i].expDate,
        //   count: response.data[i].count,
        //   cost: response.data[i].cost,
        //   currency: response.data[i].currency,
        //   contractDes: response.data[i].contractDes,
        //   color: rowColor
        this.contracts = [
          {
            contractId: 1,
            capexId: 1,
            poNumber: 'PO123',
            companyName: 'U of W',
            primaryContact: 'Symere Woods',
            departmentName: 'IT',
            vendorName: 'Apple',
            renewal: 'Annually',
            expDate: '2019-09-28',
            count: -23,
            cost: 23.23,
            currency: 'CAD',
            contractDes: 'Test',
            color: 'red lighten-2'
          },
          {
            contractId: 2,
            capexId: 2,
            poNumber: 'PO321',
            companyName: 'U of W',
            primaryContact: 'John Doe',
            departmentName: 'IT',
            vendorName: 'Samsung',
            renewal: 'Annually',
            expDate: '2019-12-23',
            count: -96,
            cost: 56.34,
            currency: 'CAD',
            contractDes: 'Test',
            color: 'yellow lighten-2'
          },
          {
            contractId: 3,
            capexId: 3,
            poNumber: 'PO234',
            companyName: 'U of W',
            primaryContact: 'Bobby',
            departmentName: 'IT',
            vendorName: 'Razer',
            renewal: 'Annually',
            expDate: '2020-01-15',
            count: -243,
            cost: 1245.00,
            currency: 'CAD',
            contractDes: 'Test',
            color: 'green lighten-2'
          }
        ]
        // this.totalContracts = response.data.length
        setTimeout(() => {
          this.loading = false
        }, 1000)
      } catch (error) {
        this.error = error.response.data.error
        this.loading = false
      }
    },
    async getCurrency () {
      try {
        const response = await ContractService.getCurrency({
          token: this.$store.state.token
        })
        for (var i in response.data) {
          this.currencys.push(response.data[i].name)
        }
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getVendors () {
      this.loading = true
      try {
        // get the soon to exp contracts
        // const response = await ContractService.getVendors({
        //   token: this.$store.state.token
        // })
        // for (var i in response.data) {
        //   this.vendors.push(response.data[i].vendorname)
        // }
        this.vendors = [
          'Vendor'
        ]
        setTimeout(() => {
          this.loading = false
        }, 1000)
      } catch (error) {
        this.error = error.response.data.error
        this.loading = false
      }
    },
    async getCompanys () {
      try {
        // const response = await ContractService.getCompanys({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        // for (var i in response.data) {
        //   this.company.push(response.data[i].companyName)
        // }
        // this.company.push('All')
        this.company = [
          'Company'
        ]
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getContractData () {
      this.contractLoaded = false
      try {
        // get the data for the chart
        // const response = await ChartService.getContractData({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        let labelsArr = ['Apple', 'Samsung', 'Razer']
        let dataArr = [2, 4, 3]
        let colorArr = this.randomColors(3)
        // genetrates the random colors for the graph
        // let colorArr = this.randomColors(3)
        // for (let i in response.data) {
        //   labelsArr.push([response.data[i].labels])
        //   dataArr.push([response.data[i].data])
        // }
        this.contractChartData = {
          labels: labelsArr,
          datasets: [
            {
              label: ['Number of Contracts'],
              data: dataArr,
              backgroundColor: colorArr
            }
          ]
        }
        this.contractLoaded = true
      } catch (e) {
        console.error(e)
      }
    },
    async getVendorData () {
      this.vendorLoaded = false
      try {
        // get the data for the chart
        // const response = await ChartService.getVendorData({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        let labelsArr = ['Vendor1', 'Vendor2', 'Vendor3']
        let dataArr = [2, 3, 4]
        let colorArr = this.randomColors(3)
        // genetrates the random colors for the graph
        // let colorArr = this.randomColors(response.data.length)
        // for (let i in response.data) {
        //   labelsArr.push([response.data[i].labels])
        //   dataArr.push([response.data[i].data])
        //   let color = await ChartService.getVendorColors({
        //     token: this.$store.state.token,
        //     user: this.$store.state.user,
        //     vendor: response.data[i].labels
        //   })
        //   colorArr.push(color.data[0].vendorColor)
        // }
        this.vendorChartData = {
          labels: labelsArr,
          datasets: [
            {
              label: 'Contracts Per Vendor',
              data: dataArr,
              backgroundColor: colorArr
            }
          ]
        }
        this.vendorLoaded = true
      } catch (e) {
        console.error(e)
      }
    },
    async getCompanyData () {
      this.companyLoaded = false
      try {
        // get the company data for the chart
        // const company = await ChartService.getCompanyData({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        // // get the exp contract data for the chart
        // const exp = await ChartService.getExpData({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        let labelsArr = ['Company1', 'Company2', 'Company3']
        let compDataArr = [2, 3, 1]
        let expDataArr = [0, 1, 0]
        // for (let i in company.data) {
        //   labelsArr.push([company.data[i].labels])
        //   compDataArr.push([company.data[i].data])
        // }
        // for (let j in exp.data) {
        //   expDataArr.push([exp.data[j].data])
        // }
        this.companyChartData = {
          labels: labelsArr,
          datasets: [
            {
              label: 'Number of Contracts',
              data: compDataArr,
              backgroundColor: 'rgb(39, 60, 117)'
            },
            {
              label: 'Contracts that Expire in Under 90 days',
              data: expDataArr,
              backgroundColor: 'rgb(255, 0, 0)'
            }
          ]
        }
        this.companyLoaded = true
      } catch (e) {
        console.error(e)
      }
    },
    editItem (item) {
      this.editedIndex = this.contracts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    save () {
      this.editedItem.cost = (this.editedItem.cost).toString()
      if ((this.editedItem.cost).includes(',')) {
        this.err = 'Please remove comma(s) from the cost!'
        return
      }
      this.err = ''
      let contractId = this.contracts[this.editedIndex].contractId
      let expDate = this.contracts[this.editedIndex].expDate
      ContractService.renewContracts({
        token: this.$store.state.token,
        user: this.$store.state.user,
        contractId: contractId,
        capexId: this.editedItem.capexId,
        poNumber: this.editedItem.poNumber,
        renewal: this.editedItem.renewal,
        cost: parseFloat(this.editedItem.cost),
        currency: this.editedItem.currency,
        vendorName: this.editedItem.vendorName,
        customDate: this.editedItem.expDate,
        expDate: expDate
      })
      this.contracts = []
      this.getContracts()
      this.close()
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    // function that genrates the random color array
    randomColors (length) {
      var arr = []
      for (var i = 0; i < length; i++) {
        arr.push(RandomColor())
      }
      return arr
    },
    // openCapex (capexId) {
    //   window.open(``)
    // },
    router (contract) {
      this.$router.push({
        name: 'Contracts',
        params: {
          contractDes: contract.contractDes
        }
      })
    }
  }
}
</script>

<style scoped>
h2 {
  font-weight: normal;
}
.err {
  color: red;
}
#title {
  margin-bottom: -5%;
}
#exp {
  margin-top: -3%;
}
#table {
  margin-top: -3%;
  margin-bottom: 1%;
}
#btn {
  margin-bottom: 5%;
}
#space {
  margin-top: 2%;
  margin-bottom: 2%;
}
#charts {
  margin-bottom: 5px;
}
#chartContainer {
  margin-bottom: 2%;
}
</style>
