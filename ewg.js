/** @param {NS} ns */
import { serversort } from "/funcs/zhinn-library.js"
export async function main(ns) {
  let servers = serversort(ns)
  let threads
  let runs
  for (let i = 0; i < servers.length; i++) {
    if ((servers[i].servermaxmoney > 0) && (ns.getServerMaxRam(servers[i].servername) > 1.75) && (ns.getServerSecurityLevel(servers[i].servername) > servers[i].serverminsecurity)) {
      if ((ns.scriptRunning('/opti/fullweaken.js', servers[i].servername)) ||
      (ns.scriptRunning('/opti/fullgrow.js', servers[i].servername))) { continue }
      ns.killall(servers[i].servername)
      ns.scp('/opti/fullweaken.js', servers[i].servername)
      threads = Math.floor(ns.getServerMaxRam(servers[i].servername) / 1.75)
      runs = Math.ceil(Math.ceil((ns.getServerSecurityLevel(servers[i].servername) - servers[i].serverminsecurity) / 0.05) / threads)
      let timetaken = ns.getWeakenTime(servers[i].servername)
      ns.exec('/opti/fullweaken.js', servers[i].servername, threads, servers[i].servername, runs)
      ns.tprint('Weakening ' + servers[i].servername + ' with ' + threads + ' threads for ' + runs + ' cycles. Finished in ' + timetaken + ' Seconds.')
    } else if ((servers[i].servermaxmoney > 0) && (ns.getServerMaxRam(servers[i].servername) > 1.75) && (ns.getServerMoneyAvailable(servers[i].servername) < servers[i].servermaxmoney)) {
        if (ns.scriptRunning('/opti/fullgrow.js', servers[i].servername)) { continue }
      ns.killall(servers[i].servername)
      ns.scp('/opti/fullgrow.js', servers[i].servername)
      threads = Math.floor(ns.getServerMaxRam(servers[i].servername) / 1.75)
      if (ns.getServerMoneyAvailable(servers[i].servername)>0){
        runs = Math.ceil(Math.ceil(ns.growthAnalyze(servers[i].servername, servers[i].servermaxmoney/ns.getServerMoneyAvailable(servers[i].servername))) / threads)
      }else{runs=ns.growthAnalyze(servers[i].servername, servers[i].servermaxmoney/(ns.getServerMoneyAvailable(servers[i].servername)+1))}
      
      let timetaken = ns.getGrowTime(servers[i].servername)
      ns.exec('/opti/fullgrow.js', servers[i].servername, threads, servers[i].servername, runs)
      ns.tprint('Growing ' + servers[i].servername + ' with ' + threads + ' threads for ' + runs + ' cycles. Finished in ' + timetaken + ' Seconds.')
    }
  }
}
