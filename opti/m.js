/** @param {NS} ns */
export async function main(ns) {
  const Target = ns.args[0]
  const MinSec = ns.getServerMinSecurityLevel(Target)
  const MaxMon = ns.getServerMaxMoney(Target)
  let CurSec = ns.getServerSecurityLevel(Target)
  let CurMon = ns.getServerMoneyAvailable(Target)
  let FreeRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname()) //FreeRam to define currently available RAM before apportioning threads
  let gtime = ns.getGrowTime(Target)
  let wtime = ns.getWeakenTime(Target)
  let htime = ns.getHackTime(Target)
  while (true) {
    CurSec = ns.getServerSecurityLevel(Target)
    CurMon = ns.getServerMoneyAvailable(Target)
    FreeRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname()) //FreeRam to define currently available RAM before apportioning threads
    gtime = ns.getGrowTime(Target)
    wtime = ns.getWeakenTime(Target)
    htime = ns.getHackTime(Target)
    //Preparing the server with weaken and grow
    //Later optimization - evaluate threads needed to fully weaken and to fully grow to avoid overthreading
    //Later optimization - updated logic for # of cores? How do cores work?
    while ((CurSec > MinSec) ||
      (CurMon < MaxMon)) {
      while (CurSec > MinSec) { //Full weaken of server
        wtime = ns.getWeakenTime(Target)
        FreeRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
        ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam / 1.75), Target)
        await ns.sleep(wtime + 200)//Given using max free ram to weaken, sleep until complete to avoid running next section without any ram available
        CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
      }
      if (CurMon < MaxMon) { //Check money then grow if not max
        gtime = ns.getGrowTime(Target)
        wtime = ns.getWeakenTime(Target)
        FreeRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
        ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam * 0.66 / 1.75), Target)
        setTimeout(() => { ns.exec("/opti/g.js", ns.getHostname(), Math.floor(FreeRam * 0.33 / 1.75), Target) }, wtime - gtime - 300)
        await ns.asleep(wtime + 400)
        /*ns.exec("/opti/g.js", ns.getHostname(), Math.floor(FreeRam / 1.75), Target)
        await ns.sleep(gtime + 200)*/ //Given using max free ram to grow, sleep until complete to avoid running next section without any ram available
        CurMon = ns.getServerMoneyAvailable(Target) //Update Current Money score for loop
        CurSec = ns.getServerSecurityLevel(Target) //Update Current Security score for loop
      }
    }
    //Completed preparing the server with weaken and grow
    //FreeRam to define currently available RAM before apportioning threads
    FreeRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
    /*ns.tprint("Hack Time: " + htime)
    ns.tprint("Grow Time: " + gtime)
    ns.tprint("Weaken Time: " + wtime)
    ns.tprint("Max Money: " + MaxMon)
    ns.tprint("Current Money: " + CurMon)
    ns.tprint("Security / Grow Thread: " + ns.growthAnalyzeSecurity(1, Target))
    ns.tprint("Min Security: " + MinSec)
    ns.tprint("Current Security: " + CurSec)
    ns.tprint("Security-- / Weaken Thread: " + ns.weakenAnalyze(1))
    ns.tprint("$ / Hack Thread: " + ns.hackAnalyze(Target))
    ns.tprint("Security / Hack Thread: " + ns.hackAnalyzeSecurity(1, Target))
    ns.tprint(FreeRam)*/
    //Update times as changed Sec will adjust w & g times
    wtime = ns.getWeakenTime(Target)
    gtime = ns.getGrowTime(Target)
    htime = ns.getHackTime(Target)
    let hthread = 0.25 / 1.7
    let whthread = 0.01 / 1.75
    let gthread = 0.24 / 1.75
    let wgthread = 0.48 / 1.75
    //Later Optimization - algorithm to determine best distribution of threads
    if (Math.floor(FreeRam * whthread) > 0) { ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam * whthread), Target) }
    /* ns.tprint('Free Ram: '+FreeRam)
     ns.tprint('Threads for Hacking: '+Math.floor(FreeRam * 0.4 / 1.7))
     ns.tprint('Threads for Growing: '+Math.floor(FreeRam * 0.4 / 1.75))
     ns.tprint('Threads for Weakening: '+Math.floor(FreeRam * 0.2 / 1.75))*/
    if (Math.floor(FreeRam * hthread) > 0) { setTimeout(() => { ns.exec("/opti/h.js", ns.getHostname(), Math.floor(FreeRam * hthread), Target) }, wtime - htime - 200) }
    if (Math.floor(FreeRam * wgthread) > 0) { setTimeout(() => { ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam * wgthread), Target) }, 600) }
    if (Math.floor(FreeRam * gthread) > 0) { setTimeout(() => { ns.exec("/opti/g.js", ns.getHostname(), Math.floor(FreeRam * gthread), Target) }, wtime - gtime + 200) }

    await ns.asleep(wtime + 1000) //wthout sleep may crash
  }
}
//Prior Working Logic
//if (Math.floor(FreeRam * 0.05 / 1.75) > 0) { ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam * 0.05 / 1.75), Target) }
//if (Math.floor(FreeRam * 0.4 / 1.7) > 0) { setTimeout(() => { ns.exec("/opti/h.js", ns.getHostname(), Math.floor(FreeRam * 0.4 / 1.75), Target) }, wtime - htime - 200) }
//    if (Math.floor(FreeRam * 0.15 / 1.75) > 0) { setTimeout(() => { ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam * 0.15 / 1.75), Target) }, 600) }
//    if (Math.floor(FreeRam * 0.4 / 1.75) > 0) { setTimeout(() => { ns.exec("/opti/g.js", ns.getHostname(), Math.floor(FreeRam * 0.4 / 1.75), Target) }, wtime - gtime + 200) }


//Prior logic attempt
//ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FreeRam * 0.05 / 1.75), Target)
//await ns.sleep(50)
//await ns.exec("/opti/w.js", ns.getHostname(), Math.floor(FRam() *0.15 / 1.75), Target)
//await ns.sleep(wtime - gtime)
//await ns.exec("/opti/g.js", ns.getHostname(), Math.floor(FRam() / 2.5 / 1.75), Target)
// await ns.sleep(wtime - htime - (wtime - gtime) - 100)
// await ns.exec("/opti/h.js", ns.getHostname(), Math.floor(FRam() / 2.5 / 1.75), Target)
