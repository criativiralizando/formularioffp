import { NextResponse } from 'next/server';
import fieldMap from '@/lib/bitrix-field-map.json';

const BITRIX_WEBHOOK_URL = "https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const dealId = data.dealId;

        // ─── 1. Handle Contact (Only if creating new deal or explicitly requested) ───
        let contactId: number | null = null;
        if (!dealId) {
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
        }

        // ─── 2. Build Deal Custom Fields ─────────────────────────────────────────
        const customFields: Record<string, string | undefined> = {};

        // Helper to safely assign if field exists in map
        const assignField = (key: keyof typeof fieldMap, value: any) => {
            const bitrixKey = fieldMap[key as keyof typeof fieldMap];
            if (bitrixKey && value !== undefined && value !== null && value !== '') {
                if (typeof value === 'boolean') {
                    customFields[bitrixKey] = value ? 'Sim' : 'Não';
                } else {
                    customFields[bitrixKey] = Array.isArray(value) ? value.join(', ') : String(value);
                }
            }
        };
        Greenland:

        // Identification & Management (PRIORITY)
        assignField('NOME', data.fullName);
        assignField('TIPO_DEMANDA', data.tipoDemanda);
        assignField('WHATSAPP', data.phone);
        assignField('EMAIL', data.email);
        assignField('RESPONSAVEL', data.responsavel);
        assignField('COMENTARIO', data.comentario);

        // Cards (up to 5)
        (data.cards || []).forEach((c: any, i: number) => {
            const index = i + 1;
            if (index > 5) return;
            assignField(`CARD_${index}_BANK` as any, c.bank === 'Outro' ? c.bankOther : c.bank);
            assignField(`CARD_${index}_NAME` as any, c.card === 'Outro' ? c.cardOther : c.card);
            assignField(`CARD_${index}_BRAND` as any, c.brand === 'Outro' ? c.brandOther : c.brand);
            assignField(`CARD_${index}_CATEGORY` as any, c.category === 'Outro' ? c.categoryOther : c.category);
            assignField(`CARD_${index}_SPEND` as any, c.monthlySpend);
            assignField(`CARD_${index}_ANNUITY` as any, c.annuityFree);
        });

        // Issued Trips
        const step2 = data.step2 || {};
        assignField('HAS_ISSUED', step2.hasIssuedTrips);
        (step2.trips || []).forEach((t: any, i: number) => {
            const index = i + 1;
            if (index > 5) return;
            assignField(`ISSTRIP_${index}_DEP` as any, t.departureDate);
            assignField(`ISSTRIP_${index}_RET` as any, t.returnDate);
            assignField(`ISSTRIP_${index}_COUNTRY` as any, t.country);
            assignField(`ISSTRIP_${index}_CITY` as any, t.city);
            assignField(`ISSTRIP_${index}_MULTIPLE` as any, t.multipleDestinations);
            assignField(`ISSTRIP_${index}_EXTRA` as any, t.extraDestinations);
            assignField(`ISSTRIP_${index}_ADULTS` as any, t.adults);
            assignField(`ISSTRIP_${index}_CHILD` as any, t.children);
            assignField(`ISSTRIP_${index}_BABIES` as any, t.babies);
            assignField(`ISSTRIP_${index}_REASON` as any, t.travelReason);
            assignField(`ISSTRIP_${index}_REASON_OTH` as any, t.travelReasonOther);
            assignField(`ISSTRIP_${index}_SERVICES` as any, t.services);
            assignField(`ISSTRIP_${index}_UNRES` as any, t.unreservedServices);
            assignField(`ISSTRIP_${index}_UNRES_OTH` as any, t.unreservedOther);
            assignField(`ISSTRIP_${index}_BUDGET` as any, t.budget);
            assignField(`ISSTRIP_${index}_TEAM_OPT` as any, t.teamOptimize);
            assignField(`ISSTRIP_${index}_NOTES` as any, t.travelNotes);
        });

        // Planned Trips
        const step3 = data.step3 || {};
        assignField('HAS_PLANNED', step3.hasPlannedTrip);
        assignField('PLAN_COUNTRY', step3.country);
        assignField('PLAN_CITY', step3.city);
        assignField('PLAN_MULTIPLE', step3.multipleDestinations);
        assignField('PLAN_EXTRA', step3.extraDestinations);
        assignField('PLAN_TIME', step3.timeframe);
        assignField('PLAN_DEP', step3.plannedDepartureDate);
        assignField('PLAN_RET', step3.plannedReturnDate);
        assignField('PLAN_ADULTS', step3.adults);
        assignField('PLAN_CHILD', step3.children);
        assignField('PLAN_BABIES', step3.babies);
        assignField('PLAN_REASON', step3.travelReason);
        assignField('PLAN_REASON_OTH', step3.travelReasonOther);
        assignField('PLAN_SVCS', step3.plannedServices);
        assignField('PLAN_SVCS_OTH', step3.plannedServicesOther);
        assignField('PLAN_BUDGET', step3.budget);
        assignField('PLAN_HELP', step3.teamHelp);
        assignField('PLAN_HELP_NOTES', step3.teamHelpNotes);

        // ─── 3. Build Comments HTML (Fallack / Overview) ────────────────────────
        let cardsHtml = '';
        (data.cards || []).forEach((c: any, index: number) => {
            cardsHtml += `
        <br/><b>CARTÃO ${index + 1}</b><br/>
        <b>Banco:</b> ${(c.bank === 'Outro' ? c.bankOther : c.bank) || 'N/A'}<br/>
        <b>Cartão:</b> ${(c.card === 'Outro' ? c.cardOther : c.card) || 'N/A'}<br/>
        <b>Bandeira:</b> ${(c.brand === 'Outro' ? c.brandOther : c.brand) || 'N/A'}<br/>
        <b>Categoria:</b> ${(c.category === 'Outro' ? c.categoryOther : c.category) || 'N/A'}<br/>
        <b>Gasto Mensal:</b> ${c.monthlySpend || 'N/A'}<br/>
        <b>Anuidade:</b> ${c.annuityFree || 'N/A'}<br/>
      `;
        });

        const commentsHtml = `
      <b>COLETA DE DADOS FPP - FINALIZADO</b><br/>
      <b>Responsável:</b> ${data.responsavel || 'N/A'}<br/>
      <b>Comentário:</b> ${data.comentario || 'N/A'}<br/>
      <hr/>
      <b>Nome Cliente:</b> ${data.fullName || 'N/A'}<br/>
      <b>WhatsApp:</b> ${data.phone || 'N/A'}<br/>
      <b>E-mail:</b> ${data.email || 'N/A'}<br/>
      ${cardsHtml}
      <br/><i>* Demais informações preenchidas estão na aba "COLETA DE INFORMAÇÕES" do card.</i>
    `;

        // ─── 4. Create or Update Deal ────────────────────────────────────────────
        if (dealId) {
            // Fetch existing comments to append
            let existingComments = '';
            try {
                const getRes = await fetch(`${BITRIX_WEBHOOK_URL}/crm.deal.get.json?id=${dealId}`);
                if (getRes.ok) {
                    const getJson = await getRes.json();
                    existingComments = getJson.result?.COMMENTS || '';
                }
            } catch (e) {
                console.error('Failed to fetch existing comments:', e);
            }

            const updateRes = await fetch(`${BITRIX_WEBHOOK_URL}/crm.deal.update.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: dealId,
                    fields: {
                        COMMENTS: existingComments + '<br/><br/>' + commentsHtml,
                        ...customFields,
                    }
                }),
            });

            const updateJson = await updateRes.json();
            if (!updateRes.ok || updateJson.error) {
                throw new Error(updateJson.error_description || 'Error updating deal');
            }

            return NextResponse.json({ success: true, dealId });
        } else {
            // Create New Deal
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
                throw new Error(dealJson.error_description || 'Error creating deal');
            }

            return NextResponse.json({
                success: true,
                contactId,
                dealId: dealJson.result,
            });
        }

    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('API Bitrix Submit Error:', error);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

