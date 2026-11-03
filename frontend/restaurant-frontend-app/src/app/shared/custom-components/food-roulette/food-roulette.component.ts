import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-roulette',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <h2>🎰 Рулетка Голоду</h2>
        <p>Не знаєте, що обрати? Нехай вирішить фортуна!</p>

        <div class="roulette-display" [class.spinning]="isSpinning()">
          <span class="dish-emoji">{{ currentDish()?.emoji || '❓' }}</span>
          <span class="dish-name">{{ currentDish()?.name || 'Готові?' }}</span>
        </div>

        <div class="actions">
          <button class="spin-btn" [disabled]="isSpinning()" (click)="spin()">
            {{ isSpinning() ? 'Крутимо...' : 'Крутити!' }}
          </button>
          <button class="close-btn" (click)="closeModal()">Закрити</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.75); display: flex;
      align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-card {
      background: #ffffff; color: #222; padding: 24px; border-radius: 16px;
      text-align: center; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .roulette-display {
      margin: 20px 0; padding: 20px; background: #f4f5f7; border-radius: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      &.spinning { animation: pulse 0.1s infinite alternate; }
    }
    .dish-emoji { font-size: 52px; }
    .dish-name { font-weight: bold; font-size: 18px; color: #111; }
    .spin-btn {
      background: #ff0055; color: white; border: none; padding: 10px 20px;
      font-weight: bold; border-radius: 8px; cursor: pointer; margin-right: 8px;
      &:disabled { opacity: 0.6; }
    }
    .close-btn { background: #e0e0e0; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
    @keyframes pulse { from { transform: scale(0.97); } to { transform: scale(1.03); } }
  `]
})
export class FoodRouletteComponent {
  close = output<void>();

  dishes = [
    { name: 'Піца Чотири Сири', emoji: '🍕' },
    { name: 'Бургер з беконом', emoji: '🍔' },
    { name: 'Рамен з куркою', emoji: '🍜' },
    { name: 'Стейк Рібай', emoji: '🥩' },
    { name: 'Суші Сет Філадельфія', emoji: '🍣' },
    { name: 'Паста Карбонара', emoji: '🍝' },
    { name: 'Тако з яловичиною', emoji: '🌮' }
  ];

  currentDish = signal<{ name: string; emoji: string } | null>(null);
  isSpinning = signal(false);

  spin(): void {
    if (this.isSpinning()) return;
    this.isSpinning.set(true);

    let counter = 0;
    const totalSpins = 25;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.dishes.length);
      this.currentDish.set(this.dishes[randomIndex]);
      counter++;

      if (counter >= totalSpins) {
        clearInterval(interval);
        this.isSpinning.set(false);
      }
    }, 90);
  }

  closeModal(): void {
    this.close.emit();
  }
}