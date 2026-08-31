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

            <div class="detail-image">
                <img
                    src="${getCarImageUrl(car.image)}"
                    alt="${car.name}"
                >
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

            </div>

        </section>
    `;

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

alert("Arizangiz muvaffaqiyatli yuborildi!");
}) .catch(error => { console.error(error);
submitButton.disabled = false;
submitButton.textContent = "Ariza yuborish →";

alert("Arizani yuborishda xatolik yuz berdi.");
});
});
}
}
document.addEventListener("DOMContentLoaded", loadCarDetail);