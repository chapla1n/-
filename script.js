// ====== НАСТРОЙКИ ======
// ВСТАВЬТЕ СЮДА ВАШ URL ИЗ GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpyV7In403Y7kptLw_XVDcbBSzQcSJnv2EmFKAV3VZzqJIVdHMLAEtxvqLV1pYQQwl1A/exec'; 

const questions = [
    {
        text: "Любимая, понравился ли тебе этот год со мной? 💕",
        type: "buttons",
        options: ["Лучший год в моей жизни ✨"],
        runaway: {
            label: "Нет 😢",
            maxDodges: 3,
            messages: [
                "Уверена, зайка? Попробуй ещё разок 😏",
                "Кнопка не хочет, чтобы ты её нажимала 💨",
                "Ладно-ладно, её больше нет 😄"
            ]
        }
    },
    {
        text: "Что ты загадаешь под бой курантов, зайка? 🕛",
        type: "buttons",
        options: ["Чтобы мы были вместе 💕", "Много-много счастья ✨", "Секрет! 🤫"]
    },
    {
        text: "Какое совместное событие тебе запомнилось больше всего? 📸",
        type: "input",
        answers: null,
        hint: "Напиши то, что вспоминается с улыбкой 😊"
    },
    {
        text: "Любимая, я могу искусать тебя? 😼",
        type: "buttons",
        options: [{ label: "Ну ладно 😢", hoverHint: "УРА!!! 🥳" }],
        runaway: {
            label: "Неееет 🙈",
            maxDodges: 3,
            messages: [
                "Уверена, зайка? Попробуй ещё разок 😏",
                "Кнопка не хочет, чтобы ты её нажимала 💨",
                "Ладно-ладно, её больше нет 😄"
            ]
        }
    },
    {
        text: "Напиши слово, которое описывает наш год вместе ❤️",
        type: "input",
        answers: null,
        hint: "Подсказка: это что-то очень тёплое 🔥"
    },
    {
        text: "Ты согласна встретить Новый год со мной, любимая? 🎄",
        type: "buttons",
        options: ["Да 💖", "Конечно да 😻", "Даже не сомневайся 💕"]
    }
];

const finalMessage = "Масечка моя, спасибо, что ты есть. Этот год с тобой — лучшее, что случилось со мной. Пусть следующий принесёт нам ещё больше счастья, смеха и тёплых моментов. С Новым годом, моя зайка! 🎄💕🐱";

const media = {
    winter: [
        { type: 'image', src: 'images/1.jpg' },
        { type: 'image', src: 'images/2.jpg' },
        { type: 'image', src: 'images/3.jpg' }
    ],
    summer: [
        { type: 'image', src: 'images/9.jpg' },
        { type: 'image', src: 'images/8.jpg' },
        { type: 'image', src: 'images/7.jpg' },
        { type: 'image', src: 'images/6.jpg' },
        { type: 'image', src: 'images/5.jpg' },
        { type: 'image', src: 'images/4.jpg' }
    ]
};
// =========================================

let current = 0;
let isSending = false;

const questionEl = document.getElementById('question');
const buttonsEl  = document.getElementById('buttons');
const inputArea  = document.getElementById('inputArea');
const answerInput = document.getElementById('answerInput');
const submitBtn  = document.getElementById('submitBtn');
const hintEl     = document.getElementById('hint');
const quizEl     = document.getElementById('quiz');
const finalEl    = document.getElementById('final');
const finalText  = document.getElementById('finalText');
const restartBtn = document.getElementById('restartBtn');

const showGalleryBtn = document.getElementById('showGalleryBtn');
const seasonsMenuEl  = document.getElementById('seasonsMenu');
const galleryEl      = document.getElementById('gallery');
const galleryGrid    = document.getElementById('galleryGrid');
const galleryTitle   = document.getElementById('galleryTitle');

// ====== ОТПРАВКА В GOOGLE ТАБЛИЦУ (ЧЕРЕЗ JSON) ======
function sendToGoogle(questionText, answerText) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('ВАШ_URL')) {
        console.warn('URL скрипта не указан');
        return;
    }

    // Отправляем как JSON, это самый надежный способ для Apps Script
    const data = {
        question: questionText,
        answer: answerText
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Обходим CORS-проверки
        },
        body: JSON.stringify(data)
    })
    .then(() => console.log('✅ Отправлено:', data))
    .catch(err => console.error('❌ Ошибка:', err));
}
// =======================================

function renderQuestion() {
    const q = questions[current];
    hintEl.textContent = '';
    answerInput.value = '';
    isSending = false;

    questionEl.textContent = q.text;
    buttonsEl.innerHTML = '';
    inputArea.classList.add('hidden');

    if (q.type === 'buttons') {
        q.options.forEach(opt => {
            const isObj = typeof opt === 'object' && opt !== null;
            const label = isObj ? opt.label : opt;
            const hoverHint = isObj ? opt.hoverHint : null;

            const btn = document.createElement('button');
            btn.textContent = label;
            
            btn.onclick = () => {
                if (isSending) return;
                isSending = true;
                sendToGoogle(q.text, label);
                setTimeout(nextQuestion, 200); 
            };

            if (hoverHint) {
                btn.addEventListener('mouseenter', () => { hintEl.textContent = hoverHint; });
                btn.addEventListener('mouseleave', () => {
                    if (hintEl.textContent === hoverHint) hintEl.textContent = '';
                });
            }
            buttonsEl.appendChild(btn);
        });

        if (q.runaway) addRunawayButton(q.runaway);
    } else {
        inputArea.classList.remove('hidden');
        hintEl.textContent = q.hint || '';
        answerInput.focus();
    }
}

