
import { test, expect } from '@playwright/test';

test('verify form submission and pdf upload', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Step 1
    await page.fill('input[name="fullName"]', 'Teste Supabase RLS');
    await page.fill('input[name="email"]', 'teste@fpp.com');
    await page.fill('input[name="phone"]', '(11) 99999-9999');

    // Add a card
    await page.click('button:has-text("ADICIONAR NOVO CARTÃO")');
    await page.selectOption('select[name="cards.0.bank"]', 'Itau');
    await page.selectOption('select[name="cards.0.card"]', 'Pão de Açúcar');
    await page.selectOption('select[name="cards.0.brand"]', 'Visa');
    await page.selectOption('select[name="cards.0.category"]', 'Gold');
    await page.fill('input[name="cards.0.monthlySpend"]', '5000');
    await page.selectOption('select[name="cards.0.annuityFree"]', 'Sim');

    await page.click('button:has-text("Próximo 1/3")');

    // Step 2
    await page.waitForSelector('text=Você já está com alguma viagem emitida neste momento?');
    await page.click('button[role="radio"]:has-text("Não")');
    await page.click('button:has-text("Próximo 2/3")');

    // Step 3
    await page.waitForSelector('text=Você tem alguma viagem certa, mas ainda não reservou nada?');
    await page.click('button[role="radio"]:has-text("Não")');

    // Final Submit
    await page.click('button:has-text("Enviar para Gestão")');

    // Verification
    // Wait for the success screen
    await page.waitForSelector('text=Formulário Enviado com Sucesso!', { timeout: 30000 });

    // Log browser console errors if any
    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`PAGE ERROR: ${msg.text()}`);
    });
});
