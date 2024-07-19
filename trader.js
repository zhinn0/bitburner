// Built upon u/pwillia7 's stock script.
// u/ferrus_aub stock script using simple portfolio algorithm.
/** @param {NS} ns **/
export async function main(ns) {
  let maxSharePer = 1.00 //what percentage of maximum available shares are we willing to buy
  let stockBuyPer = 0.60 //What foecast 
  let stockVolPer = 0.05 //What volatility am I comfortable with? Lower Vol means less change in stock price per tick
  let moneyKeep = 1000000000 //Keep 1t in the bank
  let minSharePer = 500 //Min shares per purchase

  while (true) {
    ns.disableLog('disableLog');
    ns.disableLog('sleep');
    ns.disableLog('getServerMoneyAvailable');
    let stocks = ns.stock.getSymbols().sort(function (a, b) {
      return ns.stock.getForecast(b) - ns.stock.getForecast(a);
    })
    for (const stock of stocks) {
      let position = ns.stock.getPosition(stock);
      if (position[0]) {
        //ns.print('Position: ' + stock + ', ')
        sellPositions(stock, position);
      }
      buyPositions(stock, position);
    }
    //ns.print('Cycle Complete');
    await ns.stock.nextUpdate();
  }
  function buyPositions(stock, position) {
    let maxShares = (ns.stock.getMaxShares(stock) * maxSharePer) - position[0];
    let askPrice = ns.stock.getAskPrice(stock);
    let forecast = ns.stock.getForecast(stock);
    let volPer = ns.stock.getVolatility(stock);
    let playerMoney = ns.getServerMoneyAvailable('home');

    if (forecast >= stockBuyPer && volPer <= stockVolPer) {
      if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePer, "Long")) {
        let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
        if (shares > 0) {
          ns.stock.buyStock(stock, shares);
          ns.print('Bought: ' + shares + ' shares of ' + stock)
        }
      }
    }
  }
  function sellPositions(stock, position) {
    let forecast = ns.stock.getForecast(stock);
    if (forecast < 0.5) {
      ns.stock.sellStock(stock, position[0]);
      ns.print('Sold: ' + position[0] + ' shares of ' + stock)
    }
  }
}
