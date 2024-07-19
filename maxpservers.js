/** @param {NS} ns */
export async function main(ns) {
  let serverN
  let proceeD = await ns.prompt('Do you want to', {
    type: "select",
    choices: ["Buy Servers", "Upgrade Servers", "Quit"]
  })
  //Simple if to start the buy logic
  if (proceeD === "Buy Servers") {
    let resultB = await ns.prompt('How much RAM do you want on your servers?',
      {
        type: "select",
        choices: [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]
      })
    for (let i = ns.getPurchasedServers.length; i < ns.getPurchasedServerLimit(); i++) {
      serverN = "p" + ns.getPurchasedServers().length
      if (ns.getPlayer().money > ns.getPurchasedServerCost(resultB)) { ns.purchaseServer(serverN, resultB) } else { i = ns.getPurchasedServerLimit() }
    }
    ns.exec('pserverprep.js', 'home')
  }
  if (proceeD === "Upgrade Servers") {
    //This for loop delivers an array of server names with their current RAM in the format of "pX - Y TB RAM"
    //Hardcoded RAM options but later figure out how to only show RAM options greater than selected servers current RAM?
    let resultU = await ns.prompt("How much total ram do you want to upgrade your servers to?", {
      type: "select",
      choices: [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]
    })
    for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
      serverN = "p" + i
      if (ns.getServerMaxRam(serverN) > resultU) { continue }
      if (ns.getPlayer().money > ns.getPurchasedServerUpgradeCost(serverN, resultU)) {
        ns.upgradePurchasedServer(serverN, resultU)
      } else {
        serverN = "p" + (i - 1)
        break
      }
    }
    ns.tprint('Upgraded up to server ' + serverN + ' to ' + resultU / 1024 + 'TB RAM')
  }
}
