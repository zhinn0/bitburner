/** @param {NS} ns */
export async function main(ns) {
  //initial selection of whether to Buy or Upgrade a server
  let proceeD = await ns.prompt('Do you want to', {
    type: "select",
    choices: ["Buy New Server", "Upgrade Existing Server", "Quit"]
  })
  //Simple if to start the buy logic
  let buyramcosts = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]

  for (let i = 0; i < buyramcosts.length; i++) {
    buyramcosts[i] = buyramcosts[i] + " GB => $" + ns.formatNumber(ns.getPurchasedServerCost(buyramcosts[i]))
  }
  if (proceeD === "Buy New Server") {
    let resultB = await ns.prompt("How much ram do you want on your new server?", {
      type: "select",
      //hard code in 1TB to 1PB
      //choices: [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]
      choices: buyramcosts
    })
    //pop-up a box so I know how much it costs
    //ns.alert('Server cost will be $' + ns.formatNumber(ns.getPurchasedServerCost(resultB)))
    ns.tprint('Server cost will be $' + ns.formatNumber(ns.getPurchasedServerCost(resultB.split(' ')[0])))
    //Chance to quit in case it's expensive or I just wanted to see how expensive a new server is.
    if (await ns.prompt('Buy? Y/N', { type: "boolean" }) != true) {
      ns.tprint("Exit")
      ns.exit()
    }
    //Generate the server name pX based on how many servers I already have. Length 0 means no servers purchased, starts naming convention and "p0"
    let serverN = "p" + ns.getPurchasedServers().length
    ns.purchaseServer(serverN, resultB.split(' ')[0])
    ns.tprint('Purchased server ' + serverN + ' with ' + resultB.split(' ')[0] / 1024 + 'TB RAM')
    //ns.exit()
  }
  //Maybe I want to upgrade, do this logic instead
  if (proceeD === "Upgrade Existing Server") {
    //Check if I own any servers. If no, then tell me so and quit out. Maybe a way to not show the Upgrade Server option if I don't have any servers owned?
    if (ns.getPurchasedServers().length = 0) {
      ns.tprint("You do not have any servers to upgrade")
      ns.exit()
    }
    //This for loop delivers an array of server names with their current RAM in the format of "pX - Y TB RAM"
    let pservers = ns.getPurchasedServers()
    for (let i = 0; i < ns.getPurchasedServers().length; i++) {
      pservers[i] = pservers[i] + " - " + ns.getServerMaxRam(pservers[i]) / 1024 + " TB RAM"
    }
    //Ask which server to upgrade and dynamically generate picklist
    let serverU = await ns.prompt("Which server do you want to upgrade?", {
      type: "select",
      choices: pservers
    })
    let upgraderamcosts = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576].filter(t => t > ns.getServerMaxRam(serverU.split(' ')[0]))
    for (let i = 0; i < upgraderamcosts.length; i++) {
      upgraderamcosts[i] = upgraderamcosts[i] + " GB => $" + ns.formatNumber(ns.getPurchasedServerUpgradeCost(serverU.split(' ')[0], upgraderamcosts[i]))
    }
    //ns.tprint(upgraderamcosts)
    //ns.exit()
    //Hardcoded RAM options but later figure out how to only show RAM options greater than selected servers current RAM?
    let resultU = await ns.prompt("How much total ram do you want on the server to be upgraded?", {
      type: "select",
      choices: upgraderamcosts
    })
    ns.tprint('Upgraded server cost will be $' + ns.formatNumber(ns.getPurchasedServerUpgradeCost(serverU.split(' ')[0], resultU)))
    //Quick check if I still want to buy
    if (await ns.prompt('Upgrade? Y/N', { type: "boolean" }) != true) { ns.exit() }
    ns.upgradePurchasedServer(serverU.split(' ')[0], resultU)
  }
  ns.exec('pserverprep.js', 'home')
}

