// function loadTemplate(targetId, templatePath) {
//     fetch(templatePath)
//         .then(res => res.text())
//         .then(html => {
//             document.getElementById(targetId).innerHTML = html;
//         })
//         .catch(err => console.error(`Error loading ${templatePath}:`, err));
// }

function loadTemplate(targetId, templatePath) {
    fetch(templatePath)
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById(targetId);
            container.innerHTML = html;

            // ✅ Wait for DOM update, then check for #waitlist-form
            setTimeout(() => {
                const form = document.getElementById("waitlist-form");
                if (form && typeof initWaitlistForm === "function") {
                    initWaitlistForm();
                }
            }, 50);
        })
        .catch(err => console.error(`Error loading ${templatePath}:`, err));
}


// Example usage:
document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById('basic-form-template-placeholder')) {
        loadTemplate('basic-form-template-placeholder', 'templates/basic-form-template.html');
    }

    if (document.getElementById('form-placeholder')) {
        loadTemplate('form-placeholder', 'templates/form-template.html');
    }

    if (document.getElementById('signup-placeholder')) {
        loadTemplate('signup-placeholder', 'templates/signup-template.html');
    }


    if (document.getElementById('signup-form-placeholder')) {
        loadTemplate('signup-form-placeholder', 'templates/signup-form-template.html');
    }

    if (document.getElementById('waitlist-form-placeholder')) {
        loadTemplate('waitlist-form-placeholder', 'templates/waitlist-form.html');
    }


    if (document.getElementById('homepage-form-placeholder')) {
        loadTemplate('homepage-form-placeholder', 'templates/homepage-form.html');
    }

});
