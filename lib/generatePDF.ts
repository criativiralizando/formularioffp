import { jsPDF } from 'jspdf';
import { supabase } from './supabaseClient';

const sanitizeFilename = (str: string) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9]/g, "_") // Remove special chars
        .replace(/__+/g, "_")          // Remove double underscores
        .replace(/^_|_$/g, "");        // Remove leading/trailing underscores
};

export async function generateAndUploadPDF(formData: any, email: string): Promise<string | null> {
    try {
        // Inicializa o jsPDF com compressão ativada para deixar o arquivo mais leve
        const doc = new jsPDF({ compress: true });

        // Configurações iniciais
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('Relatório Consolidado - Coleta FFP', 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 27);

        // Linha divisória inicial
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 32, 190, 32);

        doc.setFontSize(11);
        let yPos = 42;
        const lineHeight = 6;
        const pageHeight = 280;

        const addText = (text: string, isBold: boolean = false, spacing: number = lineHeight) => {
            if (yPos > pageHeight) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');

            const splitText = doc.splitTextToSize(text, 170);
            doc.text(splitText, 20, yPos);
            yPos += (splitText.length * spacing);
        };

        const addSeparator = () => {
            yPos += 2;
            doc.setDrawColor(230, 230, 230);
            doc.line(20, yPos, 190, yPos);
            yPos += 8;
        };

        // --- Passo 1: Informações Pessoais ---
        addText('1. INFORMAÇÕES PESSOAIS', true, 8);
        addText(`Nome Completo: ${formData.fullName || 'Não informado'}`);
        addText(`E-mail: ${formData.email || 'Não informado'}`);
        addText(`Telefone/WhatsApp: ${formData.phone || 'Não informado'}`);

        yPos += 4;

        // --- Passo 1: Cartões ---
        if (formData.cards && formData.cards.length > 0) {
            addText('CARTÕES E GASTOS', true, 8);
            formData.cards.forEach((card: any, index: number) => {
                addText(`Cartão ${index + 1}:`, true);
                addText(`  Banco: ${card.bank === 'Outro' ? card.bankOther : card.bank}`);
                addText(`  Cartão: ${card.card === 'Outro' ? card.cardOther : card.card}`);
                addText(`  Bandeira: ${card.brand === 'Outro' ? card.brandOther : card.brand}`);
                addText(`  Categoria: ${card.category === 'Outro' ? card.categoryOther : card.category}`);
                addText(`  Gasto Mensal: ${card.monthlySpend || 'N/A'}`);
                addText(`  Isento de Anuidade: ${card.annuityFree || 'N/A'}`);
                yPos += 2;
            });
        }

        addSeparator();

        // --- Passo 2: Viagens Emitidas ---
        if (formData.step2) {
            addText('2. VIAGENS JÁ EMITIDAS', true, 8);
            addText(`Possui viagens emitidas no momento? ${formData.step2.hasIssuedTrips}`);

            if (formData.step2.hasIssuedTrips === 'Sim' && formData.step2.trips) {
                formData.step2.trips.forEach((trip: any, index: number) => {
                    yPos += 2;
                    addText(`Viagem Emitida #${index + 1}:`, true);
                    addText(`  Período: ${trip.departureDate || 'N/A'} até ${trip.returnDate || 'N/A'}`);
                    addText(`  Destino: ${trip.city || ''}, ${trip.country || ''}`);
                    if (trip.multipleDestinations === 'Sim') {
                        addText(`  Destinos Adicionais: ${trip.extraDestinations || ''}`);
                    }
                    addText(`  Passageiros: ${trip.adults || 0} Adultos, ${trip.children || 0} Crianças, ${trip.babies || 0} Bebês`);
                    addText(`  Motivo: ${trip.travelReason === 'Outro' ? trip.travelReasonOther : trip.travelReason}`);

                    if (trip.services && trip.services.length > 0) {
                        addText(`  Serviços já reservados: ${trip.services.join(', ')}`);
                    }

                    if (trip.unreservedServices && trip.unreservedServices.length > 0) {
                        let pendingStr = trip.unreservedServices.join(', ');
                        if (trip.unreservedServices.includes('Outro') && trip.unreservedOther) {
                            pendingStr = pendingStr.replace('Outro', `Outro (${trip.unreservedOther})`);
                        }
                        addText(`  Serviços Pendentes: ${pendingStr}`);
                    }

                    addText(`  Orçamento Planejado: ${trip.budget || ''}`);
                    addText(`  Deseja ajuda da equipe FFP para otimizar? ${trip.teamOptimize || 'Não'}`);
                    if (trip.travelNotes) {
                        addText(`  Observações: ${trip.travelNotes}`);
                    }
                });
            }
            yPos += 4;
            addSeparator();
        }

        // --- Passo 3: Viagens Planejadas ---
        if (formData.step3) {
            addText('3. PRÓXIMAS VIAGENS (PLANEJADAS)', true, 8);
            addText(`Tem alguma viagem certa, mas ainda não reservou nada? ${formData.step3.hasPlannedTrip}`);

            if (formData.step3.hasPlannedTrip === 'Sim') {
                yPos += 2;
                addText(`  Destino: ${formData.step3.city || ''}, ${formData.step3.country || ''}`);
                if (formData.step3.multipleDestinations === 'Sim') {
                    addText(`  Destinos Adicionais: ${formData.step3.extraDestinations || ''}`);
                }
                addText(`  Período Previsto: ${formData.step3.timeframe || 'Não definido'}`);
                if (formData.step3.timeframe === 'Já tenho as datas') {
                    addText(`  Datas: ${formData.step3.plannedDepartureDate || ''} até ${formData.step3.plannedReturnDate || ''}`);
                }

                addText(`  Passageiros: ${formData.step3.adults || 0} Adultos, ${formData.step3.children || 0} Crianças, ${formData.step3.babies || 0} Bebês`);
                addText(`  Motivo: ${formData.step3.travelReason === 'Outro' ? formData.step3.travelReasonOther : formData.step3.travelReason}`);

                if (formData.step3.plannedServices && formData.step3.plannedServices.length > 0) {
                    let plannedStr = formData.step3.plannedServices.join(', ');
                    if (formData.step3.plannedServices.includes('Outro') && formData.step3.plannedServicesOther) {
                        plannedStr = plannedStr.replace('Outro', `Outro (${formData.step3.plannedServicesOther})`);
                    }
                    addText(`  Serviços Necessários: ${plannedStr}`);
                }

                addText(`  Orçamento Estimado: ${formData.step3.budget || ''}`);
                addText(`  Deseja ajuda da equipe FFP para otimizar? ${formData.step3.teamHelp || 'Não'}`);
                if (formData.step3.teamHelpNotes) {
                    addText(`  Observações: ${formData.step3.teamHelpNotes}`);
                }
            }
        }

        // Gerar o PDF comprimido como ArrayBuffer para upload mais seguro e leve
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

        // Criar um nome de arquivo único e sanitizado
        const timestamp = new Date().getTime();
        const rawName = formData.fullName || email.split('@')[0];
        const safeName = sanitizeFilename(rawName);
        const fileName = `coleta_${safeName}_${timestamp}.pdf`;

        // Upload para o Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Coleta')
            .upload(fileName, pdfBlob, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Erro detalhado no upload do PDF para o Supabase:', uploadError);
            console.error('IMPORTANTE: Verifique as políticas RLS (Row Level Security) do bucket "Coleta". Se estiver usando o anon key, é necessário ter permissão de INSERT no bucket.');
            return null;
        }

        // Retornar a URL pública
        const { data: publicUrlData } = supabase.storage
            .from('Coleta')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Erro ao gerar/enviar PDF:', error);
        return null;
    }
}
