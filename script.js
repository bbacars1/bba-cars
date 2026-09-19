// ======================================================
// BBA CARS — MAIN SITE
// Admin paneldan avtomobillarni yuklash
// ======================================================

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


function getCardImageUrl(image) {
    const url = getCarImageUrl(image);

    if (!url) return "";

    if (url.includes("ik.imagekit.io")) {
        const width = window.innerWidth <= 720 ? 480 : 600;

return url + `?tr=w-${width},q-75,f-auto`;
    }

    return url;
}

// ======================================================
// O'ZBEKISTON TELEFON RAQAMI — GLOBAL FORMAT
// +998 XX XXX XX XX
// ======================================================

function formatUzbekPhone(input) {

    if (!input) return;

    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "tel");

    function format() {

        let digits = input.value.replace(/\D/g, "");

        // +998 yozilgan bo‘lsa, faqat undan keyingi 9 raqamni olamiz
        if (digits.startsWith("998")) {
            digits = digits.slice(3);
        }

        // Maksimum 9 ta mahalliy raqam
        digits = digits.slice(0, 9);

        let value = "+998";

        if (digits.length > 0) {
            value += " " + digits.slice(0, 2);
        }

        if (digits.length > 2) {
            value += " " + digits.slice(2, 5);
        }

        if (digits.length > 5) {
            value += " " + digits.slice(5, 7);
        }

        if (digits.length > 7) {
            value += " " + digits.slice(7, 9);
        }

        input.value = value;
    }


    input.addEventListener("focus", () => {

        if (!input.value.trim()) {
            input.value = "+998 ";
        }

    });


    input.addEventListener("input", format);


    input.addEventListener("keydown", (event) => {

        // +998 qismini Backspace bilan o‘chirib yubormaydi
        if (
            event.key === "Backspace" &&
            input.selectionStart <= 5
        ) {
            event.preventDefault();
        }

    });

}


function isValidUzbekPhone(phone) {

    const digits = String(phone || "")
        .replace(/\D/g, "");

    return /^998\d{9}$/.test(digits);
}


document.addEventListener("DOMContentLoaded", () => {

    [
        "nasiyaPhone",
        "contactPhone",
        "globalOrderPhone"
    ].forEach((id) => {

        const input = document.getElementById(id);

        if (input) {
            formatUzbekPhone(input);
        }

    });

});


let catalogCars = [];
let catalogVisibleCount = 32;
const CATALOG_PER_PAGE = 32;

const CARS_CACHE_KEY = "bbaCarsCache";
const CARS_CACHE_TIME_KEY = "bbaCarsCacheTime";
const CARS_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 daqiqa

function getCachedCars() {
    try {
        const cachedCars = localStorage.getItem(CARS_CACHE_KEY);
        const cachedTime = Number(
            localStorage.getItem(CARS_CACHE_TIME_KEY) || 0
        );

        if (!cachedCars) return null;

        const cars = JSON.parse(cachedCars);

        if (!Array.isArray(cars) || !cars.length) {
            return null;
        }

        return {
            cars,
            isFresh: Date.now() - cachedTime < CARS_CACHE_MAX_AGE
        };

    } catch (error) {
        console.warn("Cars cache o‘qilmadi:", error);
        return null;
    }
}

// ======================================================
// AVTOMOBILLARNI API DAN OLISH
// ======================================================

