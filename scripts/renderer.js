// ==================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ====================
let currentChatId = null;
let chats = [];
let folders = [];
let availableModels = [];
let lastSuccessfulModel = null;
let userApiKey = null;
let userKeyInfo = null;
let balanceCheckInterval = null;
let isWaitingForResponse = false;
let currentAbortController = null;
let currentStreamingMessageId = null;
let lastNotificationTime = 0;
const NOTIFICATION_DEBOUNCE = 1000;
let userAvatar = { type: 'icon', value: 'fa-user' };
let userAvatarUrl = localStorage.getItem('userAvatarUrl') || '';
let userName = localStorage.getItem('userName') || 'Пользователь';
let sidebarCollapsed = false;
let currentEditingFolderId = null;
let currentView = 'chat';
let placeholderInterval = null;
let searchMode = localStorage.getItem('smartSearchEnabled') === 'true';
let currentLanguage = localStorage.getItem('appLanguage') || 'ru';

const APP_VERSION = '1.0.0';

const placeholderTexts = {
  ru: ["Какая сегодня погода?", "Как создать успешный проект?", "Расскажи новости за сегодня", "Кто такой Viktorshopa?"],
  en: ["What's the weather today?", "How to create a successful project?", "Tell me today's news", "Viktorshopa?"]
};
let placeholderIndex = 0;

const LOW_BALANCE_THRESHOLD = 1.0;
const CRITICAL_BALANCE_THRESHOLD = 0.1;
const BALANCE_CHECK_INTERVAL = 60000;
const REQUEST_TIMEOUT = 20000;

const PRIORITY_MODELS = [
    'perplexity/pplx-70b-online',
    'you/you-7b',
    'arcee-ai/pony-alpha-7b:free',
    'stepfun/step-3.5-flash:free'
];

const FOLDER_ICONS = [
    'fa-folder', 'fa-folder-open', 'fa-book', 'fa-graduation-cap', 'fa-code',
    'fa-music', 'fa-image', 'fa-video', 'fa-gamepad', 'fa-shopping-cart',
    'fa-heart', 'fa-star', 'fa-rocket', 'fa-brain', 'fa-chart-line',
    'fa-users', 'fa-calendar', 'fa-clock', 'fa-tag', 'fa-tasks'
];

// ==================== ЛОКАЛИЗАЦИЯ ====================
const translations = {
  ru: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    back: 'Назад',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    accept_close: 'Принять и закрыть',
    folder_create_title: 'Создать папку',
    folder_edit_title: 'Редактировать папку',
    folder_name: 'Название',
    folder_description: 'Описание',
    folder_icon: 'Иконка',
    folder_color: 'Цвет',
    custom_color: 'Свой цвет',
    create_folder_btn: 'Создать папку',
    back_to_chat: 'Назад к чату',
    color_picker_title: 'Выбор цвета',
    red: 'Красный',
    green: 'Зелёный',
    blue: 'Синий',
    hex: 'HEX',
    settings_title: 'Настройки',
    smart_search: 'Умный поиск',
    smart_search_desc: 'Искать в интернете при запросах с ключевыми словами (новости, погода, события, адреса, контакты)',
    language: 'Язык интерфейса',
    about: 'О программе',
    version: 'Версия',
    settings_saved: 'Настройки сохранены',
    smart_search_on: 'Умный поиск включён',
    smart_search_off: 'Умный поиск выключен',
    folder_created: 'Папка создана',
    folder_updated: 'Папка обновлена',
    folder_deleted: 'Папка удалена',
    chat_moved: 'Чат перемещён',
    folder_confirm_delete: 'Удалить папку? Чаты будут перемещены в корень.',
    chat_renamed: 'Чат переименован',
    chat_pinned: 'Чат закреплён',
    chat_unpinned: 'Чат откреплён',
    name_saved: 'Имя сохранено',
    avatar_updated: 'Аватар обновлён',
    search_no_results: 'Ничего не найдено',
    search_found: 'Найдено результатов',
    search_try_changing: 'Попробуйте изменить запрос',
    search_timeout: 'Таймаут поиска',
    search_error: 'Ошибка поиска',
    new_chat: 'Новый диалог',
    new_chat_desc: 'Напишите сообщение, чтобы начать',
    empty_history: 'Нет чатов',
    no_folders: 'У вас пока нет папок. Создайте первую!',
    select_folder: 'Выберите папку',
    without_folder: 'Без папки',
    no_suitable_folder: 'Нет нужной папки?',
    search_placeholder: 'Поиск в истории...',
    input_placeholder: 'Введите свой запрос...',
    input_footer: 'ИИ-Генерация, только для справки',
    thinking: 'Думает',
    cancel_generation: 'Отменить генерацию',
    copy: 'Копировать текст',
    regenerate: 'Перегенерировать ответ',
    ai_error: 'Извините, сейчас проблемы с подключением к нейросети. Попробуйте ещё раз через минуту или проверьте свой API-ключ.',
    today: 'Сегодня',
    yesterday: 'Вчера',
    older: 'Более 2-х дней назад',
    enter_key: 'Введите API-ключ',
    invalid_key: 'Недействительный ключ',
    login_success: 'Вход выполнен',
    login_error: 'Не удалось войти',
    logout: 'Выход',
    session_expired: 'Сессия истекла',
    balance_exhausted: 'Баланс исчерпан',
    critical_balance: 'Критический баланс',
    low_balance: 'Низкий баланс',
    coming_soon: 'В разработке',
    terms_title: 'Условия использования',
    privacy_title: 'Политика конфиденциальности',
    error: 'Ошибка',
    warning: 'Внимание',
    info: 'Информация',
    success: 'Успех',
    empty_help: 'Чем могу помочь?',
    remember_in_diamond: 'Запомниться в Diamond',
    auto_login_desc: 'Автоматический вход через OpenRouter',
    enter_own_key: 'Войти по своему ключу',
    use_own_key_desc: 'Использовать свой API-ключ',
    try_luck: 'Попытать удачу',
    try_luck_desc: 'Подобрать ключ автоматически',
    get_key: 'Получить ключ'
  },
  en: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    close: 'Close',
    confirm: 'Confirm',
    accept_close: 'Accept & Close',
    folder_create_title: 'Create Folder',
    folder_edit_title: 'Edit Folder',
    folder_name: 'Name',
    folder_description: 'Description',
    folder_icon: 'Icon',
    folder_color: 'Color',
    custom_color: 'Custom color',
    create_folder_btn: 'Create Folder',
    back_to_chat: 'Back to Chat',
    color_picker_title: 'Color Picker',
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    hex: 'HEX',
    settings_title: 'Settings',
    smart_search: 'Smart Search',
    smart_search_desc: 'Search the internet for queries with keywords (news, weather, events, addresses, contacts)',
    language: 'Interface Language',
    about: 'About',
    version: 'Version',
    settings_saved: 'Settings saved',
    smart_search_on: 'Smart search enabled',
    smart_search_off: 'Smart search disabled',
    folder_created: 'Folder created',
    folder_updated: 'Folder updated',
    folder_deleted: 'Folder deleted',
    chat_moved: 'Chat moved',
    folder_confirm_delete: 'Delete folder? Chats will be moved to root.',
    chat_renamed: 'Chat renamed',
    chat_pinned: 'Chat pinned',
    chat_unpinned: 'Chat unpinned',
    name_saved: 'Name saved',
    avatar_updated: 'Avatar updated',
    search_no_results: 'No results found',
    search_found: 'Results found',
    search_try_changing: 'Try changing your query',
    search_timeout: 'Search timeout',
    search_error: 'Search error',
    new_chat: 'New chat',
    new_chat_desc: 'Type a message to start',
    empty_history: 'No chats',
    no_folders: 'You have no folders yet. Create your first!',
    select_folder: 'Select folder',
    without_folder: 'Without folder',
    no_suitable_folder: 'No suitable folder?',
    search_placeholder: 'Search history...',
    input_placeholder: 'Enter your message...',
    input_footer: 'AI Generation, for reference only',
    thinking: 'Thinking',
    cancel_generation: 'Cancel generation',
    copy: 'Copy text',
    regenerate: 'Regenerate response',
    ai_error: 'Sorry, there is a problem connecting to the neural network. Please try again in a minute or check your API key.',
    today: 'Today',
    yesterday: 'Yesterday',
    older: 'More than 2 days ago',
    enter_key: 'Enter API key',
    invalid_key: 'Invalid key',
    login_success: 'Login successful',
    login_error: 'Login failed',
    logout: 'Logout',
    session_expired: 'Session expired',
    balance_exhausted: 'Balance exhausted',
    critical_balance: 'Critical balance',
    low_balance: 'Low balance',
    coming_soon: 'Coming soon',
    terms_title: 'Terms of Use',
    privacy_title: 'Privacy Policy',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    success: 'Success',
    empty_help: 'How can I help?',
    remember_in_diamond: 'Remember in Diamond',
    auto_login_desc: 'Automatic login via OpenRouter',
    enter_own_key: 'Enter your own key',
    use_own_key_desc: 'Use your own API key',
    try_luck: 'Try your luck',
    try_luck_desc: 'Auto‑fetch a working key',
    get_key: 'Get key'
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

