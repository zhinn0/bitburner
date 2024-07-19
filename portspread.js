import { FreeRam } from "/funcs/zhinn-library.js"
import { HGWTnoform } from "/funcs/zhinn-library.js"

export async function main(ns) {
  const Target = ns.args[0]
  //const Host = ns.getHostname()
  const DrainPer = ns.args[1] //percent to take Money down to
  let threads
  ns.disableLog('asleep')
  ns.disableLog('getServerMaxRam')
  ns.disableLog('getServerUsedRam')
  ns.disableLog('getHackingLevel')
  ns.disableLog("getServerMoneyAvailable")
  /*spread.push({
    "servername": Host,
    "runs": Math.floor((FreeRam(ns, Host)) / threads[3]) //How many HGW batches can host run
  })*/ //skipping home, just doing pservers
  let spread = ns.getPurchasedServers()
  threads = HGWTnoform(ns, Target, spread[0], DrainPer)
  function spawnbatch(ns, threads, Target, Host) {
    ns.exec("/opti/h.js", Host, threads[0], Target, 0.75 * ns.getWeakenTime(Target))
    ns.exec("/opti/g.js", Host, threads[1], Target, 0.2 * ns.getWeakenTime(Target))
    ns.exec("/opti/wport.js", Host, threads[2], Target, 0, ns.pid, Host)

  }
  while (true) { //To infinity and billions of $
    const port = ns.getPortHandle(ns.pid)
    //initial setup
    let nextSleep = performance.now() + 200
    for (let h = 0; h < spread.length; h++) {//iterate through all servers to be used to attack
      //threads = HGWTnoform(ns, Target, spread[h], DrainPer)
      while (FreeRam(ns, spread[h]) > threads[3]) {
        spawnbatch(ns, threads, Target, spread[h])
        if (nextSleep < performance.now()) { await ns.sleep(0); nextSleep = performance.now() + 200 }
      }
    }
    //reload
    while (true) {
      await port.nextWrite()
      //let phost = port.read()
      spawnbatch(ns, threads, Target, port.read())
      //await ns.sleep(0)
    }
  }
}
