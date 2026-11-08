maptilersdk.config.apiKey = maptilerApiKey;
// 地図は日本語にしたいので日本語の設定を入れておく
maptilersdk.config.primaryLanguage = maptilersdk.Language.JAPANESE;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: spaground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

new maptilersdk.Marker()
    .setLngLat(spaground.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 }).setHTML(
            `<h3>${spaground.title}</h3><p>${spaground.location}</p>`
        )
    )
    .addTo(map);


