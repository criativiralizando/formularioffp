import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni/';

async function getStages() {
    const res = await fetch(`${WEBHOOK_URL}crm.dealcategory.stage.list?id=44`);
    const data = await res.json();
    console.log(JSON.stringify(data.result, null, 2));
}

getStages();
