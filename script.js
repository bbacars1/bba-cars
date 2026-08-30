function getCarImageUrl(image) {
    if (!image) return "";

    const url = String(image).trim();

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return "https://api.bbacars.uz/" + url.replace(/^\/+/, "");
}
const carPrice = Number(document.body.dataset.carPrice);
const firstPaymentPercent = 0.50;
const monthlyRate = 0.02;

const monthsSelect = document.getElementById("months");

function calculateCredit() {

    const months = Number(monthsSelect.value);

    const firstPayment = carPrice * firstPaymentPercent;
    const remaining = carPrice - firstPayment;

    // 2% × tanlangan oylar
    const totalPercent = monthlyRate * months;

    const markup = remaining * totalPercent;
    const creditTotal = remaining + markup;

    const monthlyPayment = creditTotal / months;

    document.getElementById("firstPayment").textContent =
        "$" + firstPayment.toLocaleString();

    document.getElementById("remaining").textContent =
        "$" + remaining.toLocaleString();

    document.getElementById("percent").textContent =
        (totalPercent * 100) + "%";

    document.getElementById("creditTotal").textContent =
        "$" + creditTotal.toLocaleString();

    document.getElementById("monthlyPayment").textContent =
        "$" + monthlyPayment.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
}

if (monthsSelect) {
    monthsSelect.addEventListener("change", calculateCredit);
    calculateCredit();
}


const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });
}


// =========================
// CAR FILTER + SEARCH
// =========================

const filterButtons = document.querySelectorAll(".filter-btn");
let carCards = document.querySelectorAll(".car-card");
const carSearch = document.getElementById("carSearch");

let activeFilter = "all";
let showingFavorites = false;

function filterCars() {

    const searchValue = carSearch
        ? carSearch.value.toLowerCase().trim()
        : "";

    carCards.forEach(card => {

        const type = card.dataset.type;
        const carName = card.querySelector("h3");

        const name = carName
            ? carName.textContent.toLowerCase()
            : "";

        const matchesFilter =
            activeFilter === "all" ||
            type === activeFilter;

        const matchesSearch =
            name.includes(searchValue);
const favoriteBtn = card.querySelector(".favorite-btn");

const matchesFavorite =
    !showingFavorites ||
    (favoriteBtn && favoriteBtn.classList.contains("active"));
        if (matchesFilter && matchesSearch && matchesFavorite) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

    });

    const visibleCars = [...carCards].filter(card => {
    return card.style.display !== "none";
});

const noResults = document.getElementById("noResults");

if (noResults) {
    noResults.style.display =
        visibleCars.length === 0 ? "block" : "none";
}

const carCount = document.getElementById("carCount");

if (carCount) {
    carCount.textContent = visibleCars.length + " ta avtomobil topildi";
}
}


// FILTER TUGMALARI
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        activeFilter = button.dataset.filter;

        filterCars();
    });

});


// QIDIRUV
if (carSearch) {

    carSearch.addEventListener("input", () => {
        filterCars();
    });

}

// ===== QIDIRUVNI TOZALASH =====

const clearSearch = document.getElementById("clearSearch");

if (clearSearch && carSearch) {
    clearSearch.addEventListener("click", () => {
        carSearch.value = "";
        filterCars();
        carSearch.focus();
    });
}


const favoriteButtons = document.querySelectorAll(".favorite-btn");

favoriteButtons.forEach((button, index) => {
    const favoriteKey = "favorite-" + index;

    // Oldin sevimliga qo‘shilganmi?
    if (localStorage.getItem(favoriteKey) === "true") {
        button.classList.add("active");
        button.textContent = "♥";
    }

    button.addEventListener("click", () => {
        button.classList.toggle("active");

        if (button.classList.contains("active")) {
            button.textContent = "♥";
            localStorage.setItem(favoriteKey, "true");
        } else {
            button.textContent = "♡";
            localStorage.setItem(favoriteKey, "false");
        }
        filterCars()
    });
});






const favoritesFilter = document.getElementById("favoritesFilter");

if (favoritesFilter) {
    favoritesFilter.addEventListener("click", () => {
        showingFavorites = !showingFavorites;

        filterCars();

        favoritesFilter.classList.toggle("active", showingFavorites);
    });
}

