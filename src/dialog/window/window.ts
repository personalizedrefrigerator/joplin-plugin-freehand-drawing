import type { ButtonRecord } from '../AbstractDrawingView.ts';

const log = (message: string) => {
	const container = document.createElement('p');
	container.appendChild(document.createTextNode(message));
	container.onclick = () => container.remove();

	const logArea = document.querySelector('#log-container');
	logArea?.appendChild(container);
};

type PluginMessageListener = (event: MessageEvent) => void;

let pluginMessageListeners: PluginMessageListener[] = [];
window.onmessage = (event) => {
	if (!event.origin.startsWith('file:')) {
		log(`Ignored message with origin ${event.origin}`);
		return;
	}

	const data = event.data;
	if (data.kind === 'addScript') {
		const src: string = event.data.src;
		if (src.endsWith('.js')) {
			const scriptElement = document.createElement('script');
			scriptElement.src = src;
			document.head.appendChild(scriptElement);
		} else {
			const linkElement = document.createElement('link');
			linkElement.href = src;
			linkElement.rel = 'stylesheet';
			document.head.appendChild(linkElement);
		}
	} else if (data.kind === 'setHtml') {
		document.body.innerHTML = data.html;
	} else if (data.kind === 'setButtons') {
		const buttons: ButtonRecord[] = data.buttons;
		const buttonElements: HTMLButtonElement[] = [];
		for (const buttonRecord of buttons) {
			const buttonElement = document.createElement('button');
			buttonElement.innerText = buttonRecord.title ?? buttonRecord.id;
			buttonElement.onclick = () => {
				window.parent.postMessage(
					{
						kind: 'dialogResult',
						result: { id: buttonRecord.id },
					},
					'*',
				);
				window.close();
			};
			buttonElements.push(buttonElement);
		}

		// Replace the button container
		let buttonContainer = document.querySelector('.button-container');
		if (buttonContainer) buttonContainer.remove();
		buttonContainer = document.createElement('div');
		buttonContainer.classList.add('button-container');
		buttonContainer.replaceChildren(...buttonElements);
		document.body.appendChild(buttonContainer);
	} else {
		pluginMessageListeners.forEach((l) => l(event));
	}
};

window.addEventListener('error', (e) => {
	log(e.toString() + e.error.stack);
});

// Emulate Joplin's webviewApi for compatibility
(window as any).webviewApi = {
	postMessage: (message: any) => {
		const id = Math.random();
		window.parent.postMessage(
			{
				message,
				id,
			},
			'*',
		);

		return new Promise<any>((resolve) => {
			const responseListener = (event: MessageEvent) => {
				if (event.data.responseId === id) {
					pluginMessageListeners = pluginMessageListeners.filter((l) => l !== responseListener);
					resolve(event.data.response);
				}
			};
			pluginMessageListeners.push(responseListener);
		});
	},
	onMessage: (listener: (message: any) => void) => {
		pluginMessageListeners.push((event) => {
			if (event.data.message) {
				listener(event.data);
			}
		});
	},
};
