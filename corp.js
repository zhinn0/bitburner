/** @param {NS} ns */
export async function main(ns) {

  while (true) {

    if (ns.corporation.getCorporation().nextState == "START") { employeeBoost(ns) }
    await ns.corporation.nextUpdate()
  }
}

function getCorpData(ns) {
  let corpdata = ns.corporation.getCorporation()
}

function employeeBoost(ns) {
  let perfMult = 0.997 //simplified, assumes no interns
  for (let division of ns.corporation.getCorporation().divisions) {
    for (let city of ns.corporation.getDivision(division).cities) {
      let thisOffice = ns.corporation.getOffice(division, city)
      let partyCostperEmp = 500000 * (Math.sqrt((thisOffice.avgMorale * perfMult - 10) ** 2 + 40 * thisOffice.maxMorale) - thisOffice.avgMorale * perfMult - 10)
      let partyCost = partyCostperEmp * thisOffice.numEmployees
      if (thisOffice.avgEnergy < thisOffice.maxEnergy - 0.5) { ns.corporation.buyTea(division, city) }
      if (thisOffice.avgMorale < thisOffice.maxMorale - 0.5) {
        ns.corporation.throwParty(division, city, partyCost)
        //ns.print('INFO - Paid $' + partyCost + ' to maximize employee morale')
      }
    }
  }
}
