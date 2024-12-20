const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "pinterest",
        version: "1.6.9",
        credits: "♡ Nazrul ♡",
        cooldowns: 10,
        hasPermission: 0,
        Description: "Image Search",
        commandCategory: "image",
    },

    run: async function ({ api, event, args }) {

        const queryAndLength = args.join(" ").split("-");
        
        const image = queryAndLength[0].trim();
        const length = queryAndLength[1] ? queryAndLength[1].trim() : null;

        if (!image || !length || isNaN(length)) {
            return api.sendMessage(
                "✨ Usage: /pinterest [keyword] - [count]\nExample: /pinterest rose - 10",
                event.threadID,
                event.messageID
            );
        }

        try {
            // Indicate the search is in progress with the search keyword
            const msg = await api.sendMessage(`✨ Searching for images of "${image}"...!!`, event.threadID);

            // Make an API call to search for images on Pinterest
            const response = await axios.get(
                `https://www.x-noobs-apis.000.pe/nazrul/pin?query=${encodeURIComponent(image)}&limit=${encodeURIComponent(length)}`
            );

            const data = response.data.data;

            if (!data || data.length === 0) {
                return api.sendMessage(
                    `⚠️ No images found for "${image}". Please try a different search.`,
                    event.threadID,
                    event.messageID
                );
            }

            const attachments = [];
            const totalImagesCount = Math.min(data.length, parseInt(length));

            for (let i = 0; i < totalImagesCount; i++) {
                const imgUrl = data[i];
                const imgResponse = await axios.get(imgUrl, {
                    responseType: "arraybuffer",
                });
                const imgPath = path.join(__dirname, "dvassets", `${i + 1}.jpg`);
                await fs.outputFile(imgPath, imgResponse.data);
                attachments.push(fs.createReadStream(imgPath));
            }

            await api.unsendMessage(msg.messageID);

            await api.sendMessage(
                {
                    body: `✅ Here are your searched images for "${image}"\n✨ Total Image Count: ${totalImagesCount}`,
                    attachment: attachments,
                },
                event.threadID,
                event.messageID
            );
        } catch (error) {
            console.error(error);
            api.sendMessage(
                `❌ Error: ${error.message}`,
                event.threadID,
                event.messageID
            );
        }
    },
};
