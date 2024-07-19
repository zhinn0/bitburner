/** @param {NS} ns */
export async function main(ns) {
  ns.run('scan.js')
  //ns.run('trader.js')
  //ns.run('VorHacknet.js')
  //ns.run('e1.js',1,'n00dles',0.95)
  //ns.run('ewg.js')
  //ns.run('qslam.js')
  //ns.run('autopbuy.js')
  ns.spawn('e1.js', 1, 'n00dles', '.95')
  //ns.spawn('eslam4.js', 1, 'n00dles', '.95')
}
