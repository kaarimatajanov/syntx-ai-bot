// run.js — ЧИТАЕТ prompts.txt С GitHub
(() => {
    const TELEGRAM_TOKEN = "8507186573:AAE4lUjUIH_0mgwUuwDgeh6ZFXU3FBRde0w";
    const CHAT_ID = "6556439452";

    const PROMPTS_URL = "https://raw.githubusercontent.com/kaarimatajanov/syntx-ai-bot/main/prompts.txt";
    const CREATE_FOLDER_URL = "https://raw.githubusercontent.com/kaarimatajanov/syntx-ai-bot/main/create_folder.js";

    const log = (msg) => {
        console.log(`[SyntxBot] ${msg}`);
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `[SyntxBot] ${msg}` })
        }).catch(() => {});
    };

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    const loadHelper = () => {
        const s = document.createElement('script');
        s.src = CREATE_FOLDER_URL;
        document.body.appendChild(s);
    };

    const loadPrompts = async () => {
        try {
            const res = await fetch(PROMPTS_URL);
            const text = await res.text();
            return text.trim().split('\n').map(l => l.trim()).filter(l => l);
        } catch (e) {
            log("ОШИБКА: prompts.txt не загружен!");
            return [];
        }
    };

    const sendPrompt = async (prompt) => {
        const field = document.querySelector('div[contenteditable="true"]');
        if (!field) return false;
        field.textContent = '';
        field.focus();
        document.execCommand('insertText', false, prompt);
        log(`Отправка: ${prompt.substring(0, 60)}...`);
        const btn = document.querySelector('button svg')?.closest('button');
        if (!btn) return false;
        btn.click();
        return true;
    };

    const waitForVideo = () => {
        return new Promise((resolve) => {
            let attempts = 0;
            const check = () => {
                const links = Array.from(document.querySelectorAll('a[href$=".mp4"]'));
                const newLink = links.find(a => !a.dataset.processed);
                if (newLink) {
                    newLink.dataset.processed = 'true';
                    const url = newLink.href;
                    const filename = `video_${++window.videoCounter}.mp4`;
                    fetch(url).then(r => r.blob()).then(blob => {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = filename;
                        a.click();
                        log(`Скачано: ${filename}`);
                        resolve();
                    });
                } else if (attempts++ < 40) {
                    setTimeout(check, 10000);
                } else {
                    log("Таймаут");
                    resolve();
                }
            };
            check();
        });
    };

    const run = async () => {
        window.videoCounter = 0;
        log("Запуск...");
        loadHelper();
        const prompts = await loadPrompts();
        if (prompts.length === 0) return;
        log(`Промптов: ${prompts.length}`);

        for (const p of prompts) {
            if (await sendPrompt(p)) {
                await waitForVideo();
                await wait(7000);
            }
        }
        log("ГОТОВО!");
    };

    run();
})();
