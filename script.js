const domReady = (fn) => {
	document.addEventListener("DOMContentLoaded", fn);
	if (
		document.readyState === "interactive" ||
		document.readyState === "complete"
	) {
		fn();
	}
};

const sleepSeconds = (s) => {
	return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

const convertColor = (value) => {
	return value.split(" ").map((c) => {
		return Math.ceil(c * 255);
	});
};

const getWindowHeight = () => {
	return window.innerHeight;
};

const getWindowWidth = () => {
	return window.innerWidth;
};

const setImageSizeToWindowSize = () => {
	imageWidthProperty = getWindowWidth();
	imageHeightProperty = getWindowHeight();
};

const setBackgroundColor = (color) => {
	document.body.style.backgroundColor = color;
};

const setBackgroundImage = (value) => {
	document.body.style.backgroundImage = value;
};

const setBackgroundVideo = (value) => {
	document.getElementById("background-video").src = value;
};

const waitIntervalOrReset = async (interval) => {
	var waitedSeconds = 0;

	while (!propertiesChanged && interval != null && waitedSeconds < interval) {
		await sleepSeconds(1);
		waitedSeconds++;
	}
};

const waitUntilPropertiesAreSet = async () => {
	while (!propertiesSet) await sleepSeconds(1);
};

const runRoutine = async () => {
	await waitUntilPropertiesAreSet();

	const imageElement = document.getElementById("showcase-image");

	while (true) {
		if (apiKeyProperty) {
			const prompt =
				customPromptProperty ||
				somePrompts[Math.floor(Math.random() * somePrompts.length)];

			const size = `${imageWidthProperty}x${imageHeightProperty}`;

			const body = {
				prompt: prompt,
				n: 1,
				size: size,
			};

			const response = await fetch(
				"https://api.openai.com/v1/images/generations",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer " + apiKeyProperty,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				}
			);

			if (response.status == 200) {
				const responseBody = await response.json();

				if ("data" in responseBody) {
					imageElement.classList.remove("loading");
					imageElement.src = responseBody.data[0].url;
				} else {
					console.error(responseBody);
				}
			}
		}

		await waitIntervalOrReset(intervalInSecondsProperty);
		propertiesChanged = false;
	}
};

const somePrompts = ["cat", "dog", "tree"];

var apiKeyProperty = null;

var customPromptProperty = null;

var customImageSizeSet = false;
var imageWidthProperty = getWindowWidth();
var imageHeightProperty = getWindowHeight();

var intervalInSecondsProperty = null;

var propertiesSet = false;
var propertiesChanged = false;

window.wallpaperPropertyListener = {
	applyUserProperties: (properties) => {
		apiKeyProperty = properties.apikey?.value || null;

		customPromptProperty = properties.prompt?.value || null;

		if (properties.imagesize) {
			customImageSizeSet = true;

			imageWidthProperty = properties.imagesize.value || window.innerWidth;
			imageHeightProperty = properties.imagesize.value || window.innerHeight;
		} else {
			customImageSizeSet = false;

			setImageSizeToWindowSize();
		}

		if (properties.schemecolor) {
			setBackgroundColor(`rgb(${convertColor(properties.schemecolor.value)})`);
		} else {
			setBackgroundColor(null);
		}

		intervalInSecondsProperty = properties.interval?.value || null;

		if (properties.backgroundimage) {
			setBackgroundImage(`url("file:///${properties.backgroundimage.value}")`);
		} else {
			setBackgroundImage(null);
		}

		if (properties.backgroundvideo) {
			setBackgroundVideo(`file:///${properties.backgroundvideo.value}`);
		} else {
			setBackgroundVideo(null);
		}

		propertiesSet = true;
		propertiesChanged = true;
	},
};

window.onresize = () => {
	if (!customImageSizeSet) {
		setImageSizeToWindowSize();
		propertiesChanged = true;
	}
};

domReady(runRoutine);
