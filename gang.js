/** @param {NS} ns */
export async function main(ns) {
  disableGangLogs(ns)
  const respectGoal = 160000000 //160M respect is about 97% equipment discount and is rapidly gained in late game.

  if (!ns.gang.inGang()) {
    ns.tprint('You need to join a gang before automating gang work.')
    ns.exit()
  }
  while (true) {
    //For however many recruits we have available, recruit, name, set to train, and buy gear
    if (ns.gang.getRecruitsAvailable() > 0) { recruitgangster(ns) }
    ascendgangster(ns)
    //Use Stronarm, Traffic, or Terrorism to gain respect
    if (ns.gang.getMemberNames().length < 12) { await early_respect(ns); await ethics(ns); await traingang(ns) }
    else if (ns.gang.getGangInformation().respect < 25000000) { await respect(ns); await ethics(ns); await traingang(ns) }
    if ((ns.gang.getMemberNames().length >= 12)) {
      if ((ns.gang.getGangInformation().territory < 1) &&
        ((othergangs(ns)[0].power / ns.gang.getGangInformation().power) > .05)) {
        await buildgangpower(ns)
        ascendgangster(ns)
        await traingang(ns)
      }
      ascendgangster(ns)
      await financegang(ns)
    }
    //territory win % is proportion of power; if we have 60% or better chance
    //versus the strongest gang, turn on territory warfare, if not, turn it off
    await ethics(ns)
    if ((othergangs(ns)[0].power / ns.gang.getGangInformation().power) < .4) { ns.gang.setTerritoryWarfare(true) }
    else { ns.gang.setTerritoryWarfare(false) }
    equipgangster(ns)
    await ns.gang.nextUpdate()
    if (ns.gang.getGangInformation().territory >= 1) { break }
  }
  let flip = 0
  while (true) {
    ascendgangster(ns)
    if (ns.gang.getGangInformation().respect < respectGoal) { await lateRespect(ns,respectGoal) }
    fullcontrol(ns, flip)
    flip++
    if (flip == 2) { flip = 0 }
    equipgangster(ns)
    await ns.sleep(60000)
  }
}

function recruitgangster(ns) {
  const gangsternames = ['Chow Yun Fat', 'Tony Montana', 'Roy Batty', 'Petty Wilson', 'Cold-Eyes Lucy', 'Batman', 'Owlman', 'Red-Hand Rita', 'Street Preacher', 'Natasha', 'Artemis', 'Miss Scarlet']
  for (let h = 0; h < ns.gang.getRecruitsAvailable(); h++) {
    let thisgangstername = gangsternames[ns.gang.getMemberNames().length]
    ns.gang.recruitMember(thisgangstername)
    ns.gang.setMemberTask(thisgangstername, "Train Combat")
    equipgangster(ns)
  }
}

function ascendgangster(ns) {
  //let afactor = 1.25;
  let gnames = ns.gang.getMemberNames()
  gnames.forEach((thisgangstername) => {
    let ascensionresult = ns.gang.getAscensionResult(thisgangstername)
    if (ascensionresult != null) {
      //let currentfactor = Math.min(ascensionresult.str, ascensionresult.def, ascensionresult.dex, ascensionresult.agi)
      let currentfactor=ascensionresult.str
      if (CalculateAscendTreshold(ns, thisgangstername) < currentfactor) {
        ns.gang.ascendMember(thisgangstername)
        ns.gang.setMemberTask(thisgangstername, "Train Combat")
        equipgangster(ns)
      }
    }
  })
}

function equipgangster(ns) {
  /*Loop to check to see i we can buy equipment
Only buy the equipment if we have 2x its value in the bank*/
  const equip = ns.gang.getEquipmentNames()
  for (let i = 0; i < equip.length; i++) {
    for (let j = 0; j < ns.gang.getMemberNames().length; j++) {
      if (ns.getServerMoneyAvailable('home') > 2 * ns.gang.getEquipmentCost(equip[i])) {
        ns.gang.purchaseEquipment(ns.gang.getMemberNames()[j], equip[i])
      }
    }
  }
}

function taskallgangsters(ns, task) {
  for (let i = 0; i < ns.gang.getMemberNames().length; i++) {
    let combatmin = Math.min(ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).str, ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).agi, ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).def, ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).dex)
    if (combatmin > 300) { ns.gang.setMemberTask(ns.gang.getMemberNames()[i], task) }
    else { ns.gang.setMemberTask(ns.gang.getMemberNames()[i], "Train Combat") }
  }
}

async function early_respect(ns) {
  let stoptime = performance.now() + 300000
  for (let i = 0; i < ns.gang.getMemberNames().length; i++) {
    if (ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).str < 150 &&
      ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).str > 100) {
      ns.gang.setMemberTask(ns.gang.getMemberNames()[i], "Strongarm Civilians")
    } else if ((ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).str >= 150) &&
      (ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).str < 300)) {
      ns.gang.setMemberTask(ns.gang.getMemberNames()[i], "Traffick Illegal Arms")
    } else if (ns.gang.getMemberInformation(ns.gang.getMemberNames()[i]).str >= 300) {
      ns.gang.setMemberTask(ns.gang.getMemberNames()[i], "Terrorism")
    }
    else { ns.gang.setMemberTask(ns.gang.getMemberNames()[i], "Train Combat") }
  }
  ns.print("INFO - Running Early Respect Function")
  while (ns.gang.getGangInformation().respect < ns.gang.respectForNextRecruit()) {
    if (stoptime < performance.now()) { break } //max out at 5 min
    await ns.sleep(10000)
  }
  recruitgangster(ns)
}

