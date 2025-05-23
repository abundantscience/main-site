window.addEventListener("DOMContentLoaded", function () {
    const SUPABASE_URL = "https://jicytgdlbevccejowlnf.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppY3l0Z2RsYmV2Y2Nlam93bG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDQzNTYsImV4cCI6MjA2MDkyMDM1Nn0.DRfZefUPOLjhdxYudhvQKGePr6ex-Xf3JBkedbF7_OY";
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    window.initWaitlistForm = function () {
        const form = document.getElementById("waitlist-form");
        if (!form) return;

        const msg = document.getElementById("message") || createMessageBox(form);

        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const dataToSubmit = {
                source_page: window.location.pathname,
            };

            const SUPPORTED_FIELDS = [
                "email", "full_name", "name", "phone", "province", "country",
                "business_name", "business_type", "quiz-dr-rb", "quiz-lab-rb", "quiz-hc-sa",
                "campaign", "discreet", "consent", "source_page", "quiz-source"
            ];

            for (let [key, value] of formData.entries()) {
                if (SUPPORTED_FIELDS.includes(key)) {
                    dataToSubmit[key] = ["discreet", "consent"].includes(key) ? true : value;
                }
            }

            const campaign = [];
            document.querySelectorAll(".campaign-checkbox:checked").forEach(cb => {
                campaign.push(cb.value);
                if (cb.dataset.extra) campaign.push(cb.dataset.extra);
            });
            if (campaign.length) dataToSubmit.campaign = campaign;

            if (!dataToSubmit.email || !dataToSubmit.email.includes("@")) {
                msg.textContent = "Please enter a valid email address.";
                msg.className = "error";
                return;
            }

            try {
                const { error } = await client.from("waitlist").insert([dataToSubmit]);
                msg.textContent = error ? "❌ Error: " + error.message : "✅ You're on the list!";
                msg.className = error ? "error" : "success";
                if (!error) form.reset();
            } catch (err) {
                console.error("Unexpected error:", err);
                msg.textContent = "❌ Something went wrong.";
                msg.className = "error";
            }
        });
    };

    function createMessageBox(form) {
        const msg = document.createElement("div");
        msg.id = "message";
        msg.style.marginTop = "1rem";
        form.appendChild(msg);
        return msg;
    }
});
