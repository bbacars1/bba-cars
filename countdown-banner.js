/* =========================================================
   BBA CARS — EXPECTED CAR COUNTDOWN BANNER
========================================================= */

(() => {
    "use strict";

    const API_URL = "https://api.bbacars.uz/expected-banner";

    const SESSION_FIRST_KEY = "bbaExpectedBannerFirstShown";
    const SESSION_SECOND_KEY = "bbaExpectedBannerSecondShown";

    const FIRST_DELAY = 5000;
    const SECOND_DELAY = 10000;
    const DISPLAY_TIME = 15000;

    let countdownInterval = null;
    let autoCloseTimer = null;
    let secondBannerTimer = null;

    /* =========================
       LANGUAGE
    ========================= */

    function getCurrentLanguage() {
        return (
            localStorage.getItem("bbaLanguage") ||
            document.documentElement.dataset.bbaLang ||
            "uz"
        );
    }

    function getTexts(carName) {
        const lang = getCurrentLanguage();

        const translations = {
            uz: {
                title: `${carName} tez orada BBA CARS’da`,
                description:
                    "Siz qiziqtirgan avtomobil yo‘lda, tez orada bizda bo‘ladi.",
                arrival: "Taxminiy kelish vaqti:",
                days: "kun",
                hours: "soat",
                minutes: "daqiqa",
                seconds: "soniya",
                details: "Batafsil ma’lumot",
                close: "Yopish"
            },

            ru: {
                title: `${carName} скоро в BBA CARS`,
                description:
                    "Интересующий вас автомобиль уже в пути и скоро будет у нас.",
                arrival: "Ориентировочное время прибытия:",
                days: "дней",
                hours: "часов",
                minutes: "минут",
                seconds: "секунд",
                details: "Подробнее",
                close: "Закрыть"
            },

            zh: {
                title: `${carName} 即将抵达 BBA CARS`,
                description:
                    "您关注的汽车正在运输途中，即将抵达我们的展厅。",
                arrival: "预计到达时间：",
                days: "天",
                hours: "小时",
                minutes: "分钟",
                seconds: "秒",
                details: "了解更多",
                close: "关闭"
            }
        };

        return translations[lang] || translations.uz;
    }

    /* =========================
       DATE
    ========================= */

    function parseArrivalDate(value) {
        if (!value) return NaN;

        if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
        ) {
            value = value.replace(" ", "T");
        }

        return new Date(value).getTime();
    }

    /* =========================
       CLOSE
    ========================= */

    function closeExpectedBanner(banner, onClosed) {
        if (!banner) {
            if (typeof onClosed === "function") onClosed();
            return;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        if (autoCloseTimer) {
            clearTimeout(autoCloseTimer);
            autoCloseTimer = null;
        }

        if (banner.dataset.closing === "1") {
            return;
        }

        banner.dataset.closing = "1";
        banner.classList.add("closing");

        setTimeout(() => {
            banner.remove();

            if (typeof onClosed === "function") {
                onClosed();
            }
        }, 300);
    }

    /* =========================
       SHOW BANNER
    ========================= */

    function showExpectedCountdownBanner(car, onClosed) {
        if (!car || !car.id || !car.arrival_at) {
            return false;
        }

        if (document.querySelector(".bba-countdown-overlay")) {
            return false;
        }

        const arrivalTime = parseArrivalDate(car.arrival_at);

        if (
            !Number.isFinite(arrivalTime) ||
            arrivalTime <= Date.now()
        ) {
            return false;
        }

        const texts = getTexts(car.name || "Avtomobil");

        const banner = document.createElement("div");
        banner.className = "bba-countdown-overlay";

        banner.innerHTML = `
            <div
                class="bba-countdown-banner"
                role="dialog"
                aria-modal="true"
            >
                <button
                    type="button"
                    class="bba-countdown-close"
                    aria-label="${texts.close}"
                >
                    ×
                </button>

                <div class="bba-countdown-image">
                    <img
                        src="${car.image || ""}"
                        alt="${car.name || "BBA CARS"}"
                    >
                </div>

                <div class="bba-countdown-content">

                    <div class="bba-countdown-text">
                        <h2>${texts.title}</h2>

                        <p>
                            ${texts.description}
                        </p>
                    </div>

                    <div class="bba-countdown-bottom">

                        <div class="bba-countdown-label">
                            <span class="bba-countdown-clock">◷</span>

                            <span>
                                ${texts.arrival}
                            </span>
                        </div>

                        <div class="bba-countdown-time">

                            <div>
                                <strong data-countdown="days">
                                    00
                                </strong>
                                <span>${texts.days}</span>
                            </div>

                            <b>:</b>

                            <div>
                                <strong data-countdown="hours">
                                    00
                                </strong>
                                <span>${texts.hours}</span>
                            </div>

                            <b>:</b>

                            <div>
                                <strong data-countdown="minutes">
                                    00
                                </strong>
                                <span>${texts.minutes}</span>
                            </div>

                            <b>:</b>

                            <div>
                                <strong data-countdown="seconds">
                                    00
                                </strong>
                                <span>${texts.seconds}</span>
                            </div>

                        </div>

                        <a
                            class="bba-countdown-details"
                            href="car.html?expected=${encodeURIComponent(car.id)}"
                        >
                            ${texts.details}
                            <span>→</span>
                        </a>

                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        const daysElement =
            banner.querySelector('[data-countdown="days"]');

        const hoursElement =
            banner.querySelector('[data-countdown="hours"]');

        const minutesElement =
            banner.querySelector('[data-countdown="minutes"]');

        const secondsElement =
            banner.querySelector('[data-countdown="seconds"]');

        function updateCountdown() {
            const remaining = arrivalTime - Date.now();

            if (remaining <= 0) {
                closeExpectedBanner(banner, onClosed);
                return;
            }

            const days = Math.floor(
                remaining / (1000 * 60 * 60 * 24)
            );

            const hours = Math.floor(
                (remaining / (1000 * 60 * 60)) % 24
            );

            const minutes = Math.floor(
                (remaining / (1000 * 60)) % 60
            );

            const seconds = Math.floor(
                (remaining / 1000) % 60
            );

            daysElement.textContent =
                String(days).padStart(2, "0");

            hoursElement.textContent =
                String(hours).padStart(2, "0");

            minutesElement.textContent =
                String(minutes).padStart(2, "0");

            secondsElement.textContent =
                String(seconds).padStart(2, "0");
        }

        updateCountdown();

        countdownInterval = setInterval(
            updateCountdown,
            1000
        );

        banner
            .querySelector(".bba-countdown-close")
            .addEventListener("click", () => {
                closeExpectedBanner(banner, onClosed);
            });

        autoCloseTimer = setTimeout(() => {
            if (document.body.contains(banner)) {
                closeExpectedBanner(banner, onClosed);
            }
        }, DISPLAY_TIME);

        return true;
    }

    /* =========================
       SECOND BANNER
    ========================= */

    function scheduleSecondBanner(car) {
        if (!car) return;

        if (
            sessionStorage.getItem(SESSION_SECOND_KEY) === "1"
        ) {
            return;
        }

        if (secondBannerTimer) {
            clearTimeout(secondBannerTimer);
        }

        secondBannerTimer = setTimeout(() => {

            if (
                sessionStorage.getItem(SESSION_SECOND_KEY) === "1"
            ) {
                return;
            }

            const shown =
                showExpectedCountdownBanner(car);

            if (shown) {
                sessionStorage.setItem(
                    SESSION_SECOND_KEY,
                    "1"
                );
            }

        }, SECOND_DELAY);
    }

    /* =========================
       INITIALIZE
    ========================= */

    async function initExpectedCountdownBanner() {
        if (
            sessionStorage.getItem(SESSION_FIRST_KEY) === "1"
        ) {
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `Expected banner API: ${response.status}`
                );
            }

            const cars = await response.json();

            if (!Array.isArray(cars) || cars.length === 0) {
                return;
            }

            const firstCar = cars[0];
            const secondCar = cars[1] || null;

            setTimeout(() => {

                if (
                    sessionStorage.getItem(
                        SESSION_FIRST_KEY
                    ) === "1"
                ) {
                    return;
                }

                const shown =
                    showExpectedCountdownBanner(
                        firstCar,
                        () => {
                            scheduleSecondBanner(
                                secondCar
                            );
                        }
                    );

                if (shown) {
                    sessionStorage.setItem(
                        SESSION_FIRST_KEY,
                        "1"
                    );
                }

            }, FIRST_DELAY);

        } catch (error) {
            console.error(
                "BBA countdown banner xatosi:",
                error
            );
        }
    }

    /* =========================
       START
    ========================= */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initExpectedCountdownBanner
        );
    } else {
        initExpectedCountdownBanner();
    }

})();