// ==================== DOM ЭЛЕМЕНТЫ ====================
const welcomeScreen = document.getElementById('welcomeScreen');
const choiceScreen = document.getElementById('choiceScreen');
const mainUI = document.getElementById('mainUI');
const messagesContainer = document.getElementById('messages-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const newChatCollapsedBtn = document.getElementById('newChatCollapsedBtn');
const expandSidebarBtn = document.getElementById('expandSidebarBtn');
const foldersPageBtn = document.getElementById('folders-page-btn');
const foldersCollapsedBtn = document.getElementById('foldersCollapsedBtn');
const genhabPageBtn = document.getElementById('genhab-page-btn');
const genhabCollapsedBtn = document.getElementById('genhabCollapsedBtn');
const backToChatFromFolders = document.getElementById('back-to-chat-from-folders');
const createFolderPageBtn = document.getElementById('create-folder-page-btn');
const historyList = document.getElementById('history-list');
const historySearch = document.getElementById('history-search');
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const discordBtn = document.getElementById('discord-btn');
const loginBtn = document.getElementById('login-btn');
const avatarBtn = document.getElementById('avatar-btn');
const avatarModal = document.getElementById('avatar-modal');
const closeAvatarModal = document.getElementById('close-avatar-modal');
const avatarIcons = document.querySelectorAll('.avatar-icon');
const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
const resetAvatarBtn = document.getElementById('reset-avatar-btn');
const toastContainer = document.getElementById('toast-container');
const logoImage = document.getElementById('logoImage');
const actionButtonsGroup = document.getElementById('actionButtonsGroup');
const inputArea = document.getElementById('inputArea');
const chatView = document.getElementById('chatView');
const foldersPage = document.getElementById('foldersPage');
const genhabPage = document.getElementById('genhabPage');
const foldersListContainer = document.getElementById('foldersListContainer');
const folderEditModal = document.getElementById('folder-edit-modal');
const closeFolderEditModal = document.getElementById('close-folder-edit-modal');
const folderNameInput = document.getElementById('folder-name');
const folderDescriptionInput = document.getElementById('folder-description');
const iconSelector = document.getElementById('icon-selector');
const colorSelector = document.getElementById('color-selector');
const saveFolderBtn = document.getElementById('save-folder-btn');
const cancelFolderEditBtn = document.getElementById('cancel-folder-edit-btn');
const folderEditTitle = document.getElementById('folder-edit-title');
const folderChatsModal = document.getElementById('folder-chats-modal');
const closeFolderChatsModal = document.getElementById('close-folder-chats-modal');
const folderChatsList = document.getElementById('folder-chats-list');
const folderChatsTitle = document.getElementById('folder-chats-title');
const userPanel = document.getElementById('userPanel');
const userAvatarImg = document.getElementById('userAvatarImg');
const userNameDisplay = document.getElementById('userNameDisplay');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const renameUserModal = document.getElementById('rename-user-modal');
const closeRenameUserModal = document.getElementById('close-rename-user-modal');
const renameUserInput = document.getElementById('rename-user-input');
const renameUserConfirm = document.getElementById('rename-user-confirm');
const renameUserCancel = document.getElementById('rename-user-cancel');
const termsModal = document.getElementById('terms-modal');
const privacyModal = document.getElementById('privacy-modal');
const closeTermsModal = document.getElementById('close-terms-modal');
const closePrivacyModal = document.getElementById('close-privacy-modal');
const closeTermsBtn = document.getElementById('close-terms-btn');
const closePrivacyBtn = document.getElementById('close-privacy-btn');

const optionOwnKey = document.getElementById('optionOwnKey');
const optionBuiltIn = document.getElementById('optionBuiltIn');
const apiInputSection = document.getElementById('apiInputSection');
const backToOptionsBtn = document.getElementById('backToOptionsBtn');
const submitApiKeyBtn = document.getElementById('submitApiKeyBtn');
const apiKeyInput = document.getElementById('apiKeyInput');

const loadingStatus = document.getElementById('loadingStatus');
const loadingBar = document.getElementById('loadingBar');
const loadingCharacter = document.getElementById('loadingCharacter');

// ==================== МОДАЛКИ (создаём динамически) ====================
const settingsModal = document.createElement('div');
settingsModal.id = 'settings-modal';
settingsModal.className = 'settings-modal';
settingsModal.style.display = 'none';
document.body.appendChild(settingsModal);
const settingsContent = document.createElement('div');
settingsContent.className = 'settings-modal-content';
settingsModal.appendChild(settingsContent);

const colorPickerModal = document.createElement('div');
colorPickerModal.id = 'color-picker-modal';
colorPickerModal.className = 'color-picker-modal';
colorPickerModal.style.display = 'none';
document.body.appendChild(colorPickerModal);
const colorPickerContent = document.createElement('div');
colorPickerContent.className = 'color-picker-content';
colorPickerModal.appendChild(colorPickerContent);

let currentCustomColor = '#95a5a6';
let pendingColorCallback = null;

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
const log = (message, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
};

function showToast(title, message, type = 'info', duration = 3000) {
    const now = Date.now();
    if (now - lastNotificationTime < NOTIFICATION_DEBOUNCE) return;
    lastNotificationTime = now;
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    toastContainer.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => toast.remove(), duration);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== ЗАГРУЗОЧНЫЙ ЭКРАН ====================
const loadingStatuses = {
  ru: ["Загрузка нейросети...", "Активация кристаллов...", "Калибровка ответов...", "Запуск нейросети.."],
  en: ["Loading neural network...", "Activating crystals...", "Calibrating responses...", "Starting AI..."]
};

async function showLoadingScreen() {
    log('🎬 Запуск загрузочного экрана');
    welcomeScreen.style.display = 'flex';
    welcomeScreen.classList.remove('fade-out');
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
        statusIndex = (statusIndex + 1) % loadingStatuses[currentLanguage].length;
        if (loadingStatus) {
            loadingStatus.style.opacity = '0';
            setTimeout(() => {
                loadingStatus.textContent = loadingStatuses[currentLanguage][statusIndex];
                loadingStatus.style.opacity = '1';
            }, 200);
        }
    }, 1500);
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 1;
        if (loadingBar) loadingBar.style.width = progress + '%';
        if (progress >= 100) clearInterval(progressInterval);
    }, 70);
    setTimeout(() => {
        if (loadingCharacter) loadingCharacter.classList.add('visible');
    }, 3000);
    await new Promise(resolve => setTimeout(resolve, 7000));
    clearInterval(statusInterval);
    clearInterval(progressInterval);
    welcomeScreen.classList.add('fade-out');
    await new Promise(resolve => setTimeout(resolve, 800));
}

// ==================== ПОИСК ====================
async function searchDuckDuckGo(query) {
    try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const results = [];
        if (data.AbstractText) {
            results.push({
                title: data.Heading || (currentLanguage === 'ru' ? 'Результат' : 'Result'),
                snippet: data.AbstractText,
                link: data.AbstractURL || ''
            });
        }
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
            for (const topic of data.RelatedTopics) {
                if (topic.Text && topic.Text !== data.AbstractText) {
                    results.push({
                        title: topic.Text.split(' - ')[0] || (currentLanguage === 'ru' ? 'Похожий результат' : 'Related result'),
                        snippet: topic.Text,
                        link: topic.FirstURL || ''
                    });
                }
                if (results.length >= 5) break;
            }
        }
        return results;
    } catch (err) {
        console.error('DuckDuckGo API error:', err);
        return [];
    }
}

async function searchWikipedia(query) {
    try {
        let lang = currentLanguage === 'ru' ? 'ru' : 'en';
        let url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        let response = await fetch(url);
        if (!response.ok && lang === 'ru') {
            lang = 'en';
            url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
            response = await fetch(url);
        }
        if (!response.ok) return null;
        const data = await response.json();
        if (data.title && data.extract) {
            return {
                title: data.title,
                snippet: data.extract,
                link: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.title.replace(/ /g, '_'))}`
            };
        }
        return null;
    } catch (err) {
        console.error('Wikipedia API error:', err);
        return null;
    }
}

// ==================== АВАТАРЫ ====================
function getBotAvatarHTML() {
    // Локальный botsp.png, если нет – fallback на Discord
    const localUrl = '/images/botsp.png';
    const fallbackUrl = 'https://media.discordapp.net/attachments/1457843805687648522/1487509990226002111/image.png?ex=69c96722&is=69c815a2&hm=0032d351e992ab5f2828f8dd39514143b63a563a6d8f84d6a96eccd22e404047&=&format=webp&quality=lossless&width=836&height=836';
    const containerId = 'bot-avatar-' + Math.random().toString(36).substring(2);
    const html = `<div id="${containerId}" style="width:100%; height:100%; border-radius:50%; background:#3a3a3a; display:flex; align-items:center; justify-content:center;"></div>`;
    setTimeout(() => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const img = new Image();
        img.onload = () => {
            container.innerHTML = `<img src="${localUrl}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        img.onerror = () => {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
                container.innerHTML = `<img src="${fallbackUrl}" style="width:100%; height:100%; object-fit:cover;">`;
            };
            fallbackImg.onerror = () => {
                container.style.background = '#3a3a3a';
                container.innerHTML = '<i class="fas fa-gem"></i>';
            };
            fallbackImg.src = fallbackUrl;
        };
        img.src = localUrl;
    }, 0);
    return html;
}

function getUserAvatarHTML() {
    if (userAvatarUrl) {
        return `<img src="${userAvatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    } else if (userAvatar.type === 'icon') {
        return `<i class="fas ${userAvatar.value}"></i>`;
    } else if (userAvatar.type === 'custom' && userAvatar.dataUrl) {
        return `<img src="${userAvatar.dataUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }
    return '<i class="fas fa-user"></i>';
}

function updateUserPanel() {
    if (userNameDisplay) userNameDisplay.textContent = userName;
    const avatarContainer = document.querySelector('.user-avatar');
    if (!avatarContainer) return;
    avatarContainer.innerHTML = '';
    if (userAvatarUrl) {
        const img = document.createElement('img');
        img.src = userAvatarUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        avatarContainer.appendChild(img);
    } else {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'avatar-icon-fallback';
        iconSpan.innerHTML = `<i class="fas ${userAvatar.value}"></i>`;
        iconSpan.style.cssText = 'width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:20px;';
        avatarContainer.appendChild(iconSpan);
    }
}

function setUserName(name) {
    userName = name;
    localStorage.setItem('userName', userName);
    updateUserPanel();
    showToast(t('settings_saved'), t('name_saved'), 'success');
}

function setUserAvatarUrl(url) {
    userAvatarUrl = url;
    localStorage.setItem('userAvatarUrl', url);
    updateUserPanel();
    renderChat();
    showToast(t('settings_saved'), t('avatar_updated'), 'success');
}

function showRenameUserModal() {
    renameUserInput.value = userName;
    renameUserModal.style.display = 'flex';
    renameUserInput.focus();
}

// ==================== БАЛАНС ====================
async function checkKeyBalance(apiKey) {
    log('Проверка баланса...');
    try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) {
            log(`Ошибка API баланса: ${response.status}`, 'ERROR');
            return false;
        }
        const data = await response.json();
        userKeyInfo = data;
        if (data.limit !== undefined && data.usage !== undefined) {
            const remaining = data.limit - data.usage;
            log(`Баланс: использовано $${data.usage}, осталось $${remaining.toFixed(2)}`);
            if (remaining <= 0) {
                showToast(t('error'), t('balance_exhausted'), 'error');
                return false;
            } else if (remaining < 0.1) {
                showToast(t('warning'), t('critical_balance'), 'error');
            } else if (remaining < 1.0) {
                showToast(t('warning'), t('low_balance'), 'warning');
            }
        } else {
            log('Бесплатный ключ без лимита');
        }
        return true;
    } catch (error) {
        log(`Ошибка проверки баланса: ${error.message}`, 'ERROR');
        return false;
    }
}

