/** @param {NS} ns */
export function FreeRam(ns, Host) {
  return ns.getServerMaxRam(Host) - ns.getServerUsedRam(Host)
}

export function spider(ns) {
  // Return an array of all identifiable servers
  // Create a serversSeen array, containing only host for now
  let serversSeen = [ns.getHostname()]
  // For every server we've seen so far, do a scan
  for (let i = 0; i < serversSeen.length; i++) {
    let thisScan = ns.scan(serversSeen[i])
    // Loop through results of the scan, and add any new servers
    for (let j = 0; j < thisScan.length; j++) {
      // If this server isn't in serversSeen, add it
      if (serversSeen.indexOf(thisScan[j]) === -1) {
        serversSeen.push(thisScan[j])
      }
    }
  }
  return serversSeen;
}

export function serversort(ns) {
  //this function sorts all servers you've crawled via spider by Max Money
  let serversSeen = spider(ns) //call your crawled list of servers
  //construct an object consisting all all servers, max money, and min security
  const serverobject = serversSeen.map(hostname => {
    return {
      servername: hostname,
      servermaxmoney: ns.getServerMaxMoney(hostname),
      serverminsecurity: ns.getServerMinSecurityLevel(hostname),
    }
  })
  serverobject.sort((a, b) => b.servermaxmoney - a.servermaxmoney) //sort object by Max Money
  return serverobject
}

export function HGWthreads(ns, Target, Host) {
  //HGWthreads[0] = Threads for Hack to 95% of Max Money value
  //HGWthreads[1] = Threads for Grow back to Max Money
  //HGWthreads[2] = Threads for Weaken back to Min Security
  //HGWthreads[3] = Total RAM cost of one HGW batch
  let hgwthreads = []
  //Calculate how many threads needed to hack 95% of server money (leave buffer so that grow is more effective)
  let hackanalyzethreads = ns.hackAnalyzeThreads(Target, ns.getServerMoneyAvailable(Target) * 0.95)
  /*Determine if we have enough FreeRam to accomodate all threads needed, with a 25:1 Hack to Weaken ratio (is this the proper ratio?)
    If not enough, then simply max out 25:1 ratio. If enough, then only run enough Hack to take down to 95%; for now, spend remainder on weaken*/
  if (hackanalyzethreads * 1.7 + hackanalyzethreads / 25 * 1.75 > FreeRam(ns, Host)) {
    hgwthreads[0] = Math.floor(FreeRam(ns, Host) / 1.7 * 25 / 26)
    hgwthreads[2] = Math.floor(FreeRam(ns, Host) / 1.75 * 1 / 26)
  } else {
    hgwthreads[0] = Math.floor(hackanalyzethreads)
    hgwthreads[2] = Math.ceil(hackanalyzethreads / 25)
  }
  /*Check if enough FreeRam for grow & weaken threads, per growth to weaken security ratio
  If not enough, then simply max out at the grow to weaken security ratio
  If enough, then only run enough Growth to max out money; for now, spend remainder on weaken*/
  //Check if we get a finite answer for growthanalyze as sometimes this is rendered as infinite and crashes the script
  let gat = 0
  let growserver = ns.getServer(Target)
  growserver.moneyAvailable = 0.05 * growserver.moneyMax
  gat = ns.formulas.hacking.growThreads(growserver, ns.getPlayer(), growserver.moneyMax, ns.getServer(Host).cpuCores)
  //if (ns.getServerMoneyAvailable(Target) > 0) {
  //gat = ns.growthAnalyze(Target, MaxMon / ns.getServerMoneyAvailable(Target))
  //}
  if ((Math.ceil(gat * 1.75)) + (Math.ceil(gat * (ns.growthAnalyzeSecurity(1, Target) / 0.05) * 1.75)) > FreeRam(ns, Host)) {
    hgwthreads[1] = Math.floor(0.05 / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam(ns, Host) / 1.75)
    hgwthreads[2] += Math.ceil(ns.growthAnalyzeSecurity(1, Target) / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam(ns, Host) / 1.75)
  }
  else {
    hgwthreads[1] = Math.ceil(gat)
    hgwthreads[2] += Math.ceil(gat * (0.004 / 0.05))
  }
  hgwthreads[3] = hgwthreads[0] * 1.7 + hgwthreads[1] * 1.75 + hgwthreads[2] * 1.75
  return hgwthreads
}

export function SlamTiming(ns, Target, Host, HGWRAMcost) {
  //SlamTiming[0] = # of batches than can be concurrently run given host server's RAM
  //SlamTiming[1] = Delay between batches to max our available RAM
  let slamtiming = []
  slamtiming[0] = Math.floor(FreeRam(ns, Host) / HGWRAMcost)
  slamtiming[1] = ns.getWeakenTime(Target) / slamtiming[0]
  return slamtiming
}

