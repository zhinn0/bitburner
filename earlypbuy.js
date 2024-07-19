/** @param {NS} ns */
export async function main(ns) {
  //initial selection of whether to Buy or Upgrade a server
  let proceeD = await ns.prompt('Do you want to', {
    type: "select",
    choices: ["Buy New Server", "Upgrade Existing Server", "Quit"]
  })
  //Simple if to start the buy logic
  if (proceeD === "Buy New Server") {
    let resultB = await ns.prompt("How much ram do you want on your new server?", {
      type: "select",
      //hard code in 1TB to 1PB
      choices: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
    })
    //pop-up a box so I know how much it costs
    //ns.alert('Server cost will be $' + ns.formatNumber(ns.getPurchasedServerCost(resultB)))
    ns.tprint('Server cost will be $' + ns.formatNumber(ns.getPurchasedServerCost(resultB)))
    //Chance to quit in case it's expensive or I just wanted to see how expensive a new server is.
    if (await ns.prompt('Buy? Y/N', { type: "boolean" }) != true) {
      ns.tprint("Exit")
      ns.exit()
    }
    //Generate the server name pX based on how many servers I already have. Length 0 means no servers purchased, starts naming convention and "p0"
    let serverN = "p" + ns.getPurchasedServers().length
    ns.purchaseServer(serverN, resultB)
    ns.tprint('Purchased server ' + serverN + ' with ' + ns.formatNumber(resultB, 0) + ' RAM')
    ns.exit()
  }
  //Maybe I want to upgrade, do this logic instead
  if (proceeD === "Upgrade Existing Server") {
    //Check if I own any servers. If no, then tell me so and quit out. Maybe a way to not show the Upgrade Server option if I don't have any servers owned?
    if (ns.getPurchasedServers().length = 0) {
      ns.tprint("You do not have any servers to upgrade")
      ns.exit()
    }
    //This for loop delivers an array of server names with their current RAM in the format of "pX - Y TB RAM"
    //let pservers = ns.getPurchasedServers()
    const pservers = ns.getPurchasedServers().map(name => {
      return {
        servername: name,
        name_n_ram: name + " - " + ns.formatNumber(ns.getServerMaxRam(name), 0) + " RAM",
        ramChoices: [],
        upgradecost: [],
      }
    })
    
    for (let h = 0; h < pservers.length; h++) {
      for (let i = 0; ns.getServerMaxRam(pservers[h].servername) * (2 ** (i)) < 1024; i++) {
        //ns.tprint(pservers[h].servername+' current Max RAM is '+ns.getServerMaxRam(pservers[h].servername))
        pservers[h].ramChoices[i] = ns.getServerMaxRam(pservers[h].servername) * (2 ** (i + 1))
        pservers[h].upgradecost[i] = ns.formatNumber(ns.getPurchasedServerUpgradeCost(pservers[h].servername, pservers[h].ramChoices[i]))
      }
    }
    const serverU = await ns.prompt("Which server do you want to upgrade?", {
      type: "select",
      //choices: pservers
      choices: pservers.map(item =>{return item["name_n_ram"]})
    })
    if (ns.getServerMaxRam(serverU.split(' ')[0]) >= 1024) {
      ns.tprint('Please use pbuy to purchase RAM greater than 1 TB. This server has over 1 TB')
      ns.exit()
    }
    let rchoice = pservers.map(rcho =>{return rcho["ramChoices"]})
    let resultU = await ns.prompt("How much total ram do you want on the server to be upgraded?", {
      type: "select",
      choices: rchoice[pservers.findIndex(obj => obj.name_n_ram === serverU)]
    })
    ns.tprint('Upgraded server cost will be $' + ns.formatNumber(ns.getPurchasedServerUpgradeCost(serverU.split(' ')[0], resultU)))
    //Quick check if I still want to buy
    if (await ns.prompt('Upgrade? Y/N', { type: "boolean" }) != true) { ns.exit() }
    ns.upgradePurchasedServer(serverU.split(' ')[0], resultU)
  }
  ns.exec('pserverprep.js','home')
}
