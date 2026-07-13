import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { jsPDF } from 'jspdf';
import { Flashcard } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
    
    async generateAndShareStudyPdf(cards: Flashcard[]) {
        if (!cards || cards.length === 0) {
            alert('Nenhum cartão para exportar.');
            return;
        }

        const apiKey = environment.geminiKey;
        if (!apiKey) return;

        try {
            // 1. Send to Gemini for grouping
            const ai = new GoogleGenAI({ apiKey });
            
            const promptText = `Aqui estão vários flashcards que eu acabei de estudar.
Por favor, identifique qual é o verbo principal de cada frase, e agrupe as frases por verbo.
Retorne EXATAMENTE UM JSON no seguinte formato (e nada mais):
[
  {
    "verb": "Verbo",
    "phrases": [
       { "front": "frase em ingles", "back": "frase em portugues" }
    ]
  }
]
Flashcards:
${JSON.stringify(cards.map(c => ({ front: c.front, back: c.back })))}
`;

            const response = await ai.models.generateContent({
                model: 'gemini-flash-lite-latest',
                contents: promptText,
            });

            const text = response.text;
            if (!text) throw new Error('Resposta vazia da IA');
            
            // Parse JSON (extract from markdown if needed)
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const groupedData = JSON.parse(jsonStr);

            // 2. Generate PDF
            const doc = new jsPDF();
            let y = 20;
            
            doc.setFontSize(20);
            doc.text('Sessão de Estudos - Memorix', 20, y);
            y += 15;

            for (const group of groupedData) {
                if (y > 270) { doc.addPage(); y = 20; }
                
                doc.setFontSize(16);
                doc.setTextColor(0, 102, 204);
                doc.text(group.verb, 20, y);
                y += 10;
                
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                
                for (const phrase of group.phrases) {
                    if (y > 270) { doc.addPage(); y = 20; }
                    doc.setFont('helvetica', 'bold');
                    const frontLines = doc.splitTextToSize(`• ${phrase.front}`, 170);
                    doc.text(frontLines, 20, y);
                    y += (frontLines.length * 6);
                    
                    doc.setFont('helvetica', 'normal');
                    const backLines = doc.splitTextToSize(`  ${phrase.back}`, 170);
                    doc.text(backLines, 20, y);
                    y += (backLines.length * 6) + 4;
                }
                y += 5;
            }

            const pdfBlob = doc.output('blob');
            const file = new File([pdfBlob], 'sessao_memorix.pdf', { type: 'application/pdf' });

            // 3. Share via Web Share API
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Resumo de Estudos - Memorix',
                    text: 'Confira as frases que acabei de estudar!',
                    files: [file]
                });
            } else {
                // Fallback download
                doc.save('sessao_memorix.pdf');
                alert('O seu dispositivo não suporta compartilhamento nativo. O PDF foi baixado.');
            }

        } catch (error) {
            console.error('Erro na exportação', error);
            alert('Houve um erro ao gerar o PDF. Verifique sua chave da API ou tente novamente.');
        }
    }
}