function renderCars(cars) {

    const container = document.getElementById("carsContainer");

    if (!container || !Array.isArray(cars)) return;

            // BRAND DROPDOWNNI AVTOMATIK TO'LDIRISH
const brandMenu = document.getElementById("brandFilterMenu");

if (brandMenu) {
    const brands = [
        ...new Set(
            cars
                .map(car => String(car.brand || "").trim())
                .filter(Boolean)
        )
    ].sort();

    brandMenu.innerHTML = "";

    brands.forEach(brand => {
        const option = document.createElement("button");

        option.type = "button";
        option.className = "custom-select-option";
        option.dataset.value = brand.toLowerCase();
        option.textContent = brand;

        brandMenu.appendChild(option);
    });

    const allBrandsOption = document.createElement("button");

allBrandsOption.type = "button";
allBrandsOption.className = "custom-select-option";
allBrandsOption.dataset.value = "";
allBrandsOption.textContent = "Barcha brendlar";

brandMenu.prepend(allBrandsOption);
}

        container.innerHTML = "";


        // ==================================================
        // HAR BIR AVTOMOBIL KARTASI
        // Keyin aynan shu qismni yangi konseptga o'tkazamiz
        // ==================================================

       const shuffledCars = [...cars];

for (let i = shuffledCars.length - 1; i > 0; i--) {

    const j =
        Math.floor(Math.random() * (i + 1));

    [shuffledCars[i], shuffledCars[j]] =
        [shuffledCars[j], shuffledCars[i]];
}

const isCarsPage =
    window.location.pathname.includes("cars.html");

const homeCarLimit =
    window.innerWidth <= 720 ? 4 : 8;

const carsToShow =
    isCarsPage
        ? shuffledCars
        : shuffledCars.slice(0, homeCarLimit);

       const isCatalogPage =
    window.location.pathname.includes("cars.html");

if (isCatalogPage) {
    catalogCars = carsToShow;
}

const visibleCars =
    isCatalogPage
        ? catalogCars.slice(0, catalogVisibleCount)
        : carsToShow;

visibleCars.forEach((car, index) => {

            const card = document.createElement("article");

            card.className = "car-card";

            card.dataset.id = car.id || "";
card.dataset.type = car.type || "";
card.dataset.brand = car.brand || "";
card.dataset.year = car.year || "";
card.dataset.status = car.status || "";
           card.innerHTML = `

    <div class="car-card-media">

       <img
    src="${getCardImageUrl(car.image)}"
    alt="${car.name || "BBA CARS"}"
    loading="${index < 8 ? "eager" : "lazy"}"
fetchpriority="${index < 8 ? "high" : "auto"}"
decoding="async"
>

        <div class="car-card-badges">

            ${
                car.status === "top"
                    ? '<span class="car-badge badge-top">TOP</span>'
                    : ""
            }

            ${
                car.status === "new"
                    ? '<span class="car-badge badge-new">YANGI</span>'
                    : ""
            }

            ${
                car.status === "discount"
                    ? '<span class="car-badge badge-sale">CHEGIRMA</span>'
                    : ""
            }

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

        <div class="car-card-price">
            ${
                Number(car.price || 0).toLocaleString("en-US")
            } USD
        </div>


        <div class="car-card-specs">

    <span class="car-spec-item">
        <span class="car-spec-icon">◉</span>
        ${
            car.type === "electric"
                ? "Elektr"
                : car.type === "hybrid"
                ? "Gibrid"
                : "Benzin"
        }
    </span>

   ${
    car.year
        ? `<span class="car-spec-item car-spec-year">${car.year}</span>`
        : ""
}

    ${
        car.seats
            ? `
                <span class="car-spec-item">
                    <span class="car-spec-icon">♙</span>
                    ${car.seats} o‘rin
                </span>
            `
            : ""
    }

    ${
        car.range
            ? `
                <span class="car-spec-item">
                    <span class="car-spec-icon">◷</span>
                    ${car.range} km
                </span>
            `
            : ""
    }

</div>


        <div class="car-card-features">

            ${
                car.camera360 === "yes"
                    ? "<span>360° kamera</span>"
                    : ""
            }

            ${
                car.hud === "yes"
                    ? "<span>HUD display</span>"
                    : ""
            }

            ${
                car.seatVentilation === "yes"
                    ? "<span>Ventilyatsiya</span>"
                    : ""
            }

            ${
                car.airSuspension === "yes"
                    ? "<span>Pnevma</span>"
                    : ""
            }

        </div>


       <div class="car-card-actions">

    <button
        type="button"
        class="car-compare-btn"
        data-car-id="${car.id}"
    >
        <span class="car-compare-icon">⇄</span>
        Taqqoslash
    </button>

    <a
        href="car.html?id=${car.id}"
        class="car-details-link"
    >
        Batafsil
        <span>→</span>
    </a>

</div>

    </div>

`;


const favoriteBtn = card.querySelector(".car-favorite-btn");

const favorites =
    JSON.parse(localStorage.getItem("favorites") || "[]");

const carId = String(car.id);

if (favorites.includes(carId)) {
    favoriteBtn.classList.add("active");
    favoriteBtn.textContent = "♥";
}

favoriteBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    let favorites =
        JSON.parse(localStorage.getItem("favorites") || "[]");

    if (favorites.includes(carId)) {
        favorites = favorites.filter(id => id !== carId);

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


const compareBtn = card.querySelector(".car-compare-btn");

let compareCars =
    JSON.parse(localStorage.getItem("compareCars") || "[]")
        .map(String);

if (compareCars.includes(carId)) {
    compareBtn.classList.add("active");
    compareBtn.innerHTML = `
        <span class="car-compare-icon">✓</span>
        Tanlandi
    `;
}

compareBtn.addEventListener("click", (event) => {

    event.preventDefault();
    event.stopPropagation();

    let compareCars =
        JSON.parse(localStorage.getItem("compareCars") || "[]")
            .map(String);

    if (compareCars.includes(carId)) {

        compareCars =
            compareCars.filter(id => id !== carId);

        compareBtn.classList.remove("active");

        compareBtn.innerHTML = `
            <span class="car-compare-icon">⇄</span>
            Taqqoslash
        `;

    } else {

        if (compareCars.length >= 3) {
    alert("Bir vaqtning o‘zida maksimum 3 ta avtomobilni taqqoslash mumkin.");
    return;
}

        compareCars.push(carId);

        compareBtn.classList.add("active");

        compareBtn.innerHTML = `
            <span class="car-compare-icon">✓</span>
            Tanlandi
        `;
    }

   localStorage.setItem(
    "compareCars",
    JSON.stringify(compareCars)
);

updateCompareBar();

});

updateCompareBar();


            container.appendChild(card);

        });


        const loadMoreBtn = document.getElementById("catalogLoadMoreBtn");

if (loadMoreBtn && isCatalogPage) {

    if (catalogVisibleCount >= catalogCars.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-flex";
    }
}


       if (document.body.classList.contains("cars-page")) {

    const params = new URLSearchParams(window.location.search);

    const query = params.get("q")?.trim() || "";

    const desktopSearch =
        document.getElementById("carSearch");

    const mobileSearch =
        document.getElementById("mobileCarSearch");

    if (query) {
        if (desktopSearch) {
            desktopSearch.value = query;
        }

        if (mobileSearch) {
            mobileSearch.value = query;
        }
    }

    if (params.get("favorites") === "1") {

        favoritesOnlyMode = true;

        const favoritesButton =
            document.querySelector(".catalog-favorites-btn");

        favoritesButton?.classList.add("active");
    }

    filterCatalogCars();
}


        console.log(
            "BBA CARS:",
            cars.length,
            "ta avtomobil yuklandi"
        );
}

async function loadCars() {

    const container = document.getElementById("carsContainer");

    if (!container) return;

    const cachedData = getCachedCars();

if (cachedData && cachedData.cars) {
    renderCars(cachedData.cars);

    console.log(
        "BBA CARS: cache'dan darhol yuklandi —",
        cachedData.cars.length,
        "ta avtomobil"
    );
}

    try {

       const response = await fetch(
    "https://api.bbacars.uz/cars",
    {
        cache: "no-store"
    }
);

        if (!response.ok) {
            throw new Error(
                "Backend javob bermadi: " + response.status
            );
        }

        const cars = await response.json();

        // Avtomobillarni localStorage cache'ga saqlash
try {
    localStorage.setItem(
        CARS_CACHE_KEY,
        JSON.stringify(cars)
    );

    localStorage.setItem(
        CARS_CACHE_TIME_KEY,
        String(Date.now())
    );
} catch (error) {
    console.warn("Cars cache saqlanmadi:", error);
}

if (!cachedData || !cachedData.cars) {
    renderCars(cars);
}




    } catch (error) {

        console.error(
            "Avtomobillarni yuklashda xatolik:",
            error
        );

        if (!cachedData || !cachedData.cars) {
    container.innerHTML = `
        <p>
            Avtomobillarni yuklab bo'lmadi.
        </p>
    `;
}
    }
}


// ======================================================
// CARS PAGE — TAQQOSLASH PANELI
// ======================================================

function updateCompareBar() {

    const compareBar =
        document.getElementById("compareBar");

    const compareCount =
        document.getElementById("compareCount");

    if (!compareBar || !compareCount) return;

    const compareCars =
        JSON.parse(
            localStorage.getItem("compareCars") || "[]"
        );

    const count = compareCars.length;

    compareCount.textContent =
        `${count} ta avtomobil tanlandi`;

    if (count > 0) {
        compareBar.classList.add("show");
    } else {
        compareBar.classList.remove("show");
    }
}
    document.addEventListener("DOMContentLoaded", () => {
    updateCompareBar();
});


// ======================================================
// COMPARE OPEN BUTTON
// ======================================================

document.addEventListener("click", (event) => {

    const compareOpenBtn =
        event.target.closest("#compareOpenBtn");

    if (!compareOpenBtn) return;

    const compareCars =
        JSON.parse(
            localStorage.getItem("compareCars") || "[]"
        );

    if (compareCars.length < 2) {
        alert("Taqqoslash uchun kamida 2 ta avtomobil tanlang.");
        return;
    }

    window.location.href = "compare.html";

});


// ======================================================
// COMPARE CLEAR BUTTON
// ======================================================

document.addEventListener("click", (event) => {

    const clearBtn =
        event.target.closest("#compareClearBtn");

    if (!clearBtn) return;

    localStorage.removeItem("compareCars");

    loadCars();

    updateCompareBar();

});

// ======================================================
// CARS PAGE — YANA KO'RSATISH
// ======================================================

document.addEventListener("click", (event) => {

    const loadMoreBtn =
        event.target.closest("#catalogLoadMoreBtn");

    if (!loadMoreBtn) return;

    catalogVisibleCount += CATALOG_PER_PAGE;

    loadCars();
});

function filterCars() {
    const searchInput = document.getElementById("carSearch");
    const brandFilter = document.getElementById("brandFilter");
    const typeFilter = document.getElementById("typeFilter");
    const priceFilter = document.getElementById("priceFilter");

    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const brandValue = brandFilter
        ? brandFilter.value.toLowerCase()
        : "";

    const typeValue = typeFilter
        ? typeFilter.value.toLowerCase()
        : "";

    const priceValue = priceFilter
        ? priceFilter.value
        : "";

    document.querySelectorAll(".car-card").forEach((card) => {
        const title =
            card.querySelector(".car-card-title")
                ?.textContent.toLowerCase() || "";

        const type =
            String(card.dataset.type || "").toLowerCase();

        const priceText =
            card.querySelector(".car-card-price")
                ?.textContent.replace(/[^\d]/g, "") || "0";

        const price = Number(priceText);

        const matchesSearch =
            !searchValue || title.includes(searchValue);

       const matchesBrand =
    !brandValue ||
    title.includes(brandValue);

        const matchesType =
            !typeValue || type === typeValue;

        let matchesPrice = true;

        if (priceValue === "0-20000") {
            matchesPrice = price <= 20000;
        }

        if (priceValue === "20000-30000") {
            matchesPrice = price > 20000 && price <= 30000;
        }

        if (priceValue === "30000-50000") {
            matchesPrice = price > 30000 && price <= 50000;
        }

        if (priceValue === "50000+") {
            matchesPrice = price > 50000;
        }

        if (
            matchesSearch &&
            matchesBrand &&
            matchesType &&
            matchesPrice
        ) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}


// ======================================================
// SAYT OCHILGANDA
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    loadCars
);





// ======================================================
// CUSTOM SELECTS
// ======================================================

document.addEventListener("click", (event) => {

    const trigger = event.target.closest(".custom-select-trigger");

    if (trigger) {
        const select = trigger.closest(".custom-select");

        document.querySelectorAll(".custom-select.open").forEach((item) => {
            if (item !== select) {
                item.classList.remove("open");
            }
        });

        select.classList.toggle("open");
        return;
    }


    const option = event.target.closest(".custom-select-option");

    if (option) {
        const select = option.closest(".custom-select");

        if (!select) return;

        const triggerText = select.querySelector(
            ".custom-select-trigger span:first-child"
        );

        const hiddenInput = select.querySelector(
            'input[type="hidden"]'
        );

        if (triggerText) {
            triggerText.textContent = option.textContent.trim();
        }

        if (hiddenInput) {
    hiddenInput.value = option.dataset.value || "";

    if (document.body.classList.contains("cars-page")) {

        // Gibrid / Elektr tanlansa Benzin filtrini bekor qiladi
        if (hiddenInput.id === "typeFilter" && hiddenInput.value) {
            const fuelFilter =
                document.getElementById("fuelFilter");

            if (fuelFilter) {
                fuelFilter.value = "";
            }
        }

        // Benzin tanlansa Gibrid / Elektr filtrini bekor qiladi
        if (hiddenInput.id === "fuelFilter" && hiddenInput.value) {
            const typeFilter =
                document.getElementById("typeFilter");

            if (typeFilter) {
                typeFilter.value = "";
            }
        }

        filterCatalogCars();
    }
}

        select.classList.remove("open");

        return;
    }


    if (!event.target.closest(".custom-select")) {
        document.querySelectorAll(".custom-select.open").forEach((select) => {
            select.classList.remove("open");
        });
    }

});







// ======================================================
// QIDIRUV VA FILTERLARNI ISHGA TUSHIRISH
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("carSearch");
    const searchButton = document.querySelector(".search-submit-btn");

    function goToSearch() {
        const query = searchInput?.value.trim() || "";

        if (!query) return;

        window.location.href =
            "cars.html?q=" + encodeURIComponent(query);
    }

    searchButton?.addEventListener("click", goToSearch);

    searchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            goToSearch();
        }
    });
});


















