import { NextResponse } from 'next/server';

const BITRIX_WEBHOOK_URL = "https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 CUSTOM FIELD STUBS (Viagens Emitidas)
// Uncomment + fill UF_ code after creating each field in Bitrix.
// ─────────────────────────────────────────────────────────────────────────────
function buildStep2CustomFields(travel: Record<string, unknown>): Record<string, unknown> {
    return {
        // 'UF_CRM_TRIP_HAS_ISSUED': travel.hasIssuedTrips,
        // 'UF_CRM_TRIP_DEPARTURE_DATE': travel.departureDate,
        // 'UF_CRM_TRIP_RETURN_DATE': travel.returnDate,
        // 'UF_CRM_TRIP_COUNTRY': travel.country,
        // 'UF_CRM_TRIP_CITY': travel.city,
        // 'UF_CRM_TRIP_MULTI_DEST': travel.multipleDestinations,
        // 'UF_CRM_TRIP_EXTRA_DESTS': travel.extraDestinations,
        // 'UF_CRM_TRIP_ADULTS': travel.adults,
        // 'UF_CRM_TRIP_CHILDREN': travel.children,
        // 'UF_CRM_TRIP_BABIES': travel.babies,
        // 'UF_CRM_TRIP_REASON': travel.travelReason,
        // 'UF_CRM_TRIP_REASON_OTHER': travel.travelReasonOther,
        // 'UF_CRM_TRIP_SERVICES': JSON.stringify(travel.services),
        // 'UF_CRM_TRIP_UNRESERVED': JSON.stringify(travel.unreservedServices),
        // 'UF_CRM_TRIP_UNRESERVED_OTHER': travel.unreservedOther,
        // 'UF_CRM_TRIP_BUDGET': travel.budget,
        // 'UF_CRM_TRIP_OPTIMIZE': travel.teamOptimize,
        // 'UF_CRM_TRIP_NOTES': travel.travelNotes,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 CUSTOM FIELD STUBS (Viagem Planejada)
// ─────────────────────────────────────────────────────────────────────────────
function buildStep3CustomFields(planned: Record<string, unknown>): Record<string, unknown> {
    return {
        // 'UF_CRM_PLAN_HAS_PLANNED': planned.hasPlannedTrip,
        // 'UF_CRM_PLAN_COUNTRY': planned.country,
        // 'UF_CRM_PLAN_CITY': planned.city,
        // 'UF_CRM_PLAN_MULTI_DEST': planned.multipleDestinations,
        // 'UF_CRM_PLAN_EXTRA_DESTS': planned.extraDestinations,
        // 'UF_CRM_PLAN_TIMEFRAME': planned.timeframe,
        // 'UF_CRM_PLAN_DEPART_DATE': planned.plannedDepartureDate,
        // 'UF_CRM_PLAN_RETURN_DATE': planned.plannedReturnDate,
        // 'UF_CRM_PLAN_ADULTS': planned.adults,
        // 'UF_CRM_PLAN_CHILDREN': planned.children,
        // 'UF_CRM_PLAN_BABIES': planned.babies,
        // 'UF_CRM_PLAN_REASON': planned.travelReason,
        // 'UF_CRM_PLAN_REASON_OTHER': planned.travelReasonOther,
        // 'UF_CRM_PLAN_SERVICES': JSON.stringify(planned.plannedServices),
        // 'UF_CRM_PLAN_SERVICES_OTHER': planned.plannedServicesOther,
        // 'UF_CRM_PLAN_BUDGET': planned.budget,
        // 'UF_CRM_PLAN_TEAM_HELP': planned.teamHelp,
        // 'UF_CRM_PLAN_NOTES': planned.teamHelpNotes,
    };
}

function buildCommentSection(step: number, data: Record<string, unknown>): string {
    if (step === 2) {
        const t = data as Record<string, unknown>;
        const services = Array.isArray(t.services) ? t.services.join(', ') : '';
        const unreserved = Array.isArray(t.unreservedServices) ? t.unreservedServices.join(', ') : '';
        return `
      <br/><br/><b>VIAGENS JÁ EMITIDAS — PÁGINA 2/3</b><br/>
      <b>Possui viagens emitidas:</b> ${t.hasIssuedTrips}<br/>
      ${t.hasIssuedTrips === 'Sim' ? `
        <b>Data de ida:</b> ${t.departureDate}<br/>
        <b>Data de volta:</b> ${t.returnDate}<br/>
        <b>País:</b> ${t.country}<br/>
        <b>Cidade:</b> ${t.city}<br/>
        <b>Múltiplos destinos:</b> ${t.multipleDestinations}<br/>
        ${t.multipleDestinations === 'Sim' ? `<b>Destinos extras:</b> ${t.extraDestinations}<br/>` : ''}
        <b>Adultos:</b> ${t.adults} | <b>Crianças:</b> ${t.children} | <b>Bebês:</b> ${t.babies}<br/>
        <b>Motivo:</b> ${t.travelReason}${t.travelReason === 'Outro' ? ` (${t.travelReasonOther})` : ''}<br/>
        <b>Serviços incluídos:</b> ${services}<br/>
        <b>Serviços não reservados:</b> ${unreserved}${unreserved.includes('Outro') ? ` (${t.unreservedOther})` : ''}<br/>
        <b>Orçamento:</b> ${t.budget}<br/>
        <b>Otimização pela equipe:</b> ${t.teamOptimize}<br/>
        ${t.teamOptimize === 'Sim' ? `<b>Observações:</b> ${t.travelNotes}<br/>` : ''}
      ` : ''}
    `;
    }

    if (step === 3) {
        const p = data as Record<string, unknown>;
        const services = Array.isArray(p.plannedServices) ? p.plannedServices.join(', ') : '';
        return `
      <br/><br/><b>VIAGEM PLANEJADA — PÁGINA 3/3</b><br/>
      <b>Possui viagem planejada:</b> ${p.hasPlannedTrip}<br/>
      ${p.hasPlannedTrip === 'Sim' ? `
        <b>País:</b> ${p.country}<br/>
        <b>Cidade:</b> ${p.city}<br/>
        <b>Múltiplos destinos:</b> ${p.multipleDestinations}<br/>
        ${p.multipleDestinations === 'Sim' ? `<b>Destinos extras:</b> ${p.extraDestinations}<br/>` : ''}
        <b>Quando:</b> ${p.timeframe}<br/>
        ${p.timeframe !== 'Ainda não tenho data definida' ? `<b>Data ida:</b> ${p.plannedDepartureDate} | <b>Data volta:</b> ${p.plannedReturnDate}<br/>` : ''}
        <b>Adultos:</b> ${p.adults} | <b>Crianças:</b> ${p.children} | <b>Bebês:</b> ${p.babies}<br/>
        <b>Motivo:</b> ${p.travelReason}${p.travelReason === 'Outro' ? ` (${p.travelReasonOther})` : ''}<br/>
        <b>Serviços planejados:</b> ${services}${p.plannedServicesOther ? ` (Outro: ${p.plannedServicesOther})` : ''}<br/>
        <b>Orçamento:</b> ${p.budget}<br/>
        <b>Ajuda da equipe:</b> ${p.teamHelp}<br/>
        ${p.teamHelp === 'Sim' ? `<b>Observações:</b> ${p.teamHelpNotes}<br/>` : ''}
      ` : ''}
    `;
    }

    return '';
}

export async function POST(request: Request) {
    try {
        const { dealId, step, data } = await request.json();

        if (!dealId) {
            return NextResponse.json({ success: false, error: 'Missing dealId' }, { status: 400 });
        }

        const commentAppend = buildCommentSection(step, data);

        // Build custom fields based on step
        let stepCustomFields: Record<string, unknown> = {};
        if (step === 2) stepCustomFields = buildStep2CustomFields(data);
        if (step === 3) stepCustomFields = buildStep3CustomFields(data);

        const cleanCustomFields = Object.fromEntries(
            Object.entries(stepCustomFields).filter(([, v]) => v !== undefined && v !== null)
        );

        // Fetch existing deal to append to comments
        let existingComments = '';
        try {
            const getRes = await fetch(`${BITRIX_WEBHOOK_URL}/crm.deal.get.json?id=${dealId}`);
            if (getRes.ok) {
                const getJson = await getRes.json();
                existingComments = getJson.result?.COMMENTS || '';
            }
        } catch (e) {
            console.error('Failed to fetch existing deal (non-fatal):', e);
        }

        const updatedComments = existingComments + commentAppend;

        const updateRes = await fetch(`${BITRIX_WEBHOOK_URL}/crm.deal.update.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: dealId,
                fields: {
                    COMMENTS: updatedComments,
                    ...cleanCustomFields,
                }
            }),
        });

        const updateJson = await updateRes.json();

        if (!updateRes.ok || updateJson.error) {
            console.error('Deal update error:', updateJson);
            return NextResponse.json(
                {
                    success: false,
                    error: updateJson.error_description || 'Error updating deal',
                    bitrixError: updateJson,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, dealId });

    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('API Bitrix Update Error:', error);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
