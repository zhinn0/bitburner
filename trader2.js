/** @param {NS} ns */
export async function main(ns) {
  let maxSharePer = 1.00;
  let stockBuyOVer_Long = 0.60; // buy stocks when over this % 
  let stockBuyUnder_Short = 0.40; // buy shorts when under this % 
  let stockVolPer = 0.05; // stocks must be under this volatility
  let moneyKeep = 1000000000000; //Keep $1t in reserve
  let minSharePer = 500;
  let sellThreshold_Long = 0.55; //sell when chance of increasing is under this
  let sellThreshold_Short = 0.40; //sell when chance of increasing is under this

  while (true) {
    ns.disableLog('disableLog');
    ns.disableLog('sleep');
    ns.disableLog('getServerMoneyAvailable');
    let OrderedStocks = ns.stock.getSymbols().sort(function (a, b) {
      return Math.abs(0.5 - ns.stock.getForecast(b)) - Math.abs(0.5 - ns.stock.getForecast(a));
    })

    let currentWorth = 0;
    for (const stock of OrderedStocks) {
      let position = ns.stock.getPosition(stock);
      if (position[0] > 0 || position[2] > 0) {
        SellIfOutsideThreshdold(stock);
      }
      buyPositions(stock,position);

      //track out current value over time...
      if (position[0] > 0 || position[2] > 0) {
        const longShares = position[0];
        const longPrice = position[1];
        const shortShares = position[2];
        const shortPrice = position[3];
        const bidPrice = ns.stock.getBidPrice(stock);

        let profit = longShares * (bidPrice - longPrice) - (2 * 100000);
        let profitShort = shortShares * Math.abs(bidPrice - shortPrice) - (2 * 100000);

        currentWorth += profitShort + profit + (longShares * longPrice) + (shortShares * shortPrice);
      }
    }
    ns.print('Cycle Complete - StockWorth = ' + ns.formatNumber(currentWorth) + ' :: Cash in hand = ' + ns.formatNumber(ns.getServerMoneyAvailable('home')));
    await ns.stock.nextUpdate();
  }

  function buyPositions(stock,position) {
    let maxShares = (ns.stock.getMaxShares(stock) * maxSharePer) - position[0];
    let maxSharesShort = (ns.stock.getMaxShares(stock) * maxSharePer) - position[2];
    let askPrice = ns.stock.getAskPrice(stock);
    let forecast = ns.stock.getForecast(stock);
    let volPer = ns.stock.getVolatility(stock);
    let playerMoney = ns.getServerMoneyAvailable('home');


    //long conditions
    if (forecast >= stockBuyOVer_Long && volPer <= stockVolPer) {
      if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePer, "Long")) {
        let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
        ns.stock.buyStock(stock, shares);
        //ns.print('Bought: '+ stock + '')
      }
    }

    //Short conditions
    if (forecast <= stockBuyUnder_Short && volPer <= stockVolPer) {
      if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePer, "Short")) {
        let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxSharesShort);
        ns.stock.buyShort(stock, shares);
        //ns.print('Bought: '+ stock + '')
      }
    }
  }

  function SellIfOutsideThreshdold(stock) {
    let position = ns.stock.getPosition(stock);
    let forecast = ns.stock.getForecast(stock);

    if (position[0] > 0) {
      ns.print(stock + ' -> Current Forecast: ' + forecast)
      if (forecast < sellThreshold_Long) {
        ns.stock.sell(stock, position[0]);
      }
    }
    if (position[2] > 0) {
      ns.print(stock + ' -> Current Forecast: ' + forecast)
      if (forecast > sellThreshold_Short) {
        ns.stock.sellShort(stock, position[2]);
      }
    }
  }

}