function addRunawayButton(config) {
    const btn = document.createElement('button');
    btn.textContent = config.label;
    btn.className = 'runaway-btn';
    buttonsEl.appendChild(btn);

    let clicks = 0;

    function jumpAway() {
        const padding = 20;
        const w = btn.offsetWidth  || 140;
        const h = btn.offsetHeight || 50;
        const maxX = window.innerWidth  - w - padding;
        const maxY = window.innerHeight - h - padding;
        const x = padding + Math.random() * Math.max(0, maxX - padding);
        const y = padding + Math.random() * Math.max(0, maxY - padding);
        if (!btn.style.width) btn.style.width = w + 'px';
        btn.style.position = 'fixed';
        btn.style.left = x + 'px';
        btn.style.top  = y + 'px';
    }

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (clicks >= config.maxDodges) return;
        jumpAway();
        clicks++;
        sendToGoogle("Попытка нажать 'Нет'", "Клик №" + clicks);
        if (config.messages && config.messages[clicks - 1]) {
            hintEl.textContent = config.messages[clicks - 1];
        }
        if (clicks >= config.maxDodges) {
            setTimeout(() => {
                btn.classList.add('vanished');
                setTimeout(() => btn.remove(), 1000);
            }, 400);
        }
    });
}

function nextQuestion() {
    document.querySelectorAll('.runaway-btn').forEach(b => b.remove());
    current++;
    if (current >= questions.length) showFinal();
    else renderQuestion();
}

function checkInput() {
    const q = questions[current];
    const val = answerInput.value.trim().toLowerCase();

    if (val === '') {
        hintEl.textContent = 'Напиши хоть что-нибудь, зайка 🥺';
        return;
    }

    if (q.answers === null || q.answers.includes(val)) {
        if (isSending) return;
        isSending = true;
        sendToGoogle(q.text, answerInput.value.trim()); 
        setTimeout(nextQuestion, 200);
    } else {
        hintEl.textContent = 'Хм, попробуй ещё раз 💭 ' + (q.hint || '');
        answerInput.value = '';
    }
}

submitBtn.onclick = checkInput;
answerInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkInput(); });

function showFinal() {
    quizEl.classList.add('hidden');
    finalEl.classList.remove('hidden');
    finalText.textContent = finalMessage;
    for (let i = 0; i < 25; i++) setTimeout(createFloater, i * 70);
}

restartBtn.onclick = () => {
    current = 0;
    finalEl.classList.add('hidden');
    quizEl.classList.remove('hidden');
    renderQuestion();
};

showGalleryBtn.onclick = () => { finalEl.classList.add('hidden'); seasonsMenuEl.classList.remove('hidden'); };
document.getElementById('backToFinalBtn1').onclick = () => { seasonsMenuEl.classList.add('hidden'); finalEl.classList.remove('hidden'); };
document.getElementById('btnWinter').onclick = () => openGallery('winter', 'Зима ❄️');
document.getElementById('btnSummer').onclick = () => openGallery('summer', 'Лето ☀️');
document.getElementById('backToSeasonsBtn').onclick = () => { galleryEl.classList.add('hidden'); seasonsMenuEl.classList.remove('hidden'); };

function openGallery(season, title) {
    galleryTitle.textContent = title;
    galleryGrid.innerHTML = '';
    media[season].forEach(item => {
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.onclick = () => window.open(item.src, '_blank');
            galleryGrid.appendChild(img);
        }
    });
    seasonsMenuEl.classList.add('hidden');
    galleryEl.classList.remove('hidden');
}

const bgLayer = document.getElementById('bgLayer');
const floatSymbols = ['💖', '💕', '💗', '❤️', '💘', '🎄', '🌲', '🎁', '🐱', '🐈', '😻', '🐾'];
const snowSymbols = ['❄️', '❅', '❆', '✻', '✼'];

function createFloater() {
    const el = document.createElement('div');
    el.className = 'floater';
    el.textContent = floatSymbols[Math.floor(Math.random() * floatSymbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (16 + Math.random() * 24) + 'px';
    el.style.animationDuration = (7 + Math.random() * 6) + 's';
    el.style.animationDelay = Math.random() * 2 + 's';
    bgLayer.appendChild(el);
    setTimeout(() => el.remove(), 16000);
}

function createSnow() {
    const el = document.createElement('div');
    el.className = 'snow';
    el.textContent = snowSymbols[Math.floor(Math.random() * snowSymbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (10 + Math.random() * 16) + 'px';
    el.style.animationDuration = (6 + Math.random() * 8) + 's';
    el.style.animationDelay = Math.random() * 3 + 's';
    bgLayer.appendChild(el);
    setTimeout(() => el.remove(), 16000);
}

setInterval(createFloater, 900);
setInterval(createSnow, 500);
renderQuestion();