// ======================================================
// CARS PAGE — CATALOG FILTER
// ======================================================

function filterCatalogCars() {
    if (!document.body.classList.contains("cars-page")) return;
const mobileSearchInput =
    document.getElementById("mobileCarSearch");

const desktopSearchInput =
    document.getElementById("carSearch");

const searchValue =
    (
        window.innerWidth <= 720
            ? (mobileSearchInput?.value ?? "")
            : (desktopSearchInput?.value ?? "")
    )
    .toLowerCase()
    .trim();
   
    const brandFilter = document.getElementById("brandFilter");
    const typeFilter = document.getElementById("typeFilter");
    const fuelFilter = document.getElementById("fuelFilter");

    

    const brandValue =
        brandFilter?.value.toLowerCase().trim() || "";

    const typeValue =
        typeFilter?.value.toLowerCase().trim() || "";

    const fuelValue =
        fuelFilter?.value.toLowerCase().trim() || "";

   let visibleCount = 0;

const favoriteIds =
    JSON.parse(localStorage.getItem("favorites") || "[]")
        .map(String);

document.querySelectorAll(".car-card").forEach((card) => {
    const title =
        card.querySelector(".car-card-title")
            ?.textContent.toLowerCase() || "";

    const cardType =
        String(card.dataset.type || "")
            .toLowerCase()
            .trim();

    const matchesSearch =
        !searchValue ||
        title.includes(searchValue);

    const cardBrand =
    String(card.dataset.brand || "")
        .toLowerCase()
        .trim();

const matchesBrand =
    !brandValue ||
    cardBrand === brandValue;

    const matchesType =
        !typeValue ||
        cardType === typeValue;

    const matchesFuel =
        !fuelValue ||
        cardType === fuelValue;

        const carId = String(card.dataset.id || "");

const matchesFavorite =
    !favoritesOnlyMode ||
    favoriteIds.includes(carId);

    const isVisible =
    matchesSearch &&
    matchesBrand &&
    matchesType &&
    matchesFuel &&
    matchesFavorite;

    card.style.display = isVisible ? "" : "none";

    if (isVisible) {
        visibleCount++;
    }
});

let emptyState =
    document.getElementById("catalogEmptyState");

if (!emptyState) {
    emptyState = document.createElement("div");

    emptyState.id = "catalogEmptyState";
    emptyState.className = "catalog-empty-state";

    emptyState.innerHTML = `
        <strong>Mos avtomobil topilmadi</strong>
        <span>Qidiruv yoki filterlarni o‘zgartirib ko‘ring.</span>
    `;

    const carsContainer =
        document.getElementById("carsContainer");

    carsContainer?.after(emptyState);
}

emptyState.style.display =
    visibleCount === 0
        ? "flex"
        : "none";
}


// QIDIRUV — YOZGANDA DARHOL ISHLAYDI




// QIDIRUVNI × BILAN TOZALASH

document.addEventListener("click", (event) => {
    const clearBtn =
        event.target.closest(".catalog-search-clear");

    if (!clearBtn) return;

    const searchInput =
        document.getElementById("carSearch");

    if (searchInput) {
        searchInput.value = "";
        filterCatalogCars();
    }
});









// ======================================================
// CARS PAGE — SARALASH
// ======================================================

function sortCatalogCars(sortType) {
    if (!document.body.classList.contains("cars-page")) return;

    const container =
        document.getElementById("carsContainer");

    if (!container) return;

    const cards =
        Array.from(container.querySelectorAll(".car-card"));

    // Birinchi tartibni eslab qolamiz
    cards.forEach((card, index) => {
        if (!card.dataset.originalOrder) {
            card.dataset.originalOrder = String(index + 1);
        }
    });

    cards.sort((a, b) => {
        if (sortType === "default") {
            return (
                Number(a.dataset.originalOrder) -
                Number(b.dataset.originalOrder)
            );
        }

        const priceA =
            Number(
                a.querySelector(".car-card-price")
                    ?.textContent.replace(/[^\d]/g, "") || 0
            );

        const priceB =
            Number(
                b.querySelector(".car-card-price")
                    ?.textContent.replace(/[^\d]/g, "") || 0
            );

        if (sortType === "price-asc") {
            return priceA - priceB;
        }

        if (sortType === "price-desc") {
            return priceB - priceA;
        }

        return 0;
    });

    cards.forEach((card) => {
        container.appendChild(card);
    });
}


document.addEventListener("click", (event) => {
    const sortOption =
        event.target.closest("[data-sort]");

    if (!sortOption) return;

    sortCatalogCars(
        sortOption.dataset.sort || "default"
    );
});









