const PAGES = {
  about: "index.html",
  reservation: "reservation.html",
  contact: "contact.html",
  thanks: "thanks.html",
  oops: "oops.html",
};

function showUserMessage(message, duration = 4000) {
  // Remove any existing popup first
  const existing = document.querySelector(".user-message-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.className = "user-message-popup";
  popup.textContent = message;

  document.body.appendChild(popup);

  // Animate in
  requestAnimationFrame(() => popup.classList.add("visible"));

  // Auto-remove after timeout
  setTimeout(() => {
    popup.classList.remove("visible");
    popup.addEventListener("transitionend", () => popup.remove(), { once: true });
  }, duration);
}

function gotoPage(page) {
  const pageFile = PAGES[page] || "oops.html";
  window.location.assign(pageFile);
}

function configureForm(formId, endpoint) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error(`Form '${formId}' not found`);
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?1?[-.\s(]*\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}$/;
    const data = Object.fromEntries(new FormData(form).entries());

    // Validate inputs
    let validationFailure = false;
    let firstInvalid = null;

    // Reset any previous error styles
    for (const el of form.elements) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.classList.remove("input-error");
      }
    }

    for (const el of form.elements) {
      if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") continue;

      const value = el.value.trim();

      if (el.classList.contains("email")) {
        if (!emailRegex.test(value)) {
          showUserMessage("Email address does not conform to standards.");
          el.classList.add("input-error");
          if (!validationFailure) firstInvalid = el;
          validationFailure = true;
        }
      }

      if (el.classList.contains("phone") && value.length > 0) {
        if (!phoneRegex.test(value)) {
          showUserMessage("Phone number does not conform to standards.");
          el.classList.add("input-error");
          if (!validationFailure) firstInvalid = el;
          validationFailure = true;
        }
      }
    }

    if (validationFailure) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        gotoPage("thanks");
        form.reset();
      } else {
        showUserMessage("There was a problem submitting your message. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);

      // Attempt to log the error server-side (optional)
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "automated error collection",
            email: "no-reply@pondview.biz",
            message: `An error occurred during contact form submission: ${err}`,
          }),
        });
      } catch {
        /* ignore */
      }

      gotoPage("oops");
    }
  });
}