const sortCars = document.getElementById("sortCars");
const carsContainer = document.querySelector(".cars-container");
const originalOrder = Array.from(document.querySelectorAll(".car-card"));

if (sortCars) sortCars.addEventListener("change", () => {
    const cards = Array.from(document.querySelectorAll(".car-card"));

    if (sortCars.value === "price-low") {
        cards.sort((a, b) => {
            const priceA = Number(
                a.querySelector(".price h4").textContent.replace(/[^0-9]/g, "")
            );

            const priceB = Number(
                b.querySelector(".price h4").textContent.replace(/[^0-9]/g, "")
            );

            return priceA - priceB;
        });
    }

    if (sortCars.value === "price-high") {
        cards.sort((a, b) => {
            const priceA = Number(
                a.querySelector(".price h4").textContent.replace(/[^0-9]/g, "")
            );

            const priceB = Number(
                b.querySelector(".price h4").textContent.replace(/[^0-9]/g, "")
            );

            return priceB - priceA;
        });
    }

    if (sortCars.value === "new") {
        cards.sort((a, b) => {
            const yearA = Number(a.dataset.year);
            const yearB = Number(b.dataset.year);

            return yearB - yearA;
        });
    }

    if (sortCars.value === "top") {
    cards.sort((a, b) => {
        const aTop = a.querySelector(".badge-top") ? 1 : 0;
        const bTop = b.querySelector(".badge-top") ? 1 : 0;

        return bTop - aTop;
    });
}
if (sortCars.value === "default") {
    originalOrder.forEach((card) => {
        carsContainer.appendChild(card);
    });

    return;
}
    cards.forEach((card) => {
        carsContainer.appendChild(card);
    });
});


const compareButtons = document.querySelectorAll(".compare-btn");

let selectedCars = [];
const compareBar = document.getElementById("compareBar");
const compareCount = document.getElementById("compareCount");

compareButtons.forEach(button => {
    button.addEventListener("click", () => {

        const card = button.closest(".car-card");

        if (button.classList.contains("selected")) {

            button.classList.remove("selected");
            button.textContent = "⚖️ Taqqoslash";

            selectedCars = selectedCars.filter(item => item !== card);

        } else {

            if (selectedCars.length >= 2) {
                alert("Taqqoslash uchun maksimum 2 ta avtomobil tanlash mumkin.");
                return;
            }

            button.classList.add("selected");
            button.textContent = "✓ Tanlandi";

            selectedCars.push(card);
        }
        if (selectedCars.length > 0) {
    compareBar.style.display = "flex";
    compareCount.textContent = selectedCars.length + " ta avtomobil tanlandi";
} else {
    compareBar.style.display = "none";
}

    });
});


const compareNowBtn = document.getElementById("compareNowBtn");
const compareModal = document.getElementById("compareModal");
const compareClose = document.getElementById("compareClose");