async function respect(ns) {
  let stoptime = performance.now() + 300000
  let currentrespect = ns.gang.getGangInformation().respect
  taskallgangsters(ns, "Terrorism")
  ns.print("INFO - Doing a little terrorism for Respect")
  while (ns.gang.getGangInformation().respect < 2 * currentrespect) {
    if (stoptime < performance.now()) { break } //max out at 5 min
    await ns.sleep(10000)
  }
}

async function ethics(ns) {
  let stoptime = performance.now() + 300000
  taskallgangsters(ns, "Vigilante Justice")
  ns.print("INFO - Ethical gangsters are vigilantes")
  while (ns.gang.getGangInformation().wantedLevel > 1) {
    if (stoptime < performance.now()) { break } //max out at 5 min
    await ns.sleep(10000)
  }
}

async function financegang(ns) {
  let currentmoney = ns.getServerMoneyAvailable("home")
  let stoptime = performance.now() + 300000
  taskallgangsters(ns, "Traffick Illegal Arms")
  ns.gang.setMemberTask("Batman", "Vigilante Justice")
  ns.print("INFO - Enaging in gang financing activities - totally legit")
  while (ns.getServerMoneyAvailable("home") < 4 * currentmoney) {
    //once 5 minutes have passed, break out even if we have not 4x money
    if (stoptime < performance.now()) { return }
    await ns.sleep(10000)
  }
  equipgangster(ns)
}

async function buildgangpower(ns) {
  if (ns.gang.getGangInformation().territory >= 1) { return }
  ns.print("INFO - Building Gang Territory Power")
  taskallgangsters(ns, "Territory Warfare")
  await ns.sleep(300000)
}

async function traingang(ns) {
  let stoptime = performance.now() + 120000
  taskallgangsters(ns, "Train Combat")
  ns.print("INFO - Training all gang members")
  while (stoptime > performance.now()) { ascendgangster(ns); await ns.sleep(20000) }
}

async function lateRespect(ns, respectGoal) {
  let currentrespect = ns.gang.getGangInformation().respect
  for (let i of ns.gang.getMemberNames()) { ns.gang.setMemberTask(i, "Terrorism") }
  ns.print("INFO - Doing a little terrorism for Respect")
  while (ns.gang.getGangInformation().respect < (2 * currentrespect && respectGoal) ) { await ns.gang.nextUpdate() }
}

function fullcontrol(ns, flip) {
  for (let i of ns.gang.getMemberNames()) {
    if (flip % 2 == 0) { ns.gang.setMemberTask(i, "Train Combat") }
    else { ns.gang.setMemberTask(i, "Traffick Illegal Arms") }
  }
  if (((flip + 1) % 2 == 0) && ((flip + 1) % 4 != 0)) { ns.gang.setMemberTask("Batman", "Vigilante Justice") }
  else if ((flip + 1) % 4 == 0) { ns.gang.setMemberTask("Owlman", "Vigilante Justice") }
}

function othergangs(ns) {
  let othergangnames = []
  for (let [name] of Object.entries(ns.gang.getOtherGangInformation())) { othergangnames.push(name) }
  let othergangs = othergangnames.map(name => {
    return {
      name: name,
      power: ns.gang.getOtherGangInformation()[name].power,
      territory: ns.gang.getOtherGangInformation()[name].territory,
    }
  })
  //Remove our gang from the list of gangs b/c othergangs returns all gangs incl ours
  othergangs.splice((othergangs.findIndex(object => {
    return object.name == ns.gang.getGangInformation().faction
  })), 1)
  //sort them by power
  othergangs.sort((a, b) => b.power - a.power)
  return othergangs
}

// Credit: Mysteyes. https://discord.com/channels/415207508303544321/415207923506216971/940379724214075442
function CalculateAscendTreshold(ns, member) {
  let mult = ns.gang.getMemberInformation(member)['str_asc_mult'];
  if (mult < 1.632) return 1.6326;
  if (mult < 2.336) return 1.4315;
  if (mult < 2.999) return 1.284;
  if (mult < 3.363) return 1.2125;
  if (mult < 4.253) return 1.1698;
  if (mult < 4.860) return 1.1428;
  if (mult < 5.455) return 1.1225;
  if (mult < 5.977) return 1.0957;
  if (mult < 6.496) return 1.0869;
  if (mult < 7.008) return 1.0789;
  if (mult < 7.519) return 1.073;
  if (mult < 8.025) return 1.0673;
  if (mult < 8.513) return 1.0631;
  return 1.0591;
}

function disableGangLogs(ns) {
  ns.disableLog("getServerMoneyAvailable")
  ns.disableLog("gang.setMemberTask")
  ns.disableLog("gang.getEquipmentNames")
  ns.disableLog("gang.getEquipmentCost")
  ns.disableLog("gang.purchaseEquipment")
  ns.disableLog("sleep")
}
/*["Unassigned","Mug People","Deal Drugs","Strongarm Civilians","Run a Con","Armed Robbery",
"Traffick Illegal Arms","Threaten & Blackmail","Human Trafficking","Terrorism","Vigilante Justice",
"Train Combat","Train Hacking","Train Charisma","Territory Warfare"] */
