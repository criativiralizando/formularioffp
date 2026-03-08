import { jsPDF } from 'jspdf';
import { supabase } from './supabaseClient';

const sanitizeFilename = (str: string) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "_")           // Spaces → underscores
        .replace(/[^a-zA-Z0-9_]/g, "")  // Remove special chars
        .replace(/__+/g, "_")           // Remove double underscores
        .replace(/^_|_$/g, "");         // Remove leading/trailing underscores
};

// --- Colors ---
const C_DARK = {
    primary: '#e34248',   // FPP red
    bg: '#1a1a1a',
    surface: '#242424',
    border: '#333333',
    text: '#f0f0f0',
    muted: '#888888',
    white: '#ffffff',
};

const C_LIGHT = {
    primary: '#e34248',
    bg: '#ffffff',
    surface: '#f8f8f8',
    border: '#e5e5e5',
    text: '#1a1a1a',
    muted: '#666666',
    white: '#000000',
};

// --- Helpers ---
function hex2rgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function setFillHex(doc: jsPDF, hex: string) {
    doc.setFillColor(...hex2rgb(hex));
}

function setDrawHex(doc: jsPDF, hex: string) {
    doc.setDrawColor(...hex2rgb(hex));
}

function setTextHex(doc: jsPDF, hex: string) {
    doc.setTextColor(...hex2rgb(hex));
}

function checkPage(doc: jsPDF, y: number, pageH: number, margin = 14): number {
    if (y > pageH - margin) {
        doc.addPage();
        return 20;
    }
    return y;
}

