function getCarImageUrl(image) { if (!image) return "";
const url = String(image).trim();

if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
}

return "https://api.bbacars.uz/" + url.replace(/^\/+/, "");
}
async function loadCarDetail() { const container = document.getElementById("carDetail");
try {
    const params = new URLSearchParams(window.location.search);
    const carId = params.get("id");

    if (!carId) {
        throw new Error("Avtomobil ID topilmadi");
    }

    const response = await fetch("https://api.bbacars.uz/cars", {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Backend javob bermadi");
    }

    const cars = await response.json();

    const car = cars.find(item =>
        String(item.id) === String(carId)
    );

    if (!car) {
        throw new Error("Avtomobil topilmadi");
    }

    document.title = `${car.name} | BBA CARS`;

    container.innerHTML = `

        <section class="detail-hero">

            <div>
    <div class="detail-image">
        <img
            id="mainCarImage"
            src="${getCarImageUrl(car.image)}"
            alt="${car.name}"
        >
    </div>

    <div class="detail-gallery" id="detailGallery"></div>
</div>

            <div class="detail-main-info">

                <span class="detail-brand">
                    ${car.brand || "BBA CARS"}
                </span>

                <h1>${car.name}</h1>

                <div class="detail-price">
                    <span>NARXI</span>
                    <strong>
                        ${Number(car.price).toLocaleString("en-US")} $
                    </strong>
                </div>

                <div class="detail-quick-specs">

                    <div class="detail-spec">
                        <span>YILI</span>
                        <strong>${car.year || "—"}</strong>
                    </div>

                    <div class="detail-spec">
                        <span>TURI</span>
                        <strong>${car.type || "—"}</strong>
                    </div>

                    <div class="detail-spec">
                        <span>BREND</span>
                        <strong>${car.brand || "—"}</strong>
                    </div>

                </div>

                <button
                    class="detail-order-btn"
                    id="detailOrderBtn"
                    type="button"
                >
                    Ariza qoldirish →
                </button>

            </div>

        </section>

        <section class="detail-specifications">

            <div class="detail-section-heading">
                <span>BBA CARS</span>
                <h2>Avtomobil haqida</h2>
            </div>

            <div class="detail-spec-grid">

                <div>
                    <span>Model</span>
                    <strong>${car.name || "—"}</strong>
                </div>

                <div>
                    <span>Brend</span>
                    <strong>${car.brand || "—"}</strong>
                </div>

                <div>
                    <span>Ishlab chiqarilgan yil</span>
                    <strong>${car.year || "—"}</strong>
                </div>

                <div>
                    <span>Avtomobil turi</span>
                    <strong>${car.type || "—"}</strong>
                </div>

                <div>
    <span>Yurish masofasi</span>
    <strong>${car.range || "—"} km</strong>
</div>

<div>
    <span>Batareya hajmi</span>
    <strong>${car.battery || "—"} kWh</strong>
</div>

<div>
    <span>Dvigatel</span>
    <strong>${car.engine || "—"}</strong>
</div>

<div>
    <span>Privod</span>
    <strong>${car.drive || "—"}</strong>
</div>

<div>
    <span>Quvvat</span>
    <strong>${car.power || "—"} ot kuchi</strong>
</div>

<div>
    <span>0–100 km/soat</span>
    <strong>${car.acceleration || "—"} sek</strong>
</div>

<div>
    <span>Maksimal tezlik</span>
    <strong>${car.maxSpeed || "—"} km/soat</strong>
</div>

<div>
    <span>O‘rindiqlar soni</span>
    <strong>${car.seats || "—"}</strong>
</div>

<div>
    <span>Uzunligi</span>
    <strong>${car.length || "—"} mm</strong>
</div>

<div>
    <span>G‘ildirak bazasi</span>
    <strong>${car.wheelbase || "—"} mm</strong>
</div>

<div>
    <span>Sovutgich</span>
    <strong>${car.fridge === "yes" ? "Bor" : car.fridge === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>HUD displey</span>
    <strong>${car.hud === "yes" ? "Bor" : car.hud === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>Face ID</span>
    <strong>${car.faceId === "yes" ? "Bor" : car.faceId === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>O‘rindiq massaji</span>
    <strong>${car.massage === "yes" ? "Bor" : car.massage === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>360° kamera</span>
    <strong>${car.camera360 === "yes" ? "Bor" : car.camera360 === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>O‘rindiq isitish</span>
    <strong>${car.seatHeating === "yes" ? "Bor" : car.seatHeating === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>O‘rindiq ventilyatsiyasi</span>
    <strong>${car.seatVentilation === "yes" ? "Bor" : car.seatVentilation === "no" ? "Yo‘q" : "—"}</strong>
</div>

<div>
    <span>Pnevmatik osma</span>
    <strong>${car.airSuspension === "yes" ? "Bor" : car.airSuspension === "no" ? "Yo‘q" : "—"}</strong>
</div>

            </div>

        </section>
    `;

    let galleryImages = [];

try {
    galleryImages = car.images ? JSON.parse(car.images) : [];
} catch (e) {
    galleryImages = [];
}

if (galleryImages.length === 0 && car.image) {
    galleryImages = [car.image];
}

const mainCarImage = document.getElementById("mainCarImage");
const detailGallery = document.getElementById("detailGallery");

if (mainCarImage && detailGallery) {
    detailGallery.innerHTML = galleryImages.map((img, index) => {
        return `
            <img
                src="${getCarImageUrl(img)}"
                alt="${car.name} ${index + 1}"
                class="gallery-thumb"
                data-image="${getCarImageUrl(img)}"
            >
        `;
    }).join("");

    detailGallery.querySelectorAll(".gallery-thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
            mainCarImage.src = thumb.dataset.image;
        });
    });
}

    setupDetailOrder(car);

} catch (error) {
    console.error(error);

    if (container) {
        container.innerHTML = `
            <div class="car-detail-error">
                <h2>Avtomobil topilmadi</h2>
                <a href="index.html#cars">
                    Avtomobillarga qaytish
                </a>
            </div>
        `;
    }
}
} 
function setupDetailOrder(car) { const orderBtn = document.getElementById("detailOrderBtn");
if (!orderBtn) return;

const orderModal = document.getElementById("orderModal");
orderBtn.addEventListener("click", () => { if (!orderModal) return;
orderModal.classList.add("active");
document.body.style.overflow = "hidden";
});
const closeOrderModal = document.getElementById("closeOrderModal");

if (closeOrderModal) {
    closeOrderModal.addEventListener("click", () => {
        orderModal.classList.remove("active");
        document.body.style.overflow = "";
    });
}
const orderForm = document.getElementById("orderForm");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
customerPhone.value = "+998 ";
customerPhone.addEventListener("input", function () { let numbers = this.value.replace(/\D/g, "");
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
const submitButton = document.querySelector(".order-submit");

if (orderForm && customerName && customerPhone && submitButton) {
orderForm.addEventListener("submit", async (e) => { e.preventDefault();
const name = customerName.value.trim();
const phone = customerPhone.value.trim();

if (name.length < 2) {
    alert("Iltimos, ismingizni kiriting.");
    customerName.focus();
    return;
}

const phoneNumbers = phone.replace(/\D/g, "");

if (phoneNumbers.length !== 12) {
    alert("Telefon raqamingizni to'liq kiriting.");
    customerPhone.focus();
    return;
}
submitButton.disabled = true;
submitButton.textContent = "Yuborilmoqda...";

fetch("https://api.bbacars.uz/order", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        car: car.name,
        name: name,
        phone: phone
    })
})
.then(response => response.json()) .then(data => { orderModal.classList.remove("active"); document.body.style.overflow = "";
orderForm.reset();

submitButton.disabled = false;
submitButton.textContent = "Ariza yuborish →";

const successModal = document.getElementById("successModal");
successModal.classList.add("active");
document.getElementById("closeSuccessModal").onclick = () => successModal.classList.remove("active");
}) .catch(error => { console.error(error);
submitButton.disabled = false;
submitButton.textContent = "Ariza yuborish →";

alert("Arizani yuborishda xatolik yuz berdi.");
});
});
}
}
document.addEventListener("DOMContentLoaded", loadCarDetail);