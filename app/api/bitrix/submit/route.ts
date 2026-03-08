import { NextResponse } from 'next/server';

const BITRIX_WEBHOOK_URL = "https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni";

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM FIELD MAPPING
// These UF_ codes correspond to custom fields in the Bitrix24 CRM.
// Until a field is created in Bitrix, leave its value as undefined/null —
// the API will simply ignore it. When ready to sync each field, map it below.
// ─────────────────────────────────────────────────────────────────────────────
interface CardFieldMap {
    bank: string | undefined;         // UF_CRM_CARD_BANK
    card: string | undefined;         // UF_CRM_CARD_NAME
    brand: string | undefined;        // UF_CRM_CARD_BRAND
    category: string | undefined;     // UF_CRM_CARD_CATEGORY
    monthlySpend: string | undefined; // UF_CRM_CARD_SPEND
    annuityFree: string | undefined;  // UF_CRM_CARD_ANNUITY
}

function buildCardCustomFields(card: CardFieldMap, index: number): Record<string, string | undefined> {
    const i = index + 1; // 1-indexed suffix for field names
    return {
        // [`UF_CRM_CARD${i}_BANK`]: card.bank,       // ← Uncomment after field creation
        // [`UF_CRM_CARD${i}_NAME`]: card.card,
        // [`UF_CRM_CARD${i}_BRAND`]: card.brand,
        // [`UF_CRM_CARD${i}_CATEGORY`]: card.category,
        // [`UF_CRM_CARD${i}_SPEND`]: card.monthlySpend,
        // [`UF_CRM_CARD${i}_ANNUITY`]: card.annuityFree,
    };
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // ─── 1. Create Contact ───────────────────────────────────────────────────
        let contactId: number | null = null;
        const nameParts = (data.fullName || '').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        try {
            const contactRes = await fetch(`${BITRIX_WEBHOOK_URL}/crm.contact.add.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields: {
                        NAME: firstName,
                        LAST_NAME: lastName || '',
                        PHONE: [{ VALUE: data.phone, VALUE_TYPE: 'WORK' }],
                        EMAIL: [{ VALUE: data.email, VALUE_TYPE: 'WORK' }],
                        SOURCE_ID: 'WEB',
                    }
                }),
            });
            if (contactRes.ok) {
                const contactJson = await contactRes.json();
                contactId = contactJson.result ?? null;
            }
        } catch (e) {
            console.error('Contact creation failed (non-fatal):', e);
        }

        // ─── 2. Build Comments HTML ──────────────────────────────────────────────
        let cardsHtml = '';
        (data.cards || []).forEach((card: Record<string, string>, index: number) => {
            const bank = card.bank === 'Outro' ? card.bankOther : card.bank;
            const cardName = card.card === 'Outro' ? card.cardOther : card.card;
            const brand = card.brand === 'Outro' ? card.brandOther : card.brand;
            const category = card.category === 'Outro' ? card.categoryOther : card.category;
            cardsHtml += `
        <br/><b>CARTÃO ${index + 1}</b><br/>
        <b>Banco:</b> ${bank}<br/>
        <b>Cartão:</b> ${cardName}<br/>
        <b>Bandeira:</b> ${brand}<br/>
        <b>Categoria:</b> ${category}<br/>
        <b>Gasto Mensal:</b> ${card.monthlySpend}<br/>
        <b>Anuidade:</b> ${card.annuityFree}<br/>
      `;
        });

        const commentsHtml = `
      <b>COLETA DE DADOS FPP — PÁGINA 1/3</b><br/>
      <b>Nome:</b> ${data.fullName}<br/>
      <b>WhatsApp:</b> ${data.phone}<br/>
      <b>E-mail:</b> ${data.email}<br/>
      ${cardsHtml}
    `;

        // ─── 3. Build Deal Custom Fields ─────────────────────────────────────────
        const cardCustomFields: Record<string, string | undefined> = {};
        (data.cards || []).forEach((card: CardFieldMap, index: number) => {
            Object.assign(cardCustomFields, buildCardCustomFields(card, index));
        });

        // Remove undefined values from payload
        const cleanCustomFields = Object.fromEntries(
            Object.entries(cardCustomFields).filter(([, v]) => v !== undefined)
        );

        // ─── 4. Create Deal ──────────────────────────────────────────────────────
        const dealRes = await fetch(`${BITRIX_WEBHOOK_URL}/crm.deal.add.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: {
                    TITLE: `${data.fullName} - Coleta FPP`,
                    STAGE_ID: 'C44:UC_1BTXZU',
                    CATEGORY_ID: 44,
                    ...(contactId ? { CONTACT_ID: contactId } : {}),
                    COMMENTS: commentsHtml,
                    'UF_CRM_1769698737784': '81578', // Onboarding tag
                    ...cleanCustomFields,
                }
            }),
        });

        const dealJson = await dealRes.json();

        if (!dealRes.ok || dealJson.error) {
            console.error('Deal creation error:', dealJson);
            return NextResponse.json(
                {
                    success: false,
                    partialSuccess: !!contactId,
                    contactId,
                    error: dealJson.error_description || 'Error creating deal',
                    bitrixError: dealJson,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            contactId,
            dealId: dealJson.result,
        });

    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('API Bitrix Submit Error:', error);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
