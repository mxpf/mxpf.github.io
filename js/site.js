(() => {
  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  };

  onReady(() => {
    initExpertiseVideoRollovers();
  });

  function initExpertiseVideoRollovers() {
    const root = document.querySelector(".js-expertise-videos");

    if (!root) {
      return;
    }

    const smallScreen = window.matchMedia("(max-width: 1000px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controls = Array.from(
      root.querySelectorAll(".js-services-control[data-video-key]")
    );
    const panels = Array.from(root.querySelectorAll(".js-services-content"));
    const videos = new Map(
      Array.from(root.querySelectorAll(".js-services-video[data-video-key]")).map(
        (video) => [video.dataset.videoKey, video]
      )
    );

    if (!controls.length || !videos.size) {
      return;
    }

    let activeVideo = null;

    const stopVideo = (video) => {
      video.pause();
      video.classList.remove("is-active");

      try {
        video.currentTime = 0;
      } catch {
        // Some browsers can reject seek attempts before media metadata is ready.
      }
    };

    const setActivePanel = (activeControl) => {
      const activeId = activeControl.dataset.control;

      controls.forEach((control) => {
        control.classList.toggle("active", control === activeControl);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.item === activeId);
      });
    };

    const deactivateVideo = () => {
      root.classList.remove("has-video-active");

      if (activeVideo) {
        stopVideo(activeVideo);
        activeVideo = null;
      }
    };

    const activateVideo = (control) => {
      if (smallScreen.matches) {
        return;
      }

      setActivePanel(control);

      if (reducedMotion.matches) {
        return;
      }

      const video = videos.get(control.dataset.videoKey);

      if (!video) {
        return;
      }

      if (activeVideo && activeVideo !== video) {
        stopVideo(activeVideo);
      }

      activeVideo = video;
      root.classList.add("has-video-active");
      video.classList.add("is-active");

      if (video.paused) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    controls.forEach((control) => {
      control.addEventListener("pointerenter", () => activateVideo(control));
      control.addEventListener("focusin", () => activateVideo(control));
    });

    root.addEventListener("pointerleave", deactivateVideo);
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) {
        deactivateVideo();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        deactivateVideo();
      }
    });

    const section = root.closest(".section");

    if (section) {
      const observer = new MutationObserver(() => {
        if (!section.classList.contains("active")) {
          deactivateVideo();
        }
      });

      observer.observe(section, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }
})();