export function pserverprep(ns) {
  for (let i = 0; i < ns.getPurchasedServers().length; i++) {
    let serverN = 'p' + i
    ns.scp("chsv.js", serverN, "home")
    ns.scp("m2.js", serverN, "home")
    ns.scp("/opti/w.js", serverN, "home")
    ns.scp("/opti/w.js", serverN, "home")
    ns.scp("/opti/g.js", serverN, "home")
    ns.scp("/opti/h.js", serverN, "home")
    ns.scp("/funcs/zhinn-library.js", serverN, "home")
    ns.scp("sla65.js", serverN, "home")
    ns.scp("preptarget.js", serverN, "home")
    ns.scp("eslam.js", serverN, "home")
  }
}

export async function preptarget(ns, Target) {
  const MinSec = ns.getServerMinSecurityLevel(Target)
  const MaxMon = ns.getServerMaxMoney(Target)
  let wthreads = 0
  let gthreads = 0
  let CurSec = ns.getServerSecurityLevel(Target)
  let CurMon = ns.getServerMoneyAvailable(Target)
  let Host = ns.getHostname()
  //Preparing the server with weaken and grow
  //Later optimization - updated logic for # of cores? How do cores work?
  while (CurSec > MinSec) { //Full weaken of server
    if (Math.floor((FreeRam(ns, Host)) / 1.75) > 0) {
      wthreads = Math.ceil((CurSec - MinSec) / 0.05)
      if (wthreads * 1.75 < FreeRam(ns, Host)) { ns.exec("/opti/w.js", Host, wthreads, Target) }
      else { ns.exec("/opti/w.js", Host, Math.floor(FreeRam(ns,Host) / 1.75), Target) }
      //Let cycle complete before trying again
      await ns.asleep(ns.getWeakenTime(Target) + 50)
    } else { await ns.asleep(10000) } //If we don't have any RAM free, wait 10 seconds before trying again
    CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
  }
  ns.tprint(Target + ' is fully weakened.')
  while (CurMon < MaxMon) { //Check money then grow if not max
    /*Find ratio of threads between weaken and grow. Ratio is simple:
    Weaken threads is Growth Security Increase divided by sum of Growth Security Increase + Weaken Securit reduction
    Growth threads is Weaken Security Reduction divided by sum of Growth Security Increase + Weaken Securit reduction*/
    let growthanalyzethreads = 0
    if (ns.getServerMoneyAvailable(Target) > 0) {
      growthanalyzethreads = ns.growthAnalyze(Target, MaxMon / ns.getServerMoneyAvailable(Target))
    } else { growthanalyzethreads = ns.growthAnalyze(Target, MaxMon / (ns.getServerMoneyAvailable(Target) + 1)) }
    if ((Math.ceil(growthanalyzethreads * 1.75)) + (Math.ceil(growthanalyzethreads * (ns.growthAnalyzeSecurity(1, Target) / 0.05) * 1.75)) > FreeRam(ns, Host)) {
      gthreads = Math.floor(0.05 / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam(ns, Host) / 1.75)
      wthreads = Math.ceil(ns.growthAnalyzeSecurity(1, Target) / (0.05 + ns.growthAnalyzeSecurity(1, Target)) * FreeRam(ns, Host) / 1.75)
    }
    else {
      gthreads = Math.ceil(growthanalyzethreads)
      wthreads = Math.ceil(growthanalyzethreads * (ns.growthAnalyzeSecurity(1, Target) / 0.05))
    }
    if ((gthreads > 0) && (wthreads > 0)) {
      ns.exec("/opti/g.js", Host, gthreads, Target)
      ns.exec("/opti/w.js", Host, wthreads, Target)
      await ns.asleep(ns.getWeakenTime(Target) + 50)//Wait until weaken is done
    } else { await ns.asleep(10000) }//If we don't have any RAM free, wait 10 seconds before tring again
    CurMon = ns.getServerMoneyAvailable(Target) //Update Current Money score for loop
    CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
  }
  ns.tprint(Target + ' has max money.')
}

export function HGWTnoform(ns, Target, Host, DrainPer) {
  //threads[0] = Threads for Hack to DrainPer % of Max Money value
  //threads[1] = Threads for Grow back to Max Money
  //threads[2] = Threads for Weaken back to Min Security
  //threads[3] = Total RAM cost of one HGW batch
  //DrainPer Percent amount to drain from server
  let threads = []
  let hat = ns.hackAnalyzeThreads(Target, ns.getServerMoneyAvailable(Target) * DrainPer)
  let gat = ns.growthAnalyze(Target, 1 / (1 - DrainPer))
  threads[3] = Math.ceil(hat * 1.7 + hat / 25 * 1.75 + gat * 1.75 + gat / 12.5 * 1.75)
  if (threads[3] > FreeRam(ns, Host)) {
    threads[0] = Math.floor(FreeRam(ns, Host) / 1.7 * 50 / 79)
    threads[1] = Math.floor(FreeRam(ns, Host) / 1.75 * 25 / 79)
    threads[2] = Math.ceil(FreeRam(ns, Host) / 1.75 * 4 / 79)
    if(threads[0]*1.7+threads[1]*1.75+threads[2]*1.75>FreeRam(ns,Host)){threads[0]--}
  }
  else {
    threads[0] = Math.floor(hat)
    threads[1] = Math.ceil(gat)
    threads[2] = Math.ceil(hat / 25 + gat / 12.5)
  }
  return threads
}
