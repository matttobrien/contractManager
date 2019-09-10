<template>
  <v-container>
    <v-layout align-center justify-space-around row fill-height>
      <v-flex>
        <div class="white elevation-3">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Vendors</v-toolbar-title>
            <v-dialog
              v-model="dialog"
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
                  {{ formTitle }}
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex xs12 sm6 md4>
                        <v-text-field v-model="editedItem.vendorName" label="Vendor Name" color="green darken-1" :rules="[rules.required]"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field v-model="editedItem.contactName" label="Contact Name" color="green darken-1" :rules="[rules.required]"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field v-model="editedItem.contactEmail" label="Contact Email" color="green darken-1" :rules="[rules.required]"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field v-mask="phoneMask" v-model="editedItem.contactNum" label="Contact Number" color="green darken-1" :rules="[rules.required]"></v-text-field>
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
          </v-toolbar>
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
            <slot>
              <v-data-table
                  :headers="headers"
                  :items="vendors"
                  :loading="loading"
                  :search="search"
                  :rows-per-page-items="rows"
                >
                <template v-slot:items="props">
                  <td class="text-xs-center">{{ props.item.vendorName }}</td>
                  <td class="text-xs-center">{{ props.item.contactName }}</td>
                  <td class="text-xs-center"><a @click="emailContact(props.item.contactEmail)">{{ props.item.contactEmail }}</a></td>
                  <td class="text-xs-center">{{ props.item.contactNum }}</td>
                  <td class="text-xs-center">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          class="mr-2"
                          v-on="on"
                          @click="getContracts(props.item)"
                          >
                          notes
                        </v-icon>
                      </template>
                      <span>Active Contracts</span>
                    </v-tooltip>
                  </td>
                  <td class="text-xs-center">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                          class="mr-2"
                          @click="editItem(props.item)"
                        >
                          edit
                        </v-icon>
                      </template>
                      <span>Edit</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                          v-if="$store.getters.isAdmin"
                          @click="deleteItem(props.item)"
                        >
                          delete
                        </v-icon>
                        </template>
                      <span>Delete</span>
                    </v-tooltip>
                  </td>
                </template>
              </v-data-table>
            </slot>
          </div>
        </div>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialogContracts"
      width="850"
    >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Active Contracts
        </v-card-title>
        <v-card-text>
          <v-data-table
              :headers="contractHeaders"
              :items="contracts"
              :total-items="totalContracts"
              :loading="loadingContracts"
              hide-actions
          >
            <template v-slot:items="props">
              <td class="text-xs-center">{{ props.item.capexId }}</td>
              <td class="text-xs-center">{{ props.item.poNumber }}</td>
              <td class="text-xs-center">{{ props.item.companyName }}</td>
              <td class="text-xs-center">{{ props.item.departmentName }}</td>
              <td class="text-xs-center">{{ props.item.contractDes }}</td>
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
import VendorService from '@/services/vendorService'
import {mask} from 'vue-the-mask'
import RandomColor from 'randomcolor'
export default {
  directives: {
    mask
  },
  data () {
    return {
      menu: false,
      dialog: false,
      dialogContracts: false,
      totalContracts: 0,
      vendors: [],
      contracts: [],
      loading: true,
      loadingContracts: true,
      search: '',
      phoneMask: '(###) ###-####',
      rules: {
        required: value => !!value || 'Required.'
      },
      rows: [10, 15, 20, {'text': '$vuetify.dataIterator.rowsPerPageAll', 'value': -1}],
      // headers for the vendors table
      headers: [
        { text: 'Vendor Name', value: 'name', align: 'center', sortable: false },
        { text: 'Contact Name', value: 'companyName', align: 'center', sortable: false },
        { text: 'Contact Email', value: 'vendorName', align: 'center', sortable: false },
        { text: 'Contact Number', value: 'companyEmail', align: 'center', sortable: false },
        { text: 'Active Contracts', value: 'ActiveContracts', align: 'center', sortable: false },
        { text: 'Action', value: 'Action', align: 'center', sortable: false }
      ],
      // headers for the active contracts table
      contractHeaders: [
        { text: 'Capex ID', align: 'center', sortable: false, value: 'capexId' },
        { text: 'PO Number', align: 'center', sortable: false, value: 'name' },
        { text: 'Company', value: 'companyName', align: 'center', sortable: false },
        { text: 'Department', value: 'renewalType', align: 'center', sortable: false },
        { text: 'Description', value: 'contractDes', align: 'center', sortable: false },
        { text: 'Exp Date', value: 'expDate', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        vendorName: '',
        contactName: '',
        contactEmail: '',
        contactNum: ''
      },
      defaultItem: {
        vendorName: '',
        contactName: '',
        contactEmail: '',
        contactNum: ''
      }
    }
  },
  created () {
    this.getVendors()
  },
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Vendor' : 'Edit Vendor'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  methods: {
    async getVendors () {
      this.loading = true
      try {
        // get vendors from the backend
        // const response = await VendorService.getVendors({
        //   token: this.$store.state.token
        // })
        // this.vendors = response.data
        this.vendors = [
          {
            vendorName: 'Vendor1',
            contactName: 'ContactName',
            contactEmail: 'contact@email.com',
            contactNum: '123-456-7890'
          },
          {
            vendorName: 'Vendor2',
            contactName: 'ContactName',
            contactEmail: 'contact@email.com',
            contactNum: '123-456-7890'
          },
          {
            vendorName: 'Vendor3',
            contactName: 'ContactName',
            contactEmail: 'contact@email.com',
            contactNum: '123-456-7890'
          }
        ]
        setTimeout(() => {
          this.loading = false
        }, 1000)
      } catch (error) {
        this.error = error.response.data.error
        this.loading = false
      }
    },
    async getContracts (item) {
      this.dialogContracts = true
      this.editedIndex = this.vendors.indexOf(item)
      var temp = this.vendors[this.editedIndex].vendorName
      try {
        // get active contracts for a specific vendor
        const response = await VendorService.getContracts({
          token: this.$store.state.token,
          user: this.$store.state.user,
          vendorName: temp
        })
        this.contracts = response.data
        this.totalContracts = response.data.length
        setTimeout(() => {
          this.loadingContracts = false
        }, 1000)
      } catch (error) {
        this.error = error.response.data.error
        this.loadingContracts = false
      }
    },
    emailContact (email) {
      window.location.href = `mailto:${email}`
    },
    editItem (item) {
      this.editedIndex = this.vendors.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      // delete contract
      const index = this.vendors.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.vendors.splice(index, 1) && VendorService.deleteVendors({
        token: this.$store.state.token,
        vendor: item
      })
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    save () {
      /* eslint-disable */
      if (this.editedIndex > -1) {
        // editing
        var vendorId = this.vendors[this.editedIndex].vendorId
        var temp = this.vendors[this.editedIndex].vendorName
        Object.assign(this.vendors[this.editedIndex], this.editedItem)
        VendorService.editVendors({
          token: this.$store.state.token,
          vendorId: vendorId,
          vendorName: this.editedItem.vendorName,
          contactName: this.editedItem.contactName,
          contactEmail: this.editedItem.contactEmail,
          contactNum: this.editedItem.contactNum,
          oldVendorName: temp
        })
      } else {
        // new vendor
        let color = RandomColor()
        let loop = true
        while (loop) {
          for (let i = 0; i < this.vendors.length; i++) {
            if (color == this.vendors[i].vendorColor) {
              color = RandomColor()
              loop = true
              continue
            }
            loop = false
          }
        }
        this.vendors.push(this.editedItem)
        VendorService.addVendors({
          token: this.$store.state.token,
          vendorName: this.editedItem.vendorName,
          contactName: this.editedItem.contactName,
          contactEmail: this.editedItem.contactEmail,
          contactNum: this.editedItem.contactNum,
          color: color
        })
      }
      this.dialog = false
      this.close()
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
#search {
  margin-top: -0.5%;
  margin-left: 1.5%;
}
</style>
