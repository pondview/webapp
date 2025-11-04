function configureForm(formId, endpoint) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`Form '${formId}' not found`);
      return;
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const data = Object.fromEntries(new FormData(form).entries());
  
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
          alert("Your message has been sent successfully!");
          form.reset();
        } else {
          alert("There was a problem submitting your message. Please try again.");
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        alert("An error occurred while sending your message.");
      }
    });
  }
  