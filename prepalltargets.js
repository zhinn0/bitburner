/** @param {NS} ns */
import { spider } from "/funcs/zhinn-library.js"
export async function main(ns) {
  let servers = spider(ns)
  for (let i = 0; i < servers.length; i++) {
    if ((ns.getServerMaxMoney(servers[i]) > 0) &&
    (!ns.isRunning('preptarget.js',ns.getHostname(),servers[i])) &&
    (ns.hasRootAccess(servers[i]))) {
      ns.run('preptarget.js', 1, servers[i]) }
  }
}
