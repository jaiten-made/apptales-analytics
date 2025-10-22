export interface TrackerConfig {
  endpoint?: string;
  debug?: boolean;
  trackClicks?: boolean;
  trackFormSubmits?: boolean;
  trackPageViews?: boolean;
  trackScrollDepth?: boolean;
  trackMouseMovement?: boolean;
  trackErrors?: boolean;
  batchSize?: number;
  batchInterval?: number;
  excludeSelectors?: string[];
  customData?: Record<string, any>;
}

export interface TrackedEvent {
  type: string;
  timestamp: number;
  url: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  sessionId: string;
  data?: Record<string, any>;
}

export interface ClickEvent extends TrackedEvent {
  type: "click";
  data: {
    x: number;
    y: number;
    elementTag: string;
    elementId?: string;
    elementClass?: string;
    elementText?: string;
    elementHref?: string;
  };
}

export interface PageViewEvent extends TrackedEvent {
  type: "pageview";
  data: {
    title: string;
    referrer: string;
    path: string;
  };
}

export interface FormSubmitEvent extends TrackedEvent {
  type: "formsubmit";
  data: {
    formId?: string;
    formAction?: string;
    formMethod?: string;
  };
}

export interface ScrollEvent extends TrackedEvent {
  type: "scroll";
  data: {
    depth: number;
    maxDepth: number;
  };
}

export interface TrackerErrorEvent extends TrackedEvent {
  type: "error";
  data: {
    message: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
  };
}
