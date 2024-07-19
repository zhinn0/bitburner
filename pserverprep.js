/** @param {NS} ns */
export async function main(ns) {
  for (let i = 0; i < ns.getPurchasedServers().length; i++) {
    let serverN = 'p' + i
    ns.scp("chsv.js", serverN, "home")
    ns.scp("m2.js", serverN, "home")
    ns.scp("/opti/w.js", serverN, "home")
    ns.scp("/opti/wport.js", serverN, "home")
    ns.scp("/opti/g.js", serverN, "home")
    ns.scp("/opti/h.js", serverN, "home")
    ns.scp("/funcs/zhinn-library.js", serverN, "home")
    ns.scp("slam6.js", serverN, "home")
    ns.scp("preptarget.js", serverN, "home")
    ns.scp("eslam.js", serverN, "home")
    ns.scp("eslam4.js", serverN, "home")
    ns.scp("ptargetprepper.js", serverN, "home")
    ns.scp("prepalltargets.js", serverN, "home")
  }
}
