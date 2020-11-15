'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

class TempiroSmartFuseDevice extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // enable debugging
    this.enableDebug();

    // Enables debug logging in zigbee-clusters
    debug(true);

    // print the node's info to the console
    this.printNode();

    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF, {
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0, // No minimum reporting interval
            maxInterval: 43200, // Maximally every ~12 hours
            minChange: 1, // Report when value changed by 5
          },
        },
        endpoint: this.getClusterEndpoint(CLUSTER.ON_OFF),
      });
    }

    // measure_power
    if (this.hasCapability('measure_power')) {
      this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, {
        getOpts: { getOnStart: false },
        endpoint: this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT),
      });
    }

    if (this.hasCapability('meter_power')) {
      this.registerCapability('meter_power', CLUSTER.METERING, {
        getOpts: { getOnStart: false },
        endpoint: this.getClusterEndpoint(CLUSTER.METERING),
      });
    }

    // Try to initialize AttributeReporting for electricaMeasurement and metering clusters
    try {
      await this._configureMeterAttributeReporting({ zclNode });
    } catch (err) {
      this.error('failed to configure AttributeReporting', err);
    }
  }

  async _configureMeterAttributeReporting({ zclNode }) {
    this.debug('--  initializing attribute reporting for the electricaMeasurement cluster');

    const electricalMeasurementAttributeArray = [];

    // Define the relevant attributes to read depending on the defined capabilities and availability of the factors in the Store
    const attributesToRead = [];
    /*
    if (this.hasCapability('measure_power') && typeof this.getStoreValue('activePowerFactor') !== 'number') {
      attributesToRead.push('acPowerMultiplier', 'acPowerDivisor');
    }
    */

    // Actually read the required attributes
    if (attributesToRead.length !== 0) {
      //var attrs = await this.zclNode.endpoints[this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT)].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].readAttributes(...attributesToRead);
      this.debug('--- Read reporting divisors and multipliers:', attrs);
    }

    // Re-iterate over the different capabilities and define the required report factors, add them to the Array and store them.
    if (this.hasCapability('measure_power')) {
      //if (typeof this.getStoreValue('activePowerFactor') !== 'number') {
        this.activePowerFactor = 1;
        //this.setStoreValue('activePowerFactor', this.activePowerFactor);
        electricalMeasurementAttributeArray.push({
          cluster: CLUSTER.ELECTRICAL_MEASUREMENT,
          attributeName: 'activePower',
          minInterval: 0,
          maxInterval: 300,
          minChange: 1 / this.activePowerFactor,
          endpointId: this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT),
        });
      //} else {
      //  this.activePowerFactor = this.getStoreValue('activePowerFactor');
      //}
    }

    // When there are Attributes to be configured, configure them
    if (electricalMeasurementAttributeArray.length !== 0) {
      await this.configureAttributeReporting(electricalMeasurementAttributeArray);
    }

    this.debug('--  initializing attribute reporting for the metering cluster');
    const meteringAttributeArray = [];

    if (this.hasCapability('meter_power')) {
      //if (typeof this.getStoreValue('meteringFactor') !== 'number') {
        //const { multiplier, divisor } = await this.zclNode.endpoints[this.getClusterEndpoint(CLUSTER.METERING)].clusters[CLUSTER.METERING.NAME].readAttributes('multiplier', 'divisor');
        this.meteringFactor = 1;
        this.setStoreValue('meteringFactor', this.meteringFactor);
        meteringAttributeArray.push({
          cluster: CLUSTER.METERING,
          attributeName: 'currentSummationDelivered',
          minInterval: 0,
          maxInterval: 300,
          minChange: 0.01 / this.meteringFactor,
          endpointId: this.getClusterEndpoint(CLUSTER.METERING),
        });
      //} else {
      //  this.meteringFactor = this.getStoreValue('meteringFactor');
      //}
    }

    if (meteringAttributeArray.length !== 0) {
      await this.configureAttributeReporting(meteringAttributeArray);
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