function startBalanceMonitoring() {
    if (balanceCheckInterval) clearInterval(balanceCheckInterval);
    balanceCheckInterval = setInterval(async () => {
        if (!userApiKey) return;
        const isValid = await checkKeyBalance(userApiKey);
        if (!isValid) {
            clearInterval(balanceCheckInterval);
            userApiKey = null;
            userKeyInfo = null;
            localStorage.removeItem('userApiKey');
            updateLoginButtonState(false);
            showToast(t('warning'), t('session_expired'), 'warning');
            mainUI.style.display = 'none';
            choiceScreen.style.display = 'flex';
        }
    }, BALANCE_CHECK_INTERVAL);
}

function updateLoginButtonState(isLoggedIn) {
    if (!loginBtn) return;
    if (isLoggedIn) {
        loginBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
        loginBtn.title = 'Вы вошли';
        loginBtn.classList.add('logged-in');
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        const updatedLoginBtn = document.getElementById('login-btn');
        if (updatedLoginBtn) {
            updatedLoginBtn.addEventListener('mouseenter', () => {
                if (userKeyInfo) {
                    if (userKeyInfo.limit !== undefined && userKeyInfo.usage !== undefined) {
                        const remaining = userKeyInfo.limit - userKeyInfo.usage;
                        updatedLoginBtn.title = `Баланс: $${remaining.toFixed(2)}`;
                    } else updatedLoginBtn.title = 'Бесплатный ключ';
                }
            });
        }
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
        loginBtn.title = 'Войти';
        loginBtn.classList.remove('logged-in');
    }
}
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        if (userApiKey) {
            const action = confirm(t('logout') + '? OK - ' + t('confirm') + ', Cancel - ' + t('balance'));
            if (action) {
                clearInterval(balanceCheckInterval);
                userApiKey = null;
                userKeyInfo = null;
                localStorage.removeItem('userApiKey');
                updateLoginButtonState(false);
                showToast(t('info'), t('logout'), 'info');
                mainUI.style.display = 'none';
                choiceScreen.style.display = 'flex';
            } else await checkKeyBalance(userApiKey);
        } else {
            mainUI.style.display = 'none';
            choiceScreen.style.display = 'flex';
        }
    });
}

// ==================== МОДЕЛИ ====================
async function loadAvailableModels() {
    if (!userApiKey) { availableModels = []; return; }
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${userApiKey}` }
        });
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        availableModels = data.data.map(model => model.id);
        log(`Загружено ${availableModels.length} моделей`);
    } catch (error) {
        log(`Ошибка загрузки моделей: ${error.message}`, 'ERROR');
        availableModels = [];
    }
}

// ==================== ЧАТЫ ====================
function saveChats() {
    localStorage.setItem('diamondChats', JSON.stringify(chats));
    renderHistory();
}
function generateChatTitle(userMessage) {
    if (!userMessage) return 'Новый диалог';
    let title = userMessage.trim();
    if (title.length > 50) {
        let truncated = title.substring(0, 50);
        let lastSpace = truncated.lastIndexOf(' ');
        title = lastSpace > 30 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }
    return title;
}
function createNewChat() {
    renderEmptyState();
    currentChatId = null;
    showToast(t('new_chat'), t('new_chat_desc'), 'info');
}
function deleteChat(chatId) {
    chats = chats.filter(chat => chat.id !== chatId);
    if (chats.length === 0) {
        renderEmptyState();
        currentChatId = null;
    } else {
        if (currentChatId === chatId) currentChatId = chats[0].id;
        saveChats();
        renderChat();
        renderHistory();
        renderFoldersPage();
    }
}
function switchChat(chatId) {
    currentChatId = chatId;
    if (currentView === 'folders') switchToChatView();
    else { renderChat(); renderHistory(); }
}
function togglePin(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        chat.pinned = !chat.pinned;
        saveChats();
        renderHistory();
        showToast(chat.pinned ? t('chat_pinned') : t('chat_unpinned'), '', 'success');
    }
}
function renameChat(chatId, newTitle) {
    const chat = chats.find(c => c.id === chatId);
    if (chat && newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        saveChats();
        renderHistory();
        showToast(t('chat_renamed'), newTitle, 'success');
    }
}
function showRenameModal(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const modal = document.createElement('div');
    modal.className = 'rename-modal';
    modal.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2600;`;
    const content = document.createElement('div');
    content.style.cssText = `background: var(--bg-secondary); border-radius: var(--radius-xl); padding: 24px; width: 90%; max-width: 400px; border: 1px solid var(--border-color);`;
    content.innerHTML = `
        <h3 style="margin-bottom: 16px;">${t('edit')}</h3>
        <input type="text" id="rename-input" value="${escapeHtml(chat.title)}" style="width:100%; padding:10px; background: var(--bg-tertiary); border:1px solid var(--border-color); border-radius: var(--radius-lg); color: var(--text-primary); margin-bottom: 20px;">
        <div style="display: flex; gap: 12px;">
            <button id="rename-confirm" class="btn-primary"><i class="fas fa-save"></i> ${t('save')}</button>
            <button id="rename-cancel" class="btn-secondary"><i class="fas fa-times"></i> ${t('cancel')}</button>
        </div>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
    const input = content.querySelector('#rename-input');
    input.focus();
    const close = () => modal.remove();
    content.querySelector('#rename-confirm').addEventListener('click', () => {
        const newName = input.value.trim();
        if (newName) renameChat(chatId, newName);
        close();
    });
    content.querySelector('#rename-cancel').addEventListener('click', close);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const newName = input.value.trim();
            if (newName) renameChat(chatId, newName);
            close();
        }
    });
}

// ==================== ФОРМАТИРОВАНИЕ ДАТ ====================
function getDateGroup(timestamp) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) return t('today');
    if (date.getTime() === yesterday.getTime()) return t('yesterday');
    return t('older');
}

function formatDateHeader(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t('today');
    else if (date.toDateString() === yesterday.toDateString()) return t('yesterday');
    else return date.toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

// ==================== ОСНОВНОЙ РЕНДЕР ЧАТА ====================
function renderChat() {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) { 
        renderEmptyState();
        return;
    }
    if (!chat.messages || chat.messages.length === 0) {
        renderEmptyState();
        return;
    }
    if (inputArea) inputArea.style.display = 'flex';
    messagesContainer.innerHTML = '';
    let lastDate = null;
    chat.messages.forEach((msg, index) => {
        const msgDate = new Date(msg.timestamp || chat.createdAt + index * 1000).toDateString();
        if (msgDate !== lastDate) {
            const divider = document.createElement('div');
            divider.className = 'date-divider';
            divider.innerHTML = `<span>${formatDateHeader(msg.timestamp || chat.createdAt)}</span>`;
            messagesContainer.appendChild(divider);
            lastDate = msgDate;
        }
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role}`;
        if (msg.id === currentStreamingMessageId) messageDiv.classList.add('streaming');
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = msg.role === 'user' ? getUserAvatarHTML() : getBotAvatarHTML();
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content-wrapper';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        if (msg.role === 'assistant' && typeof marked !== 'undefined') {
            contentDiv.innerHTML = marked.parse(msg.content);
        } else contentDiv.textContent = msg.content;
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = formatTime(msg.timestamp || Date.now());
        contentWrapper.appendChild(contentDiv);
        contentWrapper.appendChild(timeDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentWrapper);
        if (msg.role === 'assistant' && msg.id !== currentStreamingMessageId) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = t('copy');
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(msg.content);
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i>', 1000);
            };
            const regenerateBtn = document.createElement('button');
            regenerateBtn.className = 'action-btn';
            regenerateBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            regenerateBtn.title = t('regenerate');
            regenerateBtn.onclick = (e) => { e.stopPropagation(); regenerateResponse(msg); };
            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(regenerateBtn);
            messageDiv.appendChild(actionsDiv);
        }
        messagesContainer.appendChild(messageDiv);
    });
    scrollToBottom();
}

function addMessageToDOM(role, content, save = true) {
    const timestamp = Date.now();
    const messageId = Date.now().toString() + Math.random();
    if (save) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            if (!chat.messages) chat.messages = [];
            chat.messages.push({ id: messageId, role, content, timestamp });
            chat.lastActivity = timestamp;
            if (role === 'user' && chat.messages.filter(m => m.role === 'user').length === 1) {
                chat.title = generateChatTitle(content);
            }
            saveChats();
            chats.sort((a, b) => b.lastActivity - a.lastActivity);
        }
    }
    if (role === 'assistant' && save) currentStreamingMessageId = messageId;
    renderChat();
    return messageId;
}

async function regenerateResponse(oldMsg) {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    const index = chat.messages.findIndex(m => m === oldMsg);
    if (index !== -1) {
        chat.messages.splice(index, 1);
        saveChats();
        renderChat();
    }
    const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
        userInput.value = lastUserMsg.content;
        sendMessage();
    }
}

function createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message assistant typing';
    const startTime = Date.now();
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.style.display = 'flex';
    contentDiv.style.alignItems = 'center';
    contentDiv.style.gap = '8px';
    const textSpan = document.createElement('span'); textSpan.textContent = t('thinking');
    const counterSpan = document.createElement('span');
    counterSpan.className = 'thinking-counter';
    counterSpan.textContent = '[0с]';
    counterSpan.style.color = '#888';
    counterSpan.style.fontSize = '12px';
    const dotsSpan = document.createElement('span');
    dotsSpan.className = 'dots';
    dotsSpan.style.minWidth = '24px';
    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(counterSpan);
    contentDiv.appendChild(dotsSpan);
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-generation';
    cancelBtn.style.background = 'transparent';
    cancelBtn.style.border = 'none';
    cancelBtn.style.color = '#aaa';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.marginLeft = 'auto';
    cancelBtn.title = t('cancel_generation');
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    const wrapper = document.createElement('div');
    wrapper.className = 'message-content-wrapper';
    wrapper.appendChild(contentDiv);
    div.innerHTML = `<div class="avatar">${getBotAvatarHTML()}</div>`;
    div.appendChild(wrapper);
    div.querySelector('.message-content-wrapper').appendChild(cancelBtn);
    const interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        counterSpan.textContent = `[${seconds}с]`;
    }, 200);
    let dotCount = 0;
    const dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        dotsSpan.textContent = '.'.repeat(dotCount) + ' '.repeat(3 - dotCount);
    }, 200);
    cancelBtn.addEventListener('click', () => {
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
            div.remove();
            isWaitingForResponse = false;
            updateSendButtonState();
            currentStreamingMessageId = null;
            renderChat();
        }
        clearInterval(interval);
        clearInterval(dotsInterval);
    });
    div.cleanup = () => { clearInterval(interval); clearInterval(dotsInterval); };
    return div;
}

