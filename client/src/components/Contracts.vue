<template>
  <v-container>
    <v-layout align-center justify-space-around row fill-height>
      <v-flex>
        <div class="white elevation-3">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Contracts</v-toolbar-title>
            <v-dialog
              v-model="dialog"
              width="500"
              persistent
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  id="btn"
                  absolute
                  dark
                  fab
                  right
                  bottom
                  color="grey darken-3"
                  v-on="on"
                  @click="newContract = true"
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
                        <v-text-field v-model="editedItem.capexId" label="Capex ID" color="green darken-1"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field v-model="editedItem.poNumber" label="PO Number" color="green darken-1"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-select v-model="editedItem.companyName" :items="company" label="Division" color="green darken-1" :rules="[rules.required]"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-select v-model="editedItem.departmentName" :items="department" label="Department" color="green darken-1" :rules="[rules.required]"></v-select>
                      </v-flex>
                      <v-flex xs12 sm8 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-overflow-btn height="36" :items="vendors" label="Vendor" editable v-model="editedItem.vendorName"
                        ></v-overflow-btn>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-select v-model="editedItem.renewal" :items="renewal" label="Renewal" color="green darken-1" :rules="[rules.required]"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-text-field v-model="editedItem.cost" label="Cost" color="green darken-1" :rules="[rules.required]"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-select v-model="editedItem.currency" :items="currencys" label="Currency" color="green darken-1" :rules="[rules.required]"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field v-model="editedItem.contractDes" label="Description" color="green darken-1" :rules="[rules.required]"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
                        <v-select v-model="editedItem.primaryContact" :items="users" label="Primary Contact" color="green darken-1" :rules="[rules.required]"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6 md4 v-if="newContract || this.$store.getters.isAdmin || isPrimaryContact">
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
                    <v-flex d-flex xs12 order-xs5>
                      <v-textarea
                        outline
                        color="green darken-1"
                        label="Notes"
                        v-model="editedItem.contractNotes"
                      ></v-textarea>
                    </v-flex>
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
                  :items="contracts"
                  :loading="loading"
                  :expand="expand"
                  :search="search"
                  item-key="contractId"
                  disable-initial-sort
                  :rows-per-page-items="rows"
                >
                <template v-slot:items="props" >
                  <tr @click="props.expanded = !props.expanded, paymentHistory(props.item), getPaymentData(props.item)">
                    <!-- <td @click="openCapex(props.item.capexId)"><a>{{ props.item.capexId }}</a></td> -->
                    <td class="text-xs-center">{{ props.item.capexId }}</td>
                    <td class="text-xs-center">{{ props.item.poNumber }}</td>
                    <td class="text-xs-center">{{ props.item.companyName }}</td>
                    <td class="text-xs-center">{{ props.item.primaryContact }}</td>
                    <td class="text-xs-center">{{ props.item.departmentName }}</td>
                    <td class="text-xs-center">{{ props.item.contractDes }}</td>
                    <td class="text-xs-center">{{ props.item.vendorName }}</td>
                    <td class="text-xs-center">{{ props.item.renewal }}</td>
                    <td class="text-xs-center">${{ props.item.cost }}</td>
                    <td class="text-xs-center">{{ props.item.currency }}</td>
                    <td class="text-xs-center">{{ props.item.expDate }}</td>
                    <td class="text-xs-center">
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            small
                            v-on="on"
                            @click="getNotes(props.item)"
                            >
                            notes
                          </v-icon>
                        </template>
                        <span>Notes</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            small
                            v-on="on"
                            @click="editAdminNotes(props.item), archived = false"
                            >
                            lock
                          </v-icon>
                        </template>
                        <span>Admin Notes</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            small
                            color="blue darken-1"
                            v-if="props.item.file"
                            @click="getFiles(props.item)"
                            v-on="on"
                            >
                            note
                          </v-icon>
                          <v-icon
                            small
                            v-else
                            @click="getFiles(props.item)"
                            v-on="on"
                            >
                            note
                          </v-icon>
                        </template>
                        <span>Files</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                          small
                          @click="archive(props.item)"
                          v-on="on"
                        >
                          archive
                        </v-icon>
                        </template>
                        <span>Archive</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-icon
                          small
                          @click="editItem(props.item), editing = true"
                          v-on="on"
                        >
                          edit
                        </v-icon>
                        </template>
                        <span>Edit</span>
                      </v-tooltip>
                      <!-- <v-icon
                        v-if="$store.state.admin"
                        small
                        @click="deleteItem(props.item)"
                      >
                        delete
                      </v-icon> -->
                    </td>
                  </tr>
                </template>
                <template v-slot:no-results>
                  <v-alert :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                  </v-alert>
                </template>
                <template v-slot:expand="props" id="expand">
                  <v-layout row wrap justify-space-around>
                    <v-flex xs6>
                      <v-card flat dark tile id="chartz">
                        <v-card-title class="justify-center">
                          <h3>Payment History</h3>
                        </v-card-title>
                        <v-data-table
                          dark
                          :headers="paymentHeaders"
                          :items="payments"
                        >
                          <template v-slot:items="props">
                            <td class="text-xs-center">{{ props.item.capexId }}</td>
                            <td class="text-xs-center">{{ props.item.poNumber }}</td>
                            <td class="text-xs-center">${{ props.item.price }}</td>
                            <td class="text-xs-center">{{ props.item.currency }}</td>
                            <td class="text-xs-center">{{ props.item.vendorName }}</td>
                            <td class="text-xs-center">{{ props.item.renewalDate }}</td>
                            <td class="text-xs-center">{{ props.item.renewedBy }}</td>
                          </template>
                        </v-data-table>
                      </v-card>
                    </v-flex>
                    <v-flex xs6>
                      <v-card flat dark tile id="chartz">
                        <div class="container" id="chartContainer">
                          <line-chart
                            id="charts"
                            v-if="loaded"
                            :chartdata="chartData"
                            :options="options"
                          />
                        </div>
                      </v-card>
                    </v-flex>
                  </v-layout>
                  <v-divider></v-divider>
                </template>
              </v-data-table>
            </slot>
          </div>
        </div>
        <div class="white elevation-3" id="arch">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Archived Contracts</v-toolbar-title>
            <v-btn v-if="!displayArchive"
              absolute
              dark
              right
              color="grey darken-3"
              @click="getArchivedContracts(), displayArchive = true">
              View
            </v-btn>
            <v-btn v-if="displayArchive"
              absolute
              dark
              right
              color="grey darken-3"
              @click="archivedContracts = [], displayArchive = false">
              Close
            </v-btn>
          </v-toolbar>
          <div v-if="displayArchive">
            <v-flex xs4 id="search">
              <v-text-field
                v-model="archiveSearch"
                color="grey darken-3"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>
            <v-data-table
                :headers="headers"
                :items="archivedContracts"
                :loading="archivedLoading"
                :expand="expand"
                :search="archiveSearch"
                item-key="contractId"
              >
              <template v-slot:items="props">
                <tr @click="props.expanded = !props.expanded, archivedPaymentHistory(props.item), getArchPaymentData(props.item)">
                  <td @click="openCapex(props.item.capexId)"><a>{{ props.item.capexId }}</a></td>
                  <td class="text-xs-center">{{ props.item.poNumber }}</td>
                  <td class="text-xs-center">{{ props.item.companyName }}</td>
                  <td class="text-xs-center">{{ props.item.primaryContact }}</td>
                  <td class="text-xs-center">{{ props.item.departmentName }}</td>
                  <td class="text-xs-center">{{ props.item.contractDes }}</td>
                  <td class="text-xs-center">{{ props.item.vendorName }}</td>
                  <td class="text-xs-center">{{ props.item.renewal }}</td>
                  <td class="text-xs-center">${{ props.item.cost }}</td>
                  <td class="text-xs-center">{{ props.item.currency }}</td>
                  <td class="text-xs-center">{{ props.item.expDate }}</td>
                  <td class="justify-center">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                          @click="getNotes(props.item)"
                          >
                          notes
                        </v-icon>
                      </template>
                      <span>Notes</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          v-on="on"
                          @click="editAdminNotes(props.item), archived = true"
                          >
                          lock
                        </v-icon>
                      </template>
                      <span>Admin Notes</span>
                    </v-tooltip>
                  <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          color="blue darken-1"
                          v-if="props.item.file"
                          @click="getArchivedFiles(props.item)"
                          v-on="on"
                          >
                          note
                        </v-icon>
                        <v-icon
                          small
                          v-else
                          @click="getArchivedFiles(props.item)"
                          v-on="on"
                          >
                          note
                        </v-icon>
                      </template>
                      <span>Files</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          small
                          @click="unArchive(props.item)"
                          v-on="on"
                        >
                          undo
                        </v-icon>
                      </template>
                      <span>UnArchive</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          v-if="$store.state.admin"
                          small
                          @click="deleteArchive(props.item)"
                          v-on="on"
                        >
                          delete
                        </v-icon>
                      </template>
                      <span>Delete</span>
                    </v-tooltip>
                  </td>
                </tr>
              </template>
              <template v-slot:no-results>
                <v-alert :value="true" color="error" icon="warning">
                  Your search for "{{ archiveSearch }}" found no results.
                </v-alert>
              </template>
              <template v-slot:expand="props">
                <v-layout row wrap justify-space-around>
                  <v-flex xs6>
                    <v-card flat dark tile id="chartz">
                      <v-card-title class="justify-center">
                        <h4>Payment History</h4>
                      </v-card-title>
                      <v-data-table
                        :headers="paymentHeaders"
                        :items="archivedPayments"
                      >
                        <template v-slot:items="props">
                          <td class="text-xs-center">{{ props.item.capexId }}</td>
                          <td class="text-xs-center">{{ props.item.poNumber }}</td>
                          <td class="text-xs-center">${{ props.item.price }}</td>
                          <td class="text-xs-center">{{ props.item.currency }}</td>
                          <td class="text-xs-center">{{ props.item.vendorName }}</td>
                          <td class="text-xs-center">{{ props.item.renewalDate }}</td>
                          <td class="text-xs-center">{{ props.item.renewedBy }}</td>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-flex>
                  <v-flex xs6>
                    <v-card flat dark tile id="chartz">
                      <div class="container" id="chartContainer">
                        <line-chart
                          id="charts"
                          v-if="loaded"
                          :chartdata="chartData"
                          :options="options"
                        />
                      </div>
                      </v-card>
                  </v-flex>
                </v-layout>
                <v-divider></v-divider>
              </template>
            </v-data-table>
          </div>
        </div>
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialogPDF"
      width="900"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Files
        </v-card-title>
        <v-card-text>
          <div>
            <form @submit.prevent="onSubmit" enctype="multipart/form-data">
              <h2>Upload Files</h2><br>
              <div class="fields">
                <input
                  type="file"
                  ref="files"
                  @change="onSelect"
                  multiple
                  />
                <button id="submit">Submit</button>
                <p>Click browse to select your file(s) for Upload.</p>
                </div>
              <div class="message">
                <h4>{{message}}</h4>
              </div>
            </form>
          </div>
          <br>
          <div v-if="this.curFiles != [] && this.curFiles[0] != null">
            <v-data-table
              v-if="this.curFiles[0] != null"
              :headers="fileHeaders"
              :items="curFiles"
            >
              <template v-slot:items="props">
                <td class="text-xs-center">{{ props.item.fileName }}</td>
                <td class="text-xs-center">{{ props.item.fileDes }}</td>
                <td class="text-xs-center">{{ props.item.uploadedBy }}</td>
                <td class="text-xs-center">{{ props.item.date }}</td>
                <td class="justify-center">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        @click="editDescription(props.item)"
                        v-on="on"
                        >
                          edit
                      </v-icon>
                    </template>
                    <span>Edit Description</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        @click="downloadFiles(props.item)"
                        v-on="on"
                        >
                          open_in_new
                      </v-icon>
                    </template>
                    <span>View</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        @click="deleteFiles(props.item)"
                        v-on="on"
                      >
                        delete
                      </v-icon>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="closeFiles"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogArchPDF"
      width="900"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Files
        </v-card-title>
        <v-card-text>
          <div v-if="this.curFiles != []">
            <v-data-table
              :headers="fileHeaders"
              :items="curFiles"
            >
              <template v-slot:items="props">
                <td class="text-xs-center">{{ props.item.fileName }}</td>
                <td class="text-xs-center">{{ props.item.fileDes }}</td>
                <td class="text-xs-center">{{ props.item.uploadedBy }}</td>
                <td class="text-xs-center">{{ props.item.date }}</td>
                <td class="justify-center">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        @click="downloadFiles(props.item)"
                        v-on="on"
                        >
                          open_in_new
                      </v-icon>
                    </template>
                    <span>View</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        class="mr-2"
                        @click="deleteFiles(props.item)"
                        v-on="on"
                      >
                        delete
                      </v-icon>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="closeFiles"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogFileDes"
      width="500"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Edit File Description
        </v-card-title>
        <v-card-text>
          <v-flex xs12>
            <v-text-field v-model="fileDescription" label="File Description" color="green darken-1" :rules="[rules.required]"></v-text-field>
          </v-flex>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="closeDescription"
          >
            Cancel
          </v-btn>
          <v-btn
            color="grey darken-3"
            flat
            @click="saveDescription"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogNotes"
      width="500"
      persistent
    >
      <template v-slot:activator="{ on }">
        </template>
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Notes
        </v-card-title>
        <v-card-text>
          <v-textarea
            outline
            disabled
            color="green darken-1"
            v-model="editedItem.contractNotes"
        ></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="dialogNotes = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogAdminNotes"
      width="500"
      persistent
    >
      <template v-slot:activator="{ on }">
        </template>
      <v-card>
        <v-card-title
          class="headline grey darken-3 white--text"
          primary-title
        >
          Admin Notes
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-if="!archived"
            outline
            color="green darken-1"
            v-model="editedItem.adminNotes"
        ></v-textarea>
        <v-textarea
            v-else
            disabled
            outline
            color="green darken-1"
            v-model="editedItem.adminNotes"
        ></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-3"
            flat
            @click="dialogAdminNotes = false"
          >
            Close
          </v-btn>
          <v-btn
            color="grey darken-3"
            flat
            v-if="!archived"
            @click="adminNotes()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import ContractService from '@/services/contractService'
