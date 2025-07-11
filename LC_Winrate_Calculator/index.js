


function calculate(){
    const friendlyInfo = {
        basePower : parseInt(document.querySelector(".friendly").querySelector(".base_power").querySelector("input").value),
        coinPower : parseInt(document.querySelector(".friendly").querySelector(".coin_power").querySelector("input").value),
        coinCount : parseInt(document.querySelector(".friendly").querySelector(".coin_count").querySelector("input").value),
        atkLv : parseInt(document.querySelector(".friendly").querySelector(".atk_lv").querySelector("input").value),
        bonusByLv: 0,
        sanity : parseInt(document.querySelector(".friendly").querySelector(".sanity").querySelector("input").value),
        basePowerUp : parseInt(document.querySelector(".friendly").querySelector(".base_power_up").querySelector("input").value),
        coinPowerUp : parseInt(document.querySelector(".friendly").querySelector(".coin_power_up").querySelector("input").value),
        atkLvUp : parseInt(document.querySelector(".friendly").querySelector(".atk_lv_up").querySelector("input").value),
        paralyze : parseInt(document.querySelector(".friendly").querySelector(".paralyze").querySelector("input").value)
    };
    const enemyInfo = {
        basePower : parseInt(document.querySelector(".enemy").querySelector(".base_power").querySelector("input").value),
        coinPower : parseInt(document.querySelector(".enemy").querySelector(".coin_power").querySelector("input").value),
        coinCount : parseInt(document.querySelector(".enemy").querySelector(".coin_count").querySelector("input").value),
        atkLv : parseInt(document.querySelector(".enemy").querySelector(".atk_lv").querySelector("input").value),
        bonusByLv: 0,
        sanity : parseInt(document.querySelector(".enemy").querySelector(".sanity").querySelector("input").value),
        basePowerUp : parseInt(document.querySelector(".enemy").querySelector(".base_power_up").querySelector("input").value),
        coinPowerUp : parseInt(document.querySelector(".enemy").querySelector(".coin_power_up").querySelector("input").value),
        atkLvUp : parseInt(document.querySelector(".enemy").querySelector(".atk_lv_up").querySelector("input").value),
        paralyze : parseInt(document.querySelector(".enemy").querySelector(".paralyze").querySelector("input").value)
    };

    if(friendlyInfo.coinCount > 9 || enemyInfo.coinCount > 9){
        alert("코인 개수가 너무 많습니다!");
        return;
    }

    const lvDiff = (friendlyInfo.atkLv + friendlyInfo.atkLvUp) - (enemyInfo.atkLv + enemyInfo.atkLvUp);
    const bonus = (lvDiff - (lvDiff % 3)) / 3;
    friendlyInfo.bonusByLv = Math.max(0, bonus);
    enemyInfo.bonusByLv = Math.max(0, -bonus);

    
    var finalWinrate = 0;
    var finalDefeatrate = 0;
    const tree = [[]];
    const queue = [1];

    while(queue.length != 0){
        const cur = queue[0];
        queue.splice(0, 1);
        if(tree[cur] != undefined){
            continue;
        }

        var info = [];
        const pre_info = JSON.parse(JSON.stringify(tree[Math.floor(cur/2)]));
        if(cur == 1){
            tree[1] = [JSON.parse(JSON.stringify(friendlyInfo)), JSON.parse(JSON.stringify(enemyInfo)), 1];
        }else{
            const friendlyPowerChance = getAllPowerChance(pre_info[0]);
            const enemyPowerChance = getAllPowerChance(pre_info[1]);
            const winrate = getClashWinrate(friendlyPowerChance, enemyPowerChance);

            pre_info[0].paralyze = Math.max(0, pre_info[0].paralyze - pre_info[0].coinCount);
            pre_info[1].paralyze = Math.max(0, pre_info[1].paralyze - pre_info[1].coinCount);

            if(Math.floor(cur/2) * 2 == cur){
                pre_info[1].coinCount -= 1;
                info = [pre_info[0], pre_info[1], pre_info[2] * winrate];
            }else if(Math.floor(cur/2) * 2 + 1 == cur){
                pre_info[0].coinCount -= 1;
                info = [pre_info[0], pre_info[1], pre_info[2] * (1 - winrate)];
            }

            tree[cur] = info;
        }

        if(tree[cur][0].coinCount != 0 && tree[cur][1].coinCount != 0){
            queue.push(cur * 2);
            queue.push(cur * 2 + 1);
        }else{
            if(tree[cur][0].coinCount == 0){
                finalDefeatrate += tree[cur][2];
            }else{
                finalWinrate += tree[cur][2];
            }
        }
    }

    const resultText = document.querySelector(".result");
    resultText.innerHTML = "승률 : " + (finalWinrate * 100).toFixed(3) + "%";
    console.log(finalWinrate + ", " + finalDefeatrate);



}

function getClashWinrate(f, e){
    var win = 0, defeat = 0;

    for(let i = 1; i < f.length; i++){
        for(let j = 1; j < e.length; j++){
            const chance = f[i] * e[j];
            if(i > j){
                win += chance;
            }else if(i < j){
                defeat += chance;
            }
        }
    }

    win = (win / (win + defeat));

    return win;
}

function getAllPowerChance(info) {
    const basePower = info.basePower + info.basePowerUp + info.bonusByLv;
    const coinPower = info.coinPower + info.coinPowerUp;
    const coinCount = info.coinCount;
    const sanity = info.sanity;
    const paralyze = Math.min(info.paralyze, coinCount);

    const chances = Array(basePower + coinPower * coinCount + 1).fill(0);

    for (let i = 0; i <= coinCount; i++) {
        const cnt = Array(coinCount - paralyze + 1).fill(0);

        const minFrontHeads = Math.max(0, i - (coinCount - paralyze));
        const maxFrontHeads = Math.min(i, paralyze);

        for (let frontHeads = minFrontHeads; frontHeads <= maxFrontHeads; frontHeads++) {
            const backHeads = i - frontHeads;
            const ways = combination(paralyze, frontHeads) * combination(coinCount - paralyze, backHeads);
            cnt[backHeads] += ways;
        }

        const each_c = ((0.5 + (sanity / 100)) ** i) * ((0.5 - (sanity / 100)) ** (coinCount - i));
        
        for(let j = 0; j < cnt.length; j++){
            chances[j * coinPower + basePower] += each_c * cnt[j];
        }
    }

    return chances;
}

function factorial(n){
    let result = 1;
    for(let i = 2; i <= n; i++){
        result *= i
    }
    return result;
}

function combination(n, r) {
  if (r < 0 || r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}