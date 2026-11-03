import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vip-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-card vip-card" (click)="$event.stopPropagation()">
        <h2 class="gold-text">👑 Секретне Меню Шефа</h2>
        <p>Ексклюзивні vegan-страви поза основним меню.</p>
        
        <ul class="vip-list">
          <li>
            <span class="emoji">🍄</span>
            <div class="info">
              <strong>Стейк з гриба "Левова грива"</strong>
              <span>Із сусальним золотом та трюфельним пюре</span>
            </div>
          </li>
          <li>
            <span class="emoji">🥑</span>
            <div class="info">
              <strong>Тартар "Смарагд"</strong>
              <span>Авокадо Хасс із чорною ікрою з водоростей</span>
            </div>
          </li>
          <li>
            <span class="emoji">🍵</span>
            <div class="info">
              <strong>Матча-еліксир "Дзен"</strong>
              <span>Секретний напій Шефа, що дає +100 до енергії</span>
            </div>
          </li>
        </ul>

        <button class="close-btn" (click)="closeModal()">Сховати меню</button>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.85); display: flex;
      align-items: center; justify-content: center; z-index: 9999;
      backdrop-filter: blur(4px);
    }
    .vip-card {
      background: #1a231b; color: #fff; padding: 30px; border-radius: 16px;
      border: 1px solid #d4af37; box-shadow: 0 10px 40px rgba(212, 175, 55, 0.25);
      width: 380px; max-width: 90vw;
    }
    .gold-text {
      color: #d4af37; text-align: center; text-transform: uppercase;
      margin-bottom: 5px; margin-top: 0;
    }
    p { text-align: center; color: #aaa; font-size: 14px; margin-bottom: 24px; }
    .vip-list { list-style: none; padding: 0; margin: 0 0 24px 0; }
    .vip-list li {
      display: flex; align-items: center; padding: 12px 0;
      border-bottom: 1px solid #2a332b; gap: 16px;
    }
    .vip-list li:last-child { border-bottom: none; }
    .emoji { font-size: 32px; }
    .info { flex-grow: 1; display: flex; flex-direction: column; }
    .info strong { color: #fff; font-size: 15px; }
    .info span { color: #888; font-size: 12px; margin-top: 4px; }
    .close-btn {
      width: 100%; background: transparent; color: #d4af37;
      border: 1px solid #d4af37; padding: 12px; border-radius: 8px;
      cursor: pointer; font-weight: bold; text-transform: uppercase;
    }
    .close-btn:hover { background: #d4af37; color: #1a231b; }
  `]
})
export class VipMenuComponent {
  close = output<void>();
  closeModal(): void {
    this.close.emit();
  }
}