export async function generateAndUploadPDF(
    _elementId: string,
    formData: any,
    email: string,
    theme: 'dark' | 'light' = 'dark'
): Promise<string | null> {
    try {
        const isDark = theme === 'dark';
        const colors = isDark ? C_DARK : C_LIGHT;

        // Load logo from public folder as base64
        let logoBase64: string | null = null;
        let logoFormat: string = 'PNG';
        try {
            // "A Logo é a de nome "Black.png" a mesma que aparece no projeto dark" - per user request
            const logoPath = isDark ? '/Black.png' : '/Light.png';
            const resp = await fetch(logoPath);
            if (resp.ok) {
                const arrayBuf = await resp.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuf);
                let binary = '';
                uint8.forEach(b => binary += String.fromCharCode(b));
                logoBase64 = btoa(binary);
                logoFormat = 'PNG';
            }
        } catch (e) {
            console.warn('[PDF] Não foi possível carregar a logomarca:', e);
        }
        const pageW = 210;
        const pageH = 297;
        const margin = 14;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        // ── Background ──────────────────────────────────────────────
        setFillHex(doc, colors.bg);
        doc.rect(0, 0, pageW, pageH, 'F');

        // ── Header ───────────────────────────────────────────────────
        setFillHex(doc, colors.surface);
        doc.rect(0, 0, pageW, 28, 'F');
        setFillHex(doc, colors.primary);
        doc.rect(0, 0, 8, 28, 'F'); // Accent bar on the left

        // Logo in header (Top Left)
        const logoW = 38;
        if (logoBase64) {
            try {
                // Logo height = 10mm, maintain aspect ratio
                const logoH = 10;
                // Add logo at margin + 2 to give space from the accent bar
                doc.addImage(`data:image/png;base64,${logoBase64}`, logoFormat, margin + 2, 9, logoW, logoH, undefined, 'FAST');
            } catch (e) {
                console.warn('[PDF] Erro ao inserir logo:', e);
            }
        }

        const textCenterX = pageW / 2;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        setTextHex(doc, isDark ? colors.white : colors.text);
        doc.text('RELATÓRIO DE GESTÃO FPP', textCenterX, 13, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setTextHex(doc, colors.muted);
        doc.text('Fly Per Points – Gestão de Viagens & Experiências', textCenterX, 18, { align: 'center' });

        const now = new Date();
        const dateLabel = now.toLocaleString('pt-BR');
        doc.text(dateLabel, pageW - margin, 18, { align: 'right' });

        let y = 36;

        // --- Inner Helpers (using theme colors) ---
        const localAddSection = (doc: jsPDF, title: string, currY: number) => {
            setFillHex(doc, colors.primary);
            doc.rect(14, currY, 3, 5, 'F');
            setTextHex(doc, colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(title.toUpperCase(), 20, currY + 4);
            setDrawHex(doc, colors.border);
            doc.setLineWidth(0.2);
            doc.line(14, currY + 6, pageW - 14, currY + 6);
            return currY + 10;
        };

        const localAddField = (doc: jsPDF, label: string, val: string, x: number, currY: number, colW = 55) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            setTextHex(doc, colors.muted);
            doc.text(label.toUpperCase(), x, currY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setTextHex(doc, colors.text);
            const lines = doc.splitTextToSize(val || '—', colW - 2);
            doc.text(lines, x, currY + 4);
            return currY + 4 + (lines.length * 4);
        };

        // ── Section 1: Personal ──────────────────────────────────────
        y = localAddSection(doc, '1. Informações Pessoais', y);

        const step1 = formData.step1 || formData;
        const colW = (pageW - margin * 2) / 3;

        localAddField(doc, 'Nome Completo', step1.fullName, margin, y, colW);
        localAddField(doc, 'E-mail', step1.email, margin + colW, y, colW);
        localAddField(doc, 'WhatsApp', step1.phone, margin + colW * 2, y, colW);
        y += 14;

        // ── Section 2: Cards ─────────────────────────────────────────
        y = checkPage(doc, y + 4, pageH);
        setFillHex(doc, colors.bg);
        doc.rect(0, y - 5, pageW, pageH, 'F'); // re-fill bg if new page

        y = localAddSection(doc, '2. Cartões e Gastos', y);

        const cards = step1.cards || [];
        if (cards.length === 0) {
            setTextHex(doc, colors.muted);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Nenhum cartão informado.', margin, y);
            y += 8;
        } else {
            cards.forEach((card: any, i: number) => {
                y = checkPage(doc, y + 2, pageH);

                // Card block background
                setFillHex(doc, colors.surface);
                setDrawHex(doc, colors.border);
                doc.setLineWidth(0.3);
                doc.roundedRect(margin, y, pageW - margin * 2, 26, 2, 2, 'FD');

                // Card accent stripe
                setFillHex(doc, colors.primary);
                doc.roundedRect(margin, y, 3, 26, 1, 1, 'F');

                // Card header label
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                setTextHex(doc, colors.primary);
                const cardLabel = card.card === 'Outro' ? (card.cardOther || 'Outro') : (card.card || 'Cartão ' + (i + 1));
                doc.text(`CARTÃO ${i + 1}  |  ${cardLabel.toUpperCase()}`, margin + 6, y + 6);

                // Mapping annuity status
                const annuityStatus = card.annuityFree === 'SIM' ? 'Paga' : (card.annuityFree === 'NÃO' ? 'Não Paga' : (card.annuityFree || '—'));

                // Card fields
                const cY = y + 10;
                const cW = (pageW - margin * 2 - 6) / 4;
                localAddField(doc, 'Banco', card.bank === 'Outro' ? card.bankOther : card.bank, margin + 6, cY, cW);
                localAddField(doc, 'Bandeira', card.brand === 'Outro' ? card.brandOther : card.brand, margin + 6 + cW, cY, cW);
                localAddField(doc, 'Categoria', card.category === 'Outro' ? card.categoryOther : card.category, margin + 6 + cW * 2, cY, cW);
                localAddField(doc, 'Gasto / Anuidade', `${card.monthlySpend || '—'} | ${annuityStatus}`, margin + 6 + cW * 3, cY, cW);

                y += 30;
            });
        }

        // ── Section 3: Issued Trips ───────────────────────────────────
        y = checkPage(doc, y + 4, pageH);
        y = localAddSection(doc, '3. Viagens Já Emitidas', y);

        const step2 = formData.step2 || {};
        setTextHex(doc, colors.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Possui viagens emitidas: ${step2.hasIssuedTrips || '—'}`, margin, y);
        y += 6;

        if (step2.hasIssuedTrips === 'Sim' && step2.trips?.length > 0) {
            step2.trips.forEach((trip: any, i: number) => {
                y = checkPage(doc, y + 2, pageH);

                setFillHex(doc, colors.surface);
                setDrawHex(doc, colors.border);
                doc.setLineWidth(0.3);
                doc.roundedRect(margin, y, pageW - margin * 2, 24, 2, 2, 'FD');
                setFillHex(doc, colors.primary);
                doc.roundedRect(margin, y, 3, 24, 1, 1, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                setTextHex(doc, colors.primary);
                doc.text(`VIAGEM ${i + 1}  |  ${(trip.city || '').toUpperCase()}, ${(trip.country || '').toUpperCase()}`, margin + 6, y + 6);

                const tW = (pageW - margin * 2 - 6) / 3;
                localAddField(doc, 'Período', `${trip.departureDate || '—'} → ${trip.returnDate || '—'}`, margin + 6, y + 10, tW);
                localAddField(doc, 'Viajantes', `${trip.adults || 0}A / ${trip.children || 0}C / ${trip.babies || 0}B`, margin + 6 + tW, y + 10, tW);
                localAddField(doc, 'Motivo', trip.travelReason === 'Outro' ? trip.travelReasonOther : trip.travelReason, margin + 6 + tW * 2, y + 10, tW);

                y += 28;
            });
        }

        // ── Section 4: Planned Trip ───────────────────────────────────
        y = checkPage(doc, y + 4, pageH);
        y = localAddSection(doc, '4. Viagem Planejada', y);

        const step3 = formData.step3 || {};
        setTextHex(doc, colors.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Tem viagem planejada: ${step3.hasPlannedTrip || '—'}`, margin, y);
        y += 6;

        if (step3.hasPlannedTrip === 'Sim') {
            setFillHex(doc, colors.surface);
            setDrawHex(doc, colors.border);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, y, pageW - margin * 2, 30, 2, 2, 'FD');
            setFillHex(doc, colors.primary);
            doc.roundedRect(margin, y, 3, 30, 1, 1, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            setTextHex(doc, colors.primary);
            doc.text(`${(step3.city || '').toUpperCase()}, ${(step3.country || '').toUpperCase()}`, margin + 6, y + 6);

            const pW = (pageW - margin * 2 - 6) / 3;
            localAddField(doc, 'Quando', step3.timeframe, margin + 6, y + 10, pW);
            localAddField(doc, 'Viajantes', `${step3.adults || 0}A / ${step3.children || 0}C / ${step3.babies || 0}B`, margin + 6 + pW, y + 10, pW);
            const services = (step3.plannedServices || []).join(', ');
            localAddField(doc, 'Serviços', services || '—', margin + 6 + pW * 2, y + 10, pW);

            y += 34;
        }

        // ── Footer ────────────────────────────────────────────────────
        const footerY = pageH - 8;
        setDrawHex(doc, colors.border);
        doc.setLineWidth(0.2);
        doc.line(margin, footerY - 2, pageW - margin, footerY - 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        setTextHex(doc, colors.muted);
        doc.text('© ' + now.getFullYear() + ' Fly Per Points. Todos os direitos reservados.', pageW / 2, footerY, { align: 'center' });

        // ── Generate ArrayBuffer ─────────────────────────────────────────────
        const pdfArrayBuffer = doc.output('arraybuffer');
        console.log('[PDF] Tamanho do arquivo:', (pdfArrayBuffer.byteLength / 1024).toFixed(0), 'KB');

        // ── Filename ──────────────────────────────────────────────────
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}_${month}_${year}`;

        const rawName = (formData.step1?.fullName) || (formData.fullName) || email.split('@')[0];
        const safeName = sanitizeFilename(rawName);
        const uniqueId = Date.now().toString().slice(-6); // Add a short unique identifier
        const fileName = `${safeName}_${dateStr}_${uniqueId}.pdf`;

        console.log('[PDF] Nome do arquivo:', fileName);

        // ── Upload ────────────────────────────────────────────────────
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Coleta')
            .upload(fileName, pdfArrayBuffer, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[PDF] Erro no upload:', uploadError.message, uploadError);
            return null;
        }

        console.log('[PDF] Upload bem-sucedido:', uploadData);

        const { data: publicUrlData } = supabase.storage
            .from('Coleta')
            .getPublicUrl(fileName);

        console.log('[PDF] URL pública:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;

    } catch (error) {
        console.error('[PDF] Erro crítico ao gerar PDF:', error);
        return null;
    }
}
