/** @param {NS} ns */
import { HGWTnoform } from "/funcs/zhinn-library.js"
//HGWTnoform[0] = Threads for Hack to 95% of Max Money value
//HGWTnoform[1] = Threads for Grow back to Max Money, uses formulas API
//HGWTnoform[2] = Threads for Weaken back to Min Security
//HGWTnoform[3] = Total RAM cost of one HGW batch
import { SlamTiming } from "/funcs/zhinn-library.js"
//SlamTiming[0] = # of batches than can be concurrently run given host server's RAM
//SlamTiming[1] = Delay between batches to max our available RAM

export async function main(ns) {
  const Target = ns.args[0]; const Host = ns.getHostname(); const DrainPer = ns.args[1]; //percent to take Money down to
  let threads = HGWTnoform(ns, Target, Host, DrainPer)
  let slamtiming = SlamTiming(ns, Target, Host, threads[3])
  while (true) { //To infinity and billions of $
    for (let i = 0; i < slamtiming[0]; i++) { //for loop to slam out max RAM use
      if ((threads[0] > 0) && (threads[1] > 0)) {
        ns.exec("/opti/h.js", Host, threads[0], Target, .75 * ns.getWeakenTime(Target))//- ns.getHackTime(Target))
        ns.exec("/opti/g.js", Host, threads[1], Target, .2 * ns.getWeakenTime(Target))//- ns.getGrowTime(Target))
        ns.exec("/opti/w.js", Host, threads[2], Target)
        await ns.asleep(slamtiming[1])
      }
    }
  }
}
