# Gemini AI - Offline AI Assistant Extension

Gemini Chrome AI - Offline is an open-source Chrome extension that allows you to use Google Gemini AI capabilities offline,
directly in your Chrome browser. The extension is built on the Prompt API, which is part of the [**Built-in AI Early
Preview Program**](https://developer.chrome.com/docs/ai/built-in) by Google Chrome.

## Acknowledgements

This project is based on the proof of concept from [kseth's kharms project](https://github.com/kseth/kharms).

The extension utilizes the Prompt API, which is part of the **Built-in AI Early Preview Program** by Google Chrome.

The extension icon is based on the [UI Icon](https://www.flaticon.com/free-icon/ui_10988175) by Freepik from Flaticon.

## Features

- Offline AI Assistance: Access Gemini AI capabilities without an internet connection.
- Chrome Integration: Seamlessly integrated into your Chrome browser for easy access.
- Real-time Responses: Get AI-powered responses in real-time as you type.
- Privacy-Focused: All processing happens locally on your device, ensuring your data stays private.
- Chat History: View and interact with previous conversations or Delete them.
- Open Source: Transparent codebase that welcomes community contributions and improvements.

[![Watch the video](https://img.youtube.com/vi/XRJuGTeNVig/maxresdefault.jpg)](https://youtu.be/XRJuGTeNVig)


## Setup Instructions

1. Download and install [Chrome Dev channel](https://www.google.com/chrome/dev/) (
   or [Canary channel](https://www.google.com/chrome/canary/)).

- Ensure your Chrome version is equal to or newer than 127.0.6512.0.

2. Enable required Chrome flags:
    - Open a new tab and go to `chrome://flags/#optimization-guide-on-device-model`
    - Select "`Enabled BypassPerfRequirement`"

- This bypasses performance checks which might prevent Gemini Nano from downloading on your device.
    - Go to `chrome://flags/#prompt-api-for-gemini-nano`
    - Select "`Enabled`"
    - Go to `chrome://components/` - You'll want to see the "`Optimization Guide On Device Model`" - Click
      on "`Check for update`" and update the component.

3. Relaunch Chrome for the changes to take effect.

4. Install the Gemini Chrome AI - Offline extension (installation instructions to be added).

## Current Status

This project is still in development. Features and functionality may change as the project evolves.

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull
requests.

## To Set Up the Project Locally

1. Clone the repository:

```bash
git clone 
```

2. Install the dependencies:

```bash
npm install
```

3. Build the project - Hot reload:

```bash
npm run dev:chrome
```

4. Load the extension in Chrome: Open Chrome and go to `chrome://extensions/` and enable Developer mode. Click on "Load
   unpacked" and select the `build/chrome` folder in the project directory.
5. The extension should now be loaded in Chrome.

## License

This project is licensed under the MIT License. For more information, please see the [LICENSE](LICENSE) file.

## Disclaimer

This extension is not officially associated with Google, the Gemini AI team, or the Chrome team. It is an independent
project based on publicly available APIs and information.
