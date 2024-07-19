//Returns info on a server. Parameters needed are server name and what percent to drain from server cash

/** @param {NS} ns */
import { HGWTnoform } from "/funcs/zhinn-library.js"
import { SlamTiming } from "/funcs/zhinn-library.js"
export async function main(ns) {
  let Target = ns.args[0]
  let Host = ns.getHostname()
  let MaxMon = ns.getServerMaxMoney(ns.args[0])
  let CurMon = ns.getServerMoneyAvailable(ns.args[0])
  let MinSec = ns.getServerMinSecurityLevel(ns.args[0])
  let CurSec = ns.getServerSecurityLevel(ns.args[0])
  let DrainPer //how much to reduce server by
  if (ns.args[1]) { DrainPer = ns.args[1] } else { DrainPer = 0.95 }
  let GrowThreads
  let gat
gat = ns.growthAnalyze(ns.args[0], (1 / (1 - DrainPer)))
  if (MaxMon === CurMon) { GrowThreads = Math.ceil(ns.growthAnalyze(ns.args[0], MaxMon / CurMon)) } else { GrowThreads = "N/A" }
  ns.tprint('Current Money / Max Money: $'+ns.formatNumber(CurMon)+' / $'+ ns.formatNumber(MaxMon))
  ns.tprint('Current Securty / Min Security: ',CurSec,' / ', MinSec)
  if (isFinite(MaxMon / CurMon)) { GrowThreads = Math.ceil(ns.growthAnalyze(ns.args[0], MaxMon / CurMon)) } else { GrowThreads = "Temporarily infinite" }
  ns.tprint('Threads to Grow to Max Money: ' + GrowThreads)
  ns.tprint('Threads to Hack to ' + DrainPer*100 + '% Max Money: ' + ns.hackAnalyzeThreads(ns.args[0], MaxMon * DrainPer))
  ns.tprint('Threads to Grow to Max Money if Money @ ' + DrainPer*100 + '% of Max: ' + gat)
  ns.tprint('Hack Time: ' + ns.getHackTime(ns.args[0]))
  ns.tprint('Grow Time: ' + ns.getGrowTime(ns.args[0]))
  ns.tprint('Weaken Time: ' + ns.getWeakenTime(ns.args[0]))
    let threads = HGWTnoform(ns, Target, Host, DrainPer)
  let slamtiming = SlamTiming(ns, Target, Host, threads[3])
  ns.tprint('Threads & RAM for ' + DrainPer * 100 + '% of Money from ' + Target)
  ns.tprint('Hack Threads: ' + threads[0])
  ns.tprint('Grow Threads: ' + threads[1])
  ns.tprint('Weaken Threads: ' + threads[2])
  ns.tprint('Ram needed for 1 HGW cycle on ' + Target + ': ' + threads[3])
  ns.tprint('Number of batches that can be concurrently run: ' + slamtiming[0])
  ns.tprint('Time to delay between batches: ' + slamtiming[1])
ns.tprint('Ratio of hack to weaken time: '+ns.getHackTime(Target)/ns.getWeakenTime(Target))
  ns.tprint('Ratio of grow to weaken time: '+ns.getGrowTime(Target)/ns.getWeakenTime(Target))

}
