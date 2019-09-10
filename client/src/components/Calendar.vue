<template>
  <v-container>
    <v-layout align-center justify-space-around row fill-height>
      <v-flex>
        <div class="white elevation-3" id="container">
          <v-toolbar flat dense class="green darken-1">
            <v-toolbar-title>Calendar</v-toolbar-title>
          </v-toolbar><h2>
          <div class="legend">
             Legend: <span v-for="(legends, index) in legend" v-bind:key="index" :style="{'color': legends.eventColor }">|{{legends }}| </span>
          </div></h2>
          <div class='demo-app'>
            <FullCalendar
              class='calendar'
              ref="fullCalendar"
              defaultView="dayGridMonth"
              :header="{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listYear'
              }"
              :plugins="calendarPlugins"
              :weekends="calendarWeekends"
              :events="events"
              :height="height"
              @eventClick="eventClick"
            />
          </div>
        </div>
        <div>
          <v-dialog
            v-model="dialog"
            width="300"
          >
            <v-card>
              <v-card-title
                class="headline grey darken-3 white--text"
                primary-title
              >
                Event Details
              </v-card-title>

              <v-card-text>
                <div v-for="info in eventInfo" :key="info">
                  <v-layout>
                    <v-flex xs12>
                      <div>
                        <table border="0">
                          <tr>
                            <th>Contract ID</th>
                            <th style="font-weight: normal;">{{info.contractId}}</th>
                          </tr>
                          <tr>
                            <th>PO Number</th>
                            <th style="font-weight: normal;">{{info.poNumber}}</th>
                          </tr>
                          <tr>
                            <th>Company</th>
                            <th style="font-weight: normal;">{{info.companyName}}</th>
                          </tr>
                          <tr>
                            <th>Contact</th>
                            <th style="font-weight: normal;">{{info.primaryContact}}</th>
                          </tr>
                          <tr>
                            <th>Department</th>
                            <th style="font-weight: normal;">{{info.departmentName}}</th>
                          </tr>
                          <tr>
                            <th>Description</th>
                            <th style="font-weight: normal;">{{info.contractDes}}</th>
                          </tr>
                          <tr>
                            <th>Vendor</th>
                            <th style="font-weight: normal;">{{info.vendorName}}</th>
                          </tr>
                          <tr>
                            <th>Renewal</th>
                            <th style="font-weight: normal;">{{info.renewal}}</th>
                          </tr>
                          <tr>
                            <th>Expiry Date</th>
                            <th style="font-weight: normal;">{{info.expDate}}</th>
                          </tr>
                        </table>
                      </div>
                    </v-flex>
                  </v-layout>
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="grey darken-3"
                  flat
                  @click="dialog = false"
                >
                  close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import CalendarService from '@/services/calendarService'
export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data: function () {
    return {
      dialog: false,
      calendarPlugins: [ // plugins must be defined in the JS
        dayGridPlugin,
        timeGridPlugin,
        listPlugin
      ],
      calendarWeekends: true,
      events: [],
      eventInfo: [],
      eventTable: null,
      height: 600,
      legend: []
    }
  },
  created () {
    this.getEvents()
    this.getLegend()
  },
  methods: {
    async getEvents () {
      try {
        // const response = await CalendarService.getEvents({
        //   token: this.$store.state.token,
        //   user: this.$store.state.user
        // })
        // this.events = response.data
        this.events = [
          {
            title: 'U of W',
            start: '2019-09-28'
          },
          {
            title: 'U of W',
            start: '2019-12-23'
          },
          {
            title: 'U of W',
            start: '2020-01-15'
          }
        ]
      } catch (error) {
        this.error = error.response.data.error
      }
    },
    async getLegend () {
      // const response = await CalendarService.getLegend({
      //   token: this.$store.state.token,
      //   user: this.$store.state.user
      // })
      // this.legend = response.data
      this.legend = [
        'Company1', 'Company2', 'Company3'
      ]
    },
    // when an event is clicked this funciton is called
    eventClick: async function (info) {
      // let contractId = info.event.extendedProps.contractid
      // let response = await CalendarService.getContractInfo({
      //   token: this.$store.state.token,
      //   contractId: contractId
      // })
      // this.eventInfo = response.data
      this.eventInfo = [
        {
          test: 'test'
        }
      ]
      this.dialog = true
    }
  }
}
</script>

<style lang='scss'>
@import '@fullcalendar/core/main.css';
@import '@fullcalendar/daygrid/main.css';
@import '@fullcalendar/timegrid/main.css';
.demo-app {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
  margin-top: 1%;
  margin-bottom: 2.5%;
}
.calendar {
  margin: 0 auto;
  max-width: 87%;
}
.fc-button .fc-icon {
  vertical-align: bottom;
}
#container {
  height: 100%;
}
.container {
  padding-bottom: 0%;
}
#redoe {
  color: #B78F2F;
}
#pangeo {
  color: #0075b3;
}
#porter {
  color: #3D556E;
}
h4 {
  font-weight: normal;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  text-align: left;
  padding: 8px;
}
</style>
