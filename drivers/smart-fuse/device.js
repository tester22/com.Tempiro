'use strict';

const { CLUSTER } = require('zigbee-clusters');
const { ZigBeeDevice } = require('homey-zigbeedriver');

const { debug } = require('zigbee-clusters');

// Enable debug logging of all relevant Zigbee communication
debug(true);

class TempiroSmartFuseDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    this.printNode();
    // Register onoff capability
    this.registerCapability('onoff', CLUSTER.ON_OFF);
    
    // Migration step, adds measure_battery capability if not already available
    if (!this.hasCapability('alarm_battery')) {
      await this.addCapability('alarm_battery');
    }
        
    if (typeof this.meteringFactor !== 'number') {
    const { multiplier, divisor } = await zclNode.endpoints[
        this.getClusterEndpoint(CLUSTER.METERING)
      ]
      .clusters[CLUSTER.METERING.NAME]
      .readAttributes('multiplier', 'divisor');
  
    this.meteringFactor = multiplier / divisor;
   }
   
   if (typeof this.activePowerFactor !== 'number') {
    const { acPowerMultiplier, acPowerDivisor } = await zclNode.endpoints[
        this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT)
      ]
      .clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME]
      .readAttributes('acPowerMultiplier', 'acPowerDivisor');
  
    this.activePowerFactor = acPowerMultiplier / acPowerDivisor;
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
