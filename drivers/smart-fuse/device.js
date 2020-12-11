'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

class TempiroSmartFuseDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // enable debugging
    // this.enableDebug();

    // Enables debug logging in zigbee-clusters
    // debug(true);

    // print the node's info to the console
    // this.printNode();

    if (!this.hasCapability('measure_power')) {
      this.addCapability('measure_power');
    }
    if (!this.hasCapability('meter_power')) {
      this.addCapability('meter_power');
    }
    if (!this.hasCapability('alarm_battery')) {
      this.addCapability('alarm_battery');
    }
    if (!this.hasCapability('alarm_fuse')) {
      this.addCapability('alarm_fuse');
    }

    if (this.getCapabilityValue('alarm_fuse') == null) {
      this.setCapabilityValue('alarm_fuse', false);
    }

    if (this.getCapabilityValue('alarm_battery') == null) {
      this.setCapabilityValue('alarm_battery', false);
    }

    if (this.getCapabilityValue('meter_power') == null) {
      this.setCapabilityValue('meter_power', 0.0);
    }

    if (this.getCapabilityValue('measure_power') == null) {
      this.setCapabilityValue('measure_power', 0.0);
    }

    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0, // No minimum reporting interval
            maxInterval: 43200, // Maximally every ~12 hours
            minChange: 1,
          },
        },
        endpoint: this.getClusterEndpoint(CLUSTER.ON_OFF),
      });
    }

    zclNode.endpoints[1].clusters.metering.on('attr.currentSummationDelivered', currentMetering => {
      const parsedMetering = currentMetering / this.getSetting('meassureFactor');
      // Do something with the received attribute report
      this.log(`Reported metering value ${currentMetering}`);
      this.setCapabilityValue('meter_power', parsedMetering);
    });

    zclNode.endpoints[1].clusters.metering.on('attr.instantaneousDemand', currentDemand => {
      // Do something with the received attribute report
      this.log(`Reported demand ${currentDemand}`);
      if (currentDemand === -10) {
        this.log('battery alarm');
        this.setCapabilityValue('alarm_battery', true);
      } else if (currentDemand === -20) {
        if (this.getSetting('reportfuse') === true) {
          this.log('fuze alarm');
          this.setCapabilityValue('alarm_fuse', true);
        }
      } else if (currentDemand === -30) {
        this.log('battery alarm');
        this.setCapabilityValue('alarm_battery', true);
        if (this.getSetting('reportfuse') === true) {
          this.log('fuze alarm');
          this.setCapabilityValue('alarm_fuse', true);
        }
      } else {
        const parsedDemand = currentDemand / this.getSetting('activePowerFactor');
        this.setCapabilityValue('alarm_battery', false);
        this.setCapabilityValue('alarm_fuse', false);
        this.setCapabilityValue('measure_power', parsedDemand);
      }
    });
  }

  async onSettings(oldSettingsObj, newSettingsObj, changedKeysArr){
    // If reportfuse is changes set value to null
    if (changedKeysArr.includes("reportfuse")) {
      this.setCapabilityValue('alarm_fuse', null);
    }
  }

}
/*
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ZigBeeDevice has been inited
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ------------------------------------------
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] Node: 891cdbe2-2c76-4a94-808d-4e383b580ba5
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] - Battery: true
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] - Endpoints: 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] -- Clusters:
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- zapp
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- genBasic
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- cid : genBasic
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- sid : attrs
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- zclVersion : 1
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- appVersion : 1
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- stackVersion : 2
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- hwVersion : 1
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- manufacturerName : Tem
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- modelId : ZHA-SmartPlug40
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- dateCode : 20180203
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- powerSource : 3
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- alarmMask : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- swBuildId : 4000-0001
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- genPowerCfg
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- cid : genPowerCfg
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- sid : attrs
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- genIdentify
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- cid : genIdentify
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- sid : attrs
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- identifyTime : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- identifyCommissionState : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- genGroups
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- cid : genGroups
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- sid : attrs
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- nameSupport : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- genOnOff
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- cid : genOnOff
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- sid : attrs
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- onOff : 1
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] --- seMetering
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- cid : seMetering
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- sid : attrs
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- currentSummDelivered : [ 0, 11 ]
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- currentMaxDemandDelivered : [ 0, 0 ]
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- status : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- unitOfMeasure : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- summaFormatting : 127
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- meteringDeviceType : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ---- instantaneousDemand : 0
2020-11-02 08:57:49 [log] [ManagerDrivers] [smart-fuse] [0] ------------------------------------------

*/

module.exports = TempiroSmartFuseDevice;
