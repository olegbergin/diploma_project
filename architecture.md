# Архитектура проекта

Этот документ автоматически сгенерирован как отправная точка и дополняется ручными наблюдениями.

## История изменений

### Phase 1: Срочная стабилизация (Январь 2025)

Все критические проблемы из раздела "Потенциальные баги и зоны риска" были исправлены:

#### Backend - Исправления контроллеров
- ✅ **appointmentController.js** - Удалены все дублированные определения функций (`createAppointment`, `getAppointmentsForUser`)
  - Исправлена консистентность статусов (теперь всегда `'scheduled'`)
  - Убран повторный `require('../dbSingleton')` внутри функций
  - Используется только `db.getPromise()` для работы с БД
- ✅ **businessController.js** - Удалена дублированная простая версия `getBusinessById` (строки 14-26)
  - Оставлена полная версия с JOIN'ами для owner_info, services и reviews

#### Безопасность и авторизация
- ✅ **Создан middleware/authMiddleware.js**
  - `authenticateToken` - верификация JWT токенов
  - `requireAdmin` - проверка админских прав
  - `requireBusiness` - проверка прав бизнес-владельца
  - `requireBusinessOwner` - проверка владения конкретным бизнесом
  - Обработка истекших токенов и ошибок валидации

- ✅ **routes/cleanup.js** - Добавлена авторизация и async операции
  - Все эндпоинты (`/orphaned`, `/old/:days`, `/stats`) требуют админ-доступ
  - Конвертированы синхронные операции `fs` в async (`fs.promises`)
  - Защищены опасные операции удаления файлов

- ✅ **routes/admin.js** - Замена кастомного middleware на JWT-авторизацию
  - Все роуты защищены через `authenticateToken + requireAdmin`
  - Эндпоинты: `/reviews/complaints`, `/reviews/:reviewId/moderate`, `/complaints/:complaintId/resolve`, `/reviews/stats`, `/reviews`

#### Frontend - Стандартизация и совместимость
- ✅ **BusinessProfile/api/appointments.js** - Переход с `fetch` на `axiosInstance`
  - Автоматическое включение JWT токенов
  - Использование глобальных обработчиков ошибок
  - Правильная обработка CORS

- ✅ **BookingConfirmation.jsx** - Код валиден
  - Импорты полные и корректные (проблема была устаревшей)

- ✅ **usePullToRefresh.js** - Добавлена проверка окружения
  - Guard: `typeof window === 'undefined' || typeof document === 'undefined'`
  - Совместимость с SSR и тестовыми средами

- ✅ **useSwipeGestures.js** - Добавлена проверка окружения
  - Guard: `typeof document === 'undefined'`
  - Предотвращение ошибок в non-browser окружениях

#### Система отзывов
- ✅ **routes/reviews.js** - Полная реализация уже существовала
  - Эндпоинты: создание, получение, обновление, ответ бизнеса, жалобы
  - `reviewController.js` не требуется - вся логика в роутах

#### Тестирование
- ✅ **tests/dbSingleton.test.js** - Улучшена настройка моков
  - Исправлен `beforeEach` с правильным `mockImplementation`
  - 6 из 13 тестов проходят успешно

## Общий обзор

- **Backend (Node.js + Express + MySQL)**: точка входа `backend/src/app.js` и набор роутов, которые проксируют запросы к контроллерам. Основные зависимости: `express`, `mysql2`, `cors`, а также собственный синглтон `dbSingleton.js`, предоставляющий как callback-, так и promise-ориентированные подключения к базе.
- **Сервисы**: `backend/services/reportService.js` и `backend/services/pdfService.js` инкапсулируют сложную бизнес-логику по агрегации данных и генерации отчётов (с использованием `puppeteer`).
- **Frontend (React + Vite)**: точка входа `frontend/src/main.jsx` монтирует приложение и провайдеры контекста. Компоненты структурированы по каталогам (админ-панель, бронирование, профиль бизнеса и т.д.), каждый JSX-файл экспортирует React-компонент, а CSS-модули обеспечивают стили.
- **Контексты и хуки**: `frontend/src/context/*.jsx` предоставляют глобальные состояния пользователя и всплывающих уведомлений; кастомные хуки вроде `useErrorHandler` и `useImageUpload` переиспользуют повторяющуюся логику.

## Взаимодействия и потоки данных

- **Аутентификация и авторизация**: `backend/routes/auth.js` обрабатывает регистрацию и вход, обращаясь напрямую к базе через `dbSingleton`. Сгенерированный JWT используется на фронтенде, где `axiosInstance` автоматически подставляет заголовок `Authorization` (см. импорты в компонентных файлах, работающих с API). Контекст пользователя (`UserContext`) хранит токен и роль, что определяет доступ к маршрутам React Router (`App.jsx`).
- **Управление бизнесами**: фронтенд-компоненты (`BusinessProfile`, `BusinessEditPage`, `BusinessDashboard`) вызывают API-роуты `/api/businesses/*`, которые маршрутизируются на соответствующие методы `businessController`. Контроллер использует `dbSingleton` для CRUD-операций и сборки дашборда.
- **Бронирования**: `frontend/src/components/BookingPage/*` взаимодействуют с `/api/appointments`. На бэкенде логика разделена между `routes/appointments.js` (валидация, агрегация) и `controllers/appointmentController.js` (создание торов и получение истории пользователя) — хотя файл контроллера содержит дублированный код, роуты используют в основном SQL-реализацию.
- **Отчётность**: бизнес-дэшборд вызывает `reportService` через роут `routes/reports.js` (который переиспользует `reportController` в старой архитектуре). `reportService` формирует выборки, а `pdfService` рендерит HTML-шаблоны из `backend/templates/reports` в PDF.
- **Администрирование**: `AdminPanel` и связанные компоненты обращаются к `/api/admin/*`, `/api/users` и `/api/businesses`. На бэкенде `adminController` и соответствующий роут собирают статистику (опираясь на SQL-агрегации) и позволяют обновлять роли пользователей.
- **Медиа и очистка**: загрузка файлов (`routes/upload.js`) сохраняет изображения и генерирует миниатюры через `sharp`. Сервис очистки (`routes/cleanup.js`) сканирует папки `uploads` и `uploads/thumbnails` для поиска несвязанных файлов; тестов на него нет.

## Потенциальные баги и зоны риска

### ✅ ИСПРАВЛЕНО в Phase 1 (Январь 2025)
- ~~`backend/controllers/appointmentController.js` содержит дублированные определения функций~~ → **ИСПРАВЛЕНО**: удалены все дубликаты
- ~~`backend/controllers/businessController.js` дважды определяет `exports.getBusinessById`~~ → **ИСПРАВЛЕНО**: оставлена только полная версия
- ~~`backend/controllers/reviewController.js` пуст~~ → **НЕ ПРОБЛЕМА**: вся логика в `routes/reviews.js`
- ~~Роуты (`routes/cleanup.js`, часть `routes/admin.js`) не проверяют авторизацию~~ → **ИСПРАВЛЕНО**: добавлен JWT middleware
- ~~Роуты выполняют опасные операции (удаление файлов) синхронно~~ → **ИСПРАВЛЕНО**: конвертировано в async
- ~~`frontend/src/components/BusinessProfile/api/appointments.js` использует `fetch`~~ → **ИСПРАВЛЕНО**: переход на `axiosInstance`
- ~~`BookingConfirmation.jsx` неполный импорт~~ → **НЕ ПРОБЛЕМА**: импорты корректны
- ~~Хуки используют `window`/`document` без проверок~~ → **ИСПРАВЛЕНО**: добавлены guards

### Текущие зоны риска
- В `adminController` много логики, завязанной на несуществующие столбцы (`status`, `approved_at`, `rejection_reason` и др.). Сейчас код просто игнорирует обновление статусов или возвращает заглушки — при изменении схемы БД эти места нужно пересмотреть.
- Сервис очистки файлов (`routes/cleanup.js`) не имеет автоматических тестов
- Некоторые тесты в `tests/dbSingleton.test.js` все еще не проходят (7 из 13 падают)

## backend

