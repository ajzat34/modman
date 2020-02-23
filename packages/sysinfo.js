const os = require('os')
const si = require('systeminformation')

module.exports.printname = 'System Info'
module.exports.callname = 'sysinfo'
module.exports.version = '0.1.0'

// load static info from system information
var hw = {}
si.system().then(function(data){
  hw.manufacturer = data.manufacturer
  hw.model = data.model
  hw.version = data.version
})
si.cpu().then(function(data){
  hw.cpu = {
    manufacturer: data.manufacturer,
    model: data.model,
    brand: data.brand,
    speed: data.speed,
    clockrange: {
      min: data.speedmin,
      max: data.speedmax,
    },
    governor: data.governor,
    cores: data.cores,
    physicalCores: data.physicalCores,
    processors: data.processors,
  }
})

module.exports.actions = {
  hostname: os.hostname(),
  platform: os.platform(),
  arch: os.arch(),

  uptime: function(){return os.uptime()},
  loadavg: function(){return os.loadavg()},

  timezone: si.time().timezone,
  hardware: hw,

  cpu_speed: async function(){
    var d = await si.cpuCurrentspeed()
    return {
      average: d.avg,
      min: d.min,
      max: d.max,
      cores: d.cores,
    }
  },

  cpu_temp: async function() {
    var d = await si.cpuTemperature()
    return {
      average: d.main,
      max: d.max,
      cores: d.cores,
    }
  },

  cpu_load: async function() {
    var d = await si.currentLoad()
    return {
      total: d.currentload,
      system: d.currentload_system,
      user: d.currentload_user,
    }
  },

  memory: async function() {
    var d = await si.mem()
    return {
      total: d.total,
      free: d.free,
      used: d.used,
      active: d.active,
      available: d.available,
      swap: {
        total: d.swaptotal,
        free: d.swapfree,
      }
    }
  },

  battery: async function(){
    var d = await si.battery()
    return {
      hasBattery: d.hasbattery,
      cyclecount: d.cyclecount,
      percent: d.percent,
      charging: d.ischarging,
      power_connected: d.acconnected,
    }
  },

  disks: async function() {
    // read physical data
    var d = await si.diskLayout()
    var p = []
    for (var i in d) {
      var n = d[i]
      p.push({
        device: n.device,
        type: n.type,
        name: n.name,
        vendor: n.vendor,
        size: n.size,
        smart: n.smartStatus,
      })
    }

    // read logical data
    d = await si.fsSize()
    var l = []
    for (var i in d){
      var n = d[i]
      l.push({
        name: n.fs,
        type: n.type,
        size: n.size,
        used: n.used,
        mount: n.mount,
      })
    }
    // send the response
    return {
      physical: p,
      logical: l
    }
  },

  network: async function() {
    var d = await si.networkInterfaces()
    var l = {}
    for (var i in d){
      var n = d[i]
      l[n.iface] = {
        iface: n.iface,
        type: n.type,
        duplex: n.duplex,
        speed: n.speed,
        ipv4_address: n.ip4,
        ipv6_address: n.ip6,
        internal: n.internal,
        virtual: n.virtual,
        state: n.operstate,
      }
    }
    return {
      interfaces: l,
      default_interface: await si.networkInterfaceDefault(),
      default_gateway: await si.networkGatewayDefault(),
    }
  },

  wifi: async function() {
    var d = await si.wifiNetworks()
    var l = []
    for (var i in d) {
      var n = d[i]
      l.push({
        ssid: n.ssid,
        mode: n.mode,
        channel: n.channel,
        quality: n.quality,
        security: n.security,
      })
    }
    return l
  },
}
