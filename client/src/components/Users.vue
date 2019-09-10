<template>
  <v-container>
    <v-layout align-center justify-space-around row fill-height>
      <v-flex>
        <div class="white elevation-3" id="container">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Admin Menu</v-toolbar-title>
          </v-toolbar>
          <v-layout row wrap justify-space-around>
            <v-flex xs6>
              <v-card id="table">
                <v-card-title class="justify-center" id="title">
                    <h2>Primary Contacts</h2>
                </v-card-title>
                <div class="pl-4 pr-4 pt-2 pb-2">
                  <v-data-table
                    :headers="primaryHeaders"
                    :items="primaryContacts"
                    :loading="loading"
                    id="table"
                  >
                    <template v-slot:items="props">
                      <td class="text-xs-center">{{ props.item.labels }}</td>
                      <td class="text-xs-center">{{ props.item.data }}</td>
                      <td class="text-xs-center">
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-icon
                              small
                              class="mr-2"
                              v-on="on"
                              @click="getContracts(props.item.labels)"
                              >
                              notes
                            </v-icon>
                          </template>
                          <span>View Active Contracts</span>
                        </v-tooltip>
                      </td>
                    </template>
                  </v-data-table>
                </div>
              </v-card>
            </v-flex>
            <v-flex xs6>
                <v-card>
                  <v-card-title class="justify-center" id="title">
                    <h2>Contracts Per Primary Contact</h2>
                  </v-card-title>
                    <div class="container" id="chartContainer">
                      <pie-chart
                        id="charts"
                        v-if="loaded"
                        :chartdata="chartData"
                        :options="options"
                      />
                    </div>
                  </v-card>
              </v-flex>
          </v-layout>
        </div>
        <div class="white elevation-3" id="container">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Users</v-toolbar-title>
          </v-toolbar>
          <v-dialog
            v-model="dialog"
            width="500"
          >
            <template v-slot:activator="{ on }">
            </template>
            <v-card>
              <v-card-title
                class="headline grey darken-3 white--text"
                primary-title
              >
                Edit {{selectedName}}'s Permissions
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-flex xs12>
                      <h3>User Options</h3>
                    </v-flex>
                    <v-flex xs12 md4 v-for="(checkbox, index) in checkboxes"
                      v-bind:key="index">
                      <v-checkbox
                        v-model="checkbox.model"
                        :label="checkbox.name"
                      ></v-checkbox>
                    </v-flex>
                    <v-flex xs12>
                      <h3>Company</h3>
                    </v-flex>
                    <v-flex xs12 md4 v-for="(checkbox, index) in companyCheckboxes"
                      v-bind:key="index + 'i'">
                      <v-checkbox
                        v-model="checkbox.model"
                        :label="checkbox.name"
                      ></v-checkbox>
                    </v-flex>
                    <v-flex xs12>
                      <h3>Department</h3>
                    </v-flex>
                    <v-flex xs12 md4 v-for="(checkbox, index) in departmentCheckboxes"
                      v-bind:key="index + 'j'">
                      <v-checkbox
                        v-model="checkbox.model"
                        :label="checkbox.name"
                      ></v-checkbox>
                    </v-flex>
                  </v-layout>
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
                    Save
                  </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-flex xs4 id="search">
            <v-text-field
              v-model="search"
              color="grey darken-3"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
          <div class="pl-4 pr-4 pt-2 pb-2">
            <v-data-table
              :headers="userHeaders"
              :items="users"
              :search="search"
              :loading="loading"
              id="table"
            >
              <template v-slot:items="props">
                <td>{{ props.item.userId }}</td>
                <td class="text-xs-center">{{ props.item.userName }}</td>
                <td class="text-xs-center">{{ props.item.name }}</td>
                <td class="text-xs-center">{{ props.item.email }}</td>
                <td class="text-xs-center">{{ props.item.domain }}</td>
                <td class="text-xs-center">{{ props.item.admin }}</td>
                <td class="text-xs-center">{{ props.item.active }}</td>
                <td class="text-xs-center">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        v-on="on"
                        @click="editUser(props.item)">
                        edit
                      </v-icon>
                    </template>
                    <span>Edit Permissions</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        v-on="on"
                        @click="deleteUser(props.item)">
                        delete
                      </v-icon>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
              </template>
            </v-data-table>
          </div>
        </div>
        <v-layout row wrap justify-space-around>
          <v-flex xs12 lg4>
            <v-card id="table">
              <v-toolbar flat dense class="green darken-1">
                <v-toolbar-title>Divisions</v-toolbar-title>
                <v-dialog
                  v-model="dialogDivision"
                  width="500"
                  persistent
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      absolute
                      dark
                      fab
                      bottom
                      right
                      color="grey darken-3"
                      v-on="on"
                    >
                      <v-icon>add</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title
                      class="headline grey darken-3 white--text"
                      primary-title
                    >
                      Add Division
                    </v-card-title>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout row wrap>
                          <v-flex xs12 id="divname">
                            <v-text-field v-model="editedDivision.companyName" label="Divison Name" color="green darken-1" :rules="[rules.required]"></v-text-field>
                          </v-flex>
                          <v-flex xs12 id="color">
                            <h3>Select a Color:</h3>
                            <swatches v-model="color" inline></swatches>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="grey darken-3"
                        flat
                        @click="closeDivision"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="grey darken-3"
                        flat
                        @click="saveDivision"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
              <v-card-text>
                <v-data-table
                :headers="divHeaders"
                :items="divisions"
                :loading="loading"
                hide-actions
                id="table">
                  <template v-slot:items="props">
                    <td class="text-xs-center">{{ props.item.companyName }}</td>
                    <td class="justify-center">
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            small
                            v-on="on"
                            class="mr-2"
                            @click="editColor(props.item)"
                            >
                            edit
                          </v-icon>
                          </template>
                        <span>Edit Color</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            small
                            v-on="on"
                            @click="deleteDivision(props.item)">
                            delete
                          </v-icon>
                           </template>
                        <span>Delete</span>
                      </v-tooltip>
                    </td>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 lg4>
            <v-card id="table">
              <v-toolbar flat dense class="green darken-1">
                <v-toolbar-title>Departments</v-toolbar-title>
                  <v-dialog
                    v-model="dialogDepartment"
                    width="500"
                    persistent
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        absolute
                        dark
                        fab
                        bottom
                        right
                        color="grey darken-3"
                        v-on="on"
                      >
                        <v-icon>add</v-icon>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title
                        class="headline grey darken-3 white--text"
                        primary-title
                      >
                        Add Department
                      </v-card-title>

                      <v-card-text>
                        <v-container grid-list-md>
                          <v-layout row wrap>
                            <v-flex xs12>
                              <v-text-field v-model="editedDepartment.departmentName" label="Department Name" color="green darken-1" :rules="[rules.required]"></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                      <v-divider></v-divider>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="grey darken-3"
                          flat
                          @click="closeDepartment"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="grey darken-3"
                          flat
                          @click="saveDepartment"
                        >
                          Save
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              <v-card-text>
                <v-data-table
                  :headers="depHeaders"
                  :items="departments"
                  :loading="loading"
                  hide-actions
                  id="table">
                  <template v-slot:items="props">
                    <td class="text-xs-center">{{ props.item.departmentName }}</td>
                    <td class="justify-center">
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            small
                            v-on="on"
                            @click="deleteDepartment(props.item)">
                            delete
                          </v-icon>
                          </template>
                        <span>Delete</span>
                      </v-tooltip>
                    </td>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex xs12 lg4>
            <v-card id="table">
              <v-toolbar flat dense class="green darken-1">
                <v-toolbar-title>Currency</v-toolbar-title>
                <v-dialog
                  v-model="dialogCurrency"
                  width="500"
                  persistent
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      absolute
                      dark
                      fab
                      bottom
                      right
                      color="grey darken-3"
                      v-on="on"
                    >
                      <v-icon>add</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title
                      class="headline grey darken-3 white--text"
                      primary-title
                    >
                      Add Currency
                    </v-card-title>

                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout row wrap>
                          <v-flex xs12>
                            <v-text-field v-model="editedCurrency.name" label="Currency Name" color="green darken-1" :rules="[rules.required]"></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>
                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="grey darken-3"
                        flat
                        @click="closeCurrency"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="grey darken-3"
                        flat
                        @click="saveCurrency"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
              <v-card-text>
                <v-data-table
                :headers="currHeaders"
                :items="currencys"
                :loading="loading"
                hide-actions
                id="table">
                <template v-slot:items="props">
                  <td class="text-xs-center">{{ props.item.name }}</td>
                  <td class="justify-center">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                          @click="deleteCurrency(props.item)">
                          delete
                        </v-icon>
                        </template>
                      <span>Delete</span>
                    </v-tooltip>
                  </td>
                </template>
              </v-data-table>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialogColor"
      width="500"
    >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Edit Color
        </v-card-title>

        <v-card-text>
          <v-flex xs12 id="color">
            <h3>Select a Color:</h3>
            <swatches v-model="color" inline></swatches>
          </v-flex>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="closeDivision"
          >
            Cancel
          </v-btn>
          <v-btn
            color="grey darken-3"
            flat
            @click="saveColor"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogContracts"
      width="1000"
      >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Active Contracts
        </v-card-title>
        <v-card-text>
          <v-flex xs4 id="search">
            <v-text-field
              v-model="contractSearch"
              color="grey darken-3"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
          <v-data-table
              :headers="contractHeaders"
              :items="contracts"
              :loading="loadingContracts"
              :search="contractSearch"
              hide-actions
          >
            <template v-slot:items="props">
              <td class="text-xs-center">{{ props.item.vendorName }}</td>
              <td class="text-xs-center">{{ props.item.contractDes }}</td>
              <td class="text-xs-center">{{ props.item.capexId }}</td>
              <td class="text-xs-center">{{ props.item.poNumber }}</td>
              <td class="text-xs-center">{{ props.item.companyName }}</td>
              <td class="text-xs-center">{{ props.item.departmentName }}</td>
              <td class="text-xs-center">{{ props.item.expDate }}</td>
              <td class="justify-center">
                <v-btn
                  color="info"
                  small
                  @click="router(props.item)">
                  more info
                </v-btn>
              </td>
            </template>
            <template v-slot:no-results>
              <v-alert :value="true" color="error" icon="warning">
                Your search for "{{ contractSearch }}" found no results.
              </v-alert>
            </template>
          </v-data-table>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="dialogContracts = false,
            loadingContracts = true"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import UserService from '@/services/userService'