import ChartService from '@/services/chartService'
import LineChart from '@/graphs/LineChart.js'
import FileService from '@/services/fileService'
import axios from 'axios'
export default {
  components: { LineChart },
  data () {
    // the various variables used in the methods below
    return {
      date: new Date().toISOString().substr(0, 10),
      files: [],
      curFiles: [],
      message: '',
      search: '',
      hint: '',
      archiveSearch: '',
      editedFileId: null,
      displayArchive: false,
      fab: false,
      err: '',
      menu: false,
      expand: false,
      dialog: false,
      dialogNotes: false,
      dialogRenew: false,
      dialogPDF: false,
      dialogArchPDF: false,
      dialogFileDes: false,
      dialogAdminNotes: false,
      contracts: [],
      currencys: [],
      archivedContracts: [],
      loading: true,
      loaded: false,
      archivedLoading: true,
      snackbar: false,
      timeout: 5000,
      newContract: false,
      isPrimaryContact: false,
      payments: [],
      archivedPayments: [],
      users: [],
      chartData: null,
      costChartData: null,
      clickOnContract: '',
      archived: false,
      editing: false,
      rules: {
        required: value => !!value || 'Required.'
      },
      // the options for the chart js graph
      options: {
        maintainAspectRatio: false,
        filler: false,
        legend: {
          labels: {
            fontColor: 'rgb(255,255,255)'
          }
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                color: 'rgba(255,255,255,0.3)'
              },
              ticks: {
                beginAtZero: true,
                fontColor: 'rgb(255,255,255)'
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                color: 'rgba(255,255,255,0.3)'
              },
              ticks: {
                fontColor: 'rgb(255,255,255)'
              }
            }
          ]
        }
      },
      // types of renewals for contracts
      renewal: ['Monthly', 'Annually', '3 Year', 'Custom'],
      // the possible number of rows for the data tables
      rows: [10, 15, 20, {'text': '$vuetify.dataIterator.rowsPerPageAll', 'value': -1}],
      company: [],
      department: [],
      vendors: [],
      // headers for the contracts table
      headers: [
        { text: 'Capex ID', value: 'capexId', align: 'center' },
        { text: 'PO Number', value: 'poNumber', align: 'center' },
        { text: 'Company', value: 'companyName', align: 'center' },
        { text: 'Primary Contact', value: 'primaryContact', align: 'center' },
        { text: 'Department', value: 'departmentName', align: 'center' },
        { text: 'Description', value: 'contractDes', align: 'center' },
        { text: 'Vendor', value: 'vendorName', align: 'center' },
        { text: 'Renewal', value: 'renewal', align: 'center' },
        { text: 'Cost', value: 'cost', align: 'center' },
        { text: 'Currency', value: 'currency', align: 'center' },
        { text: 'Exp Date', value: 'expDate', align: 'center' },
        { text: 'Action', value: 'Action', align: 'center' }
      ],
      paymentHeaders: [
        { text: 'Capex ID', value: 'capexId', align: 'center', sortable: false },
        { text: 'PO Number', value: 'poNumber', align: 'center', sortable: false },
        { text: 'Cost', value: 'price', align: 'center', sortable: false },
        { text: 'Currency', value: 'currency', align: 'center', sortable: false },
        { text: 'Vendor', value: 'vendorName', align: 'center', sortable: false },
        { text: 'End Date', value: 'renewalDate', align: 'center', sortable: false },
        { text: 'Renewed By', value: 'renewedBy', align: 'center', sortable: false }
      ],
      fileHeaders: [
        { text: 'File', value: 'fileName', align: 'center', sortable: false },
        { text: 'Description', value: 'fileDes', align: 'center', sortable: false },
        { text: 'Uploaded By', value: 'uploadedBy', align: 'center', sortable: false },
        { text: 'Date', value: 'date', align: 'center', sortable: false },
        { text: 'Action', value: 'action', align: 'center', sortable: false }
      ],
      editedIndex: -1,
      // these are the objects that hold the values when you create a new contract or edit notes
      editedItem: {
        capexId: '',
        poNumber: '',
        companyName: '',
        departmentName: '',
        contractDes: '',
        vendorName: '',
        renewal: '',
        cost: '',
        currency: '',
        expDate: '',
        primaryContact: '',
        contractNotes: '',
        adminNotes: ''
      },
      defaultItem: {
        capexId: '',
        poNumber: '',
        companyName: '',
        departmentName: '',
        contractDes: '',
        vendorName: '',
        renewal: '',
        cost: '',
        currency: '',
        expDate: '',
        primaryContact: '',
        contractNotes: '',
        adminNotes: ''
      },
      fileDescription: '',
      fileName: ''
    }
  },
  created () {
    this.getContracts()
    this.getVendors()
    this.getDepartments()
    this.getCompanys()
    this.getCurrency()
    this.getUsers()
    this.clickOnContract = this.$route.params.contractDes
    this.search = this.clickOnContract
  },
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Contract' : 'Edit Contract'
    },
    foo () {
      return this.editedItem.renewal
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    },
    foo (renewal) {
      if (!this.editing) {
        if (renewal === 'Monthly') {
          let curDate = new Date()
          curDate.setMonth(curDate.getMonth() + 1)
          this.date = this.editedItem.expDate = curDate.toISOString().substr(0, 10)
        } else if (renewal === 'Annually') {
          let curDate = new Date()
          curDate.setFullYear(curDate.getFullYear() + 1)
          this.date = this.editedItem.expDate = curDate.toISOString().substr(0, 10)
        } else if (renewal === '3 Year'){
          let curDate = new Date()
          curDate.setFullYear(curDate.getFullYear() + 3)
          this.date = this.editedItem.expDate = curDate.toISOString().substr(0, 10)
        } else {
          // do nothing
        }
      } else {
        this.date = this.editedItem.expDate
      }
    }
  },
  methods: {
    async getContracts () {
      this.loading = true
      try {
        // const response = await ContractService.getContracts({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        // for (let i in response.data) {
        //   this.contracts.push({
        //     contractId: response.data[i].contractId,
        //     poNumber: response.data[i].poNumber,
        //     capexId: response.data[i].capexId,
        //     companyName: response.data[i].companyName,
        //     departmentName: response.data[i].departmentName,
        //     contractDes: response.data[i].contractDes,
        //     vendorName: response.data[i].vendorName,
        //     renewal: response.data[i].renewal,
        //     cost: this.addCommas(response.data[i].cost),
        //     currency: response.data[i].currency,
        //     expDate: response.data[i].expDate,
        //     primaryContact: response.data[i].primaryContact,
        //     contractNotes: response.data[i].notes,
        //     adminNotes: response.data[i].adminNotes,
        //     file: response.data[i].file
        //   })
        // }
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
            contractNotes: 'Test',
            adminNotes: 'Admin',
            file: 1
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
            contractNotes: 'Test',
            adminNotes: 'Admin',
            file: 0
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
            contractNotes: 'Test',
            adminNotes: 'Admin',
            file: 0
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
    async getArchivedContracts () {
      this.archivedLoading = true
      try {
        // const response = await ContractService.getArchivedContracts({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        // for (let i in response.data) {
        //   this.archivedContracts.push({
        //     contractId: response.data[i].contractId,
        //     poNumber: response.data[i].ponumber,
        //     capexId: response.data[i].capexId,
        //     companyName: response.data[i].companyName,
        //     departmentName: response.data[i].departmentName,
        //     contractDes: response.data[i].contractDes,
        //     vendorName: response.data[i].vendorName,
        //     renewal: response.data[i].renewal,
        //     cost: this.addCommas(response.data[i].cost),
        //     currency: response.data[i].currency,
        //     expDate: response.data[i].expDate,
        //     primaryContact: response.data[i].primaryContact,
        //     contractNotes: response.data[i].notes,
        //     adminNotes: response.data[i].adminNotes,
        //     file: response.data[i].file
        //   })
        // }
        setTimeout(() => {
          this.archivedLoading = false
        }, 1000)
      } catch (error) {
        this.error = error.response.data.error
        this.archivedLoading = false
      }
    },
    async getVendors () {
      try {
        // const response = await ContractService.getVendors({
        //   token: this.$store.state.token
        // })
        // for (var i in response.data) {
        //   this.vendors.push(response.data[i].vendorname)
        // }
        this.vendors = [
          'Vendor1', 'Vendor2', 'Vendor3'
        ]
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getUsers () {
      try {
        // const response = await ContractService.getUsers({
        //   token: this.$store.state.token
        // })
        // for (var i in response.data) {
        //   this.users.push(response.data[i].name)
        // }
        this.users = ['Username']
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getCurrency () {
      try {
        // const response = await ContractService.getCurrency({
        //   token: this.$store.state.token
        // })
        // for (var i in response.data) {
        //   this.currencys.push(response.data[i].name)
        // }
        this.currencys = ['CAD', 'USD']
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getDepartments () {
      try {
        // const response = await ContractService.getDepartments({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        // for (var i in response.data) {
        //   this.department.push(response.data[i].departmentName)
        // }
        this.department = [
          'Department1', 'Department2', 'Department3'
        ]
      } catch (error) {
        this.error = error.response.data.error
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
        this.company = [
          'Company1', 'Company2', 'Company3'
        ]
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getPaymentData (item) {
      this.loaded = false
      try {
        // get the data for the chart
        // const response = await ChartService.getPaymentData({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user,
        //   item: item
        // })
        let labelsArr = [
          '2019-09-31', '2019-10-31'
        ]
        let dataArr = [
          12.39, 17.99
        ]
        // for (let i in response.data) {
        //   labelsArr.push([response.data[i].labels])
        //   dataArr.push([response.data[i].data])
        // }
        this.chartData = {
          labels: labelsArr,
          datasets: [
            {
              label: 'Payments Over Time',
              data: dataArr, //.slice(0).slice(-6),
              backgroundColor: 'rgba(155, 89, 182, 0.5)'
            }
          ]
        }
        // generates the projected cost over time based on type of renewal
        // let costArr = []
        // switch (item.renewal) {
        //   case 'Annually': {
        //     let currCost = parseInt(item.cost)
        //     for (let i = 0; i < 5; i++) {
        //       costArr[i] = currCost.toFixed(2)
        //       currCost += parseInt(item.cost)
        //     }
        //     break
        //   }
        //   case 'Monthly': {
        //     let currCost = parseInt(item.cost) * 12
        //     for (let i = 0; i < 5; i++) {
        //       costArr[i] = currCost.toFixed(2)
        //       currCost += (parseInt(item.cost) * 12)
        //     }
        //     break
        //   }
        //   case '3 Year': {
        //     let currCost = parseInt(item.cost) / 3
        //     for (let i = 0; i < 5; i++) {
        //       costArr[i] = currCost.toFixed(2)
        //       currCost += (parseInt(item.cost) / 3)
        //     }
        //     break
        //   }
        // }
        // this.costChartData = {
        //   labels: ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years'],
        //   datasets: [
        //     {
        //       label: 'Estimated Cost Over Time',
        //       data: costArr,
        //       backgroundColor: 'rgba(41, 128, 185, 0.5)'
        //     }
        //   ]
        // }
        this.loaded = true
      } catch (e) {
        console.error(e)
      }
    },
    async getArchPaymentData (item) {
      this.loaded = false
      try {
        // get the data for the chart
        const response = await ChartService.getArchPaymentData({
          token: this.$store.state.token,
          user: this.$store.state.user,
          item: item
        })
        let labelsArr = []
        let dataArr = []
        for (let i in response.data) {
          labelsArr.push([response.data[i].labels])
          dataArr.push([response.data[i].data])
        }
        this.chartData = {
          labels: labelsArr,
          datasets: [
            {
              label: 'Payments Over Time',
              data: dataArr.slice(0).slice(-6),
              backgroundColor: 'rgba(155, 89, 182, 0.3)'
            }
          ]
        }
        // generates the projected cost over time based on type of renewal
        let costArr = []
        switch (item.renewal) {
          case 'Annually': {
            let currCost = parseInt(item.cost)
            for (let i = 0; i < 5; i++) {
              costArr[i] = currCost
              currCost += parseInt(item.cost)
            }
            break
          }
          case 'Monthly': {
            let currCost = parseInt(item.cost) * 12
            for (let i = 0; i < 5; i++) {
              costArr[i] = currCost
              currCost += (parseInt(item.cost) * 12)
            }
            break
          }
          case '3 Year': {
            let currCost = parseInt(item.cost) / 3
            for (let i = 0; i < 5; i++) {
              costArr[i] = currCost
              currCost += (parseInt(item.cost) / 3)
            }
            break
          }
        }
        this.costChartData = {
          labels: ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years'],
          datasets: [
            {
              label: 'Estimated Cost Over Time',
              data: costArr,
              backgroundColor: 'rgba(41, 128, 185, 0.3)'
            }
          ]
        }
        this.loaded = true
      } catch (e) {
        console.error(e)
      }
    },
    async adminNotes () {
      try {
        let contractId = this.contracts[this.editedIndex].contractId
        const response = await ContractService.adminNotes({
          token: this.$store.state.token,
          adminNotes: this.editedItem.adminNotes,
          contractId: contractId
        })
        this.contracts = []
        this.getContracts()
        this.dialogAdminNotes = false
        console.log(this.dialogAdminNotes)
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async paymentHistory (item) {
      try {
        this.payments = []
        // const response = await ContractService.getPaymentHistory({
        //   token: this.$store.state.token,
        //   contractId: item.contractId
        // })
        // // this.payments = response.data
        // for (let i in response.data) {
        //   this.payments.push({
        //     poNumber: response.data[i].poNumber,
        //     capexId: response.data[i].capexId,
        //     vendorName: response.data[i].vendorName,
        //     price: this.addCommas(response.data[i].price),
        //     currency: response.data[i].currency,
        //     renewalDate: response.data[i].renewalDate,
        //     renewedBy: response.data[i].renewedBy
        //   })
        // }
        this.payments = [
          {
            poNumber: 1,
            capexId: 1,
            vendorName: 'Vendor1',
            price: 12.34,
            currency: 'CAD',
            renewalDate: '01-02-2020',
            renewedBy: 'Username'
          }
        ]
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async archivedPaymentHistory (item) {
      try {
        this.archivedPayments = []
        const response = await ContractService.getArchivedPaymentHistory({
          token: this.$store.state.token,
          contractId: item.contractId
        })
        // this.archivedPayments = response.data
        for (let i in response.data) {
          this.archivedPayments.push({
            poNumber: response.data[i].ponumber,
            capexId: response.data[i].capexId,
            vendorName: response.data[i].vendorName,
            price: this.addCommas(response.data[i].price),
            currency: response.data[i].currency,
            renewalDate: response.data[i].renewalDate,
            renewedBy: response.data[i].renewedBy
          })
        }
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async unArchive (item) {
      const index = this.archivedContracts.indexOf(item)
      confirm('Are you sure you want to un-archive this item?') && await ContractService.unArchiveContract({
        token: this.$store.state.token,
        user: this.$store.state.user,
        item: item
      }) && this.archivedContracts.splice(index, 1)
      this.archivedContracts = []
      this.contracts = []
      this.getContracts()
      this.getArchivedContracts()
    },
    async deleteArchive (item) {
      const index = this.archivedContracts.indexOf(item)
      confirm('Are you sure you want to delete this item?') && await ContractService.deleteArchive({
        token: this.$store.state.token,
        user: this.$store.state.user,
        item: item
      }) && this.archivedContracts.splice(index, 1)
      this.archivedContracts = []
      this.getArchivedContracts()
    },
    async deleteFiles (item) {
      let file = item.fileName
      confirm('Are you sure you want to delete this file?') && await FileService.deleteArchivedFiles({
        token: this.$store.state.token,
        user: this.$store.state.user,
        contractId: this.editedFileId,
        file: file
      })
      this.message = 'File Deleted!'
      setTimeout(() => {
        this.message = ''
        this.contracts = []
        this.getContracts()
        this.getFiles({
          contractId: this.editedFileId
        })
      }, 1000)
    },
    async deleteArchivedFiles (item) {
      let file = item.fileName
      confirm('Are you sure you want to delete this file?') && await FileService.deleteArchivedFiles({
        token: this.$store.state.token,
        user: this.$store.state.user,
        contractId: this.editedFileId,
        file: file
      })
      this.message = 'File Deleted!'
      setTimeout(() => {
        this.message = ''
        this.archivedContracts = []
        this.getArchivedContracts()
        this.getFiles({
          contractId: this.editedFileId
        })
      }, 1000)
    },
    async getFiles (item) {
      try {
        this.editedFileId = item.contractId
        const response = await FileService.getFiles({
          token: this.$store.state.token,
          contractId: item.contractId
        })
        this.curFiles = response.data
        this.dialogPDF = true
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getArchivedFiles (item) {
      try {
        this.editedFileId = item.contractId
        const response = await FileService.getArchivedFiles({
          token: this.$store.state.token,
          contractId: item.contractId
        })
        this.curFiles = response.data
        this.dialogArchPDF = true
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async onSubmit () {
      if (this.files.length == 0) {
        return
      }
      let fileNames = []
      let formData = new FormData()
      // the node module multer takes formdata objects
      // this loop appends each file in the files array to the formdata object
      for (let i in this.files[0]) {
        let file = this.files[0][i]
        formData.append(`files`, file)
      }
      for (let i = 0; i < this.files[0].length; i++) {
        let fileName = this.files[0][i].name
        // if the name contains an ' it will throw an error
        if (fileName.includes("'")) {
          let str = fileName.replace("'", "''")
          fileName = str
        }
        fileNames.push(fileName)
      }
      try {
        // uploads the file to the server
        await FileService.uploadFile(formData)
        // assiocates the file with the selected contract
        await FileService.addToContract({
          token: this.$store.state.token,
          user: this.$store.state.user,
          contractId: this.editedFileId,
          files: fileNames
        })
        this.message = 'File(s) Uploaded!'
        setTimeout(() => {
          this.message = ''
          this.contracts = []
          this.getContracts()
          this.getFiles({
            contractId: this.editedFileId
          })
        }, 1000)
      } catch (err) {
        console.log(err)
        this.message = 'An error has occuring uploading the file!'
      }
    },
    downloadFiles (item) {
      let file = item.fileName
      // uses axios to request the file from the backend
      // had to put this here instead of in a service as it required a custom function
      axios({
        url: 'http://localhost:8081/downloadfiles',
        method: 'POST',
        responseType: 'blob',
        data: {
          fileName: file
        }
      }).then((response) => {
        // the browser will not auto download a file from an ajax request..
        // the code below creates the download link and clicks it which downloads the file
        let fileName = response.headers['file-name']
        const url = window.URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}))
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.setAttribute('open', fileName)
        document.body.appendChild(link)
        link.click()
      })
    },
    onSelect () {
      const file = this.$refs.files.files
      console.log(file.length)
      for (let i = 0; i < file.length; i++) {
        if (file[i].type == 'application/pdf'){
          if (file[i].size > 21200000) {
            this.message = 'File size is too large! Max size is 20MB.'
            this.files = []
            return
          } else {
            this.files.push(file)
          }
        } else {
          this.message = 'Only PDFs are accepted.'
          this.files = []
          return
        }
      }
    },
    addCommas (nStr) {
      nStr = nStr.toFixed(2)
      nStr += ''
      var x = nStr.split('.')
      var x1 = x[0]
      var x2 = x.length > 1 ? '.' + x[1] : ''
      var rgx = /(\d+)(\d{3})/
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2')
      }
      return x1 + x2
    },
    getNotes (item) {
      this.editedIndex = this.contracts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogNotes = true
    },
    getArchivedNotes (item) {
      this.editedIndex = this.archivedContracts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogNotes = true
    },
    editItem (item) {
      this.newContract = false
      if (item.primaryContact == this.$store.state.user) {
        this.isPrimaryContact = true
      } else {
        this.isPrimaryContact = false
      }
      this.editedIndex = this.contracts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      console.log(this.editedItem)
      this.dialog = true
    },
    editAdminNotes (item) {
      console.log(item)
      if (this.$store.getters.isAdmin || item.primaryContact == this.$store.state.user) {
        this.editedIndex = this.contracts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogAdminNotes = true
      }
    },
    archive (item) {
      const index = this.contracts.indexOf(item)
      confirm('Are you sure you want to archive this item?') && ContractService.archiveContract({
        token: this.$store.state.token,
        user: this.$store.state.user,
        item: item
      })
      this.contracts = []
      this.getContracts()
    },
    openCapex (capexId) {
      window.open(`http://capex.pangeo.com/capex.php?ID=${capexId}`)
    },
    editDescription (item) {
      this.fileName = item.fileName
      this.dialogFileDes = true
    },
    async saveDescription () {
      await FileService.editDescription({
        token: this.$store.state.token,
        fileDes: this.fileDescription,
        fileName: this.fileName
      })
      let temp = {
        poNumber: this.editedFileId
      }
      this.getFiles(temp)
      this.closeDescription()
    },
    close () {
      this.dialog = false
      this.editing = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    closeFiles () {
      this.files = []
      this.curFiles = []
      this.message = ''
      this.editedFileId = null
      this.dialogArchPDF = false
      this.dialogPDF = false
    },
    closeDescription () {
      this.fileDescription = ''
      this.fileName = ''
      this.dialogFileDes = false
    },
    save () {
      if (this.editedIndex > -1) {
        // editing contracts
        var temp = this.contracts[this.editedIndex].contractId
        Object.assign(this.contracts[this.editedIndex], this.editedItem)
        ContractService.editContracts({
          token: this.$store.state.token,
          user: this.$store.state.user,
          poNumber: this.editedItem.poNumber,
          capexId: this.editedItem.capexId,
          companyName: this.editedItem.companyName,
          departmentName: this.editedItem.departmentName,
          contractDes: this.editedItem.contractDes,
          vendorName: this.editedItem.vendorName,
          renewal: this.editedItem.renewal,
          expDate: this.editedItem.expDate,
          contractNotes: this.editedItem.contractNotes,
          primaryContact: this.editedItem.primaryContact,
          cost: this.editedItem.cost,
          currency: this.editedItem.currency,
          contractId: temp
        })        
      } else {
        // check if any field is empty
        if (this.editedItem.primaryContact === ''){
          this.err = 'Primary Contact must be filled out!'
          return
        } else if (this.editedItem.companyName === '') {
          this.err = 'Company must be filled out!'
          return
        } else if (this.editedItem.departmentName === '') {
          this.err = 'Department must be filled out!'
          return
        } else if (this.editedItem.contractDes === '') {
          this.err = 'Description must be filled out!'
          return
        } else if (this.editedItem.vendorName === '') {
          this.err = 'Vendor must be filled out!'
          return
        } else if (this.editedItem.renewal === '') {
          this.err = 'Renewal must be filled out!'
          return
        } else if (this.editedItem.cost === '') {
          this.err = 'Cost must be filled out!'
          return
        } else if (this.editedItem.currency === '') {
          this.err = 'Currency must be filled out!'
          return
        } else if ((this.editedItem.cost).includes(',')) {
          this.err = 'Please remove comma(s) from the cost.'
          return
        }
        this.err = ''
        // ensure the cost is rounded to 2 decimal places
        let cost = this.editedItem.cost
        this.editedItem.cost = parseFloat(cost).toFixed(2)
        // new contract
        this.contracts.push(this.editedItem)
        ContractService.addContracts({
          token: this.$store.state.token,
          user: this.$store.state.user,
          poNumber: this.editedItem.poNumber,
          capexId: this.editedItem.capexId,
          companyName: this.editedItem.companyName,
          departmentName: this.editedItem.departmentName,
          contractDes: this.editedItem.contractDes,
          vendorName: this.editedItem.vendorName,
          renewal: this.editedItem.renewal,
          expDate: this.editedItem.expDate,
          contractNotes: this.editedItem.contractNotes,
          primaryContact: this.editedItem.primaryContact,
          cost: this.editedItem.cost,
          currency: this.editedItem.currency
        })
      }
      this.dialog = false
      this.contracts = []
      this.archivedContracts = []
      this.getContracts()
      this.getArchivedContracts()
      this.close()
    }
  }
}
</script>

<style scoped>
h3 {
  font-weight: normal;
}
.err {
  color: red;
}
.fields {
  text-align: center;
}
#arch {
  margin-top: 1%;
}
#search {
  margin-top: -0.5%;
  margin-left: 1.5%;
}
#submit {
  border: 2px;
  padding-right: 2px;
  padding-left: 2px;
  border-style: groove;
}
#charts {
  margin-top: -15px;
  margin-bottom: 10px;
}
#chartz {
  height: 100%;
}
#trash {
  margin-right: -5%;
}
</style>
