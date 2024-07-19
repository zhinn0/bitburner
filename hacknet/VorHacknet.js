//Need to create a version that accounts for best $/$spent etc.

//Buys hacknet nodes up to this amount
let desirednodes = 18
//Don't spend more than this proportion of our total money on any single purchase
//var cashMultiplier = 1 / 20
var cashMultiplier = 3/4
 
//Should we subtract the cost of whatever we purchase from our available cash?
//not updating cash after purchase can sometimes keep your home cash pretty low as it can make a lot of purchases each loop
//upating after purchase can make it take a while to build up a strong hacknet
var updateAvailableCashAfterPurchase = true
 
//How long to wait between each purchase loop
var timerMS = 10000
 
/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("sleep");
 
	while (ns.hacknet.numNodes()<desirednodes) { //setting this to finish once we have 30 hacknet nodes
		//var madePurchase = false;
		var availableCash = ns.getServerMoneyAvailable("home") * cashMultiplier;
		if (ns.hacknet.getPurchaseNodeCost() < availableCash) {
			if (updateAvailableCashAfterPurchase) {
				availableCash -= ns.hacknet.getPurchaseNodeCost()
			}
			ns.hacknet.purchaseNode();
			ns.print("purchased hacknet node");
		}
		for (var i = 0; i < ns.hacknet.numNodes(); i++) {
			availableCash = ns.getServerMoneyAvailable("home") * cashMultiplier;
			while (ns.hacknet.getLevelUpgradeCost(i) < availableCash) {
				if (updateAvailableCashAfterPurchase) {
					availableCash -= ns.hacknet.getLevelUpgradeCost(i)
				}
				ns.hacknet.upgradeLevel(i, 1);
			}
			while (ns.hacknet.getRamUpgradeCost(i) < availableCash) {
				if (updateAvailableCashAfterPurchase) {
					availableCash -= ns.hacknet.getRamUpgradeCost(i)
				}
				ns.hacknet.upgradeRam(i, 1);
			}
			while (ns.hacknet.getCoreUpgradeCost(i) < availableCash) {
				if (updateAvailableCashAfterPurchase) {
					availableCash -= ns.hacknet.getCoreUpgradeCost(i)
				}
				ns.hacknet.upgradeCore(i, 1);
			}
		}
 
		await ns.sleep(timerMS);
	}
}
