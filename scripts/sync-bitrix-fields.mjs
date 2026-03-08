import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BITRIX_WEBHOOK_URL = 'https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni';

// The form structure to CRM custom fields mapping needed.
// Bitrix types: 'string', 'double', 'boolean', 'datetime', 'enumeration'
const TARGET_FIELDS = [
    { key: 'FPP_NOME', label: 'Nome Completo', type: 'string' },
    { key: 'FPP_WHATSAPP', label: 'WhatsApp', type: 'string' },
    { key: 'FPP_EMAIL', label: 'E-mail', type: 'string' },

    // CARDS (Up to 5)
    ...Array.from({ length: 5 }).flatMap((_, i) => [
        { key: `FPP_CARD_${i + 1}_BANK`, label: `Banco Cartão ${i + 1}`, type: 'string' },
        { key: `FPP_CARD_${i + 1}_NAME`, label: `Nome do Cartão ${i + 1}`, type: 'string' },
        { key: `FPP_CARD_${i + 1}_BRAND`, label: `Bandeira Cartão ${i + 1}`, type: 'string' },
        { key: `FPP_CARD_${i + 1}_CATEGORY`, label: `Categoria Cartão ${i + 1}`, type: 'string' },
        { key: `FPP_CARD_${i + 1}_SPEND`, label: `Gasto Mensal Cartão ${i + 1}`, type: 'string' },
        { key: `FPP_CARD_${i + 1}_ANNUITY`, label: `Anuidade Cartão ${i + 1}`, type: 'string' },
    ]),

    // ISSUED TRIPS
    { key: 'FPP_HAS_ISSUED', label: 'Possui viagens emitidas?', type: 'string' },
    ...Array.from({ length: 5 }).flatMap((_, i) => [
        { key: `FPP_ISSTRIP_${i + 1}_DEP`, label: `[E] Data de Ida Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_RET`, label: `[E] Data de Volta Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_COUNTRY`, label: `[E] País Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_CITY`, label: `[E] Cidade Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_MULTIPLE`, label: `[E] Múltiplos Destinos ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_EXTRA`, label: `[E] Destinos Extras ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_ADULTS`, label: `[E] Adultos Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_CHILD`, label: `[E] Crianças Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_BABIES`, label: `[E] Bebês Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_REASON`, label: `[E] Motivo Viagem ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_REASON_OTH`, label: `[E] Outro Motivo ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_SERVICES`, label: `[E] Serviços Reservados ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_UNRES`, label: `[E] Serviços Faltantes ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_UNRES_OTH`, label: `[E] Outros Faltantes ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_BUDGET`, label: `[E] Orçamento ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_TEAM_OPT`, label: `[E] Otimizar Equipe ${i + 1}`, type: 'string' },
        { key: `FPP_ISSTRIP_${i + 1}_NOTES`, label: `[E] Observações ${i + 1}`, type: 'string' },
    ]),

    // PLANNED TRIPS
    { key: 'FPP_HAS_PLANNED', label: 'Possui viagem em mente?', type: 'string' },
    { key: 'FPP_PLAN_COUNTRY', label: 'País Destino Planejado', type: 'string' },
    { key: 'FPP_PLAN_CITY', label: 'Cidade Destino Planejado', type: 'string' },
    { key: 'FPP_PLAN_MULTIPLE', label: 'Múltiplos Destinos Planejado', type: 'string' },
    { key: 'FPP_PLAN_EXTRA', label: 'Destinos Extras Planejado', type: 'string' },
    { key: 'FPP_PLAN_TIME', label: 'Prazo Viagem Planejada', type: 'string' },
    { key: 'FPP_PLAN_DEP', label: 'Data Ida Planejada', type: 'string' },
    { key: 'FPP_PLAN_RET', label: 'Data Volta Planejada', type: 'string' },
    { key: 'FPP_PLAN_ADULTS', label: 'Adultos Planejado', type: 'string' },
    { key: 'FPP_PLAN_CHILD', label: 'Crianças Planejado', type: 'string' },
    { key: 'FPP_PLAN_BABIES', label: 'Bebês Planejado', type: 'string' },
    { key: 'FPP_PLAN_REASON', label: 'Motivo Planejado', type: 'string' },
    { key: 'FPP_PLAN_REASON_OTH', label: 'Outro Motivo Planejado', type: 'string' },
    { key: 'FPP_PLAN_SVCS', label: 'Serviços Planejados', type: 'string' },
    { key: 'FPP_PLAN_SVCS_OTH', label: 'Outros Serviços Planejados', type: 'string' },
    { key: 'FPP_PLAN_BUDGET', label: 'Orçamento Planejado', type: 'string' },
    { key: 'FPP_PLAN_HELP', label: 'Ajuda Equipe Planejada', type: 'string' },
    { key: 'FPP_PLAN_HELP_NOTES', label: 'O que precisa de ajuda', type: 'string' },
];

async function callBitrix(method, data = {}) {
    const res = await fetch(`${BITRIX_WEBHOOK_URL}/${method}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) {
        throw new Error(`Bitrix Error: ${json.error_description}`);
    }
    return json.result;
}

async function syncFields() {
    console.log('Fetching existing custom fields from Bitrix...');
    const existing = await callBitrix('crm.deal.userfield.list');

    const mappedFields = {};

    for (const target of TARGET_FIELDS) {
        // Search by LABEL
        const match = existing.find(f => {
            const labelValue = f.EDIT_FORM_LABEL?.br?.[0] || Object.values(f.EDIT_FORM_LABEL || {})[0] || f.LIST_COLUMN_LABEL?.br?.[0];
            return labelValue === target.label;
        });

        if (match) {
            console.log(`[FOUND] Reusing existing field for '${target.label}' -> ${match.FIELD_NAME}`);
            mappedFields[target.key] = match.FIELD_NAME;
        } else {
            console.log(`[CREATE] Creating new field '${target.label}'...`);
            const fieldCode = `UF_CRM_${target.key}`;

            try {
                const newFieldId = await callBitrix('crm.deal.userfield.add', {
                    fields: {
                        FIELD_NAME: target.key,
                        USER_TYPE_ID: target.type,
                        XML_ID: `FPP_${target.key}`,
                        EDIT_FORM_LABEL: {
                            'br': target.label,
                            'en': target.label
                        },
                        LIST_COLUMN_LABEL: {
                            'br': target.label,
                            'en': target.label
                        },
                        LIST_FILTER_LABEL: {
                            'br': target.label,
                            'en': target.label
                        },
                        MANDATORY: 'Y'
                    }
                });
                console.log(`         -> Field created successfully! ID: ${newFieldId}`);

                // Note: userfield.add using 'FIELD_NAME: target.key' actually results in 'UF_CRM_YOURKEY'.
                // So if we send "FPP_NOME", the field is "UF_CRM_FPP_NOME".
                mappedFields[target.key] = `UF_CRM_${target.key}`;
            } catch (err) {
                console.error(`         -> Error creating field ${target.label}: ${err.message}`);
            }
        }
    }

    const outputPath = path.join(process.cwd(), 'lib', 'bitrix-field-map.json');
    fs.writeFileSync(outputPath, JSON.stringify(mappedFields, null, 2));
    console.log(`\nSynchronization complete! Field map saved to ${outputPath}`);
}

syncFields().catch(console.error);
