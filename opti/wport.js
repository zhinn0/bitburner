/** @param {NS} ns */
export async function main(ns) {
  if (ns.args[1] === null) { ns.args[1] = 0 }
  await ns.weaken(ns.args[0], { additionalMsec: ns.args[1] })
  ns.atExit(()=> {ns.writePort(ns.args[2],ns.args[3])})
}
