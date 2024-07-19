/** @param {NS} ns */
import { serversort } from "/funcs/zhinn-library.js"
export async function main(ns) {
  //ns.tprint('Purchased servers: '+ns.getPurchasedServers().length)
  //Skip p0 so we can use it for other stuff, we'll use home for biggest moneymaker as most RAM
  let servers = serversort(ns)
  /*for (let h=0;h<servers.length;h++){
    if (!servers[h].servermaxmoney>0){delete servers[h]}
  }*/
  for (let i = 0; i < servers.length; i++) {
    if ((servers[i].servermaxmoney > 0) && (ns.getServerMaxRam(servers[i].servername) > 2.4)) {
      if (ns.scriptRunning('mho.js', servers[i].servername)) { continue }
      ns.killall(servers[i].servername)
      //await preptarget(ns, serverobject[i].servername)
      ns.scp('/archive/mho.js', servers[i].servername)
      let mhothreads = Math.floor(ns.getServerMaxRam(servers[i].servername) / 2.4)
      ns.exec('/archive/mho.js', servers[i].servername, mhothreads, servers[i].servername)
      //ns.tprint(+' prepping '+servers[i].servername)
    }
  }
}