// ====================================================== // CARS PAGE — SEVIMLILAR FILTERI // ======================================================
let favoritesOnlyMode = false;
function filterFavoriteCars() { if (!document.body.classList.contains("cars-page")) return;
filterCatalogCars();
}
document.addEventListener("click", (event) => { const favoritesButton = event.target.closest(".catalog-favorites-btn");
if (!favoritesButton) return;

favoritesOnlyMode = !favoritesOnlyMode;

favoritesButton.classList.toggle(
    "active",
    favoritesOnlyMode
);

filterFavoriteCars();
});








// ==========================
// NASIYA — CAR SLIDER
// ==========================

const nasiyaSlides = document.querySelectorAll(".nasiya-slide");

if (nasiyaSlides.length > 1) {
  let nasiyaCurrentSlide = 0;

  setInterval(() => {
    nasiyaSlides[nasiyaCurrentSlide].classList.remove("active");

    nasiyaCurrentSlide =
      (nasiyaCurrentSlide + 1) % nasiyaSlides.length;

    nasiyaSlides[nasiyaCurrentSlide].classList.add("active");
  }, 4000);
}










// ======================================================
// NASIYA PAGE — RANDOM 8 AVTOMOBIL
// ======================================================

async function loadNasiyaCars() {
    const container = document.getElementById("nasiyaCarsContainer");

    if (!container) return;

    try {
        const response = await fetch(
            "https://api.bbacars.uz/cars",
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Avtomobillarni yuklab bo‘lmadi");
        }

        const cars = await response.json();

        // Har refreshda avtomobillarni aralashtiramiz
        const shuffledCars = [...cars];

        for (let i = shuffledCars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [shuffledCars[i], shuffledCars[j]] =
                [shuffledCars[j], shuffledCars[i]];
        }

        // Faqat 8 ta avtomobil
        const carsToShow = shuffledCars.slice(0, 8);

        container.innerHTML = "";

        carsToShow.forEach((car) => {
            const card = document.createElement("article");

            card.className = "car-card";

            card.innerHTML = `
                <div class="car-card-media">

                    <img
                        src="${getCardImageUrl(car.image)}"
                        alt="${car.name || "BBA CARS"}"
                        loading="lazy"
                    >

                    <div class="car-card-badges">

                        ${
                            car.status === "top"
                                ? '<span class="car-badge badge-top">TOP</span>'
                                : ""
                        }

                        ${
                            car.status === "new"
                                ? '<span class="car-badge badge-new">YANGI</span>'
                                : ""
                        }

                        ${
                            car.status === "discount"
                                ? '<span class="car-badge badge-sale">CHEGIRMA</span>'
                                : ""
                        }

                    </div>

                </div>

                <div class="car-card-body">

                    <h3 class="car-card-title">
                        ${car.name || ""}
                    </h3>

                    <div class="car-card-price">
                        ${Number(car.price || 0).toLocaleString("en-US")} USD
                    </div>

                    <div class="car-card-specs">

                        <span class="car-spec-item">
                            ${
                                car.type === "electric"
                                    ? "Elektr"
                                    : car.type === "hybrid"
                                    ? "Gibrid"
                                    : "Benzin"
                            }
                        </span>

                        ${
                            car.seats
                                ? `<span class="car-spec-item">${car.seats} o‘rin</span>`
                                : ""
                        }

                        ${
                            car.range
                                ? `<span class="car-spec-item">${car.range} km</span>`
                                : ""
                        }

                    </div>

                    <a
                        href="car.html?id=${car.id}"
                        class="car-details-link"
                    >
                        Batafsil
                        <span>→</span>
                    </a>

                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Nasiya avtomobillari xatosi:", error);

        container.innerHTML = `
            <p>Avtomobillarni yuklab bo‘lmadi.</p>
        `;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadNasiyaCars
);






// ======================================================
// NASIYA PAGE — ARIZA YUBORISH
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const nasiyaForm =
        document.getElementById("nasiyaOrderForm");

    if (!nasiyaForm) return;

    nasiyaForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name =
            document.getElementById("nasiyaName")?.value.trim();

        const phone =
            document.getElementById("nasiyaPhone")?.value.trim();

        const car =
            document.getElementById("nasiyaCar")?.value.trim();

        if (!name || !isValidUzbekPhone(phone)) {
    alert("Telefon raqamini +998 XX XXX XX XX formatida kiriting.");
    return;
}

        try {

            const response = await fetch(
                "https://api.bbacars.uz/order",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        car: car || "Nasiya bo‘yicha umumiy ariza"
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Ariza yuborilmadi");
            }

            const successModal = document.getElementById("nasiyaSuccessModal");

if (successModal) {
    successModal.classList.add("active");
    successModal.setAttribute("aria-hidden", "false");
}

            nasiyaForm.reset();

        } catch (error) {

            console.error(
                "Nasiya ariza xatosi:",
                error
            );

            alert(
                "Arizani yuborishda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }

    });

});








// ======================================================
// NASIYA SUCCESS MODAL — YOPISH
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    const successModal = document.getElementById("nasiyaSuccessModal");
    const closeBtn = document.getElementById("nasiyaSuccessClose");
    const okBtn = document.getElementById("nasiyaSuccessOk");
    const backdrop = document.querySelector(".nasiya-success-backdrop");

    if (!successModal) return;

    function closeSuccessModal() {
        successModal.classList.remove("active");
        successModal.setAttribute("aria-hidden", "true");
    }

    closeBtn?.addEventListener("click", closeSuccessModal);
    okBtn?.addEventListener("click", closeSuccessModal);
    backdrop?.addEventListener("click", closeSuccessModal);
});









// ======================================================
// NASIYA FAQ — ACCORDION
// ======================================================

document.addEventListener("click", (event) => {
    const question = event.target.closest(".nasiya-faq-question");

    if (!question) return;

    const currentItem = question.closest(".nasiya-faq-item");

    if (!currentItem) return;

    const isOpen = currentItem.classList.contains("active");

    // Boshqa ochiq FAQ'larni yopamiz
    document.querySelectorAll(".nasiya-faq-item.active").forEach((item) => {
        item.classList.remove("active");
    });

    // Bosilgan savol yopiq bo'lsa ochamiz
    if (!isOpen) {
        currentItem.classList.add("active");
    }
});















// ======================================================
// CONTACT PAGE — MUROJAAT YUBORISH
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const contactForm =
        document.getElementById("contactOrderForm");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name =
            document.getElementById("contactName")?.value.trim();

        const phone =
            document.getElementById("contactPhone")?.value.trim();

        const message =
            document.getElementById("contactMessage")?.value.trim();

        if (!name || !phone) {
            alert("Ismingiz va telefon raqamingizni kiriting.");
            return;
        }

        try {

            const response = await fetch(
                "https://api.bbacars.uz/order",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        car: message
                            ? "Kontakt murojaati: " + message
                            : "Kontakt sahifasidan murojaat"
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Murojaat yuborilmadi");
            }

            const contactSuccessModal =
    document.getElementById("contactSuccessModal");

if (contactSuccessModal) {
    contactSuccessModal.classList.add("active");
    contactSuccessModal.setAttribute("aria-hidden", "false");
}

            contactForm.reset();

        } catch (error) {

            console.error(
                "Kontakt murojaat xatosi:",
                error
            );

            alert(
                "Murojaatni yuborishda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }

    });

});








// ======================================================
// CONTACT SUCCESS MODAL — CLOSE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("contactSuccessModal");
    const closeBtn = document.getElementById("contactSuccessClose");
    const okBtn = document.getElementById("contactSuccessOk");
    const backdrop = modal?.querySelector(".contact-success-backdrop");

    if (!modal) return;

    function closeContactSuccessModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    }

    closeBtn?.addEventListener("click", closeContactSuccessModal);
    okBtn?.addEventListener("click", closeContactSuccessModal);
    backdrop?.addEventListener("click", closeContactSuccessModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeContactSuccessModal();
        }
    });
});












// ======================================================
// GLOBAL HEADER ORDER MODAL
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const orderButtons =
        document.querySelectorAll(".header-order-btn");

    if (!orderButtons.length) return;

    const modal = document.createElement("div");

    modal.className = "global-order-modal";

    modal.innerHTML = `
        <div class="global-order-backdrop"></div>

        <div class="global-order-dialog">

            <button
                type="button"
                class="global-order-close"
                aria-label="Yopish"
            >
                ×
            </button>

            <span class="global-order-label">
                BBA CARS
            </span>

            <h2>
                Ariza qoldiring
            </h2>

            <p>
                Ma’lumotlaringizni qoldiring.
                Menejerimiz siz bilan tez orada bog‘lanadi.
            </p>

            <form id="globalOrderForm">

                <label for="globalOrderName">
                    Ismingiz
                </label>

                <input
                    type="text"
                    id="globalOrderName"
                    placeholder="Ismingizni kiriting"
                    required
                >

                <label for="globalOrderPhone">
                    Telefon raqamingiz
                </label>

                <input
                    type="tel"
                    id="globalOrderPhone"
                    placeholder="+998 90 123 45 67"
                    required
                >

                <button
                    type="submit"
                    class="global-order-submit"
                >
                    Ariza yuborish
                    <span>→</span>
                </button>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    const globalPhoneInput =
    modal.querySelector("#globalOrderPhone");

formatUzbekPhone(globalPhoneInput);
const successModal = document.createElement("div");

successModal.className = "global-order-success";

successModal.innerHTML = `
    <div class="global-order-success-backdrop"></div>

    <div class="global-order-success-dialog">

        <span class="global-order-success-icon">✓</span>

        <span class="global-order-success-label">
            BBA CARS
        </span>

        <h3>
            Arizangiz yuborildi
        </h3>

        <p>
            Ma’lumotlaringiz qabul qilindi.
            Menejerimiz siz bilan tez orada bog‘lanadi.
        </p>

        <button
            type="button"
            class="global-order-success-btn"
        >
            Tushunarli
        </button>

    </div>
`;

document.body.appendChild(successModal);

const successBtn =
    successModal.querySelector(".global-order-success-btn");

const successBackdrop =
    successModal.querySelector(".global-order-success-backdrop");

function closeGlobalSuccessModal() {
    successModal.classList.remove("show");
    document.body.style.overflow = "";
}

successBtn.addEventListener(
    "click",
    closeGlobalSuccessModal
);

successBackdrop.addEventListener(
    "click",
    closeGlobalSuccessModal
);

    const closeBtn =
        modal.querySelector(".global-order-close");

    const backdrop =
        modal.querySelector(".global-order-backdrop");


    function openOrderModal() {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }


    function closeOrderModal() {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }


    orderButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            openOrderModal();

        });

    });


    closeBtn.addEventListener(
        "click",
        closeOrderModal
    );


    backdrop.addEventListener(
        "click",
        closeOrderModal
    );


    const globalOrderForm =
    modal.querySelector("#globalOrderForm");

globalOrderForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        modal.querySelector("#globalOrderName").value.trim();

    const phone =
        modal.querySelector("#globalOrderPhone").value.trim();

    if (!name || !phone) {
        alert("Ismingiz va telefon raqamingizni kiriting.");
        return;
    }

    try {

        const response = await fetch(
            "https://api.bbacars.uz/order",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    car: "Header orqali umumiy ariza"
                })
            }
        );

        if (!response.ok) {
            throw new Error("Ariza yuborilmadi");
        }

       globalOrderForm.reset();

closeOrderModal();

successModal.classList.add("show");
document.body.style.overflow = "hidden";

    } catch (error) {

        console.error(
            "Global ariza xatosi:",
            error
        );

        alert(
            "Arizani yuborishda xatolik yuz berdi. Qayta urinib ko‘ring."
        );

    }

});

});











// ======================================================
// HEADER — SEVIMLILAR
// ======================================================

document.addEventListener("click", (event) => {

    const headerFavorite =
        event.target.closest(".header-favorites");

    if (!headerFavorite) return;

    event.preventDefault();

    window.location.href = "cars.html?favorites=1";
});









// ======================================================
// BBA CARS — GLOBAL SCROLL FADE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const fadeElements = document.querySelectorAll(
        "section > *:not(.car-card)"
    );

    fadeElements.forEach((element) => {

        // Avtomobil kartalariga tegmaymiz
        if (
            element.classList.contains("car-card") ||
            element.closest(".car-card")
        ) {
            return;
        }

        element.classList.add("scroll-fade");
    });

    const fadeObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("show");

                    // Faqat bir marta animatsiya
                    fadeObserver.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.12
        }
    );

    document
        .querySelectorAll(".scroll-fade")
        .forEach((element) => {
            fadeObserver.observe(element);
        });

});










// ======================================================
// BBA CARS — PREMIUM HERO SLIDER
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const slides =
        document.querySelectorAll(".hero-slide");

    const dots =
        document.querySelectorAll(".hero-dot");

    const prevBtn =
        document.querySelector(".hero-arrow-prev");

    const nextBtn =
        document.querySelector(".hero-arrow-next");

    if (!slides.length) return;


    let currentSlide = 0;
    let heroTimer;


    function showHeroSlide(index) {

        if (index >= slides.length) {
            index = 0;
        }

        if (index < 0) {
            index = slides.length - 1;
        }


        slides.forEach((slide) => {
            slide.classList.remove("active");
        });

        dots.forEach((dot) => {
            dot.classList.remove("active");
        });


        slides[index].classList.add("active");

        if (dots[index]) {
            dots[index].classList.add("active");
        }

        currentSlide = index;
    }


    function nextHeroSlide() {
        showHeroSlide(currentSlide + 1);
    }


    function startHeroSlider() {

        clearInterval(heroTimer);

        heroTimer = setInterval(() => {
            nextHeroSlide();
        }, 5000);
    }


    if (nextBtn) {

        nextBtn.addEventListener("click", () => {

            showHeroSlide(currentSlide + 1);

            startHeroSlider();
        });

    }


    if (prevBtn) {

        prevBtn.addEventListener("click", () => {

            showHeroSlide(currentSlide - 1);

            startHeroSlider();
        });

    }


    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            showHeroSlide(index);

            startHeroSlider();
        });

    });


    showHeroSlide(0);

    startHeroSlider();

});














// ======================================================
// COMPARE PAGE — LOAD SELECTED CARS
// ======================================================

