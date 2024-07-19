/** @param {NS} ns */
import { FreeRam } from "/funcs/zhinn-library.js"
import { HGWTnoform } from "/funcs/zhinn-library.js"
//HGWTnoform[0] = Threads for Hack to DrainPer % of Max Money value
//HGWTnoform[1] = Threads for Grow back to Max Money
//HGWTnoform[2] = Threads for Weaken back to Min Security
//HGWTnoform[3] = Total RAM cost of one HGW batch
export async function main(ns) {
  ns.disableLog("ALL")
  const Target = ns.args[0]; const Host = ns.getHostname(); const DrainPer = ns.args[1] //percent to take Money down to
  let threads = HGWTnoform(ns, Target, Host, DrainPer)
  //let batchlimit = 400000
  //let hackoffset=0.75 * ns.getWeakenTime(Target)
  //let growthoffset=0.2 * ns.getWeakenTime(Target)
  function spawnbatch(ns, threads, Target, Host) {
    let hackoffset = 0.75 * ns.getWeakenTime(Target)
    let growthoffset = 0.2 * ns.getWeakenTime(Target)
    ns.exec("/opti/h.js", Host, threads[0], Target, hackoffset)
    ns.exec("/opti/g.js", Host, threads[1], Target, growthoffset)
    ns.exec("/opti/wport.js", Host, threads[2], Target, 0, ns.pid)
  }
  //let batchcounter = 0
  while (true) { //To infinity and billions of $
    const port = ns.getPortHandle(ns.pid)
    //initial setup
    let nextSleep = performance.now() + 400
    while (FreeRam(ns, Host) > threads[3]) {
      spawnbatch(ns, threads, Target, Host)
      if (nextSleep < performance.now()) {
        await ns.sleep(0)
        nextSleep = performance.now() + 400
      }
      //batchcounter++
      //if (batchcounter>=batchlimit){await port.nextWrite();batchcounter--}
    }
    //reload
    while (true) {
      await port.nextWrite()
      port.read()
      spawnbatch(ns, threads, Target, Host)
    }
  }
}
