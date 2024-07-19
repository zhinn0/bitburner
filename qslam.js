/** @param {NS} ns */
import { spider } from "/funcs/zhinn-library.js"
export async function main(ns) {

  let serverobject = spider(ns).map(hostname => {
    return {
      servername: hostname,
      servermaxmoney: ns.getServerMaxMoney(hostname),
      serverhacklevel: ns.getServerRequiredHackingLevel(hostname),
    } 
  })
  serverobject.sort((a, b) => b.servermaxmoney - a.servermaxmoney)
  serverobject = serverobject.filter((a) => a.serverhacklevel <= ns.getHackingLevel())
  serverobject = serverobject.filter((a) => a.servermaxmoney > 0)
  ns.tprint(serverobject)
  //put a high value target on each pServer
  for (let i = 0; i < ns.getPurchasedServers().length; i++) {
    let serverN = 'p' + i
    ns.killall(serverN)
    ns.exec('ptargetprepper.js', serverN, 1, serverN, serverobject[i].servername)
  }
  ns.tprint('qslam finished executing')
}
