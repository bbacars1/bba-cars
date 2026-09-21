/* =====================================================
   BBA CARS — UNIVERSAL CAR CARD
===================================================== */


/* =========================
   IMAGE URL
========================= */

function getCarImageUrl(image) {
    if (!image) return "";

    const url = String(image).trim();

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return "https://api.bbacars.uz/" + url.replace(/^\/+/, "");
}


/* =========================
   IMAGEKIT OPTIMIZATION
========================= */

function getCardImageUrl(image) {
    const url = getCarImageUrl(image);

    if (!url) return "";

    if (url.includes("ik.imagekit.io")) {
        const width = window.innerWidth <= 720 ? 480 : 600;

        const separator = url.includes("?") ? "&" : "?";

        return `${url}${separator}tr=w-${width},q-75,f-auto`;
    }

    return url;
}


/* =========================
   CAR TYPE
========================= */

function getCarTypeLabel(type) {
    if (type === "electric") return "Elektr";
    if (type === "hybrid") return "Gibrid";
    if (type === "gasoline") return "Benzin";

    return "Benzin";
}


/* =========================
   PRICE
========================= */

function formatCarPrice(price) {
    const number = Number(price || 0);

    return `${number.toLocaleString("en-US")} USD`;
}


/* =========================
   CREATE UNIVERSAL CARD
========================= */

function createCarCard(car, index = 0) {

    const card = document.createElement("article");

    card.className = "car-card";

    card.dataset.id = car.id || "";
    card.dataset.type = car.type || "";
    card.dataset.brand = car.brand || "";
    card.dataset.year = car.year || "";
    card.dataset.status = car.status || "";

    const carId = String(car.id || "");

    const isCarsPage =
        document.body.classList.contains("cars-page");


    /* =========================
       BADGE
    ========================= */

    let badgeHTML = "";

    if (car.status === "top") {
        badgeHTML = `
            <span class="car-badge badge-top">
                TOP
            </span>
        `;
    }

    if (car.status === "new") {
        badgeHTML = `
            <span class="car-badge badge-new">
                YANGI
            </span>
        `;
    }

    if (car.status === "discount") {
        badgeHTML = `
            <span class="car-badge badge-sale">
                CHEGIRMA
            </span>
        `;
    }


    /* =========================
       COMPARE
    ========================= */

    const compareHTML = isCarsPage
        ? `
            <button
                type="button"
                class="car-compare-btn"
                data-car-id="${carId}"
            >
                <span class="car-compare-icon">⇄</span>
                <span class="car-compare-text">
                    Taqqoslash
                </span>
            </button>
        `
        : "";


    /* =========================
       CARD HTML
    ========================= */

    card.innerHTML = `

        <div class="car-card-media">

            <img
                class="car-card-image"
                src="${getCardImageUrl(car.image)}"
                alt="${car.name || "BBA CARS"}"
                loading="${index < 8 ? "eager" : "lazy"}"
                fetchpriority="${index < 8 ? "high" : "auto"}"
                decoding="async"
            >

            <div class="car-card-badges">
                ${badgeHTML}
            </div>

            <button
                type="button"
                class="car-favorite-btn"
                aria-label="Sevimlilarga qo‘shish"
            >
                ♡
            </button>

        </div>


        <div class="car-card-body">

            <h3 class="car-card-title">
                ${car.name || ""}
            </h3>


            <div class="car-card-specs">

                <span class="car-spec-item car-spec-type">
                    ${getCarTypeLabel(car.type)}
                </span>

                ${
                    car.year
                        ? `
                            <span class="car-spec-divider">
                                •
                            </span>

                            <span class="car-spec-item car-spec-year">
                                ${car.year}
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="car-card-price">
                ${formatCarPrice(car.price)}
            </div>


            <div class="car-card-actions">

                ${compareHTML}

                <a
                    href="car.html?id=${carId}"
                    class="car-details-link"
                >
                    <span>Batafsil</span>
                    <span class="car-details-arrow">→</span>
                </a>

            </div>

        </div>
    `;


    /* =====================================================
       FAVORITES
    ===================================================== */

    const favoriteBtn =
        card.querySelector(".car-favorite-btn");

    let favorites =
        JSON.parse(
            localStorage.getItem("favorites") || "[]"
        ).map(String);


    if (favorites.includes(carId)) {
        favoriteBtn.classList.add("active");
        favoriteBtn.textContent = "♥";
    }


    favoriteBtn.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        let favorites =
            JSON.parse(
                localStorage.getItem("favorites") || "[]"
            ).map(String);


        if (favorites.includes(carId)) {

            favorites =
                favorites.filter(
                    id => id !== carId
                );

            favoriteBtn.classList.remove("active");
            favoriteBtn.textContent = "♡";

        } else {

            favorites.push(carId);

            favoriteBtn.classList.add("active");
            favoriteBtn.textContent = "♥";
        }


        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );
    });


    /* =====================================================
       COMPARE — ONLY CARS PAGE
    ===================================================== */

    const compareBtn =
        card.querySelector(".car-compare-btn");


    if (compareBtn) {

        let compareCars =
            JSON.parse(
                localStorage.getItem("compareCars") || "[]"
            ).map(String);


        if (compareCars.includes(carId)) {

            compareBtn.classList.add("active");

            compareBtn.innerHTML = `
                <span class="car-compare-icon">✓</span>

                <span class="car-compare-text">
                    Tanlandi
                </span>
            `;
        }


        compareBtn.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();


            let compareCars =
                JSON.parse(
                    localStorage.getItem("compareCars") || "[]"
                ).map(String);


            if (compareCars.includes(carId)) {

                compareCars =
                    compareCars.filter(
                        id => id !== carId
                    );

                compareBtn.classList.remove("active");

                compareBtn.innerHTML = `
                    <span class="car-compare-icon">⇄</span>

                    <span class="car-compare-text">
                        Taqqoslash
                    </span>
                `;

            } else {

                if (compareCars.length >= 3) {

                    alert(
                        "Bir vaqtning o‘zida maksimum 3 ta avtomobilni taqqoslash mumkin."
                    );

                    return;
                }


                compareCars.push(carId);

                compareBtn.classList.add("active");

                compareBtn.innerHTML = `
                    <span class="car-compare-icon">✓</span>

                    <span class="car-compare-text">
                        Tanlandi
                    </span>
                `;
            }


            localStorage.setItem(
                "compareCars",
                JSON.stringify(compareCars)
            );


            if (typeof updateCompareBar === "function") {
                updateCompareBar();
            }

        });
    }


    return card;
}