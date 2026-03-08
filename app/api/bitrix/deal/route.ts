import { NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://fpp.bitrix24.com.br/rest/1058/145rhig7cpmobxni/';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing deal id' }, { status: 400 });
    }

    try {
        const response = await fetch(`${WEBHOOK_URL}crm.deal.get?id=${id}`);
        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: data.error_description }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching deal:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
