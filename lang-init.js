(function () {
    const lang =
        localStorage.getItem("bbaLanguage") || "uz";

    document.documentElement.lang =
        lang === "zh" ? "zh-CN" : lang;

    document.documentElement.dataset.bbaLang = lang;
})();