| Файл | Импорты | Экспорты |
| --- | --- | --- |
| backend/.gitignore |  |  |
| backend/controllers/adminController.js | const db = require('../dbSingleton'); | exports.getAdminStats = async (req, res) => {<br>exports.getRecentActivity = async (req, res) => {<br>exports.getAllUsers = async (req, res) => {<br>exports.updateUserStatus = async (req, res) => {<br>exports.updateUserRole = async (req, res) => {<br>exports.getAllBusinesses = async (req, res) => {<br>exports.approveBusiness = async (req, res) => {<br>exports.rejectBusiness = async (req, res) => {<br>exports.deleteBusiness = async (req, res) => {<br>exports.getAllAppointments = async (req, res) => {<br>exports.updateAppointmentStatus = async (req, res) => {<br>exports.getUserAnalytics = async (req, res) => {<br>exports.getBusinessAnalytics = async (req, res) => {<br>exports.getAppointmentAnalytics = async (req, res) => { |
| backend/controllers/appointmentController.js | const db = require('../dbSingleton'); | module.exports = { createAppointment, getAppointmentsForUser } |
| backend/controllers/businessController.js | const db = require('../dbSingleton'); | exports.getAllBusinesses, exports.createBusiness, exports.updateBusiness, exports.deleteBusiness, exports.getCategories, exports.getBusinessById (полная версия с JOIN), exports.getBusinessServices, exports.getBusinessReviews, exports.getBusinessCalendar, exports.getBusinessAvailability, exports.createService, exports.updateService, exports.deleteService, exports.getBusinessDashboard, exports.getBusinessDashboardAnalytics |
| backend/controllers/reportController.js | const db = require('../dbSingleton');<br>const reportService = require('../services/reportService');<br>const pdfService = require('../services/pdfService'); | exports.generateReport = async (req, res) => {<br>exports.previewReport = async (req, res) => {<br>exports.getAvailableDates = async (req, res) => { |
| backend/controllers/reviewController.js |  |  |
| backend/dbSingleton.js | const mysql = require("mysql2"); | module.exports = dbSingleton; |
| backend/middleware/authMiddleware.js | const jwt = require('jsonwebtoken'); | module.exports = { authenticateToken, requireAdmin, requireBusiness, requireBusinessOwner } |
| backend/package-lock.json |  |  |
| backend/package.json |  |  |
| backend/README.md |  |  |
| backend/routes/admin.js | const express = require("express");<br>const db = require("../dbSingleton").getPromise();<br>const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware'); | module.exports = router; |
| backend/routes/appointments.js | const express = require("express");<br>const db = require("../dbSingleton").getPromise(); | module.exports = router; |
| backend/routes/auth.js | const express = require("express");<br>const bcrypt = require("bcrypt");<br>const jwt = require("jsonwebtoken");<br>const db = require("../dbSingleton").getPromise(); | module.exports = router; |
| backend/routes/businesses.js | const express = require("express");<br>const businessController = require("../controllers/businessController");<br>const db = require('../dbSingleton').getPromise(); | module.exports = router; |
| backend/routes/cleanup.js | const express = require("express");<br>const fs = require("fs").promises;<br>const fsSync = require("fs");<br>const path = require("path");<br>const db = require('../dbSingleton');<br>const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware'); | module.exports = router; |
| backend/routes/reports.js | const express = require("express");<br>const reportService = require("../services/reportService");<br>const pdfService = require("../services/pdfService");<br>const db = require("../dbSingleton").getPromise(); | module.exports = router; |
| backend/routes/reviews.js | const express = require("express");<br>const db = require("../dbSingleton").getPromise(); | module.exports = router; |
| backend/routes/search.js | const express = require("express");<br>const db = require("../dbSingleton").getPromise(); // Use our new method! | module.exports = router; |
| backend/routes/upload.js | const express = require("express");<br>const multer = require("multer");<br>const path = require("path");<br>const fs = require("fs");<br>const sharp = require("sharp"); | module.exports = router; |
| backend/routes/users.js | const express = require("express");<br>const db = require("../dbSingleton").getPromise();<br>const bcrypt = require("bcryptjs"); | module.exports = router; |
| backend/services/pdfService.js | const puppeteer = require('puppeteer');<br>const path = require('path');<br>const fs = require('fs').promises; | module.exports = new PDFService(); |
| backend/services/reportService.js | const db = require("../dbSingleton").getPromise(); | module.exports = new ReportService(); |
| backend/src/app.js | const express = require("express");<br>const cors = require("cors");<br>const path = require("path");<br>const authRoutes = require("../routes/auth");<br>const searchRoutes = require("../routes/search");<br>const businessRoutes = require("../routes/businesses");<br>const userRoutes = require("../routes/users");<br>const appointmentRoutes = require("../routes/appointments");<br>const adminRoutes = require("../routes/admin");<br>const reviewRoutes = require("../routes/reviews");<br>const cleanupRoutes = require("../routes/cleanup"); |  |
| backend/templates/reports/day-report.html |  |  |
| backend/templates/reports/month-report.html |  |  |
| backend/templates/reports/year-report.html |  |  |
| backend/tests/appointments.test.js | const appointmentController = require('../controllers/appointmentController'); |  |
| backend/tests/auth.test.js | const request = require('supertest');<br>const express = require('express');<br>const bcrypt = require('bcrypt');<br>const jwt = require('jsonwebtoken');<br>const authRoutes = require('../routes/auth'); |  |
| backend/tests/dbSingleton.test.js | const dbSingletonWithNull = require('../dbSingleton');<br>const dbSingletonWithNull = require('../dbSingleton'); |  |
| backend/tests/reportService.test.js | const reportService = require('../services/reportService'); |  |
| backend/tests/setup.js |  |  |

## frontend

| Файл | Импорты | Экспорты |
| --- | --- | --- |
| frontend/src/api/axiosInstance.js | import axios from "axios"; | export default axiosInstance; |
| frontend/src/App.css |  |  |
| frontend/src/App.jsx | import React, { useState, useEffect } from "react";<br>import { Routes, Route, Navigate, useNavigate } from "react-router-dom";<br>import Header from "./components/layout/Header/Header";<br>import Footer from "./components/layout/Footer/Footer";<br>import AuthPage from "./components/AuthPage/AuthPage";<br>import BusinessRegistration from "./components/BusinessRegistration/BusinessRegistration";<br>import BusinessProfile from "./components/BusinessProfile/BusinessProfile";<br>import BusinessEditPage from "./components/BusinessEditPage/BusinessEditPage";<br>import BusinessPublicProfile from "./components/BusinessPublicProfile/BusinessPublicProfile";<br>import NewBusinessDashboard from "./components/BusinessDashboard/NewBusinessDashboard";<br>import ServiceManagement from "./components/ServiceManagement/ServiceManagement";<br>import CalendarPage from "./components/CalendarPage/CalendarPage";<br>import UserDashboard from "./components/UserDashboard/UserDashboard";<br>import FavoritesPage from "./components/FavoritesPage/FavoritesPage";<br>import SearchPage from "./components/SearchPage/SearchPage";<br>import BookingPage from "./components/BookingPage/BookingPage";<br>import AdminPanel from "./components/AdminPanel/AdminPanel";<br>import { UserProvider } from "./context/UserContext";<br>import { ToastProvider } from "./context/ToastContext";<br>import "./App.css"; | export default App; |
| frontend/src/assets/react.svg |  |  |
| frontend/src/components/AdminPanel/AdminAppointments.jsx | import React, { useState, useEffect } from "react";<br>import styles from "./AdminAppointments.module.css"; | export default AdminAppointments; |
| frontend/src/components/AdminPanel/AdminAppointments.module.css |  |  |
| frontend/src/components/AdminPanel/AdminBusinesses.jsx | import React, { useState, useEffect } from "react";<br>import axiosInstance from "../../api/axiosInstance";<br>import styles from "./AdminBusinesses.module.css"; | export default AdminBusinesses; |
| frontend/src/components/AdminPanel/AdminBusinesses.module.css |  |  |
| frontend/src/components/AdminPanel/AdminPanel.jsx | import React, { useState, useEffect } from "react";<br>import { Routes, Route, Navigate } from "react-router-dom";<br>import AdminStats from "./AdminStats";<br>import AdminUsers from "./AdminUsers";<br>import AdminBusinesses from "./AdminBusinesses";<br>import axiosInstance from "../../api/axiosInstance";<br>import styles from "./AdminPanel.module.css"; | export default AdminPanel; |
| frontend/src/components/AdminPanel/AdminPanel.module.css |  |  |
| frontend/src/components/AdminPanel/AdminStats.jsx | import React, { useState, useEffect } from "react";<br>import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";<br>import axiosInstance from "../../api/axiosInstance";<br>import styles from "./AdminStats.module.css"; | export default AdminStats; |
| frontend/src/components/AdminPanel/AdminStats.module.css |  |  |
| frontend/src/components/AdminPanel/AdminUsers.jsx | import React, { useState, useEffect } from "react";<br>import axiosInstance from "../../api/axiosInstance";<br>import styles from "./AdminUsers.module.css"; | export default AdminUsers; |
| frontend/src/components/AdminPanel/AdminUsers.module.css |  |  |
| frontend/src/components/AuthPage/AuthPage.jsx | import React, { useState } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import axiosInstance from '../../api/axiosInstance';<br>import useErrorHandler from '../../hooks/useErrorHandler';<br>import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';<br>import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';<br>import styles from '../Forms/Form.module.css'; | export default AuthPage; |
| frontend/src/components/BookingPage/BookingPage.jsx | import React, { useState, useEffect } from 'react';<br>import { useParams, useLocation, useNavigate } from 'react-router-dom';<br>import { FiArrowRight, FiCheck, FiCalendar, FiMapPin } from 'react-icons/fi';<br>import axiosInstance from '../../api/axiosInstance';<br>import ServiceSummary from './components/ServiceSummary';<br>import CalendarPicker from './components/CalendarPicker';<br>import TimeSlotPicker from './components/TimeSlotPicker';<br>import BookingForm from './components/BookingForm';<br>import BookingConfirmation from './components/BookingConfirmation';<br>import styles from './BookingPage.module.css'; | export default function BookingPage() { |
| frontend/src/components/BookingPage/BookingPage.module.css |  |  |
| frontend/src/components/BookingPage/components/BookingConfirmation.jsx | import React from 'react';<br>import {<br>import styles from './BookingConfirmation.module.css'; | export default function BookingConfirmation({ |
| frontend/src/components/BookingPage/components/BookingConfirmation.module.css |  |  |
| frontend/src/components/BookingPage/components/BookingForm.jsx | import React, { useState, useEffect } from 'react';<br>import { FiUser, FiPhone, FiMail, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';<br>import axiosInstance from '../../../api/axiosInstance';<br>import styles from './BookingForm.module.css'; | export default function BookingForm({ |
| frontend/src/components/BookingPage/components/BookingForm.module.css |  |  |
| frontend/src/components/BookingPage/components/CalendarPicker.jsx | import React, { useState, useEffect } from 'react';<br>import { FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';<br>import axiosInstance from '../../../api/axiosInstance';<br>import styles from './CalendarPicker.module.css'; | export default function CalendarPicker({ businessId, serviceId, onDateSelect, selectedDate }) { |
| frontend/src/components/BookingPage/components/CalendarPicker.module.css |  |  |
| frontend/src/components/BookingPage/components/ServiceSummary.jsx | import React from 'react';<br>import { FiMapPin, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';<br>import styles from './ServiceSummary.module.css'; | export default function ServiceSummary({ business, service, selectedDate, selectedTime }) { |
| frontend/src/components/BookingPage/components/ServiceSummary.module.css |  |  |
| frontend/src/components/BookingPage/components/TimeSlotPicker.jsx | import React, { useMemo } from 'react';<br>import { FiClock, FiCheck, FiX } from 'react-icons/fi';<br>import styles from './TimeSlotPicker.module.css'; | export default function TimeSlotPicker({ |
| frontend/src/components/BookingPage/components/TimeSlotPicker.module.css |  |  |
| frontend/src/components/BusinessCard/BusinessCard.jsx | import React, { useState, memo, useCallback } from "react";<br>import { useNavigate } from "react-router-dom";<br>import axiosInstance from "../../api/axiosInstance";<br>import ErrorMessage from "../shared/ErrorMessage/ErrorMessage";<br>import useErrorHandler from "../../hooks/useErrorHandler";<br>import styles from "./BusinessCard.module.css"; | export default BusinessCard; |
| frontend/src/components/BusinessCard/BusinessCard.module.css |  |  |
| frontend/src/components/BusinessDashboard/ActivityFeed.jsx | import React from 'react';<br>import styles from './ActivityFeed.module.css'; | export default function ActivityFeed({ activities }) { |
| frontend/src/components/BusinessDashboard/ActivityFeed.module.css |  |  |
| frontend/src/components/BusinessDashboard/KpiCards.jsx | import React from 'react';<br>import styles from './KpiCards.module.css'; | export default function KpiCards({ analytics }) { |
| frontend/src/components/BusinessDashboard/KpiCards.module.css |  |  |
| frontend/src/components/BusinessDashboard/NewBusinessDashboard.jsx | import React, { useState, useEffect, useCallback } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import styles from './NewBusinessDashboard.module.css';<br>import axiosInstance from '../../api/axiosInstance';<br>import KpiCards from './KpiCards';<br>import PerformanceChart from './PerformanceChart';<br>import PopularServices from './PopularServices';<br>import ActivityFeed from './ActivityFeed';<br>import ReportGenerator from './ReportGenerator/ReportGenerator'; | export default function NewBusinessDashboard({ user }) { |
| frontend/src/components/BusinessDashboard/NewBusinessDashboard.module.css |  |  |
| frontend/src/components/BusinessDashboard/PerformanceChart.jsx | import React from 'react';<br>import styles from './PerformanceChart.module.css'; | export default function PerformanceChart({ data }) { |
| frontend/src/components/BusinessDashboard/PerformanceChart.module.css |  |  |
| frontend/src/components/BusinessDashboard/PopularServices.jsx | import React from 'react';<br>import styles from './PopularServices.module.css'; | export default function PopularServices({ services }) { |
| frontend/src/components/BusinessDashboard/PopularServices.module.css |  |  |
| frontend/src/components/BusinessDashboard/ReportGenerator/ReportGenerator.jsx | import React, { useState, useEffect } from 'react';<br>import styles from './ReportGenerator.module.css';<br>import axiosInstance from '../../../api/axiosInstance'; | export default ReportGenerator; |
| frontend/src/components/BusinessDashboard/ReportGenerator/ReportGenerator.module.css |  |  |
| frontend/src/components/BusinessDashboard/ServiceModal.jsx | import React, { useState } from 'react';<br>import styles from './ServiceModal.module.css';<br>import axiosInstance from '../../api/axiosInstance'; | export default function ServiceModal({ isOpen, onClose, onServiceCreated, businessId }) { |
| frontend/src/components/BusinessDashboard/ServiceModal.module.css |  |  |
| frontend/src/components/BusinessEditPage/BusinessEditPage.jsx | import React, { useState, useEffect, useCallback } from 'react';<br>import { useParams, useNavigate } from 'react-router-dom';<br>import axiosInstance from '../../api/axiosInstance';<br>import useImageUpload from '../../hooks/useImageUpload';<br>import DragDropUpload from '../shared/DragDropUpload/DragDropUpload';<br>import styles from './BusinessEditPage.module.css'; | export default function BusinessEditPage() { |
| frontend/src/components/BusinessEditPage/BusinessEditPage.module.css |  |  |
| frontend/src/components/BusinessModal/BusinessModal.jsx | import React, { useState, useEffect } from 'react';<br>import { FiX } from 'react-icons/fi';<br>import { useNavigate } from 'react-router-dom';<br>import axiosInstance from '../../api/axiosInstance';<br>import styles from './BusinessModal.module.css'; | export default BusinessModal; |
| frontend/src/components/BusinessModal/BusinessModal.module.css |  |  |
| frontend/src/components/BusinessProfile/api/appointments.js | import axiosInstance from '../../../utils/axiosInstance'; | export async function fetchAppointments(businessId, monthIso) { |
| frontend/src/components/BusinessProfile/AppointmentForm/AppointmentForm.jsx | import { useState } from "react";<br>import styles from "./AppointmentForm.module.css"; | export default function AppointmentForm({ |
| frontend/src/components/BusinessProfile/AppointmentForm/AppointmentForm.module.css |  |  |
| frontend/src/components/BusinessProfile/BusinessProfile.jsx | import { useEffect, useState } from "react";<br>import { useNavigate, useParams } from "react-router-dom";<br>import styles from "./BusinessProfile.module.css";<br>import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";<br>import ServicesModal from "./sideBar/ServicesModal";<br>import GalleryEdit from "./sideBar/GalleryEdit";<br>import ExistingAppointments from "./sideBar/ExistingAppointments";<br>import RequestsTab from "./sideBar/RequestsTab";<br>import Calendar from "./tabs/Calendar/Calendar";<br>import GalleryView from "./tabs/GalleryView/GalleryView";<br>import MobileNavigation from "./components/MobileNavigation";<br>import FloatingActionButton from "./components/FloatingActionButton";<br>import PullToRefresh from "./components/PullToRefresh";<br>import LazyImage from "./components/LazyImage";<br>import { useSwipeGestures } from "./hooks/useSwipeGestures"; | export default function BusinessProfile() { |
| frontend/src/components/BusinessProfile/BusinessProfile.module.css |  |  |
| frontend/src/components/BusinessProfile/components/FloatingActionButton.jsx | import { useState } from 'react';<br>import styles from './FloatingActionButton.module.css'; | export default function FloatingActionButton({ onQuickAction }) { |
| frontend/src/components/BusinessProfile/components/FloatingActionButton.module.css |  |  |
| frontend/src/components/BusinessProfile/components/LazyImage.jsx | import { useState, useRef, useEffect } from 'react';<br>import styles from './LazyImage.module.css'; | export default function LazyImage({ |
| frontend/src/components/BusinessProfile/components/LazyImage.module.css |  |  |
| frontend/src/components/BusinessProfile/components/MobileNavigation.jsx | import styles from './MobileNavigation.module.css'; | export default function MobileNavigation({ activeTab, onTabChange }) { |
| frontend/src/components/BusinessProfile/components/MobileNavigation.module.css |  |  |
| frontend/src/components/BusinessProfile/components/PullToRefresh.jsx | import { usePullToRefresh } from '../hooks/usePullToRefresh';<br>import styles from './PullToRefresh.module.css'; | export default function PullToRefresh({ onRefresh, children }) { |
| frontend/src/components/BusinessProfile/components/PullToRefresh.module.css |  |  |
| frontend/src/components/BusinessProfile/hooks/usePullToRefresh.js | import { useEffect, useState, useRef } from 'react'; | export function usePullToRefresh({ onRefresh, threshold = 80 }) { |
| frontend/src/components/BusinessProfile/hooks/useSwipeGestures.js | import { useEffect, useRef, useState } from 'react'; | export function useSwipeGestures({ onSwipeLeft, onSwipeRight, threshold = 50 }) { |
| frontend/src/components/BusinessProfile/sideBar/BusinessDetailsForm.jsx | import { useState } from "react";<br>import styles from "./BusinessDetailsForm.module.css"; | export default function BusinessDetailsForm({ initialData, onSave }) { |
| frontend/src/components/BusinessProfile/sideBar/BusinessDetailsForm.module.css |  |  |
| frontend/src/components/BusinessProfile/sideBar/ExistingAppointments.jsx | import { useState } from "react";<br>import styles from "./ExistingAppointments.module.css"; | export default function ExistingAppointments({ |
| frontend/src/components/BusinessProfile/sideBar/ExistingAppointments.module.css |  |  |
| frontend/src/components/BusinessProfile/sideBar/GalleryEdit.jsx | import { useRef, useState, useCallback, useEffect } from "react";<br>import useImageUpload from '../../../hooks/useImageUpload';<br>import DragDropUpload from '../../shared/DragDropUpload/DragDropUpload';<br>import styles from "./GalleryEdit.module.css"; | export default function GalleryEdit({ gallery = [], onSave }) { |
| frontend/src/components/BusinessProfile/sideBar/GalleryEdit.module.css |  |  |
| frontend/src/components/BusinessProfile/sideBar/RequestsTab.jsx | import { useEffect, useState } from "react";<br>import axiosInstance from "../../../api/axiosInstance";<br>import styles from "./RequestsTab.module.css"; | export default function RequestsTab({ businessId, onAction }) { |
| frontend/src/components/BusinessProfile/sideBar/RequestsTab.module.css |  |  |
| frontend/src/components/BusinessProfile/sideBar/ScheduleModal.jsx | import { useState } from "react";<br>import Calendar from "react-calendar";<br>import "react-calendar/dist/Calendar.css"; // סגנון מובנה<br>import styles from "./ScheduleModal.module.css"; | export default function ScheduleModal({ appointments, onClose }) { |
| frontend/src/components/BusinessProfile/sideBar/ScheduleModal.module.css |  |  |
| frontend/src/components/BusinessProfile/sideBar/ServicesModal.jsx | import { useState } from "react";<br>import styles from "./ServicesModal.module.css"; | export default function ServicesPanel({ services = [], onSave }) { |
| frontend/src/components/BusinessProfile/sideBar/ServicesModal.module.css |  |  |
| frontend/src/components/BusinessProfile/tabs/Calendar/BookingModal.jsx | import { useState } from "react";<br>import styles from "./BookingModal.module.css"; | export default function BookingModal({ |
| frontend/src/components/BusinessProfile/tabs/Calendar/BookingModal.module.css |  |  |
| frontend/src/components/BusinessProfile/tabs/Calendar/Calendar.jsx | import { useState } from "react";<br>import styles from "./Calendar.module.css"; | export default function Calendar({ appointments = [], onDaySelect }) { |
| frontend/src/components/BusinessProfile/tabs/Calendar/Calendar.module.css |  |  |
| frontend/src/components/BusinessProfile/tabs/GalleryView/GalleryView.jsx | import styles from "./GalleryView.module.css"; | export default function GalleryView({ images = [] }) { |
| frontend/src/components/BusinessProfile/tabs/GalleryView/GalleryView.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/BusinessPublicProfile.jsx | import React, { useState, useEffect } from 'react';<br>import { useParams } from 'react-router-dom';<br>import axios from '../../api/axiosInstance';<br>import styles from './BusinessPublicProfile.module.css';<br>import ProfileHeader from './components/ProfileHeader';<br>import ContactInfo from './components/ContactInfo';<br>import About from './components/About';<br>import ImageGallery from './components/ImageGallery';<br>import ServiceList from './components/ServiceList';<br>import ReviewsList from './components/ReviewsList';<br>import { | export default BusinessPublicProfile; |
| frontend/src/components/BusinessPublicProfile/BusinessPublicProfile.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/About.jsx | import React from 'react';<br>import styles from './About.module.css'; | export default About; |
| frontend/src/components/BusinessPublicProfile/components/About.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/ContactInfo.jsx | import React from 'react';<br>import styles from './ContactInfo.module.css'; | export default ContactInfo; |
| frontend/src/components/BusinessPublicProfile/components/ContactInfo.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/ImageGallery.jsx | import React from 'react';<br>import styles from './ImageGallery.module.css'; | export default ImageGallery; |
| frontend/src/components/BusinessPublicProfile/components/ImageGallery.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/ProfileHeader.jsx | import React, { useContext, useState, useEffect } from 'react';<br>import axios from '../../../api/axiosInstance';<br>import { UserContext } from '../../../context/UserContext';<br>import { useToastContext } from '../../../context/ToastContext';<br>import styles from './ProfileHeader.module.css'; | export default ProfileHeader; |
| frontend/src/components/BusinessPublicProfile/components/ProfileHeader.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/ReviewReportModal.jsx | import React, { useState } from 'react';<br>import styles from './ReviewReportModal.module.css';<br>import axiosInstance from '../../../api/axiosInstance';<br>import { useContext } from 'react';<br>import { UserContext } from '../../../context/UserContext'; | export default ReviewReportModal; |
| frontend/src/components/BusinessPublicProfile/components/ReviewReportModal.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/ReviewsList.jsx | import React, { useState, useEffect } from 'react';<br>import styles from './ReviewsList.module.css';<br>import axiosInstance from '../../../api/axiosInstance';<br>import { useContext } from 'react';<br>import { UserContext } from '../../../context/UserContext';<br>import ReviewReportModal from './ReviewReportModal'; | export default ReviewsList; |
| frontend/src/components/BusinessPublicProfile/components/ReviewsList.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/ServiceList.jsx | import React, { useState, useEffect } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import axios from '../../../api/axiosInstance';<br>import { useToastContext } from '../../../context/ToastContext';<br>import styles from './ServiceList.module.css'; | export default ServiceList; |
| frontend/src/components/BusinessPublicProfile/components/ServiceList.module.css |  |  |
| frontend/src/components/BusinessPublicProfile/components/SkeletonLoader.jsx | import React from 'react';<br>import styles from './SkeletonLoader.module.css'; | export const SkeletonText = ({ width = '100%', height = '1rem' }) => (<br>export const SkeletonAvatar = ({ size = '40px' }) => (<br>export const SkeletonButton = ({ width = '120px', height = '44px' }) => (<br>export const SkeletonCard = ({ children, className = '' }) => (<br>export const ProfileHeaderSkeleton = () => (<br>export const ContactInfoSkeleton = () => (<br>export const AboutSkeleton = () => (<br>export const ImageGallerySkeleton = () => (<br>export const ServiceListSkeleton = () => (<br>export const ReviewsListSkeleton = () => ( |
| frontend/src/components/BusinessPublicProfile/components/SkeletonLoader.module.css |  |  |
| frontend/src/components/BusinessRegistration/BusinessRegistration.jsx | import React, { useState } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import axiosInstance from '../../api/axiosInstance';<br>import useErrorHandler from '../../hooks/useErrorHandler';<br>import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';<br>import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';<br>import styles from '../Forms/Form.module.css'; | export default BusinessRegistration; |
| frontend/src/components/CalendarPage/CalendarPage.jsx | import React, { useState, useEffect, useCallback, useContext } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import styles from './CalendarPage.module.css';<br>import axiosInstance from '../../api/axiosInstance';<br>import { UserContext } from '../../context/UserContext'; | export default function CalendarPage() { |
| frontend/src/components/CalendarPage/CalendarPage.module.css |  |  |
| frontend/src/components/common/Toast/Toast.jsx | import React, { useState, useEffect, useCallback } from 'react';<br>import styles from './Toast.module.css'; | export const useToast = () => {<br>export const ToastContainer = ({ toasts, onRemove }) => {<br>export default Toast; |
| frontend/src/components/common/Toast/Toast.module.css |  |  |
| frontend/src/components/FavoritesPage/FavoritesPage.jsx | import React, { useState, useEffect } from 'react';<br>import axiosInstance from '../../api/axiosInstance';<br>import BusinessCard from '../BusinessCard/BusinessCard';<br>import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';<br>import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';<br>import styles from './FavoritesPage.module.css'; | export default function FavoritesPage({ user }) { |
| frontend/src/components/FavoritesPage/FavoritesPage.module.css |  |  |
| frontend/src/components/Forms/Form.module.css |  |  |
| frontend/src/components/layout/Footer/Footer.jsx | import styles from "./footer.module.css"; | export default function Footer() { |
| frontend/src/components/layout/Footer/footer.module.css |  |  |
| frontend/src/components/layout/Header/Header.jsx | import React from 'react';<br>import { Link } from 'react-router-dom';<br>import { FiLogOut, FiSearch } from 'react-icons/fi'; // Import the icons we need<br>import styles from './header.module.css'; | export default Header; |
| frontend/src/components/layout/Header/header.module.css |  |  |
| frontend/src/components/SearchPage/SearchPage.jsx | import React, { useState, useEffect, useCallback } from "react";<br>import { useNavigate } from "react-router-dom";<br>import BusinessCard from "../BusinessCard/BusinessCard.jsx";<br>import ErrorMessage from "../shared/ErrorMessage/ErrorMessage.jsx";<br>import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";<br>import styles from "./SearchPage.module.css";<br>import axiosInstance from "../../api/axiosInstance.js";<br>import useErrorHandler from "../../hooks/useErrorHandler.js"; | export default SearchPage; |
| frontend/src/components/SearchPage/SearchPage.module.css |  |  |
| frontend/src/components/ServiceList/ServiceList.jsx | import React, { useState, useEffect } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import axiosInstance from '../../api/axiosInstance';<br>import styles from './ServiceList.module.css'; | export default ServiceList; |
| frontend/src/components/ServiceList/ServiceList.module.css |  |  |
| frontend/src/components/ServiceManagement/ServiceManagement.jsx | import React, { useState, useEffect, useCallback, useContext } from 'react';<br>import { useNavigate } from 'react-router-dom';<br>import styles from './ServiceManagement.module.css';<br>import axiosInstance from '../../api/axiosInstance';<br>import { UserContext } from '../../context/UserContext'; | export default function ServiceManagement() { |
| frontend/src/components/ServiceManagement/ServiceManagement.module.css |  |  |
| frontend/src/components/shared/DragDropUpload/DragDropUpload.jsx | import React, { useState, useCallback, useRef } from 'react';<br>import useImageUpload from '../../../hooks/useImageUpload';<br>import styles from './DragDropUpload.module.css'; | export default DragDropUpload; |
| frontend/src/components/shared/DragDropUpload/DragDropUpload.module.css |  |  |
| frontend/src/components/shared/ErrorMessage/ErrorMessage.jsx | import React from 'react';<br>import styles from './ErrorMessage.module.css'; | export default ErrorMessage; |
| frontend/src/components/shared/ErrorMessage/ErrorMessage.module.css |  |  |
| frontend/src/components/shared/LoadingSpinner/LoadingSpinner.jsx | import React from 'react';<br>import styles from './LoadingSpinner.module.css'; | export default LoadingSpinner; |
| frontend/src/components/shared/LoadingSpinner/LoadingSpinner.module.css |  |  |
| frontend/src/components/ui/Button.jsx | import styles from "./Button.module.css"; | export default function Button({ |
| frontend/src/components/ui/Button.module.css |  |  |
| frontend/src/components/UserDashboard/ProfileModal/ProfileModal.jsx | import React, { useState, useEffect } from 'react';<br>import styles from './ProfileModal.module.css';<br>import axiosInstance from '../../../api/axiosInstance';<br>import ErrorMessage from '../../shared/ErrorMessage/ErrorMessage';<br>import LoadingSpinner from '../../shared/LoadingSpinner/LoadingSpinner'; | export default function ProfileModal({ user, isOpen, onClose, onUpdateSuccess }) { |
| frontend/src/components/UserDashboard/ProfileModal/ProfileModal.module.css |  |  |
| frontend/src/components/UserDashboard/ReviewableAppointments/ReviewableAppointments.jsx | import React, { useState, useEffect } from 'react';<br>import styles from './ReviewableAppointments.module.css';<br>import axiosInstance from '../../../api/axiosInstance';<br>import ReviewModal from '../ReviewModal/ReviewModal';<br>import { useToastContext } from '../../../context/ToastContext'; | export default ReviewableAppointments; |
| frontend/src/components/UserDashboard/ReviewableAppointments/ReviewableAppointments.module.css |  |  |
| frontend/src/components/UserDashboard/ReviewModal/ReviewModal.jsx | import React, { useState } from 'react';<br>import styles from './ReviewModal.module.css';<br>import axiosInstance from '../../../api/axiosInstance';<br>import { useToastContext } from '../../../context/ToastContext'; | export default ReviewModal; |
| frontend/src/components/UserDashboard/ReviewModal/ReviewModal.module.css |  |  |
| frontend/src/components/UserDashboard/UserDashboard.jsx | import React, { useState, useEffect } from 'react';<br>import styles from './UserDashboard.module.css';<br>import axiosInstance from '../../api/axiosInstance';<br>import ProfileModal from './ProfileModal/ProfileModal';<br>import ReviewableAppointments from './ReviewableAppointments/ReviewableAppointments'; | export default function UserDashboard({ user }) { |
| frontend/src/components/UserDashboard/UserDashboard.module.css |  |  |
| frontend/src/config/axios.js | import axios from 'axios'; | export default axiosInstance; |
| frontend/src/context/ToastContext.jsx | import React, { createContext, useContext } from 'react';<br>import { useToast, ToastContainer } from '../components/common/Toast/Toast'; | export const ToastProvider = ({ children }) => {<br>export const useToastContext = () => { |
| frontend/src/context/UserContext.jsx | import React, { createContext } from 'react'; | export const UserContext = createContext(null);<br>export const UserProvider = ({ children, value }) => { |
| frontend/src/hooks/useErrorHandler.js | import { useState, useCallback } from 'react'; | export default useErrorHandler; |
| frontend/src/hooks/useImageUpload.js | import { useState, useCallback } from 'react';<br>import axiosInstance from '../api/axiosInstance'; | export const useImageUpload = () => {<br>export default useImageUpload; |
| frontend/src/index.css |  |  |
| frontend/src/main.jsx | import React from 'react';<br>import ReactDOM from 'react-dom/client';<br>import { BrowserRouter } from 'react-router-dom';<br>import App from './App.jsx';<br>import { UserProvider } from './context/UserContext'; // Import UserProvider<br>import './index.css'; |  |
| frontend/src/styles/accessibility.css |  |  |
| frontend/src/styles/components.css |  |  |
| frontend/src/styles/dashboard.css |  |  |
| frontend/src/styles/design-system-variables.css |  |  |
| frontend/src/styles/index.css |  |  |
| frontend/src/styles/layout.css |  |  |


### Детальные заметки: backend

#### backend/.gitignore
- **Тип**: Файл.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/controllers/adminController.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const db = require('../dbSingleton');.
- **Экспорты**: exports.getAdminStats = async (req, res) => {, exports.getRecentActivity = async (req, res) => {, exports.getAllUsers = async (req, res) => {, exports.updateUserStatus = async (req, res) => {, exports.updateUserRole = async (req, res) => {, exports.getAllBusinesses = async (req, res) => {, exports.approveBusiness = async (req, res) => {, exports.rejectBusiness = async (req, res) => {, exports.deleteBusiness = async (req, res) => {, exports.getAllAppointments = async (req, res) => {, exports.updateAppointmentStatus = async (req, res) => {, exports.getUserAnalytics = async (req, res) => {, exports.getBusinessAnalytics = async (req, res) => {, exports.getAppointmentAnalytics = async (req, res) => {.
- **Связи**: зависит от ../dbSingleton.

#### backend/controllers/appointmentController.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const db = require('../dbSingleton');, const db = require('../dbSingleton');.
- **Экспорты**: module.exports = {, module.exports = {.
- **Связи**: зависит от ../dbSingleton, ../dbSingleton.

#### backend/controllers/businessController.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const db = require('../dbSingleton');.
- **Экспорты**: exports.getAllBusinesses = async (req, res) => {, exports.getBusinessById = async (req, res) => {, exports.createBusiness = async (req, res) => {, exports.updateBusiness = async (req, res) => {, exports.deleteBusiness = async (req, res) => {, exports.getCategories = async (req, res) => {, exports.getBusinessById = async (req, res) => {, exports.getBusinessServices = async (req, res) => {, exports.getBusinessReviews = async (req, res) => {, exports.getBusinessCalendar = async (req, res) => {, exports.getBusinessAvailability = async (req, res) => {, exports.createService = async (req, res) => {, exports.updateService = async (req, res) => {, exports.deleteService = async (req, res) => {, exports.getBusinessDashboard = async (req, res) => {, exports.getBusinessDashboardAnalytics = async (req, res) => {.
- **Связи**: зависит от ../dbSingleton.

#### backend/controllers/reportController.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const db = require('../dbSingleton');, const reportService = require('../services/reportService');, const pdfService = require('../services/pdfService');.
- **Экспорты**: exports.generateReport = async (req, res) => {, exports.previewReport = async (req, res) => {, exports.getAvailableDates = async (req, res) => {.
- **Связи**: зависит от ../dbSingleton, ../services/reportService, ../services/pdfService.

#### backend/controllers/reviewController.js
- **Тип**: JavaScript-модуль.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/dbSingleton.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const mysql = require("mysql2");.
- **Экспорты**: module.exports = dbSingleton;.
- **Связи**: зависит от mysql2.

#### backend/package-lock.json
- **Тип**: Конфигурация JSON.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/package.json
- **Тип**: Конфигурация JSON.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/README.md
- **Тип**: Документация.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/routes/admin.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const db = require("../dbSingleton").getPromise();.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../dbSingleton.

#### backend/routes/appointments.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const db = require("../dbSingleton").getPromise();.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../dbSingleton.

#### backend/routes/auth.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const bcrypt = require("bcrypt");, const jwt = require("jsonwebtoken");, const db = require("../dbSingleton").getPromise();.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, bcrypt, jsonwebtoken, ../dbSingleton.

#### backend/routes/businesses.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const businessController = require("../controllers/businessController");, const db = require('../dbSingleton').getPromise();.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../controllers/businessController, ../dbSingleton.

#### backend/routes/cleanup.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const fs = require("fs");, const path = require("path");, const db = require('../dbSingleton');.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, fs, path, ../dbSingleton.

#### backend/routes/reports.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const reportService = require("../services/reportService");, const pdfService = require("../services/pdfService");, const db = require("../dbSingleton").getPromise();.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../services/reportService, ../services/pdfService, ../dbSingleton.

#### backend/routes/reviews.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const db = require("../dbSingleton").getPromise();.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../dbSingleton.

#### backend/routes/search.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const db = require("../dbSingleton").getPromise(); // Use our new method!.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../dbSingleton.

#### backend/routes/upload.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const multer = require("multer");, const path = require("path");, const fs = require("fs");, const sharp = require("sharp");.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, multer, path, fs, sharp.

#### backend/routes/users.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const db = require("../dbSingleton").getPromise();, const bcrypt = require("bcryptjs");.
- **Экспорты**: module.exports = router;.
- **Связи**: зависит от express, ../dbSingleton, bcryptjs.

#### backend/services/pdfService.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const puppeteer = require('puppeteer');, const path = require('path');, const fs = require('fs').promises;.
- **Экспорты**: module.exports = new PDFService();.
- **Связи**: зависит от puppeteer, path, fs.

#### backend/services/reportService.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const db = require("../dbSingleton").getPromise();.
- **Экспорты**: module.exports = new ReportService();.
- **Связи**: зависит от ../dbSingleton.

#### backend/src/app.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const express = require("express");, const cors = require("cors");, const path = require("path");, const authRoutes = require("../routes/auth");, const searchRoutes = require("../routes/search");, const businessRoutes = require("../routes/businesses");, const userRoutes = require("../routes/users");, const appointmentRoutes = require("../routes/appointments");, const adminRoutes = require("../routes/admin");, const reviewRoutes = require("../routes/reviews");, const cleanupRoutes = require("../routes/cleanup");.
- **Экспорты**: —.
- **Связи**: зависит от express, cors, path, ../routes/auth, ../routes/search, ../routes/businesses, ../routes/users, ../routes/appointments, ../routes/admin, ../routes/reviews, ../routes/cleanup.

#### backend/templates/reports/day-report.html
- **Тип**: HTML-шаблон.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/templates/reports/month-report.html
- **Тип**: HTML-шаблон.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/templates/reports/year-report.html
- **Тип**: HTML-шаблон.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### backend/tests/appointments.test.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const appointmentController = require('../controllers/appointmentController');.
- **Экспорты**: —.
- **Связи**: зависит от ../controllers/appointmentController.

#### backend/tests/auth.test.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const request = require('supertest');, const express = require('express');, const bcrypt = require('bcrypt');, const jwt = require('jsonwebtoken');, const authRoutes = require('../routes/auth');.
- **Экспорты**: —.
- **Связи**: зависит от supertest, express, bcrypt, jsonwebtoken, ../routes/auth.

#### backend/tests/dbSingleton.test.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const dbSingletonWithNull = require('../dbSingleton');, const dbSingletonWithNull = require('../dbSingleton');.
- **Экспорты**: —.
- **Связи**: зависит от ../dbSingleton, ../dbSingleton.

#### backend/tests/reportService.test.js
- **Тип**: JavaScript-модуль.
- **Импорты**: const reportService = require('../services/reportService');.
- **Экспорты**: —.
- **Связи**: зависит от ../services/reportService.

#### backend/tests/setup.js
- **Тип**: JavaScript-модуль.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

### Детальные заметки: frontend

#### frontend/src/api/axiosInstance.js
- **Тип**: JavaScript-модуль.
- **Импорты**: import axios from "axios";.
- **Экспорты**: export default axiosInstance;.
- **Связи**: зависит от axios.

#### frontend/src/App.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/App.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from "react";, import { Routes, Route, Navigate, useNavigate } from "react-router-dom";, import Header from "./components/layout/Header/Header";, import Footer from "./components/layout/Footer/Footer";, import AuthPage from "./components/AuthPage/AuthPage";, import BusinessRegistration from "./components/BusinessRegistration/BusinessRegistration";, import BusinessProfile from "./components/BusinessProfile/BusinessProfile";, import BusinessEditPage from "./components/BusinessEditPage/BusinessEditPage";, import BusinessPublicProfile from "./components/BusinessPublicProfile/BusinessPublicProfile";, import NewBusinessDashboard from "./components/BusinessDashboard/NewBusinessDashboard";, import ServiceManagement from "./components/ServiceManagement/ServiceManagement";, import CalendarPage from "./components/CalendarPage/CalendarPage";, import UserDashboard from "./components/UserDashboard/UserDashboard";, import FavoritesPage from "./components/FavoritesPage/FavoritesPage";, import SearchPage from "./components/SearchPage/SearchPage";, import BookingPage from "./components/BookingPage/BookingPage";, import AdminPanel from "./components/AdminPanel/AdminPanel";, import { UserProvider } from "./context/UserContext";, import { ToastProvider } from "./context/ToastContext";, import "./App.css";.
- **Экспорты**: export default App;.
- **Связи**: зависит от react, react-router-dom, ./components/layout/Header/Header, ./components/layout/Footer/Footer, ./components/AuthPage/AuthPage, ./components/BusinessRegistration/BusinessRegistration, ./components/BusinessProfile/BusinessProfile, ./components/BusinessEditPage/BusinessEditPage, ./components/BusinessPublicProfile/BusinessPublicProfile, ./components/BusinessDashboard/NewBusinessDashboard, ./components/ServiceManagement/ServiceManagement, ./components/CalendarPage/CalendarPage, ./components/UserDashboard/UserDashboard, ./components/FavoritesPage/FavoritesPage, ./components/SearchPage/SearchPage, ./components/BookingPage/BookingPage, ./components/AdminPanel/AdminPanel, ./context/UserContext, ./context/ToastContext, внешних модулей.

#### frontend/src/assets/react.svg
- **Тип**: Файл.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/AdminPanel/AdminAppointments.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from "react";, import styles from "./AdminAppointments.module.css";.
- **Экспорты**: export default AdminAppointments;.
- **Связи**: зависит от react, ./AdminAppointments.module.css.

#### frontend/src/components/AdminPanel/AdminAppointments.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/AdminPanel/AdminBusinesses.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from "react";, import axiosInstance from "../../api/axiosInstance";, import styles from "./AdminBusinesses.module.css";.
- **Экспорты**: export default AdminBusinesses;.
- **Связи**: зависит от react, ../../api/axiosInstance, ./AdminBusinesses.module.css.

#### frontend/src/components/AdminPanel/AdminBusinesses.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/AdminPanel/AdminPanel.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from "react";, import { Routes, Route, Navigate } from "react-router-dom";, import AdminStats from "./AdminStats";, import AdminUsers from "./AdminUsers";, import AdminBusinesses from "./AdminBusinesses";, import axiosInstance from "../../api/axiosInstance";, import styles from "./AdminPanel.module.css";.
- **Экспорты**: export default AdminPanel;.
- **Связи**: зависит от react, react-router-dom, ./AdminStats, ./AdminUsers, ./AdminBusinesses, ../../api/axiosInstance, ./AdminPanel.module.css.

#### frontend/src/components/AdminPanel/AdminPanel.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/AdminPanel/AdminStats.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from "react";, import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";, import axiosInstance from "../../api/axiosInstance";, import styles from "./AdminStats.module.css";.
- **Экспорты**: export default AdminStats;.
- **Связи**: зависит от react, ../shared/LoadingSpinner/LoadingSpinner, ../../api/axiosInstance, ./AdminStats.module.css.

#### frontend/src/components/AdminPanel/AdminStats.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/AdminPanel/AdminUsers.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from "react";, import axiosInstance from "../../api/axiosInstance";, import styles from "./AdminUsers.module.css";.
- **Экспорты**: export default AdminUsers;.
- **Связи**: зависит от react, ../../api/axiosInstance, ./AdminUsers.module.css.

#### frontend/src/components/AdminPanel/AdminUsers.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/AuthPage/AuthPage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState } from 'react';, import { useNavigate } from 'react-router-dom';, import axiosInstance from '../../api/axiosInstance';, import useErrorHandler from '../../hooks/useErrorHandler';, import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';, import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';, import styles from '../Forms/Form.module.css';.
- **Экспорты**: export default AuthPage;.
- **Связи**: зависит от react, react-router-dom, ../../api/axiosInstance, ../../hooks/useErrorHandler, ../shared/ErrorMessage/ErrorMessage, ../shared/LoadingSpinner/LoadingSpinner, ../Forms/Form.module.css.

#### frontend/src/components/BookingPage/BookingPage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { useParams, useLocation, useNavigate } from 'react-router-dom';, import { FiArrowRight, FiCheck, FiCalendar, FiMapPin } from 'react-icons/fi';, import axiosInstance from '../../api/axiosInstance';, import ServiceSummary from './components/ServiceSummary';, import CalendarPicker from './components/CalendarPicker';, import TimeSlotPicker from './components/TimeSlotPicker';, import BookingForm from './components/BookingForm';, import BookingConfirmation from './components/BookingConfirmation';, import styles from './BookingPage.module.css';.
- **Экспорты**: export default function BookingPage() {.
- **Связи**: зависит от react, react-router-dom, react-icons/fi, ../../api/axiosInstance, ./components/ServiceSummary, ./components/CalendarPicker, ./components/TimeSlotPicker, ./components/BookingForm, ./components/BookingConfirmation, ./BookingPage.module.css.

#### frontend/src/components/BookingPage/BookingPage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BookingPage/components/BookingConfirmation.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import {, import styles from './BookingConfirmation.module.css';.
- **Экспорты**: export default function BookingConfirmation({.
- **Связи**: зависит от react, внешних модулей, ./BookingConfirmation.module.css.

#### frontend/src/components/BookingPage/components/BookingConfirmation.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BookingPage/components/BookingForm.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { FiUser, FiPhone, FiMail, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';, import axiosInstance from '../../../api/axiosInstance';, import styles from './BookingForm.module.css';.
- **Экспорты**: export default function BookingForm({.
- **Связи**: зависит от react, react-icons/fi, ../../../api/axiosInstance, ./BookingForm.module.css.

#### frontend/src/components/BookingPage/components/BookingForm.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BookingPage/components/CalendarPicker.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';, import axiosInstance from '../../../api/axiosInstance';, import styles from './CalendarPicker.module.css';.
- **Экспорты**: export default function CalendarPicker({ businessId, serviceId, onDateSelect, selectedDate }) {.
- **Связи**: зависит от react, react-icons/fi, ../../../api/axiosInstance, ./CalendarPicker.module.css.

#### frontend/src/components/BookingPage/components/CalendarPicker.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BookingPage/components/ServiceSummary.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import { FiMapPin, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';, import styles from './ServiceSummary.module.css';.
- **Экспорты**: export default function ServiceSummary({ business, service, selectedDate, selectedTime }) {.
- **Связи**: зависит от react, react-icons/fi, ./ServiceSummary.module.css.

#### frontend/src/components/BookingPage/components/ServiceSummary.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BookingPage/components/TimeSlotPicker.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useMemo } from 'react';, import { FiClock, FiCheck, FiX } from 'react-icons/fi';, import styles from './TimeSlotPicker.module.css';.
- **Экспорты**: export default function TimeSlotPicker({.
- **Связи**: зависит от react, react-icons/fi, ./TimeSlotPicker.module.css.

#### frontend/src/components/BookingPage/components/TimeSlotPicker.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessCard/BusinessCard.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, memo, useCallback } from "react";, import { useNavigate } from "react-router-dom";, import axiosInstance from "../../api/axiosInstance";, import ErrorMessage from "../shared/ErrorMessage/ErrorMessage";, import useErrorHandler from "../../hooks/useErrorHandler";, import styles from "./BusinessCard.module.css";.
- **Экспорты**: export default BusinessCard;.
- **Связи**: зависит от react, react-router-dom, ../../api/axiosInstance, ../shared/ErrorMessage/ErrorMessage, ../../hooks/useErrorHandler, ./BusinessCard.module.css.

#### frontend/src/components/BusinessCard/BusinessCard.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/ActivityFeed.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './ActivityFeed.module.css';.
- **Экспорты**: export default function ActivityFeed({ activities }) {.
- **Связи**: зависит от react, ./ActivityFeed.module.css.

#### frontend/src/components/BusinessDashboard/ActivityFeed.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/KpiCards.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './KpiCards.module.css';.
- **Экспорты**: export default function KpiCards({ analytics }) {.
- **Связи**: зависит от react, ./KpiCards.module.css.

#### frontend/src/components/BusinessDashboard/KpiCards.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/NewBusinessDashboard.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect, useCallback } from 'react';, import { useNavigate } from 'react-router-dom';, import styles from './NewBusinessDashboard.module.css';, import axiosInstance from '../../api/axiosInstance';, import KpiCards from './KpiCards';, import PerformanceChart from './PerformanceChart';, import PopularServices from './PopularServices';, import ActivityFeed from './ActivityFeed';, import ReportGenerator from './ReportGenerator/ReportGenerator';.
- **Экспорты**: export default function NewBusinessDashboard({ user }) {.
- **Связи**: зависит от react, react-router-dom, ./NewBusinessDashboard.module.css, ../../api/axiosInstance, ./KpiCards, ./PerformanceChart, ./PopularServices, ./ActivityFeed, ./ReportGenerator/ReportGenerator.

#### frontend/src/components/BusinessDashboard/NewBusinessDashboard.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/PerformanceChart.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './PerformanceChart.module.css';.
- **Экспорты**: export default function PerformanceChart({ data }) {.
- **Связи**: зависит от react, ./PerformanceChart.module.css.

#### frontend/src/components/BusinessDashboard/PerformanceChart.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/PopularServices.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './PopularServices.module.css';.
- **Экспорты**: export default function PopularServices({ services }) {.
- **Связи**: зависит от react, ./PopularServices.module.css.

#### frontend/src/components/BusinessDashboard/PopularServices.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/ReportGenerator/ReportGenerator.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import styles from './ReportGenerator.module.css';, import axiosInstance from '../../../api/axiosInstance';.
- **Экспорты**: export default ReportGenerator;.
- **Связи**: зависит от react, ./ReportGenerator.module.css, ../../../api/axiosInstance.

#### frontend/src/components/BusinessDashboard/ReportGenerator/ReportGenerator.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessDashboard/ServiceModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState } from 'react';, import styles from './ServiceModal.module.css';, import axiosInstance from '../../api/axiosInstance';.
- **Экспорты**: export default function ServiceModal({ isOpen, onClose, onServiceCreated, businessId }) {.
- **Связи**: зависит от react, ./ServiceModal.module.css, ../../api/axiosInstance.

#### frontend/src/components/BusinessDashboard/ServiceModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessEditPage/BusinessEditPage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect, useCallback } from 'react';, import { useParams, useNavigate } from 'react-router-dom';, import axiosInstance from '../../api/axiosInstance';, import useImageUpload from '../../hooks/useImageUpload';, import DragDropUpload from '../shared/DragDropUpload/DragDropUpload';, import styles from './BusinessEditPage.module.css';.
- **Экспорты**: export default function BusinessEditPage() {.
- **Связи**: зависит от react, react-router-dom, ../../api/axiosInstance, ../../hooks/useImageUpload, ../shared/DragDropUpload/DragDropUpload, ./BusinessEditPage.module.css.

#### frontend/src/components/BusinessEditPage/BusinessEditPage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessModal/BusinessModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { FiX } from 'react-icons/fi';, import { useNavigate } from 'react-router-dom';, import axiosInstance from '../../api/axiosInstance';, import styles from './BusinessModal.module.css';.
- **Экспорты**: export default BusinessModal;.
- **Связи**: зависит от react, react-icons/fi, react-router-dom, ../../api/axiosInstance, ./BusinessModal.module.css.

#### frontend/src/components/BusinessModal/BusinessModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/api/appointments.js
- **Тип**: JavaScript-модуль.
- **Импорты**: —.
- **Экспорты**: export async function fetchAppointments(businessId, monthIso) {.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/AppointmentForm/AppointmentForm.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import styles from "./AppointmentForm.module.css";.
- **Экспорты**: export default function AppointmentForm({.
- **Связи**: зависит от react, ./AppointmentForm.module.css.

#### frontend/src/components/BusinessProfile/AppointmentForm/AppointmentForm.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/BusinessProfile.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useEffect, useState } from "react";, import { useNavigate, useParams } from "react-router-dom";, import styles from "./BusinessProfile.module.css";, import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";, import ServicesModal from "./sideBar/ServicesModal";, import GalleryEdit from "./sideBar/GalleryEdit";, import ExistingAppointments from "./sideBar/ExistingAppointments";, import RequestsTab from "./sideBar/RequestsTab";, import Calendar from "./tabs/Calendar/Calendar";, import GalleryView from "./tabs/GalleryView/GalleryView";, import MobileNavigation from "./components/MobileNavigation";, import FloatingActionButton from "./components/FloatingActionButton";, import PullToRefresh from "./components/PullToRefresh";, import LazyImage from "./components/LazyImage";, import { useSwipeGestures } from "./hooks/useSwipeGestures";.
- **Экспорты**: export default function BusinessProfile() {.
- **Связи**: зависит от react, react-router-dom, ./BusinessProfile.module.css, ./sideBar/BusinessDetailsForm, ./sideBar/ServicesModal, ./sideBar/GalleryEdit, ./sideBar/ExistingAppointments, ./sideBar/RequestsTab, ./tabs/Calendar/Calendar, ./tabs/GalleryView/GalleryView, ./components/MobileNavigation, ./components/FloatingActionButton, ./components/PullToRefresh, ./components/LazyImage, ./hooks/useSwipeGestures.

#### frontend/src/components/BusinessProfile/BusinessProfile.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/components/FloatingActionButton.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from 'react';, import styles from './FloatingActionButton.module.css';.
- **Экспорты**: export default function FloatingActionButton({ onQuickAction }) {.
- **Связи**: зависит от react, ./FloatingActionButton.module.css.

#### frontend/src/components/BusinessProfile/components/FloatingActionButton.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/components/LazyImage.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState, useRef, useEffect } from 'react';, import styles from './LazyImage.module.css';.
- **Экспорты**: export default function LazyImage({.
- **Связи**: зависит от react, ./LazyImage.module.css.

#### frontend/src/components/BusinessProfile/components/LazyImage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/components/MobileNavigation.jsx
- **Тип**: React-компонент.
- **Импорты**: import styles from './MobileNavigation.module.css';.
- **Экспорты**: export default function MobileNavigation({ activeTab, onTabChange }) {.
- **Связи**: зависит от ./MobileNavigation.module.css.

#### frontend/src/components/BusinessProfile/components/MobileNavigation.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/components/PullToRefresh.jsx
- **Тип**: React-компонент.
- **Импорты**: import { usePullToRefresh } from '../hooks/usePullToRefresh';, import styles from './PullToRefresh.module.css';.
- **Экспорты**: export default function PullToRefresh({ onRefresh, children }) {.
- **Связи**: зависит от ../hooks/usePullToRefresh, ./PullToRefresh.module.css.

#### frontend/src/components/BusinessProfile/components/PullToRefresh.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/hooks/usePullToRefresh.js
- **Тип**: JavaScript-модуль.
- **Импорты**: import { useEffect, useState, useRef } from 'react';.
- **Экспорты**: export function usePullToRefresh({ onRefresh, threshold = 80 }) {.
- **Связи**: зависит от react.

#### frontend/src/components/BusinessProfile/hooks/useSwipeGestures.js
- **Тип**: JavaScript-модуль.
- **Импорты**: import { useEffect, useRef, useState } from 'react';.
- **Экспорты**: export function useSwipeGestures({ onSwipeLeft, onSwipeRight, threshold = 50 }) {.
- **Связи**: зависит от react.

#### frontend/src/components/BusinessProfile/sideBar/BusinessDetailsForm.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import styles from "./BusinessDetailsForm.module.css";.
- **Экспорты**: export default function BusinessDetailsForm({ initialData, onSave }) {.
- **Связи**: зависит от react, ./BusinessDetailsForm.module.css.

#### frontend/src/components/BusinessProfile/sideBar/BusinessDetailsForm.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/sideBar/ExistingAppointments.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import styles from "./ExistingAppointments.module.css";.
- **Экспорты**: export default function ExistingAppointments({.
- **Связи**: зависит от react, ./ExistingAppointments.module.css.

#### frontend/src/components/BusinessProfile/sideBar/ExistingAppointments.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/sideBar/GalleryEdit.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useRef, useState, useCallback, useEffect } from "react";, import useImageUpload from '../../../hooks/useImageUpload';, import DragDropUpload from '../../shared/DragDropUpload/DragDropUpload';, import styles from "./GalleryEdit.module.css";.
- **Экспорты**: export default function GalleryEdit({ gallery = [], onSave }) {.
- **Связи**: зависит от react, ../../../hooks/useImageUpload, ../../shared/DragDropUpload/DragDropUpload, ./GalleryEdit.module.css.

#### frontend/src/components/BusinessProfile/sideBar/GalleryEdit.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/sideBar/RequestsTab.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useEffect, useState } from "react";, import axiosInstance from "../../../api/axiosInstance";, import styles from "./RequestsTab.module.css";.
- **Экспорты**: export default function RequestsTab({ businessId, onAction }) {.
- **Связи**: зависит от react, ../../../api/axiosInstance, ./RequestsTab.module.css.

#### frontend/src/components/BusinessProfile/sideBar/RequestsTab.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/sideBar/ScheduleModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import Calendar from "react-calendar";, import "react-calendar/dist/Calendar.css"; // סגנון מובנה, import styles from "./ScheduleModal.module.css";.
- **Экспорты**: export default function ScheduleModal({ appointments, onClose }) {.
- **Связи**: зависит от react, react-calendar, внешних модулей, ./ScheduleModal.module.css.

#### frontend/src/components/BusinessProfile/sideBar/ScheduleModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/sideBar/ServicesModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import styles from "./ServicesModal.module.css";.
- **Экспорты**: export default function ServicesPanel({ services = [], onSave }) {.
- **Связи**: зависит от react, ./ServicesModal.module.css.

#### frontend/src/components/BusinessProfile/sideBar/ServicesModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/tabs/Calendar/BookingModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import styles from "./BookingModal.module.css";.
- **Экспорты**: export default function BookingModal({.
- **Связи**: зависит от react, ./BookingModal.module.css.

#### frontend/src/components/BusinessProfile/tabs/Calendar/BookingModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/tabs/Calendar/Calendar.jsx
- **Тип**: React-компонент.
- **Импорты**: import { useState } from "react";, import styles from "./Calendar.module.css";.
- **Экспорты**: export default function Calendar({ appointments = [], onDaySelect }) {.
- **Связи**: зависит от react, ./Calendar.module.css.

#### frontend/src/components/BusinessProfile/tabs/Calendar/Calendar.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessProfile/tabs/GalleryView/GalleryView.jsx
- **Тип**: React-компонент.
- **Импорты**: import styles from "./GalleryView.module.css";.
- **Экспорты**: export default function GalleryView({ images = [] }) {.
- **Связи**: зависит от ./GalleryView.module.css.

#### frontend/src/components/BusinessProfile/tabs/GalleryView/GalleryView.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/BusinessPublicProfile.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { useParams } from 'react-router-dom';, import axios from '../../api/axiosInstance';, import styles from './BusinessPublicProfile.module.css';, import ProfileHeader from './components/ProfileHeader';, import ContactInfo from './components/ContactInfo';, import About from './components/About';, import ImageGallery from './components/ImageGallery';, import ServiceList from './components/ServiceList';, import ReviewsList from './components/ReviewsList';, import {.
- **Экспорты**: export default BusinessPublicProfile;.
- **Связи**: зависит от react, react-router-dom, ../../api/axiosInstance, ./BusinessPublicProfile.module.css, ./components/ProfileHeader, ./components/ContactInfo, ./components/About, ./components/ImageGallery, ./components/ServiceList, ./components/ReviewsList, внешних модулей.

#### frontend/src/components/BusinessPublicProfile/BusinessPublicProfile.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/About.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './About.module.css';.
- **Экспорты**: export default About;.
- **Связи**: зависит от react, ./About.module.css.

#### frontend/src/components/BusinessPublicProfile/components/About.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/ContactInfo.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './ContactInfo.module.css';.
- **Экспорты**: export default ContactInfo;.
- **Связи**: зависит от react, ./ContactInfo.module.css.

#### frontend/src/components/BusinessPublicProfile/components/ContactInfo.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/ImageGallery.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './ImageGallery.module.css';.
- **Экспорты**: export default ImageGallery;.
- **Связи**: зависит от react, ./ImageGallery.module.css.

#### frontend/src/components/BusinessPublicProfile/components/ImageGallery.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/ProfileHeader.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useContext, useState, useEffect } from 'react';, import axios from '../../../api/axiosInstance';, import { UserContext } from '../../../context/UserContext';, import { useToastContext } from '../../../context/ToastContext';, import styles from './ProfileHeader.module.css';.
- **Экспорты**: export default ProfileHeader;.
- **Связи**: зависит от react, ../../../api/axiosInstance, ../../../context/UserContext, ../../../context/ToastContext, ./ProfileHeader.module.css.

#### frontend/src/components/BusinessPublicProfile/components/ProfileHeader.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/ReviewReportModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState } from 'react';, import styles from './ReviewReportModal.module.css';, import axiosInstance from '../../../api/axiosInstance';, import { useContext } from 'react';, import { UserContext } from '../../../context/UserContext';.
- **Экспорты**: export default ReviewReportModal;.
- **Связи**: зависит от react, ./ReviewReportModal.module.css, ../../../api/axiosInstance, react, ../../../context/UserContext.

#### frontend/src/components/BusinessPublicProfile/components/ReviewReportModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/ReviewsList.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import styles from './ReviewsList.module.css';, import axiosInstance from '../../../api/axiosInstance';, import { useContext } from 'react';, import { UserContext } from '../../../context/UserContext';, import ReviewReportModal from './ReviewReportModal';.
- **Экспорты**: export default ReviewsList;.
- **Связи**: зависит от react, ./ReviewsList.module.css, ../../../api/axiosInstance, react, ../../../context/UserContext, ./ReviewReportModal.

#### frontend/src/components/BusinessPublicProfile/components/ReviewsList.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/ServiceList.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { useNavigate } from 'react-router-dom';, import axios from '../../../api/axiosInstance';, import { useToastContext } from '../../../context/ToastContext';, import styles from './ServiceList.module.css';.
- **Экспорты**: export default ServiceList;.
- **Связи**: зависит от react, react-router-dom, ../../../api/axiosInstance, ../../../context/ToastContext, ./ServiceList.module.css.

#### frontend/src/components/BusinessPublicProfile/components/ServiceList.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessPublicProfile/components/SkeletonLoader.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './SkeletonLoader.module.css';.
- **Экспорты**: export const SkeletonText = ({ width = '100%', height = '1rem' }) => (, export const SkeletonAvatar = ({ size = '40px' }) => (, export const SkeletonButton = ({ width = '120px', height = '44px' }) => (, export const SkeletonCard = ({ children, className = '' }) => (, export const ProfileHeaderSkeleton = () => (, export const ContactInfoSkeleton = () => (, export const AboutSkeleton = () => (, export const ImageGallerySkeleton = () => (, export const ServiceListSkeleton = () => (, export const ReviewsListSkeleton = () => (.
- **Связи**: зависит от react, ./SkeletonLoader.module.css.

#### frontend/src/components/BusinessPublicProfile/components/SkeletonLoader.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/BusinessRegistration/BusinessRegistration.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState } from 'react';, import { useNavigate } from 'react-router-dom';, import axiosInstance from '../../api/axiosInstance';, import useErrorHandler from '../../hooks/useErrorHandler';, import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';, import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';, import styles from '../Forms/Form.module.css';.
- **Экспорты**: export default BusinessRegistration;.
- **Связи**: зависит от react, react-router-dom, ../../api/axiosInstance, ../../hooks/useErrorHandler, ../shared/ErrorMessage/ErrorMessage, ../shared/LoadingSpinner/LoadingSpinner, ../Forms/Form.module.css.

#### frontend/src/components/CalendarPage/CalendarPage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect, useCallback, useContext } from 'react';, import { useNavigate } from 'react-router-dom';, import styles from './CalendarPage.module.css';, import axiosInstance from '../../api/axiosInstance';, import { UserContext } from '../../context/UserContext';.
- **Экспорты**: export default function CalendarPage() {.
- **Связи**: зависит от react, react-router-dom, ./CalendarPage.module.css, ../../api/axiosInstance, ../../context/UserContext.

#### frontend/src/components/CalendarPage/CalendarPage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/common/Toast/Toast.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect, useCallback } from 'react';, import styles from './Toast.module.css';.
- **Экспорты**: export const useToast = () => {, export const ToastContainer = ({ toasts, onRemove }) => {, export default Toast;.
- **Связи**: зависит от react, ./Toast.module.css.

#### frontend/src/components/common/Toast/Toast.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/FavoritesPage/FavoritesPage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import axiosInstance from '../../api/axiosInstance';, import BusinessCard from '../BusinessCard/BusinessCard';, import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';, import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';, import styles from './FavoritesPage.module.css';.
- **Экспорты**: export default function FavoritesPage({ user }) {.
- **Связи**: зависит от react, ../../api/axiosInstance, ../BusinessCard/BusinessCard, ../shared/LoadingSpinner/LoadingSpinner, ../shared/ErrorMessage/ErrorMessage, ./FavoritesPage.module.css.

#### frontend/src/components/FavoritesPage/FavoritesPage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/Forms/Form.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/layout/Footer/Footer.jsx
- **Тип**: React-компонент.
- **Импорты**: import styles from "./footer.module.css";.
- **Экспорты**: export default function Footer() {.
- **Связи**: зависит от ./footer.module.css.

#### frontend/src/components/layout/Footer/footer.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/layout/Header/Header.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import { Link } from 'react-router-dom';, import { FiLogOut, FiSearch } from 'react-icons/fi'; // Import the icons we need, import styles from './header.module.css';.
- **Экспорты**: export default Header;.
- **Связи**: зависит от react, react-router-dom, react-icons/fi, ./header.module.css.

#### frontend/src/components/layout/Header/header.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/SearchPage/SearchPage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect, useCallback } from "react";, import { useNavigate } from "react-router-dom";, import BusinessCard from "../BusinessCard/BusinessCard.jsx";, import ErrorMessage from "../shared/ErrorMessage/ErrorMessage.jsx";, import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";, import styles from "./SearchPage.module.css";, import axiosInstance from "../../api/axiosInstance.js";, import useErrorHandler from "../../hooks/useErrorHandler.js";.
- **Экспорты**: export default SearchPage;.
- **Связи**: зависит от react, react-router-dom, ../BusinessCard/BusinessCard.jsx, ../shared/ErrorMessage/ErrorMessage.jsx, ../shared/LoadingSpinner/LoadingSpinner.jsx, ./SearchPage.module.css, ../../api/axiosInstance.js, ../../hooks/useErrorHandler.js.

#### frontend/src/components/SearchPage/SearchPage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/ServiceList/ServiceList.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import { useNavigate } from 'react-router-dom';, import axiosInstance from '../../api/axiosInstance';, import styles from './ServiceList.module.css';.
- **Экспорты**: export default ServiceList;.
- **Связи**: зависит от react, react-router-dom, ../../api/axiosInstance, ./ServiceList.module.css.

#### frontend/src/components/ServiceList/ServiceList.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/ServiceManagement/ServiceManagement.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect, useCallback, useContext } from 'react';, import { useNavigate } from 'react-router-dom';, import styles from './ServiceManagement.module.css';, import axiosInstance from '../../api/axiosInstance';, import { UserContext } from '../../context/UserContext';.
- **Экспорты**: export default function ServiceManagement() {.
- **Связи**: зависит от react, react-router-dom, ./ServiceManagement.module.css, ../../api/axiosInstance, ../../context/UserContext.

#### frontend/src/components/ServiceManagement/ServiceManagement.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/shared/DragDropUpload/DragDropUpload.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useCallback, useRef } from 'react';, import useImageUpload from '../../../hooks/useImageUpload';, import styles from './DragDropUpload.module.css';.
- **Экспорты**: export default DragDropUpload;.
- **Связи**: зависит от react, ../../../hooks/useImageUpload, ./DragDropUpload.module.css.

#### frontend/src/components/shared/DragDropUpload/DragDropUpload.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/shared/ErrorMessage/ErrorMessage.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './ErrorMessage.module.css';.
- **Экспорты**: export default ErrorMessage;.
- **Связи**: зависит от react, ./ErrorMessage.module.css.

#### frontend/src/components/shared/ErrorMessage/ErrorMessage.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/shared/LoadingSpinner/LoadingSpinner.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import styles from './LoadingSpinner.module.css';.
- **Экспорты**: export default LoadingSpinner;.
- **Связи**: зависит от react, ./LoadingSpinner.module.css.

#### frontend/src/components/shared/LoadingSpinner/LoadingSpinner.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/ui/Button.jsx
- **Тип**: React-компонент.
- **Импорты**: import styles from "./Button.module.css";.
- **Экспорты**: export default function Button({.
- **Связи**: зависит от ./Button.module.css.

#### frontend/src/components/ui/Button.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/UserDashboard/ProfileModal/ProfileModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import styles from './ProfileModal.module.css';, import axiosInstance from '../../../api/axiosInstance';, import ErrorMessage from '../../shared/ErrorMessage/ErrorMessage';, import LoadingSpinner from '../../shared/LoadingSpinner/LoadingSpinner';.
- **Экспорты**: export default function ProfileModal({ user, isOpen, onClose, onUpdateSuccess }) {.
- **Связи**: зависит от react, ./ProfileModal.module.css, ../../../api/axiosInstance, ../../shared/ErrorMessage/ErrorMessage, ../../shared/LoadingSpinner/LoadingSpinner.

#### frontend/src/components/UserDashboard/ProfileModal/ProfileModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/UserDashboard/ReviewableAppointments/ReviewableAppointments.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import styles from './ReviewableAppointments.module.css';, import axiosInstance from '../../../api/axiosInstance';, import ReviewModal from '../ReviewModal/ReviewModal';, import { useToastContext } from '../../../context/ToastContext';.
- **Экспорты**: export default ReviewableAppointments;.
- **Связи**: зависит от react, ./ReviewableAppointments.module.css, ../../../api/axiosInstance, ../ReviewModal/ReviewModal, ../../../context/ToastContext.

#### frontend/src/components/UserDashboard/ReviewableAppointments/ReviewableAppointments.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/UserDashboard/ReviewModal/ReviewModal.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState } from 'react';, import styles from './ReviewModal.module.css';, import axiosInstance from '../../../api/axiosInstance';, import { useToastContext } from '../../../context/ToastContext';.
- **Экспорты**: export default ReviewModal;.
- **Связи**: зависит от react, ./ReviewModal.module.css, ../../../api/axiosInstance, ../../../context/ToastContext.

#### frontend/src/components/UserDashboard/ReviewModal/ReviewModal.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/components/UserDashboard/UserDashboard.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { useState, useEffect } from 'react';, import styles from './UserDashboard.module.css';, import axiosInstance from '../../api/axiosInstance';, import ProfileModal from './ProfileModal/ProfileModal';, import ReviewableAppointments from './ReviewableAppointments/ReviewableAppointments';.
- **Экспорты**: export default function UserDashboard({ user }) {.
- **Связи**: зависит от react, ./UserDashboard.module.css, ../../api/axiosInstance, ./ProfileModal/ProfileModal, ./ReviewableAppointments/ReviewableAppointments.

#### frontend/src/components/UserDashboard/UserDashboard.module.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/config/axios.js
- **Тип**: JavaScript-модуль.
- **Импорты**: import axios from 'axios';.
- **Экспорты**: export default axiosInstance;.
- **Связи**: зависит от axios.

#### frontend/src/context/ToastContext.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { createContext, useContext } from 'react';, import { useToast, ToastContainer } from '../components/common/Toast/Toast';.
- **Экспорты**: export const ToastProvider = ({ children }) => {, export const useToastContext = () => {.
- **Связи**: зависит от react, ../components/common/Toast/Toast.

#### frontend/src/context/UserContext.jsx
- **Тип**: React-компонент.
- **Импорты**: import React, { createContext } from 'react';.
- **Экспорты**: export const UserContext = createContext(null);, export const UserProvider = ({ children, value }) => {.
- **Связи**: зависит от react.

#### frontend/src/hooks/useErrorHandler.js
- **Тип**: JavaScript-модуль.
- **Импорты**: import { useState, useCallback } from 'react';.
- **Экспорты**: export default useErrorHandler;.
- **Связи**: зависит от react.

#### frontend/src/hooks/useImageUpload.js
- **Тип**: JavaScript-модуль.
- **Импорты**: import { useState, useCallback } from 'react';, import axiosInstance from '../api/axiosInstance';.
- **Экспорты**: export const useImageUpload = () => {, export default useImageUpload;.
- **Связи**: зависит от react, ../api/axiosInstance.

#### frontend/src/index.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/main.jsx
- **Тип**: React-компонент.
- **Импорты**: import React from 'react';, import ReactDOM from 'react-dom/client';, import { BrowserRouter } from 'react-router-dom';, import App from './App.jsx';, import { UserProvider } from './context/UserContext'; // Import UserProvider, import './index.css';.
- **Экспорты**: —.
- **Связи**: зависит от react, react-dom/client, react-router-dom, ./App.jsx, ./context/UserContext, внешних модулей.

#### frontend/src/styles/accessibility.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/styles/components.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/styles/dashboard.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/styles/design-system-variables.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/styles/index.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

#### frontend/src/styles/layout.css
- **Тип**: CSS/стили.
- **Импорты**: —.
- **Экспорты**: —.
- **Связи**: нет явных зависимостей.