import Swatches from 'vue-swatches'
import PieChart from '@/graphs/PieChart.js'
import RandomColor from 'randomcolor'
import 'vue-swatches/dist/vue-swatches.min.css'
export default {
  components: { Swatches, PieChart },
  data () {
    return {
      color: null,
      loading: true,
      loaded: false,
      dialog: false,
      dialogDivision: false,
      dialogDepartment: false,
      dialogEmail: false,
      dialogColor: false,
      dialogCurrency: false,
      selectedName: null,
      chartData: null,
      primaryContacts: [],
      dialogContracts: false,
      loadingContracts: false,
      contracts: [],
      currencys: [],
      search: '',
      contractSearch: '',
      userHeaders: [
        { text: 'UserId', value: 'userId', align: 'center', sortable: false },
        { text: 'UserName', value: 'userName', align: 'center', sortable: false },
        { text: 'Name', value: 'name', align: 'center', sortable: false },
        { text: 'Email', value: 'email', align: 'center', sortable: false },
        { text: 'Domain', value: 'domain', align: 'center', sortable: false },
        { text: 'Admin', value: 'admin', align: 'center', sortable: false },
        { text: 'Active', value: 'active', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      primaryHeaders: [
        { text: 'Primary Contact', value: 'labels', align: 'center', sortable: false },
        { text: 'Number of Contracts', value: 'data', align: 'center', sortable: false },
        { text: 'Active Contracts', value: 'action', align: 'center', sortable: false }
      ],
      divHeaders: [
        { text: 'Division Name', value: 'companyName', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      depHeaders: [
        { text: 'Department Name', value: 'departmentName', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      currHeaders: [
        { text: 'Currency Name', value: 'name', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      contractHeaders: [
        { text: 'Vendor', value: 'vendorName', align: 'center', sortable: false },
        { text: 'Description', value: 'contractDes', align: 'center', sortable: false },
        { text: 'Capex ID', align: 'center', sortable: false, value: 'capexId' },
        { text: 'PO Number', align: 'center', sortable: false, value: 'name' },
        { text: 'Company', value: 'companyName', align: 'center', sortable: false },
        { text: 'Department', value: 'renewalType', align: 'center', sortable: false },
        { text: 'Exp Date', value: 'expDate', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      rules: {
        required: value => !!value || 'Required.'
      },
      options: {
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
      users: [],
      divisions: [],
      departments: [],
      checkboxes: [],
      companyCheckboxes: [],
      departmentCheckboxes: [],
      editedIndex: -1,
      editedUser: {},
      defaultUser: {},
      editedDivision: {
        companyId: '',
        companyName: ''
      },
      defaultDivision: {
        companyId: '',
        companyName: ''
      },
      editedDepartment: {
        departmentId: '',
        departmentName: ''
      },
      defaultDepartment: {
        departmentId: '',
        departmentName: ''
      },
      editedCurrency: {
        cId: '',
        name: ''
      },
      defaultCurrency: {
        cId: '',
        name: ''
      }
    }
  },
  created () {
    this.getUsers()
    this.getDivisions()
    this.getDepartments()
    this.getPrimaryContacts()
    this.getCurrency()
    this.fillEditedUser()
  },
  methods: {
    async getUsers () {
      // get user information from the backend
      // let response = await UserService.getUsers({
      //   token: this.$store.state.token,
      //   user: this.$store.state.user,
      //   adminToken: this.$store.state.adminToken
      // })
      // this.users = response.data
      this.users = [
        {
          userId: 1,
          userName: 'UserName',
          name: 'FullName',
          email: 'Email',
          domain: 'Company1',
          admin: 1,
          active: 1
        }
      ]
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    async getContracts (name) {
      this.dialogContracts = true
      try {
        // get active contracts for a specific vendor
        const response = await UserService.getContracts({
          adminToken: this.$store.state.adminToken,
          token: this.$store.state.token,
          user: this.$store.state.user,
          name: name
        })
        this.contracts = response.data
        setTimeout(() => {
          this.loadingContracts = false
        }, 1000)
      } catch (error) {
        this.error = error.response.data.error
        this.loadingContracts = false
      }
    },
    async getDivisions () {
      // gets the companies from the backend
      // let response = await UserService.getDivisions({
      //   token: this.$store.state.token,
      //   user: this.$store.state.user,
      //   adminToken: this.$store.state.adminToken
      // })
      // this.divisions = response.data
      this.divisions = [
        { companyName: 'Company1' },
        { companyName: 'Company2' },
        { companyName: 'Company3' }
      ]
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    async getDepartments () {
      // gets the departments from the backend
      // let response = await UserService.getDepartments({
      //   token: this.$store.state.token,
      //   user: this.$store.state.user,
      //   adminToken: this.$store.state.adminToken
      // })
      // this.departments = response.data
      this.departments = [
        { departmentName: 'Department1' },
        { departmentName: 'Department2' },
        { departmentName: 'Department3' }
      ]
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    async getCurrency () {
      // gets the departments from the backend
      // let response = await UserService.getCurrency({
      //   token: this.$store.state.token,
      //   user: this.$store.state.user,
      //   adminToken: this.$store.state.adminToken
      // })
      // this.currencys = response.data
      this.currencys = [
        { name: 'CAD' },
        { name: 'USD' }
      ]
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    async editUser (item) {
      // grab the users permissions from the backend
      let permissions = await UserService.getUserPermissions({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken,
        userId: item.userId
      })
      let company = await UserService.getDivisions({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
      let department = await UserService.getDepartments({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
      this.editedIndex = this.users.indexOf(item)
      this.editedUser.userId = item.userId
      this.editedUser.Admin = item.admin
      this.editedUser.Active = item.active
      this.checkboxes.push({
        name: 'Admin',
        model: this.editedUser.Admin
      })
      this.checkboxes.push({
        name: 'Active',
        model: this.editedUser.Active
      })
      // here is where the checkboxes are dynamically generated
      for (let i in permissions.data) {
        for (let j in company.data) {
          // if the user has permission to the company
          if (permissions.data[i].companyid === company.data[j].companyId) {
            // their user object will say true
            this.editedUser[`${company.data[j].companyName}`] = true
          }
        }
        for (let k in department.data) {
          // if the user has permission to the department
          if (permissions.data[i].departmentid === department.data[k].departmentId) {
            // their user object will say true
            this.editedUser[`${department.data[k].departmentName}`] = true
          }
        }
      }
      // creates the checkbox information
      // the label and its value
      for (let i in company.data) {
        this.companyCheckboxes.push({
          name: company.data[i].companyName,
          model: this.editedUser[`${company.data[i].companyName}`]
        })
      }
      for (let j in department.data) {
        this.departmentCheckboxes.push({
          name: department.data[j].departmentName,
          model: this.editedUser[`${department.data[j].departmentName}`]
        })
      }
      this.selectedName = item.name
      this.dialog = true
    },
    async fillEditedUser () {
      // dynamically generate the editedUser object based on current companies and departments
      let company = await UserService.getDivisions({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
      let department = await UserService.getDepartments({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
      // every value is defaulted to false
      this.editedUser['Admin'] = false
      this.editedUser['Active'] = false
      this.defaultUser['Admin'] = false
      this.defaultUser['Active'] = false
      for (let i in company.data) {
        this.editedUser[`${company.data[i].companyName}`] = false
        this.defaultUser[`${company.data[i].companyName}`] = false
      }
      for (let j in department.data) {
        this.editedUser[`${department.data[j].departmentName}`] = false
        this.defaultUser[`${department.data[j].departmentName}`] = false
      }
    },
    async getPrimaryContacts () {
      // let response = await UserService.getPrimaryContacts({
      //   token: this.$store.state.token,
      //   user: this.$store.state.user,
      //   adminToken: this.$store.state.adminToken
      // })
      let labelsArr = ['UserName']
      let dataArr = [1]
      // genetrates the random colors for the graph
      let colorArr = this.randomColors(1)
      // for (let i in response.data) {
      //   labelsArr.push([response.data[i].labels])
      //   dataArr.push([response.data[i].data])
      // }
      this.chartData = {
        labels: labelsArr,
        datasets: [
          {
            label: ['Number of Contracts'],
            data: dataArr,
            backgroundColor: colorArr
          }
        ]
      }
      // this.primaryContacts = response.data
      this.primaryContacts = [
        {
          labels: 'UserName',
          data: 1
        }
      ]
      this.loaded = true
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    deleteUser (item) {
      // delete contract
      const index = this.users.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.users.splice(index, 1) && UserService.deleteUser({
        item: item,
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
    },
    deleteDivision (item) {
      const index = this.divisions.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.divisions.splice(index, 1) && UserService.deleteDivision({
        item: item,
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
    },
    deleteDepartment (item) {
      const index = this.divisions.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.departments.splice(index, 1) && UserService.deleteDepartment({
        item: item,
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
    },
    deleteCurrency (item) {
      const index = this.currencys.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.currencys.splice(index, 1) && UserService.deleteCurrency({
        item: item,
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken
      })
    },
    close () {
      this.dialog = false
      this.checkboxes = []
      this.companyCheckboxes = []
      this.departmentCheckboxes = []
      setTimeout(() => {
        this.editedUser = Object.assign({}, this.defaultUser)
        this.editedIndex = -1
      }, 300)
    },
    closeDivision () {
      this.color = null
      this.dialogColor = false
      this.dialogDivision = false
      setTimeout(() => {
        this.editedDivision = Object.assign({}, this.defaultDivision)
        this.editedIndex = -1
      }, 300)
    },
    closeDepartment () {
      this.dialogDepartment = false
      setTimeout(() => {
        this.editedDepartment = Object.assign({}, this.defaultDepartment)
        this.editedIndex = -1
      }, 300)
    },
    closeCurrency () {
      this.dialogCurrency = false
      setTimeout(() => {
        this.editedCurrency = Object.assign({}, this.defaultCurrency)
        this.editedIndex = -1
      }, 300)
    },
    editColor (item) {
      this.dialogColor = true
      this.editedDivision.companyId = item.companyId
      this.editedDivision.companyName = item.companyName
    },
    save () {
      let userId = this.editedUser.userId
      this.editedUser = Object.assign({}, this.defaultUser)
      let checkedBoxes = this.checkboxes.filter(checkbox => checkbox.model).map(name => name.name)
      let checkedCompanyBoxes = this.companyCheckboxes.filter(checkbox => checkbox.model).map(name => name.name)
      let checkedDepartmentBoxes = this.departmentCheckboxes.filter(checkbox => checkbox.model).map(name => name.name)
      // set the new values taken from the checkboxes to their match in the editedUser object
      for (let i in checkedBoxes) {
        this.editedUser[checkedBoxes[i]] = true
      }
      for (let i in checkedCompanyBoxes) {
        this.editedUser[checkedCompanyBoxes[i]] = true
      }
      for (let i in checkedDepartmentBoxes) {
        this.editedUser[checkedDepartmentBoxes[i]] = true
      }
      Object.assign(this.users[this.editedIndex], this.editedUser)
      console.log(this.editedUser)
      UserService.editPermissions({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken,
        editedUser: this.editedUser,
        userId: userId
      })
      this.dialog = false
      this.close()
    },
    saveColor () {
      UserService.editColor({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken,
        companyId: this.editedDivision.companyId,
        color: this.color
      })
      this.dialogColor = false
      this.loading = true
      this.closeDivision()
      this.getDivisions()
    },
    saveDivision () {
      UserService.addDivision({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken,
        companyName: this.editedDivision.companyName,
        color: this.color
      })
      this.loading = true
      this.getDivisions()
      this.closeDivision()
    },
    saveDepartment () {
      UserService.addDepartment({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken,
        departmentName: this.editedDepartment.departmentName
      })
      this.loading = true
      this.getDepartments()
      this.closeDepartment()
    },
    saveCurrency () {
      UserService.addCurrency({
        token: this.$store.state.token,
        user: this.$store.state.user,
        adminToken: this.$store.state.adminToken,
        name: this.editedCurrency.name
      })
      this.loading = true
      this.getCurrency()
      this.closeCurrency()
    },
    randomColors (length) {
      var arr = []
      for (var i = 0; i < length; i++) {
        arr.push(RandomColor())
      }
      return arr
    },
    router (contract) {
      this.$router.push({
        name: 'Contracts',
        params: {
          poNumber: contract.poNumber
        }
      })
    }
  }
}
</script>

<style scoped>
#container {
  margin-bottom: 1%;
}
#divname {
  margin-top: -3%;
}
#search {
  margin-top: -0.5%;
  margin-left: 1.5%;
}
#table {
  height: 100%;
}
#chartContainer {
  margin-top: -4%;
}
h2, h3 {
  font-weight: normal;
}
</style>
