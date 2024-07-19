/** @param {NS} ns */
import { serversort } from "/funcs/zhinn-library.js"
export async function main(ns) {
  //ns.tprint('Purchased servers: '+ns.getPurchasedServers().length)
  //Skip p0 so we can use it for other stuff, we'll use home for biggest moneymaker as most RAM
  for (let i = 1; i < ns.getPurchasedServers().length; i++) {
    let serverN = 'p' + i
    ns.killall(serverN)
    //await preptarget(ns, serverobject[i].servername)
    ns.exec('preptarget.js', serverN, 1, serversort[i].servername)
    ns.tprint(ns.getHostname()+' prepping '+serversort[i].servername)
  }
}
