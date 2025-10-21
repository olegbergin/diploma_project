# Design System - Система дизайна проекта

## Общие принципы дизайна

### Философия
- **Mobile-First**: Все интерфейсы проектируются сначала для мобильных устройств
- **Accessibility**: Соответствие WCAG 2.1 AA стандартам
- **Progressive Disclosure**: Постепенное раскрытие информации
- **Touch-Friendly**: Все элементы удобны для касания
- **RTL Support**: Поддержка арабского и еврейского текста (справа налево)

### Основные UX принципы
- **Правило 3 кликов**: Доступ к любой функции максимум за 3 клика
- **Одноручное управление**: Важные элементы в зоне досягаемости большого пальца
- **Consistency**: Единообразие в поведении и внешнем виде
- **Feedback**: Четкая обратная связь на все действия пользователя

## Цветовая палитра

### Основные цвета (Primary Colors)
```css
:root {
  /* Основной бренд */
  --primary-blue: #2563eb;
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1d4ed8;
  
  /* Успех и подтверждение */
  --success-green: #059669;
  --success-green-light: #10b981;
  --success-green-dark: #047857;
  
  /* Предупреждения и уведомления */
  --warning-orange: #ea580c;
  --warning-orange-light: #f97316;
  --warning-orange-dark: #c2410c;
  
  /* Ошибки */
  --error-red: #dc2626;
  --error-red-light: #ef4444;
  --error-red-dark: #b91c1c;
}
```

### Функциональные цвета
```css
:root {
  /* Управление бизнесом */
  --business-purple: #7c3aed;
  --business-purple-light: #8b5cf6;
  --business-purple-dark: #6d28d9;
  
  /* Отзывы и рейтинги */
  --reviews-yellow: #eab308;
  --reviews-yellow-light: #facc15;
  --reviews-yellow-dark: #ca8a04;
  
  /* Статистика и аналитика */
  --stats-cyan: #0891b2;
  --stats-cyan-light: #06b6d4;
  --stats-cyan-dark: #0e7490;
  
  /* Нейтральные цвета */
  --neutral-gray: #6b7280;
  --neutral-gray-light: #9ca3af;
  --neutral-gray-dark: #4b5563;
}
```

### Системные цвета
```css
:root {
  /* Фоны */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --bg-overlay: rgba(0, 0, 0, 0.5);
  
  /* Границы */
  --border-light: #e5e7eb;
  --border-medium: #d1d5db;
  --border-dark: #9ca3af;
  
  /* Тени */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Текст */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;
}
```

## Типографика

### Шрифты
```css
:root {
  /* Основной шрифт */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                  'Helvetica Neue', Arial, sans-serif;
  
  /* Моноширинный шрифт */
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
               Consolas, 'Courier New', monospace;
  
  /* Еврейский/арабский шрифт */
  --font-rtl: 'Noto Sans Hebrew', 'Arial Hebrew', sans-serif;
}
```

### Размеры текста
```css
:root {
  /* Размеры шрифтов */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Высота строк */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Жирность шрифта */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## Spacing (Отступы)

### Система отступов (8px grid)
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

## Компоненты

### Карточки (Cards)
```css
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-4);
  border: 1px solid var(--border-light);
}

.card-large {
  padding: var(--space-6);
  grid-column: span 2;
}

.card-medium {
  padding: var(--space-4);
  grid-column: span 1;
}

.card-small {
  padding: var(--space-3);
  grid-column: span 1;
}
```

### Кнопки (Buttons)
```css
.btn {
  min-height: 44px; /* Touch-friendly */
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.btn-success {
  background: var(--success-green);
  color: var(--text-inverse);
}

.btn-warning {
  background: var(--warning-orange);
  color: var(--text-inverse);
}

.btn-danger {
  background: var(--error-red);
  color: var(--text-inverse);
}
```

### Формы (Forms)
```css
.form-input {
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-label {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  display: block;
}

.form-error {
  color: var(--error-red);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

### Радиусы скругления
```css
:root {
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  --radius-full: 9999px; /* Полное скругление */
}
```

## Layout системы

### Grid система для карточек
```css
.tiles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-4);
}

/* Responsive breakpoints */
@media (max-width: 640px) {
  .tiles-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
    padding: var(--space-3);
  }
}

@media (min-width: 768px) {
  .tiles-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .tiles-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-8);
    padding: var(--space-8);
  }
}
```

### Container система
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 0 var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 0 var(--space-8);
  }
}
```

## Анимации и переходы

### Базовые переходы
```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* Easing functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-up {
  animation: slideUp var(--transition-normal) var(--ease-out);
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Специфичные компоненты проекта

### Карточки дашборда владельца бизнеса
```css
.dashboard-tile {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-4);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  cursor: pointer;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dashboard-tile:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.dashboard-tile-today {
  background: linear-gradient(135deg, var(--primary-blue-light), var(--success-green-light));
  color: var(--text-inverse);
  grid-column: span 2;
}

.dashboard-tile-requests {
  background: linear-gradient(135deg, var(--warning-orange-light), var(--warning-orange));
  color: var(--text-inverse);
}

.dashboard-tile-business {
  background: linear-gradient(135deg, var(--business-purple-light), var(--business-purple));
  color: var(--text-inverse);
}

.dashboard-tile-profile {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.dashboard-tile-reviews {
  background: linear-gradient(135deg, var(--reviews-yellow-light), var(--reviews-yellow));
  color: var(--text-primary);
}

.dashboard-tile-stats {
  background: linear-gradient(135deg, var(--stats-cyan-light), var(--stats-cyan));
  color: var(--text-inverse);
}
```

### Header компоненты
```css
.app-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--border-light);
}

.notification-badge {
  background: var(--error-red);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  min-width: 20px;
  text-align: center;
}
```

## Accessibility (Доступность)

### ARIA labels и роли
```css
/* Скрытый текст для screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus visible стили */
.focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --border-light: #000000;
    --border-medium: #000000;
    --text-secondary: #000000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## RTL Support (Поддержка арабского/еврейского языка)

```css
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .container {
  padding-right: var(--space-4);
  padding-left: var(--space-4);
}

[dir="rtl"] .btn {
  direction: rtl;
}

[dir="rtl"] .form-input {
  text-align: right;
}
```

## Использование в проекте

### Импорт переменных в CSS модулях
```css
/* В каждом .module.css файле */
@import url('./design-system-variables.css');

.myComponent {
  background: var(--bg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

### Применение в компонентах React
```jsx
// Пример использования классов
<div className={`${styles.card} ${styles.cardLarge}`}>
  <button className={`${styles.btn} ${styles.btnPrimary}`}>
    Сохранить
  </button>
</div>
```

## Рекомендации по разработке

1. **Всегда используйте CSS переменные** вместо hardcoded значений
2. **Следуйте naming convention** BEM или аналогичной
3. **Тестируйте на мобильных устройствах** в первую очередь
4. **Проверяйте accessibility** с помощью инструментов и screen readers
5. **Используйте semantic HTML** для лучшей доступности
6. **Оптимизируйте для touch интерфейсов** (минимум 44px для кликабельных элементов)
7. **Поддерживайте consistent spacing** используя систему отступов на основе 8px grid