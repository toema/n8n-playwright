export interface IBrowserOptions {
    headless?: boolean;
    slowMo?: number;
}

export interface BrowserPaths {
    [key: string]: {
        windows: string[];
        linux: string[];
        darwin: string[];
    };
}

export interface IScreenshotOptions {
    fullPage?: boolean;
    path?: string;
}
