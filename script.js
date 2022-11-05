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

const setImageSizeToWindowSize = () => {
	imageWidthProperty = getWindowWidth();
	imageHeightProperty = getWindowHeight();
};

const getWindowHeight = () => {
	return window.innerHeight;
};

const getWindowWidth = () => {
	return window.innerWidth;
};

const setBodyBackgroundColor = (color) => {
	document.body.style.backgroundColor = color;
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
	const imageElement = document.getElementById("background-image");

	if (!imageElement) {
		console.error("image element not found");
		return;
	}

	imageElement.src = IMAGE_PLACEHOLDER_URL;

	await waitUntilPropertiesAreSet();

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
					imageUrl = responseBody.data[0].url;
				} else {
					console.error(responseBody);
				}
			}
		}

		imageElement.src = imageUrl;

		await waitIntervalOrReset(intervalInSecondsProperty);
		propertiesChanged = false;
	}
};

const IMAGE_PLACEHOLDER_URL =
	"https://scontent-vie1-1.xx.fbcdn.net/v/t39.30808-6/306009231_580108473910767_2088220748777882536_n.png?_nc_cat=100&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=mN77TJl_IoQAX-R1piv&_nc_ht=scontent-vie1-1.xx&oh=00_AfA20bNelYc1jngOw6qwGKWLbvEzC3tOkifXKK_W5plDRA&oe=636B2E68";

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
			const customColor = properties.schemecolor.value.split(" ").map((c) => {
				return Math.ceil(c * 255);
			});
			setBodyBackgroundColor("rgb(" + customColor + ")");
		} else {
			setBodyBackgroundColor(null);
		}

		intervalInSecondsProperty = properties.interval?.value || null;

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
