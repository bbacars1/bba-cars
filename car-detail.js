const API_URL = "https://api.bbacars.uz";


function getCarImageUrl(image) {
    if (!image) return "";

    const url = String(image).trim();

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `${API_URL}/${url.replace(/^\/+/, "")}`;
}



function formatPrice(price) {
    const number = Number(price);

    if (!Number.isFinite(number)) {
        return "Narx aniqlanmagan";
    }

    return `${number.toLocaleString("en-US")} $`;
}



function formatCarType(type) {
    const value = String(type || "").toLowerCase();

    if (value === "electric") return "Elektr";
    if (value === "hybrid") return "Gibrid";
    if (value === "petrol") return "Benzin";
    if (value === "diesel") return "Dizel";

    return type || "—";
}



function formatDrive(drive) {
    const value = String(drive || "").toUpperCase();

    if (value === "FWD") return "Oldi";
    if (value === "RWD") return "Orqa";
    if (value === "AWD") return "To‘liq";

    return drive || "—";
}



function getStatusInfo(status) {
    const value = String(status || "").toLowerCase();

    if (value === "new") {
        return {
            text: "YANGI",
            className: "badge-new"
        };
    }

    if (value === "top") {
        return {
            text: "TOP",
            className: "badge-top"
        };
    }

    if (value === "discount") {
        return {
            text: "CHEGIRMA",
            className: "badge-sale"
        };
    }

    return null;
}



function getGalleryImages(car) {
    let images = [];

    try {
        if (Array.isArray(car.images)) {
            images = car.images;
        } else if (car.images) {
            images = JSON.parse(car.images);
        }
    } catch (error) {
        images = [];
    }

    images = images
        .filter(Boolean)
        .map(getCarImageUrl);

    const mainImage = getCarImageUrl(car.image);

    if (
        mainImage &&
        !images.includes(mainImage)
    ) {
        images.unshift(mainImage);
    }

    return [...new Set(images)];
}



function yesNo(value) {
    if (value === "yes") return "Bor";
    if (value === "no") return "Yo‘q";

    return "—";
}