function preprocessQuery(text) {
    let processed = text.trim();
    processed = processed.replace(/\bNAOH\b/gi, 'NaOH');
    processed = processed.replace(/\bNaOh\b/g, 'NaOH');
    processed = processed.replace(/\bCH3COOH\b/g, 'CH3COOH');
    processed = processed.replace(/\bH2SO4\b/g, 'H2SO4');
    return processed;
}

async function sendMessage(fromEmpty = false) {
    log('sendMessage вызван');
    if (!userApiKey) {
        showToast(t('warning'), t('enter_key'), 'warning');
        return;
    }
    if (isWaitingForResponse) {
        showToast(t('warning'), t('thinking'), 'warning');
        return;
    }
    const isValid = await checkKeyBalance(userApiKey);
    if (!isValid) { await logout(); return; }

    const rawText = userInput.value.trim();
    if (!rawText) return;
    const text = preprocessQuery(rawText);

    let searchContext = '';
    if (searchMode) {
        const needSearch = /новости|сегодня|погода|актуальн|неделю|вчера|сейчас|последние события|кто такой|что произошло|адрес|телефон|где находится|как пройти|контакты|сайт|официальный|расписание|режим работы|стоимость|цена|отзывы|оценка|рейтинг|news|today|weather|latest|who is|what happened|address|phone|where is|how to get|contacts|site|official|schedule|working hours|price|cost|reviews|rating/i.test(rawText);
        if (needSearch) {
            let searchResults = await searchDuckDuckGo(rawText);
            let searchSource = 'DuckDuckGo';
            if (searchResults.length) {
                searchContext = `\n\n[Информация из ${searchSource}]\n` + 
                    searchResults.map(r => `• ${r.title}: ${r.snippet}`).join('\n');
                showToast('🔍 ' + t('search_found'), `${searchResults.length} ${t('search_found')} (${searchSource})`, 'info', 2000);
            } else {
                showToast('🔍 ' + t('search_no_results'), t('search_try_changing'), 'warning', 2000);
            }
        }
    }

    let chat = chats.find(c => c.id === currentChatId);
    if (!chat || chat.messages.length === 0) {
        const now = Date.now();
        const newChat = {
            id: now.toString(),
            title: generateChatTitle(text),
            messages: [],
            createdAt: now,
            lastActivity: now,
            pinned: false,
            folderId: null
        };
        chats.unshift(newChat);
        currentChatId = newChat.id;
        chat = newChat;
        saveChats();
        renderHistory();
        if (inputArea) inputArea.style.display = 'flex';
    }

    isWaitingForResponse = true;
    updateSendButtonState();
    addMessageToDOM('user', rawText, true);
    userInput.value = '';
    userInput.style.height = 'auto';

    const typingDiv = createTypingIndicator();
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    const contextMessages = chat.messages.slice(-15).map(m => ({ role: m.role, content: m.content }));
    const finalUserMessage = text + (searchContext ? `\n\nИспользуй эту информацию, если она релевантна. Если в ней нет точного ответа — честно скажи, что не знаешь.\n${searchContext}` : '');
    const messages = [
        SYSTEM_PROMPT,
        ...contextMessages,
        { role: 'user', content: finalUserMessage }
    ];

    let modelsToTry = [...PRIORITY_MODELS];
    if (lastSuccessfulModel && PRIORITY_MODELS.includes(lastSuccessfulModel)) {
        modelsToTry = [lastSuccessfulModel, ...PRIORITY_MODELS.filter(m => m !== lastSuccessfulModel)];
    }

    if (availableModels.length === 0 && userApiKey) {
        await loadAvailableModels();
    }

    const otherModels = availableModels.filter(m => !PRIORITY_MODELS.includes(m));
    modelsToTry.push(...otherModels);

    currentAbortController = new AbortController();
    const timeoutId = setTimeout(() => currentAbortController.abort(), REQUEST_TIMEOUT);

    let success = false;
    for (const model of modelsToTry) {
        if (success) break;
        try {
            log(`Попытка модели: ${model}`);
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'DIAMOND AI'
                },
                body: JSON.stringify({ 
                    model, 
                    messages, 
                    stream: false,
                    temperature: 0.5,
                    max_tokens: 8000
                }),
                signal: currentAbortController.signal
            });

            if (!response.ok) {
                if (response.status === 402) {
                    showToast(t('error'), t('balance_exhausted'), 'error');
                    await logout();
                    typingDiv.remove(); typingDiv.cleanup();
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            let assistantMessage = data.choices[0]?.message?.content || '';
            const finishReason = data.choices[0]?.finish_reason;

            if (!assistantMessage) {
                log(`Пустой ответ от модели ${model}`, 'WARN');
                continue;
            }

            if (finishReason === 'length') {
                assistantMessage += '\n\n*[Ответ был прерван из-за ограничения длины. Хотите, я продолжу?]*';
            }

            typingDiv.remove(); typingDiv.cleanup();
            addMessageToDOM('assistant', assistantMessage, true);
            lastSuccessfulModel = model;
            success = true;
            currentStreamingMessageId = null;
            renderChat();
            await checkKeyBalance(userApiKey);
            console.log(`✅ Ответ получен от модели: ${model}`);
            break;

        } catch (error) {
            if (error.name === 'AbortError') {
                log('Таймаут', 'WARN');
                showToast(t('warning'), t('search_timeout'), 'warning');
            } else {
                log(`Модель ${model} не сработала: ${error.message}`, 'WARN');
            }
        }
    }

    clearTimeout(timeoutId);
    if (!success) {
        typingDiv.remove(); typingDiv.cleanup();
        addMessageToDOM('assistant', t('ai_error'), true);
        currentStreamingMessageId = null;
        renderChat();
    }

    isWaitingForResponse = false;
    updateSendButtonState();
    currentAbortController = null;
    currentStreamingMessageId = null;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
function updateSendButtonState() {
    sendBtn.disabled = !userInput.value.trim() || isWaitingForResponse;
}

