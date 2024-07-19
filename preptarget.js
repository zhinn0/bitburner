/** @param {NS} ns */
import { FreeRam } from '/funcs/zhinn-library.js'
export async function main(ns) {
  const Host = ns.getHostname()
  const Target = ns.args[0]
  const MinSec = ns.getServerMinSecurityLevel(Target)
  const MaxMon = ns.getServerMaxMoney(Target)
  let wthreads = 0 // Weaken threads for initial slam
  let gthread = 0
  let wgthread = 0
  let growthanalyzethreads = 0 // variable as part of calculating how many growth threads needed
  let CurSec = ns.getServerSecurityLevel(Target)
  let CurMon = ns.getServerMoneyAvailable(Target)
  //Preparing the server with weaken and grow
  //Later optimization - updated logic for # of cores? How do cores work?
  while (CurSec > MinSec) { //Full weaken of server
    if (Math.floor((FreeRam(ns,Host)) / 1.75) > 0) {
      wthreads = Math.ceil((CurSec - MinSec) / 0.05)
      if (wthreads * 1.75 < FreeRam(ns,Host)) { ns.exec("/opti/w.js", ns.getHostname(), wthreads, Target) }
      else { ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam(ns,Host) / 1.75), Target) }
      //Given using max free ram to weaken, sleep until complete to avoid running next section without any ram available
      await ns.asleep(ns.getWeakenTime(Target) + 400)
    } else { await ns.asleep(10000) } //If we don't have any RAM free, wait 10 seconds before tring again
    CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
  }
  ns.tprint(Target+' is fully weakened.')
  while (CurMon < MaxMon) { //Check money then grow if not max
    /*Find ratio of threads between weaken and grow. Ratio is simple:
    Weaken threads is Growth Security Increase divided by sum of Growth Security Increase + Weaken Securit reduction
    Growth threads is Weaken Security Reduction divided by sum of Growth Security Increase + Weaken Securit reduction*/
    growthanalyzethreads = 0
    if (CurMon > 0) {growthanalyzethreads = ns.growthAnalyze(Target, MaxMon / CurMon)}
    else {growthanalyzethreads = ns.growthAnalyze(Target, MaxMon / (CurMon+1))}
    if ((Math.ceil(growthanalyzethreads) * 1.75) + (Math.ceil(growthanalyzethreads * (ns.growthAnalyzeSecurity(1, Target) / 0.05)) * 1.75) > FreeRam(ns,Host)) {
      gthread = Math.floor(0.05 / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam(ns,Host) / 1.75)
      wgthread = Math.floor(ns.growthAnalyzeSecurity(1, Target) / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam(ns,Host) / 1.75)
    }
    else {
      gthread = Math.ceil(growthanalyzethreads)
      wgthread = Math.ceil(growthanalyzethreads * (ns.growthAnalyzeSecurity(1, Target) / 0.05))
    }
    ns.print('gthread '+gthread)
    if ((gthread > 0) && (wgthread > 0)) {
      ns.exec("/opti/g.js", ns.getHostname(), gthread, Target)
      ns.exec("/opti/w.js", ns.getHostname(), wgthread, Target)
      await ns.asleep(ns.getWeakenTime(Target) + 400)//Wait until weaken is done
    } else { await ns.asleep(10000) }//If we don't have any RAM free, wait 10 seconds before tring again
    CurMon = ns.getServerMoneyAvailable(Target) //Update Current Money score for loop
    CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
  }
  ns.tprint(Target+' has max money.')
  //ns.tprint(ns.getHostname() + ' beginning Slam6 on ' + Target)
  //ns.spawn('slam6.js', 1, Target)
}