async function loadCarDetail() {
    const container =
        document.getElementById("carDetail");

    if (!container) return;

    try {
        const params =
            new URLSearchParams(window.location.search);

        const carId = params.get("id");

        if (!carId) {
            throw new Error(
                "Avtomobil ID topilmadi"
            );
        }


        const response = await fetch(
            `${API_URL}/cars`,
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {
            throw new Error(
                "Backend javob bermadi"
            );
        }


        const cars = await response.json();


        const car = cars.find(
            item =>
                String(item.id) === String(carId)
        );


        if (!car) {
            throw new Error(
                "Avtomobil topilmadi"
            );
        }


        document.title =
            `${car.name} | BBA CARS`;


        updateBreadcrumb(car);


        renderCarDetail(
            car,
            cars
        );


        setupGallery(car);

        setupFavorite(car);

        setupCompare(car);

        setupTabs();

        setupOrderModal(car);

        setupInlineOrder(car);

        renderRelatedCars(
            cars,
            car
        );


    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <div class="detail-error">

                <h2>
                    Avtomobil topilmadi
                </h2>

                <p>
                    Avtomobil ma’lumotlarini
                    yuklashda xatolik yuz berdi.
                </p>

                <a href="index.html#cars">
                    Avtomobillarga qaytish →
                </a>

            </div>
        `;
    }
}



function updateBreadcrumb(car) {
    const brand =
        document.getElementById(
            "breadcrumbBrand"
        );

    const name =
        document.getElementById(
            "breadcrumbCar"
        );


    if (brand) {
        brand.textContent =
            car.brand || "BBA CARS";
    }


    if (name) {
        name.textContent =
            car.name || "Avtomobil";
    }
}



function renderCarDetail(car) {
    const container =
        document.getElementById("carDetail");

    const images =
        getGalleryImages(car);

    const mainImage =
        images[0] || "";

    const status =
        getStatusInfo(car.status);


    container.innerHTML = `

        <!-- =========================
             HERO
        ========================= -->

        <section class="new-detail-hero">


            <!-- LEFT / GALLERY -->

            <div class="new-detail-gallery-column">

                <div class="new-detail-main-image">

                    ${
                        status
                        ?
                        `
                        <span class="
                            new-detail-status
                            ${status.className}
                        ">
                            ${status.text}
                        </span>
                        `
                        :
                        ""
                    }


                    <button
                        class="gallery-fullscreen-btn"
                        id="galleryFullscreenBtn"
                        type="button"
                        aria-label="Rasmni kattalashtirish"
                    >
                        ⛶
                    </button>


                    ${
                        images.length > 1
                        ?
                        `
                        <button
                            class="
                                gallery-arrow
                                gallery-arrow-left
                            "
                            id="galleryPrev"
                            type="button"
                            aria-label="Oldingi rasm"
                        >
                            ‹
                        </button>


                        <button
                            class="
                                gallery-arrow
                                gallery-arrow-right
                            "
                            id="galleryNext"
                            type="button"
                            aria-label="Keyingi rasm"
                        >
                            ›
                        </button>
                        `
                        :
                        ""
                    }


                    <img
                        id="mainCarImage"
                        src="${mainImage}"
                        alt="${car.name || "BBA CARS"}"
                    >


                    <span
                        class="gallery-counter"
                        id="galleryCounter"
                    >
                        ${
                            images.length
                            ? `1/${images.length}`
                            : "0/0"
                        }
                    </span>

                </div>


                <div
                    class="new-detail-thumbnails"
                    id="detailGallery"
                ></div>

            </div>



            <!-- RIGHT / INFO -->

            <div class="new-detail-info">


                <div class="detail-info-topline">

                    <span class="new-detail-brand">
                        ${car.brand || "BBA CARS"}
                    </span>


                    <div class="detail-info-actions">

                        <button
                            type="button"
                            class="detail-save-btn"
                            id="detailFavoriteBtn"
                        >
                            <span
                                id="detailFavoriteIcon"
                            >
                                ♡
                            </span>

                            Saqlash
                        </button>


                        <button
                            type="button"
                            class="detail-compare-btn"
                            id="detailCompareBtn"
                        >
                            ⇄
                            Taqqoslash
                        </button>

                    </div>

                </div>


                <h1 class="new-detail-title">
                    ${car.name || "Avtomobil"}
                </h1>


                <p class="new-detail-description">
                    Zamonaviy texnologiyalar,
                    yuqori darajadagi qulaylik va
                    kundalik foydalanish uchun
                    optimal avtomobil.
                </p>


                <div class="new-detail-price">

                    <span>
                        Narxi
                    </span>

                    <strong>
                        ${formatPrice(car.price)}
                    </strong>

                </div>



                <div class="new-detail-quick-specs">


                    <div class="new-detail-spec-card">

                        <span>
                            Yil
                        </span>

                        <strong>
                            ${car.year || "—"}
                        </strong>

                    </div>


                    <div class="new-detail-spec-card">

                        <span>
                            Turi
                        </span>

                        <strong>
                            ${formatCarType(car.type)}
                        </strong>

                    </div>


                    <div class="new-detail-spec-card">

                        <span>
                            Brend
                        </span>

                        <strong>
                            ${car.brand || "—"}
                        </strong>

                    </div>


                    <div class="new-detail-spec-card">

                        <span>
                            Zapas xod
                        </span>

                        <strong>
                            ${
                                car.range
                                ? `${car.range} km`
                                : "—"
                            }
                        </strong>

                    </div>

                </div>



                <div class="new-detail-buttons">

                    <button
                        type="button"
                        class="new-detail-order-btn"
                        id="detailOrderBtn"
                    >
                        Ariza qoldirish
                        <span>→</span>
                    </button>


                    <a
    href="#detailCredit"
    class="new-detail-credit-btn"
    id="detailCreditBtn"
>
    Nasiya hisoblash
</a>

                </div>



                <div class="new-detail-trust">


                    <div>
                        <span>✓</span>

                        <p>
                            Rasmiy
                            <strong>
                                kafolat
                            </strong>
                        </p>
                    </div>


                    <div>
                        <span>✓</span>

                        <p>
                            Tez
                            <strong>
                                yetkazib berish
                            </strong>
                        </p>
                    </div>


                    <div>
                        <span>✓</span>

                        <p>
                            Servis
                            <strong>
                                xizmati
                            </strong>
                        </p>
                    </div>


                    <div>
                        <span>✓</span>

                        <p>
                            Qo‘shimcha
                            <strong>
                                bonuslar
                            </strong>
                        </p>
                    </div>


                </div>

            </div>

        </section>



        <!-- =========================
             TABS
        ========================= -->

        <section class="detail-tabs-section">

            <div class="detail-tabs">

                <button
                    class="detail-tab active"
                    data-tab="main"
                >
                    Asosiy ma’lumot
                </button>


                <button
                    class="detail-tab"
                    data-tab="technical"
                >
                    Texnik xususiyatlar
                </button>


                <button
                    class="detail-tab"
                    data-tab="equipment"
                >
                    Komplektatsiya
                </button>


                <button
                    class="detail-tab"
                    data-tab="credit"
                >
                    Nasiya
                </button>


                <button
                    class="detail-tab"
                    data-tab="reviews"
                >
                    Sharhlar
                </button>

            </div>

        </section>



        <!-- =========================
             MAIN TAB
        ========================= -->

        <section
            class="
                detail-tab-panel
                active
            "
            data-panel="main"
        >

            <div class="detail-main-grid">


                <!-- ABOUT -->

                <div class="detail-content-card">

                    <span class="detail-card-label">
                        Avtomobil haqida
                    </span>


                    <h2>
                        ${car.name || "Avtomobil"}
                    </h2>


                    <p>
                        ${
                            car.name || "Ushbu avtomobil"
                        }
                        zamonaviy texnologiyalar,
                        qulay salon va kundalik
                        foydalanish uchun kerakli
                        imkoniyatlarni birlashtiradi.
                        Batafsil texnik
                        ko‘rsatkichlar avtomobil
                        ma’lumotlarida keltirilgan.
                    </p>

                </div>



                <!-- INDICATORS -->

                <div class="detail-content-card">

                    <span class="detail-card-label">
                        Asosiy ko‘rsatkichlar
                    </span>


                    <div class="detail-indicators">


                        <div>
                            <span>
                                Zapas xod
                            </span>

                            <strong>
                                ${
                                    car.range
                                    ? `${car.range} km`
                                    : "—"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>
                                Batareya
                            </span>

                            <strong>
                                ${
                                    car.battery
                                    ? `${car.battery} kWh`
                                    : "—"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>
                                Quvvat
                            </span>

                            <strong>
                                ${
                                    car.power
                                    ? `${car.power} ot kuchi`
                                    : "—"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>
                                0–100 km/soat
                            </span>

                            <strong>
                                ${
                                    car.acceleration
                                    ? `${car.acceleration} sek`
                                    : "—"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>
                                Maksimal tezlik
                            </span>

                            <strong>
                                ${
                                    car.maxSpeed
                                    ? `${car.maxSpeed} km/soat`
                                    : "—"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>
                                Privod
                            </span>

                            <strong>
                                ${formatDrive(car.drive)}
                            </strong>
                        </div>


                    </div>

                </div>



                <!-- INLINE FORM -->

                <div class="
                    detail-content-card
                    detail-lead-card
                ">

                    <span class="detail-card-label">
                        Manfaatlanyapsizmi?
                    </span>


                    <h2>
                        Ariza qoldiring
                    </h2>


                    <p>
                        Menejerimiz siz bilan
                        bog‘lanib, avtomobil bo‘yicha
                        batafsil ma’lumot beradi.
                    </p>


                    <form
                        class="detail-inline-form"
                        id="detailInlineForm"
                    >

                        <input
                            type="text"
                            id="detailInlineName"
                            placeholder="Ismingiz"
                            required
                        >


                        <input
                            type="tel"
                            id="detailInlinePhone"
                            placeholder="+998 90 123 45 67"
                            required
                        >


                        <textarea
                            id="detailInlineMessage"
                            placeholder="Izoh (ixtiyoriy)"
                            rows="3"
                        ></textarea>


                        <button
                            type="submit"
                            id="detailInlineSubmit"
                        >
                            Ariza qoldirish →
                        </button>

                    </form>

                </div>


            </div>

        </section>



        <!-- =========================
             TECHNICAL TAB
        ========================= -->

        <section
            class="detail-tab-panel"
            data-panel="technical"
        >

            <div class="detail-tech-grid">

                ${createTechItem(
                    "Model",
                    car.name
                )}

                ${createTechItem(
                    "Brend",
                    car.brand
                )}

                ${createTechItem(
                    "Yil",
                    car.year
                )}

                ${createTechItem(
                    "Avtomobil turi",
                    formatCarType(car.type)
                )}

                ${createTechItem(
                    "Zapas xod",
                    car.range
                        ? `${car.range} km`
                        : "—"
                )}

                ${createTechItem(
                    "Batareya",
                    car.battery
                        ? `${car.battery} kWh`
                        : "—"
                )}

                ${createTechItem(
                    "Dvigatel",
                    car.engine
                )}

                ${createTechItem(
                    "Privod",
                    formatDrive(car.drive)
                )}

                ${createTechItem(
                    "Quvvat",
                    car.power
                        ? `${car.power} ot kuchi`
                        : "—"
                )}

                ${createTechItem(
                    "0–100 km/soat",
                    car.acceleration
                        ? `${car.acceleration} sek`
                        : "—"
                )}

                ${createTechItem(
                    "Maksimal tezlik",
                    car.maxSpeed
                        ? `${car.maxSpeed} km/soat`
                        : "—"
                )}

                ${createTechItem(
                    "O‘rindiqlar",
                    car.seats
                )}

                ${createTechItem(
                    "Uzunligi",
                    car.length
                        ? `${car.length} mm`
                        : "—"
                )}

                ${createTechItem(
                    "G‘ildirak bazasi",
                    car.wheelbase
                        ? `${car.wheelbase} mm`
                        : "—"
                )}

            </div>

        </section>



        <!-- =========================
             EQUIPMENT TAB
        ========================= -->

        <section
            class="detail-tab-panel"
            data-panel="equipment"
        >

            <div class="detail-equipment-grid">


                ${createEquipmentItem(
                    "360° kamera",
                    car.camera360
                )}

                ${createEquipmentItem(
                    "O‘rindiq ventilyatsiyasi",
                    car.seatVentilation
                )}

                ${createEquipmentItem(
                    "O‘rindiq isitish",
                    car.seatHeating
                )}

                ${createEquipmentItem(
                    "O‘rindiq massaji",
                    car.massage
                )}

                ${createEquipmentItem(
                    "HUD displey",
                    car.hud
                )}

                ${createEquipmentItem(
                    "Face ID",
                    car.faceId
                )}

                ${createEquipmentItem(
                    "Sovutgich",
                    car.fridge
                )}

                ${createEquipmentItem(
                    "Pnevmatik osma",
                    car.airSuspension
                )}


            </div>

        </section>



        <!-- =========================
             CREDIT TAB
        ========================= -->

        <section
            class="detail-tab-panel"
            data-panel="credit"
            id="detailCredit"
        >

            <div class="detail-credit-card">

                <span class="detail-card-label">
                    BBA CARS NASIYA
                </span>


                <h2>
                    Nasiya hisoblash
                </h2>


                <p>
                    Avtomobil narxi:
                    <strong>
                        ${formatPrice(car.price)}
                    </strong>
                </p>


                <p>
                    Nasiya shartlari va aniq
                    hisob-kitob uchun ariza
                    qoldiring.
                </p>


                <button
                    type="button"
                    class="detail-credit-order-btn"
                    id="creditOrderBtn"
                >
                    Ariza qoldirish →
                </button>

            </div>

        </section>



        <!-- =========================
             REVIEWS TAB
        ========================= -->

        <section
            class="detail-tab-panel"
            data-panel="reviews"
        >

            <div class="detail-empty-card">

                <h2>
                    Sharhlar
                </h2>

                <p>
                    Hozircha ushbu avtomobil
                    uchun sharhlar mavjud emas.
                </p>

            </div>

        </section>



        <!-- =========================
             RELATED
        ========================= -->

        <section class="detail-related-section">

            <div class="detail-related-heading">

                <div>

                    <span>
                        BBA CARS
                    </span>

                    <h2>
                        Shu kabi avtomobillar
                    </h2>

                </div>


                <a href="index.html#cars">
                    Barchasini ko‘rish →
                </a>

            </div>


            <div
                class="detail-related-grid"
                id="relatedCars"
            ></div>

        </section>



        <!-- FULLSCREEN -->

        <div
            class="gallery-fullscreen"
            id="galleryFullscreen"
        >

            <button
                type="button"
                class="gallery-fullscreen-close"
                id="galleryFullscreenClose"
            >
                ×
            </button>


            <img
                id="galleryFullscreenImage"
                src=""
                alt="${car.name || "BBA CARS"}"
            >

        </div>

    `;
}



function createTechItem(
    label,
    value
) {
    return `
        <div class="detail-tech-item">

            <span>
                ${label}
            </span>

            <strong>
                ${value || "—"}
            </strong>

        </div>
    `;
}



function createEquipmentItem(
    label,
    value
) {
    return `
        <div class="detail-equipment-item">

            <span>
                ${label}
            </span>

            <strong>
                ${yesNo(value)}
            </strong>

        </div>
    `;
}



function setupGallery(car) {
    const images =
        getGalleryImages(car);

    const mainImage =
        document.getElementById(
            "mainCarImage"
        );

    const gallery =
        document.getElementById(
            "detailGallery"
        );

    const counter =
        document.getElementById(
            "galleryCounter"
        );


    if (
        !mainImage ||
        !gallery
    ) {
        return;
    }


    if (!images.length) {
        gallery.innerHTML = "";
        return;
    }


    let currentIndex = 0;


    const visibleImages =
        images.slice(0, 6);


    gallery.innerHTML =
        visibleImages
            .map(
                (image, index) => {

                    const extra =
                        index === 5 &&
                        images.length > 6
                            ? `
                            <span
                                class="gallery-more"
                            >
                                +${images.length - 6}
                            </span>
                            `
                            :
                            "";


                    return `
                        <button
                            type="button"
                            class="
                                gallery-thumb-btn
                                ${
                                    index === 0
                                    ? "active"
                                    : ""
                                }
                            "
                            data-index="${index}"
                        >

                            <img
                                src="${image}"
                                alt="
                                    ${
                                        car.name ||
                                        "BBA CARS"
                                    }
                                    ${index + 1}
                                "
                            >

                            ${extra}

                        </button>
                    `;
                }
            )
            .join("");


    const thumbs =
        gallery.querySelectorAll(
            ".gallery-thumb-btn"
        );


    function updateImage(index) {
        if (!images[index]) return;

        currentIndex = index;

        mainImage.src =
            images[currentIndex];


        if (counter) {
            counter.textContent =
                `${currentIndex + 1}/${images.length}`;
        }


        thumbs.forEach(
            (thumb) => {
                thumb.classList.toggle(
                    "active",
                    Number(
                        thumb.dataset.index
                    ) === currentIndex
                );
            }
        );
    }


    thumbs.forEach(
        (thumb) => {
            thumb.addEventListener(
                "click",
                () => {
                    updateImage(
                        Number(
                            thumb.dataset.index
                        )
                    );
                }
            );
        }
    );


    const prev =
        document.getElementById(
            "galleryPrev"
        );

    const next =
        document.getElementById(
            "galleryNext"
        );


    if (prev) {
        prev.addEventListener(
            "click",
            () => {
                const index =
                    currentIndex === 0
                        ? images.length - 1
                        : currentIndex - 1;

                updateImage(index);
            }
        );
    }


    if (next) {
        next.addEventListener(
            "click",
            () => {
                const index =
                    currentIndex ===
                    images.length - 1
                        ? 0
                        : currentIndex + 1;

                updateImage(index);
            }
        );
    }


    setupFullscreenGallery(
        mainImage
    );
}



function setupFullscreenGallery(
    mainImage
) {
    const openBtn =
        document.getElementById(
            "galleryFullscreenBtn"
        );

    const fullscreen =
        document.getElementById(
            "galleryFullscreen"
        );

    const fullscreenImage =
        document.getElementById(
            "galleryFullscreenImage"
        );

    const closeBtn =
        document.getElementById(
            "galleryFullscreenClose"
        );


    if (
        !openBtn ||
        !fullscreen ||
        !fullscreenImage
    ) {
        return;
    }


    openBtn.addEventListener(
        "click",
        () => {
            fullscreenImage.src =
                mainImage.src;

            fullscreen.classList.add(
                "active"
            );

            document.body.style.overflow =
                "hidden";
        }
    );


    function closeFullscreen() {
        fullscreen.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";
    }


    if (closeBtn) {
        closeBtn.addEventListener(
            "click",
            closeFullscreen
        );
    }


    fullscreen.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                fullscreen
            ) {
                closeFullscreen();
            }
        }
    );
}



function setupFavorite(car) {
    const button =
        document.getElementById(
            "detailFavoriteBtn"
        );

    const icon =
        document.getElementById(
            "detailFavoriteIcon"
        );


    if (!button || !icon) return;


    const carId =
        String(car.id);


    function getFavorites() {
        return JSON.parse(
            localStorage.getItem(
                "favorites"
            ) || "[]"
        ).map(String);
    }


    function updateButton() {
        const favorites =
            getFavorites();

        const active =
            favorites.includes(
                carId
            );

        button.classList.toggle(
            "active",
            active
        );

        icon.textContent =
            active ? "♥" : "♡";
    }


    button.addEventListener(
        "click",
        () => {
            let favorites =
                getFavorites();

            if (
                favorites.includes(
                    carId
                )
            ) {
                favorites =
                    favorites.filter(
                        id =>
                            id !== carId
                    );
            } else {
                favorites.push(
                    carId
                );
            }


            localStorage.setItem(
                "favorites",
                JSON.stringify(
                    favorites
                )
            );


            updateButton();
        }
    );


    updateButton();
}



function setupCompare(car) {
    const button =
        document.getElementById(
            "detailCompareBtn"
        );

    if (!button) return;


    const carId =
        String(car.id);


    let compare =
        JSON.parse(
            localStorage.getItem(
                "compareCars"
            ) || "[]"
        ).map(String);


    function update() {
        const active =
            compare.includes(carId);

        button.classList.toggle(
            "active",
            active
        );

        button.innerHTML =
            active
                ? "✓ Taqqoslashga qo‘shildi"
                : "⇄ Taqqoslash";
    }


    button.addEventListener(
        "click",
        () => {

            if (
                compare.includes(
                    carId
                )
            ) {
                compare =
                    compare.filter(
                        id =>
                            id !== carId
                    );
            } else {

                if (
                    compare.length >= 3
                ) {
                    alert(
                        "Bir vaqtda 3 tagacha avtomobilni taqqoslash mumkin."
                    );

                    return;
                }


                compare.push(
                    carId
                );
            }


            localStorage.setItem(
                "compareCars",
                JSON.stringify(compare)
            );


            update();
        }
    );


    update();
}



function setupTabs() {
    const tabs =
        document.querySelectorAll(
            ".detail-tab"
        );

    const panels =
        document.querySelectorAll(
            ".detail-tab-panel"
        );


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    panels.forEach(
                        panel =>
                            panel.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    const panel =
                        document.querySelector(
                            `[data-panel="${target}"]`
                        );


                    if (panel) {
                        panel.classList.add(
                            "active"
                        );
                    }

                }
            );

        }
    );
    const creditBtn = document.getElementById("detailCreditBtn");

if (creditBtn) {
    creditBtn.addEventListener("click", () => {
        const creditTab = document.querySelector(
            '.detail-tab[data-tab="credit"]'
        );

        if (creditTab) {
            creditTab.click();
            creditTab.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}
}



function openOrderModal() {
    const modal =
        document.getElementById(
            "orderModal"
        );

    if (!modal) return;

    modal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}



function closeOrderModal() {
    const modal =
        document.getElementById(
            "orderModal"
        );

    if (!modal) return;

    modal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}



function setupOrderModal(car) {
    const detailBtn =
        document.getElementById(
            "detailOrderBtn"
        );

    const headerBtn =
        document.getElementById(
            "headerOrderBtn"
        );

    const creditBtn =
        document.getElementById(
            "creditOrderBtn"
        );

    const closeBtn =
        document.getElementById(
            "closeOrderModal"
        );

    const modal =
        document.getElementById(
            "orderModal"
        );

    const form =
        document.getElementById(
            "orderForm"
        );

    const nameInput =
        document.getElementById(
            "customerName"
        );

    const phoneInput =
        document.getElementById(
            "customerPhone"
        );

    const submitButton =
        form
            ? form.querySelector(
                ".order-submit"
            )
            : null;


    [
        detailBtn,
        headerBtn,
        creditBtn
    ].forEach(
        button => {
            if (button) {
                button.addEventListener(
                    "click",
                    openOrderModal
                );
            }
        }
    );


    if (closeBtn) {
        closeBtn.addEventListener(
            "click",
            closeOrderModal
        );
    }


    if (modal) {
        modal.addEventListener(
            "click",
            event => {
                if (
                    event.target === modal
                ) {
                    closeOrderModal();
                }
            }
        );
    }


    if (phoneInput) {
        setupPhoneInput(
            phoneInput
        );
    }


    if (
        !form ||
        !nameInput ||
        !phoneInput ||
        !submitButton
    ) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                nameInput.value.trim();

            const phone =
                phoneInput.value.trim();


            if (name.length < 2) {
                alert(
                    "Iltimos, ismingizni kiriting."
                );

                nameInput.focus();

                return;
            }


            const numbers =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                numbers.length !== 12
            ) {
                alert(
                    "Telefon raqamingizni to‘liq kiriting."
                );

                phoneInput.focus();

                return;
            }


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Yuborilmoqda...";


            try {

                await sendOrder({
                    car: car.name,
                    name,
                    phone
                });


                form.reset();

                phoneInput.value =
                    "+998 ";


                closeOrderModal();


                showSuccessModal();


            } catch (error) {

                console.error(error);

                alert(
                    "Arizani yuborishda xatolik yuz berdi."
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Ariza yuborish →";

            }

        }
    );
}



function setupInlineOrder(car) {
    const form =
        document.getElementById(
            "detailInlineForm"
        );

    const name =
        document.getElementById(
            "detailInlineName"
        );

    const phone =
        document.getElementById(
            "detailInlinePhone"
        );

    const message =
        document.getElementById(
            "detailInlineMessage"
        );

    const button =
        document.getElementById(
            "detailInlineSubmit"
        );


    if (
        !form ||
        !name ||
        !phone ||
        !button
    ) {
        return;
    }


    setupPhoneInput(
        phone
    );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const customerName =
                name.value.trim();

            const customerPhone =
                phone.value.trim();

            const customerMessage =
                message
                    ? message.value.trim()
                    : "";


            if (
                customerName.length < 2
            ) {
                alert(
                    "Iltimos, ismingizni kiriting."
                );

                return;
            }


            const numbers =
                customerPhone.replace(
                    /\D/g,
                    ""
                );


            if (
                numbers.length !== 12
            ) {
                alert(
                    "Telefon raqamingizni to‘liq kiriting."
                );

                return;
            }


            button.disabled =
                true;

            button.textContent =
                "Yuborilmoqda...";


            try {

                await sendOrder({
                    car:
                        customerMessage
                            ? `${car.name} | ${customerMessage}`
                            : car.name,

                    name:
                        customerName,

                    phone:
                        customerPhone
                });


                form.reset();

                phone.value =
                    "+998 ";


                showSuccessModal();


            } catch (error) {

                console.error(error);

                alert(
                    "Arizani yuborishda xatolik yuz berdi."
                );


            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Ariza qoldirish →";

            }

        }
    );
}



async function sendOrder(data) {
    const response =
        await fetch(
            `${API_URL}/order`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    data
                )
            }
        );


    if (!response.ok) {
        throw new Error(
            "Ariza yuborilmadi"
        );
    }


    return response.json();
}



function setupPhoneInput(input) {
    if (!input) return;


    input.value =
        "+998 ";


    input.addEventListener(
        "input",
        function () {

            let numbers =
                this.value.replace(
                    /\D/g,
                    ""
                );


            if (
                numbers.startsWith(
                    "998"
                )
            ) {
                numbers =
                    numbers.slice(3);
            }


            numbers =
                numbers.slice(0, 9);


            let formatted =
                "+998";


            if (
                numbers.length > 0
            ) {
                formatted +=
                    " " +
                    numbers.slice(
                        0,
                        2
                    );
            }


            if (
                numbers.length > 2
            ) {
                formatted +=
                    " " +
                    numbers.slice(
                        2,
                        5
                    );
            }


            if (
                numbers.length > 5
            ) {
                formatted +=
                    " " +
                    numbers.slice(
                        5,
                        7
                    );
            }


            if (
                numbers.length > 7
            ) {
                formatted +=
                    " " +
                    numbers.slice(
                        7,
                        9
                    );
            }


            this.value =
                formatted;

        }
    );
}



function showSuccessModal() {
    const modal =
        document.getElementById(
            "successModal"
        );

    const closeBtn =
        document.getElementById(
            "closeSuccessModal"
        );


    if (!modal) return;


    modal.classList.add(
        "active"
    );


    if (closeBtn) {
        closeBtn.onclick =
            () => {
                modal.classList.remove(
                    "active"
                );
            };
    }
}



function renderRelatedCars(
    cars,
    currentCar
) {
    const container =
        document.getElementById(
            "relatedCars"
        );

    if (!container) return;


    const relatedCars =
    cars.filter(
        car =>
            String(car.id) !==
            String(currentCar.id)
    );

for (let i = relatedCars.length - 1; i > 0; i--) {

    const j =
        Math.floor(Math.random() * (i + 1));

    [relatedCars[i], relatedCars[j]] =
        [relatedCars[j], relatedCars[i]];
}

const related =
    relatedCars.slice(0, 4);


    if (!related.length) {
        container.innerHTML = `
            <p class="related-empty">
                Boshqa avtomobillar
                hozircha mavjud emas.
            </p>
        `;

        return;
    }


    container.innerHTML =
        related
            .map(
                car => {

                    const image =
                        getGalleryImages(
                            car
                        )[0] || "";


                    return `
                        <article
                            class="related-car-card"
                        >

                            <a
                                href="car.html?id=${car.id}"
                                class="related-car-image"
                            >

                                <img
                                    src="${image}"
                                    alt="${car.name || "BBA CARS"}"
                                    loading="lazy"
                                >

                            </a>


                            <div
                                class="related-car-info"
                            >

                                <span>
                                    ${car.brand || "BBA CARS"}
                                </span>


                                <h3>
                                    ${car.name || "Avtomobil"}
                                </h3>


                                <strong>
                                    ${formatPrice(car.price)}
                                </strong>
 

                                <div class="related-car-specs">

    <span>
        ${car.type === "electric"
            ? "Elektr"
            : car.type === "hybrid"
            ? "Gibrid"
            : car.type === "petrol"
            ? "Benzin"
            : car.type || "—"}
    </span>

    <span>
        ${car.seats ? `${car.seats} o‘rin` : "—"}
    </span>

    <span>
        ${car.range ? `${car.range} km` : "—"}
    </span>

</div>
<div class="related-car-features">
    ${car.camera360 === "yes" ? "<span>360° kamera</span>" : ""}
    ${car.hud === "yes" ? "<span>HUD display</span>" : ""}
    ${car.seatVentilation === "yes" ? "<span>Ventilyatsiya</span>" : ""}
</div>

                                <a
                                    href="car.html?id=${car.id}"
                                >
                                    Batafsil →
                                </a>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}



document.addEventListener(
    "DOMContentLoaded",
    loadCarDetail
);