async function loadComparePage() {

    const compareGrid =
        document.getElementById("compareGrid");

    if (!compareGrid) return;

    const compareIds =
        JSON.parse(
            localStorage.getItem("compareCars") || "[]"
        ).map(String);

   if (compareIds.length === 0) {
    compareGrid.innerHTML = `
        <div class="compare-empty">

            <div class="compare-empty-icon">⇄</div>

            <h3>Avtomobil tanlanmagan</h3>

            <p>
                Taqqoslash uchun kamida 2 ta avtomobil tanlang.
            </p>

            <a href="cars.html" class="compare-empty-btn">
                Avtomobil tanlash
            </a>

        </div>
    `;

    return;
}

    try {

        const response =
            await fetch("https://api.bbacars.uz/cars");

        const cars =
            await response.json();

       const selectedCars =
    compareIds
        .map(id =>
            cars.find(
                car => String(car.id) === String(id)
            )
        )
        .filter(Boolean);

            compareGrid.dataset.count = selectedCars.length;

            if (selectedCars.length === 1) {
    compareGrid.innerHTML = `
        <div class="compare-empty compare-one-car">
            <div class="compare-empty-icon">⇄</div>

            <h3>Yana bitta avtomobil tanlang</h3>

            <p>
                Taqqoslash uchun kamida 2 ta avtomobil kerak.
                Tanlangan avtomobil saqlanib turadi.
            </p>

            <a href="cars.html" class="compare-empty-btn">
                Avtomobil tanlash
            </a>
        </div>
    `;

    return;
}

        compareGrid.innerHTML = "";

        selectedCars.forEach(car => {

            let image = "";

            try {

                const images =
                    typeof car.images === "string"
                        ? JSON.parse(car.images)
                        : car.images;

                if (
                    Array.isArray(images) &&
                    images.length > 0
                ) {
                    image = images[0];
                }

            } catch (error) {}

            const card =
                document.createElement("div");

            card.className = "compare-car-card";

            card.innerHTML = `
            <button
    type="button"
    class="compare-remove-btn"
    data-car-id="${car.id}"
    aria-label="Taqqoslashdan olib tashlash"
>
    ×
</button>
                <div class="compare-car-image">
                    <img
                        src="${image || car.image || ""}"
                        alt="${car.name || "Avtomobil"}"
                    >
                </div>

                <div class="compare-car-content">

                    <h2>
                        ${car.name || "Avtomobil"}
                    </h2>

                    <div class="compare-car-price">
                        ${Number(car.price || 0).toLocaleString("en-US")} $
                    </div>


                    <div class="compare-spec-list">

    <div class="compare-spec-group-title">
        Asosiy xususiyatlar
    </div>

    <div class="compare-spec-row">
        <span>Yil</span>
        <strong>${car.year || "—"}</strong>
    </div>

    <div class="compare-spec-row">
        <span>Turi</span>
        <strong>
            ${
                car.type === "electric"
                    ? "Elektr"
                    : car.type === "hybrid"
                    ? "Gibrid"
                    : car.type === "petrol"
                    ? "Benzin"
                    : car.type === "diesel"
                    ? "Dizel"
                    : car.type || "—"
            }
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Zapas xod</span>
        <strong>
            ${car.range ? `${car.range} km` : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Batareya</span>
        <strong>
            ${car.battery ? `${car.battery} kWh` : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Dvigatel</span>
        <strong>${car.engine || "—"}</strong>
    </div>

    <div class="compare-spec-row">
        <span>Quvvat</span>
        <strong>
            ${car.power ? `${car.power} ot kuchi` : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Privod</span>
        <strong>
            ${
                car.drive === "FWD"
                    ? "Oldi"
                    : car.drive === "RWD"
                    ? "Orqa"
                    : car.drive === "AWD"
                    ? "To‘liq"
                    : car.drive || "—"
            }
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>0–100 km/soat</span>
        <strong>
            ${car.acceleration ? `${car.acceleration} sek` : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Maksimal tezlik</span>
        <strong>
            ${car.maxSpeed ? `${car.maxSpeed} km/soat` : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>O‘rindiqlar</span>
        <strong>${car.seats || "—"}</strong>
    </div>

    <div class="compare-spec-row">
        <span>Uzunligi</span>
        <strong>
            ${car.length ? `${car.length} mm` : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>G‘ildirak bazasi</span>
        <strong>
            ${car.wheelbase ? `${car.wheelbase} mm` : "—"}
        </strong>
    </div>


    <div class="compare-spec-group-title compare-equipment-title">
        Komplektatsiya
    </div>

    <div class="compare-spec-row">
        <span>360° kamera</span>
        <strong>
            ${car.camera360 === "yes" ? "Bor" : car.camera360 === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>O‘rindiq ventilyatsiyasi</span>
        <strong>
            ${car.seatVentilation === "yes" ? "Bor" : car.seatVentilation === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>O‘rindiq isitish</span>
        <strong>
            ${car.seatHeating === "yes" ? "Bor" : car.seatHeating === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>O‘rindiq massaji</span>
        <strong>
            ${car.massage === "yes" ? "Bor" : car.massage === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>HUD displey</span>
        <strong>
            ${car.hud === "yes" ? "Bor" : car.hud === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Face ID</span>
        <strong>
            ${car.faceId === "yes" ? "Bor" : car.faceId === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Sovutgich</span>
        <strong>
            ${car.fridge === "yes" ? "Bor" : car.fridge === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

    <div class="compare-spec-row">
        <span>Pnevmatik osma</span>
        <strong>
            ${car.airSuspension === "yes" ? "Bor" : car.airSuspension === "no" ? "Yo‘q" : "—"}
        </strong>
    </div>

</div>

                    <a
                        href="car.html?id=${car.id}"
                        class="compare-car-details"
                    >
                        Batafsil →
                    </a>

                </div>
            `;

            compareGrid.appendChild(card);

        });

    } catch (error) {

        compareGrid.innerHTML = `
            <div class="compare-empty">
                <h3>Ma’lumotlarni yuklab bo‘lmadi</h3>
                <p>
                    Sahifani yangilab qayta urinib ko‘ring.
                </p>
            </div>
        `;

    }

}


document.addEventListener("click", (event) => {
    const removeBtn =
        event.target.closest(".compare-remove-btn");

    if (!removeBtn) return;

    const carId =
        String(removeBtn.dataset.carId);

    let compareCars =
        JSON.parse(
            localStorage.getItem("compareCars") || "[]"
        ).map(String);

    compareCars =
        compareCars.filter(
            id => id !== carId
        );

    localStorage.setItem(
        "compareCars",
        JSON.stringify(compareCars)
    );

    loadComparePage();
});

document.addEventListener(
    "DOMContentLoaded",
    loadComparePage
);






















// ==========================================
// MOBILE — BARCHA / ELEKTR / GIBRID / BENZIN
// ==========================================

const mobileCategoryButtons =
    document.querySelectorAll("[data-mobile-filter]");

mobileCategoryButtons.forEach((button) => {

    button.addEventListener("click", () => {

        mobileCategoryButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const value = button.dataset.mobileFilter;

        const typeFilter =
            document.getElementById("typeFilter");

        const fuelFilter =
            document.getElementById("fuelFilter");

        if (typeFilter) typeFilter.value = "";
        if (fuelFilter) fuelFilter.value = "";

        if (value === "electric" || value === "hybrid") {
            if (typeFilter) typeFilter.value = value;
        }

        if (value === "petrol") {
            if (fuelFilter) fuelFilter.value = value;
        }

        filterCatalogCars();
    });

});












// ==========================================
// MOBILE FILTER — OPEN / CLOSE
// ==========================================

const mobileFilterOpen =
    document.querySelector(".mobile-filter-open");

const mobileFilterSheet =
    document.getElementById("mobileFilterSheet");

const mobileFilterOverlay =
    document.getElementById("mobileFilterOverlay");

const mobileFilterClose =
    document.getElementById("mobileFilterClose");