if (compareNowBtn) compareNowBtn.addEventListener("click", () => {
    if (selectedCars.length !== 2) {
    document.getElementById("compareAlert").style.display = "flex";
    return;
}
const compareCars = document.getElementById("compareCars");

compareCars.innerHTML = "";

selectedCars.forEach(card => {
    const image = card.querySelector(".car-image img").src;
    const name = card.querySelector("h3").textContent;
    const price = card.querySelector(".price h4").textContent;
    const details = card.querySelectorAll(".car-details span");

const year = details[0].textContent;
const type = details[1].textContent;
const drive = details[2].textContent;

    compareCars.innerHTML += `
    <div class="compare-car">
        <img src="${image}" alt="${name}">

        <h3>${name}</h3>

        
    </div>
`;
});
const compareSpecs = document.getElementById("compareSpecs");

const car1 = selectedCars[0];
const car2 = selectedCars[1];

const details1 = car1.querySelectorAll(".car-details span");
const details2 = car2.querySelectorAll(".car-details span");

const price1 = car1.querySelector(".price h4").textContent;
const price2 = car2.querySelector(".price h4").textContent;

const engine1 = car1.dataset.engine || "—";
const engine2 = car2.dataset.engine || "—";

const electricRange1 = car1.dataset.electricRange || "—";
const electricRange2 = car2.dataset.electricRange || "—";

const battery1 = car1.dataset.battery || "—";
const battery2 = car2.dataset.battery || "—";

const totalRange1 = car1.dataset.totalRange || "—";
const totalRange2 = car2.dataset.totalRange || "—";

const seats1 = car1.dataset.seats || "—";
const seats2 = car2.dataset.seats || "—";

const power1 = car1.dataset.power || "—";
const power2 = car2.dataset.power || "—";

const acceleration1 = car1.dataset.acceleration || "—";
const acceleration2 = car2.dataset.acceleration || "—";

const maxSpeed1 = car1.dataset.maxSpeed || "—";
const maxSpeed2 = car2.dataset.maxSpeed || "—";

const length1 = car1.dataset.length || "—";
const length2 = car2.dataset.length || "—";

const wheelbase1 = car1.dataset.wheelbase || "—";
const wheelbase2 = car2.dataset.wheelbase || "—";

compareSpecs.innerHTML = `
    <div class="compare-spec-row">
        <div class="value">${price1}</div>
        <div class="label">NARXI</div>
        <div class="value">${price2}</div>
    </div>

    <div class="compare-spec-row">
        <div class="value">${details1[0].textContent}</div>
        <div class="label">YILI</div>
        <div class="value">${details2[0].textContent}</div>
    </div>

    <div class="compare-spec-row">
        <div class="value">${details1[1].textContent}</div>
        <div class="label">TURI</div>
        <div class="value">${details2[1].textContent}</div>
    </div>

    <div class="compare-spec-row">
        <div class="value">${details1[2].textContent}</div>
        <div class="label">PRIVOD</div>
        <div class="value">${details2[2].textContent}</div>
    </div>

    <div class="compare-spec-row">
    <div class="value">${engine1}</div>
    <div class="label">DVIGATEL</div>
    <div class="value">${engine2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${electricRange1}</div>
    <div class="label">ELEKTR YURISH</div>
    <div class="value">${electricRange2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${battery1}</div>
    <div class="label">BATAREYA</div>
    <div class="value">${battery2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${totalRange1}</div>
    <div class="label">UMUMIY MASOFA</div>
    <div class="value">${totalRange2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${seats1}</div>
    <div class="label">O‘RINDIQLAR</div>
    <div class="value">${seats2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${power1}</div>
    <div class="label">QUVVAT</div>
    <div class="value">${power2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${acceleration1}</div>
    <div class="label">0–100 KM/S</div>
    <div class="value">${acceleration2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${maxSpeed1}</div>
    <div class="label">MAKSIMAL TEZLIK</div>
    <div class="value">${maxSpeed2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${length1}</div>
    <div class="label">UZUNLIGI</div>
    <div class="value">${length2}</div>
</div>

<div class="compare-spec-row">
    <div class="value">${wheelbase1}</div>
    <div class="label">G‘ILDIRAK BAZASI</div>
    <div class="value">${wheelbase2}</div>
</div>
`;
    compareModal.style.display = "block";
});

if (compareClose) compareClose.addEventListener("click", () => {
    compareModal.style.display = "none";
});

if (compareModal) compareModal.addEventListener("click", (e) => {
    if (e.target === compareModal) {
        compareModal.style.display = "none";
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        compareModal.style.display = "none";
    }
});


const clearCompareBtn = document.getElementById("clearCompareBtn");

if (clearCompareBtn) clearCompareBtn.addEventListener("click", () => {
    selectedCars = [];

    compareButtons.forEach(button => {
        button.classList.remove("selected");
        button.textContent = "⚖️ Taqqoslash";
    });

    compareCount.textContent = "0 ta avtomobil tanlandi";
    compareBar.style.display = "none";
});

const compareAlert = document.getElementById("compareAlert");
const compareAlertClose = document.getElementById("compareAlertClose");

if (compareAlertClose) compareAlertClose.addEventListener("click", () => {
    compareAlert.style.display = "none";
});


if (compareAlert) compareAlert.addEventListener("click", (e) => {
    if (e.target === compareAlert) {
        compareAlert.style.display = "none";
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        compareAlert.style.display = "none";
    }
});

const scrollTopBtn = document.getElementById("scrollTopBtn");

