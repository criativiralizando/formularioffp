const BITRIX_WEBHOOK_URL = "https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni";

const fieldsToCreate = [
    {
        FIELD_NAME: 'UF_CRM_BANCOS_CONTA',
        USER_TYPE_ID: 'string',
        XML_ID: 'UF_CRM_BANCOS_CONTA',
        EDIT_FORM_LABEL: { 'pt-BR': 'Bancos que Possui Conta' },
        LIST_COLUMN_LABEL: { 'pt-BR': 'Bancos que Possui Conta' },
        LIST_FILTER_LABEL: { 'pt-BR': 'Bancos que Possui Conta' }
    },
    {
        FIELD_NAME: 'UF_CRM_CARTOES_POSSUI',
        USER_TYPE_ID: 'string',
        XML_ID: 'UF_CRM_CARTOES_POSSUI',
        EDIT_FORM_LABEL: { 'pt-BR': 'Cartões que Possui' },
        LIST_COLUMN_LABEL: { 'pt-BR': 'Cartões que Possui' },
        LIST_FILTER_LABEL: { 'pt-BR': 'Cartões que Possui' }
    },
    {
        FIELD_NAME: 'UF_CRM_DETALHES_CARTOES',
        USER_TYPE_ID: 'string',
        XML_ID: 'UF_CRM_DETALHES_CARTOES',
        EDIT_FORM_LABEL: { 'pt-BR': 'Detalhes dos Cartões (Bandeira e Gasto)' },
        LIST_COLUMN_LABEL: { 'pt-BR': 'Detalhes dos Cartões' },
        LIST_FILTER_LABEL: { 'pt-BR': 'Detalhes dos Cartões' }
    },
    {
        FIELD_NAME: 'UF_CRM_VIAGEM_EMITIDA',
        USER_TYPE_ID: 'string',
        XML_ID: 'UF_CRM_VIAGEM_EMITIDA',
        EDIT_FORM_LABEL: { 'pt-BR': 'Viagem Emitida' },
        LIST_COLUMN_LABEL: { 'pt-BR': 'Viagem Emitida' },
        LIST_FILTER_LABEL: { 'pt-BR': 'Viagem Emitida' }
    },
    {
        FIELD_NAME: 'UF_CRM_APOIO_VIAGEM',
        USER_TYPE_ID: 'string',
        XML_ID: 'UF_CRM_APOIO_VIAGEM',
        EDIT_FORM_LABEL: { 'pt-BR': 'Apoio de Viagem Solicitado' },
        LIST_COLUMN_LABEL: { 'pt-BR': 'Apoio de Viagem Solicitado' },
        LIST_FILTER_LABEL: { 'pt-BR': 'Apoio de Viagem Solicitado' }
    },
];

async function createFields() {
    console.log("Starting to create custom fields in Bitrix24 Deal Entity...\n");
    for (const field of fieldsToCreate) {
        try {
            const res = await fetch(`${BITRIX_WEBHOOK_URL}/crm.deal.userfield.add.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: field })
            });
            const data = await res.json();

            if (data.error) {
                console.error(`❌ Error creating ${field.FIELD_NAME}: ${data.error_description}`);
            } else {
                console.log(`✅ Successfully created ${field.FIELD_NAME} (ID: ${data.result})`);
            }
        } catch (e) {
            console.error(`❌ Network error creating ${field.FIELD_NAME}:`, e.message);
        }
    }
    console.log("\nDone!");
}

createFields();
