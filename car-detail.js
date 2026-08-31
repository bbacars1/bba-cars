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

orderBtn.addEventListener("click", () => {
    console.log("Ariza avtomobili:", car.name);
});
}
document.addEventListener("DOMContentLoaded", loadCarDetail);