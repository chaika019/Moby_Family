# Иллюстрации для темы по референсам

Оба ассета созданы встроенным инструментом imagegen (не CLI), по изображениям пользователя. Исходники сохранены в проекте, для интерфейса выполнено только кодирование в WebP без изменения композиции, размера или прозрачности. UI, названия уроков и финансовые значения не входят в иллюстрации.

## Прозрачный лис

- Исходник: public/images/moby-fox.png, 1314×1197, RGBA; проверено наличие alpha 0–255.
- Используется: public/images/moby-fox.webp.
- Reference image: references/pic/photo_2026-10-20_17-44-01.jpg.
- Финальный промпт:

> Use case: background-extraction. Asset type: transparent mascot asset for a functioning React mobile app. Reference image is the attached Russian banking app design. Extract/recreate ONLY the full seated orange fox mascot in its electric blue hoodie with small white M, holding a dark navy smartphone with a small multicolor M. Preserve the specific friendly face, huge fluffy orange and cream tail, ears, big brown eyes, white muzzle, little blue sneakers, plush high-end 3D character rendering and warm orange rim light from the reference. Full character centered with tail and shoes completely inside frame. Remove ALL UI, labels, numbers, background, ribbons, notifications, cards and shadows on the ground. Truly transparent background and crisp natural alpha around fur. No additional text, no watermark. This is an asset, not an app mockup. Save the generated asset normally and report its local file path.

## Мир академии

- Исходник: public/images/moby-academy-world.png, 887×1774, RGB.
- Используется: public/images/moby-academy-world.webp.
- Reference image: references/pic/photo_2026-10-20_17-44-07.jpg.
- Финальный промпт:

> Use case: stylized-concept. Asset type: tall seamless-feeling background illustration for a real mobile finance academy UI. Use attached screenshot ONLY as visual reference. Recreate the fantastical deep cobalt blue and purple landscape of floating moss-covered rocky islands above clouds, cyan glowing pathways winding between islands, distant miniature skyscraper silhouettes, tiny lush trees, magical atmospheric 3D high-end game world. Portrait composition about 1:2 tall; islands along a winding path alternating left and right, five platforms extending from near top to bottom. Dark deep navy at top, saturated electric blue and violet atmosphere, cyan light rings around two active islands. Keep the platforms modest and substantial calm dark negative space between them for live React lesson labels. Absolutely NO text, letters, digits, badges, logos, fox characters, UI, navigation, buttons, padlocks, speech bubbles, cards, charts or screenshot elements. Only the empty scenic world. The lesson buttons will be implemented separately as real HTML, do not depict any buttons. Full bleed vertical artwork.

## Использование

Оформление и пути ассетов определены в src/styles/theme/illustrations.css. scripts/build-preview.mjs встраивает изображения в Moby-preview.html, поэтому автономная сборка не зависит от внешних файлов или интернета. Это приближение к AI-референсам пользователя, а не официально предоставленные банком мастер-ассеты.
