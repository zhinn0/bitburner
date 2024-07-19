/** @param {NS} ns */
import * as hacknetlib from 'hacknet-lib.js'
export async function main(ns) {
  disableLogs(ns)
  const mult = ns.getHacknetMultipliers()
  let cashMultiplier = 0.75 //Don't spend more than this proportion of our total money on any single purchase
  let timerMS = 10000 //How long to wait between each purchase loop
  while (true) {
    if (ns.hacknet.numHashes() == ns.hacknet.hashCapacity()) {
      await sellHashes(ns)
      let cashtospend = ns.getServerMoneyAvailable("home") * cashMultiplier
      cashtospend = await buyUpgrades(ns, cashtospend)
      await buyCache(ns, cashtospend)
    }
    await ns.sleep(timerMS)
  }
}

async function buyUpgrades(ns, cashtospend) {
  while (true) {
    await ns.sleep(20)
    let cheapPurchase = {}
    let eff
    if (ns.hacknet.numNodes() < hacknetlib.HacknetServerConstants.MaxServers) {
      cheapPurchase = {
        cost: ns.hacknet.getPurchaseNodeCost(),
        //  prod: hacknetlib.calculateHashGainRate(1,0,1,1,ns.getHacknetMultipliers().production),
        eff: hacknetlib.calculateHashGainRate(1, 0, 1, 1, ns.getHacknetMultipliers().production) / ns.hacknet.getPurchaseNodeCost(),
        type: "node",
        node: 0
      }
    }
    else {
      cheapPurchase = {
        cost: ns.hacknet.getPurchaseNodeCost(),
        //  prod: hacknetlib.calculateHashGainRate(1,0,1,1,ns.getHacknetMultipliers().production),
        eff: 0,
        type: "node",
        node: 0
      }
    }
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
      if (ns.hacknet.getNodeStats(i).cores < hacknetlib.HacknetServerConstants.MaxCores) {
        eff = calcAdditionalHashGainandEff(ns, i, "core", 1).eff
        if (cheapPurchase.eff < eff && ns.hacknet.getCoreUpgradeCost(i, 1) < cashtospend) {
          cheapPurchase.cost = ns.hacknet.getCoreUpgradeCost(i, 1)
          cheapPurchase.type = "core"
          cheapPurchase.node = i
          cheapPurchase.eff = eff
        }
      }
      if (ns.hacknet.getNodeStats(i).level < hacknetlib.HacknetServerConstants.MaxLevel) {
        eff = calcAdditionalHashGainandEff(ns, i, "level", 1).eff
        if (cheapPurchase.eff < eff && ns.hacknet.getLevelUpgradeCost(i, 1) < cashtospend) {
          cheapPurchase.cost = ns.hacknet.getLevelUpgradeCost(i, 1)
          cheapPurchase.type = "level"
          cheapPurchase.node = i
          cheapPurchase.eff = eff
        }
      }
      if (ns.hacknet.getNodeStats(i).ram < hacknetlib.HacknetServerConstants.MaxRam) {
        eff = calcAdditionalHashGainandEff(ns, i, "ram", 1).eff
        if (cheapPurchase.eff < eff && ns.hacknet.getRamUpgradeCost(i, 1) < cashtospend) {
          cheapPurchase.cost = ns.hacknet.getRamUpgradeCost(i, 1)
          cheapPurchase.type = "ram"
          cheapPurchase.node = i
          cheapPurchase.eff = eff
        }
      }
    }
    if (cheapPurchase.cost > cashtospend) { break }
    if (cheapPurchase.type == "node") { ns.hacknet.purchaseNode() }
    //else if (cheapPurchase.type == "cache") { ns.hacknet.upgradeCache(cheapPurchase.node, 1) }
    else if (cheapPurchase.type == "core") { ns.hacknet.upgradeCore(cheapPurchase.node, 1) }
    else if (cheapPurchase.type == "level") { ns.hacknet.upgradeLevel(cheapPurchase.node, 1) }
    else if (cheapPurchase.type == "ram") { ns.hacknet.upgradeRam(cheapPurchase.node, 1) }
    cashtospend -= cheapPurchase.cost
    ns.print('INFO - Upgraded server ' + cheapPurchase.node + ' ' + cheapPurchase.type)
  }
  return cashtospend
}

async function buyCache(ns, cashtospend) {
  while (true) {
    await ns.sleep(20)
    let cheapPurchase = {
      cost: ns.hacknet.getCacheUpgradeCost(0, 1),
      node: 0
    }
    for (let i = 1; i < ns.hacknet.numNodes(); i++) {
      if (ns.hacknet.getCacheUpgradeCost(i, 1) < cheapPurchase.cost) {
        cheapPurchase.cost = ns.hacknet.getCacheUpgradeCost(i, 1)
        cheapPurchase.node = i
      }
    }
    if (cheapPurchase.cost < cashtospend) {
      ns.hacknet.upgradeCache(cheapPurchase.node, 1)
      cashtospend -= cheapPurchase.cost
    } else { return cashtospend }
  }
}

