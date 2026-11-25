require("@babel/register")({
    "presets": [["@babel/preset-env"]],
    "plugins": ["@babel/plugin-transform-runtime"],
});

(async () => {
    if (process.env.NODE_ENV !== 'local') {
        const { loadSecrets } = require("./Config/secrets");
        await loadSecrets();
    }
    require("./server");
})();