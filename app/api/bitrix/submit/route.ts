import { NextResponse } from 'next/server';
import fieldMap from '@/lib/bitrix-field-map.json';

const BITRIX_WEBHOOK_URL = "https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni";

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

        // ─── 2. Build Deal Custom Fields ─────────────────────────────────────────
        const customFields: Record<string, string | undefined> = {};

        // Helper to safely assign if field exists in map
        const assignField = (key: keyof typeof fieldMap, value: any) => {
            const bitrixKey = fieldMap[key];
            if (bitrixKey && value !== undefined && value !== null && value !== '') {
                customFields[bitrixKey] = Array.isArray(value) ? value.join(', ') : String(value);
            }
        };

        // Personal Info
        assignField('FPP_NOME', data.fullName);
        assignField('FPP_WHATSAPP', data.phone);
        assignField('FPP_EMAIL', data.email);

        // Cards (up to 5)
        (data.cards || []).forEach((c: any, i: number) => {
            const index = i + 1;
            if (index > 5) return;
            assignField(`FPP_CARD_${index}_BANK` as keyof typeof fieldMap, c.bank === 'Outro' ? c.bankOther : c.bank);
            assignField(`FPP_CARD_${index}_NAME` as keyof typeof fieldMap, c.card === 'Outro' ? c.cardOther : c.card);
            assignField(`FPP_CARD_${index}_BRAND` as keyof typeof fieldMap, c.brand === 'Outro' ? c.brandOther : c.brand);
            assignField(`FPP_CARD_${index}_CATEGORY` as keyof typeof fieldMap, c.category === 'Outro' ? c.categoryOther : c.category);
            assignField(`FPP_CARD_${index}_SPEND` as keyof typeof fieldMap, c.monthlySpend);
            assignField(`FPP_CARD_${index}_ANNUITY` as keyof typeof fieldMap, c.annuityFree);
        });

        // Issued Trips
        assignField('FPP_HAS_ISSUED', data.travelIssued?.hasIssuedTrips);
        (data.travelIssued?.trips || []).forEach((t: any, i: number) => {
            const index = i + 1;
            if (index > 5) return;
            assignField(`FPP_ISSTRIP_${index}_DEP` as keyof typeof fieldMap, t.departureDate);
            assignField(`FPP_ISSTRIP_${index}_RET` as keyof typeof fieldMap, t.returnDate);
            assignField(`FPP_ISSTRIP_${index}_COUNTRY` as keyof typeof fieldMap, t.country);
            assignField(`FPP_ISSTRIP_${index}_CITY` as keyof typeof fieldMap, t.city);
            assignField(`FPP_ISSTRIP_${index}_MULTIPLE` as keyof typeof fieldMap, t.multipleDestinations);
            assignField(`FPP_ISSTRIP_${index}_EXTRA` as keyof typeof fieldMap, t.extraDestinations);
            assignField(`FPP_ISSTRIP_${index}_ADULTS` as keyof typeof fieldMap, t.adults);
            assignField(`FPP_ISSTRIP_${index}_CHILD` as keyof typeof fieldMap, t.children);
            assignField(`FPP_ISSTRIP_${index}_BABIES` as keyof typeof fieldMap, t.babies);
            assignField(`FPP_ISSTRIP_${index}_REASON` as keyof typeof fieldMap, t.travelReason);
            assignField(`FPP_ISSTRIP_${index}_REASON_OTH` as keyof typeof fieldMap, t.travelReasonOther);
            assignField(`FPP_ISSTRIP_${index}_SERVICES` as keyof typeof fieldMap, t.services);
            assignField(`FPP_ISSTRIP_${index}_UNRES` as keyof typeof fieldMap, t.unreservedServices);
            assignField(`FPP_ISSTRIP_${index}_UNRES_OTH` as keyof typeof fieldMap, t.unreservedOther);
            assignField(`FPP_ISSTRIP_${index}_BUDGET` as keyof typeof fieldMap, t.budget);
            assignField(`FPP_ISSTRIP_${index}_TEAM_OPT` as keyof typeof fieldMap, t.teamOptimize);
            assignField(`FPP_ISSTRIP_${index}_NOTES` as keyof typeof fieldMap, t.travelNotes);
        });

        // Planned Trips
        assignField('FPP_HAS_PLANNED', data.travelPlanned?.hasPlannedTrip);
        assignField('FPP_PLAN_COUNTRY', data.travelPlanned?.country);
        assignField('FPP_PLAN_CITY', data.travelPlanned?.city);
        assignField('FPP_PLAN_MULTIPLE', data.travelPlanned?.multipleDestinations);
        assignField('FPP_PLAN_EXTRA', data.travelPlanned?.extraDestinations);
        assignField('FPP_PLAN_TIME', data.travelPlanned?.timeframe);
        assignField('FPP_PLAN_DEP', data.travelPlanned?.plannedDepartureDate);
        assignField('FPP_PLAN_RET', data.travelPlanned?.plannedReturnDate);
        assignField('FPP_PLAN_ADULTS', data.travelPlanned?.adults);
        assignField('FPP_PLAN_CHILD', data.travelPlanned?.children);
        assignField('FPP_PLAN_BABIES', data.travelPlanned?.babies);
        assignField('FPP_PLAN_REASON', data.travelPlanned?.travelReason);
        assignField('FPP_PLAN_REASON_OTH', data.travelPlanned?.travelReasonOther);
        assignField('FPP_PLAN_SVCS', data.travelPlanned?.plannedServices);
        assignField('FPP_PLAN_SVCS_OTH', data.travelPlanned?.plannedServicesOther);
        assignField('FPP_PLAN_BUDGET', data.travelPlanned?.budget);
        assignField('FPP_PLAN_HELP', data.travelPlanned?.teamHelp);
        assignField('FPP_PLAN_HELP_NOTES', data.travelPlanned?.teamHelpNotes);

        // ─── 3. Build Comments HTML (Fallback / Overview) ────────────────────────
        let cardsHtml = '';
        (data.cards || []).forEach((c: any, index: number) => {
            cardsHtml += `
        <br/><b>CARTÃO ${index + 1}</b><br/>
        <b>Banco:</b> ${c.bank === 'Outro' ? c.bankOther : c.bank}<br/>
        <b>Cartão:</b> ${c.card === 'Outro' ? c.cardOther : c.card}<br/>
        <b>Bandeira:</b> ${c.brand === 'Outro' ? c.brandOther : c.brand}<br/>
        <b>Categoria:</b> ${c.category === 'Outro' ? c.categoryOther : c.category}<br/>
        <b>Gasto Mensal:</b> ${c.monthlySpend}<br/>
        <b>Anuidade:</b> ${c.annuityFree}<br/>
      `;
        });
        const commentsHtml = `
      <b>COLETA DE DADOS FPP</b><br/>
      <b>Nome:</b> ${data.fullName}<br/>
      <b>WhatsApp:</b> ${data.phone}<br/>
      <b>E-mail:</b> ${data.email}<br/>
      ${cardsHtml}
      <br/><i>* Demais informações preenchidas estão na aba "COLETA DE INFORMAÇÕES" do card.</i>
    `;

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
                    ...customFields,
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
