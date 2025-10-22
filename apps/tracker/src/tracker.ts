import type {
  ClickEvent,
  FormSubmitEvent,
  PageViewEvent,
  ScrollEvent,
  TrackedEvent,
  TrackerConfig,
  TrackerErrorEvent,
} from "./types";

class EventTracker {
  private config: TrackerConfig;
  private sessionId: string;
  private eventQueue: TrackedEvent[] = [];
  private batchTimer: number | null = null;
  private maxScrollDepth: number = 0;
  private isInitialized: boolean = false;

  constructor(config: TrackerConfig = {}) {
    this.config = {
      endpoint: config.endpoint || "/api/track",
      debug: config.debug || false,
      trackClicks: config.trackClicks !== false,
      trackFormSubmits: config.trackFormSubmits !== false,
      trackPageViews: config.trackPageViews !== false,
      trackScrollDepth: config.trackScrollDepth !== false,
      trackMouseMovement: config.trackMouseMovement || false,
      trackErrors: config.trackErrors !== false,
      batchSize: config.batchSize || 10,
      batchInterval: config.batchInterval || 5000,
      excludeSelectors: config.excludeSelectors || [],
      customData: config.customData || {},
    };

    this.sessionId = this.generateSessionId();
    this.log("EventTracker initialized", this.config);
  }

  public init(): void {
    if (this.isInitialized) {
      this.log("EventTracker already initialized");
      return;
    }

    this.isInitialized = true;

    // Track page view on init
    if (this.config.trackPageViews) {
      this.trackPageView();
    }

    // Set up event listeners
    if (this.config.trackClicks) {
      document.addEventListener("click", this.handleClick.bind(this), true);
    }

    if (this.config.trackFormSubmits) {
      document.addEventListener(
        "submit",
        this.handleFormSubmit.bind(this),
        true
      );
    }

    if (this.config.trackScrollDepth) {
      window.addEventListener("scroll", this.handleScroll.bind(this), {
        passive: true,
      });
    }

    if (this.config.trackErrors) {
      window.addEventListener("error", this.handleError.bind(this));
      window.addEventListener(
        "unhandledrejection",
        this.handleUnhandledRejection.bind(this)
      );
    }

    // Track page visibility changes
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );

    // Flush events before page unload
    window.addEventListener("beforeunload", this.flush.bind(this));

    this.log("Event listeners attached");
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if element should be excluded
    if (this.shouldExclude(target)) {
      return;
    }

    const clickEvent: ClickEvent = {
      type: "click",
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      sessionId: this.sessionId,
      data: {
        x: event.clientX,
        y: event.clientY,
        elementTag: target.tagName.toLowerCase(),
        elementId: target.id || undefined,
        elementClass: target.className || undefined,
        elementText: this.getElementText(target),
        elementHref: (target as HTMLAnchorElement).href || undefined,
      },
    };

    this.trackEvent(clickEvent);
  }

  private handleFormSubmit(event: Event): void {
    const form = event.target as HTMLFormElement;

    if (this.shouldExclude(form)) {
      return;
    }

    const submitEvent: FormSubmitEvent = {
      type: "formsubmit",
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      sessionId: this.sessionId,
      data: {
        formId: form.id || undefined,
        formAction: form.action || undefined,
        formMethod: form.method || undefined,
      },
    };

    this.trackEvent(submitEvent);
  }

  private handleScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

    if (scrollDepth > this.maxScrollDepth) {
      this.maxScrollDepth = scrollDepth;

      const scrollEvent: ScrollEvent = {
        type: "scroll",
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        sessionId: this.sessionId,
        data: {
          depth: scrollDepth,
          maxDepth: this.maxScrollDepth,
        },
      };

      this.trackEvent(scrollEvent);
    }
  }

  private handleError(event: globalThis.ErrorEvent): void {
    const errorEvent: TrackerErrorEvent = {
      type: "error",
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      sessionId: this.sessionId,
      data: {
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    };

    this.trackEvent(errorEvent);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const errorEvent: TrackerErrorEvent = {
      type: "error",
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      sessionId: this.sessionId,
      data: {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      },
    };

    this.trackEvent(errorEvent);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.flush();
    }
  }

  private trackPageView(): void {
    const pageViewEvent: PageViewEvent = {
      type: "pageview",
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      sessionId: this.sessionId,
      data: {
        title: document.title,
        referrer: document.referrer,
        path: window.location.pathname,
      },
    };

    this.trackEvent(pageViewEvent);
  }

  private trackEvent(event: TrackedEvent): void {
    // Add custom data if available
    if (
      this.config.customData &&
      Object.keys(this.config.customData).length > 0
    ) {
      event.data = {
        ...event.data,
        ...this.config.customData,
      };
    }

    this.eventQueue.push(event);
    this.log("Event tracked", event);

    // Check if we should flush
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    } else {
      this.scheduleBatchSend();
    }
  }

  private scheduleBatchSend(): void {
    if (this.batchTimer !== null) {
      return;
    }

    this.batchTimer = window.setTimeout(() => {
      this.flush();
      this.batchTimer = null;
    }, this.config.batchInterval || 5000);
  }

  public flush(): void {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.sendEvents(events);
  }

  private sendEvents(events: TrackedEvent[]): void {
    const endpoint = this.config.endpoint || "/api/track";

    this.log("Sending events", events);

    // Use sendBeacon if available for better reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], {
        type: "application/json",
      });
      navigator.sendBeacon(endpoint, blob);
    } else {
      // Fallback to fetch
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events }),
        keepalive: true,
      }).catch((error) => {
        this.log("Error sending events", error);
      });
    }
  }

  private shouldExclude(element: HTMLElement): boolean {
    if (
      !this.config.excludeSelectors ||
      this.config.excludeSelectors.length === 0
    ) {
      return false;
    }

    return this.config.excludeSelectors.some((selector) => {
      try {
        return element.matches(selector) || element.closest(selector) !== null;
      } catch {
        return false;
      }
    });
  }

  private getElementText(element: HTMLElement): string | undefined {
    const text = element.textContent?.trim().slice(0, 100);
    return text || undefined;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log("[AppTalesTracker]", ...args);
    }
  }

  public setCustomData(data: Record<string, any>): void {
    this.config.customData = {
      ...this.config.customData,
      ...data,
    };
  }

  public destroy(): void {
    this.flush();

    document.removeEventListener("click", this.handleClick.bind(this), true);
    document.removeEventListener(
      "submit",
      this.handleFormSubmit.bind(this),
      true
    );
    window.removeEventListener("scroll", this.handleScroll.bind(this));
    window.removeEventListener("error", this.handleError.bind(this));
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection.bind(this)
    );
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
    window.removeEventListener("beforeunload", this.flush.bind(this));

    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
    }

    this.isInitialized = false;
    this.log("EventTracker destroyed");
  }
}

export default EventTracker;