function openMobileFilter() {

    if (!mobileFilterSheet || !mobileFilterOverlay) return;

    mobileFilterSheet.classList.add("active");
    mobileFilterOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeMobileFilter() {

    if (!mobileFilterSheet || !mobileFilterOverlay) return;

    mobileFilterSheet.classList.remove("active");
    mobileFilterOverlay.classList.remove("active");

    document.body.style.overflow = "";
}


mobileFilterOpen?.addEventListener(
    "click",
    openMobileFilter
);

mobileFilterClose?.addEventListener(
    "click",
    closeMobileFilter
);

mobileFilterOverlay?.addEventListener(
    "click",
    closeMobileFilter
);








// ==========================================
// MOBILE FILTER — BRAND LIST
// ==========================================

function loadMobileBrands() {

    const mobileBrandFilter =
        document.getElementById("mobileBrandFilter");

    const mobileBrandMenu =
        document.getElementById("mobileBrandMenu");

    const mobileBrandTrigger =
        document.getElementById("mobileBrandTrigger");

    if (
        !mobileBrandFilter ||
        !mobileBrandMenu ||
        !mobileBrandTrigger
    ) return;


    const brands = new Set();


    document
        .querySelectorAll(".car-card")
        .forEach((card) => {

            const brand = String(
                card.dataset.brand || ""
            ).trim();

            if (brand) {
                brands.add(brand);
            }

        });


    mobileBrandMenu.innerHTML = "";


    const allButton =
        document.createElement("button");

    allButton.type = "button";
    allButton.className =
        "mobile-custom-select-option active";

    allButton.textContent =
        "Barcha brendlar";

    allButton.dataset.value = "";

    mobileBrandMenu.appendChild(allButton);


    [...brands]
        .sort((a, b) => a.localeCompare(b))
        .forEach((brand) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "mobile-custom-select-option";

            button.textContent = brand;

            button.dataset.value =
                brand.toLowerCase();

            mobileBrandMenu.appendChild(button);

        });

}








// ==========================================
// MOBILE FILTER — APPLY
// ==========================================

const mobileFilterApply =
    document.getElementById("mobileFilterApply");

mobileFilterApply?.addEventListener("click", () => {

    mobileFilterApply.classList.add("loading");
mobileFilterApply.disabled = true;
mobileFilterApply.textContent = "Qidirilmoqda...";

    const mobileBrand =
        document.getElementById("mobileBrandFilter")?.value || "";

    const mobileType =
        document.getElementById("mobileTypeFilter")?.value || "";

    const brandFilter =
        document.getElementById("brandFilter");

    const typeFilter =
        document.getElementById("typeFilter");

    const fuelFilter =
        document.getElementById("fuelFilter");


    if (brandFilter) {
        brandFilter.value = mobileBrand;
    }


    if (typeFilter) {
        typeFilter.value = "";
    }

    if (fuelFilter) {
        fuelFilter.value = "";
    }


    if (mobileType === "electric" || mobileType === "hybrid") {

        if (typeFilter) {
            typeFilter.value = mobileType;
        }

    }


    if (mobileType === "petrol") {

        if (fuelFilter) {
            fuelFilter.value = mobileType;
        }

    }

setTimeout(() => {

    filterCatalogCars();

    mobileFilterApply.classList.remove("loading");
    mobileFilterApply.disabled = false;
    mobileFilterApply.textContent = "Natijalarni ko‘rsatish";

    closeMobileFilter();

}, 1800);

});










// ==========================================
// MOBILE FILTER — RESET
// ==========================================

const mobileFilterReset =
    document.getElementById("mobileFilterReset");

mobileFilterReset?.addEventListener("click", () => {

    const mobileBrand =
        document.getElementById("mobileBrandFilter");

    const mobileType =
        document.getElementById("mobileTypeFilter");

    const brandFilter =
        document.getElementById("brandFilter");

    const typeFilter =
        document.getElementById("typeFilter");

    const fuelFilter =
        document.getElementById("fuelFilter");

    const mobileBrandTrigger =
        document.getElementById("mobileBrandTrigger");

    const mobileTypeTrigger =
        document.getElementById("mobileTypeTrigger");

    const mobileBrandMenu =
        document.getElementById("mobileBrandMenu");

    const mobileTypeMenu =
        document.getElementById("mobileTypeMenu");


    if (mobileBrand) mobileBrand.value = "";
    if (mobileType) mobileType.value = "";

    if (brandFilter) brandFilter.value = "";
    if (typeFilter) typeFilter.value = "";
    if (fuelFilter) fuelFilter.value = "";


    const brandText =
        mobileBrandTrigger?.querySelector("span");

    if (brandText) {
        brandText.textContent = "Barcha brendlar";
    }


    const typeText =
        mobileTypeTrigger?.querySelector("span");

    if (typeText) {
        typeText.textContent = "Barchasi";
    }


    mobileBrandMenu
        ?.querySelectorAll(".mobile-custom-select-option")
        .forEach((item) => {
            item.classList.remove("active");
        });

    mobileBrandMenu
        ?.querySelector('[data-value=""]')
        ?.classList.add("active");


    mobileTypeMenu
        ?.querySelectorAll(".mobile-type-option")
        .forEach((item) => {
            item.classList.remove("active");
        });

    mobileTypeMenu
        ?.querySelector('[data-value=""]')
        ?.classList.add("active");


    document
        .querySelectorAll("[data-mobile-filter]")
        .forEach((button) => {
            button.classList.remove("active");
        });

    document
        .querySelector('[data-mobile-filter="all"]')
        ?.classList.add("active");


    filterCatalogCars();

});










// ==========================================
// MOBILE CUSTOM BRAND — OPEN / CLOSE
// ==========================================

const mobileBrandTrigger =
    document.getElementById("mobileBrandTrigger");

const mobileBrandMenu =
    document.getElementById("mobileBrandMenu");


mobileBrandTrigger?.addEventListener("click", () => {

    mobileBrandMenu?.classList.toggle("active");

    mobileBrandTrigger.classList.toggle("active");

});


window.addEventListener("load", () => {
    setTimeout(loadMobileBrands, 500);
});















// ==========================================
// MOBILE CUSTOM BRAND — SELECT
// ==========================================

document.addEventListener("click", (event) => {

    const option =
        event.target.closest(
            "#mobileBrandMenu .mobile-custom-select-option"
        );

    if (!option) return;

    const mobileBrandFilter =
        document.getElementById("mobileBrandFilter");

    const mobileBrandTrigger =
        document.getElementById("mobileBrandTrigger");

    const mobileBrandMenu =
        document.getElementById("mobileBrandMenu");

    if (mobileBrandFilter) {
        mobileBrandFilter.value =
            option.dataset.value || "";
    }

    const triggerText =
        mobileBrandTrigger?.querySelector("span");

    if (triggerText) {
        triggerText.textContent =
            option.textContent.trim();
    }

    mobileBrandMenu
        ?.querySelectorAll(".mobile-custom-select-option")
        .forEach((item) => {
            item.classList.remove("active");
        });

    option.classList.add("active");

    mobileBrandMenu?.classList.remove("active");
    mobileBrandTrigger?.classList.remove("active");

});






// ==========================================
// MOBILE CUSTOM TYPE — OPEN / CLOSE
// ==========================================

const mobileTypeTrigger =
    document.getElementById("mobileTypeTrigger");

const mobileTypeMenu =
    document.getElementById("mobileTypeMenu");


mobileTypeTrigger?.addEventListener("click", () => {

    mobileTypeMenu?.classList.toggle("active");

    mobileTypeTrigger.classList.toggle("active");

});










// ==========================================
// MOBILE CUSTOM TYPE — SELECT
// ==========================================

