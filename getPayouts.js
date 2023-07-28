'use strict'
const sorter = require('json-array-sorter')
const timeTillPayout = require('./timeTillPayout')
module.exports = async(obj = {}, players = [], mongo, auto = false)=>{
  try{
    let array
    if(players.length == 0) players = await mongo.find('shardRankCache', {shardId: obj._id}, {name: 1, poOffSet: 1, rank: 1, emoji: 1})
    if(players?.length > 0){
      if(auto && obj.poLimit) players = players.filter(x=>obj.poLimit >= x.rank)
      const pObj = {}
      for(let p in players){
        if(!pObj[players[p].poOffSet]){
          const payoutTime = timeTillPayout(players[p].poOffSet, obj.type)
          pObj[players[p].poOffSet] = {
            offSet: players[p].poOffSet,
            payoutTime: payoutTime[0],
            timeUntilPayout: payoutTime[1],
            players:[]
          }
        }
        const tempObj = {
          name: players[p].name,
          emoji: (players[p].emoji ? players[p].emoji:''),
          rank: (players[p].rank ? players[p].rank:'0')
        }
        pObj[players[p].poOffSet].players.push(tempObj)
      }
      array = sorter([{column: 'payoutTime', order: obj.poSort}], Object.values(pObj))
    }
    if(array?.length > 0){
      const msgFields = []
      for(let i in array){
        const tempObj = {
          name: '**Payout in '+array[i].payoutTime+'**\n',
          value: '',
          inline: obj.poInline
        }
        const playerArray = sorter([{column: obj.sort, order: 'ascending'}], array[i].players)
        for(let p in playerArray){
          if(playerArray[p].rank) tempObj.value += '`'+playerArray[p].rank.toString().padStart(2, '0').padEnd(3, ' ')+'` : '
          tempObj.value += (playerArray[p].emoji ? playerArray[p].emoji:'')+' '+playerArray[p].name+'\n'
        }
        msgFields.push(tempObj)
      }
      return msgFields
    }
  }catch(e){
    throw(e)
  }
}