if (scrollTopBtn) {

    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.style.display = "none";
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

}

// =========================
// YAQINDA KO'RILGAN AVTOMOBILLAR
// =========================

const detailButtons = document.querySelectorAll(".details-button");

detailButtons.forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".car-card");

        if (!card) return;

        const car = {
            name: card.querySelector("h3")?.textContent || "",
            image: card.querySelector(".car-image img")?.src || "",
            price: card.querySelector(".price h4")?.textContent || "",
            link: button.getAttribute("href") || ""
        };

        let recentCars = JSON.parse(localStorage.getItem("recentCars")) || [];

        // Bir xil avtomobil qayta-qayta chiqmasin
        recentCars = recentCars.filter(item => item.name !== car.name);

        // Eng oxirgi ko‘rilgan avtomobil boshiga qo‘shiladi
        recentCars.unshift(car);

        // Faqat oxirgi 3 ta avtomobil saqlanadi
        recentCars = recentCars.slice(0, 3);

        localStorage.setItem("recentCars", JSON.stringify(recentCars));
    });
});


const recentSection = document.getElementById("recentSection");
const recentCarsContainer = document.getElementById("recentCars");

if (recentSection && recentCarsContainer) {
    const recentCars = JSON.parse(localStorage.getItem("recentCars")) || [];

    if (recentCars.length > 0) {
        recentSection.style.display = "block";

        recentCarsContainer.innerHTML = recentCars.map(car => `
            <div class="car-card recent-card">

                <div class="car-image">
                    <img src="${car.image}" alt="${car.name}">
                </div>

                <div class="car-info">
                    <h3>${car.name}</h3>

                    <div class="price">
                        <p>Narxi</p>
                        <h4>${car.price}</h4>
                    </div>

                    <a href="${car.link}" class="details-button">
                        Batafsil
                    </a>
                </div>

            </div>
        `).join("");

    } else {
        recentSection.style.display = "none";
    }
}



// ===== BBA CARS ARIZA MODAL =====

const orderModal = document.getElementById("orderModal");
const openOrderModal = document.getElementById("openOrderModal");
const closeOrderModal = document.getElementById("closeOrderModal");

