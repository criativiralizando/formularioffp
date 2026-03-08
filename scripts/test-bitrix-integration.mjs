import fetch from 'node-fetch';

const testPayload = {
    personalInfo: {
        fullName: 'Teste Integracao',
        phone: '11999999999',
        email: 'teste.integracao@example.com',
    },
    cards: [
        {
            bank: 'Itaú',
            cardName: 'Azul Infinite',
            brand: 'Visa',
            category: 'Black/Infinite',
            monthlySpend: '10000',
            annuity: 'SIM'
        }
    ],
    hasIssuedTrips: 'SIM',
    issuedTrips: [
        {
            departureDate: '2023-12-01',
            returnDate: '2023-12-10',
            country: 'EUA',
            city: 'Orlando',
            multipleDestinations: 'NÃO',
            extraDestinations: '',
            adults: 2,
            children: 1,
            babies: 0,
            reason: 'Lazer',
            reasonOther: '',
            servicesReserved: ['Aéreo', 'Hospedagem'],
            servicesUnreserved: ['Carro'],
            unreservedOther: '',
            budget: 'U$ 5000',
            teamOptimization: 'SIM',
            notes: 'Teste de integração'
        }
    ],
    hasPlannedTrips: 'SIM',
    plannedTripsDetails: {
        country: 'França',
        city: 'Paris',
        multipleDestinations: 'NÃO',
        extraDestinations: '',
        estimatedTime: '2024-06',
        departureDate: '2024-06-01',
        returnDate: '2024-06-15',
        adults: 2,
        children: 0,
        babies: 0,
        reason: 'Lazer',
        reasonOther: '',
        servicesToReserve: ['Aéreo', 'Hospedagem', 'Seguro'],
        servicesToReserveOther: '',
        estimatedBudget: 'U$ 10000',
        needsHelp: 'SIM',
        helpNotes: 'Quero dicas de restaurantes'
    }
};

async function test() {
    console.log('Testing Bitrix Integration API...');
    try {
        const res = await fetch('http://localhost:3000/api/bitrix/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error hitting localhost:3000', err.message);
        console.log('Make sure the dev server is running!');
    }
}

test();
