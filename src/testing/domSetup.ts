import { JSDOM } from 'jsdom';

const dom = new JSDOM(
	`
	<!DOCTYPE html>
	<html><body></body></html>	
`,
	{ url: 'http://localhost:12345/', pretendToBeVisual: true },
);

// Based loosely on the approach taken by global-jsdom
globalThis.window = dom.window as unknown as typeof window;
globalThis.document = window.document;

Object.setPrototypeOf(globalThis, globalThis.window);
// Prevent instanceof checks from failing
globalThis.Event = globalThis.window.Event;

// jsdom doesn't support HTMLCanvasElement#getContext — it logs an error
// to the console. Make it return null so we can handle a non-existent Canvas
// at runtime (e.g. use something else, if available).
window.HTMLCanvasElement.prototype.getContext = () => null;

// jsdom also doesn't support ResizeObserver. Mock it.
window.ResizeObserver ??= class {
	public constructor(_callback: ResizeObserverCallback) {}

	public disconnect() {}

	public observe() {}

	public unobserve() {}
};
