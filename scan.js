/** @param {NS} ns */
import {serversort} from '/funcs/zhinn-library.js'
export async function main(ns) {
  let servermoney = ["home", 0]
  let hackeff = []
  let servers = serversort(ns)
  for (let i = 0; i < servers.length; i++) {
    let portspossible = 0
    if (!ns.hasRootAccess(servers[i].servername)) {
      if (ns.fileExists("BruteSSH.exe")) { ns.brutessh(servers[i].servername) & portspossible++ }
      if (ns.fileExists("FTPCrack.exe")) { ns.ftpcrack(servers[i].servername) & portspossible++ }
      if (ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(servers[i].servername) & portspossible++ }
      if (ns.fileExists("HTTPWorm.exe")) { ns.httpworm(servers[i].servername) & portspossible++ }
      if (ns.fileExists("SQLInject.exe")) { ns.sqlinject(servers[i].servername) & portspossible++ }
      if (ns.getServerNumPortsRequired(servers[i].servername) <= portspossible) {
        ns.nuke(servers[i].servername)
        ns.tprint("Cracked " + servers[i].servername)
      }
    }
    if ((ns.hasRootAccess(servers[i].servername)) &&
      (ns.getServerRequiredHackingLevel(servers[i].servername) < ns.getHackingLevel())) {
      if (servers[i].servermaxmoney > servermoney[1]) {
        servermoney[0] = servers[i].servername
        servermoney[1] = servers[i].servermaxmoney
      }
      hackeff.push({
        name:servers[i].servername,
        efficiency:ns.formatNumber((ns.hackAnalyze(servers[i].servername)*ns.getServerMaxMoney(servers[i].servername))/ns.getServerMinSecurityLevel(servers[i].servername)),
      })
    }
  }
  hackeff.sort((a, b) => b.efficiency - a.efficiency)
  //ns.tprint(servers)
  ns.tprint("Hackable Server with highest Max Money is " + servermoney[0])
  ns.tprint(servermoney[0] + " Max Money is $" + ns.formatNumber(servermoney[1]))
  //ns.tprint(hackeff)
  ns.tprint ("Hackable server with best $/thread/security ratio is: "+hackeff[0].name)
}
