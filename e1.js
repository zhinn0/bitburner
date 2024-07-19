/** @param {NS} ns */
export async function main(ns) {
  const Host = ns.getHostname()
  const Target = ns.args[0]
  const DrainPer = ns.args[1]
  const MinSec = ns.getServerMinSecurityLevel(Target)
  const MaxMon = ns.getServerMaxMoney(Target)
  let CurSec = ns.getServerSecurityLevel(Target)
  let CurMon = ns.getServerMoneyAvailable(Target)
  let wthreads = 0 // Weaken threads for initial slam
  let gthread = 0
  let wgthread = 0
  let growthanalyzethreads = 0 // variable as part of calculating how many growth threads needed

  function FreeRam() { return ns.getServerMaxRam(Host) - ns.getServerUsedRam(Host) }
  //Preparing the server with weaken and grow
  while (CurSec > MinSec) { //Full weaken of server
    if (Math.floor((FreeRam()) / 1.75) > 0) {
      if (Math.ceil((CurSec - MinSec) / 0.05) * 1.75 < FreeRam()) { wthreads = Math.ceil((CurSec - MinSec) / 0.05) }
      else { wthreads = Math.floor(FreeRam() / 1.75) }
      ns.exec("/opti/w.js", Host, wthreads, Target)
      await ns.asleep(ns.getWeakenTime(Target))
    } else { await ns.asleep(10000) } //If we don't have any RAM free, wait 10 seconds before trying again
    CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
  }
  while (CurMon < MaxMon) { //Check money then grow if not max
    /*Find ratio of threads between weaken and grow. Ratio is simple:
    Weaken threads is Growth Security Increase divided by sum of Growth Security Increase + Weaken Securit reduction
    Growth threads is Weaken Security Reduction divided by sum of Growth Security Increase + Weaken Securit reduction*/
    growthanalyzethreads = 0 
    if (CurMon > 0) {
      growthanalyzethreads = ns.growthAnalyze(Target, MaxMon / ns.getServerMoneyAvailable(Target))
    } else {growthanalyzethreads = ns.growthAnalyze(Target, MaxMon / (ns.getServerMoneyAvailable(Target)+1))}
    if ((Math.ceil(growthanalyzethreads * 1.75)) + (Math.ceil(growthanalyzethreads * (ns.growthAnalyzeSecurity(1, Target) / 0.05) * 1.75)) > FreeRam()) {
      gthread = Math.floor(0.05 / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam() / 1.75)
      wgthread = Math.ceil(ns.growthAnalyzeSecurity(1, Target) / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam() / 1.75)
    }
    else {
      gthread = Math.ceil(growthanalyzethreads)
      wgthread = Math.ceil(growthanalyzethreads * (ns.growthAnalyzeSecurity(1, Target) / 0.05))
    }
    if ((gthread > 0) && (wgthread > 0)) {
      ns.exec("/opti/g.js", Host, gthread, Target)
      ns.exec("/opti/w.js", Host, wgthread, Target)
      await ns.asleep(ns.getWeakenTime(Target))//Wait until weaken is done
    } else { await ns.asleep(10000) }//If we don't have any RAM free, wait 10 seconds before tring again
    CurMon = ns.getServerMoneyAvailable(Target) //Update Current Money score for loop
    CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
  }

function hgwthreads(){
    let threads = []
    let hat = ns.hackAnalyzeThreads(Target, ns.getServerMoneyAvailable(Target) * DrainPer)
    let gat = ns.growthAnalyze(Target, 1/(1-DrainPer))
    threads[3] = Math.ceil(hat*1.7+hat/25*1.75+gat*1.75+gat/12.5*1.75)
    if (threads[3]>FreeRam()){
      threads[0]=Math.floor(FreeRam() / 1.7 * 50 / 79)
      threads[1]=Math.floor(FreeRam() / 1.75 * 25 / 79)
      threads[2]=Math.ceil(FreeRam() / 1.75 * 4 / 79)
    }
    else {
      threads[0] = Math.floor(hat)
      threads[1] = Math.ceil(gat)
      threads[2] = Math.ceil(hat/25+gat/12.5)
    }
    return threads
}

  while (true) {
    if (hgwthreads()[0]>0) {
      ns.exec("/opti/h.js", Host, hgwthreads()[0], Target)
      ns.exec("/opti/g.js", Host, hgwthreads()[1], Target)
      ns.exec("/opti/w.js", Host, hgwthreads()[2], Target)
      await ns.asleep(ns.getWeakenTime(Target))
    } else { await ns.asleep(10000) }
  }
}
