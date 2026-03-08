import { jsPDF } from 'jspdf';
import { supabase } from './supabaseClient';

export async function generateAndUploadPDF(formData: any, email: string): Promise<string | null> {
    try {
        // Inicializa o jsPDF com compressão ativada para deixar o arquivo mais leve
        const doc = new jsPDF({ compress: true });

        // Configurações iniciais
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('Resumo do Formulário FFP', 20, 20);

        doc.setFontSize(12);
        let yPos = 40;
        const lineHeight = 7;
        const pageHeight = 280;

        const addText = (text: string, isBold: boolean = false) => {
            if (yPos > pageHeight) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');

            const splitText = doc.splitTextToSize(text, 170);
            doc.text(splitText, 20, yPos);
            yPos += (splitText.length * lineHeight);
        };

        // --- Passo 1: Informações Pessoais ---
        addText('INFORMAÇÕES PESSOAIS', true);
        addText(`Nome: ${formData.firstName || ''} ${formData.lastName || ''}`);
        addText(`E-mail: ${formData.email || ''}`);
        addText(`CPF: ${formData.cpf || ''}`);
        addText(`Telefone: ${formData.phone || ''}`);
        addText(`Estado Civil: ${formData.maritalStatus || ''}`);
        addText(`Renda Fixa: ${formData.fixedIncome || ''}`);
        addText(`Renda Variável: ${formData.variableIncome || ''}`);
        yPos += 5;

        // --- Passo 1: Cartões ---
        if (formData.cards && formData.cards.length > 0) {
            addText('CARTÕES', true);
            formData.cards.forEach((card: any, index: number) => {
                addText(`Cartão ${index + 1}:`);
                addText(`  Banco: ${card.bank === 'Outro' ? card.otherBank : card.bank}`);
                addText(`  Bandeira: ${card.brand}`);
                addText(`  Categoria: ${card.category}`);
                addText(`  Programa de Pontos: ${card.loyaltyProgram === 'Outro' ? card.otherProgram : card.loyaltyProgram}`);
                addText(`  Tipo de Conversão: ${card.conversionType}`);
                addText(`  Valor da Anuidade: ${card.annuityValue === 'Outro' ? card.otherAnnuity : card.annuityValue}`);
            });
            yPos += 5;
        }

        // --- Passo 2: Viagens Emitidas ---
        if (formData.step2) {
            addText('VIAGENS EMITIDAS', true);
            addText(`Possui viagens emitidas: ${formData.step2.hasIssuedTrips}`);

            if (formData.step2.hasIssuedTrips === 'Sim' && formData.step2.trips) {
                formData.step2.trips.forEach((trip: any, index: number) => {
                    addText(`Viagem Emitida ${index + 1}:`, true);
                    addText(`  Data de Ida: ${trip.departureDate || ''}`);
                    addText(`  Data de Volta: ${trip.returnDate || ''}`);
                    addText(`  País: ${trip.country || ''}`);
                    addText(`  Destino Principal: ${trip.city || ''}`);
                    if (trip.hasMultipleDestinations === 'Sim') {
                        addText(`  Destinos Adicionais: ${trip.extraDestinations || ''}`);
                    }
                    addText(`  Adultos: ${trip.adults || 0}`);
                    addText(`  Crianças: ${trip.children || 0}`);
                    addText(`  Bebês: ${trip.babies || 0}`);

                    addText(`  Motivo: ${trip.reason === 'Outro' ? trip.otherReason : trip.reason}`);

                    if (trip.includedServices && trip.includedServices.length > 0) {
                        addText(`  Serviços Incluídos: ${trip.includedServices.join(', ')}`);
                    }

                    if (trip.pendingServices && trip.pendingServices.length > 0) {
                        let pendingStr = trip.pendingServices.join(', ');
                        if (trip.pendingServices.includes('Outro') && trip.otherPendingService) {
                            pendingStr = pendingStr.replace('Outro', `Outro (${trip.otherPendingService})`);
                        }
                        addText(`  Serviços Pendentes: ${pendingStr}`);
                    }

                    addText(`  Orçamento Faltante: ${trip.budgetRange || ''}`);
                    addText(`  Equipe pode ajudar: ${trip.teamHelp || 'Não'}`);
                    if (trip.teamHelp === 'Sim') {
                        addText(`  Observações para equipe: ${trip.teamHelpNotes || ''}`);
                    }
                });
            }
            yPos += 5;
        }

        // --- Passo 3: Viagens Planejadas ---
        if (formData.step3) {
            addText('VIAGENS PLANEJADAS (SEM RESERVAS)', true);
            addText(`Tem viagem planejada: ${formData.step3.hasPlannedTrips}`);

            if (formData.step3.hasPlannedTrips === 'Sim') {
                addText(`  País: ${formData.step3.country || ''}`);
                addText(`  Destino Principal: ${formData.step3.city || ''}`);
                if (formData.step3.hasMultipleDestinations === 'Sim') {
                    addText(`  Destinos Adicionais: ${formData.step3.extraDestinations || ''}`);
                }
                addText(`  Quando: ${formData.step3.when || ''}`);
                if (formData.step3.when !== 'Ainda não tenho data prevista') {
                    addText(`  Data de Ida: ${formData.step3.departureDate || ''}`);
                    addText(`  Data de Volta: ${formData.step3.returnDate || ''}`);
                }

                addText(`  Adultos: ${formData.step3.adults || 0}`);
                addText(`  Crianças: ${formData.step3.children || 0}`);
                addText(`  Bebês: ${formData.step3.babies || 0}`);

                addText(`  Motivo: ${formData.step3.reason === 'Outro' ? formData.step3.otherReason : formData.step3.reason}`);

                if (formData.step3.plannedServices && formData.step3.plannedServices.length > 0) {
                    let plannedStr = formData.step3.plannedServices.join(', ');
                    if (formData.step3.plannedServices.includes('Outro') && formData.step3.otherPlannedService) {
                        plannedStr = plannedStr.replace('Outro', `Outro (${formData.step3.otherPlannedService})`);
                    }
                    addText(`  Serviços Planejados: ${plannedStr}`);
                }

                addText(`  Orçamento: ${formData.step3.budgetRange || ''}`);
                addText(`  Equipe pode ajudar: ${formData.step3.teamHelp || 'Não'}`);
                if (formData.step3.teamHelp === 'Sim') {
                    addText(`  Observações para equipe: ${formData.step3.teamHelpNotes || ''}`);
                }
            }
        }

        // Gerar o PDF comprimido como ArrayBuffer para upload mais seguro e leve
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

        // Criar um nome de arquivo único
        const timestamp = new Date().getTime();
        const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `coleta_${safeEmail}_${timestamp}.pdf`;

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
