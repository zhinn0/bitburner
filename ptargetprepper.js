
//import { FreeRam } from "/funcs/zhinn-library.js"
import { preptarget } from "/funcs/zhinn-library.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.tprint(ns.args[0] + ' prepping ' + ns.args[1])
  await preptarget(ns, ns.args[1])
  ns.run('eslam4.js', 1, ns.args[1], .5)
}
