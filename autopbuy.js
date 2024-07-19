//This script periodcally checks to see if we can buy a new private server and if we can upgrade existing servers
//Runs until all are maxed out
export async function main(ns) {
  ns.disableLog("getServerMaxRam")
  let serverN
  let ram = 256 //start buying cloud servers once can buy min of 256 ram
  while (!ns.serverExists('p24')) {
    for (let i = ns.getPurchasedServers.length; i < ns.getPurchasedServerLimit(); i++) {
      serverN = "p" + ns.getPurchasedServers().length
      if (ns.getPlayer().money > ns.getPurchasedServerCost(ram)) {
        ns.purchaseServer(serverN, ram)
        ns.print('Purchased ' + serverN + 'with ' + ram + 'GB of RAM.')
      } else { break }
    }
    ns.exec('pserverprep.js', 'home')
    if (ns.serverExists('p24')) { break } else { await ns.asleep(30000) }
  }
  ns.print('Purchased initial set of 25 private servers of ' + ram + 'GB.')
  ns.exec('pserverprep.js', 'home')
  while (true) {

    ram = ns.getServerMaxRam('p24') * 2
    for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
      serverN = "p" + i
      if (ns.getServerMaxRam(serverN) >= ram) { continue }
      if (ns.getPlayer().money > ns.getPurchasedServerUpgradeCost(serverN, ram)) {
        ns.upgradePurchasedServer(serverN, ram)
        ns.print('Upgrade ' + serverN + ' to ' + ram / 1024 + 'TB')
      } else { break }
      //if (ns.getPlayer().money > ns.getPurchasedServerUpgradeCost(serverN, ram*2)){i=-1}
    }
    //If final server max ram, exit, otherwise wait 30s for more money then try and buy again!
    if (ns.getServerMaxRam('p24') === 1048576) { ns.exit() } else { await ns.asleep(30000) }
  }
}