// ==================== ИСТОРИЯ ====================
function renderHistory() {
    if (!historyList || !historySearch) return;
    const searchTerm = historySearch.value.toLowerCase();
    let filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm) ||
        (chat.messages && chat.messages.some(m => m.role === 'user' && m.content.toLowerCase().includes(searchTerm)))
    );
    const groups = {
        [t('today')]: [],
        [t('yesterday')]: [],
        [t('older')]: []
    };
    filteredChats.forEach(chat => {
        const group = getDateGroup(chat.lastActivity);
        groups[group].push(chat);
    });
    for (const group in groups) {
        groups[group].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.lastActivity - a.lastActivity;
        });
    }
    
    let html = '';
    for (const [groupName, chatsInGroup] of Object.entries(groups)) {
        if (chatsInGroup.length === 0) continue;
        html += `<div class="history-group"><div class="history-group-title">${groupName}</div>`;
        chatsInGroup.forEach(chat => {
            const isActive = chat.id === currentChatId ? 'active' : '';
            html += `
                <div class="history-item ${isActive}" data-id="${chat.id}">
                    <span class="chat-title">${escapeHtml(chat.title)}</span>
                    <div class="chat-actions-hover">
                        <button class="chat-action-btn rename-chat-hover" data-id="${chat.id}" title="${t('edit')}"><i class="fas fa-pencil-alt"></i></button>
                        <button class="chat-action-btn pin-chat-hover" data-id="${chat.id}" title="${chat.pinned ? t('chat_unpinned') : t('chat_pinned')}"><i class="fas fa-thumbtack ${chat.pinned ? 'pinned' : ''}"></i></button>
                        <button class="chat-action-btn move-to-folder-hover" data-id="${chat.id}" title="${t('chat_moved')}"><i class="fas fa-folder-open"></i></button>
                        <button class="chat-action-btn delete-chat-hover" data-id="${chat.id}" title="${t('delete')}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }
    historyList.innerHTML = html || '<div style="text-align:center; padding:20px;">'+t('empty_history')+'</div>';
    
    document.querySelectorAll('.history-item').forEach(el => {
        const chatId = el.dataset.id;
        el.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-actions-hover')) switchChat(chatId);
        });
    });
    document.querySelectorAll('.rename-chat-hover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            showRenameModal(chatId);
        });
    });
    document.querySelectorAll('.pin-chat-hover').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); togglePin(btn.dataset.id); });
    });
    document.querySelectorAll('.delete-chat-hover').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); deleteChat(btn.dataset.id); });
    });
    document.querySelectorAll('.move-to-folder-hover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            showFolderSelectModal(chatId);
        });
    });
}

function showFolderSelectModal(chatId) {
    const modal = document.createElement('div');
    modal.className = 'folder-modal-temp';
    modal.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2500;`;
    const content = document.createElement('div');
    content.style.cssText = `background: var(--bg-secondary); border-radius: var(--radius-xl); padding: 20px; min-width: 300px; max-width: 420px; border: 1px solid var(--border-color);`;
    content.innerHTML = `
        <h3 style="margin-bottom: 16px;">${t('select_folder')}</h3>
        <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            <div class="folder-option" data-id="" style="display:flex; align-items:center; gap:12px; padding:12px; background: var(--bg-tertiary); border-radius: var(--radius-lg); cursor:pointer; transition: var(--transition);"><i class="fas fa-times-circle"></i> ${t('without_folder')}</div>
            ${folders.map(f => `<div class="folder-option" data-id="${f.id}" style="display:flex; align-items:center; gap:12px; padding:12px; background: var(--bg-tertiary); border-radius: var(--radius-lg); cursor:pointer; transition: var(--transition);"><i class="fas ${f.icon}" style="color:${f.color}; width:20px;"></i> ${escapeHtml(f.name)}</div>`).join('')}
        </div>
        <button id="create-folder-from-select" class="create-folder-from-select"><i class="fas fa-plus"></i> ${t('no_suitable_folder')}</button>
        <button id="close-folder-select" class="close-folder-select"><i class="fas fa-times"></i> ${t('cancel')}</button>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
    const closeModal = () => modal.remove();
    content.querySelector('#close-folder-select').addEventListener('click', closeModal);
    content.querySelector('#create-folder-from-select').addEventListener('click', () => {
        closeModal();
        switchToFoldersView();
    });
    content.querySelectorAll('.folder-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const folderId = opt.dataset.id === '' ? null : opt.dataset.id;
            moveChatToFolder(chatId, folderId);
            closeModal();
        });
    });
}

// ==================== ПАПКИ ====================
function loadFolders() {
    const stored = localStorage.getItem('diamondFolders');
    if (stored) {
        try { folders = JSON.parse(stored); } catch(e) { folders = []; }
    }
}
function saveFolders() {
    localStorage.setItem('diamondFolders', JSON.stringify(folders));
}
function createFolder(name, description, icon, color) {
    const newFolder = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description || '',
        icon: icon || 'fa-folder',
        color: color || '#95a5a6',
        createdAt: Date.now()
    };
    folders.push(newFolder);
    saveFolders();
    renderFoldersPage();
    showToast(t('folder_created'), `"${name}"`, 'success');
}
function updateFolder(id, name, description, icon, color) {
    const folder = folders.find(f => f.id === id);
    if (folder) {
        folder.name = name.trim();
        folder.description = description || '';
        folder.icon = icon || 'fa-folder';
        folder.color = color || '#95a5a6';
        saveFolders();
        renderFoldersPage();
        showToast(t('folder_updated'), `"${folder.name}"`, 'success');
    }
}
function deleteFolder(id) {
    const folder = folders.find(f => f.id === id);
    if (folder) {
        chats.forEach(chat => { if (chat.folderId === id) chat.folderId = null; });
        folders = folders.filter(f => f.id !== id);
        saveFolders();
        saveChats();
        renderFoldersPage();
        renderHistory();
        showToast(t('folder_deleted'), `"${folder.name}"`, 'info');
    }
}
function getFolderById(id) { return folders.find(f => f.id === id); }
function getChatsInFolder(folderId) { return chats.filter(chat => chat.folderId === folderId); }
function moveChatToFolder(chatId, folderId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        chat.folderId = folderId;
        saveChats();
        renderHistory();
        renderFoldersPage();
        showToast(t('chat_moved'), folderId ? t('folder_created') : t('cancel'), 'success');
    }
}
function renderFoldersPage() {
    if (!foldersListContainer) return;
    if (folders.length === 0) {
        foldersListContainer.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-secondary);">${t('no_folders')}</div>`;
        return;
    }
    foldersListContainer.innerHTML = folders.map(folder => {
        const chatCount = getChatsInFolder(folder.id).length;
        return `
            <div class="folder-card" data-folder-id="${folder.id}">
                <div class="folder-icon" style="background:${folder.color}20; color:${folder.color}">
                    <i class="fas ${folder.icon}"></i>
                </div>
                <div class="folder-info">
                    <div class="folder-name"><span style="color:${folder.color}">${escapeHtml(folder.name)}</span></div>
                    <div class="folder-description">${escapeHtml(folder.description) || t('folder_description')}</div>
                    <div class="folder-stats">${chatCount} ${chatCount === 1 ? 'чат' : 'чатов'}</div>
                </div>
                <div class="folder-actions">
                    <button class="view-folder-chats" data-id="${folder.id}" title="${t('edit')}"><i class="fas fa-comments"></i></button>
                    <button class="edit-folder" data-id="${folder.id}" title="${t('edit')}"><i class="fas fa-edit"></i></button>
                    <button class="delete-folder" data-id="${folder.id}" title="${t('delete')}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
    document.querySelectorAll('.view-folder-chats').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderId = btn.dataset.id;
            const folder = getFolderById(folderId);
            if (folder) {
                const chatsInFolder = getChatsInFolder(folderId);
                folderChatsTitle.textContent = `Чаты в папке «${folder.name}»`;
                folderChatsList.innerHTML = chatsInFolder.length === 0 ? 
                    '<div style="text-align:center; padding:20px;">' + t('empty_history') + '</div>' :
                    chatsInFolder.map(chat => `<div class="folder-chat-item" data-chat-id="${chat.id}"><i class="fas fa-comment"></i> ${escapeHtml(chat.title)}</div>`).join('');
                folderChatsModal.style.display = 'flex';
                document.querySelectorAll('.folder-chat-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const chatId = item.dataset.chatId;
                        switchChat(chatId);
                        folderChatsModal.style.display = 'none';
                        if (currentView === 'folders') switchToChatView();
                    });
                });
            }
        });
    });
    document.querySelectorAll('.edit-folder').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderId = btn.dataset.id;
            const folder = getFolderById(folderId);
            if (folder) {
                currentEditingFolderId = folderId;
                rebuildFolderModal();
                folderEditModal.style.display = 'flex';
            }
        });
    });
    document.querySelectorAll('.delete-folder').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderId = btn.dataset.id;
            if (confirm(t('folder_confirm_delete'))) deleteFolder(folderId);
        });
    });
    if (createFolderPageBtn) createFolderPageBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('create_folder_btn')}`;
    if (backToChatFromFolders) backToChatFromFolders.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('back_to_chat')}`;
}

// ==================== ПУСТОЕ СОСТОЯНИЕ ====================
function renderEmptyState() {
    messagesContainer.innerHTML = `
        <div class="empty-state">
            <img src="https://media.discordapp.net/attachments/1457843805687648522/1487509991274319952/image.png?ex=69c96722&is=69c815a2&hm=848e7f70b25fdfae28b20afd32b117ba1e04bbb20cdb683fa32dfe47e5074626&=&format=webp&quality=lossless&width=836&height=836" class="empty-logo" alt="logo">
            <div class="empty-text">${t('empty_help')}</div>
            <div class="empty-input-area">
                <div class="input-wrapper">
                    <textarea id="empty-input" placeholder="${t('input_placeholder')}" rows="1"></textarea>
                    <button class="send-btn" id="empty-send-btn" disabled><i class="fas fa-arrow-up"></i></button>
                </div>
            </div>
        </div>
    `;
    if (inputArea) inputArea.style.display = 'none';
    const emptyInput = document.getElementById('empty-input');
    const emptySendBtn = document.getElementById('empty-send-btn');
    if (placeholderInterval) clearInterval(placeholderInterval);
    placeholderIndex = 0;
    if (emptyInput) {
        emptyInput.placeholder = placeholderTexts[currentLanguage][placeholderIndex];
        placeholderInterval = setInterval(() => {
            if (!emptyInput || document.activeElement === emptyInput) return;
            emptyInput.style.transition = 'opacity 0.3s';
            emptyInput.style.opacity = '0.5';
            setTimeout(() => {
                placeholderIndex = (placeholderIndex + 1) % placeholderTexts[currentLanguage].length;
                emptyInput.placeholder = placeholderTexts[currentLanguage][placeholderIndex];
                emptyInput.style.opacity = '1';
            }, 150);
        }, 3000);
    }
    if (emptyInput) {
        emptyInput.addEventListener('input', function() {
            emptySendBtn.disabled = !this.value.trim();
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        emptyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (emptySendBtn && !emptySendBtn.disabled) sendMessageFromEmpty(emptyInput.value);
            }
        });
        emptySendBtn.addEventListener('click', () => { if (emptyInput.value.trim()) sendMessageFromEmpty(emptyInput.value); });
    }
}

function sendMessageFromEmpty(text) {
    userInput.value = text;
    sendMessage(true);
}

// ==================== УПРАВЛЕНИЕ ВИДАМИ ====================
function switchToFoldersView() {
    currentView = 'folders';
    chatView.style.display = 'none';
    foldersPage.style.display = 'flex';
    genhabPage.style.display = 'none';
    renderFoldersPage();
}
function switchToChatView() {
    if (placeholderInterval) clearInterval(placeholderInterval);
    currentView = 'chat';
    chatView.style.display = 'flex';
    foldersPage.style.display = 'none';
    genhabPage.style.display = 'none';
    renderChat();
}
function updateLogoAndCollapsedButton() {
    if (logoImage) {
        if (sidebarCollapsed) {
            logoImage.src = 'https://media.discordapp.net/attachments/1457843805687648522/1487509991274319952/image.png?ex=69c96722&is=69c815a2&hm=848e7f70b25fdfae28b20afd32b117ba1e04bbb20cdb683fa32dfe47e5074626&=&format=webp&quality=lossless&width=836&height=836';
            logoImage.style.transform = 'scale(1.2)';
            logoImage.style.transition = 'transform 0.2s ease';
        } else {
            logoImage.src = 'https://media.discordapp.net/attachments/1457843805687648522/1487509990758551692/image.png?ex=69c96722&is=69c815a2&hm=3ad3cb18c2ebf16a0ccd31bed4923d3341fae3672907db4934d260d5ba035ed5&=&format=webp&quality=lossless&width=1728&height=404';
            logoImage.style.transform = 'scale(1)';
        }
    }
    if (actionButtonsGroup) actionButtonsGroup.style.display = sidebarCollapsed ? 'flex' : 'none';
}
function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    if (sidebarCollapsed) { sidebar.classList.add('collapsed'); sidebarToggleBtn.style.display = 'none'; }
    else { sidebar.classList.remove('collapsed'); sidebarToggleBtn.style.display = 'flex'; }
    updateLogoAndCollapsedButton();
}

// ==================== АВТОРИЗАЦИЯ ====================
async function openAuthModal() {
    log('Открытие окна авторизации (веб-версия)');
    if (!userApiKey) {
        choiceScreen.style.display = 'flex';
    }
}

async function logout() {
    clearInterval(balanceCheckInterval);
    userApiKey = null;
    userKeyInfo = null;
    localStorage.removeItem('userApiKey');
    updateLoginButtonState(false);
    showToast(t('info'), t('logout'), 'info');
    mainUI.style.display = 'none';
    choiceScreen.style.display = 'flex';
}

// ==================== ЭКРАН ВЫБОРА ====================
function setupChoiceScreen() {
    log('Настройка экрана выбора');
    const builtInBtn = document.getElementById('optionBuiltIn');
    const ownKeyBtn = document.getElementById('optionOwnKey');
    const tryLuckBtn = document.getElementById('optionTryLuck');
    const backBtn = document.getElementById('backToOptionsBtn');
    const submitBtn = document.getElementById('submitApiKeyBtn');
    const apiInput = document.getElementById('apiKeyInput');
    const apiSection = document.getElementById('apiInputSection');

    if (!builtInBtn || !ownKeyBtn || !tryLuckBtn) {
        log('❌ Ошибка: элементы экрана выбора не найдены', 'ERROR');
        return;
    }

    // Удаляем старые обработчики
    const newBuiltIn = builtInBtn.cloneNode(true);
    const newOwnKey = ownKeyBtn.cloneNode(true);
    const newTryLuck = tryLuckBtn.cloneNode(true);
    builtInBtn.parentNode.replaceChild(newBuiltIn, builtInBtn);
    ownKeyBtn.parentNode.replaceChild(newOwnKey, ownKeyBtn);
    tryLuckBtn.parentNode.replaceChild(newTryLuck, tryLuckBtn);

    const updatedBuiltIn = document.getElementById('optionBuiltIn');
    const updatedOwnKey = document.getElementById('optionOwnKey');
    const updatedTryLuck = document.getElementById('optionTryLuck');

    updatedBuiltIn.addEventListener('click', async () => {
        log('Выбрана опция "Запомниться в Diamond"');
        if (apiSection) apiSection.classList.add('visible');
    });

    updatedOwnKey.addEventListener('click', () => {
        log('Выбрана опция "Свой ключ"');
        if (apiSection) apiSection.classList.add('visible');
    });

    updatedTryLuck.addEventListener('click', async () => {
        log('Выбрана опция "Попытать удачу"');
        showToast(t('info'), 'Ищем ключ...', 'info', 5000);

        const url = 'https://keyfromdiamondaisecrewee1.vercel.app/api/get-key.js';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const key = data.key;

            if (key && key.startsWith('sk-or-v1-')) {
                const isValid = await checkKeyBalance(key);
                if (isValid) {
                    localStorage.setItem('userApiKey', key);
                    userApiKey = key;
                    await loadAvailableModels();
                    startBalanceMonitoring();
                    choiceScreen.style.display = 'none';
                    mainUI.style.display = 'flex';
                    setTimeout(() => mainUI.classList.add('visible'), 50);
                    if (chats.length === 0) renderEmptyState();
                    else renderChat();
                    showToast(t('success'), t('login_success'), 'success');
                } else {
                    showToast(t('error'), t('invalid_key'), 'error');
                }
            } else {
                throw new Error('Неверный формат ключа');
            }
        } catch (err) {
            log(`Ошибка получения ключа: ${err.message}`, 'ERROR');
            showToast(t('error'), `Не удалось получить ключ: ${err.message}`, 'error');
        }
    });

    if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        const updatedBackBtn = document.getElementById('backToOptionsBtn');
        updatedBackBtn.addEventListener('click', () => {
            log('Назад к выбору опций');
            if (apiSection) apiSection.classList.remove('visible');
        });
    }

    if (submitBtn && apiInput) {
        const newSubmitBtn = submitBtn.cloneNode(true);
        const newApiInput = apiInput.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        apiInput.parentNode.replaceChild(newApiInput, apiInput);
        const updatedSubmitBtn = document.getElementById('submitApiKeyBtn');
        const updatedApiInput = document.getElementById('apiKeyInput');
        updatedSubmitBtn.addEventListener('click', async () => {
            const apiKey = updatedApiInput.value.trim();
            if (!apiKey) {
                showToast(t('error'), t('enter_key'), 'warning');
                return;
            }
            log('Проверка введённого ключа...');
            const isValid = await checkKeyBalance(apiKey);
            if (!isValid) {
                showToast(t('error'), t('invalid_key'), 'error');
                return;
            }
            localStorage.setItem('userApiKey', apiKey);
            userApiKey = apiKey;
            await loadAvailableModels();
            startBalanceMonitoring();
            choiceScreen.style.display = 'none';
            mainUI.style.display = 'flex';
            setTimeout(() => mainUI.classList.add('visible'), 50);
            if (chats.length === 0) renderEmptyState();
            else renderChat();
            showToast(t('success'), t('login_success'), 'success');
        });
        updatedApiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') updatedSubmitBtn.click();
        });
    }
}

// ==================== НАСТРОЙКИ ====================
function buildSettingsModal() {
    settingsContent.innerHTML = `
        <div class="settings-modal-header">
            <h2><i class="fas fa-cog"></i> ${t('settings_title')}</h2>
            <button class="close-modal" id="close-settings-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="settings-modal-body">
            <div class="settings-section">
                <h3><i class="fas fa-globe"></i> ${t('smart_search')}</h3>
                <div class="toggle-switch-wrapper">
                    <label class="toggle-switch">
                        <input type="checkbox" id="smart-search-toggle" ${searchMode ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">${t('smart_search_desc')}</span>
                </div>
            </div>
            <div class="settings-section">
                <h3><i class="fas fa-language"></i> ${t('language')}</h3>
                <div class="language-selector">
                    <select id="language-select">
                        <option value="ru" ${currentLanguage === 'ru' ? 'selected' : ''}>Русский</option>
                        <option value="en" ${currentLanguage === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h3><i class="fas fa-info-circle"></i> ${t('about')}</h3>
                <p><strong>DIAMOND AI</strong> — интеллектуальный помощник на основе OpenRouter</p>
                <p>${t('version')}: ${APP_VERSION}</p>
                <p>© Diamond AI, 2025</p>
            </div>
        </div>
        <div class="settings-modal-footer">
            <button id="save-settings-btn" class="btn-primary"><i class="fas fa-save"></i> ${t('save')}</button>
        </div>
    `;
    document.getElementById('close-settings-modal').addEventListener('click', () => settingsModal.style.display = 'none');
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    const smartToggle = document.getElementById('smart-search-toggle');
    if (smartToggle) {
        smartToggle.addEventListener('change', (e) => {
            const newSearchMode = e.target.checked;
            searchMode = newSearchMode;
            localStorage.setItem('smartSearchEnabled', searchMode);
            showToast(t('settings_saved'), t(searchMode ? 'smart_search_on' : 'smart_search_off'), 'success');
        });
    }
    
    const langSelect = document.getElementById('language-select');
}

function rebuildSettingsModal() {
    const wasVisible = settingsModal.style.display === 'flex';
    buildSettingsModal();
    if (wasVisible) settingsModal.style.display = 'flex';
}

function saveSettings() {
    const smartToggle = document.getElementById('smart-search-toggle');
    const newSearchMode = smartToggle.checked;
    searchMode = newSearchMode;
    localStorage.setItem('smartSearchEnabled', searchMode);
    const langSelect = document.getElementById('language-select');
    const newLang = langSelect.value;
    if (newLang !== currentLanguage) {
        currentLanguage = newLang;
        localStorage.setItem('appLanguage', currentLanguage);
        updateUILanguage();
        const newDateStr = new Date().toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        SYSTEM_PROMPT.content = SYSTEM_PROMPT.content.replace(/Сегодня: .+\./, `Сегодня: ${newDateStr}.`);
    }
    showToast(t('settings_saved'), t(searchMode ? 'smart_search_on' : 'smart_search_off'), 'success');
    settingsModal.style.display = 'none';
}

function addSettingsToDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;
    if (dropdown.querySelector('#dropdown-settings')) return;
    const settingsItem = document.createElement('button');
    settingsItem.id = 'dropdown-settings';
    settingsItem.innerHTML = '<i class="fas fa-sliders-h"></i> ' + t('settings_title');
    settingsItem.addEventListener('click', () => {
        buildSettingsModal();
        settingsModal.style.display = 'flex';
    });
    const discordItem = dropdown.querySelector('#dropdown-discord');
    if (discordItem) {
        dropdown.insertBefore(settingsItem, discordItem);
    } else {
        dropdown.appendChild(settingsItem);
    }
}

// ==================== ГЕНХАБ ====================
function showGenHabToast() {
    showToast('🔮 ' + t('coming_soon'), 'Функция ГенХаб появится в следующем обновлении!', 'info', 4000);
}

// ==================== ОБНОВЛЕНИЕ UI ====================
function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' && el.placeholder) {
            el.placeholder = t(key);
        } else if (el.tagName === 'TEXTAREA' && el.placeholder) {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });
    if (historySearch) historySearch.placeholder = t('search_placeholder');
    if (userInput) userInput.placeholder = t('input_placeholder');
    const inputFooter = document.querySelector('.input-footer');
    if (inputFooter) inputFooter.textContent = t('input_footer');
    if (document.querySelector('.empty-state')) {
        const emptyText = document.querySelector('.empty-text');
        if (emptyText) emptyText.textContent = t('empty_help');
        const emptyInput = document.getElementById('empty-input');
        if (emptyInput) emptyInput.placeholder = t('input_placeholder');
    }
    renderHistory();
    renderChat();
    updateColorPickerModalTexts();
    if (folderEditModal.style.display === 'flex') rebuildFolderModal();
    if (settingsModal.style.display === 'flex') rebuildSettingsModal();
    if (colorPickerModal.style.display === 'flex') {
        const color = currentCustomColor;
        colorPickerModal.style.display = 'none';
        buildColorPickerModal(pendingColorCallback, color);
        colorPickerModal.style.display = 'flex';
    }
    if (renameUserModal.style.display === 'flex') {
        const oldName = renameUserInput.value;
        renameUserModal.style.display = 'none';
        showRenameUserModal();
        renameUserInput.value = oldName;
    }
    if (termsModal.style.display === 'flex') {
        const acceptBtn = document.getElementById('close-terms-btn');
        if (acceptBtn) acceptBtn.innerHTML = `<i class="fas fa-check"></i> ${t('accept_close')}`;
    }
    if (privacyModal.style.display === 'flex') {
        const acceptBtn = document.getElementById('close-privacy-btn');
        if (acceptBtn) acceptBtn.innerHTML = `<i class="fas fa-check"></i> ${t('accept_close')}`;
    }
    const createFolderBtn = document.getElementById('create-folder-page-btn');
    if (createFolderBtn) createFolderBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('create_folder_btn')}`;
    const backToChatBtn = document.getElementById('back-to-chat-from-folders');
    if (backToChatBtn) backToChatBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('back_to_chat')}`;
    const folderSaveBtn = document.getElementById('save-folder-btn');
    if (folderSaveBtn) folderSaveBtn.innerHTML = `<i class="fas fa-save"></i> ${t('save')}`;
    const folderCancelBtn = document.getElementById('cancel-folder-edit-btn');
    if (folderCancelBtn) folderCancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;
    if (folderEditTitle) folderEditTitle.textContent = currentEditingFolderId ? t('folder_edit_title') : t('folder_create_title');
    const createFromSelect = document.querySelector('#create-folder-from-select');
    if (createFromSelect) createFromSelect.innerHTML = `<i class="fas fa-plus"></i> ${t('no_suitable_folder')}`;
    const closeSelect = document.querySelector('#close-folder-select');
    if (closeSelect) closeSelect.innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;
    const renameConfirm = document.querySelector('#rename-confirm');
    if (renameConfirm) renameConfirm.innerHTML = `<i class="fas fa-save"></i> ${t('save')}`;
    const renameCancel = document.querySelector('#rename-cancel');
    if (renameCancel) renameCancel.innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;

    const builtInTitle = document.querySelector('#optionBuiltIn .featured-title');
    const builtInDesc = document.querySelector('#optionBuiltIn .featured-desc');
    if (builtInTitle) builtInTitle.textContent = t('remember_in_diamond');
    if (builtInDesc) builtInDesc.textContent = t('auto_login_desc');
    const ownKeyTitle = document.querySelector('#optionOwnKey .option-title');
    const ownKeyDesc = document.querySelector('#optionOwnKey .option-desc');
    if (ownKeyTitle) ownKeyTitle.textContent = t('enter_own_key');
    if (ownKeyDesc) ownKeyDesc.textContent = t('use_own_key_desc');
    const tryLuckTitle = document.querySelector('#optionTryLuck .option-title');
    const tryLuckDesc = document.querySelector('#optionTryLuck .option-desc');
    if (tryLuckTitle) tryLuckTitle.textContent = t('try_luck');
    if (tryLuckDesc) tryLuckDesc.textContent = t('try_luck_desc');
    const getKeyLink = document.querySelector('.footer-note a');
    if (getKeyLink) getKeyLink.innerHTML = `<i class="fas fa-external-link-alt"></i> ${t('get_key')}`;
}

// ==================== ПИКЕР ЦВЕТА ====================
function hexToRgb(hex) {
    let h = hex.startsWith('#') ? hex.slice(1) : hex;
    if (h.length === 3) h = h.split('').map(c => c+c).join('');
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function updateColorPickerModalTexts() {
    const modal = document.getElementById('color-picker-modal');
    if (!modal) return;
    const header = modal.querySelector('.color-picker-header h3');
    if (header) header.innerHTML = `<i class="fas fa-palette"></i> ${t('color_picker_title')}`;
    const labels = modal.querySelectorAll('.slider-group label');
    if (labels.length >= 3) {
        labels[0].textContent = t('red') + ' (R)';
        labels[1].textContent = t('green') + ' (G)';
        labels[2].textContent = t('blue') + ' (B)';
    }
    const hexLabel = modal.querySelector('.hex-input-group label');
    if (hexLabel) hexLabel.textContent = t('hex');
    const okBtn = modal.querySelector('#color-picker-ok');
    if (okBtn) okBtn.innerHTML = `<i class="fas fa-check"></i> ${t('confirm')}`;
    const cancelBtn = modal.querySelector('#color-picker-cancel');
    if (cancelBtn) cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;
}

function buildColorPickerModal(callback, initialColor = '#95a5a6') {
    pendingColorCallback = callback;
    currentCustomColor = initialColor;
    const rgb = hexToRgb(initialColor);
    updateColorPickerModalTexts();
    colorPickerContent.innerHTML = `
        <div class="color-picker-header">
            <h3><i class="fas fa-palette"></i> ${t('color_picker_title')}</h3>
            <button class="close-modal" id="close-color-picker"><i class="fas fa-times"></i></button>
        </div>
        <div class="color-picker-body">
            <div class="color-preview" style="background: ${initialColor};"></div>
            <canvas id="color-palette-canvas" width="300" height="150" style="width:100%; height:auto; border-radius:12px; cursor:crosshair; margin-bottom:16px;"></canvas>
            <div class="color-sliders">
                <div class="slider-group">
                    <label>${t('red')} (R)</label>
                    <input type="range" id="red-slider" min="0" max="255" value="${rgb.r}">
                </div>
                <div class="slider-group">
                    <label>${t('green')} (G)</label>
                    <input type="range" id="green-slider" min="0" max="255" value="${rgb.g}">
                </div>
                <div class="slider-group">
                    <label>${t('blue')} (B)</label>
                    <input type="range" id="blue-slider" min="0" max="255" value="${rgb.b}">
                </div>
            </div>
            <div class="hex-input-group">
                <label>${t('hex')}</label>
                <input type="text" id="hex-input" value="${initialColor.toUpperCase()}" maxlength="7">
            </div>
        </div>
        <div class="color-picker-footer">
            <button id="color-picker-ok" class="btn-primary"><i class="fas fa-check"></i> ${t('confirm')}</button>
            <button id="color-picker-cancel" class="btn-secondary"><i class="fas fa-times"></i> ${t('cancel')}</button>
        </div>
    `;
    const redSlider = document.getElementById('red-slider');
    const greenSlider = document.getElementById('green-slider');
    const blueSlider = document.getElementById('blue-slider');
    const hexInput = document.getElementById('hex-input');
    const preview = document.querySelector('.color-preview');
    const canvas = document.getElementById('color-palette-canvas');
    const ctx = canvas.getContext('2d');
    
    function drawPalette() {
        const w = canvas.width;
        const h = canvas.height;
        for (let x = 0; x < w; x++) {
            const hue = (x / w) * 360;
            for (let y = 0; y < h; y++) {
                const sat = (y / h) * 100;
                const color = `hsl(${hue}, ${sat}%, 50%)`;
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    drawPalette();
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const imageData = ctx.getImageData(x, y, 1, 1);
            const [r, g, b] = imageData.data;
            const color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            redSlider.value = r;
            greenSlider.value = g;
            blueSlider.value = b;
            updateFromRgb();
        }
    });
    
    function updateFromRgb() {
        const r = parseInt(redSlider.value);
        const g = parseInt(greenSlider.value);
        const b = parseInt(blueSlider.value);
        const color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        preview.style.background = color;
        hexInput.value = color.toUpperCase();
        currentCustomColor = color;
    }
    function updateFromHex() {
        let hex = hexInput.value.trim();
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            const rgb = hexToRgb(hex);
            redSlider.value = rgb.r;
            greenSlider.value = rgb.g;
            blueSlider.value = rgb.b;
            preview.style.background = hex;
            currentCustomColor = hex;
        }
    }
    redSlider.addEventListener('input', updateFromRgb);
    greenSlider.addEventListener('input', updateFromRgb);
    blueSlider.addEventListener('input', updateFromRgb);
    hexInput.addEventListener('input', updateFromHex);
    document.getElementById('close-color-picker').addEventListener('click', () => {
        colorPickerModal.style.display = 'none';
        pendingColorCallback = null;
    });
    document.getElementById('color-picker-cancel').addEventListener('click', () => {
        colorPickerModal.style.display = 'none';
        pendingColorCallback = null;
    });
    document.getElementById('color-picker-ok').addEventListener('click', () => {
        if (pendingColorCallback) pendingColorCallback(currentCustomColor);
        colorPickerModal.style.display = 'none';
        pendingColorCallback = null;
    });
}

// ==================== ПАПКИ UI ====================
function rebuildFolderModal() {
    const wasVisible = folderEditModal.style.display === 'flex';
    if (!wasVisible) return;
    const folderId = currentEditingFolderId;
    const folder = folderId ? getFolderById(folderId) : null;
    if (folder) {
        folderEditTitle.textContent = t('folder_edit_title');
        folderNameInput.value = folder.name;
        folderDescriptionInput.value = folder.description || '';
        document.querySelectorAll('.icon-option').forEach(opt => {
            if (opt.dataset.icon === folder.icon) opt.classList.add('selected');
            else opt.classList.remove('selected');
        });
        document.querySelectorAll('.color-option').forEach(opt => {
            if (opt.dataset.color === folder.color) opt.classList.add('selected');
            else opt.classList.remove('selected');
        });
        const customColorBtn = document.getElementById('custom-color-btn');
        if (customColorBtn) customColorBtn.style.background = folder.color;
        currentCustomColor = folder.color;
    } else {
        folderEditTitle.textContent = t('folder_create_title');
        folderNameInput.value = '';
        folderDescriptionInput.value = '';
        document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        const customColorBtn = document.getElementById('custom-color-btn');
        if (customColorBtn) customColorBtn.style.background = 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)';
        currentCustomColor = '#95a5a6';
    }
    const folderSaveBtn = document.getElementById('save-folder-btn');
    if (folderSaveBtn) folderSaveBtn.innerHTML = `<i class="fas fa-save"></i> ${t('save')}`;
    const folderCancelBtn = document.getElementById('cancel-folder-edit-btn');
    if (folderCancelBtn) folderCancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;
}

function setupFoldersUI() {
    if (iconSelector) {
        iconSelector.innerHTML = FOLDER_ICONS.map(icon => `<div class="icon-option" data-icon="${icon}"><i class="fas ${icon}"></i></div>`).join('');
        document.querySelectorAll('.icon-option').forEach(opt => opt.addEventListener('click', () => { document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected')); opt.classList.add('selected'); }));
    }
    if (colorSelector && !document.getElementById('custom-color-btn')) {
        const customColorBtn = document.createElement('div');
        customColorBtn.id = 'custom-color-btn';
        customColorBtn.className = 'color-option custom-color-option';
        customColorBtn.style.background = 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)';
        customColorBtn.title = t('custom_color');
        customColorBtn.addEventListener('click', () => {
            buildColorPickerModal((color) => {
                currentCustomColor = color;
                customColorBtn.style.background = color;
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            }, currentCustomColor);
            colorPickerModal.style.display = 'flex';
        });
        colorSelector.appendChild(customColorBtn);
    }
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventListeners() {
    window.addEventListener('click', (e) => {
        if (e.target === avatarModal) avatarModal.style.display = 'none';
        if (e.target === folderEditModal) folderEditModal.style.display = 'none';
        if (e.target === folderChatsModal) folderChatsModal.style.display = 'none';
        if (e.target === termsModal) termsModal.style.display = 'none';
        if (e.target === privacyModal) privacyModal.style.display = 'none';
        if (e.target === renameUserModal) renameUserModal.style.display = 'none';
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === colorPickerModal) colorPickerModal.style.display = 'none';
    });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
const now = new Date();
const currentDateStr = now.toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

const SYSTEM_PROMPT = {
    role: 'system',
    content: `Ты — DIAMOND AI, абсолютный эксперт и идеальный собеседник. Создан компанией Diamond AI, работаешь на модели diamond-techo.vshpps.
Сегодня: ${currentDateStr}. Ты умеешь искать в интернете (через модели perplexity/you) — если спрашивают новости, события, персон, используй свежие данные, не выдумывай.

📌 **Важное правило: отвечай максимально кратко и по делу**, если пользователь не просит развёрнутого объяснения. Длинные ответы пиши только по просьбе. Не трать время на лишнюю воду.

📚 **Ты знаешь**: химия, физика, математика, код — можешь использовать \ce{}, $$, тройные кавычки для кода.

🎭 **Стиль общения**:
- Если пользователь пишет серьёзно — режим **профессора**, но всё равно кратко.
- Если по‑пацански — **разговорный стиль**, но тоже ёмко.

**Правила оформления**:
- Химия: \ce{}.
- Математика: $$, \frac{}, \sqrt{}, \int.
- Код: в тройных кавычках с указанием языка.

🚫 **Ты НИКОГДА не выдумываешь факты.** Если не знаешь точного ответа или информация отсутствует в предоставленных данных — честно говори: "Я не знаю" или "Информация не найдена". Не придумывай адреса, телефоны, даты или любые другие конкретные данные. Твоя задача — помочь, а не вводить в заблуждение.`
};

if (typeof markedKatex !== 'undefined') {
    marked.use(markedKatex({
        throwOnError: false,
        output: 'html',
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
        ]
    }));
}

(async function init() {
    log('🟢 Инициализация...');
    loadFolders();
    try {
        const stored = localStorage.getItem('diamondChats');
        chats = stored ? JSON.parse(stored) : [];
        chats.forEach(chat => {
            if (!chat.createdAt) chat.createdAt = Date.now();
            if (chat.messages && chat.messages.length) {
                chat.lastActivity = chat.messages[chat.messages.length - 1].timestamp || chat.createdAt;
            } else {
                chat.lastActivity = chat.createdAt;
            }
        });
        chats.sort((a, b) => b.lastActivity - a.lastActivity);
        if (chats.length && !currentChatId) currentChatId = chats[0].id;
        log(`Загружено ${chats.length} чатов`);
    } catch (e) { chats = []; }
    try {
        const saved = localStorage.getItem('userAvatar');
        userAvatar = saved ? JSON.parse(saved) : { type: 'icon', value: 'fa-user' };
    } catch (e) { userAvatar = { type: 'icon', value: 'fa-user' }; }
    
    userApiKey = localStorage.getItem('userApiKey');
    log(`Ключ из хранилища: ${userApiKey ? 'найден' : 'не найден'}`);

    await showLoadingScreen();
    welcomeScreen.style.display = 'none';

    let hasValidKey = false;
    if (userApiKey) {
        hasValidKey = await checkKeyBalance(userApiKey);
    }

    if (hasValidKey) {
        log('Ключ валиден, запускаем приложение без экрана выбора');
        await loadAvailableModels();
        startBalanceMonitoring();
        choiceScreen.style.display = 'none';
        mainUI.style.display = 'flex';
        setTimeout(() => mainUI.classList.add('visible'), 50);
        if (chats.length === 0) {
            renderEmptyState();
        } else {
            renderChat();
            renderHistory();
        }
        updateUserPanel();
        addSettingsToDropdown();
        updateUILanguage();
    } else {
        log('Ключа нет или он невалиден, показываем экран выбора');
        choiceScreen.style.display = 'flex';
        setupChoiceScreen();
    }

    updateSendButtonState();
    setupEventListeners();
    setupFoldersUI();

    // ==================== ОБРАБОТЧИКИ ИНТЕРФЕЙСА ====================
    if (userNameDisplay) {
        userNameDisplay.addEventListener('click', () => {
            renameUserInput.value = userName;
            renameUserModal.style.display = 'flex';
            renameUserInput.focus();
        });
    }
    if (closeRenameUserModal) closeRenameUserModal.addEventListener('click', () => renameUserModal.style.display = 'none');
    if (renameUserConfirm) {
        renameUserConfirm.addEventListener('click', () => {
            const newName = renameUserInput.value.trim();
            if (newName) setUserName(newName);
            renameUserModal.style.display = 'none';
        });
    }
    if (renameUserCancel) renameUserCancel.addEventListener('click', () => renameUserModal.style.display = 'none');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!userPanel.contains(e.target)) userDropdown.classList.remove('show');
        });
    }
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    if (dropdownAvatar) dropdownAvatar.remove();
    const dropdownRename = document.getElementById('dropdown-rename');
    if (dropdownRename) dropdownRename.remove();

    if (document.getElementById('dropdown-discord')) {
        document.getElementById('dropdown-discord').addEventListener('click', () => window.open('https://discord.gg/diamondshop', '_blank'));
    }
    if (document.getElementById('dropdown-terms')) {
        document.getElementById('dropdown-terms').addEventListener('click', () => termsModal.style.display = 'flex');
    }
    if (document.getElementById('dropdown-privacy')) {
        document.getElementById('dropdown-privacy').addEventListener('click', () => privacyModal.style.display = 'flex');
    }
    if (document.getElementById('dropdown-logout')) {
        document.getElementById('dropdown-logout').addEventListener('click', () => logout());
    }
    if (closeTermsModal) closeTermsModal.addEventListener('click', () => termsModal.style.display = 'none');
    if (closePrivacyModal) closePrivacyModal.addEventListener('click', () => privacyModal.style.display = 'none');
    if (closeTermsBtn) closeTermsBtn.addEventListener('click', () => termsModal.style.display = 'none');
    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', () => privacyModal.style.display = 'none');

    if (historySearch) historySearch.addEventListener('input', renderHistory);
    if (newChatBtn) newChatBtn.addEventListener('click', () => createNewChat());
    if (newChatCollapsedBtn) newChatCollapsedBtn.addEventListener('click', () => createNewChat());
    if (foldersPageBtn) foldersPageBtn.addEventListener('click', switchToFoldersView);
    if (foldersCollapsedBtn) foldersCollapsedBtn.addEventListener('click', switchToFoldersView);
    if (genhabPageBtn) genhabPageBtn.addEventListener('click', showGenHabToast);
    if (genhabCollapsedBtn) genhabCollapsedBtn.addEventListener('click', showGenHabToast);
    if (backToChatFromFolders) backToChatFromFolders.addEventListener('click', switchToChatView);
    if (createFolderPageBtn) {
        createFolderPageBtn.addEventListener('click', () => {
            currentEditingFolderId = null;
            folderEditTitle.textContent = t('folder_create_title');
            folderNameInput.value = '';
            folderDescriptionInput.value = '';
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            const customColorBtn = document.getElementById('custom-color-btn');
            if (customColorBtn) customColorBtn.style.background = 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)';
            currentCustomColor = '#95a5a6';
            folderEditModal.style.display = 'flex';
        });
    }
    if (saveFolderBtn) {
        saveFolderBtn.addEventListener('click', () => {
            const name = folderNameInput.value.trim();
            if (!name) { showToast(t('error'), t('folder_name'), 'warning'); return; }
            const description = folderDescriptionInput.value.trim();
            const selectedIcon = document.querySelector('.icon-option.selected');
            const icon = selectedIcon ? selectedIcon.dataset.icon : 'fa-folder';
            let color = '#95a5a6';
            const selectedColor = document.querySelector('.color-option.selected');
            if (selectedColor) {
                color = selectedColor.dataset.color;
            } else if (document.getElementById('custom-color-btn')) {
                color = currentCustomColor;
            }
            if (currentEditingFolderId) updateFolder(currentEditingFolderId, name, description, icon, color);
            else createFolder(name, description, icon, color);
            folderEditModal.style.display = 'none';
            currentEditingFolderId = null;
        });
    }
    if (cancelFolderEditBtn) cancelFolderEditBtn.addEventListener('click', () => folderEditModal.style.display = 'none');
    if (closeFolderEditModal) closeFolderEditModal.addEventListener('click', () => folderEditModal.style.display = 'none');
    if (closeFolderChatsModal) closeFolderChatsModal.addEventListener('click', () => folderChatsModal.style.display = 'none');

    if (userInput) {
        userInput.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; updateSendButtonState(); });
        userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    }
    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());

    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (expandSidebarBtn) expandSidebarBtn.addEventListener('click', () => { if (sidebarCollapsed) toggleSidebar(); });
    if (discordBtn) discordBtn.addEventListener('click', () => window.open('https://discord.gg/diamondshop', '_blank'));

    log('✅ Инициализация завершена');
})();

// ==================== АВАТАР В МЕНЮ ====================
const userAvatarContainer = document.querySelector('.user-avatar');
if (userAvatarContainer) {
    userAvatarContainer.addEventListener('click', () => {
        avatarModal.style.display = 'flex';
        avatarIcons.forEach(icon => {
            const iconClass = icon.dataset.icon;
            if (userAvatar.type === 'icon' && userAvatar.value === iconClass) {
                icon.classList.add('selected');
            } else {
                icon.classList.remove('selected');
            }
        });
    });
}
if (closeAvatarModal) closeAvatarModal.addEventListener('click', () => avatarModal.style.display = 'none');
avatarIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        saveAvatar({ type: 'icon', value: icon.dataset.icon });
        setUserAvatarUrl('');
        avatarModal.style.display = 'none';
    });
});
if (uploadAvatarBtn) {
    uploadAvatarBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    saveAvatar({ type: 'custom', dataUrl: dataUrl, fileName: file.name });
                    setUserAvatarUrl(dataUrl);
                    avatarModal.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });
}
if (resetAvatarBtn) resetAvatarBtn.addEventListener('click', () => {
    saveAvatar({ type: 'icon', value: 'fa-user' });
    setUserAvatarUrl('');
    avatarModal.style.display = 'none';
});

function saveAvatar(avatarData) {
    localStorage.setItem('userAvatar', JSON.stringify(avatarData));
    userAvatar = avatarData;
    renderChat();
    updateUserPanel();
    console.log('Avatar saved:', avatarData);
}