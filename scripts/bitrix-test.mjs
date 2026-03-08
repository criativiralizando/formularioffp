import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni';

async function main() {
    try {
        // 1. Get Category Stages
        console.log('Fetching stages for category 44...');
        const stagesRes = await fetch(`${WEBHOOK_URL}/crm.dealcategory.stage.list.json?id=44`);
        const stagesData = await stagesRes.json();
        console.log('\nStages in Category 44:');
        if (stagesData.result) {
            stagesData.result.forEach(stage => {
                console.log(`ID: ${stage.STATUS_ID} | Name: ${stage.NAME}`);
            });
        }

        // 2. Get Custom Fields
        console.log('\nFetching generic custom fields...');
        const fieldsRes = await fetch(`${WEBHOOK_URL}/crm.deal.userfield.list.json`);
        const fieldsData = await fieldsRes.json();
        console.log(`\nFound ${fieldsData.total} custom fields.`);
        if (fieldsData.result) {
            // Just print a few of them
            fieldsData.result.slice(0, 5).forEach(f => {
                console.log(`Field Name: ${f.FIELD_NAME} | Label: ${f.EDIT_FORM_LABEL?.br?.[0] || Object.values(f.EDIT_FORM_LABEL || {})[0]} | Type: ${f.USER_TYPE_ID}`);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
