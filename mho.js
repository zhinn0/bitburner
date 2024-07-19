/** @param {NS} ns */
export async function main(ns) {
let MinSecurity = ns.getServerMinSecurityLevel(ns.args[0])
  let MaxMoney = ns.getServerMaxMoney(ns.args[0])
  
 /* while (ns.getServerSecurityLevel(ns.args[0]) > MinSecurity) {
      await ns.weaken(ns.args[0],ns.getServerMaxRam(ns.args[0])-ns.getServerUsedRam(ns.args[0])/0.15)
    }*/

  while (true) {
    while (ns.getServerSecurityLevel(ns.args[0]) > MinSecurity) {
      await ns.weaken(ns.args[0])
    }
    while (ns.getServerMoneyAvailable(ns.args[0]) < MaxMoney){
      for (let i=0;i<12;i++){
        await ns.grow(ns.args[0])
        if(ns.getServerMoneyAvailable(ns.args[0]) === MaxMoney){break}
        }
      await ns.weaken(ns.args[0])
    }
    while(ns.getServerSecurityLevel(ns.args[0]) < (MinSecurity+0.05)) {
		  await ns.hack(ns.args[0])
	  }
  }
}