document.addEventListener("click", (event) => {

    const option =
        event.target.closest(
            "#mobileTypeMenu .mobile-type-option"
        );

    if (!option) return;

    const mobileTypeFilter =
        document.getElementById("mobileTypeFilter");

    const mobileTypeTrigger =
        document.getElementById("mobileTypeTrigger");

    const mobileTypeMenu =
        document.getElementById("mobileTypeMenu");

    if (mobileTypeFilter) {
        mobileTypeFilter.value =
            option.dataset.value || "";
    }

    const triggerText =
        mobileTypeTrigger?.querySelector("span");

    if (triggerText) {
        triggerText.textContent =
            option.textContent.trim();
    }

    mobileTypeMenu
        ?.querySelectorAll(".mobile-type-option")
        .forEach((item) => {
            item.classList.remove("active");
        });

    option.classList.add("active");

    mobileTypeMenu?.classList.remove("active");
    mobileTypeTrigger?.classList.remove("active");

});
















document
    .getElementById("mobileCarSearch")
    ?.addEventListener("input", filterCatalogCars);













    document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
        document.querySelector(".mobile-menu-btn");

    const menuDrawer =
        document.querySelector(".mobile-menu-drawer");

    const menuOverlay =
        document.querySelector(".mobile-menu-overlay");

    const menuClose =
        document.querySelector(".mobile-menu-close");


    function openMobileMenu() {

        menuDrawer?.classList.add("active");
        menuOverlay?.classList.add("active");

        document.body.style.overflow = "hidden";
    }


    function closeMobileMenu() {

        menuDrawer?.classList.remove("active");
        menuOverlay?.classList.remove("active");

        document.body.style.overflow = "";
    }


    menuBtn?.addEventListener(
        "click",
        openMobileMenu
    );


    menuClose?.addEventListener(
        "click",
        closeMobileMenu
    );


    menuOverlay?.addEventListener(
        "click",
        closeMobileMenu
    );


    document
        .querySelectorAll(".mobile-menu-links a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });

});











document.addEventListener("DOMContentLoaded", () => {

    const path =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const params =
        new URLSearchParams(window.location.search);


    let currentPage = "";


    if (
        path === "" ||
        path === "index.html"
    ) {
        currentPage = "home";
    }

    else if (
        path === "cars.html" &&
        params.get("favorites") === "1"
    ) {
        currentPage = "favorites";
    }

    else if (
        path === "cars.html" ||
        path === "car.html"
    ) {
        currentPage = "cars";
    }

    else if (path === "nasiya.html") {
        currentPage = "nasiya";
    }

    else if (path === "xizmatlar.html") {
        currentPage = "services";
    }

    else if (path === "blog.html") {
        currentPage = "blog";
    }

    else if (path === "kontakt.html") {
        currentPage = "contact";
    }

    else if (path === "compare.html") {
        currentPage = "compare";
    }


    /* =========================
       DESKTOP HEADER
    ========================= */

    document
        .querySelectorAll(".desktop-nav a")
        .forEach((link) => {

            link.classList.remove("active");

            const href =
                link.getAttribute("href") || "";

            if (
                currentPage === "home" &&
                href.includes("index.html")
            ) {
                link.classList.add("active");
            }

            if (
                currentPage === "cars" &&
                href.includes("cars.html")
            ) {
                link.classList.add("active");
            }

            if (
                currentPage === "nasiya" &&
                href.includes("nasiya.html")
            ) {
                link.classList.add("active");
            }

            if (
                currentPage === "services" &&
                href.includes("xizmatlar.html")
            ) {
                link.classList.add("active");
            }

            if (
                currentPage === "blog" &&
                href.includes("blog.html")
            ) {
                link.classList.add("active");
            }

            if (
                currentPage === "contact" &&
                href.includes("kontakt.html")
            ) {
                link.classList.add("active");
            }

        });


    /* =========================
       PREMIUM DRAWER MENU
    ========================= */

    document
        .querySelectorAll(".mobile-menu-links a")
        .forEach((link) => {

            link.classList.remove("active");

            const page =
                link.dataset.menuPage;

            if (page === currentPage) {
                link.classList.add("active");
            }

        });


    /* =========================
       MOBILE BOTTOM NAV
    ========================= */

    document
        .querySelectorAll(".mobile-bottom-item")
        .forEach((item) => {

            item.classList.remove("active");

            const nav =
                item.dataset.nav;

            if (
                nav === currentPage
            ) {
                item.classList.add("active");
            }

        });

});









// ======================================================
// HOME MOBILE SEARCH -> CARS PAGE
// ======================================================

const homeCarSearchForm =
    document.getElementById("homeCarSearchForm");

const homeCarSearchInput =
    document.getElementById("homeCarSearchInput");

homeCarSearchForm?.addEventListener("submit", (event) => {

    event.preventDefault();

    const value =
        homeCarSearchInput?.value.trim() || "";

    if (!value) {
        window.location.href = "cars.html";
        return;
    }

    window.location.href =
        `cars.html?q=${encodeURIComponent(value)}`;
});




// ======================================================
// CARS PAGE — URL QIDIRUV PARAMETRI
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!document.body.classList.contains("cars-page")) {
        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const query =
        params.get("q")?.trim() || "";

    if (!query) return;

    const desktopSearch =
        document.getElementById("carSearch");

    const mobileSearch =
        document.getElementById("mobileCarSearch");

    if (desktopSearch) {
        desktopSearch.value = query;
    }

    if (mobileSearch) {
        mobileSearch.value = query;
    }

    setTimeout(() => {
        filterCatalogCars();
    }, 300);

});


// ======================================================
// CARS PAGE — URL TYPE FILTER
// ======================================================

window.addEventListener("load", () => {

    if (!document.body.classList.contains("cars-page")) {
        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const type =
        params.get("type");

    if (
        type !== "electric" &&
        type !== "hybrid" &&
        type !== "petrol"
    ) {
        return;
    }

    const typeFilter =
        document.getElementById("typeFilter");

    const fuelFilter =
        document.getElementById("fuelFilter");

    if (typeFilter) {
        typeFilter.value = "";
    }

    if (fuelFilter) {
        fuelFilter.value = "";
    }

    if (
        type === "electric" ||
        type === "hybrid"
    ) {
        if (typeFilter) {
            typeFilter.value = type;
        }
    }

    if (type === "petrol") {
        if (fuelFilter) {
            fuelFilter.value = "petrol";
        }
    }

    setTimeout(() => {
        filterCatalogCars();
    }, 300);

});





// ======================================================
// CARS PAGE — URL TYPE ACTIVE BUTTON
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!document.body.classList.contains("cars-page")) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (!type) return;

    const mobileFilterButtons =
        document.querySelectorAll("[data-mobile-filter]");

    mobileFilterButtons.forEach(button => {
        button.classList.remove("active");
    });

    const activeButton =
        document.querySelector(
            `[data-mobile-filter="${type}"]`
        );

    activeButton?.classList.add("active");
});










// ==========================================
// CARS PAGE — FAQAT DESKTOP QIDIRUV
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    if (!document.body.classList.contains("cars-page")) return;

    const desktopSearch =
        document.getElementById("carSearch");

    const desktopSearchBtn =
        document.querySelector(".search-submit-btn");

    function runDesktopSearch(event) {

        if (window.innerWidth <= 720) return;

        if (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        filterCatalogCars();
    }

    desktopSearch?.addEventListener(
        "input",
        runDesktopSearch
    );

    desktopSearch?.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                runDesktopSearch(event);
            }
        }
    );

    desktopSearchBtn?.addEventListener(
        "click",
        runDesktopSearch,
        true
    );
});