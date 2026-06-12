import { Injectable } from '@angular/core';

export type ReviewGrade = 'again' | 'good' | 'easy';

export interface SM2Data {
  interval: number;
  repetition: number;
  ease_factor: number;
  next_review_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class SM2SchedulerService {
  
  /**
   * Calcula o próximo intervalo e data de revisão usando o algoritmo SM-2
   * @param grade A nota dada pelo usuário na revisão
   * @param current O estado atual do cartão (intervalo, repetições, facilidade)
   * @returns O novo estado calculado do cartão
   */
  calculateNextReview(grade: ReviewGrade, current: SM2Data): SM2Data {
    // Mapeamento da nossa nota para a nota do SM-2 (0-5)
    // again = 1 (Errou, lembrou a resposta depois)
    // good = 4 (Acertou com hesitação)
    // easy = 5 (Acertou perfeitamente e rápido)
    const numericGrade = grade === 'again' ? 1 : grade === 'good' ? 4 : 5;
    
    let interval = current.interval;
    let repetition = current.repetition;
    let easeFactor = current.ease_factor;
    
    if (numericGrade >= 3) {
      // Acertou
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition += 1;
    } else {
      // Errou
      repetition = 0;
      interval = 1;
    }
    
    // Atualiza o Ease Factor (fator de facilidade)
    easeFactor = easeFactor + (0.1 - (5 - numericGrade) * (0.08 + (5 - numericGrade) * 0.02));
    
    // Ease Factor nunca pode ser menor que 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }
    
    // Calcula a próxima data somando os dias de intervalo
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    
    return {
      interval: interval,
      repetition: repetition,
      ease_factor: easeFactor,
      next_review_date: nextReviewDate.toISOString()
    };
  }
}
