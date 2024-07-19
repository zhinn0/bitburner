/** @param {NS} ns */
import { FreeRam } from "/funcs/zhinn-library.js"
import { HGWTnoform } from "/funcs/zhinn-library.js"
//HGWTnoform[0] = Threads for Hack to DrainPer % of Max Money value
//HGWTnoform[1] = Threads for Grow back to Max Money
//HGWTnoform[2] = Threads for Weaken back to Min Security
//HGWTnoform[3] = Total RAM cost of one HGW batch
import { SlamTiming } from "/funcs/zhinn-library.js"
//SlamTiming[0] = # of batches than can be concurrently run given host server's RAM
//SlamTiming[1] = Delay between batches to max our available RAM
export async function main(ns) {
  const Target = ns.args[0]
  const Host = ns.getHostname()
  const DrainPer = ns.args[1] //percent to take Money down to
  let threads = HGWTnoform(ns, Target, Host, DrainPer)
  let totalbatches = SlamTiming(ns, Target, Host, threads[3])[0]
  let batchdelay = SlamTiming(ns, Target, Host, threads[3])[1]
  ns.tprint('Threads & RAM for ' + DrainPer * 100 + '% of Money from ' + Target + ' per run')
  ns.tprint('Hack Threads: ' + threads[0])
  ns.tprint('Grow Threads: ' + threads[1])
  ns.tprint('Weaken Threads: ' + threads[2])
  ns.tprint('Ram needed for 1 HGW run on ' + Target + ': ' + threads[3])
  ns.tprint('Number of batches that can be concurrently run: ' + totalbatches)
  ns.tprint('Time to delay between batches: ' + batchdelay)
}
