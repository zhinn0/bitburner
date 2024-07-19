/** @param {NS} ns */
import { spider } from "/funcs/zhinn-library.js"
export async function main(ns) {
  let serversSeen = spider(ns)
  const serverobject = serversSeen.map(hostname => {
    return {
      servername: hostname,
      servermaxmoney: ns.getServerMaxMoney(hostname),
      serverminsecurity: ns.getServerMinSecurityLevel(hostname),
    }
  })
  serverobject.sort((a, b) => b.servermaxmoney - a.servermaxmoney)
  for (let k = ns.getPurchasedServers().length; k < serverobject.length; k++) {
    if ((ns.hasRootAccess(serverobject[k].servername)) &&
      (serverobject[k].servermaxmoney > 0)) {
      ns.exec('e1.js', ns.args[0], 1, serverobject[k].servername)
    }
  }
}
