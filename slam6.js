/** @param {NS} ns */
import { HGWTnoform } from "/funcs/zhinn-library.js"
//HGWthreads[0] = Threads for Hack to 95% of Max Money value
//HGWthreads[1] = Threads for Grow back to Max Money, uses formulas API
//HGWthreads[2] = Threads for Weaken back to Min Security
//HGWthreads[3] = Total RAM cost of one HGW batch
import { SlamTiming } from "/funcs/zhinn-library.js"
//SlamTiming[0] = # of batches than can be concurrently run given host server's RAM
//SlamTiming[1] = Delay between batches to max our available RAM

export async function main(ns) {
  const Target = ns.args[0]
  const Host = ns.getHostname()
  let threads = HGWTnoform(ns, Target, Host, ns.args[1])
  let slamtiming = SlamTiming(ns, Target, Host, threads[3])
  if (slamtiming[0] == 0) {slamtiming = [1, ns.getWeakenTime(Target)]}
    ns.tprint(threads)
    ns.tprint(slamtiming)
    while (true) { //To infinity and billions of $
      threads = HGWTnoform(ns, Target, Host, ns.args[1])
      slamtiming = SlamTiming(ns, Target, Host, threads[3])
      if (slamtiming[0] == 0) {slamtiming = [1, ns.getWeakenTime(Target)]}
        let delay = 0 //Delay to add to the end execution time of each HGW cycle
        for (let i = 0; i < slamtiming[0]; i++) //for loop to slam out max RAM use
          if ((threads[0] > 0) && (threads[1] > 0)) {
            ns.exec("/opti/h.js", Host, threads[0], Target, ns.getWeakenTime(Target) - ns.getHackTime(Target) + delay)
            ns.exec("/opti/g.js", Host, threads[1], Target, ns.getWeakenTime(Target) - ns.getGrowTime(Target) + delay)
            ns.exec("/opti/w.js", Host, threads[2], Target, delay)
            delay += slamtiming[1]
          }
        /*await ns.asleep(slamtiming[1]) // wait a timing cycle before starting again, keep timing aligned. Works so far
        ns.exec("/opti/g.js", Host, threads[1], Target)
        ns.exec("/opti/w.js", Host, threads[2], Target)*/
        await ns.asleep(slamtiming[1] + 20)
      }
    }