if (orderModal && openOrderModal && closeOrderModal) {

    // Modalni ochish
    openOrderModal.addEventListener("click", () => {
        orderModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    // X orqali yopish
    closeOrderModal.addEventListener("click", () => {
        orderModal.classList.remove("active");
        document.body.style.overflow = "";
    });

    // Qora fonni bosganda yopish
    orderModal.addEventListener("click", (e) => {
        if (e.target === orderModal) {
            orderModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    // ESC orqali yopish
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            orderModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
}


// ===== TELEFON RAQAM FORMAT =====

const customerPhone = document.getElementById("customerPhone");

if (customerPhone) {

    customerPhone.value = "+998 ";

    customerPhone.addEventListener("input", function () {

        let numbers = this.value.replace(/\D/g, "");

        if (numbers.startsWith("998")) {
            numbers = numbers.slice(3);
        }

        numbers = numbers.slice(0, 9);

        let formatted = "+998";

        if (numbers.length > 0) {
            formatted += " " + numbers.slice(0, 2);
        }

        if (numbers.length > 2) {
            formatted += " " + numbers.slice(2, 5);
        }

        if (numbers.length > 5) {
            formatted += " " + numbers.slice(5, 7);
        }

        if (numbers.length > 7) {
            formatted += " " + numbers.slice(7, 9);
        }

        this.value = formatted;
    });

    customerPhone.addEventListener("keydown", function (e) {
        if (
            (e.key === "Backspace" || e.key === "Delete") &&
            this.value.length <= 5
        ) {
            e.preventDefault();
        }
    });

}


// ===== ARIZA FORMASINI TEKSHIRISH =====

const orderForm = document.getElementById("orderForm");
const customerName = document.getElementById("customerName");
const submitButton = document.querySelector(".order-submit");
const successModal = document.getElementById("successModal");
const closeSuccessModal = document.getElementById("closeSuccessModal");
const phoneInput = document.getElementById("customerPhone");

if (phoneInput) {
    phoneInput.addEventListener("input", function () {
        let numbers = this.value.replace(/\D/g, "");

        if (numbers.startsWith("998")) {
            numbers = numbers.slice(3);
        }

        numbers = numbers.slice(0, 9);

        let formatted = "+998";

        if (numbers.length > 0) formatted += " " + numbers.slice(0, 2);
        if (numbers.length > 2) formatted += " " + numbers.slice(2, 5);
        if (numbers.length > 5) formatted += " " + numbers.slice(5, 7);
        if (numbers.length > 7) formatted += " " + numbers.slice(7, 9);

        this.value = formatted;
    });
}
if (orderForm && customerName && customerPhone) {

    orderForm.addEventListener("submit", function (e) {
        e.preventDefault();
        

        const name = customerName.value.trim();
        const phone = customerPhone.value.trim();

        const phoneNumbers = phone.replace(/\D/g, "");

        if (name.length < 2) {
            alert("Iltimos, ismingizni kiriting.");
            customerName.focus();
            return;
        }

        if (phoneNumbers.length !== 12) {
            alert("Telefon raqamingizni to'liq kiriting.");
            customerPhone.focus();
            return;
        }
        submitButton.disabled = true;
submitButton.textContent = "Yuborilmoqda...";
const carName = document.querySelector(".car-page-info h1").textContent.trim();
console.log("🚀 FETCH BOSHLANDI", carName, name, phone);
       fetch("https://api.bbacars.uz/order", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        car: carName,
        name: name,
        phone: phone
    })
})
.then(response => response.json())
.then(data => {
    orderModal.classList.remove("active");
successModal.classList.add("active");
    orderForm.reset();

    submitButton.disabled = false;
submitButton.textContent = "Ariza yuborish →";
})
.catch(error => {
    console.error(error);

    submitButton.disabled = false;
submitButton.textContent = "Ariza yuborish →";

    alert("❌ Arizani yuborishda xatolik yuz berdi.");
});
if (closeSuccessModal && successModal) {
    closeSuccessModal.addEventListener("click", () => {
        successModal.classList.remove("active");
    });
}
    });

}

async function loadAdminCarsToSite(retryCount = 0) {
    try {
        const response = await fetch("https://api.bbacars.uz/cars", {
    cache: "no-store"
});

if (!response.ok) {
    throw new Error("Backend javob bermadi: " + response.status);
}
        const cars = await response.json();

        const container = document.getElementById("carsContainer");

        if (!container) return;

        
       
        cars.forEach(car => {
            const card = document.createElement("div");
            card.className = "car-card";
            card.dataset.type = car.type || "petrol";

            card.innerHTML = `
                <div class="car-image">
                    <img src="${getCarImageUrl(car.image)}" alt="${car.name}">
                    <button class="favorite-btn" type="button">♡</button>

                    <span class="car-badge badge-top">YANGI</span>
                </div>

                <div class="car-info">
                    <h3>${car.name}</h3>

                    <div class="car-details">
                        <span>${car.brand}</span>
                        <span>${car.year || ""}</span>
                    </div>

                    <div class="price">
                        <p>Narxi</p>
                        <h4>${Number(car.price).toLocaleString("en-US")} $</h4>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        carCards = document.querySelectorAll(".car-card");
        const favoriteButtons = document.querySelectorAll(".favorite-btn");

favoriteButtons.forEach((button, index) => {
    const favoriteKey = "favorite-" + index;

    if (localStorage.getItem(favoriteKey) === "true") {
        button.classList.add("active");
        button.textContent = "♥";
    }

    button.addEventListener("click", () => {
        button.classList.toggle("active");

        if (button.classList.contains("active")) {
            button.textContent = "♥";
            localStorage.setItem(favoriteKey, "true");
        } else {
            button.textContent = "♡";
            localStorage.setItem(favoriteKey, "false");
        }

        filterCars();
    });
});
filterCars();

    } catch (error) { console.error("Avtomobillarni yuklashda xatolik:", error);
if (retryCount < 5) {
    console.log("Qayta yuklashga urinish:", retryCount + 1);

    setTimeout(() => {
        loadAdminCarsToSite(retryCount + 1);
    }, 2000);
}
}
}

document.addEventListener("DOMContentLoaded", () => {
    loadAdminCarsToSite();
});