async function sellHashes(ns) {
  let hashToUse = ns.hacknet.numHashes()
  ns.hacknet.spendHashes("Sell for Money", 'home', hashToUse / 4)
  ns.tprint('Acquired $' + ns.formatNumber(hashToUse * 250000, 3, 1000, true) + ' selling hashes.')
}

export function calcAdditionalHashGainandEff(ns, index, type, amount) {
  //index is hacknet server #; type is cores, level, or ram; amount is how many times to upgrade, generally should be 1
  let cores = ns.hacknet.getNodeStats(index).cores
  let level = ns.hacknet.getNodeStats(index).level
  const ramUsed = ns.hacknet.getNodeStats(index).ramUsed
  let maxram = ns.hacknet.getNodeStats(index).ram
  const prodMult = ns.getHacknetMultipliers().production
  const currHashGain = hacknetlib.calculateHashGainRate(level, ramUsed, maxram, cores, prodMult)
  let cost

  if (type == "core") { cores++; cost = ns.hacknet.getCoreUpgradeCost(index, amount) }
  else if (type == "level") { level++; cost = ns.hacknet.getLevelUpgradeCost(index, amount) }
  else if (type == "ram") { maxram = maxram * 2; cost = ns.hacknet.getRamUpgradeCost(index, amount) }
  let hashGainandEff = {
    addHashRate: hacknetlib.calculateHashGainRate(level, ramUsed, maxram, cores, prodMult) - currHashGain,
    eff: (hacknetlib.calculateHashGainRate(level, ramUsed, maxram, cores, prodMult) - currHashGain) / cost
  }
  return hashGainandEff
}

function disableLogs(ns) {
  ns.disableLog("sleep")
  //ns.disableLog()
}

/*let myHacknetServers = ns.hacknet.numNodes().map(server => {
  return {
    server: server,
    production: ns.hacknet.getNodeStates(server).production,
    hashcapacity: ns.hacknet.getNodeStates(server).hashCapacity,
    cache: ns.hacknet.getNodeStates(server).cache,
    cores: ns.hacknet.getNodeStates(server).cores,
    level: ns.hacknet.getNodeStates(server).level,
    ram: ns.hacknet.getNodeStates(server).ram,
  }
})

async function buyUpgrades(ns, cashtospend) {
  while (true) {
    await ns.sleep(20)
    let cheapPurchase = {
      cost: ns.hacknet.getPurchaseNodeCost(),
      type: "node",
      node: 0
    }
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
      if (ns.hacknet.getCacheUpgradeCost(i, 1) < cheapPurchase.cost) {
        cheapPurchase.cost = ns.hacknet.getCacheUpgradeCost(i, 1)
        cheapPurchase.type = "cache"
        cheapPurchase.node = i
      }
      if (ns.hacknet.getCoreUpgradeCost(i, 1) < cheapPurchase.cost) {
        cheapPurchase.cost = ns.hacknet.getCoreUpgradeCost(i, 1)
        cheapPurchase.type = "core"
        cheapPurchase.node = i
      }
      if (ns.hacknet.getLevelUpgradeCost(i, 1) < cheapPurchase.cost) {
        cheapPurchase.cost = ns.hacknet.getLevelUpgradeCost(i, 1)
        cheapPurchase.type = "level"
        cheapPurchase.node = i
      }
      if (ns.hacknet.getRamUpgradeCost(i, 1) < cheapPurchase.cost) {
        cheapPurchase.cost = ns.hacknet.getRamUpgradeCost(i, 1)
        cheapPurchase.type = "ram"
        cheapPurchase.node = i
      }

    }
    if (cheapPurchase.cost > cashtospend) { return }
    if (cheapPurchase.type == "node") { ns.hacknet.purchaseNode() }
    else if (cheapPurchase.type == "cache") { ns.hacknet.upgradeCache(cheapPurchase.node, 1) }
    else if (cheapPurchase.type == "core") { ns.hacknet.upgradeCore(cheapPurchase.node, 1) }
    else if (cheapPurchase.type == "level") { ns.hacknet.upgradeLevel(cheapPurchase.node, 1) }
    else if (cheapPurchase.type == "ram") { ns.hacknet.upgradeRam(cheapPurchase.node, 1) }
    cashtospend -= cheapPurchase.cost
  }
}


*/
